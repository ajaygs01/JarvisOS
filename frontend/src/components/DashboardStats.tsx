import React from 'react';
import { CheckCircle2, XCircle, Activity, TrendingUp, Zap, ShieldAlert } from 'lucide-react';
import type { SystemStats } from '../types/agent.js';

interface DashboardStatsProps {
  stats: SystemStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'TOTAL MISSIONS',
      value: stats.totalTasks,
      subtext: `${stats.runningTasks} active in pipeline`,
      icon: Activity,
      color: 'text-cyber-red',
      borderColor: 'hover:border-cyber-red/50',
      glow: 'glow-red-sm',
    },
    {
      title: 'VERIFIED SUCCESS',
      value: stats.completedTasks,
      subtext: 'Passed independent verification',
      icon: CheckCircle2,
      color: 'text-cyber-emerald',
      borderColor: 'hover:border-cyber-emerald/50',
      glow: 'glow-emerald',
    },
    {
      title: 'FAILURES / SIMULATIONS',
      value: stats.failedTasks,
      subtext: 'Auto-retries recorded',
      icon: XCircle,
      color: 'text-cyber-rose',
      borderColor: 'hover:border-cyber-rose/50',
      glow: 'glow-rose',
    },
    {
      title: 'RELIABILITY RATE',
      value: `${stats.successRate}%`,
      subtext: 'Autonomous outcome fidelity',
      icon: TrendingUp,
      color: 'text-cyber-gold',
      borderColor: 'hover:border-cyber-gold/50',
      glow: 'glow-gold',
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
              <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-[#090A10] border border-cyber-border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl lg:text-3xl font-display font-bold text-white tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-cyber-border/70 pt-2 font-mono">
              <span>{card.subtext}</span>
              <span className="text-[10px] text-cyber-red font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
