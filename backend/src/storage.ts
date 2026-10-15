import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentTask } from './types/agent.js';
import { isMongoConnected } from './db/connection.js';
import { TaskModel } from './db/models/task.model.js';
import { ReportModel } from './db/models/report.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage points reliably to backend/data
const DATA_DIR = path.resolve(__dirname, '../data');
const REPORTS_DIR = path.resolve(DATA_DIR, 'reports');
const TASKS_FILE = path.resolve(DATA_DIR, 'tasks.json');

let memoryTasksCache: AgentTask[] | null = null;

export function initStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Sync memory cache and local disk with MongoDB on startup or reconnection
 */
export async function syncStorageWithMongo(): Promise<void> {
  if (!isMongoConnected()) return;

  try {
    const mongoCount = await TaskModel.countDocuments();
    if (mongoCount === 0) {
      // Seed MongoDB from local tasks.json if Mongo is newly connected
      const localTasks = readTasksFromDisk();
      if (localTasks.length > 0) {
        console.log(`[Storage] Seeding ${localTasks.length} tasks from local disk to MongoDB...`);
        for (const t of localTasks) {
          await TaskModel.findOneAndUpdate({ id: t.id }, t, { upsert: true });
        }
      }
    }

    // Refresh memory cache from MongoDB
    const docs = await TaskModel.find({}).sort({ createdAt: -1 }).lean();
    memoryTasksCache = docs.map((doc: any) => {
      const { _id, __v, ...rest } = doc;
      return rest as AgentTask;
    });
    console.log(`[Storage] Synced ${memoryTasksCache.length} tasks from MongoDB.`);
  } catch (err: any) {
    console.error('[Storage] Error during MongoDB sync:', err.message);
  }
}

function readTasksFromDisk(): AgentTask[] {
  initStorage();
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(raw);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

function writeTasksToDisk(tasks: AgentTask[]): void {
  initStorage();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

export function getAllTasks(): AgentTask[] {
  if (memoryTasksCache) {
    return memoryTasksCache;
  }
  const tasks = readTasksFromDisk();
  memoryTasksCache = tasks;
  return tasks;
}

export function getTask(id: string): AgentTask | null {
  const tasks = getAllTasks();
  return tasks.find(t => t.id === id) || null;
}

export function saveTask(task: AgentTask): AgentTask {
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.unshift(task); // newest first
  }
  memoryTasksCache = tasks;

  // Persist to local disk
  writeTasksToDisk(tasks);

  // Persist asynchronously to MongoDB if connected
  if (isMongoConnected()) {
    TaskModel.findOneAndUpdate({ id: task.id }, task, { upsert: true, new: true }).catch((err) => {
      console.error(`[Storage] Failed to persist task ${task.id} to MongoDB:`, err.message);
    });
  }

  return task;
}

export function deleteTask(id: string): boolean {
  const tasks = getAllTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length !== tasks.length) {
    memoryTasksCache = filtered;
    writeTasksToDisk(filtered);

    if (isMongoConnected()) {
      TaskModel.deleteOne({ id }).catch((err) => {
        console.error(`[Storage] Failed to delete task ${id} from MongoDB:`, err.message);
      });
    }
    return true;
  }
  return false;
}

export function saveReportFile(fileName: string, content: string): { fileName: string; filePath: string; sizeBytes: number } {
  initStorage();
  const safeName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const finalName = safeName.endsWith('.md') ? safeName : `${safeName}.md`;
  const filePath = path.join(REPORTS_DIR, finalName);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  const stats = fs.statSync(filePath);
  
  const result = {
    fileName: finalName,
    filePath,
    sizeBytes: stats.size,
  };

  if (isMongoConnected()) {
    ReportModel.findOneAndUpdate(
      { fileName: finalName },
      { fileName: finalName, content, sizeBytes: stats.size, filePath },
      { upsert: true }
    ).catch((err) => {
      console.error(`[Storage] Failed to save report ${finalName} to MongoDB:`, err.message);
    });
  }

  return result;
}

export function getReportFile(fileName: string): { content: string; sizeBytes: number; filePath: string } | null {
  initStorage();
  const filePath = path.join(REPORTS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    return {
      content,
      sizeBytes: stats.size,
      filePath,
    };
  }
  return null;
}

export function checkReportExists(fileName: string): { exists: boolean; sizeBytes: number; fullPath: string } {
  initStorage();
  const filePath = path.join(REPORTS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      sizeBytes: stats.size,
      fullPath: filePath,
    };
  }
  return {
    exists: false,
    sizeBytes: 0,
    fullPath: filePath,
  };
}
