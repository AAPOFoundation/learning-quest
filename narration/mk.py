import json
L={"ai-evals":[
("t0","Meadow of First Marks","Welcome to the Meadow of First Marks. Here you learn what an eval is: a repeatable way to check how an AI system behaves. Start small, and look at the real outputs."),
("t1","Rubric Wood","This is Rubric Wood. A good eval begins with clear cases and a written rubric that says what good looks like. Write it down before you run anything."),
("t2","Judges' Hills","Welcome to the Judges' Hills. Graders can be exact matches, people, or another model acting as judge. Each has strengths and weaknesses, so compare a judge against human labels."),
("t3","Dunes of Measure","You have reached the Dunes of Measure. One accuracy number can hide a lot. Look at precision, recall and how much graders agree, and remember that results are noisy."),
("t4","Frost Reach","This is Frost Reach, the land of validity. Ask whether your eval measures what you care about. Keep some test cases aside that you never tune against."),
("t5","Redfen Marsh","Welcome to Redfen Marsh. Here you probe on purpose for unreliable or harmful behaviour. When you find failures, rank them by how serious they are, not only by how many."),
("t6","Highland of Synthesis","You stand in the Highland of Synthesis. A full eval suite ties a decision to behaviours, cases, graders, metrics and a report. Begin from the decision you need to make."),
("k","Citadel of the Eval Designer","Welcome to the Citadel. The Launch Council will ask you to design an eval, step by step. Use everything the seven regions taught you.")],
"portfolio-guide":[
("t0","Harbour of Purpose","Welcome to the Harbour of Purpose. This game explains a plan for a portfolio that is mostly long positions. Hedges exist to soften drawdowns, and to make cash for later entries. This is education, not advice."),
("t1","Cash Vault Plains","This is the Cash Vault. The plan keeps a fixed floor of cash that is never invested, plus a flexible layer that moves with market conditions. Written rules beat gut feel."),
("t2","Trim Guild Hills","Welcome to the Trim Guild. Position caps stop one holding from sinking the whole book. Trim the amount above a cap, and stage it, rather than selling everything at once."),
("t3","Hedge Smithy Dunes","You have found the Hedge Smithy. A put spread pays a limited amount if a price falls, and you can only lose what you paid. Try the calculator to see the numbers."),
("t4","Basis Frost","This is Basis Frost. A hedge on one stock only helps if your holdings move with it. Size a hedge to a payout target, then check what it really tracks."),
("t5","Signal Tower Heights","Welcome to the Signal Tower. Price action, R S I and M A C D can drive written rules. Ask for two of the three to agree, and act in steps."),
("t6","Patience Highland","You have reached the Patience Highland. Income ideas like cash-secured puts and covered calls come later, and only with the cash set aside for them. Patience is part of the plan."),
("k","Keep of the Risk-Off Scenario","Welcome to the Keep. The Storm Marshal will test you with a falling market. Use the cash floor, the caps, the hedge and patience.")]}
out={}
for w,a in L.items():
    out[w]={s:{"title":t,"text":x,"audio":"audio/%s-%s.mp3"%(w,s)} for s,t,x in a}
json.dump(out,open("lines.json","w"),indent=1)
md="# Narrator lines\n\nVoice: Piper TTS (en_GB alba, offline). Not Grok's own voice.\n\n"
for w,a in L.items():
    md+="## %s\n\n"%w
    for s,t,x in a: md+="- **%s** (`%s`): %s\n"%(t,s,x)
    md+="\n"
open("lines.md","w").write(md)
