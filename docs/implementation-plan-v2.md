# YzPzCode - Structured Implementation Plan v2

## 1. Executive Summary

YzPzCode is a native desktop development environment integrating terminals, AI agents, and task management. This plan provides a structured, phased approach with clear MVP boundaries and incremental delivery.

---

## 2. MVP Scope (Phase 1-4)

**Primary Goal:** Create a functional multi-terminal workspace with AI agent assignment.

**MVP Deliverables:**
- Workspace creation flow (directory + layout selection)
- Grid-based multi-terminal UI (1, 2, 4, 6, 8 sessions)
- AI agent fleet configuration (assign agents to terminal slots)
- Agent CLI detection & auto-installation system
- Prerequisites validation (Node.js, Git)
- Terminal session management with basic shell integration
- CLI auto-launch in terminals (Claude Code, OpenCode, Codex, Gemini)
- CLI authentication status detection
- Multi-workspace management with browser-style tabs
- Workspace switching with session preservation
- Workspace lifecycle (open/close with session termination)

**Explicitly Out of Scope (Future Phases):**
- Built-in code editor
- Command block system
- Task board
- Plugin system
- File system watcher
- Persistent command history

---

## 3. Architecture Overview

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop Framework | Tauri | v2.x |
| Frontend | React | 19.x |
| Language | TypeScript | Latest |
| State Management | Zustand | Latest |
| Styling | Tailwind CSS | v4.x |
| Terminal Engine | portable-pty (Rust) | 0.8.x |
| Shell Emulation | xterm.js | Latest |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Shell     │  │  Terminal   │  │   Agent     │     │
│  │   Screen    │  │   Manager   │  │  Selector   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │Prereq Panel │  │ CLI Status  │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                          │
                  Tauri IPC Commands
                          │
┌─────────────────────────────────────────────────────────┐
│                    Rust Backend                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Terminal  │  │   Agent     │  │   Workspace │     │
│  │   Manager   │  │  Executor   │  │  Manager    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Agent CLI Manager                   │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────┐ │   │
│  │  │ Detector  │ │ Installer │ │Prereq Checker │ │   │
│  │  └───────────┘ └───────────┘ └───────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Data Models

### 4.1 Core Types

```typescript
// Workspace Configuration
type WorkspaceConfig = {
  id: string;
  name: string;
  path: string;
  layout: LayoutConfig;
  agentFleet: AgentFleet;
  createdAt: timestamp;
  lastOpened?: timestamp;
}

// Layout Configuration
type LayoutConfig = {
  type: "grid";
  sessions: number; // 1, 2, 4, 6, 8
  rows?: number;
  cols?: number;
}

// Agent Fleet Allocation
type AgentType = "claude" | "codex" | "gemini" | "opencode" | "cursor";

type AgentFleet = {
  totalSlots: number;
  allocation: Record<AgentType, number>;
}

// Terminal Session
type TerminalSession = {
  id: string;
  workspaceId: string;
  index: number; // Grid position (0 to totalSlots-1)
  cwd: string;
  agent?: AgentType;
  status: "idle" | "running" | "error";
  shell: string; // "bash", "zsh", "cmd", "powershell"
}

// Agent Task
type AgentTask = {
  id: string;
  sessionId: string;
  agent: AgentType;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  output: string;
  startTime: timestamp;
  endTime?: timestamp;
}

// Agent CLI Status
type AgentCliStatus = 
  | "not_installed"
  | "checking"
  | "installing"
  | "installed_not_authenticated"
  | "ready"
  | "install_failed";

type AgentCliInfo = {
  agent: AgentType;
  binaryName: string;
  displayName: string;
  status: AgentCliStatus;
  version?: string;
  installError?: string;
  docsUrl: string;
  iconPath: string;
};

// Prerequisites Check
type PrerequisiteStatus = {
  name: string;
  installed: boolean;
  version?: string;
  requiredFor: AgentType[];
  installUrl: string;
};
```

### 4.2 Store State (Zustand)

