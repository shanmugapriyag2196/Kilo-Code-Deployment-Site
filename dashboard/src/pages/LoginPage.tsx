import { Github, ArrowRight, BarChart2, Rocket, Shield } from "lucide-react";
import GitHubService from "../services/githubService";

export default function LoginPage() {
  const handleLogin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const githubService = new GitHubService();
      githubService.connect();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="mx-auto w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500">
              <Rocket className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Deploy Platform</h1>
          <p className="mt-2 text-gray-400">
            The easiest way to deploy your web applications
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-500"
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="border-t border-dark-border pt-6">
          <h2 className="text-center text-sm font-medium mb-4">Why Deploy Platform?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <BarChart2 className="h-5 w-5 text-primary-500 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                Lightning-fast deployments with global CDN
              </p>
            </div>
            <div className="flex gap-3">
              <Rocket className="h-5 w-5 text-primary-500 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                One-click deployments from GitHub
              </p>
            </div>
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary-500 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                Automatic SSL and custom domains
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
