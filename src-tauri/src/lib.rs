mod encoding;
mod commands;

use commands::encode::encode_file;
use commands::decode::decode_file;
use commands::settings::{get_settings, save_settings};

// Re-export for integration tests
pub use encoding::encoder::{encode_file as _encode_impl, decode_file as _decode_impl};

/// Encode a file into a PNG image. Returns the output PNG path.
pub fn encode_file_direct(path: String, output_dir: Option<String>, filename_suffix: Option<String>) -> anyhow::Result<String> {
    encoding::encoder::encode_file(&path, output_dir.as_deref(), filename_suffix.as_deref())
}

/// Decode a PNG image back to the original file. Returns the output file path.
pub fn decode_file_direct(path: String, output_dir: Option<String>) -> anyhow::Result<String> {
    encoding::encoder::decode_file(&path, output_dir.as_deref())
}

/// Read Windows system proxy settings and set HTTPS_PROXY env var
/// so the Tauri updater (reqwest) can use the system proxy.
#[cfg(target_os = "windows")]
fn init_system_proxy() {
    use std::env;

    // Only set if not already configured by the user
    if env::var("HTTPS_PROXY").is_ok() || env::var("https_proxy").is_ok() {
        return;
    }

    // Read Windows system proxy from registry
    let proxy_enabled = winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings")
        .ok()
        .and_then(|key| key.get_value::<u32, _>("ProxyEnable").ok())
        .unwrap_or(0);

    if proxy_enabled == 0 {
        return;
    }

    let proxy_server: Option<String> = winreg::RegKey::predef(winreg::enums::HKEY_CURRENT_USER)
        .open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Internet Settings")
        .ok()
        .and_then(|key| key.get_value("ProxyServer").ok());

    if let Some(server) = proxy_server {
        let proxy_url = if server.starts_with("http") {
            server
        } else {
            format!("http://{}", server)
        };
        env::set_var("HTTPS_PROXY", &proxy_url);
        env::set_var("HTTP_PROXY", &proxy_url);
    }
}

#[cfg(not(target_os = "windows"))]
fn init_system_proxy() {}

pub fn run() {
    init_system_proxy();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![encode_file, decode_file, get_settings, save_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
