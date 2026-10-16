/* Assessment fixes applied on top of content.js/extra.js: option text rewritten (similar lengths, plausible distractors), corrected wording, duplicate questions dropped. Engine shuffles option order at display time. */
(function(){var A=window.APP;if(!A||!A.levels)return;
var F={
"l1": {
"0": {
"o": [
"A repeatable measurement of behaviour on defined inputs, with a defined way to judge it",
"A one-off demonstration of a few impressive examples, shown to stakeholders",
"A collection of questions gathered from public websites and forums",
"A survey of how satisfied users say they are with the system"
]
},
"1": {
"o": [
"A product eval built from real support tickets and a rubric for good replies",
"The public benchmark score for the underlying model, taken from its release notes",
"A quick personal impression after the team has tried a few chats",
"The new model's own statement about whether its answers have improved"
]
},
"3": {
"o": [
"Five cases is too few to show the change works beyond those examples",
"A prompt change cannot be tested in any meaningful way, only reviewed by eye",
"Passing cases cannot be verified, because the grader may be fooled",
"There is no real limitation, since every one of the cases passed"
]
},
"4": {
"o": [
"Read a sample of actual responses, including some that were scored as passes",
"Look only at the average score, since the outputs are summarised in it",
"Read only the failures, since the passes need no further attention",
"Ask the model to summarise its own score and explain any mistakes"
]
},
"5": {
"o": [
"A regression eval, run before and after each change",
"A capability eval, which measures the best the model can do",
"A monitoring dashboard, which tracks live traffic volumes",
"A public leaderboard, which ranks models against each other"
]
},
"6": {
"o": [
"Behaviour can shift with any change to the prompt, tools or model",
"Eval scores naturally expire after a week and must be refreshed",
"Most regulations require every eval to be rerun on a schedule",
"Scores tend to rise over time as a model gets more use"
]
}
},
"l2": {
"0": {
"o": [
"The criteria are vague, so different graders will score answers differently",
"The rubric is too short to cover every possible response a user might give",
"A five-point scale is never allowed in a rubric for text responses",
"The rubric has no flaw, because most rubrics are written this way"
]
},
"1": {
"o": [
"The response includes the order number that appears in the user's message",
"The response sounds friendly and polite throughout the whole conversation",
"The response feels trustworthy to the person who reads it",
"The response is of a high quality overall and fits the brand"
]
},
"2": {
"o": [
"Scores will look high while hiding failures on hard or rare cases",
"Scores will be unfairly low, because simple questions are easy to get wrong",
"The grader will become unreliable, because the questions are so similar",
"The risk is small, as simple questions are the ones users mostly ask"
]
},
"4": {
"o": [
"Correct answers that use different wording will be marked as failures",
"Nothing is wrong, since an exact string is the safest thing to check",
"The check is too lenient and will let some wrong answers through",
"It measures creativity rather than whether the answer is correct"
]
},
"5": {
"o": [
"A ceiling effect: the eval is too easy to tell the models apart",
"The models have all reached perfect performance on the task",
"The rubric is too long, which squeezes every score together",
"This is ideal, because it shows the whole field is reliable"
]
},
"6": {
"o": [
"An overall average can hide a weak subgroup of cases",
"Slice tables are shorter and easier to read than one average",
"Each slice is larger than the full set, so it is more reliable",
"Slicing removes the random noise from the scores completely"
]
}
},
"l3": {
"0": {
"o": [
"Programmatic: run the tests and read the result",
"Human only: a reviewer reads each function and decides",
"An LLM judge that reads the code and gives a verdict",
"Exact string match against a single reference solution"
]
},
"1": {
"o": [
"The judge is showing position bias, favouring whichever answer is shown first",
"The judge is showing self-preference for answers that sound like its own",
"The test set is contaminated, because the judge has seen the answers",
"The judge is poorly calibrated about how sure it should be"
],
"q": "In pairwise comparisons the judge picks whichever answer is shown first about 80% of the time, even after the two answers are swapped. What is this?"
},
"4": {
"o": [
"Treat it as likely verbosity bias: control for length or fix the rubric, then re-validate",
"Accept the correlation, since longer answers usually contain more information",
"Add a bonus for longer answers so the judge matches its own preference",
"Drop the judge and rely only on a single reviewer from now on"
]
},
"5": {
"o": [
"Compare its verdicts with human labels on a sample of items",
"Pick the largest model available, since bigger judges are accurate",
"Ask the judge itself how accurate it believes its own verdicts are",
"Run it once on the full set and see whether the scores look sensible"
]
},
"6": {
"o": [
"Position bias in the judge",
"The two answers are in fact identical in quality",
"Tokenisation errors in how the answers were read",
"A sign that the judge is working exactly as intended"
]
}
},
"l4": {
"2": {
"o": [
"It may simply label everything not-spam and still score 99%",
"Accuracy of any spam filter can never be higher than about 90%",
"Precision for the spam class must therefore always equal one",
"There is no concern, because 99% accuracy is excellent here"
]
},
"4": {
"o": [
"Overconfident",
"Well calibrated",
"Underconfident",
"Contaminated"
]
},
"7": {
"o": [
"A 2-point gap on 100 items is small; compare item by item (paired) and report an interval on the difference",
"A is clearly better, because its score is higher than B's on exactly the same set of items",
"B is clearly better, because models this close are most likely equal and B is the cheaper one",
"The eval is invalid, because two models that are both good should never score this close"
],
"q": "Model A scores 82% and model B 80% on the same 100 items. What is the fairest conclusion?",
"why": "Both models answered the same items, so the right check is a paired comparison: look at the items where they differ and put an interval on the difference. With a gap this small and only 100 items, that interval will usually still include zero, so you cannot yet name a winner."
}
},
"l5": {
"0": {
"o": [
"Contamination or overfitting to the public benchmark",
"The new questions are always easier than the published ones",
"Low agreement between the raters who wrote the new questions",
"Position bias in how the answer options were arranged"
]
},
"1": {
"o": [
"Check it on a held-out set that you have not tuned against",
"Report the improved score as the final result, since it climbed steadily",
"Keep tuning for a few more rounds to see how far it will go",
"Remove the hardest cases so the score keeps climbing"
]
},
"2": {
"o": [
"Goodhart's law: the metric stopped measuring quality once it became the target",
"A calibration problem, where confidence does not match accuracy",
"A recall problem, where the judge is missing real failures",
"Ordinary variance, which will settle down with more runs"
]
},
"4": {
"o": [
"Use several complementary metrics and review outputs by hand regularly",
"Pick one number and never change it, so results stay comparable",
"Use only automated metrics, since they cannot be talked around",
"Stop measuring once the score looks stable for several weeks"
]
},
"5": {
"o": [
"A marker that helps keep the data out of training sets and reveals leakage",
"A tool that speeds up grading by caching earlier results",
"A password that restricts access to the dataset's files",
"A random seed used when sampling items from the dataset"
]
},
"6": {
"o": [
"Keep a private held-out set and refresh items over time",
"Publish all items and answers openly so anyone can check them",
"Use only multiple-choice items so grading is fully objective",
"Reuse older, well-known benchmarks, since they are well understood"
]
}
},
"l6": {
"0": {
"o": [
"Weak evidence: paraphrases, multi-turn pressure and injection were not tested",
"Strong evidence, because none of the twenty requests got a harmful reply",
"Moderate evidence, which would become strong with ten more requests",
"Proof that the model refuses every harmful request it is given"
]
},
"1": {
"o": [
"Over-refusal, which is a real cost to users",
"Ideal safety, since refusing more is always the safer option",
"Good calibration, since the model is being cautious on purpose",
"Contamination of the harmless requests by the training data"
]
},
"2": {
"o": [
"Prompt injection robustness",
"Precision of the summary against a reference summary",
"Pass@k over several attempts at the summarising task",
"Agreement between the people who rated the summaries"
]
},
"4": {
"o": [
"Report it through the developer's disclosure channel and limit who can see it",
"Post it publicly straight away so everyone can protect themselves",
"Keep it to yourself and assume someone else has already found it",
"Share it in a closed group chat with a few friends in the field"
]
},
"5": {
"o": [
"Only that this attempt failed: it is a lower bound on what the model can do",
"The model cannot do the task, and the result can be reported that way",
"The model is safe on this task, because it did not manage it",
"The task itself must be invalid, since a capable model should pass"
]
},
"6": {
"o": [
"State what attacks were tried, how much effort, and what was not tested",
"Say the model is safe, and add the date the tests were run",
"Report only the best run, since it shows the strongest result",
"Leave out the failures that look like unusual one-off cases"
]
}
},
"l7": {
"0": {
"o": [
"The decision the eval will inform and the behaviour to measure",
"Which model will be used as the judge for the whole suite",
"How the charts will be styled for the final report",
"How many test cases the team has time to write"
]
},
"1": {
"o": [
"Unit tests as the main grader, plus review of readability on a sample",
"An LLM judge alone, since it can read both code and comments",
"Exact match to a single reference solution written by the team",
"The assistant's own report of how confident it is in the code"
]
},
"2": {
"o": [
"The difference with its uncertainty (interval or paired test), noting that 40 cases is small",
"A plain statement that B is better, since its score is higher",
"B's score alone, since the report is about the new model",
"The difference as a percentage, which makes it easy to compare"
]
},
"4": {
"o": [
"Versioned test data, rubrics and grader prompts, with saved outputs",
"Editing the cases whenever the score drops, to keep the suite fair",
"Keeping the details with the person who built it for quick answers",
"Deleting older results so the latest run is easy to find"
]
},
"5": {
"o": [
"The colour theme of your editor",
"The model version and the settings used",
"The prompt template that was applied",
"The version of the grader"
]
},
"6": {
"o": [
"So readers do not over-trust the score",
"So that the reported score will look lower than it really is",
"Because limitations are optional, like the decoration on a report",
"Because it removes the need to share the code and data"
]
}
}
},DROP={"l3": [6]};
var BOSS={"0": [{"t": "The ship/no-ship decision, the behaviours that matter (accuracy, caution, referral to professionals) and how severe each failure is", "pts": 2, "why": "Decision and construct first, with severity, shape everything else."}, {"t": "The scoring scale and report layout, so results from different model versions can be compared easily over time", "pts": 1, "why": "Useful later, but it comes before you know which behaviours matter and what decision the score supports."}, {"t": "A single overall quality score from a strong model, checked against a well-known public legal-QA benchmark", "pts": 0, "why": "A single vague score hides which behaviours fail and how badly, and a public benchmark will not reflect your users or jurisdiction."}], "1": [{"t": "Real anonymised renter questions plus edge cases (wrong jurisdiction, urgent eviction, ambiguous facts), with a private held-out split", "pts": 2, "why": "Realistic variety, edge cases and a held-out set."}, {"t": "Questions scraped from a public forum with answers attached, used for both tuning the prompt and the final test", "pts": 1, "why": "Realistic, but possibly contaminated and used for tuning, so it overstates performance."}, {"t": "Twenty clear, well-formed questions written by the engineers, who know the product and the right answers best", "pts": 0, "why": "Too few, too easy and unrepresentative of what real users ask."}], "2": [{"t": "A rubric with specific checks, a legal reviewer grading a sample, and an LLM judge validated against those labels, with agreement measured", "pts": 2, "why": "Layered grading validated against experts."}, {"t": "A rubric with specific checks, graded by an LLM judge that was validated once on a few examples when the eval launched", "pts": 1, "why": "Better than nothing, but one early check does not show the judge stays reliable as the system changes."}, {"t": "An LLM judge that scores each answer against one model answer written by the team, with no human review of its verdicts", "pts": 0, "why": "Unvalidated judges carry biases you cannot see, and one reference rejects valid alternatives."}], "3": [{"t": "Accuracy on factual items, harmful or overconfident advice weighted by severity, referral rate and over-refusal rate, each with confidence intervals", "pts": 2, "why": "Matches the real risks and includes uncertainty."}, {"t": "Accuracy on factual items and an overall helpfulness score from the judge, reported as averages across all test cases", "pts": 1, "why": "Averages hide rare but severe failures, and nothing here measures over-refusal or referral."}, {"t": "One headline accuracy figure, plus the average response time, so the product team can see quality and speed together", "pts": 0, "why": "Misses the key safety dimensions of this product and gives no sense of uncertainty."}], "4": [{"t": "Red-team paraphrases, multi-turn pressure and injection; check for contamination; read samples of passes and failures; document the limits", "pts": 2, "why": "Covers robustness, leakage and honesty about coverage."}, {"t": "Rerun the suite with a second judge model, read the failures only, and publish the score with a short summary", "pts": 1, "why": "A second judge helps, but it skips robustness checks, contamination checks and reading passes."}, {"t": "Ship if the score is above 90%, since a high score on a validated suite shows the product is ready", "pts": 0, "why": "A threshold on a single number ignores validity, severity and untested situations."}]},SQ={};if(A.boss&&BOSS){Object.keys(BOSS).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].opts=BOSS[k]});Object.keys(SQ).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].q=SQ[k]})}
A.levels.forEach(function(L){var f=F[L.id]||{},d=DROP[L.id]||[];
 L.qs.forEach(function(q,i){var x=f[i];if(!x)return;
  if(x.o&&(q.t==='mc')){q.opts=x.o.slice();q.a=(x.a===undefined?0:x.a)}
  else if(x.o&&q.t==='multi'){q.opts=x.o.slice();q.a=x.a}
  if(x.q)q.q=x.q;if(x.why)q.why=x.why});
 L.qs=L.qs.filter(function(q,i){return d.indexOf(i)<0})})})();
