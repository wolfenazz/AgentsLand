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

const LINE_NUMBER_MODES = [
  { value: 'on' as const, label: 'On' },
  { value: 'off' as const, label: 'Off' },
  { value: 'relative' as const, label: 'Relative' },
];

const TAB_SIZES = [2, 4, 8];

export const SettingsEditor: React.FC = () => {
  const {
    autoSave,
    setAutoSave,
    autoSaveDelay,
    setAutoSaveDelay,
    showMinimap,
    setShowMinimap,
    editorFontFamily,
    setEditorFontFamily,
    editorFontSize,
    setEditorFontSize,
    editorTabSize,
    setEditorTabSize,
    editorWordWrap,
    setEditorWordWrap,
    editorLineNumbers,
    setEditorLineNumbers,
    editorBracketColorization,
    setEditorBracketColorization,
    editorFormatOnSave,
    setEditorFormatOnSave,
    editorTrimWhitespace,
    setEditorTrimWhitespace,
  } = useAppStore();

  const Toggle = ({ enabled, onToggle, label, description }: { enabled: boolean; onToggle: () => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-zinc-300 font-mono">{label}</p>
        {description && <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{description}</p>}
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
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h2 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em] mb-1">Editor</h2>
        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Configure code editor behavior and appearance</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">Font</h3>

          <div>
            <p className="text-xs text-zinc-300 font-mono mb-2">Font Family</p>
            <div className="flex items-center gap-2 flex-wrap">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font}
                  onClick={() => setEditorFontFamily(font)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono transition-all duration-150 cursor-pointer ${
                    editorFontFamily === font
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

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-300 font-mono">Font Size</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Editor text size in pixels</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="24"
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                className="w-24 accent-cyan-500"
              />
              <span className="text-xs text-zinc-400 font-mono w-8 text-right">{editorFontSize}px</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-5">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">Formatting</h3>

          <div>
            <p className="text-xs text-zinc-300 font-mono mb-2">Tab Size</p>
            <div className="flex items-center gap-2">
              {TAB_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setEditorTabSize(size)}
                  className={`w-10 h-8 rounded-md text-[10px] font-mono transition-all duration-150 cursor-pointer ${
                    editorTabSize === size
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-[#080810]/40 text-zinc-500 border border-[#1a1a2e]/30 hover:text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-300 font-mono mb-2">Line Numbers</p>
            <div className="flex items-center gap-2">
              {LINE_NUMBER_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setEditorLineNumbers(mode.value)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    editorLineNumbers === mode.value
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-[#080810]/40 text-zinc-500 border border-[#1a1a2e]/30 hover:text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0f]/60 border border-[#1a1a2e]/50 backdrop-blur-sm rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-cyan-400/70 uppercase tracking-[0.2em]">Toggles</h3>

          <div className="space-y-3">
            <Toggle
              enabled={autoSave}
              onToggle={() => setAutoSave(!autoSave)}
              label="Auto Save"
              description="Automatically save file changes"
            />

            {autoSave && (
              <div className="flex items-center justify-between border-l-2 border-cyan-500/20 pl-3">
                <div>
                  <p className="text-xs text-zinc-400 font-mono">Auto Save Delay</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Delay before saving (ms)</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="500"
                    value={autoSaveDelay}
                    onChange={(e) => setAutoSaveDelay(Number(e.target.value))}
                    className="w-24 accent-cyan-500"
                  />
                  <span className="text-xs text-zinc-400 font-mono w-12 text-right">{autoSaveDelay}ms</span>
                </div>
              </div>
            )}

            <Toggle
              enabled={showMinimap}
              onToggle={() => setShowMinimap(!showMinimap)}
              label="Show Minimap"
              description="Display code overview on the right side"
            />

            <Toggle
              enabled={editorWordWrap}
              onToggle={() => setEditorWordWrap(!editorWordWrap)}
              label="Word Wrap"
              description="Wrap long lines in the editor"
            />

            <Toggle
              enabled={editorBracketColorization}
              onToggle={() => setEditorBracketColorization(!editorBracketColorization)}
              label="Bracket Pair Colorization"
              description="Color matching brackets differently"
            />

            <Toggle
              enabled={editorFormatOnSave}
              onToggle={() => setEditorFormatOnSave(!editorFormatOnSave)}
              label="Format on Save"
              description="Auto-format code when saving files"
            />

            <Toggle
              enabled={editorTrimWhitespace}
              onToggle={() => setEditorTrimWhitespace(!editorTrimWhitespace)}
              label="Trim Trailing Whitespace"
              description="Remove trailing whitespace on save"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
