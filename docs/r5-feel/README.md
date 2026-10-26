# Round 5, lane F: game feel and a living world (26 Oct 2026)

Branch `graphics/r5-feel-environment`, cut from `origin/main` at 042c78c (round 4 merged). Details of what changed are in `DESIGN.md` under "r5 lane F".
Colour grade and overall brightness are unchanged, because the moody regions from round 4 are still waiting on Jensen. The game's name is unchanged.

## Shots
`before-*` is origin/main, served from a separate worktree on :9153. `after-*` is this branch, served on :9152. `desk` is Playwright Chromium at 1280x800 (SwiftShader GL, effects forced full). `iphone` is Playwright WebKit with the iPhone 13 profile at 390x844 (DPR 3, touch).
- Stills: `*-meadow.jpg` (Python Basics, Valley of Values town), `*-desert.jpg` (Function Forge town), `*-tundra.jpg` (AI Foundations, Attention Peaks town) and `*-world.jpg` (Python world map).
- Frame strips (left to right):
  - `*-ambient-strip.jpg`: 6 frames, 180 ms apart, around the hero.
  - `*-step-strip.jpg`: 6 frames, 55 ms apart, from one keypress step.
  - `*-prompt-strip.jpg`: hero next to the chest, 4 frames, 200 ms apart.
  - `*-chest-strip.jpg`: a real chest open, 6 frames, 70 ms apart (hit-stop, nudge, beam).
  - `*-answer-correct-strip.jpg` and `*-answer-wrong-strip.jpg`: a real trial in Valley of Values, 5 frames, 90 ms apart.
- `shoot.py` produces all of these. `before-probe.json` and `after-probe.json` record no page errors in either engine.

## Quiet modes
`quiet.py` and `quiet.json` cover Low effects and `prefers-reduced-motion`: there were no page errors, no dust after a step, `LQFeel.kick()` held nothing, and the nudge offset stayed 0.

## Performance (`perf.py`, `perf.json`)
The test interleaves main and this branch scene by scene, 2 rounds each. Each round times 50 back-to-back `draw()` calls with Chromium headless. "2D" means the GL pass was stubbed. Phone is 390x844 at DPR 3 with 4x CPU throttle. The box was heavily loaded (load average 12 to 35), so read the medians.

| scene | main 2D median | r5 2D median | of which LQFeel | phone main | phone r5 | phone LQFeel |
|---|---|---|---|---|---|---|
| meadow town | 1.95 ms | 2.2 ms | 0.3 ms | 10.7 ms | 10.45 ms | 0.8 ms |
| desert town | 3.0 | 2.05 | 0.2 | 8.0 | 11.9 | 0.85 |
| tundra town | 1.75 | 1.95 | 0.3 | 6.45 | 7.75 | 0.8 |
| world map | 0.3 | 0.5 | 0.2 | 1.4 | 2.05 | 0.45 |

The new code costs about 0.2 to 0.3 ms per frame on desktop. On the throttled phone it costs about 0.5 to 0.9 ms, against a 16.7 ms budget. The other differences are within the noise from the box's load.
Caveat: the back-to-back loop shows a periodic canvas flush of about 160 to 200 ms, once every 20 to 33 draws. It shows up on main as well (every 33 draws, about 163 ms, checked separately), and it still shows on this branch with any one feel pass removed. It appears because the loop draws without presenting. On this branch it comes every 20 to 22 draws, because there are more draw commands, so the desktop meadow and tundra p95 in `perf.json` lands on a flush. Frame time on a real phone was not measured.

## Not verified
Real iPhone Safari, sound on a real device (headless has no audio device), and a real GPU.
