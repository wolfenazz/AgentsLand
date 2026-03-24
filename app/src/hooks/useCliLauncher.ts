import { useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { AgentType, CliLaunchState, AuthInfo } from '../types';
import { useAppStore } from '../stores/appStore';

export const useCliLauncher = () => {
  const launchStates = useAppStore(state => state.cliLaunchStates);
  const authInfos = useAppStore(state => state.authInfos);
  const setLaunchState = useAppStore(state => state.setLaunchState);
  const setAuthInfo = useAppStore(state => state.setAuthInfo);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await listen<CliLaunchState>('cli-launch-state-changed', (event) => {
        setLaunchState(event.payload.sessionId, event.payload);
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [setLaunchState]);

  const launchCli = useCallback(async (sessionId: string, agent: AgentType) => {
    await invoke('launch_cli_in_terminal', { sessionId, agent });
  }, []);

  const stopCli = useCallback(async (sessionId: string) => {
    await invoke('stop_cli_in_terminal', { sessionId });
  }, []);

  const restartCli = useCallback(async (sessionId: string) => {
    await invoke('restart_cli_in_terminal', { sessionId });
  }, []);

  const getLaunchState = useCallback(async (sessionId: string): Promise<CliLaunchState | null> => {
    const state = await invoke<Option<CliLaunchState>>('get_cli_launch_state', { sessionId });
    if (state) setLaunchState(sessionId, state);
    return state;
  }, [setLaunchState]);

  const getAllLaunchStates = useCallback(async (): Promise<CliLaunchState[]> => {
    const states = await invoke<CliLaunchState[]>('get_all_cli_launch_states');
    states.forEach(s => setLaunchState(s.sessionId, s));
    return states;
  }, [setLaunchState]);

  const checkAuth = useCallback(async (agent: AgentType): Promise<AuthInfo> => {
    const info = await invoke<AuthInfo>('check_cli_auth', { agent });
    setAuthInfo(agent, info);
    return info;
  }, [setAuthInfo]);

  const checkAllAuth = useCallback(async (): Promise<AuthInfo[]> => {
    const infos = await invoke<AuthInfo[]>('check_all_cli_auth');
    infos.forEach(info => setAuthInfo(info.agent, info));
    return infos;
  }, [setAuthInfo]);

  const getAuthInstructions = useCallback(async (agent: AgentType): Promise<string[]> => {
    return await invoke<string[]>('get_auth_instructions', { agent });
  }, []);

  const getBinaryName = useCallback(async (agent: AgentType): Promise<string> => {
    return await invoke<string>('get_cli_binary_name', { agent });
  }, []);

  const getLaunchStateSync = (sessionId: string): CliLaunchState | undefined => {
    return launchStates[sessionId];
  };

  const getAuthInfoSync = (agent: AgentType): AuthInfo | undefined => {
    return authInfos[agent];
  };

  return {
    launchStates,
    authInfos,
    launchCli,
    stopCli,
    restartCli,
    getLaunchState,
    getAllLaunchStates,
    checkAuth,
    checkAllAuth,
    getAuthInstructions,
    getBinaryName,
    getLaunchStateSync,
    getAuthInfoSync,
  };
};

type Option<T> = T | null;
