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
  X,
  Zap,
  ShieldCheck
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
      <div className="hud-card rounded-2xl p-8 text-center border border-cyber-border mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#090A10] border border-cyber-border flex items-center justify-center mx-auto mb-3 text-slate-500 glow-red-sm">
          <Zap className="w-6 h-6 text-cyber-red" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">No Active Mission in Execution</h3>
        <p className="text-xs text-cyber-textMuted max-w-md mx-auto">
          Enter an instruction above, speak into the microphone, or click a preset protocol to generate a multi-step execution plan.
        </p>
      </div>
    );
  }

  const completedSteps = task.steps.filter(s => s.status === 'completed').length;
  const progressPercent = task.steps.length > 0 ? Math.round((completedSteps / task.steps.length) * 100) : 0;
  const isSimulationTask = task.instruction.toLowerCase().includes('failure') || task.instruction.toLowerCase().includes('fail test');

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
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-red/20 text-cyber-red border border-cyber-red/50 animate-pulse glow-red-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>RUNNING</span>
            {retryCount > 0 && <span className="ml-1 text-cyber-gold font-bold">({retryCount}/2)</span>}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-rose/15 text-cyber-rose border border-cyber-rose/40">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'needs_approval':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyber-gold/20 text-cyber-gold border border-cyber-gold/40 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>APPROVAL REQ</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="hud-card rounded-2xl p-5 mb-6 border border-cyber-border">
      {/* Simulation Warning Banner if applicable */}
      {isSimulationTask && (
        <div className="mb-4 px-3.5 py-2 rounded-xl bg-cyber-amber/10 border border-cyber-amber/40 flex items-center justify-between text-xs text-cyber-amber">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">
              SIMULATED FAULT INJECTION MODE: This mission intentionally simulates network timeout errors to verify auto-retries and failure recovery.
            </span>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090A10] text-cyber-red border border-cyber-red/40 font-bold">
              MISSION #{task.id.slice(-6)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {new Date(task.createdAt).toLocaleTimeString()}
            </span>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
              task.status === 'completed' ? 'bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/40' :
              task.status === 'failed' ? 'bg-cyber-rose/10 text-cyber-rose border-cyber-rose/40' :
              task.status === 'running' ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/40 animate-pulse' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {task.status}
            </span>
          </div>
          <h2 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
            {task.instruction}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {task.status === 'pending' && (
            <>
              <button
                onClick={() => onExecute(task.id)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyber-red text-white text-xs font-bold hover:bg-cyber-red/90 transition-all glow-red-sm active:scale-95 border border-cyber-red"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Mission</span>
              </button>
              <button
                onClick={() => onCancel(task.id)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#090A10] text-cyber-rose border border-cyber-rose/30 hover:bg-cyber-rose/10 text-xs font-medium transition-all"
                title="Cancel Mission"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {(task.status === 'running' || task.status === 'needs_approval') && (
            <button
              onClick={() => onCancel(task.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/50 hover:bg-cyber-rose/30 text-xs font-bold transition-all glow-rose active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Halt Mission</span>
            </button>
          )}

          {(task.status === 'completed' || task.status === 'failed') && (
            <button
              onClick={() => onRerun(task.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#131520] text-white border border-cyber-border hover:border-cyber-red/50 text-xs font-medium transition-all hover:bg-cyber-red/10 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyber-red" />
              <span>Rerun Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar with Iron Man Gradient */}
      <div className="py-3">
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-slate-400">
            Progress: {completedSteps} of {task.steps.length} steps verified
          </span>
          <span className="text-cyber-red font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#090A10] rounded-full overflow-hidden border border-cyber-border">
          <div 
            className="h-full bg-gradient-to-r from-cyber-red via-[#FF5500] to-cyber-gold transition-all duration-500 rounded-full glow-red-sm"
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
                  ? 'bg-[#151724] border-cyber-red shadow-sm glow-red-sm'
                  : 'bg-[#090A10]/80 border-cyber-border hover:border-cyber-red/40 hover:bg-[#0E1018]'
              }`}
            >
              {/* Step Info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${
                  isSelected 
                    ? 'bg-cyber-red text-white border-cyber-red'
                    : 'bg-[#131520] border-cyber-border text-cyber-red'
                }`}>
                  {step.stepNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                    <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#131520] text-slate-300 border border-cyber-border">
                      <ToolIcon className="w-3 h-3 text-cyber-red" />
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
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
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
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-cyber-red translate-x-0.5' : 'text-slate-600'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
