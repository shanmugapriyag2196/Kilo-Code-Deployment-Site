import { useParams, Link } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, ExternalLink, Check, Rocket, GitBranch, Clock, RefreshCw, Trash2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DeploymentPipeline from '../components/DeploymentPipeline';
import LogViewer from '../components/LogViewer';
import { useState } from 'react';

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { deployments, redeploy, cancelDeployment } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  const deployment = deployments.find(d => d.id === id);

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
            <h1 className="text-3xl font-bold text-white">{deployment.projectName}</h1>
            <StatusBadge status={deployment.status} />
          </div>
          <p className="text-slate-400 mt-1">
            {deployment.commitMessage} • {new Date(deployment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {deployment.deploymentUrl && deployment.status === 'ready' && (
          <a
            href={deployment.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit
          </a>
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
        </div>
      </div>

      {activeTab === 'overview' && (
        <DeploymentPipeline currentStatus={deployment.status} />
      )}

      {activeTab === 'logs' && (
        <LogViewer logs={deployment.logs} />
      )}
    </div>
  );
}