```typescript
interface AppState {
  // Workspace
  currentWorkspace: WorkspaceConfig | null;
  workspaceList: WorkspaceConfig[];
  openWorkspaces: WorkspaceConfig[];
  activeWorkspaceId: string | null;
  
  // Terminal
  sessionsByWorkspace: Map<string, TerminalSession[]>;
  activeSessionByWorkspace: Map<string, string>;
  sessions: Map<string, TerminalSession>;
  activeSessionId: string | null;
  
  // Agent CLI
  cliStatus: Record<AgentType, AgentCliInfo>;
  prerequisites: PrerequisiteStatus[];
  installInProgress: AgentType | null;
  
  // UI
  view: "setup" | "workspace";
  
  // Actions
  createWorkspace: (config: Partial<WorkspaceConfig>) => Promise<void>;
  launchWorkspace: (workspaceId: string) => Promise<void>;
  openWorkspace: (config: WorkspaceConfig) => Promise<void>;
  closeWorkspace: (workspaceId: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  updateAgentAllocation: (agent: AgentType, count: number) => void;
  setActiveSession: (sessionId: string) => void;
  checkPrerequisites: () => Promise<void>;
  detectAllClis: () => Promise<void>;
  installCli: (agent: AgentType) => Promise<void>;
}
```

---

## 5. API Contracts (Tauri Commands)

### 5.1 Workspace Commands

```rust
#[tauri::command]
async fn create_workspace(
    path: String,
    layout: LayoutConfig,
    agent_fleet: AgentFleet,
) -> Result<WorkspaceConfig, String>

#[tauri::command]
async fn launch_workspace(workspace_id: String) -> Result<(), String>

#[tauri::command]
async fn list_workspaces() -> Result<Vec<WorkspaceConfig>, String>

#[tauri::command]
async fn kill_workspace_sessions(workspace_id: String) -> Result<(), String>

#[tauri::command]
async fn get_workspace_session_count(workspace_id: String) -> Result<usize, String>
```

### 5.2 Terminal Commands

```rust
#[tauri::command]
async fn create_terminal_sessions(
    request: CreateSessionsRequest,
) -> Result<Vec<TerminalSession>, String>

#[tauri::command]
async fn write_to_terminal(
    session_id: String,
    input: String,
) -> Result<(), String>

#[tauri::command]
async fn resize_terminal(
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String>

#[tauri::command]
async fn kill_session(session_id: String) -> Result<(), String>

#[tauri::command]
async fn get_all_sessions() -> Result<Vec<TerminalSession>, String>
```

### 5.3 Agent Commands

```rust
#[tauri::command]
async fn execute_agent_task(
    task: AgentTask,
) -> Result<String, String>

#[tauri::command]
async fn stream_agent_output(
    task_id: String,
) -> Result<String, String>
```

### 5.4 Agent CLI Commands

```rust
#[tauri::command]
async fn check_prerequisites() -> Result<Vec<PrerequisiteStatus>, String>

#[tauri::command]
async fn detect_agent_cli(agent: AgentType) -> Result<AgentCliInfo, String>

#[tauri::command]
async fn detect_all_agent_clis() -> Result<HashMap<AgentType, AgentCliInfo>, String>

#[tauri::command]
async fn install_agent_cli(agent: AgentType) -> Result<(), String>

#[tauri::command]
async fn get_install_command(agent: AgentType) -> Result<String, String>
```

---

## 6. Detailed Phases

### Phase 0: Project Setup (Week 1)

**Deliverables:**
- Tauri v2 + React 19 project scaffolded
- TypeScript configuration
- Tailwind CSS configured
- Build pipeline working

**Tasks:**
1. Initialize Tauri project
2. Setup React with TypeScript
3. Configure Tailwind CSS
4. Setup Zustand store
5. Configure ESLint/Prettier
6. Create folder structure

**Acceptance Criteria:**
- `npm run tauri dev` launches application
- Default Tauri window displays "Hello YzPzCode"
- TypeScript compilation succeeds

---

### Phase 1: Workspace Creation UI (Week 2-3)

