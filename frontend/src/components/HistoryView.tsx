import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Eye, 
  FileDown
} from 'lucide-react';
import type { AgentTask, TaskStatus } from '../types/agent.js';

interface HistoryViewProps {
  tasks: AgentTask[];
  onSelectTask: (task: AgentTask) => void;
  onRerunTask: (taskId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  tasks,
  onSelectTask,
  onRerunTask,
}) => {
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const getDuration = (started?: string, completed?: string) => {
    if (!started || !completed) return '—';
    const ms = new Date(completed).getTime() - new Date(started).getTime();
    if (ms < 1000) return `${ms}ms`;
    const sec = Math.round(ms / 1000);
    return `${sec}s`;
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="hud-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-cyber-border gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#090A10] border border-cyber-border text-cyber-red glow-red-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wider uppercase">
              MISSION AUDIT LOG & HISTORY
            </h2>
            <p className="text-xs text-slate-400">
              {tasks.length} total missions persisted in MongoDB & local storage
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'completed', 'failed', 'running'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-xl text-xs font-mono capitalize transition-all ${
                filter === status
                  ? 'bg-cyber-red text-white font-bold glow-red-sm border border-cyber-red'
                  : 'bg-[#090A10] text-slate-400 hover:text-white border border-cyber-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="hud-card rounded-2xl p-10 text-center border border-cyber-border">
          <History className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-white">No historical missions match filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Execute a new mission from the Dashboard to record its execution history and verification results.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const completedCount = t.steps.filter(s => s.status === 'completed').length;
            const duration = getDuration(t.startedAt, t.completedAt);

            return (
              <div
                key={t.id}
                className="hud-card rounded-xl p-4 border border-cyber-border hover:border-cyber-red/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090A10] text-cyber-red border border-cyber-red/30 font-bold">
                      #{t.id.slice(-6)}
                    </span>
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                      t.status === 'completed' ? 'bg-cyber-emerald/15 text-cyber-emerald border-cyber-emerald/40' :
                      t.status === 'failed' ? 'bg-cyber-rose/15 text-cyber-rose border-cyber-rose/40' :
                      t.status === 'running' ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/40 animate-pulse' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate">
                    {t.instruction}
                  </h3>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span>Steps: <strong className="text-white">{completedCount}/{t.steps.length}</strong></span>
                    <span>Duration: <strong className="text-white">{duration}</strong></span>
                    <span>
                      Outcome:{' '}
                      <strong className={t.overallVerification?.verified ? 'text-cyber-emerald' : 'text-slate-400'}>
                        {t.overallVerification?.verified ? 'Verified Passed' : t.status === 'failed' ? 'Failed' : 'Pending'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-start md:self-auto flex-shrink-0">
                  {t.downloadUrl && (
                    <a
                      href={t.downloadUrl}
                      download
                      className="p-2 rounded-xl bg-[#090A10] border border-cyber-border hover:border-cyber-red/40 text-cyber-red transition-colors"
                      title="Download Generated Report"
                    >
                      <FileDown className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => onSelectTask(t)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#131520] border border-cyber-border text-white hover:border-cyber-red/50 text-xs font-medium transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyber-red" />
                    <span>Inspect</span>
                  </button>

                  {(t.status === 'completed' || t.status === 'failed') && (
                    <button
                      onClick={() => onRerunTask(t.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#090A10] border border-cyber-border text-slate-400 hover:text-white hover:border-cyber-red/40 text-xs font-medium transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyber-red" />
                      <span>Rerun</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
