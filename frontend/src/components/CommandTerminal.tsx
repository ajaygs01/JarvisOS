import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  ListOrdered, 
  FileText,
  Loader2,
  ShieldAlert,
  Play,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { 
  isSpeechRecognitionSupported, 
  createVoiceListener, 
  speakJarvisResponse 
} from '../services/voice.js';

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
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const voiceListenerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const hasSpeechSupport = isSpeechRecognitionSupported();

  // Initialize voice listener
  useEffect(() => {
    voiceListenerRef.current = createVoiceListener({
      onResult: (transcript, isFinal) => {
        setInput(transcript);
        setVoiceError(null);
      },
      onError: (err) => {
        setVoiceError(err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    return () => {
      if (voiceListenerRef.current) {
        voiceListenerRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      voiceListenerRef.current?.stop();
      setIsListening(false);
    } else {
      setVoiceError(null);
      voiceListenerRef.current?.start();
      setIsListening(true);
      speakJarvisResponse('Listening, sir.', voiceFeedbackEnabled);
    }
  };

  const suggestions = [
    {
      title: 'Mission 1: Frontier AI Organizations & Flagship Products',
      description: 'Autonomous research on OpenAI, Anthropic, and DeepMind with live web search, comparison table & verified disk report.',
      icon: Search,
      tag: 'LIVE AUTONOMOUS MISSION',
      badgeColor: 'border-cyber-red/50 text-cyber-red bg-cyber-red/10',
      instruction: 'Research three AI companies (OpenAI, Anthropic, Google DeepMind), compare their flagship products, and generate a verified markdown report.',
      isSimulation: false,
    },
    {
      title: 'Mission 2A: Self-Healing Auto-Retry & Recovery Test',
      description: 'Controlled simulation triggering HTTP 504 gateway timeouts on attempts 1-2, exercising 1.5s backoff, and verifying recovery on attempt 3.',
      icon: AlertTriangle,
      tag: 'SIMULATION FAULT TEST',
      badgeColor: 'border-cyber-amber/50 text-cyber-amber bg-cyber-amber/10',
      instruction: 'Test failure recovery: execute controlled failure simulation, capture transient timeouts, perform auto-retries, and verify self-healing recovery.',
      isSimulation: true,
    },
    {
      title: 'Mission 2B: Permanent Error Resilience & Honest Reporting',
      description: 'Simulates fatal disruption, exhausts maximum 2 retries, honestly reports FAILED status, and halts dependent steps.',
      icon: ShieldAlert,
      tag: 'UNRECOVERABLE FAULT SIMULATION',
      badgeColor: 'border-cyber-rose/50 text-cyber-rose bg-cyber-rose/10',
      instruction: 'Test permanent failure: execute unrecoverable error test, demonstrate retry exhaustion, and verify honest FAILED reporting.',
      isSimulation: true,
    },
    {
      title: 'Mission 3: Document Intelligence & Synthesis',
      description: 'Upload local documents (.txt, .md, .json, .csv) for text extraction, key metrics extraction, and AI executive summary.',
      icon: FileText,
      tag: 'DOC ANALYZER',
      badgeColor: 'border-cyber-gold/50 text-cyber-gold bg-cyber-gold/10',
      action: onOpenDocModal,
      instruction: '',
      isSimulation: false,
    },
  ];

  const handleExecute = (immediate: boolean) => {
    if (!input.trim() || isPlanning) return;
    const command = input.trim();
    if (voiceFeedbackEnabled) {
      speakJarvisResponse(immediate ? 'Executing mission parameters, sir.' : 'Synthesizing plan, sir.', true);
    }
    onSubmit(command, immediate);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecute(true);
    }
  };

  return (
    <div className="hud-card rounded-2xl p-5 mb-6 border border-cyber-border shadow-card-dark relative overflow-hidden">
      {/* Top Iron Man HUD Laser Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-red to-transparent opacity-80" />

      {/* Terminal Title & Voice Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-pulse glow-red" />
          <span className="font-display font-bold text-sm text-white tracking-wider uppercase flex items-center gap-2">
            JARVIS AUTONOMOUS COMMAND TERMINAL
          </span>
          <span className="text-[10px] font-mono text-cyber-gold bg-cyber-gold/10 border border-cyber-gold/30 px-2 py-0.5 rounded tracking-widest hidden sm:inline">
            MARK L HUD
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Audio Feedback Toggle */}
          <button
            type="button"
            onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
            className={`flex items-center space-x-1 text-[11px] font-mono px-2 py-1 rounded-lg border transition-all ${
              voiceFeedbackEnabled
                ? 'border-cyber-gold/40 text-cyber-gold bg-cyber-gold/5'
                : 'border-slate-800 text-slate-500 bg-black/40'
            }`}
            title={voiceFeedbackEnabled ? 'Voice feedback is ON' : 'Voice feedback is MUTED'}
          >
            {voiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{voiceFeedbackEnabled ? 'VOICE ON' : 'MUTED'}</span>
          </button>

          <span className="text-[11px] font-mono text-cyber-textMuted hidden lg:inline">
            Press <kbd className="px-1.5 py-0.5 bg-[#070709] border border-cyber-border rounded text-[10px] text-cyber-red font-bold">Ctrl + Enter</kbd> to launch
          </span>
        </div>
      </div>

      {/* Listening Banner */}
      {isListening && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-cyber-red/10 border border-cyber-red/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyber-red animate-spin" />
            <span className="text-xs font-semibold text-cyber-red tracking-wide">
              JARVIS is listening... Speak your command clearly.
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] font-mono text-white/80 hover:text-white underline cursor-pointer"
          >
            Stop Listening
          </button>
        </div>
      )}

      {/* Voice Error Banner */}
      {voiceError && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-between text-xs text-cyber-rose">
          <span>{voiceError}</span>
          <button
            type="button"
            onClick={() => setVoiceError(null)}
            className="text-[10px] uppercase font-mono underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Command Input Box */}
      <div className="relative">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPlanning}
          placeholder={
            isListening 
              ? 'Listening to your voice... (Transcript will appear here automatically)' 
              : 'Enter natural language command or speak into the microphone (e.g. "Research OpenAI, Anthropic and Google DeepMind and write report")...'
          }
          className="w-full bg-[#08090E] border border-cyber-border focus:border-cyber-red rounded-xl p-3.5 pb-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyber-red transition-all resize-none font-sans"
        />

        {/* Action Controls & Mic Button */}
        <div className="absolute right-3 bottom-3 flex items-center space-x-2.5">
          {/* Voice Microphone Control */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isPlanning}
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
              isListening
                ? 'bg-cyber-red text-white border-cyber-red glow-red-lg animate-pulse'
                : hasSpeechSupport
                ? 'bg-[#14151F] border-cyber-border text-slate-300 hover:text-cyber-red hover:border-cyber-red/50 hover:bg-cyber-red/10'
                : 'bg-black/30 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title={
              !hasSpeechSupport
                ? 'Speech recognition unavailable in this browser. Please use keyboard input.'
                : isListening
                ? 'Click to stop listening'
                : 'Click to activate voice input (Speak to Jarvis)'
            }
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Plan Only Button */}
          <button
            type="button"
            onClick={() => handleExecute(false)}
            disabled={!input.trim() || isPlanning}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
              !input.trim() || isPlanning
                ? 'bg-[#131520]/50 border-transparent text-slate-600 cursor-not-allowed'
                : 'bg-[#171926] border-cyber-gold/40 text-cyber-gold hover:border-cyber-gold hover:bg-cyber-gold/10 active:scale-95'
            }`}
            title="Generate plan and review steps before execution"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Plan Task</span>
          </button>

          {/* Execute Mission Button */}
          <button
            type="button"
            onClick={() => handleExecute(true)}
            disabled={!input.trim() || isPlanning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              !input.trim() || isPlanning
                ? 'bg-[#171926] text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-cyber-red text-white hover:bg-cyber-red/90 glow-red border border-cyber-red active:scale-95'
            }`}
          >
            {isPlanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
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

      {/* Presets and Scenarios */}
      <div className="mt-4 pt-3 border-t border-cyber-border">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono text-cyber-textMuted uppercase tracking-wider block">
            Stark Protocol Presets (Click to Load & Execute):
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Real Tools • Zero Hallucinations • Multi-Step DAG
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {suggestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isPlanning) return;
                  if (s.action) {
                    s.action();
                  } else if (s.instruction) {
                    onSubmit(s.instruction, true);
                  }
                }}
                disabled={isPlanning}
                className={`text-left p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group bg-[#0A0B10] hover:bg-[#10121A] ${
                  s.isSimulation 
                    ? 'border-cyber-amber/40 hover:border-cyber-amber' 
                    : 'border-cyber-border hover:border-cyber-red/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border ${s.badgeColor}`}>
                    {s.tag}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyber-red transition-colors" />
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
