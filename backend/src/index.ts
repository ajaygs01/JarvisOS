import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { initStorage, getAllTasks, getTask, getReportFile, syncStorageWithMongo } from './storage.js';
import { createPlan, runTaskOrchestrator, approveStepAndResume, rerunTask, cancelTask, onTaskUpdate } from './orchestrator.js';
import { executeTool, TOOLS } from './tools/index.js';
import { verifyStepOutcome } from './verifier.js';
import { connectDB, getMongoStatus } from './db/connection.js';
import type { SystemStats, ToolName } from './types/agent.js';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both backend directory and workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize persistent storage
initStorage();

// Server-Sent Events (SSE) subscribers
const sseClients: Set<express.Response> = new Set();

onTaskUpdate((task) => {
  const data = JSON.stringify(task);
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
});

// SSE Stream endpoint
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Plan task from natural language
app.post('/api/tasks/plan', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction || typeof instruction !== 'string') {
      res.status(400).json({ error: 'Instruction is required.' });
      return;
    }
    const task = await createPlan(instruction);
    res.json(task);
  } catch (err: any) {
    console.error('Error in /api/tasks/plan:', err);
    res.status(500).json({ error: err.message || 'Failed to plan task' });
  }
});

// Execute plan
app.post('/api/tasks/:id/execute', async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = getTask(taskId);
    if (!task) {
      res.status(404).json({ error: `Task ${taskId} not found` });
      return;
    }

    // Launch execution in background so client gets instant response
    runTaskOrchestrator(taskId).catch(err => {
      console.error(`Error running task ${taskId}:`, err);
    });

    res.json({ message: 'Execution initiated', taskId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Execution error' });
  }
});

// Plan & Run convenience endpoint
app.post('/api/tasks/run', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction || typeof instruction !== 'string') {
      res.status(400).json({ error: 'Instruction is required.' });
      return;
    }
    const task = await createPlan(instruction);

    // Launch execution
    runTaskOrchestrator(task.id).catch(err => {
      console.error(`Error running task ${task.id}:`, err);
    });

    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run task' });
  }
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = getAllTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = getTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Rerun task
app.post('/api/tasks/:id/rerun', async (req, res) => {
  try {
    const task = await rerunTask(req.params.id);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel task
app.post('/api/tasks/:id/cancel', async (req, res) => {
  try {
    const task = await cancelTask(req.params.id);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Human Approval resolution
app.post('/api/tasks/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const task = await approveStepAndResume(req.params.id, approved === true);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download generated report
app.get('/api/reports/:fileName', (req, res) => {
  try {
    const report = getReportFile(req.params.fileName);
    if (!report) {
      res.status(404).send('Report not found');
      return;
    }
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileName}"`);
    res.send(report.content);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Direct Tool Diagnostic Endpoint
app.post('/api/tools/:tool/test', async (req, res) => {
  const toolName = req.params.tool as ToolName;
  const params = req.body || {};
  const start = Date.now();

  try {
    const output = await executeTool(toolName, params);
    const verification = verifyStepOutcome(
      {
        id: 'test-step',
        stepNumber: 1,
        description: `Direct test of ${toolName}`,
        tool: toolName,
        params,
        dependencies: [],
        status: 'completed',
        retryCount: 0,
        maxRetries: 2,
      },
      output
    );

    res.json({
      tool: toolName,
      success: verification.verified,
      durationMs: Date.now() - start,
      output,
      verification,
    });
  } catch (err: any) {
    res.json({
      tool: toolName,
      success: false,
      durationMs: Date.now() - start,
      error: err.message || String(err),
      verification: {
        verified: false,
        timestamp: new Date().toISOString(),
        checkType: 'direct_tool_execution',
        expectedCriteria: 'Tool must execute without throwing errors',
        actualOutcome: err.message || 'Exception thrown during execution',
        details: 'Failed: Uncaught error during direct tool call.',
      },
    });
  }
});

// System HUD Stats
app.get('/api/stats', (req, res) => {
  try {
    const tasks = getAllTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const runningTasks = tasks.filter(t => t.status === 'running' || t.status === 'needs_approval').length;
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const stats: SystemStats = {
      totalTasks,
      completedTasks,
      failedTasks,
      runningTasks,
      successRate,
      toolCount: Object.keys(TOOLS).length,
      engineStatus: runningTasks > 0 ? 'executing' : 'idle',
    };

    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    mongo: getMongoStatus(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Config & Settings
app.get('/api/config', (req, res) => {
  res.json({
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiKeyMasked: process.env.GEMINI_API_KEY
      ? `${process.env.GEMINI_API_KEY.slice(0, 4)}...${process.env.GEMINI_API_KEY.slice(-4)}`
      : 'Not configured',
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    mongo: getMongoStatus(),
    tools: Object.values(TOOLS).map(t => ({
      name: t.name,
      displayName: t.displayName,
      description: t.description,
      isConsequential: t.isConsequential,
    })),
  });
});

app.post('/api/config', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey && typeof apiKey === 'string') {
    process.env.GEMINI_API_KEY = apiKey.trim();
    res.json({
      success: true,
      message: 'Gemini API Key updated successfully in server environment.',
      hasGeminiKey: true,
    });
  } else {
    res.status(400).json({ error: 'Valid apiKey string required.' });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`⚡ JarvisOS Agent Backend listening on http://localhost:${PORT}`);
  await connectDB();
  await syncStorageWithMongo();
  const mongoStatus = getMongoStatus();
  console.log(`📊 Storage Mode: ${mongoStatus.connected ? 'MongoDB Active' : 'Local Disk Fallback Active'}`);
});
