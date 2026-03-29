use crate::agent_cli::prerequisites::PrerequisiteType;
use crate::agent_cli::provider::{AgentCliProvider, Platform};
use crate::types::AgentType;

pub struct OpenCodeCliProvider;

impl AgentCliProvider for OpenCodeCliProvider {
    fn agent_type(&self) -> AgentType {
        AgentType::Opencode
    }

    fn binary_name(&self) -> &'static str {
        "opencode"
    }

    fn display_name(&self) -> &'static str {
        "OpenCode"
    }

    fn description(&self) -> &'static str {
        "AI-powered command-line coding assistant with Tauri integration"
    }

    fn provider(&self) -> &'static str {
        "AnomalyCo"
    }

    fn get_install_command(&self, platform: Platform) -> Vec<String> {
        match platform {
            Platform::Windows => {
                vec![
                    "npm".to_string(),
                    "install".to_string(),
                    "-g".to_string(),
                    "opencode-ai".to_string(),
                ]
            }
            Platform::Macos => {
                vec![
                    "brew".to_string(),
                    "install".to_string(),
                    "anomalyco/tap/opencode".to_string(),
                ]
            }
            Platform::Linux => {
                vec![
                    "npm".to_string(),
                    "install".to_string(),
                    "-g".to_string(),
                    "opencode-ai".to_string(),
                ]
            }
        }
    }

    fn get_version_command(&self) -> Vec<String> {
        vec!["--version".to_string()]
    }

    fn get_docs_url(&self) -> &'static str {
        "https://opencode.ai/docs"
    }

    fn get_prerequisites(&self) -> Vec<PrerequisiteType> {
        vec![PrerequisiteType::NodeJs, PrerequisiteType::Git]
    }

    fn get_icon_path(&self) -> &'static str {
        "/assets/opencode.png"
    }

    fn get_npm_package_name(&self) -> Option<&'static str> {
        Some("opencode-ai")
    }
}
