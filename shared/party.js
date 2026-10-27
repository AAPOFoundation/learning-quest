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
/* r5: each companion keeps one outfit in every world (outfit names are the course outfits in art.js) */
function lk(skin,hair,robe,hat,beard,outfit){var o={skin:skin,hair:hair,robe:robe,trim:'#d7b56a',hat:hat};if(beard)o.beard=true;if(outfit)o.outfit=outfit;return o}
var CREW=[
 {id:'pip',name:'Pip the Courier',role:'Guide and map-reader',look:lk('#e8bd94','#8a4a22','#4a5f8a','cap',false,'artisan'),when:'Clear any region in any world',
  ok:function(){return WORLDS.some(function(k){return nDone(k)>0})},
  tips:{'python-basics':['Do the worlds in the suggested order on the home page, but nothing is locked. Come back whenever a word is unfamiliar.','Every challenge in the later worlds links back to the Python lesson it uses.'],'ai-foundations':['Foundations is the "why does it behave like that" world. Try the simulators; moving a slider teaches more than reading.','If a Python challenge feels steep, press "Python ideas used here" and read the matching lesson first.'],'ai-evals':['Evals is the practical skill. Your Expedition tab turns it into real work on your own computer.','Keep your satchel stocked: the Citadel Workshop at the end uses the functions you wrote.'],'ai-safety':['Several regions here are early-stage science. Notice the "contested" markers: they are part of the lesson.','Clear a region, then check the Expedition tab for a matching real-model experiment.']}},
 {id:'wren',name:'Tutor Wren',role:'Keeper of first code',look:lk('#e3b896','#7a3b22','#3d6b4f','scholar',false,'coder'),when:'Solve 3 Python challenges, or clear a Python Basics region',
  ok:function(){return nCode()>=3||nDone('python-basics')>0},
  tips:{'python-basics':['Type the code yourself. Reading code is not the same as writing it.','Break things on purpose and read the error. The line number is a kindness.'],'ai-foundations':['A function is a small machine: inputs in, one result out. Test it with the smallest case first.','If you are stuck, print the middle values. Most bugs hide in a step you assumed.'],'ai-evals':['Edge cases are where evals fail: empty lists, ties, one item. The hidden tests check them for a reason.','Your solved functions go into the satchel. Keep them tidy: you will reuse them.'],'ai-safety':['A measurement function should say what it does with an empty list. Decide, then test it.','Compare your code with the walk-through only after you have tried once.']}},
 {id:'mara',name:'Statistician Mara',role:'Reader of noise',look:lk('#d9a97c','#4a4a52','#2f5d62','scholar',false,'scholar'),when:'Clear the statistics region in AI Evals, or four Evals regions',
  ok:function(){return done('ai-evals','lS')||nDone('ai-evals')>=4},
  tips:{'python-basics':['Averages hide spread. When you can, look at the individual numbers too.'],'ai-foundations':['A model that looks better on one test set may just have been lucky. Ask how many cases it rests on.','Loss curves are noisy. A single dip is not a trend.'],'ai-evals':['Always report the number of cases and an interval. "80%" means little; "80% of 40, give or take 12" means something.','For two models on the same cases, compare them case by case, not just by their averages.'],'ai-safety':['A rate from 12 prompts has a very wide interval. Say so when you report a flip rate or a gap.','The gap you measure is only believable with its interval beside it.']}},
 {id:'vex',name:'Captain Vex',role:'Red-team lead',look:lk('#d2a078','#d8d4cc','#7a2f3a','crown',true,'warden'),when:'Clear the red-teaming region in AI Safety or AI Evals',
  ok:function(){return done('ai-safety','l3')||done('ai-evals','l6')},
  tips:{'python-basics':['Try to break your own function with an odd input. That is testing, and it is the same habit.'],'ai-foundations':['Ask what the model was never shown. That is where it will surprise you.'],'ai-evals':['Agree the scope first, log everything, rank by severity, and retest a fix with reworded attacks.','A clean run proves little. State how hard you tried.'],'ai-safety':['Keep every test harmless and within scope. If you find a real weakness, report it privately first.','A defence is only as good as the attack you tried against it. Say which attacks you did not try.']}}];
