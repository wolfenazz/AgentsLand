import React, { useCallback, useContext, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import type { NodeRendererProps } from 'react-arborist';
import type { TreeNodeData } from '../../hooks/useFileTree';
import { FileIcon } from './FileIcon';
import { GitStatusBadge } from './GitStatusBadge';
import type { FileEntry } from '../../types';

interface ExplorerContextValue {
  onFileClick: (entry: FileEntry) => void;
  gitStatuses: { path: string; change: 'added' | 'modified' | 'deleted' | 'untracked' }[];
  activeFilePath: string | null;
  onContextMenu: (e: React.MouseEvent, nodeData: TreeNodeData) => void;
}

export const ExplorerContext = React.createContext<ExplorerContextValue>({
  onFileClick: () => {},
  gitStatuses: [],
  activeFilePath: null,
  onContextMenu: () => {},
});

const ChevronIcon: React.FC<{ isOpen: boolean }> = memo(({ isOpen }) => (
  <motion.svg
    className="w-3 h-3 shrink-0 text-zinc-500"
    viewBox="0 0 20 20"
    fill="currentColor"
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </motion.svg>
));

const IndentGuides: React.FC<{ level: number }> = memo(({ level }) => {
  if (level === 0) return null;
  return (
    <div className="flex shrink-0" aria-hidden="true">
      {Array.from({ length: level }).map((_, i) => (
        <div
          key={i}
          className="w-[14px] border-l border-theme/30"
        />
      ))}
    </div>
  );
});

const EditInput: React.FC<{
  value: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}> = ({ value, onSubmit, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      const dotIndex = value.lastIndexOf('.');
      if (dotIndex > 0) {
        input.setSelectionRange(0, dotIndex);
      } else {
        input.select();
      }
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        onSubmit(inputRef.current?.value ?? value);
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    },
    [onSubmit, onCancel, value]
  );

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      className="flex-1 bg-zinc-800 text-xs text-zinc-200 px-1 py-0 outline-none border border-zinc-600 rounded-sm min-w-0"
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        e.stopPropagation();
        onSubmit(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

const TreeNodeInner: React.FC<NodeRendererProps<TreeNodeData>> = ({
  node,
  style,
  dragHandle,
}) => {
  const ctx = useContext(ExplorerContext);
  const { onFileClick, gitStatuses, activeFilePath, onContextMenu } = ctx;
  const data = node.data;
  const isActive = activeFilePath === data.id;
  const gitChange = gitStatuses.find((g) => g.path === data.id)?.change;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      node.handleClick(e);
      if (data.isDir) {
        node.toggle();
      } else {
        const entry: FileEntry = {
          name: data.name,
          path: data.path,
          isDir: data.isDir,
          size: 0,
          modifiedAt: 0,
          extension: data.extension,
        };
        onFileClick(entry);
      }
    },
    [node, data, onFileClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, data);
    },
    [data, onContextMenu]
  );

  const handleSubmitEdit = useCallback(
    (value: string) => {
      if (value.trim() && value.trim() !== data.name) {
        node.submit(value.trim());
      } else {
        node.reset();
      }
    },
    [node, data.name]
  );

  const handleCancelEdit = useCallback(() => {
    node.reset();
  }, [node]);

  return (
    <div
      ref={dragHandle}
      role="treeitem"
      aria-expanded={data.isDir ? node.isOpen : undefined}
      style={{
        ...style,
        paddingLeft: 0,
      }}
      className={`flex items-center gap-1 pr-3 cursor-pointer select-none group transition-colors duration-100 rounded-sm mx-1 ${
        isActive
          ? 'bg-zinc-800 text-zinc-100'
          : node.willReceiveDrop
            ? 'bg-zinc-700/30 text-zinc-300'
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <IndentGuides level={node.level} />

      <div className="flex items-center gap-1.5 py-1 flex-1 min-w-0 pl-1">
        {data.isDir ? (
          <ChevronIcon isOpen={node.isOpen} />
        ) : (
          <span className="w-3 shrink-0" />
        )}

        <FileIcon
          extension={data.extension}
          isDir={data.isDir}
          isOpen={node.isOpen}
          name={data.name}
          className="w-4 h-4 shrink-0"
        />

        {node.isEditing ? (
          <EditInput
            value={data.name}
            onSubmit={handleSubmitEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <span className="truncate text-xs flex-1">{data.name}</span>
        )}

        {gitChange && !node.isEditing && <GitStatusBadge change={gitChange} />}
      </div>
    </div>
  );
};

export const TreeNode = memo(TreeNodeInner);
