import { useState } from 'react';
import { AlertCircle, ExternalLink, LoaderCircle } from 'lucide-react';
import { Deployment, Project } from '../types';
import { resolveDeploymentPreviewUrl } from '../services/vercelService';
import { useApp } from '../stores/AppContext';

interface PreviewButtonProps {
  deployment: Deployment;
  project?: Project;
  className?: string;
  children?: React.ReactNode;
}

export default function PreviewButton({ deployment, project, className = '', children }: PreviewButtonProps) {
  const { updateDeployment, updateEnvironment } = useApp();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePreview = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (status === 'loading') return;

    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    setStatus('loading');
    setMessage('');

    try {
      const url = await resolveDeploymentPreviewUrl(deployment, project);
      updateDeployment(deployment.id, { deploymentUrl: url });
      updateEnvironment(deployment.id, { url });

      if (previewWindow) {
        previewWindow.location.replace(url);
      } else {
        window.location.assign(url);
      }

      setStatus('idle');
    } catch (error) {
      if (previewWindow) {
        previewWindow.close();
      }
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to open the deployment preview.');
    }
  };

  return (
    <button
      type="button"
      onClick={handlePreview}
      disabled={status === 'loading'}
      className={className}
      title={status === 'error' ? message : 'Open the original Vercel deployment'}
    >
      {status === 'loading' ? (
        <LoaderCircle className="w-4 h-4 animate-spin" />
      ) : status === 'error' ? (
        <AlertCircle className="w-4 h-4 text-red-400" />
      ) : (
        <ExternalLink className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}
