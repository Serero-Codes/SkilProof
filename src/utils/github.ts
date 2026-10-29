// SkillProof GitHub API client.
// Public repositories only. The app never executes repository code.

import type { GitHubFile, GitHubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const RAW_GITHUB_HOST = 'raw.githubusercontent.com';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_FILE_SIZE = 100_000;
const MAX_FILES_TO_INSPECT = 50;
const MAX_DIR_DEPTH = 3;
const MAX_API_CALLS = 30;
// Reserve most of the request budget for reading file contents.
const MAX_DIRECTORY_API_CALLS = 12;

const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', '.avif',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.so', '.dylib',
  '.bin', '.obj', '.o', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.avi',
  '.mov', '.wav', '.lock', '.map', '.pyc', '.pyo', '.class', '.jar', '.war',
  '.dat', '.db', '.sqlite', '.ico', '.psd', '.ai', '.sketch',
]);

const SKIP_FILENAMES = new Set([
  '.env', '.env.local', '.env.production', '.env.development', '.env.test',
  'id_rsa', 'id_ed25519', 'credentials', 'secrets', 'package-lock.json',
  'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'composer.lock', 'poetry.lock',
  'pipfile.lock', 'gemfile.lock', 'cargo.lock', 'go.sum', '.ds_store', 'thumbs.db',
  'npm-debug.log', 'yarn-debug.log', 'yarn-error.log',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', 'venv', 'dist', 'build',
  '.next', '.nuxt', 'target', 'vendor', 'coverage', '.cache', '.idea', '.vscode',
  'out', 'tmp', 'temp',
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  owner?: string;
  repo?: string;
}

export class GitHubRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'GitHubRequestError';
  }
}

function throwForResponse(response: Response): never {
  if (response.status === 404) {
    throw new GitHubRequestError('Repository or requested content was not found. Check that the repository is public.', 404);
  }
  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0' || response.status === 429) {
      throw new GitHubRequestError('GitHub API rate limit reached. Wait a while and try again. Public unauthenticated requests have a limited hourly quota.', response.status);
    }
    throw new GitHubRequestError('GitHub denied this request. Please check the repository and try again.', response.status);
  }
  if (response.status === 401) {
    throw new GitHubRequestError('GitHub rejected the request. SkillProof does not require a token for public repositories; try again later.', 401);
  }
  throw new GitHubRequestError(`GitHub returned HTTP ${response.status}. Please try again later.`, response.status);
}

/** Accept only a repository root URL, not arbitrary URLs or sub-pages. */
export function validateGitHubUrl(input: string): ValidationResult {
  if (typeof input !== 'string' || !input.trim()) {
    return { valid: false, error: 'Please enter a GitHub repository URL.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { valid: false, error: 'That URL is not valid. Use https://github.com/owner/repository.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS GitHub URLs are accepted.' };
  }
  if (parsed.hostname.toLowerCase() !== 'github.com' || parsed.port) {
    return { valid: false, error: 'Only standard https://github.com repository URLs are supported.' };
  }
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs containing embedded credentials are not accepted.' };
  }
  if (parsed.search || parsed.hash) {
    return { valid: false, error: 'Please remove query parameters or fragments and enter the repository root URL.' };
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length !== 2) {
    return { valid: false, error: 'Enter the repository root only, for example https://github.com/owner/repository.' };
  }

  const owner = parts[0];
  let repo = parts[1];
  if (repo.endsWith('.git')) repo = repo.slice(0, -4);

  const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
  const repoRegex = /^[A-Za-z0-9._-]+$/;
  if (!ownerRegex.test(owner) || owner.length > 39) {
    return { valid: false, error: 'The GitHub owner name is not valid.' };
  }
  if (!repo || repo.length > 100 || !repoRegex.test(repo) || repo === '.' || repo === '..') {
    return { valid: false, error: 'The GitHub repository name is not valid.' };
  }

  return { valid: true, owner, repo };
}

