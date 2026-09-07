import { useEffect, useState } from "react";
import api from "../services/api";
import { Project, Deployment } from "../types";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface AnalyticsData {
  totalProjects: number;
  totalDeployments: number;
  successful: number;
  failed: number;
  avgDuration: number;
  recentActivity: Deployment[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [projectsRes, deploymentsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/deployments"),
      ]);

      const projects: Project[] = projectsRes.data;
      const deployments: Deployment[] = deploymentsRes.data;

      const successful = deployments.filter(
        (d) => d.status === "READY"
      ).length;
      const failed = deployments.filter(
        (d) => d.status === "ERROR" || d.status === "CANCELED"
      ).length;

      const durations = deployments
        .filter((d) => d.duration)
        .map((d) => d.duration!);
      const avgDuration =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0;

      setData({
        totalProjects: projects.length,
        totalDeployments: deployments.length,
        successful,
        failed,
        avgDuration,
        recentActivity: deployments.slice(0, 10),
      });
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading...</div>;
  }

  if (!data) {
    return <div className="py-12 text-center text-gray-400">No data</div>;
  }

  const successRate =
    data.totalDeployments > 0
      ? Math.round((data.successful / data.totalDeployments) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">
          Track your deployment performance and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            Total Projects
          </div>
          <p className="mt-2 text-2xl font-bold">{data.totalProjects}</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            Total Deployments
          </div>
          <p className="mt-2 text-2xl font-bold">{data.totalDeployments}</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Success Rate
          </div>
          <p className="mt-2 text-2xl font-bold">{successRate}%</p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Avg Duration
          </div>
          <p className="mt-2 text-2xl font-bold">{data.avgDuration}s</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <h3 className="font-semibold mb-3">Deployment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                Successful
              </span>
              <span className="font-bold">{data.successful}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                Failed/Canceled
              </span>
              <span className="font-bold">{data.failed}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 5).map((deployment) => (
              <div
                key={deployment.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-400 truncate">
                  {deployment.projectName}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    deployment.status === "READY"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {deployment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
