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
- The door roll was still easy to read as a post. It is thicker now, with two rope bands and a short cloth tail on the ground. A meadow frame calls it rolled tent fabric secured with rope. That geometry was saved by an outside snapshot commit before the note landed.
- Mushrooms were a plain red cone. The cap is wider now and has two pale spots. A forest frame calls out a red mushroom with white spots. The pine branch, cape, book and crate still read in that frame.
- The forest stump was a short dark cylinder behind the camp. It now has a pale cut top and a ring, and it stands at (2.35, 0, 0.15). A forest frame calls it a stump with a light top near the flag.
- One forest fern sat behind the tent. It now stands at (1.55, 0, 0.45), scale 1.45, on the open grass. A forest frame calls out small ferns on the grass. Ferns still do not cast.
- Each cattail was only a stem and a brown head. A green leaf card now grows from the base. A marsh frame still calls them reeds around the pond, with the lily and the ripple rings. The leaf does not cast.
- Each log seat has a dark strip along the top so the bark is not one flat face. A meadow frame still calls both seats logs, one with the rose blanket. That same frame still shows the cape, the book, the flag, the tied door roll, the crate, the bedroll, the woodpile and the cup together.
- A later tundra frame still reads as snow: pale pines, blue ice, grey rocks, and the same camp (cape, book, bedroll, crate, woodpile, cup). Not tried on a phone.
- Ice was two upright boxes. It is now three leaned shards. A tundra frame calls them jagged ice. The snow pines are unchanged.

## Pass 4 (same day)

- Merged origin/main (PRs through the phone layout and the celebrate VFX) into this branch. world.css auto-merged. The camp canvas rules stayed. No push.
- The camp had one fire lamp. It now has five world-space lamps: fire, lantern, chest (gold), hero, and a landmark. The landmark is the pennant, except hills and highland, where it is the cairn. Positions are world space. The viewer does not transform them. The hero lamp sits just in front of the chest, on the face side (local -Z, toward the camera).
- Brass (material id 0.55) adds a small gold glow on top of the chest lamp, so the clasp and the lantern frame read as metal even where the lamp falls off.
- The key light was nearly overhead (y about 0.85). It is now about 0.61, so the people throw a longer shadow. Shadow mix is darker (a fully shadowed texel is 0.38 of the lit colour, was 0.5). Slope bias went up a little so the lower sun does not speckle the ground. Hero and friend foot contacts are a darker olive and a bit wider. Other contacts stay light. Low effects still has no shadow map, so those foot discs are the character shadow in that mode.
- Course grade runs after fog. ai-evals gain is cooler (blue 1.08, red 0.90, gold 0.38). ai-safety gain is warmer (red 1.08, blue 0.86, gold 0.74). Foundations, Basics and the portfolio guide have their own grades if a camp is ever mounted there. The clear colour uses the same grade, without the vignette, so empty sky matches a fully fogged pixel. A headless frame showed evals grass at about (118, 194, 119) and safety grass at about (147, 196, 83). Both shaders linked. Both camps stayed alive.
- The default camera is still the near-front view (yaw 0.2). A three-quarter view is the next pass. Phone layout and the 2D celebrate hook belong to other sessions. The hex map stays 2D.
- Did not spawn a second editor on these two files. A parallel edit would have raced the shader and the mesh list.

## Pass 5 (same day)

- The default camera was almost straight on (yaw 0.2, pitch 0.46). It now comes from scene.view: yaw 0.78, pitch 0.56, radius 9.1, target (-0.15, 1.05, 0.05). That puts the eye on +X and -Z, above the people. Drag still orbits from there. The software picture keeps its own front camera, so the pixel counts stay a separate check.
- A cliff of four leaned stones sits on the -X rim, the side the new camera looks toward. The tallest stone is about 2 high. An open thatched shelter stands in front of it, yaw -pi/2, so local -Z points at the camp. No sign on it. The pennant yaw is yawToward the same eye, and the self-check requires that dot above 0.9.
- Headless Edge showed the meadow and the highland both alive. The cliff sits behind the tent, the shelter roof reads, and the people still cast shadows toward the fire. The leaned stones are still chunky at this size. Left them leaned rather than as a row of crates.
- Phone layout at 390x844 and the 2D lq:celebrate hook are already on origin/main from other sessions. This pass did not touch them.

## Pass 6 (same day)

