# Round 5, lane C: character depth

Scope: `shared/art.js` (figure and portrait), `shared/hero.js`, `shared/party.js`. `shared/world.js` has one line (it passes the region motif, biome and id to the gatekeeper look). `fx2.js` is untouched.

## What changed
- **Volumetric shading**: a single key light from the upper left (`Art.light`). Torso, cape, arms and head get a warm rim on the lit edge and a cool rim on the shadow edge. There's soft ambient occlusion under the head, where arms meet the torso, and under the mantle and belt. Helms, plates, boots and the staff orb get specular glints, and gems get a facet and a sparkle.
- **Device-pixel-ratio sprite cache**: badges, gems, AO blobs and the cog crest are painted once into offscreen canvases at the current quantised device scale, then blitted (`decal`, max 360 entries, cleared on `FX.set`).
- **Outfits for each course**: Python is the coders' guild (neckerchief, `{}` badge, tool belt, cuffs). AI Foundations and Evals are AI scholars (stole, neuron badge, some wear spectacles). AI Safety is the safety wardens (sash, shield-tick badge, a little lantern). Portfolio is the portfolio artisans (apron, tape measure, compass badge, pencil). Party companions are one of each.
- **Gatekeepers**: each region now has its own friendly gatekeeper with no weapon. Each one gets a crest drawn from the region motif (sprout, scroll, key, book, ladybug, balance and so on), neckwear and headwear matching the biome (garland, leaves, fur, scarf, reeds, earmuffs, brim hat, drape), and one of three builds (regular, stout, tall).
- **Hero gear by rank** (looks only, no stat effect; the tier is the best XP across courses against the rank thresholds):
  - Rank 1: plain.
  - Rank 2: trimmed hood and mantle, plus a brooch gem.
  - Rank 3: shoulder caps, bracers, toe caps and a cape hem band.
  - Rank 4: a metal pauldron, a longer cape, a brass setting on the staff orb and a cap feather.
  - Rank 5: a gold mantle and lining, cape stars and a gentle sparkle.
- **Eyes**: soft blinks with an occasional double blink, drawn with eyelids. Nearby NPCs (within 6 tiles) glance toward the hero.
- **Small phone sizes**: when a figure is under 0.85 CSS px per unit, it gets one outline stroke behind its body parts, and fine detail is skipped (folds, hair strands, brows, blush, staff bands).

## Quiet modes
With Low effects or reduced motion there are no blinks, no gaze movement and no sparkle twinkle. Checked with `quiet.html` under both `prefers-reduced-motion` settings, and the r4 `anim.html` checks still pass. Low effects also skips the small-size outline.

## Performance (bench.html, 8 figures at the iPhone 13 scale of 1.6, median of 5 runs, main and this branch run side by side)
| | main | r5 |
|---|---|---|
| Chromium, full | 10.61 ms | 10.49 ms |
| Chromium, Low | 8.59 ms | 7.53 ms |
| WebKit, full | 12.88 ms | 12.89 ms |
| WebKit, Low | 10.29 ms | 11.13 ms |

The build box was heavily loaded (load average about 22), so the absolute numbers are noisy. Only the comparison matters, and it is level. An earlier version used a scratch-canvas silhouette and was about 2.5x slower. It was replaced with the backing stroke.

## Caveats
- No real iPhone was used. The 390x844 shots are Playwright WebKit with iPhone 13 emulation. The real iPhone Safari check is still open with Jensen.
- In Playwright WebKit, the ai-evals and portfolio-guide towns crash with "Page crashed" on `main` too, so the WebKit shots skip those two towns. This was not introduced here.
- The HUD portrait shows the new rank tier the next time the HUD is rebuilt or the page reloads.

## Files
- `sheet.html`: character sheet. `?close=1` gives a close-up, `?close=2` the rank line-up, `?low=1` Low effects.
- `shots.py`: takes the before and after screenshots. `bench.py` with `bench.html` is the performance check. `quiet.html` holds the quiet-mode checks.
- `shots/`: before and after images.
