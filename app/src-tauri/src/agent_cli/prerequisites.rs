use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum PrerequisiteType {
    NodeJs,
    Npm,
    Git,
    Bun,
    Pnpm,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrerequisiteStatus {
    pub name: String,
    pub prerequisite_type: PrerequisiteType,
    pub installed: bool,
    pub version: Option<String>,
    pub minimum_version: String,
    pub meets_minimum: bool,
    pub install_url: String,
    pub required_for: Vec<String>,
}

pub struct PrerequisitesChecker;

impl PrerequisitesChecker {
    pub fn new() -> Self {
        Self
    }

    pub fn check_all() -> Vec<PrerequisiteStatus> {
        vec![Self::check_nodejs(), Self::check_npm(), Self::check_git()]
    }

    pub fn check_nodejs() -> PrerequisiteStatus {
        let result = Self::run_command("node", &["--version"]);
        let minimum = "18.0.0";

        match result {
            Some(output) => {
                let version = Self::parse_version(&output);
                let meets_minimum = Self::compare_versions(&version, minimum);
                PrerequisiteStatus {
                    name: "Node.js".to_string(),
                    prerequisite_type: PrerequisiteType::NodeJs,
                    installed: true,
                    version: Some(version.clone()),
                    minimum_version: minimum.to_string(),
                    meets_minimum,
                    install_url: "https://nodejs.org".to_string(),
                    required_for: vec![
                        "Claude Code".to_string(),
                        "OpenCode".to_string(),
                        "Codex CLI".to_string(),
                        "Gemini CLI".to_string(),
                    ],
                }
            }
            None => PrerequisiteStatus {
                name: "Node.js".to_string(),
                prerequisite_type: PrerequisiteType::NodeJs,
                installed: false,
                version: None,
                minimum_version: minimum.to_string(),
                meets_minimum: false,
                install_url: "https://nodejs.org".to_string(),
                required_for: vec![
                    "Claude Code".to_string(),
                    "OpenCode".to_string(),
                    "Codex CLI".to_string(),
                    "Gemini CLI".to_string(),
                ],
            },
        }
    }

    pub fn check_npm() -> PrerequisiteStatus {
        let result = Self::run_command("npm", &["--version"]);
        let minimum = "8.0.0";

        match result {
            Some(output) => {
                let version = Self::parse_version(&output);
                let meets_minimum = Self::compare_versions(&version, minimum);
                PrerequisiteStatus {
                    name: "npm".to_string(),
                    prerequisite_type: PrerequisiteType::Npm,
                    installed: true,
                    version: Some(version.clone()),
                    minimum_version: minimum.to_string(),
                    meets_minimum,
                    install_url: "https://nodejs.org".to_string(),
                    required_for: vec![
                        "Claude Code".to_string(),
                        "OpenCode".to_string(),
                        "Codex CLI".to_string(),
                        "Gemini CLI".to_string(),
                    ],
                }
            }
            None => PrerequisiteStatus {
                name: "npm".to_string(),
                prerequisite_type: PrerequisiteType::Npm,
                installed: false,
                version: None,
                minimum_version: minimum.to_string(),
                meets_minimum: false,
                install_url: "https://nodejs.org".to_string(),
                required_for: vec![
                    "Claude Code".to_string(),
                    "OpenCode".to_string(),
                    "Codex CLI".to_string(),
                    "Gemini CLI".to_string(),
                ],
            },
        }
    }

    pub fn check_git() -> PrerequisiteStatus {
        let result = Self::run_command("git", &["--version"]);
        let minimum = "2.0.0";

        match result {
            Some(output) => {
                let version = Self::parse_git_version(&output);
                let meets_minimum = Self::compare_versions(&version, minimum);
                PrerequisiteStatus {
                    name: "Git".to_string(),
                    prerequisite_type: PrerequisiteType::Git,
                    installed: true,
                    version: Some(version.clone()),
                    minimum_version: minimum.to_string(),
                    meets_minimum,
                    install_url: "https://git-scm.com".to_string(),
                    required_for: vec![
                        "Claude Code".to_string(),
                        "OpenCode".to_string(),
                        "Codex CLI".to_string(),
                        "Gemini CLI".to_string(),
                    ],
                }
            }
            None => PrerequisiteStatus {
                name: "Git".to_string(),
                prerequisite_type: PrerequisiteType::Git,
                installed: false,
                version: None,
                minimum_version: minimum.to_string(),
                meets_minimum: false,
                install_url: "https://git-scm.com".to_string(),
                required_for: vec![
                    "Claude Code".to_string(),
                    "OpenCode".to_string(),
                    "Codex CLI".to_string(),
                    "Gemini CLI".to_string(),
                ],
            },
        }
    }

    fn run_command(cmd: &str, args: &[&str]) -> Option<String> {
        Command::new(cmd)
            .args(args)
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
    }

    fn parse_version(output: &str) -> String {
        output
            .trim_start_matches('v')
            .split_whitespace()
            .next()
            .unwrap_or("0.0.0")
            .to_string()
    }

    fn parse_git_version(output: &str) -> String {
        output
            .strip_prefix("git version ")
            .unwrap_or("0.0.0")
            .split_whitespace()
            .next()
            .unwrap_or("0.0.0")
            .to_string()
    }

    fn compare_versions(version: &str, minimum: &str) -> bool {
        let parse_parts =
            |v: &str| -> Vec<u32> { v.split('.').filter_map(|s| s.parse().ok()).collect() };

        let v_parts = parse_parts(version);
        let m_parts = parse_parts(minimum);

        for i in 0..m_parts.len().max(v_parts.len()) {
            let v = v_parts.get(i).unwrap_or(&0);
            let m = m_parts.get(i).unwrap_or(&0);
            if v < m {
                return false;
            }
            if v > m {
                return true;
            }
        }
        true
    }
}

impl Default for PrerequisitesChecker {
    fn default() -> Self {
        Self::new()
    }
}
