# Guide clips (optional)

Drop a short (about 10 to 12 s) narrated clip here as `<concept-id>.mp4` (plus a `.webm` twin), add its id to `IDS` in `shared/guide.js`, and the game shows it with play controls; ids not in `IDS` get no slot, so nothing shows and nothing is requested.
Optional captions: `<concept-id>.vtt` next to it.

- Region lesson (first lesson screen): `<world>-<level id>.mp4`, for example `ai-evals-l4.mp4` (Dunes of Measure) or `ai-foundations-l3.mp4` (Gradient Hills).
- Python challenge: `<challenge id>.mp4`, for example `ev-l4.mp4`. Citadel Workshop: `ai-evals-cap.mp4`, `ai-safety-cap.mp4`.

Keep each clip small (under about 2 MB, H.264 + AAC, 720p or less) so the game stays light.

Shipped clips (exactly these six; `shared/guide.js` lists the same ids in `IDS`, and any other id gets no slot). Each is an H.264/AAC MP4 with faststart, a VP9/Opus WebM twin and English captions:

| Concept id | Where it shows | Length | Explains |
|---|---|---|---|
| `ai-evals-l3` | AI Evaluation Skills, Judges' Hills, first lesson screen | 10 s | Swap the two lanterns and ask again: a fair judge picks the same one, but one that always picks whichever comes first has position bias. Narrated with Piper `en_GB-northern_english_male-medium` over a soft pad |
| `ai-evals-l4` | AI Evaluation Skills, Dunes of Measure, first lesson screen | 12 s | Every item lands in one of four tents (flagged or not, truly harmful or not); raise the bar and precision usually climbs, but recall falls |
| `ai-foundations-l3` | AI Foundations, Gradient Hills, first lesson screen | 10 s | Each step goes downhill, sized by the learning rate: too small crawls, too large leaps over the valley |
| `ai-evals-lS` | AI Evaluation Skills, Variance Fens, first lesson screen | 12 s | A hundred cases still wobble by about eight points; testing both on the very same cases shrinks the wobble in the gap between them |
| `ai-foundations-l5` | AI Foundations, Attention Peaks, first lesson screen | 10 s | Softmax turns scores into shares that add up to one; temperature down sharpens, up spreads |
| `ai-safety-cp` | AI Safety, Control Keep, first lesson screen | 12 s | A trusted monitor scores every output: the most suspicious go to audit, the doubtful are swapped for the trusted model's answer, and the rest pass the gate |

To add a clip, drop the files here and add its id to `IDS` in `shared/guide.js`.
