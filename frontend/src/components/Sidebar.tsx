import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  ListTodo, 
  History, 
  Cpu, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export type NavView = 'dashboard' | 'assistant' | 'tasks' | 'history' | 'integrations' | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTaskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  activeTaskCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant' as NavView, label: 'AI Assistant', icon: Bot },
    { 
      id: 'tasks' as NavView, 
      label: 'Active Missions', 
      icon: ListTodo,
      badge: activeTaskCount > 0 ? activeTaskCount : undefined,
    },
    { id: 'history' as NavView, label: 'Audit History', icon: History },
    { id: 'integrations' as NavView, label: 'Tool Protocol', icon: Cpu },
    { id: 'settings' as NavView, label: 'Settings & Keys', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-[#07080D] border-r border-cyber-border z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyber-border">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-red to-[#99001A] flex items-center justify-center flex-shrink-0 glow-red border border-cyber-red">
            <Zap className="w-5 h-5 text-white font-bold" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
                JARVIS<span className="text-cyber-red text-sm font-mono font-bold">OS</span>
              </span>
              <span className="text-[10px] text-cyber-gold tracking-widest uppercase font-mono">
                Stark Intelligence
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyber-red hover:bg-[#131520] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-red/20 via-cyber-red/10 to-transparent text-white border-l-2 border-cyber-red shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#131520]/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-cyber-red' : 'text-slate-400 group-hover:text-cyber-red'
                }`} 
              />
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              {item.badge !== undefined && (
                <span 
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    collapsed 
                      ? 'absolute top-2 right-2 w-2 h-2 p-0 bg-cyber-red animate-pulse'
                      : 'bg-cyber-red/25 text-cyber-red border border-cyber-red/50 animate-pulse'
                  }`}
                >
                  {!collapsed && item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security & System Info Footer */}
      <div className="p-4 border-t border-cyber-border bg-[#050508]/80">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-pulse flex-shrink-0 glow-red-sm" />
          {!collapsed && (
            <div className="flex flex-col text-xs truncate">
              <span className="text-white font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyber-red" /> Arc Reactor Online
              </span>
              <span className="text-slate-400 text-[10px] font-mono">Independent Verifier Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
