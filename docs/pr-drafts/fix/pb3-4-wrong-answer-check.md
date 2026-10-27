# PR draft: Python Basics pb3-4 rejects split(" ")

Not opened. An external validator reviews this draft before any PR is created.

## Summary

A wrong answer for "The longest word" was marked correct. `text.split(" ")` only splits on a space character, so a new line stays glued to a word and the old tests never noticed. The task now says words can be split by spaces or new lines, a hidden test uses a new line, and a hint says to call `text.split()` with nothing in the brackets.

This is a game fix. A kid who writes `split(" ")` was told they were right.

## Root cause

`python-basics/content.js` task `pb3-4` checked only space-separated strings. The known wrong answer `text.split(" ")` passed every one of those checks. The task has been like that since `728de08` (Python Basics world). Shipped main `7c14e3c` still has the hole. The repair is commit `a837d62` on this branch, plus a versioned copy of the check in `tests/e2e/pb_local.py`.

## Game or test

Game. The harness was right to fail.

## Revert path

Revert commits `a837d62` and `a634843` (this draft commit is docs only). That restores the old task text, drops the hidden new-line test, and removes `tests/e2e/pb_local.py` and `tests/e2e/fixtures/wrong_pb.json`. No feature flag. No saved-game migration. Progress already stored in the browser is unchanged.

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
| size_lines | +61 / -3 on the code commits (3 files). This draft adds one markdown file. |
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
| Q1 | 1 | Target check now passes. Other failures match main. Scored down from 2 because those baseline failures remain. Not a hard-gate fail. |
| Q2 | 1 | `git merge-tree --write-tree` against main and against each other branch in this batch exits 0. |
| Q3 | 1 | Touches `python-basics/content.js`, `tests/e2e/pb_local.py`, and `tests/e2e/fixtures/wrong_pb.json` only (plus this draft). No secrets, no production SQL, no flags. |
| Q4 | 2 | `pb_local` on this head prints `BAD 0`. Wrong answer 2 fails on `longest_word("hi\nthere")`. The shipped solution still passes. No `SOLFAIL` or `STARTER PASSES`. |
| L1 | 2 | Fixes the kid-facing wrong-answer hole and versions the check. Ages 7-10, no overtly Christian words. |
| L2 | 1 | New sentence and hint are final plain copy. No TODO or COPY-DRAFT. |
| L3 | 1 | Revert path above. |
| **Total** | **9/10** | Hard gate pass. |

### Q1 baseline vs head

Suite: 39 cases, sequential, Chrome (`/usr/bin/google-chrome`). Baseline main `7c14e3c` on port 9561. This head on port 9562. Repo `tests/e2e/` overrides the external harness when the file exists.

`exped_test` hit a 300s cap on the baseline run and passed on an isolated rerun (exit 0, `errors []`, about 380s). That is slow, not a failure. Head runs use a 600s cap. It passed here in 383s.

Baseline failures:

- pb_local: `WRONG PASSES pb3-4 2`, `BAD 1`
- rev_test: exit 1, traceback (`#rv-boss` missing on an empty deck; practice rendered with `{}`)
- menu_test: exit 1, traceback (`#rv-go` missing on an empty deck)
- pb_world_test: `FAIL home order`, `FAILS 1`
- sim_world: exit 1, traceback (ai-safety town t3 has no sim)
- flow_python-basics, flow_ai-foundations, flow_ai-evals: `wait_for_selector` 5000ms, first match a hidden primer textarea (`.cq-exed.pp-ed`)

Head `a634843` failures: the same list without `pb_local` (`pb_local` PASS, repo copy). Suite line: `fails=7 of 39`.

Removed: pb_local. Added: none.

Tested SHA: `a634843`. The following commit only adds this draft.