**Deliverables:**
- Directory selection screen
- Layout template selector (1, 2, 4, 6, 8 sessions)
- Workspace configuration form

**Tasks:**

#### 1.1 Directory Selection
- [x] Create `SetupScreen` component
- [x] Implement Tauri `open()` dialog for folder selection
- [x] Display selected path with validation
- [x] Add "Recent directories" dropdown

#### 1.2 Layout Selector
- [x] Create `LayoutSelector` component
- [x] Visual preview for each layout option:
  - 1 session (full width)
  - 2 sessions (horizontal split)
  - 4 sessions (2x2 grid)
  - 6 sessions (3x2 grid)
  - 8 sessions (2x4 grid)
- [x] Grid mapping logic (sessions → rows/cols)

#### 1.3 Form Integration
- [x] Create `WorkspaceConfigForm` component
- [x] Integrate directory + layout selectors
- [x] Add workspace name input
- [x] Form validation (path must exist, name required)

**Acceptance Criteria:**
- User can select directory via native file dialog
- Layout selection updates visual preview
- Form validates inputs before submission
- "Create Workspace" button enables only when valid

---

### Phase 2: Agent Fleet Configuration (Week 3-4)

**Deliverables:**
- Agent allocation UI (toggles + counters)
- Utilization bar showing allocated/total slots
- Validation (allocation ≤ total slots)

**Tasks:**

#### 2.1 Agent Configuration UI
- [x] Create `AgentFleetConfig` component
- [x] For each agent type:
  - Toggle switch (enabled/disabled)
  - Counter stepper (- / + / number input)
  - Agent icon + label
- [x] Enable/disable counter based on toggle
- [x] Replace emoji icons with actual agent logos (PNG/SVG)

#### 2.2 Allocation Logic
- [x] Implement slot allocation validation
- [x] Create `useAgentAllocation` hook
- [x] Track remaining slots dynamically
- [x] Prevent allocation exceeding total slots

#### 2.3 Visual Feedback
- [x] Create utilization bar component (extract to common/)
- [x] Color coding:
  - Green: < 80% allocated
  - Yellow: 80-95% allocated
  - Red: 100% allocated
- [x] Show "X / Y slots used" text

#### 2.4 State Management
- [x] Update Zustand store with fleet allocation
- [x] Add validation actions
- [x] Persist allocation to local storage
- [x] Integrate allocation with workspace creation flow

**Acceptance Criteria:**
- Each agent can be toggled on/off
- Counters adjust allocation correctly
- Utilization bar updates in real-time
- Cannot allocate more slots than available
- "Launch" button disabled if allocation exceeds total

---

### Phase 2.5: Agent CLI Detection & Installation (Week 4-5)

**Deliverables:**
- Automatic CLI detection for all agent types
- Silent auto-installation of missing CLIs
- Prerequisites validation (Node.js, Git)
- Graceful fallback for failed installations
- CLI status UI in workspace setup

**Tasks:**

#### 2.5.1 Prerequisites Checker
- [x] Create `PrerequisitesChecker` Rust service
- [x] Check for required tools:
  - Node.js (v18+) - Required for: Claude Code, OpenCode, Codex CLI, Gemini CLI
  - Git - Required for: All CLIs
  - npm/bun/pnpm - Required for: All CLIs
- [x] Return detailed status with install URLs
- [x] Platform-specific prerequisite detection

#### 2.5.2 Agent CLI Provider Trait
- [x] Create `AgentCliProvider` trait in Rust
- [x] Implement for each agent:
  ```rust
  pub trait AgentCliProvider {
      fn binary_name(&self) -> &str;
      fn get_install_command(&self, platform: Platform) -> String;
      fn get_version_command(&self) -> String;
      fn get_docs_url(&self) -> String;
      fn get_prerequisites(&self) -> Vec<PrerequisiteType>;
  }
  ```
- [x] Provider implementations:
  - [x] `ClaudeCliProvider`
  - [x] `OpenCodeCliProvider`
  - [x] `CodexCliProvider`
  - [x] `GeminiCliProvider`

