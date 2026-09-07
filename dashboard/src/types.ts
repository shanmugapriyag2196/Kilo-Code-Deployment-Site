export type ProjectStatus = 'idle' | 'building' | 'ready' | 'error';
export type DeploymentStatus = 'queued' | 'installing' | 'building' | 'testing' | 'deploying' | 'health_check' | 'ready' | 'failed' | 'cancelled';
export type Environment = 'production' | 'preview' | 'development';
export type Platform = 'vercel' | 'netlify' | 'aws' | 'docker' | 'github-actions';

export interface Project {
  id: string;
  name: string;
  description: string;
  gitRepository: string;
  framework: string;
  branch: string;
  buildCommand: string;
  outputDir: string;
  platform: Platform;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  environment: Environment;
  platform: Platform;
  branch: string;
  commitSha: string;
  commitMessage: string;
  deploymentUrl: string;
  buildDuration: number;
  createdAt: string;
  status: DeploymentStatus;
  logs: DeploymentLog[];
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface EnvironmentDeployment {
  id: string;
  projectId: string;
  environment: Environment;
  deploymentId: string;
  url: string;
  branch: string;
  status: DeploymentStatus;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'deployment' | 'project_created' | 'project_updated' | 'rollback';
  message: string;
  projectId: string;
  projectName: string;
  timestamp: string;
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
}

export type Page = 'overview' | 'projects' | 'project-detail' | 'deployments' | 'deployment-detail' | 'environments' | 'platforms' | 'activity' | 'logs' | 'settings';
