import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { AgentTask, AgentType } from '../types';

export const useAgent = () => {
  const [tasks, setTasks] = useState<Map<string, AgentTask>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTask = useCallback(async (
    sessionId: string,
    agent: AgentType,
    prompt: string,
    cwd: string,
    apiKey?: string
  ): Promise<AgentTask> => {
    setIsLoading(true);
    setError(null);

    try {
      const task = await invoke<AgentTask>('execute_agent_task', {
        request: {
          sessionId,
          agent,
          prompt,
          cwd,
        },
        apiKey,
      });

      setTasks((prev) => {
        const next = new Map(prev);
        next.set(task.id, task);
        return next;
      });

      return task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTaskStatus = useCallback(async (taskId: string): Promise<AgentTask> => {
    const task = await invoke<AgentTask>('get_agent_task_status', { taskId });
    setTasks((prev) => {
      const next = new Map(prev);
      next.set(taskId, task);
      return next;
    });
    return task;
  }, []);

  const cancelTask = useCallback(async (taskId: string): Promise<boolean> => {
    const result = await invoke<boolean>('cancel_agent_task', { taskId });
    if (result) {
      setTasks((prev) => {
        const next = new Map(prev);
        const task = next.get(taskId);
        if (task) {
          next.set(taskId, { ...task, status: 'cancelled' });
        }
        return next;
      });
    }
    return result;
  }, []);

  const listenToTaskUpdates = useCallback((taskId: string): Promise<UnlistenFn> => {
    return listen<AgentTask>(`agent-task-update:${taskId}`, (event) => {
      setTasks((prev) => {
        const next = new Map(prev);
        next.set(event.payload.id, event.payload);
        return next;
      });
    });
  }, []);

  return {
    tasks,
    isLoading,
    error,
    executeTask,
    getTaskStatus,
    cancelTask,
    listenToTaskUpdates,
  };
};
