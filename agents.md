# YzPzCode - AI Agent CLI Development Guide

This guide helps AI coding agents work effectively in this Tauri v2 application for managing AI CLI tools.

## Development Commands

### Rust Backend (Tauri)
```bash
# Development with hot reload
npm run tauri dev

# Build release
npm run tauri build

# Lint and auto-fix warnings
cargo clippy
cargo clippy --fix

# Run all tests
cd app/src-tauri
cargo test

# Run single test
cargo test test_name

# Check compilation without building
cargo check

# Format code
cargo fmt
```

### Frontend (React + TypeScript)
```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Build production
npm run build

# Preview production build
npm run preview
```

## Code Style Guidelines

### Rust Code Style

**Error Handling**
- Use `anyhow::Result<()>` for functions that may fail
- Convert errors for Tauri commands with `.map_err(|e| e.to_string())`
- Provide context with `.context()` from anyhow
- Use `unwrap_or_else(|| default)` for fallback values, not `unwrap()`

**Concurrency**
- Shared state: `Arc<Mutex<T>>` with `lock().unwrap()`
- Spawning threads: `std::thread::spawn(move || { ... })`
- Async operations: Use `tokio::spawn(async move { ... })`
- Traits requiring thread safety: `Send + Sync`

**Structs and Traits**
- Implement `Default` trait for structs with sensible defaults
- Implement `Clone` manually for structs with non-clone fields (e.g., `Option<AppHandle>`)
- Use `pub(crate)` for items visible within the crate but not externally
- Derive common traits: `Debug, Clone, Serialize, Deserialize`

**Platform-Specific Code**
```rust
#[cfg(target_os = "windows")]
{ /* Windows-specific code */ }

#[cfg(not(target_os = "windows"))]
{ /* Non-Windows code */ }
```

**Serialization**
- Use `#[serde(rename_all = "lowercase")]` for enum variants
- Use `#[serde(rename = "type")]` when conflicting with Rust keywords

**Clone Pattern for Managers**
```rust
impl Clone for Manager {
    fn clone(&self) -> Self {
        Self {
            field1: self.field1.clone(),
            field2: self.field2.clone(),
        }
    }
}
```

### TypeScript/React Code Style

**Configuration**
- Strict TypeScript enabled: no unused locals/parameters
- React JSX mode: `react-jsx`
- Module resolution: bundler mode (Vite)

**Component Structure**
- Function components with hooks
- Zustand for global state management
- Tailwind CSS for styling
- Import order: external libraries, local components, utils/types

**TypeScript**
- Define interfaces in `types/` directory
- Use explicit return types for functions
- Avoid `any` - use proper types or `unknown`

**Imports**
```typescript
// External libraries
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Local components
import { SetupScreen } from './components/setup/SetupScreen';

// Hooks and stores
import { useAppStore } from './stores/appStore';
```

## Project Structure

```
app/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── agent/      # Agent execution logic
│   │   ├── agent_cli/  # CLI detection & installation
│   │   │   ├── providers/  # Individual CLI provider implementations
│   │   │   ├── auth_detector.rs  # CLI authentication detection
│   │   │   ├── cli_launcher.rs   # CLI launch service
│   │   │   ├── detector.rs  # CLI detection logic
│   │   │   ├── installer.rs # CLI installation logic
│   │   │   ├── prerequisites.rs # System prerequisite checking
│   │   │   └── provider.rs   # Provider trait definition
│   │   ├── commands/   # Tauri command handlers
│   │   ├── terminal/   # PTY terminal session management
│   │   ├── types.rs    # Shared type definitions
│   │   └── lib.rs      # Main app entry point
│   ├── capabilities/   # Tauri permissions
│   └── Cargo.toml
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   │   ├── useAgent.ts       # Agent task execution
│   │   ├── useAgentCli.ts    # CLI detection/installation
│   │   ├── useCliLauncher.ts # CLI launching/auth
│   │   ├── useTerminal.ts    # Terminal management
│   │   └── useWorkspace.ts   # Workspace creation
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── main.tsx        # React entry point
└── package.json
```

## Common Patterns

**Tauri Command Signature**
```rust
#[tauri::command]
pub async fn command_name(
    state: State<'_, Manager>,
    param: Type,
) -> Result<ResponseType, String> {
    state.method(param).map_err(|e| e.to_string())
}
```

**Emitting Events to Frontend**
```rust
handle.emit("event-name", payload)?;
```

**Enum with Platform Detection**
```rust
pub enum Platform { Windows, Macos, Linux }

impl Platform {
    pub fn current() -> Self {
        #[cfg(target_os = "windows")]
        { Platform::Windows }
        // ... other platforms
    }
}
```

## Linting and Warnings

- Fix unused imports with `cargo clippy --fix`
- Remove unused struct fields, methods, and enum variants
- Keep warnings zero before committing
- Run `cargo fmt` before committing for consistent formatting

## Key Dependencies

**Rust**: tauri (v2), portable-pty, tokio, anyhow, thiserror, serde, uuid, reqwest
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, @tauri-apps/api (v2)
