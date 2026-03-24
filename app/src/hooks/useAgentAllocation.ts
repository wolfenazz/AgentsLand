import { useState, useMemo, useCallback } from 'react';
import { AgentType, AgentFleet } from '../types';

const STORAGE_KEY = 'agentsland-agent-allocation';

const loadPersistedAllocation = (): Record<AgentType, number> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn('Failed to load persisted agent allocation');
  }
  return null;
};

const persistAllocation = (allocation: Record<AgentType, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allocation));
  } catch {
    console.warn('Failed to persist agent allocation');
  }
};

const DEFAULT_ALLOCATION: Record<AgentType, number> = {
  claude: 0,
  codex: 0,
  gemini: 0,
  opencode: 0,
  cursor: 0,
};

const ALL_AGENTS: AgentType[] = ['claude', 'codex', 'gemini', 'opencode', 'cursor'];

export const useAgentAllocation = (totalSlots: number) => {
  const [allocation, setAllocation] = useState<Record<AgentType, number>>(() => {
    const persisted = loadPersistedAllocation();
    return persisted || DEFAULT_ALLOCATION;
  });

  const [enabledAgents, setEnabledAgents] = useState<Set<AgentType>>(() => {
    const persisted = loadPersistedAllocation();
    if (!persisted) return new Set(ALL_AGENTS);
    return new Set(
      (Object.entries(persisted) as [AgentType, number][])
        .filter(([, count]) => count > 0)
        .map(([agent]) => agent)
    );
  });

  const allocatedSlots = useMemo(() => {
    return Object.values(allocation).reduce((sum, count) => sum + count, 0);
  }, [allocation]);

  const remainingSlots = useMemo(() => {
    return Math.max(0, totalSlots - allocatedSlots);
  }, [totalSlots, allocatedSlots]);

  const utilizationPercentage = useMemo(() => {
    return totalSlots > 0 ? (allocatedSlots / totalSlots) * 100 : 0;
  }, [allocatedSlots, totalSlots]);

  const updateAllocation = useCallback((agent: AgentType, count: number) => {
    if (count < 0) return;
    
    setAllocation((prev) => {
      if (Object.values(prev).reduce((s, c) => s + c, 0) - prev[agent] + count > totalSlots) {
        return prev;
      }
      const newAllocation = { ...prev, [agent]: count };
      persistAllocation(newAllocation);
      return newAllocation;
    });
  }, [totalSlots]);

  const toggleAgent = useCallback((agent: AgentType) => {
    setEnabledAgents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agent)) {
        newSet.delete(agent);
        updateAllocation(agent, 0);
      } else {
        newSet.add(agent);
      }
      return newSet;
    });
  }, [updateAllocation]);

  const isValid = useMemo(() => allocatedSlots <= totalSlots, [allocatedSlots, totalSlots]);
  const isOverAllocated = useMemo(() => allocatedSlots > totalSlots, [allocatedSlots, totalSlots]);

  const getAgentFleet = useCallback((): AgentFleet => ({
    totalSlots,
    allocation,
  }), [totalSlots, allocation]);

  const resetAllocation = useCallback(() => {
    setAllocation(DEFAULT_ALLOCATION);
    setEnabledAgents(new Set(ALL_AGENTS));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    allocation,
    enabledAgents,
    allocatedSlots,
    remainingSlots,
    utilizationPercentage,
    isValid,
    isOverAllocated,
    updateAllocation,
    toggleAgent,
    getAgentFleet,
    resetAllocation,
  };
};
