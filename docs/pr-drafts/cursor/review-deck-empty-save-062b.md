# PR draft: Review and practice tests match a fresh save

Not opened. An external validator reviews this draft before any PR is created.

## Summary

`rev_test` and `menu_test` failed together. The review deck only uses questions from levels the player has cleared (`shared/review.js`, since `800671c`). Both tests start from a fresh save, so there is no `#rv-go` and no `#rv-boss`. `rev_test` also rendered the practice tab with `{}`. Expedition reads `ctx.P`, which the game does pass (`award`, `save`, `toast`, `P`).

AI Foundations does not ship a practice tab. The test checks practice only on worlds that have one.

## Root cause

Stale tests. One cause for both files: they expect a review round before any level is cleared, and `rev_test` does not pass the context the practice tab needs.

## Game or test

Test. A kid who opens Review before clearing a level sees the empty-deck note, which is what the game intends. A kid who opens Practice gets a real `ctx.P`.

## Revert path

Revert commits `cb63d88` and `ecd2a7d` (this draft commit is docs only). That deletes `tests/e2e/rev_test.py` and `tests/e2e/menu_test.py`. No flag. No saved-game change.

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
| size_lines | +110 / -0 on the code commits (2 files). This draft adds one markdown file. |
| first_score | 8 |
| final_score | 9 |
| rubric_loops | 2 |
| hard_gate_fail | n |
| jensen_wait_hours | |
| ci_blocked | n |
| reworked | n |
| rework_source | |
| rework_pr | |

### Rubric (v1.1)

| Line | Score | Evidence |
| --- | --- | --- |
| Q1 | 1 | `rev_test` and `menu_test` pass. Other failures match main. Scored down from 2 because those baseline failures remain. Not a hard-gate fail. |
| Q2 | 1 | `git merge-tree --write-tree` against main and against each other branch in this batch exits 0. |
| Q3 | 1 | Only `tests/e2e/rev_test.py` and `tests/e2e/menu_test.py` (plus this draft). No secrets, no flags. |
| Q4 | 2 | Both tests print `FAILS 0` on this head. |
| L1 | 2 | Tests now follow the empty-deck rule and the real practice context. |
| L2 | 1 | No user-facing copy change. |
| L3 | 1 | Revert path above. |
| **Total** | **9/10** | Hard gate pass. |

First loop scored 8: the first `rev_test` crashed on AI Foundations because that world has no practice tab (`Cannot read properties of undefined (reading 'render')`). Q4 was only partly met. The second commit skips practice when the tab is absent. Re-ran `rev_test`: `FAILS 0`.

### Q1 baseline vs head

Suite: 39 cases, sequential, Chrome. Baseline main `7c14e3c` port 9561. This head port 9563.

`exped_test` timed out at 300s on the baseline run and passed on an isolated rerun (exit 0). Not counted as a failure. It passed on this head in 381s.

Baseline failures: pb_local (`WRONG PASSES pb3-4 2`), rev_test (exit 1), menu_test (exit 1), pb_world_test (`FAIL home order`), sim_world (exit 1, ai-safety t3), flow_python-basics, flow_ai-foundations, flow_ai-evals (5s hidden primer textarea).

Head `ecd2a7d` failures: that list without rev_test and menu_test (both PASS, repo copies). Suite line: `fails=6 of 39`.

Removed: rev_test, menu_test. Added: none.

Tested SHA: `ecd2a7d`. The following commit only adds this draft.
