window.NEWLV=window.NEWLV||{};
window.NEWLV["lA"]={
 "id": "lA",
 "icon": "🤖",
 "title": "Agent trials: trajectories and tools",
 "blurb": "Grade what an agent does over many steps, not just its last message: tool use, final state, side effects, reliability across runs, and multi-turn conversations.",
 "lesson": [
  {
   "h": "Why agents need different evals",
   "b": "<p>A single-answer eval looks at one reply. An <b>agent</b> works over many steps: it reads, calls <b>tools</b> (search, a file editor, a database, a shell), and changes things in an environment. It may succeed in surprising ways, fail halfway, or reach the goal by a route you did not want. So you grade the <b>trajectory</b> (the sequence of messages and tool calls) and the <b>outcome</b> (the final state of the world), and you often need both.</p><p>Examples of agent benchmarks you can read about: SWE-bench (Jimenez et al., <i>SWE-bench: Can Language Models Resolve Real-World GitHub Issues?</i>, arXiv 2310.06770), where success means the project's own tests pass after the agent edits the code, and τ-bench (Yao et al., <i>τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains</i>, arXiv 2406.12045), where an agent talks to a simulated user and tools, and is judged by the database state at the end."
  },
  {
   "h": "Outcome checks, process checks and side effects",
   "b": "<p><ul><li><b>Outcome (state) checks</b> ask whether the world ended up right: the file has the right contents, the booking exists, the tests pass. They are objective and hard to argue with, and they let the agent find any valid route.</li><li><b>Process (trajectory) checks</b> ask how it got there: did it call the required tool, in a sensible order, without wasted loops? Use these carefully. If you demand one exact route you punish valid alternatives, so check for <i>required</i> and <i>forbidden</i> steps, not a single path.</li><li><b>Side-effect checks</b> ask what else changed. An agent that deletes the whole folder to remove one file may reach the goal and still be unsafe. Grade \"goal met\" and \"nothing forbidden happened\" separately, and let a forbidden action override a pass.</li></ul>"
  },
  {
   "h": "Reliability, noise and cost",
   "b": "<p>Agents are noisy: the same task run twice can succeed once and fail once. So run every task <b>several times</b>. <b>pass@k</b> asks whether <i>any</i> of k tries succeeds (how capable at best); <b>pass^k</b> (used in τ-bench) asks whether <i>all</i> k succeed (how reliable). For something users will depend on, the second number is usually the one that matters, and it drops quickly as k grows. Also record steps, time and cost per run, set a step limit, and report how many runs ended by hitting the limit rather than finishing.</p><p>METR proposed measuring capability by the <b>length of task</b>, in human working time, that a model completes at a stated success rate (<i>Measuring AI Ability to Complete Long Software Tasks</i>, arXiv 2503.14499). <i>Contested:</i> how well such trends extend to other kinds of work is debated."
  },
  {
   "h": "Environments, multi-turn chats and traps",
   "b": "<p><ul><li><b>Sandbox the environment.</b> Run agents in an isolated container with fake data, so a mistake cannot touch anything real. Reset it for every run so one run cannot affect the next.</li><li><b>Multi-turn conversations</b> add a second source of error: the simulated user. If a scripted or model-played user behaves oddly, the score reflects that as much as the agent. Check a sample of transcripts, and note the <b>first turn where things go wrong</b>, not only the final result.</li><li><b>Agents can game the test.</b> If the check only looks at a file, an agent might write the expected file directly. Read transcripts of both passes and failures; some \"passes\" will be shortcuts.</li><li><b>Read the logs.</b> Automatic grading tells you how often; reading runs tells you why. Sample both.</li></ul>"
  }
 ],
 "qs": [
  {
   "t": "mc",
   "q": "An agent was asked to delete one old file. The file is gone, but the agent also wiped the whole folder. How should this run be graded?",
   "opts": [
    "As unsafe or failed, because a forbidden side effect happened even though the goal was met",
    "As a pass, since the file is gone",
    "As a pass with a bonus for speed",
    "It cannot be graded"
   ],
   "a": 0,
   "why": "Goal achievement and side effects are separate checks. A forbidden action should override a pass."
  },
  {
   "t": "mc",
   "q": "Why is checking for one exact sequence of tool calls often a poor grader?",
   "opts": [
    "It marks valid alternative routes as wrong; check required and forbidden steps instead",
    "Because tools do not have names",
    "Because sequences are always random",
    "It is too cheap"
   ],
   "a": 0,
   "why": "Agents can reach a goal in several valid ways. Over-specific process checks reward copying one path, not solving the task."
  },
  {
   "t": "mc",
   "q": "A task is run 5 times with 4 successes. Which statement is correct?",
   "opts": [
    "pass@5 is a success (any try worked), but pass^5 is a failure (not all tries worked)",
    "Both pass@5 and pass^5 are successes",
    "Both are failures",
    "pass^5 is 80%"
   ],
   "a": 0,
   "why": "Any success makes pass@5 true. pass^5 needs every run to succeed, which did not happen."
  },
  {
   "t": "num",
   "q": "Four tasks are each run 3 times. Task results (successes): 3, 2, 3, 0. What fraction of tasks passed ALL their runs?",
   "a": 0.5,
   "tol": 0.001,
   "why": "Tasks 1 and 3 passed all runs: 2 of 4 = 0.5."
  },
  {
   "t": "mc",
   "q": "In a multi-turn eval a model-played user keeps giving confusing replies. What is the best response?",
   "opts": [
    "Read a sample of transcripts, because the user simulation may be driving the failures",
    "Ignore it, the score is the score",
    "Delete the confusing runs silently",
    "Raise the temperature"
   ],
   "a": 0,
   "why": "The simulated user is part of the instrument. Check it before blaming the agent."
  },
  {
   "t": "multi",
   "q": "Which are good practices for agent evals?",
   "opts": [
    "Run each task several times",
    "Run in a sandbox with fake data that resets each time",
    "Read transcripts of passes as well as failures",
    "Count a run as passed if the agent says it succeeded"
   ],
   "a": [
    0,
    1,
    2
   ],
   "why": "The agent's own claim of success is not evidence. Check the state and the logs."
  },
  {
   "t": "code",
   "id": "ag1",
   "title": "Required steps in order",
   "q": "<p>A task requires certain tool calls in order, with other calls allowed in between. Write <code>steps_matched(expected, actual)</code>: walk through <code>actual</code> once, matching the expected steps in order (each match moves you to the next expected step). Return the fraction of expected steps matched, as a float. If <code>expected</code> is empty return <code>1.0</code>.</p>",
   "starter": "def steps_matched(expected, actual):\n    j = 0   # how many expected steps matched so far\n    for call in actual:\n        # if call is the next expected step, move on\n        pass\n    return 0.0\n",
   "tests": [
    {
     "n": "all steps, with an extra call between",
     "code": "assert steps_matched([\"search\",\"open\",\"reply\"],[\"search\",\"noop\",\"open\",\"reply\"])==1.0,\"all three appear in order: expected 1.0\""
    },
    {
     "n": "order matters",
     "code": "r=steps_matched([\"search\",\"open\",\"reply\"],[\"reply\",\"search\"]);assert abs(r-1/3)<1e-9,\"only search matches in order: expected 0.333, got %s\"%r"
    },
    {
     "n": "repeated step needs two calls",
     "code": "assert steps_matched([\"a\",\"a\"],[\"a\"])==0.5,\"one call matches one of two a-steps: expected 0.5\"",
     "hidden": true
    },
    {
     "n": "nothing expected",
     "code": "assert steps_matched([],[\"x\"])==1.0,\"empty expected list: expected 1.0\"",
     "hidden": true
    },
    {
     "n": "no calls",
     "code": "assert steps_matched([\"a\"],[])==0.0,\"no calls: expected 0.0\"",
     "hidden": true
    }
   ],
   "hints": [
    "Keep <code>j</code> as the index of the next expected step.",
    "Inside the loop: <code>if j &lt; len(expected) and call == expected[j]: j += 1</code>.",
    "At the end return <code>j / len(expected)</code>, after handling the empty expected list."
   ],
   "solution": "def steps_matched(expected, actual):\n    if not expected:\n        return 1.0\n    j = 0\n    for call in actual:\n        if j < len(expected) and call == expected[j]:\n            j += 1\n    return j / len(expected)",
   "why": "This is a gentle process check: it rewards required steps in order but allows extra calls. Pair it with an outcome check."
  },
  {
   "t": "code",
   "id": "ag2",
   "title": "Outcome plus side effects",
   "q": "<p>A run is a dict with <code>\"state\"</code> (the final state, a dict) and <code>\"calls\"</code> (the list of tool names used). Write <code>grade_run(run, goal, forbidden)</code>. Return <code>\"unsafe\"</code> if any forbidden tool name appears in the calls (even if the goal was met). Otherwise return <code>\"pass\"</code> if every key in <code>goal</code> has the same value in the final state, and <code>\"fail\"</code> if not.</p>",
   "starter": "def grade_run(run, goal, forbidden):\n    # forbidden calls first, then compare the goal with the final state\n    return \"fail\"\n",
   "tests": [
    {
     "n": "goal met, nothing forbidden",
     "code": "r={\"state\":{\"booked\":True},\"calls\":[\"search\",\"book\"]};assert grade_run(r,{\"booked\":True},[\"delete_all\"])==\"pass\",\"expected pass\""
    },
    {
     "n": "goal not met",
     "code": "r={\"state\":{\"booked\":False},\"calls\":[\"search\"]};assert grade_run(r,{\"booked\":True},[])==\"fail\",\"expected fail\""
    },
    {
     "n": "forbidden call overrides a met goal",
     "code": "r={\"state\":{\"booked\":True},\"calls\":[\"book\",\"delete_all\"]};assert grade_run(r,{\"booked\":True},[\"delete_all\"])==\"unsafe\",\"a forbidden call should give unsafe even when the goal is met\"",
     "hidden": true
    },
    {
     "n": "missing key in state",
     "code": "assert grade_run({\"state\":{},\"calls\":[]},{\"x\":1},[])==\"fail\",\"a missing key is a fail, not an error\"",
     "hidden": true
    },
    {
     "n": "empty goal passes",
     "code": "assert grade_run({\"state\":{},\"calls\":[]},{},[])==\"pass\",\"an empty goal is met\"",
     "hidden": true
    }
   ],
   "hints": [
    "Use <code>any(c in forbidden for c in run[\"calls\"])</code> for the forbidden check, and return early.",
    "Use <code>run[\"state\"].get(key)</code> so a missing key does not crash.",
    "<code>all(...)</code> over the goal items gives the pass test."
   ],
   "solution": "def grade_run(run, goal, forbidden):\n    if any(c in forbidden for c in run[\"calls\"]):\n        return \"unsafe\"\n    state = run[\"state\"]\n    if all(k in state and state[k] == v for k, v in goal.items()):\n        return \"pass\"\n    return \"fail\"",
   "why": "Checking the final state lets the agent choose any valid route, and the forbidden list catches the harmful ones."
  },
  {
   "t": "code",
   "id": "ag3",
   "title": "Capable versus reliable",
   "q": "<p><code>results</code> maps each task name to a list of True/False for its repeated runs. Write <code>reliability(results)</code> returning a pair <code>(any_rate, all_rate)</code>: the fraction of tasks where <b>any</b> run passed (pass@k) and the fraction where <b>all</b> runs passed (pass^k). Ignore tasks with an empty list. If no task is left, return <code>(0.0, 0.0)</code>.</p>",
   "starter": "def reliability(results):\n    # drop tasks with no runs, then count any() and all()\n    return (0.0, 0.0)\n",
   "tests": [
    {
     "n": "mixed tasks",
     "code": "a,b=reliability({\"t1\":[True,True],\"t2\":[True,False],\"t3\":[False,False]});assert abs(a-2/3)<1e-9 and abs(b-1/3)<1e-9,\"any 2/3 and all 1/3, got %s %s\"%(a,b)"
    },
    {
     "n": "all pass",
     "code": "assert reliability({\"t\":[True]*3})==(1.0,1.0),\"expected (1.0, 1.0)\""
    },
    {
     "n": "empty run lists are ignored",
     "code": "a,b=reliability({\"t1\":[],\"t2\":[True]});assert (a,b)==(1.0,1.0),\"t1 has no runs and is ignored: expected (1.0, 1.0), got %s %s\"%(a,b)",
     "hidden": true
    },
    {
     "n": "no tasks",
     "code": "assert reliability({})==(0.0,0.0),\"no tasks: expected (0.0, 0.0)\"",
     "hidden": true
    },
    {
     "n": "any is never lower than all",
     "code": "a,b=reliability({\"x\":[True,False],\"y\":[False]});assert a>=b,\"any_rate should be at least all_rate\"",
     "hidden": true
    }
   ],
   "hints": [
    "Build <code>runs = [v for v in results.values() if v]</code> to drop empty lists.",
    "Return <code>(0.0, 0.0)</code> if <code>runs</code> is empty.",
    "<code>sum(1 for r in runs if any(r)) / len(runs)</code> and the same with <code>all(r)</code>."
   ],
   "solution": "def reliability(results):\n    runs = [v for v in results.values() if v]\n    if not runs:\n        return (0.0, 0.0)\n    any_rate = sum(1 for r in runs if any(r)) / len(runs)\n    all_rate = sum(1 for r in runs if all(r)) / len(runs)\n    return (any_rate, all_rate)",
   "why": "The gap between the two numbers is the unreliability. Note that all([]) is True, which is why empty lists are dropped first."
  },
  {
   "t": "code",
   "id": "ag4",
   "title": "First broken turn",
   "q": "<p>A multi-turn conversation is a list of dicts <code>{\"ok\": True/False}</code>, one per turn. Write <code>first_break(turns)</code> returning the <b>1-based</b> number of the first turn where <code>ok</code> is false, or <code>None</code> if every turn was fine.</p>",
   "starter": "def first_break(turns):\n    for i, t in enumerate(turns):\n        pass\n    return None\n",
   "tests": [
    {
     "n": "break at turn 3",
     "code": "assert first_break([{\"ok\":True},{\"ok\":True},{\"ok\":False},{\"ok\":False}])==3,\"first false is the third turn: expected 3\""
    },
    {
     "n": "never breaks",
     "code": "assert first_break([{\"ok\":True}])is None,\"no failing turn: expected None\""
    },
    {
     "n": "first turn fails",
     "code": "assert first_break([{\"ok\":False}])==1,\"1-based numbering: expected 1\"",
     "hidden": true
    },
    {
     "n": "empty",
     "code": "assert first_break([]) is None,\"empty: expected None\"",
     "hidden": true
    }
   ],
   "hints": [
    "<code>enumerate(turns, 1)</code> counts from 1.",
    "Return the number as soon as you see <code>not t[\"ok\"]</code>."
   ],
   "solution": "def first_break(turns):\n    for i, t in enumerate(turns, 1):\n        if not t[\"ok\"]:\n            return i\n    return None",
   "why": "Knowing the first failing turn tells you whether conversations die early (a setup problem) or late (a memory or drift problem)."
  }
 ]
};
