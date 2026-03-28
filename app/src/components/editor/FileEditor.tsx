import React, { useEffect, useRef, useCallback, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { rust } from '@codemirror/lang-rust';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { useAppStore } from '../../stores/appStore';
import { EditorTabs } from './EditorTabs';
import { MarkdownPreview } from './MarkdownPreview';
import { ImagePreview, isImageFile } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { DocxPreview } from './DocxPreview';
import { SpreadsheetPreview } from './SpreadsheetPreview';
import { invoke } from '@tauri-apps/api/core';

const languageExtensions: Record<string, () => any> = {
  javascript: () => javascript({ jsx: true, typescript: false }),
  typescript: () => javascript({ jsx: true, typescript: true }),
  rust: () => rust(),
  python: () => python(),
  html: () => html(),
  css: () => css(),
  json: () => json(),
  markdown: () => markdown(),
  java: () => java(),
  cpp: () => cpp(),
};

const languageCompartment = new Compartment();
const themeCompartment = new Compartment();

const darkEditorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    backgroundColor: '#09090b',
    color: '#e4e4e7',
    height: '100%',
  },
  '.cm-scroller': {
    backgroundColor: '#09090b',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    padding: '4px 0',
    backgroundColor: '#09090b',
  },
  '.cm-gutters': {
    backgroundColor: '#0c0c0e',
    borderRight: '1px solid #27272a',
    color: '#52525b',
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#18181b',
    color: '#a1a1aa',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(63, 63, 70, 0.15)',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#27272a !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#27272a !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#a1a1aa',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-foldGutter': {
    backgroundColor: '#0c0c0e',
  },
}, { dark: true });

const lightEditorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    backgroundColor: '#f4f4f5',
    color: '#18181b',
    height: '100%',
  },
  '.cm-scroller': {
    backgroundColor: '#f4f4f5',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    padding: '4px 0',
    backgroundColor: '#f4f4f5',
  },
  '.cm-gutters': {
    backgroundColor: '#e4e4e7',
    borderRight: '1px solid #d4d4d8',
    color: '#a1a1aa',
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e4e4e7',
    color: '#52525b',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(24, 24, 27, 0.05)',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#bfdbfe !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#bfdbfe !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-foldGutter': {
    backgroundColor: '#e4e4e7',
  },
}, { dark: false });

const lightHighlightStyle = EditorView.theme({
  '.tok-keyword': { color: '#7c3aed' },
  '.tok-string': { color: '#059669' },
  '.tok-number': { color: '#d97706' },
  '.tok-comment': { color: '#9ca3af', fontStyle: 'italic' },
  '.tok-function': { color: '#2563eb' },
  '.tok-variableName': { color: '#18181b' },
  '.tok-operator': { color: '#52525b' },
  '.tok-meta': { color: '#9ca3af' },
  '.tok-propertyName': { color: '#0891b2' },
  '.tok typeName': { color: '#0891b2' },
  '.tok-punctuation': { color: '#71717a' },
  '.tok-atom': { color: '#ea580c' },
}, { dark: false });

const getExtension = (name: string): string | null => {
  const parts = name.split('.');
  if (parts.length > 1) return parts[parts.length - 1].toLowerCase();
  return null;
};

const getThemeExtensions = (t: string) =>
  t === 'light'
    ? [lightEditorTheme, lightHighlightStyle, syntaxHighlighting(defaultHighlightStyle, { fallback: true })]
    : [darkEditorTheme, oneDark];

