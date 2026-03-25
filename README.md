# YzPzCode

A cross-platform desktop application for managing multiple AI coding agent CLIs in a unified workspace. Built with Tauri v2, React, and Rust.

## Features

- **Multi-Agent Support**: Manage Claude, Codex, Gemini, Opencode, and Cursor CLI tools
- **Workspace Management**: Create and organize workspaces with custom configurations
- **Terminal Grid**: Run multiple agent sessions side-by-side in a grid layout
- **CLI Detection & Installation**: Automatic detection of installed AI CLIs with guided installation
- **Agent Fleet Configuration**: Allocate different agents to terminal slots in your workspace
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Supported AI Agents

| Agent | CLI Tool | Description |
|-------|----------|-------------|
| Claude | `claude` | Anthropic's Claude CLI |
| Codex | `codex` | OpenAI's Codex CLI |
| Gemini | `gemini` | Google's Gemini CLI |
| Opencode | `opencode` | Opencode CLI |
| Cursor | `cursor` | Cursor AI CLI |

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- xterm.js (terminal emulation)

**Backend**
- Tauri v2
- Rust
- portable-pty (pseudo-terminal)
- Tokio (async runtime)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [pnpm](https://pnpm.io/) or npm

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd YzPzCode/app

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

## Development

### Development Server

```bash
# Start frontend dev server + Tauri
npm run tauri dev
```

### Build

```bash
# Build production release
npm run tauri build
```

### Type Checking

```bash
# Frontend TypeScript check
npx tsc --noEmit

# Rust check
cargo check
```

### Linting & Formatting

```bash
# Rust linting
cargo clippy
cargo clippy --fix

# Rust formatting
cargo fmt
```

### Testing

```bash
# Run Rust tests
cd src-tauri
cargo test

# Run single test
cargo test test_name
```

## Project Structure

```
app/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── agent/          # Agent execution logic
│   │   ├── agent_cli/      # CLI detection & installation
│   │   │   ├── providers/  # Individual CLI provider implementations
│   │   │   ├── auth_detector.rs
│   │   │   ├── cli_launcher.rs
│   │   │   ├── detector.rs
│   │   │   ├── installer.rs
│   │   │   ├── prerequisites.rs
│   │   │   └── provider.rs
│   │   ├── commands/       # Tauri command handlers
│   │   ├── terminal/       # PTY terminal session management
│   │   ├── types.rs        # Shared type definitions
│   │   └── lib.rs          # Main app entry point
│   ├── capabilities/       # Tauri permissions
│   └── Cargo.toml
├── src/                    # React frontend
│   ├── components/
│   │   ├── setup/          # Setup screen components
│   │   ├── workspace/      # Workspace components
│   │   └── common/         # Shared UI components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
└── package.json
```

## Configuration

Workspaces are configured with:
- **Layout**: Grid arrangement (rows/columns) for terminal panes
- **Agent Fleet**: Allocation of specific AI agents to terminal slots
- **Working Directory**: Project path for the workspace

## Recommended IDE Setup

- [VS Code](https://code.visualvisualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

MIT
