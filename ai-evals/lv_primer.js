window.NEWLV=window.NEWLV||{};window.NEWLV["lP"]={
"id": "lP",
"icon": "🐍",
"title": "Python first steps",
"blurb": "Variables, lists, loops, functions and a little probability. No experience needed.",
"lesson": [
{
"h": "Values, variables and printing",
"b": "<p class=\"small dim\">New to Python? The <b>Python Basics</b> world on the home page teaches it slowly with live examples. This level is a quick version of the same ideas.</p><p>A Python program is a list of instructions that run from top to bottom. A <b>variable</b> is a name that holds a value. The value can be a whole number (<code>int</code>), a decimal (<code>float</code>), text (<code>str</code>) or <code>True</code>/<code>False</code> (<code>bool</code>).</p>\n<pre class=\"code\">passed = 42\ntotal = 50\nrate = passed / total\nprint(rate)          # 0.84\nprint(f\"Pass rate: {rate:.0%}\")   # Pass rate: 84%</pre>\n<p>Notes: <code>=</code> means \"give this name this value\" (it is not a maths equals sign). <code>/</code> always gives a decimal, <code>**</code> is \"to the power of\", and anything after <code>#</code> is a comment that Python ignores. <code>print(...)</code> shows a value on screen.</p>"
},
{
"h": "Lists and loops",
"b": "<p>A <b>list</b> holds several values in order: <code>scores = [0.9, 0.4, 0.75]</code>. Counting starts at <b>0</b>, so <code>scores[0]</code> is <code>0.9</code> and <code>scores[-1]</code> is the last item. <code>len(scores)</code> is how many items there are, <code>sum(scores)</code> adds them up, and <code>scores.append(0.5)</code> adds one to the end.</p>\n<p>A <b>for loop</b> does something once per item. The indented lines (4 spaces) are the body of the loop, and <code>if</code> lets you act only when a condition is true.</p>\n<pre class=\"code\">count = 0\nfor s in scores:\n    if s >= 0.6:\n        count = count + 1\nprint(count)         # 2</pre>\n<p>Careful with an <b>empty list</b>: <code>sum([]) / len([])</code> divides by zero and crashes. Eval code meets empty lists more often than you would think.</p>"
},
{
"h": "Functions and decisions",
"b": "<p>A <b>function</b> packages steps under a name. <code>def</code> starts it, the indented lines are its body, and <code>return</code> hands a value back to whoever called it. (<code>print</code> only shows something on screen; <code>return</code> is what other code can use.)</p>\n<pre class=\"code\">def grade(score):\n    if score >= 0.8:\n        return \"excellent\"\n    elif score >= 0.6:\n        return \"pass\"\n    else:\n        return \"fail\"\n\nprint(grade(0.7))    # pass</pre>\n<p>Comparisons are <code>==</code> (equal), <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, and you can combine them with <code>and</code>, <code>or</code>, <code>not</code>. Watch the boundary: <code>&gt;=</code> includes the value itself and <code>&gt;</code> does not. A grader for an AI answer is usually just a small function that returns pass or fail.</p>"
},
{
"h": "Probability basics",
"b": "<p>A <b>probability</b> is a number from 0 (never) to 1 (always). For equally likely outcomes it is <i>favourable outcomes / all outcomes</i>: one face of a fair die has probability 1/6.</p>\n<ul><li><b>Both of two independent events:</b> multiply. If a model gets each question right with probability 0.9, and the questions are independent, all 5 right is <code>0.9 ** 5</code>, about 0.59.</li><li><b>Expected value:</b> add up each value times its probability. Win 10 with probability 0.2, else 0: <code>10*0.2 + 0*0.8 = 2</code>.</li><li><b>Randomness:</b> <code>random.seed(1)</code> makes the \"random\" numbers repeat exactly on every run, which is how you make an experiment reproducible.</li></ul>\n<p>\"Independent\" is an assumption, and real test questions are rarely fully independent (for example several questions about the same document). Keep that in mind; it comes back in the statistics region.</p>"
}
],
"qs": [
{
"t": "mc",
"q": "In Python, what does the line <code>passed = 42</code> do?",
"opts": [
"It gives the name passed the value 42",
"It checks whether passed is equal to 42",
"It prints the number 42 on the screen",
"It turns the number 42 into text"
],
"a": 0,
"why": "A single <code>=</code> assigns a value to a name. Checking equality uses <code>==</code>."
},
{
"t": "num",
"q": "<code>scores = [10, 20, 30, 40]</code>. What does <code>scores[1]</code> give? Counting starts at 0.",
"a": 20,
"tol": 0,
"why": "Index 0 is 10 and index 1 is 20."
},
{
"t": "num",
"q": "What does <code>len([3, 1, 4, 1, 5])</code> give?",
"a": 5,
"tol": 0,
"why": "The list has five items, so its length is 5."
},
{
"t": "mc",
"q": "A function should hand a value back so other code can use it. Which keyword does that?",
"opts": [
"return",
"print",
"input",
"append"
],
"a": 0,
"why": "<code>return</code> gives the value back to the caller. <code>print</code> only displays it."
},
{
"t": "mc",
"q": "What does <code>7 / 2</code> give in Python?",
"opts": [
"3.5",
"3",
"4",
"Error"
],
"a": 0,
"why": "<code>/</code> always gives a decimal. Whole-number division is <code>//</code> (7 // 2 is 3)."
},
{
"t": "num",
"q": "Two independent events each have probability 0.5. What is the probability that both happen?",
"a": 0.25,
"tol": 0.001,
"why": "Multiply: 0.5 x 0.5 = 0.25."
},
{
"t": "num",
"q": "A game pays 10 with probability 0.2 and 0 otherwise. What is the expected value?",
"a": 2,
"tol": 0.001,
"why": "10 x 0.2 + 0 x 0.8 = 2."
},
{
"t": "mc",
"q": "Why would someone set a random seed before running an experiment?",
"opts": [
"So the same \"random\" numbers appear each run, and the result can be repeated",
"So the program runs faster",
"So Python ignores errors",
"So the answers become more accurate"
],
"a": 0,
"why": "A fixed seed makes randomness repeatable, which lets other people reproduce your result."
},
{
"t": "code",
"id": "pp1",
"title": "Average of a list",
"q": "<p>Write <code>average(numbers)</code> that returns the mean of a list of numbers, as a float. For an empty list return <code>0.0</code> instead of crashing.</p>",
"starter": "def average(numbers):\n    # add the numbers up, then divide by how many there are\n    pass\n\nprint(average([2, 4, 6]))",
"tests": [
{
"n": "average([2, 4, 6]) is 4.0",
"code": "assert average([2,4,6])==4.0,\"average([2, 4, 6]) should be 4.0\""
},
{
"n": "one item",
"code": "assert average([1])==1.0,\"average([1]) should be 1.0\""
},
{
"n": "decimals",
"code": "assert abs(average([0.5,0.25])-0.375)<1e-9,\"average([0.5, 0.25]) should be 0.375\""
},
{
"n": "empty list",
"hidden": true,
"code": "assert average([])==0.0,\"average([]) should return 0.0 (the list is empty)\""
},
{
"n": "float result",
"hidden": true,
"code": "assert isinstance(average([1,2]),float) and average([1,2])==1.5,\"average([1, 2]) should be the float 1.5\""
}
],
"hints": [
"The total is <code>sum(numbers)</code> and the count is <code>len(numbers)</code>.",
"Dividing by <code>len(numbers)</code> crashes when the list is empty. Add an <code>if</code> at the top for that case.",
"Shape: <code>if len(numbers) == 0:</code> then return 0.0; otherwise return the sum divided by the length."
],
"solution": "def average(numbers):\n    if len(numbers) == 0:\n        return 0.0\n    return sum(numbers) / len(numbers)",
"why": "The empty-list check is the habit to build: eval data is often empty or tiny."
},
{
"t": "code",
"id": "pp2",
"title": "Count the scores above a bar",
"q": "<p>Write <code>count_at_least(scores, bar)</code> that returns how many scores are <b>greater than or equal to</b> <code>bar</code>. Use a loop and an <code>if</code>.</p>",
"starter": "def count_at_least(scores, bar):\n    count = 0\n    # loop over scores, add 1 to count when a score reaches the bar\n    return count\n\nprint(count_at_least([0.9, 0.4, 0.75], 0.6))",
"tests": [
{
"n": "two of three reach 0.6",
"code": "assert count_at_least([0.9,0.4,0.75],0.6)==2,\"count_at_least([0.9, 0.4, 0.75], 0.6) should be 2\""
},
{
"n": "none reach",
"code": "assert count_at_least([0.1,0.2],0.5)==0,\"count_at_least([0.1, 0.2], 0.5) should be 0\""
},
{
"n": "empty list",
"code": "assert count_at_least([],0.5)==0,\"count_at_least([], 0.5) should be 0\""
},
{
"n": "equal counts",
"hidden": true,
"code": "assert count_at_least([0.6,0.6,0.5],0.6)==2,\"a score equal to the bar counts: count_at_least([0.6, 0.6, 0.5], 0.6) should be 2\""
},
{
"n": "input unchanged",
"hidden": true,
"code": "s=[3,1,2];count_at_least(s,2);assert s==[3,1,2],\"the input list was changed\""
}
],
"hints": [
"Start with <code>for s in scores:</code> and put an <code>if</code> inside the loop.",
"The condition is <code>s &gt;= bar</code>. Think about whether a score exactly equal to the bar should count.",
"Inside the <code>if</code>, write <code>count = count + 1</code>."
],
"solution": "def count_at_least(scores, bar):\n    count = 0\n    for s in scores:\n        if s >= bar:\n            count = count + 1\n    return count",
"why": "Boundaries matter: >= and > give different answers whenever a score lands exactly on the bar."
},
{
"t": "code",
"id": "pp3",
"title": "A three-band grader",
"q": "<p>Write <code>grade(score)</code>: return <code>\"excellent\"</code> if the score is 0.8 or more, <code>\"pass\"</code> if it is 0.6 or more (but under 0.8), otherwise <code>\"fail\"</code>.</p>",
"starter": "def grade(score):\n    pass\n\nprint(grade(0.7))",
"tests": [
{
"n": "0.9 is excellent",
"code": "assert grade(0.9)==\"excellent\",\"grade(0.9) should be \\\"excellent\\\"\""
},
{
"n": "0.7 is pass",
"code": "assert grade(0.7)==\"pass\",\"grade(0.7) should be \\\"pass\\\"\""
},
{
"n": "0.2 is fail",
"code": "assert grade(0.2)==\"fail\",\"grade(0.2) should be \\\"fail\\\"\""
},
{
"n": "exactly 0.8",
"hidden": true,
"code": "assert grade(0.8)==\"excellent\",\"grade(0.8) is on the boundary and should be \\\"excellent\\\"\""
},
{
"n": "exactly 0.6",
"hidden": true,
"code": "assert grade(0.6)==\"pass\",\"grade(0.6) is on the boundary and should be \\\"pass\\\"\""
},
{
"n": "just under",
"hidden": true,
"code": "assert grade(0.599)==\"fail\",\"grade(0.599) is just under 0.6 and should be \\\"fail\\\"\""
}
],
"hints": [
"Use <code>if</code>, <code>elif</code> and <code>else</code>, checking the highest band first.",
"Return the words with <code>return \"excellent\"</code> (the quote marks matter).",
"The first test is <code>if score &gt;= 0.8:</code> and the second is <code>elif score &gt;= 0.6:</code>."
],
"solution": "def grade(score):\n    if score >= 0.8:\n        return \"excellent\"\n    elif score >= 0.6:\n        return \"pass\"\n    else:\n        return \"fail\"",
"why": "Order and boundaries matter. Checking the highest band first lets each later test assume the earlier ones failed."
},
{
"t": "code",
"id": "pp4",
"title": "Chance of getting every question right",
"q": "<p>A model answers each question correctly with probability <code>p</code>, independently. Write <code>chance_all_correct(p, n)</code> that returns the probability of getting all <code>n</code> questions right.</p>",
"starter": "def chance_all_correct(p, n):\n    pass\n\nprint(chance_all_correct(0.9, 5))",
"tests": [
{
"n": "two coin flips",
"code": "assert abs(chance_all_correct(0.5,2)-0.25)<1e-9,\"chance_all_correct(0.5, 2) should be 0.25\""
},
{
"n": "one question",
"code": "assert abs(chance_all_correct(0.9,1)-0.9)<1e-9,\"chance_all_correct(0.9, 1) should be 0.9\""
},
{
"n": "always right",
"code": "assert abs(chance_all_correct(1.0,5)-1.0)<1e-9,\"chance_all_correct(1.0, 5) should be 1.0\""
},
{
"n": "zero questions",
"hidden": true,
"code": "assert abs(chance_all_correct(0.9,0)-1.0)<1e-9,\"with n = 0 there is nothing to get wrong, so the answer is 1.0\""
},
{
"n": "never right",
"hidden": true,
"code": "assert abs(chance_all_correct(0.0,3))<1e-9,\"chance_all_correct(0.0, 3) should be 0.0\""
},
{
"n": "five questions",
"hidden": true,
"code": "assert abs(chance_all_correct(0.9,5)-0.59049)<1e-6,\"chance_all_correct(0.9, 5) should be about 0.59049\""
}
],
"hints": [
"For independent events you multiply the probabilities together.",
"Doing it n times is a power: <code>p ** n</code>.",
"The whole function is a single line: <code>return p ** n</code>."
],
"solution": "def chance_all_correct(p, n):\n    return p ** n",
"why": "A 90% model gets 5 questions all right only about 59% of the time. Small per-question errors add up across a long task."
},
{
"t": "code",
"id": "pp5",
"title": "Expected value",
"q": "<p><code>outcomes</code> is a list of <code>(value, probability)</code> pairs. Write <code>expected_value(outcomes)</code> that returns the sum of value x probability. An empty list should return <code>0.0</code>.</p>",
"starter": "def expected_value(outcomes):\n    total = 0.0\n    # loop over the pairs; each pair is (value, probability)\n    return total\n\nprint(expected_value([(10, 0.2), (0, 0.8)]))",
"tests": [
{
"n": "the game from the lesson",
"code": "assert abs(expected_value([(10,0.2),(0,0.8)])-2.0)<1e-9,\"expected_value([(10, 0.2), (0, 0.8)]) should be 2.0\""
},
{
"n": "a sure thing",
"code": "assert abs(expected_value([(1,1.0)])-1.0)<1e-9,\"expected_value([(1, 1.0)]) should be 1.0\""
},
{
"n": "fair coin, 1 or 3",
"code": "assert abs(expected_value([(1,0.5),(3,0.5)])-2.0)<1e-9,\"expected_value([(1, 0.5), (3, 0.5)]) should be 2.0\""
},
{
"n": "empty list",
"hidden": true,
"code": "assert expected_value([])==0.0,\"expected_value([]) should be 0.0\""
},
{
"n": "negative values",
"hidden": true,
"code": "assert abs(expected_value([(-5,0.5),(5,0.5)]))<1e-9,\"expected_value([(-5, 0.5), (5, 0.5)]) should be 0.0, negative values count\""
}
],
"hints": [
"Loop with <code>for value, prob in outcomes:</code>, which unpacks each pair.",
"Inside the loop, add <code>value * prob</code> to <code>total</code>.",
"Line to add inside the loop: <code>total = total + value * prob</code>."
],
"solution": "def expected_value(outcomes):\n    total = 0.0\n    for value, prob in outcomes:\n        total = total + value * prob\n    return total",
"why": "Expected value is a weighted average. It is the idea behind average scores, and behind sizing a bet or a hedge."
}
]
};
