import React, { useState } from 'react';
import { FileTab } from '../../types';
import { FileIcon } from '../explorer/FileIcon';
import { TabContextMenu } from './TabContextMenu';

interface EditorTabsProps {
  openFiles: FileTab[];
  activeFilePath: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
  onCloseOthers: (path: string) => void;
  onCloseToRight: (path: string) => void;
  onCloseAll: () => void;
  onCloseSaved: () => void;
  theme: 'dark' | 'light';
}

const getExtension = (name: string): string | null => {
  const parts = name.split('.');
  if (parts.length > 1) return parts[parts.length - 1].toLowerCase();
  return null;
};

export const EditorTabs: React.FC<EditorTabsProps> = ({
  openFiles,
  activeFilePath,
  onTabClick,
  onTabClose,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
  onCloseSaved,
  theme,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
    index: number;
  } | null>(null);

  if (openFiles.length === 0) return null;

  const hasDirty = openFiles.some((f) => f.isDirty);

  const handleContextMenu = (e: React.MouseEvent, path: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path, index });
  };

  const handleBarContextMenu = (e: React.MouseEvent) => {
    if (openFiles.length === 0) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path: openFiles[0].path,
      index: 0,
    });
  };

  return (
    <div
      className={`flex items-center overflow-x-auto shrink-0 relative ${theme === 'light' ? 'bg-zinc-100 border-b border-zinc-300' : 'bg-zinc-950 border-b border-zinc-800'}`}
      onContextMenu={handleBarContextMenu}
    >
      {openFiles.map((file, index) => {
        const isActive = file.path === activeFilePath;
        return (
          <div
            key={file.path}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 border-r cursor-pointer group min-w-0 max-w-[160px] transition-colors duration-100 ${
              isActive
                ? theme === 'light'
                  ? 'bg-white text-zinc-800 border-zinc-300'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-800/60'
                : theme === 'light'
                  ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 border-zinc-300'
                  : 'bg-zinc-950 text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-400 border-zinc-800/60'
            }`}
            onClick={() => onTabClick(file.path)}
            onContextMenu={(e) => handleContextMenu(e, file.path, index)}
          >
            <FileIcon
              extension={getExtension(file.name)}
              isDir={false}
              className="w-3.5 h-3.5 shrink-0"
            />
            <span className="text-[11px] truncate">{file.name}</span>

            {file.isDirty && (
              <span className={`w-2 h-2 rounded-full shrink-0 group-hover:hidden ${theme === 'light' ? 'bg-zinc-400' : 'bg-zinc-400'}`} />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file.path);
              }}
              className={`shrink-0 p-0.5 rounded transition-colors cursor-pointer ${
                file.isDirty
                  ? 'hidden group-hover:block hover:bg-zinc-700'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-zinc-700'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isActive && (
              <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${theme === 'light' ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
            )}
          </div>
        );
      })}

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            { label: 'Close', action: () => onTabClose(contextMenu.path), shortcut: 'Ctrl+W' },
            { label: 'Close Others', action: () => onCloseOthers(contextMenu.path) },
            { label: 'Close to the Right', action: () => onCloseToRight(contextMenu.path), disabled: contextMenu.index >= openFiles.length - 1 },
            { separator: true },
            { label: 'Close All', action: onCloseAll },
            { label: 'Close Saved', action: onCloseSaved, disabled: !hasDirty },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
