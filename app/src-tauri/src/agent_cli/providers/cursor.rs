use crate::agent_cli::prerequisites::PrerequisiteType;
use crate::agent_cli::provider::{AgentCliProvider, Platform};
use crate::types::AgentType;

pub struct CursorCliProvider;

impl AgentCliProvider for CursorCliProvider {
    fn agent_type(&self) -> AgentType {
        AgentType::Cursor
    }

    fn binary_name(&self) -> &'static str {
        "agent"
    }

    fn display_name(&self) -> &'static str {
        "Cursor CLI"
    }

    fn description(&self) -> &'static str {
        "AI-enhanced development environment with intelligent code completion"
    }

    fn provider(&self) -> &'static str {
        "Cursor"
    }

    fn get_install_command(&self, platform: Platform) -> Vec<String> {
        match platform {
            Platform::Windows => {
                vec![
                    "powershell".to_string(),
                    "-Command".to_string(),
                    "irm 'https://cursor.com/install?win32=true' | iex".to_string(),
                ]
            }
            Platform::Macos | Platform::Linux => {
                vec![
                    "bash".to_string(),
                    "-c".to_string(),
                    "curl https://cursor.com/install -fsS | bash".to_string(),
                ]
            }
        }
    }

    fn get_version_command(&self) -> Vec<String> {
        vec!["--version".to_string()]
    }

    fn get_docs_url(&self) -> &'static str {
        "https://cursor.com/docs/cli/overview"
    }

    fn get_prerequisites(&self) -> Vec<PrerequisiteType> {
        vec![PrerequisiteType::Git]
    }

    fn get_icon_path(&self) -> &'static str {
        "/assets/cursor-ai.png"
    }
}
