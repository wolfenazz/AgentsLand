# YzPzCode – Implementation Plan

## 1. Vision

YzPzCode is a native desktop "agentic development environment" that combines terminals, AI agents, code editing, and task management into a unified workflow. The goal is to reduce friction between thinking, coding, running, and orchestrating AI tools.

---

## 2. Core Architecture

### 2.1 Tech Stack

* **Desktop Framework:** Tauri v2
* **Frontend:** React 19 + TypeScript
* **State Management:** Zustand or Redux Toolkit
* **Backend (Tauri side):** Rust
* **Terminal Engine:** PTY (via Rust crates like `portable-pty` or `tauri-plugin-shell`)
* **Editor:** Monaco Editor or CodeMirror
* **AI Integration:** API abstraction layer (OpenAI, local LLMs, etc.)

### 2.2 High-Level Modules

1. UI Shell (React)
2. Terminal Engine
3. Agent Orchestrator
4. Code Editor
5. Task Board
6. Command Block System
7. File System Layer
8. Plugin System (future)

---

## 3. Core Features Breakdown

> ⚡ **Scope Update (MVP based on provided UI):**
> For the first version, YzPzCode should focus ONLY on:

* Workspace creation flow
* Layout selection (multi-terminal grid)
* AI Agent Fleet assignment
* Launching a workspace with configured terminals + agents

Everything else (editor, task board, plugins) is **deferred**.

---

### 3.0 Workspace Creation Flow (CRITICAL MVP)

This is the main feature and must match the UI you shared.

#### Step 1: Configure Layout Screen

**User Inputs:**

* Working directory (file picker or terminal-style input)
* Layout template (grid of terminals)

**Layout Options:**

* 1 session
* 2 sessions
* 4 sessions
* 6 sessions
* 8+ sessions (grid presets)

**Data Model:**

```ts
type WorkspaceConfig = {
  id: string
  path: string
  layout: {
    type: "grid"
    sessions: number
  }
}
```

**Implementation Notes:**

* Use Tauri dialog API for folder selection
* Persist last used directory
* Layout selection = simple grid preset mapping

---

#### Step 2: AI Agent Fleet Configuration

**Concept:**
User assigns AI agents to terminal slots.

**Agents (MVP):**

* Claude
* Codex
* Gemini
* OpenCode (local runner)
* Cursor (optional)

**UI Behavior:**

* Each agent has:

  * Toggle (enabled/disabled)
  * Counter (how many slots assigned)
* Total assigned must not exceed session count

**Data Model:**

```ts
type AgentType = "claude" | "codex" | "gemini" | "opencode" | "cursor"

type AgentFleet = {
  totalSlots: number
  allocation: Record<AgentType, number>
}
```

**Validation Rules:**

* Sum(allocation) <= totalSlots
* Show utilization bar

---

#### Step 3: Launch Workspace

**What Happens:**

* Create N terminal sessions
* Assign each session an agent (based on allocation)
* Set working directory for all sessions
* Start shell processes

**Runtime Model:**

```ts
type TerminalSession = {
  id: string
  cwd: string
  agent?: AgentType
  status: "idle" | "running"
}
```

---

### 3.1 Multi-Terminal Grid (Core UI)

#### Features:

* Dynamic grid layout based on selected template
* Each cell = one terminal session
* Resizable panes (later)

#### Implementation:

* CSS Grid (fastest for MVP)
* Map session count → grid config

Example:

* 4 sessions → 2x2
* 6 sessions → 3x2

---

### 3.2 Terminal System (Simplified MVP)

#### Features:

* One shell per grid cell
* Shared working directory
* Basic input/output streaming

#### Implementation:

* Tauri shell or PTY backend
* Each terminal = separate process

---

### 3.3 Agent Execution (Lightweight MVP)

#### Behavior:

* Agent runs inside terminal context
* Sends commands to terminal
* Reads output

#### Simple Loop:

1. Agent receives task
2. Generates command
3. Executes in terminal
4. Reads output

