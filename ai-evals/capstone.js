window.APP.capstone={
 "title": "Eval report: can we trust this judge?",
 "intro": "The Citadel Workshop asks you to build one tool from the functions you wrote on the way here: take a batch of raw judge replies and your own human labels, and produce a report that says whether the judge can be trusted.",
 "needs": [
  {
   "id": "jd1",
   "fn": "parse_verdict",
   "title": "Parse a judge reply"
  },
  {
   "id": "ev-l4b",
   "fn": "pass_rate_ci",
   "title": "Pass rate with a 95% interval"
  },
  {
   "id": "ev-l7b",
   "fn": "cohen_kappa",
   "title": "Cohen's kappa: judge vs human"
  }
 ],
 "q": "<p>Write <code>eval_report(judge_replies, human_labels)</code>. <code>judge_replies</code> is a list of raw judge texts. <code>human_labels</code> is a list of <code>\"pass\"</code>/<code>\"fail\"</code> in the same order. Use your satchel functions <code>parse_verdict</code>, <code>pass_rate_ci</code> and <code>cohen_kappa</code>.</p><ol><li>Raise <code>ValueError</code> if the lists differ in length.</li><li>Parse every reply. Drop the ones that come back <code>\"unclear\"</code> (and their human labels). Let <code>unclear</code> be how many were dropped.</li><li>Return a dict with: <code>\"n\"</code> (replies kept), <code>\"unclear\"</code>, <code>\"pass_rate\"</code> and <code>\"ci\"</code> (a tuple <code>(low, high)</code>) from <code>pass_rate_ci</code> on the kept judge verdicts (<code>True</code> for pass), <code>\"kappa\"</code> from <code>cohen_kappa</code> on kept judge verdicts versus kept human labels, and <code>\"trust\"</code>.</li><li><code>\"trust\"</code> is <code>True</code> only if kappa is at least 0.6 <b>and</b> unclear is at most 10% of all replies.</li><li>If nothing is kept, return <code>n=0</code>, the unclear count, <code>pass_rate=0.0</code>, <code>ci=(0.0, 0.0)</code>, <code>kappa=None</code>, <code>trust=False</code>.</li></ol>",
 "starter": "def eval_report(judge_replies, human_labels):\n    # 1. check the lengths match\n    # 2. verdicts = [parse_verdict(r) for r in judge_replies]\n    # 3. keep only the pairs where the verdict is not \"unclear\"\n    # 4. pass_rate_ci on [v == \"pass\" for the kept verdicts]\n    # 5. cohen_kappa(kept verdicts, kept human labels)\n    return {}\n",
 "hints": [
  "Build <code>kept = [(v, h) for v, h in zip(verdicts, human_labels) if v != \"unclear\"]</code> and <code>unclear = len(verdicts) - len(kept)</code>.",
  "<code>p, low, high = pass_rate_ci([v == \"pass\" for v, h in kept])</code>",
  "<code>trust = kappa >= 0.6 and unclear <= 0.1 * len(judge_replies)</code>, and handle the empty case first."
 ],
 "solution": "def eval_report(judge_replies, human_labels):\n    if len(judge_replies) != len(human_labels):\n        raise ValueError(\"lists must be the same length\")\n    total = len(judge_replies)\n    verdicts = [parse_verdict(r) for r in judge_replies]\n    kept = [(v, h) for v, h in zip(verdicts, human_labels) if v != \"unclear\"]\n    unclear = total - len(kept)\n    if not kept:\n        return {\"n\": 0, \"unclear\": unclear, \"pass_rate\": 0.0, \"ci\": (0.0, 0.0), \"kappa\": None, \"trust\": False}\n    jv = [v for v, h in kept]\n    hl = [h for v, h in kept]\n    p, low, high = pass_rate_ci([v == \"pass\" for v in jv])\n    k = cohen_kappa(jv, hl)\n    trust = k >= 0.6 and unclear <= 0.1 * total\n    return {\"n\": len(kept), \"unclear\": unclear, \"pass_rate\": p, \"ci\": (low, high), \"kappa\": k, \"trust\": trust}",
 "why": "You have just chained three of your own functions into a tool you could use on a real eval: parse, drop what you cannot parse (and say how many), estimate with an interval, check against a human, then decide. That is the shape of the Expedition stages too.",
 "tests": [
  {
   "n": "perfect agreement",
   "code": "P=\"VERDICT: PASS\";F=\"VERDICT: FAIL\";r=eval_report([P,F,P,F],[\"pass\",\"fail\",\"pass\",\"fail\"]);assert r[\"n\"]==4 and r[\"unclear\"]==0,\"4 kept and 0 unclear, got %s\"%r;assert abs(r[\"pass_rate\"]-0.5)<1e-9,\"pass_rate should be 0.5, got %s\"%r[\"pass_rate\"];assert r[\"kappa\"]==1.0 and r[\"trust\"] is True,\"kappa 1.0 and trust True, got %s\"%r"
  },
  {
   "n": "confidence interval",
   "code": "r=eval_report([\"VERDICT: PASS\",\"VERDICT: FAIL\",\"VERDICT: PASS\",\"VERDICT: FAIL\"],[\"pass\",\"fail\",\"pass\",\"fail\"]);lo,hi=r[\"ci\"];assert abs(lo-0.01)<0.002 and abs(hi-0.99)<0.002,\"ci for 2 of 4 should be about (0.01, 0.99), got %s\"%(r[\"ci\"],)"
  },
  {
   "n": "unclear replies are dropped and counted",
   "code": "r=eval_report([\"VERDICT: PASS\",\"maybe\",\"VERDICT: FAIL\",\"VERDICT: PASS\"],[\"pass\",\"fail\",\"fail\",\"fail\"]);assert r[\"n\"]==3 and r[\"unclear\"]==1,\"3 kept and 1 unclear, got n=%s unclear=%s\"%(r[\"n\"],r[\"unclear\"]);assert abs(r[\"pass_rate\"]-0.667)<0.002,\"pass_rate of the kept three should be 0.667, got %s\"%r[\"pass_rate\"];assert abs(r[\"kappa\"]-0.4)<0.002,\"kappa should be 0.4, got %s\"%r[\"kappa\"];assert r[\"trust\"] is False,\"kappa 0.4 is below 0.6, so trust is False\""
  },
  {
   "n": "nothing parseable",
   "code": "r=eval_report([\"hmm\",\"no idea\"],[\"pass\",\"fail\"]);assert r[\"n\"]==0 and r[\"unclear\"]==2 and r[\"kappa\"] is None and r[\"trust\"] is False and r[\"ci\"]==(0.0,0.0) and r[\"pass_rate\"]==0.0,\"all unclear: expected n=0, unclear=2, kappa None, trust False, got %s\"%r",
   "hidden": true
  },
  {
   "n": "too many unclear blocks trust",
   "code": "rep=[\"VERDICT: PASS\"]*4+[\"VERDICT: FAIL\"]*4+[\"huh\",\"huh\"];hum=[\"pass\"]*4+[\"fail\"]*4+[\"pass\",\"fail\"];r=eval_report(rep,hum);assert r[\"kappa\"]==1.0,\"kept items agree perfectly, so kappa 1.0, got %s\"%r[\"kappa\"];assert r[\"trust\"] is False,\"2 of 10 unclear is more than 10 percent, so trust must be False, got %s\"%r[\"trust\"]",
   "hidden": true
  },
  {
   "n": "one unclear in eleven is allowed",
   "code": "rep=[\"VERDICT: PASS\"]*5+[\"VERDICT: FAIL\"]*5+[\"huh\"];hum=[\"pass\"]*5+[\"fail\"]*5+[\"pass\"];r=eval_report(rep,hum);assert r[\"unclear\"]==1 and r[\"trust\"] is True,\"1 of 11 unclear is under 10 percent, so trust is True, got %s\"%r",
   "hidden": true
  },
  {
   "n": "different lengths",
   "code": "try:\n    eval_report([\"VERDICT: PASS\"],[])\n    assert False,\"different lengths should raise ValueError\"\nexcept ValueError:\n    pass",
   "hidden": true
  },
  {
   "n": "inputs are not changed",
   "code": "a=[\"VERDICT: PASS\",\"x\"];b=[\"pass\",\"fail\"];eval_report(a,b);assert a==[\"VERDICT: PASS\",\"x\"] and b==[\"pass\",\"fail\"],\"the input lists were modified\"",
   "hidden": true
  }
 ]
};
