import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Plus, Clock, Terminal } from 'lucide-react';
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
    idle: { label: 'AGENT IDLE', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    planning: { label: 'PLANNING TASK', color: 'bg-cyber-violet/20 text-cyber-violet border-cyber-violet/40 animate-pulse' },
    executing: { label: 'EXECUTING STEPS', color: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40 animate-pulse' },
    recovering: { label: 'AUTO-RECOVERING', color: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber/40 animate-pulse' },
  }[engineStatus];

  return (
    <header className="h-16 bg-[#070B19]/90 backdrop-blur-md border-b border-[#1E293B] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-[#0B132B] border border-[#1E293B]">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="text-sm font-display font-semibold text-white tracking-wide uppercase">
            {titles[currentView] || 'JarvisOS'}
          </h1>
          <p className="text-[11px] text-cyber-textMuted">
            Autonomous multi-step planning, verification & recovery
          </p>
        </div>
      </div>

      {/* Status, Model & Actions */}
      <div className="flex items-center space-x-3">
        {/* Clock */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-cyber-textMuted px-2.5 py-1 rounded-lg bg-[#0B132B] border border-[#1E293B] font-mono">
          <Clock className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>{time}</span>
        </div>

        {/* Engine Status Badge */}
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wider flex items-center gap-1.5 ${statusConfig.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          {statusConfig.label}
        </div>

        {/* Model Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#0F1A36] border border-cyber-cyan/30 text-xs font-medium text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Gemini 2.5 Flash</span>
          {hasApiKey ? (
            <span className="w-2 h-2 rounded-full bg-cyber-emerald" title="API Key Connected" />
          ) : (
            <span className="text-[10px] text-cyber-amber bg-cyber-amber/10 px-1 rounded border border-cyber-amber/30">Native Mode</span>
          )}
        </div>

        {/* New Instruction Action */}
        <button
          onClick={onNewTask}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyber-cyan text-black font-semibold text-xs hover:bg-cyber-cyan/90 transition-all glow-cyan-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
};
