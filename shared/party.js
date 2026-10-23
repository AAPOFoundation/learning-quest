/* Recurring party, satchel of solved functions, and the Citadel Workshop (coding capstone). Light: no assets, portraits come from Art.portrait.
   Party members join as you progress in any world (read from each world's save). The satchel keeps the functions YOU wrote and got passing,
   and the capstone loads them. Everything is stored in this browser only. */
(function(){
var A=window.APP;if(!A)return;
var WORLDS=['python-basics','ai-foundations','ai-evals','ai-safety'];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function save(k){try{return JSON.parse(localStorage.getItem('learning-apps.'+k))}catch(e){return null}}
function sv(k){if(k===A.key&&window.Engine)return window.Engine.P();return save(k)||{levels:{},code:{}}}
function done(k,id){var p=sv(k);return !!(p.levels&&p.levels[id]&&p.levels[id].done)}
function nDone(k){var p=sv(k);return Object.keys(p.levels||{}).filter(function(i){return p.levels[i].done}).length}
function nCode(){var n=0;WORLDS.forEach(function(k){n+=Object.keys(sv(k).code||{}).length});return n}
/* ---------------- satchel ---------------- */
var SK='learning-apps.satchel';
function sload(){try{return JSON.parse(localStorage.getItem(SK))||{}}catch(e){return {}}}
function ssave(o){try{localStorage.setItem(SK,JSON.stringify(o))}catch(e){}}
function defsOnly(src){var out=[],keep=false,lines=String(src).split('\n');
 lines.forEach(function(l){var top=/^\S/.test(l)&&!/^#/.test(l);
  if(top)keep=/^(import |from |def |class |@)/.test(l)||/^[A-Z_][A-Z0-9_]*\s*=/.test(l);
  if(keep)out.push(l)});return out.join('\n').replace(/\n{3,}/g,'\n\n').trim()}
var Satchel={
 add:function(q,code){var d=defsOnly(code);if(!d||!/def /.test(d))return;var s=sload(),fns=(d.match(/^def (\w+)/gm)||[]).map(function(x){return x.slice(4)});
  s[q.id]={code:d,fns:fns,title:q.title||q.id,world:A.key,t:Date.now()};ssave(s)},
 get:function(id){return sload()[id]||null},
 all:function(){return sload()}};
window.Satchel=Satchel;
/* ---------------- party ---------------- */
function lk(skin,hair,robe,hat,beard){var o={skin:skin,hair:hair,robe:robe,trim:'#d7b56a',hat:hat};if(beard)o.beard=true;return o}
var CREW=[
 {id:'pip',name:'Pip the Courier',role:'Guide and map-reader',look:lk('#e8bd94','#8a4a22','#4a5f8a','cap'),when:'Clear any region in any world',
  ok:function(){return WORLDS.some(function(k){return nDone(k)>0})},
  tips:{'python-basics':['Do the worlds in the suggested order on the home page, but nothing is locked. Come back whenever a word is unfamiliar.','Every challenge in the later worlds links back to the Python lesson it uses.'],'ai-foundations':['Foundations is the "why does it behave like that" world. Try the simulators; moving a slider teaches more than reading.','If a Python challenge feels steep, press "Python ideas used here" and read the matching lesson first.'],'ai-evals':['Evals is the practical skill. Your Expedition tab turns it into real work on your own computer.','Keep your satchel stocked: the Citadel Workshop at the end uses the functions you wrote.'],'ai-safety':['Several regions here are early-stage science. Notice the "contested" markers: they are part of the lesson.','Clear a region, then check the Expedition tab for a matching real-model experiment.']}},
 {id:'wren',name:'Tutor Wren',role:'Keeper of first code',look:lk('#e3b896','#7a3b22','#3d6b4f','scholar'),when:'Solve 3 Python challenges, or clear a Python Basics region',
  ok:function(){return nCode()>=3||nDone('python-basics')>0},
  tips:{'python-basics':['Type the code yourself. Reading code is not the same as writing it.','Break things on purpose and read the error. The line number is a kindness.'],'ai-foundations':['A function is a small machine: inputs in, one result out. Test it with the smallest case first.','If you are stuck, print the middle values. Most bugs hide in a step you assumed.'],'ai-evals':['Edge cases are where evals fail: empty lists, ties, one item. The hidden tests check them for a reason.','Your solved functions go into the satchel. Keep them tidy: you will reuse them.'],'ai-safety':['A measurement function should say what it does with an empty list. Decide, then test it.','Compare your code with the walk-through only after you have tried once.']}},
 {id:'mara',name:'Statistician Mara',role:'Reader of noise',look:lk('#d9a97c','#4a4a52','#2f5d62','scholar'),when:'Clear the statistics region in AI Evals, or four Evals regions',
  ok:function(){return done('ai-evals','lS')||nDone('ai-evals')>=4},
  tips:{'python-basics':['Averages hide spread. When you can, look at the individual numbers too.'],'ai-foundations':['A model that looks better on one test set may just have been lucky. Ask how many cases it rests on.','Loss curves are noisy. A single dip is not a trend.'],'ai-evals':['Always report the number of cases and an interval. "80%" means little; "80% of 40, give or take 12" means something.','For two models on the same cases, compare them case by case, not just by their averages.'],'ai-safety':['A rate from 12 prompts has a very wide interval. Say so when you report a flip rate or a gap.','The gap you measure is only believable with its interval beside it.']}},
 {id:'vex',name:'Captain Vex',role:'Red-team lead',look:lk('#d2a078','#d8d4cc','#7a2f3a','crown',true),when:'Clear the red-teaming region in AI Safety or AI Evals',
  ok:function(){return done('ai-safety','l3')||done('ai-evals','l6')},
  tips:{'python-basics':['Try to break your own function with an odd input. That is testing, and it is the same habit.'],'ai-foundations':['Ask what the model was never shown. That is where it will surprise you.'],'ai-evals':['Agree the scope first, log everything, rank by severity, and retest a fix with reworded attacks.','A clean run proves little. State how hard you tried.'],'ai-safety':['Keep every test harmless and within scope. If you find a real weakness, report it privately first.','A defence is only as good as the attack you tried against it. Say which attacks you did not try.']}}];
function joined(){return CREW.filter(function(c){return c.ok()})}
var seenCrew=null,Party={crew:CREW,joined:joined,
 hud:function(el){var j=joined(),grew=seenCrew!=null&&j.length>seenCrew;seenCrew=j.length;el.innerHTML=j.map(function(c,i){return '<img'+(grew&&i===j.length-1?' class="just"':'')+' alt="'+esc(c.name)+'" title="'+esc(c.name+', '+c.role)+'" src="'+Art.portrait(c.look,26)+'">'}).join('')},
 cameo:function(add,i,castle,mir){
  if(castle){if(A.capstone)add({type:'npc',role:'workshop',c:mir(4,i),r:7,block:true,name:'Artificer Wren',sp:{name:'Artificer Wren',title:'Keeper of the Citadel Workshop',look:CREW[1].look},crew:'wren'});return}
  var j=joined();if(!j.length)return;var c=j[i%j.length];
  add({type:'npc',role:'party',c:mir(11,i),r:8,block:true,name:c.name,sp:{name:c.name,title:c.role,look:c.look},crew:c.id,region:i})},
 talk:function(o,H){
  if(o.role==='workshop'){return Party.workshopTalk(o,H)}
  var c=CREW.filter(function(x){return x.id===o.crew})[0],tips=(c.tips[A.key]||c.tips['ai-evals']),line=tips[(o.region||0)%tips.length],n=joined().length;
  H.say(o.sp,['Well met. I travel with you now.',line,n<CREW.length?'More companions will join as you clear regions. See the Party tab in the menu.':'The whole party is together.'])},
 workshopTalk:function(o,H){var cap=A.capstone,sp=o.sp;
  if(!H.allDone())return H.say(sp,['The Workshop opens when you have crossed every region.']);
  var need=cap.needs,have=need.filter(function(n){return Satchel.get(n.id)}).length;
  H.say(sp,['Welcome to the Workshop. Here you assemble the functions you wrote on the way into one working tool.','Your satchel holds '+have+' of the '+need.length+' pieces this job needs. Missing pieces can be borrowed from the reference, but your own count more.'],function(){
   H.ask(sp,'Enter the Workshop?',[{t:'Begin',fn:function(){Party.openCapstone(H)}},{t:'Not yet'}])})},
 build:function(){var cap=A.capstone,need=cap.needs,pre=[],rows='',borrowed=0;
  need.forEach(function(n){var m=Satchel.get(n.id),ref=refSolution(n.id);
   if(m){pre.push(m.code);rows+='<li class="sat">'+(window.LQMark?LQMark('ok',16):'')+' <code>'+esc(n.fn)+'</code> <span class="small dim">your version ('+esc(m.title)+')</span></li>'}
   else if(ref){pre.push(ref);borrowed++;rows+='<li class="sat">'+(window.LQMark?LQMark('borrow',16):'')+' <code>'+esc(n.fn)+'</code> <span class="small dim">borrowed reference (solve "'+esc(n.title)+'" yourself to use your own)</span></li>'}
   else rows+='<li class="sat">'+(window.LQMark?LQMark('no',16):'')+' <code>'+esc(n.fn)+'</code> missing</li>'});
  return {rows:rows,borrowed:borrowed,q:{t:'code',id:'cap-'+A.key,capstone:true,title:cap.title,q:cap.q,starter:cap.starter,tests:cap.tests,hints:cap.hints,solution:cap.solution,why:cap.why,prelude:pre.join('\n\n')}}},
 openCapstone:function(H){var cap=A.capstone;
  H.openOv(function(){var b=Party.build(),q=b.q;
   H.wrap('<section class="panel"><p class="kicker">Citadel Workshop</p><h2>'+esc(cap.title)+'</h2><p>'+cap.intro+'</p><p class="small dim"><b>Your satchel is loaded</b> before your code runs, so you can call these functions directly:</p><ul>'+b.rows+'</ul>'+(b.borrowed?'<p class="small dim">A borrowed piece is the game\'s reference version. It works, but the point is using your own.</p>':'')+'<details><summary class="small">Show the loaded satchel code</summary><pre class="ex" style="white-space:pre-wrap;max-height:260px;overflow:auto">'+esc(q.prelude)+'</pre></details></section><div id="capq"></div><button class="btn btn-ghost rise" id="capx" style="margin-top:12px">Leave the Workshop</button>');
   document.getElementById('capx').onclick=H.closeOv;
   window.CodeQ.mount(q,document.getElementById('capq'),{idx:0,total:1,title:'Citadel Workshop',done:function(ok){if(ok){var P=window.Engine.P();if(P.badges.indexOf('capstone')<0){window.Engine.award('capstone');P.xp+=60;window.Engine.save()}H.chime();H.closeOv()}}})})}};
window.Party=Party;
function refSolution(id){var s=null;A.levels.forEach(function(l){l.qs.forEach(function(x){if(x.id===id)s=x.solution})});return s}
if(A.capstone)A.badges.push({id:'capstone',icon:'🏛️',name:'Citadel Artificer',desc:'Solve the Citadel Workshop coding capstone'});
/* ---------------- tabs ---------------- */
A.tabs=A.tabs||[];
A.tabs.push({id:'party',label:'Party',render:function(el){var j=joined().map(function(c){return c.id});
 var h='<div class="panel lesson"><p class="kicker">Party</p><p>Companions travel across all four worlds. They join as you progress anywhere, and they wait in the towns with advice for whichever world you are in.</p></div>';
 CREW.forEach(function(c,i){var on=j.indexOf(c.id)>=0,tips=c.tips[A.key]||c.tips['ai-evals'];
  h+='<div class="panel lesson" style="display:flex;gap:14px;align-items:flex-start;animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*40)+'ms"><img alt="" src="'+Art.portrait(c.look,64)+'" style="width:64px;height:64px;border-radius:10px;border:1px solid var(--gold);'+(on?'':'filter:grayscale(1) brightness(.5)')+'"><div><h3 style="margin:0">'+esc(c.name)+'</h3><p class="small dim" style="margin:2px 0 8px">'+esc(c.role)+'</p>'+(on?'<p>'+esc(tips[0])+'</p>':'<p class="small dim">Not yet met. Joins when you: '+esc(c.when)+'.</p>')+'</div></div>'});
 el.innerHTML=h}});
A.tabs.push({id:'satchel',label:'Satchel',render:function(el){var s=sload(),ids=Object.keys(s).sort(function(a,b){return s[a].t-s[b].t});
 var h='<div class="panel lesson"><p class="kicker">Satchel</p><p>Every Python challenge you solve puts <b>your own working function</b> here. The Citadel Workshop at the end of a world loads them so you build on what you wrote. Nothing leaves this browser.</p><p class="small dim">'+ids.length+' function set'+(ids.length===1?'':'s')+' collected.</p></div>';
 if(!ids.length)h+='<div class="panel lesson" style="animation:pop .22s ease both"><p class="dim">Empty so far. Solve a Python challenge in any world and it appears here.</p></div>';
 ids.forEach(function(id,i){var m=s[id];h+='<div class="panel lesson" style="animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*40)+'ms"><h3 style="margin:0 0 4px">'+esc(m.title)+'</h3><p class="small dim">'+m.fns.map(function(f){return '<code>'+esc(f)+'</code>'}).join(', ')+' · from '+esc(m.world)+'</p><details><summary class="small">Show code</summary><pre class="ex" style="white-space:pre-wrap">'+esc(m.code)+'</pre></details></div>'});
 el.innerHTML=h}});
})();
