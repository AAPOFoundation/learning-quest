/* Assessment fixes applied on top of content.js/extra.js: option text rewritten (similar lengths, plausible distractors), corrected wording, duplicate questions dropped. Engine shuffles option order at display time. */
(function(){var A=window.APP;if(!A||!A.levels)return;
var F={
"l1": {
"0": {
"o": [
"Predict the next token of text, given the tokens before it",
"Classify each sentence as true or false using labelled examples",
"Match answers that human experts wrote for a set of prompts",
"Compress the training text into as few stored bytes as possible"
]
},
"1": {
"o": [
"Estimating performance on unseen data, and used sparingly",
"Choosing the best learning rate for the training run",
"Training the model a little further once it has converged",
"Replacing the validation set when that set is small"
]
},
"3": {
"o": [
"Accuracy can mislead when one class is much more common than the other",
"The model is excellent, since 95% is a high accuracy score",
"The dataset is too small for any accuracy figure to be meaningful",
"Fraud is rare, so a fraud model is not worth building"
]
},
"5": {
"o": [
"Leakage",
"Regularisation",
"Normalisation",
"Augmentation"
]
},
"6": {
"o": [
"The test score is inflated, because the model has seen near-duplicates",
"Training becomes slower, because duplicate rows are processed twice",
"Nothing is wrong, because more data about a customer always helps",
"The labels flip, because rows are matched to the wrong split"
]
},
"2": {
"o": [
"Tuning the learning rate by looking at the score on the test set",
"The same patient appears in both the train and test sets",
"Shuffling with a fixed random seed before splitting",
"Choosing which features to keep by looking at the test labels"
],
"a": [
0,
1,
3
]
}
},
"l2": {
"0": {
"o": [
"Without them, stacked linear layers collapse into a single linear map",
"They make the numbers smaller so training stays numerically stable",
"They remove the need to define a loss function for the network",
"They make training faster in every case, whatever the network"
]
},
"3": {
"o": [
"0",
"-3",
"3",
"1"
]
},
"4": {
"o": [
"Cross-entropy",
"Mean squared error",
"Accuracy",
"The number of layers"
]
}
},
"l3": {
"0": {
"o": [
"parameter = parameter - learning_rate * gradient",
"parameter = parameter + learning_rate * gradient",
"parameter = gradient / learning_rate",
"parameter = parameter * gradient"
]
},
"2": {
"o": [
"It can overshoot the minimum, and the loss may diverge",
"Training always finishes faster and reaches a better result",
"Nothing changes, since the learning rate only affects speed",
"The model begins to memorise the test set instead"
]
},
"3": {
"o": [
"An algorithm that computes gradients efficiently using the chain rule",
"A method for collecting more data from the places the model fails",
"A type of activation function applied after each layer",
"A way of splitting the data into training and test sets"
]
},
"6": {
"o": [
"Each step is cheaper, and the noisy estimate usually still points downhill",
"It guarantees that training reaches the global minimum of the loss",
"It removes the need for a loss function during training",
"It makes the finished model smaller and faster to run"
]
}
},
"l4": {
"0": {
"o": [
"Overfitting",
"Underfitting",
"The test set is too large",
"A learning rate that is too small"
]
},
"2": {
"o": [
"It leaks test information into your choices and inflates the estimate",
"It makes each training run slower because the test set is large",
"Test sets can only be used once and are then deleted",
"It lowers the learning rate that the optimiser uses"
]
},
"3": {
"o": [
"Underfitting: the model or training is too weak",
"Overfitting to the training examples",
"A perfect fit to the underlying pattern",
"Data leakage between training and validation"
]
},
"6": {
"o": [
"Distribution shift",
"Leakage",
"A bug in the loss function",
"Quantisation error"
]
},
"4": {
"q": "Validation losses by epoch are [0.9, 0.7, 0.6, 0.65, 0.7]. Counting positions from 0, as Python does, which index had the lowest validation loss?",
"why": "Index 2 (loss 0.6), which is the third epoch. Early stopping would keep that checkpoint."
}
},
"l5": {
"0": {
"o": [
"Positive numbers that sum to 1",
"Negative numbers that sum to -1",
"A single integer chosen from the vocabulary",
"The gradient of the loss for each token"
]
},
"1": {
"o": [
"To stop a position attending to later tokens, matching next-token prediction",
"To hide the correct answers from the user while the model runs",
"To shrink the vocabulary so there are fewer tokens to predict",
"To speed up the optimiser by skipping some of the weights"
]
},
"3": {
"o": [
"A piece of text, often a word fragment, mapped to an integer id",
"Always exactly one word, taken from a fixed dictionary",
"A secret key that identifies the user to the model",
"One of the learned parameters inside the model"
]
},
"5": {
"o": [
"It almost always picks the most likely token",
"It picks tokens uniformly at random from the vocabulary",
"It stops the model from producing any further text",
"It doubles the size of the context window"
]
},
"6": {
"o": [
"It is trained to predict plausible text, not to check facts",
"It deliberately lies to keep the conversation going",
"Its vocabulary is too small to express the true answer",
"The sampling temperature is always set too high"
]
}
},
"l6": {
"0": {
"o": [
"A pretrained model that predicts text but is not tuned to follow instructions",
"A model that has already been aligned with human values and preferences",
"A small model built to run on phones and other small devices",
"A model whose parameters have not yet been trained at all"
]
},
"1": {
"o": [
"Train small added matrices while the large original weights stay frozen",
"Delete about half of the layers to make the model smaller",
"Train only on the test data so the score is as high as possible",
"Train without a loss, using the gradients from an earlier run"
]
},
"3": {
"o": [
"Losing previously learned abilities after training on new data",
"A model deleting its own files after a failed training run",
"Forgetting the user's name part-way through a long chat",
"A bug in the tokeniser that drops rare words"
]
},
"4": {
"o": [
"Fine-tuning can change behaviour in unintended ways, including weakening safeguards",
"It is a legal requirement in every country where models are used",
"Fine-tuning always improves every ability the model had before",
"It is the only way to increase the model's context window"
]
}
},
"l7": {
"0": {
"o": [
"Which answer humans would prefer, as a score",
"The next token in a piece of text",
"The learning rate that suits a training run",
"The number of parameters a model should have"
]
},
"2": {
"o": [
"The model finds high-scoring outputs that do not match what people want",
"Someone stealing the weights of a reward model to reuse them",
"Raters being paid more than the task is worth",
"Using too few GPUs, so training finishes before the reward converges"
]
},
"3": {
"o": [
"It trains directly on preference pairs, with no separate reward model or RL loop",
"It uses no human data at all, only text from the web",
"It only works for image models, not for language models",
"It needs no loss function, because it copies the best answers"
]
},
"6": {
"o": [
"Raters may favour agreeable answers, so agreeableness gets rewarded",
"Models are born flattering, and training cannot change it",
"The sampling temperature is set too low during preference training",
"The tokeniser adds polite words to every reply"
]
}
}
},DROP={"l3": [5, 6], "l6": [5], "l7": [5]};
var BOSS={"0": [{"t": "Hold out a test set before any tuning, use a validation set to choose settings, and split by source so near-duplicates do not cross the line", "pts": 2, "why": "Splitting by source and holding out test data prevents leakage and keeps the final estimate honest."}, {"t": "Split randomly 80/20 by row, tune on the validation part, and check the test part a few times as you go", "pts": 1, "why": "Random row splits can put near-duplicates on both sides, and repeated test checks quietly leak information."}, {"t": "Split randomly 80/20 and keep adjusting settings until the test score looks as good as possible before you report it", "pts": 0, "why": "Tuning on the test set inflates the result."}], "1": [{"t": "Treat it as overfitting: keep the best checkpoint, and consider early stopping, more varied data or regularisation", "pts": 2, "why": "This matches the standard response to the overfitting signal."}, {"t": "Switch to a larger model straight away, since extra capacity usually brings validation loss back down again", "pts": 1, "why": "Sometimes useful, but it ignores the cheaper fixes and the cause."}, {"t": "Keep training until the training loss stops falling, since that is the number the optimiser is trying to improve", "pts": 0, "why": "Training loss is not what you care about; validation loss shows how it generalises."}], "2": [{"t": "Start with an instruction-tuned model, clear instructions and retrieval of your documents; measure, and fine-tune only if evaluations show a gap prompting cannot close", "pts": 2, "why": "It is cheaper and easier to change, and you only add complexity when evidence says so."}, {"t": "Fine-tune on your documents straight away, then compare with prompting later if the results look disappointing", "pts": 1, "why": "It may work, but it adds cost and forgetting risks before you know prompting is not enough."}, {"t": "Rely on the vendor's published benchmark results for the model, and skip running any tests on your own documents", "pts": 0, "why": "You must evaluate your own use, because public benchmarks do not reflect your task."}], "3": [{"t": "Re-run your task evals, test earlier abilities for forgetting, and check that refusals and safety behaviour did not weaken", "pts": 2, "why": "Fine-tuning can change behaviour in unintended ways, so measure both gains and losses."}, {"t": "Re-run your task evals and check the average score has improved compared with the model before fine-tuning", "pts": 1, "why": "It misses forgetting and safety changes."}, {"t": "Spot-check a few outputs by hand, since the training data was curated and reviewed before it was used", "pts": 0, "why": "Curation does not guarantee behaviour, and a few outputs cannot show it."}], "4": [{"t": "Rater disagreement and mistakes, sycophancy being rewarded, and over-optimisation against the reward model, with independent spot-checks", "pts": 2, "why": "These are the known weak points of preference learning."}, {"t": "Use a single trusted rater so the preferences stay consistent, and check the average reward score each week", "pts": 1, "why": "Consistency is good, but one person's biases and mistakes become the target."}, {"t": "Trust the reward score and keep optimising it, since a rising score means the answers are improving for users", "pts": 0, "why": "Reward is a proxy and can be gamed."}]},SQ={"2": "Should you fine-tune, or use an instruction-tuned model with clear instructions and your documents in the prompt?"};if(A.boss&&BOSS){Object.keys(BOSS).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].opts=BOSS[k]});Object.keys(SQ).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].q=SQ[k]})}
A.levels.forEach(function(L){var f=F[L.id]||{},d=DROP[L.id]||[];
 L.qs.forEach(function(q,i){var x=f[i];if(!x)return;
  if(x.o&&(q.t==='mc')){q.opts=x.o.slice();q.a=(x.a===undefined?0:x.a)}
  else if(x.o&&q.t==='multi'){q.opts=x.o.slice();q.a=x.a}
  if(x.q)q.q=x.q;if(x.why)q.why=x.why});
 L.qs=L.qs.filter(function(q,i){return d.indexOf(i)<0})})})();
