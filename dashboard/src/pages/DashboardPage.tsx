import { useEffect, useState } from "react";
import api from "../services/api";
import { Project } from "../types";
import ProjectCard from "../components/ProjectCard";
import { Plus, GitBranch, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GitHubConnectButton from "../components/GitHubConnectButton";
import GitHubService, { GitHubRepo } from "../services/githubService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, deploymentsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/deployments"),
      ]);
      setProjects(projectsRes.data);
      setDeployments(deploymentsRes.data);

      const ghService = new GitHubService();
      const status = await ghService.getConnectionStatus();
      setGithubConnected(status.connected);

      if (status.connected) {
        const reposData = await ghService.getRepos(1, 10);
        setRepos(reposData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const recentDeployments = deployments.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Overview of your projects and deployments</p>
        </div>
        <Link
          to="/projects/create"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">GitHub Integration</h2>
        <GitHubConnectButton
          connected={githubConnected}
          repos={repos}
          showRepos={true}
        />
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : (
        <>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Projects</h2>
              <Link
                to="/projects"
                className="text-sm text-primary-400 hover:underline"
              >
                View all
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center">
                <GitBranch className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                <p className="text-gray-400 mb-2">No projects yet</p>
                <button
                  onClick={() => navigate("/projects/create")}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
                >
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 6).map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <ProjectCard project={project} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {recentDeployments.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Deployments</h2>
                <Link
                  to="/deployments"
                  className="text-sm text-primary-400 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentDeployments.map((deployment: any) => (
                  <Link
                    key={deployment.id}
                    to={`/deployments/${deployment.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border border-dark-border bg-dark-card p-4 hover:border-primary-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{deployment.projectName}</span>
                          <span className="mx-2 text-gray-600">•</span>
                          <span className="text-sm text-gray-500">
                            {deployment.commitSha?.substring(0, 7) || "—"}
                          </span>
                        </div>
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
                      {deployment.url && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <ExternalLink className="h-3 w-3" />
                          {deployment.url}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
