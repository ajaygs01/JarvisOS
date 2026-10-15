import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  ListTodo, 
  FileCode2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Key,
  Zap
} from 'lucide-react';
import { testTool } from '../services/api.js';
import type { ToolName, ToolTestResult } from '../types/agent.js';

interface IntegrationsViewProps {
  hasGeminiKey: boolean;
  onOpenSettings: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  hasGeminiKey,
  onOpenSettings,
}) => {
  const [testingTool, setTestingTool] = useState<ToolName | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ToolTestResult>>({});

  const toolsList: Array<{
    name: ToolName;
    title: string;
    description: string;
    provider: string;
    status: 'ACTIVE' | 'CONFIG_REQUIRED';
    icon: any;
    sampleParams: any;
  }> = [
    {
      name: 'web_search',
      title: 'Web Research Engine',
      description: 'Live internet search engine supporting Wikipedia Full-Text API, OpenSearch API, and DuckDuckGo for zero-hallucination web facts and source URLs.',
      provider: 'Multi-Provider (Wikipedia & DuckDuckGo)',
      status: 'ACTIVE',
      icon: Search,
      sampleParams: { query: 'Artificial Intelligence quantum computing', maxResults: 3 },
    },
    {
      name: 'generate_report',
      title: 'Report Generator & Storage Engine',
      description: 'Produces structured Markdown reports with comparison tables, verifies file existence and bytes on disk, and generates download URLs.',
      provider: 'JarvisOS File System & MongoDB Storage',
      status: 'ACTIVE',
      icon: FileText,
      sampleParams: {
        title: 'Diagnostic Test Report',
        introduction: 'Testing the autonomous file generation and verification subsystem.',
        sections: [{ heading: 'Diagnostics', content: 'Verification checks passed.' }],
      },
    },
    {
      name: 'task_manager',
      title: 'Task Manager & State Synchronizer',
      description: 'Creates, reads, updates, and completes persistent tasks in the data store with read-back verification.',
      provider: 'MongoDB Atlas & Local JSON Store',
      status: 'ACTIVE',
      icon: ListTodo,
      sampleParams: { action: 'list' },
    },
    {
      name: 'document_analyzer',
      title: 'Document Intelligence & Summarizer',
      description: 'Extracts accessible text from uploaded documents and produces executive summaries and key findings.',
      provider: hasGeminiKey ? 'Gemini 3.8 Flash' : 'Native Text Intelligence Engine',
      status: 'ACTIVE',
      icon: FileCode2,
      sampleParams: {
        fileName: 'sample_audit.txt',
        content: 'JarvisOS is an autonomous agent architecture built for the CHAOS hackathon. It features multi-step planning, real tool dispatch, independent outcome verification, and transient error recovery.',
      },
    },
    {
      name: 'failure_test',
      title: 'Controlled Failure Simulator',
      description: 'Controlled simulator that induces HTTP 504 gateway timeouts to prove autonomous failure detection, logging, and self-healing auto-retry.',
      provider: 'CHAOS Resilience Subsystem',
      status: 'ACTIVE',
      icon: AlertTriangle,
      sampleParams: { mode: 'transient_recovery', attemptNumber: 2 },
    },
  ];

  const handleTest = async (tool: ToolName, params: any) => {
    setTestingTool(tool);
    try {
      const result = await testTool(tool, params);
      setTestResults(prev => ({ ...prev, [tool]: result }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setTestingTool(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-card rounded-2xl p-5 border border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-red font-bold block mb-1">
            STARK PROTOCOL • TOOL ECOSYSTEM
          </span>
          <h2 className="text-lg font-display font-bold text-white">
            JarvisOS Tool Integrations & Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real, functioning tools with live verification checks. Run live tests to verify each integration.
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#131520] border border-cyber-border hover:border-cyber-red/50 text-white text-xs font-semibold transition-all self-start sm:self-auto hover:bg-cyber-red/10"
        >
          <Key className="w-3.5 h-3.5 text-cyber-gold" />
          <span>Configure API Keys</span>
        </button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {toolsList.map((tool) => {
          const Icon = tool.icon;
          const isTesting = testingTool === tool.name;
          const testResult = testResults[tool.name];

          return (
            <div
              key={tool.name}
              className="hud-card rounded-2xl p-5 border border-cyber-border hover:border-cyber-red/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-[#090A10] border border-cyber-border text-cyber-red glow-red-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {tool.title}
                      </h3>
                      <span className="text-[10px] font-mono text-cyber-gold">
                        {tool.provider}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40 font-bold">
                    {tool.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {tool.description}
                </p>
              </div>

              {/* Diagnostic Test Section */}
              <div className="border-t border-cyber-border/70 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Diagnostic Test:
                  </span>
                  <button
                    onClick={() => handleTest(tool.name, tool.sampleParams)}
                    disabled={isTesting}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-red text-white text-xs font-bold hover:bg-cyber-red/90 transition-all glow-red-sm active:scale-95 disabled:opacity-50 border border-cyber-red"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Output Card */}
                {testResult && (() => {
                  const isVerified = testResult.verification?.verified ?? testResult.success;
                  const message = testResult.verification?.actualOutcome ?? testResult.error ?? (typeof testResult.output === 'string' ? testResult.output : JSON.stringify(testResult.output ?? 'Operation complete'));
                  return (
                    <div className={`mt-3 p-3 rounded-xl border text-xs font-mono ${
                      isVerified
                        ? 'bg-cyber-emerald/10 border-cyber-emerald/40 text-cyber-emerald'
                        : 'bg-cyber-rose/10 border-cyber-rose/40 text-cyber-rose'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {isVerified ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {isVerified ? 'PASSED & VERIFIED' : 'TEST FAILED'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {testResult.durationMs ?? 0}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 truncate">
                        {message}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
