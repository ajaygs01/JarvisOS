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
      label: 'Active Tasks', 
      icon: ListTodo,
      badge: activeTaskCount > 0 ? activeTaskCount : undefined,
    },
    { id: 'history' as NavView, label: 'Task History', icon: History },
    { id: 'integrations' as NavView, label: 'Integrations & Tools', icon: Cpu },
    { id: 'settings' as NavView, label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-[#070B19] border-r border-[#1E293B] z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-violet flex items-center justify-center flex-shrink-0 glow-cyan-sm">
            <Zap className="w-5 h-5 text-black font-bold" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
                JARVIS<span className="text-cyber-cyan text-sm">OS</span>
              </span>
              <span className="text-[10px] text-cyber-textMuted tracking-widest uppercase">
                Autonomous Agent
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-cyber-textMuted hover:text-cyber-cyan hover:bg-[#0B132B] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-cyan/15 to-transparent text-cyber-cyan border-l-2 border-cyber-cyan'
                  : 'text-cyber-textMuted hover:text-white hover:bg-[#0B132B]/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-cyber-cyan' : 'text-cyber-textMuted group-hover:text-white'
                }`} 
              />
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              {item.badge !== undefined && (
                <span 
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    collapsed 
                      ? 'absolute top-2 right-2 w-2 h-2 p-0 bg-cyber-cyan animate-pulse'
                      : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 animate-pulse'
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
      <div className="p-4 border-t border-[#1E293B] bg-[#050814]/50">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col text-xs truncate">
              <span className="text-white font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" /> Core Online
              </span>
              <span className="text-cyber-textMuted text-[10px]">Verification Shield Active</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