#### 2.5.3 CLI Detection Service
- [x] Create `AgentCliDetector` Rust service
- [x] Check if binary exists in PATH
- [x] Run version command to verify installation
- [x] Parse version output
- [x] Cache detection results

#### 2.5.4 CLI Installation Service
- [x] Create `AgentCliInstaller` Rust service
- [x] Platform-specific install commands:

  | CLI | Windows | macOS | Linux |
  |-----|---------|-------|-------|
  | Claude Code | `irm https://claude.ai/install.ps1 \| iex` | `curl -fsSL https://claude.ai/install.sh \| bash` | `curl -fsSL https://claude.ai/install.sh \| bash` |
  | OpenCode | `npm install -g opencode-ai` | `brew install anomalyco/tap/opencode` | `npm install -g opencode-ai` |
  | Codex CLI | `npm i -g @openai/codex` | `npm i -g @openai/codex` | `npm i -g @openai/codex` |
  | Gemini CLI | `npm install -g @google/gemini-cli` | `npm install -g @google/gemini-cli` | `npm install -g @google/gemini-cli` |

- [x] Execute installation commands silently
- [x] Capture installation output/errors
- [x] Verify installation after completion

#### 2.5.5 Installation Flow Logic
- [x] Implement auto-install workflow:
  ```
  1. User selects agents for workspace
  2. Check prerequisites → Show error if missing
  3. Detect installed CLIs
  4. For each missing CLI → Auto-install silently
  5. Verify installations
  6. If install fails → Mark as "install_failed", continue
  7. Create workspace with status for each terminal
  ```

#### 2.5.6 Frontend Components
- [x] Create `PrerequisitesPanel` component
  - Show status of Node.js, Git, npm
  - Display install links for missing prerequisites
  - Block workspace creation if critical prerequisites missing
- [x] Create `AgentCliStatusBadge` component
  - Show CLI status icon (✓ installed, ✗ failed, ○ installing)
  - Display version if installed
  - Show error message if failed
- [x] Update `AgentFleetConfig` to show CLI status
- [x] Add installation progress indicator

#### 2.5.7 Fallback Handling
- [x] Terminal with failed CLI shows "No Agent" badge
- [x] Display tooltip with error details on hover
- [x] Add "Retry Install" option in terminal pane
- [x] Log installation failures for debugging

#### 2.5.8 State Management Updates
- [x] Add CLI status to Zustand store
- [x] Persist CLI status to avoid re-checking on every launch

**Acceptance Criteria:**
- Prerequisites are checked before CLI installation
- Clear error messages shown for missing prerequisites with install instructions
- CLIs are installed silently without user intervention
- Failed installations don't block workspace creation
- Each terminal shows correct agent status
- User can retry failed installations
- Installation progress is visible in UI

---

### Phase 3: Workspace Launch & Terminal Grid (Week 4-6)

**Deliverables:**
- Multi-terminal grid UI
- Terminal session initialization
- xterm.js integration
- Shell process management

**Tasks:**

#### 3.1 Grid Layout System
- [x] Create `TerminalGrid` component
- [x] Implement dynamic CSS Grid based on layout config
- [x] Grid mapping:
  ```typescript
  const getGridLayout = (sessions: number) => {
    switch(sessions) {
      case 1: return "grid-cols-1 grid-rows-1"
      case 2: return "grid-cols-2 grid-rows-1"
      case 4: return "grid-cols-2 grid-rows-2"
      case 6: return "grid-cols-3 grid-rows-2"
      case 8: return "grid-cols-4 grid-rows-2"
    }
  }
  ```
- [x] Responsive pane sizing

#### 3.2 Terminal Component
- [x] Create `TerminalPane` component
- [x] Integrate xterm.js
- [x] Terminal styling (dark theme)
- [x] Resize observer for terminal fit

#### 3.3 Backend Terminal Manager
- [x] Create Rust `TerminalManager` struct
- [x] Implement session creation:
  ```rust
  pub async fn create_sessions(
      &self,
      workspace_path: String,
      count: usize,
  ) -> Result<Vec<TerminalSession>>
  ```
