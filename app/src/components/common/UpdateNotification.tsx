import React from 'react';
import { useUpdater } from '../../hooks/useUpdater';

export const UpdateNotification: React.FC = () => {
  const {
    checking,
    downloading,
    downloadProgress,
    updateAvailable,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  } = useUpdater();

  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const handleDismiss = () => {
    setDismissed(true);
    dismissUpdate();
  };

  const handleUpdate = async () => {
    await downloadAndInstall();
  };

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>

        <div className="flex-1">
          <h4 className="text-sm font-medium text-white">Update Available</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Version {updateAvailable.version} is available (current: {updateAvailable.currentVersion})
          </p>

          {updateAvailable.body && (
            <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{updateAvailable.body}</p>
          )}

          {downloading && (
            <div className="mt-2">
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-200"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">Downloading... {downloadProgress}%</p>
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              disabled={downloading || checking}
              className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? 'Updating...' : checking ? 'Checking...' : 'Update Now'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={downloading}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-white transition-colors"
          disabled={downloading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
