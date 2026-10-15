# JarvisOS — Personal AI Agent 🤖⚡

> **Built for the CHAOS Hackathon**  
> An autonomous multi-step personal AI agent that plans tasks, executes actions across working tools, independently verifies outcomes, detects failures, and recovers via self-healing auto-retry policies.

---

## 🌟 Architecture & Monorepo Overview

JarvisOS is structured as a modern **frontend / backend monorepo** using npm workspaces:

```
JarvisOS/
├── package.json                 # Root npm workspace orchestrator
├── .env.example                 # Environment configuration template
├── docs/                        # Architecture specs & implementation plans
│
├── frontend/                    # Vite + React 19 + Tailwind CSS Frontend
│   ├── package.json
│   ├── vite.config.ts           # Proxies /api to http://localhost:3001
│   ├── src/                     # React components, SSE stream client & views
│   └── index.html
│
└── backend/                     # Express + TypeScript + Mongoose Backend
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── index.ts             # Express server & SSE live stream
    │   ├── db/                  # Mongoose ODM connection & schemas
    │   ├── storage.ts           # Hybrid storage adapter (MongoDB primary + local fallback)
    │   ├── orchestrator.ts      # Multi-step DAG agent execution engine
    │   ├── planner.ts           # Gemini planning engine & heuristic planner
    │   ├── verifier.ts          # Outcome verification engine
    │   └── tools/               # Autonomous tools (Web Search, Reports, Tasks, Analyzer)
    └── data/                    # Storage directory for local fallback JSON & reports
```

---

## 🔑 Key Highlights & Features

1. **Clean Frontend / Backend Monorepo**: Dedicated `frontend/` and `backend/` packages with isolated dependencies, coordinated effortlessly via root npm workspaces.
2. **MongoDB with Local Fallback**: Integrated with **Mongoose ODM**. If MongoDB is running (`mongodb://localhost:27017/jarvis-os`), tasks and reports are persisted to MongoDB collections. If MongoDB is offline, it automatically falls back to local disk storage (`backend/data/tasks.json` and `backend/data/reports/`) with zero downtime.
3. **Multi-Step Dependency Planning**: Decomposes natural language into an ordered DAG (Directed Acyclic Graph) of steps with explicit descriptions, tool assignments, dependencies, and **expected outputs**.
4. **Pre-Execution Plan Inspection**: Review the planned steps in the dashboard *before* execution, or execute immediately.
5. **Genuine Tool Implementations (Zero Hallucinations)**:
   - **Web Research**: Multi-provider live web search (Wikipedia Full-Text API, Wikipedia OpenSearch, DuckDuckGo) returning verified factual summaries and real source URLs.
   - **Report Generator**: Writes formatted Markdown reports with comparative tables, synthesis, and references directly to persistent storage, verified by byte size and markdown structure.
   - **Task Manager**: Manages persistent tasks with database/disk read-back verification.
   - **Document Analyzer**: Uploads and extracts text from `.txt`, `.md`, `.json`, `.csv` files with contextual AI summaries and key takeaways.
   - **Controlled Failure Simulator**: Simulates transient gateway timeouts and permanent failures to demonstrate resilience.
6. **Independent Post-Execution Verification**: Every tool execution is followed by an independent verification check. A task is *never* marked COMPLETED simply because an LLM responded—all step criteria must be verified.
7. **Auto-Retry & Self-Healing (Max 2 Retries)**: Identifies transient errors (HTTP 504, 503, 429, socket reset, network disruptions), applies exponential backoff, and attempts auto-recovery up to 2 times.
8. **Cyberpunk HUD Design System**: Dark navy (`#050814`), cyan neon accents (`#00F0FF`), glowing cards, live SSE streaming execution graph, and tabular terminal logs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v22/v24)
- **npm** v9+
- *(Optional)* **MongoDB** running locally on port 27017 or via MongoDB Atlas

### 2. Installation
```bash
git clone https://github.com/ajaygs01/JarvisOS.git
cd JarvisOS
npm install
```

### 3. Environment Configuration (Optional)
JarvisOS works **out of the box** without any paid API keys or active database using its built-in Native Intelligence & local disk fallback!

To configure Gemini or MongoDB:
```bash
cp .env.example .env
```
In `.env`:
```env
# Optional: Google Gemini API Key
GEMINI_API_KEY=your_key_here

# Optional: MongoDB connection string (defaults to mongodb://localhost:27017/jarvis-os)
MONGODB_URI=mongodb://localhost:27017/jarvis-os

# Server Port
PORT=3001
```

### 4. Running the Application

#### Start both Backend and Frontend together:
```bash
npm run dev
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

#### Or run each workspace independently:
```bash
# Run only Backend (Express on :3001 with live reload)
npm run dev:backend

# Run only Frontend (Vite on :5173)
npm run dev:frontend
```

---

## 🛠️ Monorepo NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently |
| `npm run dev:backend` | Starts Express backend in live-reload watch mode |
| `npm run dev:frontend` | Starts Vite frontend dev server |
| `npm run build` | Builds both backend (TypeScript) and frontend (Vite) |
| `npm run lint` | Type-checks both backend and frontend workspaces |
