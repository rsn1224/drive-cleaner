// ==========================================
// Main Library for Drive Cleaner
// ==========================================

mod commands;
mod error;
mod state;
mod types;

use state::ScanState;

pub fn run() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(ScanState::default())
        .invoke_handler(tauri::generate_handler![
            commands::get_directory_contents,
            commands::delete_item,
            commands::bulk_delete,
            commands::find_duplicates,
            commands::export_duplicates,
            commands::find_large_files,
            commands::find_empty_folders,
            commands::delete_empty_folders,
            commands::find_old_files,
            commands::analyze_file_types,
            commands::analyze_disk_usage,
            commands::scan_temp_files,
            commands::clean_temp_files,
            commands::get_file_preview,
            commands::cancel_scan,
            commands::get_drive_info,
            commands::get_recycle_bin_info,
            commands::empty_recycle_bin,
            commands::secure_delete_item,
            commands::find_similar_images,
            commands::move_item,
            commands::rename_item,
            commands::bulk_move,
            commands::organize_by_type,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