- [x] Shell detection (OS-based default)
- [x] Process spawning with proper working directory

#### 3.4 I/O Streaming
- [x] Create Rust event emitter for stdout/stderr
- [x] Stream output to frontend via Tauri events
- [x] Frontend event listener updates xterm instance

#### 3.5 Agent Assignment Display
- [x] Show assigned agent for each pane
- [x] Visual indicator (badge, border color)
- [x] Empty agent slots labeled "No Agent"
- [x] Agent logos displayed in terminal header badges

#### 3.6 Workspace Persistence
- [x] Save workspace configuration to local storage (via Zustand persist)
- [x] Load recent workspaces
- [x] Auto-open last workspace on startup

**Acceptance Criteria:**
- Grid displays correct number of panes
- Each pane shows functional xterm terminal
- All sessions start in the selected working directory
- Agent assignments displayed visually
- Workspaces save and load correctly

---

### Phase 3.5: Multi-Workspace Management (Week 5-6)

**Deliverables:**
- Header workspace tabs/navigation bar (browser-style tabs)
- Create new workspace from header
- Switch between open workspaces
- Close workspace tabs with terminal session termination
- Workspace persistence across sessions

**Rationale:**
Enable users to work with multiple workspaces simultaneously, switching between different projects without closing the application. Browser-style tabs provide a familiar, professional interface for workspace management.

**Tasks:**

#### 3.5.1 Header Navigation Component
- [ ] Create `WorkspaceHeader` component
- [ ] Display open workspace tabs with names and icons
- [ ] Active workspace highlighted with distinct styling
- [ ] "New Workspace" (+) button in header
- [ ] Close button (X) on each non-active tab
- [ ] Tab hover state showing workspace path tooltip
- [ ] Horizontal scrolling for multiple tabs
- [ ] Responsive design for small screens

#### 3.5.2 Workspace Switching Logic
- [ ] Implement `switchWorkspace(workspaceId: string)` action in store
- [ ] Save current workspace state before switching
- [ ] Restore workspace state on switch
- [ ] Terminal sessions preserved per workspace
- [ ] Active terminal selection maintained per workspace
- [ ] Workspace session state (running/idle/error) saved

#### 3.5.3 Multi-Workspace State Management
- [ ] Update Zustand store:
  - `openWorkspaces: WorkspaceConfig[]`
  - `activeWorkspaceId: string | null`
  - `sessionsByWorkspace: Map<string, TerminalSession[]>`
  - `activeSessionByWorkspace: Map<string, string>`
- [ ] Persist open workspaces to local storage
- [ ] Restore open workspaces on app launch
- [ ] Track workspace order for tab display

#### 3.5.4 Workspace Tab UI Design
- [ ] Tab styling with workspace icon (folder icon)
- [ ] Tab badge showing running session count
- [ ] Close button visible on hover (X icon)
- [ ] Active tab: blue/accent border, darker background
- [ ] Inactive tab: lighter background, border on hover
- [ ] New tab button: large (+) icon with hover effect
- [ ] Tab animation on switch (fade/slide transition)

#### 3.5.5 Workspace Lifecycle Management
- [ ] Create `openWorkspace(config: WorkspaceConfig)` action
- [ ] Create `closeWorkspace(workspaceId: string)` action
- [ ] On close: kill all terminal sessions for workspace
- [ ] On close: remove from `openWorkspaces` array
- [ ] On close: switch to another open workspace or show setup screen
- [ ] Create `closeAllWorkspaces()` action
- [ ] Create `reopenWorkspace(workspace: WorkspaceConfig)` action (recent workspaces)

#### 3.5.6 Backend Terminal Cleanup
- [ ] Create `kill_workspace_sessions(workspace_id: String)` Tauri command
- [ ] Kill all PTY sessions for workspace
- [ ] Clean up event listeners
- [ ] Release resources properly
- [ ] Verify sessions are terminated

