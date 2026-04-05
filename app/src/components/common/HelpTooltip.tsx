import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface HelpTooltipProps {
  text: string;
  position?: 'top' | 'bottom';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, position = 'top' }) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const tooltipWidth = 256;
    const gap = 8;

    let top: number;
    let left: number;

    if (position === 'top') {
      top = rect.top - gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    }

    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
    if (position === 'top') {
      top = Math.max(8, top);
    } else {
      top = Math.min(top, window.innerHeight - 80);
    }

    setCoords({ top, left: clampedLeft });
  }, [position]);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setActive(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (active) {
      updatePosition();
    }
  }, [active, updatePosition]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={(e) => {
          e.stopPropagation();
          if (active) {
            setActive(false);
          } else {
            updatePosition();
            setActive(true);
          }
        }}
        className="w-4 h-4 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-600 border border-zinc-700 rounded-sm bg-zinc-900 hover:text-zinc-300 hover:border-zinc-500 transition-colors duration-150 cursor-pointer leading-none"
        aria-label="Help"
      >
        ?
      </button>
      {active && createPortal(
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: 256,
            zIndex: 9999,
          }}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-sm shadow-xl font-mono text-xs text-zinc-300 leading-relaxed"
        >
          <div
            className={`absolute w-2 h-2 bg-zinc-900 border border-zinc-700 transform rotate-45 ${
              position === 'top'
                ? 'top-full border-t-0 border-l-0'
                : 'bottom-full border-b-0 border-r-0'
            }`}
            style={{
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().left +
                  buttonRef.current.getBoundingClientRect().width / 2 -
                  coords.left -
                  4
                : '50%',
            }}
          />
          {text}
        </div>,
        document.body
      )}
    </>
  );
};
