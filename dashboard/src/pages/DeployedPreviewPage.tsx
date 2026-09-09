import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, Github, GitBranch, Clock, Copy, Check, FileCode, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CodeViewer from '../components/CodeViewer';
import LogViewer from '../components/LogViewer';
import { useState, useEffect } from 'react';
import { parseGitHubRepo, fetchFileContent } from '../services/githubService';

export default function DeployedPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deployments, projects, getCommitTree } = useApp();
  const [copied, setCopied] = useState(false);
  const [commitFiles, setCommitFiles] = useState<Array<{ path: string; type: 'blob' | 'tree' }>>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'logs'>('files');

  const deployment = deployments.find(d => d.id === id);

  const loadTree = async (force = false) => {
    if (!deployment) return;
    setLoading(true);
    try {
      const tree = await getCommitTree(deployment.id, force);
      setCommitFiles(
        tree.map(item => ({
          path: item.path,
          type: item.type as 'blob' | 'tree',
        }))
      );
    } catch (error) {
      console.error('Failed to load commit tree:', error);
      setCommitFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [deployment]);

  if (!deployment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Deployment not found</p>
          <Link to="/deployments" className="text-blue-400 hover:text-blue-300">
            Back to Deployments
          </Link>
        </div>
      </div>
    );
  }

  const project = projects.find(p => p.id === deployment.projectId);
  const repoInfo = project?.gitRepository ? parseGitHubRepo(project.gitRepository) : null;
  const githubCommitUrl = repoInfo
    ? `https://github.com/${repoInfo.owner}/${repoInfo.repo}/commit/${deployment.commitSha}`
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileClick = async (path: string) => {
    if (!project?.gitRepository) return;
    const info = parseGitHubRepo(project.gitRepository);
    if (!info) return;

    try {
      const content = await fetchFileContent(info.owner, info.repo, path, deployment.commitSha);
      setSelectedFile({ path, content: content || 'Unable to load file content' });
    } catch {
      setSelectedFile({ path, content: 'Error loading file' });
    }
  };

  const getCommitHashColor = (sha: string) => {
    const colors = ['text-blue-400', 'text-green-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400'];
    const index = parseInt(sha.substring(0, 2), 16) % colors.length;
    return colors[index];
  };

  const commitColor = getCommitHashColor(deployment.commitSha);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {project?.name?.substring(0, 1) || 'P'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{project?.name || 'Project'}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Commit #{deployment.commitNumber}</span>
                <span className={`font-mono ${commitColor}`}>{deployment.commitSha.substring(0, 7)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge status={deployment.status} />
          {deployment.deploymentUrl && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {deployment.deploymentUrl}
              <button
                onClick={() => copyToClipboard(deployment.deploymentUrl!)}
                className="p-0.5 text-slate-500 hover:text-slate-300"
                title="Copy URL"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </span>
          )}
          {githubCommitUrl && (
            <a
              href={githubCommitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </nav>

      <div className="border-b border-slate-800 px-6 py-3">
        <p className="text-sm text-slate-300 truncate">{deployment.commitMessage}</p>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <GitBranch className="w-4 h-4" />
              Branch
            </div>
            <p className="text-white font-medium">{deployment.branch}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              Deployed
            </div>
            <p className="text-white font-medium">{new Date(deployment.createdAt).toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span className={`w-2 h-2 rounded-full ${commitColor.replace('text-', 'bg-')}`}></span>
              Commit SHA
            </div>
            <p className={`font-mono text-sm ${commitColor}`}>{deployment.commitSha.substring(0, 12)}...</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              Build Time
            </div>
            <p className="text-white font-medium">{deployment.buildDuration ? `${deployment.buildDuration}ms` : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="border-b border-slate-800 flex items-center gap-6 px-6">
            <button
              onClick={() => setActiveTab('files')}
              className={`py-3 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deployment Logs
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'files' && (
              <>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading commit files...</p>
                  </div>
                ) : selectedFile ? (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                      <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        {selectedFile.path}
                      </h3>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Back to files
                      </button>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                        {selectedFile.content}
                      </pre>
                    </div>
                  </div>
                ) : commitFiles.length > 0 ? (
                  <CodeViewer files={commitFiles} onFileClick={handleFileClick} />
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No files loaded for this commit</p>
                    <button
                      onClick={() => loadTree(true)}
                      className="mt-3 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mx-auto"
                    >
                      Click to sync files
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'logs' && (
              <LogViewer logs={deployment.logs} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