- `origin/main` was already in this branch (37 commits ahead, none behind). No merge.
- The camp listens for `lq:celebrate`. A beam (chest open, or an expedition stage marked done) puts the sixth lamp on the chest and lifts that lamp. A shockwave (level clear) puts it on the hero. Gold in the grade rises with the same fade. Seven coals travel with the lamp. They do not cast, so the shadow map stays as it was.
- Idle, the sixth lamp is a small ember that wanders at the fire. Full effects moves the coals. Low effects and reduced motion keep one still brighter frame, then about 2.2 seconds later one still frame of the quiet camp. The hex map stays 2D.
- Marking an expedition stage done fires the same event before the camp is drawn again, so the new frame opens on the chest glow. The existing cheer overlay still runs. No new words on the models.
- The cliff was still four leaned stones when the reward light was committed. The next pass replaces it. A helper was still reading the file, so the ridge was drawn in session.

## Check, pass 6

`node shared/lq3d-geom.js` prints `"ok": true`. Burst lamp strength is about 1.84 against an idle ember of 0.48. A beam sits on the chest, a shockwave on the hero, and a steady pose does not move when time changes. Headless Edge, low effects, showed the meadow alive (shader linked, both people, tent, shelter, cliff, fire). A frame during the chest glow was 6.7 mean channel-steps away from the quiet frame, with a bright cluster by the tent and the crate lit. The hero glow was 7.2 away, with gold on the wanderer and the ground at their feet. Three seconds later the still frame matched the quiet camp again, so the light does leave. A full-effects frame still shows the fire pool and the ground shadows. Not tried on a phone.

## Pass 7 (same day)

- The cliff was four leaned boxes, so a frame called them cubes. It is now a long base, two steps, a pale slope on the camera side (local +X), and two leaned stones that break the skyline. A third short stone sits at the end. A moss patch sits on the top step. Nothing is below the ground. The tallest point stays under 2.5. The shelter is unchanged.
- The self-check now requires the cliff to be at least 2.4 long, so it cannot shrink back into one block.

## Check, pass 7

`node shared/lq3d-geom.js` prints `"ok": true`. Headless Edge, low effects, showed the meadow with a stepped grey ridge behind the shelter, a light slope, and two stones on top. The people, the tent and the fire are unchanged. Not tried on a phone.

## Pass 8 (same day)

- The ridge sketch arrived after pass 7 was committed. Its courses are irregular quads that step back, with a lighter cap on each shelf, so the face is battered rather than a stack of boxes. Three leaned stones sit at different heights. The sketch's tallest stone was about 2.3 high and would have towered over the shelter, so the three stones are a little shorter. Two moss dots sit on the shelves. Winding still matches the outward faces.
- Kept the shelter, the camera and the reward lamp.

## Check, pass 8

`node shared/lq3d-geom.js` prints `"ok": true`. Headless Edge, low effects, shows three stones of different heights on a grey shelf behind the shelter, with a lighter top course. The camp in front is unchanged. Not tried on a phone.

## Pass 9 (same day)

- `origin/main` is still an ancestor of this branch. Nothing new to merge.
- The robe was four flat sides, so the three-quarter camera read it as a crate. It is now eight sides. The front edge still straddles local -Z. The hem stays about x ±0.36, so the cape still hangs past it. A small nose sits just in front of the eyes. Each boot has a toe, and the sole stays on the ground.
- The shelter roof was one slab. It now has a thick thatch sheet, a short cap, three dark courses, and a straw fringe on the open side. A plank rail faces the camera, a bench sits inside, and three boards close the back. No sign. The roof stays under 1.3, below the ridge.
- Phone layout and the 2D celebrate hook stay on origin/main. This pass did not touch them.

## Check, pass 9

`node shared/lq3d-geom.js` prints `"ok": true`. Hero heading dot is 1. The robe check finds waist facets, and the nose check finds the front of the face. The shelter check finds the back wall, the bench and a roof under 1.7. Headless Edge, low effects, shows the meadow with dark bands on the shelter roof, straw hanging at the open side, and a bench under the roof. The hood, the cape, the stick, the friend's cap and the book still read. Not tried on a phone.

## Pass 10 (same day)

- The lantern was a glowing cube on a pole. It is now a chamber at the same height as its point light (y=1.16), with six brass ribs, a lip, and a peaked cap. The cap is metal, so it picks up the gold grade. The chest bands are wider, so that gold lamp has a rim to hit.
- Character foot discs follow the sun. The light sits at about (0.62, 0.52, 0.28), so the shade falls toward -X and -Z, and the disc is longer. They are a little darker. Other contact discs stay short. Low effects still has no shadow map.

## Check, pass 10

`node shared/lq3d-geom.js` prints `"ok": true`. The lantern check wants a cap above 1.4, a glow near y=1.16, and both the flame id and the metal id. The hero foot disc reaches past 0.75 in local space. Headless Edge, low effects, shows a peaked lamp by the fire with a bright chamber. Full effects still casts the people onto the grass, and the chest reads with a gold rim. Not tried on a phone.
