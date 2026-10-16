/* Assessment fixes applied on top of content.js/extra.js: option text rewritten (similar lengths, plausible distractors), corrected wording, duplicate questions dropped. Engine shuffles option order at display time. */
(function(){var A=window.APP;if(!A||!A.levels)return;
var F={
"l1": {
"0": {
"o": [
"People deliberately using AI to cause harm",
"A model failing because of an ordinary software bug",
"A model responding too slowly under heavy load",
"Different models giving each other conflicting answers"
]
},
"1": {
"o": [
"Accident or unreliability",
"Misuse",
"Structural risk",
"None of these buckets fits"
]
},
"3": {
"o": [
"Take them seriously, state your uncertainty and look for evidence",
"Dismiss them, since the experts do not agree with each other",
"Treat them as certain, since some experts rate them highly",
"Set the question aside until there is a clear real-world incident"
]
},
"5": {
"o": [
"A scammer uses a model to write personalised phishing emails at scale",
"A general worry that AI is becoming very powerful and unpredictable",
"A belief that technology is moving faster than society can follow",
"A concern that the largest models are becoming difficult to understand"
]
},
"6": {
"o": [
"They show what to test and what evidence would change your mind",
"They replace the need to evaluate the system at all",
"They make the risk go away once they have been approved",
"They are a formal requirement before any code can be released"
]
}
},
"l2": {
"0": {
"o": [
"A system scoring well on the stated objective without doing what was intended",
"A system crashing as soon as it starts up in a new environment",
"Writing the specification document for a new video game",
"A model declining to answer a request it was given"
]
},
"1": {
"o": [
"When a measure becomes a target, it stops being a good measure",
"More training data always improves a model's performance",
"Every large model will overfit if it is trained for long enough",
"Safety work cannot succeed, because every metric can be gamed"
]
},
"2": {
"o": [
"Outer alignment",
"Inner alignment",
"Tokenisation",
"Latency"
]
},
"4": {
"o": [
"Helping humans supervise systems on tasks too hard to check directly",
"Making models larger so they need less supervision",
"Reducing the cost of training runs so more can be supervised",
"Removing human feedback entirely, in favour of automatic scoring"
]
},
"5": {
"o": [
"Goal misgeneralisation",
"Prompt injection",
"Overfitting to noise in the training data",
"Quantisation error after compression"
]
},
"6": {
"o": [
"Approval is a proxy for what we want, and optimising it can drift from truth",
"Models cannot read the text that users send to them",
"It is a hardware fault that appears in very large systems",
"It only affects image models, not language models"
]
}
},
"l3": {
"0": {
"o": [
"Only that this effort did not find one; absence of evidence is not proof",
"The system is safe, because a full week of testing found nothing",
"The red team was not good enough and should be replaced",
"Safety testing is unnecessary once a week passes without failures"
]
},
"1": {
"o": [
"Hidden instructions in content the model reads, trying to change its behaviour",
"A model declining to answer because the prompt looks harmful",
"A fast method for training a model on a large set of prompts",
"Adding a stored prompt to a database so it can be reused"
]
},
"3": {
"o": [
"Re-test with rewordings and variations of the attack",
"Nothing more, since the vendor has fixed the specific phrase",
"Delete the notes so the exploit does not spread further",
"Publish the original phrase so others can confirm the fix"
]
},
"4": {
"o": [
"A rare failure with serious consequences",
"The most frequent failure, as long as it is trivial",
"Whichever failure the team happened to find first",
"The failure that needs the shortest prompt to reproduce"
]
},
"5": {
"o": [
"It can miss novel risk categories and rely on imperfect graders",
"It is always too slow to be used on a real system",
"It can only be applied to images, never to text",
"It cannot be repeated, because results are random each time"
]
}
},
"l4": {
"0": {
"o": [
"To trigger stronger safeguards or a pause when evaluations show a risky capability",
"To rank models by how popular they are with developers",
"To set the price that users pay for access to the model",
"To limit how much text the model can read in one go"
]
},
"1": {
"o": [
"One weak attempt can under-estimate what the model can do",
"It makes the model look better in published results",
"It is cheaper than running a careful, full set of tests",
"It removes the need to set any thresholds at all"
]
},
"2": {
"o": [
"This attempt did not find it; the capability may still be present",
"The capability is absent, since the test was run carefully",
"The test was not legal and so cannot be counted as evidence",
"The model is aligned, since it did not show the capability"
]
},
"4": {
"o": [
"Detailed hazardous content can itself be an information hazard",
"The topic is dull and would not hold a learner's attention",
"Python in the browser cannot run that kind of test",
"Nobody actually tests models for these capabilities"
]
},
"5": {
"o": [
"A system performing worse than it can, on purpose or by training",
"Adding more training data to a model after its release",
"Compressing a model so that it fits on smaller hardware",
"A style of grading that scores each answer on a curve"
]
},
"6": {
"o": [
"They may not reflect the model's behaviour in real use",
"They become more accurate, because the model is trying harder",
"They are always safe to rely on, since the model passed",
"They are unaffected, since tests do not change behaviour"
]
}
},
"l5": {
"0": {
"o": [
"Real inputs differing from the data the model was built and tested on",
"Moving a model's servers to a new data centre",
"Changing the loss function partway through training",
"A bug in the tokeniser that splits words incorrectly"
]
},
"1": {
"o": [
"Brittleness: a meaning-preserving change flipped the answer",
"The model is robust, because it answers many questions correctly",
"Both answers are acceptable, since capitalisation changes meaning",
"This shows nothing, since two prompts are too few to judge"
]
},
"5": {
"o": [
"No single layer is perfect, so others catch what it misses",
"Extra layers are cheaper to run than a single strong one",
"Layers remove the need to test the whole system together",
"Regulators now ban systems that rely on a single safeguard"
]
},
"6": {
"o": [
"Least-privilege tools and human approval for sensitive actions",
"A much longer system prompt that lists every forbidden action",
"Giving the agent every permission so it never gets blocked",
"Turning off logging so private data is not stored anywhere"
]
}
},
"l6": {
"0": {
"o": [
"The information is present in the activations",
"The model definitely uses that information when it answers",
"The model is safe with respect to that property",
"The probe is the model, only smaller"
]
},
"1": {
"o": [
"Models packing more concepts into their units than there are units",
"Running two copies of a model side by side to compare them",
"A technique borrowed from quantum computing hardware",
"A type of loss used when training very deep networks"
]
},
"2": {
"o": [
"An intervention, such as patching activations and measuring the output change",
"A plausible story that fits several of the examples you looked at",
"The name given to the component by the researchers",
"The relative size of the component inside the model"
]
},
"4": {
"o": [
"Decompose activations into more interpretable features",
"Compress the model's files so that they take up less space",
"Speed up training by skipping the early layers",
"Generate new prompts for use in a red-team test set"
]
},
"6": {
"o": [
"The model might be misaligned, so surrounding safeguards must still limit harm",
"The model is perfectly aligned, so extra safeguards are redundant",
"Humans never review the output, so only automated checks apply",
"Only open models matter, because they can be fully inspected"
]
}
},
"l7": {
"0": {
"o": [
"If evaluations show a risky capability, then stronger safeguards or a pause apply",
"If a model passes a capability test, then access becomes cheaper",
"If a user pays for access, then the model is allowed to run",
"If the code compiles without errors, then it can be released"
]
},
"4": {
"o": [
"They are revised over time, and the details matter",
"They never change, so any summary stays accurate for years",
"Summaries are always wrong, because they leave out the text",
"Only the title of the framework matters when comparing labs"
]
},
"5": {
"o": [
"Telling the developer privately first and allowing time to fix before publishing",
"Posting the vulnerability publicly at once so users can react",
"Selling the vulnerability to whoever offers the best price",
"Ignoring it, because someone else will report it eventually"
]
},
"6": {
"o": [
"A structured argument, with evidence and stated assumptions, that a system is acceptably safe",
"A marketing page that explains why users should trust the system",
"A list of the features the system offers to its customers",
"A software licence that sets out how the system may be used"
]
},
"2": {
"o": [
"Others can rerun it, inspect individual outputs and check how the score was produced",
"A screenshot cannot be shared by email, while code files can always be sent",
"Code is always more persuasive to readers than a plain number",
"Saved logs make the model's score higher on later reruns"
],
"q": "Why is it better to share an eval as runnable code plus saved logs than as a screenshot of the score?",
"why": "Reproducibility lets others check the result and find problems the score alone would hide."
},
"3": {
"o": [
"A weak attempt can miss a capability, so a clean result gives little assurance",
"The pause would happen too often, which would slow the lab down",
"Single attempts always find capabilities that are not really there",
"Frameworks cannot be tied to the result of any test"
],
"q": "A lab's framework says it will pause deployment if a test finds a dangerous capability. The test used was a single quick attempt. What is the main weakness?",
"why": "A failed attempt is a lower bound, so the commitment is only as strong as the elicitation effort behind it."
}
}
},DROP={"l1": [2], "l3": [6], "l5": [2], "l6": [5]};
var BOSS={"0": [{"t": "List misuse, accident, misalignment and structural risks for this agent, score likelihood and severity with ranges, and note what you are unsure of", "pts": 2, "why": "A structured, honest map gives you priorities and a record of assumptions."}, {"t": "List only the risks that have already been reported for similar agents elsewhere, and rank them by how often they occurred", "pts": 1, "why": "Past incidents matter, but new systems create new failure modes."}, {"t": "Treat the main risk as unreliable answers, score it as low, and move on to building safeguards for the other features", "pts": 0, "why": "This ignores serious risks of an agent that can act."}], "1": [{"t": "Authorised testing with a written scope, humans plus automated probes, severity ratings, re-tests after fixes with reworded attacks, and responsible reporting", "pts": 2, "why": "This covers breadth, depth, and the habit of re-testing patched issues."}, {"t": "A small team runs automated probes for a week, fixes the failures found, and reports the pass rate to management", "pts": 1, "why": "Automated probes help, but they miss novel risks and the exact-fix retest gives false comfort."}, {"t": "Publish the exploits found during testing so that the wider community can help check that the fixes are sufficient", "pts": 0, "why": "This hands attackers working methods before fixes exist."}], "2": [{"t": "Define thresholds in advance, try hard to elicit the best performance, keep a safety margin, restrict hazardous details, and tie results to safeguards", "pts": 2, "why": "This follows the if-then pattern and treats scores as lower bounds."}, {"t": "Run a standard public cyber benchmark once with default settings and release if the score is below a preset number", "pts": 1, "why": "A single default run is a weak lower bound and may under-estimate what the agent can do."}, {"t": "Skip a dedicated evaluation, since the agent is sold as a coding tool and its purpose is not related to cyber attacks", "pts": 0, "why": "Capability depends on what the system can do, not what it is called."}], "3": [{"t": "Least-privilege access, human approval for risky actions such as sending data or deleting files, sandboxed execution, monitoring, and regular re-testing", "pts": 2, "why": "Defence in depth: no single layer is trusted to hold."}, {"t": "Add a firm instruction in the system prompt to ignore commands found inside emails or code comments, and test it once", "pts": 1, "why": "It helps a little but is known to be bypassable, so it cannot be the only defence."}, {"t": "Rely on the model's own judgement to spot malicious text, because current models are trained to resist this kind of attack", "pts": 0, "why": "Models can be fooled, and the actions the agent takes are real."}], "4": [{"t": "Write down the safeguards required at each capability level, agree who can pause release, plan incident response, allow independent review, and update as evidence changes", "pts": 2, "why": "Pre-committed triggers, independent checking and incident readiness make the policy more than a promise."}, {"t": "Rely on the company's stated commitment to safety, and review the plan internally once a year when the next model ships", "pts": 1, "why": "Intentions matter, but structure and outside checks are what make commitments reliable."}, {"t": "Release the agent to a small group of users and decide what to do about any problems once they start to appear", "pts": 0, "why": "There is no plan in advance, so problems will be handled in a crisis."}]},SQ={};if(A.boss&&BOSS){Object.keys(BOSS).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].opts=BOSS[k]});Object.keys(SQ).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].q=SQ[k]})}
A.levels.forEach(function(L){var f=F[L.id]||{},d=DROP[L.id]||[];
 L.qs.forEach(function(q,i){var x=f[i];if(!x)return;
  if(x.o&&(q.t==='mc')){q.opts=x.o.slice();q.a=(x.a===undefined?0:x.a)}
  else if(x.o&&q.t==='multi'){q.opts=x.o.slice();q.a=x.a}
  if(x.q)q.q=x.q;if(x.why)q.why=x.why});
 L.qs=L.qs.filter(function(q,i){return d.indexOf(i)<0})})})();
