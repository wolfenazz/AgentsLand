# Workspace Enhancement Plan

Comprehensive plan for improving the workspace experience across terminals, editor, and file explorer.

---

## Priority 1 — High Impact, Low Effort (Quick Wins)

### Terminal

| # | Feature | Details |
|---|---------|---------|
| 1 | **Focused pane indicator** | `activeSessionId` is stored but never rendered. Add a blue border/glow ring to the focused terminal pane. Wire `onClick` on each `TerminalPane` to call `setActiveSession`. |
| 2 | **Keyboard nav between panes** | `Ctrl+1-9` to jump to pane N, `Ctrl+Tab` / `Ctrl+Shift+Tab` to cycle. Update `activeSessionId` + scroll pane into view. |
| 3 | **Zoom mode** | `Ctrl+Shift+Enter` toggles a single pane to fill the grid, hiding others. Press again to restore. Simple CSS toggle — no grid restructuring. |
| 4 | **Bell notification** | Listen for BEL (`\x07`) in xterm `onData`. Flash pane header border amber + play a subtle sound. Shows "Process complete" on the taskbar icon (via `set_attention`). |
| 5 | **Session renaming** | Double-click or right-click "Rename" on the pane header label (`TTY1`). Store `customName?: string` on `TerminalSession`. Falls back to `TTY{n}` when empty. |

### Editor

| # | Feature | Details |
|---|---------|---------|
| 6 | **Auto-save** | Debounced save (e.g., 2s after last keystroke) via CodeMirror `UpdateListener`. Toggle in settings. |
| 7 | **Find & Replace UI** | Add a toolbar overlay using `@codemirror/search`'s `SearchPanel` or a custom component. Show replace field, match count, next/prev buttons. |
| 8 | **Fix light mode token bug** | `'.tok typeName'` → `'.tok-typeName'` on line ~143 of `FileEditor.tsx`. |

### File Explorer

| # | Feature | Details |
|---|---------|---------|
| 9 | **Delete confirmation** | Show a modal/dialog before `delete_entry`. For directories, warn about recursive deletion. |
| 10 | **Paste action** | Add "Paste" to context menu. Implement `copy_file` / `paste_entry` Tauri command in Rust. Wire to clipboard state that already exists. |

---

## Priority 2 — Medium Impact, Medium Effort

### Terminal

| # | Feature | Details |
|---|---------|---------|
| 11 | **Pane splitting** | Right-click pane header → "Split Right" / "Split Down". Splits one grid cell into 2 by adjusting grid dimensions and reassigning session indices. |
| 12 | **Drag reorder terminals** | Allow dragging pane headers to reorder sessions within the grid. Update `session.index` on drop. |
| 13 | **Drag workspace tabs** | `WorkspaceHeader` tabs are static. Add `onDragStart`/`onDrop` to reorder `openWorkspaces` array. |

### Editor

| # | Feature | Details |
|---|---------|---------|
| 14 | **Minimap** | Enable CodeMirror's built-in minimap extension. |
| 15 | **Diff viewer** | Side-by-side or inline diff using `@codemirror/merge` (CodeMirror's official merge/diff plugin). Trigger from git changes panel. |

### File Explorer

| # | Feature | Details |
|---|---------|---------|
| 16 | **Recursive file search** | "Search in files" command that uses the Rust backend to do a full-text grep across the workspace. Show results in a panel. |
| 17 | **Multi-select in explorer** | Hold `Ctrl` or `Shift` to select multiple files. Bulk delete, copy, move. |

---

## Priority 3 — Lower Impact / Higher Effort

| # | Feature | Area | Details |
|---|---------|------|---------|
| 18 | **Session persistence** | Terminal | Save terminal scrollback + session config to disk on close, restore on next launch. Optional, opt-in. |
| 19 | **Tab layout mode** | Terminal | `LayoutConfig.type: "tabs"` — stack terminals as tabs instead of grid. Toggle between grid/tabs in header. |
| 20 | **Split editor** | Editor | Multi-pane editor (CodeMirror supports this natively with `EditorView` instances). |
| 21 | **Cleanup dead code** | General | Remove unused `grid.ts` (duplicated by inline logic in `TerminalGrid.tsx`), remove unused `react-grid-layout` dependency, remove unused `renameEntry` export in `useFileTree`. |

---

## Key Files to Modify

| Feature | Files |
|---------|-------|
| Focused pane, zoom, keyboard nav | `TerminalPane.tsx`, `TerminalGrid.tsx`, `appStore.ts` |
| Pane splitting | `TerminalGrid.tsx`, `TerminalPane.tsx` |
| Session renaming | `WorkspaceTab.tsx`, `TerminalPane.tsx`, `types/index.ts` |
| Bell notification | `TerminalPane.tsx`, `session.rs` (optional: `set_attention` command) |
| Auto-save, find/replace, minimap | `FileEditor.tsx` |
| Diff viewer | `FileEditor.tsx`, new `@codemirror/merge` dep |
| Paste, delete confirm, multi-select | `FileTree.tsx`, `explorer/operations.rs` |
| Tab reorder, pane drag | `WorkspaceHeader.tsx`, `TerminalGrid.tsx` |

---

## Implementation Order (Sprints)

### Sprint 1 — Terminal UX polish
Items 1, 2, 3, 4, 5

### Sprint 2 — Editor polish
Items 6, 7, 8, 14

### Sprint 3 — Explorer fixes
Items 9, 10, 16, 17

### Sprint 4 — Advanced terminal
Items 11, 12, 13

### Sprint 5 — Diff viewer + cleanup
Items 15, 21
