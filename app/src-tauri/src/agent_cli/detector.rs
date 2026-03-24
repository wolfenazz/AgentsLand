use super::provider::get_provider;
use crate::types::AgentType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CliStatus {
    NotInstalled,
    Installed,
    Checking,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentCliInfo {
    pub agent: AgentType,
    pub binary_name: String,
    pub display_name: String,
    pub description: String,
    pub provider: String,
    pub status: CliStatus,
    pub version: Option<String>,
    pub path: Option<String>,
    pub error: Option<String>,
    pub docs_url: String,
    pub icon_path: String,
}

pub struct AgentCliDetector {
    cache: Arc<Mutex<HashMap<AgentType, AgentCliInfo>>>,
}

impl AgentCliDetector {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn detect(&self, agent: AgentType) -> AgentCliInfo {
        if let Some(cached) = self.cache.lock().unwrap().get(&agent) {
            return cached.clone();
        }

        let info = self.detect_uncached(agent);
        self.cache.lock().unwrap().insert(agent, info.clone());
        info
    }

    pub fn detect_uncached(&self, agent: AgentType) -> AgentCliInfo {
        let provider = get_provider(agent);
        let binary_name = provider.binary_name();

        let mut info = AgentCliInfo {
            agent,
            binary_name: binary_name.to_string(),
            display_name: provider.display_name().to_string(),
            description: provider.description().to_string(),
            provider: provider.provider().to_string(),
            status: CliStatus::Checking,
            version: None,
            path: None,
            error: None,
            docs_url: provider.get_docs_url().to_string(),
            icon_path: provider.get_icon_path().to_string(),
        };

        match self.find_binary(binary_name) {
            Some(path) => {
                info.path = Some(path.clone());

                let version_args = provider.get_version_command();
                match self.run_version_check(&path, &version_args) {
                    Some(version) => {
                        info.version = Some(version);
                        info.status = CliStatus::Installed;
                    }
                    None => {
                        info.status = CliStatus::Installed;
                        info.version = Some("unknown".to_string());
                    }
                }
            }
            None => {
                info.status = CliStatus::NotInstalled;
            }
        }

        info
    }

    pub fn detect_all(&self) -> HashMap<AgentType, AgentCliInfo> {
        let agents = [
            AgentType::Claude,
            AgentType::Opencode,
            AgentType::Codex,
            AgentType::Gemini,
            AgentType::Cursor,
        ];
        agents
            .iter()
            .map(|&agent| (agent, self.detect(agent)))
            .collect()
    }

    pub fn clear_cache(&self) {
        self.cache.lock().unwrap().clear();
    }

    fn find_binary(&self, binary: &str) -> Option<String> {
        let binary_exts = if cfg!(target_os = "windows") {
            vec!["", ".cmd", ".exe", ".bat", ".ps1"]
        } else {
            vec![""]
        };

        // 1. Try 'where' or 'which'
        #[cfg(target_os = "windows")]
        {
            for ext in &binary_exts {
                let full_name = format!("{}{}", binary, ext);
                let output = std::process::Command::new("where")
                    .arg(&full_name)
                    .stdin(std::process::Stdio::null())
                    .output();

                if let Ok(o) = output {
                    if o.status.success() {
                        if let Some(path) = String::from_utf8_lossy(&o.stdout).lines().next() {
                            let trimmed = path.trim().to_string();
                            if !trimmed.is_empty() {
                                return Some(trimmed);
                            }
                        }
                    }
                }
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            if let Ok(o) = std::process::Command::new("which")
                .arg(binary)
                .stdin(std::process::Stdio::null())
                .output()
            {
                if o.status.success() {
                    let path = String::from_utf8_lossy(&o.stdout).trim().to_string();
                    if !path.is_empty() {
                        return Some(path);
                    }
                }
            }
        }

        // 2. Fallback to common paths on Windows
        #[cfg(target_os = "windows")]
        {
            let mut search_paths = Vec::new();

            // Current user NPM path
            if let Ok(appdata) = std::env::var("APPDATA") {
                search_paths.push(format!(r"{}\npm", appdata));
            }

            // Local AppData (some tools install here)
            if let Ok(local_appdata) = std::env::var("LOCALAPPDATA") {
                search_paths.push(format!(r"{}\bin", local_appdata));
                search_paths.push(format!(
                    r"{}\Programs\Python\Python312\Scripts",
                    local_appdata
                ));
                search_paths.push(format!(r"{}\pnpm", local_appdata));
            }

            // Program Files
            search_paths.push(r"C:\Program Files\nodejs".to_string());
            search_paths.push(r"C:\Program Files (x86)\nodejs".to_string());
            search_paths.push(r"C:\Program Files\Git\bin".to_string());

            // User home local bin
            if let Some(user_home) = std::env::var("USERPROFILE")
                .ok()
                .or_else(|| std::env::var("HOME").ok())
            {
                search_paths.push(format!(r"{}\.claude\bin", user_home));
                search_paths.push(format!(r"{}\.local\bin", user_home));
                search_paths.push(format!(r"{}\bin", user_home));
                search_paths.push(format!(
                    r"{}\AppData\Local\Programs\cursor\resources\app\bin",
                    user_home
                ));
            }

            for path in search_paths {
                for ext in &binary_exts {
                    let full_path = format!("{}\\{}{}", path, binary, ext);
                    if std::path::Path::new(&full_path).exists() {
                        return Some(full_path);
                    }
                }
            }
        }

        None
    }

    fn run_version_check(&self, binary_path: &str, args: &[String]) -> Option<String> {
        #[cfg(target_os = "windows")]
        let mut cmd = if binary_path.to_lowercase().ends_with(".cmd")
            || binary_path.to_lowercase().ends_with(".bat")
        {
            let mut c = std::process::Command::new("cmd");
            c.arg("/c").arg(binary_path);
            c
        } else {
            std::process::Command::new(binary_path)
        };

        #[cfg(not(target_os = "windows"))]
        let mut cmd = std::process::Command::new(binary_path);

        cmd.args(args)
            .stdin(std::process::Stdio::null())
            .output()
            .ok()
            .map(|o| {
                let stdout = String::from_utf8_lossy(&o.stdout).trim().to_string();
                let stderr = String::from_utf8_lossy(&o.stderr).trim().to_string();

                let version = if !stdout.is_empty() {
                    stdout
                } else if !stderr.is_empty() {
                    stderr
                } else {
                    return String::new();
                };

                // Take first line and limit length
                let first_line = version.lines().next().unwrap_or("").trim();
                if first_line.len() > 20 {
                    first_line[..20].to_string()
                } else {
                    first_line.to_string()
                }
            })
            .filter(|s| !s.is_empty())
    }
}

impl Default for AgentCliDetector {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for AgentCliDetector {
    fn clone(&self) -> Self {
        Self {
            cache: Arc::clone(&self.cache),
        }
    }
}
