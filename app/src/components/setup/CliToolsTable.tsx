import React, { useState, useEffect } from 'react';
import { useAgentCli } from '../../hooks/useAgentCli';
import { AgentCliInfo } from '../../types';

export const CliToolsTable: React.FC = () => {
  const { cliStatuses, detectAllClis, loading, error } = useAgentCli();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    detectAllClis();
  }, [detectAllClis]);

  const cliTools = Object.values(cliStatuses).filter((tool): tool is AgentCliInfo => tool !== null);
  const installedCount = cliTools.filter(t => t.status === 'Installed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Installed':
        return '+';
      case 'NotInstalled':
        return '-';
      case 'Checking':
        return '~';
      case 'Error':
        return '!';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
        <span className="animate-pulse">Detecting CLI tools...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-rose-400/80 font-mono">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 text-zinc-500 hover:text-zinc-300 font-mono text-xs transition-colors duration-150 cursor-pointer group"
      >
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
        <span className="uppercase tracking-[0.1em]">CLI Tools</span>
        <span className="px-2 py-0.5 rounded-full border border-zinc-800 text-[9px] text-zinc-500 bg-zinc-900/50">
          {installedCount}/{cliTools.length}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 overflow-hidden border border-theme rounded-lg bg-theme-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
            {cliTools.map((tool) => (
              <div
                key={tool.agent}
                className={`group/card flex flex-col items-center justify-center p-3.5 rounded-lg border transition-all duration-200 ${
                  tool.status === 'Installed'
                    ? 'border-zinc-700/60 bg-zinc-900/40 hover:bg-zinc-800/40'
                    : 'border-zinc-800/50 bg-zinc-950/30 opacity-60'
                }`}
              >
                <div className={`text-lg mb-2 font-mono font-bold ${
                  tool.status === 'Installed' ? 'text-emerald-400/80' : 'text-zinc-600'
                }`}>
                  {getStatusBadge(tool.status)}
                </div>
                <span className="text-[10px] font-mono text-zinc-300 text-center leading-tight">{tool.displayName}</span>
                <span className={`text-[9px] font-mono mt-1 ${
                  tool.status === 'Installed' ? 'text-emerald-500/60' : 'text-zinc-600'
                }`}>
                  {tool.status === 'Installed' ? (tool.version ? `v${tool.version}` : 'Ready') : 'Not Found'}
                </span>
              </div>
            ))}
          </div>

          {cliTools.length === 0 && (
            <div className="p-6 text-center text-zinc-500 font-mono text-xs">
              No CLI tools detected
            </div>
          )}
        </div>
      )}
    </div>
  );
};
