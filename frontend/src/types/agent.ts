export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_approval';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_approval';

export type ToolName = 
  | 'web_search' 
  | 'generate_report' 
  | 'task_manager' 
  | 'document_analyzer' 
  | 'failure_test';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  stepId?: string;
  details?: Record<string, any> | string;
}

export interface VerificationResult {
  verified: boolean;
  timestamp: string;
  checkType: string;
  details: string;
  expectedCriteria: string;
  actualOutcome: string;
}

export interface TaskStep {
  id: string;
  stepNumber: number;
  description: string;
  tool: ToolName;
  params: Record<string, any>;
  dependencies: string[]; // List of step IDs that must complete before this runs
  expectedOutput?: string;
  status: StepStatus;
  retryCount: number;
  maxRetries: number;
  error?: string;
  output?: any;
  verification?: VerificationResult;
  startedAt?: string;
  completedAt?: string;
}

export interface ApprovalRequest {
  stepId: string;
  actionDescription: string;
  tool: ToolName;
  params: Record<string, any>;
  consequences: string;
}

export interface AgentTask {
  id: string;
  instruction: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  status: TaskStatus;
  steps: TaskStep[];
  logs: ExecutionLog[];
  overallVerification?: VerificationResult;
  finalReportPath?: string;
  downloadUrl?: string;
  requiresApproval?: ApprovalRequest;
}

export interface WebSearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchOutput {
  query: string;
  results: WebSearchResultItem[];
  source: string;
  count: number;
}

export interface ReportGeneratorOutput {
  title: string;
  fileName: string;
  filePath: string;
  downloadUrl: string;
  wordCount: number;
  sizeBytes: number;
  sections: string[];
}

export interface TaskManagerOutput {
  action: 'create' | 'update' | 'list' | 'complete' | 'delete';
  taskId?: string;
  title?: string;
  status?: string;
  totalTasks?: number;
  verified: boolean;
  data?: any;
}

export interface DocumentAnalyzerOutput {
  fileName: string;
  fileSize: number;
  wordCount: number;
  summary: string;
  keyPoints: string[];
  metadata?: Record<string, any>;
}

export interface FailureTestOutput {
  mode: 'transient_recovery' | 'permanent_failure';
  attemptNumber: number;
  simulatedError: string;
  recovered: boolean;
  message: string;
}

export interface SystemStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  successRate: number; // percentage 0 - 100
  toolCount: number;
  engineStatus: 'idle' | 'planning' | 'executing' | 'recovering';
}

export interface PlanRequest {
  instruction: string;
}

export interface ToolTestResult {
  tool: ToolName;
  success: boolean;
  durationMs: number;
  output?: any;
  error?: string;
  verification?: VerificationResult;
}
