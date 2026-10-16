# 贡献指南

**简体中文** | [English](CONTRIBUTING.md) | [日本語](CONTRIBUTING.ja.md)

欢迎补充自己领域的术语、翻译、动态示例，或更正现有内容。术语应使用行业通行名称；保留常用英文名，不要生造直译名称。不确定的术语请在 PR 中标注并说明来源。

可使用 WorkBuddy、豆包、Codex、Claude Code 等 AI 助手协助补充术语、翻译和实现。

## 补充翻译

编辑 `packs/<pack>/meta.json` 中的语言对象。英文 `en` 为必填字段；本站支持 `zh-CN`、`en`、`ja`，其他语言可用于生成术语文档。

为素材包的 `title`、每个分类，以及每个素材的 `name`、`meaning`、`ask`、`summary`、`spec`、`use` 添加相应语言。`spec` 是字符串数组，其他字段是字符串。技术标识、编号、时长、尺寸、公式和缓动函数名必须与实现保持一致。标签保留英文，中文搜索会匹配名称、含义、摘要和分类。

```sh
node tools/build.mjs --check
node tools/build.mjs
```

请同时提交源文件和构建生成的文件。不要直接编辑 `assets/catalog.js`、`api/v1/` 或素材包 README。

## 添加素材包

先用[制作指南](make-your-own/README.zh-CN.md)确定术语并制作示例，再按 [FORMAT.md](FORMAT.md) 的契约提供 `meta.json` 和 `pack.js`。每个动画是仅由时间决定的函数，不能依赖随机状态或实际时钟。新包追加在顺序末尾，避免改变现有全局编号。

运行构建并在浏览器中逐项检查：预览正常、文本完整、无缺字、规格与代码一致。如果安装了 Playwright，可用 `node tools/check.mjs` 检查绘制。

## 推荐或移除案例

`examples/found.json` 只保存帖子 ID、作者、链接、主题、本站撰写的三语介绍、帖子原始语言和添加日期。请勿复制第三方帖子的正文、图片或视频；页面通过官方嵌入展示帖子。

推荐案例、申请删除或更正，请使用仓库的 [GitHub Issue 表单](https://github.com/liunnn1994/motion-prompt/issues/new/choose)。
