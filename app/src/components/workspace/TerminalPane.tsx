import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
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


export const TerminalPane: React.FC<TerminalPaneProps> = ({ session, onResize }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const cliLaunchedRef = useRef(false);

  const { listenToTaskUpdates } = useAgent();
  const { cliStatuses, installCli, installProgress, detectCli } = useAgentCli();
  const { launchCli, checkAuth, getAuthInstructions, getLaunchStateSync, getAuthInfoSync } = useCliLauncher();
  const [installing, setInstalling] = useState(false);

  const cliInfo: AgentCliInfo | null = session.agent ? cliStatuses[session.agent] : null;
  const isCliInstalled = cliInfo?.status === 'Installed';
  const launchState: CliLaunchState | undefined = session.agent ? getLaunchStateSync(session.id) : undefined;
  const authInfo: AuthInfo | undefined = session.agent ? getAuthInfoSync(session.agent) : undefined;

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      theme: {
        background: '#09090b',
        foreground: '#e4e4e7',
        cursor: '#a1a1aa',
        cursorAccent: '#09090b',
        selectionBackground: '#27272a',
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
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);

    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    xterm.onData(async (data) => {
      try {
        await invoke('write_to_terminal', { sessionId: session.id, input: data });
      } catch (error) {
        console.error('Failed to write to terminal:', error);
      }
    });

    xterm.onResize(({ cols, rows }) => {
      invoke('resize_terminal', { sessionId: session.id, cols, rows }).catch(console.error);
      onResize?.(cols, rows);
    });

    return () => {
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [session.id, onResize]);

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
    const isAlreadyLaunched = launchState?.status === 'Starting' || launchState?.status === 'Running';
    if (!session.agent || !isCliInstalled || cliLaunchedRef.current || isAlreadyLaunched) return;

    const timeout = setTimeout(() => {
      if (cliLaunchedRef.current) return;
      cliLaunchedRef.current = true;
      launchCli(session.id, session.agent!);
      checkAuth(session.agent!);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [session.id, session.agent, isCliInstalled, launchCli, checkAuth]);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (fitAddonRef.current && terminalRef.current) {
          fitAddonRef.current.fit();
        }
      }, 100);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    if (terminalRef.current) resizeObserver.observe(terminalRef.current);
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, []);

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

    // If CLI detection hasn't completed yet, check if the process is already running
    if (!cliInfo || cliInfo.status === 'Checking') {
      // If the process is already launched, show launch/auth badges
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
      // No launch state and no CLI info — detection in progress
      return null;
    }

    // If we have a running/starting launch state, prefer showing that
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

  // Re-fit terminal when size changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

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
