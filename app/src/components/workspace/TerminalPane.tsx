import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { AgentType, TerminalSession, AgentCliInfo, CliLaunchState, AuthInfo } from '../../types';
import { useAgent } from '../../hooks/useAgent';
import { useAgentCli } from '../../hooks/useAgentCli';
import { useCliLauncher } from '../../hooks/useCliLauncher';
import '@xterm/xterm/css/xterm.css';

import claudeLogo from '../../assets/claude.png';
import codexLogo from '../../assets/codex.png';
import geminiLogo from '../../assets/gemini-cli-logo.svg';
import opencodeLogo from '../../assets/opencode.png';
import cursorLogo from '../../assets/cursor-ai.png';

interface TerminalPaneProps {
  session: TerminalSession;
  onResize?: (cols: number, rows: number) => void;
}

const AGENT_LOGOS: Record<AgentType, string> = {
  claude: claudeLogo,
  codex: codexLogo,
  gemini: geminiLogo,
  opencode: opencodeLogo,
  cursor: cursorLogo,
};

const STATUS_COLORS = {
  idle: 'bg-zinc-600',
  running: 'bg-emerald-500',
  error: 'bg-rose-500',
};

const TERMINAL_THEME = {
  background: '#09090b',
  foreground: '#e4e4e7',
  cursor: '#a1a1aa',
  cursorAccent: '#09090b',
  selectionBackground: '#27272a',
  selectionForeground: '#e4e4e7',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#e5e5e5',
};

