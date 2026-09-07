import { useApp } from '../stores/AppContext';
import MetricCard from '../components/MetricCard';
import { Activity, Rocket, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

export default function OverviewPage() {
  const { projects, deployments, activity } = useApp();

  const totalProjects = projects.length;
  const activeDeployments = deployments.filter(d => 
    ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check'].includes(d.status)
  ).length;
  const successfulDeployments = deployments.filter(d => d.status === 'ready').length;
  const failedDeployments = deployments.filter(d => d.status === 'failed').length;
  const successRate = deployments.length > 0 
    ? Math.round((successfulDeployments / deployments.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome to VG Deployment Bot. Here's what's happening with your deployments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={totalProjects}
          icon={<FolderOpen className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, label: 'this month' }}
        />
        <MetricCard
          title="Active Deployments"
          value={activeDeployments}
          icon={<Rocket className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Successful Deployments"
          value={successfulDeployments}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Failed Deployments"
          value={failedDeployments}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Success Rate</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - successRate / 100)}`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{successRate}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-300 mb-2">Deployment Success Rate</p>
              <p className="text-sm text-slate-400">
                {successfulDeployments} successful out of {deployments.length} total deployments
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Vercel</span>
              <span className="text-green-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Netlify</span>
              <span className="text-green-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">AWS</span>
              <span className="text-green-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Docker</span>
              <span className="text-yellow-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Degraded
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">GitHub Actions</span>
              <span className="text-green-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Deployments</h3>
            <Link to="/deployments" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {deployments.slice(0, 5).length === 0 ? (
              <p className="text-slate-400 text-sm">No deployments yet</p>
            ) : (
              deployments.slice(0, 5).map((deployment) => (
                <Link
                  key={deployment.id}
                  to={`/deployments/${deployment.id}`}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{deployment.projectName}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {deployment.commitSha && `#${deployment.commitSha.substring(0, 7)}`} • {deployment.environment}
                    </p>
                  </div>
                  <StatusBadge status={deployment.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.slice(0, 5).length === 0 ? (
              <p className="text-slate-400 text-sm">No activity yet</p>
            ) : (
              activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Activity className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{item.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
