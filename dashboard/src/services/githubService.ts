import axios from 'axios';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin;

const STORAGE_KEYS = {
  GITHUB_TOKEN: 'vg_github_token',
  GITHUB_USER: 'vg_github_user',
  GITHUB_CODE_VERIFIER: 'vg_github_code_verifier',
  GITHUB_OAUTH_STATE: 'vg_github_oauth_state',
};

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  email: string | null;
  public_repos: number;
  followers: number;
}

function base64UrlEncode(array: ArrayBuffer): string {
  const bytes = String.fromCharCode(...new Uint8Array(array));
  return btoa(bytes).replace(/\+/g, '-').replace(/=/g, '');
}

async function sha256(verifier: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  return crypto.subtle.digest('SHA-256', data);
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await sha256(verifier);
  return base64UrlEncode(hash);
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredGitHubToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function getGitHubAuthUrl(): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  sessionStorage.setItem(STORAGE_KEYS.GITHUB_CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.GITHUB_OAUTH_STATE, state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'repo user:email',
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<string | null> {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        code,
        code_verifier: codeVerifier,
        redirect_uri: GITHUB_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const token = response.data?.access_token;
    if (token) {
      storeGitHubToken(token);
    }
    return token || null;
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    return null;
  }
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser | null> {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as GitHubUser;
  } catch (error) {
    console.error('Failed to fetch GitHub user:', error);
    return null;
  }
}

export async function handleGitHubCallback(): Promise<{ token: string; user: GitHubUser } | null> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const returnedState = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    console.error('GitHub OAuth error:', error);
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_CODE_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_OAUTH_STATE);
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }

  if (!code) return null;

  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.GITHUB_CODE_VERIFIER);
  const expectedState = sessionStorage.getItem(STORAGE_KEYS.GITHUB_OAUTH_STATE);

  if (!codeVerifier) {
    console.error('Code verifier not found in session');
    return null;
  }

  if (expectedState && returnedState !== expectedState) {
    console.error('State mismatch - possible CSRF attack');
    return null;
  }

  const token = await exchangeCodeForToken(code, codeVerifier);
  if (!token) return null;

  sessionStorage.removeItem(STORAGE_KEYS.GITHUB_CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.GITHUB_OAUTH_STATE);

  const user = await fetchGitHubUser(token);
  if (user) {
    storeGitHubUser(user);
  }

  window.history.replaceState({}, document.title, window.location.pathname);

  return { token, user: user! };
}

export function getStoredGitHubToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
}

export function storeGitHubToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
}

export function getStoredGitHubUser(): GitHubUser | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GITHUB_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function storeGitHubUser(user: GitHubUser): void {
  localStorage.setItem(STORAGE_KEYS.GITHUB_USER, JSON.stringify(user));
}

export function clearGitHubAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
  sessionStorage.removeItem(STORAGE_KEYS.GITHUB_CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.GITHUB_OAUTH_STATE);
}

export function isGitHubConnected(): boolean {
  return !!getStoredGitHubToken();
}

export async function fetchCommitsFromGitHub(
  repoUrl: string,
  options?: { signal?: AbortSignal }
): Promise<GitHubCommit[]> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return [];

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    let allCommits: GitHubCommit[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${cleanRepo}/commits`,
        {
          params: { per_page: perPage, page },
          headers: getAuthHeaders(),
          signal: options?.signal,
        }
      );

      if (!Array.isArray(response.data) || response.data.length === 0) {
        break;
      }

      allCommits = allCommits.concat(
        response.data.map((commit: { sha: string; commit?: { message?: string; author?: { date?: string; name?: string } } }) => ({
          sha: commit.sha,
          message: commit.commit?.message || 'No message',
          date: commit.commit?.author?.date || new Date().toISOString(),
          author: commit.commit?.author?.name || 'Unknown',
        }))
      );

      if (response.data.length < perPage) {
        break;
      }

      page++;
    }

    return allCommits;
  } catch (error) {
    if (axios.isCancel(error)) {
      return [];
    }
    console.error('Failed to fetch GitHub commits:', error);
    return [];
  }
}

export async function fetchCommitTree(owner: string, repo: string, sha: string): Promise<GitHubTreeItem[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
      {
        params: { recursive: 1 },
        headers: getAuthHeaders(),
      }
    );
    return response.data.tree || [];
  } catch (error) {
    console.error('Failed to fetch commit tree:', error);
    return [];
  }
}

export async function fetchFileContent(owner: string, repo: string, path: string, sha: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        params: { ref: sha },
        headers: getAuthHeaders(),
      }
    );
    if (response.data.content) {
      return atob(response.data.content);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch file content:', error);
    return null;
  }
}

export async function fetchCommitDiff(owner: string, repo: string, sha: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: {
        Accept: 'application/vnd.github.v3.diff',
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch commit diff:', error);
    return null;
  }
}

export function parseGitHubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;

  const repo = match[2].replace(/\.git$/, '');
  return { owner: match[1], repo };
}
