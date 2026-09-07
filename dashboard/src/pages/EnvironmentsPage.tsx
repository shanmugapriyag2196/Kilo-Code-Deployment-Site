import { useApp } from '../stores/AppContext';
import { Globe, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function EnvironmentsPage() {
  const { environments, projects } = useApp();

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const groupedEnvironments = environments.reduce((acc, env) => {
    const projectName = getProjectName(env.projectId);
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(env);
    return acc;
  }, {} as Record<string, typeof environments>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Environments</h1>
        <p className="text-slate-400 mt-1">Manage your deployment environments</p>
      </div>

      {environments.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No environments yet</h3>
          <p className="text-slate-400">Deploy a project to create environments</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEnvironments).map(([projectName, envs]) => (
            <div key={projectName} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{projectName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {envs.map(env => (
                  <div key={env.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white capitalize">{env.environment}</h4>
                      <StatusBadge status={env.status} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-300 truncate">{env.url}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Branch</span>
                        <span className="text-slate-200">{env.branch}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Updated</span>
                        <span className="text-slate-200">{new Date(env.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
