# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YzPzCode is a Tauri v2 desktop application that provides a unified interface for multiple AI coding CLI tools (Claude, Gemini, Codex, Opencode, Cursor). It combines a React 19 frontend with a Rust backend to create a native, cross-platform development environment.

**Tech Stack:**
- Frontend: React 19 + TypeScript, Vite, Tailwind CSS v4, Zustand, CodeMirror 6, xterm.js
- Backend: Tauri v2, Rust, portable-pty, Tokio
- Development: Node.js 18+, Rust (latest stable)

## Development Commands

```bash
# Navigate to app directory first
cd app

# Development
npm install              # Install dependencies
npm run tauri dev       # Run development server (opens on port 8745)

# Building
npm run build           # Build frontend only
npm run tauri build     # Build production installers

# Type Checking
npx tsc --noEmit        # Frontend type checking
cd src-tauri && cargo check  # Backend type checking

# Rust-specific
cd src-tauri
cargo test              # Run tests
cargo clippy            # Lint
cargo fmt               # Format code
```

## Architecture

### Frontend-Backend Communication
The app uses Tauri's IPC (Inter-Process Communication) for all frontend-backend communication:
- Frontend calls Tauri commands via `@tauri-apps/api/core`
- Backend defines commands in `src-tauri/src/commands/` with `#[tauri_command]`
- No direct REST APIs - all communication goes through Tauri IPC

### State Management
- **Zustand** (`app/src/stores/appStore.ts`): Centralized state with persistence
- Key state slices include:
  - Workspace management (currentWorkspace, workspaceList, openWorkspaces)
  - Terminal sessions (sessions, activeSessionId)
  - CLI statuses (cliStatuses, toolCliStatuses)
  - Authentication states (authInfos, toolAuthInfos)
  - UI settings (theme, terminal settings, editor settings)

### Terminal Management
- **Backend** (`src-tauri/src/terminal/`): Manages PTY sessions using `portable-pty`
- **Frontend** (`app/src/components/workspace/`): xterm.js-based terminal UI
- Terminal session management flows through `TerminalManager` in Rust
- Each AI CLI gets its own PTY session with real-time I/O

### Agent CLI System
The app supports multiple AI coding agents through a provider-based architecture:

**Backend** (`src-tauri/src/agent_cli/`):
- `detector.rs`: Detects installed CLIs and their versions
- `cli_launcher.rs`: Spawns CLI processes in PTY sessions
- `auth_detector.rs`: Checks authentication status for each CLI
- `installer.rs`: Handles CLI installation workflows
- `providers/`: Provider-specific implementations (claude, gemini, codex, etc.)
- `prerequisites.rs`: Checks for Node.js, npm, git, and other dependencies

**Frontend** (`app/src/hooks/useAgentCli.ts`):
- Custom React hooks for CLI operations
- Manages installation, launching, and auth flows

### File System Operations
**Backend** (`src-tauri/src/filesystem/`):
- `explorer.rs`: File tree operations
- `git_status.rs`: Git repository status
- `git_diff_stats.rs`: Git diff statistics
- `watcher.rs`: File system change notifications
- `operations.rs`: File/directory operations (create, delete, move)
- `reader.rs`: File content reading with preview support

**Frontend** (`app/src/components/explorer/`):
- File tree UI using `react-arborist`
- Git status badges and indicators
- Drag-and-drop file operations

### Multi-Tab Editor
**Frontend** (`app/src/components/editor/`):
- CodeMirror 6 with syntax highlighting
- Language support: JavaScript, TypeScript, Python, Rust, Java, C++, HTML, CSS, JSON, Markdown
- Features: minimap, search, word wrap, multiple tabs
- File preview for: PDF, Excel, Word, images

### IDE Integration
**Backend** (`src-tauri/src/ide/`):
- `detector.rs`: Detects installed IDEs (VS Code, Cursor, Zed, etc.)
- `launcher.rs`: Opens projects in detected IDEs

## Important File Locations

### Configuration
- `app/vite.config.ts`: Frontend build config with chunk splitting
- `app/tsconfig.json`: TypeScript configuration
- `app/src-tauri/Cargo.toml`: Rust dependencies
- `app/src-tauri/tauri.conf.json`: Tauri app configuration

### Type Definitions
- `app/src/types/index.ts`: Shared TypeScript types for frontend
- `app/src-tauri/src/types.rs`: Rust type definitions

### Custom Hooks
- `app/src/hooks/useTerminal.ts`: Terminal session management
- `app/src/hooks/useAgentAllocation.ts`: Agent workspace allocation
- `app/src/hooks/useFileTree.ts`: File explorer operations
- `app/src/hooks/useFileEditor.ts`: Editor tab management

### Component Structure
- `app/src/components/setup/`: Initial setup and configuration screens
- `app/src/components/workspace/`: Terminal grid and session management
- `app/src/components/explorer/`: File explorer and git panels
- `app/src/components/editor/`: Multi-tab code editor
- `app/src/components/common/`: Shared UI components

## Key Patterns

### Tauri Commands
All backend commands follow this pattern:
```rust
#[tauri_command]
async fn my_command(state: State<'_, AppState>, arg: Type) -> Result<Type, String> {
    // Implementation
}
```

Registered in `lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    my_command,
    // ... other commands
])
```

### Error Handling
- Rust: Use `Result<T, String>` for Tauri commands
- Frontend: Try-catch blocks with user-friendly error messages
- Error boundary in React (`ErrorBoundary.tsx`)

### File Operations
- Always validate paths in Rust before filesystem operations
- Use `validation.rs` for security checks
- Watcher notifications for real-time updates

### Terminal Sessions
- Each session has a unique UUID
- Sessions are managed per-workspace
- PTY I/O is streamed in real-time to frontend

## Testing Strategy
- Rust unit tests in `src-tauri/src/` alongside modules
- Focus on terminal management, CLI detection, and file operations
- Test error cases and edge cases in IPC communication

## Platform-Specific Notes
- **macOS**: Code signing not yet configured - right-click to open on first launch
- **Windows**: No special requirements
- **Linux**: Standard Tauri deployment

## Performance Considerations
- Vite chunk splitting configured for vendor libraries (see `vite.config.ts`)
- Large libraries split: codemirror, pdfjs, xlsx, mammoth, framer-motion
- Terminal scrollback limited to prevent memory issues
- File watching debounced to reduce filesystem load