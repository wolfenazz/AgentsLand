import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TerminalGrid } from './TerminalGrid';
import { WorkspaceHeader } from './WorkspaceHeader';
import { AppFooter } from '../common/AppFooter';
import { FileExplorer } from '../explorer/FileExplorer';
import { FileEditor } from '../editor/FileEditor';
import { useFileEditor } from '../../hooks/useFileEditor';
import { useFileWatcher } from '../../hooks/useFileWatcher';
import { useTerminal } from '../../hooks/useTerminal';
import { useAgentCli } from '../../hooks/useAgentCli';
import { useCliLauncher } from '../../hooks/useCliLauncher';
import { useAppStore } from '../../stores/appStore';
import { minimizeWindow, maximizeWindow, closeWindow } from '../../utils/window';
import { FileEntry } from '../../types';

interface WorkspaceProps {
  isWindows: boolean;
  onDocsClick: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ isWindows, onDocsClick }) => {
  const {
    currentWorkspace,
    openWorkspaces,
    activeWorkspaceId,
    sessions,
    sessionsByWorkspace,
    clearCurrentWorkspace,
    markWorkspaceOpened,
    theme,
    toggleTheme,
    closeWorkspace,
    switchWorkspace,
    setView,
    setSessionsForWorkspace,
    explorerOpen,
    activeView,
    toggleExplorer,
    setActiveView,
    closeFileTab,
  } = useAppStore();
  const { createSessions, killAllSessions, killWorkspaceSessions, isLoading, error } = useTerminal();
  const { detectAllClis } = useAgentCli();
  const { checkAllAuth } = useCliLauncher();
  const { openFile } = useFileEditor();
  useFileWatcher(currentWorkspace?.path ?? null);
  const hasInitialized = useRef<Record<string, boolean>>({});
  const sidebarWidthRef = useRef(250);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isDragging = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentWorkspace && !hasInitialized.current[currentWorkspace.id]) {
      detectAllClis();
      checkAllAuth();

      const existingSessions = sessionsByWorkspace[currentWorkspace.id] || [];

      if (existingSessions.length === 0 && !isLoading) {
        hasInitialized.current[currentWorkspace.id] = true;
        createSessions({
          workspaceId: currentWorkspace.id,
          workspacePath: currentWorkspace.path,
          count: currentWorkspace.layout.sessions,
          agentFleet: currentWorkspace.agentFleet
        }).then((sessions) => {
          setSessionsForWorkspace(currentWorkspace.id, sessions);
        }).catch((err) => {
          console.error('Failed to initialize sessions:', err);
          hasInitialized.current[currentWorkspace!.id] = false;
        });
      } else if (existingSessions.length > 0) {
        hasInitialized.current[currentWorkspace.id] = true;
      }

      markWorkspaceOpened(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, sessionsByWorkspace, isLoading, error, detectAllClis, checkAllAuth, createSessions, setSessionsForWorkspace, markWorkspaceOpened]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!isDragging.current) return;
        const newWidth = Math.max(180, Math.min(500, e.clientX));
        sidebarWidthRef.current = newWidth;
        setSidebarWidth(newWidth);
      });
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          toggleExplorer();
        } else if (e.key === 'e') {
          e.preventDefault();
          setActiveView(activeView === 'terminal' ? 'editor' : 'terminal');
        } else if (e.key === 'w') {
          e.preventDefault();
          const path = useAppStore.getState().activeFilePath;
          if (path) {
            closeFileTab(path);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleExplorer, activeView, closeFileTab]);

  const handleFileClick = useCallback((entry: FileEntry) => {
    if (!entry.isDir) {
      openFile(entry);
    }
  }, [openFile]);

  const handleBackToSetup = useCallback(async () => {
    try {
      await killAllSessions();
    } catch (err) {
      console.error('Error killing sessions:', err);
    }
    clearCurrentWorkspace();
  }, [killAllSessions, clearCurrentWorkspace]);

  const handleWorkspaceClick = useCallback((workspaceId: string) => {
    switchWorkspace(workspaceId);
  }, [switchWorkspace]);

  const handleWorkspaceClose = useCallback(async (workspaceId: string) => {
    try {
      await killWorkspaceSessions(workspaceId);
    } catch (err) {
      console.error('Error killing workspace sessions:', err);
    }
    closeWorkspace(workspaceId);
    delete hasInitialized.current[workspaceId];
  }, [killWorkspaceSessions, closeWorkspace]);

  const handleNewWorkspace = useCallback(() => {
    setView('setup');
  }, [setView]);


  const sessionsCountMap: Record<string, number> = {};
  Object.entries(sessionsByWorkspace).forEach(([workspaceId, sessions]) => {
    sessionsCountMap[workspaceId] = sessions.length;
  });
  if (currentWorkspace && !sessionsCountMap[currentWorkspace.id]) {
    sessionsCountMap[currentWorkspace.id] = sessions.length;
  }

  if (!currentWorkspace && openWorkspaces.length === 0) {
    return null;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-theme-main text-rose-500 p-8 text-center font-mono">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest border-b border-rose-900/50 pb-2">Hardware Failure</h2>
          <p className="text-xs opacity-80 leading-relaxed">{error}</p>
          <button
            onClick={handleBackToSetup}
            className="px-6 py-2 bg-rose-950/30 border border-rose-900/50 text-rose-500 hover:bg-rose-900/40 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
          >
            [ Return to Shell ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 font-mono overflow-hidden text-zinc-300">
      <WorkspaceHeader
        workspaces={openWorkspaces}
        activeWorkspaceId={activeWorkspaceId}
        sessionsByWorkspace={sessionsCountMap}
        onWorkspaceClick={handleWorkspaceClick}
        onWorkspaceClose={handleWorkspaceClose}
        onNewWorkspace={handleNewWorkspace}
        onDocsClick={onDocsClick}
        isWindows={isWindows}
        onThemeToggle={toggleTheme}
        theme={theme}

        onMinimizeWindow={minimizeWindow}
        onMaximizeWindow={maximizeWindow}
        onCloseWindow={closeWindow}
        onSidebarToggle={toggleExplorer}
        onViewToggle={useCallback(() => setActiveView(activeView === "terminal" ? "editor" : "terminal"), [setActiveView, activeView])}
        activeView={activeView}
      />

      <main className="flex-1 overflow-hidden p-1 bg-zinc-950">
        {currentWorkspace ? (
          <div className="h-full flex gap-1 items-stretch">
            {explorerOpen && (
              <>
                <div 
                  style={{ width: `${sidebarWidth}px`, minWidth: '180px' }} 
                  className="shrink-0 overflow-hidden rounded-xl border border-zinc-800/30 bg-zinc-900/10 shadow-2xl transition-all duration-300"
                >
                  <FileExplorer
                    workspacePath={currentWorkspace.path}
                    workspaceName={currentWorkspace.name}
                    onFileClick={handleFileClick}
                  />
                </div>
                <div
                  className="w-1.5 hover:w-2 cursor-col-resize hover:bg-blue-500/40 active:bg-blue-500 transition-all duration-300 shrink-0 rounded-full my-4"
                  onMouseDown={handleSidebarResizeStart}
                />
              </>
            )}
            <div className="flex-1 min-w-0 rounded-xl border border-zinc-800/30 bg-zinc-900/5 shadow-2xl overflow-hidden relative">
              {activeView === "terminal" ? (
                <TerminalGrid sessions={sessions} isLoading={isLoading} theme={theme} />
              ) : (
                <FileEditor />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 h-full flex items-center justify-center text-zinc-500">
            <div className="text-center space-y-6 max-w-sm p-12 rounded-3xl border border-zinc-800/30 bg-zinc-900/20 backdrop-blur-xl shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 shadow-inner group cursor-default">
                 <svg className="w-10 h-10 text-zinc-600 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Environment_Offline</div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">No active workspace detected. Initialize a new session to begin operations.</p>
              </div>
              <button
                onClick={handleNewWorkspace}
                className="w-full px-6 py-3 bg-blue-500 text-black hover:bg-blue-400 transition-all text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer rounded-xl shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] active:scale-95"
              >
                [ Initialize_New_Session ]
              </button>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};
