import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Rocket,
  Globe,
  Cloud,
  Activity,
  FileText,
  Settings,
  Plus,
  User,
  Github,
} from 'lucide-react';
import { Page } from '../types';
import { useApp } from '../stores/AppContext';

const navItems: { path: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { path: 'overview', label: 'Overview', icon: LayoutDashboard },
  { path: 'projects', label: 'Projects', icon: FolderOpen },
  { path: 'deployments', label: 'Deployments', icon: Rocket },
  { path: 'environments', label: 'Environments', icon: Globe },
  { path: 'platforms', label: 'Platforms', icon: Cloud },
  { path: 'activity', label: 'Activity', icon: Activity },
  { path: 'logs', label: 'Logs', icon: FileText },
  { path: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onNewProject }: { onNewProject: () => void }) {
  const location = useLocation();
  const { isGitHubConnected, githubUser, connectGitHub, disconnectGitHub } = useApp();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">VG Deployment Bot</h1>
            <p className="text-xs text-slate-400">Your deployment assistant</p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors mb-6"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/${item.path}` || 
                            (item.path === 'overview' && location.pathname === '/');
            
            return (
              <NavLink
                key={item.path}
                to={`/${item.path}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="space-y-3 mb-4">
          {isGitHubConnected && githubUser ? (
            <div
              onClick={disconnectGitHub}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
              title="Click to disconnect GitHub"
            >
              <img
                src={githubUser.avatar_url}
                alt={githubUser.login}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">GitHub</p>
                <p className="text-sm font-medium text-white truncate">@{githubUser.login}</p>
              </div>
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            </div>
          ) : (
            <button
              onClick={() => connectGitHub()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-medium text-sm border border-slate-700 transition-colors"
            >
              <Github className="w-4 h-4" />
              Connect GitHub
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Developer</p>
            <p className="text-xs text-slate-400 truncate">dev@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
