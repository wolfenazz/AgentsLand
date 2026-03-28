import React, { useState } from 'react';
import { AgentType } from '../../types';

interface AgentOption {
  type: AgentType;
  label: string;
  description: string;
}

const AGENT_OPTIONS: AgentOption[] = [
  { type: 'claude', label: 'Claude Code', description: 'Anthropic CLI agent' },
  { type: 'codex', label: 'Codex CLI', description: 'OpenAI CLI agent' },
  { type: 'gemini', label: 'Gemini CLI', description: 'Google CLI agent' },
  { type: 'opencode', label: 'OpenCode', description: 'Open-source CLI agent' },
  { type: 'cursor', label: 'Cursor Agent', description: 'Cursor CLI agent' },
];

interface NewTerminalDialogProps {
  onClose: () => void;
  onSelect: (agent: AgentType | null) => void;
  theme: 'dark' | 'light';
}

export const NewTerminalDialog: React.FC<NewTerminalDialogProps> = ({ onClose, onSelect, theme }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div
        className={`relative w-full max-w-sm mx-4 border rounded-lg shadow-2xl overflow-hidden ${
          isLight
            ? 'bg-zinc-100 border-zinc-300'
            : 'bg-zinc-950 border-zinc-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isLight ? 'border-zinc-300 bg-zinc-200/60' : 'border-zinc-800 bg-zinc-900/50'
        }`}>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className={`text-xs font-bold tracking-widest uppercase ${isLight ? 'text-zinc-700' : 'text-zinc-200'}`}>
              New Terminal
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isLight ? 'hover:bg-zinc-300 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 space-y-1">
          <button
            onClick={() => onSelect(null)}
            onMouseEnter={() => setHovered('shell')}
            onMouseLeave={() => setHovered(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 cursor-pointer ${
              hovered === 'shell'
                ? isLight
                  ? 'bg-zinc-200 shadow-sm'
                  : 'bg-zinc-800/80 shadow-sm'
                : ''
            }`}
          >
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isLight ? 'bg-zinc-300' : 'bg-zinc-800'
            }`}>
              <svg className={`w-4 h-4 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <div className={`text-xs font-bold tracking-wider uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                Default Shell
              </div>
              <div className={`text-[10px] tracking-wide ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                System default terminal
              </div>
            </div>
          </button>

          <div className={`my-2 border-t ${isLight ? 'border-zinc-300' : 'border-zinc-800'}`} />

          <div className={`text-[9px] font-bold tracking-widest uppercase px-3 pt-1 pb-0.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            AI Agents
          </div>

          {AGENT_OPTIONS.map((agent) => (
            <button
              key={agent.type}
              onClick={() => onSelect(agent.type)}
              onMouseEnter={() => setHovered(agent.type)}
              onMouseLeave={() => setHovered(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 cursor-pointer ${
                hovered === agent.type
                  ? isLight
                    ? 'bg-zinc-200 shadow-sm'
                    : 'bg-zinc-800/80 shadow-sm'
                  : ''
              }`}
            >
              <AgentLogo agent={agent.type} theme={theme} />
              <div className="text-left">
                <div className={`text-xs font-bold tracking-wider uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  {agent.label}
                </div>
                <div className={`text-[10px] tracking-wide ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {agent.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className={`px-4 py-2 border-t text-center ${
          isLight ? 'border-zinc-300 bg-zinc-200/40' : 'border-zinc-800 bg-zinc-900/30'
        }`}>
          <span className={`text-[9px] tracking-widest uppercase ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Esc to cancel
          </span>
        </div>
      </div>
    </div>
  );
};

const AgentLogo: React.FC<{ agent: AgentType; theme: 'dark' | 'light' }> = ({ agent, theme }) => {
  const isLight = theme === 'light';

  const iconMap: Record<AgentType, React.ReactNode> = {
    claude: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.3 3.3a.5.5 0 00-.6-.1l-2.5 1.3-2-3.2a.5.5 0 00-.8 0l-2 3.2-2.5-1.3a.5.5 0 00-.6.8l2.4 3.9L6 20.5a.5.5 0 00.3.6l2.5.8a.5.5 0 00.6-.3l2.6-8.5 2.6 8.5a.5.5 0 00.6.3l2.5-.8a.5.5 0 00.3-.6l-3.7-12.5 2.4-3.9a.5.5 0 00-.1-.7z"/>
      </svg>
    ),
    codex: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gemini: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
        <path d="M12 6v12M6 12h12" strokeWidth={1.5} stroke="currentColor" fill="none"/>
      </svg>
    ),
    opencode: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    cursor: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  };

  return (
    <div className={`w-8 h-8 rounded flex items-center justify-center ${
      isLight ? 'bg-zinc-300' : 'bg-zinc-800'
    }`}>
      <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
        {iconMap[agent]}
      </span>
    </div>
  );
};
