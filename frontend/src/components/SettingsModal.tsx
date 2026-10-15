import React, { useState } from 'react';
import { Key, ShieldCheck, X, Check, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { updateApiKey } from '../services/api.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasKey: boolean;
  onKeyUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  hasKey,
  onKeyUpdated,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      await updateApiKey(keyInput.trim());
      setStatusMessage('Gemini API key successfully saved to server environment!');
      setKeyInput('');
      onKeyUpdated();
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="hud-card rounded-2xl max-w-md w-full p-6 border border-cyber-cyan/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-cyber-textMuted hover:text-white hover:bg-[#050814]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#050814] border border-cyber-cyan/40 text-cyber-cyan glow-cyan-sm">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white">
              AI Model & API Key Settings
            </h3>
            <span className="text-xs text-cyber-textMuted font-mono">
              Server-Side Secret Management
            </span>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-[#050814] border border-[#1E293B] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-cyber-textMuted">Gemini Status:</span>
            <span className={`font-mono font-bold ${hasKey ? 'text-cyber-emerald' : 'text-cyber-amber'}`}>
              {hasKey ? 'ACTIVE (Server Configured)' : 'NATIVE FALLBACK ACTIVE'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyber-textBright mb-1.5">
              Google AI Studio (Gemini) API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#050814] border border-[#1E293B] focus:border-cyber-cyan rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyber-cyan font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-cyber-textMuted hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 text-[11px] text-cyber-textMuted leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan inline mr-1" />
            Your API key is transmitted securely to the local server runtime and stored in memory/environment. It is never logged or exposed in client bundles.
          </div>

          {statusMessage && (
            <p className="text-xs font-mono text-center text-cyber-cyan">
              {statusMessage}
            </p>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#050814] border border-[#1E293B] text-xs text-cyber-textMuted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!keyInput.trim() || saving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyber-cyan text-black font-semibold text-xs hover:bg-cyber-cyan/90 disabled:opacity-50 glow-cyan-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
