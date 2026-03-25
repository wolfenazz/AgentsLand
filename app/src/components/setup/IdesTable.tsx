import React, { useState, useEffect } from 'react';
import { useIde } from '../../hooks/useIde';
import { useAppStore } from '../../stores/appStore';
import { IdeInfo, IdeType } from '../../types';

import visualStudioIcon from '../../assets/Visual_Studio.png';
import cursorIcon from '../../assets/cursor-ai.png';
import zedIcon from '../../assets/zedlogo.png';
import webStormIcon from '../../assets/WebStormLOGO.png';
import intelliJIcon from '../../assets/IntelliJ_IDEA_Logo.png';
import sublimeIcon from '../../assets/sublime_logo.png';
import windsurfIcon from '../../assets/windsufrLogo.jpg';
import perplexityIcon from '../../assets/perplexityLogo.jpg';

interface IdesTableProps {
  selectedPath: string;
}

const IDE_ORDER: IdeType[] = ['vsCode', 'visualStudio', 'cursor', 'zed', 'webStorm', 'intelliJ', 'sublimeText', 'windsurf', 'perplexity'];

const IDE_ICONS: Record<IdeType, string> = {
  vsCode: visualStudioIcon,
  visualStudio: visualStudioIcon,
  cursor: cursorIcon,
  zed: zedIcon,
  webStorm: webStormIcon,
  intelliJ: intelliJIcon,
  sublimeText: sublimeIcon,
  windsurf: windsurfIcon,
  perplexity: perplexityIcon,
};

export const IdesTable: React.FC<IdesTableProps> = ({ selectedPath }) => {
  const { ideStatuses, detectAllIdes, launchIde, loading, error } = useIde();
  const { selectedIdes, toggleIde } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    detectAllIdes();
  }, [detectAllIdes]);

  const ideList = IDE_ORDER.map((ide) => ideStatuses[ide]).filter((ide): ide is IdeInfo => ide !== null);
  const installedCount = ideList.filter((ide) => ide.installed).length;
  const selectedInstalledIdes = selectedIdes.filter((ide) => ideStatuses[ide]?.installed);

  const handleToggleIde = (ide: IdeType) => {
    toggleIde(ide);
  };

  const handleExecute = async () => {
    if (!selectedPath || selectedInstalledIdes.length === 0 || isLaunching) return;

    setIsLaunching(true);
    for (const ide of selectedInstalledIdes) {
      await launchIde(ide, selectedPath);
    }
    setIsLaunching(false);
  };

  const getIdeIcon = (ide: IdeType): string => {
    return IDE_ICONS[ide] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-theme-secondary font-mono text-xs animate-pulse">
        <span>Detecting IDEs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-rose-400 font-mono">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-theme-secondary hover:text-theme-main font-mono text-xs transition-colors group"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="uppercase tracking-wider">IDEs</span>
        <span className="text-zinc-600">[{installedCount}/{ideList.length} installed]</span>
        <span className="text-zinc-700 group-hover:text-zinc-500 ml-1">[expand]</span>
      </button>

      {isOpen && (
        <div className="mt-3 overflow-hidden border border-theme rounded-sm">
          <table className="w-full">
            <thead className="bg-theme-card border-b border-theme">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-theme-secondary font-mono uppercase tracking-wider w-8">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-theme-secondary font-mono uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-theme-secondary font-mono uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-theme-secondary font-mono uppercase tracking-wider">
                  Path
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme bg-theme-main">
              {ideList.map((ide) => (
                <tr
                  key={ide.ide}
                  className={`hover:bg-theme-hover transition-colors ${!ide.installed ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIdes.includes(ide.ide)}
                      onChange={() => handleToggleIde(ide.ide)}
                      disabled={!ide.installed}
                      className="w-3.5 h-3.5 rounded border-theme bg-transparent checked:bg-emerald-500 checked:border-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={getIdeIcon(ide.ide)}
                        alt={ide.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="font-medium text-theme-main font-mono text-xs">
                          {ide.name}
                        </div>
                        <div className="text-[10px] text-theme-secondary font-mono">
                          {ide.binaryName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-xs font-mono ${ide.installed ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {ide.installed ? '✓ Installed' : '✗ Not Found'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-theme-secondary font-mono truncate max-w-[200px]">
                    {ide.path || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ideList.length === 0 && (
            <div className="p-4 text-center text-theme-secondary font-mono text-xs">
              No IDEs detected
            </div>
          )}

          <div className="p-3 border-t border-theme bg-theme-card flex items-center justify-between">
            <span className="text-[10px] text-theme-secondary font-mono">
              {selectedInstalledIdes.length} IDE{selectedInstalledIdes.length !== 1 ? 's' : ''} selected
              {!selectedPath && selectedInstalledIdes.length > 0 && (
                <span className="text-amber-400 ml-2">(Select a directory first)</span>
              )}
            </span>
            <button
              onClick={handleExecute}
              disabled={!selectedPath || selectedInstalledIdes.length === 0 || isLaunching}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {isLaunching ? 'Launching...' : 'Execute'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
