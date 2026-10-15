# JarvisOS — Personal AI Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, functional personal AI agent web application named JarvisOS for the CHAOS hackathon, capable of autonomous planning, multi-step execution, independent outcome verification, transient failure recovery, and controlled failure testing.

**Architecture:** A fullstack architecture featuring a React 19 + TypeScript + Tailwind CSS cyberpunk dashboard paired with an Express/Node.js backend. The backend securely guards Gemini API operations, runs genuine search tools, persists tasks and reports to disk, and runs an orchestrator that verifies each step and executes auto-retry recovery loops.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Express, Node.js (v24), Google GenAI SDK (`@google/genai`), Vite, concurrently.

**Spec:** `docs/superpowers/specs/2026-10-15-jarvis-os-design.md`

## Global Constraints
- Modern dark-theme cyberpunk aesthetic: Deep Navy (`#070B19`), Cyan (`#00F0FF`), Violet (`#7928CA`), Emerald (`#10B981`).
- No fake execution logs or simulated successes: tools must genuinely search, write files to disk, and verify state.
- Keep all API keys on the server side; never expose keys in client bundles or public logs.
- Maximum two retries for transient failures with backoff before declaring failure.
- Consequential / irreversible actions require explicit human approval (`needs_approval` state).
- Include both a primary demo scenario ("Research three AI companies, compare products, generate report") and a controlled failure-testing scenario.

---

### Task 1: Scaffolding, Package Setup & Build Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`

- [ ] **Step 1: Create package.json with dual frontend & backend scripts**
- [ ] **Step 2: Create Vite and TypeScript configurations**
- [ ] **Step 3: Create Tailwind CSS and PostCSS configurations**
- [ ] **Step 4: Create index.html with Space Grotesk / Inter typography and cyberpunk viewport settings**
- [ ] **Step 5: Run npm install and verify installation**

---

### Task 2: Core TypeScript Models & Interfaces

**Files:**
- Create: `src/types/agent.ts`

- [ ] **Step 1: Define StepStatus, TaskStatus, ExecutionLog, VerificationResult, TaskStep, and AgentTask**
- [ ] **Step 2: Define ToolInput and ToolResult interfaces for each tool**
- [ ] **Step 3: Define Planner interfaces for Gemini structured output**

---

### Task 3: Backend Persistence & Storage Layer

**Files:**
- Create: `server/storage.ts`

- [ ] **Step 1: Implement disk initialization for `data/tasks.json` and `data/reports/`**
- [ ] **Step 2: Implement atomic CRUD for AgentTask: `saveTask`, `getTask`, `getAllTasks`, `deleteTask`**
- [ ] **Step 3: Implement report file writer and file existence/size checker: `saveReportFile`, `getReportFile`**

---

### Task 4: Modular Tool Execution Suite

**Files:**
- Create: `server/tools/webSearch.ts`
- Create: `server/tools/reportGenerator.ts`
- Create: `server/tools/taskManager.ts`
- Create: `server/tools/documentAnalyzer.ts`
- Create: `server/tools/failureTest.ts`
- Create: `server/tools/index.ts`

- [ ] **Step 1: Implement `webSearch.ts` using DuckDuckGo Instant API & HTML scraper with Wikipedia API fallback**
- [ ] **Step 2: Implement `reportGenerator.ts` writing formatted Markdown to disk**
- [ ] **Step 3: Implement `taskManager.ts` performing real task updates with read-back verification**
- [ ] **Step 4: Implement `documentAnalyzer.ts` extracting text from user uploads and generating analytical summaries**
- [ ] **Step 5: Implement `failureTest.ts` with controlled simulation modes (recoverable transient timeout vs. unrecoverable error)**
- [ ] **Step 6: Implement `index.ts` registering tools and providing a unified dispatch function**

---

### Task 5: Independent Verification Engine & Recovery Policy

**Files:**
- Create: `server/verifier.ts`

- [ ] **Step 1: Implement `verifyStepOutcome` with specific verification rules for each tool**
- [ ] **Step 2: Implement URL accessibility and format check for search outputs**
- [ ] **Step 3: Implement disk existence, byte length, and section structure verification for reports**
- [ ] **Step 4: Implement read-back state verification for task management**
- [ ] **Step 5: Implement transient error classifier and retry policy (max 2 retries with backoff)**

---

### Task 6: Gemini Planning & Orchestration Engine

**Files:**
- Create: `server/planner.ts`
- Create: `server/orchestrator.ts`

- [ ] **Step 1: Implement `planner.ts` with Gemini 2.5 Flash structured output prompt to decompose natural language instructions into ordered steps with dependencies**
- [ ] **Step 2: Add fallback heuristic planner for offline or unconfigured API key scenarios**
- [ ] **Step 3: Implement `orchestrator.ts` managing state transitions: Pending -> Running -> (Needs Approval | Completed | Failed)**
- [ ] **Step 4: Implement dependency resolution: execute prerequisite steps first and pass upstream outputs downstream**
- [ ] **Step 5: Integrate verification check after each step and trigger auto-retry on transient failure**
- [ ] **Step 6: Implement resume/rerun logic for failed tasks and approval handler for paused tasks**

---

