use std::collections::HashMap;
use std::path::PathBuf;

use super::get_ide_config;
use crate::types::{IdeInfo, IdeType};

pub struct IdeDetector {
    cache: HashMap<IdeType, IdeInfo>,
}

impl IdeDetector {
    pub fn new() -> Self {
        Self {
            cache: HashMap::new(),
        }
    }

    pub fn detect(&mut self, ide: IdeType) -> IdeInfo {
        if let Some(cached) = self.cache.get(&ide) {
            return cached.clone();
        }

        let info = self.detect_ide_internal(ide);
        self.cache.insert(ide, info.clone());
        info
    }

    pub fn detect_all(&mut self) -> HashMap<IdeType, IdeInfo> {
        let all_ides = [
            IdeType::VsCode,
            IdeType::VisualStudio,
            IdeType::Cursor,
            IdeType::Zed,
            IdeType::WebStorm,
            IdeType::IntelliJ,
            IdeType::SublimeText,
            IdeType::Windsurf,
            IdeType::Perplexity,
        ];

        let mut results = HashMap::new();
        for ide in all_ides {
            let info = self.detect(ide);
            results.insert(ide, info);
        }
        results
    }

    #[allow(dead_code)]
    pub fn clear_cache(&mut self) {
        self.cache.clear();
    }

    fn detect_ide_internal(&self, ide: IdeType) -> IdeInfo {
        let config = get_ide_config(ide);

        let (installed, path) = self.check_ide_installed(&config);

        IdeInfo {
            ide,
            name: config.name,
            binary_name: config.binary_names.first().cloned().unwrap_or_default(),
            installed,
            path,
        }
    }

    fn check_ide_installed(&self, config: &super::IdeConfig) -> (bool, Option<String>) {
        #[cfg(target_os = "windows")]
        {
            self.check_windows(config)
        }

        #[cfg(target_os = "macos")]
        {
            self.check_macos(config)
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            self.check_linux(config)
        }
    }

    #[cfg(target_os = "windows")]
    fn check_windows(&self, config: &super::IdeConfig) -> (bool, Option<String>) {
        for binary in &config.binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        for binary in &config.windows_binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
        let program_files = std::env::var("ProgramFiles").unwrap_or_default();
        let program_files_x86 = std::env::var("ProgramFiles(x86)").unwrap_or_default();

        let mut base_search_paths = vec![
            local_app_data.clone(),
            format!("{}\\Programs", local_app_data),
            program_files.clone(),
            program_files_x86.clone(),
        ];

        for search_subpath in &config.windows_search_paths {
            base_search_paths.push(format!("{}\\{}", local_app_data, search_subpath));
            base_search_paths.push(format!("{}\\Programs\\{}", local_app_data, search_subpath));
            base_search_paths.push(format!("{}\\{}", program_files, search_subpath));
            base_search_paths.push(format!("{}\\{}", program_files_x86, search_subpath));
        }

        for base_path in &base_search_paths {
            let path = PathBuf::from(base_path);
            if !path.exists() {
                continue;
            }

            for binary in &config.windows_binary_names {
                let direct_path = path.join(binary);
                if direct_path.exists() {
                    return (true, Some(direct_path.to_string_lossy().to_string()));
                }

                if let Ok(entries) = std::fs::read_dir(path) {
                    for entry in entries.flatten() {
                        let entry_path = entry.path();
                        if entry_path.is_dir() {
                            let exe_in_subdir = entry_path.join(binary);
                            if exe_in_subdir.exists() {
                                return (true, Some(exe_in_subdir.to_string_lossy().to_string()));
                            }
                        }
                    }
                }
            }

            if let Ok(entries) = std::fs::read_dir(&path) {
                for entry in entries.flatten() {
                    let entry_path = entry.path();
                    if entry_path.is_file() {
                        let file_name = entry_path
                            .file_name()
                            .map(|n| n.to_string_lossy().to_string())
                            .unwrap_or_default();

                        for binary in &config.windows_binary_names {
                            if file_name.eq_ignore_ascii_case(binary) {
                                return (true, Some(entry_path.to_string_lossy().to_string()));
                            }
                        }
                    }
                }
            }
        }

        (false, None)
    }

    #[cfg(target_os = "macos")]
    fn check_macos(&self, config: &super::IdeConfig) -> (bool, Option<String>) {
        for binary in &config.binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        for binary in &config.linux_binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        if let Ok(home) = std::env::var("HOME") {
            for app_name in &config.macos_app_names {
                let user_app_path = format!("{}/Applications/{}", home, app_name);
                let path = PathBuf::from(&user_app_path);
                if path.exists() {
                    return (true, Some(user_app_path));
                }
            }
        }

        for app_name in &config.macos_app_names {
            let app_path = format!("/Applications/{}", app_name);
            let path = PathBuf::from(&app_path);
            if path.exists() {
                return (true, Some(app_path));
            }
        }

        (false, None)
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    fn check_linux(&self, config: &super::IdeConfig) -> (bool, Option<String>) {
        for binary in &config.binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        for binary in &config.linux_binary_names {
            if let Ok(path) = which::which(binary) {
                return (true, Some(path.to_string_lossy().to_string()));
            }
        }

        let home = std::env::var("HOME").unwrap_or_default();
        let desktop_files_paths = [
            "/usr/share/applications",
            "/usr/local/share/applications",
            &format!("{}/.local/share/applications", home),
        ];

        for apps_path in &desktop_files_paths {
            let path = PathBuf::from(apps_path);
            if !path.exists() {
                continue;
            }

            if let Ok(entries) = std::fs::read_dir(&path) {
                for entry in entries.flatten() {
                    let file_name = entry.file_name().to_string_lossy().to_lowercase();

                    let name_lower = config.name.to_lowercase().replace(' ', "-");
                    if file_name.contains(&name_lower) {
                        return (
                            true,
                            Some(format!(
                                "{}/{}",
                                apps_path,
                                entry.file_name().to_string_lossy()
                            )),
                        );
                    }
                }
            }
        }

        (false, None)
    }
}

impl Clone for IdeDetector {
    fn clone(&self) -> Self {
        Self {
            cache: self.cache.clone(),
        }
    }
}

impl Default for IdeDetector {
    fn default() -> Self {
        Self::new()
    }
}