#### 3.5.7 Rust Backend Commands
```rust
#[tauri::command]
async fn kill_workspace_sessions(workspace_id: String) -> Result<(), String>

#[tauri::command]
async fn get_workspace_session_count(workspace_id: String) -> Result<usize, String>
```

#### 3.5.8 Folder Structure Update
```
src/
  ├── components/
  │   ├── workspace/
  │   │   ├── Workspace.tsx
  │   │   ├── TerminalGrid.tsx
  │   │   ├── TerminalPane.tsx
  │   │   └── WorkspaceHeader.tsx  [NEW]
  │   └── workspace/
  │       └── WorkspaceTab.tsx  [NEW]
```

**Acceptance Criteria:**
- User can open multiple workspaces simultaneously
- Tabs display in header with workspace names
- Clicking a tab switches to that workspace
- All terminal sessions for workspace are displayed and functional
- Clicking close (X) kills all sessions and removes tab
- Workspace state is preserved when switching
- Workspaces are restored on app launch
- Active workspace is visually highlighted
- Tab order is maintained across sessions
- "New Workspace" button opens setup screen
- At least one workspace can be open at all times (or show setup screen)

---

### Phase 4: CLI Integration (Week 6-7)

**Deliverables:**
- Auto-launch agent CLI in assigned terminals
- CLI authentication status detection
- CLI-ready terminal indicators
- Manual CLI restart/retry options

**Rationale:**
Since YzPzCode installs and manages the actual agent CLIs (Claude Code, OpenCode, Codex, Gemini), we don't need a custom LLM execution system. The CLIs handle all AI interactions. This phase focuses on seamlessly integrating these CLIs into the terminal workflow.

**Tasks:**

#### 4.1 CLI Launch Service
- [x] Create `CliLauncher` Rust service
- [x] Auto-start CLI in terminal when workspace launches:
  ```rust
  pub async fn launch_cli_in_terminal(
      &self,
      session_id: String,
      agent: AgentType,
      cwd: String,
  ) -> Result<(), String>
  ```
- [x] CLI startup command mapping:
  | Agent | Launch Command |
  |-------|----------------|
  | Claude | `claude` |
  | OpenCode | `opencode` |
  | Codex | `codex` |
  | Gemini | `gemini` |

#### 4.2 CLI Authentication Detection
- [x] Check if CLI is authenticated:
  - Claude Code: Check for `~/.claude/` config
  - OpenCode: Check for `~/.opencode/` config
  - Codex: Check for OpenAI API key in env
  - Gemini: Check for `~/.gemini/` config or `GEMINI_API_KEY`
- [x] Display authentication status in terminal header
- [x] Show "Authentication Required" badge if not authenticated
- [x] Add "Authenticate" button that shows auth instructions

#### 4.3 Terminal-CLI Integration
- [x] Pass working directory to CLI on launch
- [x] Handle CLI startup failures gracefully
- [x] Show CLI startup progress indicator
- [x] Display CLI version in terminal header

#### 4.4 CLI Status UI
- [x] Update `AgentCliStatusBadge` to show:
  - ✓ Ready (installed + authenticated)
  - ⚠ Auth Required (installed, not authenticated)
  - ✗ Not Installed
  - ○ Starting...
- [x] Add CLI status to terminal pane header
- [x] Show CLI name and version tooltip on hover

#### 4.5 Manual Controls
- [x] Add "Restart CLI" button in terminal pane
- [x] Add "Stop CLI" button in terminal pane
- [x] Add "Authenticate CLI" button with modal
- [x] Context menu with CLI options

#### 4.6 Error Handling
- [x] Detect CLI crash and show error
- [x] Offer to restart CLI on crash
- [x] Log CLI errors for debugging
- [x] Show user-friendly error messages

**Acceptance Criteria:**
- CLI launches automatically in assigned terminal slots
- Authentication status is clearly visible
- User can manually restart/authenticate CLI
- CLI errors are handled gracefully
- Terminals without agents work as regular shells

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Frontend:**
- Component rendering
- State management logic
- Allocation validation
- Form validation

