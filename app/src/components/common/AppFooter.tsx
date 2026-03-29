import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdaterStore } from '../../stores/updaterStore';
import { useAppStore } from '../../stores/appStore';

export const AppFooter: React.FC = () => {
  const {
    checking,
    downloading,
    downloadProgress,
    updateAvailable,
    upToDate,
    error,
    checkForUpdates,
    downloadAndInstall,
    resetUpToDate,
    clearError,
  } = useUpdaterStore();

  const { currentWorkspace, sessions, theme } = useAppStore();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    if ('__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/app').then(({ getVersion }) => {
        getVersion().then(setVersion);
      });
    } else {
      setVersion('dev');
    }
  }, []);

  useEffect(() => {
    if (upToDate) {
      const timer = setTimeout(() => {
        resetUpToDate();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [upToDate, resetUpToDate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCheck = () => {
    checkForUpdates(true);
  };

  const handleUpdate = async () => {
    await downloadAndInstall();
  };

  return (
    <footer className="flex-shrink-0 h-7 border-t border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md select-none font-mono">
      <div className="h-full flex items-center justify-between px-3 text-[9px] tracking-widest uppercase">
        {/* Left: System Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-blue-500/50 font-black">SYS::</span>
            <span className="text-zinc-400 hover:text-blue-400 transition-colors cursor-default">v{version || '---'}</span>
          </div>

          <div className="h-3 w-px bg-zinc-800/50" />

          {currentWorkspace && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">WORKSPACE:</span>
              <span className="text-zinc-300 font-bold">{currentWorkspace.name}</span>
            </div>
          )}

          <div className="h-3 w-px bg-zinc-800/50" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-600">SESSIONS:</span>
            <span className="text-emerald-500 font-bold">{sessions.length}</span>
          </div>
        </div>

        {/* Middle: Live Indicator (Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-500/80 font-black tracking-[0.2em]">LIVE_ENV</span>
          </div>
        </div>

        {/* Right: Status & Updates */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">THEME:</span>
            <span className="text-zinc-400">{theme}</span>
          </div>

          <div className="h-3 w-px bg-zinc-800/50" />

          <div className="flex items-center min-w-[80px] justify-end">
            <AnimatePresence mode="wait">
              {checking ? (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1.5 text-zinc-500"
                >
                  <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>SYNCING...</span>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-sm border border-rose-500/20"
                  title={error}
                >
                  <span>ERR_SYNC</span>
                </motion.div>
              ) : upToDate ? (
                <motion.div
                  key="synced"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="flex items-center gap-1 text-emerald-500 font-bold"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>SYNCED</span>
                </motion.div>
              ) : updateAvailable ? (
                <motion.button
                  key="update"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleUpdate}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-black font-black rounded-sm hover:bg-amber-400 transition-colors"
                >
                  <span>UPDATE {updateAvailable.version}</span>
                </motion.button>
              ) : downloading ? (
                <motion.div
                  key="downloading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-emerald-500"
                >
                  <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <span className="font-black">{downloadProgress}%</span>
                </motion.div>
              ) : (
                <motion.button
                  key="check"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={handleCheck}
                  className="px-2 py-0.5 text-zinc-500 transition-all rounded-sm"
                >
                  [ REFRESH_SYS ]
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </footer>
  );
};
