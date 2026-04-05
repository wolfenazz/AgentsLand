# YzPzCode - Settings Page Plan

## Overview

The Settings page will provide users with comprehensive control over the application's behavior, appearance, and integrations. Currently, the settings button exists in both the SetupScreen and WorkspaceHeader but is disabled with a "Coming Soon" tooltip. Some settings already exist in the Zustand store (`autoSave`, `showMinimap`, `customCursor`, `theme`, `recentDirectories`) but lack a dedicated UI.

---

## Settings Categories

### 1. Appearance

Controls the visual aspects of the application.

**Settings:**
- **Theme** (dropdown/radio)
  - Options: Dark, Light, System
  - Current: Only dark/light toggle exists, no system option
  - Store: `theme: "dark" | "light"`

- **Custom Cursor** (toggle)
  - Current: Exists in footer and store
  - Store: `customCursor: boolean`

- **Window Transparency** (slider)
  - Range: 70% - 100%
  - Controls the opacity of the app window background
  - Platform-specific (Windows/macOS support varies)

- **Accent Color** (color picker/presets)
  - Customize the primary accent color (currently fixed to theme-main)
  - Presets: Default (zinc), Blue, Purple, Green, Orange, Red

- **UI Density** (radio)
  - Options: Compact, Comfortable, Spacious
  - Affects padding and spacing throughout the UI

- **Animations** (toggle)
  - Enable/disable motion animations (framer-motion transitions)
  - Accessibility consideration for users who prefer reduced motion

---

### 2. Terminal

Controls terminal behavior and appearance.

**Settings:**
- **Default Shell** (dropdown)
  - Auto-detected shells: PowerShell, pwsh, cmd, bash, zsh, fish
  - Platform-specific defaults
  - Current: `get_default_shell()` in Rust types.rs

- **Terminal Font Family** (text input with presets)
  - Default: Monospace
  - Presets: JetBrains Mono, Fira Code, Cascadia Code, Consolas, Menlo

- **Terminal Font Size** (number input)
  - Range: 10px - 24px
  - Default: 14px

- **Cursor Style** (radio)
  - Options: Block, Underline, Bar
  - Blinking cursor toggle

- **Scrollback Buffer Size** (number input)
  - Range: 1000 - 100000 lines
  - Default: 10000

- **Copy on Select** (toggle)
  - Automatically copy selected text to clipboard

- **Paste on Right Click** (toggle)
  - Enable paste via right-click in terminal

- **Bell/Notification on Command Complete** (toggle)
  - Visual or audio notification when a long-running command finishes

- **Terminal Opacity** (slider)
  - Range: 70% - 100%
  - Background transparency for terminal cells

- **Word Wrap** (toggle)
  - Enable/disable line wrapping in terminal output

---

### 3. Editor

Controls the built-in code editor behavior.

**Settings:**
- **Auto Save** (toggle)
  - Current: Exists in store
  - Store: `autoSave: boolean`
  - Options: On focus change, After delay, Manual
  - Delay configuration (if "After delay" selected): 500ms - 5000ms

- **Show Minimap** (toggle)
  - Current: Exists in store
  - Store: `showMinimap: boolean`

- **Editor Font Family** (text input with presets)
  - Same presets as terminal font

- **Editor Font Size** (number input)
  - Range: 10px - 24px
  - Default: 14px

- **Tab Size** (number input)
  - Options: 2, 4, 8
  - Default: 2

- **Word Wrap** (toggle)
  - Enable/disable line wrapping in editor

- **Line Numbers** (radio)
  - Options: On, Off, Relative

- **Bracket Pair Colorization** (toggle)
  - Color matching brackets differently

- **Format on Save** (toggle)
  - Auto-format code when saving files

- **Trim Trailing Whitespace** (toggle)
  - Remove trailing whitespace on save

---

### 4. Workspace

Controls workspace behavior and defaults.

**Settings:**
- **Auto-open Last Workspace** (toggle)
  - Current: Partially implemented (restores last opened workspace)
  - Store: `lastOpenedWorkspaceId`

