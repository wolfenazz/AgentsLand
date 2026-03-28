import React, { memo } from 'react';

interface GitStatusBadgeProps {
  change: 'added' | 'modified' | 'deleted' | 'untracked';
}

const STATUS_STYLES: Record<string, string> = {
  added: 'bg-emerald-500',
  modified: 'bg-amber-500',
  deleted: 'bg-rose-500',
  untracked: 'bg-sky-500',
};

const GitStatusBadgeInner: React.FC<GitStatusBadgeProps> = ({ change }) => {
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[change]} shrink-0`}
      title={change}
    />
  );
};

export const GitStatusBadge = memo(GitStatusBadgeInner);
