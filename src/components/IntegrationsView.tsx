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
  Key
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
      description: 'Live internet search engine supporting Wikipedia OpenSearch API and DuckDuckGo for zero-hallucination web facts and source URLs.',
      provider: 'Multi-Provider (Wikipedia & DuckDuckGo)',
      status: 'ACTIVE',
      icon: Search,
      sampleParams: { query: 'Artificial Intelligence quantum computing', maxResults: 3 },
    },
    {
      name: 'generate_report',
      title: 'Report Generator & Disk Storage',
      description: 'Produces structured Markdown reports with comparison tables, verifies file existence and bytes on disk, and generates download URLs.',
      provider: 'Local File System Storage Engine',
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
      provider: 'JarvisOS JSON State Store',
      status: 'ACTIVE',
      icon: ListTodo,
      sampleParams: { action: 'list' },
    },
    {
      name: 'document_analyzer',
      title: 'Document Intelligence & Summarizer',
      description: 'Extracts accessible text from uploaded documents and produces executive summaries and key findings.',
      provider: hasGeminiKey ? 'Gemini 1.5 Flash' : 'Native Text Intelligence Engine',
      status: 'ACTIVE',
      icon: FileCode2,
      sampleParams: {
        fileName: 'sample_audit.txt',
        content: 'JarvisOS is an autonomous agent architecture built for the CHAOS hackathon. It features multi-step planning, real tool dispatch, independent outcome verification, and transient error recovery.',
      },
    },
    {
      name: 'failure_test',
      title: 'Failure Testing Simulator',
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
      <div className="hud-card rounded-2xl p-5 border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-cyan font-bold block mb-1">
            VERIFIED TOOL ECOSYSTEM
          </span>
          <h2 className="text-lg font-display font-bold text-white">
            JarvisOS Tool Integrations & Diagnostics
          </h2>
          <p className="text-xs text-cyber-textMuted mt-0.5">
            Real, functioning tools with live verification checks. Run live tests to verify each integration.
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0F1A36] border border-cyber-cyan/40 hover:border-cyber-cyan text-white text-xs font-semibold transition-all self-start sm:self-auto glow-cyan-sm"
        >
          <Key className="w-4 h-4 text-cyber-cyan" />
          <span>Configure API Keys</span>
        </button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolsList.map((tool) => {
          const Icon = tool.icon;
          const isTesting = testingTool === tool.name;
          const result = testResults[tool.name];

          return (
            <div
              key={tool.name}
              className="hud-card rounded-2xl p-5 border border-[#1E293B] hover:border-cyber-cyan/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-[#050814] border border-[#1E293B] text-cyber-cyan">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{tool.title}</h3>
                      <span className="text-[10px] font-mono text-cyber-textMuted">Provider: {tool.provider}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/40 font-bold">
                    {tool.status}
                  </span>
                </div>

                <p className="text-xs text-cyber-textMuted leading-relaxed mb-4">
                  {tool.description}
                </p>
              </div>

              {/* Test Action & Results */}
              <div className="pt-3 border-t border-[#1E293B]/70">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleTest(tool.name, tool.sampleParams)}
                    disabled={isTesting}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#050814] border border-[#1E293B] hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-medium transition-all"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Live Diagnostic</span>
                      </>
                    )}
                  </button>

                  {result && (
                    <span className={`text-[11px] font-mono flex items-center space-x-1 ${result.success ? 'text-cyber-emerald' : 'text-cyber-rose'}`}>
                      {result.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{result.success ? `Verified in ${result.durationMs}ms` : 'Test Failed'}</span>
                    </span>
                  )}
                </div>

                {/* Diagnostic Details Accordion */}
                {result && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#050814] border border-[#1E293B] text-[11px] font-mono space-y-1">
                    <div className="text-white truncate">
                      Outcome: <span className="text-cyber-cyan">{result.verification?.actualOutcome}</span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate">
                      Details: {result.verification?.details}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
