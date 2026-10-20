window.NEWLV=window.NEWLV||{};window.NEWLV["lJ"]={
"id": "lJ",
"icon": "⚖️",
"title": "Judge engineering",
"blurb": "Write a model judge, parse its verdicts, test it for bias, measure agreement with your own labels and improve the rubric.",
"lesson": [
{
"h": "A judge is a measuring instrument",
"b": "<p>An <b>LLM judge</b> is a model that is shown a question, an answer and a rubric, and asked for a verdict. It scales better than people, but it is an instrument with errors, so you calibrate it before you trust it. Known weak spots reported in the research literature include <b>position bias</b> (favouring the answer shown first), <b>length bias</b> (favouring longer answers) and <b>self-preference</b> (favouring answers in its own style). <i>Contested:</i> how large these effects are varies a lot with the model, the prompt and the task, so measure them on your own data rather than assuming.</p>\n<p>A good judge prompt has: the criteria in plain words, one or two worked examples, a request for brief reasoning <i>before</i> the verdict, and a fixed output format.</p>"
},
{
"h": "Getting a verdict you can count",
"b": "<p>Judges answer in free text, and your code has to turn that into a label. Ask for a rigid last line such as <code>VERDICT: PASS</code> or <code>VERDICT: FAIL</code>, then parse only that line.</p>\n<pre class=\"code\">def parse_verdict(text):\n    low = text.lower()\n    i = low.rfind(\"verdict:\")\n    if i &lt; 0:\n        return \"unclear\"\n    ...</pre>\n<p>Two rules matter. Take the <b>last</b> verdict (models sometimes reconsider). And never treat an unparseable reply as a pass: count it as <code>unclear</code>, report how many there were, and fix the prompt if there are many. A silent default can quietly raise or lower your score.</p>"
},
{
"h": "The swap test",
"b": "<p>When a judge compares two answers (A versus B), run every pair <b>twice</b>, once in each order. If the judge picks the same underlying answer both times it is <b>consistent</b>. If its pick follows the position instead, it is position-biased. Report the consistency rate and how often it picks the first-shown answer; treat inconsistent pairs as ties, or send them to a person.</p>\n<p>A judge that picks \"first shown\" about half the time and is consistent on most pairs is behaving well. One that picks the first position 80% of the time is mostly measuring layout, not quality.</p>"
},
{
"h": "Agreement with your own labels",
"b": "<p>Label 50 to 200 items yourself (or with a colleague) <b>before</b> you look at the judge. Then compare. <b>Raw agreement</b> can flatter a lazy judge: if 90% of items are passes, a judge that says \"pass\" every time agrees 90% of the time. <b>Cohen's kappa</b> corrects for chance agreement: <code>kappa = (p_o - p_e) / (1 - p_e)</code>, where <i>p_o</i> is observed agreement and <i>p_e</i> is the agreement you would expect by chance from each side's label frequencies. The always-pass judge gets kappa 0.</p>\n<p>Also report the <b>direction</b> of the errors: the false pass rate (judge passes things you failed) and the false fail rate. For a safety check a false pass is usually the costly one. <i>Contested:</i> verbal labels such as \"moderate\" or \"substantial\" agreement for kappa values are conventions, not rules; what you need depends on the decision.</p>"
},
{
"h": "Iterate the rubric without fooling yourself",
"b": "<p>Look at the cases where judge and human <b>disagree</b>, and ask for each: is the rubric ambiguous, is the judge wrong, or is my label wrong? Group disagreements by a tag (topic, language, answer length) to find the pattern, then change one thing at a time and keep the old version.</p>\n<p>The trap: if you tune the rubric on the same items you measure on, agreement will rise partly because you have fitted the rubric to those items. Keep a <b>second, untouched labelled set</b> and check the final rubric on it. Write down each rubric version and its agreement so a change can be undone.</p>"
}
],
"qs": [
{
"t": "mc",
"q": "Your judge sometimes replies \"I think this probably passes\". What is the best fix?",
"opts": [
"Require a fixed final line such as VERDICT: PASS or FAIL, and count unparseable replies instead of treating them as passes",
"Count every reply that mentions \"pass\" as a pass",
"Ignore those replies and compute the score on the rest without saying so",
"Lower the temperature and hope for the best"
],
"a": 0,
"why": "A rigid format makes parsing reliable, and counting the leftovers keeps the score honest."
},
{
"t": "mc",
"q": "In a pairwise comparison the judge picks whichever answer is shown first about 80% of the time, whatever the content. What is the likely problem and the check?",
"opts": [
"Position bias; run each pair in both orders and measure how often the pick is consistent",
"Length bias; shorten all the answers",
"The answers are all identical, so nothing can be done",
"The judge is perfectly fair, because 80% is a high score"
],
"a": 0,
"why": "Swapping the order separates the quality signal from the position effect."
},
{
"t": "num",
"q": "Observed agreement between judge and human is 0.9, and the agreement expected by chance is 0.5. What is Cohen's kappa?",
"a": 0.8,
"tol": 0.01,
"why": "(0.9 - 0.5) / (1 - 0.5) = 0.8."
},
{
"t": "num",
"q": "Of 40 items you labelled as fails, the judge passed 10. What is the false pass rate, as a percentage?",
"a": 25,
"tol": 0.5,
"why": "10 / 40 = 25%. This is the error direction that matters most for a safety check.",
"unit": "%"
},
{
"t": "mc",
"q": "90% of your labelled items are passes, and the judge says \"pass\" for everything. Its raw agreement with you is 90%. What does kappa show?",
"opts": [
"Kappa is 0, because the judge agrees only as much as chance would predict",
"Kappa is 0.9, the same as raw agreement",
"Kappa is 1.0, because the judge never makes a false fail",
"Kappa cannot be computed for a judge that always agrees"
],
"a": 0,
"why": "Expected chance agreement is also 0.9 here, so (0.9 - 0.9) / (1 - 0.9) = 0."
},
{
"t": "mc",
"q": "You study the disagreements on your 60 labelled items, rewrite the rubric, and agreement rises from 70% to 88%. What should you do before trusting 88%?",
"opts": [
"Check the new rubric on fresh labelled items you did not use while tuning",
"Nothing, 88% is the result",
"Rewrite the rubric once more on the same 60 items",
"Delete the items where it still disagrees"
],
"a": 0,
"why": "The rubric was shaped around those 60 items, so a fresh set is needed to see whether the gain is real."
},
{
"t": "mc",
"q": "You suspect the judge likes long answers. Which check tests that directly?",
"opts": [
"Give it a short correct answer and a padded version of the same answer, and compare the verdicts",
"Ask the judge whether it likes long answers",
"Count the words in the rubric",
"Remove every long answer from the eval"
],
"a": 0,
"why": "A controlled pair that differs only in length isolates the effect."
},
{
"t": "mc",
"q": "The judge comes from the same model family as one of the systems you are comparing. What is a sensible precaution?",
"opts": [
"Check the judge against human labels on outputs from every system you compare, and consider a judge from a different family",
"Assume it is neutral, because it is accurate overall",
"Only test the system that matches the judge",
"Switch off the rubric"
],
"a": 0,
"why": "Models may favour answers in their own style (the size of this effect is debated), so check it on your own data."
},
{
"t": "num",
"q": "Observed agreement is 0.75 and chance agreement is 0.5. What is kappa?",
"a": 0.5,
"tol": 0.01,
"why": "(0.75 - 0.5) / (1 - 0.5) = 0.5."
},
{
"t": "code",
"id": "jd1",
"title": "Parse a judge reply",
"q": "<p>The judge ends its reply with a line like <code>VERDICT: PASS</code>. Write <code>parse_verdict(text)</code> returning <code>\"pass\"</code>, <code>\"fail\"</code> or <code>\"unclear\"</code>. Rules: find the <b>last</b> occurrence of <code>verdict:</code> (any capitalisation); take the first word after it, lower-cased, with surrounding punctuation (<code>. , ! * \" '</code>) removed. If that word is <code>pass</code> or <code>fail</code> return it; for anything else, no <code>verdict:</code> at all, or nothing after it, return <code>\"unclear\"</code>.</p>",
"starter": "def parse_verdict(text):\n    low = text.lower()\n    # find the last \"verdict:\" and read the word after it\n    return \"unclear\"\n\nprint(parse_verdict(\"Reasoning... VERDICT: PASS\"))",
"tests": [
{
"n": "plain pass",
"code": "assert parse_verdict(\"The answer cites the policy.\\nVERDICT: PASS\")==\"pass\",\"expected pass\""
},
{
"n": "lower-case fail with full stop",
"code": "assert parse_verdict(\"Verdict: fail.\")==\"fail\",\"expected fail\""
},
{
"n": "no verdict line",
"code": "assert parse_verdict(\"I think it passes\")==\"unclear\",\"no \\\"verdict:\\\" line, so unclear\""
},
{
"n": "last verdict wins",
"code": "assert parse_verdict(\"Verdict: pass\\nOn reflection, Verdict: fail\")==\"fail\",\"the last verdict should win\"",
"hidden": true
},
{
"n": "markdown and punctuation",
"code": "assert parse_verdict(\"**VERDICT: PASS**!\")==\"pass\",\"asterisks and ! around the word should be ignored: expected pass\"",
"hidden": true
},
{
"n": "other word",
"code": "assert parse_verdict(\"VERDICT: maybe\")==\"unclear\",\"\\\"maybe\\\" is not pass or fail: expected unclear\"",
"hidden": true
},
{
"n": "nothing after",
"code": "assert parse_verdict(\"VERDICT:\")==\"unclear\",\"nothing after verdict: should be unclear\"",
"hidden": true
},
{
"n": "empty text",
"code": "assert parse_verdict(\"\")==\"unclear\",\"empty text should be unclear\"",
"hidden": true
}
],
"hints": [
"Lower-case the text, then <code>low.rfind(\"verdict:\")</code> gives the position of the last match, or -1 if there is none.",
"Take <code>low[i + 8:]</code> (8 is the length of \"verdict:\"), strip it, and look at <code>.split()[0]</code>. Check the rest is not empty first.",
"Clean the word with <code>.strip(\".,!*\\\"'\")</code> and return it only if it is in <code>(\"pass\", \"fail\")</code>."
],
"solution": "def parse_verdict(text):\n    low = text.lower()\n    i = low.rfind(\"verdict:\")\n    if i < 0:\n        return \"unclear\"\n    rest = low[i + 8:].strip()\n    if not rest:\n        return \"unclear\"\n    word = rest.split()[0].strip(\".,!*\\\"'\")\n    return word if word in (\"pass\", \"fail\") else \"unclear\"",
"why": "Notice that \"unclear\" is a real answer. Counting those, instead of defaulting them to pass or fail, keeps your score honest."
},
{
"t": "code",
"id": "jd2",
"title": "The swap test",
"q": "<p>Each item in <code>pairs</code> is <code>(ab, ba)</code>: the judge's pick when the pair was shown in the original order, and its pick when shown <b>swapped</b>. Picks are <code>\"A\"</code>, <code>\"B\"</code> or <code>\"tie\"</code>; in the swapped run <code>\"A\"</code> means the answer shown <i>first</i>, which is the original B. Write <code>swap_report(pairs)</code> returning <code>(consistency, first_pick_rate)</code>:</p><ul><li><b>consistency</b>: the fraction of items where the judge chose the same underlying answer both times (swapped <code>\"A\"</code> means original <code>\"B\"</code>, swapped <code>\"B\"</code> means original <code>\"A\"</code>, a tie stays a tie);</li><li><b>first_pick_rate</b>: out of all <code>2 * len(pairs)</code> picks, the fraction that were <code>\"A\"</code> in the presented position.</li></ul><p>An empty list should raise <code>ValueError</code>.</p>",
"starter": "def swap_report(pairs):\n    pass\n\nprint(swap_report([(\"A\", \"B\"), (\"B\", \"A\"), (\"A\", \"A\"), (\"tie\", \"tie\")]))",
"tests": [
{
"n": "mixed example",
"code": "c,f=swap_report([(\"A\",\"B\"),(\"B\",\"A\"),(\"A\",\"A\"),(\"tie\",\"tie\")]);assert abs(c-0.75)<1e-9,\"consistency should be 0.75, got %s\"%c;assert abs(f-0.5)<1e-9,\"first_pick_rate should be 0.5, got %s\"%f"
},
{
"n": "always the first position",
"code": "c,f=swap_report([(\"A\",\"A\")]*4);assert c==0.0,\"always picking the first position is never consistent: expected 0.0, got %s\"%c;assert f==1.0,\"first_pick_rate should be 1.0, got %s\"%f"
},
{
"n": "fully consistent",
"code": "c,f=swap_report([(\"B\",\"A\"),(\"B\",\"A\")]);assert c==1.0,\"consistency should be 1.0, got %s\"%c;assert abs(f-0.5)<1e-9,\"first_pick_rate should be 0.5, got %s\"%f"
},
{
"n": "ties are consistent",
"code": "c,f=swap_report([(\"tie\",\"tie\"),(\"A\",\"B\")]);assert c==1.0,\"a tie both times is consistent\"",
"hidden": true
},
{
"n": "tie versus pick",
"code": "c,f=swap_report([(\"tie\",\"A\")]);assert c==0.0,\"tie then a pick is not consistent: expected 0.0, got %s\"%c;assert abs(f-0.5)<1e-9,\"first_pick_rate should be 0.5 here (one A of two picks), got %s\"%f",
"hidden": true
},
{
"n": "returns a pair",
"code": "assert len(swap_report([(\"A\",\"B\")]))==2,\"should return (consistency, first_pick_rate)\"",
"hidden": true
},
{
"n": "empty raises",
"code": "ok=False\ntry:\n    swap_report([])\nexcept ValueError:\n    ok=True\nassert ok,\"an empty list should raise ValueError\"",
"hidden": true
}
],
"hints": [
"Write a small dictionary that flips the swapped pick back: <code>flip = {\"A\": \"B\", \"B\": \"A\", \"tie\": \"tie\"}</code>.",
"An item is consistent when <code>ab == flip[ba]</code>.",
"For first_pick_rate, count <code>ab == \"A\"</code> plus <code>ba == \"A\"</code> over all items, and divide by <code>2 * len(pairs)</code>."
],
"solution": "def swap_report(pairs):\n    if not pairs:\n        raise ValueError(\"no pairs\")\n    flip = {\"A\": \"B\", \"B\": \"A\", \"tie\": \"tie\"}\n    same = sum(1 for ab, ba in pairs if ab == flip[ba])\n    first = sum((ab == \"A\") + (ba == \"A\") for ab, ba in pairs)\n    return (same / len(pairs), first / (2 * len(pairs)))",
"why": "A consistent judge with a first_pick_rate near 0.5 is not following position. A high first_pick_rate with low consistency means the judge mostly reads the layout."
},
{
"t": "code",
"id": "jd3",
"title": "Judge versus your labels",
"q": "<p><code>judge</code> and <code>human</code> are equal-length lists of <code>\"pass\"</code>/<code>\"fail\"</code>. Write <code>judge_report(judge, human)</code> returning a dict with: <code>\"agreement\"</code> (fraction equal), <code>\"kappa\"</code> (Cohen's kappa: <code>(p_o - p_e) / (1 - p_e)</code> with <code>p_e</code> from each list's pass and fail frequencies; if <code>p_e == 1</code> return <code>1.0</code>), <code>\"false_pass_rate\"</code> (human fails the judge passed, divided by human fails; <code>None</code> if the human failed nothing), and <code>\"false_fail_rate\"</code> (human passes the judge failed, divided by human passes; <code>None</code> if the human passed nothing). Different lengths or empty lists raise <code>ValueError</code>.</p>",
"starter": "def judge_report(judge, human):\n    n = len(judge)\n    pass\n\nj = [\"pass\",\"pass\",\"fail\",\"pass\",\"fail\",\"fail\",\"pass\",\"pass\"]\nh = [\"pass\",\"fail\",\"fail\",\"pass\",\"fail\",\"pass\",\"pass\",\"pass\"]\nprint(judge_report(j, h))",
"tests": [
{
"n": "worked example",
"code": "j=[\"pass\",\"pass\",\"fail\",\"pass\",\"fail\",\"fail\",\"pass\",\"pass\"];h=[\"pass\",\"fail\",\"fail\",\"pass\",\"fail\",\"pass\",\"pass\",\"pass\"];r=judge_report(j,h);assert abs(r[\"agreement\"]-0.75)<1e-9,\"agreement should be 0.75, got %s\"%r[\"agreement\"];assert abs(r[\"kappa\"]-0.46667)<1e-4,\"kappa should be about 0.4667, got %s\"%r[\"kappa\"];assert abs(r[\"false_pass_rate\"]-1/3)<1e-9,\"false_pass_rate should be 1/3, got %s\"%r[\"false_pass_rate\"];assert abs(r[\"false_fail_rate\"]-0.2)<1e-9,\"false_fail_rate should be 0.2, got %s\"%r[\"false_fail_rate\"]"
},
{
"n": "perfect judge",
"code": "r=judge_report([\"pass\",\"fail\"],[\"pass\",\"fail\"]);assert r[\"agreement\"]==1.0 and abs(r[\"kappa\"]-1.0)<1e-9,\"a perfect judge has agreement 1.0 and kappa 1.0\";assert r[\"false_pass_rate\"]==0.0 and r[\"false_fail_rate\"]==0.0,\"a perfect judge makes no false passes or false fails\""
},
{
"n": "always-pass judge has kappa 0",
"code": "h=[\"pass\"]*9+[\"fail\"];r=judge_report([\"pass\"]*10,h);assert abs(r[\"agreement\"]-0.9)<1e-9,\"agreement should be 0.9, got %s\"%r[\"agreement\"];assert abs(r[\"kappa\"])<1e-9,\"an always-pass judge has kappa 0, got %s\"%r[\"kappa\"];assert r[\"false_pass_rate\"]==1.0,\"it passed the one human fail: false_pass_rate should be 1.0, got %s\"%r[\"false_pass_rate\"]"
},
{
"n": "no human fails",
"code": "r=judge_report([\"pass\",\"fail\"],[\"pass\",\"pass\"]);assert r[\"false_pass_rate\"] is None,\"the human failed nothing, so false_pass_rate should be None\"",
"hidden": true
},
{
"n": "both always pass",
"code": "r=judge_report([\"pass\",\"pass\"],[\"pass\",\"pass\"]);assert r[\"kappa\"]==1.0,\"when chance agreement is 1, return kappa 1.0\"",
"hidden": true
},
{
"n": "lengths differ",
"code": "ok=False\ntry:\n    judge_report([\"pass\"],[\"pass\",\"fail\"])\nexcept ValueError:\n    ok=True\nassert ok,\"different lengths should raise ValueError\"",
"hidden": true
},
{
"n": "empty",
"code": "ok=False\ntry:\n    judge_report([],[])\nexcept ValueError:\n    ok=True\nassert ok,\"empty lists should raise ValueError\"",
"hidden": true
}
],
"hints": [
"Start with the checks: equal lengths and not empty, otherwise raise <code>ValueError</code>. Then <code>p_o</code> is the share of positions where <code>j == h</code>.",
"For <code>p_e</code>: <code>pj = judge.count(\"pass\") / n</code> and <code>ph = human.count(\"pass\") / n</code>, so <code>p_e = pj * ph + (1 - pj) * (1 - ph)</code>.",
"False pass rate: among the positions where <code>h == \"fail\"</code>, how many have <code>j == \"pass\"</code>? Return <code>None</code> if there are no human fails (and the same idea for false fails)."
],
"solution": "def judge_report(judge, human):\n    n = len(judge)\n    if n == 0 or n != len(human):\n        raise ValueError(\"need equal, non-empty lists\")\n    po = sum(1 for j, h in zip(judge, human) if j == h) / n\n    pj = judge.count(\"pass\") / n\n    ph = human.count(\"pass\") / n\n    pe = pj * ph + (1 - pj) * (1 - ph)\n    kappa = 1.0 if pe == 1 else (po - pe) / (1 - pe)\n    hf = [j for j, h in zip(judge, human) if h == \"fail\"]\n    hp = [j for j, h in zip(judge, human) if h == \"pass\"]\n    fpr = hf.count(\"pass\") / len(hf) if hf else None\n    ffr = hp.count(\"fail\") / len(hp) if hp else None\n    return {\"agreement\": po, \"kappa\": kappa, \"false_pass_rate\": fpr, \"false_fail_rate\": ffr}",
"why": "Always report kappa next to raw agreement, and the direction of the errors. For a safety check, a false pass is usually the expensive mistake."
},
{
"t": "code",
"id": "jd4",
"title": "Where does the rubric fail?",
"q": "<p>Each item is a dict like <code>{\"tag\": \"math\", \"judge\": \"pass\", \"human\": \"fail\"}</code>. Write <code>disagreement_by_tag(items)</code> returning a dict that maps each tag to the <b>fraction of its items</b> where <code>judge != human</code> (a float from 0.0 to 1.0). An empty list returns <code>{}</code>.</p>",
"starter": "def disagreement_by_tag(items):\n    # count items and disagreements for each tag\n    return {}\n\nitems = [{\"tag\":\"math\",\"judge\":\"pass\",\"human\":\"fail\"}, {\"tag\":\"math\",\"judge\":\"pass\",\"human\":\"pass\"}]\nprint(disagreement_by_tag(items))",
"tests": [
{
"n": "two tags",
"code": "items=[{\"tag\":\"math\",\"judge\":\"pass\",\"human\":\"pass\"},{\"tag\":\"math\",\"judge\":\"pass\",\"human\":\"fail\"},{\"tag\":\"safety\",\"judge\":\"fail\",\"human\":\"fail\"},{\"tag\":\"math\",\"judge\":\"fail\",\"human\":\"fail\"},{\"tag\":\"safety\",\"judge\":\"pass\",\"human\":\"fail\"},{\"tag\":\"safety\",\"judge\":\"pass\",\"human\":\"fail\"}];r=disagreement_by_tag(items);assert abs(r[\"math\"]-1/3)<1e-9,\"math: 1 of 3 disagree, expected 0.333, got %s\"%r.get(\"math\");assert abs(r[\"safety\"]-2/3)<1e-9,\"safety: 2 of 3 disagree, expected 0.667, got %s\"%r.get(\"safety\")"
},
{
"n": "one tag, all agree",
"code": "r=disagreement_by_tag([{\"tag\":\"x\",\"judge\":\"pass\",\"human\":\"pass\"}]);assert r=={\"x\":0.0},\"one agreeing item should give {\\\"x\\\": 0.0}, got %s\"%r"
},
{
"n": "empty list",
"code": "assert disagreement_by_tag([])=={},\"empty list should give {}\""
},
{
"n": "a tag with no disagreements still appears",
"code": "r=disagreement_by_tag([{\"tag\":\"a\",\"judge\":\"pass\",\"human\":\"pass\"},{\"tag\":\"b\",\"judge\":\"pass\",\"human\":\"fail\"}]);assert r.get(\"a\")==0.0 and r.get(\"b\")==1.0,\"expected a: 0.0 and b: 1.0, got %s\"%r",
"hidden": true
},
{
"n": "rates are floats",
"code": "r=disagreement_by_tag([{\"tag\":\"a\",\"judge\":\"pass\",\"human\":\"fail\"}]);assert isinstance(r[\"a\"],float),\"rates should be floats\"",
"hidden": true
},
{
"n": "input not changed",
"code": "items=[{\"tag\":\"a\",\"judge\":\"pass\",\"human\":\"fail\"}];disagreement_by_tag(items);assert items==[{\"tag\":\"a\",\"judge\":\"pass\",\"human\":\"fail\"}],\"the input was modified\"",
"hidden": true
}
],
"hints": [
"Keep two dictionaries, or one dictionary of <code>[disagreements, total]</code> pairs, keyed by tag.",
"Loop over the items: add 1 to the tag's total, and add 1 to its disagreements when <code>item[\"judge\"] != item[\"human\"]</code>.",
"Finish with a dictionary comprehension: tag -> disagreements / total. Use <code>dict.get(tag, 0)</code> or <code>setdefault</code> so a tag seen for the first time does not crash."
],
"solution": "def disagreement_by_tag(items):\n    tot = {}\n    bad = {}\n    for it in items:\n        t = it[\"tag\"]\n        tot[t] = tot.get(t, 0) + 1\n        bad[t] = bad.get(t, 0) + (1 if it[\"judge\"] != it[\"human\"] else 0)\n    return {t: bad[t] / tot[t] for t in tot}",
"why": "The tag with the highest rate points to the rubric rule to fix next. Change one thing, then re-check on a fresh labelled set."
}
]
};
