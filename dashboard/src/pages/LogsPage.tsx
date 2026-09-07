import { useApp } from '../stores/AppContext';
import { FileText, Search } from 'lucide-react';
import { useState } from 'react';

export default function LogsPage() {
  const { deployments } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const allLogs = deployments.flatMap(d => 
    d.logs.map(log => ({
      ...log,
      projectName: d.projectName,
      deploymentId: d.id,
    }))
  );

  const filteredLogs = allLogs.filter(log =>
    log.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Logs</h1>
        <p className="text-slate-400 mt-1">View and search deployment logs</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No logs available</h3>
          <p className="text-slate-400">Deploy a project to see logs here</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex gap-3 mb-1">
                <span className="text-slate-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-slate-500 flex-shrink-0">
                  [{log.projectName}]
                </span>
                <span className={
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  log.level === 'success' ? 'text-green-400' :
                  'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
