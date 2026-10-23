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
- The Portfolio watermark compass sits higher in the tile, beside the jar, so both motifs show in the repeat.
- A later pass nudged three plates. The Foundations anchor is a little larger. The Portfolio keep's door and ledger sit a little lower. The anvil keeps a hammer handle on its head. The hourglass bulbs are a smoother shape.

## Not done

- Level-path emoji in `homeOld()` is unused by the world UI, so those icons were not redrawn.
- A lesson plate at full panel width and 112px tall cropped the scene down to a thin band. It now shows the whole plate, up to 400px wide, and keeps its own shape. Skill-map and quest-log plates stay small thumbnails.
- Checked in headless Edge: the Python Basics lesson, quest log, world map, skills map, and badge chest; the Portfolio Guide quest log and a lesson on a 390px-wide screen; the home cards on that same width. The lesson plate shows the whole scene, and the small plates load. A real phone was not used.
