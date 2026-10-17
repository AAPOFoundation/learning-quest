"""Expedition stage: from a dataset to a scorecard.
Generate test cases, grade replies automatically, and compare two set-ups (a prompt and a model each) on accuracy and cost.
Plain Python only (no installs): it runs on Windows, macOS, Linux and in the game's own Python box.
Run:   python scorecard.py
The two "models" below are FAKE: made-up rules with made-up prices, so the run is free and repeatable.
Their numbers are NOT findings about any real model. Section 5 shows where to plug in a real one.
"""
import math
import random
import re

# ---------- 1. A dataset: test cases generated from a template ----------
def make_cases(n, seed=1):
    rng = random.Random(seed)            # same seed -> same cases every run
    cases = []
    for i in range(n):
        packs, per = rng.randint(2, 9), rng.randint(3, 12)
        cases.append({"id": i, "question": f"A box holds {per} pens. You buy {packs} boxes. How many pens is that?", "answer": packs * per})
    return cases
    # Add your own hand-written cases too: {"id": 99, "question": "...", "answer": 42}

# ---------- 2. Two set-ups to compare (FAKE models) ----------
PRICE_PER_1K_TOKENS = {"small-model": 0.01, "large-model": 0.1}   # made-up prices
ACCURACY = {("small-model", "terse"): 0.60, ("small-model", "steps"): 0.78,
            ("large-model", "terse"): 0.90, ("large-model", "steps"): 0.95}   # made-up
PROMPTS = {"terse": "Answer with just the number.", "steps": "Work it out step by step, then give the number."}

def ask_fake(model, prompt_name, case):
    """Pretend to be a model: right or wrong by chance, with a reply and a token count."""
    rng = random.Random(f"{model}|{prompt_name}|{case['id']}")
    right = rng.random() < ACCURACY[(model, prompt_name)]
    number = case["answer"] if right else case["answer"] + rng.choice([-3, -2, -1, 1, 2, 3, 10])
    reply = f"{number}" if prompt_name == "terse" else f"{case['question']} Multiply the boxes by the pens. So the answer is {number}."
    tokens = (len(PROMPTS[prompt_name]) + len(case["question"]) + len(reply)) // 4
    return reply, tokens

# ---------- 3. Automatic grader ----------
def grade(reply, answer):
    """Take the LAST whole number in the reply and compare it with the answer."""
    numbers = re.findall(r"-?\d+", reply)
    return bool(numbers) and int(numbers[-1]) == answer

# ---------- 4. Run, then build the scorecard ----------
def run(config, cases, ask=ask_fake):
    model, prompt_name = config
    results, tokens = [], 0
    for c in cases:
        reply, used = ask(model, prompt_name, c)
        results.append(grade(reply, c["answer"]))
        tokens += used
    cost = tokens / 1000 * PRICE_PER_1K_TOKENS[model]
    return results, cost

def wilson(k, n, z=1.96):
    """95% interval for a pass rate (the same idea as the Variance Fens)."""
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    d = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / d
    half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0.0, centre - half), min(1.0, centre + half))

def sign_test(only_a, only_b):
    """Two-sided p-value: if A and B were equally good, how odd is this split of the cases where they differ?"""
    n = only_a + only_b
    if n == 0:
        return 1.0
    k = min(only_a, only_b)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / 2 ** n
    return min(1.0, 2 * tail)

def scorecard(cases, cfg_a, cfg_b):
    ra, ca = run(cfg_a, cases)
    rb, cb = run(cfg_b, cases)
    print(f"{len(cases)} test cases")
    for name, cfg, r, cost in (("A", cfg_a, ra, ca), ("B", cfg_b, rb, cb)):
        k, lo_hi = sum(r), wilson(sum(r), len(r))
        print(f"  {name} {cfg[0]:12s} prompt={cfg[1]:6s} accuracy {k / len(r):.0%} (95% interval {lo_hi[0]:.0%} to {lo_hi[1]:.0%}), cost ${cost / len(r) * 1000:.2f} per 1,000 questions, ${cost / k * 1000:.2f} per 1,000 correct answers" if k else f"  {name} no correct answers")
    only_a = sum(1 for x, y in zip(ra, rb) if x and not y)
    only_b = sum(1 for x, y in zip(ra, rb) if y and not x)
    p = sign_test(only_a, only_b)
    print(f"  A right and B wrong: {only_a}.  B right and A wrong: {only_b}.  p-value {p:.3f}")
    if p < 0.05:
        print("  Verdict: the difference is bigger than chance on these cases.")
    else:
        print("  Verdict: I cannot tell them apart on these cases. Add more cases before you choose.")

if __name__ == "__main__":
    # Try: change CASES to 100, then swap in ("large-model", "terse") and compare cost per correct answer.
    CASES = make_cases(30)
    scorecard(CASES, ("small-model", "terse"), ("small-model", "steps"))

# ---------- 5. Using a real model later (optional) ----------
# Write your own ask(model, prompt_name, case) that sends PROMPTS[prompt_name] plus case["question"] to your provider
# and returns (reply_text, tokens_used) from the provider's usage field, then pass it to run(..., ask=your_function).
# Keep the keys out of the file (read them from an environment variable), keep questions harmless, set a spending limit first.
