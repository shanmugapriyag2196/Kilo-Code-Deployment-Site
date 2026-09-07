import { useEffect, useState } from "react";
import api from "../services/api";
import { Deployment } from "../types";
import DeploymentCard from "../components/DeploymentCard";
import { Link } from "react-router-dom";
import { Rocket, Loader, AlertCircle, RefreshCw } from "lucide-react";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deployments");
      setDeployments(res.data);
      setError(null);
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to load deployments");
    } finally {
      setLoading(false);
    }
  };

  const activeDeployments = deployments.filter((d) =>
    ["PENDING", "BUILDING", "DEPLOYING"].includes(d.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-gray-400">View and manage all your deployments</p>
        </div>
        <button
          onClick={fetchDeployments}
          className="rounded-lg border border-dark-border px-3 py-2 text-sm font-medium hover:bg-dark-border/30"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {activeDeployments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">In Progress</h2>
          <div className="space-y-3">
            {activeDeployments.map((deployment) => (
              <Link
                key={deployment.id}
                to={`/deployments/${deployment.id}`}
                className="block"
              >
                <div className="rounded-lg border border-primary-500/30 bg-primary-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{deployment.projectName}</span>
                      <span className="mx-2 text-gray-600">/</span>
                      <span className="text-sm text-gray-500">
                        {deployment.commitSha?.substring(0, 7) || ""}
                      </span>
                    </div>
                    <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                      {deployment.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
          <p className="text-gray-400">{error}</p>
        </div>
      ) : deployments.length === 0 ? (
        <div className="py-16 text-center">
          <Rocket className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <h3 className="mb-2 text-lg font-medium">No deployments yet</h3>
          <p className="text-gray-500 mb-6">
            Create a project and start deploying
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
          >
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments
            .filter(
              (d) => !["PENDING", "BUILDING", "DEPLOYING"].includes(d.status)
            )
            .map((deployment) => (
              <Link
                key={deployment.id}
                to={`/deployments/${deployment.id}`}
                className="block"
              >
                <DeploymentCard deployment={deployment} />
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
