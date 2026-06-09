use crate::encoding::encoder;

#[tauri::command]
pub fn encode_file(path: String, output_dir: Option<String>, filename_suffix: Option<String>) -> Result<String, String> {
    encoder::encode_file(&path, output_dir.as_deref(), filename_suffix.as_deref()).map_err(|e| e.to_string())
}
