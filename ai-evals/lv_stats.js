window.NEWLV=window.NEWLV||{};window.NEWLV["lS"]={
"id": "lS",
"icon": "📊",
"title": "Statistics for evals",
"blurb": "Uncertainty, paired comparisons, the bootstrap, clustered cases and how many cases you need.",
"lesson": [
{
"h": "A score is an estimate",
"b": "<p>An eval pass rate is measured on a sample of cases, so it is an <b>estimate</b> of how the system would do on all cases like these. Run it on a different sample and the number moves. With <i>k</i> passes out of <i>n</i> cases, the pass rate is <code>p = k / n</code> and its <b>standard error</b> is roughly <code>sqrt(p * (1 - p) / n)</code>.</p>\n<p>A rough 95% interval is <code>p ± 1.96 × standard error</code> (the \"normal approximation\"). With 80 of 100 passing the standard error is 0.04, so the interval is about 72% to 88%. With 800 of 1,000 it narrows to about 77% to 83%. That is why you always report <b>how many cases</b> a score rests on.</p>\n<p>The formula is crude for small <i>n</i> or for scores near 0% or 100%: at 0 of 10 it says the interval has zero width, which is plainly too confident. Other interval methods (Wilson and Clopper-Pearson are common) behave better there. <i>Contested:</i> which interval to use is a judgement call, and for small samples it matters.</p>"
},
{
"h": "Comparing two models on the same cases",
"b": "<p>If you run models A and B on the <b>same</b> cases, each case falls in one of four groups: both pass, only A passes, only B passes, both fail. The \"both\" groups tell you nothing about which is better. Only the cases where they <b>disagree</b> carry information.</p>\n<p>Work with one number per case: <code>d = A - B</code>, which is 1, 0 or -1. The difference in pass rate is the mean of <code>d</code>, and its standard error is <code>sqrt(var(d) / n)</code>, where <code>var(d)</code> is the mean of <code>d²</code> minus the mean of <code>d</code>, squared. Pairing usually gives a tighter interval than comparing two separate pass rates, because hard cases are hard for both models, and pairing cancels that shared difficulty.</p>\n<p>If the difference is smaller than about two standard errors, you have not shown that one model is better. You have shown only that you cannot tell yet.</p>"
},
{
"h": "The bootstrap",
"b": "<p>What if your metric has no neat formula (say an F1 score, or a median)? The <b>bootstrap</b> gives an interval anyway. Treat your <i>n</i> cases as if they were the whole population, draw <i>n</i> cases <b>with replacement</b> (so some repeat and some are left out), compute the metric, and repeat a thousand or more times. The middle 95% of those values (the 2.5th to the 97.5th percentile) is a <b>percentile bootstrap interval</b>.</p>\n<p>It assumes your cases are independent samples. It can be unreliable for very small samples and for scores near the edges. Set a random seed so someone else can reproduce your number. <i>Contested:</i> several variants of the bootstrap exist, and for small data they can disagree.</p>"
},
{
"h": "Cases that travel together: clustering",
"b": "<p>The formulas above assume each case is an independent draw. Often it is not. Ten questions written from the same document, or twenty prompts made from one template, tend to be answered right or wrong together. That means 200 cases may carry far less information than 200 independent ones.</p>\n<p>A common rule of thumb is the <b>design effect</b>: <code>1 + (m - 1) × ρ</code>, where <i>m</i> is the cluster size and <i>ρ</i> (rho) is how correlated cases in a cluster are. With clusters of 10 and ρ = 0.5 the design effect is 5.5, so 200 cases behave more like 36 independent ones.</p>\n<p>Two fixes: treat the <b>cluster</b> as the unit (compute a pass rate per cluster, then the standard error across clusters), or resample whole clusters in the bootstrap. Ignoring clustering makes your interval too narrow, so you look more certain than you are.</p>"
},
{
"h": "How many cases do you need? Power",
"b": "<p>Suppose model B is truly better by a small amount. <b>Power</b> is the chance your eval would detect it. To compare two pass rates <i>p1</i> and <i>p2</i> on separate samples with a 5% significance level and 80% power, a common approximation is <code>n per model ≈ 7.84 × (p1(1-p1) + p2(1-p2)) / (p1 - p2)²</code> (7.84 is 2.8 squared, where 2.8 is about 1.96 + 0.84).</p>\n<p>For 70% versus 75%, that is about 1,247 cases per model. Halve the gap and you need about four times as many cases, because the gap is squared. A paired design on the same cases usually needs fewer. If you only have 100 cases, you can detect big gaps only, and that is worth saying out loud.</p>\n<p><i>Contested:</i> the 5% and 80% settings are conventions, not laws. How much evidence you should demand depends on what a wrong decision costs.</p>"
}
],
"qs": [
{
"t": "mc",
"q": "A report says \"the model scores 90%\" and says nothing else. The eval has 20 cases. What is the most important thing to add?",
"opts": [
"How many cases it used, and the uncertainty range around 90%",
"A longer description of the model",
"The date of the run, in bold",
"Nothing, 90% is already precise"
],
"a": 0,
"why": "With 20 cases the real rate could plausibly be anywhere from about 77% to 100%. The score alone hides that."
},
{
"t": "num",
"q": "A model passes 50 of 100 cases. Using <code>sqrt(p(1-p)/n)</code>, what is the standard error, in percentage points?",
"a": 5,
"tol": 0.1,
"why": "sqrt(0.5 x 0.5 / 100) = 0.05, which is 5 percentage points.",
"unit": "percentage points"
},
{
"t": "num",
"q": "A model passes 80 of 100 cases (standard error 4 points). What is the half-width of the rough 95% interval (1.96 standard errors), in percentage points?",
"a": 7.8,
"tol": 0.2,
"why": "1.96 x 4 = 7.84 points, so about 72% to 88%.",
"unit": "percentage points"
},
{
"t": "mc",
"q": "Models A and B run on the same 200 cases. Why is a paired comparison usually better than comparing two separate pass rates?",
"opts": [
"Hard cases are hard for both models, and pairing cancels that shared difficulty",
"It lets you use fewer decimal places",
"It removes the need for any randomness in the models",
"It guarantees the better model wins"
],
"a": 0,
"why": "Pairing looks at the per-case difference, so shared case difficulty drops out of the noise."
},
{
"t": "num",
"q": "Same 200 cases. Both pass: 120. Only A passes: 30. Only B passes: 10. Both fail: 40. By how many percentage points does A beat B?",
"a": 10,
"tol": 0.1,
"why": "(30 - 10) / 200 = 0.10, which is 10 percentage points. The 120 and 40 cases do not affect the difference.",
"unit": "percentage points"
},
{
"t": "mc",
"q": "Your 200 test questions come from 10 documents, 20 per document, and questions on one document tend to be answered right or wrong together. How much information do you really have?",
"opts": [
"Fewer than 200 independent cases, and how many fewer depends on how correlated they are",
"Exactly 200, since every question is separate",
"Exactly 10, no matter what",
"More than 200, because of the repetition"
],
"a": 0,
"why": "Correlated cases carry less information than independent ones. The design effect estimates how much less."
},
{
"t": "num",
"q": "Cases come in clusters of 10 with correlation ρ = 0.3. What is the design effect, <code>1 + (m - 1) × ρ</code>?",
"a": 3.7,
"tol": 0.05,
"why": "1 + 9 x 0.3 = 3.7. Your interval should be wider by the square root of that, about 1.9 times."
},
{
"t": "mc",
"q": "Two models score 71% and 73% on 100 cases each. What is the fairest conclusion?",
"opts": [
"You cannot tell them apart yet: a gap that small is well within the noise at this size",
"Model 2 is better",
"Model 1 is better",
"The eval is broken"
],
"a": 0,
"why": "The standard error of the gap is roughly 6 to 9 points here, far above 2 points. More cases, or a paired design, could change the picture."
},
{
"t": "mc",
"q": "In a bootstrap, what exactly do you resample?",
"opts": [
"Your own cases, drawn with replacement, to the same size as the original set",
"New cases invented by the model",
"Only the cases the model failed",
"The model's weights"
],
"a": 0,
"why": "Resampling with replacement mimics drawing a new sample of the same size from the same population."
},
{
"t": "num",
"q": "Using the rule of thumb <code>7.84 × (p1(1-p1) + p2(1-p2)) / (p1 - p2)²</code>, about how many cases per model are needed to tell 50% from 60%? Round up to the next whole number.",
"a": 385,
"tol": 2,
"why": "7.84 x (0.25 + 0.24) / 0.01 = 384.2, so about 385 cases per model.",
"unit": "cases"
},
{
"t": "code",
"id": "st1",
"title": "A rough 95% interval",
"q": "<p>Write <code>ci_normal(k, n)</code> for <code>k</code> passes out of <code>n</code> cases. Compute <code>p = k / n</code>, <code>se = sqrt(p * (1 - p) / n)</code>, and return the tuple <code>(low, high)</code> equal to <code>p - 1.96 * se</code> and <code>p + 1.96 * se</code>, clipped so low is never below 0.0 and high is never above 1.0. If <code>n == 0</code>, return <code>(0.0, 1.0)</code>. (<code>from math import sqrt</code> is allowed.)</p>",
"starter": "from math import sqrt\n\ndef ci_normal(k, n):\n    # handle n == 0 first, then compute p and se\n    pass\n\nprint(ci_normal(80, 100))",
"tests": [
{
"n": "80 of 100",
"code": "lo,hi=ci_normal(80,100);assert abs(lo-0.7216)<0.001 and abs(hi-0.8784)<0.001,\"ci_normal(80, 100) should be about (0.7216, 0.8784), got (%.4f, %.4f)\"%(lo,hi)"
},
{
"n": "50 of 100",
"code": "lo,hi=ci_normal(50,100);assert abs(lo-0.402)<0.001 and abs(hi-0.598)<0.001,\"ci_normal(50, 100) should be about (0.402, 0.598), got (%.4f, %.4f)\"%(lo,hi)"
},
{
"n": "returns a pair",
"code": "r=ci_normal(8,10);assert len(r)==2 and r[0]<r[1],\"should return (low, high) with low < high\""
},
{
"n": "no cases",
"code": "assert tuple(ci_normal(0,0))==(0.0,1.0),\"with n = 0 return (0.0, 1.0)\"",
"hidden": true
},
{
"n": "clipped at 1",
"code": "lo,hi=ci_normal(99,100);assert hi==1.0,\"99 of 100: the upper end is above 1, so it must be clipped to 1.0, got %.4f\"%hi",
"hidden": true
},
{
"n": "clipped at 0",
"code": "lo,hi=ci_normal(1,100);assert lo==0.0,\"1 of 100: the lower end is below 0, so it must be clipped to 0.0, got %.4f\"%lo",
"hidden": true
},
{
"n": "bigger sample, narrower",
"code": "a=ci_normal(80,100);b=ci_normal(800,1000);assert (b[1]-b[0])<(a[1]-a[0]),\"1000 cases should give a narrower interval than 100 cases\"",
"hidden": true
}
],
"hints": [
"First the special case: <code>if n == 0:</code> return <code>(0.0, 1.0)</code>.",
"Then <code>p = k / n</code> and <code>se = sqrt(p * (1 - p) / n)</code>.",
"To clip: <code>max(0.0, p - 1.96 * se)</code> for the low end and <code>min(1.0, p + 1.96 * se)</code> for the high end."
],
"solution": "from math import sqrt\n\ndef ci_normal(k, n):\n    if n == 0:\n        return (0.0, 1.0)\n    p = k / n\n    se = sqrt(p * (1 - p) / n)\n    return (max(0.0, p - 1.96 * se), min(1.0, p + 1.96 * se))",
"why": "Notice that this formula would say ci_normal(0, 10) has zero width, which is too confident. Better interval methods exist for small samples and extreme scores."
},
{
"t": "code",
"id": "st2",
"title": "Paired comparison of two models",
"q": "<p><code>a</code> and <code>b</code> are lists of results (<code>1</code>/<code>0</code> or <code>True</code>/<code>False</code>) for model A and model B on the <b>same</b> cases, in the same order. Write <code>paired_diff(a, b)</code> returning <code>(diff, se)</code>, where <code>d_i = a_i - b_i</code> for each case, <code>diff</code> is the mean of <code>d</code>, and <code>se = sqrt(var / n)</code> with <code>var = mean(d²) - diff²</code>. If the lists are empty or have different lengths, raise <code>ValueError</code>.</p>",
"starter": "from math import sqrt\n\ndef paired_diff(a, b):\n    # one number per case: d = a_i - b_i\n    pass\n\nprint(paired_diff([1, 1, 0, 1], [1, 0, 0, 0]))",
"tests": [
{
"n": "worked example",
"code": "a=[1,1,0,0,1,1,0,1,1,1];b=[1,0,0,1,1,0,0,1,0,1];d,s=paired_diff(a,b);assert abs(d-0.2)<1e-9,\"diff should be 0.2, got %s\"%d;assert abs(s-0.18974)<1e-4,\"se should be about 0.18974, got %s\"%s"
},
{
"n": "B better gives negative diff",
"code": "d,s=paired_diff([0,0,1,0],[1,1,1,0]);assert d<0,\"B is better here so diff should be negative, got %s\"%d"
},
{
"n": "identical models",
"code": "assert paired_diff([1,0,1],[1,0,1])==(0.0,0.0),\"identical results should give (0.0, 0.0)\""
},
{
"n": "True/False input",
"code": "d,s=paired_diff([True,False,True,True],[True,True,False,False]);assert abs(d-0.25)<1e-9,\"True/False should work like 1/0: expected diff 0.25, got %s\"%d",
"hidden": true
},
{
"n": "different lengths",
"code": "ok=False\ntry:\n    paired_diff([1,0],[1])\nexcept ValueError:\n    ok=True\nassert ok,\"lists of different length should raise ValueError\"",
"hidden": true
},
{
"n": "empty lists",
"code": "ok=False\ntry:\n    paired_diff([],[])\nexcept ValueError:\n    ok=True\nassert ok,\"empty lists should raise ValueError\"",
"hidden": true
}
],
"hints": [
"Build the per-case differences first: <code>d = [int(x) - int(y) for x, y in zip(a, b)]</code>.",
"<code>diff = sum(d) / n</code>, and <code>mean_sq = sum(x * x for x in d) / n</code>.",
"<code>var = mean_sq - diff ** 2</code> and <code>se = sqrt(var / n)</code>. Check the lengths and emptiness at the top and raise <code>ValueError</code>."
],
"solution": "from math import sqrt\n\ndef paired_diff(a, b):\n    if len(a) != len(b) or len(a) == 0:\n        raise ValueError(\"need equal, non-empty lists\")\n    d = [int(x) - int(y) for x, y in zip(a, b)]\n    n = len(d)\n    diff = sum(d) / n\n    var = sum(x * x for x in d) / n - diff ** 2\n    return (diff, sqrt(max(var, 0.0) / n))",
"why": "If diff is smaller than about twice se, you have not shown that one model is better. You have shown that you cannot tell yet."
},
{
"t": "code",
"id": "st3",
"title": "Bootstrap interval",
"q": "<p>Write <code>bootstrap_ci(results, n_boot=1000, seed=0)</code>. <code>results</code> is a list of 1/0 (or True/False) per case. Use <code>rng = random.Random(seed)</code>. Repeat <code>n_boot</code> times: draw <code>len(results)</code> cases <b>with replacement</b> (<code>rng.choices(results, k=n)</code>) and compute the mean. Sort the means and return <code>(means[int(0.025 * n_boot)], means[int(0.975 * n_boot) - 1])</code>. An empty list should raise <code>ValueError</code>.</p>",
"starter": "import random\n\ndef bootstrap_ci(results, n_boot=1000, seed=0):\n    pass\n\nprint(bootstrap_ci([1] * 50 + [0] * 50))",
"tests": [
{
"n": "50 of 100 is centred near 0.5",
"code": "lo,hi=bootstrap_ci([1]*50+[0]*50);assert lo<0.5<hi,\"the interval for 50 of 100 should contain 0.5, got (%.3f, %.3f)\"%(lo,hi);assert 0.12<hi-lo<0.27,\"the width should be roughly 0.2, got %.3f\"%(hi-lo)"
},
{
"n": "low is not above high",
"code": "lo,hi=bootstrap_ci([1,0,1,1,0,1,1,1]);assert lo<=hi,\"low should not exceed high\""
},
{
"n": "stays within 0 and 1",
"code": "lo,hi=bootstrap_ci([1,0,1,1]);assert 0<=lo<=hi<=1,\"values must stay between 0 and 1\""
},
{
"n": "same seed, same answer",
"code": "assert bootstrap_ci([1,0,1,1,0,0,1],seed=3)==bootstrap_ci([1,0,1,1,0,0,1],seed=3),\"the same seed should give the same interval\"",
"hidden": true
},
{
"n": "all passes",
"code": "assert bootstrap_ci([1]*30)==(1.0,1.0),\"if every case passed, every resample is 1.0, so the interval is (1.0, 1.0)\"",
"hidden": true
},
{
"n": "bigger sample, narrower",
"code": "a=bootstrap_ci([1]*40+[0]*60);b=bootstrap_ci([1]*400+[0]*600);assert (b[1]-b[0])<(a[1]-a[0]),\"1,000 cases should give a narrower interval than 100\"",
"hidden": true
},
{
"n": "empty raises",
"code": "ok=False\ntry:\n    bootstrap_ci([])\nexcept ValueError:\n    ok=True\nassert ok,\"an empty list should raise ValueError\"",
"hidden": true
},
{
"n": "uses True/False",
"code": "lo,hi=bootstrap_ci([True,False]*20);assert 0.3<lo<hi<0.7,\"True/False should work like 1/0\"",
"hidden": true
}
],
"hints": [
"Make the random generator once: <code>rng = random.Random(seed)</code>, and raise <code>ValueError</code> if the list is empty.",
"Loop <code>n_boot</code> times; each time <code>sample = rng.choices(results, k=n)</code> and append <code>sum(sample) / n</code> to a list of means.",
"Sort the means, then return the two entries at the 2.5% and 97.5% positions given in the question."
],
"solution": "import random\n\ndef bootstrap_ci(results, n_boot=1000, seed=0):\n    n = len(results)\n    if n == 0:\n        raise ValueError(\"no results\")\n    rng = random.Random(seed)\n    means = []\n    for _ in range(n_boot):\n        sample = rng.choices(results, k=n)\n        means.append(sum(sample) / n)\n    means.sort()\n    return (means[int(0.025 * n_boot)], means[int(0.975 * n_boot) - 1])",
"why": "The bootstrap works for any metric, not just pass rates. Resample whole clusters instead of single cases if your cases come in groups."
},
{
"t": "code",
"id": "st4",
"title": "Standard error with clusters",
"q": "<p><code>clusters</code> is a list of clusters, each a list of 1/0 results (for example all the questions about one document). Write <code>clustered_se(clusters)</code>: compute the <b>mean of each cluster</b>, then return <code>statistics.stdev(cluster_means) / sqrt(number_of_clusters)</code>. This treats each cluster as one observation. Fewer than 2 clusters should raise <code>ValueError</code>.</p>",
"starter": "from math import sqrt\nfrom statistics import stdev\n\ndef clustered_se(clusters):\n    pass\n\nprint(clustered_se([[1, 1, 1, 1], [0, 0, 0, 0], [1, 1, 0, 0]]))",
"tests": [
{
"n": "three clusters",
"code": "s=clustered_se([[1,1,1,1],[0,0,0,0],[1,1,0,0]]);assert abs(s-0.288675)<1e-4,\"expected about 0.2887, got %s\"%s"
},
{
"n": "two clusters",
"code": "s=clustered_se([[1],[0,0,0]]);assert abs(s-0.5)<1e-9,\"clusters [[1],[0,0,0]] have means 1.0 and 0.0, expected 0.5, got %s\"%s"
},
{
"n": "larger than the naive figure",
"code": "c=[[1,1,1,1],[0,0,0,0],[1,1,0,0]];naive=sqrt(0.25/12);assert clustered_se(c)>naive,\"with strongly clustered results the clustered figure should exceed the naive 0.144\""
},
{
"n": "identical clusters",
"code": "assert clustered_se([[1,0],[1,0],[1,0]])==0.0,\"clusters with identical means should give 0.0\"",
"hidden": true
},
{
"n": "one cluster",
"code": "ok=False\ntry:\n    clustered_se([[1,0,1]])\nexcept ValueError:\n    ok=True\nassert ok,\"a single cluster cannot give a standard error: raise ValueError\"",
"hidden": true
},
{
"n": "empty",
"code": "ok=False\ntry:\n    clustered_se([])\nexcept ValueError:\n    ok=True\nassert ok,\"no clusters should raise ValueError\"",
"hidden": true
},
{
"n": "four clusters",
"code": "s=clustered_se([[1,1],[1,0],[0,0],[1,1]]);assert abs(s-0.2394)<1e-3,\"means 1, 0.5, 0, 1: expected about 0.2394, got %s\"%s",
"hidden": true
}
],
"hints": [
"First get one number per cluster: <code>means = [sum(c) / len(c) for c in clusters]</code>.",
"<code>stdev(means)</code> needs at least two numbers; check <code>len(clusters) &lt; 2</code> at the top and raise <code>ValueError</code>.",
"Return <code>stdev(means) / sqrt(len(means))</code>."
],
"solution": "from math import sqrt\nfrom statistics import stdev\n\ndef clustered_se(clusters):\n    if len(clusters) < 2:\n        raise ValueError(\"need at least 2 clusters\")\n    means = [sum(c) / len(c) for c in clusters]\n    return stdev(means) / sqrt(len(means))",
"why": "Compare it with the naive figure: when cases in a cluster move together, the honest standard error is larger. The simple version here weights every cluster equally; unequal cluster sizes need more care."
},
{
"t": "code",
"id": "st5",
"title": "How many cases do I need?",
"q": "<p>Write <code>cases_needed(p1, p2)</code> returning the number of cases <b>per model</b> needed to tell pass rates <code>p1</code> and <code>p2</code> apart, using <code>7.84 * (p1*(1-p1) + p2*(1-p2)) / (p1 - p2)**2</code>, rounded <b>up</b> to a whole number (<code>math.ceil</code>). If <code>p1 == p2</code>, raise <code>ValueError</code> (no number of cases can detect a gap of zero).</p>",
"starter": "from math import ceil\n\ndef cases_needed(p1, p2):\n    pass\n\nprint(cases_needed(0.7, 0.75))",
"tests": [
{
"n": "70% vs 75%",
"code": "assert cases_needed(0.7,0.75)==1247,\"cases_needed(0.7, 0.75) should be 1247, got %s\"%cases_needed(0.7,0.75)"
},
{
"n": "50% vs 60%",
"code": "assert cases_needed(0.5,0.6)==385,\"cases_needed(0.5, 0.6) should be 385, got %s\"%cases_needed(0.5,0.6)"
},
{
"n": "returns a whole number",
"code": "assert isinstance(cases_needed(0.5,0.6),int),\"should return an int (use ceil)\""
},
{
"n": "order does not matter",
"code": "assert cases_needed(0.75,0.7)==cases_needed(0.7,0.75),\"swapping p1 and p2 should not change the answer\"",
"hidden": true
},
{
"n": "halving the gap quadruples it",
"code": "a=cases_needed(0.5,0.6);b=cases_needed(0.5,0.55);assert 3.8<b/a<4.3,\"half the gap should need about four times as many cases, got ratio %.2f\"%(b/a)",
"hidden": true
},
{
"n": "equal rates raise",
"code": "ok=False\ntry:\n    cases_needed(0.6,0.6)\nexcept ValueError:\n    ok=True\nassert ok,\"p1 == p2 should raise ValueError\"",
"hidden": true
},
{
"n": "rounds up",
"code": "assert cases_needed(0.5,0.9)==17,\"0.5 vs 0.9 is 16.7 before rounding, so the answer is 17 (round up), got %s\"%cases_needed(0.5,0.9)",
"hidden": true
}
],
"hints": [
"Check <code>p1 == p2</code> first and raise <code>ValueError</code>.",
"The raw number is <code>7.84 * (p1*(1-p1) + p2*(1-p2)) / (p1 - p2)**2</code>.",
"Wrap it in <code>ceil(...)</code> so you always round up, and the result is a whole number."
],
"solution": "from math import ceil\n\ndef cases_needed(p1, p2):\n    if p1 == p2:\n        raise ValueError(\"no gap to detect\")\n    raw = 7.84 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p1 - p2) ** 2\n    return ceil(raw)",
"why": "The gap is squared, so small differences are expensive to detect. This is an approximation for two separate samples; paired designs usually need fewer cases."
}
]
};
