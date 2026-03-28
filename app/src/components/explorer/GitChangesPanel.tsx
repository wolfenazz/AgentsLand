import React, { useMemo, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFileStatus, GitDiffStat, FileEntry } from '../../types';
import { GitStatusBadge } from './GitStatusBadge';
import { FileIcon } from './FileIcon';

interface GitChangesPanelProps {
  gitStatuses: GitFileStatus[];
  gitDiffStats: GitDiffStat[];
  workspacePath: string;
  onFileClick: (entry: FileEntry) => void;
}

interface ChangedFile {
  path: string;
  name: string;
  change: 'added' | 'modified' | 'deleted' | 'untracked';
  linesAdded: number;
  linesDeleted: number;
}

const MIN_HEIGHT = 36;
const MAX_HEIGHT = 320;
const DEFAULT_HEIGHT = 140;

export const GitChangesPanel: React.FC<GitChangesPanelProps> = ({
  gitStatuses,
  gitDiffStats,
  workspacePath,
  onFileClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const changedFiles = useMemo(() => {
    const statsMap = new Map<string, GitDiffStat>();
    gitDiffStats.forEach((stat) => {
      statsMap.set(stat.path, stat);
    });

    const statusMap = new Map<string, GitFileStatus>();
    gitStatuses.forEach((status) => {
      statusMap.set(status.path, status);
    });

    const files: ChangedFile[] = [];

    gitStatuses.forEach((status) => {
      const path = status.path;
      const name = path.split(/[/\\]/).pop() || path;
      const stat = statsMap.get(path);

      files.push({
        path,
        name,
        change: status.change,
        linesAdded: stat?.linesAdded ?? 0,
        linesDeleted: stat?.linesDeleted ?? 0,
      });
    });

    const changeOrder: Record<string, number> = {
      modified: 0,
      added: 1,
      untracked: 2,
      deleted: 3,
    };

    files.sort((a, b) => {
      const orderDiff = changeOrder[a.change] - changeOrder[b.change];
      if (orderDiff !== 0) return orderDiff;
      return a.path.localeCompare(b.path);
    });

    return files;
  }, [gitStatuses, gitDiffStats]);

  const totalAdded = useMemo(
    () => changedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
    [changedFiles]
  );

  const totalDeleted = useMemo(
    () => changedFiles.reduce((sum, f) => sum + f.linesDeleted, 0),
    [changedFiles]
  );

  const maxChanges = useMemo(
    () => Math.max(...changedFiles.map((f) => f.linesAdded + f.linesDeleted), 1),
    [changedFiles]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
  }, [panelHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const delta = startYRef.current - e.clientY;
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeightRef.current + delta));
    setPanelHeight(newHeight);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleFileClick = useCallback((file: ChangedFile) => {
    const entry: FileEntry = {
      name: file.name,
      path: file.path,
      isDir: false,
      size: 0,
      modifiedAt: Date.now(),
      extension: file.name.includes('.') ? file.name.split('.').pop() || null : null,
    };
    onFileClick(entry);
  }, [onFileClick]);

  const getRelativePath = useCallback((fullPath: string) => {
    if (fullPath.startsWith(workspacePath)) {
      return fullPath.slice(workspacePath.length).replace(/^[\\/]/, '');
    }
    return fullPath.split(/[/\\]/).pop() || fullPath;
  }, [workspacePath]);

  if (changedFiles.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 border-t border-theme/60 bg-theme-card/50">
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/40 border-b border-theme/30 cursor-pointer select-none hover:bg-zinc-800/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <motion.svg
            className="w-3 h-3 text-zinc-400"
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.15 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
          <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wide">
            Changes
          </span>
          <span className="text-[9px] text-zinc-500 font-medium">
            {changedFiles.length} file{changedFiles.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-medium">
            <span className="text-emerald-400">+{totalAdded}</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-rose-400">-{totalDeleted}</span>
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: panelHeight - 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden relative"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors z-10"
              onMouseDown={handleMouseDown}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              <div className="py-0.5">
                {changedFiles.map((file) => {
                  const addedPercent = (file.linesAdded / maxChanges) * 100;
                  const deletedPercent = (file.linesDeleted / maxChanges) * 100;

                  return (
                    <div
                      key={file.path}
                      className="group flex items-center gap-1.5 px-3 py-1 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                      onClick={() => handleFileClick(file)}
                    >
                      <FileIcon
                        extension={file.name.includes('.') ? file.name.split('.').pop() || null : null}
                        isDir={false}
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-[10px] text-zinc-300 truncate min-w-0 flex-1 font-mono">
                        {getRelativePath(file.path)}
                      </span>
                      <GitStatusBadge change={file.change === 'untracked' ? 'untracked' : file.change} />
                      <span className="text-[9px] font-mono shrink-0 tabular-nums">
                        {file.linesAdded > 0 && (
                          <span className="text-emerald-500">+{file.linesAdded}</span>
                        )}
                        {file.linesAdded > 0 && file.linesDeleted > 0 && (
                          <span className="text-zinc-600 mx-0.5">/</span>
                        )}
                        {file.linesDeleted > 0 && (
                          <span className="text-rose-500">-{file.linesDeleted}</span>
                        )}
                      </span>
                      <div className="w-12 h-1.5 rounded-full overflow-hidden shrink-0 bg-zinc-800/80 flex">
                        <div
                          className="h-full bg-emerald-500/70 transition-all"
                          style={{ width: `${addedPercent}%` }}
                        />
                        <div
                          className="h-full bg-rose-500/70 transition-all"
                          style={{ width: `${deletedPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isResizing && (
        <div className="absolute inset-0 cursor-ns-resize z-50" />
      )}
    </div>
  );
};
