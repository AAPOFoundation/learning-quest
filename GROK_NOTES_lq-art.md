# lq-art notes (2026-10-23)

Branch `grok/lq-art-20261023`. Art only. No push.

## Decisions

- New art is SVG under `assets/art/`. The painted hex map in `shared/art.js` stays as it is.
- One cover per world: `assets/art/covers/<key>.svg` (640×360). Shown on the home journey card, the world title card, and the pause menu.
- One faint tile per world: `assets/art/bg/<key>.svg`. Used behind journey-card text and the title scrim. Motifs stay under 30% opacity so words stay readable.
- Badges are brass medallions, `assets/art/badges/<id>.svg`, same night-and-gold trim as the HUD line icons. `seal_*` chest badges share `seal.svg`. If a file is missing, the old emoji still shows.
- Kids 7–10. Covers use rounded shapes, a friendly snake with no fangs, a round shield with a tick, and no weapons. No crosses, churches, halos, or religious words in anything new.
- Portfolio Guide’s cover is a keeper’s desk: map, compass, three jars, a clasped ledger. It is not a trading floor. The lesson text is unchanged.
- Palette is the Pocket Reserve set in DESIGN.md: ink, gold, brass, panel night-blue, meadow green, water blue.
- The Python Basics mill has four sails set as an X, plus a roof and a door, so it reads as a windmill.
- Compass ticks stay inside a circle so the mark reads as a compass.
- Saves, lesson copy, region names, and the canvas renderer were left alone.

## Surfaces

- Home (`index.html`): five illustrated journey cards. Suggested-next still writes into `.journey-title`. Progress still uses `.prog`.
- Title and pause (`shared/world.js`): cover figure. Body `data-world` selects the tile.
- Badge chest (`shared/engine.js` `badges()`): medallion image, emoji fallback.
- HUD streak, full-map row, chest and simulator portraits: the existing brass `ic()` set, extended. No new emoji.

## Later decisions

- Each background tile now has two motifs, still at 0.26 opacity, so the repeat reads as a watermark and the words stay clear. Python is a mill and a snake. Foundations is a small network and a book. Evals is a balance and a star. Safety is a round shield with a tick and a lantern. Portfolio is a compass and a jar.
- The Python mill watermark keeps four sails in an X. An extra upright stroke was removed.
- The three-day streak medallion sits on two flat logs. An X under the flames read as a cross, so it went.
- Every region has a 160×100 plate at `assets/art/plates/<world>/<level id>.svg`, and each world has `citadel.svg`. They share one night frame, brass corner ticks, and the Pocket Reserve colours. A missing file hides itself.
- Plates show on the first screen of a lesson, on the skills map, in the quest log, and on the world-map list.
- Compass ticks stay inside the ring. Plates use no letters, weapons, crosses, or church shapes. The forge hammer is a tool on an anvil.
- The plate set was drawn to one frame in this session. The safety plates were then redrawn with fuller scenes in that same frame. Compass ticks stay inside the ring. The shield is a brass circle and a tick, with no red ring. The marsh mirror sits above the water.
- Python Basics, AI Foundations, and Portfolio Guide plates were redrawn fuller in that same frame. Python keeps the sprout, books, loop trail, anvil and hammer, key, beetle under glass, and keep. Foundations keeps the data field, five-node net, gradient hills, two diverging curves, token cards, forge, speech bubbles with an anchor, four leaves with a book, and the keep. Portfolio stays a keeper's desk: map and compass, three jars, a ruler, a shield on an anvil, two paths that do not meet, a signal tower, an hourglass, and a keep with a ledger.
- Five safety plates were nudged after that redraw. The second boat sits lower, the lantern glow is tighter, the dune marker sits nearer the brass threshold, the ledger has a spine, and the marsh reflection is a darker oval. The mirror stays above the water.
- The AI Evals plates were checked as one set. The balance shows two pans. The shield is a night circle with a brass rim and a gold tick. The snake has a smile and a brass hat. The pennant is a plain round flag. The padlock, ruler, bars, scroll, stamp, stacked blocks, and keep stay in the same frame.
- The tab icon is `assets/art/mark.svg`: a night circle, a brass ring, short ticks inside the ring, and a diamond needle. Home and each world point at it.
- The Portfolio watermark compass sits higher in the tile, beside the jar, so both motifs show in the repeat. The safety shield, the evals balance, and the foundations network sit higher in their tiles too, clear of the bottom edge.
- The Portfolio anvil plate has a brass hammer lying on the anvil face, beside the round shield. The hammer is a tool.
- A later pass nudged three plates. The Foundations anchor is a little larger. The Portfolio keep's door and ledger sit a little lower. The anvil keeps a hammer handle on its head. The hourglass bulbs are a smoother shape.

