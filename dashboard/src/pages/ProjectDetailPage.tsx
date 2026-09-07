import { useParams, Link } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, GitBranch, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DeploymentPipeline from '../components/DeploymentPipeline';
import DeployButton from '../components/DeployButton';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, deployments, deployProject, environments } = useApp();
  const [copied, setCopied] = useState(false);

      const project = projects.find(p => p.id === id);
  const projectDeployments = deployments.filter(d => d.projectId === id);
  const latestDeployment = projectDeployments[0];
  const projectEnvironments = environments.filter(e => e.projectId === id);
  const nextCommitNumber = projectDeployments.length > 0 ? Math.max(...projectDeployments.map(d => d.commitNumber)) + 1 : 1;

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Project not found</p>
        <Link to="/projects" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleDeploy = (projectId: string, environment: 'production' | 'preview' | 'development') => {
    deployProject(projectId, environment);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-slate-400 mt-1">{project.description}</p>
        </div>
        <DeployButton
          projectId={project.id}
          commitNumber={nextCommitNumber}
          onDeploy={handleDeploy}
          isDeploying={project.status === 'building'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <GitBranch className="w-4 h-4" />
            Branch
          </div>
          <p className="text-white font-medium">{project.branch}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <ExternalLink className="w-4 h-4" />
            Repository
          </div>
          <p className="text-white font-medium text-sm truncate">{project.gitRepository}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
            Last Updated
          </div>
          <p className="text-white font-medium">{new Date(project.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Production Deployment</h2>
        {latestDeployment && latestDeployment.environment === 'production' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={latestDeployment.status} />
                  <span className="text-sm text-slate-400">
                    {latestDeployment.commitSha && `#${latestDeployment.commitSha.substring(0, 7)}`}
                  </span>
                </div>
                <p className="text-slate-300">{latestDeployment.commitMessage}</p>
              </div>
            </div>

            {latestDeployment.deploymentUrl && (
              <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">
                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-200 flex-1 truncate">{latestDeployment.deploymentUrl}</span>
                <button
                  onClick={() => copyToClipboard(latestDeployment.deploymentUrl)}
                  className="text-slate-400 hover:text-slate-200 flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="mt-4">
              <DeploymentPipeline currentStatus={latestDeployment.status} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400">No production deployment yet</p>
            <DeployButton
              projectId={project.id}
              commitNumber={nextCommitNumber}
              onDeploy={handleDeploy}
              isDeploying={project.status === 'building'}
            />
          </div>
        )}
      </div>

      {projectEnvironments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Environments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectEnvironments.map(env => (
              <div key={env.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white capitalize">{env.environment}</h3>
                  <StatusBadge status={env.status} />
                </div>
                <p className="text-sm text-slate-400 truncate">{env.url}</p>
                <p className="text-xs text-slate-500 mt-2">{env.branch}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectDeployments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Deployments</h2>
          <div className="space-y-3">
            {projectDeployments.slice(0, 10).map(deployment => (
              <Link
                key={deployment.id}
                to={`/deployment-detail/${deployment.id}`}
                className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-white capitalize">{deployment.environment}</span>
                      <StatusBadge status={deployment.status} />
                    </div>
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-300">#{deployment.commitNumber}</span> • {deployment.commitSha && `#${deployment.commitSha.substring(0, 7)}`} • {new Date(deployment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
