import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { FileEntry } from '../../types';
import { FileTreeItem } from './FileTreeItem';
import { GitStatusBadge } from './GitStatusBadge';
import { useAppStore } from '../../stores/appStore';

interface FileExplorerProps {
  workspacePath: string;
  workspaceName: string;
  onFileClick: (entry: FileEntry) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  workspacePath,
  workspaceName,
  onFileClick,
}) => {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const gitStatuses = useAppStore((s) => s.gitStatuses);

  const loadDirectory = useCallback(async () => {
    try {
      const result = await invoke<FileEntry[]>('list_directory_entries', { path: workspacePath });
      setEntries(result);
    } catch (err) {
      console.error('Failed to load directory:', err);
    }
  }, [workspacePath]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadDirectory();
    setIsLoading(false);
  }, [loadDirectory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const setup = async () => {
      unlisten = await listen('file-system-changed', () => {
        refresh();
      });
    };
    setup();

    return () => {
      if (unlisten) unlisten();
    };
  }, [refresh]);

  const changeSummary = {
    added: gitStatuses.filter((g) => g.change === 'added' || g.change === 'untracked').length,
    modified: gitStatuses.filter((g) => g.change === 'modified').length,
    deleted: gitStatuses.filter((g) => g.change === 'deleted').length,
  };

  const hasChanges = changeSummary.added + changeSummary.modified + changeSummary.deleted > 0;

  const filteredEntries = searchQuery
    ? entries.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  return (
    <div className="h-full flex flex-col bg-theme-card border-r border-theme select-none overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-theme shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 16 16">
            <path d="M2 3.5h4l1.5 1.5H14a1 1 0 011 1V12a1 1 0 01-1 1H2a1 1 0 01-1-1v-8a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate">
            {workspaceName}
          </span>
        </div>
        <button
          onClick={refresh}
          className="p-1 hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
          title="Refresh"
        >
          <svg className="w-3 h-3 text-zinc-500 hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="px-2 py-1.5 border-b border-theme shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded-sm">
          <svg className="w-3 h-3 text-zinc-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="flex-1 bg-transparent text-[10px] text-zinc-300 placeholder-zinc-600 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-0.5 hover:bg-zinc-700/50 rounded cursor-pointer"
            >
              <svg className="w-2.5 h-2.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 min-h-0 scrollbar-thin">
        {isLoading && entries.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-zinc-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-zinc-600 text-[10px] uppercase tracking-widest">
            {searchQuery ? 'No matches' : 'Empty directory'}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <FileTreeItem
              key={entry.path}
              entry={entry}
              depth={0}
              onFileClick={onFileClick}
            />
          ))
        )}
      </div>

      {hasChanges && (
        <div className="px-3 py-1.5 border-t border-theme shrink-0">
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest">
            {changeSummary.added > 0 && (
              <div className="flex items-center gap-1">
                <GitStatusBadge change="added" />
                <span className="text-emerald-500">{changeSummary.added} new</span>
              </div>
            )}
            {changeSummary.modified > 0 && (
              <div className="flex items-center gap-1">
                <GitStatusBadge change="modified" />
                <span className="text-amber-500">{changeSummary.modified} mod</span>
              </div>
            )}
            {changeSummary.deleted > 0 && (
              <div className="flex items-center gap-1">
                <GitStatusBadge change="deleted" />
                <span className="text-rose-500">{changeSummary.deleted} del</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
