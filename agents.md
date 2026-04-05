# YzPzCode - AI Agent Development Guide

Tauri v2 desktop app for managing AI CLI tools (Claude, Gemini, Codex, Kilo, OpenCode, Cursor).
Rust backend + React 19 frontend. Borderless window, custom titlebar, PTY-based terminal grid.

## Development Commands

All commands run from `app/` unless noted. Dev server port: `8745`.

### Rust Backend
```bash
npm run tauri dev                # Dev server with hot reload (from app/)
npm run tauri build              # Production build (from app/)
cargo check                      # Type check (from app/src-tauri/)
cargo clippy                     # Lint
cargo clippy --fix               # Lint + auto-fix
cargo fmt                        # Format
cargo test                       # Run all tests
cargo test test_name             # Run single test by name
cargo test module_name::test     # Run tests in a specific module
cargo test --test integration    # Run integration tests
```

### Frontend
```bash
npm run dev                      # Vite dev server (standalone, from app/)
npm run build                    # tsc + vite build
npx tsc --noEmit                 # Type check only (from app/)
```

## Version Updates

Version is defined in **3 files** — update all consistently:
- `app/package.json` → `"version"`
- `app/src-tauri/Cargo.toml` → `version`
- `app/src-tauri/tauri.conf.json` → `"version"`

## Project Structure

```
app/
├── src-tauri/src/
│   ├── agent/              # Task execution, retry logic
│   ├── agent_cli/          # CLI detection, install, launch
│   │   └── providers/      # Per-provider (claude, gemini, codex, kilo, opencode, cursor)
│   ├── commands/           # Tauri IPC handlers (thin wrappers)
│   ├── terminal/           # PTY session management (TerminalManager)
│   ├── filesystem/         # File ops, git status/diff, watcher
│   ├── ide/                # IDE detection & launching (VS Code, JetBrains, etc.)
│   ├── utils/              # Env setup, process helpers
│   ├── types.rs            # Shared types (AgentType, WorkspaceConfig, etc.)
│   ├── lib.rs              # App init, plugin setup, state, generate_handler!
│   └── main.rs             # Entry point
├── src/
│   ├── components/         # React UI (PascalCase.tsx)
│   │   ├── setup/          # Onboarding/config screens
│   │   ├── workspace/      # Terminal grid, workspace tabs
│   │   ├── explorer/       # File tree & git panels
│   │   ├── editor/         # CodeMirror + file previews (PDF, DOCX, images)
│   │   ├── common/         # Shared (theme toggle, footer, context menu)
│   │   ├── settings/       # Settings screen with sections
│   │   └── feedback/       # Feedback modal
│   ├── hooks/              # useTerminal, useWorkspace, useFileEditor, etc. (camelCase.ts)
│   ├── stores/             # Zustand stores (appStore.ts, updaterStore.ts)
│   ├── types/              # TypeScript interfaces (index.ts)
│   ├── utils/              # Grid layout, window helpers, project detection
│   ├── styles.css          # Global styles, CSS vars, theming
│   ├── App.tsx             # Root component, view routing
│   └── main.tsx            # React entry with ErrorBoundary
```

## Code Style — Rust

**Error Handling**
- Internal functions: `anyhow::Result<T>` with `.context("description")?`
- Tauri commands: `Result<T, String>` — convert with `.map_err(|e| e.to_string())`
- Prefer `unwrap_or_else` or `?` over raw `unwrap()`

**Async & Concurrency**
- Shared state: `Arc<Mutex<T>>` — hold `lock().unwrap()` briefly, never across `.await`
- Async work: `tokio::spawn(async move { ... })`
- Blocking work: `std::thread::spawn(move || { ... })` or `tokio::spawn_blocking`
- All shared state types must be `Send + Sync`

**Structs & Types**
- Derive: `Debug, Clone, Serialize, Deserialize` (add `Eq, PartialEq, Hash` for enums)
- Manual `Clone` impl when fields include `Option<AppHandle>`
- Manual `Default` for structs with non-trivial defaults
- `pub(crate)` for crate-internal items

**Serde**
- `#[serde(rename_all = "camelCase")]` on structs (matches JS conventions)
- `#[serde(rename_all = "lowercase")]` on enums
- `#[serde(rename = "type")]` when field conflicts with keyword

**Platform-Specific Code**
```rust
#[cfg(target_os = "windows")]
#[cfg(target_os = "macos")]
#[cfg(not(any(target_os = "windows", target_os = "macos")))]  // Linux
```

**Tauri Command Pattern**
```rust
#[tauri::command]
pub async fn command_name(
    state: State<'_, ManagerType>,
    param: String,
) -> Result<ResponseType, String> {
    state.inner().do_work(param).map_err(|e| e.to_string())
}
```
Register in `lib.rs` → `tauri::generate_handler![command_name, ...]`.

**Real-Time Events** (Rust → Frontend)
```rust
app.emit("event-name", &payload).map_err(|e| e.to_string())?;
```
Frontend listens with `listen<T>("event-name", callback)` from `@tauri-apps/api/event`.

## Code Style — TypeScript/React

**TypeScript Config** — Strict mode, `noUnusedLocals`, `noUnusedParameters`, `moduleResolution: "bundler"`.

**Components**
- Function components + hooks only (no classes)
- Zustand for global state (persisted via middleware), `useState` for component-local state
- Tailwind CSS v4 for all styling (no CSS modules, no styled-components)
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils/stores

**Import Order**
```typescript
// 1. External libs (react, framer-motion, @tauri-apps/*)
// 2. Local components
// 3. Hooks & stores
// 4. Types (use `import type` for type-only imports)
```

**Types**
- Interfaces in `src/types/index.ts` — mirror Rust types exactly
- Explicit return types on exported functions
- Never use `any` — use `unknown` or proper types
- Type-only imports: `import type { Foo } from '../types'`

**Tauri IPC (Frontend)**
```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke<ResponseType>('command_name', { param });
```

**State Management (Zustand)**
```typescript
interface AppStore {
  field: Type;
  action: (param: Type) => void;
}
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      field: defaultValue,
      action: (param) => set({ field: param }),
    }),
    { name: 'yzpzcode-storage', partialize: (state) => ({ /* persisted fields */ }) }
  )
);
```

**Styling**
- Theme via CSS custom properties (see `styles.css`): `--bg-primary`, `--text-primary`, `--border-color`, etc.
- Accent colors: `--accent` / `--accent-hover` CSS variables
- UI density classes: `compact` / `comfortable` / `spacious`
- Reduced motion: `reduce-motion` class on body disables animations
- Dark/light themes toggled via `dark` class on document root

## Key Dependencies

| Rust | Frontend |
|------|----------|
| tauri 2, portable-pty, tokio | React 19, TypeScript 5.6 |
| anyhow, thiserror, serde | Vite 6, Tailwind CSS 4 |
| reqwest, uuid, notify | Zustand 5, @xterm/xterm 6 |
| regex, base64, which | CodeMirror 6, framer-motion |

## Linting & Quality

- Zero warnings before committing
- Rust: `cargo clippy --fix` then `cargo fmt`
- Frontend: `npx tsc --noEmit` (from `app/`)
- No unused imports — both `clippy` and `tsc` will flag them
- No Prettier or ESLint configured — follow existing code patterns
