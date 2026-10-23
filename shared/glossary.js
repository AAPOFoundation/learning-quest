/* "Also called": maps OUR terms to the other names you will meet elsewhere (for example in Claude Academy courses). Nothing in the game is renamed.
   Adds one tab (pause menu in every world). Original wording; the other names are listed so you can recognise them. */
(function(){var A=window.APP;if(!A)return;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var G=[
['Skills for working with AI',[
 ['grader (and rubric, judge)','Discernment','Judging whether an AI answer is right and good. A grader is Discernment done automatically, on many answers at once.','AI Evals'],
 ['prompt, system prompt','Description (also: prompting, directives)','Telling the model what you want, clearly. In the game we say prompt; Academy files the same skill under Description.','AI Evals, Fluency Fields'],
 ['what to hand to an AI, and what to keep','Delegation','Deciding which parts of a job an AI should do. Our nearest idea is agent autonomy and approval gates.','AI Safety, Fluency Fields'],
 ['governance, red-team, disclosure','Diligence (using AI responsibly and safely)','Taking responsibility for what you make with AI: checking it, saying when AI helped, and not causing harm.','AI Safety, Fluency Fields'],
 ['the four habits (our name in Fluency Fields)','the 4Ds: Delegation, Description, Discernment, Diligence','A teaching framework from Claude Academy\'s AI Fluency course. We map it onto skills you already have here.','Fluency Fields']]],
['How models work',[
 ['next-token prediction','next token prediction ("autocomplete")','The model picks a likely next piece of text, over and over. The Autocomplete Workshop lets you try a tiny version.','AI Foundations'],
 ['context window','Working Memory','How much text the model can take in at once. Same thing, different name.','AI Foundations'],
 ['training data (and its end date)','Knowledge, knowledge cutoff','What the model absorbed in training and the date after which it has seen nothing. Facts after that date need to be supplied by you.','AI Foundations'],
 ['system prompt and instructions','Steerability','How far your instructions can change what the model does. Strong steerability is useful, and risky when someone steers it badly.','Fluency Fields'],
 ['temperature, top-k, top-p','sampling settings','Temperature flattens or sharpens the odds. Top-k keeps only the k likeliest words. Top-p keeps the smallest group of words whose odds add up to p. All three are in the Autocomplete Workshop.','AI Foundations, Fluency Fields'],
 ['chain of thought','extended thinking','Reasoning the model writes out before its answer. Treat what it shows as evidence, not proof, of why it answered.','AI Safety']]],
['Evals',[
 ['test set','test dataset (also: eval set)','The questions you score with. We say test set. Keep it away from the data you tuned on.','AI Evals, Expedition'],
 ['test case','test case, example, sample','One question with its expected answer or rubric.','AI Evals, Expedition'],
 ['scorecard','prompt evaluation workflow results','A table of accuracy (with uncertainty) and cost for each prompt or model you compared.','Expedition'],
 ['trajectory','agent loop output (the steps it took)','The record of what an agent did: messages and tool calls in order.','AI Evals'],
 ['tool call','tool use, function calling','The model asks for a named tool to run, with an input. Your code runs it and hands the result back.','AI Evals'],
 ['agent loop (you build it in Agent Proving Grounds)','agent loop','Repeat: the model decides, a tool runs, the result goes back, until a final answer or a step limit.','AI Evals'],
 ['chain / router (Python challenges)','workflows: chaining, routing','Chain: fixed steps one after another. Router: pick a path from the request. Both are plain code around a model.','AI Evals']]],
['Safety and checking',[
 ['hallucination','hallucination','A fluent answer that is wrong or made up. It clusters in specifics: names, dates, numbers and citations.','AI Foundations, Fluency Fields'],
 ['sycophancy','sycophancy','Telling people what they want to hear: agreeing with a wrong claim, empty praise, or caving to pushback with no new evidence.','AI Safety, Fluency Fields'],
 ['bias in a neuron (Warden Bias)','bias term (the maths sense)','A neuron\'s <b>bias</b> is a number added to its weighted sum before the squash. It is a setting inside the model, not a fault. See the next row for the other meaning.','AI Foundations'],
 ['grader bias, model bias','bias (skewed or unfair output)','A skew in outputs: a judge that prefers the first answer or long answers, or a model that treats groups differently. Same word, different idea: the neuron bias is maths, this one is about fairness and accuracy.','AI Evals, AI Safety']]],
['Tools and context',[
 ['tool server (the pretend server in Agent Proving Grounds)','MCP (Model Context Protocol): servers and clients','A published standard for plugging tools and data into an AI app. We build a tiny pretend version, with no network, so the ideas are clear.','AI Evals'],
 ['tool (the model decides)','MCP tools (model-controlled)','An action or calculation the model chooses to call. The risky one, so it is where permissions go.','AI Evals'],
 ['resource (the app decides)','MCP resources (app-controlled)','Data the app reads and attaches, found by name or address.','AI Evals'],
 ['prompt template (the user picks)','MCP prompts (user-controlled)','A ready-made instruction with blanks that the user chooses from a menu.','AI Evals'],
 ['permission gate (deny by default, ask for risky)','permissions, human-in-the-loop approval','Rules in code that decide which tools may run and which wait for a person.','AI Evals'],
 ['rewrite and grade the prompt (Trial Hall)','prompt evaluation workflow, prompt iteration','Change a prompt, score both versions on several cases with the same rubric, and compare the averages.','Fluency Fields'],
 ['Context Bench (what fits, what it costs)','context management, token budget','Planning what goes into the context window and what each call costs. Prices in the game are made up.','Fluency Fields'],
 ['caching the unchanged start','prompt caching','Reusing an identical start of a long prompt at a lower price on later calls. It saves money and delay, not room in the window.','Fluency Fields']]],
['Words used elsewhere that the game does not teach (yet)',[
 ['(not covered)','subagents, agent skills','A helper agent for a sub-task, and reusable packaged instructions for an agent.','Not in the game yet']]],
['Game words',[
 ['region','course section','One town on the map, a self-contained lesson block.','Every world'],
 ['Gatekeeper (Warden)','quiz','The questions at the end of a region. Pass to move on.','Every world'],
 ['Trial Hall','exercise','The Python challenges for a region (hidden tests, hints, 15 XP each).','Every world'],
 ['Expedition','hands-on project','Real work on your own computer, outside the game.','AI Evals, AI Safety'],
 ['chest, badge, XP','completion badge','Rewards that show progress. They are not marks from any course.','Every world']]]];
function rowsHTML(q){var h='',n=0,ql=q.toLowerCase();G.forEach(function(g){var rows=g[1].filter(function(r){return !ql||r.join(' ').toLowerCase().indexOf(ql)>=0});if(!rows.length)return;n+=rows.length;
   h+='<div class="panel lesson"><h3>'+esc(g[0])+'</h3>'+rows.map(function(r){return '<div class="gl-row"><p style="margin:0"><b>'+esc(r[0])+'</b> <span class="dim">&rarr; also called</span> <b>'+esc(r[1])+'</b></p><p class="small" style="margin:4px 0">'+r[2]+'</p><p class="small dim" style="margin:0">Where: '+esc(r[3])+'</p></div>'}).join('')+'</div>'});
  return n?h:'<div class="panel lesson"><p>No match. Try a shorter word.</p></div>'}
/* the search box is built once; typing only redraws the results (at most once per frame), so focus and the caret are never lost */
function render(el){var raf=0;
 el.innerHTML='<div class="panel lesson"><p class="kicker">Also called</p><h3>Same ideas, other names</h3><p>When you read or watch other AI courses you will meet different words for ideas you already know. This page lists our word on the left and what you may see elsewhere on the right. The game keeps its own words.</p>'
  +'<p class="small dim">The other names come from the public course pages of Claude Academy (academy.claude.com), checked 17 Oct 2026. Names and courses change, so treat this as a guide to recognise words, not an official glossary. Rows marked "not covered" are ideas the game does not teach yet.</p>'
  +'<p style="margin:0"><input id="gl-q" class="lq-search" type="search" placeholder="Search a word, for example context window" aria-label="Search the glossary" aria-controls="gl-res" autocomplete="off"></p></div><div id="gl-res" aria-live="polite"></div>';
 var inp=el.querySelector('#gl-q'),res=el.querySelector('#gl-res');res.innerHTML=rowsHTML('');
 inp.oninput=function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;res.innerHTML=rowsHTML(inp.value.trim())})}}
A.tabs=A.tabs||[];A.tabs.push({id:'gloss',label:'Also called (glossary)',render:render});
window.LQGlossary=G;
})();
