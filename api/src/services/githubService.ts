import axios, { AxiosInstance } from "axios";

export class GitHubService {
  private client: AxiosInstance;

  constructor(accessToken?: string) {
    this.client = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Accept: "application/vnd.github+json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  }

  async getUser() {
    const res = await this.client.get("/user");
    return res.data;
  }

  async getUserRepos(page = 1, perPage = 30) {
    const res = await this.client.get("/user/repos", {
      params: {
        sort: "updated",
        per_page: perPage,
        page: page,
      },
    });
    return res.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      defaultBranch: repo.default_branch,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      language: repo.language,
      isPrivate: repo.private,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));
  }

  async getRepo(owner: string, repo: string) {
    const res = await this.client.get(`/repos/${owner}/${repo}`);
    return res.data;
  }

  async getRepoBranches(owner: string, repo: string) {
    const res = await this.client.get(`/repos/${owner}/${repo}/branches`);
    return res.data.map((branch: any) => ({
      name: branch.name,
      commitSha: branch.commit.sha,
    }));
  }

  async getRepoTree(owner: string, repo: string, ref: string) {
    const res = await this.client.get(`/repos/${owner}/${repo}/git/trees/${ref}`, {
      params: { recursive: 1 },
    });
    return res.data;
  }

  async getLatestCommit(owner: string, repo: string, ref: string) {
    const res = await this.client.get(`/repos/${owner}/${repo}/commits`, {
      params: { sha: ref, per_page: 1 },
    });
    if (res.data.length === 0) return null;
    return res.data[0];
  }

  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      scope: "repo user",
      state: state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const res = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      },
      {
        headers: { Accept: "application/json" },
      }
    );
    return res.data.access_token;
  }
}

export default GitHubService;
