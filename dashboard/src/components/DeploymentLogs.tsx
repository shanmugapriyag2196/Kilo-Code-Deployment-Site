import { DeploymentLog } from "../types";
import { AlertCircle, Info } from "lucide-react";

interface DeploymentLogsProps {
  logs: DeploymentLog[];
}

const iconMap = {
  INFO: <Info className="h-3 w-3 text-blue-400" />,
  WARN: <AlertCircle className="h-3 w-3 text-yellow-400" />,
  ERROR: <AlertCircle className="h-3 w-3 text-red-400" />,
  DEBUG: <Info className="h-3 w-3 text-gray-500" />,
};

export default function DeploymentLogs({ logs }: DeploymentLogsProps) {
  return (
    <div className="rounded-lg border border-dark-border bg-dark-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Deployment Logs</h3>
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="mt-0.5">{iconMap[log.level] || <Info className="h-3 w-3" />}</span>
                <span className="text-gray-500">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={log.level === "ERROR" ? "text-red-400" : "text-gray-300"}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
