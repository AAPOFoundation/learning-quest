# Milestone celebration clips (round 5)

Short, light-hearted clips in the game's medieval world that play once per save when the learner reaches a milestone
(region cleared, first seal, final challenge passed, course complete, rank up, first three stars, every supply cache, first Python program).
The full brief for the video maker, with every milestone, scene, narration line and pun, lives outside the repo at
`/workspace/lq-milestones/BRIEF.md` on the shared work machine; `manifest.js` here is generated from the same data.

**Nothing plays yet.** Every clip in `manifest.js` has `"ship": false`, so the player (`shared/milestones.js`) never requests a file and shows nothing.

## Adding a clip
1. Put three files here, named after the clip id in `manifest.js` (for example `ms-region-meadow`):
   - `ms-region-meadow.mp4`: H.264 High, yuv420p, AAC 44.1 kHz stereo, `-movflags +faststart`, 1280x720 (16:9), about 6 s, **2 MB or less**
   - `ms-region-meadow.webm`: VP9 + Opus twin for browsers without H.264
   - `ms-region-meadow.vtt`: English captions of the spoken narration line
2. Set `"ship": true` for that clip in `manifest.js`.
3. Check it: clear the save, reach the milestone, and confirm the overlay plays, the caption shows, Skip/Esc/Enter close it, and Low effects shows the still card.

Suggested encode from a raw master (`in.mp4`):
```
ffmpeg -i in.mp4 -t 6.5 -vf "scale=1280:720:flags=lanczos,fps=30,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 26 -maxrate 2400k -bufsize 4800k -c:a aac -b:a 96k -ac 2 -ar 44100 -movflags +faststart ms-region-meadow.mp4
ffmpeg -i ms-region-meadow.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -c:a libopus -b:a 64k ms-region-meadow.webm
```
If the MP4 is over 2 MB, raise `-crf` by 2 and encode again.

## How it plays
- After the existing celebration effect (about 2.6 s), the chest reward card and any lesson screen have closed.
- Framed overlay with the milestone title, the clip (muted autoplay, "Tap for sound"), captions from the `.vtt`, and the milestone's pun line below.
  Skip (it reads Continue when the clip ends), the x, a tap outside, Esc or Enter close it; it also closes 4 s after the clip ends.
- Reduced motion or Low effects: a still card with the pun and a Play button; nothing autoplays.
- Each milestone shows at most once per save (`ms` in the course's save). A missing or broken file shows nothing and is not marked seen.
