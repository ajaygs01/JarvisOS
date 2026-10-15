import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  ShieldAlert, 
  RotateCcw, 
  Play, 
  Search, 
  FileText, 
  ListTodo, 
  FileCode2, 
  AlertTriangle,
  ArrowRight,
  Square,
  X
} from 'lucide-react';
import type { AgentTask, TaskStep, StepStatus, ToolName } from '../types/agent.js';

interface TaskExecutionGraphProps {
  task: AgentTask | null;
  onExecute: (taskId: string) => void;
  onRerun: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  selectedStepId?: string;
  onSelectStep: (stepId: string) => void;
}

export const TaskExecutionGraph: React.FC<TaskExecutionGraphProps> = ({
  task,
  onExecute,
  onRerun,
  onCancel,
  selectedStepId,
  onSelectStep,
}) => {
  if (!task) {
    return (
      <div className="hud-card rounded-2xl p-8 text-center border border-[#1E293B] mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#050814] border border-[#1E293B] flex items-center justify-center mx-auto mb-3 text-cyber-textMuted">
          <ListTodo className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">No Active Plan in Execution</h3>
        <p className="text-xs text-cyber-textMuted max-w-md mx-auto">
          Enter an instruction above or choose a preset mission scenario to generate a multi-step plan.
        </p>
      </div>
    );
  }

  const completedSteps = task.steps.filter(s => s.status === 'completed').length;
  const progressPercent = task.steps.length > 0 ? Math.round((completedSteps / task.steps.length) * 100) : 0;

  const toolIcon = (tool: ToolName) => {
    switch (tool) {
      case 'web_search': return Search;
      case 'generate_report': return FileText;
      case 'task_manager': return ListTodo;
      case 'document_analyzer': return FileCode2;
      case 'failure_test': return AlertTriangle;
      default: return ListTodo;
    }
  };

  const statusBadge = (status: StepStatus, retryCount: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>RUNNING</span>
            {retryCount > 0 && <span className="ml-1 text-cyber-amber font-bold">({retryCount}/2)</span>}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyber-rose/15 text-cyber-rose border border-cyber-rose/40">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'needs_approval':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/40 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>APPROVAL REQ</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="hud-card rounded-2xl p-5 mb-6 border border-[#1E293B]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050814] text-cyber-cyan border border-cyber-cyan/30">
              MISSION #{task.id.slice(-6)}
            </span>
            <span className="text-xs font-mono text-cyber-textMuted">
              {new Date(task.createdAt).toLocaleTimeString()}
            </span>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
              task.status === 'completed' ? 'bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/30' :
              task.status === 'failed' ? 'bg-cyber-rose/10 text-cyber-rose border-cyber-rose/30' :
              task.status === 'running' ? 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30 animate-pulse' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {task.status}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white mt-1 line-clamp-1">
            {task.instruction}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {task.status === 'pending' && (
            <>
              <button
                onClick={() => onExecute(task.id)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyber-cyan text-black text-xs font-semibold hover:bg-cyber-cyan/90 transition-all glow-cyan-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Execution</span>
              </button>
              <button
                onClick={() => onCancel(task.id)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#050814] text-cyber-rose border border-cyber-rose/30 hover:bg-cyber-rose/10 text-xs font-medium transition-all"
                title="Cancel Task"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {(task.status === 'running' || task.status === 'needs_approval') && (
            <button
              onClick={() => onCancel(task.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyber-rose/15 text-cyber-rose border border-cyber-rose/40 hover:bg-cyber-rose/25 text-xs font-semibold transition-all glow-rose"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel Task</span>
            </button>
          )}

          {(task.status === 'completed' || task.status === 'failed') && (
            <button
              onClick={() => onRerun(task.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F1A36] text-white border border-[#1E293B] hover:border-cyber-cyan/50 text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Rerun Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="py-3">
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-cyber-textMuted">
            Progress: {completedSteps} of {task.steps.length} steps satisfied
          </span>
          <span className="text-cyber-cyan font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#050814] rounded-full overflow-hidden border border-[#1E293B]">
          <div 
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-violet transition-all duration-500 rounded-full glow-cyan-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Ordered Execution Steps */}
      <div className="space-y-3 mt-2">
        {task.steps.map((step) => {
          const ToolIcon = toolIcon(step.tool);
          const isSelected = selectedStepId === step.id;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[#0F1A36] border-cyber-cyan shadow-sm glow-cyan-sm'
                  : 'bg-[#050814]/70 border-[#1E293B] hover:border-[#1E293B]/90'
              }`}
            >
              {/* Step Info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#0B132B] border border-[#1E293B] flex items-center justify-center font-mono text-xs font-bold text-cyber-cyan flex-shrink-0">
                  {step.stepNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                    <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B132B] text-cyber-textMuted border border-[#1E293B]">
                      <ToolIcon className="w-3 h-3 text-cyber-cyan" />
                      <span>{step.tool}</span>
                    </span>
                    {step.dependencies.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Depends on: {step.dependencies.join(', ')}
                      </span>
                    )}
                    {step.retryCount > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40">
                        {step.retryCount} Retr{step.retryCount > 1 ? 'ies' : 'y'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white truncate">
                    {step.description}
                  </p>
                  {step.expectedOutput && (
                    <p className="text-[11px] text-cyber-cyan/80 font-mono mt-0.5 line-clamp-1">
                      Expected Output: {step.expectedOutput}
                    </p>
                  )}
                  {step.error && (
                    <p className="text-[11px] text-cyber-rose font-mono mt-1 line-clamp-1">
                      Error: {step.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between md:justify-end space-x-3 flex-shrink-0">
                {statusBadge(step.status, step.retryCount)}
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-cyber-cyan translate-x-0.5' : 'text-slate-600'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
