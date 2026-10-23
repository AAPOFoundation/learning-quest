# Camera pass, 23 Oct 2026

Branch `grok/camera-r2-20261023`, cut from `origin/main` at `0f7c4d1`. Pocket Reserve look stays: night-blue field, brass trim, warm parchment. No new dependency. No image files.

## What this pass does

The overworld and towns use an angled three-quarter camera when effects are full. Terrain has a height. A drop between neighbours is a low-poly cliff. Buildings and landmarks stand upright on a stone plinth.

## Decisions

The projection lives in one place, `Art.project` in `shared/art.js`. World +x is east and +y is south. View Y grows down.

`vx = x - 0.36 * y`. A point 100px further south sits 36px to the left.
`vy = 0.62 * y - height`. North-south ground shrinks to 62%. Height lifts straight up, so a cliff face is vertical.

Pinned check: `project(100, 200, 40)` is `(28, 84)`. `unproject(28, 124)` is `(100, 200)`. `Art.selfTestCam()` checks that, plus a mountain cap picking its own hex.

Heights, in view pixels: water 0, sand and marsh 3, grass, crown and road 5, snow and plaza 6, forest 14, pine 18, hills 26, mountain 42. Same type means a flat plateau. Cliffs show up at the change.

Full effects bake `sc.view` once per scene. Tops are the painted tiles, clipped per height and stamped with that shear. Each cliff is two triangles. A drop of 16 or more is grey stone, 8 or more is earth, and a short drop is a sand bank. The dark face stays near rgb 83, 79, 72. A darkened copy of the cap went near black (about 29, 27, 25) and read as a hole. Tall faces get one or two strata lines. The lip is a warm parchment stroke. The old 2–4px lift is gone. The minimap and the full map stay top-down on `sc.cv`.

People, labels and buildings stay upright. Feet use the tile height, and a step lerps the height. Halls, guilds, smithies, vaults, towers, towns, castles, gates, fountains and landmarks get a low-poly plinth with the same shear. The sprite shadow covers about 8px under the feet, so the plinth's south face is tall enough to show beneath it. Chests, trees and banners do not. Course landmarks still draw their own flat slab on top of this step.

A tap tests nearby tiles on their own height plane. If several caps contain the point, the southern one wins, because it is drawn later. A mountain top covers the tile to its north. That is the visible surface.

`shared/fx2.js` water can take a mapper. The home strip sets `relief: false` and stays flat. Shimmer there is unchanged.

Low effects keep the flat map and skip the relief, the plinths and the cliff fog. Reduced motion keeps the angle, because the angle does not move. It still stops shimmer, particles and confetti. On a phone the camera does not look ahead, so the HUD pad can still hold the hero clear of the bars. On a wider screen the feet sit 6% below centre, which shows more land to the north.

Walking is still the hex grid. W still walks up the map. The camera does not own a second movement frame.

## Checked

Headless Edge, Python Basics, full effects. `Art.selfTestCam()` passed. A grass tile beside a mountain had no near-black pixels down the cliff. The darkest stone sample was about 83, 79, 72. Low effects dropped `sc.view` and drew the flat map. Turning effects back on rebuilt the angled view. No console exceptions.

Desktop 1280×800 and phone 390×844, Valley of Values, dialogue closed. The guild, fountain, gate and python landmark sit on a beige step. The hero on the phone sits in the gap above the arrow pad. Coast tiles show a short earth bank, not a black gap.

## Open for Jensen

Reduced motion still shows the angled map. Say if it should force the flat map instead.

Cliff sizes are one number per terrain type. Say if mountains should stand taller, or if the shore bank (grass 5, water 0) should be flatter.

Plinths are fairly thick so they clear the sprite shadow. Say if the castle and the hall should sit lower.

Chests have no plinth. Say if they should.

Course landmarks also paint a flat slab in the sprite. Say if that slab should go, so only the sheared step remains.

The home journey strip is still the flat painting. Say if it should use this camera as well.

Not checked on a real phone, Safari or Firefox.
