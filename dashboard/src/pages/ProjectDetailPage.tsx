import { useParams, Link } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, GitBranch, Clock, ExternalLink, Rocket, Github } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DeployButton from '../components/DeployButton';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, deployments, deployProject, environments, syncProjectFromGitHub } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const project = projects.find(p => p.id === id);
  const projectDeployments = deployments.filter(d => d.projectId === id);
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

   const handleSyncCommits = async () => {
     setSyncing(true);
     setSyncMessage('Syncing commits from GitHub...');
     const newDeployments = await syncProjectFromGitHub(project.id);
     if (newDeployments.length > 0) {
       setSyncMessage(`Successfully synced ${newDeployments.length} commits from GitHub!`);
     } else {
       setSyncMessage('No commits found. Please check the repository URL.');
     }
     setSyncing(false);
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
         {project.gitRepository && (
           <button
             onClick={handleSyncCommits}
             disabled={syncing}
             className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors border border-slate-700"
           >
             <Github className="w-4 h-4" />
             {syncing ? 'Syncing...' : 'Sync Commits'}
           </button>
         )}
       </div>

       {syncMessage && (
         <div className={`p-4 rounded-lg ${
           syncMessage.includes('No commits') || syncMessage.includes('failed') || syncMessage.includes('check')
             ? 'bg-red-500/10 border border-red-500/30 text-red-400'
             : 'bg-green-500/10 border border-green-500/30 text-green-400'
         }`}>
           {syncMessage}
         </div>
       )}

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

      {projectDeployments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">Deployments</h2>
            <p className="text-sm text-slate-400 mt-1">{projectDeployments.length} deployment{projectDeployments.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="divide-y divide-slate-800">
            {projectDeployments.map((deployment) => (
              <Link
                key={deployment.id}
                to={`/deployment-detail/${deployment.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-300">#{deployment.commitNumber}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={deployment.status} />
                      <span className="text-xs text-slate-500">{deployment.branch}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate">{deployment.commitMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {deployment.commitSha && `SHA: ${deployment.commitSha.substring(0, 7)}`} • {new Date(deployment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {deployment.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(deployment.deploymentUrl, '_blank');
                      }}
                      className="text-slate-400 hover:text-slate-200"
                      title="Preview deployment"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {projectDeployments.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <Rocket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No deployments yet</p>
          <DeployButton
            projectId={project.id}
            commitNumber={nextCommitNumber}
            onDeploy={handleDeploy}
            isDeploying={project.status === 'building'}
          />
        </div>
      )}
    </div>
  );
}