export const TerminalPane: React.FC<TerminalPaneProps> = ({ session, onResize }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cliLaunched, setCliLaunched] = useState(false);
  const terminalReadyRef = useRef(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { listenToTaskUpdates } = useAgent();
  const { cliStatuses, installCli, installProgress, detectCli } = useAgentCli();
  const { launchCli, checkAuth, getAuthInstructions, getLaunchStateSync, getAuthInfoSync } = useCliLauncher();
  const [installing, setInstalling] = useState(false);

  const cliInfo: AgentCliInfo | null = session.agent ? cliStatuses[session.agent] : null;
  const isCliInstalled = cliInfo?.status === 'Installed';
  const launchState: CliLaunchState | undefined = session.agent ? getLaunchStateSync(session.id) : undefined;
  const authInfo: AuthInfo | undefined = session.agent ? getAuthInfoSync(session.agent) : undefined;

  const handleFitAndResize = useCallback(() => {
    if (!fitAddonRef.current || !xtermRef.current) return;
    
    try {
      fitAddonRef.current.fit();
      const dims = xtermRef.current.rows !== undefined ? {
        cols: xtermRef.current.cols,
        rows: xtermRef.current.rows,
      } : null;
      
      if (dims) {
        const fontSize = xtermRef.current.options.fontSize || 13;
        const charWidth = Math.round(fontSize * 0.6);
        const charHeight = Math.round(fontSize * 1.2);
        
        invoke('resize_terminal', { 
          sessionId: session.id, 
          cols: dims.cols, 
          rows: dims.rows,
          pixelWidth: Math.round(dims.cols * charWidth),
          pixelHeight: Math.round(dims.rows * charHeight)
        }).catch(console.error);
        
        onResize?.(dims.cols, dims.rows);
      }
    } catch (e) {
      console.error('Error fitting terminal:', e);
    }
  }, [session.id, onResize]);

  const handleSearch = useCallback((direction: 'next' | 'prev') => {
    if (!searchAddonRef.current || !searchQuery) return;
    
    const options = {
      regex: false,
      wholeWord: false,
      caseSensitive: false,
      decorations: {
        matchBackground: '#3b8eea',
        activeMatchBackground: '#f5f543',
        matchOverviewRuler: '#3b8eea',
        activeMatchColorOverviewRuler: '#f5f543',
      },
    };
    
    if (direction === 'next') {
      searchAddonRef.current.findNext(searchQuery, options);
    } else {
      searchAddonRef.current.findPrevious(searchQuery, options);
    }
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    if (searchAddonRef.current) {
      searchAddonRef.current.clearDecorations();
    }
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      theme: TERMINAL_THEME,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const unicodeAddon = new Unicode11Addon();
    const webLinksAddon = new WebLinksAddon(async (event, uri) => {
      event.preventDefault();
      try {
        await invoke('open_url', { url: uri });
      } catch (e) {
        console.error('Failed to open URL:', e);
        window.open(uri, '_blank', 'noopener,noreferrer');
      }
    });

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(searchAddon);
    xterm.loadAddon(unicodeAddon);
    xterm.loadAddon(webLinksAddon);
    
    xterm.unicode.activeVersion = '11';
    
    xterm.open(terminalRef.current);

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;
    terminalReadyRef.current = true;

    setTimeout(() => {
      handleFitAndResize();
    }, 50);

    xterm.onData(async (data) => {
      try {
        await invoke('write_to_terminal', { sessionId: session.id, input: data });
      } catch (error) {
        console.error('Failed to write to terminal:', error);
      }
    });

    xterm.attachCustomKeyEventHandler((event) => {
      const isCtrl = event.ctrlKey || event.metaKey;
      
      if (isCtrl && event.key === 'c' && xterm.hasSelection()) {
        const selection = xterm.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).catch(console.error);
        }
        return false;
      }
      
      if (isCtrl && event.key === 'v') {
        navigator.clipboard.readText().then((text) => {
          if (text) {
            invoke('write_to_terminal', { sessionId: session.id, input: text }).catch(console.error);
          }
        }).catch(console.error);
        return false;
      }
      
      if (isCtrl && event.key === 'f') {
        setShowSearch(prev => !prev);
        return false;
      }
      
      if (isCtrl && event.key === 'l') {
        xterm.clear();
        return false;
      }
      
      if (isCtrl && event.shiftKey && event.key === 'C') {
        const selection = xterm.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).catch(console.error);
        }
        return false;
      }
      
      return true;
    });

    return () => {
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
    };
  }, [session.id, handleFitAndResize]);

  useEffect(() => {
    let mounted = true;

    const setupListener = async () => {
      const unlisten = await listen<string>(`terminal-output:${session.id}`, (event) => {
        if (!mounted) return;
        xtermRef.current?.write(event.payload);
      });
      return unlisten;
    };

    let unlistenFn: (() => void) | null = null;
    setupListener().then((fn) => {
      if (mounted) {
        unlistenFn = fn;
      } else {
        fn();
      }
    });

    return () => {
      mounted = false;
      if (unlistenFn) unlistenFn();
    };
  }, [session.id]);

  useEffect(() => {
    setCliLaunched(false);
    terminalReadyRef.current = false;
  }, [session.id]);

  useEffect(() => {
    if (!session.agent || cliLaunched) return;
    
    const isAlreadyLaunched = launchState?.status === 'Starting' || launchState?.status === 'Running';
    if (isAlreadyLaunched) {
      setCliLaunched(true);
      return;
    }
    
    if (!isCliInstalled || !terminalReadyRef.current) {
      const interval = setInterval(() => {
        if (isCliInstalled && terminalReadyRef.current && !cliLaunched) {
          clearInterval(interval);
          setCliLaunched(true);
          launchCli(session.id, session.agent!);
          checkAuth(session.agent!);
        }
      }, 500);
      
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    
    setCliLaunched(true);
    launchCli(session.id, session.agent!);
    checkAuth(session.agent!);
  }, [session.id, session.agent, isCliInstalled, launchState, cliLaunched, launchCli, checkAuth]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        handleFitAndResize();
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }
    
    const handleWindowResize = () => handleResize();
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleFitAndResize]);

  useEffect(() => {
    if (!session.agent) return;

    let unlisten: UnlistenFn | null = null;
    listenToTaskUpdates(session.agent).then((fn) => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, [session.agent, listenToTaskUpdates]);

  useEffect(() => {
    if (installProgress && installProgress.agent === session.agent) {
      if (installProgress.stage === 'Completed' || installProgress.stage === 'Failed') {
        setInstalling(false);
      }
    }
  }, [installProgress, session.agent]);

  const handleRetryInstall = async () => {
    if (!session.agent) return;
    setInstalling(true);
    await installCli(session.agent);
    if (session.agent) {
      await detectCli(session.agent);
    }
  };

  const handleAuthenticate = async () => {
    setShowAuthModal(true);
  };

  const getCliStatusBadge = () => {
    if (!session.agent) return null;

    if (!cliInfo || cliInfo.status === 'Checking') {
      if (launchState) {
        const launchBadge = getLaunchStatusBadge();
        const authBadge = getAuthStatusBadge();
        return (
          <div className="flex items-center gap-1">
            {launchBadge}
            {authBadge}
          </div>
        );
      }
      return null;
    }

    if (launchState?.status === 'Running' || launchState?.status === 'Starting') {
      return (
        <div className="flex items-center gap-1">
          {getLaunchStatusBadge()}
          {getAuthStatusBadge()}
        </div>
      );
    }

    switch (cliInfo.status) {
      case 'Installed':
        const launchBadge = getLaunchStatusBadge();
        const authBadge = getAuthStatusBadge();
        return (
          <div className="flex items-center gap-1">
            {launchBadge}
            {authBadge}
          </div>
        );
      case 'NotInstalled':
      case 'Error':
        return (
          <button
            onClick={handleRetryInstall}
            disabled={installing}
            className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 flex items-center gap-1 disabled:opacity-50"
            title={cliInfo.error || 'CLI not installed'}
          >
            {installing ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {installing ? 'Installing...' : 'Install CLI'}
          </button>
        );
      default:
        return null;
    }
  };

  const getLaunchStatusBadge = () => {
    if (!launchState) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono tracking-widest uppercase">
          Ready
        </span>
      );
    }

    switch (launchState.status) {
      case 'Starting':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-1 font-mono tracking-widest uppercase">
            <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Init
          </span>
        );
      case 'Running':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950 border border-emerald-900 text-emerald-500 flex items-center gap-1 font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm"></span>
            Active
          </span>
        );
      case 'Error':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-rose-950 opacity-80 border border-rose-900 text-rose-500 font-mono tracking-widest uppercase" title={launchState.error || 'Error'}>
            Error
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono tracking-widest uppercase">
            Ready
          </span>
        );
    }
  };

  const getAuthStatusBadge = () => {
    if (!authInfo) return null;

    switch (authInfo.status) {
      case 'Authenticated':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-950/50 border border-emerald-900 text-emerald-500/80 font-mono tracking-widest uppercase" title={authInfo.configPath || 'Authenticated'}>
            Auth_OK
          </span>
        );
      case 'NotAuthenticated':
        return (
          <button
            onClick={handleAuthenticate}
            className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-950 border border-amber-900 text-amber-500 hover:bg-amber-900 hover:text-amber-400 font-mono tracking-widest uppercase transition-colors"
          >
            !Login
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950 shadow-none transition-all duration-300 font-mono`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 ${STATUS_COLORS[session.status]} shadow-[0_0_2px_currentColor]`} />
          <span className="text-xs text-zinc-500 tracking-widest uppercase">TTY{session.index + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          {session.agent ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">
                <img
                  src={AGENT_LOGOS[session.agent]}
                  alt={session.agent}
                  className={`w-3.5 h-3.5 object-contain filter drop-shadow-[0_0_4px_rgba(255,255,255,0.1)] ${session.agent === 'opencode' || session.agent === 'cursor' || session.agent === 'codex'
                      ? 'invert brightness-[3.5] contrast-[1.5]'
                      : 'brightness-[2.2] contrast-[1.2]'
                    }`}
                />
                <span className="text-[10px] text-zinc-300 uppercase font-bold tracking-widest truncate max-w-[80px]">{session.agent}</span>
              </div>
              {getCliStatusBadge()}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800">
              <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">/BIN/SH</span>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
          <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.shiftKey ? 'prev' : 'next');
              } else if (e.key === 'Escape') {
                handleClearSearch();
              }
            }}
            placeholder="Search... (Enter to find, Shift+Enter for previous, Esc to close)"
            className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none"
            autoFocus
          />
          <button
            onClick={() => handleSearch('prev')}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300"
            title="Previous match"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => handleSearch('next')}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300"
            title="Next match"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleClearSearch}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300"
            title="Close search"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div ref={terminalRef} className="flex-1 overflow-hidden min-h-0 bg-[#09090b] p-0.5" />

      {showAuthModal && session.agent && (
        <AuthModal
          agent={session.agent}
          onClose={() => setShowAuthModal(false)}
          getAuthInstructions={getAuthInstructions}
        />
      )}
    </div>
  );
};

interface AuthModalProps {
  agent: AgentType;
  onClose: () => void;
  getAuthInstructions: (agent: AgentType) => Promise<string[]>;
}

const AuthModal: React.FC<AuthModalProps> = ({ agent, onClose, getAuthInstructions }) => {
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthInstructions(agent).then((instr) => {
      setInstructions(instr);
      setLoading(false);
    });
  }, [agent, getAuthInstructions]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 font-mono">
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-sm font-bold text-zinc-100 mb-4 tracking-widest uppercase border-b border-zinc-800 pb-2">
          &gt; Auth: {agent}
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Execute instructions:</p>
            <ul className="space-y-2 bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
              {instructions.map((instr, i) => (
                <li key={i} className="text-zinc-300 text-xs flex gap-2">
                  <span className="text-zinc-600 select-none">$&gt;</span>
                  <span>{instr}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 transition-colors uppercase tracking-widest text-xs rounded-sm"
          >
            [ Close ]
          </button>
        </div>
      </div>
    </div>
  );
};
