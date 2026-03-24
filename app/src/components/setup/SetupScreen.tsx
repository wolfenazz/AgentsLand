import React from 'react';
import { WorkspaceConfigForm } from './WorkspaceConfigForm';
import { CliToolsTable } from './CliToolsTable';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAppStore } from '../../stores/appStore';
import { minimizeWindow, maximizeWindow, closeWindow } from '../../utils/window';
import { WorkspaceTab } from '../workspace/WorkspaceTab';

interface SetupScreenProps {
  isWindows: boolean;
  onDocsClick: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ isWindows, onDocsClick }) => {
  const { setView, theme, toggleTheme, openWorkspaces, switchWorkspace, sessionsByWorkspace, closeWorkspace } = useAppStore();
  const {
    selectedPath,
    workspaceName,
    selectedLayout,
    selectDirectory,
    setWorkspaceName,
    setSelectedLayout,
    updateAgentFleet,
    createWorkspace,
    isValid,
    isAllocationValid,
  } = useWorkspace();

  const [isLaunching, setIsLaunching] = React.useState(false);

  const handleWorkspaceClick = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setView('workspace');
  };

  const handleWorkspaceClose = (workspaceId: string) => {
    closeWorkspace(workspaceId);
  };

  const handleCancel = () => {
    if (openWorkspaces.length > 0) {
      switchWorkspace(openWorkspaces[0].id);
      setView('workspace');
    }
  };

  const sessionsCountMap: Record<string, number> = {};
  Object.entries(sessionsByWorkspace).forEach(([workspaceId, sessions]) => {
    sessionsCountMap[workspaceId] = sessions.length;
  });

  const handleCreateWorkspace = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    try {
      await createWorkspace();
      setView('workspace');
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className={`h-screen bg-theme-main text-theme-main font-mono flex flex-col overflow-hidden ${theme === 'light' ? 'light-theme' : ''}`}>
      <header className={`
        fixed top-0 left-0 right-0 z-50 flex items-center h-10 bg-theme-main border-b border-theme select-none transition-colors
        ${isWindows ? 'titlebar-drag active:cursor-grabbing' : ''}
      `}>
        {/* Left: tab label */}
        <div className="flex items-center h-full titlebar-nodrag">
          <div className="flex items-center gap-2 px-3 h-full border-r border-theme bg-theme-card cursor-default">
            <span className="text-[10px] font-bold text-zinc-500 tracking-tighter uppercase">SHELL</span>
            <h1 className="text-xs font-bold text-theme-main tracking-wider truncate">
              AGENTSLAND
            </h1>
          </div>

          <button
            onClick={onDocsClick}
            className="flex items-center justify-center w-10 h-full border-l border-theme hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main"
            title="Documentation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>

        {/* Workspace tabs if there are open workspaces */}
        {openWorkspaces.length > 0 && (
          <div className="flex items-center h-full overflow-x-auto overflow-y-hidden titlebar-nodrag border-l border-theme">
            {openWorkspaces.map((workspace) => (
              <WorkspaceTab
                key={workspace.id}
                workspace={workspace}
                isActive={false}
                sessionsCount={sessionsCountMap[workspace.id] || 0}
                onClick={() => handleWorkspaceClick(workspace.id)}
                onClose={(e) => {
                  e.stopPropagation();
                  handleWorkspaceClose(workspace.id);
                }}
              />
            ))}
          </div>
        )}

        {/* Middle: Drag area spacer */}
        <div className="flex-1 h-full" />

        {/* Right: action buttons */}
        <div className="flex items-center h-full gap-0 titlebar-nodrag">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-full border-l border-theme hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main"
            title="Switch Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h1M3 9h1m12.728-4.272l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Custom window controls — Windows only */}
          {isWindows && (
            <div className="flex h-full border-l border-theme">
              <button
                onClick={minimizeWindow}
                className="w-10 h-full flex items-center justify-center hover:bg-theme-hover text-zinc-500 hover:text-zinc-200 transition-colors"
                title="Minimize"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6" /></svg>
              </button>
              <button
                onClick={maximizeWindow}
                className="w-10 h-full flex items-center justify-center hover:bg-theme-hover text-zinc-500 hover:text-zinc-200 transition-colors"
                title="Maximize"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12"><rect fill="none" stroke="currentColor" width="9" height="9" x="1.5" y="1.5" strokeWidth="1" /></svg>
              </button>
              <button
                onClick={closeWindow}
                className="w-12 h-full flex items-center justify-center hover:bg-rose-600 text-zinc-500 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 12 12">
                  <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M1,1 L11,11 M1,11 L11,1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 pt-20 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto py-12 space-y-8">
          <WorkspaceConfigForm
            selectedPath={selectedPath}
            workspaceName={workspaceName}
            selectedLayout={selectedLayout}
            isAllocationValid={isAllocationValid}
            hasOpenWorkspaces={openWorkspaces.length > 0}
            onSelectDirectory={selectDirectory}
            onWorkspaceNameChange={setWorkspaceName}
            onLayoutSelect={setSelectedLayout}
            onAllocationChange={updateAgentFleet}
            onCreateWorkspace={handleCreateWorkspace}
            onCancel={handleCancel}
            isValid={isValid}
          />

          <CliToolsTable />
        </div>
      </main>
    </div>
  );
};
