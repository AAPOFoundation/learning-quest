# Graphics pass, 23 Oct 2026

Branch `grok/graphics-pass-20261023`. Still the Pocket Reserve look: night-blue field, brass trim, warm parchment, Nunito and Cormorant Garamond. No new dependencies. No image files. No 3D engine.

Checked in headless Edge (Chromium) against a local static server. Home, the five world title screens, four open maps (Python, Foundations, Safety, Portfolio), and the Expedition panel on AI Evals. No console exceptions on those loads. Mark as done was not clicked, so no save or XP was written during the check. Not tested on a real phone, Safari, or Firefox.

## Decisions

The game stays 2D procedural canvas. "Models" here means clearer painted volumes: robe sides, cheeks, arms, hands, and capes. A 3D library would break this art direction, add a dependency, and cost more on kids' devices.

Low effects and reduced motion still gate the new decoration and the new motion. Low skips the region wash, the material hatch, the brass emblems, and arm and cape sway. It also still skips props, town variants, landmarks, water shimmer, particles, reward bursts, bevel, and height lift. The cached tile light stays on in low mode, because the old per-tile gradient was already on in both modes. Seeded grain is on in both modes so a repaint does not flicker.

Recurring guides keep their names (Pip, Fenn, Mina, Reed, Bjorn, Zara, Dunmore, and the local guides). Only local teachers gained a cape, in that region's accent. Gates, guides, bosses, and heralds have no cape.

The home strip uses each realm's tint. The walker on that strip stays the navy traveller, the same character who walks every world. Portfolio Guide stays off the strip. Design already treats it as a separate topic.

AI Safety's citadel wash is `#8a7040`. WorldKit still paints citadel trim `#c9a24f`. The trim stays brass on purpose.

Expedition styles live in one injected sheet, `#lq-exp-style`, scoped under `.lq-exp`. They were not added to `world.css`, which the shared pass owns.

`fx2.js` was left as it was. Water shimmer and particles already respect low effects and reduced motion.

## Shared

`shared/art.js`. One cached hex light sprite replaces a new radial gradient on every tile. Region wash is about 0.16 on land, 0.08 on water and crown. Roads keep a light warm mix and are not washed in the region hex. Full effects add a short grass, sand, or snow hatch inside the tile clip. Halls, guilds, smithies, vaults, towers, great halls, towns, and the castle can draw a brass emblem. Motifs: seed, list, loop, anvil, dict, bug, book, neuron, slope, wave, lens, scale, shield, quill, coin. Unknown kinds draw a diamond. Portraits have a darker robe side, a stronger cheek, and a blush. The figure's arms swing and the cape sways only while moving, and only when effects are full and the browser is not asking for reduced motion. Grain is seeded (`about W*H/900` specks). Public `Art` exports are unchanged.

`shared/world.js`. Overworld stores `zoneTint` from each region and the castle. Towns store `tint` and `motif`, and pass the motif into buildings. Name plaques use a dark backing, a brass stroke, and parchment text. A hidden tab skips update and draw. Saves, quests, dialogue, collision, and controls are unchanged.

`shared/worldkit.js`. Copies `tint` and `motif`. If the caller passes a hero object, that hero is used. Otherwise the navy wanderer remains. A teacher built from a string look gets a cape in the region accent.

`shared/hero.js`. Home towns: Python Basics meadow `#6d9a4e` seed, accent `#4f7a3a`. AI Foundations forest `#c47a48` neuron, accent `#6a3a2a`. AI Evaluation hills `#3f5f8f` scale. AI Safety tundra `#8a4a3a` shield. Citadel `#c9a24f` book.

`index.html`. The suggested next game is the gold button. The others are ghost. If every counted level is cleared, all four are ghost. Descriptions use 12px above and 4px below.

`shared/theme.css`. Focus ring is 2px `--gold-hi` with a 2px offset on links, buttons, options, levels, summaries, inputs, and icon buttons.

