// SkillProof GitHub API Client
// Security: Only accepts validated HTTPS GitHub repository URLs.
// All API URLs are constructed from validated owner/repo names.
// No arbitrary user-provided URLs are fetched.

import type { GitHubFile, GitHubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout
const MAX_FILE_SIZE = 100000; // 100KB max per file content
const MAX_FILES_TO_INSPECT = 50; // Bounded inspection
const MAX_DIR_DEPTH = 3; // Don't recurse too deep
const MAX_API_CALLS = 30; // Hard cap on API calls

// File extensions to skip (binaries, generated, etc.)
const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.obj', '.o',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp3', '.mp4', '.avi', '.mov', '.wav',
  '.lock', '.min.js', '.min.css', '.map',
  '.pyc', '.pyo', '.class', '.jar', '.war',
]);

// File names to skip (sensitive, generated, config with potential secrets)
const SKIP_FILENAMES = new Set([
  '.env', '.env.local', '.env.production',
  'id_rsa', 'id_ed25519', '.pem', '.key',
  'credentials', 'secrets',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.DS_Store', 'Thumbs.db',
]);

// Directories to skip
const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', 'venv',
  'dist', 'build', '.next', '.nuxt', 'target',
  'vendor', 'coverage', '.cache',
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  owner?: string;
  repo?: string;
}

/**
 * Validate a GitHub repository URL.
 * Only accepts: https://github.com/{owner}/{repo} with optional trailing slash or .git
 */
export function validateGitHubUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required.' };
  }

  const trimmed = url.trim();

  // Must start with https://
  if (!trimmed.startsWith('https://')) {
    return { valid: false, error: 'Only HTTPS URLs are accepted.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  // Must be github.com host exactly
  if (parsed.hostname !== 'github.com') {
    return { valid: false, error: 'Only github.com repositories are supported.' };
  }

  // Parse path: /owner/repo or /owner/repo/ or /owner/repo.git
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  if (pathParts.length < 2) {
    return { valid: false, error: 'URL must include both owner and repository name (e.g., github.com/owner/repo).' };
  }

  if (pathParts.length > 2) {
    // Allow /owner/repo.git or /owner/repo/ but not deeper paths like /owner/repo/tree/main
    const lastPart = pathParts[pathParts.length - 1];
    if (pathParts.length === 3 && (lastPart === '' || lastPart.endsWith('.git'))) {
      // ok
    } else if (pathParts.length === 2) {
      // ok
    } else {
      return { valid: false, error: 'Please provide a repository URL (github.com/owner/repo), not a sub-page.' };
    }
  }

  const owner = pathParts[0];
  let repo = pathParts[1];

  // Remove .git suffix if present
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  // Validate owner and repo format (GitHub rules: alphanumeric, hyphens, underscores, dots; 1-39 chars for owner)
  const ownerRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  const repoRegex = /^[a-zA-Z0-9._-]+$/;

  if (!ownerRegex.test(owner) || owner.length > 39) {
    return { valid: false, error: 'Invalid repository owner name.' };
  }

  if (!repoRegex.test(repo) || repo.length > 100) {
    return { valid: false, error: 'Invalid repository name.' };
  }

  return { valid: true, owner, repo };
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get repository info
 */
export async function getRepoInfo(owner: string, repo: string): Promise<GitHubRepo> {
  // Construct URL from validated owner/repo - never from raw user input
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Please check the URL and ensure the repository is public.');
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get directory contents
 */
export async function getDirContents(
  owner: string,
  repo: string,
  path: string = '',
  apiCallCount: { count: number }
): Promise<GitHubFile[]> {
  if (apiCallCount.count >= MAX_API_CALLS) {
    return [];
  }

  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;
  apiCallCount.count++;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data as GitHubFile[];
}

/**
 * Get file content (text only, bounded size)
 */
export async function getFileContent(
  downloadUrl: string,
  apiCallCount: { count: number }
): Promise<string | null> {
  if (apiCallCount.count >= MAX_API_CALLS) {
    return null;
  }

  // Only fetch from raw.githubusercontent.com (constructed from validated data)
  if (!downloadUrl.startsWith('https://raw.githubusercontent.com/')) {
    return null;
  }

  apiCallCount.count++;

  try {
    const response = await fetchWithTimeout(downloadUrl);
    if (!response.ok) return null;

    const text = await response.text();

    // Bound content size
    if (text.length > MAX_FILE_SIZE) {
      return text.slice(0, MAX_FILE_SIZE);
    }

    return text;
  } catch {
    return null;
  }
}

/**
 * Check if a file should be skipped
 */
export function shouldSkipFile(file: GitHubFile): boolean {
  // Skip directories
  if (file.type === 'dir') return true;

  // Skip by filename
  if (SKIP_FILENAMES.has(file.name.toLowerCase())) return true;

  // Skip by extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return true;

  // Skip oversized files
  if (file.size > MAX_FILE_SIZE) return true;

  // Skip files in skip directories
  const pathParts = file.path.split('/');
  for (const part of pathParts) {
    if (SKIP_DIRS.has(part.toLowerCase())) return true;
  }

  return false;
}

/**
 * Recursively collect files to inspect (bounded)
 */
export async function collectFilesToInspect(
  owner: string,
  repo: string,
  apiCallCount: { count: number }
): Promise<{ inspectable: GitHubFile[]; skipped: number; total: number }> {
  const inspectable: GitHubFile[] = [];
  let skipped = 0;
  let total = 0;

  async function walk(path: string, depth: number) {
    if (depth > MAX_DIR_DEPTH || inspectable.length >= MAX_FILES_TO_INSPECT) return;
    if (apiCallCount.count >= MAX_API_CALLS) return;

    const contents = await getDirContents(owner, repo, path, apiCallCount);

    for (const item of contents) {
      total++;

      if (item.type === 'dir') {
        if (!SKIP_DIRS.has(item.name.toLowerCase()) && depth < MAX_DIR_DEPTH) {
          await walk(item.path, depth + 1);
        } else {
          skipped++;
        }
        continue;
      }

      if (shouldSkipFile(item)) {
        skipped++;
        continue;
      }

      if (inspectable.length < MAX_FILES_TO_INSPECT) {
        inspectable.push(item);
      } else {
        skipped++;
      }
    }
  }

  await walk('', 0);

  return { inspectable, skipped, total };
}
