import axios from 'axios';
import { Deployment, Project } from '../types';

export interface VercelDeploymentResolution {
  url: string;
  deploymentId: string;
  target: string | null;
  commitSha: string;
}

const PREVIEW_PATH = '/preview/';

function isDirectDeploymentUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;

  try {
    return !new URL(url).pathname.startsWith(PREVIEW_PATH);
  } catch {
    return false;
  }
}

function getProjectIdentifier(project?: Project): string {
  return (project?.vercelProjectId || project?.name || '').trim();
}

export function hasDirectDeploymentUrl(deployment: Deployment): boolean {
  return isDirectDeploymentUrl(deployment.deploymentUrl);
}

export async function resolveDeploymentPreviewUrl(
  deployment: Deployment,
  project?: Project
): Promise<string> {
  if (isDirectDeploymentUrl(deployment.deploymentUrl)) {
    return deployment.deploymentUrl;
  }

  const projectId = getProjectIdentifier(project);
  if (!projectId) {
    throw new Error('Connect this project to a Vercel project before opening Preview.');
  }

  if (!deployment.commitSha || deployment.commitSha.length < 7) {
    throw new Error('This commit does not have a SHA that can be matched to a Vercel deployment.');
  }

  try {
    const response = await axios.get<VercelDeploymentResolution>('/api/vercel-deployments', {
      params: {
        projectId,
        sha: deployment.commitSha,
      },
    });

    if (!response.data.url) {
      throw new Error('Vercel did not return a deployment URL for this commit.');
    }

    return /^https?:\/\//i.test(response.data.url)
      ? response.data.url
      : `https://${response.data.url}`;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('No ready Vercel deployment was found for this commit.');
    }

    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error('Vercel credentials are not configured for this dashboard.');
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Vercel credentials do not have access to this project.');
    }

    throw new Error(
      axios.isAxiosError(error) && error.response?.data?.error
        ? String(error.response.data.error)
        : 'Unable to resolve the Vercel deployment URL.'
    );
  }
}
