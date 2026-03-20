// ==========================================
// Export Commands for Drive Cleaner
// ==========================================

use std::fs::File;

use crate::types::DuplicateGroup;
use tracing::info;

#[tauri::command]
pub fn export_duplicates(
    groups: Vec<DuplicateGroup>,
    format: String,
    output_path: String,
) -> Result<(), String> {
    match format.as_str() {
        "json" => {
            let content = serde_json::to_string_pretty(&groups)
                .map_err(|e| e.to_string())?;
            std::fs::write(&output_path, content).map_err(|e| e.to_string())?;
        }
        "csv" => {
            let mut wtr = csv::Writer::from_writer(
                File::create(&output_path).map_err(|e| e.to_string())?,
            );
            wtr.write_record(["hash", "size", "path"])
                .map_err(|e| e.to_string())?;
            for group in &groups {
                for path in &group.paths {
                    wtr.write_record([&group.hash, &group.size.to_string(), path])
                        .map_err(|e| e.to_string())?;
                }
            }
            wtr.flush().map_err(|e| e.to_string())?;
        }
        _ => return Err(format!("Unknown format: {format}")),
    }
    info!("Exported {} groups to {output_path}", groups.len());
    Ok(())
}
