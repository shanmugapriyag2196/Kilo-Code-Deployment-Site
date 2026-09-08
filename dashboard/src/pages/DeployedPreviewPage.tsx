import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../stores/AppContext';
import { ArrowLeft, Github, GitBranch, ExternalLink, Clock, Rocket, Copy, Check, FileCode } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import CodeViewer from '../components/CodeViewer';
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

  const deployment = deployments.find(d => d.id === id);

  useEffect(() => {
    const loadTree = async () => {
      if (!deployment) return;
      setLoading(true);
      try {
        const tree = await getCommitTree(deployment.id, true);
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
    loadTree();
  }, [deployment, getCommitTree]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{project?.name || 'Project'}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Commit #{deployment.commitNumber}</span>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span>{deployment.commitSha.substring(0, 7)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={deployment.status} />
            {deployment.deploymentUrl && (
              <button
                onClick={() => copyToClipboard(deployment.deploymentUrl!)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {deployment.deploymentUrl.replace('https://', '')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <GitBranch className="w-4 h-4" />
              Commit
            </div>
            <p className="text-white font-medium">#{deployment.commitNumber}</p>
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
              <Rocket className="w-4 h-4" />
              Environment
            </div>
            <p className="text-white font-medium capitalize">{deployment.environment}</p>
          </div>
        </div>

        {githubCommitUrl && (
          <div className="mb-6">
            <a
              href={githubCommitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              View on GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">
              {project?.name || 'Project'} Dashboard — Commit #{deployment.commitNumber}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {deployment.commitMessage}
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading commit files...</p>
              </div>
            ) : selectedFile ? (
              <div>
                <div className="flex items-center justify-between mb-4">
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
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                    {selectedFile.content}
                  </pre>
                </div>
              </div>
            ) : (
              <CodeViewer files={commitFiles} onFileClick={handleFileClick} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
