# Prompt 2: make the names of your own field

Use this with a coding AI (WorkBuddy, Doubao (豆包), Codex, Claude Code, Cursor, and so on) that can read this repository. Replace `<FIELD>`, `<LANGUAGE>`, `<slug>` and `<lang>`.

The field does not have to be video. Examples: lighting setups, sound design and mixing terms, UI animation, chart types, typography, photography, cooking techniques, architectural details, dance steps, knitting stitches.

```
Read make-your-own/README.md, make-your-own/render.mjs and the two examples in this repository:
  make-your-own/examples/camera-moves/en/index.html      light gray, one blue, pictogram style
  make-your-own/examples/motion-graphics/ja/index.html   dark navy cards, four colors
Each shows 24 names of one field as 3 looping videos of 8 animated cards. They look different
on purpose. What they share is not a style. It is one rule: the name is the subject, and each
card shows what that name means.

Goal: make the same kind of name library for "<FIELD>" in <LANGUAGE>, in
make-your-own/examples/<slug>/<lang>/index.html.

Step 1. Choose the names, then stop and show me the list
- Pick 24 names in 3 groups of 8, each group with a short title. If this field really has
  fewer or more, say so and propose a number that fills whole pages of 8.
- Use the names that people who work in this field really use, in <LANGUAGE>. Someone must be
  able to type the name into an AI prompt or a search box and get the right thing.
- Check every name (search the web if you can) and tell me where you checked it: a textbook,
  a manual, a glossary, a trade site. Do not invent a name. Do not translate a name literally;
  if people in this field keep the English term when they speak <LANGUAGE>, keep it.
  Mark every name you are not sure about.
- Order each group from basic to advanced. Avoid two names whose samples would look the same.
- For each name write: the English name (if <LANGUAGE> is not English), a one-line meaning,
  one example sentence that asks an AI for it by name, and one sentence on what its card will show.
- Wait for my OK before writing code.

Step 2. Decide the look with me
- The look is ours to choose. Ask me whether I have colors, fonts or a reference I want to use.
  If I do not, propose two directions in one line each and let me pick.
  Do not copy the look of either example by default.
- Whatever we choose: one palette and one set of fonts across all 24 cards, and the name under
  each card stays the easiest thing on the page to read.

Step 3. Build it
These rules are what makes it a library of names. Keep them whatever the look is.
- Each card is a small animation that shows the thing itself happening, so that someone could
  tell which of the 24 names it is with the label hidden. One idea per card. Not an icon of it.
- If the field is not visual (sound, cooking, writing ...), show what changes: a waveform,
  a cross-section, a before and after, the steps in order.
- Readable on a phone. Canvas 1200x1350, 30fps, 8 cards per page, one page = one video.
  Under each card: number + name (about 36px, bold) and a smaller second line (about 22px).
  On a phone the video is shown at about one third of this size, so do not go smaller,
  and keep enough contrast between the text and its background.
- All cards on a page share one cycle length (the examples use 4.7s, played twice in 9.4s),
  so the page loops with no jump. The last frame must lead into the first frame: bring each
  card back to its start state inside the cycle (ease back or cross-fade).
- Anything that repeats on its own (a blink, a spinner) must complete a whole number of
  repeats in one page, or the loop will show a seam.
- No flashing. Do not switch large areas between light and dark quickly. Hard cuts are fine
  only when the cut itself is the subject of the card.
- Give the viewer time: hold the start state for about 0.5s, move, then hold the end state.
- Every frame must be a pure function of the frame number. No Date, no performance.now,
  no Math.random without a fixed seed, no CSS animations. Keep the contract that render.mjs
  uses: window.N_FRAMES, window.renderFrame(i), window.READY, ?page=N, ?render=1.
- Load nothing from the network. Use fonts installed on this machine and tell me which.
  Draw everything in code: no photos, logos or characters that belong to someone else.
- You may start from a copy of either example for the page frame and the render contract.
  Their drawing helpers are specific to their topic (for example the 3D camera helpers cam,
  proj, world, person). Remove what you do not use and write small helpers that fit this field.

Step 4. Check your own work before you report
- Render with a contact sheet:
    cd make-your-own && node render.mjs examples/<slug>/<lang>/index.html --all --sheet
- Open each contact sheet in out/ and look at every card. For each one ask: if the label
  were hidden, could someone tell which of the 24 names this is? Fix the ones that fail.
- Also check: no text cut off or overlapping; the first and last frame of each mp4 match;
  ffprobe shows 1200x1350, 30fps, h264, yuv420p, 9.4s.
- Report: the 24 names as a table (number, name, English name, meaning, example request,
  where you checked it), the names you are unsure about, the fonts you used, and where the
  files are.
```

When it is done and you would like to add your field to this library, see [CONTRIBUTING.md](../../../CONTRIBUTING.md).
