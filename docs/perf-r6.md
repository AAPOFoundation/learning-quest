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
