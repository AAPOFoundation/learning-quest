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

## Not done

- Level-path emoji in `homeOld()` is unused by the world UI, so those icons were not redrawn.
- Checked in headless Edge: home cards (wide and narrow) and the Python Basics title. Badge medallions were screenshotted as files. The pause-menu badge chest was not clicked.
