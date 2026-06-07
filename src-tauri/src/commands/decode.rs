use crate::encoding::encoder;

#[tauri::command]
pub fn decode_file(path: String, output_dir: Option<String>) -> Result<String, String> {
    encoder::decode_file(&path, output_dir.as_deref()).map_err(|e| e.to_string())
}
