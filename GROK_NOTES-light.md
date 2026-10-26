# Lighting notes (grok/light-r2-20261023)

Date: 2026-10-23. Branch `grok/light-r2-20261023`, cut from `origin/main` at `0f7c4d1`. Scope is lighting only. No new worlds, no save-format changes, no new assets, no new dependency.

The map stays painted in 2D. WebGL is a post grade on a second canvas, `#lqgl`, not a 3D scene. `shared/fx2.js` exports `window.LQLight`. `shared/world.js` feeds it the finished frame, the lights and the shadows. Low effects hides the overlay and keeps the flat map, including the old centred contact shadow. If the shader cannot link, the old canvas light (`mkLight`) is drawn instead. Reduced motion keeps the still grade and the still lights. The grade does not pulse. Shimmer, particles and the reward burst still stop when motion is reduced.

## What changed

`shared/fx2.js`. Course grades: Python green-gold, Foundations warm copper, Evals cool blue, Safety dusk amber, Portfolio ledger green. The home strip uses a quiet brass grade. Each grade is a lift, a gain, a shadow tint and a saturation. The top of the frame cools slightly. A five-tap gold mask blooms warm pixels (trim, chests, plaques). Up to 12 point lights and 8 character shadows, fewer if the GPU reports a small uniform budget (then 8/4 or 4/2). Each light has a soft falloff and a small hot core. `LQLight.error()` is empty when the shader links.

`shared/world.js`. Lights, in priority order: the hero (and the staff orb when the hero carries one), a glowing or open chest, a landmark, a smithy forge, a tower window and star, a lit hall, a lit great hall, a vault, a castle, a supply cache, a town, then a few glow motes. Landmark height and colour follow the course. Foundations' landmark is a cool blue pool, because that sculpture is a network of blue lamps. The others are gold. A guide whose name says lamp, wick or lantern carries a small lantern, dim enough that the figure stays readable. People get a cast shadow at the feet, offset down and to the right, matching the key light from the upper left. The hero's shadow is kept if the list is cut.

After a headless look, the hero pool and the chest and landmark lights were pulled back. The hot core of every light is a fixed 0.36, so a dense phone screen does not blow the centre out or dim it. The gold mask ignores pale cream (a path or a wall). It still blooms a real brass pixel, which is short of blue. A glowing chest lights the ground in front of it, not the lid. The lid stays brass (measured 248, 226, 108) instead of clipping to white. The hero light is a small warm pool (radius 76, colour 0.17, 0.12, 0.04). The foot shadow is longer, so it clears the sprite. `window.__w.draw` paints one frame for a check. It does not change play.

`shared/art.js`. Full effects draws that same cast under each figure, and a longer shadow under each building. Portraits pass `flat` so the cached head keeps the round contact shadow. Low effects is the previous blob.

`shared/hero.js`. The home painting uses the same pass: a light on the walker, one on each town, a stronger one on the Citadel, and a shadow under the walker.

`shared/world.css`. `#lqgl` covers the map and ignores taps. It sits under the HUD.

## Checked

Headless Edge on 23 Oct 2026, WebGL1, window 1280 by 800. The shader linked with 12 lights and 8 shadows. `LQLight.error()` stayed empty on Python, Evals, Foundations, Safety, Portfolio and the home strip. A light placed at the top of a test frame brightened the top pixel, so the overlay is upright.

The grades separate. On the same grass point, Python read 121, 160, 83. Evals read 113, 146, 104, and its empty corner is bluer (9, 15, 30 against Python 10, 20, 18). Foundations read 137, 144, 79. Safety read 137, 138, 82. Portfolio read 118, 162, 88. Foundations' landmark shows as a blue lamp cluster. Evals' staff and scales glow. Safety's beacon glows.

A flat brass chip bloomed to 255, 244, 106. A pale cream chip stayed 219, 237, 179 and did not turn gold. The Python path that had read 234, 230, 152 now reads 206, 208, 141.

On the Python town the hero's torso read 174, 200, 153. Grass a short step to the side read 165, 214, 100. The foot shadow read 85, 85, 56, darker than both, and it sits down-right. Low effects hides `#lqgl`. The home strip keeps the Low effects button above the canvas.

Not tested on a real phone, Safari or Firefox.

## Open for Jensen

