import { Deployment, DeploymentLog, EnvironmentDeployment, ActivityItem, Platform } from '../types';

const commitMessages = [
  'feat: add user authentication',
  'fix: resolve memory leak in worker',
  'chore: update dependencies',
  'feat: implement dark mode',
  'fix: correct API response format',
  'docs: update README',
  'feat: add payment integration',
  'refactor: optimize database queries',
  'fix: handle edge case in validation',
  'feat: add real-time notifications',
];

const stageMessages: Record<string, { message: string; level: 'info' | 'success' | 'warn' | 'error' }[]> = {
  queued: [{ message: 'Deployment queued', level: 'info' }],
  installing: [
    { message: 'Installing dependencies with npm...', level: 'info' },
    { message: 'Added 342 packages in 2.4s', level: 'success' },
  ],
  building: [
    { message: 'Running build command: npm run build', level: 'info' },
    { message: 'Compiled successfully in 3.2s', level: 'success' },
  ],
  testing: [
    { message: 'Running 24 tests...', level: 'info' },
    { message: 'All tests passed', level: 'success' },
  ],
  deploying: [
    { message: 'Uploading deployment package...', level: 'info' },
    { message: 'Deployment uploaded successfully', level: 'success' },
  ],
  health_check: [
    { message: 'Running health check on https://...', level: 'info' },
    { message: 'Health check passed', level: 'success' },
  ],
};

export function getCommitMessage(commitNumber: number): string {
  return commitMessages[(commitNumber - 1) % commitMessages.length];
}

export function generateMockDeployment(projectId: string, projectName: string, gitRepository: string, environment: 'production' | 'preview' | 'development' = 'production', commitNumber: number = 1): Deployment {
  const id = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const commitSha = Math.random().toString(36).substring(2, 9);
  const commitMessage = getCommitMessage(commitNumber);
  const platform: Platform = 'vercel';
  const branch = 'main';
  const deploymentUrl = generateVercelUrl(projectName, gitRepository, branch, environment, id);
  
  const deployment: Deployment = {
    id,
    projectId,
    projectName,
    environment,
    platform,
    branch,
    commitSha,
    commitNumber,
    commitMessage,
    deploymentUrl,
    buildDuration: 0,
    createdAt: new Date().toISOString(),
    status: 'queued',
    logs: [],
  };

  return deployment;
}

export function generateVercelUrl(_projectName: string, _gitRepository: string, _branch: string, _environment: 'production' | 'preview' | 'development', deploymentId: string): string {
  return `${window.location.origin}/preview/${deploymentId}`;
}

export function generateDeploymentLogsForStage(deploymentId: string, commitNumber: number, status: Deployment['status']): DeploymentLog[] {
  const logs: DeploymentLog[] = [];
  const stages = ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check', 'ready'];
  const currentIndex = stages.indexOf(status);
  
  if (currentIndex === -1) return logs;

  const messagesForStage = stageMessages[status];
  if (!messagesForStage) return logs;

  const baseTimestamp = Date.now();
  
  messagesForStage.forEach((msg, index) => {
    logs.push({
      id: `log_${baseTimestamp}_${commitNumber}_${index}`,
      deploymentId,
      timestamp: new Date(baseTimestamp + index * 500).toISOString(),
      level: msg.level,
      message: `[${status.toUpperCase()}] ${msg.message}`,
    });
  });

  return logs;
}

export function getNextStatus(currentStatus: Deployment['status']): Deployment['status'] | null {
  const flow: Deployment['status'][] = ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check', 'ready'];
  const currentIndex = flow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= flow.length - 1) return null;
  return flow[currentIndex + 1];
}

export function createActivityItem(
  type: ActivityItem['type'],
  projectId: string,
  projectName: string,
  message: string
): ActivityItem {
  return {
    id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    message,
    projectId,
    projectName,
    timestamp: new Date().toISOString(),
  };
}

export function createEnvironmentDeployment(
  projectId: string,
  projectName: string,
  gitRepository: string,
  environment: 'production' | 'preview' | 'development',
  deploymentId: string
): EnvironmentDeployment {
  const url = generateVercelUrl(projectName, gitRepository, 'main', environment, deploymentId);

  return {
    id: `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    projectId,
    environment,
    deploymentId,
    url,
    branch: 'main',
    status: 'ready',
    updatedAt: new Date().toISOString(),
  };
}
