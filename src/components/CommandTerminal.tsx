import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Search, 
  FileCheck2, 
  AlertTriangle, 
  ListOrdered, 
  FileText,
  CornerDownLeft,
  Loader2,
  FileCode2,
  ShieldAlert,
  Play
} from 'lucide-react';

interface CommandTerminalProps {
  onSubmit: (instruction: string, immediateExecute: boolean) => void;
  isPlanning: boolean;
  onOpenDocModal: () => void;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  onSubmit,
  isPlanning,
  onOpenDocModal,
}) => {
  const [input, setInput] = useState('');

  const suggestions = [
    {
      title: 'Demo 1: AI Companies Research & Comparison Report',
      description: 'Research OpenAI, Anthropic, Google DeepMind, build comparison table, and generate downloadable report.',
      icon: Search,
      tag: 'PRIMARY DEMO',
      color: 'border-cyber-cyan/40 text-cyber-cyan bg-cyber-cyan/5',
      instruction: 'Research three AI companies (OpenAI, Anthropic, Google DeepMind), compare their flagship products, and generate a verified markdown report.',
    },
    {
      title: 'Demo 2A: Transient Failure & Self-Healing Recovery',
      description: 'Simulates HTTP 504 timeouts on attempts 1-2, exercises auto-retry with backoff, and verifies recovery on attempt 3.',
      icon: AlertTriangle,
      tag: 'SELF-HEALING',
      color: 'border-cyber-amber/40 text-cyber-amber bg-cyber-amber/5',
      instruction: 'Test failure recovery: execute controlled failure simulation, capture transient timeouts, perform auto-retries, and verify self-healing recovery.',
    },
    {
      title: 'Demo 2B: Unrecoverable Failure Test (Honest Reporting)',
      description: 'Simulates permanent failure, attempts 2 retries, honestly reports FAILED status, and halts dependent steps.',
      icon: ShieldAlert,
      tag: 'FAILURE TEST',
      color: 'border-cyber-rose/40 text-cyber-rose bg-cyber-rose/5',
      instruction: 'Test permanent failure: execute unrecoverable error test, demonstrate retry exhaustion, and verify honest FAILED reporting.',
    },
    {
      title: 'Doc Analysis & Executive Summary',
      description: 'Upload or paste document text, extract accessible structure, and generate AI synthesis.',
      icon: FileText,
      tag: 'DOC ANALYZER',
      color: 'border-cyber-emerald/40 text-cyber-emerald bg-cyber-emerald/5',
      action: onOpenDocModal,
      instruction: '',
    },
  ];

  const handleExecute = (immediate: boolean) => {
    if (!input.trim() || isPlanning) return;
    onSubmit(input.trim(), immediate);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecute(true);
    }
  };

  return (
    <div className="hud-card rounded-2xl p-5 mb-6 border border-[#1E293B] shadow-card-dark relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />

      {/* Terminal Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyber-cyan" />
          <span className="font-display font-semibold text-sm text-white tracking-wide">
            AUTONOMOUS AGENT COMMAND TERMINAL
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyber-textMuted hidden sm:inline">
          Use <kbd className="px-1.5 py-0.5 bg-[#050814] border border-[#1E293B] rounded text-[10px] text-cyber-cyan">Plan Task</kbd> to inspect steps before execution
        </span>
      </div>

      {/* Multiline Input Form */}
      <div className="relative">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPlanning}
          placeholder="Enter natural-language instruction (e.g. 'Research three AI companies and generate a comparison report', or click a preset card below)..."
          className="w-full bg-[#050814] border border-[#1E293B] focus:border-cyber-cyan rounded-xl p-3.5 pb-14 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:ring-1 focus:ring-cyber-cyan transition-all resize-none font-sans"
        />

        {/* Action Controls */}
        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          {/* Plan Only (Review in Dashboard Before Execution) */}
          <button
            type="button"
            onClick={() => handleExecute(false)}
            disabled={!input.trim() || isPlanning}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
              !input.trim() || isPlanning
                ? 'bg-[#1E293B]/50 border-transparent text-slate-600 cursor-not-allowed'
                : 'bg-[#0B132B] border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan active:scale-95'
            }`}
            title="Generate plan and review steps in dashboard before starting execution"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Plan Task</span>
          </button>

          {/* Plan & Execute Immediately */}
          <button
            type="button"
            onClick={() => handleExecute(true)}
            disabled={!input.trim() || isPlanning}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              !input.trim() || isPlanning
                ? 'bg-[#1E293B] text-cyber-textMuted cursor-not-allowed'
                : 'bg-cyber-cyan text-black hover:bg-cyber-cyan/90 glow-cyan active:scale-95'
            }`}
          >
            {isPlanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Planning...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Mission</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Scenarios */}
      <div className="mt-4 pt-3 border-t border-[#1E293B]/70">
        <span className="text-[11px] font-mono text-cyber-textMuted uppercase tracking-wider block mb-2.5">
          Preset Mission Scenarios (Click to Run):
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {suggestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (s.action) {
                    s.action();
                  } else if (s.instruction) {
                    onSubmit(s.instruction, true);
                  }
                }}
                disabled={isPlanning}
                className={`text-left p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group ${s.color}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#050814]/80 border border-current">
                    {s.tag}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-current opacity-80 group-hover:opacity-100" />
                </div>
                <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                  {s.title}
                </h4>
                <p className="text-[10px] text-cyber-textMuted line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
