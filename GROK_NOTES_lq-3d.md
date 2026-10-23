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

`node shared/lq3d-geom.js` prints `"ok": true`. Hero heading dot is 1, height about 1.90, and the meadow picture has skin, tent, fire, ground and sky. Headless Edge rendered meadow, forest, desert, marsh and tundra with full effects. The hood has a point, the friend has a cap and a book, the fire has a pot, and the marsh pool has a pale rim and a lily. Desert fog is warm. Tundra pines and ice read as snow. Not tried on a phone.

## Pass 3 (same day)

- The first cape sat inside the robe outline. A meadow frame showed only blue cloth. The cape now flares past the hem (robe is x ±0.36, cloth reaches about ±0.66) and is drawn on both sides. The right panel stays behind the walking stick. A small brass clasp sits at the throat. The software picture counts about 50 cape-coloured pixels. A later meadow frame shows dark red cloth on both sides of the robe, with the face and the stick still clear.
- The pennant used to sit behind the tent, nearly edge-on, so a frame called it a thin stick. It now stands on the open grass at (2.7, 0, 0.85), yaw 0.14, so local -Z points at the default camera. The cloth is two folded panels and the pole has a brass ball, not a point. A meadow frame shows a tan flag to the left of the wanderer.
- Tent guys were long and straight, so they crossed the door like sticks. Each rope now sags to y=0.1 and ends on a short peg close to the cloth. A meadow frame calls them lines from the corners to the ground. Cape and flag still read.
- One log seat (the near one, same yaw as the log) wears a rose blanket with a brass stripe. The other log stays bare. A meadow frame shows the cloth on the left-hand seat. It casts. Colour is #8a3d4a so it does not match the cape.
- Round trees split into a Y whose tips pass the canopy (about x ±0.55). Pines lean and grow one bare branch out of the lower cone. A forest frame shows that branch on the right-hand pine. Tops stay under 1.6. A tree helper was still reading when this landed, so the shapes were written in session.
- Desert palms were stacked cylinders, so the trunk looked straight. The trunk is now four bent shafts, and the fronds droop. A desert frame calls the near palm curved. Tundra pines still read as snow. The crossed ground shadows under the palms are the contact ellipse plus the shadow map. Left as they are.
- Cactus arms were short vertical posts, so the plant read as a plus. Each arm now bends up, and a small bloom sits on the trunk. A desert frame shows the near cactus with arms raised.
- A clay cup sits on the dirt between the near log and the fire, at (0.72, 0, -1.02), scale 1.35. A meadow frame calls it a mug beside the blanket. The rim is close to the skin test colour, so the skin count rose by a few pixels. The test is a minimum, and it still passes.
- The friend's book was easy to miss at camp distance. The cover is now 0.22 wide, the page block sits on local -Z, and a brass clasp crosses it. No marks on the page. A meadow frame calls it a book at the friend's chest. The wanderer still has the stick, not a book.
- The marsh pool was a flat disc. Two broken rings sit on it at 0.42 and 0.62 of the radius, same water material id 0.35. A marsh frame calls them ripples, and the lily is still there. Reeds, the cape, the book and the cup still read in that frame.
- The tent door roll was three spheres, so it read as stones. It is now one cloth cylinder with two rope ties beside the opening. A meadow frame calls it a rolled flap.
- Stepping stones were flat decals. Each slab is now thicker, with a lighter cap, and a meadow frame calls them stones on the dirt path.
- A woodpile of four short logs sits at (2.15, 0, -0.72), clear of the seats. A meadow frame calls it a pile of sticks by the lantern. It is firewood, not a tool.
- The tree helper returned a second pine and round-tree after those meshes were already framed and committed. Kept the framed version. The helper did not edit the file.
- The bedroll sat behind the tent and rarely showed. It now lies at (-2.85, 0, -0.85), scale 1.3. A meadow frame calls it a red bedroll to the right of the tent.
- A hills frame after the pine branch, cape, book, cup and woodpile still reads as a camp: pines, grey rocks, a cairn, and the same people. Not tried on a phone.
- The crate was a plain box behind the tent. Two dark slats now sit on the front, and the crate stands at (-1.75, 0, -1.65), scale 1.15, so the camp camera sees the boards. A meadow frame calls it a wooden crate with planks beside the fire.
- Highland cairns were axis-aligned boxes, so they matched the white rocks. The stack is now three leaned stones, darkened a little from the rock colour. A highland frame calls out a small grey cairn behind the hero. The rest of that frame still shows the cape, the book, the bedroll, the crate and the pines. Not tried on a phone.
- Highland rock colour was #9a948c, which the frame called white. It is now #6e6860. The same frame calls the rocks grey.
- The door roll was still easy to read as a post. It is thicker now, with two rope bands and a short cloth tail on the ground. A meadow frame calls it rolled tent fabric secured with rope.