Foundations' landmark light is blue. The gold glow still blooms brass pixels. Say if that landmark should be gold too.

Low effects skips the new lights, the grade and the cast shadow. The baked tile light from the earlier graphics pass still runs only in full effects, as before.

Reduced motion keeps the grade and the lights, because they do not move. Say if reduced motion should force the flat map too.

The shader caps lights at 12 on a full GPU. A town keeps the hero, the chest and the landmark. Far towns on a large map can lose their window light.

Not tested on a real phone, Safari or Firefox yet.

# Round 4: light, atmosphere and depth (26 Oct 2026)

Branch `graphics/r4-light-atmosphere`, cut from `origin/main` at `45bc940`. Lighting, rendering and FX only: `shared/fx2.js` (the GL pass), the terrain relief bake in `shared/art.js` (`paintRelief`, not the portraits), and a few lines in `shared/world.js` (lamps, shadow list, the atmosphere hint). No new dependency, no image files, no save changes.

## What changed

`shared/fx2.js`, GL pass.
- Atmosphere by biome (`LQLight.atmos`): mist amount and colour, sun shafts and colour, a small ambient dip ("dusk"), a soft far-band focus, an S-curve contrast amount and a tinted vignette. The pass eases between biomes as the hero walks from one region to the next (about a second). Reduced motion snaps.
- Mist is a 128px tileable four-channel value-noise texture built once in JS (no image file). Two layers are anchored to the world: a far layer that scrolls at 0.82 of the ground and a near wisp layer at 1.22, so the ground reads deeper as the camera moves. Mist pools over water and the night around the island and thins on lit land. Lamps burn through it.
- Sun shafts fall from the upper left (the key light), fade as they fall, and are weaker over the dark night so they do not stripe the sky.
- Lamps now light the paint (albedo) as well as adding glow, and the ambient dips a little per biome, so torches, the forge, the landmark and the hero's glow read as pools.
- Every figure shadow gets a tight contact shadow at the feet under the soft cast. The cast leans down-right with the key light.
- The top of the frame softens a little (far-band focus). It reuses the five glow taps, so it costs no extra texture reads.
- Budget: a wide screen on a large GPU gets 12 lights and 12 shadows. A phone (short side under 560px) keeps the round-3 budget of 12 lights and 8 shadows, and skips the near mist layer (the move pad sits there).
- `frame(src,lights,shadows,key,host,opts)` takes optional `opts` {biome, cam, scale, t, calm}. The home strip calls it without opts and gets the quiet `home` atmosphere (no mist, no dusk).
- WebKit: the home strip (and any page under reduced motion) creates its context with `preserveDrawingBuffer: true`. Without it Playwright WebKit (iPhone 13 profile) drew the pass as solid black over the journey strip after a full-page capture re-composited the page, because the strip paints one still frame. A lost context now hides the pass so the painted canvas shows.

`shared/art.js`, relief bake (once per scene, no per-frame cost). Each cliff face darkens toward its foot. The lower ground gets a thin dark band along every cliff foot, and a longer soft cast where the face looks away from the key light. The shade is drawn inside the lower plane's own tiles, so a higher tile drawn later covers any spill.

`shared/world.js`. Gate posts carry two small torches. A fountain gives a cool water light. A course landmark adds a wide low spill on the ground. A ready chest has a larger gold pool and a small glint, and every chest and landmark gets a ground shadow. Light and shadow caps follow `LQLight.limits()`. `atmOpts()` passes the biome under the hero (or the town's biome), the camera and the clock (0 when calm).

## Kept

Low effects hides the pass and keeps the flat map. The slow guard (frames over 45 ms for about 1.5 s) still switches to the 2D light. Reduced motion keeps the still grade and still lights; mist and shafts hold still (t=0). Nothing pulses.

## Checked

Headless Chrome (SwiftShader GL) at 1280x800 and 390x844, Python town (Listwood), Python world, Evals world, Safety town (Dunes) and Foundations town. Shader linked (`LQLight.error()` empty), no console exceptions. Playwright WebKit, iPhone 13, home page with reduced motion: the strip was black before and draws after. Not tested on a real phone, Safari or Firefox.

## Open for Jensen

The map is a touch darker and moodier per region (dusk 0.01 to 0.07). Say if it should be brighter for younger players. Sun shafts are strongest in the forest and the citadel.
