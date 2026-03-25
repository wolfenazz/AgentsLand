use super::get_ide_config;
use crate::types::IdeType;

pub fn launch_ide(ide: IdeType, directory: &str) -> Result<(), String> {
    let config = get_ide_config(ide);

    #[cfg(target_os = "windows")]
    {
        launch_windows(&config, directory)
    }

    #[cfg(target_os = "macos")]
    {
        launch_macos(&config, directory)
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        launch_linux(&config, directory)
    }
}

#[cfg(target_os = "windows")]
fn launch_windows(config: &super::IdeConfig, directory: &str) -> Result<(), String> {
    for binary in &config.binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    for binary in &config.windows_binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let program_files = std::env::var("ProgramFiles").unwrap_or_default();

    for search_subpath in &config.windows_search_paths {
        let paths_to_check = vec![
            format!("{}\\{}", local_app_data, search_subpath),
            format!("{}\\Programs\\{}", local_app_data, search_subpath),
            format!("{}\\{}", program_files, search_subpath),
        ];

        for base_path in paths_to_check {
            for binary in &config.windows_binary_names {
                let direct_path = std::path::Path::new(&base_path).join(binary);
                if direct_path.exists() {
                    let result = std::process::Command::new(&direct_path)
                        .arg(directory)
                        .spawn();
                    if result.is_ok() {
                        return Ok(());
                    }
                }

                if let Ok(entries) = std::fs::read_dir(&base_path) {
                    for entry in entries.flatten() {
                        let exe_path = entry.path().join(binary);
                        if exe_path.exists() {
                            let result =
                                std::process::Command::new(&exe_path).arg(directory).spawn();
                            if result.is_ok() {
                                return Ok(());
                            }
                        }
                    }
                }
            }
        }
    }

    Err(format!(
        "Failed to launch {}: executable not found",
        config.name
    ))
}

#[cfg(target_os = "macos")]
fn launch_macos(config: &super::IdeConfig, directory: &str) -> Result<(), String> {
    for binary in &config.binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    for binary in &config.linux_binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    if let Ok(home) = std::env::var("HOME") {
        for app_name in &config.macos_app_names {
            let user_app_path = format!("{}/Applications/{}", home, app_name);
            let path = std::path::Path::new(&user_app_path);
            if path.exists() {
                let result = std::process::Command::new("open")
                    .arg("-a")
                    .arg(&user_app_path)
                    .arg(directory)
                    .spawn();
                if result.is_ok() {
                    return Ok(());
                }
            }
        }
    }

    for app_name in &config.macos_app_names {
        let app_path = format!("/Applications/{}", app_name);
        let path = std::path::Path::new(&app_path);
        if path.exists() {
            let result = std::process::Command::new("open")
                .arg("-a")
                .arg(&app_path)
                .arg(directory)
                .spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    Err(format!("{} not found or failed to launch", config.name))
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn launch_linux(config: &super::IdeConfig, directory: &str) -> Result<(), String> {
    for binary in &config.binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    for binary in &config.linux_binary_names {
        if which::which(binary).is_ok() {
            let result = std::process::Command::new(binary).arg(directory).spawn();
            if result.is_ok() {
                return Ok(());
            }
        }
    }

    Err(format!(
        "Failed to launch {}: executable not found",
        config.name
    ))
}
