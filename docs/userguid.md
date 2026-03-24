# AgentsLand User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Setup Screen](#setup-screen)
3. [Workspace Configuration](#workspace-configuration)
4. [CLI Tool Management](#cli-tool-management)
5. [Working with Workspaces](#working-with-workspaces)
6. [Terminal Operations](#terminal-operations)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Launching AgentsLand

To start AgentsLand, run:

```bash
npm run tauri dev
```

This will launch the application window with the setup screen.

### First Time Setup

When you first open AgentsLand, you'll be greeted by the **Setup Screen**. This is where you configure your first workspace for running AI coding agents.

---

## Setup Screen

The setup screen is your entry point to creating and configuring workspaces. It consists of three main sections:

1. **Workspace Configuration** - Name, directory, and layout settings
2. **Agent Fleet Configuration** - Allocate AI agents to terminal slots
3. **CLI Tools** - Check installed AI CLI tools

---

## Workspace Configuration

### 1. Workspace Name

Enter a descriptive name for your workspace (e.g., `my-project`, `frontend-dev`, `api-backend`).

### 2. Directory Selection

Choose the working directory for your project:

- Click the **"Browse"** button to open a folder picker
- Navigate to your project directory
- Select the folder and confirm

The selected path will be displayed in the directory field.

### 3. Terminal Layout

Select how many terminal sessions you want in your workspace grid:

| Layout | Grid | Best For |
|--------|------|----------|
| 1 Terminal | 1×1 | Single focused agent |
| 2 Terminals | 2×1 | Two agents working together |
| 4 Terminals | 2×2 | Small team collaboration |
| 6 Terminals | 3×2 | Medium-scale projects |
| 8 Terminals | 4×2 | Large-scale parallel work |

Click on a layout option to see a visual preview. The selected layout will be highlighted.

---

## CLI Tool Management

### Checking CLI Status

Expand the **CLI Tools** section to view the status of all supported AI CLI tools:

| Column | Description |
|--------|-------------|
| Name | Agent display name and binary name |
| Provider | Platform name (Anthropic, OpenAI, Google, etc.) |
| Status | Installation status (Installed, Not Installed, Error) |
| Version | Detected CLI version |

### Status Indicators

- ✓ **Installed** - CLI is detected and ready to use
- ✗ **Not Installed** - CLI is not available on your system
- ⟳ **Checking** - Currently detecting CLI status
- ⚠ **Error** - Error occurred during detection

### Refreshing CLI Detection

Click the refresh icon (circular arrow) in the Agent Fleet section to re-detect all CLI tools.

---

## Agent Fleet Configuration

### Understanding Agent Allocation

The Agent Fleet section allows you to assign specific AI agents to terminal slots in your workspace.

**Key Concepts:**
- **Total Slots**: Determined by your selected terminal layout
- **Allocated Slots**: Number of slots assigned to AI agents
- **Remaining Slots**: Unallocated slots (run as native shell sessions)

### Available Agents

| Agent | CLI Tool | Use Case |
|-------|----------|----------|
| Claude | `claude` | General-purpose coding assistant |
| Codex | `codex` | Code generation and completion |
| Gemini | `gemini` | Google's multi-modal AI assistant |
| OpenCode | `opencode` | OpenCode AI CLI |
| Cursor | `cursor` | Cursor AI-powered coding |

### Allocating Agents

1. **Enable an Agent**
   - Click the toggle switch next to the agent name
   - The card will become highlighted with a solid border

2. **Set Allocation Count**
   - Use the `+` and `-` buttons to adjust the number of slots for that agent
   - Ensure total allocation doesn't exceed available slots
   - Remaining slots are shown in the `/bin/sh` card

3. **Utilization Bar**
   - Shows current slot usage (used/total)
   - Red warning appears if allocation exceeds available slots

### Example Allocation

For a **4 Terminal Layout** with 2 Claude and 1 Codex:

```
Total Slots: 4
Claude: ████████ 2/2
Codex:    ████ 1/1
/bin/sh:  ████ 1 remaining
```

---

## Working with Workspaces

### Creating a Workspace

Once your configuration is complete:

1. Verify all settings:
   - ✅ Workspace name is entered
   - ✅ Directory is selected
   - ✅ Layout is chosen
   - ✅ Agent allocation is valid

2. Click **[ Execute ]** button
   - The button will show **[ LAUNCHING... ]** during initialization
   - You'll be automatically redirected to the Workspace view

### Workspace Header

The workspace header shows:

- **Workspace Tabs**: Open workspaces as clickable tabs
- **Active Workspace**: Currently selected tab (highlighted)
- **Session Count**: Number of running sessions per workspace
- **Theme Toggle**: Switch between dark and light themes
- **Window Controls** (Windows only): Minimize, maximize, close

### Switching Workspaces

Click on any workspace tab to switch between open workspaces. Sessions for each workspace are preserved.

### Creating New Workspaces

Click the **[ + ]** button in the header to create a new workspace. This returns you to the Setup Screen.

### Closing Workspaces

Click the **[ × ]** next to a workspace tab to close it and terminate all its sessions.

### Terminating All Sessions

Use the **[ Terminate ]** button to close the current workspace and return to the Setup Screen.

---

## Terminal Operations

### Terminal Grid

The main workspace area displays all terminal sessions in a grid layout matching your configuration.

Each terminal pane shows:
- **TTY Number** (e.g., TTY1, TTY2) - Session identifier
- **Status Indicator** (green dot) - Active session
- **Agent Assignment** - Which AI agent is assigned to this session
- **Terminal Output** - Interactive terminal with xterm.js emulation

### Using Terminals

1. **Select a Terminal**: Click on any terminal pane to focus it
2. **Enter Commands**: Type commands and press Enter
3. **Agent Context**: Each terminal runs in your workspace directory with the assigned agent
4. **Copy/Paste**: Use standard keyboard shortcuts (Ctrl+C/Ctrl+V)

### Session Status

Sessions can be in one of these states:
- **Idle** - Waiting for input
- **Running** - Processing a command
- **Error** - An error occurred

---

## Tips & Best Practices

### Workspace Organization

- Use descriptive workspace names based on project type
- Create separate workspaces for frontend, backend, and testing
- Match layout size to your parallel work requirements

### Agent Selection

- Use **Claude** for general coding tasks and debugging
- Use **Codex** for code generation and boilerplate
- Use **Gemini** for multi-modal tasks (code + images/docs)
- Mix different agents to leverage their strengths

### Performance

- Start with smaller layouts (2-4 terminals) for optimal performance
- Increase terminal count only when needed
- Close unused workspaces to free up resources

### Workflow

1. Plan your agent allocations before creating the workspace
2. Use dedicated workspaces for different projects
3. Keep CLI tools updated for best compatibility
4. Regularly check CLI status to ensure agents are available

---

## Troubleshooting

### CLI Tools Not Detected

**Problem:** Status shows "Not Installed" for a CLI you know is installed.

**Solutions:**
1. Click the refresh icon to re-detect CLI tools
2. Verify the CLI binary is in your system PATH
3. Restart AgentsLand
4. Check if the CLI requires authentication

### Workspace Creation Fails

**Problem:** Clicking "Execute" doesn't create the workspace.

**Solutions:**
1. Check that all required fields are filled
2. Verify the selected directory exists and is accessible
3. Ensure agent allocation doesn't exceed total slots
4. Check console for error messages

### Terminals Not Initializing

**Problem:** Workspace loads but terminals show "Initializing TTY Sessions" indefinitely.

**Solutions:**
1. Close and reopen the workspace
2. Check system permissions for the workspace directory
3. Verify PTY support on your system
4. Restart AgentsLand

### Agent Commands Not Working

**Problem:** Terminal runs but agent commands fail.

**Solutions:**
1. Verify the CLI is properly authenticated
2. Check API keys and authentication tokens
3. Ensure the agent CLI supports your current directory
4. Review CLI documentation for specific setup requirements

### Performance Issues

**Problem:** Application is slow or unresponsive.

**Solutions:**
1. Reduce the number of terminal sessions
2. Close unused workspaces
3. Check system resource usage (CPU, memory)
4. Close other resource-intensive applications

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Copy | Ctrl+C (when text is selected) |
| Paste | Ctrl+V |
| Clear Terminal | Ctrl+L (depends on shell) |
| Switch Theme | Click theme toggle in header |

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the console for error messages
2. Review the troubleshooting section above
3. Verify your CLI tools are properly installed and authenticated
4. Check the project documentation in `AGENTS.md` for development guidance

---

## Next Steps

Now that you're familiar with AgentsLand:

- Explore different agent combinations for your workflow
- Create multiple workspaces for different projects
- Integrate with your existing development pipeline
- Customize your layouts for optimal productivity

Happy coding with AI agents! 🚀
