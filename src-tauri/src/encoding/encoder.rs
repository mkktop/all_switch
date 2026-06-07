use std::path::{Path, PathBuf};

use image::{ImageFormat, RgbImage};
use md5::{Digest, Md5};

use super::header::Header;

/// Calculate image resolution for a given number of data bytes.
/// Uses 16:9 aspect ratio, each pixel stores 3 bytes (RGB).
fn calculate_resolution(total_bytes: usize) -> (u32, u32) {
    let total_pixels = (total_bytes + 2) / 3; // ceil division
    let width = ((total_pixels as f64 * 9.0 / 16.0).sqrt().ceil()) as u32;
    let height = (total_pixels as u32 + width - 1) / width; // ceil division
    (width.max(1), height.max(1))
}

/// Encode a file into a PNG image.
/// Returns the path to the generated PNG.
pub fn encode_file(input_path: &str, output_dir: Option<&str>) -> anyhow::Result<String> {
    let input = Path::new(input_path);
    if !input.exists() {
        anyhow::bail!("文件不存在: {}", input_path);
    }

    let file_data = std::fs::read(input)?;
    let file_size = file_data.len() as u64;
    let filename = input
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".to_string());

    // Compute MD5
    let mut hasher = Md5::new();
    hasher.update(&file_data);
    let md5: [u8; 16] = hasher.finalize().into();

    // Build header
    let header = Header {
        filename,
        file_size,
        md5,
    };
    let header_bytes = header.to_bytes();

    // Combine header + file data
    let mut all_bytes = Vec::with_capacity(header_bytes.len() + file_data.len());
    all_bytes.extend_from_slice(&header_bytes);
    all_bytes.extend_from_slice(&file_data);

    // Calculate resolution
    let (width, height) = calculate_resolution(all_bytes.len());

    // Ensure we have enough pixels
    let total_capacity = (width * height) as usize * 3;
    assert!(
        total_capacity >= all_bytes.len(),
        "分辨率计算错误: 需要 {} 字节，但只有 {} 字节空间",
        all_bytes.len(),
        total_capacity
    );

    // Create pixel buffer
    let mut pixel_data = vec![0u8; total_capacity];
    pixel_data[..all_bytes.len()].copy_from_slice(&all_bytes);

    // Create image
    let img = RgbImage::from_raw(width, height, pixel_data)
        .ok_or_else(|| anyhow::anyhow!("无法创建图片"))?;

    // Determine output path
    let out_dir = match output_dir {
        Some(dir) => PathBuf::from(dir),
        None => input.parent().unwrap_or(Path::new(".")).to_path_buf(),
    };
    std::fs::create_dir_all(&out_dir)?;

    let output_name = format!(
        "{}.png",
        input.file_stem().unwrap_or_default().to_string_lossy()
    );
    let output_path = out_dir.join(&output_name);

    // Save as PNG
    img.save_with_format(&output_path, ImageFormat::Png)?;

    Ok(output_path.to_string_lossy().to_string())
}

/// Decode a PNG image back to the original file.
/// Returns the path to the restored file.
pub fn decode_file(input_path: &str, output_dir: Option<&str>) -> anyhow::Result<String> {
    let input = Path::new(input_path);
    if !input.exists() {
        anyhow::bail!("文件不存在: {}", input_path);
    }

    // Open PNG and read pixels
    let img = image::open(input)?.to_rgb8();
    let pixel_data = img.as_raw();

    // Parse header
    let (header, data_offset) = Header::from_bytes(pixel_data)?;

    // Extract file data
    let end_offset = data_offset + header.file_size as usize;
    if pixel_data.len() < end_offset {
        anyhow::bail!(
            "图片数据不足: 需要 {} 字节，但只有 {} 字节",
            end_offset,
            pixel_data.len()
        );
    }
    let file_data = &pixel_data[data_offset..end_offset];

    // Verify MD5
    let mut hasher = Md5::new();
    hasher.update(file_data);
    let actual_md5: [u8; 16] = hasher.finalize().into();

    if actual_md5 != header.md5 {
        anyhow::bail!(
            "MD5 校验失败！文件可能在传输过程中被损坏。\n期望: {:02x?}\n实际: {:02x?}",
            header.md5,
            actual_md5
        );
    }

    // Determine output path
    let out_dir = match output_dir {
        Some(dir) => PathBuf::from(dir),
        None => input.parent().unwrap_or(Path::new(".")).to_path_buf(),
    };
    std::fs::create_dir_all(&out_dir)?;

    let output_path = out_dir.join(&header.filename);
    std::fs::write(&output_path, file_data)?;

    Ok(output_path.to_string_lossy().to_string())
}
