import React from 'react';

interface DirectorySelectorProps {
  selectedPath: string;
  onSelectDirectory: () => void;
}

export const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  selectedPath,
  onSelectDirectory,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-400 mb-2 font-mono">
        Workspace Directory
      </label>
      <div className="flex gap-2">
        <div className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-300 font-mono truncate">
          {selectedPath || '~/No/directory/selected'}
        </div>
        <button
          type="button"
          onClick={onSelectDirectory}
          className="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm hover:bg-zinc-700 hover:text-white font-mono transition-colors uppercase text-sm tracking-wider"
        >
          Browse
        </button>
      </div>
      {selectedPath && (
        <p className="mt-2 text-xs text-emerald-500 font-mono">
          [OK] Valid directory selected
        </p>
      )}
    </div>
  );
};
