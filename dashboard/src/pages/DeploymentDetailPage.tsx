import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, ExternalLink, Check, Rocket, GitBranch, Clock, RefreshCw, Trash2, FileCode } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DeploymentPipeline from '../components/DeploymentPipeline';
import LogViewer from '../components/LogViewer';
import CodeViewer from '../components/CodeViewer';
import { useState, useEffect } from 'react';
import { parseGitHubRepo } from '../services/githubService';

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deployments, redeploy, cancelDeployment, getCommitTree, projects } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'code'>('overview');
   const [commitFiles, setCommitFiles] = useState<Array<{ path: string; type: 'blob' | 'tree' }>>([]);
   const [codeLoading, setCodeLoading] = useState(false);
   const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const deployment = deployments.find(d => d.id === id);

  const loadCommitTree = async (force = false) => {
    if (!deployment || !id) return;
    
    try {
      const tree = await getCommitTree(id, force);
      const files = tree.map(item => ({
        path: item.path,
        type: item.type as 'blob' | 'tree',
      }));
      setCommitFiles(files);
    } catch (error) {
      console.error('Failed to load commit tree:', error);
      setCommitFiles([]);
    }
  };

  useEffect(() => {
    loadCommitTree();
  }, [deployment, id]);

  if (!deployment) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Deployment not found</p>
        <Link to="/deployments" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          Back to Deployments
        </Link>
      </div>
    );
  }

  const project = projects.find(p => p.id === deployment.projectId);

  const handleRedeploy = () => {
    redeploy(deployment.id);
  };

  const handleCancel = () => {
    cancelDeployment(deployment.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileClick = async (path: string) => {
    if (!project?.gitRepository) return;
    
    const repoInfo = parseGitHubRepo(project.gitRepository);
    if (!repoInfo) return;

    try {
      const { fetchFileContent } = await import('../services/githubService');
      const content = await fetchFileContent(repoInfo.owner, repoInfo.repo, path, deployment.commitSha);
      setSelectedFile({ path, content: content || 'Unable to load file content' });
    } catch {
      setSelectedFile({ path, content: 'Error loading file' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/deployments"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">#{deployment.commitNumber} {deployment.projectName}</h1>
            <StatusBadge status={deployment.status} />
          </div>
          <p className="text-slate-400 mt-1">
            {deployment.commitMessage} • {new Date(deployment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {deployment.deploymentUrl && deployment.status === 'ready' && (
          <button
            onClick={() => navigate(`/preview/${deployment.id}`)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </button>
        )}
        <button
          onClick={handleRedeploy}
          disabled={deployment.status !== 'ready' && deployment.status !== 'failed'}
          className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Redeploy
        </button>
        {['queued', 'installing', 'building', 'testing', 'deploying', 'health_check'].includes(deployment.status) && (
          <button
            onClick={handleCancel}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <GitBranch className="w-4 h-4" />
            Commit
          </div>
          <p className="text-white font-medium">#{deployment.commitNumber}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <GitBranch className="w-4 h-4" />
            Branch
          </div>
          <p className="text-white font-medium">{deployment.branch}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Rocket className="w-4 h-4" />
            Environment
          </div>
          <p className="text-white font-medium capitalize">{deployment.environment}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
            Duration
          </div>
          <p className="text-white font-medium">{deployment.buildDuration ? `${deployment.buildDuration}ms` : '-'}</p>
        </div>
      </div>

      {deployment.deploymentUrl && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <ExternalLink className="w-4 h-4" />
            Deployment URL
          </div>
          <button
            onClick={() => copyToClipboard(deployment.deploymentUrl)}
            className="text-blue-400 hover:text-blue-300 text-sm truncate flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
            {deployment.deploymentUrl.replace('https://', '')}
          </button>
        </div>
      )}

      <div className="border-b border-slate-800">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'code'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Code
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <DeploymentPipeline currentStatus={deployment.status} />
      )}

      {activeTab === 'logs' && (
        <LogViewer logs={deployment.logs} />
      )}

      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Commit Files</h3>
            <button
              onClick={() => {
                setCodeLoading(true);
                setSelectedFile(null);
                loadCommitTree(true).finally(() => setCodeLoading(false));
              }}
              disabled={codeLoading}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${codeLoading ? 'animate-spin' : ''}`} />
              {codeLoading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
          {selectedFile ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  {selectedFile.path}
                </h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Back to files
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          ) : codeLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <RefreshCw className="w-6 h-6 text-slate-500 animate-spin mx-auto mb-2" />
              <p className="text-slate-400">Syncing commit files from GitHub...</p>
            </div>
          ) : (
            <CodeViewer
              files={commitFiles}
              onFileClick={handleFileClick}
            />
          )}
        </div>
       )}
    </div>
  );
}
