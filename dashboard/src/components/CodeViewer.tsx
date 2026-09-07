import { useState } from 'react';
import { File, Folder, FolderOpen, ChevronRight } from 'lucide-react';

interface CodeViewerProps {
  files: Array<{ path: string; type: 'blob' | 'tree' }>;
  onFileClick?: (path: string) => void;
}

export default function CodeViewer({ files, onFileClick }: CodeViewerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getPathParts = (path: string) => {
    return path.split('/').filter(Boolean);
  };

  const isFolderExpanded = (path: string) => {
    return expandedFolders.has(path);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Commit Files</h3>
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
        {files.length === 0 ? (
          <p className="text-slate-500 text-sm">No files available</p>
        ) : (
          <div className="space-y-1">
            {files.map((file, index) => {
              const parts = getPathParts(file.path);
              const isExpanded = isFolderExpanded(file.path);
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-800/50 cursor-pointer ${
                    file.type === 'tree' ? 'font-medium' : ''
                  }`}
                  onClick={() => {
                    if (file.type === 'tree') {
                      toggleFolder(file.path);
                    } else if (onFileClick) {
                      onFileClick(file.path);
                    }
                  }}
                >
                  {file.type === 'tree' ? (
                    <>
                      {isExpanded ? <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-400" />}
                    </>
                  ) : (
                    <>
                      <span className="w-3" />
                      <File className="w-4 h-4 text-blue-400" />
                    </>
                  )}
                  <span className={`text-sm ${file.type === 'tree' ? 'text-slate-200' : 'text-slate-400'}`}>
                    {parts[parts.length - 1]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
