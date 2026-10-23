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
