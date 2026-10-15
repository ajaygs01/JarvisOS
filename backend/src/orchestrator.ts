import { getTask, saveTask } from './storage.js';
import { generateTaskPlan } from './planner.js';
import { executeTool, TOOLS } from './tools/index.js';
import { verifyStepOutcome, isTransientError } from './verifier.js';
import type { AgentTask, TaskStep, ExecutionLog, TaskStatus } from './types/agent.js';

type TaskUpdateListener = (task: AgentTask) => void;
const listeners: Set<TaskUpdateListener> = new Set();
const cancelledTasks: Set<string> = new Set();

export function onTaskUpdate(fn: TaskUpdateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function broadcastTaskUpdate(task: AgentTask): void {
  saveTask(task);
  for (const listener of listeners) {
    try {
      listener(task);
    } catch (e) {
      console.error('Error in task update listener:', e);
    }
  }
}

function addLog(task: AgentTask, level: ExecutionLog['level'], message: string, stepId?: string, details?: any): void {
  const log: ExecutionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    stepId,
    details,
  };
  task.logs.push(log);
  console.log(`[JarvisOS][${level.toUpperCase()}] ${message}`);
}

export async function createPlan(instruction: string): Promise<AgentTask> {
  const plan = await generateTaskPlan(instruction);
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const steps: TaskStep[] = plan.steps.map((s) => ({
    id: `step-${s.stepNumber}`,
    stepNumber: s.stepNumber,
    description: s.description,
    tool: s.tool,
    params: s.params,
    dependencies: s.dependencies.map(d => `step-${d}`),
    expectedOutput: s.expectedOutput,
    status: 'pending',
    retryCount: 0,
    maxRetries: 2,
  }));

  const task: AgentTask = {
    id: taskId,
    instruction,
    createdAt: new Date().toISOString(),
    status: 'pending',
    steps,
    logs: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Plan generated with ${steps.length} ordered execution steps: "${plan.taskSummary}"`,
      },
    ],
  };

  saveTask(task);
  broadcastTaskUpdate(task);
  return task;
}

export async function cancelTask(taskId: string): Promise<AgentTask> {
  cancelledTasks.add(taskId);
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found.`);
  }

  task.status = 'failed';
  task.completedAt = new Date().toISOString();
  task.requiresApproval = undefined;

  addLog(task, 'warn', 'Task was cancelled by the user.');

  task.steps.forEach(s => {
    if (s.status === 'running' || s.status === 'pending' || s.status === 'needs_approval') {
      s.status = 'failed';
      s.error = 'Cancelled by user.';
    }
  });

  saveTask(task);
  broadcastTaskUpdate(task);
  return task;
}

