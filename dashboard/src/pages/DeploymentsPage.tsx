import { useState } from 'react';
import { useApp } from '../stores/AppContext';
import { Rocket, Search, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { resolveDeploymentUrl } from '../lib/mockData';

export default function DeploymentsPage() {
  const { deployments, cancelDeployment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDeployments = deployments.filter(d => {
    const matchesSearch = d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.commitMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Deployments</h1>
        <p className="text-slate-400 mt-1">Monitor and manage all your deployments</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="queued">Queued</option>
          <option value="building">Building</option>
          <option value="ready">Ready</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="text-center py-16">
          <Rocket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No deployments yet</h3>
          <p className="text-slate-400">Deploy a project to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeployments.map(deployment => (
            <Link
              key={deployment.id}
              to={`/deployment-detail/${deployment.id}`}
              className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{deployment.projectName}</h3>
                    <StatusBadge status={deployment.status} />
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{deployment.commitMessage}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="font-medium text-slate-300">#{deployment.commitNumber}</span>
                    <span className="capitalize">{deployment.environment}</span>
                    <span>•</span>
                    <span>{deployment.branch}</span>
                    <span>•</span>
                    <span>{deployment.commitSha && `#${deployment.commitSha.substring(0, 7)}`}</span>
                    <span>•</span>
                    <span>{new Date(deployment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {deployment.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(resolveDeploymentUrl(deployment.deploymentUrl), '_blank');
                      }}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Preview deployment"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  {['queued', 'installing', 'building', 'testing', 'deploying', 'health_check'].includes(deployment.status) && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        cancelDeployment(deployment.id);
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
