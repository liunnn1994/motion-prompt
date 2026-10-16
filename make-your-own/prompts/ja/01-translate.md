# プロンプト1: 別の言語版を作る

このリポジトリを読めるコーディングAI（WorkBuddy、豆包、Codex、Claude Code、Cursor など）に貼って使います。`<言語>` と `<lang>` を書き換えてください（例: `スペイン語` と `es`）。

```
このリポジトリの make-your-own/README.ja.md と make-your-own/examples/camera-moves/en/index.html を読んでください。

目的: カメラワークの動画3本の <言語> 版を作る。

1. make-your-own/examples/camera-moves/en/index.html を
   make-your-own/examples/camera-moves/<lang>/index.html にコピーする。
2. 画面に出る文字だけを訳す。
   - PAGES（ページの見出し）と ITEMS（名前と一言説明）
   - drawPage() の中の見出し
   - カードの中の小さなラベル（"Quiet" "LOUD" "Audio" "Video" で検索）
   "REC" "24mm" "1.7m/s" などの計器風の表示は訳さない。
3. レイアウト、色、動きの時間、CELLS の描画コードは変えない。
4. 24個の名前は、<言語> の映像業界で実際に使われている呼び方にする。1つずつ確かめる
   （Web検索ができるなら調べる）。"Dolly zoom" や "J-cut" のように英語のまま使う言語も多い。
   その場合は英語のままにする。直訳の造語は作らない。自信のない名前は一覧にして報告する。
5. <言語> に別のフォントが必要なら（漢字圏、アラビア文字、タイ文字など）、フォントの定数
   （JP / EN / MONO）をこのパソコンに入っているフォントに変え、何を使ったか報告する。
   右から左へ書く言語の場合は、レイアウトを変える前に相談する。
6. 文字が収まるか確かめる。名前はカードの幅（539px）の中に1行で収める。長すぎるときは、
   まず短い呼び方がないか調べる。文字を小さくするのは最後の手段で、そのときは24個すべてそろえる。
7. 書き出して確かめる。
     cd make-your-own && node render.mjs examples/camera-moves/<lang>/index.html --all --sheet
   out/ にできたコマ一覧3枚を自分で開いて見る。文字の切れ、重なり、表示できない文字（□）がないこと。
8. 報告: 24個の名前の対応表（英語 → <言語>）、自信のなかった名前、使ったフォント。
```

モーショングラフィックスの見本（`make-your-own/examples/motion-graphics/ja/index.html`・日本語）も同じ手順で訳せます。画面に出る文字は `SERIES`、`PAGES`、`ITEMS` と、カードの中の見本の言葉です。

訳した名前を `packs/` の一覧にも足すときは、[CONTRIBUTING.ja.md](../../../CONTRIBUTING.ja.md) を読んでください。
