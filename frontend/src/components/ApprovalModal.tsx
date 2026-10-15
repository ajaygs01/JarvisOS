import React from 'react';
import { ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import type { ApprovalRequest } from '../types/agent.js';

interface ApprovalModalProps {
  request?: ApprovalRequest;
  onResolve: (approved: boolean) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  onResolve,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="hud-card rounded-2xl max-w-lg w-full p-6 border-2 border-cyber-amber shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-amber/10 rounded-full blur-2xl" />

        <div className="flex items-start space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-cyber-amber/20 border border-cyber-amber/40 text-cyber-amber">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-amber font-bold">
              Human-In-The-Loop Authorization Required
            </span>
            <h3 className="text-base font-display font-bold text-white mt-0.5">
              Confirm Consequential Action
            </h3>
          </div>
        </div>

        <p className="text-xs text-cyber-textBright mb-3 leading-relaxed">
          JarvisOS has paused autonomous execution before executing a consequential or destructive action:
        </p>

        <div className="p-3.5 rounded-xl bg-[#050814] border border-[#1E293B] mb-4 space-y-2 text-xs font-mono">
          <div>
            <span className="text-cyber-textMuted">Action Description:</span>
            <p className="text-white font-medium">{request.actionDescription}</p>
          </div>
          <div>
            <span className="text-cyber-textMuted">Target Tool:</span>
            <span className="text-cyber-cyan ml-1.5">{request.tool}</span>
          </div>
          <div>
            <span className="text-cyber-textMuted">Impact Warning:</span>
            <p className="text-cyber-amber mt-0.5">{request.consequences}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={() => onResolve(false)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#050814] border border-[#1E293B] text-cyber-textMuted hover:text-white hover:border-cyber-rose/50 text-xs font-medium transition-all"
          >
            <X className="w-4 h-4 text-cyber-rose" />
            <span>Reject Action</span>
          </button>

          <button
            onClick={() => onResolve(true)}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyber-amber text-black text-xs font-bold hover:bg-cyber-amber/90 transition-all glow-amber shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Authorize & Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
};
