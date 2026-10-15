import { getAllTasks, getTask, saveTask, deleteTask } from '../storage.js';
import type { AgentTask, TaskManagerOutput } from '../../src/types/agent.js';

export interface TaskManagerParams {
  action: 'create' | 'update' | 'list' | 'complete' | 'delete';
  taskId?: string;
  instruction?: string;
  status?: string;
  data?: Record<string, any>;
}

export async function executeTaskManager(params: TaskManagerParams): Promise<TaskManagerOutput> {
  const { action, taskId, instruction, status, data } = params;

  switch (action) {
    case 'list': {
      const all = getAllTasks();
      return {
        action: 'list',
        totalTasks: all.length,
        verified: true,
        data: all.map(t => ({ id: t.id, instruction: t.instruction, status: t.status, createdAt: t.createdAt })),
      };
    }

    case 'create': {
      if (!instruction) {
        throw new Error('Task instruction is required to create a task.');
      }
      const newTask: AgentTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        instruction,
        createdAt: new Date().toISOString(),
        status: (status as any) || 'pending',
        steps: [],
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Task initialized via Task Manager tool: "${instruction}"`,
          },
        ],
        ...(data || {}),
      };

      saveTask(newTask);

      // Read-back verification
      const verified = getTask(newTask.id);
      if (!verified || verified.id !== newTask.id) {
        throw new Error(`Read-back verification failed: Task ${newTask.id} was not properly committed to storage.`);
      }

      return {
        action: 'create',
        taskId: newTask.id,
        title: newTask.instruction,
        status: newTask.status,
        verified: true,
        data: newTask,
      };
    }

    case 'update':
    case 'complete': {
      if (!taskId) {
        throw new Error('Task ID is required for updating or completing a task.');
      }
      const existing = getTask(taskId);
      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found.`);
      }

      const targetStatus = action === 'complete' ? 'completed' : (status as any) || existing.status;
      existing.status = targetStatus;
      if (action === 'complete') {
        existing.completedAt = new Date().toISOString();
      }
      if (instruction) {
        existing.instruction = instruction;
      }

      saveTask(existing);

      // Read-back verification
      const verifyRead = getTask(taskId);
      if (!verifyRead || verifyRead.status !== targetStatus) {
        throw new Error(`Read-back verification failed: Task ${taskId} status is not ${targetStatus}.`);
      }

      return {
        action,
        taskId: existing.id,
        status: existing.status,
        verified: true,
        data: verifyRead,
      };
    }

    case 'delete': {
      if (!taskId) {
        throw new Error('Task ID is required for deleting a task.');
      }
      const success = deleteTask(taskId);
      // Read-back verification
      const checkDeleted = getTask(taskId);
      if (checkDeleted) {
        throw new Error(`Read-back verification failed: Task ${taskId} still exists after deletion.`);
      }

      return {
        action: 'delete',
        taskId,
        verified: success,
      };
    }

    default:
      throw new Error(`Unsupported task manager action: ${action}`);
  }
}
