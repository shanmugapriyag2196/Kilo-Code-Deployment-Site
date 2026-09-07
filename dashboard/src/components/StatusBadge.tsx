const statusConfig: Record<string, { color: string; label: string }> = {
  idle: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Idle' },
  building: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Building' },
  ready: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Ready' },
  error: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Error' },
  queued: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Queued' },
  installing: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Installing' },
  testing: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Testing' },
  deploying: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Deploying' },
  health_check: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Health Check' },
  failed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Failed' },
  cancelled: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Cancelled' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: status };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}
