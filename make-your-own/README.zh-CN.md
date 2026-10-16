# 制作自己的素材库

**简体中文** | [English](README.md) | [日本語](README.ja.md)

为自己的领域和语言制作术语示例：24 个术语，分为 3 页，每页 8 张动画卡片，可导出为 3 个循环视频，并配一张速查表。

| 目标 | 提示词 |
|---|---|
| 翻译成另一种语言 | [01-translate.md](prompts/zh-CN/01-translate.md) |
| 制作自己的领域 | [02-your-own-field.md](prompts/zh-CN/02-your-own-field.md) |
| 生成中英对照速查表 | [03-cheatsheet-image.md](prompts/zh-CN/03-cheatsheet-image.md) |

历史镜头示例位于 `examples/camera-moves/en/` 和 `ja/`，动态图形示例位于 `examples/motion-graphics/ja/`。现有视频和图片保留原始语言。中文名称、含义和完整规格在[素材包列表](../packs/README.md)中可查。

把仓库交给编程 AI，再粘贴对应提示词。每张卡片都应直观展示术语的含义。风格由你选择，不必沿用已有示例。

## 预览与导出

直接在浏览器打开示例 `index.html`。`?page=2` 显示第 2 页，`?t=3.5` 显示 3.5 秒时的静帧。

导出需要 Node.js 18+、Playwright 及 PATH 中的 ffmpeg。在 `make-your-own/` 目录运行：

```sh
npm install
npx playwright install chromium
node render.mjs examples/camera-moves/en/index.html --all --sheet
```

生成 1200×1350、30fps、H.264 / yuv420p、无音频的循环视频，以及检查用的联系表。运行 `node render.mjs --help` 查看全部参数。中文版本制作好后，将命令中的 `en` 改为 `zh-CN`。

手工修改时，术语在 `PAGES`、`ITEMS` 等常量中，动画在 `CELLS` 中，颜色和字体由配置常量控制。导出前请检查每张卡片的文字、字号、对比度、首尾衔接及缺字情况。
