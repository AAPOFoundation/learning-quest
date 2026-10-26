# Round 4, lane B: characters, animation and critters (26 Oct 2026)

Branch `graphics/r4-characters-anim`. Scope: the map figure and portrait in `shared/art.js`, the home wanderer in `shared/hero.js`, and the character
animation hooks in `shared/world.js` (hero/NPC draw options, step end, talk, critters). Lighting, the GL pass, `fx2.js`, HUD, CSS and `guide.js` were not touched.

## Decisions

1. **Squash and stretch through a stride.** A small crouch as the foot pushes off, a stretch in the air, a squash on contact. When the walk stops,
   `land` plays a short squash with a little overshoot (about 0.24 s). The body leans into the walk. Walking on keeps the stride, so land only shows on a real stop.
2. **Secondary motion.** One swing value drives the cape, the hero's scarf tails, the pony tail, braids, beard and helm plume. They trail behind a walk,
   flare the other way on a turn, and swing to rest after a stop (`settle`, about 0.8 s).
3. **Hero gear layers** (`look.gear`, set once on `WORLD.hero` by world.js so the HUD portrait cache key changes too): shoulder mantle in the cape colour
   with trim, two scarf tails, satchel strap with a buckle, satchel on the back hip, belt and buckle, cuffed boots, a lined cape with a scalloped hem,
   brass bands on the staff, and a trim band on the coder's cap. The 3D camp ignores the extra field.
4. **Gatekeepers read as bosses** (role `gate` in each town, `boss` in the keep): drawn 1.42x, brass shoulder plates, a tabard in the region colour with a
   star, a long cape, steel boots and gauntlets, a tall plume that streams back, and a gold ground aura with a dashed ring and orbiting motes.
   The first time the hero comes within four tiles of a town visit, the gatekeeper does an entrance: crouch, jump, a landing squash with a dust ring,
   and an aura flare, then smiles. Friendly: no weapons, no scary faces. The name plate and the quest arrow sit higher to clear the taller figure.
5. **NPC idle variety.** Each town NPC gets a habit picked from its name: look around, sway, stretch, tap a foot, read a book (teachers lean to this),
   or hum with a floating note (guides lean to look, sway, hum, tap). The existing wave when the hero is near still wins over the habit.
6. **Talk beats.** Talking makes the hero lean and reach toward the person (`poke`), and the person answers with a small hop and a smile (`greet`).
7. **Friendly critters.** `Art.critter` draws bunnies, snow hares, songbirds, butterflies and frogs in the same ink-outline style. Each town gets three to
   five by biome (meadow bunnies and birds, marsh frogs, tundra hares, and so on), on open tiles away from people and buildings. Bunnies and frogs
   nibble and hop about their spot and hop away when the hero comes close. Birds peck and fly off to another open tile. Butterflies drift and
   give the hero room. They are drawn in the depth sort and in the angled view.
8. **Portrait-to-sprite consistency.** The map figure now uses the look's iris colour and brows (like the portrait), draws the `spiky` hair style the
   portrait already had, and shows the brooch under the collar. The hero portrait and sprite share the gear flag.
9. **Quiet mode.** Low effects and reduced motion hold all of this still: no lean, squash, swing, habit, entrance, greet or critter movement. The
   checks in `docs/r4-chars/anim.html` compare canvases under Low effects (entrance, habit, land/settle/poke draw exactly like a plain idle frame).

## Checked

Playwright headless Chromium on a local static server (port 9142): Python Basics Valley of Values and AI Evals Meadow of First Marks at 1280x800 and
390x844, a character sheet and animation strips (`docs/r4-chars/sheet.html`, `anim.html`), a keyboard walk and talk, and the same town in Low effects.
No page errors. Syntax-checked with node. Not tried on a real phone, Safari or Firefox.

## Not done

The 3D camp characters (lq3d-geom.js) were left as they are. Critters do not appear on the overworld map. The home strip wanderer only gets the gear layers
and walk squash (it never stops, so no land/settle). The entrance does not add a light: GL lights belong to lane A.