`shared/world.css`. The map canvas keeps `outline: none` until `:focus-visible`, then the same gold ring. The title overlay fades in 160ms. The existing reduced-motion rule sets `animation: none` and `transition: none`, so that fade does not leave the overlay at opacity 0. Quest travel, worked-example, Python-idea, and cutscene skip controls are at least 44px. Editor line numbers are `#7d8b9a`. The worked-example field no longer clears the focus ring.

`shared/aisims.js`, `shared/autocomplete.js`, `shared/ctxbudget.js`. Chart panels use `#0a0f15`. Flagged points use ink `#f6efe0`. The loss curve uses brass `#c8a86a`. Cut-off bars use `#6b4a0e`. Maths and labels are unchanged.

## Expedition

`shared/expedition.js` only. `expcamp.js` was not edited. Stage headings use 18px brass line icons (done, lock, open) instead of emoji. Stages sit on a left brass rail with a Cormorant index (01, 02). Camp has no index. A bar shows stages done, not the camp. Notes are 16px Nunito, min-height 44px, dark fill, brass border, gold focus. Locked cards are quieter. Badge icons on the camp and the trail are still the tent and boot emoji. Save shape is still `P.exp[id] = {t, note}`. Camp is still +10 XP. A stage is still +30 XP. Badge ids are still `camp` and `expedition`.

## Python Basics

`python-basics/world.js`. Hero robe `#2f6a4a`, cape `#5f8a3a`, cap, no staff. Regions: Valley of Values `#6d9a4e` seed, teacher cape `#4f7a3a`. Listwood `#3f6a38` list, cape `#8a3b2a`. Loop Heights `#4a6a9a` loop, cape `#3f5f8f`. Function Forge `#c46a3a` anvil, cape `#a0442a`. Lookup Harbour `#2f7a72` dict, cape `#2f6a62`. Bugfix Highland `#3a5878` bug, cape `#274a7a`. Citadel `#c9a24f` quill. `lk()` takes an optional sixth argument for the cape. A helm with a beard is still the fifth argument. Names, hints, halls, and lessons are unchanged.

## AI Foundations

`ai-foundations/world.js` and `insert.js`. Hero robe `#6a3a2a`, cape `#c9a24f`, hood, staff. Data Fields `#c47a48` book. Neuron Grove `#6a4038` neuron. Gradient Hills `#3f5f8f` slope. Overfit Marsh `#6a4558` wave. Attention Peaks `#3c5a86` lens. Fine-tune Forge `#a85a32` anvil. Feedback Harbour `#2f4a6a` scale. Citadel `#c9a24f` quill. Fluency Fields `#6a8a3a` quill, teacher cape `#6a8a3a`. The fluency simulator render is untouched.

## AI Safety

`ai-safety/world.js` and `insert.js`. Hero robe `#3a2a38`, cape `#6a4a2a`, hood, staff. Harbour of Stakes `#8a4a3a` shield. Alignment Hills `#3f5f8f` scale. Red-team Redoubt `#7a3a48` bug. Dunes of Capability `#a06040` lens. Robustness Fells `#3c5a86` shield. Interpretability Depths `#5a4038` neuron. Policy Highland `#274a6a` book. Citadel `#8a7040` shield. Inserted regions: Flatterers' Court `#8a5a78` wave, cape `#9a5a8a`. Watchtower Heights `#3a6a8a` lens, cape `#3a6a8a`. Mirror Marsh `#4a5a7a` wave, cape `#4a5a7a`. Control Keep `#6a3a3a` shield, cape `#6a3a3a`. `apply()` order is unchanged.

## AI Evals

`ai-evals/world.js` and `add.js`. Hero robe `#243e66`, cape `#6a5428`. Meadow of First Marks `#8a5a3a` quill, teacher cape `#b5532f`. Rubric Wood `#5a4030` book, cape `#8a3b2a`. Judges' Hills `#3f5f8f` scale, cape `#3f5f8f`. Dunes of Measure `#a06030` lens, cape `#a0442a`. Frost Reach `#3c5a86` shield, cape `#3c5a86`. Redfen Marsh `#7a3a48` bug, cape `#7a2f3a`. Highland of Synthesis `#274a7a` book, cape `#274a7a`. Citadel `#c9a24f` scale. Added regions: Primer Glade `#5d8a48` seed, cape `#4f7a3a`. Variance Fens `#2f6a62` wave, cape `#2f6a62`. Tribunal Terraces `#6a4a8f` scale, cape `#6a4a8f`. Agent Proving Grounds `#8a5a2a` loop, cape `#8a5a2a`. Order, skills, and narration remap are untouched.