**Backend:**
- Terminal session management
- Agent command parsing
- Shell detection
- CLI detection logic
- CLI installation flow
- Prerequisites checking

### 7.2 Integration Tests

- Workspace creation → launch flow
- Agent allocation → execution flow
- Multi-terminal concurrency
- Cross-platform shell handling
- CLI detection → installation → verification flow
- Prerequisites validation flow
- Multi-workspace switching with session preservation
- Workspace close with terminal session termination
- Workspace state persistence across app restarts

### 7.3 End-to-End Tests

- Create workspace → assign agents → launch → run agent task

---

## 8. Quality Checklist

### 8.1 Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] Rust clippy warnings fixed
- [ ] Code coverage > 70%

### 8.2 Performance
- [ ] Terminal input latency < 50ms
- [ ] Grid rendering < 100ms
- [ ] Agent response time < 5s (network dependent)

### 8.3 Cross-Platform
- [ ] Windows support
- [ ] macOS support
- [ ] Linux support

### 8.4 Security
- [ ] No hardcoded API keys
- [ ] Shell command sanitization
- [ ] Working directory validation
- [ ] Path traversal prevention

---

## 9. Documentation Requirements

- [ ] Architecture diagram
- [ ] API documentation
- [ ] User guide (basic usage)
- [ ] Setup guide (dev environment)
- [ ] Deployment instructions

---

## 10. Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Terminal performance issues | High | Medium | Benchmark early, use streaming |
| Agent API rate limits | Medium | High | Implement queue/backoff |
| Cross-platform shell differences | Medium | High | Detect OS, use appropriate defaults |
| xterm.js performance with many terminals | High | Low | Limit to max 8 terminals |
| State sync issues | Medium | Medium | Single source of truth (Zustand) |
| CLI installation failure | Medium | Medium | Silent fallback, retry option, manual install docs |
| Prerequisites not met | High | Medium | Clear error messages with install instructions |
| Network issues during CLI install | Medium | Low | Retry logic, cached binaries option |
| CLI version incompatibility | Low | Low | Version checking, minimum version requirements |

---

## 11. Success Metrics

- **Functional:** 100% of MVP features working across all platforms
- **Performance:** Terminal latency < 50ms, Grid render < 100ms
- **Usability:** New user can create and launch workspace in < 5 minutes
- **Quality:** < 10 bugs per feature, > 70% test coverage

---

## 12. Next Steps After MVP

1. **Phase 5:** Command block system (Warp-style)
2. **Phase 6:** Built-in code editor (Monaco)
3. **Phase 7:** Task board with Kanban UI
4. **Phase 8:** Agent memory system
5. **Phase 9:** Plugin architecture
6. **Phase 10:** Performance optimization
7. **Phase 11:** CLI update management
8. **Phase 12:** Multi-session workflows (agent orchestration)
9. **Phase 13:** Keyboard shortcuts settings page (customizable shortcuts for workspace switching)

---

## 13. Appendix: Folder Structure

```
agentic-space/
├── src/
│   ├── assets/
│   │   ├── claude.png
│   │   ├── codex.png
│   │   ├── cursor-ai.png
│   │   ├── gemini-cli-logo.svg
│   │   └── opencode.png
│   ├── components/
│   │   ├── setup/
│   │   │   ├── SetupScreen.tsx
│   │   │   ├── DirectorySelector.tsx
│   │   │   ├── LayoutSelector.tsx
│   │   │   ├── AgentFleetConfig.tsx
│   │   │   ├── PrerequisitesPanel.tsx
│   │   │   └── AgentCliStatusBadge.tsx
│   │   ├── workspace/
│   │   │   ├── Workspace.tsx
│   │   │   ├── WorkspaceHeader.tsx
│   │   │   ├── WorkspaceTab.tsx
│   │   │   ├── TerminalGrid.tsx
│   │   │   └── TerminalPane.tsx
│   │   └── common/
│   │       └── UtilizationBar.tsx
│   ├── hooks/
│   │   ├── useWorkspace.ts
│   │   ├── useAgentAllocation.ts
│   │   ├── useTerminal.ts
│   │   └── useAgentCli.ts
│   ├── stores/
│   │   └── appStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── grid.ts
│   ├── styles.css
│   ├── main.tsx
│   ├── App.tsx
│   └── vite-env.d.ts
├── src-tauri/
│   ├── src/
│   │   ├── types.rs
│   │   ├── commands/
│   │   │   └── mod.rs
│   │   ├── terminal/
│   │   │   ├── mod.rs
│   │   │   └── session.rs
│   │   ├── agent_cli/
│   │   │   ├── mod.rs
│   │   │   ├── provider.rs
│   │   │   ├── detector.rs
│   │   │   ├── installer.rs
│   │   │   ├── prerequisites.rs
│   │   │   └── providers/
│   │   │       ├── mod.rs
│   │   │       ├── claude.rs
│   │   │       ├── opencode.rs
│   │   │       ├── codex.rs
│   │   │       ├── gemini.rs
│   │   │       └── cursor.rs
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── capabilities/
│   │   └── default.json
│   └── Cargo.toml
├── package.json
└── README.md
```

