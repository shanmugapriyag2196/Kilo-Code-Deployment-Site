import { useState, useEffect } from "react";
import api from "../services/api";
import GitHubService, { GitHubRepo } from "../services/githubService";

export interface CreateProjectData {
  name: string;
  description: string;
  githubRepo: string;
  branch: string;
  buildCommand?: string;
  outputDir?: string;
  framework?: string;
}

interface CreateProjectFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function CreateProjectForm({
  onCancel,
  onSuccess,
}: CreateProjectFormProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    buildCommand: "npm run build",
    outputDir: "dist",
    framework: "vite",
  });

  const githubService = new GitHubService();

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      const data = await githubService.getRepos();
      setRepos(data);
    } catch (error) {
      console.error("Failed to load repos", error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRepoSelect = (repoFullName: string) => {
    setSelectedRepo(repoFullName);
    setFormData({
      ...formData,
      name: repoFullName.split("/").pop() || repoFullName,
    });

    const parts = repoFullName.split("/");
    const owner = parts[0];
    const repo = parts[1];

    setLoadingBranches(true);
    githubService
      .getBranches(owner, repo)
      .then((data) => {
        setBranches(data.map((b) => b.name));
        const mainBranch = data.find(
          (b) => b.name === "main" || b.name === "master"
        );
        setSelectedBranch(mainBranch?.name || data[0]?.name || "main");
      })
      .catch(() => {
        setBranches(["main"]);
        setSelectedBranch("main");
      })
      .finally(() => setLoadingBranches(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) return;

    setSubmitting(true);
    try {
      await api.post("/projects/create", {
        name: formData.name,
        description: formData.description,
        githubRepo: selectedRepo,
        branch: selectedBranch,
        buildCommand: formData.buildCommand,
        outputDir: formData.outputDir,
        framework: formData.framework,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to create project", error);
      alert(error?.response?.data?.error || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (r.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            placeholder="My Awesome Project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            placeholder="A brief description of your project"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            GitHub Repository
          </label>
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none mb-2"
          />

          {loadingRepos ? (
            <div className="py-4 text-center">
              <div className="text-sm text-gray-400">
                Loading repositories...
              </div>
            </div>
          ) : (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-dark-border">
              {filteredRepos.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">
                  No repositories found
                </p>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo.fullName)}
                    className={`cursor-pointer p-3 transition-colors ${
                      selectedRepo === repo.fullName
                        ? "bg-primary-500/20"
                        : "hover:bg-dark-border/30"
                    } border-b border-dark-border last:border-0`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{repo.fullName}</div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {repo.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            {repo.language}
                          </span>
                        )}
                        <span>{repo.stars} stars</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {selectedRepo && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            >
              {loadingBranches ? (
                <option>Loading...</option>
              ) : (
                branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Build Command
            </label>
            <input
              type="text"
              value={formData.buildCommand}
              onChange={(e) =>
                setFormData({ ...formData, buildCommand: e.target.value })
              }
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Output Directory
            </label>
            <input
              type="text"
              value={formData.outputDir}
              onChange={(e) =>
                setFormData({ ...formData, outputDir: e.target.value })
              }
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Framework
          </label>
          <input
            type="text"
            value={formData.framework}
            onChange={(e) =>
              setFormData({ ...formData, framework: e.target.value })
            }
            className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-2.5 text-sm focus:border-primary-500 outline-none"
            placeholder="vite, nextjs, react, etc."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !selectedRepo}
            className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium hover:bg-dark-border/30"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
