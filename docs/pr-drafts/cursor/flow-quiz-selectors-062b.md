# PR draft: Flow test waits for the real quiz control

Not opened. An external validator reviews this draft before any PR is created.

## Summary

`flow_test` failed on three worlds with a 5 second wait. The selector `#ovbody button, #ovbody textarea` resolves to the primer's worked-example box first (`.cq-exed.pp-ed` inside a closed details). Playwright waits for that hidden box and times out, even though the real editor `#cq-ed` is on screen.

Runtime on main `7c14e3c`:

- python-basics dies on level 1. First match: hidden primer textarea.
- ai-foundations clears level 7, then dies on the next code question. Same hidden textarea.
- ai-evals clears level 9, then dies the same way.
- ai-safety and portfolio-guide already pass.

The test now waits for the control that question uses (`#cq-ed`, `#nv`, `[data-o]`, or `[data-g]`). It also closes a region clip if one is playing, so a clip cannot sit on top of the quiz. On this run the clip was not what failed the old test. AI Safety and the Portfolio Guide already passed without that, and AI Evals got through nine levels before the selector failed.

## Root cause

Stale test. One selector, three worlds.

## Game or test

Test. A kid sees the answer box and the Check button. The primer example stays folded until they open it.

## Revert path

Revert commit `00fd049` (this draft commit is docs only). That deletes `tests/e2e/flow_test.py`. No flag. No saved-game change.

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
| size_lines | +97 / -0 on the code commit (1 file). This draft adds one markdown file. |
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
| Q1 | 1 | All five `flow_*` cases pass. Other failures match main. Scored down from 2 because those baseline failures remain. Not a hard-gate fail. |
| Q2 | 1 | `git merge-tree --write-tree` against main and against each other branch in this batch exits 0. |
| Q3 | 1 | Only `tests/e2e/flow_test.py` (plus this draft). No secrets, no flags. |
| Q4 | 2 | python-basics, ai-foundations, and ai-evals go from the 5s timeout to PASS. Safety and Portfolio Guide stay PASS. Python Basics reports 6 of 6 levels and 24 code tasks solved. |
| L1 | 2 | The test now drives the control a kid uses. |
| L2 | 1 | No user-facing copy change. |
| L3 | 1 | Revert path above. |
| **Total** | **9/10** | Hard gate pass. |

### Q1 baseline vs head

Suite: 39 cases, sequential, Chrome. Baseline main `7c14e3c` port 9561. This head port 9566.

`exped_test` timed out at 300s on the baseline run and passed on an isolated rerun (exit 0). Not counted as a failure. It passed on this head in 377s.

Baseline failures: pb_local (`WRONG PASSES pb3-4 2`), rev_test (exit 1), menu_test (exit 1), pb_world_test (`FAIL home order`), sim_world (exit 1), flow_python-basics, flow_ai-foundations, flow_ai-evals (5s, hidden `.cq-exed.pp-ed`).

Head `00fd049` failures: pb_local, rev_test, menu_test, pb_world_test, sim_world. All five flow cases PASS (repo copy). Suite line: `fails=5 of 39`.

Removed: flow_python-basics, flow_ai-foundations, flow_ai-evals. Added: none.

Tested SHA: `00fd049`. The following commit only adds this draft.