## Portfolio Guide

`portfolio-guide/world.js` only. Hero robe `#2c4a3c`, cape `#8a6530` (ledger green; it was navy `#274a7a`). Harbour of Purpose `#8a5a32` coin, Aldous cape `#b5532f`. Cash Vault Plains `#3d6b4f` coin, Bryn cape `#8a3b2a`. Trim Guild Hills `#5a4a78` scale, Rowan cape `#3f5f8f`. Hedge Smithy Dunes `#a0442a` shield, Garrick cape `#a0442a`. Basis Frost `#3c5a86` lens, Nadia cape `#3c5a86`. Signal Tower Heights `#6a3a48` wave, Ilse cape `#7a2f3a`. Patience Highland `#274a7a` book, Odo cape `#274a7a`. Citadel `#c9a24f` scale. Simulator copy in `content.js` and `shared/aisims.js` logic was not retuned beyond the chart colours above.

## Open for Jensen

Phone HUD icon buttons stay 42px under 560px. Raising them to 44px will crowd the bar. Left as the earlier compromise.

Home progress still uses `data-n` 6, 7, 10, and 7. The copy says "levels". The worlds now have 6, 8, 11, and 11 regions once inserts are counted (Python, Foundations, Evals, Safety). If a region is one level, the home line can say "all cleared" too soon. Not changed.

Quest-log marks are already SVG. Expedition camp and trail badges are still emoji, as are simulator talk icons and some level icons. Left so this pass did not rewrite content chrome beyond the expedition path.

Portfolio Guide is not on the home strip. Say if it should join the four.

Low mode still draws the cached tile light and the seeded grain. Say if low should drop those too and match the older flat fill exactly.

WorldKit citadel accent stays `#c9a24f` even where a castle tint differs. Fine for brass trim. Say if Safety's citadel roof should follow `#8a7040` as well.

## Continuation, same day

Roofs, brass marks, and still frames. Checked again in headless Edge against this folder on port 8877 (an older server was already bound to 8765 and serves a different tree). Home, then Begin on Python, Foundations, Safety, Evals and Portfolio. Effects were full (`learning-apps.fx` was unset and the machine was not in the low default). No console exceptions. The streak renders the flame mark. A second Python load with `prefers-reduced-motion: reduce` showed the whole first line at once and no console exceptions. Begin writes a save only inside that headless profile. Mark as done was not clicked. Not tested on a real phone, Safari, or Firefox.

### What changed

`shared/art.js`. `roof` on a building recolours the main roof. Trim, flags and door light stay `accent`. Halls keep brass when no roof is set. `quiet()` is low effects or reduced motion, and it freezes decorative building motion. Idle blink and idle bob run only when effects are full and motion is allowed. A walking step still plays. Grain is a seeded 128px tile, stamped with a pattern. `LQMark` draws brass line icons for known names and emoji. Unknown icons return an empty string so the caller keeps the text.

`shared/world.js`. Regions and the castle copy `roof` onto map nodes and town objects. Drawing passes it through. A cleared town can still turn its trim brass without changing the roof. Dialogue without a portrait uses a plate. The streak uses the flame mark. Quest and map rows use the existing line icons. The quest marker and the minimap ring do not pulse when effects are low or motion is reduced. The title camera does not drift in that case. The vignette canvas is kept until the view size changes. Reduced motion shows the full dialogue line immediately.

`shared/worldkit.js`. Copies `roof` the same way it copies `tint` and `motif`. Citadel trim stays `#c9a24f`.

