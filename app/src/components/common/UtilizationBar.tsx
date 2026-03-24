import React from 'react';

interface UtilizationBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const UtilizationBar: React.FC<UtilizationBarProps> = ({
  used,
  total,
  showLabel = true,
  className = '',
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  const getColorClass = () => {
    if (percentage < 80) return 'bg-emerald-500';
    if (percentage < 95) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`flex items-center gap-3 font-mono ${className}`}>
      <div className="flex-1 h-3 bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden flex">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300 border-r border-zinc-950`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-zinc-500 min-w-max uppercase tracking-widest">
          {used}/{total} [MEM_ALLOC]
        </span>
      )}
    </div>
  );
};
