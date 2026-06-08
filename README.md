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
