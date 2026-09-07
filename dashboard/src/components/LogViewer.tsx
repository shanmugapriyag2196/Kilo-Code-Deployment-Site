import { DeploymentLog } from '../types';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function LogViewer({ logs }: { logs: DeploymentLog[] }) {
  const [copied, setCopied] = useState(false);

  const copyLogs = () => {
    const text = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Deployment Logs</h3>
        {logs.length > 0 && (
          <button
            onClick={copyLogs}
            className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-slate-500">No logs available</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-slate-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
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
        )}
      </div>
    </div>
  );
}
