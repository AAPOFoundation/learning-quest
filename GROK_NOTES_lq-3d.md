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
