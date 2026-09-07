import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../stores/authContext";
import { Github, Home, FolderGit2, Rocket, Settings, BarChart3, Search } from "lucide-react";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Deployments", href: "/deployments", icon: Rocket },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-dark">
      <aside className="w-64 border-r border-dark-border bg-dark-card">
        <div className="p-4">
          <div className="mb-6 flex items-center space-x-2">
            <Github className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-xl">Deploy Platform</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-gray-400 hover:bg-dark-border/50 hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-dark-border p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-500/20">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || ""}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <Github className="h-4 w-4 text-primary-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-dark-border/50 hover:text-gray-300"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-dark-border bg-dark-card px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {navItems.find((i) => i.href === location.pathname)?.name || "Dashboard"}
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="rounded-lg border border-dark-border bg-dark px-10 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </header>
        <div className="p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