function joined(){return CREW.filter(function(c){return c.ok()})}
var seenCrew=null,Party={crew:CREW,joined:joined,
 hud:function(el){var j=joined(),grew=seenCrew!=null&&j.length>seenCrew;seenCrew=j.length;el.innerHTML=j.map(function(c,i){return '<img'+(grew&&i===j.length-1?' class="just"':'')+' alt="'+esc(c.name)+'" title="'+esc(c.name+', '+c.role)+'" src="'+Art.portrait((Art.npcLook?Art.npcLook(c.look,c.name):c.look),26)+'">'}).join('')},
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
/* ---------------- r6: people who move about ----------------
   Townsfolk (guide, teacher, the party cameo and the Workshop keeper) stroll short loops between their spot and the open tiles beside it, stop
   to chat in pairs, and wave once when the hero walks past. Their tile never changes, so collision and talking work as before, and they walk
   home when the hero is within two tiles. Gatekeepers think while you answer (a small cameo sits in the trial overlay), nod at a right answer,
   shrug and smile at a wrong one, and cheer when you pass. Joined companions follow the hero with an offset and a lag and celebrate with them.
   Everything is skipped in Low effects and reduced motion, where the people stand exactly as before. */
var FXq=function(){var F=window.LQFx;return !!(F&&(F.low||(F.rm&&F.rm.matches)))};
var STROLL={guide:1,teacher:1,party:1,workshop:1};
function rigOf(o){return o._rig||(o._rig=new Art.Rig())}
function hhash(a,b,c){return Art.hash(a|0,b|0,c|0)}
function folkSetup(sc){if(sc._folk)return sc._folk;var L=[],S=Art.S;(sc.objs||[]).forEach(function(o){if(o.type!=='npc'||!STROLL[o.role])return;
  var pts=[];for(var d=0;d<6;d++){var n=Art.neigh(o.c,o.r,d),k=n[0]+','+n[1];if(n[0]<0||n[1]<0||n[0]>=sc.cols||n[1]>=sc.rows)continue;if(!sc.pass[n[0]][n[1]]||sc.omap[k])continue;
   var tx=Art.hx(n[0],n[1])-Art.hx(o.c,o.r),ty=Art.hy(n[1])-Art.hy(o.r);pts.push({d:d,c:n[0],r:n[1],x:tx*.62,y:ty*.62})}
  var f=o._fk={o:o,pts:pts,x:0,y:0,tx:0,ty:0,leg:0,pause:.6+hhash(o.c,o.r,41)*2.4,dist:0,foot:1,face:0,wave:0,cool:0,mate:null,meet:null,chatAt:0};L.push(f)});
 /* pair up people within four tiles; each person chats with one partner */
 for(var i=0;i<L.length;i++)for(var j=i+1;j<L.length;j++){var a=L[i],b=L[j];if(a.mate||b.mate)continue;if(Art.hdist(a.o.c,a.o.r,b.o.c,b.o.r)>4)continue;a.mate=b;b.mate=a;
  a.meet=meetPt(a,b);b.meet=meetPt(b,a);a.lead=true;a.chatAt=b.chatAt=5+hhash(a.o.c,b.o.c,43)*6}
 return sc._folk=L}
function meetPt(a,b){var dx=Art.hx(b.o.c,b.o.r)-Art.hx(a.o.c,a.o.r),dy=Art.hy(b.o.r)-Art.hy(a.o.r),best=null,bd=-1e9;
 a.pts.forEach(function(p){var s=(p.x*dx+p.y*dy)/(Math.sqrt(dx*dx+dy*dy)||1);if(s>bd){bd=s;best=p}});return bd>0?best:null}
function folkStep(f,dt,T,h,mode,sc){var S=Art.S,o=f.o,hd=Art.hdist(h.c,h.r,o.c,o.r),R=rigOf(o),busy=mode==='dlg'||mode==='ov';
 if(f.cool>0)f.cool-=dt;if(f.wave>0)f.wave-=dt;
 if(hd<=3&&h.mv&&f.cool<=0&&!f.chat){f.wave=1.3;f.cool=9}
 var M=f.mate,chat=false;
 if(M&&f.lead){f.chatAt-=dt;if(f.chatAt<=0&&!f.chat&&!M.chat){f.chat=M.chat=4.6+hhash(o.c,T|0,47)*1.6;f.chatAt=f.chat+9+hhash(o.r,T|0,49)*7}}
 if(f.chat>0){f.chat-=dt;if(f.chat<=0)f.chat=0}
 if(hd<=2||busy){f.tx=0;f.ty=0;f.chat=0;if(M)M.chat=Math.min(M.chat,.01)}
 else if(f.chat>0){chat=true;var mp=f.meet;f.tx=mp?mp.x:0;f.ty=mp?mp.y:0}
 else{var dx0=f.tx-f.x,dy0=f.ty-f.y;if(dx0*dx0+dy0*dy0<1){f.pause-=dt;if(f.pause<=0&&f.pts.length){f.leg++;if(f.leg%2){var p=f.pts[Math.floor(hhash(o.c+f.leg,o.r,53)*f.pts.length)];if(p.c===h.c&&p.r===h.r){f.leg--;f.pause=.5}else{f.tx=p.x;f.ty=p.y}}else{f.tx=0;f.ty=0}f.pause=1.4+hhash(f.leg,o.c,57)*2.4}}}
 var dx=f.tx-f.x,dy=f.ty-f.y,dd=Math.sqrt(dx*dx+dy*dy),sp=S*(hd<=2?1.9:1.05)*dt,mv=dd>.8;
 if(mv){var k=Math.min(1,sp/dd);f.x+=dx*k;f.y+=dy*k;f.dist+=Math.min(sp,dd);if(Math.abs(dx)>.5)f.face=dx>0?1:-1}else{f.x=f.tx;f.y=f.ty}
 var stride=S*.95,stp=(f.dist/stride)%1,ft=(Math.floor(f.dist/stride)%2)?-1:1,arrived=!mv;
 var talking=chat&&arrived&&M&&M.chat>0;
 R.go('chat',dt,talking?1:0,.3,.3);R.go('talk',dt,talking&&((Math.floor((f.chat)/1.15)%2===0)===!!f.lead)?1:0,.18,.18);R.go('wave',dt,f.wave>.15&&!mv?1:0,.16,.28);R.go('nod',dt,talking&&R.pose.talk<.5&&(Math.floor(f.chat*1.3)%3===0)?.8:0,.2,.25);
 return {mv:mv,step:stp,foot:ft,talking:talking}}
var heroRef=null;
function folkApply(o,op,T,h,mode,sc){var f=o._fk;if(!f)return null;if(FXq()){f.x=f.y=f.tx=f.ty=0;f.chat=0;if(o._rig)o._rig.zero();return null}
 var dt=Math.max(0,Math.min(.05,T-(f.T==null?T:f.T)));f.T=T;var r=folkStep(f,dt,T,h,mode,sc);
 op.pose=o._rig.pose;op.wave=0;
 if(r.mv){op.moving=true;op.step=r.step;op.foot=r.foot;op.face=f.face||op.face}
 else if(r.talking&&f.mate){var mx=Art.hx(f.mate.o.c,f.mate.o.r)+f.mate.x,me=Art.hx(o.c,o.r)+f.x;op.face=mx>me?1:-1}
 return f}
/* gatekeeper moods */
var G={quiz:false,ok:0,n:0,react:null,reactT:0,after:null,afterT:0,lastGate:-1e9,cam:null,obj:null};
document.addEventListener('lq:answer',function(e){if(!G.quiz)return;var ok=!!(e.detail&&e.detail.ok);G.n++;if(ok)G.ok++;G.react=ok?'nod':'shrug';G.reactT=ok?1.25:1.6});
document.addEventListener('lq:celebrate',function(e){var d=e.detail||{};if(d.vfx==='gate'||d.vfx==='shockwave')G.lastGate=Date.now()});
function gateRig(R,dt){if(G.reactT>0){G.reactT-=dt;if(G.reactT<=0)G.react=null}if(G.afterT>0){G.afterT-=dt;if(G.afterT<=0)G.after=null}
 R.go('think',dt,G.quiz&&!G.react?1:0,.35,.22);R.go('nod',dt,G.react==='nod'?1:0,.14,.25);R.go('shrug',dt,G.react==='shrug'||G.after==='shrug'?1:0,.2,.3);R.go('cheer',dt,G.after==='cheer'?1:0,.16,.35);return R.pose}
function gateApply(o,op,T,mode){if(FXq()){if(o._rig)o._rig.zero();return}var R=rigOf(o),dt=Math.max(0,Math.min(.05,T-(o._gT==null?T:o._gT)));o._gT=T;
 if(G.quiz&&G.obj===o&&mode!=='ov')gateEnd();
 op.pose=gateRig(R,dt);o._op={accent:op.accent,motif:op.motif,biome:op.biome,gid:op.gid,boss:1}}
function gateEnd(){G.quiz=false;var passed=Date.now()-G.lastGate<2500||(G.n>0&&G.ok/G.n>=.6);G.after=G.n>0||passed?(passed?'cheer':'shrug'):null;G.afterT=passed?2.4:2;G.react=null;camClose()}
/* the cameo: the same gatekeeper drawn at 2x in a small brass frame at the top corner of the trial overlay */
function camOpen(o){camClose();var ov=document.getElementById('ov');if(!ov||!o)return;var cv=document.createElement('canvas'),small=innerWidth<560,W=small?50:92,H=small?58:112,dpr=Math.min(2,window.devicePixelRatio||1);
 cv.id='lq-gatecam';cv.setAttribute('aria-hidden','true');cv.width=W*dpr;cv.height=H*dpr;cv.style.cssText='position:fixed;z-index:3;right:'+(small?100:18)+'px;top:'+(small?5:64)+'px;width:'+W+'px;height:'+H+'px;pointer-events:none;border:1px solid #8a6528;border-radius:10px;background:radial-gradient(ellipse at 50% 85%,rgba(215,181,106,.22),rgba(14,20,28,.92) 70%);box-shadow:0 4px 14px rgba(0,0,0,.45),inset 0 0 0 2px rgba(10,15,21,.9),inset 0 0 0 3px rgba(200,168,106,.35)';
 ov.appendChild(cv);var g=cv.getContext('2d'),look=o.sp&&o.sp.look&&Art.npcLook?Art.npcLook(o.sp.look,o.sp.name):(o.sp&&o.sp.look),op={t:0,face:-1,boss:1,ent:1,flat:false},R=new Art.Rig(),last=performance.now(),t0=last;
 for(var k in (o._op||{}))op[k]=o._op[k];
 G.cam={cv:cv,raf:0};(function loop(ts){if(!G.cam||G.cam.cv!==cv)return;G.cam.raf=requestAnimationFrame(loop);var dt=Math.min(.05,((ts||performance.now())-last)/1000);last=ts||performance.now();
  op.t=(last-t0)/1000;op.pose=gateRig(R,dt);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);var kk=W/92,s2=dpr*kk*1.22;g.setTransform(s2,0,0,s2,46*dpr*kk,103*dpr*kk);Art.figure(g,0,-Art.S*.38-6,look,op)})()}
