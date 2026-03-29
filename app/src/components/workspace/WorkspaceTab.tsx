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
        group relative flex items-center gap-3 h-9 px-4 rounded-xl cursor-pointer select-none
        transition-all duration-500 whitespace-nowrap border
        ${isActive
          ? 'bg-zinc-900/50 text-zinc-100 shadow-[0_8px_20px_-10px_rgba(59,130,246,0.3)] border-blue-500/30'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/80 border-transparent hover:border-zinc-800/50'
        }
      `}
      onClick={onClick}
    >
      <div className={`
        flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-500
        ${isActive ? 'text-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-zinc-600 group-hover:text-zinc-400 group-hover:bg-zinc-800/50'}
      `}>
        <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>

      <div className="flex flex-col -space-y-0.5">
        <span className={`text-[11px] font-black tracking-widest truncate max-w-[140px] uppercase transition-colors duration-300 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}>
          {workspace.name}
        </span>
        {isActive && (
          <div className="flex items-center gap-1 opacity-80 animate-in fade-in slide-in-from-bottom-1 duration-500">
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[7px] text-blue-500 font-black tracking-[0.2em] uppercase">SYSTEM::READY</span>
          </div>
        )}
      </div>

      {sessionsCount > 0 && (
        <div className={`
          flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] font-black transition-all duration-500 border
          ${isActive
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : 'bg-zinc-900/50 text-zinc-600 border-zinc-800/50 group-hover:text-zinc-400'
          }
        `}>
          {sessionsCount}
          <span className="text-[7px] opacity-50">TTY</span>
        </div>
      )}

      <button
        onClick={onClose}
        className={`
          ml-1 flex items-center justify-center w-6 h-6 rounded-lg
          transition-all duration-300
          ${isActive
            ? 'hover:bg-rose-500/20 text-zinc-600 hover:text-rose-400'
            : 'hover:bg-zinc-800 text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100'
          }
        `}
        title="Terminate connection"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {isActive && (
        <div className="absolute -bottom-[6px] left-4 right-4 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
      )}
    </div>
  );
};
