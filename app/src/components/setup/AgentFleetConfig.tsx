import React, { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AgentType, AgentFleet } from '../../types';
import { useAgentAllocation } from '../../hooks/useAgentAllocation';
import { useAgentCli } from '../../hooks/useAgentCli';
import { UtilizationBar } from '../common/UtilizationBar';
import { AgentCliStatusBadge } from './AgentCliStatusBadge';

import claudeLogo from '../../assets/claude.png';
import codexLogo from '../../assets/codex.png';
import geminiLogo from '../../assets/gemini-cli-logo.svg';
import opencodeLogo from '../../assets/opencode.png';
import cursorLogo from '../../assets/cursor-ai.png';

interface AgentFleetConfigProps {
  totalSlots: number;
  onAllocationChange: (fleet: AgentFleet) => void;
}

const AGENT_INFO: Record<AgentType, { label: string; color: string; logo: string }> = {
  claude: { label: 'Claude', color: 'bg-orange-500', logo: claudeLogo },
  codex: { label: 'Codex', color: 'bg-green-500', logo: codexLogo },
  gemini: { label: 'Gemini', color: 'bg-blue-500', logo: geminiLogo },
  opencode: { label: 'OpenCode', color: 'bg-purple-500', logo: opencodeLogo },
  cursor: { label: 'Cursor', color: 'bg-pink-500', logo: cursorLogo },
};

const ShellOnlyIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const AgentFleetConfig: React.FC<AgentFleetConfigProps> = ({
  totalSlots,
  onAllocationChange,
}) => {
  const {
    allocation,
    enabledAgents,
    allocatedSlots,
    isOverAllocated,
    updateAllocation,
    toggleAgent,
    getAgentFleet,
  } = useAgentAllocation(totalSlots);

  const {
    cliStatuses,
    detectAllClis,
    openInstallTerminal,
    installProgress,
  } = useAgentCli();

  const [installingAgent, setInstallingAgent] = React.useState<AgentType | null>(null);

  const remainingSlots = Math.max(0, totalSlots - allocatedSlots);

  useEffect(() => {
    detectAllClis();
  }, [detectAllClis]);

  useEffect(() => {
    if (installProgress && installProgress.stage === 'Completed') {
      setInstallingAgent(null);
    }
    if (installProgress && installProgress.stage === 'Failed') {
      setInstallingAgent(null);
    }
  }, [installProgress]);

  useEffect(() => {
    onAllocationChange(getAgentFleet());
  }, [allocation, totalSlots, onAllocationChange, getAgentFleet]);

  const isLaunchingRef = React.useRef(false);

  const handleInstall = async (agent: AgentType) => {
    if (isLaunchingRef.current) return;

    isLaunchingRef.current = true;
    try {
      await openInstallTerminal(agent);
    } finally {
      // Re-enable after a short delay
      setTimeout(() => {
        isLaunchingRef.current = false;
      }, 1000);
    }
  };

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="flex items-center justify-between pointer-events-none mb-2">
        <label className="block text-sm font-medium text-zinc-400">
          $ fleet_allocation
        </label>
        <button
          type="button"
          onClick={async () => {
            await invoke('clear_cli_cache');
            detectAllClis();
          }}
          className="pointer-events-auto p-1 rounded-sm hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
          title="Refresh CLI detection"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <UtilizationBar used={allocatedSlots} total={totalSlots} />
      {isOverAllocated && (
        <p className="text-sm text-rose-500 mt-2">
          [ERR] Cannot allocate more slots than available
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(AGENT_INFO).map(([agent, info]) => (
          <div
            key={agent}
            className={`p-4 rounded-sm border transition-colors ${enabledAgents.has(agent as AgentType)
              ? 'border-zinc-400 bg-zinc-900 border-solid'
              : 'border-zinc-800 bg-zinc-950 border-dashed opacity-60'
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 border border-zinc-800 rounded-sm ${agent === 'opencode' ? 'bg-white' : 'bg-zinc-950'}`}>
                  <img
                    src={info.logo}
                    alt={info.label}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="font-bold text-zinc-200 uppercase tracking-widest text-sm">{info.label}</span>
              </div>
              <button
                type="button"
                onClick={() => toggleAgent(agent as AgentType)}
                className={`relative inline-flex h-5 w-9 items-center rounded-none transition-colors border ${enabledAgents.has(agent as AgentType)
                  ? 'bg-zinc-200 border-zinc-200'
                  : 'bg-zinc-950 border-zinc-700'
                  }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform bg-zinc-900 transition-transform ${enabledAgents.has(agent as AgentType)
                    ? 'translate-x-[18px] bg-zinc-900'
                    : 'translate-x-1 bg-zinc-600'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 mt-2">
              <AgentCliStatusBadge
                cliInfo={cliStatuses[agent as AgentType]}
                onInstall={() => handleInstall(agent as AgentType)}
                installing={installingAgent === agent}
              />
            </div>

            {enabledAgents.has(agent as AgentType) && (
              <div className="flex items-center justify-center gap-1 mt-4 pt-4 border-t border-zinc-800/50">
                <button
                  type="button"
                  onClick={() =>
                    updateAllocation(agent as AgentType, allocation[agent as AgentType] - 1)
                  }
                  disabled={allocation[agent as AgentType] <= 0}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold text-zinc-100 bg-zinc-950 border-y border-zinc-800 h-8 flex items-center justify-center">
                  {allocation[agent as AgentType]}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateAllocation(agent as AgentType, allocation[agent as AgentType] + 1)
                  }
                  disabled={isOverAllocated}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 transition-colors"
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}

        <div
          className={`p-4 rounded-sm border transition-colors ${remainingSlots > 0
            ? 'border-zinc-600 bg-zinc-900 border-dashed'
            : 'border-zinc-800 bg-zinc-950 border-dotted opacity-50'
            }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-sm">
                <ShellOnlyIcon />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-zinc-300 uppercase tracking-widest text-sm">/bin/sh</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-6 mb-4">
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-center min-w-[120px]">
              <span className="text-xl font-bold text-zinc-200">{remainingSlots}</span>
              <span className="text-xs text-zinc-500 ml-2 uppercase">slot{remainingSlots !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center mt-4 pt-4 border-t border-zinc-800/50">
            Unallocated slots -&gt; native shells
          </p>
        </div>
      </div>
    </div>
  );
};