## This pass

- Merged `origin/main` (the three graphics and UI pulls). The home keeps those quest cards. Each card also shows its cover, and the copy sits on the faint watermark. Suggested next still uses the Next tag.
- The 2D art now carries the same light as the field guide: warm from the top left, cool shade at the bottom right. WebGL lights, the angled camera, and the celebrate hook were left for the other sessions.
- Every region plate has that grade, a gold point at the moon, and a soft shadow along the ground. The brass frame stays on top.
- Covers use the same grade, plus one landmark light: the mill door, the cabin lamp and window, the star over the scales, the lantern on the keep, and a warm pool on the desk.
- Three plates gained a second light. The watchtower lantern, the forge spark, and the signal lamp.
- Course tints stay under 0.14 opacity. Python is meadow green, Foundations is water blue, Evals is gold, Safety is lantern gold, and Portfolio is parchment.
- Badges and the tab mark have a brass highlight from the top left and a shade at the lower right, drawn behind the symbol.
- Watermark tiles stay at 0.26 opacity so the words stay clear.
- Checked in headless Edge: a sheet of the covers, badges and plates, and the home at 390×1600 and 1100×1400. Course covers are 168px tall on a wide screen and 140px on a phone, so the mill, the cabin and the scales stay in frame. A real phone was not used.
- On a phone, the region name sat over the hero. At 390×844 it now sits in the top band, and the XP row starts below it. The guide speech stays at the bottom. Measured in headless Edge: the banner is y 8–58, the objective row ends at y 244, and the speech starts at y 639. A real phone was not used.
- The pause menu no longer squashes the cover to 112px. It keeps the 16:9 frame. On a 390px screen the cover was 338×190, with Resume still in view.

## Colour grade pass

- Merged `origin/main` (phone HUD and the celebrate light). Building and chest portraits stay brass line icons. The region banner still uses main's `--lq-hud-b` placement, so the guide caption and the banner stay off the hero. A warm course line was added under the banner. It does not move the banner.
- Each course now uses the same cool and warm pair as its map palette. Python is blue and yellow. Foundations is purple and water blue. Evals is teal and amber. Safety is green and amber. Portfolio is forest green and brass gold.
- Home cards carry that pair as a wash and a warm bar on the left. The suggested-next card keeps its gold ring. Portfolio's separate card uses the forest wash.
- The title screen has a cool light at the top left and a warm light at the lower right. Region plates, lesson plates and the cover pick up a course-coloured frame.
- Covers and watermarks took the same colours. The Python mill sails are yellow and the snake is blue, like the map landmark. The Foundations network is purple with water-blue nodes. The Evals side stars are teal. The Safety shield face is green. The Portfolio compass needle is brass gold. Watermarks stay at 0.26 opacity.
- Plate ground shadows are a little darker (0.34) so they read at thumbnail size. The brass point light on each plate stays.
- Checked in headless Edge: a sheet of the five covers and five plates, the home at 390×1700 and 1100×1500, and the Python Basics title at 390×844. The mill, the cabin and the scales stay in frame. Words on the cards stay readable. Begin your journey stays on screen. A real phone was not used.

## Landmark lights

- `origin/main` was already in this branch. Nothing new to merge.
- Each region plate now has a gold point light on its landmark. The ground shadow sits under that object, a little down and to the right, because the light comes from the top left. The moon glow stays. The forge spark, the watchtower lantern, and the signal lamp already had a second light, so they kept it.
- Covers gained a light on the snake's hat, the open book, the scale beam, the shield, and the compass. The Python snake has a contact shadow under it.
- The first-step, coder, pythonista, and boss medallions have a small shadow under the mark.
- After a sheet check, five lights were moved onto the thing they light: the scroll, the split in the two curves, the trail flag, the top of the cairn, and a wider forge spark.
- Checked in headless Edge on a sheet of the covers, badges, and plates. A real phone was not used.

## Not done

- Level-path emoji in `homeOld()` is unused by the world UI, so those icons were not redrawn.
- A lesson plate at full panel width and 112px tall cropped the scene down to a thin band. It now shows the whole plate, up to 400px wide, and keeps its own shape. Skill-map and quest-log plates stay small thumbnails.
- Checked in headless Edge: the Python Basics lesson, quest log, world map, skills map, and badge chest; the Portfolio Guide quest log and a lesson on a 390px-wide screen; the home cards on that same width. The lesson plate shows the whole scene, and the small plates load. A real phone was not used.
