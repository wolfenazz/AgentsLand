import React from 'react';
import { WorkspaceConfig } from '../../types';

interface WorkspaceTabProps {
  workspace: WorkspaceConfig;
  isActive: boolean;
  sessionsCount: number;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
}

export const WorkspaceTab: React.FC<WorkspaceTabProps> = ({
  workspace,
  isActive,
  sessionsCount,
  onClick,
  onClose,
}) => {
  return (
    <div
      className={`
        group relative flex items-center gap-2 h-10 px-4 cursor-pointer select-none
        transition-all duration-200 border-r border-theme
        ${isActive
          ? 'bg-theme-card border-l-2 border-l-blue-600 bg-theme-card-active'
          : 'bg-theme-card hover:bg-theme-card-hover border-l-2 border-l-transparent'
        }
      `}
      onClick={onClick}
    >
      <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>

      <span className="text-xs font-bold text-theme-main tracking-wider truncate max-w-[140px]">
        {workspace.name}
      </span>

      {sessionsCount > 0 && (
        <span className={`
          text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-widest
          ${isActive
            ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30'
            : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30'
          }
        `}>
          {sessionsCount}
        </span>
      )}

      <button
        onClick={onClose}
        className={`
          ml-1 flex items-center justify-center w-5 h-5 rounded-sm
          transition-all duration-150
          ${isActive
            ? 'hover:bg-rose-900/30 text-zinc-500 hover:text-rose-400'
            : 'hover:bg-rose-900/20 text-zinc-600 hover:text-rose-400'
          }
        `}
        title="Close workspace"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
