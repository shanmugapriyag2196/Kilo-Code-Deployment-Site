import { useEffect, useState } from "react";
import api from "../services/api";
import { Deployment } from "../types";
import { useParams, Link } from "react-router-dom";
import {
  Rocket,
  Copy,
  Check,
  Calendar,
  GitBranch,
  ExternalLink,
  AlertCircle,
  Loader,
} from "lucide-react";
import DeploymentProgress from "../components/DeploymentProgress";
import DeploymentLogs from "../components/DeploymentLogs";

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDeployment();
  }, [id]);

  const fetchDeployment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/deployments/${id}`);
      setDeployment(res.data);
    } catch (error) {
      console.error("Failed to fetch deployment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    try {
      await api.post(`/deployments/${id}/cancel`);
      setDeployment((prev) =>
        prev ? { ...prev, status: "CANCELED" } : prev
      );
    } catch (error) {
      console.error("Failed to cancel", error);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader className="mx-auto h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="py-12 text-center text-gray-400">
        <AlertCircle className="mx-auto mb-2 h-6 w-6" />
        Deployment not found
      </div>
    );
  }

  const isActive = ["PENDING", "BUILDING", "DEPLOYING"].includes(
    deployment.status
  );

  return (
    <div className="space-y-6">
      <Link
        to={`/projects/${deployment.projectId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
      >
        &larr; Back to {deployment.projectName}
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{deployment.projectName}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              deployment.status === "READY"
                ? "bg-green-500/20 text-green-400"
                : deployment.status === "BUILDING" ||
                  deployment.status === "DEPLOYING"
                ? "bg-yellow-500/20 text-yellow-400"
                : deployment.status === "ERROR"
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {deployment.status}
          </span>
        </div>
        {isActive && (
          <button
            onClick={handleCancel}
            className="rounded-lg border border-dark-border px-4 py-2 text-sm font-medium text-red-400 hover:bg-dark-border/30"
          >
            Cancel Deployment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <GitBranch className="h-4 w-4" />
            Branch
          </div>
          <p className="mt-1 font-medium">{deployment.branch || "main"}</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            Created
          </div>
          <p className="mt-1 font-medium">
            {new Date(deployment.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Rocket className="h-4 w-4" />
            Duration
          </div>
          <p className="mt-1 font-medium">
            {deployment.duration ? `${deployment.duration}s` : "-"}
          </p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ExternalLink className="h-4 w-4" />
            Live URL
          </div>
          {deployment.url ? (
            <div className="mt-1 flex items-center gap-2">
              <a
                href={deployment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary-400 hover:underline"
              >
                {deployment.url.replace("https://", "")}
              </a>
              <button
                onClick={() => handleCopyLink(deployment.url!)}
                className="text-gray-500 hover:text-gray-400"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          ) : (
            <p className="mt-1 text-gray-600">Not deployed yet</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-dark-border bg-dark-card p-6">
        <h2 className="text-lg font-semibold mb-4">Deployment Progress</h2>
        <DeploymentProgress status={deployment.status} />
      </div>

      {deployment.logs && deployment.logs.length > 0 && (
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <h2 className="text-lg font-semibold mb-4">Deployment Logs</h2>
          <DeploymentLogs logs={deployment.logs} />
        </div>
      )}
    </div>
  );
}