function camClose(){if(G.cam){cancelAnimationFrame(G.cam.raf);if(G.cam.cv.parentNode)G.cam.cv.parentNode.removeChild(G.cam.cv);G.cam=null}}
/* party followers: a breadcrumb trail of the hero's path; follower i keeps to the point about (1.3 + 1.05 i) tiles back along it, a little to the side, with its own lag */
var F={trail:[],sid:null,list:[],cel:0};
function followStep(h,dt,sc,mode){var S=Art.S;if(FXq()||!sc){F.list.length=0;F.trail.length=0;return}
 if(F.sid!==sc.id){F.sid=sc.id;F.trail.length=0;F.list.length=0}
 F.jt=(F.jt||0)-dt;if(!F.jc||F.jt<=0){F.jc=joined();F.jt=2}/* joined() reads every world's save, so look again only every 2 s */
 var cam=(sc.objs||[]).filter(function(o){return o.role==='party'})[0],want=F.jc.filter(function(c){return !cam||cam.crew!==c.id}).slice(0,innerWidth<560?2:3);
 if(F.list.length!==want.length||F.list.some(function(f,i){return f.c!==want[i]})){F.list=want.map(function(c,i){var old=F.list.filter(function(f){return f.c===c})[0];return old||{c:c,x:h.x-(i+1)*S*.9*(h.face||1),y:h.y+S*.2,face:h.face||1,dist:0,R:new Art.Rig(),look:Art.npcLook?Art.npcLook(c.look,c.name):c.look,mv:false,spr:{}}})}
 var tr=F.trail,lx=tr.length?tr[tr.length-1]:null;if(lx&&Math.abs(lx[0]-h.x)+Math.abs(lx[1]-h.y)>S*3){tr.length=0;lx=null;F.list.forEach(function(f,i){f.x=h.x-(i+1)*S*.9*(h.face||1);f.y=h.y+S*.15*(i%2?1:-1)})}/* a warp or a scene jump: start the trail again behind the hero */
if(!lx||Math.abs(lx[0]-h.x)+Math.abs(lx[1]-h.y)>2){tr.push([h.x,h.y]);if(tr.length>160)tr.shift()}
 var cel=(window.Art&&Art.heroSM&&Art.heroSM.state==='celebrate');if(cel&&!F.cel)F.celT=0;F.cel=cel;F.celT=(F.celT||0)+dt;
 F.list.forEach(function(f,i){var want=S*(1.3+1.05*i),acc=0,tx=h.x,ty=h.y,px=h.x,py=h.y,dirx=-(h.face||1),diry=0;
  for(var k=tr.length-1;k>=0;k--){var q=tr[k],sx=q[0]-px,sy=q[1]-py,sl=Math.sqrt(sx*sx+sy*sy);if(acc+sl>=want&&sl>0){var u=(want-acc)/sl;tx=px+sx*u;ty=py+sy*u;dirx=sx/sl;diry=sy/sl;acc=want;break}acc+=sl;px=q[0];py=q[1];tx=px;ty=py;if(sl>0){dirx=sx/sl;diry=sy/sl}}
  if(acc<want){var rest=want-acc;tx+=dirx*rest*.9;ty+=diry*rest*.4}
  var side=(i%2?1:-1)*S*.32;tx+=-diry*side;ty+=dirx*side*.6;
  var lag=.16+.07*i,k2=1-Math.exp(-dt/lag),nx=f.x+(tx-f.x)*k2,ny=f.y+(ty-f.y)*k2,mvd=Math.sqrt((nx-f.x)*(nx-f.x)+(ny-f.y)*(ny-f.y));
  f.mv=mvd>S*.35*dt;f.dist+=mvd;if(Math.abs(nx-f.x)>.15)f.face=nx>f.x?1:-1;else if(!f.mv)f.face=h.x>f.x?1:-1;f.x=nx;f.y=ny;
  var go=cel&&F.celT>.12*(i+1);f.R.go(i%2?'jump':'pump',dt,go?1:0,.12,.3);f.R.pose.jp=go?Math.min(1,(F.celT-.12*(i+1))/.95):1;f.R.pose.pp=go?Math.min(1,(F.celT-.12*(i+1))/1.05):1;})}
