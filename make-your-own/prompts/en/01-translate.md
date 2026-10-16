# Prompt 1: make a version in another language

Use this with a coding AI (WorkBuddy, Doubao (豆包), Codex, Claude Code, Cursor, and so on) that can read this repository. Replace `<LANGUAGE>` and `<lang>` (for example `Spanish` and `es`).

```
Read make-your-own/README.md and make-your-own/examples/camera-moves/en/index.html in this repository.

Goal: make a <LANGUAGE> version of the three camera-move videos.

1. Copy make-your-own/examples/camera-moves/en/index.html to
   make-your-own/examples/camera-moves/<lang>/index.html.
2. Translate only the text that appears on screen:
   - PAGES (page titles) and ITEMS (name + one-line description)
   - the heading text in drawPage()
   - the small labels inside cards (search for "Quiet", "LOUD", "Audio", "Video")
   Do not translate the HUD readouts such as "REC", "24mm", "1.7m/s".
3. Do not change layout, colors, timing, or any drawing code in CELLS.
4. For each of the 24 names, use the term that people in the <LANGUAGE> film and video
   industry really use. Check each one (search the web if you can). Many languages keep
   the English term for some of these, for example "Dolly zoom" or "J-cut". In that case
   keep it in English. Do not invent a literal translation. List any name you are not sure about.
5. If <LANGUAGE> needs another font (CJK, Arabic, Thai, ...), change the font constants
   (JP / EN / MONO) to a font installed on this machine and tell me which one you used.
   If the text is right-to-left, tell me before changing the layout.
6. Check that the text fits. A name must stay on one line inside its card (card width is
   539px). If one is too long, pick a shorter accepted term first; lower the font size only
   as a last resort, and then for all 24 names together.
7. Render and check:
     cd make-your-own && node render.mjs examples/camera-moves/<lang>/index.html --all --sheet
   Open the three contact sheets in out/ and look at them yourself: no cut-off text,
   no overlap, no missing glyphs (empty boxes).
8. Report: the 24 names as a table (English -> <LANGUAGE>), the ones you were unsure
   about, and the font you used.
```

The same steps work for the motion-graphics example (`make-your-own/examples/motion-graphics/ja/index.html`, Japanese): its on-screen text is in `SERIES`, `PAGES` and `ITEMS`, plus a few sample words inside the cards.

To add the translated names to the lists in `packs/` as well, see [CONTRIBUTING.md](../../../CONTRIBUTING.md).
