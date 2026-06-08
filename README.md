# File2PNG

将任意文件编码为 PNG 图片，并能从 PNG 图片无损还原原始文件。

## 功能

- **文件 → 图片**：将任意类型的文件（文档、压缩包、二进制文件等）编码为 PNG 图片
- **图片 → 文件**：从编码后的 PNG 图片中无损还原原始文件
- **数据校验**：通过 MD5 校验确保数据完整性
- **自动更新**：应用启动后自动检查新版本，一键升级
- **独立列表**：编码和解码模式各自维护独立的文件列表

## 原理

```
原始文件 → [文件名 + 文件大小 + MD5 + 文件数据] → RGB 像素 (每像素 3 字节) → PNG 图片
```

编码时将文件数据按每 3 字节映射为一个 RGB 像素，自动计算 16:9 比例的分辨率，生成标准 PNG 图片。解码时逆向操作，并通过 MD5 校验数据完整性。

## 编码格式规范

即使 File2PNG 程序不可用，只要按照以下格式规范，可以用任何编程语言手动还原文件。

### 整体结构

编码后的 PNG 图片，像素按行优先（从左到右，从上到下）读取 RGB 值，按顺序拼接得到原始字节流：

```
┌──────────────────────────────────────────────┐
│ Magic(4B) │ 文件名长度(2B) │ 文件名(NB) │ 文件大小(8B) │ MD5(16B) │ 文件数据(...) │
└──────────────────────────────────────────────┘
 ←———————— 头部（Header）————————→  ←——— 数据 ———→
```

### 字段说明

| 字段 | 偏移 | 长度 | 类型 | 说明 |
|------|------|------|------|------|
| Magic | 0 | 4 字节 | `[u8; 4]` | 固定值 `F2P\x01`（十六进制 `46 32 50 01`），用于识别文件格式 |
| 文件名长度 | 4 | 2 字节 | `u16 BE` | 文件名的字节数（大端序） |
| 文件名 | 6 | N 字节 | UTF-8 | 原始文件名，UTF-8 编码 |
| 文件大小 | 6+N | 8 字节 | `u64 BE` | 原始文件的字节数（大端序） |
| MD5 | 14+N | 16 字节 | `[u8; 16]` | 原始文件的 MD5 校验值 |
| 文件数据 | 30+N | M 字节 | `[u8]` | 原始文件的完整二进制数据 |

### 像素映射规则

- 图片格式：PNG，色彩模式 RGB（无 Alpha 通道），每通道 8 位
- 每 1 个像素存储 3 字节数据（R=字节1, G=字节2, B=字节3）
- 像素按行优先顺序读取：第一行从左到右，然后第二行，依此类推
- 图片分辨率按 16:9 比例计算，宽度 = √(总像素数 × 9/16) 向上取整
- 最后一个像素可能包含填充字节（全零），通过「文件大小」字段截取有效数据

### 头部大小计算

```
头部总字节数 = 4 + 2 + 文件名字节数 + 8 + 16
```

例如文件名为 `test.txt`（8 字节 UTF-8）：
```
头部大小 = 4 + 2 + 8 + 8 + 16 = 38 字节 = 13 个像素（38÷3 向上取整）
```

### 手动解码步骤（伪代码）

```python
from PIL import Image
import hashlib

def decode(png_path, output_dir):
    img = Image.open(png_path).convert("RGB")
    pixels = list(img.getdata())

    # 1. 像素 → 字节流
    raw = bytearray()
    for r, g, b in pixels:
        raw.extend([r, g, b])

    # 2. 校验 Magic
    assert raw[0:4] == b"F2P\x01", "不是 File2PNG 编码的图片"

    # 3. 读取文件名
    name_len = int.from_bytes(raw[4:6], "big")
    filename = raw[6:6+name_len].decode("utf-8")

    # 4. 读取文件大小
    pos = 6 + name_len
    file_size = int.from_bytes(raw[pos:pos+8], "big")

    # 5. 读取 MD5
    pos += 8
    md5_expected = raw[pos:pos+16]

    # 6. 提取文件数据
    pos += 16
    file_data = bytes(raw[pos:pos+file_size])

    # 7. 校验 MD5
    md5_actual = hashlib.md5(file_data).digest()
    assert md5_actual == bytes(md5_expected), "MD5 校验失败，数据可能损坏"

    # 8. 写出文件
    with open(f"{output_dir}/{filename}", "wb") as f:
        f.write(file_data)

    print(f"还原成功: {filename} ({file_size} 字节)")
```

### 示例：编码 `hello.txt`（内容 `Hello`）

```
文件数据: "Hello" = 48 65 6C 6C 6F

编码后字节流:
  46 32 50 01          # Magic: "F2P\x01"
  00 09                # 文件名长度: 9
  68 65 6C 6C 6F 2E 74 78 74  # 文件名: "hello.txt"
  00 00 00 00 00 00 00 05     # 文件大小: 5 (u64 BE)
  8B 1A 99 53 45 4C 81 50 41 51 58 3B 4E 8D 1E 51  # MD5
  48 65 6C 6C 6F       # 文件数据: "Hello"

头部大小 = 4+2+9+8+16 = 39 字节
总字节数 = 39+5 = 44 字节 → 15 个像素（44÷3 向上取整）
图片分辨率 ≈ 5×3（16:9 比例）
```

## 截图

![](src-tauri/icons/128x128.png)

## 安装

从 [Releases](https://github.com/mkktop/all_switch/releases/latest) 下载最新版 MSI 安装包，双击安装即可。

安装时选择目录会自动追加 `File2PNG` 子文件夹（例如选择 `D:\Software`，实际安装到 `D:\Software\File2PNG`）。

## 使用

1. **编码**：选择「文件 → 图片」模式，添加文件，点击「开始转换」
2. **解码**：选择「图片 → 文件」模式，添加 PNG 图片，点击「开始转换」
3. 可选指定输出目录，不指定则输出到源文件所在目录

## 开发

### 环境要求

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/) v2

### 本地运行

```bash
# 安装前端依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产包
pnpm build
```

### 发布新版本

1. 更新以下文件中的版本号：
   - `src-tauri/tauri.conf.json` → `version`
   - `package.json` → `version`
   - `src-tauri/Cargo.toml` → `version`

2. 提交并打 tag：

```bash
git add -A && git commit -m "release: v0.1.2"
git tag v0.1.2
git push origin main --tags
```

3. GitHub Actions 自动构建 MSI + 签名 + 生成 `latest.json` 并发布 Release

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 7 + Tailwind CSS 3 |
| 后端 | Rust + Tauri 2 |
| 编码 | image (PNG) + md-5 (MD5) |
| 打包 | WiX (MSI) |
| CI/CD | GitHub Actions |

## License

[MIT](LICENSE)
