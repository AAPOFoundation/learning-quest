# Lighting notes (grok/light-r2-20261023)

Date: 2026-10-23. Branch `grok/light-r2-20261023`, cut from `origin/main` at `0f7c4d1`. Scope is lighting only. No new worlds, no save-format changes, no new assets, no new dependency.

The map stays painted in 2D. WebGL is a post grade on a second canvas, `#lqgl`, not a 3D scene. `shared/fx2.js` exports `window.LQLight`. `shared/world.js` feeds it the finished frame, the lights and the shadows. Low effects hides the overlay and keeps the flat map, including the old centred contact shadow. If the shader cannot link, the old canvas light (`mkLight`) is drawn instead. Reduced motion keeps the still grade and the still lights. The grade does not pulse. Shimmer, particles and the reward burst still stop when motion is reduced.

## What changed

`shared/fx2.js`. Course grades: Python green-gold, Foundations warm copper, Evals cool blue, Safety dusk amber, Portfolio ledger green. The home strip uses a quiet brass grade. Each grade is a lift, a gain, a shadow tint and a saturation. The top of the frame cools slightly. A five-tap gold mask blooms warm pixels (trim, chests, plaques). Up to 12 point lights and 8 character shadows, fewer if the GPU reports a small uniform budget (then 8/4 or 4/2). Each light has a soft falloff and a small hot core. `LQLight.error()` is empty when the shader links.

`shared/world.js`. Lights, in priority order: the hero (and the staff orb when the hero carries one), a glowing or open chest, a landmark, a smithy forge, a tower window and star, a lit hall, a lit great hall, a vault, a castle, a supply cache, a town, then a few glow motes. Landmark height and colour follow the course. Foundations' landmark is a cool blue pool, because that sculpture is a network of blue lamps. The others are gold. A guide whose name says lamp, wick or lantern carries a small lantern. People get a cast shadow at the feet, offset down and to the right, matching the key light from the upper left. The hero's shadow is kept if the list is cut.

`shared/art.js`. Full effects draws that same cast under each figure, and a longer shadow under each building. Portraits pass `flat` so the cached head keeps the round contact shadow. Low effects is the previous blob.

`shared/hero.js`. The home painting uses the same pass: a light on the walker, one on each town, a stronger one on the Citadel, and a shadow under the walker.

`shared/world.css`. `#lqgl` covers the map and ignores taps. It sits under the HUD.

## Checked

Not yet run in a browser. Syntax check only (`node --check` on the four scripts).

## Open for Jensen

Foundations' landmark light is blue. The gold glow still blooms brass pixels. Say if that landmark should be gold too.

Low effects skips the new lights, the grade and the cast shadow. The baked tile light from the earlier graphics pass still runs only in full effects, as before.

Reduced motion keeps the grade and the lights, because they do not move. Say if reduced motion should force the flat map too.

The shader caps lights at 12 on a full GPU. A town keeps the hero, the chest and the landmark. Far towns on a large map can lose their window light.

Not tested on a real phone, Safari or Firefox yet.
