use std::env;
use std::fs;
use std::path::PathBuf;

use crate::types::AgentType;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AuthStatus {
    Unknown,
    Checking,
    Authenticated,
    NotAuthenticated,
    Error,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthInfo {
    pub agent: AgentType,
    pub status: AuthStatus,
    pub error: Option<String>,
    pub config_path: Option<String>,
}

pub struct AuthDetector;

impl AuthDetector {
    pub fn check_auth(agent: AgentType) -> AuthInfo {
        match agent {
            AgentType::Claude => Self::check_claude_auth(),
            AgentType::Opencode => Self::check_opencode_auth(),
            AgentType::Codex => Self::check_codex_auth(),
            AgentType::Gemini => Self::check_gemini_auth(),
            AgentType::Cursor => Self::check_cursor_auth(),
            AgentType::Kilo => Self::check_kilo_auth(),
        }
    }

    pub fn check_all() -> Vec<AuthInfo> {
        [
            AgentType::Claude,
            AgentType::Opencode,
            AgentType::Codex,
            AgentType::Gemini,
            AgentType::Cursor,
            AgentType::Kilo,
        ]
        .iter()
        .map(|agent| Self::check_auth(*agent))
        .collect()
    }

    fn check_claude_auth() -> AuthInfo {
        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".claude");

            if config_path.exists() {
                let credentials_path = config_path.join("credentials.json");
                let storage_path = config_path.join("storage.json");

                if credentials_path.exists() || storage_path.exists() {
                    return AuthInfo {
                        agent: AgentType::Claude,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(config_path.to_string_lossy().to_string()),
                    };
                }
            }
        }

        AuthInfo {
            agent: AgentType::Claude,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn check_opencode_auth() -> AuthInfo {
        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".opencode");

            if config_path.exists() {
                let config_file = config_path.join("config.json");
                let credentials_path = config_path.join("credentials.json");

                if config_file.exists() || credentials_path.exists() {
                    if let Ok(contents) = fs::read_to_string(&config_file) {
                        if contents.contains("apiKey") || contents.contains("token") {
                            return AuthInfo {
                                agent: AgentType::Opencode,
                                status: AuthStatus::Authenticated,
                                error: None,
                                config_path: Some(config_path.to_string_lossy().to_string()),
                            };
                        }
                    }

                    return AuthInfo {
                        agent: AgentType::Opencode,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(config_path.to_string_lossy().to_string()),
                    };
                }
            }
        }

        AuthInfo {
            agent: AgentType::Opencode,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn check_codex_auth() -> AuthInfo {
        if env::var("OPENAI_API_KEY").is_ok() {
            return AuthInfo {
                agent: AgentType::Codex,
                status: AuthStatus::Authenticated,
                error: None,
                config_path: None,
            };
        }

        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".codex");

            if config_path.exists() {
                let config_file = config_path.join("config.json");

                if config_file.exists() {
                    if let Ok(contents) = fs::read_to_string(&config_file) {
                        if contents.contains("apiKey") || contents.contains("OPENAI_API_KEY") {
                            return AuthInfo {
                                agent: AgentType::Codex,
                                status: AuthStatus::Authenticated,
                                error: None,
                                config_path: Some(config_path.to_string_lossy().to_string()),
                            };
                        }
                    }
                }
            }
        }

        AuthInfo {
            agent: AgentType::Codex,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn check_gemini_auth() -> AuthInfo {
        if env::var("GEMINI_API_KEY").is_ok() || env::var("GOOGLE_API_KEY").is_ok() {
            return AuthInfo {
                agent: AgentType::Gemini,
                status: AuthStatus::Authenticated,
                error: None,
                config_path: None,
            };
        }

        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".gemini");

            if config_path.exists() {
                let config_file = config_path.join("config.json");
                let credentials_path = config_path.join("credentials.json");

                if config_file.exists() || credentials_path.exists() {
                    return AuthInfo {
                        agent: AgentType::Gemini,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(config_path.to_string_lossy().to_string()),
                    };
                }
            }

            let gcloud_path = home.join(".config").join("gcloud");
            if gcloud_path.exists() {
                let credentials = gcloud_path.join("application_default_credentials.json");
                if credentials.exists() {
                    return AuthInfo {
                        agent: AgentType::Gemini,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(gcloud_path.to_string_lossy().to_string()),
                    };
                }
            }
        }

        AuthInfo {
            agent: AgentType::Gemini,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn check_cursor_auth() -> AuthInfo {
        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".cursor");

            if config_path.exists() {
                let credentials_path = config_path.join("credentials.json");
                let storage_path = config_path.join("storage.json");

                if credentials_path.exists() || storage_path.exists() {
                    return AuthInfo {
                        agent: AgentType::Cursor,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(config_path.to_string_lossy().to_string()),
                    };
                }
            }

            #[cfg(target_os = "windows")]
            {
                let appdata_path = env::var("APPDATA").ok();
                if let Some(appdata) = appdata_path {
                    let cursor_appdata = PathBuf::from(appdata).join("Cursor");
                    if cursor_appdata.exists() {
                        return AuthInfo {
                            agent: AgentType::Cursor,
                            status: AuthStatus::Authenticated,
                            error: None,
                            config_path: Some(cursor_appdata.to_string_lossy().to_string()),
                        };
                    }
                }
            }

            #[cfg(target_os = "macos")]
            {
                let cursor_app_support = home
                    .join("Library")
                    .join("Application Support")
                    .join("Cursor");
                if cursor_app_support.exists() {
                    return AuthInfo {
                        agent: AgentType::Cursor,
                        status: AuthStatus::Authenticated,
                        error: None,
                        config_path: Some(cursor_app_support.to_string_lossy().to_string()),
                    };
                }
            }
        }

        AuthInfo {
            agent: AgentType::Cursor,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn check_kilo_auth() -> AuthInfo {
        if env::var("KILO_API_KEY").is_ok() {
            return AuthInfo {
                agent: AgentType::Kilo,
                status: AuthStatus::Authenticated,
                error: None,
                config_path: None,
            };
        }

        if let Some(home) = Self::get_home_dir() {
            let config_path = home.join(".config").join("kilo");

            if config_path.exists() {
                let config_file = config_path.join("opencode.json");
                let config_jsonc = config_path.join("opencode.jsonc");

                for file in [&config_file, &config_jsonc] {
                    if file.exists() {
                        if let Ok(contents) = fs::read_to_string(file) {
                            if contents.contains("apiKey") || contents.contains("provider") {
                                return AuthInfo {
                                    agent: AgentType::Kilo,
                                    status: AuthStatus::Authenticated,
                                    error: None,
                                    config_path: Some(config_path.to_string_lossy().to_string()),
                                };
                            }
                        }
                    }
                }
            }
        }

        AuthInfo {
            agent: AgentType::Kilo,
            status: AuthStatus::NotAuthenticated,
            error: None,
            config_path: None,
        }
    }

    fn get_home_dir() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            env::var("USERPROFILE").ok().map(PathBuf::from)
        }

        #[cfg(not(target_os = "windows"))]
        {
            env::var("HOME").ok().map(PathBuf::from)
        }
    }

    pub fn get_auth_instructions(agent: AgentType) -> Vec<String> {
        match agent {
            AgentType::Claude => vec![
                "Run 'claude login' in a terminal".to_string(),
                "Or set ANTHROPIC_API_KEY environment variable".to_string(),
            ],
            AgentType::Opencode => vec![
                "Run 'opencode auth' in a terminal".to_string(),
                "Or set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable".to_string(),
            ],
            AgentType::Codex => vec![
                "Run 'codex auth' in a terminal".to_string(),
                "Or set OPENAI_API_KEY environment variable".to_string(),
            ],
            AgentType::Gemini => vec![
                "Run 'gemini auth' in a terminal".to_string(),
                "Or set GEMINI_API_KEY or GOOGLE_API_KEY environment variable".to_string(),
            ],
            AgentType::Cursor => vec![
                "Run 'agent login' in a terminal".to_string(),
                "Or sign in through the Cursor desktop app".to_string(),
            ],
            AgentType::Kilo => vec![
                "Run 'kilo' and use '/connect' to add provider credentials".to_string(),
                "Or set KILO_API_KEY environment variable".to_string(),
                "Or run 'kilo auth' to manage credentials".to_string(),
            ],
        }
    }
}