`shared/engine.js`, `shared/party.js`, `shared/world.css`, `shared/theme.css`. Badge marks sit in a brass box. Locked badges stay readable (the greyscale fade is gone). Satchel rows use ok, borrow and no marks. Home links use a realm dot: Python `#6d9a4e`, Foundations `#c47a48`, Evaluation `#3f5f8f`, Safety `#8a4a3a`, Portfolio `#8a6530`. The dot is absolutely placed so the label stays centred.

`shared/hero.js`. The four towns and the citadel have their own roofs. The strip already holds a still frame when effects are low or motion is reduced.

`shared/aisims.js`. "flag here and above" and "lowest loss" are 13px `#f6efe0`. The lowest-loss line is `#8fbf6a`. The chart maths is unchanged.

`shared/expedition.js`. A finished stage card uses a brass border. The progress fill transition is included in the reduced-motion stop list. Saves, XP and badge ids are unchanged.

`shared/pyplay.js`. The idea overlay button says Close.

Module roofs, each distinct from that region's ground tint:

- Python: Valley `#7a5a32`, Listwood `#3e4e34`, Loop Heights `#3a4658`, Function Forge `#7a3e2c`, Lookup Harbour `#3a5548`, Bugfix Highland `#4a4038`, citadel `#8a6528`.
- Foundations: Data Fields `#7a5230`, Neuron Grove `#343e2c`, Gradient Hills `#343e56`, Overfit Marsh `#3a4e48`, Attention Peaks `#3e4a58`, Fine-tune Forge `#7a3a28`, Feedback Harbour `#3a4254`, citadel `#8a6528`. Fluency Fields `#5c6a34`.
- Safety: Harbour `#6a4034`, Alignment `#343e56`, Redoubt `#5a3038`, Dunes `#7a4a30`, Fells `#3e4c5a`, Depths `#343e2c`, Policy `#3a4254`, citadel roof `#6a5830` (wash stays `#8a7040`). Inserts: Court `#6a4060`, Watchtower `#3a4e62`, Mirror Marsh `#3a4a58`, Control Keep `#5a3838`.
- Evals: Meadow `#7a5230`, Rubric Wood `#3e4a32`, Judges' Hills `#3a3e5c`, Dunes `#7a4528`, Frost `#3e4c5a`, Redfen `#5a3038`, Synthesis `#3a4254`, citadel `#8a6528`. Primer `#5a6a32`, Variance `#2f554c`, Tribunal `#4a3868`, Proving Grounds `#7a4428`.
- Portfolio: Harbour `#7a5230`, Cash Vault `#2f4a38`, Trim Guild `#3a3858`, Hedge Smithy `#7a3a28`, Basis `#3e4c5a`, Signal Tower `#5a3038`, Patience `#3a4254`, citadel `#8a6528`.

Each world overlay button says Close.

### Open for Jensen

Phone HUD icon buttons stay 42px under 560px.

Home `data-n` stays 6, 7, 10 and 7. The worlds report more regions once inserts count (the HUD on this check said 6, 8, 11 and 11). Portfolio stays off the progress strip. Its standalone link has a dot.

Low effects still draw cached tile light and seeded grain.

Citadel trim stays `#c9a24f`. Safety's citadel roof is now `#6a5830`, warmer than the brass trim and closer to its wash. Say if the roof should be the wash itself.

Decorative building motion, idle bob, idle blink and the title drift stop together when effects are low or the browser asks for reduced motion. Walking still steps. Say if the walk cycle should stop too.

Expedition camp and trail badge strings stay the tent and the boot. The badge screen draws them as brass marks. Simulator talk icons that `LQMark` knows are drawn the same way when a plate is used. Unknown icons stay text.

## Map chrome, same day

The player mark on the minimap and the full map is parchment with a dark brass stroke. It was white with a red stroke. Open towns on both maps use that region's `tint`, with a dark rim. A cleared town draws a small brass star on the name plaque. The old text star is gone, so the plaque does not depend on an emoji font. Gate portraits in the corner wear a ring in that region's accent (only a `#rrggbb` accent is used). The dialogue continue mark is the same brass line icon, turned to point down. While a line is still typing, the mark is not there yet.

