# JarvisOS — Personal AI Agent: Specification & Architecture

**Date**: 2026-10-15  
**Project**: JarvisOS — Personal AI Agent (CHAOS Hackathon)  
**Status**: Approved Spec  

## 1. Executive Summary & Objective

JarvisOS is an intelligent personal AI agent that autonomously plans, executes, verifies, and recovers from multi-step tasks across integrated tools. JarvisOS is built for the CHAOS Hackathon to provide a genuine, dependable autonomous execution engine rather than a mere chat interface or decorative dashboard.

Key Pillars:
1. **Autonomous Planning Engine**: Decomposes natural language instructions into a strictly ordered dependency graph of execution steps using Gemini 2.5 Flash.
2. **Modular Tool Execution Suite**:
   - `web_search`: Live multi-provider web research (DuckDuckGo instant API + HTML scrape with Wikipedia fallback) returning verified factual content and source URLs.
   - `generate_report`: Produces structured markdown reports with metadata, introduction, comparative tables, synthesis, and source links, saved directly to the file system and downloadable.
   - `task_manager`: Full lifecycle management (create, update, list, complete) verified via disk-read state synchronization.
   - `document_analyzer`: Uploads documents (markdown, text, code, JSON), extracts raw text, validates content, and produces structured analytical summaries.
3. **Independent Verification & Recovery**:
   - Every single step execution is followed by an independent verification check (verifying non-empty output, file existence, structural compliance, and URL validity).
   - Automatic retry policy: Up to 2 retries with exponential backoff on transient failures.
   - Safe alternative fallback strategies when primary providers encounter limits.
   - Strict human-in-the-loop approval gate for consequential/destructive actions.
4. **Controlled Failure-Testing Mode**:
   - A dedicated, clearly labeled testing scenario that induces a transient failure to demonstrate detection, logging, retry attempts, recovery, or terminal failure reporting.
5. **Futuristic Cyberpunk UI / Sci-Fi HUD**:
   - Responsive dark-mode interface (OLED deep navy `#070B19`, cyan accents `#00F0FF`, violet `#7928CA`, emerald `#10B981`).
   - Collapsible sidebar navigation, live stats HUD, command terminal, real-time step execution graph, live terminal logs, report viewer/downloader, and persistent execution history.

---

## 2. Technology Stack & Directory Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Vite.
- **Backend**: Node.js + Express API (`server/index.ts`) running concurrently (proxying `/api` via Vite in development).
- **AI Planning & Synthesis**: Google Gemini API via `@google/genai` (with graceful fallback handling).
- **Persistent Storage**: Disk-based JSON store in `./data/tasks.json` and report filesystem storage in `./data/reports/`.
- **Search Engine**: DuckDuckGo API / HTML scraper with Wikipedia API fallback for reliable zero-cost web research without paid key blockers.

### Directory Structure
```
JarvisOS/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── server/
│   ├── index.ts                # Express server entry point & API routes
│   ├── orchestrator.ts         # Agent Execution Engine & State Machine
│   ├── planner.ts              # Gemini Planning Engine & Prompts
│   ├── verifier.ts             # Independent Verification Rules & Checks
│   ├── storage.ts              # Disk persistence (tasks.json, logs, reports)
│   └── tools/
│       ├── index.ts            # Tool registry & unified execution interface
│       ├── webSearch.ts        # Live Web Research Tool
│       ├── reportGenerator.ts  # Markdown Report Generation & Disk Writer
│       ├── taskManager.ts      # Task CRUD & State Tracker
│       ├── documentAnalyzer.ts # Document text extraction & analysis
│       └── failureTest.ts      # Controlled Failure-Testing Tool
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── agent.ts            # Shared TypeScript interfaces
│   ├── components/
│   │   ├── Sidebar.tsx         # Collapsible Cyberpunk navigation
│   │   ├── Header.tsx          # System status, breadcrumb, active model
│   │   ├── DashboardStats.tsx  # Metrics HUD (Tasks, Success Rate %, etc.)
│   │   ├── CommandTerminal.tsx # AI Instruction input & suggested scenarios
│   │   ├── TaskExecutionGraph.tsx # Live step cards with status badges
│   │   ├── TaskDetailsPanel.tsx# Logs terminal, verification, outputs, downloads
│   │   ├── ApprovalModal.tsx   # Consequential action human confirmation
│   │   ├── HistoryView.tsx     # Past task execution history & rerun controls
│   │   ├── IntegrationsView.tsx# Tool status & API Key config
│   │   └── DocumentUploadModal.tsx # Document analyzer modal
│   └── services/
│       └── api.ts              # Client API client & Server-Sent Events / Polling
├── data/
│   ├── tasks.json              # Persistent task store
│   └── reports/                # Generated markdown files
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

## 3. Core Data Models (TypeScript Interfaces)

```typescript
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_approval';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_approval';

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
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
  tool: 'web_search' | 'generate_report' | 'task_manager' | 'document_analyzer' | 'failure_test';
  params: Record<string, any>;
  dependencies: string[];       // IDs of prerequisite steps
  status: StepStatus;
  retryCount: number;
  maxRetries: number;
  error?: string;
  output?: any;
  verification?: VerificationResult;
  startedAt?: string;
  completedAt?: string;
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
  requiresApproval?: {
    stepId: string;
    actionDescription: string;
    consequences: string;
  };
}
```

---

## 4. Verification & Self-Healing Policy

1. **Independent Verification Check Rules**:
   - `web_search`: Asserts result count > 0, each item possesses a non-empty `title`, `snippet`, and URL beginning with `http://` or `https://`.
   - `generate_report`: Asserts target file exists on disk, byte size > 50 bytes, contains `#` title, comparison table or list, and `Sources:` section.
   - `task_manager`: Asserts task was written to disk and can be successfully queried back with matching state.
   - `document_analyzer`: Asserts input text was parsed (> 20 characters), summary generated (> 100 characters), and key takeaways identified.
2. **Auto-Recovery Policy**:
   - On step failure: Check if `retryCount < 2`.
   - If recoverable: Log warning, wait 1.5s backoff, retry step.
   - Fallback strategies:
     - If DuckDuckGo rate limits: fallback to Wikipedia API search.
     - If Gemini parsing returns markdown wrapper around JSON: auto-clean regex strip ````json ... ````.
3. **Failure-Testing Scenario**:
   - Tool `failure_test` intentionally triggers a transient error on attempt 1 & 2 or a permanent error, verifying that JarvisOS captures error logs, increments retry count, tests recovery, and marks the step as failed with honest diagnostic output.

---

## 5. Security & Safety

- Secret Management: `GEMINI_API_KEY` is loaded from server-side environment variables or configured via server settings; never logged or exposed in client bundles.
- Human-In-The-Loop Approval: Any destructive operation or consequential action triggers `needs_approval`, pausing the orchestrator until the user confirms or declines via modal.
- Input validation: All tool parameters are strictly validated prior to dispatch.
