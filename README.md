# JarvisOS — Personal AI Agent 🤖⚡

> **Built for the CHAOS Hackathon**  
> An autonomous multi-step personal AI agent that plans tasks, executes actions across working tools, independently verifies outcomes on the file system, detects failures, and recovers via self-healing auto-retry policies.

---

## 🌟 Key Highlights & Differentiators

Unlike decorative dashboards or simple chatbots, **JarvisOS** is a functioning autonomous orchestrator:
1. **Multi-Step Dependency Planning**: Decomposes natural language into an ordered DAG (Directed Acyclic Graph) of steps with explicit descriptions, tool assignments, dependencies, and **expected outputs**.
2. **Pre-Execution Plan Inspection**: Review the planned steps in the dashboard *before* execution, or execute immediately.
3. **Genuine Tool Implementations (Zero Hallucinations)**:
   - **Web Research**: Multi-provider live web search (Wikipedia Full-Text API, Wikipedia OpenSearch, DuckDuckGo) returning verified factual summaries and real source URLs.
   - **Report Generator**: Writes formatted Markdown reports with comparative tables, synthesis, and references directly to persistent disk storage (`data/reports/`), verified by byte size and markdown structure.
   - **Task Manager**: Manages persistent tasks in `data/tasks.json` with disk read-back verification.
   - **Document Analyzer**: Uploads and extracts text from `.txt`, `.md`, `.json`, `.csv` files with contextual AI summaries and key takeaways.
   - **Controlled Failure Simulator**: Simulates transient gateway timeouts and permanent failures to demonstrate resilience.
4. **Independent Post-Execution Verification**: Every tool execution is followed by an independent verification check. A task is *never* marked COMPLETED simply because an LLM responded—all step criteria must be verified.
5. **Auto-Retry & Self-Healing (Max 2 Retries)**: Identifies transient errors (HTTP 504, 503, 429, socket reset, network disruptions), applies exponential backoff, and attempts auto-recovery up to 2 times.
6. **Task Cancellation & Human-in-the-Loop Approval**: Allows users to cancel in-flight tasks and halts execution for user authorization before consequential actions.
7. **Cyberpunk HUD Design System**: Dark navy (`#050814`), cyan neon accents (`#00F0FF`), glowing cards, live SSE streaming execution graph, and tabular terminal logs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Installation
```bash
git clone <repo-url>
cd JarvisOS
npm install
```

### 3. Environment Configuration (Optional)
JarvisOS works **out of the box** without any paid API keys using its built-in Native Intelligence & Heuristic Planner!

To enable live Google Gemini model planning and synthesis:
```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here
```
*(You can also set or change the Gemini API Key directly inside the app's **Settings & API Keys** dialog.)*

### 4. Running Locally
Run both the Express backend API (`:3001`) and the Vite React frontend (`:5173`) concurrently:
```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend Express Server
npm run server

# Terminal 2: Frontend Vite Dashboard
npm run client
```

Open your browser to: **`http://localhost:5173/`**

---

## 🧪 Preset Hackathon Demo Missions

On the Dashboard, click any of the 4 preset scenario cards:

1. **Demo 1: AI Companies Research & Comparison Report (Primary Demo)**
   - Plans a 4-step mission:
     - Step 1: Research OpenAI (GPT-4o, ChatGPT)
     - Step 2: Research Anthropic (Claude 3.5, Constitutional AI)
     - Step 3: Research Google DeepMind (Gemini 2.0 Flash, AlphaFold)
     - Step 4: Synthesize research into a comparative table and generate a verified downloadable Markdown report on disk.
   - Real output: Verified report saved to `data/reports/` with working one-click download.

2. **Demo 2A: Transient Failure & Self-Healing Recovery Test**
   - Simulates HTTP 504 Gateway Timeout on attempts 1 and 2.
   - Demonstrates:
     - Error detection and logging.
     - Auto-retry with 1.5s backoff.
     - Successful recovery on attempt 3.
     - Verification pass and diagnostic audit report generation.

3. **Demo 2B: Permanent Failure Test (Honest Reporting)**
   - Simulates an unrecoverable failure.
   - Demonstrates:
     - Error detection and retry exhaustion.
     - Halting of dependent downstream steps (they never run!).
     - Honest **FAILED** status without fabricated success.

4. **Document Analysis & Intelligence Summary**
   - Upload any document or paste text.
   - Extracts word counts and generates an executive summary with key takeaways.

---

## 🏗️ Architecture & Tech Stack

```
JarvisOS/
├── server/
│   ├── index.ts                # Express server with REST & SSE endpoints
│   ├── orchestrator.ts         # Agent state machine, execution DAG, auto-recovery & cancellation
│   ├── planner.ts              # Gemini 2.5 Flash & Heuristic planning engine
│   ├── verifier.ts             # Independent verification engine & retry classifier
│   ├── storage.ts              # Local disk storage (data/tasks.json, data/reports/)
│   └── tools/
│       ├── webSearch.ts        # Wikipedia Full-Text & DDG multi-provider search
│       ├── reportGenerator.ts  # Markdown file generator with disk verification
│       ├── taskManager.ts      # Task CRUD with disk read-back verification
│       ├── documentAnalyzer.ts # Document text extraction & contextual analysis
│       ├── failureTest.ts      # Controlled failure simulation tool
│       └── index.ts            # Unified tool registry & dispatcher
├── src/
│   ├── components/             # Cyberpunk HUD components (Sidebar, Terminal, ExecutionGraph, etc.)
│   ├── services/api.ts         # Client API & SSE event stream integration
│   ├── types/agent.ts          # Shared TypeScript models
│   ├── App.tsx                 # Master state & view coordinator
│   └── index.css               # Tailwind CSS custom themes & glow effects
└── data/
    ├── tasks.json              # Persistent task store
    └── reports/                # Generated markdown files
```
