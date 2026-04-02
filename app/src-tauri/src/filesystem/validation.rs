use anyhow::Result;
use std::path::{Component, Path, PathBuf};

#[allow(dead_code)]
fn canonicalize_path(path: &Path) -> Result<PathBuf> {
    path.canonicalize()
        .map_err(|e| anyhow::anyhow!("Failed to canonicalize path '{}': {}", path.display(), e))
}

#[allow(dead_code)]
pub fn validate_path_within_workspace(path: &str, workspace_root: &str) -> Result<()> {
    let target = canonicalize_path(Path::new(path))?;
    let root = canonicalize_path(Path::new(workspace_root))?;

    if !target.starts_with(&root) {
        return Err(anyhow::anyhow!(
            "Path '{}' is outside workspace root '{}'",
            path,
            workspace_root
        ));
    }

    Ok(())
}

pub fn validate_no_path_traversal(path: &str) -> Result<()> {
    let p = Path::new(path);
    for component in p.components() {
        if let Component::ParentDir = component {
            return Err(anyhow::anyhow!(
                "Path '{}' contains path traversal (..)",
                path
            ));
        }
    }
    Ok(())
}
