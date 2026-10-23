# lq-3d notes (23 Oct 2026)

Branch `grok/lq-3d-20261023`. Scope is 3D models and scenes only. The hex overworld stays 2D.

## Decisions

- There was no Three.js and no 3D scene. DESIGN.md stops at a 2D canvas. The Expedition tab is the place a camp scene belongs, so the new work is a procedural base camp on that tab in AI Evaluation Skills and AI Safety.
- No new dependency and no CDN script. Three.js would be a large library for one diorama. `shared/lq3d.js` is a small WebGL viewer. The frame matches Three.js: Y-up, right-handed, character front is local -Z, `rotation.y > 0` turns counter-clockwise from above. Camera sits on -Z so faces point at the viewer.
- Geometry is flat-shaded and built in `shared/lq3d-geom.js`. Characters are the existing Wanderer (hood, cape, walking stick from `WORLD.hero`) and Pip-sized friend (cap, satchel, no stick). Proportions are short and large-eyed for ages 7-10. The stick is a walking stick. No weapons, no readable labels, no religious names.
- Biome of the world's first region picks ground colour and props (meadow, forest, hills, desert, tundra, marsh, highland). World key nudges prop placement so the two expeditions are not identical.
- Shadows: dark contact discs are real geometry, so Low effects still has shadows. Full effects add a directional shadow map, a slow orbit, and a small idle bob. `LQFx.low` and reduced motion keep a single still frame.
- The camp is a picture beside the existing stage cards. It does not change quests, saves, XP, or copy.

## Check

`node shared/lq3d-geom.js` reports ok. It checks box winding, every biome, that the wanderer faces the fire, that the eyes sit on local -Z, and that a software render of the meadow camp shows ground, skin, tent cloth, fire and sky.

Headless Edge loaded the meadow camp with full effects. The frame shows both characters, the tent, the fire, trees and the chest, with directional shadows on the ground.

## Out of scope

- Player movement on the hex map. A second camera frame there would risk the control bugs described in the Three.js frame rules, and it does not fit this pass.
- Home-page hero strip. It is already a painted 2D journey and is not the expedition scene.

## Pass 2 (same day)

- The emissive float is a material id, not just on or off: 0 diffuse, 0.35 water, 0.55 metal, 0.9 steady unlit (eye catchlights), 1 flickering unlit (flames and the lantern core). A truthy value used to be forced to 1, which would have made brass unlit. That line now keeps the fraction, and vertex-colour lift is skipped for any non-zero id so metal stays its own colour.
- Full effects add a fire point light (position from the camp, radius 3.6), a cool fill from the opposite side, and a thin rim. The flame strength flickers. A still frame uses a steady fire light and no shadow map. The shadow ortho is -8..8 so the outer trees are inside it. Slope bias replaces the old constant 0.002.
- People keep local -Z as the front. The wanderer (hood, cape, stick, satchel) and the friend (cap, book, satchel) use two-bone arms and legs. The hood has a point and shoulder cloth so it does not read as a cap. The friend's cap is robe-coloured and sits above the eyes; the hair dome is skipped for a cap, or the hair swallowed it and only the brim showed. No text on the book. The stick is a walking stick.
- New camp meshes: pot and tripod, two log seats, bedroll, crate, plain gold pennant (no emblem), stepping stones. Biome extras: grass, ferns, a lily with a pale water rim, pebbles, a snow mound, lumpier rocks. Grass and ferns are double-sided cards and do not cast, so they do not speckle the shadow map.
- Contact shadows were nearly black. With the shadow map as well, the WebGL frame showed pitch-black ovals. They are now a lighter olive and a little less stretched. Low effects still has a visible contact patch.
- Fog and sky ambient change with the biome. The clear colour stays dark enough that the brass frame still reads. No sky dome: the software picture expects the top rows to stay empty.
- Five low mounds sit on the rim and do not cast. They stop the ground reading as a coin. Desert fog is warm, so those mounds read as dunes. Meadow mounds read as bushes, which is fine at this size.
- A geometry subagent stalled after one read, so this pass was written in the session. Lighting landed first, in its own commit, and works if the emissive channel is only 0 or 1.

## Check, pass 2

`node shared/lq3d-geom.js` prints `"ok": true`. Hero heading dot is 1, height about 1.90, and the meadow picture has skin, tent, fire, ground and sky. Headless Edge rendered the meadow and the forest with full effects: both people, the pointed hood, the cap, the book, the pot, the tent and the pines, with soft ground shadows. Not tried on a phone.
