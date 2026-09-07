export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  repoUrl?: string | null;
  githubRepo?: string | null;
  branch: string;
  buildCommand?: string | null;
  outputDir?: string | null;
  framework?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  deployments?: Deployment[];
}

export interface Deployment {
  id: string;
  projectName: string;
  status: "PENDING" | "BUILDING" | "DEPLOYING" | "READY" | "ERROR" | "CANCELED";
  logs: DeploymentLog[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  duration?: number | null;
  url?: string | null;
  commitSha?: string | null;
  commitMessage?: string | null;
  branch?: string | null;
  triggeredBy?: string | null;
  projectId: string;
  project?: Project;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  hasGithubAccess: boolean;
}

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
