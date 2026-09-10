type VercelDeployment = {
  uid?: string;
  url?: string | null;
  target?: 'production' | 'staging' | null;
  state?: string;
  readyState?: string;
  gitSource?: { sha?: string };
  meta?: Record<string, unknown>;
  attribution?: { commitMeta?: Record<string, unknown> };
};

type VercelDeploymentsResponse = {
  deployments?: VercelDeployment[];
};

function getQueryValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim();
  return '';
}

function getDeploymentSha(deployment: VercelDeployment): string {
  const candidates = [
    deployment.gitSource?.sha,
    deployment.meta?.githubCommitSha,
    deployment.meta?.githubCommitSHA,
    deployment.attribution?.commitMeta?.sha,
  ];

  return candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0) || '';
}

function normalizeUrl(url: string): string {
  const withoutScheme = url.replace(/^https?:\/\//i, '');
  return `https://${withoutScheme}`;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN;
  if (!token) {
    response.status(503).json({ error: 'Vercel credentials are not configured.' });
    return;
  }

  const projectId = getQueryValue(request.query?.projectId);
  const sha = getQueryValue(request.query?.sha);

  if (!projectId || !sha) {
    response.status(400).json({ error: 'projectId and sha are required.' });
    return;
  }

  const params = new URLSearchParams({
    projectId,
    sha,
    state: 'READY',
    limit: '100',
  });

  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) {
    params.set('teamId', teamId);
  }

  try {
    const upstream = await fetch(`https://api.vercel.com/v7/deployments?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!upstream.ok) {
      const upstreamBody = await upstream.text();
      response.status(upstream.status === 401 || upstream.status === 403 ? 403 : 502).json({
        error: upstream.status === 401 || upstream.status === 403
          ? 'Vercel credentials do not have access to this project.'
          : 'Vercel deployment lookup failed.',
        detail: upstream.status === 401 || upstream.status === 403 ? undefined : upstreamBody.slice(0, 500),
      });
      return;
    }

    const payload = await upstream.json() as VercelDeploymentsResponse;
    const deployments = Array.isArray(payload.deployments) ? payload.deployments : [];
    const matchingDeployments = deployments.filter(deployment =>
      (deployment.state === 'READY' || deployment.readyState === 'READY')
      && typeof deployment.url === 'string'
      && deployment.url.length > 0
    );

    const previewDeployment = matchingDeployments.find(deployment => deployment.target === null)
      || matchingDeployments.find(deployment => deployment.target === undefined)
      || matchingDeployments[0];

    if (!previewDeployment?.url) {
      response.status(404).json({ error: 'No ready Vercel deployment was found for this commit.' });
      return;
    }

    response.setHeader('Cache-Control', 'private, no-store');
    response.status(200).json({
      url: normalizeUrl(previewDeployment.url),
      deploymentId: previewDeployment.uid || '',
      target: previewDeployment.target ?? null,
      commitSha: getDeploymentSha(previewDeployment),
    });
  } catch (error) {
    response.status(502).json({
      error: 'Unable to contact Vercel.',
      detail: error instanceof Error ? error.message.slice(0, 500) : undefined,
    });
  }
}
