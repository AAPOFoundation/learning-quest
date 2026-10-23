# Camera pass, 23 Oct 2026

Branch `grok/camera-r2-20261023`, cut from `origin/main` at `0f7c4d1`. Pocket Reserve look stays: night-blue field, brass trim, warm parchment. No new dependency. No image files.

## What this pass does

The overworld and towns use an angled three-quarter camera when effects are full. Terrain has a height. A drop between neighbours is a low-poly cliff. Buildings and landmarks stand upright on that height.

## Decisions

The projection lives in one place, `Art.project` in `shared/art.js`. World +x is east and +y is south. View Y grows down.

`vx = x - 0.36 * y`. A point 100px further south sits 36px to the left.
`vy = 0.62 * y - height`. North-south ground shrinks to 62%. Height lifts straight up, so a cliff face is vertical.

Pinned check: `project(100, 200, 40)` is `(28, 84)`. `unproject(28, 124)` is `(100, 200)`. `Art.selfTestCam()` checks that, plus a mountain cap picking its own hex.

Heights, in view pixels: water 0, sand and marsh 3, grass, crown and road 5, snow and plaza 6, forest 14, pine 18, hills 26, mountain 42. Same type means a flat plateau. Cliffs show up at the change.

Full effects bake `sc.view` once per scene. Tops are the painted tiles, clipped per height and stamped with that shear. Each cliff is two triangles, brighter on the north-west face. The old 2–4px lift is gone. The minimap and the full map stay top-down on `sc.cv`.

People, labels and buildings stay upright. Feet use the tile height, and a step lerps the height. Halls, guilds, smithies, vaults, towers, towns, castles, gates, fountains and landmarks get a low-poly plinth with the same shear. Chests, trees and banners do not.

A tap tests nearby tiles on their own height plane, so a click on a mountain top is that mountain. `shared/fx2.js` water can take a mapper. The home strip sets `relief: false` and stays flat. Shimmer there is unchanged.

Low effects keep the flat map and skip the relief. Reduced motion keeps the angle, because the angle does not move. It still stops shimmer, particles and confetti. On a phone the camera does not look ahead, so the HUD pad can still hold the hero clear of the bars. On a wider screen the feet sit 6% below centre, which shows more land to the north.

Walking is still the hex grid. W still walks up the map. The camera does not own a second movement frame.

## Open for Jensen

Reduced motion still shows the angled map. Say if it should force the flat map instead.

Cliff sizes are one number per terrain type. Say if mountains should stand taller, or if the shore bank (grass 5, water 0) should be flatter.

Plinths are on buildings and landmarks only. Say if chests should have a small one too.

The home journey strip is still the flat painting. Say if it should use this camera as well.

Not checked on a real phone, Safari or Firefox.
