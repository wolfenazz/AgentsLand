import { useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useAppStore } from '../stores/appStore';
import type { GitDiffStat } from '../types';

export const useFileWatcher = (workspacePath: string | null) => {
  const setGitStatuses = useAppStore((s) => s.setGitStatuses);
  const setGitDiffStats = useAppStore((s) => s.setGitDiffStats);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshGitStatus = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const [statuses, diffStats] = await Promise.all([
        invoke<any[]>('get_git_status', { workspacePath }),
        invoke<GitDiffStat[]>('get_git_diff_stats', { workspacePath }),
      ]);
      setGitStatuses(statuses);
      setGitDiffStats(diffStats);
    } catch {
      setGitStatuses([]);
      setGitDiffStats([]);
    }
  }, [workspacePath, setGitStatuses, setGitDiffStats]);

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
