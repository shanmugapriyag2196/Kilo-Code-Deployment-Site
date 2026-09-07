import { useEffect, useState } from "react";
import api from "../services/api";
import { Project, Deployment } from "../types";
import { useParams } from "react-router-dom";
import { Rocket, GitBranch, Globe, Calendar, Copy, Check } from "lucide-react";
import DeploymentProgress from "../components/DeploymentProgress";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error("Failed to fetch project", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await api.post(`/projects/${id}/deploy`, {});
      const newDeployment: Deployment = res.data;
      setProject((prev) =>
        prev
          ? {
              ...prev,
              deployments: [newDeployment, ...(prev.deployments || [])],
            }
          : prev
      );
    } catch (error: any) {
      console.error("Failed to deploy", error);
      alert(error?.response?.data?.error || "Failed to deploy");
    } finally {
      setDeploying(false);
    }
  };

  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading...</div>;
  }

  if (!project) {
    return <div className="py-12 text-center text-gray-400">Project not found</div>;
  }

  const latest = project.deployments?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-400 mt-1">{project.description || "No description"}</p>
        </div>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
        >
          <Rocket className="h-4 w-4" />
          {deploying ? "Deploying..." : "Deploy"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <GitBranch className="h-4 w-4" />
            Branch
          </div>
          <p className="mt-1 font-medium">{project.branch}</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="h-4 w-4" />
            Repository
          </div>
          <p className="mt-1 font-medium">{project.githubRepo}</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            Created
          </div>
          <p className="mt-1 font-medium">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {latest && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Latest Deployment</h2>
          <div className="rounded-lg border border-dark-border bg-dark-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-medium">{latest.projectName}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    latest.status === "READY"
                      ? "bg-green-500/20 text-green-400"
                      : latest.status === "BUILDING" || latest.status === "DEPLOYING"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : latest.status === "ERROR"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {latest.status}
                </span>
              </div>
              {latest.commitSha && (
                <span className="text-sm text-gray-500">
                  {latest.commitSha.substring(0, 7)}
                </span>
              )}
            </div>

            <DeploymentProgress status={latest.status} />

            {latest.url && (
              <div className="mt-6 flex items-center justify-between rounded-lg border border-dark-border bg-dark p-3">
                <span className="text-sm">{latest.url}</span>
                <button
                  onClick={() => handleCopyLink(latest.url!)}
                  className="rounded-lg bg-dark-border/50 px-3 py-1.5 text-sm hover:bg-dark-border"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {project.deployments && project.deployments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">All Deployments</h2>
          <div className="space-y-3">
            {project.deployments.slice(1).map((deployment: Deployment) => (
              <a
                key={deployment.id}
                href={`/deployments/${deployment.id}`}
                className="block rounded-lg border border-dark-border bg-dark-card p-4 hover:border-primary-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{deployment.projectName}</span>
                    <span className="mx-2 text-gray-600">/</span>
                    <span className="text-sm text-gray-500">
                      {deployment.commitSha?.substring(0, 7) || "No commit"}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      deployment.status === "READY"
                        ? "bg-green-500/20 text-green-400"
                        : deployment.status === "BUILDING" || deployment.status === "DEPLOYING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : deployment.status === "ERROR"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {deployment.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}