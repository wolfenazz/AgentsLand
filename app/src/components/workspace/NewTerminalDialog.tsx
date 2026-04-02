import React, { useState, useEffect } from 'react';
import { AgentType } from '../../types';
import claudeLogo from '../../assets/claude.png';
import codexLogo from '../../assets/codex.png';
import geminiLogo from '../../assets/gemini-cli-logo.svg';
import opencodeLogo from '../../assets/opencode.png';
import cursorLogo from '../../assets/cursor-ai.png';
import kiloLogo from '../../assets/kiloCode.gif';

interface AgentOption {
  type: AgentType;
  label: string;
  description: string;
  logo: string;
  color: string;
}

const AGENT_OPTIONS: AgentOption[] = [
  { type: 'claude', label: 'Claude Code', description: 'Anthropic CLI Orchestrator', logo: claudeLogo, color: '#D97757' },
  { type: 'codex', label: 'Codex CLI', description: 'OpenAI Intelligence Engine', logo: codexLogo, color: '#10A37F' },
  { type: 'gemini', label: 'Gemini CLI', description: 'Google Multimodal Assistant', logo: geminiLogo, color: '#4285F4' },
  { type: 'opencode', label: 'OpenCode', description: 'Open Source Autonomy', logo: opencodeLogo, color: '#FFFFFF' },
  { type: 'cursor', label: 'Cursor Agent', description: 'Contextual AI Environment', logo: cursorLogo, color: '#3178C6' },
  { type: 'kilo', label: 'Kilo Code', description: 'Lightweight AI Developer', logo: kiloLogo, color: '#8B5CF6' },
];

interface NewTerminalDialogProps {
  onClose: () => void;
  onSelect: (agent: AgentType | null) => void;
  theme: 'dark' | 'light';
}

export const NewTerminalDialog: React.FC<NewTerminalDialogProps> = ({ onClose, onSelect, theme }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spawn new session"
        className={`relative w-full max-w-[440px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden animate-popover-in font-mono ${
          isLight
            ? 'bg-zinc-900/95 border border-zinc-700'
            : 'bg-zinc-950/80 border border-white/[0.08]'
        } backdrop-blur-3xl rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Header */}
        <div className="px-6 pt-8 pb-4 relative flex flex-col items-center">
          <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-zinc-100' : 'text-zinc-100'}`}>
            Spawn New Session
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1 opacity-60">
            Terminal Orchestration
          </p>
          
          <button
            onClick={onClose}
            className={`absolute right-6 top-6 p-2 rounded-full transition-all duration-200 ${
              isLight ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-white/10 text-zinc-500'
            } hover:text-rose-500`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-3 pb-6 space-y-1.5">
          {/* Default Shell Option - Promoted & Clean */}
          <button
            onClick={() => onSelect(null)}
            onMouseEnter={() => setHovered('shell')}
            onMouseLeave={() => setHovered(null)}
            className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
              hovered === 'shell'
                ? isLight
                  ? 'bg-white text-black shadow-xl translate-x-1'
                  : 'bg-white text-black shadow-xl translate-x-1'
                : isLight
                  ? 'hover:bg-white/5 text-zinc-400'
                  : 'hover:bg-white/5 text-zinc-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
              hovered === 'shell'
                ? isLight ? 'bg-black/20' : 'bg-black/20'
                : isLight ? 'bg-white/5' : 'bg-white/5'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="text-[11px] font-bold tracking-wider uppercase">System Shell</div>
              <div className={`text-[9px] tracking-wide mt-0.5 opacity-60`}>
                Launch standard tty environment
              </div>
            </div>
          </button>

          <div className="pt-4 pb-2 flex items-center gap-4 px-4">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] whitespace-nowrap">Agent Fleet</span>
            <div className="h-px w-full bg-current opacity-[0.08]" />
          </div>

          <div className="grid grid-cols-1 gap-1">
            {AGENT_OPTIONS.map((agent) => (
              <button
                key={agent.type}
                onClick={() => onSelect(agent.type)}
                onMouseEnter={() => setHovered(agent.type)}
                onMouseLeave={() => setHovered(null)}
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  hovered === agent.type
                    ? isLight
                      ? 'bg-white/10 shadow-sm translate-x-1'
                      : 'bg-white/5 shadow-sm translate-x-1'
                    : 'bg-transparent'
                }`}
              >
                {/* Visual Indicator for Active Selection */}
                {hovered === agent.type && (
                  <div 
                    className="absolute left-0 w-1 h-6 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                )}

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 p-2 ${
                  hovered === agent.type
                    ? 'bg-white shadow-md scale-110'
                    : isLight ? 'bg-white/10 grayscale opacity-60' : 'bg-white/10 grayscale opacity-60'
                }`}>
                  <img 
                    src={agent.logo} 
                    alt={agent.label} 
                    className={`w-full h-full object-contain ${
                      hovered !== agent.type ? 'brightness-75' : ''
                    }`} 
                  />
                </div>

                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold tracking-wider uppercase ${
                      hovered === agent.type 
                        ? isLight ? 'text-zinc-100' : 'text-zinc-100'
                        : isLight ? 'text-zinc-400' : 'text-zinc-400'
                    }`}>
                      {agent.label}
                    </span>
                    {hovered === agent.type && (
                      <span className="text-[8px] font-bold opacity-40 px-1 border border-current rounded uppercase tracking-tighter">AI</span>
                    )}
                  </div>
                  <div className="text-[9px] text-zinc-500 tracking-wide mt-0.5 opacity-60">
                    {agent.description}
                  </div>
                </div>

                {hovered === agent.type && (
                  <div className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Bottom Status */}
        <div className={`px-6 py-4 flex items-center justify-between border-t ${
          isLight ? 'border-zinc-800 bg-zinc-900/50' : 'border-white/[0.04] bg-white/[0.02]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">session_ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-zinc-600 uppercase tracking-widest">dismiss</span>
            <kbd className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
              isLight ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}>ESC</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
