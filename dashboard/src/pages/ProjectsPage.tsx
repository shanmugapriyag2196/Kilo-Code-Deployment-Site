import { useEffect, useState } from "react";
import api from "../services/api";
import { Project } from "../types";
import ProjectCard from "../components/ProjectCard";
import { Link, useNavigate } from "react-router-dom";
import { Plus, GitBranch, Loader, RefreshCw, AlertCircle } from "lucide-react";
import GitHubService from "../services/githubService";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
      setError(null);

      const ghService = new GitHubService();
      const status = await ghService.getConnectionStatus();
      setGithubConnected(status.connected);
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-400">Manage your deployment projects</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="rounded-lg border border-dark-border px-4 py-2 text-sm font-medium hover:bg-dark-border/30"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/projects/create"
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {!githubConnected && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-400">GitHub not connected</p>
              <p className="mt-1 text-sm text-gray-400">
                You need to connect your GitHub account to create projects.
              </p>
              <button
                onClick={() => navigate("/settings")}
                className="mt-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500"
              >
                Connect GitHub
              </button>
            </div>
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
      ) : projects.length === 0 ? (
        <div className="py-16 text-center">
          <GitBranch className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <h3 className="mb-2 text-lg font-medium">No projects yet</h3>
          <p className="text-gray-500 mb-6">
            Create a project to get started with deployments
          </p>
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
          >
            <Plus className="h-4 w-4" />
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
