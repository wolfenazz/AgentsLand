use std::collections::HashMap;
use tauri::State;

use crate::agent::{AgentExecutor, AgentTask, ExecuteAgentTaskRequest};
use crate::agent_cli::{
    AgentCliDetector, AgentCliInfo, AgentCliInstaller, AuthDetector, AuthInfo, CliLaunchState,
    CliLauncher, PrerequisiteStatus, PrerequisitesChecker,
};
use crate::terminal::TerminalManager;
use crate::types::{AgentType, CreateSessionsRequest, TerminalSession};

#[tauri::command]
pub async fn create_terminal_sessions(
    manager: State<'_, TerminalManager>,
    launcher: State<'_, CliLauncher>,
    request: CreateSessionsRequest,
) -> Result<Vec<TerminalSession>, String> {
    // Kill only existing sessions for this workspace to ensure a clean state
    let _ = manager.kill_sessions_by_workspace(&request.workspace_id);

    let sessions = manager
        .create_sessions(
            request.workspace_id,
            request.workspace_path,
            request.count,
            request.agent_fleet.allocation,
        )
        .map_err(|e| e.to_string())?;

    // Automatically launch CLI for sessions that have an agent assigned
    // We do this after creating all sessions
    for session in &sessions {
        if let Some(agent) = session.agent {
            let _ = launcher.launch_cli(&session.id, agent);
        }
    }

    Ok(sessions)
}

