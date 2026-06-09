# CLAUDE.md — File2PNG 项目备忘

## 项目简介

File2PNG 是一个桌面工具，将任意文件编码为 PNG 图片并可以无损解码还原。基于 Tauri 2 + React 18 + TypeScript + Tailwind 3 + Rust 构建。

## 版本变更记录

### v0.2.0

- **UI 重构**：设置页改为双 Tab 布局（通用 / 关于），参照 cc-switch 设计风格
  - **通用 Tab**：输出目录、文件名后缀、保存按钮
  - **关于 Tab**：应用信息卡片、版本号、GitHub 链接、检查更新、更新日志、自动更新开关
- **新功能**：新增 `auto_update` 设置，控制启动时是否自动检查更新
- **新功能**：添加 `tauri-plugin-opener`，GitHub 链接可正常跳转浏览器
- **UI 迁移**：更新相关 UI 从标题栏和 UpdateBadge 浮窗迁移到关于 Tab
- 标题栏设置齿轮图标在有更新时显示绿点提示
- 删除 `UpdateBadge.tsx` 浮动弹窗组件
- `UpdateContext` 自动检查前读取 `auto_update` 设置

### v0.1.7

- **安全修复**：解码时 sanitize 文件名，防止路径穿越攻击（`../../etc/passwd`）
- **Bug 修复**：将 `assert!` 改为 `anyhow::bail!`，避免 release 构建中 panic 崩溃
- **UX 改进**：添加 `isProcessing` 状态锁，处理期间禁用所有操作按钮，防止重复点击
- **UX 改进**：输出文件名冲突时自动加序号后缀（如 `test (1).png`、`test (2).png`）

### v0.1.8

- **新功能**：设置页新增自定义文件名后缀，编码时追加到输出文件名（如后缀 `new`，`123.mp4` → `123new.png`）
- 新增 Rust `filename_suffix` 命令参数和 `AppSettings` 字段

### v0.1.9

- **UI 重构**：设置页改为双 Tab 布局（通用 / 关于），参照 cc-switch 设计风格
  - **通用 Tab**：输出目录、文件名后缀、自动更新开关、保存按钮
  - **关于 Tab**：应用信息卡片、版本号、GitHub 链接、检查更新、更新日志、自动更新开关
- **新功能**：新增 `auto_update` 设置，控制启动时是否自动检查更新
- **UI 迁移**：更新相关 UI 从标题栏和 UpdateBadge 浮窗迁移到关于 Tab
- 标题栏设置齿轮图标在有更新时显示绿点提示
- 删除 `UpdateBadge.tsx` 浮动弹窗组件
- `UpdateContext` 自动检查前读取 `auto_update` 设置

## 架构说明

```
前端 (React + TypeScript + Tailwind)
  App.tsx (main / settings 视图路由)
    主视图: ModeSwitch + ActionBar + FileList
    设置视图: SettingsPage (Tab 容器)
      → GeneralTab (输出目录, 后缀, 自动更新开关)
      → AboutTab (版本, GitHub, 更新检查, 更新日志)

后端 (Rust + Tauri 2)
  main.rs → lib.rs (插件初始化, 系统代理, 命令注册)
    commands/encode.rs  → encode_file
    commands/decode.rs  → decode_file
    commands/settings.rs → get_settings, save_settings
    encoding/header.rs   → 二进制头 (MAGIC + 文件名 + 大小 + MD5)
    encoding/encoder.rs  → PNG 编解码, 文件名冲突处理

CI/CD: GitHub Actions (tag → 构建 MSI + 签名 → 生成 latest.json → 发布)
```

## 注意事项

- 提交、打 tag、推送前必须征得用户同意
- 版本号需同步修改三处：`package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json`
- `Cargo.lock` 中的版本号由 cargo 自动管理，无需手动修改
- 设置存储在可执行文件同目录的 `settings.json`，`#[serde(default)]` 保证向后兼容
