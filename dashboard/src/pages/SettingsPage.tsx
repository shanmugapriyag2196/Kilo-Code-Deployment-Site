import { useEffect, useState } from "react";
import GitHubService from "../services/githubService";
import {
  Github,
  User,
  Shield,
  Bell,
  Palette,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../stores/authContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [githubConnected, setGithubConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkGithubStatus();
  }, []);

  const checkGithubStatus = async () => {
    try {
      const ghService = new GitHubService();
      const status = await ghService.getConnectionStatus();
      setGithubConnected(status.connected);
    } catch {
      setGithubConnected(false);
    }
  };

  const handleGithubConnect = async () => {
    setLoading(true);
    const ghService = new GitHubService();
    await ghService.connect();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </h2>
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-500/20">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || ""}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-primary-500" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{user?.name || "User"}</h3>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </h2>
        <div className="rounded-lg border border-dark-border bg-dark-card p-6">
          {!githubConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Connect your GitHub account
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Import repositories, create projects, and trigger
                  deployments
                </p>
              </div>
              <button
                onClick={handleGithubConnect}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
              >
                <Github className="h-4 w-4" />
                {loading ? "Connecting..." : "Connect GitHub"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20">
                  <Github className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    GitHub Account
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      Connected
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    You can import repositories and create deployments
                  </p>
                </div>
              </div>
              <button
                className="rounded-lg border border-dark-border px-4 py-2 text-sm font-medium hover:bg-dark-border/30"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {githubConnected && (
          <div className="mt-4 rounded-lg border border-dark-border bg-dark-card p-4">
            <h3 className="text-sm font-medium mb-3">API Tokens</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-dark-border/50 p-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">
                      Deployment Token
                    </p>
                    <p className="text-xs text-gray-600">
                      Used for webhook-triggered deployments
                    </p>
                  </div>
                </div>
                <code className="text-xs font-mono bg-dark px-2 py-1 rounded">
                  tok_***{user?.id?.slice(-4)}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-card p-4">
            <div>
              <span className="font-medium">
                Deployment notifications
              </span>
              <p className="text-sm text-gray-500">
                Get notified when deployments start and finish
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-card p-4">
            <div>
              <span className="font-medium">Build failures</span>
              <p className="text-sm text-gray-500">
                Get notified when builds fail
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-card p-4">
            <div>
              <span className="font-medium">GitHub activity</span>
              <p className="text-sm text-gray-500">
                Auto-deploy on push to connected repositories
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance
        </h2>
        <div className="rounded-lg border border-dark-border bg-dark-card p-4">
          <label className="block text-sm font-medium mb-2">
            Theme
          </label>
          <select className="rounded-lg border border-dark-border bg-dark px-4 py-2 text-sm outline-none focus:border-primary-500">
            <option>Dark</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </div>
      </div>
    </div>
  );
}
