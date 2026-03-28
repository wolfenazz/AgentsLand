import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileEntry, FileContent, FileTab } from '../types';
import { useAppStore } from '../stores/appStore';

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'avif', 'tiff', 'tif',
  'pdf', 'docx', 'doc', 'xlsx', 'xls',
]);

function isLikelyBinary(entry: FileEntry): boolean {
  if (entry.extension && BINARY_EXTENSIONS.has(entry.extension.toLowerCase())) {
    return true;
  }
  return false;
}

export const useFileEditor = () => {
  const [isOpening, setIsOpening] = useState(false);
  const openFileTab = useAppStore((s) => s.openFileTab);

  const openFile = useCallback(async (entry: FileEntry) => {
    const { openFiles } = useAppStore.getState();
    const existing = openFiles.find((f) => f.path === entry.path);
    if (existing) {
      openFileTab(existing);
      return;
    }

    setIsOpening(true);
    try {
      if (isLikelyBinary(entry)) {
        const tab: FileTab = {
          path: entry.path,
          name: entry.name,
          language: entry.extension?.toLowerCase() ?? 'plaintext',
          content: '',
          originalContent: '',
          isDirty: false,
        };
        openFileTab(tab);
      } else {
        const result = await invoke<FileContent>('read_file_content', { path: entry.path });
        const tab: FileTab = {
          path: entry.path,
          name: entry.name,
          language: result.language,
          content: result.content,
          originalContent: result.content,
          isDirty: false,
        };
        openFileTab(tab);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
    setIsOpening(false);
  }, [openFileTab]);

  return { openFile, isOpening };
};
