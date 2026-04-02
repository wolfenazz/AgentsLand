import { useEffect, useState } from 'react';
import { SetupScreen } from './components/setup/SetupScreen';
import { Workspace } from './components/workspace/Workspace';
import { DocsScreen } from './components/docs/DocsScreen';
import { UpdateNotification } from './components/common/UpdateNotification';
import { ContextMenu } from './components/common/ContextMenu';
import { useAppStore } from './stores/appStore';
import { initWindowPlatform } from './utils/window';

import { motion, AnimatePresence } from 'framer-motion';

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
    initWindowPlatform().then(setIsWindows).catch((err) => {
      console.error('Failed to initialize window platform:', err);
    });

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
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme' : ''} overflow-hidden`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="h-screen w-screen overflow-hidden"
        >
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
        </motion.div>
      </AnimatePresence>
      <UpdateNotification />
      <ContextMenu
        theme={theme}
        onThemeToggle={toggleTheme}
        onDocsClick={handleDocsClick}
        onNewWorkspace={() => setView('setup')}
      />
    </div>
  );
}

export default App;