export async function runTaskOrchestrator(taskId: string): Promise<AgentTask> {
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found.`);
  }

  // Clear previous cancellation flags
  cancelledTasks.delete(taskId);

  task.status = 'running';
  task.startedAt = task.startedAt || new Date().toISOString();
  addLog(task, 'info', `Initiating autonomous task execution for: "${task.instruction}"`);
  broadcastTaskUpdate(task);

  const stepOutputs: Record<string, any> = {};

  for (const step of task.steps) {
    if (cancelledTasks.has(taskId)) {
      addLog(task, 'warn', `Execution aborted due to user cancellation request.`);
      broadcastTaskUpdate(task);
      return task;
    }

    // Collect existing outputs from already completed steps
    if (step.status === 'completed' && step.output) {
      stepOutputs[step.id] = step.output;
      continue;
    }

    // Check dependencies
    const unmetDeps = step.dependencies.filter(depId => {
      const depStep = task.steps.find(s => s.id === depId);
      return !depStep || depStep.status !== 'completed';
    });

    if (unmetDeps.length > 0) {
      step.status = 'failed';
      step.error = `Dependency failure: required steps (${unmetDeps.join(', ')}) failed or were skipped.`;
      addLog(task, 'error', `Step #${step.stepNumber} blocked: dependencies [${unmetDeps.join(', ')}] were not satisfied.`, step.id);
      task.status = 'failed';
      broadcastTaskUpdate(task);
      return task;
    }

    // Check if tool requires human approval
    const toolDef = TOOLS[step.tool];
    if (toolDef && toolDef.isConsequential) {
      step.status = 'needs_approval';
      task.status = 'needs_approval';
      task.requiresApproval = {
        stepId: step.id,
        tool: step.tool,
        actionDescription: step.description,
        params: step.params,
        consequences: `This tool (${step.tool}) performs consequential operations and requires explicit user consent before execution.`,
      };
      addLog(task, 'warn', `Execution paused: Step #${step.stepNumber} requires human authorization.`, step.id);
      broadcastTaskUpdate(task);
      return task; // Wait for approval endpoint
    }

    // Step Execution with Verification & Auto-Retry Loop
    step.status = 'running';
    step.startedAt = new Date().toISOString();
    addLog(task, 'info', `Starting Step #${step.stepNumber}: ${step.description} [Tool: ${step.tool}]`, step.id);
    broadcastTaskUpdate(task);

    let stepSuccess = false;
    let currentAttempt = 0;

    while (currentAttempt <= step.maxRetries && !stepSuccess) {
      if (cancelledTasks.has(taskId)) {
        addLog(task, 'warn', `Execution aborted due to user cancellation request.`);
        broadcastTaskUpdate(task);
        return task;
      }

      try {
        // Feed upstream dependencies into params if needed
        const resolvedParams = { ...step.params };
        if (step.tool === 'generate_report') {
          // Merge upstream sources
          const allSources: Array<{ title: string; url: string }> = [...(resolvedParams.sources || [])];
          for (const depId of step.dependencies) {
            const out = stepOutputs[depId];
            if (out && Array.isArray(out.results)) {
              for (const r of out.results) {
                if (r.url && !allSources.some(s => s.url === r.url)) {
                  allSources.push({ title: r.title, url: r.url });
                }
              }
            }
          }
          resolvedParams.sources = allSources;
        }

        // For failure_test, pass the current attempt number
        if (step.tool === 'failure_test') {
          resolvedParams.attemptNumber = currentAttempt;
        }

        addLog(task, 'info', `Executing tool "${step.tool}" (Attempt #${currentAttempt + 1}/${step.maxRetries + 1})...`, step.id);
        const output = await executeTool(step.tool, resolvedParams);

        // Independent Outcome Verification Check
        addLog(task, 'info', `Tool execution returned. Running independent verification checks...`, step.id);
        const verification = verifyStepOutcome(step, output);
        step.verification = verification;

        if (!verification.verified) {
          throw new Error(`Independent verification check failed: ${verification.details}`);
        }

        // Success!
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.output = output;
        step.error = undefined;
        stepOutputs[step.id] = output;
        stepSuccess = true;

        if (step.tool === 'generate_report' && output.downloadUrl) {
          task.finalReportPath = output.filePath;
          task.downloadUrl = output.downloadUrl;
        }

        addLog(
          task,
          'success',
          `Step #${step.stepNumber} COMPLETED & VERIFIED: ${verification.actualOutcome}`,
          step.id,
          { verification }
        );
        broadcastTaskUpdate(task);
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        const isTransient = isTransientError(err);

        addLog(task, 'error', `Step #${step.stepNumber} execution error: ${errorMsg}`, step.id);

        if (isTransient && currentAttempt < step.maxRetries) {
          currentAttempt++;
          step.retryCount = currentAttempt;
          addLog(
            task,
            'warn',
            `Transient failure detected (${errorMsg}). Initiating auto-recovery retry #${currentAttempt} of ${step.maxRetries} after 1.5s backoff...`,
            step.id
          );
          broadcastTaskUpdate(task);
          // 1.5s exponential backoff delay
          await new Promise(r => setTimeout(r, 1500));
        } else {
          // Exhausted retries or unrecoverable error
          step.status = 'failed';
          step.error = errorMsg;
          step.completedAt = new Date().toISOString();
          task.status = 'failed';
          addLog(
            task,
            'error',
            `Step #${step.stepNumber} FAILED permanently after ${currentAttempt + 1} attempt(s). Halting dependent task execution.`,
            step.id
          );
          broadcastTaskUpdate(task);
          return task;
        }
      }
    }
  }

  // All steps completed successfully!
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.overallVerification = {
    verified: true,
    timestamp: new Date().toISOString(),
    checkType: 'full_task_verification',
    expectedCriteria: 'All steps must complete and pass independent verification checks',
    actualOutcome: `Successfully verified all ${task.steps.length} execution steps`,
    details: 'JarvisOS Orchestrator confirmed task objective is fully satisfied.',
  };

  addLog(task, 'success', `Task fully COMPLETED and verified! All ${task.steps.length} steps succeeded.`);
  broadcastTaskUpdate(task);
  return task;
}

export async function approveStepAndResume(taskId: string, approved: boolean): Promise<AgentTask> {
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found.`);
  }

  const req = task.requiresApproval;
  if (!req) {
    throw new Error(`Task ${taskId} does not have a pending approval request.`);
  }

  task.requiresApproval = undefined;

  const targetStep = task.steps.find(s => s.id === req.stepId);
  if (!targetStep) {
    throw new Error(`Target step ${req.stepId} not found.`);
  }

  if (approved) {
    addLog(task, 'info', `User approved consequential action for Step #${targetStep.stepNumber}. Resuming execution...`, targetStep.id);
    targetStep.status = 'pending';
    task.status = 'running';
    broadcastTaskUpdate(task);
    return runTaskOrchestrator(task.id);
  } else {
    addLog(task, 'warn', `User rejected consequential action for Step #${targetStep.stepNumber}. Halting execution.`, targetStep.id);
    targetStep.status = 'failed';
    targetStep.error = 'Action rejected by user during human authorization gate.';
    task.status = 'failed';
    broadcastTaskUpdate(task);
    return task;
  }
}

export async function rerunTask(taskId: string): Promise<AgentTask> {
  const task = getTask(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found.`);
  }

  cancelledTasks.delete(taskId);

  // Reset steps
  task.status = 'pending';
  task.startedAt = undefined;
  task.completedAt = undefined;
  task.finalReportPath = undefined;
  task.downloadUrl = undefined;
  task.requiresApproval = undefined;
  task.overallVerification = undefined;

  task.steps.forEach(s => {
    s.status = 'pending';
    s.retryCount = 0;
    s.error = undefined;
    s.output = undefined;
    s.verification = undefined;
    s.startedAt = undefined;
    s.completedAt = undefined;
  });

  addLog(task, 'info', `Task re-run requested by user. Reset all steps and logs.`);
  broadcastTaskUpdate(task);
  return runTaskOrchestrator(taskId);
}
