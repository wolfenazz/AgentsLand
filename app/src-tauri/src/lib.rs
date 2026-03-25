mod agent;
mod agent_cli;
mod commands;
mod ide;
mod terminal;
mod types;

use agent::AgentExecutor;
use agent_cli::{AgentCliDetector, AgentCliInstaller, CliLauncher};
use ide::IdeDetector;
use terminal::TerminalManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let terminal_manager = TerminalManager::new();
    let default_provider = agent_cli::get_provider(crate::types::AgentType::Claude);
    let agent_executor = AgentExecutor::new(default_provider);
    let cli_detector = AgentCliDetector::new();
    let mut cli_installer = AgentCliInstaller::new();
    let cli_launcher = CliLauncher::new(terminal_manager.clone());
    let ide_detector = IdeDetector::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(terminal_manager.clone())
        .manage(agent_executor.clone())
        .manage(cli_detector.clone())
        .manage(cli_installer.clone())
        .manage(cli_launcher.clone())
        .manage(ide_detector.clone())
        .setup(move |app| {
            terminal_manager.set_app_handle(app.handle().clone());
            agent_executor.set_app_handle(app.handle().clone());
            cli_installer.set_app_handle(app.handle().clone());
            cli_launcher.set_app_handle(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_terminal_sessions,
            commands::write_to_terminal,
            commands::resize_terminal,
            commands::kill_session,
            commands::kill_workspace_sessions,
            commands::get_all_sessions,
            commands::execute_agent_task,
            commands::get_agent_task_status,
            commands::cancel_agent_task,
            commands::check_prerequisites,
            commands::detect_agent_cli,
            commands::detect_all_agent_clis,
            commands::clear_cli_cache,
            commands::install_agent_cli,
            commands::get_install_command,
            commands::open_install_terminal,
            commands::launch_cli_in_terminal,
            commands::stop_cli_in_terminal,
            commands::restart_cli_in_terminal,
            commands::get_cli_launch_state,
            commands::get_all_cli_launch_states,
            commands::check_cli_auth,
            commands::check_all_cli_auth,
            commands::get_auth_instructions,
            commands::get_cli_binary_name,
            commands::minimize_window,
            commands::maximize_window,
            commands::close_window,
            commands::detect_ide,
            commands::detect_all_ides_cmd,
            commands::launch_ide_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