---

## 14. Appendix: Agent CLI Reference

### Supported CLIs

| CLI | Binary | Package | Prerequisites | Docs |
|-----|--------|---------|---------------|------|
| Claude Code | `claude` | `@anthropic-ai/claude-code` | Node.js 18+, Git | https://code.claude.com/docs |
| OpenCode | `opencode` | `opencode-ai` | Node.js 18+, Git | https://opencode.ai/docs |
| Codex CLI | `codex` | `@openai/codex` | Node.js 18+, Git | https://developers.openai.com/codex/cli |
| Gemini CLI | `gemini` | `@google/gemini-cli` | Node.js 18+, Git | https://geminicli.com/docs |
| Cursor CLI | `agent` | Cursor CLI | Git | https://cursor.com/docs/cli/overview |

### Installation Commands by Platform

**Claude Code:**
- Windows: `irm https://claude.ai/install.ps1 | iex`
- macOS/Linux: `curl -fsSL https://claude.ai/install.sh | bash`
- npm: `npm install -g @anthropic-ai/claude-code`
- Homebrew: `brew install --cask claude-code`
- WinGet: `winget install Anthropic.ClaudeCode`

**OpenCode:**
- Windows: `npm install -g opencode-ai` or `choco install opencode` or `scoop install opencode`
- macOS: `brew install anomalyco/tap/opencode`
- Linux: `npm install -g opencode-ai`
- All platforms: `curl -fsSL https://opencode.ai/install | bash`

**Codex CLI:**
- All platforms: `npm i -g @openai/codex`
- Homebrew: `brew install openai-codex`

**Gemini CLI:**
- All platforms: `npm install -g @google/gemini-cli`
- Alternative (no install): `npx @google/gemini-cli`
- Homebrew: `brew install gemini-cli`
- MacPorts: `sudo port install gemini-cli`

**Cursor CLI:**
- Windows: `irm 'https://cursor.com/install?win32=true' | iex`
- macOS/Linux/WSL: `curl https://cursor.com/install -fsS | bash`

### Detection Commands

| CLI | Version Check | Binary Location |
|-----|---------------|-----------------|
| Claude Code | `claude --version` | `which claude` / `where claude` |
| OpenCode | `opencode --version` | `which opencode` / `where opencode` |
| Codex CLI | `codex --version` | `which codex` / `where codex` |
| Gemini CLI | `gemini --version` | `which gemini` / `where gemini` |
| Cursor CLI | `agent --version` | `which agent` / `where agent` |

### Prerequisites Detection

| Prerequisite | Detection Command | Minimum Version | Install URL |
|--------------|-------------------|-----------------|-------------|
| Node.js | `node --version` | v18.0.0 | https://nodejs.org |
| npm | `npm --version` | v8.0.0 | (bundled with Node.js) |
| Git | `git --version` | v2.0.0 | https://git-scm.com |

---

This implementation plan provides clear boundaries, specific deliverables, and a phased approach to building YzPzCode's MVP.
