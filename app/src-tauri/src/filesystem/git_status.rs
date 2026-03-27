use std::path::Path;
use std::process::Command;

use crate::types::{GitFileChange, GitFileStatus};

pub fn get_git_status(workspace_path: &str) -> Result<Vec<GitFileStatus>, String> {
    let root = Path::new(workspace_path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", workspace_path));
    }

    let git_dir = root.join(".git");
    if !git_dir.exists() {
        return Ok(Vec::new());
    }

    #[cfg(target_os = "windows")]
    let output = {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        Command::new("git")
            .args(["status", "--porcelain=v1", "--no-renames"])
            .current_dir(root)
            .creation_flags(CREATE_NO_WINDOW)
            .output()
    };

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("git")
        .args(["status", "--porcelain=v1", "--no-renames"])
        .current_dir(root)
        .output();

    let output = output.map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Ok(Vec::new());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut statuses: Vec<GitFileStatus> = Vec::new();

    for line in stdout.lines() {
        let line = line.trim();
        if line.len() < 4 {
            continue;
        }

        let xy = &line[..2];
        let file_path = &line[3..];

        let change = parse_git_xy(xy);

        let full_path = root.join(file_path);
        statuses.push(GitFileStatus {
            path: full_path.to_string_lossy().to_string(),
            change,
        });
    }

    Ok(statuses)
}

fn parse_git_xy(xy: &str) -> GitFileChange {
    let x = xy.chars().next().unwrap_or(' ');
    let y = xy.chars().nth(1).unwrap_or(' ');

    if x == '?' && y == '?' {
        GitFileChange::Untracked
    } else if x == 'D' || y == 'D' {
        GitFileChange::Deleted
    } else if (x == 'A' || x == 'C') || (y == 'A' || y == 'C') {
        GitFileChange::Added
    } else {
        GitFileChange::Modified
    }
}
