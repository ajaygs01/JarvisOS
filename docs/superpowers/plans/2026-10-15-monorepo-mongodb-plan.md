# Frontend & Backend Monorepo with MongoDB Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor JarvisOS into a clean, independent frontend and backend monorepo with npm workspaces and integrate MongoDB via Mongoose ODM with seamless local storage fallback.

**Architecture:** Split the codebase into `frontend/` (Vite, React 19, Tailwind) and `backend/` (Express, Mongoose, Gemini, SSE). Connect MongoDB via Mongoose models (`Task`, `Report`) with automatic non-blocking local file fallback (`data/tasks.json` and `data/reports/`). Coordinate via root npm workspaces.

**Tech Stack:** React 19, Vite, Tailwind CSS, TypeScript, Express, Mongoose, MongoDB, Google Generative AI, Concurrently.

**Spec:** `docs/superpowers/specs/2026-10-15-monorepo-mongodb-design.md`

## Global Constraints
- Node.js >= 18 & npm workspaces
- Port 3001 for Express backend, Port 5173 for Vite frontend
- Vite proxies `/api` to `http://localhost:3001`
- Mongoose default URI: `mongodb://localhost:27017/jarvis-os` (configurable via `MONGODB_URI` in `.env`)
- Non-blocking database connection with graceful local fallback if MongoDB is not reachable

---

### Task 1: Scaffolding `frontend/` Directory & Config

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Move: `index.html` -> `frontend/index.html`
- Move: `vite.config.ts` -> `frontend/vite.config.ts`
- Move: `tailwind.config.js` -> `frontend/tailwind.config.js`
- Move: `postcss.config.js` -> `frontend/postcss.config.js`
- Move: `src/` -> `frontend/src/`

**Interfaces:**
- Consumes: Backend `/api` endpoints via `frontend/src/services/api.ts`
- Produces: Static React build in `frontend/dist` & dev server on `http://localhost:5173`

- [ ] **Step 1: Create `frontend/package.json`**
```json
{
  "name": "jarvis-os-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: Move frontend files into `frontend/`**
Move `index.html`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `tsconfig.node.json`, and `src/` into `frontend/`.

- [ ] **Step 3: Commit frontend scaffolding**
```bash
git add frontend
git commit -m "refactor(frontend): isolate frontend workspace with its own package.json and config"
```

---

### Task 2: Scaffolding `backend/` Directory & Self-Contained Domain Types

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Move: `server/` -> `backend/src/`
- Create: `backend/src/types/agent.ts` (backend domain types)
- Modify: `backend/src/*.ts` and `backend/src/tools/*.ts` to import types from `./types/agent.js` or `../types/agent.js`

**Interfaces:**
- Consumes: Local environment variables (`PORT`, `GEMINI_API_KEY`, `MONGODB_URI`)
- Produces: Express API on port 3001 and SSE stream at `/api/stream`

- [ ] **Step 1: Create `backend/package.json`**
```json
{
  "name": "jarvis-os-backend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mongoose": "^8.10.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.1",
    "tsx": "^4.19.2",
    "typescript": "~5.7.2"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Move `server/` files to `backend/src/` and copy `types/agent.ts` to `backend/src/types/agent.ts`**
Update all type imports in `backend/src/` files from `../src/types/agent.js` or `../../src/types/agent.js` to `./types/agent.js` or `../types/agent.js`.

- [ ] **Step 4: Commit backend scaffolding**
```bash
git add backend
git commit -m "refactor(backend): isolate backend workspace with self-contained types and tsconfig"
```

---

### Task 3: MongoDB Integration with Mongoose ODM & Fallback

**Files:**
- Create: `backend/src/db/connection.ts`
- Create: `backend/src/db/models/task.model.ts`
- Create: `backend/src/db/models/report.model.ts`
- Modify: `backend/src/storage.ts`
- Modify: `backend/src/index.ts`

**Interfaces:**
- Consumes: `process.env.MONGODB_URI`
- Produces: `connectDB()`, `isMongoConnected()`, `TaskModel`, `ReportModel`, and hybrid persistent storage API

- [ ] **Step 1: Create `backend/src/db/connection.ts`**
Implement Mongoose connection with error handling, timeout, and `isMongoConnected()` state flag.

- [ ] **Step 2: Create `backend/src/db/models/task.model.ts` and `report.model.ts`**
Implement schemas for Task and Report matching the design document.

- [ ] **Step 3: Update `backend/src/storage.ts` to dual-route**
When `isMongoConnected()` is true, use Mongoose models. When false, gracefully route to local files under `backend/data/`.

- [ ] **Step 4: Update `backend/src/index.ts`**
Call `await connectDB()` during startup and report database connectivity status in the console banner and `/api/health` endpoint.

- [ ] **Step 5: Commit MongoDB integration**
```bash
git add backend/src/db backend/src/storage.ts backend/src/index.ts
git commit -m "feat(backend): add mongoose odm integration with seamless local fallback"
```

---

### Task 4: Root Workspace Orchestration & Documentation

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `.env.example`
- Create: `backend/.env.example`
- Modify: `README.md`

- [ ] **Step 1: Configure root `package.json` with npm workspaces and concurrently**
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
    "build:backend": "npm run build --workspace=backend",
    "build:frontend": "npm run build --workspace=frontend",
    "lint": "npm run lint --workspace=backend && npm run lint --workspace=frontend"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

- [ ] **Step 2: Update `.gitignore` and `.env.example`**
Ensure `node_modules`, `dist`, `.env` are ignored at root and inside `frontend/` and `backend/`. Add `MONGODB_URI=mongodb://localhost:27017/jarvis-os` to `.env.example`.

- [ ] **Step 3: Update `README.md` with monorepo setup instructions**
Document how to run together (`npm run dev`) or independently (`npm run dev:frontend`, `npm run dev:backend`), and how to configure MongoDB.

- [ ] **Step 4: Commit root configuration**
```bash
git add package.json .gitignore .env.example backend/.env.example README.md
git commit -m "chore(root): configure npm workspaces, scripts, and documentation"
```

---

### Task 5: Verification, Build Checks & Automated GitHub Push

- [ ] **Step 1: Install workspace dependencies**
Run `npm install` from the root to link workspace packages and install `mongoose`.

- [ ] **Step 2: Run typecheck lint across all workspaces**
Run `npm run lint`. Expected: `0 errors`.

- [ ] **Step 3: Run production builds**
Run `npm run build`. Expected: Both frontend and backend compile successfully.

- [ ] **Step 4: Push to GitHub**
Push all commits to `origin main` and verify with GitHub API per the global automation rule.