export const FileEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const currentFileRef = useRef<string | null>(null);
  const callbacksRef = useRef<{
    updateFileContent: (path: string, content: string) => void;
    handleSave: () => void;
  }>({ updateFileContent: () => {}, handleSave: () => {} });

  const openFiles = useAppStore((s) => s.openFiles);
  const activeFilePath = useAppStore((s) => s.activeFilePath);
  const updateFileContent = useAppStore((s) => s.updateFileContent);
  const markFileSaved = useAppStore((s) => s.markFileSaved);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const closeFileTab = useAppStore((s) => s.closeFileTab);
  const closeOtherFiles = useAppStore((s) => s.closeOtherFiles);
  const closeFilesToRight = useAppStore((s) => s.closeFilesToRight);
  const closeAllFiles = useAppStore((s) => s.closeAllFiles);
  const closeSavedFiles = useAppStore((s) => s.closeSavedFiles);
  const theme = useAppStore((s) => s.theme);

  const [mdPreview, setMdPreview] = useState(false);

  const activeFile = openFiles.find((f) => f.path === activeFilePath);
  const fileExt = activeFile ? getExtension(activeFile.name) : null;
  const isMarkdown = activeFile?.language === 'markdown' || fileExt === 'md' || fileExt === 'markdown';
  const isImage = isImageFile(fileExt);
  const isPdf = fileExt === 'pdf';
  const isDocx = fileExt === 'docx' || fileExt === 'doc';
  const isSpreadsheet = fileExt === 'xlsx' || fileExt === 'xls';
  const isPreviewable = isImage || isPdf || isDocx || isSpreadsheet;

  const handleSave = useCallback(async () => {
    const { openFiles: files } = useAppStore.getState();
    const file = files.find((f) => f.path === currentFileRef.current);
    if (!file || !file.isDirty) return;
    try {
      await invoke('write_file_content', { path: file.path, content: file.content });
      markFileSaved(file.path);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  }, [markFileSaved]);

  callbacksRef.current = { updateFileContent, handleSave };

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    if (!activeFile || isPreviewable) {
      currentFileRef.current = null;
      return;
    }

    currentFileRef.current = activeFile.path;

    const langExt = languageExtensions[activeFile.language]?.() ?? [];

    const state = EditorState.create({
      doc: activeFile.content,
      extensions: [
        themeCompartment.of(getThemeExtensions(theme)),
        languageCompartment.of(langExt),
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        bracketMatching(),
        closeBrackets(),
        history(),
        indentOnInput(),
        highlightSelectionMatches(),
        foldGutter(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          indentWithTab,
          {
            key: 'Mod-s',
            run: () => {
              callbacksRef.current.handleSave();
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && currentFileRef.current) {
            callbacksRef.current.updateFileContent(currentFileRef.current, update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current === view) {
        view.destroy();
        viewRef.current = null;
      }
    };
  }, [activeFilePath]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: themeCompartment.reconfigure(getThemeExtensions(theme)),
    });
  }, [theme]);

  useEffect(() => {
    if (!viewRef.current || !activeFile) return;
    if (currentFileRef.current !== activeFile.path) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== activeFile.content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: activeFile.content },
      });
    }
  }, [activeFile?.content]);

  useEffect(() => {
    if (activeFile && !isMarkdown && !isPreviewable) {
      setMdPreview(false);
    }
  }, [activeFilePath, isMarkdown, isImage]);

  const handleTabClick = useCallback((path: string) => {
    setActiveFile(path);
  }, [setActiveFile]);

  const handleTabClose = useCallback((path: string) => {
    closeFileTab(path);
  }, [closeFileTab]);

  const getBreadcrumb = (filePath: string) => {
    const parts = filePath.replace(/\\/g, '/').split('/');
    return parts.slice(-3).join(' / ');
  };

  const showEditor = activeFile && !isPreviewable && !(isMarkdown && mdPreview);

  return (
    <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-zinc-100' : 'bg-[#09090b]'}`}>
      <EditorTabs
        openFiles={openFiles}
        activeFilePath={activeFilePath}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onCloseOthers={closeOtherFiles}
        onCloseToRight={closeFilesToRight}
        onCloseAll={closeAllFiles}
        onCloseSaved={closeSavedFiles}
        theme={theme}
      />

      {activeFile && (
        <div className={`flex items-center justify-between px-3 py-1 border-b shrink-0 ${theme === 'light' ? 'bg-zinc-200/60 border-zinc-300' : 'bg-zinc-950 border-zinc-800/60'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'} font-mono tracking-wider`}>
              {getBreadcrumb(activeFile.path)}
            </span>
            {activeFile.isDirty && (
              <span className="text-[9px] text-amber-500 uppercase tracking-widest">Modified</span>
            )}
          </div>
          {isMarkdown && (
            <button
              onClick={() => setMdPreview(!mdPreview)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                mdPreview
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : theme === 'light'
                    ? 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'
              }`}
              title={mdPreview ? 'Show source' : 'Show preview'}
            >
              {mdPreview ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
              {mdPreview ? 'Code' : 'Preview'}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div
          ref={editorRef}
          className={`absolute inset-0 ${theme === 'light' ? 'bg-zinc-100' : 'bg-[#09090b]'}`}
          style={{ visibility: showEditor ? 'visible' : 'hidden' }}
        />

        {activeFile && isImage && (
          <ImagePreview
            filePath={activeFile.path}
            fileName={activeFile.name}
            theme={theme}
          />
        )}

        {activeFile && isPdf && (
          <PdfPreview
            filePath={activeFile.path}
            fileName={activeFile.name}
            theme={theme}
          />
        )}

        {activeFile && isDocx && (
          <DocxPreview
            filePath={activeFile.path}
            fileName={activeFile.name}
            theme={theme}
          />
        )}

        {activeFile && isSpreadsheet && (
          <SpreadsheetPreview
            filePath={activeFile.path}
            fileName={activeFile.name}
            theme={theme}
          />
        )}

        {activeFile && isMarkdown && mdPreview && (
          <MarkdownPreview content={activeFile.content} theme={theme} />
        )}

        {!activeFile && (
          <div className={`absolute inset-0 flex items-center justify-center ${theme === 'light' ? 'bg-zinc-100' : 'bg-[#09090b]'}`}>
            <div className={`flex flex-col items-center gap-3 ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div className="text-[10px] uppercase tracking-widest opacity-50">
                Select a file to view
              </div>
              <div className="text-[9px] uppercase tracking-widest opacity-30">
                Ctrl+S to save
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
