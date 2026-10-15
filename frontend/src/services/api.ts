import type { AgentTask, SystemStats, ToolName, ToolTestResult } from '../types/agent.js';

const API_BASE = '/api';

export async function planTask(instruction: string): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to plan task (${res.status})`);
  }
  return res.json();
}

export async function executeTask(taskId: string): Promise<{ message: string; taskId: string }> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/execute`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to execute task (${res.status})`);
  }
  return res.json();
}

export async function runTask(instruction: string): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to run task (${res.status})`);
  }
  return res.json();
}

export async function fetchTasks(): Promise<AgentTask[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function fetchTask(id: string): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  if (!res.ok) throw new Error(`Task ${id} not found`);
  return res.json();
}

export async function rerunTask(id: string): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/${id}/rerun`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to rerun task');
  return res.json();
}

export async function cancelTask(id: string): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/${id}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to cancel task');
  return res.json();
}

export async function approveTask(id: string, approved: boolean): Promise<AgentTask> {
  const res = await fetch(`${API_BASE}/tasks/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved }),
  });
  if (!res.ok) throw new Error('Failed to resolve approval request');
  return res.json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchConfig(): Promise<any> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateApiKey(apiKey: string): Promise<any> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) throw new Error('Failed to update API key');
  return res.json();
}

export async function testTool(tool: ToolName, params: any = {}): Promise<ToolTestResult> {
  const res = await fetch(`${API_BASE}/tools/${tool}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Tool test failed for ${tool}`);
  return res.json();
}

export function subscribeToTaskUpdates(onUpdate: (task: AgentTask) => void): () => void {
  let eventSource: EventSource | null = null;
  let active = true;

  function connect() {
    if (!active) return;
    try {
      eventSource = new EventSource(`${API_BASE}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const task: AgentTask = JSON.parse(event.data);
          onUpdate(task);
        } catch (e) {
          console.error('Failed to parse SSE task update:', e);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 3s
        if (active) {
          setTimeout(connect, 3000);
        }
      };
    } catch (e) {
      console.warn('SSE connection failed, will retry:', e);
      if (active) setTimeout(connect, 3000);
    }
  }

  connect();

  return () => {
    active = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
