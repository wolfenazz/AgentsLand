import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileEntry, FileContent, FileTab } from '../types';
import { useAppStore } from '../stores/appStore';

export const useFileEditor = () => {
  const [isOpening, setIsOpening] = useState(false);
  const openFileTab = useAppStore((s) => s.openFileTab);
  const openFiles = useAppStore((s) => s.openFiles);

  const openFile = useCallback(async (entry: FileEntry) => {
    const existing = openFiles.find((f) => f.path === entry.path);
    if (existing) {
      openFileTab(existing);
      return;
    }

    setIsOpening(true);
    try {
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
    } catch (err) {
      console.error('Failed to open file:', err);
    }
    setIsOpening(false);
  }, [openFileTab, openFiles]);

  return { openFile, isOpening };
};
