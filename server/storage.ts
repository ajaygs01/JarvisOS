import fs from 'node:fs';
import path from 'node:path';
import type { AgentTask } from '../src/types/agent.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const REPORTS_DIR = path.resolve(DATA_DIR, 'reports');
const TASKS_FILE = path.resolve(DATA_DIR, 'tasks.json');

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

export function getAllTasks(): AgentTask[] {
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

export function getTask(id: string): AgentTask | null {
  const tasks = getAllTasks();
  return tasks.find(t => t.id === id) || null;
}

export function saveTask(task: AgentTask): AgentTask {
  initStorage();
  const tasks = getAllTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.unshift(task); // newest first
  }
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  return task;
}

export function deleteTask(id: string): boolean {
  initStorage();
  const tasks = getAllTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length !== tasks.length) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
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
  
  return {
    fileName: finalName,
    filePath,
    sizeBytes: stats.size,
  };
}

export function getReportFile(fileName: string): { content: string; sizeBytes: number; filePath: string } | null {
  initStorage();
  const filePath = path.join(REPORTS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const stats = fs.statSync(filePath);
  return {
    content,
    sizeBytes: stats.size,
    filePath,
  };
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
