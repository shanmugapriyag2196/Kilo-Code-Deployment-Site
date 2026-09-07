import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  READY: "bg-green-500/20 text-green-400",
  BUILDING: "bg-yellow-500/20 text-yellow-400",
  DEPLOYING: "bg-blue-500/20 text-blue-400",
  ERROR: "bg-red-500/20 text-red-400",
  PENDING: "bg-gray-500/20 text-gray-400",
  CANCELED: "bg-gray-500/20 text-gray-400",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const latest = project.deployments?.[0];

  return (
    <div className="group rounded-lg border border-dark-border bg-dark-card p-6 transition-all hover:border-primary-500/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {project.description || "No description provided"}
          </p>
          {project.githubRepo && (
            <p className="text-xs text-gray-600 mt-2">
              {project.githubRepo} • branch: {project.branch}
            </p>
          )}
        </div>
        {latest && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[latest.status] || statusColors.PENDING}`}
          >
            {latest.status}
          </span>
        )}
      </div>

      {latest && (
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {latest.url && (
            <a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-primary-400"
            >
              {latest.url.replace("https://", "")}
            </a>
          )}
          {latest.duration && <span>{latest.duration}s</span>}
          <span>{new Date(latest.createdAt).toLocaleDateString()}</span>
        </div>
      )}

      <button className="mt-4 w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary-500">
        Deploy
      </button>
    </div>
  );
}