async function fetchWithTimeout(
  url: string,
  options: { signal?: AbortSignal; timeoutMs?: number; accept?: string } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: options.accept ?? 'application/vnd.github+json' },
      // The URLs used here are fixed GitHub API/raw hosts. Following redirects is
      // unnecessary for the API and disabled for raw content to keep scope narrow.
      redirect: 'error',
    });
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException('Analysis cancelled.', 'AbortError');
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The request timed out. Check your connection and try again.');
    }
    if (error instanceof TypeError) {
      throw new Error('Could not reach GitHub. Check your internet connection or try again later.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

function assertBudget(apiCallCount: { count: number }): void {
  if (apiCallCount.count >= MAX_API_CALLS) {
    throw new GitHubRequestError(`The inspection reached its ${MAX_API_CALLS}-request safety limit.`, 429);
  }
}

export async function getRepoInfo(
  owner: string,
  repo: string,
  apiCallCount: { count: number } = { count: 0 },
  signal?: AbortSignal,
): Promise<GitHubRepo> {
  assertBudget(apiCallCount);
  apiCallCount.count += 1;
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const response = await fetchWithTimeout(url, { signal });
  if (!response.ok) throwForResponse(response);

  const data = (await response.json()) as GitHubRepo;
  if (!data || typeof data.full_name !== 'string' || typeof data.default_branch !== 'string') {
    throw new GitHubRequestError('GitHub returned an unexpected repository response.');
  }
  return data;
}

export async function getDirContents(
  owner: string,
  repo: string,
  path = '',
  apiCallCount: { count: number },
  signal?: AbortSignal,
): Promise<GitHubFile[]> {
  assertBudget(apiCallCount);
  apiCallCount.count += 1;
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join('/');
  const suffix = encodedPath ? `/${encodedPath}` : '';
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${suffix}`;
  const response = await fetchWithTimeout(url, { signal });
  if (!response.ok) throwForResponse(response);

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new GitHubRequestError('GitHub returned an unexpected directory listing.');
  }
  return data as GitHubFile[];
}

export async function getFileContent(
  downloadUrl: string,
  apiCallCount: { count: number },
  signal?: AbortSignal,
): Promise<string | null> {
  assertBudget(apiCallCount);

  let parsed: URL;
  try {
    parsed = new URL(downloadUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== RAW_GITHUB_HOST || parsed.username || parsed.password) {
    return null;
  }

  apiCallCount.count += 1;
  const response = await fetchWithTimeout(downloadUrl, { signal, accept: 'text/plain' });
  if (!response.ok) return null;

  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE) return null;

  // Read then reject oversized content rather than silently truncating it.
  const content = await response.text();
  if (content.length > MAX_FILE_SIZE) return null;
  // Avoid trying to analyze binary-like data accidentally served as text.
  if (content.includes('\u0000')) return null;
  return content;
}

export function shouldSkipFile(file: GitHubFile): boolean {
  if (file.type !== 'file') return true;
  const name = file.name.toLowerCase();
  const pathParts = file.path.split('/').map(part => part.toLowerCase());

  if (SKIP_FILENAMES.has(name)) return true;
  if (pathParts.some(part => SKIP_DIRS.has(part))) return true;
  if (file.size > MAX_FILE_SIZE || file.size < 0) return true;

  // Skip files whose names indicate secrets/keys, even if their extension is odd.
  if (/(^|[._-])(secret|credential|private[-_]?key|id_rsa|id_ed25519)([._-]|$)/i.test(name)) return true;
  if (/\.(pem|key|p12|pfx|keystore)$/i.test(name)) return true;

  for (const extension of SKIP_EXTENSIONS) {
    if (name.endsWith(extension)) return true;
  }
  return false;
}

export async function collectFilesToInspect(
  owner: string,
  repo: string,
  apiCallCount: { count: number },
  signal?: AbortSignal,
): Promise<{ inspectable: GitHubFile[]; skipped: number; total: number; inspectionComplete: boolean }> {
  const inspectable: GitHubFile[] = [];
  const visitedDirectories = new Set<string>();
  let skipped = 0;
  let total = 0;
  let inspectionComplete = true;

  async function walk(path: string, depth: number): Promise<void> {
    if (signal?.aborted) throw new DOMException('Analysis cancelled.', 'AbortError');
    if (depth > MAX_DIR_DEPTH) {
      inspectionComplete = false;
      return;
    }
    if (inspectable.length >= MAX_FILES_TO_INSPECT) {
      inspectionComplete = false;
      return;
    }
    if (apiCallCount.count >= Math.min(MAX_DIRECTORY_API_CALLS, MAX_API_CALLS)) {
      inspectionComplete = false;
      return;
    }

    const directoryKey = path.toLowerCase();
    if (visitedDirectories.has(directoryKey)) return;
    visitedDirectories.add(directoryKey);

    let entries: GitHubFile[];
    try {
      entries = await getDirContents(owner, repo, path, apiCallCount, signal);
    } catch (error) {
      // A root listing failure means we cannot truthfully call the repository empty.
      if (path === '' || (error instanceof DOMException && error.name === 'AbortError')) throw error;
      inspectionComplete = false;
      return;
    }

    for (const entry of entries) {
      if (signal?.aborted) throw new DOMException('Analysis cancelled.', 'AbortError');
      if (entry.type === 'dir') {
        if (SKIP_DIRS.has(entry.name.toLowerCase())) {
          skipped += 1;
          continue;
        }
        if (depth >= MAX_DIR_DEPTH) {
          inspectionComplete = false;
          skipped += 1;
          continue;
        }
        await walk(entry.path, depth + 1);
        if (inspectable.length >= MAX_FILES_TO_INSPECT || apiCallCount.count >= Math.min(MAX_DIRECTORY_API_CALLS, MAX_API_CALLS)) {
          inspectionComplete = false;
          break;
        }
        continue;
      }

      total += 1;
      if (shouldSkipFile(entry)) {
        skipped += 1;
        continue;
      }
      if (inspectable.length < MAX_FILES_TO_INSPECT) inspectable.push(entry);
      else {
        skipped += 1;
        inspectionComplete = false;
      }
    }
  }

  await walk('', 0);
  if (apiCallCount.count >= MAX_API_CALLS) inspectionComplete = false;
  return { inspectable, skipped, total, inspectionComplete };
}
