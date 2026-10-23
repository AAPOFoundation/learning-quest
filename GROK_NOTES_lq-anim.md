# Animation pass (lq-anim) — decisions

Date: 2026-10-23. Branch `grok/lq-anim-20261023`. Scope is motion only: walk, characters, celebrations, transitions, and how much the canvas redraws. No new worlds, no save-format changes, no new assets.

## What was already there

The map already bobs the hero, waves flags, shimmers water, and throws a spark burst on a chime (`shared/fx2.js`). Buttons move 1px. Dialogue and the lesson overlay appear at once. A walk between hexes is a straight line at constant speed (0.14s). Low effects and `prefers-reduced-motion` turn the canvas effects off.

## Decisions

1. **One stride per hex, eased.** Position uses smoothstep so a step starts and stops softly. A hop (about 5.5px) is drawn by the figure, not baked into `hero.y`, so the camera does not bounce. Which foot leads flips each tile. The home-page wanderer uses the same step fields, one stride about every 42px.
2. **Characters stay procedural.** No sprite sheets. Idle is a small breath, a blink, and the old bob. Near the hero, a town person raises an arm. The old time-based leg swing remains only when `step` is missing, so older callers still walk.
3. **Chest lid is a short hinge.** It plays once when a chest changes from shut to open. A save that already has the chest open stays open. Low effects snaps the lid.
4. **Celebrations stay on the chime.** The same chime now carries a short floater: `+10 XP`, `+25 XP`, `+50 XP`, `Cleared`, `Well done`. Words are plain and not religious. Sparks are fewer, plus a ring, so the burst reads larger without more circles. Dust puffs land on each step, except the step that enters a town or leaves through a gate (that puff would be in the wrong scene).
5. **Scene change is a fade, not a slide.** Entering a place sets a dark veil for about 0.4s and still snaps the camera. A slide would show the wrong map. Bumping a blocked tile shakes the map for a moment and plays a soft thud, at most once every 0.32s.
6. **Quiz and code wins get a CSS beat.** A passed level and the final challenge use `panel cheer`. A Python challenge that passes every test uses `cq-out cheer`. Stars pop in one after another. The toast animation keeps `translateX(-50%)` so it stays centred. `prefers-reduced-motion` still removes CSS animation.
7. **Performance.** Static trees and rocks are stamped once and blitted (shared by shape: oak, pine, snow, bush, stone). Low effects, or reduced motion, and a hero who is standing still with no key, path, fog, or camera settle, redraw at about 8fps. A held key is never skipped. The tab being hidden skips the frame. Name plaques cache `measureText`. Particle and water drawing avoid `toFixed` in the inner loop.
8. **Low effects still means the quiet map.** Hop, veil, shake, dust, floaters, NPC waves, and the quest bob are off when Low effects is on or the reduced-motion query matches. The idle redraw cap applies only in that quiet mode.

## Checked

A mock canvas ran the stride, the idle blink, the wave, shared tree stamps, the chest lid and the low-effects skip. Edge drew one frame: four steps, a wave, a pine, an opening chest, the word Cleared and a ring. The full game was not clicked through on a phone.

## Not done

No phone, Safari or Firefox pass in this session. No change to lesson text. Flags, fountains and town buildings were already animated, so they stay live drawing.
