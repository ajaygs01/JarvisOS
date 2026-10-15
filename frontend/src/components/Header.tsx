import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Plus, Clock, Terminal, Shield, Zap } from 'lucide-react';
import type { NavView } from './Sidebar.js';

interface HeaderProps {
  currentView: NavView;
  onNewTask: () => void;
  engineStatus: 'idle' | 'planning' | 'executing' | 'recovering';
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNewTask,
  engineStatus,
  hasApiKey,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const titles: Record<NavView, string> = {
    dashboard: 'Command Center & Autonomous HUD',
    assistant: 'Personal AI Assistant & Planner',
    tasks: 'Live Multi-Step Orchestration',
    history: 'Verified Execution History & Audit Logs',
    integrations: 'Tool Suite & Provider Diagnostics',
    settings: 'Security, Models & Environment Configuration',
  };

  const statusConfig = {
    idle: { label: 'AGENT IDLE', color: 'bg-slate-800/50 text-slate-400 border-slate-700' },
    planning: { label: 'PLANNING TASK', color: 'bg-cyber-gold/20 text-cyber-gold border-cyber-gold/50 animate-pulse' },
    executing: { label: 'EXECUTING MISSION', color: 'bg-cyber-red/25 text-cyber-red border-cyber-red/60 animate-pulse glow-red-sm' },
    recovering: { label: 'AUTO-RECOVERING', color: 'bg-cyber-amber/25 text-cyber-amber border-cyber-amber/50 animate-pulse' },
  }[engineStatus];

  return (
    <header className="h-16 bg-[#07080D]/95 backdrop-blur-md border-b border-cyber-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Iron Man HUD Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-[#12131C] border border-cyber-border flex items-center justify-center glow-red-sm">
          <Zap className="w-4 h-4 text-cyber-red" />
        </div>
        <div>
          <h1 className="text-sm font-display font-bold text-white tracking-wider uppercase flex items-center gap-2">
            {titles[currentView] || 'JarvisOS'}
          </h1>
          <p className="text-[11px] text-cyber-textMuted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-red" />
            Autonomous multi-step orchestration • Iron Man Mark L Protocol
          </p>
        </div>
      </div>

      {/* Status, Model & Actions */}
      <div className="flex items-center space-x-3">
        {/* Clock */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-cyber-textMuted px-2.5 py-1 rounded-xl bg-[#0D0E15] border border-cyber-border font-mono">
          <Clock className="w-3.5 h-3.5 text-cyber-red" />
          <span>{time}</span>
        </div>

        {/* Engine Status Badge */}
        <div className={`px-3 py-1 rounded-full text-[11px] font-bold border tracking-wider flex items-center gap-1.5 ${statusConfig.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          {statusConfig.label}
        </div>

        {/* Gemini Model Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#131520] border border-cyber-border text-xs font-medium text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyber-gold" />
          <span className="font-mono text-xs">Gemini 3.8 Flash</span>
          {hasApiKey ? (
            <span className="w-2 h-2 rounded-full bg-cyber-emerald" title="API Key Connected" />
          ) : (
            <span className="text-[10px] text-cyber-amber bg-cyber-amber/10 px-1 rounded border border-cyber-amber/30">Native Heuristic</span>
          )}
        </div>

        {/* New Instruction Action */}
        <button
          onClick={onNewTask}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyber-red text-white font-bold text-xs hover:bg-cyber-red/90 transition-all glow-red active:scale-95 border border-cyber-red"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Mission</span>
        </button>
      </div>
    </header>
  );
};
