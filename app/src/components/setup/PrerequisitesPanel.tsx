import { useEffect } from 'react';
import { PrerequisiteStatus } from '../../types';

interface PrerequisitesPanelProps {
  prerequisites: PrerequisiteStatus[];
  onCheck: () => Promise<void>;
  loading?: boolean;
}

export function PrerequisitesPanel({ prerequisites, onCheck, loading }: PrerequisitesPanelProps) {
  useEffect(() => {
    onCheck();
  }, [onCheck]);

  const allMet = prerequisites.every(p => p.installed && p.meetsMinimum);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-200">Prerequisites</h3>
        {allMet ? (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            All satisfied
          </span>
        ) : (
          <span className="text-xs text-yellow-400">Missing requirements</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-400 text-sm">Checking...</div>
      ) : (
        <div className="space-y-2">
          {prerequisites.map((prereq) => (
            <div key={prereq.prerequisiteType} className="flex items-center justify-between py-2 px-3 bg-gray-700/50 rounded">
              <div className="flex items-center gap-2">
                {prereq.installed && prereq.meetsMinimum ? (
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : prereq.installed && !prereq.meetsMinimum ? (
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm text-gray-200">{prereq.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {prereq.version && (
                  <span className="text-xs text-gray-400">
                    v{prereq.version}
                    {!prereq.meetsMinimum && (
                      <span className="text-yellow-400 ml-1">(need {prereq.minimumVersion}+)</span>
                    )}
                  </span>
                )}
                
                {!prereq.installed && (
                  <a
                    href={prereq.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Install
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!allMet && prerequisites.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-200">
          Some prerequisites are missing. Please install them before creating a workspace.
        </div>
      )}
    </div>
  );
}
