import { useEffect, useState } from 'react';
import { SetupScreen } from './components/setup/SetupScreen';
import { Workspace } from './components/workspace/Workspace';
import { useAppStore } from './stores/appStore';
import { initWindowPlatform } from './utils/window';

function App() {
  const { view, lastOpenedWorkspaceId, workspaceList, openWorkspaces, openWorkspace, setView, theme } = useAppStore();
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

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme' : ''}`}>
      {view === 'setup' && <SetupScreen isWindows={isWindows} />}
      {view === 'workspace' && <Workspace isWindows={isWindows} />}
    </div>
  );
}

export default App;
