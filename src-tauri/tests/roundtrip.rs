use std::fs;
use std::path::PathBuf;
use tempfile::TempDir;

/// Test: encode a text file → PNG, then decode PNG → original file, verify MD5 match
#[test]
fn test_encode_decode_roundtrip_text() {
    let tmp = TempDir::new().unwrap();
    let input_path = tmp.path().join("测试文件.txt");
    let output_dir = tmp.path().join("output");
    fs::create_dir_all(&output_dir).unwrap();

    // Write test content with Chinese characters
    let content = "Hello File2PNG! 这是一个测试文件，包含中文内容。你好世界！";
    fs::write(&input_path, content.as_bytes()).unwrap();

    // Encode
    let png_path = file2png_lib::encode_file_direct(
        input_path.to_string_lossy().to_string(),
        Some(output_dir.to_string_lossy().to_string()),
        None,
    )
    .unwrap();

    // Verify PNG was created
    assert!(PathBuf::from(&png_path).exists(), "PNG file should exist");
    let png_meta = fs::metadata(&png_path).unwrap();
    assert!(png_meta.len() > content.len() as u64, "PNG should be larger than raw data");

    // Decode
    let decode_dir = tmp.path().join("decoded");
    fs::create_dir_all(&decode_dir).unwrap();
    let decoded_path = file2png_lib::decode_file_direct(
        png_path,
        Some(decode_dir.to_string_lossy().to_string()),
    )
    .unwrap();

    // Verify content matches
    let decoded_content = fs::read(&decoded_path).unwrap();
    assert_eq!(
        decoded_content,
        content.as_bytes(),
        "Decoded content should match original"
    );
    assert_eq!(
        PathBuf::from(&decoded_path)
            .file_name()
            .unwrap()
            .to_string_lossy(),
        "测试文件.txt",
        "Filename should be preserved"
    );
}

/// Test: encode binary data → PNG → decode
#[test]
fn test_encode_decode_roundtrip_binary() {
    let tmp = TempDir::new().unwrap();
    let input_path = tmp.path().join("binary_test.dat");
    let output_dir = tmp.path().join("output");
    fs::create_dir_all(&output_dir).unwrap();

    // Generate 100KB of pseudo-random data
    let data: Vec<u8> = (0..102400).map(|i| (i * 7 + 13) as u8).collect();
    fs::write(&input_path, &data).unwrap();

    // Encode
    let png_path = file2png_lib::encode_file_direct(
        input_path.to_string_lossy().to_string(),
        Some(output_dir.to_string_lossy().to_string()),
        None,
    )
    .unwrap();

    // Decode
    let decode_dir = tmp.path().join("decoded");
    fs::create_dir_all(&decode_dir).unwrap();
    let decoded_path = file2png_lib::decode_file_direct(
        png_path,
        Some(decode_dir.to_string_lossy().to_string()),
    )
    .unwrap();

    // Verify
    let decoded = fs::read(&decoded_path).unwrap();
    assert_eq!(decoded, data, "Binary roundtrip should be lossless");
}

/// Test: decoding a non-encoded PNG should fail
#[test]
fn test_decode_invalid_image() {
    let tmp = TempDir::new().unwrap();
    let fake_png = tmp.path().join("fake.png");

    // Create a tiny valid PNG that is NOT an encoded file
    let img = image::RgbImage::from_pixel(10, 10, image::Rgb([255, 0, 0]));
    img.save_with_format(&fake_png, image::ImageFormat::Png).unwrap();

    let result = file2png_lib::decode_file_direct(
        fake_png.to_string_lossy().to_string(),
        None,
    );
    assert!(result.is_err(), "Decoding a non-encoded PNG should fail");
}