- **Default Layout Template** (dropdown)
  - Select default template for new workspaces
  - Options: Quick Edit (1), React (4), Rust (4), Python (4), Full-Stack (6), Custom

- **Default Workspace Directory** (path input)
  - Set a default directory for new workspaces
  - Browse button for folder selection

- **Recent Directories** (list with management)
  - Show recent directories list
  - Clear all button
  - Remove individual entries
  - Current: `recentDirectories` in store (max 10)

- **Confirm Before Closing Workspace** (toggle)
  - Show confirmation dialog when closing a workspace with active terminals

- **Save Workspace State on Close** (toggle)
  - Remember terminal history and open files when reopening

---

### 5. AI Agents

Controls AI agent CLI tools configuration.

**Settings:**
- **Installed Agents Overview** (table)
  - Show all detected agents with status, version, path
  - Current: `CliToolsTable` component exists on setup screen
  - Store: `cliStatuses: Record<AgentType, AgentCliInfo | null>`

- **Default Agent Allocation** (configuration)
  - Set preferred default allocation for new workspaces
  - Per-agent priority/ordering

- **Agent Installation** (section)
  - Quick install buttons for missing agents
  - Current: Install functionality exists in setup
  - Store: `installInProgress: AgentType | null`

- **Authentication Status** (table)
  - Show auth status for each agent
  - Quick links to auth/login flows
  - Store: `authInfos: Record<AgentType, AuthInfo | null>`

- **Agent Timeout** (number input)
  - Maximum time (seconds) to wait for agent response
  - Default: 300s (5 minutes)

---

### 6. IDE Integration

Controls external IDE launching behavior.

**Settings:**
- **Installed IDEs Overview** (table)
  - Show detected IDEs with status and path
  - Current: `IdesTable` component exists on setup screen
  - Store: `ideStatuses: Record<IdeType, IdeInfo | null>`

- **Default IDEs** (multi-select)
  - Select which IDEs to launch by default with new workspaces
  - Current: `selectedIdes: IdeType[]` in store

- **Custom IDE Paths** (list)
  - Override auto-detected IDE paths
  - Add custom IDE executables

- **Launch IDE on Workspace Creation** (toggle)
  - Auto-launch selected IDEs when creating a new workspace

---

### 7. Keyboard Shortcuts

View and customize keyboard shortcuts.

**Settings:**
- **Shortcuts Reference** (table)
  - Current: `ShortcutModal` exists in WorkspaceHeader (view only)
  - Categories: Terminal, Navigation, Editor, Window, Workspace

- **Custom Shortcuts** (future)
  - Remap key bindings
  - Import/export shortcut configurations

---

### 8. Updates & Notifications

Controls update behavior and notification preferences.

**Settings:**
- **Auto-check for Updates** (toggle)
  - Current: Manual check exists in footer
  - Store: Updater store exists with `checkForUpdates`

- **Auto-download Updates** (toggle)
  - Download updates automatically in background

- **Update Channel** (dropdown)
  - Options: Stable, Beta, Nightly

- **Last Checked** (display)
  - Show last update check timestamp
  - Store: `lastChecked: number` in updater store

- **Current Version** (display)
  - Show app version
  - Current: Displayed in footer

---

### 9. Data & Storage

Manage application data and storage.

**Settings:**
- **Storage Usage** (display)
  - Show localStorage usage
  - Workspace configs count
  - Templates count

- **Clear Recent Directories** (button)
  - Current: Function exists in store
  - Store: `clearRecentDirectories()`

- **Clear Workspace History** (button)
  - Remove all saved workspace configurations

- **Clear All Settings** (button with confirmation)
  - Reset all settings to defaults
  - Clear localStorage

- **Export Settings** (button)
  - Export current settings as JSON file

- **Import Settings** (button)
  - Import settings from JSON file

---

### 10. About

Application information and credits.

**Settings:**
- **App Version** (display)
  - Current: Displayed in footer

- **Build Info** (display)
  - Build date, commit hash (if available)

