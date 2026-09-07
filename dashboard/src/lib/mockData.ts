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

export function generateMockDeployment(projectId: string, projectName: string, environment: 'production' | 'preview' | 'development' = 'production', commitNumber: number = 1): Deployment {
  const id = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const commitSha = Math.random().toString(36).substring(2, 9);
  const commitMessage = commitMessages[Math.floor(Math.random() * commitMessages.length)];
  const platform: Platform = 'vercel';
  
  const deployment: Deployment = {
    id,
    projectId,
    projectName,
    environment,
    platform,
    branch: 'main',
    commitSha,
    commitNumber,
    commitMessage,
    deploymentUrl: `http://localhost:5173/deployment-detail/${id}`,
    buildDuration: 0,
    createdAt: new Date().toISOString(),
    status: 'queued',
    logs: [],
  };

  return deployment;
}

export function generateDeploymentLogs(deploymentId: string): DeploymentLog[] {
  const logs: DeploymentLog[] = [];
  
  const logMessages: { stage: string; message: string; level: 'info' | 'success' | 'warn' | 'error' }[] = [
    { stage: 'queued', message: 'Deployment queued', level: 'info' },
    { stage: 'installing', message: 'Installing dependencies with npm...', level: 'info' },
    { stage: 'installing', message: 'Added 342 packages in 2.4s', level: 'success' },
    { stage: 'building', message: 'Running build command: npm run build', level: 'info' },
    { stage: 'building', message: 'Compiled successfully in 3.2s', level: 'success' },
    { stage: 'testing', message: 'Running 24 tests...', level: 'info' },
    { stage: 'testing', message: 'All tests passed', level: 'success' },
    { stage: 'deploying', message: 'Uploading deployment package...', level: 'info' },
    { stage: 'deploying', message: 'Deployment uploaded successfully', level: 'success' },
    { stage: 'health_check', message: 'Running health check on https://...', level: 'info' },
    { stage: 'health_check', message: 'Health check passed', level: 'success' },
  ];

  logMessages.forEach((log, index) => {
    const logTimestamp = new Date(Date.now() + index * 500).toISOString();
    logs.push({
      id: `log_${Date.now()}_${index}`,
      deploymentId,
      timestamp: logTimestamp,
      level: log.level,
      message: `[${log.stage.toUpperCase()}] ${log.message}`,
    });
  });

  return logs;
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
  environment: 'production' | 'preview' | 'development',
  deploymentId: string
): EnvironmentDeployment {
  const projectName = 'my-app';
  return {
    id: `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    projectId,
    environment,
    deploymentId,
    url: `https://${projectName}-${environment}.vercel.app`,
    branch: 'main',
    status: 'ready',
    updatedAt: new Date().toISOString(),
  };
}
