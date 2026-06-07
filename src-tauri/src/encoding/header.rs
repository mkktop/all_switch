/// Magic bytes to identify encoded images: "F2P" + version 0x01
pub const MAGIC: &[u8; 4] = b"F2P\x01";

/// Header stored in the first pixels of the encoded image.
pub struct Header {
    pub filename: String,
    pub file_size: u64,
    pub md5: [u8; 16],
}

impl Header {
    /// Serialize the header into a byte vector.
    /// Layout: MAGIC(4) + filename_len(2 BE) + filename(N) + file_size(8 BE) + md5(16)
    pub fn to_bytes(&self) -> Vec<u8> {
        let name_bytes = self.filename.as_bytes();
        let name_len = name_bytes.len() as u16;

        let mut buf = Vec::with_capacity(4 + 2 + name_bytes.len() + 8 + 16);
        buf.extend_from_slice(MAGIC);
        buf.extend_from_slice(&name_len.to_be_bytes());
        buf.extend_from_slice(name_bytes);
        buf.extend_from_slice(&self.file_size.to_be_bytes());
        buf.extend_from_slice(&self.md5);
        buf
    }

    /// Parse a header from pixel data. Returns (Header, offset_of_data_start).
    pub fn from_bytes(data: &[u8]) -> anyhow::Result<(Self, usize)> {
        if data.len() < 4 {
            anyhow::bail!("数据太短，无法解析头部");
        }
        if &data[0..4] != MAGIC {
            anyhow::bail!("无效的图片格式（缺少 Magic 标识）");
        }

        let mut pos = 4;

        // Filename length
        if data.len() < pos + 2 {
            anyhow::bail!("数据太短，无法读取文件名长度");
        }
        let name_len = u16::from_be_bytes([data[pos], data[pos + 1]]) as usize;
        pos += 2;

        // Filename
        if data.len() < pos + name_len {
            anyhow::bail!("数据太短，无法读取文件名");
        }
        let filename = String::from_utf8(data[pos..pos + name_len].to_vec())
            .map_err(|e| anyhow::anyhow!("文件名编码错误: {}", e))?;
        pos += name_len;

        // File size
        if data.len() < pos + 8 {
            anyhow::bail!("数据太短，无法读取文件大小");
        }
        let file_size = u64::from_be_bytes(
            data[pos..pos + 8].try_into().unwrap(),
        );
        pos += 8;

        // MD5
        if data.len() < pos + 16 {
            anyhow::bail!("数据太短，无法读取 MD5");
        }
        let md5: [u8; 16] = data[pos..pos + 16].try_into().unwrap();
        pos += 16;

        Ok((
            Header {
                filename,
                file_size,
                md5,
            },
            pos,
        ))
    }

    /// Total serialized size in bytes.
    pub fn size(&self) -> usize {
        4 + 2 + self.filename.as_bytes().len() + 8 + 16
    }
}
