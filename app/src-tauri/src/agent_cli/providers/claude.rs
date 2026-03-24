use crate::agent_cli::prerequisites::PrerequisiteType;
use crate::agent_cli::provider::{AgentCliProvider, Platform};
use crate::types::AgentType;

pub struct ClaudeCliProvider;

impl AgentCliProvider for ClaudeCliProvider {
    fn agent_type(&self) -> AgentType {
        AgentType::Claude
    }

    fn binary_name(&self) -> &'static str {
        "claude"
    }

    fn display_name(&self) -> &'static str {
        "Claude Code"
    }

    fn description(&self) -> &'static str {
        "Advanced AI coding assistant powered by Anthropic's Claude models"
    }

    fn provider(&self) -> &'static str {
        "Anthropic"
    }

    fn get_install_command(&self, platform: Platform) -> Vec<String> {
        match platform {
            Platform::Windows => {
                vec![
                    "powershell".to_string(),
                    "-Command".to_string(),
                    "irm https://claude.ai/install.ps1 | iex".to_string(),
                ]
            }
            Platform::Macos | Platform::Linux => {
                vec![
                    "bash".to_string(),
                    "-c".to_string(),
                    "curl -fsSL https://claude.ai/install.sh | bash".to_string(),
                ]
            }
        }
    }

    fn get_version_command(&self) -> Vec<String> {
        vec!["--version".to_string()]
    }

    fn get_docs_url(&self) -> &'static str {
        "https://docs.anthropic.com/en/docs/claude-code"
    }

    fn get_prerequisites(&self) -> Vec<PrerequisiteType> {
        vec![PrerequisiteType::NodeJs, PrerequisiteType::Git]
    }

    fn get_icon_path(&self) -> &'static str {
        "/assets/claude.png"
    }
}
