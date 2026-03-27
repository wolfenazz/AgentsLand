import React, { useState, useCallback } from 'react';
import { FileEntry, GitFileChange } from '../../types';
import { invoke } from '@tauri-apps/api/core';
import { FileIcon } from './FileIcon';
import { GitStatusBadge } from './GitStatusBadge';
import { useAppStore } from '../../stores/appStore';

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
  onFileClick: (entry: FileEntry) => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  entry,
  depth,
  onFileClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const gitStatuses = useAppStore((s) => s.gitStatuses);
  const activeFilePath = useAppStore((s) => s.activeFilePath);

  const gitChange: GitFileChange | undefined = gitStatuses.find((g) => g.path === entry.path)?.change;
  const isActive = activeFilePath === entry.path;

  const handleClick = useCallback(async () => {
    if (entry.isDir) {
      if (!isExpanded && children.length === 0) {
        setIsLoading(true);
        try {
          const entries = await invoke<FileEntry[]>('list_directory_entries', { path: entry.path });
          setChildren(entries);
        } catch (err) {
          console.error('Failed to load directory:', err);
        }
        setIsLoading(false);
      }
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(entry);
    }
  }, [entry, isExpanded, children.length, onFileClick]);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[3px] pr-3 cursor-pointer group transition-colors duration-100 select-none ${
          isActive
            ? 'bg-emerald-950/20 text-emerald-300'
            : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {entry.isDir && (
          <svg
            className={`w-3 h-3 shrink-0 transition-transform duration-150 text-zinc-600 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {!entry.isDir && <span className="w-3 shrink-0" />}

        <FileIcon
          extension={entry.extension}
          isDir={entry.isDir}
          isOpen={isExpanded}
        />

        <span className="truncate text-xs flex-1">{entry.name}</span>

        {isLoading && (
          <svg className="w-3 h-3 animate-spin text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        {gitChange && <GitStatusBadge change={gitChange} />}
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
