import React from 'react';
import { useAppStore } from '../../../stores/appStore';

const FONT_FAMILIES = [
  'JetBrains Mono',
  'Fira Code',
  'Cascadia Code',
  'Consolas',
  'Menlo',
  'Monospace',
];

const CURSOR_STYLES = [
  { value: 'block' as const, label: 'Block' },
  { value: 'underline' as const, label: 'Underline' },
  { value: 'bar' as const, label: 'Bar' },
];

const Divider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
);

export const SettingsTerminal: React.FC = () => {
  const {
    terminalFontFamily,
    setTerminalFontFamily,
    terminalFontSize,
    setTerminalFontSize,
    terminalCursorStyle,
    setTerminalCursorStyle,
    terminalCursorBlink,
    setTerminalCursorBlink,
    terminalScrollbackSize,
    setTerminalScrollbackSize,
    terminalCopyOnSelect,
    setTerminalCopyOnSelect,
    terminalPasteOnRightClick,
    setTerminalPasteOnRightClick,
    terminalBellEnabled,
    setTerminalBellEnabled,
    terminalOpacity,
    setTerminalOpacity,
    terminalWordWrap,
    setTerminalWordWrap,
  } = useAppStore();

  const Toggle = ({
    enabled,
    onToggle,
    label,
    description,
  }: {
    enabled: boolean;
    onToggle: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-zinc-300 font-mono">{label}</p>
        {description && (
          <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
          enabled ? 'bg-cyan-500/30' : 'bg-[#1a1a2e]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-zinc-200 transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
        />
      </button>
    </div>
  );

  const SliderRow = ({
    label,
    description,
    value,
    displayValue,
    min,
    max,
    step,
    onChange,
  }: {
    label: string;
    description: string;
    value: number;
    displayValue: string;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-zinc-300 font-mono">{label}</p>
        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 h-1 appearance-none bg-[#1a1a2e] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(34,211,238,0.3)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(34,211,238,0.3)]"
        />
        <span className="text-xs text-zinc-400 font-mono w-12 text-right">
          {displayValue}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h2 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em] mb-1">
          Terminal
        </h2>
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          Configure terminal appearance and behavior
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">
            Font
          </h3>

          <div>
            <p className="text-xs text-zinc-300 font-mono mb-2">Font Family</p>
            <div className="flex items-center gap-2 flex-wrap">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font}
                  onClick={() => setTerminalFontFamily(font)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono transition-all duration-150 cursor-pointer ${
                    terminalFontFamily === font
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-[#080810]/40 text-zinc-500 border border-[#1a1a2e]/30 hover:text-zinc-300 hover:border-zinc-600'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <Divider />

          <SliderRow
            label="Font Size"
            description="Terminal text size in pixels"
            value={terminalFontSize}
            displayValue={`${terminalFontSize}px`}
            min={10}
            max={24}
            onChange={setTerminalFontSize}
          />
        </div>

        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">
            Cursor
          </h3>

          <div>
            <p className="text-xs text-zinc-300 font-mono mb-2">Cursor Style</p>
            <div className="flex items-center gap-2">
              {CURSOR_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setTerminalCursorStyle(style.value)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    terminalCursorStyle === style.value
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-[#080810]/40 text-zinc-500 border border-[#1a1a2e]/30 hover:text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <Divider />

          <Toggle
            enabled={terminalCursorBlink}
            onToggle={() => setTerminalCursorBlink(!terminalCursorBlink)}
            label="Blinking Cursor"
            description="Animate the terminal cursor"
          />
        </div>

        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">
            Behavior
          </h3>

          <SliderRow
            label="Scrollback Buffer"
            description="Maximum lines to keep in history"
            value={terminalScrollbackSize}
            displayValue={`${(terminalScrollbackSize / 1000).toFixed(0)}k`}
            min={1000}
            max={100000}
            step={1000}
            onChange={setTerminalScrollbackSize}
          />

          <Divider />

          <SliderRow
            label="Terminal Opacity"
            description="Background transparency"
            value={terminalOpacity}
            displayValue={`${terminalOpacity}%`}
            min={70}
            max={100}
            onChange={setTerminalOpacity}
          />

          <Divider />

          <div className="space-y-4">
            <Toggle
              enabled={terminalCopyOnSelect}
              onToggle={() => setTerminalCopyOnSelect(!terminalCopyOnSelect)}
              label="Copy on Select"
              description="Automatically copy selected text to clipboard"
            />

            <Toggle
              enabled={terminalPasteOnRightClick}
              onToggle={() =>
                setTerminalPasteOnRightClick(!terminalPasteOnRightClick)
              }
              label="Paste on Right Click"
              description="Enable paste via right-click in terminal"
            />

            <Toggle
              enabled={terminalBellEnabled}
              onToggle={() => setTerminalBellEnabled(!terminalBellEnabled)}
              label="Bell Notifications"
              description="Visual notification on command complete"
            />

            <Toggle
              enabled={terminalWordWrap}
              onToggle={() => setTerminalWordWrap(!terminalWordWrap)}
              label="Word Wrap"
              description="Wrap long lines in terminal output"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
