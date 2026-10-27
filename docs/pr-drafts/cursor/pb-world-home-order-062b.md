# PR draft: Home-order test matches the Portfolio Guide card

Not opened. An external validator reviews this draft before any PR is created.

## Summary

`pb_world_test` expected five `main a.btn` links, including the Portfolio Guide. The home page lists four quest worlds as `main a.btn` and the Portfolio Guide as `a.journey#j-portfolio-guide`. The grep hit on `FAILS 1` was the summary line, not a second failure.

The versioned test expects those four Play links, checks the journey card on its own, and dismisses a region clip if one is up so later clicks are not covered.

## Root cause

Stale test. The home page has used a separate journey card since the MVP.

## Game or test

Test. A kid sees four numbered quests and a separate Portfolio Guide card. That is the page that ships.

## Revert path

Revert commit `17d38a3` (this draft commit is docs only). That deletes `tests/e2e/pb_world_test.py`. No flag. No saved-game change.

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
| size_lines | +101 / -0 on the code commit (1 file). This draft adds one markdown file. |
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
| Q1 | 1 | `pb_world_test` passes. Other failures match main. Scored down from 2 because those baseline failures remain. Not a hard-gate fail. |
| Q2 | 1 | `git merge-tree --write-tree` against main and against each other branch in this batch exits 0. |
| Q3 | 1 | Only `tests/e2e/pb_world_test.py` (plus this draft). No secrets, no flags. |
| Q4 | 2 | Head run prints `FAILS 0`, including `PASS home order` and `PASS home links the Portfolio Guide card`. |
| L1 | 2 | The test now describes the home page a kid actually sees. |
| L2 | 1 | No user-facing copy change. |
| L3 | 1 | Revert path above. |
| **Total** | **9/10** | Hard gate pass. |

### Q1 baseline vs head

Suite: 39 cases, sequential, Chrome. Baseline main `7c14e3c` port 9561. This head port 9564.

`exped_test` timed out at 300s on the baseline run and passed on an isolated rerun (exit 0). Not counted as a failure. It passed on this head in 370s.

Baseline failures: pb_local (`WRONG PASSES pb3-4 2`), rev_test (exit 1), menu_test (exit 1), pb_world_test (`FAIL home order`, links were the four quest worlds only), sim_world (exit 1), flow_python-basics, flow_ai-foundations, flow_ai-evals (5s hidden primer textarea).

Head `17d38a3` failures: that list without pb_world_test (PASS, repo copy). Suite line: `fails=7 of 39`.

Removed: pb_world_test. Added: none.

Tested SHA: `17d38a3`. The following commit only adds this draft.
