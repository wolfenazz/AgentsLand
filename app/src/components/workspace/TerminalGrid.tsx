import React, { useState, useRef, useCallback, useMemo } from 'react';
import { TerminalSession, AgentType } from '../../types';
import { TerminalPane } from './TerminalPane';
import { NewTerminalDialog } from './NewTerminalDialog';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../stores/appStore';

interface TerminalGridProps {
  sessions: TerminalSession[];
  isLoading?: boolean;
  theme: 'dark' | 'light';
}

function getGridDimensions(count: number): { cols: number; rows: number } {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: 3 };
}

function makeEqualSizes(n: number): number[] {
  const s = 100 / n;
  return Array.from({ length: n }, () => s);
}

const MIN_SIZE = 12;
const DIVIDER = 3;

export const TerminalGrid: React.FC<TerminalGridProps> = ({ sessions, isLoading, theme }) => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [colSizes, setColSizes] = useState<number[] | null>(null);
  const [rowSizes, setRowSizes] = useState<number[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    axis: 'col' | 'row';
    index: number;
    startPos: number;
    startSizes: number[];
  } | null>(null);

  const isLight = theme === 'light';
  const addSession = useAppStore((s) => s.addSession);
  const removeSession = useAppStore((s) => s.removeSession);
  const currentWorkspace = useAppStore((s) => s.currentWorkspace);

  const sorted = useMemo(() => [...sessions].sort((a, b) => a.index - b.index), [sessions]);
  const { cols, rows } = getGridDimensions(sorted.length);

  const activeColSizes = useMemo(() => {
    if (colSizes && colSizes.length === cols) {
      const total = colSizes.reduce((a, b) => a + b, 0);
      return colSizes.map((s) => (s / total) * 100);
    }
    return makeEqualSizes(cols);
  }, [colSizes, cols]);

  const activeRowSizes = useMemo(() => {
    if (rowSizes && rowSizes.length === rows) {
      const total = rowSizes.reduce((a, b) => a + b, 0);
      return rowSizes.map((s) => (s / total) * 100);
    }
    return makeEqualSizes(rows);
  }, [rowSizes, rows]);

  const gridTemplateColumns = activeColSizes.map((s) => `${s}%`).join(' ');
  const gridTemplateRows = activeRowSizes.map((s) => `${s}%`).join(' ');

  const handleAddTerminal = useCallback(async (agent: AgentType | null) => {
    if (!currentWorkspace) return;
    setShowNewDialog(false);
    try {
      const nextIndex = sessions.length > 0
        ? Math.max(...sessions.map((s) => s.index)) + 1
        : 0;
      const newSession = await invoke<TerminalSession>('create_single_terminal_session', {
        request: {
          workspaceId: currentWorkspace.id,
          workspacePath: currentWorkspace.path,
          index: nextIndex,
          agent,
        },
      });
      addSession(newSession);
      setColSizes(null);
      setRowSizes(null);
    } catch (err) {
      console.error('Failed to create terminal:', err);
    }
  }, [currentWorkspace, sessions, addSession]);

  const handleRemoveTerminal = useCallback(async (sessionId: string) => {
    try {
      await invoke('kill_session', { sessionId });
    } catch (err) {
      console.error('Failed to kill session:', err);
    }
    removeSession(sessionId);
    setColSizes(null);
    setRowSizes(null);
  }, [removeSession]);

  const getPointerPercent = useCallback((e: MouseEvent, axis: 'col' | 'row') => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    if (axis === 'col') {
      return ((e.clientX - rect.left) / rect.width) * 100;
    }
    return ((e.clientY - rect.top) / rect.height) * 100;
  }, []);

  const handleDividerDrag = useCallback((
    e: React.MouseEvent,
    axis: 'col' | 'row',
    dividerIndex: number
  ) => {
    e.preventDefault();
    const sizes = axis === 'col' ? activeColSizes : activeRowSizes;
    dragRef.current = {
      axis,
      index: dividerIndex,
      startPos: getPointerPercent(e.nativeEvent, axis),
      startSizes: [...sizes],
    };

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const { axis: a, index: idx, startPos: sp, startSizes: ss } = dragRef.current;
      const pos = getPointerPercent(ev, a);
      const diff = pos - sp;
      const newSizes = [...ss];
      const pairTotal = ss[idx] + ss[idx + 1];
      const newA = Math.max(MIN_SIZE, Math.min(pairTotal - MIN_SIZE, ss[idx] + diff));
      newSizes[idx] = newA;
      newSizes[idx + 1] = pairTotal - newA;

      if (a === 'col') setColSizes(newSizes);
      else setRowSizes(newSizes);
    };

    const handleUp = () => {
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    document.body.style.cursor = axis === 'col' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [activeColSizes, activeRowSizes, getPointerPercent]);

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className={`absolute inset-0 border-2 rounded-full shadow-inner ${isLight ? 'border-zinc-300' : 'border-zinc-800'}`} />
            <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
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
      <div className={`h-full flex flex-col items-center justify-center font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
        <div className="text-center space-y-4">
          <svg className={`w-12 h-12 mx-auto ${isLight ? 'text-zinc-300' : 'text-zinc-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className={`text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            No terminal sessions
          </div>
          <button
            onClick={() => setShowNewDialog(true)}
            className={`px-6 py-2.5 border rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
              isLight
                ? 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-700'
                : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            + New Terminal
          </button>
        </div>
        {showNewDialog && (
          <NewTerminalDialog
            onClose={() => setShowNewDialog(false)}
            onSelect={handleAddTerminal}
            theme={theme}
          />
        )}
      </div>
    );
  }

  const cellCount = cols * rows;

  return (
    <div className="h-full w-full flex flex-col">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            display: 'grid',
            gridTemplateColumns,
            gridTemplateRows,
            gap: '1px',
          }}
        >
          {Array.from({ length: cellCount }).map((_, cellIndex) => {
            const row = Math.floor(cellIndex / cols);
            const col = cellIndex % cols;
            const session = sorted[cellIndex] || null;

            return (
              <div
                key={cellIndex}
                className="relative overflow-hidden"
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              >
                {session ? (
                  <TerminalPane
                    session={session}
                    onClose={() => handleRemoveTerminal(session.id)}
                    theme={theme}
                  />
                ) : (
                  <div
                    className={`h-full flex items-center justify-center cursor-pointer transition-all duration-200 group/empty ${
                      isLight
                        ? 'bg-zinc-200/30 hover:bg-zinc-200/80'
                        : 'bg-zinc-900/20 hover:bg-zinc-900/50'
                    }`}
                    onClick={() => setShowNewDialog(true)}
                    title="Add terminal"
                  >
                    <div className={`flex flex-col items-center gap-2 transition-colors ${
                      isLight ? 'text-zinc-300 group-hover/empty:text-zinc-500' : 'text-zinc-800 group-hover/empty:text-zinc-500'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isLight
                          ? 'border-zinc-300 group-hover/empty:border-blue-400 group-hover/empty:bg-blue-50'
                          : 'border-zinc-800 group-hover/empty:border-blue-500/40 group-hover/empty:bg-blue-500/10'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className={`text-[8px] uppercase tracking-widest font-bold ${
                        isLight ? 'text-zinc-300 group-hover/empty:text-zinc-500' : 'text-zinc-800 group-hover/empty:text-zinc-500'
                      }`}>Add</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {cols > 1 && Array.from({ length: cols - 1 }).map((_, ci) => {
          const leftPercent = activeColSizes.slice(0, ci + 1).reduce((a, b) => a + b, 0);
          return (
            <div
              key={`col-${ci}`}
              onMouseDown={(e) => handleDividerDrag(e, 'col', ci)}
              className="absolute top-0 bottom-0 cursor-col-resize z-10 group/divider"
              style={{
                left: `calc(${leftPercent}% - ${DIVIDER / 2 + 0.5}px)`,
                width: `${DIVIDER}px`,
              }}
            >
              <div className={`w-px h-full transition-colors duration-100 mx-auto group-hover/divider:w-full group-active/divider:w-full rounded-full ${
                isLight
                  ? 'bg-zinc-300 group-hover/divider:bg-blue-400 group-active/divider:bg-blue-500'
                  : 'bg-zinc-800 group-hover/divider:bg-zinc-500 group-active/divider:bg-blue-500'
              }`} />
            </div>
          );
        })}

        {rows > 1 && Array.from({ length: rows - 1 }).map((_, ri) => {
          const topPercent = activeRowSizes.slice(0, ri + 1).reduce((a, b) => a + b, 0);
          return (
            <div
              key={`row-${ri}`}
              onMouseDown={(e) => handleDividerDrag(e, 'row', ri)}
              className="absolute left-0 right-0 cursor-row-resize z-10 group/divider"
              style={{
                top: `calc(${topPercent}% - ${DIVIDER / 2 + 0.5}px)`,
                height: `${DIVIDER}px`,
              }}
            >
              <div className={`h-px w-full transition-colors duration-100 my-auto group-hover/divider:h-full group-active/divider:h-full rounded-full ${
                isLight
                  ? 'bg-zinc-300 group-hover/divider:bg-blue-400 group-active/divider:bg-blue-500'
                  : 'bg-zinc-800 group-hover/divider:bg-zinc-500 group-active/divider:bg-blue-500'
              }`} />
            </div>
          );
        })}
      </div>

      <div className={`flex items-center justify-between px-3 py-1.5 shrink-0 border-t accent-line-top ${
        isLight ? 'border-zinc-300/50 bg-zinc-200/60' : 'border-zinc-800/50 bg-zinc-900/50'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-[9px] uppercase tracking-widest font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {sorted.length} session{sorted.length !== 1 ? 's' : ''}
          </span>
          <span className={`text-[9px] uppercase tracking-widest ${isLight ? 'text-zinc-300' : 'text-zinc-800'}`}>
            {cols}x{rows}
          </span>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
            isLight
              ? 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700'
              : 'border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
          title="New terminal"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      {showNewDialog && (
        <NewTerminalDialog
          onClose={() => setShowNewDialog(false)}
          onSelect={handleAddTerminal}
          theme={theme}
        />
      )}
    </div>
  );
};
