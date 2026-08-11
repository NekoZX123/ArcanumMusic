<div align="center">

<img width="150" height="150" src="https://github.com/NekoZX123/ArcanumMusic/blob/dev/preview/icon.png?raw=true"/>

# Arcanum Music
**美观 简约 可定制的多平台音乐软件**
<img src="https://github.com/NekoZX123/ArcanumMusic/blob/dev/preview/preview.png?raw=true"/>
</div>

---

[![GitHub Issues](https://img.shields.io/github/issues/NekoZX123/ArcanumMusic)](https://github.com/NekoZX123/ArcanumMusic/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/NekoZX123/ArcanumMusic)](https://github.com/NekoZX123/ArcanumMusic/pulls)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/NekoZX123/ArcanumMusic/.github%2Fworkflows%2Fcodeql.yml?label=CodeQL)](https://github.com/NekoZX123/ArcanumMusic/actions)
[![GitHub Release](https://img.shields.io/github/v/release/NekoZX123/ArcanumMusic)](https://github.com/NekoZX123/ArcanumMusic/releases)


![Language](https://img.shields.io/badge/language-vue-brightgreen)
[![License](https://img.shields.io/github/license/NekoZX123/ArcanumMusic)](https://github.com/NekoZX123/ArcanumMusic/blob/master/LICENSE)
[![Linux.do](https://img.shields.io/badge/Linux.do-community-0EA5E9?logo=discourse&logoColor=white)](https://linux.do)

## :arrow_forward: 应用简介

Arcanum Music - 简洁美观的多平台音乐软件

网易云音乐 / QQ 音乐 / 酷我音乐 / 酷狗音乐 四端支持

歌曲来源官方 界面轻简美观 支持自定义

由 @NekoZX123 用心制作

made with TypeScript + Electron + Vue.js

> 感谢 Linux.do 社区对本项目的支持
> 
> 感谢以下用户对本项目的贡献
> 
> ![Contributors](https://contrib.rocks/image?repo=NekoZX123/ArcanumMusic&size=50)

## :memo: 本地打包安装注意事项

当前所有安装包面向 `x64 / amd64` 架构的 Windows / Linux 系统，不支持 MacOS 及 ARM 设备
当前 Release 提供以下 Linux 安装包:

- `.deb` 安装包
- `AppImage` 便携包
- `pacman` 安装包

若需要 Release 中未包含的打包类型, 可克隆仓库自助打包

### 克隆仓库及安装依赖

```bash
git clone https://github.com/NekoZX123/ArcanumMusic.git --depth=1
npm install
```

### 修改打包配置及打包

修改仓库文件夹下的 `electron-builder.json`, 添加对应平台的配置, 之后执行

```bash
npm run electron:build
```

注: Windows 系统下可能需要以管理员权限运行此命令

运行完成后即可在对应目录下看到打包后的应用

## :construction: 关于部分 API 尚未完成的提示

我们尚未收集到以下 API

- 酷我音乐: 用户歌单, 用户收藏, 每日推荐
- 酷狗音乐: 用户歌单, 用户收藏, 每日推荐
  
若您有可用的 API 愿意提供, 或对本应用有使用问题或改进建议, 欢迎提出 Issue / PR, 我们欢迎每位贡献者的加入
