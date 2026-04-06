import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PrerequisiteStatus } from '../../../types';

export const SettingsEnvironment: React.FC = () => {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus[]>([]);
  const [checking, setChecking] = useState(false);
  const [nodejsStatus, setNodejsStatus] = useState<PrerequisiteStatus | null>(null);

  const checkAll = useCallback(async () => {
    setChecking(true);
    try {
      const [prereqs, nodejs] = await Promise.all([
        invoke<PrerequisiteStatus[]>('check_prerequisites'),
        invoke<PrerequisiteStatus>('check_nodejs'),
      ]);
      setPrerequisites(prereqs);
      setNodejsStatus(nodejs);
    } catch (err) {
      console.error('Failed to check environment:', err);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  const handleInstallNodejs = async () => {
    try {
      await invoke('open_url', { url: 'https://nodejs.org/en/download/current' });
    } catch (err) {
      console.error('Failed to open URL:', err);
    }
  };

  const handleRecheckNodejs = async () => {
    setChecking(true);
    try {
      const nodejs = await invoke<PrerequisiteStatus>('check_nodejs');
      setNodejsStatus(nodejs);
      const prereqs = await invoke<PrerequisiteStatus[]>('check_prerequisites');
      setPrerequisites(prereqs);
    } catch (err) {
      console.error('Failed to recheck Node.js:', err);
    } finally {
      setChecking(false);
    }
  };

  const allMet = prerequisites.length > 0 && prerequisites.every(p => p.installed && p.meetsMinimum);

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h2 className="text-xs font-mono font-bold text-[var(--accent-text)] uppercase tracking-[0.2em] mb-1">Environment</h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">System dependencies & runtime checks</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[var(--accent-text)] uppercase tracking-[0.2em]">Node.js</h3>
            <button
              onClick={handleRecheckNodejs}
              disabled={checking}
              className="px-4 py-2 rounded-md bg-[#1a1a2e] text-zinc-400 hover:text-zinc-200 hover:bg-[#252540] border border-[#1a1a2e] transition-colors cursor-pointer text-[10px] font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? 'Checking...' : 'Re-check'}
            </button>
          </div>

          {nodejsStatus && (
            <div className="flex items-center justify-between py-2.5 px-3 rounded-md bg-[#080810]/60">
              <div className="flex items-center gap-2.5">
                {nodejsStatus.installed && nodejsStatus.meetsMinimum ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : nodejsStatus.installed && !nodejsStatus.meetsMinimum ? (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-xs text-zinc-300 font-mono">Node.js</span>
              </div>
              <div className="flex items-center gap-3">
                {nodejsStatus.version ? (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    v{nodejsStatus.version}
                    {!nodejsStatus.meetsMinimum && (
                      <span className="text-amber-400 ml-1">(need {nodejsStatus.minimumVersion}+)</span>
                    )}
                  </span>
                ) : (
                  <span className="text-[10px] text-red-400/80 font-mono">Not installed</span>
                )}
              </div>
            </div>
          )}

          {nodejsStatus && !nodejsStatus.installed && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/20">
                <svg className="w-3.5 h-3.5 text-rose-500/80 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[10px] text-rose-400/80 font-mono">CLI agents (Claude, Codex, Gemini, OpenCode, Kilo) require Node.js v18+ to run.</span>
              </div>
              <button
                onClick={handleInstallNodejs}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/20 transition-colors cursor-pointer text-[10px] font-mono uppercase"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Node.js
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-[var(--accent-text)] uppercase tracking-[0.2em]">All Prerequisites</h3>
            {prerequisites.length > 0 && (
              <span className={`text-[10px] font-mono uppercase tracking-wider ${allMet ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>
                {allMet ? 'All satisfied' : 'Missing requirements'}
              </span>
            )}
          </div>

          {checking && prerequisites.length === 0 ? (
            <div className="text-center py-4 text-zinc-600 text-xs font-mono">Checking...</div>
          ) : (
            <div className="space-y-1.5">
              {prerequisites.map((prereq) => (
                <div key={prereq.prerequisiteType} className="flex items-center justify-between py-2 px-3 rounded-md bg-[#080810]/60">
                  <div className="flex items-center gap-2.5">
                    {prereq.installed && prereq.meetsMinimum ? (
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : prereq.installed && !prereq.meetsMinimum ? (
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-xs text-zinc-300 font-mono">{prereq.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {prereq.version ? (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        v{prereq.version}
                        {!prereq.meetsMinimum && (
                          <span className="text-amber-400 ml-1">(need {prereq.minimumVersion}+)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-400/80 font-mono">Not installed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!allMet && prerequisites.length > 0 && (
            <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <span className="text-[10px] text-amber-300/80 font-mono">Some prerequisites are missing. CLI agents may not work properly without them.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
