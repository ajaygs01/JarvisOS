import { executeWebSearch } from './webSearch.js';
import { executeReportGenerator } from './reportGenerator.js';
import { executeTaskManager } from './taskManager.js';
import { executeDocumentAnalyzer } from './documentAnalyzer.js';
import { executeFailureTest } from './failureTest.js';
import type { ToolName } from '../types/agent.js';

export interface ToolDefinition {
  name: ToolName;
  displayName: string;
  description: string;
  isConsequential: boolean; // Triggers human approval if true
  execute: (params: any) => Promise<any>;
}

export const TOOLS: Record<ToolName, ToolDefinition> = {
  web_search: {
    name: 'web_search',
    displayName: 'Web Research Engine',
    description: 'Searches live web sources, retrieves factual summaries, and provides verified source URLs.',
    isConsequential: false,
    execute: executeWebSearch,
  },
  generate_report: {
    name: 'generate_report',
    displayName: 'Report Generator',
    description: 'Generates structured Markdown reports with comparison tables, syntheses, and references directly to disk.',
    isConsequential: false,
    execute: executeReportGenerator,
  },
  task_manager: {
    name: 'task_manager',
    displayName: 'Task Manager',
    description: 'Creates, updates, tracks, and manages persistent tasks with read-back verification.',
    isConsequential: false,
    execute: executeTaskManager,
  },
  document_analyzer: {
    name: 'document_analyzer',
    displayName: 'Document Analyzer',
    description: 'Extracts accessible text and generates structured executive summaries and key points.',
    isConsequential: false,
    execute: executeDocumentAnalyzer,
  },
  failure_test: {
    name: 'failure_test',
    displayName: 'Failure Testing Simulator',
    description: 'Simulates controlled transient and unrecoverable failures to verify error logging and auto-retry policies.',
    isConsequential: false,
    execute: executeFailureTest,
  },
};

export async function executeTool(toolName: ToolName, params: any): Promise<any> {
  const tool = TOOLS[toolName];
  if (!tool) {
    throw new Error(`Tool "${toolName}" is not registered in JarvisOS tool registry.`);
  }
  return await tool.execute(params);
}
