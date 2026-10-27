# PR draft: Safety simulator test visits town t4

Not opened. An external validator reviews this draft before any PR is created.

## Summary

`sim_world` warped AI Safety to town t3 and then crashed because that town has no simulator. `ai-safety/add.js` runs after `insert.js` and attaches The Gate Threshold Hall to level `l4`. At runtime `l4` is town t4. AI Evals t6 (The Threshold Workshop) and AI Foundations t2 (The Step-Size Forge) were already right, and the old test passed those two before it died on Safety.

## Root cause

Stale test. The town index was hardcoded as 3 after extra regions were inserted ahead of `l4`.

## Game or test

Test. A kid who reaches the l4 town finds the hall on that town. The building is not missing.

## Revert path

Revert commit `a47849e` (this draft commit is docs only). That deletes `tests/e2e/sim_world.py`. No flag. No saved-game change.

## Score card

| Field | Value |
| --- | --- |
| builder model | Cursor Grok 4.7 |
| validator | pending |
| strike count | 0 |
| date_opened | 2026-10-27 |
| date_merged | |
| bot | Cursor Grok 4.7 |
| repo | The Wanderer's Atlas |
| pr | not opened |
| size_lines | +81 / -0 on the code commit (1 file). This draft adds one markdown file. |
| first_score | 9 |
| final_score | 9 |
| rubric_loops | 1 |
| hard_gate_fail | n |
| jensen_wait_hours | |
| ci_blocked | n |
| reworked | n |
| rework_source | |
| rework_pr | |

### Rubric (v1.1)

| Line | Score | Evidence |
| --- | --- | --- |
| Q1 | 1 | `sim_world` passes. Other failures match main. Scored down from 2 because those baseline failures remain. Not a hard-gate fail. |
| Q2 | 1 | `git merge-tree --write-tree` against main and against each other branch in this batch exits 0. |
| Q3 | 1 | Only `tests/e2e/sim_world.py` (plus this draft). No secrets, no flags. |
| Q4 | 2 | Head run prints `FAILS 0`. Safety town t4 is level `l4`, the hall opens, and Leave hides the overlay. |
| L1 | 2 | The test now walks the town a kid walks. |
| L2 | 1 | No user-facing copy change. |
| L3 | 1 | Revert path above. |
| **Total** | **9/10** | Hard gate pass. |

### Q1 baseline vs head

Suite: 39 cases, sequential, Chrome. Baseline main `7c14e3c` port 9561. This head port 9565.

`exped_test` timed out at 300s on the baseline run and passed on an isolated rerun (exit 0). Not counted as a failure. It passed on this head in 371s.

Baseline failures: pb_local (`WRONG PASSES pb3-4 2`), rev_test (exit 1), menu_test (exit 1), pb_world_test (`FAIL home order`), sim_world (exit 1, `ai-safety None` then `TypeError` on `o['c']`), flow_python-basics, flow_ai-foundations, flow_ai-evals (5s hidden primer textarea).

Head `a47849e` failures: that list without sim_world (PASS, repo copy). Suite line: `fails=7 of 39`.

Removed: sim_world. Added: none.

Tested SHA: `a47849e`. The following commit only adds this draft.
