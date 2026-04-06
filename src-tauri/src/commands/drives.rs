// ==========================================
// Drive Info Commands for Drive Cleaner
// ==========================================

use sysinfo::Disks;
use tracing::info;

use crate::types::DriveInfo;

#[tauri::command]
pub fn get_drive_info() -> Vec<DriveInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut result: Vec<DriveInfo> = disks
        .iter()
        .filter(|disk| disk.total_space() > 0)
        .map(|disk| {
            let mount = disk.mount_point().to_string_lossy().to_string();
            let name = if cfg!(windows) {
                // Windows: "C:\\" → "C:"
                mount.trim_end_matches('\\').to_string()
            } else {
                disk.name().to_string_lossy().to_string()
            };
            let total = disk.total_space();
            let free = disk.available_space();
            DriveInfo {
                name,
                mount_point: mount,
                total,
                free,
                used: total.saturating_sub(free),
                fs_type: disk.file_system().to_string_lossy().to_string(),
            }
        })
        .collect();

    result.sort_by(|a, b| a.mount_point.cmp(&b.mount_point));
    info!("Found {} drives", result.len());
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn get_drive_info_returns_list() {
        let drives = get_drive_info();
        // システムには少なくとも1つドライブが存在するはず
        assert!(!drives.is_empty(), "Should find at least one drive");
    }

    #[test]
    fn drive_info_fields_are_consistent() {
        let drives = get_drive_info();
        for drive in &drives {
            assert!(drive.total > 0, "Total space should be positive");
            assert!(drive.used <= drive.total, "Used should not exceed total");
            assert_eq!(
                drive.used,
                drive.total.saturating_sub(drive.free),
                "used == total - free"
            );
        }
    }
}
