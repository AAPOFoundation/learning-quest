# Round 6 lane A: animation states

All shots are from this branch served locally (port 9162), effects on Full.

| File | What it shows |
|---|---|
| `pose-sheet.jpg` | Every hero state (idle, walk, run, turn, reach, kneel, read, fist pump, jump crouch/air/land), the idle-to-kneel and idle-to-pump crossfades, townsfolk and party poses, gatekeeper moods and critter idle acts (Chromium, from `sheet.html`). |
| `before-python-town-iphone13.jpg` / `after-python-town-iphone13.jpg` | First town of Python Basics, WebKit iPhone 13, main vs this branch. After: two companions follow the hero and townsfolk stroll and chat. |
| `after-python-run-iphone13.jpg` | Same town with an arrow key held: the hero is in the run state. |
| `before-safety-town-iphone13.jpg` / `after-safety-town-iphone13.jpg` | First town of AI Safety, WebKit iPhone 13. |
| `before-python-town-desktop.jpg` / `after-python-town-desktop.jpg` / `after-python-run-desktop.jpg` | Chromium 1280x800. Three companions follow on desktop. |

Checks (all on 27 Oct 2026):
- `quiet.py` → `quiet-results.json`: Chromium and WebKit, normal and reduced motion. Low effects and reduced motion ignore every pose, show no followers, keep townsfolk on their tiles and give no run speed-up. The r4 and r5 quiet checks still pass. No page errors.
- `check-full.json`: Full effects, Chromium desktop and WebKit iPhone 13, main and branch. Holding an arrow key reaches the run state, followers appear (3 desktop, 2 phone), townsfolk move, the hero returns to idle on release. No page errors or console errors on either build.
- `perf.py` → `perf-results.json` (Chromium, 2 interleaved rounds, GL pass stubbed). Median draw() ms, main vs branch: desktop 1.95/2.45, 2.15/2.45, 1.8/2.4; phone (4x CPU throttle) 4.25/3.5, 3.35/2.6, 4.0/3.0. r6 logic is under 0.04 ms a frame.

Not tested on a real iPhone or real Safari.
