import React from 'react';

interface FileIconProps {
  extension: string | null;
  isDir: boolean;
  isOpen?: boolean;
  className?: string;
}

const EXTENSION_COLORS: Record<string, string> = {
  ts: '#3b82f6',
  tsx: '#3b82f6',
  js: '#eab308',
  jsx: '#eab308',
  mjs: '#eab308',
  rs: '#f97316',
  py: '#22c55e',
  html: '#ef4444',
  htm: '#ef4444',
  css: '#a855f7',
  scss: '#a855f7',
  sass: '#a855f7',
  json: '#a1a1aa',
  md: '#e4e4e7',
  toml: '#f97316',
  yaml: '#ef4444',
  yml: '#ef4444',
  xml: '#ef4444',
  sql: '#3b82f6',
  sh: '#22c55e',
  bash: '#22c55e',
  go: '#06b6d4',
  java: '#f97316',
  c: '#3b82f6',
  h: '#3b82f6',
  cpp: '#3b82f6',
  rb: '#ef4444',
  php: '#a855f7',
  swift: '#f97316',
  kt: '#a855f7',
  lua: '#3b82f6',
  zig: '#f97316',
  png: '#22c55e',
  jpg: '#22c55e',
  jpeg: '#22c55e',
  svg: '#f97316',
  gif: '#22c55e',
  webp: '#22c55e',
  env: '#eab308',
  lock: '#a1a1aa',
};

const FileSvgIcon: React.FC<{ color: string; className?: string }> = ({ color, className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path d="M4 1.5h5L12 4.5v10a1 1 0 01-1 1H4a1 1 0 01-1-1v-13a1 1 0 011-1z" stroke={color} strokeWidth="1.2" />
    <path d="M9 1.5v3h3" stroke={color} strokeWidth="1.2" />
  </svg>
);

const FolderSvgIcon: React.FC<{ isOpen: boolean; className?: string }> = ({ isOpen, className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path
      d={isOpen
        ? "M2 3.5h4l1.5 1.5H14a1 1 0 011 1V12a1 1 0 01-1 1H2a1 1 0 01-1-1v-8a1 1 0 011-1z"
        : "M2 3.5h4l1.5 1.5H14a1 1 0 011 1V12a1 1 0 01-1 1H2a1 1 0 01-1-1v-8a1 1 0 011-1z"
      }
      stroke="#eab308"
      strokeWidth="1.2"
    />
  </svg>
);

export const FileIcon: React.FC<FileIconProps> = ({ extension, isDir, isOpen, className = 'w-4 h-4' }) => {
  if (isDir) {
    return <FolderSvgIcon isOpen={isOpen ?? false} className={className} />;
  }

  const color = extension ? (EXTENSION_COLORS[extension.toLowerCase()] ?? '#a1a1aa') : '#a1a1aa';

  return <FileSvgIcon color={color} className={className} />;
};
