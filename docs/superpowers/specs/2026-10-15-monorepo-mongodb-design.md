# Architecture Design: Frontend & Backend Monorepo with MongoDB Integration

- **Date**: 2026-10-15
- **Status**: Approved / In Design
- **Author**: Antigravity & Ajay G S

---

## 1. Problem Statement & Motivation

JarvisOS is currently structured as a single root application where Vite and Express coexist in the same root directory with mixed dependencies. The user requested:
1. Reorganizing the repository into a clean **frontend / backend** architecture where both parts are distinct, self-contained packages.
2. Integrating **MongoDB** into the backend using **Mongoose ODM** for persistent task tracking and reports, while maintaining a seamless local fallback so the application works even when MongoDB is offline.

---

## 2. Architecture & Monorepo Structure

We will adopt an **Independent Self-Contained Monorepo** managed by npm workspaces:

```
JarvisOS/
├── package.json                 # Root orchestrator with npm workspaces
├── package-lock.json
├── .gitignore                   # Covers root, backend, and frontend
├── .env.example                 # Root environment template
├── README.md                    # Updated monorepo documentation
├── docs/
│   └── superpowers/specs/       # Design specs
│
├── frontend/
│   ├── package.json             # React 19, Vite, Tailwind CSS, Lucide dependencies
│   ├── vite.config.ts           # Proxies /api to http://localhost:3001
│   ├── tsconfig.json            # React TypeScript config
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/          # Dashboard, modals, terminal, graph, etc.
│       ├── services/api.ts      # REST API & SSE client
│       └── types/agent.ts       # Frontend TypeScript definitions
│
└── backend/
    ├── package.json             # Express, Mongoose, tsx, dotenv, cors, Google Generative AI
    ├── tsconfig.json            # Node/ESModule TypeScript config
    ├── .env.example             # Backend template with MONGODB_URI and GEMINI_API_KEY
    ├── data/                    # Storage directory for local fallback JSON & reports
    └── src/
        ├── index.ts             # Express server entry point & SSE streaming
        ├── db/
        │   ├── connection.ts    # Mongoose connection with error handling & status flag
        │   └── models/
        │       ├── task.model.ts    # Mongoose schema for AgentTask
        │       └── report.model.ts  # Mongoose schema for Report files
        ├── storage.ts           # Hybrid storage adapter (MongoDB primary, JSON fallback)
        ├── orchestrator.ts      # Execution engine & SSE publisher
        ├── planner.ts           # Gemini planning engine & heuristic fallback
        ├── verifier.ts          # Outcome verification engine
        ├── types/agent.ts       # Backend domain types
        └── tools/               # Agent tool implementations
```

---

## 3. MongoDB Integration Specification

### 3.1 Connection Strategy (`backend/src/db/connection.ts`)
- Configured via `MONGODB_URI` in `.env` (defaults to `mongodb://localhost:27017/jarvis-os`).
- Connects using `mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })`.
- Exposes:
  - `connectDB()`: Async connection initializer.
  - `isMongoConnected()`: Boolean indicating connection state.
- Graceful degradation: If MongoDB is unavailable, it logs a clear non-blocking warning and JarvisOS automatically routes all storage operations to local file storage (`data/tasks.json` and `data/reports/`).

### 3.2 Mongoose Schemas

#### Task Schema (`TaskModel`)
- `id`: `{ type: String, required: true, unique: true, index: true }`
- `instruction`: `{ type: String, required: true }`
- `status`: `{ type: String, enum: ['idle', 'planning', 'running', 'waiting_approval', 'verifying', 'completed', 'failed', 'cancelled'], required: true }`
- `createdAt`: `{ type: Number, required: true }`
- `updatedAt`: `{ type: Number, required: true }`
- `plan`: `[StepSchema]` (step details, tool, params, status, output, verification)
- `logs`: `[LogSchema]` (timestamp, level, message, stepId)
- `reportPath`: `String`
- `error`: `String`

#### Report Schema (`ReportModel`)
- `fileName`: `{ type: String, required: true, unique: true, index: true }`
- `content`: `{ type: String, required: true }`
- `sizeBytes`: `{ type: Number, required: true }`
- `createdAt`: `{ type: Date, default: Date.now }`
- `updatedAt`: `{ type: Date, default: Date.now }`

### 3.3 Storage Adapter (`backend/src/storage.ts`)
The storage API remains identical:
- `getAllTasks(): Promise<AgentTask[]>` / synchronous compatibility wrapper
- `getTask(id: string): Promise<AgentTask | null>`
- `saveTask(task: AgentTask): Promise<AgentTask>`
- `deleteTask(id: string): Promise<boolean>`
- `saveReportFile(fileName: string, content: string)`
- `getReportFile(fileName: string)`
- `checkReportExists(fileName: string)`

When MongoDB is connected, operations persist to MongoDB collections. When disconnected, operations seamlessly persist to disk under `data/`.

---

## 4. Workspaces & Scripts

### Root `package.json`
```json
{
  "name": "jarvis-os",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently -n \"BACKEND,FRONTEND\" -c \"cyan,magenta\" \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend",
    "lint": "npm run lint --workspace=backend && npm run lint --workspace=frontend"
  }
}
```

### Backend Scripts
- `dev`: `tsx watch src/index.ts`
- `build`: `tsc`
- `start`: `node dist/index.js`
- `lint`: `tsc --noEmit`

### Frontend Scripts
- `dev`: `vite`
- `build`: `tsc && vite build`
- `lint`: `tsc --noEmit`
- `preview`: `vite preview`

---

## 5. Verification Plan
1. Install `mongoose` and `@types/mongoose` in `backend`.
2. Verify TypeScript compile without errors: `npm run lint`.
3. Verify production build for frontend: `npm run build --workspace=frontend`.
4. Verify backend server boots and reports MongoDB status: `npm run dev:backend`.
5. Run automated Git commit and push per global rules.
