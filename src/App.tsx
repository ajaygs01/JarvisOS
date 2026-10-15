import React, { useState, useEffect } from 'react';
import { Sidebar, type NavView } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { DashboardStats } from './components/DashboardStats.js';
import { CommandTerminal } from './components/CommandTerminal.js';
import { TaskExecutionGraph } from './components/TaskExecutionGraph.js';
import { TaskDetailsPanel } from './components/TaskDetailsPanel.js';
import { HistoryView } from './components/HistoryView.js';
import { IntegrationsView } from './components/IntegrationsView.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ApprovalModal } from './components/ApprovalModal.js';
import { DocumentUploadModal } from './components/DocumentUploadModal.js';
import { 
  fetchTasks, 
  fetchStats, 
  fetchConfig, 
  planTask,
  runTask, 
  executeTask, 
  cancelTask,
  rerunTask, 
  approveTask, 
  subscribeToTaskUpdates 
} from './services/api.js';
import type { AgentTask, SystemStats } from './types/agent.js';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  const [stats, setStats] = useState<SystemStats>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    runningTasks: 0,
    successRate: 100,
    toolCount: 5,
    engineStatus: 'idle',
  });

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const [fetchedTasks, fetchedStats, config] = await Promise.all([
        fetchTasks(),
        fetchStats(),
        fetchConfig(),
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
      setHasGeminiKey(Boolean(config.hasGeminiKey));

      // Set active task to newest running or pending task, or newest task
      if (!activeTask && fetchedTasks.length > 0) {
        const running = fetchedTasks.find(t => t.status === 'running' || t.status === 'needs_approval');
        setActiveTask(running || fetchedTasks[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to SSE updates from server orchestrator
    const unsubscribe = subscribeToTaskUpdates((updatedTask) => {
      setTasks(prev => {
        const index = prev.findIndex(t => t.id === updatedTask.id);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = updatedTask;
          return clone;
        }
        return [updatedTask, ...prev];
      });

      setActiveTask(prev => {
        if (!prev || prev.id === updatedTask.id) {
          return updatedTask;
        }
        return prev;
      });

      // Refresh HUD stats
      fetchStats().then(setStats).catch(console.error);
    });

    return () => unsubscribe();
  }, []);

  // Set default selected step when activeTask changes
  useEffect(() => {
    if (activeTask && activeTask.steps.length > 0) {
      const runningStep = activeTask.steps.find(s => s.status === 'running' || s.status === 'needs_approval');
      if (runningStep) {
        setSelectedStepId(runningStep.id);
      } else if (!selectedStepId || !activeTask.steps.some(s => s.id === selectedStepId)) {
        setSelectedStepId(activeTask.steps[0].id);
      }
    }
  }, [activeTask?.id, activeTask?.status]);

  // Command submit
  const handleInstructionSubmit = async (instruction: string, immediateExecute: boolean = true) => {
    setIsPlanning(true);
    try {
      const task = immediateExecute ? await runTask(instruction) : await planTask(instruction);
      setActiveTask(task);
      setCurrentView('dashboard');
    } catch (err: any) {
      alert(`Planning error: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  // Execution trigger
  const handleExecute = async (taskId: string) => {
    try {
      await executeTask(taskId);
    } catch (err: any) {
      alert(`Execution trigger failed: ${err.message}`);
    }
  };

  // Cancel trigger
  const handleCancel = async (taskId: string) => {
    try {
      const task = await cancelTask(taskId);
      setActiveTask(task);
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message}`);
    }
  };

  // Rerun trigger
  const handleRerun = async (taskId: string) => {
    try {
      const task = await rerunTask(taskId);
      setActiveTask(task);
    } catch (err: any) {
      alert(`Rerun failed: ${err.message}`);
    }
  };

  // Human approval resolution
  const handleApprovalResolve = async (approved: boolean) => {
    if (!activeTask) return;
    try {
      const task = await approveTask(activeTask.id, approved);
      setActiveTask(task);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // Document analysis submit
  const handleDocumentSubmit = (fileName: string, content: string) => {
    const instruction = `Analyze uploaded document "${fileName}" and summarize its important findings:\n\n${content}`;
    handleInstructionSubmit(instruction, true);
  };

  const activeCount = tasks.filter(t => t.status === 'running' || t.status === 'needs_approval').length;

  return (
    <div className="min-h-screen bg-[#050814] flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTaskCount={activeCount}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header
          currentView={currentView}
          onNewTask={() => setCurrentView('assistant')}
          engineStatus={stats.engineStatus}
          hasApiKey={hasGeminiKey}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {/* VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
            <div>
              <DashboardStats stats={stats} />
              <CommandTerminal
                onSubmit={handleInstructionSubmit}
                isPlanning={isPlanning}
                onOpenDocModal={() => setIsDocModalOpen(true)}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <TaskExecutionGraph
                    task={activeTask}
                    onExecute={handleExecute}
                    onRerun={handleRerun}
                    onCancel={handleCancel}
                    selectedStepId={selectedStepId}
                    onSelectStep={setSelectedStepId}
                  />
                </div>
                <div>
                  <TaskDetailsPanel
                    task={activeTask}
                    selectedStepId={selectedStepId}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ASSISTANT */}
          {currentView === 'assistant' && (
            <div className="max-w-4xl mx-auto">
              <CommandTerminal
                onSubmit={handleInstructionSubmit}
                isPlanning={isPlanning}
                onOpenDocModal={() => setIsDocModalOpen(true)}
              />
              <TaskExecutionGraph
                task={activeTask}
                onExecute={handleExecute}
                onRerun={handleRerun}
                onCancel={handleCancel}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
              />
              <TaskDetailsPanel
                task={activeTask}
                selectedStepId={selectedStepId}
              />
            </div>
          )}

          {/* VIEW: ACTIVE TASKS */}
          {currentView === 'tasks' && (
            <div>
              <TaskExecutionGraph
                task={activeTask}
                onExecute={handleExecute}
                onRerun={handleRerun}
                onCancel={handleCancel}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
              />
              <TaskDetailsPanel
                task={activeTask}
                selectedStepId={selectedStepId}
              />
            </div>
          )}

          {/* VIEW: HISTORY */}
          {currentView === 'history' && (
            <HistoryView
              tasks={tasks}
              onSelectTask={(task) => {
                setActiveTask(task);
                setCurrentView('dashboard');
              }}
              onRerunTask={handleRerun}
            />
          )}

          {/* VIEW: INTEGRATIONS */}
          {currentView === 'integrations' && (
            <IntegrationsView
              hasGeminiKey={hasGeminiKey}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Human Approval Modal */}
      <ApprovalModal
        request={activeTask?.requiresApproval}
        onResolve={handleApprovalResolve}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmitDocument={handleDocumentSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hasKey={hasGeminiKey}
        onKeyUpdated={loadData}
      />
    </div>
  );
}

export default App;
