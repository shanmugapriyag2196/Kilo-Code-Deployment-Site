import { Deployment } from "../types";
import { Clock } from "lucide-react";

interface DeploymentCardProps {
  deployment: Deployment;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-500/20 text-gray-400",
  BUILDING: "bg-yellow-500/20 text-yellow-400",
  DEPLOYING: "bg-blue-500/20 text-blue-400",
  READY: "bg-green-500/20 text-green-400",
  ERROR: "bg-red-500/20 text-red-400",
  CANCELED: "bg-gray-500/20 text-gray-400",
};

export default function DeploymentCard({ deployment }: DeploymentCardProps) {
  const statusColor = statusColors[deployment.status] || statusColors.PENDING;

  return (
    <div className="rounded-lg border border-dark-border bg-dark-card p-6 transition-all hover:border-primary-500/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
              {deployment.status}
            </span>
            {deployment.commitSha && (
              <span className="text-xs text-gray-600">
                {deployment.commitSha.substring(0, 7)}
              </span>
            )}
            {deployment.branch && (
              <span className="text-xs text-gray-600">
                / {deployment.branch}
              </span>
            )}
          </div>

          {deployment.commitMessage && (
            <p className="mt-2 text-sm text-gray-300 line-clamp-2">
              {deployment.commitMessage.split("\n")[0]}
            </p>
          )}

          {deployment.projectName && (
            <p className="mt-2 text-sm text-gray-500">
              Project: {deployment.projectName}
            </p>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end gap-2">
          {deployment.duration && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{deployment.duration}s</span>
            </div>
          )}
          {deployment.url && deployment.status === "READY" && (
            <a
              href={deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-400 hover:underline"
            >
              Live URL
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>
          Created: {new Date(deployment.createdAt).toLocaleString()}
        </span>
        {deployment.completedAt && (
          <span>
            Completed: {new Date(deployment.completedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
