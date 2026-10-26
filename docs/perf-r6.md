# Round 6 lane P: WebKit crash and phone performance

## The "WebKit crash" in AI Evals and Portfolio Guide
Root cause: the test machine, not the game. Playwright's Linux WebKit plays media through GStreamer, and the box had no
audio sink plugin (`autoaudiosink`, in `gstreamer1.0-plugins-good`). Any `<audio>`/`<video>` play (even a 1 s WAV on a
blank page) crashed the tab. AI Evals and Portfolio Guide are the only worlds with recorded narration (mp3) and intro
cut-scenes (mp4), so their towns crashed and the other three worlds never did. With the plugin installed all 5 worlds load
(town and map); hiding the plugin brings the crash back on both old and new code. iPhone Safari uses its own media stack,
so this was never an iOS bug, but the media files are plain H.264/AAC and MP3, which iOS plays.

## Changes (no art, colour or brightness changes)
- `shared/perf.js` (new, loaded first): adaptive pixel ratio on phones (2 > 1.75 > 1.5 > 1.25 when frames are slow for 1.5 s,
  back up after 8 s smooth, stops see-sawing after 3 climbs); main canvas held under 16M px (iOS limit); towns not visited
  lately are released on phones (keeps 3); hidden tab pauses narration and cut-scenes and suspends Web Audio.
  `localStorage['learning-apps.perf']='full'|'low'` pins a tier for testing; `LQPerf.stats()` reports.
- `shared/world.js`: uses LQPerf for the pixel ratio, frame timing and town cache; fog-over-relief layer drawn at half size
  (soft blobs, looks the same, a quarter of the memory).
- `shared/art.js` (one line): building cache 24 slots on phones (48 on desktop, as before).
- `shared/narr.js`: finished narration and cut-scenes drop their media source so phones free the decoder; a stale error
  from an old line no longer clears the current one.
- All world pages and the home page: Google Fonts stylesheet no longer blocks the page (scripts were waiting on it), with
  a preconnect to the font host.

## Numbers (Playwright WebKit, iPhone 13 profile, on a shared box under heavy load; frame times are software rendering)
Crash check: before the box fix, AI Evals and Portfolio Guide towns crashed on every entry (old and new code alike);
after it, all 10 scenes (5 worlds x town + map) load with no page errors, and the AI Evals intro video plays.

| Scene | Canvas memory MB (before → after) | Largest canvas Mpx | Draw ms before | after, top tier | after, lowest tier |
|---|---|---|---|---|---|
| Python town | 54.0 → 44.1 | 2.9 | 74.5 | 101.0 | 76.5 |
| Python map | 47.5 → 36.4 | 2.9 | 70.0 | 61.5 | 38.0 |
| Foundations town | 70.2 → 55.7 | 4.4 | 97.0 | 95.0 | 50.5 |
| Foundations map | 63.7 → 55.3 | 4.4 | 89.5 | 89.0 | 36.5 |
| Safety town | 81.2 → 70.5 | 5.4 | 76.5 | 100.5 | 34.0 |
| Safety map | 74.7 → 64.0 | 5.4 | 58.5 | 60.5 | 3.0* |
| AI Evals town | 81.2 → 64.5 | 5.4 | 84.5 | 76.5 | 65.0 |
| AI Evals map | 74.7 → 64.0 | 5.4 | 72.0 | 91.5 | 38.5 |
| Portfolio town | 54.0 → 42.9 | 2.9 | 113.0 | 85.0 | 49.0 |
| Portfolio map | 47.5 → 42.5 | 2.9 | 62.5 | 62.0 | 31.5 |
| **Mean** | **64.9 → 54.0 (−17%)** | | **79.8** | **82.3 (same within noise)** | **42.3 (−47%)** |

*outlier. Draw ms = median CPU time of one full world draw, 2 interleaved runs. Main canvas: 1.04M px at the top tier, 0.41M px at the lowest.

Canvas memory after walking through every town in one session (peak MB): Python 89.5 → 66.5, Foundations 107.8 → 80.3,
Safety 118.8 → 89.0, AI Evals 121.5 → 86.3, Portfolio 92.7 → 66.6 (about −26%). Before, it grew about 6 MB per town with no cap.

Time until the world has booted (median of 3, fresh cache each): AI Evals 839 → 686 ms, Portfolio 605 → 560, Python 628 → 537,
Safety 664 → 583, Foundations 714 → 536 (about −15%). The font host on the box is slow, so the gain is larger on a slow phone network.

Hidden tab (simulated): narration paused, Web Audio suspended, both resume on return.
