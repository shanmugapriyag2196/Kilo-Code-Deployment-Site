import axios from 'axios';

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export async function fetchCommitsFromGitHub(repoUrl: string): Promise<GitHubCommit[]> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return [];
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/commits?per_page=100`);
    
    return response.data.map((commit: { sha: string; commit?: { message?: string; author?: { date?: string; name?: string } } }) => ({
      sha: commit.sha,
      message: commit.commit?.message || 'No message',
      date: commit.commit?.author?.date || new Date().toISOString(),
      author: commit.commit?.author?.name || 'Unknown',
    }));
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error);
    return [];
  }
}

export function parseGitHubRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  
  const repo = match[2].replace(/\.git$/, '');
  return { owner: match[1], repo };
}
