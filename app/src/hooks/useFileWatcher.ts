import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useAppStore } from '../stores/appStore';

export const useFileWatcher = (workspacePath: string | null) => {
  const setGitStatuses = useAppStore((s) => s.setGitStatuses);

  const startWatcher = useCallback(async () => {
    if (!workspacePath) return;
    try {
      await invoke('start_fs_watcher', { workspacePath });
    } catch (err) {
      console.error('Failed to start file watcher:', err);
    }
  }, [workspacePath]);

  const stopWatcher = useCallback(async () => {
    try {
      await invoke('stop_fs_watcher');
    } catch (err) {
      console.error('Failed to stop file watcher:', err);
    }
  }, []);

  const refreshGitStatus = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const statuses = await invoke<any[]>('get_git_status', { workspacePath });
      setGitStatuses(statuses);
    } catch {
      setGitStatuses([]);
    }
  }, [workspacePath, setGitStatuses]);

  useEffect(() => {
    if (!workspacePath) return;

    startWatcher();

    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen('file-system-changed', async () => {
        await refreshGitStatus();
      });
    };
    setupListener();

    return () => {
      stopWatcher();
      if (unlisten) unlisten();
    };
  }, [workspacePath, startWatcher, stopWatcher, refreshGitStatus]);
};
