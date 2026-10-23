# Lighting notes (grok/light-r2-20261023)

Date: 2026-10-23. Branch `grok/light-r2-20261023`, cut from `origin/main` at `0f7c4d1`. Scope is lighting only. No new worlds, no save-format changes, no new assets, no new dependency.

The map stays painted in 2D. WebGL is a post grade on a second canvas, `#lqgl`, not a 3D scene. `shared/fx2.js` exports `window.LQLight`. `shared/world.js` feeds it the finished frame, the lights and the shadows. Low effects hides the overlay and keeps the flat map, including the old centred contact shadow. If the shader cannot link, the old canvas light (`mkLight`) is drawn instead. Reduced motion keeps the still grade and the still lights. The grade does not pulse. Shimmer, particles and the reward burst still stop when motion is reduced.

## What changed

`shared/fx2.js`. Course grades: Python green-gold, Foundations warm copper, Evals cool blue, Safety dusk amber, Portfolio ledger green. The home strip uses a quiet brass grade. Each grade is a lift, a gain, a shadow tint and a saturation. The top of the frame cools slightly. A five-tap gold mask blooms warm pixels (trim, chests, plaques). Up to 12 point lights and 8 character shadows, fewer if the GPU reports a small uniform budget (then 8/4 or 4/2). Each light has a soft falloff and a small hot core. `LQLight.error()` is empty when the shader links.

`shared/world.js`. Lights, in priority order: the hero (and the staff orb when the hero carries one), a glowing or open chest, a landmark, a smithy forge, a tower window and star, a lit hall, a lit great hall, a vault, a castle, a supply cache, a town, then a few glow motes. Landmark height and colour follow the course. Foundations' landmark is a cool blue pool, because that sculpture is a network of blue lamps. The others are gold. A guide whose name says lamp, wick or lantern carries a small lantern. People get a cast shadow at the feet, offset down and to the right, matching the key light from the upper left. The hero's shadow is kept if the list is cut.

After a headless look, the hero pool and the chest and landmark lights were pulled back. The hot core of every light is a fixed 0.36, so a dense phone screen does not blow the centre out or dim it. The hero light is a small warm pool (radius 76, colour 0.17, 0.12, 0.04). The foot shadow is longer, so it clears the sprite. `window.__w.draw` paints one frame for a check. It does not change play.

`shared/art.js`. Full effects draws that same cast under each figure, and a longer shadow under each building. Portraits pass `flat` so the cached head keeps the round contact shadow. Low effects is the previous blob.

`shared/hero.js`. The home painting uses the same pass: a light on the walker, one on each town, a stronger one on the Citadel, and a shadow under the walker.

`shared/world.css`. `#lqgl` covers the map and ignores taps. It sits under the HUD.

## Checked

Headless Edge on 23 Oct 2026, WebGL1, window 1280 by 800. The shader linked with 12 lights and 8 shadows. `LQLight.error()` stayed empty on Python, Evals, Foundations, Safety, Portfolio and the home strip. A light placed at the top of a test frame brightened the top pixel, so the overlay is upright.

The grades separate. On the same pale town tile, Python read 234, 230, 152. Evals read 210, 206, 176, and its empty corner is bluer. Foundations read 249, 204, 140. Safety read 242, 196, 141. Portfolio read 226, 232, 157. Foundations' landmark shows as a blue lamp cluster. Evals' staff and scales glow. Safety's beacon glows.

On the Python town the hero's torso read 186, 209, 156. Grass a short step to the side read 173, 220, 103. The foot shadow read 89, 89, 57, darker than both, and it sits down-right. Low effects hides `#lqgl`. The home strip keeps the Low effects button above the canvas.

Not tested on a real phone, Safari or Firefox.

## Open for Jensen

Foundations' landmark light is blue. The gold glow still blooms brass pixels. Say if that landmark should be gold too.

Low effects skips the new lights, the grade and the cast shadow. The baked tile light from the earlier graphics pass still runs only in full effects, as before.

Reduced motion keeps the grade and the lights, because they do not move. Say if reduced motion should force the flat map too.

The shader caps lights at 12 on a full GPU. A town keeps the hero, the chest and the landmark. Far towns on a large map can lose their window light.

Not tested on a real phone, Safari or Firefox yet.
