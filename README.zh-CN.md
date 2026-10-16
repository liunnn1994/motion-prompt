# Motion Prompt 中文版

**简体中文** | [English](README.md) | [日本語](README.ja.md)

与 AI 沟通创意的术语库：收录 120 个动态图形、镜头运动、UI 组件、落地页效果和摄影术语。每个术语配有动态示例、含义、示例请求、详细规格和参考代码。

[打开素材库](https://motion-prompt.2077tech.com/) · [精选案例](https://motion-prompt.2077tech.com/found.html) · [全部术语](packs/README.md)

网站默认使用简体中文，右上角的下拉框可切换为 English 或日本語。语言选择会保存在当前浏览器中，也可以通过 `?lang=zh-CN`、`?lang=en` 或 `?lang=ja` 指定。中文与英文界面使用中英对照名称，日语界面使用日英对照。

| 编号 | 素材包 | 中文术语列表 |
|---|---|---|
| 001–024 | `motion` 动态图形 | [查看](packs/motion/README.zh-CN.md) |
| 025–048 | `camera` 镜头运动与转场 | [查看](packs/camera/README.zh-CN.md) |
| 049–072 | `ui` UI 组件 | [查看](packs/ui/README.zh-CN.md) |
| 073–096 | `lp` 落地页与网页效果 | [查看](packs/lp/README.zh-CN.md) |
| 097–120 | `photo` 摄影效果、光线与风格 | [查看](packs/photo/README.zh-CN.md) |

本中文版由 [liunnn1994](https://github.com/liunnn1994) 独立维护，基于 [Shohei Ohtaki 的原版 Motion Prompt](https://github.com/showheyohtaki/motion-prompt)，保留原作者署名和 MIT 许可证。

## 使用方法

从中文版仓库安装技能：

```sh
npx skills add liunnn1994/motion-prompt
```

向 AI 说“打开 motion-prompt 素材库”，浏览并选择素材，可添加备注，再点击“发送给 AI”。该按钮仅在 AI 通过技能打开素材库并等待接收时出现。

没有安装技能时，可在详情中复制单个素材的提示词，或使用“复制已选素材”生成包含示例和规格链接的文字。已知编号时，可以直接说“使用 motion-prompt 的 #012 和 #045”。

如果已安装原版，请用上述命令将同名 `motion-prompt` 技能替换为本仓库版本。原版安装命令不会获取这里的中文修改。

技能仅安装自身文件时，默认依次读取中文版网站和本仓库 `main` 分支的 API；从完整本地仓库运行时，优先读取本地 `api/v1`。

## 本地命令行

在此仓库中运行：

```sh
node skills/motion-prompt/scripts/motion-prompt.mjs list --pack camera
node skills/motion-prompt/scripts/motion-prompt.mjs search 推镜头
node skills/motion-prompt/scripts/motion-prompt.mjs get 025 --lang zh-CN
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 001 --lang en
node skills/motion-prompt/scripts/motion-prompt.mjs pick --local --lang zh-CN
```

默认语言为 `zh-CN`，另支持 `en` 和 `ja`。`get` 获取规格与代码，`prompt` 获取可复制提示词，`kit` 获取素材包共享辅助代码。命令详情见[技能说明](skills/motion-prompt/SKILL.md)。

## 数据与构建

源文件是 `packs/<pack>/meta.json` 和 `pack.js`。修改源文件后运行：

```sh
node tools/build.mjs --check
node tools/build.mjs
```

构建生成三种语言的 `api/v1/<lang>/catalog.tsv`、`e/<id>.txt`、`p/<id>.txt`、网页目录和素材包术语文档。不要直接修改生成文件。示例使用 Canvas 2D，画面仅由时间决定，可逐帧渲染；摄影示例用来说明视觉效果，不代表真实照片处理算法。

## 创作缘由

作者分享动态图形和镜头术语视频后，发现许多人需要的正是这些效果的名称。这个项目将术语与示例放在一起，让人们更容易与 AI 沟通，也方便为自己的领域、语言和风格制作同类素材库。

[制作自己的素材库](make-your-own/README.zh-CN.md) · [贡献指南](CONTRIBUTING.zh-CN.md) · [数据格式](FORMAT.md)

代码及本站原创内容采用 [MIT 许可证](LICENSE)。精选案例的帖子及其内容权利归各作者所有。历史视频、图片和第三方帖子保留原始语言；中文示例页面可按制作指南自行生成。