Party.npc=function(o,op,T,h,mode,sc){if(o.role==='gate'||o.role==='boss'){gateApply(o,op,T,mode);return null}if(!STROLL[o.role]||!sc)return null;folkSetup(sc);var f=folkApply(o,op,T,h,mode,sc);if(!f)return null;o._dx=f.x;o._dy=f.y;return f};
Party.gateQuiz=function(sc){if(FXq()||!sc)return;var o=(sc.objs||[]).filter(function(x){return x.role==='gate'||x.role==='boss'})[0];if(!o)return;G.quiz=true;G.obj=o;G.ok=G.n=0;G.react=G.after=null;G.reactT=G.afterT=0;camOpen(o)};
Party.follow={step:followStep,list:function(){return FXq()?[]:F.list},state:function(){return {n:F.list.length,trail:F.trail.length,cel:F.cel,gate:{quiz:G.quiz,react:G.react,after:G.after,n:G.n,ok:G.ok}}}};
function refSolution(id){var s=null;A.levels.forEach(function(l){l.qs.forEach(function(x){if(x.id===id)s=x.solution})});return s}
if(A.capstone)A.badges.push({id:'capstone',icon:'🏛️',name:'Citadel Artificer',desc:'Solve the Citadel Workshop coding capstone'});
/* ---------------- tabs ---------------- */
A.tabs=A.tabs||[];
A.tabs.push({id:'party',label:'Party',render:function(el){var j=joined().map(function(c){return c.id});
 var h='<div class="panel lesson"><p class="kicker">Party</p><p>Companions travel across all four worlds. They join as you progress anywhere, and they wait in the towns with advice for whichever world you are in.</p></div>';
 CREW.forEach(function(c,i){var on=j.indexOf(c.id)>=0,tips=c.tips[A.key]||c.tips['ai-evals'];
  h+='<div class="panel lesson" style="display:flex;gap:14px;align-items:flex-start;animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*40)+'ms"><img alt="" src="'+Art.portrait((Art.npcLook?Art.npcLook(c.look,c.name):c.look),64)+'" style="width:64px;height:64px;border-radius:10px;border:1px solid var(--gold);'+(on?'':'filter:grayscale(1) brightness(.5)')+'"><div><h3 style="margin:0">'+esc(c.name)+'</h3><p class="small dim" style="margin:2px 0 8px">'+esc(c.role)+'</p>'+(on?'<p>'+esc(tips[0])+'</p>':'<p class="small dim">Not yet met. Joins when you: '+esc(c.when)+'.</p>')+'</div></div>'});
 el.innerHTML=h}});
A.tabs.push({id:'satchel',label:'Satchel',render:function(el){var s=sload(),ids=Object.keys(s).sort(function(a,b){return s[a].t-s[b].t});
 var h='<div class="panel lesson"><p class="kicker">Satchel</p><p>Every Python challenge you solve puts <b>your own working function</b> here. The Citadel Workshop at the end of a world loads them so you build on what you wrote. Nothing leaves this browser.</p><p class="small dim">'+ids.length+' function set'+(ids.length===1?'':'s')+' collected.</p></div>';
 if(!ids.length)h+='<div class="panel lesson" style="animation:pop .22s ease both"><p class="dim">Empty so far. Solve a Python challenge in any world and it appears here.</p></div>';
 ids.forEach(function(id,i){var m=s[id];h+='<div class="panel lesson" style="animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*40)+'ms"><h3 style="margin:0 0 4px">'+esc(m.title)+'</h3><p class="small dim">'+m.fns.map(function(f){return '<code>'+esc(f)+'</code>'}).join(', ')+' · from '+esc(m.world)+'</p><details><summary class="small">Show code</summary><pre class="ex" style="white-space:pre-wrap">'+esc(m.code)+'</pre></details></div>'});
 el.innerHTML=h}});
})();
