import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useState, useCallback } from 'react';

interface UpdateInfo {
  version: string;
  currentVersion: string;
  date?: string;
  body?: string;
}

export function useUpdater() {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      const update = await check();

      if (update) {
        setUpdateAvailable({
          version: update.version,
          currentVersion: update.currentVersion,
          date: update.date,
          body: update.body,
        });
        return update;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    const update = await check();

    if (!update) {
      setError('No update available');
      return false;
    }

    setDownloading(true);
    setDownloadProgress(0);

    try {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            setDownloadProgress(0);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              const progress = (downloaded / contentLength) * 100;
              setDownloadProgress(Math.round(progress));
            }
            break;
          case 'Finished':
            setDownloadProgress(100);
            break;
        }
      });

      await relaunch();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install update');
      return false;
    } finally {
      setDownloading(false);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checking,
    downloading,
    downloadProgress,
    updateAvailable,
    error,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
    clearError,
  };
}