- **Credits** (display)
  - Current: Authors displayed in footer (Naseem, Noor, Khalid)

- **Links** (buttons)
  - GitHub repository
  - Documentation
  - Report issue
  - Discord/Community

- **License** (display)
  - License type and link

---

## Implementation Plan

### Phase 1: Core Settings UI

1. Create `SettingsScreen` component in `app/src/components/settings/`
2. Create settings layout with sidebar navigation
3. Implement Appearance settings section
4. Wire up existing store values (`theme`, `customCursor`, `autoSave`, `showMinimap`)
5. Add settings route to App.tsx view state (add "settings" to view type)

### Phase 2: Terminal & Editor Settings

1. Implement Terminal settings section
2. Implement Editor settings section
3. Add new fields to Zustand store:
   - `terminalFontSize`, `terminalFontFamily`, `cursorStyle`, `scrollbackSize`
   - `editorFontSize`, `editorFontFamily`, `tabSize`, `lineNumbers`
4. Apply terminal settings to xterm instances
5. Apply editor settings to CodeMirror

### Phase 3: Workspace & Agent Settings

1. Implement Workspace settings section
2. Implement AI Agents settings section
3. Implement IDE Integration settings section
4. Move CLI tools and IDE status panels from setup to settings

### Phase 4: Advanced Settings

1. Implement Keyboard Shortcuts reference
2. Implement Updates & Notifications settings
3. Implement Data & Storage management
4. Implement About section
5. Add settings import/export functionality

### Phase 5: Polish

1. Add search functionality for settings
2. Add settings reset per section
3. Add visual indicators for modified settings
4. Add keyboard shortcut to open settings (e.g., `Ctrl+,`)
5. Enable the settings button in SetupScreen and WorkspaceHeader

---

## Store Extensions

New fields to add to `appStore.ts`:

```typescript
// Appearance
accentColor: string;
uiDensity: "compact" | "comfortable" | "spacious";
animationsEnabled: boolean;
windowTransparency: number;

// Terminal
terminalFontFamily: string;
terminalFontSize: number;
terminalCursorStyle: "block" | "underline" | "bar";
terminalCursorBlink: boolean;
terminalScrollbackSize: number;
terminalCopyOnSelect: boolean;
terminalPasteOnRightClick: boolean;
terminalBellEnabled: boolean;
terminalOpacity: number;
terminalWordWrap: boolean;

// Editor
editorFontFamily: string;
editorFontSize: number;
editorTabSize: number;
editorWordWrap: boolean;
editorLineNumbers: "on" | "off" | "relative";
editorBracketColorization: boolean;
editorFormatOnSave: boolean;
editorTrimWhitespace: boolean;
autoSaveDelay: number;

// Workspace
confirmBeforeClose: boolean;
saveWorkspaceState: boolean;
defaultLayoutTemplate: string;
defaultWorkspaceDirectory: string;

// AI Agents
agentTimeout: number;

// IDE
launchIdeOnWorkspaceCreation: boolean;

// Updates
autoCheckUpdates: boolean;
autoDownloadUpdates: boolean;
updateChannel: "stable" | "beta" | "nightly";
```

Update `partialize` in persist middleware to include new settings.

---

## UI/UX Considerations

- **Navigation:** Left sidebar with categories, main content area for settings
- **Search:** Global search bar at top to filter settings
- **Modified indicators:** Show dot/indicator next to categories with unsaved changes
- **Reset buttons:** Per-setting reset to default, per-section reset all
- **Accessibility:** Proper labels, keyboard navigation, screen reader support
- **Responsive:** Settings should be usable at various window sizes
- **Consistency:** Match existing YzPzCode design language (monospace fonts, zinc color palette, subtle borders)

---

## Access Points

1. **Settings icon in header** (currently disabled) - both SetupScreen and WorkspaceHeader
2. **Keyboard shortcut** `Ctrl+,` (planned)
3. **Context menu** (planned addition)
4. **App menu** (if native menu bar is added in future)
