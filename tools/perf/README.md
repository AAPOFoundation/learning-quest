# WebKit / phone checks (round 6)

Playwright WebKit with the iPhone 13 profile (390x844), serving the repo root with `python3 -m http.server 9161 --bind 127.0.0.1`.
`root` is `''` for the checkout being served, or a sub-folder holding another checkout (for before/after).

- `repro.py <root>`: enters each world's map and first town and reports page crashes.
- `measure.py <root> <outdir> <tag>`: screenshots plus canvas memory, frame times and the adaptive tier per scene.
- `tour.py <root> <tag>`: canvas memory while walking through every town in one session.
- `bench.py`: CPU cost of one world draw, before vs after at top and bottom tier.
- `ready.py`: time until the world has booted.

**Linux WebKit needs GStreamer's `autoaudiosink` (Debian/Ubuntu: `gstreamer1.0-plugins-good`).** Without it, any audio or
video playback kills the page: "GStreamer element autoaudiosink not found", then a GLib assertion and a crashed tab.
That was the round 5 "AI Evals / Portfolio Guide crash": they are the only worlds with narration audio and intro videos.
