import axios from 'axios';

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

export async function fetchCommitsFromGitHub(repoUrl: string): Promise<GitHubCommit[]> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return [];

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    const allCommits: GitHubCommit[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${cleanRepo}/commits`,
        { params: { per_page: perPage, page } }
      );

      if (!Array.isArray(response.data) || response.data.length === 0) {
        break;
      }

      allCommits.push(
        ...response.data.map((commit: { sha: string; commit?: { message?: string; author?: { date?: string; name?: string } } }) => ({
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
    console.error('Failed to fetch GitHub commits:', error);
    return [];
  }
}

export async function fetchCommitTree(owner: string, repo: string, sha: string): Promise<GitHubTreeItem[]> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`);
    return response.data.tree || [];
  } catch (error) {
    console.error('Failed to fetch commit tree:', error);
    return [];
  }
}

export async function fetchFileContent(owner: string, repo: string, path: string, sha: string): Promise<string | null> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${sha}`);
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
      headers: { Accept: 'application/vnd.github.v3.diff' }
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
