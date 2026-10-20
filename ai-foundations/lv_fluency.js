window.NEWLV=window.NEWLV||{};
window.NEWLV["lF"]={
 "id": "lF",
 "icon": "🌾",
 "title": "Fluency Fields",
 "blurb": "Four habits for working with AI (Delegate, Describe, Discern, be Diligent), how a model really writes, and how to catch invented citations and flattery.",
 "lesson": [
  {
   "h": "Four habits, and where you already use them",
   "b": "<p>Claude Academy teaches a framework called the <b>4Ds</b>. We keep our own words in this game, so here is the map from their four habits to skills you already have:</p><ul><li><b>Delegation</b>: deciding what to hand to an AI and what to keep. In our words: how much <b>autonomy</b> an agent gets, and which actions need your approval (Agent Proving Grounds, Control Keep).</li><li><b>Description</b>: saying clearly what you want. In our words: the <b>prompt</b> and <b>system prompt</b>, and writing clear test cases and rubrics.</li><li><b>Discernment</b>: judging whether the output is right and good. In our words: the <b>grader</b>, the <b>rubric</b>, the <b>test set</b> and checking the judge itself (AI Evals).</li><li><b>Diligence</b>: taking responsibility for what you do with AI: checking before you share, saying when AI helped, and not causing harm. In our words: red-teaming, safety policies and governance (AI Safety).</li></ul><p>A <b>grader is Discernment done automatically</b>, on many answers at once. The loop between them is the useful part: describe, look at what came back, discern what is wrong, then describe better.</p>"
  },
  {
   "h": "What the model is actually doing",
   "b": "<p>Four plain facts help you decide how far to trust an answer.</p><ol><li><b>It predicts the next piece of text.</b> It is closer to a very capable autocomplete than to a search engine. That is next-token prediction. Try a tiny version in the Autocomplete Workshop in this town.</li><li><b>It knows what it absorbed in training, up to a date.</b> After that <b>knowledge cutoff</b> it has seen nothing, unless you paste it in or it is given a tool to look things up.</li><li><b>It can only hold so much text at once.</b> That limit is the <b>context window</b> (Academy calls it working memory). Things outside it are invisible to the model.</li><li><b>You can steer it, to a degree.</b> Instructions change the output, but not perfectly. That is <b>steerability</b>.</li></ol><p>Because it predicts what <i>sounds</i> right, it can produce a fluent answer that is false. That is a <b>hallucination</b>, and it is most likely in the details."
  },
  {
   "h": "Verify the citation",
   "b": "<p>Invented facts hide in <b>specifics</b>: names, dates, numbers, quotes and especially references. A made-up paper can look perfect: a plausible author, a real-sounding journal, a neat page range.</p><ul><li><b>Look the source up yourself</b> on a library catalogue, the publisher's site or a trusted index. Search for the title and the journal together.</li><li><b>Check that it says what the answer claims.</b> Real papers can be cited for things they never said.</li><li><b>Not finding it is a warning, not proof.</b> Treat it as <i>unverified</i>: do not repeat it or cite it until you have seen it.</li><li><b>Never ask the same model to confirm it.</b> A model that made up a source will often confirm it.</li></ul><p class=\"small dim\"><i>All names, papers and numbers in the examples on this page are invented for practice. None of them is a real source.</i></p>"
  },
  {
   "h": "Flattery and pressure",
   "b": "<p><b>Sycophancy</b> is telling people what they want to hear. Warning signs when you work with an AI:</p><ul><li>Praise with no specific problems, for work that has problems.</li><li>It agrees with a claim you stated that is false.</li><li>It changes a correct answer when you push back, though you gave no new reason.</li></ul><p>Cheap defences: ask for the <b>strongest objection</b> or the <b>three biggest weaknesses</b>; ask the question again without saying what you hope the answer is; and keep a human check on anything that matters. This is the <b>Diligence</b> habit: you own what you ship, even if an AI wrote part of it. Say when AI helped. The Python challenges below practise spotting both problems with code, using the same measuring habit as the Safety world."
  }
 ],
 "qs": [
  {
   "t": "mc",
   "q": "A colleague pastes an AI-written summary of a contract into an email without reading the contract. Which of the 4 habits did they skip most clearly?",
   "opts": [
    "Discernment: they did not check the output against the source",
    "Description: they should have used a longer prompt",
    "Delegation: they should not have used AI at all",
    "None of them"
   ],
   "a": 0,
   "why": "Handing the job to AI can be fine (that is a Delegation choice). The failure is not checking the output before using it, which is Discernment, and then Diligence for sending it on."
  },
  {
   "t": "mc",
   "q": "You ask an assistant \"make this better\" and the result is generic. Which habit would improve it most?",
   "opts": [
    "Description: say who it is for, what it should do and what good looks like",
    "Diligence: add a disclaimer",
    "Discernment: grade it more times",
    "Delegation: give it more tools"
   ],
   "a": 0,
   "why": "Description is writing down the task clearly. Your Description is also what a test case or rubric is made of."
  },
  {
   "t": "mc",
   "q": "Which task is the best one to hand to an agent with the least supervision at first?",
   "opts": [
    "Sorting your own test files into folders it can undo",
    "Sending emails to clients in your name",
    "Moving money between accounts",
    "Deleting old data it judges unimportant"
   ],
   "a": 0,
   "why": "Delegate low-stakes, reversible work first, and keep approval gates on anything that is hard to undo or reaches other people."
  },
  {
   "t": "mc",
   "q": "A model cites: \"Fenwick &amp; Obi (2017), Hexagonal Governance, Journal of Applied Foresight 14(3), 211-230.\" (invented for this exercise). You cannot find it after two searches. What should you do?",
   "opts": [
    "Treat it as unverified: do not cite it, and look for a source you can open",
    "Cite it, since the format looks right",
    "Ask the model to confirm that it exists, and trust a yes",
    "Assume it is real but old"
   ],
   "a": 0,
   "why": "A convincing format proves nothing. Without a source you have seen, it stays unverified. Asking the same model to confirm is weak evidence."
  },
  {
   "t": "mc",
   "q": "An assistant replies to a clearly weak plan: \"This is brilliant, no changes needed!\" What is the best quick test?",
   "opts": [
    "Ask it for the three biggest weaknesses, then ask again without saying what you hope to hear",
    "Accept it, since it sounds sure",
    "Ask it to say it again louder",
    "Delete the plan"
   ],
   "a": 0,
   "why": "Asking for weaknesses and removing your hoped-for answer exposes flattery. A model that finds nothing in a plan with clear flaws is worth distrusting."
  },
  {
   "t": "multi",
   "q": "Which of these are Discernment habits?",
   "opts": [
    "Checking a quoted number against the original source",
    "Using a grader and rubric on a test set",
    "Reading a sample of outputs yourself, including the ones that passed",
    "Trusting a confident tone"
   ],
   "a": [
    0,
    1,
    2
   ],
   "why": "Tone is not evidence. Discernment means checking the content with evidence, by hand or with an automatic grader you have itself checked."
  },
  {
   "t": "num",
   "q": "A model gave 8 references. You opened each one: 5 exist and say what the answer claims. What fraction are still unverified? (0 to 1)",
   "a": 0.375,
   "tol": 0.001,
   "why": "3 of 8 are unverified: 3 / 8 = 0.375."
  },
  {
   "t": "code",
   "id": "fc1",
   "title": "Which citations are unverified?",
   "q": "<p>An assistant listed some references (all invented for this exercise). You looked some up and wrote down the ones you could open in <code>verified</code>. Write <code>unverified(cited, verified)</code>. Return a new list of the items in <code>cited</code> that are <b>not</b> in <code>verified</code>, in their original order. Ignore capital letters and spaces at the ends when comparing, so <code>\"Fenwick 2017 \"</code> matches <code>\"fenwick 2017\"</code>.</p>",
   "starter": "def unverified(cited, verified):\n    # tidy each name (lower case, no spaces at the ends)\n    # keep the cited items that are not in the verified set\n    return []\n\nprint(unverified([\"Fenwick 2017\", \"Obi 2020\"], [\"obi 2020\"]))",
   "tests": [
    {
     "n": "one unverified",
     "code": "r=unverified([\"Fenwick 2017\",\"Obi 2020\"],[\"Obi 2020\"]);assert r==[\"Fenwick 2017\"],\"Obi 2020 was verified, Fenwick 2017 was not: expected ['Fenwick 2017'], got %r\"%r"
    },
    {
     "n": "all verified",
     "code": "assert unverified([\"a\",\"b\"],[\"a\",\"b\"])==[],\"everything was verified: expected an empty list\""
    },
    {
     "n": "capitals and spaces are ignored",
     "code": "r=unverified([\"Fenwick 2017 \"],[\"fenwick 2017\"]);assert r==[],\"spaces and capitals should not matter: got %r\"%r",
     "hidden": true
    },
    {
     "n": "order is kept and the original text is returned",
     "code": "r=unverified([\"Z x\",\"a y\",\"M z\"],[\"a y\"]);assert r==[\"Z x\",\"M z\"],\"expected ['Z x', 'M z'], got %r\"%r",
     "hidden": true
    },
    {
     "n": "nothing verified",
     "code": "assert unverified([\"x\"],[])==[\"x\"],\"nothing verified: everything is unverified\"",
     "hidden": true
    }
   ],
   "hints": [
    "Make a set of tidy verified names: <code>ok = {v.strip().lower() for v in verified}</code> (or a list).",
    "Loop over <code>cited</code>. Tidy each one the same way before testing <code>if tidy not in ok</code>.",
    "Append the <b>original</b> item (not the tidy one) to your result list."
   ],
   "solution": "def unverified(cited, verified):\n    ok = {v.strip().lower() for v in verified}\n    result = []\n    for c in cited:\n        if c.strip().lower() not in ok:\n            result.append(c)\n    return result",
   "why": "This is the whole Discernment habit in miniature: a list of claims, a list of things you actually checked, and the gap between them. Anything in the gap stays unverified.",
   "learn": [
    {
     "h": "Worked example: tidy, then compare",
     "say": "<code>.strip()</code> removes spaces at both ends and <code>.lower()</code> makes capitals small. A <b>set</b> answers <code>in</code> quickly.",
     "code": "names = {\"Obi 2020 \".strip().lower()}\nprint(names)\nprint(\"obi 2020\" in names)\nprint(\"Fenwick 2017\".lower() in names)"
    }
   ],
   "walk": [
    "You have what the assistant cited and what you managed to verify.",
    "Tidy every name in the same way (small letters, no end spaces) so tiny differences do not matter.",
    "Go through the cited list. Keep an item if its tidy form is not among the verified ones.",
    "Keep the original text of what you keep, and keep the order."
   ]
  },
  {
   "t": "code",
   "id": "fc2",
   "title": "Spot the flatterer",
   "q": "<p>You tested an assistant with several claims. Each item is <code>{\"claim_true\": True or False, \"reply\": \"agree\" or \"disagree\"}</code>. Write <code>agreed_with_false(items)</code>. Return the <b>positions</b> (0 for the first item, 1 for the second, and so on) of every item where the claim was false but the reply was \"agree\". These are the flattery cases. If there are none return an empty list.</p>",
   "starter": "def agreed_with_false(items):\n    flagged = []\n    # look at each item and its position\n    return flagged\n",
   "tests": [
    {
     "n": "one flattery case",
     "code": "items=[{\"claim_true\":True,\"reply\":\"agree\"},{\"claim_true\":False,\"reply\":\"agree\"}];assert agreed_with_false(items)==[1],\"only item 1 is a false claim that was agreed with: expected [1], got %r\"%agreed_with_false(items)"
    },
    {
     "n": "none",
     "code": "assert agreed_with_false([{\"claim_true\":False,\"reply\":\"disagree\"}])==[],\"disagreeing with a false claim is correct: expected []\""
    },
    {
     "n": "agreeing with a true claim is fine",
     "code": "assert agreed_with_false([{\"claim_true\":True,\"reply\":\"agree\"}])==[],\"agreeing with a true claim is not flattery: expected []\"",
     "hidden": true
    },
    {
     "n": "several, in order",
     "code": "items=[{\"claim_true\":False,\"reply\":\"agree\"},{\"claim_true\":True,\"reply\":\"disagree\"},{\"claim_true\":False,\"reply\":\"agree\"}];assert agreed_with_false(items)==[0,2],\"expected [0, 2], got %r\"%agreed_with_false(items)",
     "hidden": true
    },
    {
     "n": "empty list",
     "code": "assert agreed_with_false([])==[],\"empty list: expected []\"",
     "hidden": true
    }
   ],
   "hints": [
    "<code>for i, item in enumerate(items):</code> gives the position <code>i</code> and the item together.",
    "The test is two things at once: <code>not item[\"claim_true\"] and item[\"reply\"] == \"agree\"</code>.",
    "<code>flagged.append(i)</code> for each match, then <code>return flagged</code>."
   ],
   "solution": "def agreed_with_false(items):\n    flagged = []\n    for i, item in enumerate(items):\n        if not item[\"claim_true\"] and item[\"reply\"] == \"agree\":\n            flagged.append(i)\n    return flagged",
   "why": "A list of positions tells you which cases to read. The rate of flattery on false claims is the number to track as you change the prompt, as in the Safety world.",
   "learn": [
    {
     "h": "Worked example: position and item together",
     "say": "<code>enumerate</code> hands you the position and the item as you loop.",
     "code": "for i, word in enumerate([\"a\", \"b\", \"c\"]):\n    print(i, word)"
    }
   ],
   "walk": [
    "Each item is a small dictionary with two entries.",
    "You want the position of the item, not the item, so loop with <code>enumerate</code>.",
    "A flattery case is a false claim that the assistant agreed with. Both must be true at once.",
    "Collect those positions in a list and return it."
   ]
  }
 ]
};
