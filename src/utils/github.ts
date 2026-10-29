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
  '.dat', '.db', '.sqlite',
]);

// File names to skip (sensitive, generated, config with potential secrets)
const SKIP_FILENAMES = new Set([
  '.env', '.env.local', '.env.production', '.env.development',
  'id_rsa', 'id_ed25519', '.pem', '.key',
  'credentials', 'secrets',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.DS_Store', 'Thumbs.db',
  'npm-debug.log', 'yarn-debug.log', 'yarn-error.log',
]);

// Directories to skip
const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', 'venv',
  'dist', 'build', '.next', '.nuxt', 'target',
  'vendor', 'coverage', '.cache', '.idea', '.vscode',
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

  if (trimmed.length === 0) {
    return { valid: false, error: 'URL is required.' };
  }

  // Must start with https://
  if (!trimmed.startsWith('https://')) {
    return { valid: false, error: 'Only HTTPS URLs are accepted. Please use https://github.com/owner/repo.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please check the URL.' };
  }

  // Must be github.com host exactly (rejects github.com.example.org etc.)
  if (parsed.hostname !== 'github.com') {
    return { valid: false, error: `Only github.com repositories are supported. The host "${parsed.hostname}" is not accepted.` };
  }

  // Must use standard HTTPS port
  if (parsed.port && parsed.port !== '443') {
    return { valid: false, error: 'Non-standard port detected. Only standard HTTPS GitHub URLs are accepted.' };
  }

  // Reject URLs with credentials
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs with embedded credentials are not accepted.' };
  }

  // Parse path: /owner/repo or /owner/repo/ or /owner/repo.git
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  if (pathParts.length < 2) {
    return { valid: false, error: 'URL must include both owner and repository name (e.g., https://github.com/owner/repo).' };
  }

  if (pathParts.length > 2) {
    // Allow /owner/repo.git or /owner/repo/ but not deeper paths like /owner/repo/tree/main
    const lastPart = pathParts[pathParts.length - 1];
    if (pathParts.length === 3 && (lastPart === '' || lastPart.endsWith('.git'))) {
      // ok
    } else if (pathParts.length === 2) {
      // ok
    } else {
      return { valid: false, error: 'Please provide a repository URL (github.com/owner/repo), not a sub-page like /tree/ or /blob/.' };
    }
  }

  const owner = pathParts[0];
  let repo = pathParts[1];

  // Remove .git suffix if present
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  // Validate owner and repo format (GitHub rules)
  const ownerRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  const repoRegex = /^[a-zA-Z0-9._-]+$/;

  if (!ownerRegex.test(owner) || owner.length > 39 || owner.length < 1) {
    return { valid: false, error: `Invalid repository owner "${owner}". Owner names must be 1-39 alphanumeric characters, hyphens allowed.` };
  }

  if (!repoRegex.test(repo) || repo.length > 100 || repo.length < 1) {
    return { valid: false, error: `Invalid repository name "${repo}". Repository names must contain only letters, numbers, dots, hyphens, and underscores.` };
  }

  return { valid: true, owner, repo };
}

/**
 * Fetch with timeout and redirect safety
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
      redirect: 'error', // Don't follow redirects to prevent SSRF
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
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub API rate limit reached. Please wait a few minutes and try again. Unauthenticated requests are limited to 60 per hour.');
    }
    if (response.status === 401) {
      throw new Error('GitHub API authentication error. This should not occur for public repositories.');
    }
    throw new Error(`GitHub API returned an unexpected response (${response.status}). Please try again later.`);
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

  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  apiCallCount.count++;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      // Rate limited - stop further requests
      apiCallCount.count = MAX_API_CALLS;
    }
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

    // Check Content-Length header if available to avoid loading oversized files
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      return null;
    }

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
  const nameParts = file.name.split('.');
  if (nameParts.length > 1) {
    const ext = '.' + nameParts.pop()?.toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) return true;
    // Also check compound extensions like .min.js
    if (nameParts.length > 0) {
      const compoundExt = '.' + nameParts.pop()?.toLowerCase() + ext;
      if (SKIP_EXTENSIONS.has(compoundExt)) return true;
    }
  }

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
): Promise<{ inspectable: GitHubFile[]; skipped: number; total: number; inspectionComplete: boolean }> {
  const inspectable: GitHubFile[] = [];
  let skipped = 0;
  let total = 0;
  let inspectionComplete = true;

  async function walk(path: string, depth: number) {
    if (depth > MAX_DIR_DEPTH || inspectable.length >= MAX_FILES_TO_INSPECT) {
      if (inspectable.length >= MAX_FILES_TO_INSPECT) {
        inspectionComplete = false;
      }
      return;
    }
    if (apiCallCount.count >= MAX_API_CALLS) {
      inspectionComplete = false;
      return;
    }

    const contents = await getDirContents(owner, repo, path, apiCallCount);

    // If we hit the API limit during directory listing, mark incomplete
    if (apiCallCount.count >= MAX_API_CALLS && contents.length === 0 && path !== '') {
      inspectionComplete = false;
    }

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
        inspectionComplete = false;
      }
    }
  }

  await walk('', 0);

  return { inspectable, skipped, total, inspectionComplete };
}
