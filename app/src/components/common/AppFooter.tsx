import React, { useState, useEffect } from 'react';
import { useUpdaterStore } from '../../stores/updaterStore';

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
    <footer className="flex-shrink-0 h-7 border-t border-theme bg-theme-card/80 backdrop-blur-sm select-none">
      <div className="h-full flex items-center justify-between px-3 font-mono text-[9px] tracking-wider uppercase">
        {/* Left: App Version */}
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="text-zinc-600">::</span>
          <span className="hover:text-theme-main transition-colors">v{version || '---'}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-500/70 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        </div>

        {/* Right: Update Status & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center h-5">
            {checking && (
              <div className="flex items-center gap-1.5 px-2 bg-zinc-800/30">
                <svg className="w-2.5 h-2.5 text-zinc-500 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-zinc-500">CHECKING...</span>
              </div>
            )}

            {!checking && error && (
              <div className="flex items-center gap-1 px-2 bg-red-500/10 text-red-500" title={error}>
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="max-w-[120px] truncate">ERROR</span>
              </div>
            )}

            {!checking && upToDate && (
              <div className="flex items-center gap-1 px-2 bg-emerald-500/10 text-emerald-500">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SYNCED</span>
              </div>
            )}

            {!checking && !downloading && updateAvailable && (
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <span className="animate-pulse">●</span>
                <span>UPDATE {updateAvailable.version}</span>
              </button>
            )}

            {downloading && (
              <div className="flex items-center gap-2 px-2 bg-emerald-500/10 text-emerald-500">
                <div className="w-12 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <span>{downloadProgress}%</span>
              </div>
            )}

            {!checking && !downloading && !updateAvailable && !upToDate && !error && (
              <button
                onClick={handleCheck}
                className="px-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
              >
                [ CHECK_UPDATES ]
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
