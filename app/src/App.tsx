import { useEffect, useState } from 'react';
import { SetupScreen } from './components/setup/SetupScreen';
import { Workspace } from './components/workspace/Workspace';
import { DocsScreen } from './components/docs/DocsScreen';
import { UpdateNotification } from './components/common/UpdateNotification';
import { useAppStore } from './stores/appStore';
import { initWindowPlatform } from './utils/window';

function App() {
  const { 
    view, 
    previousView,
    lastOpenedWorkspaceId, 
    workspaceList, 
    openWorkspaces, 
    openWorkspace, 
    setView, 
    setViewWithPrevious,
    theme,
    toggleTheme 
  } = useAppStore();
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    initWindowPlatform().then(setIsWindows);

    if (lastOpenedWorkspaceId && view === 'setup' && openWorkspaces.length === 0) {
      const lastWorkspace = workspaceList.find(w => w.id === lastOpenedWorkspaceId);
      if (lastWorkspace) {
        openWorkspace(lastWorkspace);
        setView('workspace');
      }
    }
  }, []);

  const handleDocsClick = () => {
    setViewWithPrevious('docs');
  };

  const handleBackFromDocs = () => {
    if (previousView) {
      setView(previousView);
    } else {
      setView('setup');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme' : ''}`}>
      {view === 'setup' && (
        <SetupScreen 
          isWindows={isWindows} 
          onDocsClick={handleDocsClick} 
        />
      )}
      {view === 'workspace' && (
        <Workspace 
          isWindows={isWindows} 
          onDocsClick={handleDocsClick} 
        />
      )}
      {view === 'docs' && (
        <DocsScreen
          isWindows={isWindows}
          onBack={handleBackFromDocs}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      <UpdateNotification />
    </div>
  );
}

export default App;
