# Arcanum Music

[![Linux.do](https://img.shields.io/badge/Linux.do-community-0EA5E9?logo=discourse&logoColor=white)](https://linux.do)

v1.8.0 (Kyrios Internal)

简洁美观的多平台音乐软件

支持 网易云音乐 / QQ音乐 / 酷我音乐 / 酷狗音乐

内容丰富, 官方来源, 安全保证

由 @NekoZX123 用心制作

made with TypeScript + Vue.js

*感谢 Linux.do 社区对本项目的支持*

## Linux 安装与兼容性说明

当前 Release 提供以下 Linux 安装包:

- `.deb` 安装包
- `AppImage` 便携包

### 架构

当前 Linux 安装包面向 `x64 / amd64` 架构，不支持 ARM 设备。

### Ubuntu / Debian 安装方法

```bash
sudo apt install ./arcanummusic_<version>_amd64.deb
```

例如:

```bash
sudo apt install ./arcanummusic_1.8.0_amd64.deb
```

### Linux 打包

默认 Linux 打包命令会生成 `.deb` 和 `AppImage`:

```bash
npm run electron:build
```

如果需要单独构建 `pacman` 包，请显式运行:

```bash
npm run electron:build:linux:pacman
```

`pacman` 打包依赖 `bsdtar`。在 Debian / Ubuntu / Kubuntu 上通常需要先安装:

```bash
sudo apt install libarchive-tools
```

### 如果 `.deb` 无法安装或运行

如果当前发行版上的 `.deb` 安装包存在兼容性问题，建议优先尝试同版本的 `AppImage` 安装包。

### 说明

如果您在 Ubuntu / Debian 或其他 Linux 发行版上遇到安装或运行问题，欢迎在 GitHub 提交 Issue 并附上系统版本、架构和报错信息。

## 问题修复

- 修复 QQ 音乐 API 加密脚本导致应用无法加载的问题

## 新功能

- 添加歌曲名称点击复制功能
- 更新应用图标
- 更新桌面歌词样式

## 内测版本特别提示

当前应用为内测版本, 可能存在部分问题. 当出现问题影响使用时, 可使用 Ctrl + R 刷新应用
