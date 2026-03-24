import React from 'react';
import { TerminalSession } from '../../types';
import { getGridLayout } from '../../utils/grid';
import { TerminalPane } from './TerminalPane';

interface TerminalGridProps {
  sessions: TerminalSession[];
  isLoading?: boolean;
}

export const TerminalGrid: React.FC<TerminalGridProps> = ({ sessions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-zinc-800 rounded-full shadow-inner"></div>
            <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-60 animate-pulse">
            [ Initializing TTY Sessions ]
          </div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 font-mono">
        <div className="text-center space-y-2 opacity-60">
          <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">No terminal sessions available</div>
          <div className="text-[9px] lowercase mt-1">Check workspace path and system permissions</div>
        </div>
      </div>
    );
  }

  const gridClasses = getGridLayout(sessions.length);

  return (
    <div className={`h-full w-full grid gap-1 p-1 ${gridClasses}`}>
      {sessions
        .sort((a, b) => a.index - b.index)
        .map((session) => (
          <TerminalPane key={session.id} session={session} />
        ))}
    </div>
  );
};
