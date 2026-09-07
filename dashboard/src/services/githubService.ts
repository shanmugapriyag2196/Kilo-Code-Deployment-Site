import api from "../services/api";

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  url: string;
  cloneUrl: string;
  language: string | null;
  isPrivate: boolean;
  stars: number;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  commitSha: string;
}

export interface ConnectionStatus {
  connected: boolean;
}

export class GitHubService {
  async getConnectionStatus(): Promise<ConnectionStatus> {
    const { data } = await api.get("/github/status");
    return data;
  }

  async getRepos(page?: number, perPage?: number): Promise<GitHubRepo[]> {
    const { data } = await api.get("/github/repos", {
      params: { page, per_page: perPage },
    });
    return data;
  }

  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const { data } = await api.get(`/github/repos/${owner}/${repo}/branches`);
    return data;
  }

  async getAuthUrl(): Promise<{ url: string; state: string }> {
    const { data } = await api.get("/auth/github/connect");
    return data;
  }

  async connect(): Promise<void> {
    const { url } = await this.getAuthUrl();
    window.location.href = url;
  }
}

export default GitHubService;