**No complex memory system yet.**

---

### 3.1 Multi-Pane Workspace

* Split layout (horizontal/vertical)
* Resizable panes
* Pane types:

  * Terminal
  * Editor
  * Agent Chat
  * Task Board

**Implementation Notes:**

* Use a layout manager (e.g., `react-grid-layout` or custom flex system)
* Persist layout in local storage

---

### 3.2 Terminal System

#### Features:

* Multiple terminal tabs
* Persistent sessions
* Command history
* Shell detection

#### Implementation:

* Use Tauri shell plugin or PTY backend in Rust
* Stream stdout/stderr to frontend via events
* Maintain session IDs

---

### 3.3 Warp-Style Command Blocks

#### Concept:

Each command execution becomes a "block" with:

* Input
* Output
* Metadata (time, status)

#### Features:

* Re-run blocks
* Edit and re-execute
* Collapse/expand

#### Implementation:

* Represent blocks as structured objects
* Store in local DB (SQLite via Tauri)

---

### 3.4 Built-in Code Editor

#### Features:

* Syntax highlighting
* Multi-file tabs
* File tree
* Git integration (future)

#### Implementation:

* Monaco Editor
* File system access via Tauri FS API

---

### 3.5 Agent Orchestration System

#### Concept:

Agents are autonomous units that can:

* Run commands
* Edit files
* Respond to prompts

#### Components:

1. Agent Manager
2. Execution Engine
3. Memory System

#### Features:

* Multi-agent workflows
* Tool usage (terminal, file edits)
* Streaming responses

#### Implementation:

* Define agent schema:

  ```ts
  type Agent = {
    id: string
    name: string
    tools: Tool[]
    memory: Memory
  }
  ```

* Tool abstraction:

  ```ts
  type Tool = {
    name: string
    execute: (input) => Promise<any>
  }
  ```

---

### 3.6 Open Code Automation

#### Goal:

Allow agents to:

* Generate code
* Execute it
* Fix errors automatically

#### Flow:

1. Agent writes code
2. Saves file
3. Runs command
4. Parses output
5. Iterates

---

### 3.7 Task Board

#### Features:

* Kanban-style columns
* Tasks linked to agents
* Status tracking

#### Implementation:

* Local database (SQLite)
* Drag-and-drop UI

---

### 3.8 File System Layer

* Abstract file operations
* Watch file changes
* Sync with editor

---

## 4. Data Layer

### 4.1 Storage

* SQLite (via Tauri)

### 4.2 Entities

* Workspaces
* Files
* Terminal Sessions
* Command Blocks
* Agents
* Tasks

---

## 5. Communication Flow

### Frontend ↔ Backend

* Tauri commands
* Event streaming

### Agent ↔ Tools

* Tool execution interface

---

## 6. UI/UX Principles

* Fast and keyboard-driven
* Minimal context switching
* Real-time feedback
* Modular panes

---

## 7. Development Phases

### Phase 1 – Foundation

* Tauri setup
* React UI shell
* Basic layout system

### Phase 2 – Terminal

* PTY integration
* Multi-tab terminals

### Phase 3 – Editor

* File system
* Monaco integration

### Phase 4 – Command Blocks

* Block rendering
* History system

### Phase 5 – Agents

* Agent runtime
* Tool system

### Phase 6 – Automation

* Code execution loops

### Phase 7 – Task Board

* UI + persistence

### Phase 8 – Polish

* Performance
* UX improvements

---

## 8. Risks & Challenges

* Terminal performance
* AI latency
* State synchronization
* Security (file + command execution)

---

## 9. Future Enhancements

* Plugin ecosystem
* Cloud sync
* Collaboration
* Voice control

---

## 10. Next Steps

1. Initialize Tauri + React project
2. Build layout system
3. Implement basic terminal
4. Add editor
5. Introduce agent prototype

---

This document serves as the foundation for building YzPzCode. Iterate as the architecture evolves.
