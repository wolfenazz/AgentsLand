export const userGuideContent = `# YzPzCode User Guide

## Table of Contents

1. [What is YzPzCode?](#what-is-yzpzcode)
2. [Getting Started](#getting-started)
3. [Before You Begin](#before-you-begin)
4. [How to Use YzPzCode](#how-to-use-yzpzcode)
5. [Understanding the Screens](#understanding-the-screens)
6. [The Setup Screen](#the-setup-screen)
7. [The Workspace Screen](#the-workspace-screen)
8. [Terminal Grid & Panes](#terminal-grid--panes)
9. [File Explorer](#file-explorer)
10. [Code Editor](#code-editor)
11. [File Previews](#file-previews)
12. [Git Integration](#git-integration)
13. [Quick Actions](#quick-actions)
14. [Keyboard Shortcuts](#keyboard-shortcuts)
15. [Common Tasks](#common-tasks)
16. [Tips for Success](#tips-for-success)
17. [Troubleshooting](#troubleshooting)
18. [Platform-Specific Tips](#platform-specific-tips)
19. [Button Reference](#button-reference)
20. [Frequently Asked Questions](#frequently-asked-questions)
21. [Getting More Help](#getting-more-help)

---

## What is YzPzCode?

YzPzCode is a **multi-terminal AI development environment** — a desktop app that lets you work with multiple AI coding assistants simultaneously, each in their own terminal window, all organized in a beautiful grid layout.

Think of it like having several AI assistants (Claude, Codex, Gemini, Cursor, and more) all helping you with your coding projects at the same time, with a built-in file explorer, code editor, and Git integration.

**Why use YzPzCode?**
- **Parallel AI workflows** — Run multiple AI assistants side by side
- **Smart terminal grid** — Resizable, draggable terminal panes
- **Built-in file explorer** — Browse, search, and manage your project files
- **Code editor** — Syntax highlighting, find/replace, auto-save, minimap
- **Git integration** — Real-time status, diff stats, stage/unstage files
- **Quick Actions** — Auto-detected Dev/Build commands for your project
- **Project templates** — 50+ scaffolding templates to get started fast
- **Multi-workspace** — Switch between projects with tabbed workspaces

---

## Getting Started

### 1. Download and Install

- Download YzPzCode for your computer (Windows, macOS, or Linux)
- Open the downloaded file and follow the installation prompts
- Launch the app from your Applications folder, desktop, or Start menu

### 2. Quick Overview

When you first open YzPzCode, you'll see the **Setup Screen**. This is where you create your first workspace.

**What is a workspace?**
A workspace is like a project folder where you can work on one coding project. You can create multiple workspaces for different projects and switch between them with tabs.

---

## Before You Begin

### Install AI Tools

YzPzCode works with popular AI coding tools. You'll need to install at least one before you can use it:

| Tool | What it does | How to get it |
|------|-------------|---------------|
| **Claude Code** | Anthropic's AI coding assistant | [Install Claude Code](https://docs.anthropic.com/claude/reference/claude-cli) |
| **Codex CLI** | OpenAI's code generator | Check your provider's website |
| **Gemini CLI** | Google's AI assistant | [Install Gemini CLI](https://ai.google.dev/gemini-api/docs/cli) |
| **OpenCode CLI** | Open-source coding assistant | Check the OpenCode documentation |
| **Cursor CLI** | AI-powered coding | [Install Cursor](https://cursor.sh/docs) |
| **Kilo Code** | AI coding assistant | Check the Kilo Code documentation |

**Don't worry about technical details** — just visit the link and follow the simple install instructions.

### Sign In

After installing an AI tool, you'll need to sign in:
- Open your terminal or command prompt
- Type the tool's name and look for a "login" or "authenticate" option
- Follow the on-screen instructions

> **Tip:** You only need to do this once for each tool.

### Check Prerequisites

YzPzCode can check for required development tools:

| Prerequisite | Why it's needed |
|-------------|----------------|
| **Node.js** | Required for most AI CLI tools |
| **npm** | Package manager for Node.js |
| **Git** | Version control (required for Git features) |
| **Bun** | Alternative package manager (optional) |
| **pnpm** | Alternative package manager (optional) |

The **Prerequisites Panel** in the setup screen shows which tools are installed and their versions.

---

## How to Use YzPzCode

### Step 1: Create Your First Workspace

1. **Name your workspace**
   - Type a name like "my-project" or "website-work"
   - This helps you keep projects organized

2. **Choose a folder**
   - Click "Browse" to pick the folder where your project is
   - Recent directories are shown for quick access
   - This is where your AI assistants will work

3. **Pick a layout**
   - Choose how many terminal windows you want:
   - **1 Terminal**: Simple, focused work
   - **2-3 Terminals**: Good for most projects
   - **4-6 Terminals**: For complex projects
   - **External Mode**: Opens terminals in your OS terminal

### Step 2: (Optional) Initialize a Project

Use the **Initialize Workspace** section to scaffold a new project from 50+ templates:

| Category | Templates |
|----------|-----------|
| **Frontend** | React, Next.js, Vue, Angular, Svelte, Astro |
| **Mobile** | Expo, Flutter, React Native, Ionic |
| **Desktop** | Tauri, Electron |
| **Backend** | Express, NestJS, Fastify, Hono, Django, FastAPI, Flask, Rails, Laravel, Spring Boot, Gin |
| **Rust** | Cargo projects |
| **.NET** | C# projects |
| **More** | Remix, Gatsby, Solid, Qwik, tRPC, Nx, Turborepo, Prisma, Supabase, Vitest, Playwright, Storybook |

Select a template and an embedded terminal will run the initialization commands for you.

### Step 3: Add AI Assistants

1. Find the "Agent Fleet" section
2. Turn on the AI tools you want to use
3. Use the \`+\` and \`-\` buttons to set how many windows each tool gets
4. Click **Distribute Evenly** to spread agents across all terminals
5. Click **Auto-Fill from Installed** to automatically assign installed tools

**Example:** If you have 4 terminals and turn on Claude (2) and Codex (1), you'll have 1 empty terminal left for regular commands.

### Step 4: (Optional) Select an IDE

YzPzCode can detect and launch your installed IDEs:

| IDE | Platform |
|-----|----------|
| **VS Code** | All platforms |
| **Visual Studio** | Windows, macOS |
| **Cursor** | All platforms |
| **Zed** | macOS, Linux |
| **WebStorm** | All platforms |
| **IntelliJ** | All platforms |
| **Sublime Text** | All platforms |
| **Windsurf** | All platforms |
| **Perplexity** | All platforms |
| **Antigravity** | All platforms |

### Step 5: Start Working

1. Click the **[ Execute ]** button
2. Wait for your workspace to load (a few seconds)
3. Start typing commands in each terminal window

---

## Understanding the Screens

### The Setup Screen

The Setup Screen is your starting point for creating new workspaces:

| Section | What it does |
|---------|--------------|
| **Workspace Configuration** | Name your project, pick the folder, and choose a layout |
| **Workspace Template Picker** | Choose from built-in templates or save your own custom templates |
| **Initialize Workspace** | Scaffold a new project from 50+ templates with an embedded terminal |
| **Terminal Layout** | Choose how many terminal windows you want (1-6 or external) |
| **Agent Fleet** | Turn on AI tools and assign them to terminal slots |
| **IDE Selection** | Detect and select installed IDEs to launch with your workspace |
| **CLI Tools Table** | See which AI tools are installed on your computer |
| **Prerequisites Panel** | Check for Node.js, npm, Git, Bun, and pnpm |

#### Workspace Template Picker

Save time by using templates:
- **Built-in templates**: React, Rust, Python, Full-Stack, Quick Edit, Custom
- **Custom templates**: Save your own workspace configurations for reuse
- **Manage templates**: Edit or delete saved templates

#### Agent Fleet Controls

| Control | What it does |
|---------|--------------|
| **Toggle switches** | Turn AI tools on or off |
| **+/- buttons** | Increase or decrease the number of terminal slots for each tool |
| **Distribute Evenly** | Spread all enabled agents equally across available slots |
| **Auto-Fill from Installed** | Automatically assign all detected installed tools |
| **Utilization Bar** | Visual progress showing how many slots are assigned |

---

## The Workspace Screen

After you create a workspace, you'll see the main workspace view:

| Element | What it does |
|---------|--------------|
| **Workspace Tabs** | Switch between different open workspaces |
| **New Workspace Button** | Create a new workspace without closing the current one |
| **Docs Button** | Open this documentation |
| **Sidebar Toggle** | Show/hide the file explorer |
| **View Toggle** | Switch between Terminal and Editor views |
| **Shortcuts Button** | View all keyboard shortcuts |
| **Theme Toggle** | Switch between dark and light mode |
| **Terminal Grid** | Your terminal windows arranged in a resizable grid |
| **File Explorer** | Browse and manage your project files |
| **Code Editor** | Edit code with syntax highlighting and auto-save |
| **Status Bar** | Version info, feedback button |

### Multi-Workspace Support

You can have multiple workspaces open at the same time:
- Each workspace has its own set of terminal sessions
- Each workspace tracks its own open files and active view
- Switch between workspaces using the tabs at the top
- Close a workspace with the **[ × ]** button on its tab

---

## Terminal Grid & Panes

### Terminal Grid

The terminal grid is where your AI assistants live:

- **Resizable** — Drag the dividers between rows and columns to resize panes
- **Draggable** — Drag terminal panes to reorder them
- **Auto-layout** — Grid dimensions are calculated based on the number of sessions
- **Spawn slots** — Click empty slots to add new terminals
- **Session count** — Footer shows the number of active sessions and layout info

### Terminal Panes

Each terminal pane includes:

| Element | What it does |
|---------|--------------|
| **TTY Number** | The terminal session number |
| **Agent Badge** | Shows which AI tool is assigned (or "Shell" for empty) |
| **Quick Actions** | Dev/Build buttons based on detected project type |
| **Search Toggle** | Search within terminal output |
| **Refresh** | Restart the terminal session |
| **Close** | Close this terminal pane |

### Adding New Terminals

Click the **+** button or an empty spawn slot to add a new terminal:
- Choose an **agent type** (Claude, Codex, Gemini, etc.) or **Shell**
- Select a **shell** (bash, zsh, cmd, PowerShell, etc.)
- The new terminal appears in the next available slot

### Terminal Features

- **Auto-launch** — AI CLI tools automatically launch when the terminal opens
- **Copy/Paste** — \`Ctrl+C\` copies selection, \`Ctrl+V\` pastes
- **Large paste confirmation** — Warns before pasting large text (>1KB)
- **Web links** — Clickable URLs in terminal output
- **Unicode support** — Full Unicode 11 character support
- **Auto-fit** — Terminals automatically resize to fit their pane

---

## File Explorer

The file explorer is your project's file tree, accessible from the sidebar:

### Features

| Feature | How to use |
|---------|------------|
| **Lazy loading** | Directories load on demand as you expand them |
| **Search/filter** | Type to filter the file tree |
| **Drag-and-drop** | Move files and folders by dragging |
| **Inline rename** | Right-click → Rename, or press F2 |
| **New file/folder** | Right-click → New File or New Folder |
| **Delete** | Right-click → Delete |
| **Reveal in file manager** | Right-click → Reveal in File Manager |
| **Copy/Cut/Paste** | Right-click → Copy, Cut, or Paste |
| **Copy path** | Right-click → Copy Path, Copy Relative Path, or Copy as Import Path |
| **Open in terminal** | Right-click → Open in Terminal |
| **Duplicate** | Right-click → Duplicate |
| **External file import** | Drag files from your OS file manager into the explorer |
| **Git status badges** | Colored badges show file changes (added/modified/deleted/untracked) |

### Explorer Context Menu

Right-click on any file or folder for these options:

| Option | What it does |
|--------|--------------|
| **New File** | Create a new file in this directory |
| **New Folder** | Create a new folder in this directory |
| **Rename** | Rename the selected item |
| **Delete** | Delete the selected item |
| **Reveal in File Manager** | Open your OS file manager at this location |
| **Refresh** | Reload the file tree |
| **Copy** | Copy the file for pasting elsewhere |
| **Cut** | Cut the file for moving |
| **Copy Path** | Copy the full file path |
| **Copy Relative Path** | Copy the path relative to the workspace root |
| **Copy as Import Path** | Copy the path formatted as an import statement |
| **Open in Terminal** | Open a terminal at this directory |
| **Duplicate** | Create a copy of the file |

---

## Code Editor

The code editor provides a full-featured editing experience:

### Features

| Feature | Shortcut | Description |
|---------|----------|-------------|
| **Syntax highlighting** | Auto | Supports JS, TS, Rust, Python, HTML, CSS, JSON, Markdown, Java, C++ and more |
| **Find** | \`Ctrl+F\` | Search within the file |
| **Find & Replace** | \`Ctrl+H\` | Search and replace text |
| **Go to Line** | \`Ctrl+G\` | Jump to a specific line number |
| **Save** | \`Ctrl+S\` | Save the current file |
| **Auto-save** | Toggleable | Automatically saves every 2 seconds |
| **Word wrap** | Toggleable | Wrap long lines |
| **Minimap** | Toggleable | Show a minimap of the file |
| **Find next** | \`F3\` | Find the next match |
| **Find previous** | \`Shift+F3\` | Find the previous match |

### Editor Tabs

Open files appear as tabs at the top of the editor:

- **Drag to reorder** — Drag tabs to rearrange them
- **Right-click menu** — Close, Close Others, Close to Right, Close All, Close Saved
- **Dirty indicator** — Shows when a file has unsaved changes
- **Close** — Click the **[ × ]** on a tab to close it

### Quick Open

Press \`Ctrl+P\` to open the Quick Open palette:
- **Fuzzy search** — Type any part of a filename to find it
- **Keyboard navigation** — Use arrow keys and Enter to select
- **Highlighted matches** — Matching characters are highlighted in results

---

## File Previews

YzPzCode can preview many file types without leaving the app:

| File Type | Extensions | Preview |
|-----------|-----------|---------|
| **Code** | .js, .ts, .tsx, .rs, .py, .html, .css, .json, .md, .java, .cpp, and more | Syntax-highlighted editor |
| **Markdown** | .md, .markdown | Toggle between source and rendered preview |
| **Images** | .png, .jpg, .jpeg, .gif, .webp, .bmp, .ico, .avif, .tiff | Image viewer |
| **PDF** | .pdf | PDF viewer |
| **Documents** | .docx, .doc | Document viewer |
| **Spreadsheets** | .xlsx, .xls, .csv | Spreadsheet viewer |

### Large File Handling

- Files larger than **10MB** show a warning before opening
- **Deleted files** can be recovered from Git history
- **Binary files** are detected and shown as previews instead of raw content

---

## Git Integration

YzPzCode provides real-time Git integration:

### Git Changes Panel

Located in the file explorer sidebar:

| Feature | Description |
|---------|-------------|
| **Collapsible** | Expand/collapse to show or hide changes |
| **Per-file changes** | Shows each changed file with its change type |
| **Line stats** | Shows lines added (+) and deleted (-) per file |
| **Visual diff bars** | Color-coded bars show the extent of changes |
| **Stage/Unstage** | Stage or unstage individual files |
| **Change type badges** | Color-coded: green=added, yellow=modified, red=deleted, blue=untracked |

### Git Status Badges

Files in the explorer show colored badges:

| Color | Change Type |
|-------|-------------|
| **Green** | Added (new file) |
| **Yellow** | Modified (changed file) |
| **Red** | Deleted (removed file) |
| **Blue** | Untracked (new, not staged) |

### Auto-Refresh

The file watcher automatically refreshes Git status when files change:
- **Debounced** — Refreshes 300ms after changes stop
- **Real-time** — No manual refresh needed

---

## Quick Actions

Quick Actions are smart buttons that appear in each terminal header:

| Button | What it does |
|--------|--------------|
| **Dev** | Injects the development command for your project type |
| **Build** | Injects the build command for your project type |

### Project Auto-Detection

YzPzCode automatically detects your project type and suggests the right commands:

| Detected Project | Dev Command | Build Command |
|-----------------|-------------|---------------|
| **Next.js** | \`npm run dev\` | \`npm run build\` |
| **React/Vite** | \`npm run dev\` | \`npm run build\` |
| **Rust** | \`cargo run\` | \`cargo build\` |
| **Go** | \`go run .\` | \`go build\` |
| **Flutter** | \`flutter run\` | \`flutter build\` |
| **Python** | \`python main.py\` | - |
| **.NET** | \`dotnet run\` | \`dotnet build\` |
| **Rails** | \`rails server\` | - |
| **PHP** | \`php -S localhost:8000\` | - |
| **Make** | \`make run\` | \`make\` |
| **And more...** | Auto-detected | Auto-detected |

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+B\` | Toggle file explorer sidebar |
| \`Ctrl+E\` | Toggle between Terminal and Editor views |
| \`Ctrl+W\` | Close active file tab |
| \`Ctrl+P\` | Open Quick Open file palette |
| \`Ctrl+K\` | Focus documentation search |
| \`F11\` | Toggle fullscreen |
| \`Ctrl+Tab\` | Switch workspace tab |
| \`Esc\` | Close search, modals, and dialogs |

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+F\` | Find in file |
| \`Ctrl+H\` | Find and replace |
| \`Ctrl+G\` | Go to line |
| \`Ctrl+S\` | Save file |
| \`F3\` | Find next match |
| \`Shift+F3\` | Find previous match |

### Terminal Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+C\` | Copy selection |
| \`Ctrl+V\` | Paste (with large paste confirmation) |
| \`Ctrl+L\` | Clear terminal |
| \`Ctrl+F\` | Search terminal output |

### Documentation Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+K\` | Focus search |
| \`Esc\` | Clear search |
| \`1-9\` | Navigate to search result number |

---

## Common Tasks

### Create a New Workspace

1. Click the **[ + ]** button at the top of the screen
2. Fill in the workspace name and folder
3. Choose your layout and AI tools
4. Click **[ Execute ]**

### Open an Existing Workspace

1. Click the workspace tab at the top
2. Or click the **[ + ]** button and select the same folder

### Switch Between Workspaces

- Click on any tab at the top of the screen
- Each workspace is saved separately, so your work won't be lost
- Use \`Ctrl+Tab\` to cycle through workspace tabs

### Close a Workspace

- Click the **[ × ]** next to the workspace tab
- This closes the workspace and all its terminals

### Start Fresh

- Click the **[ Terminate ]** button
- This closes the current workspace and takes you back to the setup screen

### Add a New Terminal

1. Click the **+** button in the terminal grid
2. Choose an agent type or Shell
3. Select a shell (bash, zsh, cmd, PowerShell, etc.)

### Open a File

- Click a file in the **File Explorer**
- Or press \`Ctrl+P\` and search by name
- Or drag a file from your OS into the explorer

### Edit a File

1. Open the file (click in explorer or Ctrl+P)
2. Switch to **Editor view** with \`Ctrl+E\` or the view toggle
3. Edit the file — it auto-saves every 2 seconds
4. Press \`Ctrl+S\` to manually save

### Launch an IDE

1. Select IDEs in the setup screen before creating a workspace
2. Or use the IDE detection to find installed IDEs
3. YzPzCode will launch the IDE with your workspace directory

---

## Tips for Success

### For Beginners

- Start with **2 terminals** and 1 AI tool
- Create a separate workspace for each project
- Use the same AI tool across all terminals at first
- Use the **Quick Actions** buttons to run common commands

### For Better Performance

- Don't open too many workspaces at once
- Start with fewer terminals if the app feels slow
- Close workspaces you're not using
- Close other resource-intensive apps when using many terminals

### For Organized Work

- Use descriptive workspace names (e.g., "website-backend", "app-frontend")
- Keep related projects in separate workspaces
- Use different AI tools for different tasks:
  - **Claude** for general coding and explaining code
  - **Codex** for generating new code
  - **Gemini** for working with images and documents
  - **Cursor** for AI-powered coding workflows
  - **OpenCode** for open-source coding assistance
  - **Kilo** for lightweight coding tasks

### Power User Tips

- **Save custom templates** for projects you create frequently
- **Use Quick Open** (\`Ctrl+P\`) to navigate large projects fast
- **Drag-and-drop files** from your OS into the explorer to import them
- **Use the Git panel** to stage/unstage files without leaving the app
- **Toggle the minimap** for large files to navigate quickly
- **Use external terminal mode** if you prefer your OS terminal

---

## Troubleshooting

### Common Problems

**Problem: "Tool Not Installed"**

**Solution:**
1. Check if you installed the AI tool
2. Try signing in to the tool
3. Click the refresh button in the setup screen
4. Check the **Prerequisites Panel** for missing dependencies

**Problem: Workspace won't create**

**Solution:**
1. Make sure you filled in all the fields
2. Check that the folder exists on your computer
3. Try closing and reopening the app
4. Check for validation errors at the bottom of the setup screen

**Problem: Terminals are stuck on "Initializing"**

**Solution:**
1. Close the workspace
2. Try creating it again
3. Restart the app if it keeps happening
4. Check that the assigned AI tool is properly authenticated

**Problem: AI commands don't work**

**Solution:**
1. Make sure you're signed in to the AI tool
2. Check your internet connection
3. Try the tool's own documentation for help
4. Use the **Auth Modal** to see authentication instructions

**Problem: File won't open in editor**

**Solution:**
1. Check if the file is binary (binary files show as previews)
2. For files >10MB, confirm the warning prompt
3. For deleted files, the editor will try to recover from Git history

**Problem: Git status not updating**

**Solution:**
1. The file watcher auto-refreshes — wait a moment
2. Try refreshing the file explorer
3. Make sure Git is installed and the folder is a Git repository

**Problem: Custom cursor is annoying**

**Solution:**
1. The custom cursor can be toggled off in settings
2. Your preference is saved between sessions

---

## Platform-Specific Tips

### Windows Users

**Opening the App:**
- If you see a Windows SmartScreen warning, click "More info" → "Run anyway"
- Windows 10 users may see a compatibility warning — the app works best on Windows 11

**Best Performance:**
- Close other apps when using many terminals
- Use Windows Terminal as your default shell for the best experience

### macOS Users

**Opening the App:**
- If macOS says the app is "damaged", right-click the app and select "Open"
- You might need to allow the app in System Preferences > Security & Privacy

**Best Performance:**
- Close other apps when using many terminals
- Use the latest version of macOS (10.15 or newer)

### Linux Users

**Best Performance:**
- Close other resource-intensive apps
- Use a lighter desktop environment if the app feels slow
- Make sure your system is up to date

---

## Button Reference

### Setup Screen Buttons

| Button | What it does |
|--------|--------------|
| **[ Execute ]** | Creates your workspace and starts all terminal sessions |
| **[ Cancel ]** | Cancels workspace creation and returns to the previous state |
| **[ Browse ]** | Opens a folder picker to choose your project folder |
| **Refresh icon** (↻) | Re-checks for newly installed AI tools |
| **Toggle switches** | Turn AI tools on or off in the Agent Fleet |
| **Distribute Evenly** | Spreads all enabled agents equally across terminal slots |
| **Auto-Fill from Installed** | Automatically assigns all detected installed tools |

### Workspace Screen Buttons

| Button | What it does |
|--------|--------------|
| **[ + ]** | Creates a new workspace |
| **[ × ]** (on tabs) | Closes that workspace |
| **[ Docs ]** | Opens this documentation |
| **[ Sidebar ]** | Toggles the file explorer sidebar |
| **[ View ]** | Switches between Terminal and Editor views |
| **[ Shortcuts ]** | Shows all keyboard shortcuts |
| **[ Terminate ]** | Closes current workspace and goes back to setup |
| **Theme button** (☀️/🌙) | Switches between light and dark mode |
| **[ Minimize ]** | Minimizes the app window (Windows) |
| **[ Maximize ]** | Maximizes the app window (Windows) |
| **[ Close ]** | Closes the app window (Windows) |

### Terminal Buttons

| Button | What it does |
|--------|--------------|
| **[ Dev ]** | Injects the development command (auto-detected) |
| **[ Build ]** | Injects the build command (auto-detected) |
| **[ Search ]** | Toggle search within terminal output |
| **[ Refresh ]** | Restart the terminal session |
| **[ Close ]** | Close this terminal pane |
| **[ Install ]** | Install the AI tool (if not installed) |
| **[ Authenticate ]** | Show authentication instructions |

### Explorer Buttons

| Button | What it does |
|--------|--------------|
| **[ + ]** | New file or folder |
| **[ Search ]** | Filter the file tree |
| **[ Refresh ]** | Reload the file tree |

### Editor Buttons

| Button | What it does |
|--------|--------------|
| **[ Save ]** | Save the current file (\`Ctrl+S\`) |
| **[ Find ]** | Open find bar (\`Ctrl+F\`) |
| **[ Replace ]** | Open find/replace bar (\`Ctrl+H\`) |
| **[ Go to Line ]** | Jump to a line (\`Ctrl+G\`) |
| **[ Word Wrap ]** | Toggle word wrap |
| **[ Minimap ]** | Toggle minimap |

### Global Context Menu

Right-click anywhere in the app for quick actions:

| Option | What it does |
|--------|--------------|
| **New Workspace** | Create a new workspace |
| **Documentation** | Open this documentation |
| **Copy** | Copy selected text |
| **Paste** | Paste from clipboard |
| **Toggle Theme** | Switch between dark and light mode |

---

## Frequently Asked Questions

**Q: Do I need to know how to code?**
A: Yes, YzPzCode is designed for people who write code or are learning to code.

**Q: Can I use multiple AI tools at once?**
A: Yes! You can mix different AI tools in the same workspace, each in their own terminal.

**Q: Will my code be saved?**
A: Yes, your code is saved in the project folder you selected. YzPzCode just helps you work on it. Auto-save is enabled by default (every 2 seconds).

**Q: Is my data private?**
A: Your code stays on your computer. However, when you use AI tools, they process your code according to their own privacy policies. Check each AI tool's privacy policy for details.

**Q: Can I use this without internet?**
A: No, AI tools need an internet connection to work. However, the file explorer, editor, and Git features work offline.

**Q: How many workspaces can I have?**
A: As many as you want! Just keep in mind that each workspace uses computer resources.

**Q: Can I customize the terminal size?**
A: Yes! Drag the dividers between terminal panes to resize them. You can also drag panes to reorder them.

**Q: What file types can I edit?**
A: Any text file. The editor supports syntax highlighting for JavaScript, TypeScript, Rust, Python, HTML, CSS, JSON, Markdown, Java, C++, and more.

**Q: Can I preview images and documents?**
A: Yes! YzPzCode can preview images (PNG, JPG, GIF, WebP, etc.), PDFs, Word documents (.docx), and spreadsheets (.xlsx, .csv).

**Q: How does Git integration work?**
A: YzPzCode automatically detects Git status for your workspace, shows changed files with colored badges, and lets you stage/unstage files from the explorer.

**Q: Can I drag files from my OS into the app?**
A: Yes! Drag files from your file manager into the file explorer to import them into your workspace.

**Q: What are Quick Actions?**
A: Quick Actions are smart Dev/Build buttons that appear in each terminal header. YzPzCode auto-detects your project type and injects the right commands.

**Q: Can I save my workspace configuration?**
A: Yes! Use the Template Picker to save custom templates for reuse.

**Q: How do I find a file quickly?**
A: Press \`Ctrl+P\` to open the Quick Open palette and type any part of the filename.

---

## Getting More Help

If you're still having trouble:

1. **Check the error message** - Read what the screen says carefully
2. **Try the simple fixes** - Close and reopen the app, or restart your computer
3. **Visit the AI tool's website** - Each AI tool (Claude, Codex, etc.) has its own help documentation
4. **Use the feedback button** - Found in the status bar at the bottom of the app
5. **Check for updates** - YzPzCode will notify you when a new version is available

### Feedback

To send feedback:
1. Click the **Feedback** button in the status bar
2. Write your message (required)
3. Optionally add your name and contact info
4. Press \`Ctrl+Enter\` or click **Send**

---

## You're All Set!

Now you know how to:

✅ Install and configure AI coding tools
✅ Create workspaces for your projects
✅ Work with multiple AI assistants at once
✅ Navigate and edit files with the built-in editor
✅ Use Git integration for version control
✅ Preview images, documents, and spreadsheets
✅ Use Quick Actions for common commands
✅ Switch between different projects
✅ Customize your terminal layout
✅ Troubleshoot common problems

**Happy coding with your AI assistants!**
`;