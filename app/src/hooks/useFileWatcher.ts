import { useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useAppStore } from '../stores/appStore';

export const useFileWatcher = (workspacePath: string | null) => {
  const setGitStatuses = useAppStore((s) => s.setGitStatuses);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshGitStatus = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const statuses = await invoke<any[]>('get_git_status', { workspacePath });
      setGitStatuses(statuses);
    } catch {
      setGitStatuses([]);
    }
  }, [workspacePath, setGitStatuses]);

  const debouncedRefresh = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      refreshGitStatus();
    }, 300);
  }, [refreshGitStatus]);

  useEffect(() => {
    if (!workspacePath) return;

    invoke('start_fs_watcher', { workspacePath }).catch((err) => {
      console.error('Failed to start file watcher:', err);
    });

    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen('file-system-changed', debouncedRefresh);
    };
    setupListener();

    return () => {
      invoke('stop_fs_watcher').catch(() => {});
      if (unlisten) unlisten();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [workspacePath, debouncedRefresh]);
};
