import { useState, useEffect } from "react";
import { ArrowLeft, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import GitHubService from "../services/githubService";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const ghService = new GitHubService();
      const status = await ghService.getConnectionStatus();
      setConnected(status.connected);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader className="mx-auto h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-4 text-lg font-medium">GitHub Not Connected</h3>
        <p className="text-gray-400 mb-6">
          You need to connect your GitHub account before creating a project.
        </p>
        <button
          onClick={() => navigate("/settings")}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="rounded-lg p-2 text-gray-400 hover:bg-dark-border/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Create New Project</h1>
      </div>

      <CreateProjectForm
        onCancel={() => navigate("/projects")}
        onSuccess={() => navigate("/projects")}
      />
    </div>
  );
}
