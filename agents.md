# YzPzCode - AI Agent Development Guide

Guides AI coding agents working in this Tauri v2 desktop app for managing AI CLI tools.

## Development Commands

### Rust Backend (Tauri)
```bash
npm run tauri dev          # Dev server with hot reload
npm run tauri build        # Production build

cd app/src-tauri
cargo check                # Type check without building
cargo clippy               # Lint
cargo clippy --fix         # Lint + auto-fix
cargo fmt                  # Format
cargo test                 # Run all tests
cargo test test_name       # Run single test by name
cargo test module::test    # Run tests in a module
```

### Frontend (React + TypeScript)
```bash
cd app
npm run dev                # Vite dev server (standalone)
npm run build              # tsc + vite build
npm run preview            # Preview production build
npx tsc --noEmit           # Type check only
```

## Code Style — Rust

**Error Handling**
- Use `anyhow::Result<T>` for internal functions
- Tauri commands return `Result<T, String>` — convert with `.map_err(|e| e.to_string())`
- Add context with `.context("description")`
- Prefer `unwrap_or_else` or `?` over raw `unwrap()`

**Async & Concurrency**
- Shared state: `Arc<Mutex<T>>` — always `lock().unwrap()` briefly
- Async work: `tokio::spawn(async move { ... })`
- Thread work: `std::thread::spawn(move || { ... })`
- Thread-safe traits: require `Send + Sync`

**Structs & Types**
- Derive: `Debug, Clone, Serialize, Deserialize` (add `Eq, PartialEq, Hash` for enums)
- Implement `Clone` manually when fields include `Option<AppHandle>`
- Implement `Default` for structs with sensible defaults
- Use `pub(crate)` for crate-internal items

**Serde Conventions**
- `#[serde(rename_all = "camelCase")]` on structs
- `#[serde(rename_all = "lowercase")]` on enums
- `#[serde(rename = "type")]` when field conflicts with Rust keyword

**Platform-Specific Code**
```rust
#[cfg(target_os = "windows")]       { /* Windows */ }
#[cfg(target_os = "macos")]         { /* macOS */ }
#[cfg(not(any(target_os = "windows", target_os = "macos")))]  { /* Linux */ }
```

## Code Style — TypeScript/React

**Config** — Strict mode, `noUnusedLocals`, `noUnusedParameters`, bundler module resolution.

**Components**
- Function components + hooks (no classes)
- Zustand for global state, local `useState` for component state
- Tailwind CSS for all styling
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils

**Import Order**
```typescript
// 1. External libs
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 2. Local components
import { SetupScreen } from './components/setup/SetupScreen';

// 3. Hooks & stores
import { useAppStore } from './stores/appStore';

// 4. Types
import type { AgentType } from '../types';
```

**Types**
- Interfaces in `src/types/`
- Explicit return types on exported functions
- Never use `any` — use `unknown` or proper types

## Tauri Command Pattern

```rust
#[tauri::command]
pub async fn do_thing(
    state: State<'_, Manager>,
    param: String,
) -> Result<ResponseType, String> {
    state.inner().do_work(param).map_err(|e| e.to_string())
}
```

Register in `lib.rs` → `tauri::generate_handler![...]`.

## Project Structure

```
app/
├── src-tauri/src/
│   ├── agent/              # Task execution & orchestration
│   ├── agent_cli/          # CLI detection, install, launch
│   │   └── providers/      # Per-provider logic (claude, gemini, etc.)
│   ├── commands/           # Tauri IPC handlers
│   ├── terminal/           # PTY session management
│   ├── filesystem/         # File ops, git status/diff, watcher
│   ├── ide/                # IDE detection & launching
│   ├── utils/              # Env setup, process helpers
│   ├── types.rs            # Shared types
│   ├── lib.rs              # App init, plugin setup, state
│   └── main.rs             # Entry point
├── src/
│   ├── components/         # React UI
│   │   ├── setup/          # Config screens
│   │   ├── workspace/      # Terminal grid
│   │   ├── explorer/       # File tree & git panels
│   │   ├── editor/         # Code editor + previews
│   │   ├── common/         # Shared (theme, footer, etc.)
│   │   └── feedback/       # Feedback modal
│   ├── hooks/              # useTerminal, useWorkspace, etc.
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Grid helpers, window utils
│   └── main.tsx            # React entry
├── src-tauri/Cargo.toml
└── package.json
```

## Key Dependencies

| Rust | Frontend |
|------|----------|
| tauri 2, portable-pty, tokio | React 19, TypeScript 5.6 |
| anyhow, thiserror, serde | Vite 6, Tailwind CSS 4 |
| reqwest, uuid, notify | Zustand, @xterm/xterm |
| regex, base64, which | CodeMirror 6, framer-motion |

## Linting Rules

- Zero warnings before committing
- `cargo clippy --fix` then `cargo fmt` for Rust
- `npx tsc --noEmit` for frontend type errors
- No unused imports — IDE should flag them
