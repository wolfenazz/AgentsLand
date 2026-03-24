import React from 'react';
import { TerminalSession } from '../../types';
import { getGridLayout } from '../../utils/grid';
import { TerminalPane } from './TerminalPane';

interface TerminalGridProps {
  sessions: TerminalSession[];
}

export const TerminalGrid: React.FC<TerminalGridProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No terminal sessions available</p>
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
