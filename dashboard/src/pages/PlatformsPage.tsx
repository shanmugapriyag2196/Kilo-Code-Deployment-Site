import { Check } from 'lucide-react';
import { Platform } from '../types';

const platforms: { id: Platform; name: string; icon: string; description: string; features: string[] }[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Frontend cloud platform for developers',
    features: ['Edge Functions', 'Analytics', 'Preview Deployments'],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '◆',
    description: 'Modern web development platform',
    features: ['Edge Handlers', 'Split Testing', 'Forms'],
  },
  {
    id: 'aws',
    name: 'AWS',
    icon: '☁',
    description: 'Amazon Web Services integration',
    features: ['Lambda', 'S3', 'CloudFront'],
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    description: 'Container-based deployments',
    features: ['Containers', 'Kubernetes', 'Helm Charts'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    icon: '⚙',
    description: 'CI/CD with GitHub Actions',
    features: ['Workflows', 'Matrix Builds', 'Artifacts'],
  },
];

export default function PlatformsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Platforms</h1>
        <p className="text-slate-400 mt-1">Supported deployment platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(platform => (
          <div
            key={platform.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{platform.icon}</div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                <Check className="w-3 h-3" />
                Connected
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{platform.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{platform.description}</p>
            
            <div className="space-y-2">
              {platform.features.map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
