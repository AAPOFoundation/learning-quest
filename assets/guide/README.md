# Guide clips (optional)

Drop a short (about 10 s) narrated clip here as `<concept-id>.mp4` and the game shows it with play controls; with no file, nothing shows.
Optional captions: `<concept-id>.vtt` next to it.

- Region lesson (first lesson screen): `<world>-<level id>.mp4`, for example `ai-evals-l4.mp4` (Dunes of Measure) or `ai-foundations-l3.mp4` (Gradient Hills).
- Python challenge: `<challenge id>.mp4`, for example `ev-l4.mp4`. Citadel Workshop: `ai-evals-cap.mp4`, `ai-safety-cap.mp4`.

Keep each clip small (under about 1.5 MB, H.264 + AAC, 720p or less) so the game stays light.

Shipped clips (H.264/AAC MP4 with faststart, VP9/Opus WebM twin, English captions):

| Concept id | Where it shows | Explains |
|---|---|---|
| `ai-evals-l4` | AI Evaluation Skills, Dunes of Measure, first lesson screen | The four tents (true or false, flagged or missed) and the precision/recall trade-off when the bar is raised |
| `ai-foundations-l3` | AI Foundations, Gradient Hills, first lesson screen | Each step goes downhill, sized by the learning rate: too small crawls, too large leaps over the valley |
| `ai-evals-lS` | AI Evaluation Skills, Variance Fens, first lesson screen | A hundred cases still wobble by about eight points; testing both on the same cases shrinks the wobble |
| `ai-foundations-l5` | AI Foundations, Attention Peaks, first lesson screen | Softmax turns scores into shares that add up to one; temperature down sharpens, up spreads |
| `ai-safety-cp` | AI Safety, Control Keep, first lesson screen | A trusted monitor scores every output: the most suspicious go to audit, the doubtful wait, the rest pass |