### Task 7: Express API Server & Execution Streaming

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: Set up Express app with CORS, JSON body parser, and file upload support**
- [ ] **Step 2: Implement routes: `POST /api/tasks/plan`, `POST /api/tasks/:id/execute`, `GET /api/tasks`, `GET /api/tasks/:id`**
- [ ] **Step 3: Implement approval routes: `POST /api/tasks/:id/approve` and `POST /api/tasks/:id/reject`**
- [ ] **Step 4: Implement report download route: `GET /api/reports/:filename`**
- [ ] **Step 5: Implement tool direct test routes and settings/API key validation route**

---

### Task 8: Cyberpunk Design System & Styling

**Files:**
- Create: `src/index.css`

- [ ] **Step 1: Define CSS custom variables for OLED Navy, Cyan, Violet, Emerald, and Amber**
- [ ] **Step 2: Define glow effects, futuristic scrollbars, terminal scanline styling, and animations**

---

### Task 9: Navigation Sidebar, Header & HUD Dashboard Stats

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/DashboardStats.tsx`

- [ ] **Step 1: Build collapsible sidebar with navigation items (Dashboard, Assistant, Tasks, History, Integrations, Settings)**
- [ ] **Step 2: Build Header with active model badge, agent status indicator, and quick actions**
- [ ] **Step 3: Build DashboardStats showing Total Tasks, Completed, Failed, Success Rate %, and Active Tool count**

---

### Task 10: Central AI Command Terminal & Suggestions

**Files:**
- Create: `src/components/CommandTerminal.tsx`

- [ ] **Step 1: Build multiline instruction input with keyboard shortcuts (`Ctrl+Enter` / `Cmd+Enter`)**
- [ ] **Step 2: Add quick-launch scenario cards (Demo 1: Research 3 AI Companies, Demo 2: Controlled Failure & Recovery Test, Demo 3: Prioritize Backlog, Demo 4: Analyze Document)**
- [ ] **Step 3: Add planning loader and input validation**

---

### Task 11: Live Task Execution Graph & Status Badges

**Files:**
- Create: `src/components/TaskExecutionGraph.tsx`

- [ ] **Step 1: Render ordered step timeline with step number, tool icon, description, and status badge**
- [ ] **Step 2: Display dependency arrows/tags showing which step outputs feed into downstream steps**
- [ ] **Step 3: Render retry count badges (`Retry 1/2`, `Retry 2/2`) and active execution spinners**

---

### Task 12: Real-time Task Details Panel & Terminal Logs

**Files:**
- Create: `src/components/TaskDetailsPanel.tsx`

- [ ] **Step 1: Implement tabbed view: Terminal Logs, Verification Details, Output Artifacts**
- [ ] **Step 2: Format execution logs with timestamps and color-coded log levels (info, warn, error, success)**
- [ ] **Step 3: Implement Verification Inspector detailing check type, expected criteria, actual outcome, and status**
- [ ] **Step 4: Render report preview with one-click Markdown download button**

---

### Task 13: Human Approval Modal & Safe Recovery Dialog

**Files:**
- Create: `src/components/ApprovalModal.tsx`

- [ ] **Step 1: Render modal when task enters `needs_approval` state**
- [ ] **Step 2: Display target action, warning, parameter inspection, and Approve / Reject buttons**

---

### Task 14: Task History View & Rerun Actions

**Files:**
- Create: `src/components/HistoryView.tsx`

- [ ] **Step 1: List all historical tasks with timestamps, duration, status, step counts, and verification outcome**
- [ ] **Step 2: Provide action to view full details and rerun failed/completed tasks**
- [ ] **Step 3: Add filter by status (All, Completed, Failed, Needs Approval)**

---

### Task 15: Tool Integrations & Settings View

**Files:**
- Create: `src/components/IntegrationsView.tsx`
- Create: `src/components/SettingsModal.tsx`

- [ ] **Step 1: Render tool status cards (Web Search, Report Generator, Task Manager, Document Analyzer, Failure Simulator)**
- [ ] **Step 2: Allow testing each tool directly with live diagnostics**
- [ ] **Step 3: Allow viewing and updating Gemini API Key securely**

---

### Task 16: Document Upload & Analysis Modal

**Files:**
- Create: `src/components/DocumentUploadModal.tsx`

- [ ] **Step 1: File dropzone supporting .txt, .md, .json, .csv**
- [ ] **Step 2: Trigger document analyzer tool and display extracted summary**

---

### Task 17: Application Assembly & State Integration

**Files:**
- Create: `src/services/api.ts`
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Implement `src/services/api.ts` with API endpoints and polling/event synchronization**
- [ ] **Step 2: Assemble all components in `src/App.tsx` with responsive layout and state management**
- [ ] **Step 3: Verify navigation between Dashboard, Assistant, Tasks, History, and Integrations**

---

### Task 18: Build, Type Checks, End-to-End Verification

- [ ] **Step 1: Run TypeScript compiler (`tsc --noEmit`) to verify zero type errors**
- [ ] **Step 2: Run Vite production build (`npm run build`) to verify bundle integrity**
- [ ] **Step 3: Test Demo Scenario 1 (3 AI Companies Research -> Comparison -> Verified Report Download)**
- [ ] **Step 4: Test Demo Scenario 2 (Controlled Failure Test -> Detection -> 2 Retries -> Verified Recovery)**
- [ ] **Step 5: Document execution commands, environment configuration, and verification evidence**