Checked in headless Edge: Python (6 rings) and AI Safety (11 rings) after Begin, full effects, no console exceptions. The 11 Safety rings sit on one row at 1280px wide. A 390px-wide shot did not finish, so the phone wrap is not confirmed on screen. Portraits still shrink to 17px under 560px, and the row may wrap. Mark as done was not clicked.

## Still materials, same day

Water, snow, sand and marsh now carry a soft shaded side inside the baked tile. The highlight on water is baked too, so a still frame and low effects still read as a surface. Shimmer and particles are unchanged and still stop when effects are low or motion is reduced. Home and Python Basics reloaded with no console exceptions. The coast on the Python map shows the darker side and the light streak.

## Title legend, same day

Each world's title card shows a dot for every region and one for the citadel, in that place's tint. Python shows 7, Safety 12, Portfolio 8. The corner HUD is hidden while the title is up, so the painted map frames the card and the panels do not sit underneath it. The HUD returns when the journey starts. Title screens for Python, Safety and Portfolio loaded with no console exceptions. Begin was not clicked on that check.

## Lights and three-quarter ground, same day

`origin/main` was already merged (`e3a6f95`) before this pass. No second merge.

The map stays painted 2D. WebGL is a post grade on a second canvas, `#lqgl`, not a 3D scene. No new dependency. `shared/fx2.js` exports `window.LQLight`. `shared/world.js` feeds it the frame and the lights. Low effects hides the overlay and keeps the flat map. Reduced motion keeps the still grade and the still lean, and still freezes shimmer, particles, confetti and idle bob. The grade does not pulse.

### What changed

`shared/fx2.js`. Course grades: Python green-gold, Foundations warm copper, Evals cool blue, Safety dusk amber, Portfolio ledger green. Up to 12 point lights. Glow motes (forest, marsh, crown) and the reward burst record a few lights. The top of the frame cools slightly so the far ground sits back. `LQLight.error()` is empty when the shader links.

`shared/world.js`. Lights on the hero, a glowing or open chest, smithy, tower, lit hall, great hall, castle, vault, landmark and town. The ground shear is −0.36 and the vertical scale is 0.62, pivoted on the hero so a lower tile does not slide off the side. People, buildings and labels stay upright. The tap math uses the same pivot. The minimap stays top-down. On a narrow screen the camera holds the hero at 42% of the height and may scroll past the map edge. A first level clear, a chest and the final challenge dispatch `lq:celebrate`. A party chime does not.

`shared/art.js`. Cliff lift is 30, 20, 13 and 9px for mountain, hills, pine and forest. The wall joins the cap to the ground. Figure and building shadows take the ground shear. Portraits pass `flat` so the cached head stays round.

`shared/world.css`. `#lqgl` covers the map and ignores taps. Under 560px the guide caption sits above the region banner (`bottom` offset 310px), and the banner sits above the d-pad. The XP panel stays on top of the map. A dialogue hides the caption.

### Checked

Headless Edge, effects forced full, local static server. Home and all five titles, then Begin on Python and Foundations. Python town at 390×844. No console exceptions. Shader error string empty, overlay visible, WebGL error 0. Tap round-trip error was 0. At 390×844 the guide did not meet the XP panel, the banner did not meet the guide, and the hero feet (about y=354) sat above both. Low effects then hid the overlay and flattened the shear, with no console exception. A later Python load checked the far-ground cool shade: the shader still linked and the page threw nothing. Begin wrote a save only in that temporary profile. Mark as done was not clicked. Not tested on a real phone, Safari, or Firefox.

### Open for Jensen

Phone HUD icon buttons stay 42px under 560px.

Home `data-n` stays 6, 7, 10 and 7. Portfolio stays off the progress strip.

Low effects still draws cached tile light and seeded grain. It also skips the new lights, the lean and the cliff lift.

Citadel trim stays `#c9a24f`. Safety's citadel roof stays `#6a5830`.

Walking still steps when motion is reduced. The oblique view stays up in that case, because it does not move. Say if reduced motion should force the flat map too.

On a phone, the south edge of a map can show a band of night under the island so the hero stays above the guide and the banner. Say if the hero should sit lower and let the banner overlap the shore instead.
