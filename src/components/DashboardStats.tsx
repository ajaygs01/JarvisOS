import React from 'react';
import { CheckCircle2, XCircle, Activity, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';
import type { SystemStats } from '../types/agent.js';

interface DashboardStatsProps {
  stats: SystemStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'TOTAL TASKS',
      value: stats.totalTasks,
      subtext: `${stats.runningTasks} currently active`,
      icon: Activity,
      color: 'text-cyber-cyan',
      borderColor: 'hover:border-cyber-cyan/40',
      glow: 'glow-cyan-sm',
    },
    {
      title: 'COMPLETED & VERIFIED',
      value: stats.completedTasks,
      subtext: 'Passed 100% verification',
      icon: CheckCircle2,
      color: 'text-cyber-emerald',
      borderColor: 'hover:border-cyber-emerald/40',
      glow: 'glow-emerald',
    },
    {
      title: 'FAILED / RECOVERED',
      value: stats.failedTasks,
      subtext: 'Auto-retries recorded',
      icon: XCircle,
      color: 'text-cyber-rose',
      borderColor: 'hover:border-cyber-rose/40',
      glow: 'glow-rose',
    },
    {
      title: 'SUCCESS RATE',
      value: `${stats.successRate}%`,
      subtext: 'Autonomous outcome reliability',
      icon: TrendingUp,
      color: 'text-cyber-violet',
      borderColor: 'hover:border-cyber-violet/40',
      glow: 'glow-violet',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`hud-card rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono tracking-wider text-cyber-textMuted uppercase font-semibold">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-[#050814] border border-[#1E293B] ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl lg:text-3xl font-display font-bold text-white tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-cyber-textMuted border-t border-[#1E293B]/60 pt-2">
              <span>{card.subtext}</span>
              <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
