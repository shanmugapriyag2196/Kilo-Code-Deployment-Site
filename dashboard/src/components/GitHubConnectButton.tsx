import GitHubService, { GitHubRepo } from "../services/githubService";
import { Github, ExternalLink } from "lucide-react";

interface GitHubConnectButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  connected?: boolean;
  showRepos?: boolean;
  repos?: GitHubRepo[];
}

export default function GitHubConnectButton({
  onConnect,
  onDisconnect,
  connected = false,
  showRepos = false,
  repos = [],
}: GitHubConnectButtonProps) {
  const handleConnect = async () => {
    const service = new GitHubService();
    await service.connect();
    onConnect?.();
  };

  if (connected) {
    return (
      <div className="rounded-lg border border-dark-border bg-dark-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-primary-500" />
            <div>
              <p className="font-medium">GitHub Account Connected</p>
              <p className="text-sm text-gray-500">You can now import repositories</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              onDisconnect?.();
              window.location.reload();
            }}
            className="rounded-lg border border-dark-border px-3 py-1.5 text-sm hover:bg-dark-border/30"
          >
            Disconnect
          </button>
        </div>

        {showRepos && repos.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Recent Repositories</h4>
            {repos.slice(0, 5).map((repo) => (
              <div
                key={repo.name}
                className="flex items-center justify-between rounded-lg border border-dark-border/50 p-3"
              >
                <div>
                  <p className="font-medium text-sm">{repo.name}</p>
                  <p className="text-xs text-gray-500">
                    {repo.language}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{repo.stars} stars</span>
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dark-border bg-dark-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5 text-primary-500" />
          <div>
            <p className="font-medium">Connect your GitHub account</p>
            <p className="text-sm text-gray-500">
              Import projects and create deployments from your repositories
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          Connect GitHub
        </button>
      </div>
    </div>
  );
}
