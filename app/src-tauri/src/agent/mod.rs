mod executor;

pub use crate::types::AgentType;
pub use executor::AgentExecutor;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Copy)]
#[serde(rename_all = "lowercase")]
pub enum AgentTaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTask {
    pub id: String,
    pub session_id: String,
    pub agent: AgentType,
    pub prompt: String,
    pub cwd: String,
    pub status: AgentTaskStatus,
    pub generated_command: Option<String>,
    pub output: String,
    pub error: Option<String>,
    pub retry_count: u32,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteAgentTaskRequest {
    pub session_id: String,
    pub agent: AgentType,
    pub prompt: String,
    pub cwd: String,
}

pub const MAX_RETRIES: u32 = 3;

pub const COMMAND_GENERATION_PROMPT: &str = r#"You are an AI agent running in a terminal.
Working directory: {cwd}
Task: {prompt}

Generate a single shell command to accomplish this task.
Return ONLY the command, with no explanation, no markdown formatting, no code blocks.
If the task requires multiple steps, return the first command only.
If you cannot determine a command, respond with: UNKNOWN"#;
