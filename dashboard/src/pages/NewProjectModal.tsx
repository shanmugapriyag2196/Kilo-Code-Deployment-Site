import { useState } from 'react';
import { X, Github } from 'lucide-react';
import { useApp } from '../stores/AppContext';

interface NewProjectModalProps {
  onClose: () => void;
}

export default function NewProjectModal({ onClose }: NewProjectModalProps) {
  const { createProject, syncProjectFromGitHub } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gitRepository: '',
    branch: 'main',
  });
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const isValidGitHubUrl = formData.gitRepository.includes('github.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = createProject(formData);
    setCreatedProjectId(project.id);
    setSyncMessage('');

    if (isValidGitHubUrl) {
      setSyncing(true);
      setSyncMessage('Syncing commits from GitHub...');
      syncProjectFromGitHub(project.id, project).then((deployments) => {
        if (deployments.length > 0) {
          setSyncMessage(`Successfully synced ${deployments.length} commits from GitHub!`);
        } else {
          setSyncMessage('No commits found. Please check the repository URL.');
        }
        setSyncing(false);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Create New Project</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdProjectId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="my-awesome-project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="A brief description of your project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Git Repository *
              </label>
              <input
                type="text"
                required
                value={formData.gitRepository}
                onChange={(e) => setFormData({ ...formData, gitRepository: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="https://github.com/username/repo"
              />
              {isValidGitHubUrl && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Github className="w-3 h-3" />
                  GitHub repository detected - commits will sync automatically
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Project Created!</h4>
              <p className="text-slate-300">Your project has been created successfully.</p>
              {isValidGitHubUrl && (
                <p className="text-sm text-slate-400 mt-2">
                  Git Repository: {formData.gitRepository}
                </p>
              )}
            </div>

            {isValidGitHubUrl && (
              <div className="space-y-4">
                {syncing ? (
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Github className="w-5 h-5 animate-spin" />
                    Syncing commits from GitHub...
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    Auto-syncing commits...
                  </div>
                )}

                {syncMessage && (
                  <div className={`p-4 rounded-lg ${
                    syncMessage.includes('Failed') || syncMessage.includes('No commits')
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-green-500/10 border border-green-500/30 text-green-400'
                  }`}>
                    {syncMessage}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Go to Projects
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}