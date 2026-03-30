use crate::agent_cli::prerequisites::PrerequisiteType;
use crate::agent_cli::provider::{AgentCliProvider, Platform};
use crate::types::AgentType;

pub struct KiloCliProvider;

impl AgentCliProvider for KiloCliProvider {
    fn agent_type(&self) -> AgentType {
        AgentType::Kilo
    }

    fn binary_name(&self) -> &'static str {
        "kilo"
    }

    fn display_name(&self) -> &'static str {
        "Kilo CLI"
    }

    fn description(&self) -> &'static str {
        "Kilo Code's agentic coding CLI with TUI and autonomous mode"
    }

    fn provider(&self) -> &'static str {
        "Kilo"
    }

    fn get_install_command(&self, _platform: Platform) -> Vec<String> {
        vec![
            "npm".to_string(),
            "install".to_string(),
            "-g".to_string(),
            "@kilocode/cli".to_string(),
        ]
    }

    fn get_version_command(&self) -> Vec<String> {
        vec!["--version".to_string()]
    }

    fn get_docs_url(&self) -> &'static str {
        "https://kilocode.ai/docs/cli"
    }

    fn get_prerequisites(&self) -> Vec<PrerequisiteType> {
        vec![PrerequisiteType::NodeJs, PrerequisiteType::Git]
    }

    fn get_icon_path(&self) -> &'static str {
        "/assets/kiloCode.gif"
    }

    fn get_npm_package_name(&self) -> Option<&'static str> {
        Some("@kilocode/cli")
    }
}
