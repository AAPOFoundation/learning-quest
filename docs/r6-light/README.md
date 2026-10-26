# Round 6 lane L: selective bloom and soft volumetric light

Branch `graphics/r6-light-bloom`, rebased on main `5aecc38` (PR #19). Files: `shared/fx2.js` (the light pass) and a few small, tagged edits in `shared/world.js` (light kinds on `addLight`, region progress for the mood, the 2D lamp fallback).

## What changed
- **Selective bloom.** Only things that glow (windows, torches and flames, crystals, the chest glint, staff orbs, sparkle bursts, the gatekeeper's soft aura) bloom. A small bright-pass is blurred at a quarter size (phones: at most 192 px, one blur round, refreshed every other frame). The grade and ambient light are untouched.
- **Soft volumetric light.** Windows drop a soft cone of light, flames get a halo and a faint rising column, and these scatter more where the mist is thicker. Mist near a lamp takes the lamp's colour.
- **Light from effects.** Chest beams, shockwaves, gate glows and sparkle bursts now light the ground while they play. Embers rise from the hero's feet when walking through a lamp pool.
- **Flicker, caustics, one key light.** Flames flicker gently (mean brightness unchanged). Shallow water gets soft moving caustics. Cast shadows and sun shafts share one key light from the upper left.
- **Mood (Jensen, 27 Oct: "Noted. You may proceed with your recommendation.").** The base look is warm and encouraging for every region, with the round 4 dusk dip removed. Early regions get no dimming. From about a third of the way through a course, the later regions ease into a gentle mood: a little dusk in the shadows, more mist, and a marsh, highland and tundra mist tint. The pass gives the light back in the mids, highlights and lamps, so average brightness does not drop. Nothing goes dark or scary.
- **Phones on the slow path.** When the speed guard turns the WebGL pass off (or there is no WebGL), a cheap 2D layer now draws warm pools under lamps, windows and the hero (at most 10 sprites, no per-pixel work). Before, that path had no lamplight at all. Low effects is still the plain map, as before.
- Reduced motion: no flicker, embers or moving caustics, and mist holds still.

## Average luminance per region (Python Basics towns, mean Rec.601 luma 0-255 of the full frame)
| Region | Biome | Desktop before | Desktop after | iPhone 13 (WebKit) before | iPhone 13 after |
|---|---|---|---|---|---|
| 1 | meadow | 80.51 | 81.29 | 71.64 | 72.38 |
| 2 | forest | 79.58 | 80.32 | 73.95 | 74.66 |
| 3 | hills | 81.67 | 82.34 | 75.47 | 76.06 |
| 4 | desert (mood starts) | 87.80 | 88.91 | 79.90 | 80.90 |
| 5 | marsh (late) | 73.06 | 73.88 | 68.65 | 69.14 |
| 6 | highland (late) | 81.86 | 82.87 | 75.35 | 76.12 |
| Castle | crown (late) | 82.61 | 83.33 | 73.00 | 73.62 |
| Slow-path fallback (region 1) | meadow | 80.48 | 81.29 | 71.72 | 72.46 |

Every region is a little brighter on average; none drops.

## Screenshots (before left, after right)
- `desktop-meadow-region1.jpg`, `desktop-marsh-region5-late.jpg`, `desktop-castle-late.jpg` (Chromium 1280x800)
- `iphone13-webkit-meadow-region1.jpg`, `iphone13-webkit-highland-region6-late.jpg` (WebKit, iPhone 13 profile)
- `iphone13-webkit-slow-fallback-lamps.jpg` (WebGL pass forced off: warm 2D pools after)

## Checks
- Chromium (SwiftShader) and WebKit iPhone 13: all regions of Python Basics, plus reduced motion and Low effects on Python Basics, AI Safety, AI Evals and the home page, with a level-clear shockwave. No console errors.
- Merges cleanly with PR #20 (`graphics/r6-animation-states`).