#[tauri::command]
pub async fn write_to_terminal(
    manager: State<'_, TerminalManager>,
    session_id: String,
    input: String,
) -> Result<(), String> {
    manager
        .write_to_session(&session_id, &input)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resize_terminal(
    manager: State<'_, TerminalManager>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    manager
        .resize_session(&session_id, cols, rows)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn kill_session(
    manager: State<'_, TerminalManager>,
    session_id: String,
) -> Result<(), String> {
    manager.kill_session(&session_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn kill_workspace_sessions(
    manager: State<'_, TerminalManager>,
    workspace_id: String,
) -> Result<(), String> {
    manager
        .kill_sessions_by_workspace(&workspace_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_sessions(
    manager: State<'_, TerminalManager>,
) -> Result<Vec<TerminalSession>, String> {
    Ok(manager.get_all_sessions())
}

#[tauri::command]
pub async fn execute_agent_task(
    agent_executor: State<'_, AgentExecutor>,
    terminal_manager: State<'_, TerminalManager>,
    request: ExecuteAgentTaskRequest,
) -> Result<AgentTask, String> {
    use crate::agent_cli::get_provider;

    let agent = request.agent;
    let provider = get_provider(agent);
    agent_executor.set_provider(provider);

    let task = agent_executor.create_task(request);
    let task_id = task.id.clone();
    let task_clone = task.clone();

    let executor = agent_executor.inner().clone();
    let terminal_mgr = terminal_manager.inner().clone();

    tokio::spawn(async move {
        let _ = executor.execute_with_retry(task_id, &terminal_mgr).await;
    });

    Ok(task_clone)
}

#[tauri::command]
pub async fn get_agent_task_status(
    agent_executor: State<'_, AgentExecutor>,
    task_id: String,
) -> Result<AgentTask, String> {
    agent_executor
        .get_task(&task_id)
        .ok_or_else(|| "Task not found".to_string())
}

#[tauri::command]
pub async fn cancel_agent_task(
    agent_executor: State<'_, AgentExecutor>,
    task_id: String,
) -> Result<bool, String> {
    Ok(agent_executor.cancel_task(&task_id))
}

#[tauri::command]
pub async fn check_prerequisites() -> Result<Vec<PrerequisiteStatus>, String> {
    Ok(PrerequisitesChecker::check_all())
}

#[tauri::command]
pub async fn detect_agent_cli(
    detector: State<'_, AgentCliDetector>,
    agent: AgentType,
) -> Result<AgentCliInfo, String> {
    Ok(detector.detect(agent))
}

#[tauri::command]
pub async fn detect_all_agent_clis(
    detector: State<'_, AgentCliDetector>,
) -> Result<HashMap<AgentType, AgentCliInfo>, String> {
    Ok(detector.detect_all())
}

#[tauri::command]
pub async fn clear_cli_cache(detector: State<'_, AgentCliDetector>) -> Result<(), String> {
    detector.clear_cache();
    Ok(())
}

#[tauri::command]
pub async fn install_agent_cli(
    installer: State<'_, AgentCliInstaller>,
    agent: AgentType,
) -> Result<(), String> {
    installer.install(agent)
}

#[tauri::command]
pub async fn get_install_command(agent: AgentType) -> Result<String, String> {
    Ok(AgentCliInstaller::get_install_command(agent))
}

#[tauri::command]
pub async fn open_install_terminal(agent: AgentType) -> Result<(), String> {
    use crate::agent_cli::{get_provider, Platform};
    let provider = get_provider(agent);
    let platform = Platform::current();
    let install_cmd = provider.get_install_command(platform);
    
    if install_cmd.is_empty() {
        return Err("No installation command available".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NEW_CONSOLE: u32 = 0x00000010;

        let binary = install_cmd[0].to_lowercase();
        let mut command = if binary == "powershell" || binary == "pwsh" {
            let mut c = std::process::Command::new(&install_cmd[0]);
            c.arg("-NoExit");
            if install_cmd.len() > 1 {
                c.args(&install_cmd[1..]);
            }
            c
        } else {
            let mut c = std::process::Command::new("cmd");
            c.arg("/k").args(&install_cmd);
            c
        };

        // This flag ensures exactly one new console window is created for the command
        command.creation_flags(CREATE_NEW_CONSOLE);
        command.spawn().map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        let full_cmd = install_cmd.join(" ");
        std::process::Command::new("osascript")
            .arg("-e")
            .arg(format!("tell application \"Terminal\" to do script \"{}\"", full_cmd))
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let full_cmd = install_cmd.join(" ");
        // Try common terminal emulators
        let _ = std::process::Command::new("x-terminal-emulator")
            .arg("-e")
            .arg(&full_cmd)
            .spawn()
            .or_else(|_| {
                std::process::Command::new("gnome-terminal")
                    .arg("--")
                    .arg("bash")
                    .arg("-c")
                    .arg(format!("{}; exec bash", full_cmd))
                    .spawn()
            });
    }

    Ok(())
}

#[tauri::command]
pub async fn launch_cli_in_terminal(
    launcher: State<'_, CliLauncher>,
    session_id: String,
    agent: AgentType,
) -> Result<(), String> {
    launcher
        .launch_cli(&session_id, agent)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_cli_in_terminal(
    launcher: State<'_, CliLauncher>,
    session_id: String,
) -> Result<(), String> {
    launcher.stop_cli(&session_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restart_cli_in_terminal(
    launcher: State<'_, CliLauncher>,
    session_id: String,
) -> Result<(), String> {
    launcher.restart_cli(&session_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_cli_launch_state(
    launcher: State<'_, CliLauncher>,
    session_id: String,
) -> Result<Option<CliLaunchState>, String> {
    Ok(launcher.get_launch_state(&session_id))
}

#[tauri::command]
pub async fn get_all_cli_launch_states(
    launcher: State<'_, CliLauncher>,
) -> Result<Vec<CliLaunchState>, String> {
    Ok(launcher.get_all_launch_states())
}

#[tauri::command]
pub async fn check_cli_auth(agent: AgentType) -> Result<AuthInfo, String> {
    Ok(AuthDetector::check_auth(agent))
}

#[tauri::command]
pub async fn check_all_cli_auth() -> Result<Vec<AuthInfo>, String> {
    Ok(AuthDetector::check_all())
}

#[tauri::command]
pub async fn get_auth_instructions(agent: AgentType) -> Result<Vec<String>, String> {
    Ok(AuthDetector::get_auth_instructions(agent))
}

#[tauri::command]
pub async fn get_cli_binary_name(agent: AgentType) -> Result<String, String> {
    Ok(CliLauncher::get_binary_name(agent).to_string())
}

#[tauri::command]
pub async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn maximize_window(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}
