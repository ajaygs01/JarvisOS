import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  FileDown, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Code
} from 'lucide-react';
import type { AgentTask, TaskStep } from '../types/agent.js';

interface TaskDetailsPanelProps {
  task: AgentTask | null;
  selectedStepId?: string;
}

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  task,
  selectedStepId,
}) => {
  const [tab, setTab] = useState<'logs' | 'verification' | 'output'>('logs');
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const selectedStep = task.steps.find(s => s.id === selectedStepId) || task.steps[0];

  const handleCopyLogs = () => {
    const text = task.logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hud-card rounded-2xl border border-[#1E293B] overflow-hidden mb-6">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3 bg-[#050814]/60">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              tab === 'logs'
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 glow-cyan-sm'
                : 'text-cyber-textMuted hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Logs ({task.logs.length})</span>
          </button>

          <button
            onClick={() => setTab('verification')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              tab === 'verification'
                ? 'bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40 glow-emerald'
                : 'text-cyber-textMuted hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Inspector</span>
          </button>

          <button
            onClick={() => setTab('output')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              tab === 'output'
                ? 'bg-cyber-violet/15 text-cyber-violet border border-cyber-violet/40 glow-violet'
                : 'text-cyber-textMuted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Artifacts & Reports</span>
          </button>
        </div>

        {tab === 'logs' && (
          <button
            onClick={handleCopyLogs}
            className="flex items-center space-x-1 text-xs text-cyber-textMuted hover:text-cyber-cyan transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 bg-[#050814]/40 min-h-[220px] max-h-[360px] overflow-y-auto font-mono text-xs">
        {/* TAB 1: Terminal Logs */}
        {tab === 'logs' && (
          <div className="space-y-2">
            {task.logs.map((log) => {
              const color = {
                info: 'text-cyber-textBright',
                warn: 'text-cyber-amber',
                error: 'text-cyber-rose font-semibold',
                success: 'text-cyber-emerald font-semibold',
              }[log.level];

              return (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-600 select-none flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`uppercase text-[10px] px-1 rounded flex-shrink-0 font-bold ${
                    log.level === 'error' ? 'bg-cyber-rose/20 text-cyber-rose' :
                    log.level === 'warn' ? 'bg-cyber-amber/20 text-cyber-amber' :
                    log.level === 'success' ? 'bg-cyber-emerald/20 text-cyber-emerald' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className={`break-words ${color}`}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Verification Inspector */}
        {tab === 'verification' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#0B132B] border border-[#1E293B]">
              <span className="text-[10px] text-cyber-cyan font-bold uppercase tracking-wider block mb-1">
                Selected Step: #{selectedStep?.stepNumber} — {selectedStep?.description}
              </span>
              {selectedStep?.verification ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-cyber-textMuted">Status:</span>
                    <span className={`font-bold ${selectedStep.verification.verified ? 'text-cyber-emerald' : 'text-cyber-rose'}`}>
                      {selectedStep.verification.verified ? 'VERIFIED PASSED' : 'VERIFICATION FAILED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-textMuted block">Check Type:</span>
                    <span className="text-white font-mono">{selectedStep.verification.checkType}</span>
                  </div>
                  <div>
                    <span className="text-cyber-textMuted block">Expected Criteria:</span>
                    <span className="text-white">{selectedStep.verification.expectedCriteria}</span>
                  </div>
                  <div>
                    <span className="text-cyber-textMuted block">Actual Outcome:</span>
                    <span className="text-cyber-cyan">{selectedStep.verification.actualOutcome}</span>
                  </div>
                  <div>
                    <span className="text-cyber-textMuted block">Details:</span>
                    <span className="text-slate-400">{selectedStep.verification.details}</span>
                  </div>
                </div>
              ) : (
                <p className="text-cyber-textMuted">
                  Verification check not yet executed for this step (Status: {selectedStep?.status}).
                </p>
              )}
            </div>

            {/* Overall Task Verification */}
            {task.overallVerification && (
              <div className="p-3 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/30">
                <div className="flex items-center space-x-2 text-cyber-emerald font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Overall Mission Verification: PASSED</span>
                </div>
                <p className="text-white text-xs">{task.overallVerification.actualOutcome}</p>
                <p className="text-slate-400 text-[11px] mt-1">{task.overallVerification.details}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Artifacts & Reports */}
        {tab === 'output' && (
          <div className="space-y-4">
            {task.downloadUrl ? (
              <div className="p-4 rounded-xl bg-[#0B132B] border border-cyber-cyan/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <FileDown className="w-4 h-4 text-cyber-cyan" />
                    <span>Downloadable Intelligence Report Ready</span>
                  </span>
                  <a
                    href={task.downloadUrl}
                    download
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyber-cyan text-black font-semibold text-xs hover:bg-cyber-cyan/90 transition-all glow-cyan-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Markdown</span>
                  </a>
                </div>
                <p className="text-xs text-cyber-textMuted">
                  Report verified and stored on local disk at: <code className="text-cyber-cyan">{task.finalReportPath}</code>
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-cyber-textMuted">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No downloadable report artifact generated yet.</p>
              </div>
            )}

            {/* Selected Step Raw Output */}
            {selectedStep?.output && (
              <div className="mt-3">
                <span className="text-[10px] text-cyber-textMuted uppercase font-bold block mb-1">
                  Step #{selectedStep.stepNumber} Raw Output Payload:
                </span>
                <pre className="p-3 rounded-lg bg-[#050814] border border-[#1E293B] text-[11px] text-cyber-cyan overflow-x-auto max-h-48">
                  {JSON.stringify(selectedStep.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
