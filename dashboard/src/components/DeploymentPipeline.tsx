import { Check, Circle } from 'lucide-react';

const steps: { status: string; label: string }[] = [
  { status: 'queued', label: 'Queued' },
  { status: 'installing', label: 'Installing' },
  { status: 'building', label: 'Building' },
  { status: 'testing', label: 'Testing' },
  { status: 'deploying', label: 'Deploying' },
  { status: 'health_check', label: 'Health Check' },
  { status: 'ready', label: 'Ready' },
];

export default function DeploymentPipeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = steps.findIndex(s => s.status === currentStatus);
  const isComplete = currentStatus === 'ready';
  const isFailed = currentStatus === 'failed' || currentStatus === 'cancelled';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Deployment Pipeline</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentIndex && !isComplete && !isFailed;
          const isDone = index < currentIndex || isComplete;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.status} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {isDone && !isFailed ? (
                  <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  </div>
                ) : isFailed && isCurrent ? (
                  <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                    <Circle className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isDone ? 'text-green-400' : 
                  isActive ? 'text-blue-400' : 
                  isFailed && isCurrent ? 'text-red-400' : 
                  'text-slate-500'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
