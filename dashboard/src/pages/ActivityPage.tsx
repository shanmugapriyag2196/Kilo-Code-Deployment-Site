import { useApp } from '../stores/AppContext';
import { Activity, Rocket, FolderOpen, RefreshCw, Trash2 } from 'lucide-react';

export default function ActivityPage() {
  const { activity } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return <Rocket className="w-4 h-4 text-blue-400" />;
      case 'project_created':
        return <FolderOpen className="w-4 h-4 text-green-400" />;
      case 'project_updated':
        return <RefreshCw className="w-4 h-4 text-yellow-400" />;
      case 'rollback':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Activity</h1>
        <p className="text-slate-400 mt-1">Track all deployment and project activity</p>
      </div>

      {activity.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
          <p className="text-slate-400">Activity will appear here as you use the platform</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 mb-1">{item.message}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
