use crate::agent_cli::prerequisites::PrerequisiteType;
use crate::agent_cli::provider::{AgentCliProvider, Platform};
use crate::types::AgentType;

pub struct GeminiCliProvider;

impl AgentCliProvider for GeminiCliProvider {
    fn agent_type(&self) -> AgentType {
        AgentType::Gemini
    }

    fn binary_name(&self) -> &'static str {
        "gemini"
    }

    fn display_name(&self) -> &'static str {
        "Gemini CLI"
    }

    fn description(&self) -> &'static str {
        "Google's Gemini AI assistant for terminal-based development"
    }

    fn provider(&self) -> &'static str {
        "Google"
    }

    fn get_install_command(&self, _platform: Platform) -> Vec<String> {
        vec![
            "npm".to_string(),
            "install".to_string(),
            "-g".to_string(),
            "@google/gemini-cli".to_string(),
        ]
    }

    fn get_version_command(&self) -> Vec<String> {
        vec!["--version".to_string()]
    }

    fn get_docs_url(&self) -> &'static str {
        "https://geminicli.com/docs"
    }

    fn get_prerequisites(&self) -> Vec<PrerequisiteType> {
        vec![PrerequisiteType::NodeJs, PrerequisiteType::Git]
    }

    fn get_icon_path(&self) -> &'static str {
        "/assets/gemini-cli-logo.svg"
    }

    fn get_npm_package_name(&self) -> Option<&'static str> {
        Some("@google/gemini-cli")
    }
}
