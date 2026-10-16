# 提示词 1：制作其他语言版本

将以下提示词交给能读取仓库的编程 AI。替换 `<语言>` 和 `<lang>`，例如简体中文和 `zh-CN`。

```text
阅读 make-your-own/README.zh-CN.md 和 make-your-own/examples/camera-moves/en/index.html。

目标：将三页镜头术语视频翻译为<语言>，输出至 make-your-own/examples/camera-moves/<lang>/index.html。

1. 从英文版复制 HTML，仅修改屏幕上的文字：PAGES、ITEMS、drawPage() 标题以及卡片内的文字标签。REC、24mm、1.7m/s 等技术读数保持原样。
2. 术语优先参考 packs/camera/meta.json 的对应语言，并保留英文作为对照。使用行业常用名称，对不确定的名称说明来源，不要生造直译。
3. 保持布局、颜色、时序和 CELLS 绘图逻辑。若需 CJK 字体，选择本机已安装字体并报告名称。
4. 名称在卡片内保持单行，检查每条文字的宽度；不应裁切、重叠或缺字。
5. 渲染并检查三页联系表：
   cd make-your-own
   node render.mjs examples/camera-moves/<lang>/index.html --all --sheet
6. 报告中英术语对照、不确定项、字体及输出文件位置。
```

动态图形示例也可按此流程翻译，源文件是 `examples/motion-graphics/ja/index.html`，文字位于 `SERIES`、`PAGES`、`ITEMS` 和部分卡片中。向素材库添加翻译请参阅[贡献指南](../../../CONTRIBUTING.zh-CN.md)。
