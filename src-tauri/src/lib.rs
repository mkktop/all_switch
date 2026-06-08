mod encoding;
mod commands;

use commands::encode::encode_file;
use commands::decode::decode_file;
use commands::settings::{get_settings, save_settings};

// Re-export for integration tests
pub use encoding::encoder::{encode_file as _encode_impl, decode_file as _decode_impl};

/// Encode a file into a PNG image. Returns the output PNG path.
pub fn encode_file_direct(path: String, output_dir: Option<String>) -> anyhow::Result<String> {
    encoding::encoder::encode_file(&path, output_dir.as_deref())
}

/// Decode a PNG image back to the original file. Returns the output file path.
pub fn decode_file_direct(path: String, output_dir: Option<String>) -> anyhow::Result<String> {
    encoding::encoder::decode_file(&path, output_dir.as_deref())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![encode_file, decode_file, get_settings, save_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
