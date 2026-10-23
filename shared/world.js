/* Exploration layer: hex overworld + towns, hero, NPC dialogue, quests, HUD. Lessons/quizzes/sims come from engine.js + content.js. */
(function(){
'use strict';
var FX=window.LQFx||{low:true,set:function(){}},A=window.APP,E=window.Engine,C=window.WORLD,Art=window.Art,S=Art.S,hx=Art.hx,hy=Art.hy,neigh=Art.neigh;
var $=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hexOk(c){return typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c)}
var NR=A.levels.length; /* 7 */
var P=function(){return E.P()};
function PW(){var p=P();if(!p.w)p.w={sid:'w',c:-1,r:-1,chests:{},caches:{},taught:{},sim:{},visited:{},intro:0};return p.w}
var st={mode:'title',scene:null,sid:'w',hero:{c:0,r:0,x:0,y:0,face:1,mv:null},path:null,keys:{},pad:-1,zig:false,time:0,cam:{x:0,y:0,snap:true},fog:[],fogTgt:[],speed:1,after:null,worlds:null,scenes:{},mmT:0,banner:0};
/* ---------- config / badges ---------- */
A.badges=A.badges.concat(C.regions.map(function(R,i){return {id:'seal_'+A.levels[i].id,icon:'🏅',name:'Seal of '+R.name,desc:'Open the chest in '+R.name}}),[{id:'crown',icon:'👑',name:C.castle.chest,desc:'Open the chest in the final keep'},{id:'scout',icon:'🧭',name:'Pathfinder',desc:'Find every supply cache on the map'}]);
function levelDone(i){var r=P().levels[A.levels[i].id];return !!(r&&r.done)}
function allDone(){return E.doneCount()===NR}
function bossDone(){return !!(P().boss&&P().boss.done)}
/* ---------- sound ---------- */
var AC=null,muted=false,gest=false;try{muted=localStorage.getItem('learning-apps.mute')==='1'}catch(e){}
function blip(f,d,v,type,f2){if(muted||!gest)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.linearRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.025,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function chime(){try{if(!FX.low&&window.LQAnim&&st&&st.hero)LQAnim.burst(st.hero.x,st.hero.y-S*.8)}catch(e){}blip(660,.25,.04,'triangle',880);setTimeout(function(){blip(990,.4,.035,'triangle')},120)}
/* ---------- scenes ---------- */
var BIG=[[4,26],[13,27],[22,25],[31,27],[40,25],[42,17],[33,13],[24,15],[15,12],[7,8],[17,4]];
var BASE8=[[4,21],[12,22],[20,19],[28,21],[31,12],[21,9],[11,10],[5,4]];
var BIG12=[[4,28],[13,29],[22,27],[31,29],[40,27],[47,20],[38,16],[29,18],[20,15],[11,11],[17,5],[28,6]];
var NODES=NR>10?BIG12.slice(0,NR+1):NR>7?BIG.slice(0,NR).concat([BIG[10]]):NR<7?BASE8.slice(0,NR).concat([BASE8[7]]):BASE8;
var MAPC=NR>10?52:NR>7?46:36,MAPR=NR>10?34:NR>7?31:26;
function bio(i){return i<NR?C.regions[i].biome:C.castle.biome}
function groundOf(b,h){return b==='desert'?'sand':b==='tundra'?(h<.22?'pine':'snow'):b==='marsh'?'marsh':b==='crown'?'crown':b==='forest'?(h<.55?'forest':'grass'):b==='hills'?(h<.5?'hills':'grass'):b==='highland'?(h<.3?'hills':h<.5?'pine':'grass'):b==='meadow'?(h<.1?'forest':'grass'):'grass'}
function inb(sc,c,r){return c>=0&&r>=0&&c<sc.cols&&r<sc.rows}
function mk2(cols,rows,v){var a=[];for(var c=0;c<cols;c++){a.push([]);for(var r=0;r<rows;r++)a[c].push(typeof v==='function'?v(c,r):v)}return a}
function buildWorld(){
 var cols=MAPC,rows=MAPR,seed=11,sc={id:'w',cols:cols,rows:rows,seed:seed,title:A.title,sub:'World map',objs:[],roads:[],nodes:NODES,omap:{}};
 var road={},k,c,r,i,n=NODES.length;
 for(k=0;k<n-1;k++){var ln=Art.hline(NODES[k][0],NODES[k][1],NODES[k+1][0],NODES[k+1][1]);sc.roads.push(ln);ln.forEach(function(p){if(road[p[0]+','+p[1]]===undefined)road[p[0]+','+p[1]]=k})}
 sc.zone=mk2(cols,rows,0);sc.t=mk2(cols,rows,'grass');sc.pass=mk2(cols,rows,true);
 for(c=0;c<cols;c++)for(r=0;r<rows;r++){var x=hx(c,r),y=hy(r),best=0,bd=1e9,d;
  for(i=0;i<n;i++){d=Math.pow(x-hx(NODES[i][0],NODES[i][1]),2)+Math.pow(y-hy(NODES[i][1]),2);if(d<bd){bd=d;best=i}}
  var rk=road[c+','+r];if(rk!==undefined){var a=Math.pow(x-hx(NODES[rk][0],NODES[rk][1]),2)+Math.pow(y-hy(NODES[rk][1]),2),b=Math.pow(x-hx(NODES[rk+1][0],NODES[rk+1][1]),2)+Math.pow(y-hy(NODES[rk+1][1]),2);best=a<=b?rk:rk+1}
  sc.zone[c][r]=best;
  var ring=Math.min(c,r,cols-1-c,rows-1-r),h=Art.hash(c,r,seed+3),e=Art.vnoise(c*.21,r*.21,seed)*.65+Art.vnoise(c*.5,r*.5,seed+1)*.35,B=bio(best),near=false;
  for(i=0;i<n;i++)if(Art.hdist(c,r,NODES[i][0],NODES[i][1])<=2)near=true;
  var t;
  if(rk!==undefined||near)t=groundOf(B,h);
  else if(ring<=1)t=h<.6?'water':'mountain';
  else if(e<(B==='marsh'?.24:.31))t='water';
  else if(e>.77)t='mountain';
  else t=groundOf(B,h);
  if(rk!==undefined&&t==='forest')t='grass';
  sc.t[c][r]=t;sc.pass[c][r]=!(t==='water'||t==='mountain')}
 sc.zoneTint=[];for(i=0;i<NR;i++){var tz=C.regions[i].tint;if(typeof tz==='string'&&tz)sc.zoneTint[i]=tz}var ctz=C.castle.tint;if(typeof ctz==='string'&&ctz)sc.zoneTint[NR]=ctz;
 for(i=0;i<n;i++){var Rg=i<NR?C.regions[i]:C.castle,o={type:'node',kind:i<NR?'town':'castle',i:i,c:NODES[i][0],r:NODES[i][1],block:false,accent:Rg.accent};if(typeof Rg.motif==='string'&&Rg.motif)o.motif=Rg.motif;if(typeof Rg.roof==='string'&&Rg.roof)o.roof=Rg.roof;sc.objs.push(o)}
 /* supply caches */
 for(i=0;i<NR;i++){var cand=[],q=[[NODES[i][0],NODES[i][1],0]],seen={};seen[NODES[i][0]+','+NODES[i][1]]=1;
  while(q.length){var cu=q.shift();if(cu[2]>=3&&cu[2]<=6&&sc.zone[cu[0]][cu[1]]===i&&road[cu[0]+','+cu[1]]===undefined)cand.push(cu);if(cu[2]>=6)continue;for(var dd=0;dd<6;dd++){var nn=neigh(cu[0],cu[1],dd),kk=nn[0]+','+nn[1];if(inb(sc,nn[0],nn[1])&&!seen[kk]&&sc.pass[nn[0]][nn[1]]&&sc.zone[nn[0]][nn[1]]===i){seen[kk]=1;q.push([nn[0],nn[1],cu[2]+1])}}}
  if(cand.length){var pk=cand[Math.floor(Art.hash(i,5,seed)*cand.length)];sc.objs.push({type:'cache',kind:'cache',i:i,c:pk[0],r:pk[1],block:false})}}
 Art.paintScene(sc);
 mkFogCv(sc);
 index(sc);return sc}
function index(sc){sc.omap={};sc.objs.forEach(function(o){sc.omap[o.c+','+o.r]=o})}
var SCEN={meadow:['forest','water'],forest:['forest','forest'],hills:['hills','mountain'],desert:['mountain','mountain'],tundra:['pine','mountain'],marsh:['water','water'],highland:['mountain','pine'],crown:['forest','mountain']};
function mir(c,i){return i%2?14-c:c}
function buildTown(i){
 var castle=i>=NR,R=castle?C.castle:C.regions[i],B=R.biome,cols=15,rows=12,seed=40+i*13,sc={id:castle?'k':'t'+i,i:i,cols:cols,rows:rows,seed:seed,title:R.name,sub:castle?'Final challenge':'Region '+(i+1)+' · '+A.levels[i].title,objs:[],roads:[],omap:{},town:true,biome:B};
 if(typeof R.tint==='string'&&R.tint)sc.tint=R.tint;if(typeof R.motif==='string'&&R.motif)sc.motif=R.motif;
 sc.t=mk2(cols,rows,'grass');sc.pass=mk2(cols,rows,true);sc.zone=mk2(cols,rows,i);
 var c,r;
 for(c=0;c<cols;c++)for(r=0;r<rows;r++){var inside=Math.pow((c+0.5*(r&1)-7)/7.4,2)+Math.pow((r-5.5)/5.9,2)<=1,h=Art.hash(c,r,seed);
  if(inside){sc.t[c][r]=groundOf(B==='forest'||B==='hills'||B==='highland'||B==='meadow'||B==='crown'?'crown':B,1)}else{var sa=SCEN[B]||SCEN.meadow;sc.t[c][r]=h<.5?sa[0]:sa[1];sc.pass[c][r]=false}}
 var pl=Art.hline(7,10,7,3),plz={};pl.forEach(function(p){plz[p[0]+','+p[1]]=1;for(var d=0;d<6;d++){var nn=neigh(p[0],p[1],d);if(inb(sc,nn[0],nn[1])&&sc.pass[nn[0]][nn[1]]&&Art.hash(nn[0],nn[1],seed)<.5)plz[nn[0]+','+nn[1]]=1}});
 for(var d2=0;d2<6;d2++){var f=neigh(7,6,d2);plz[f[0]+','+f[1]]=1}plz['7,6']=1;
 sc.plaza=Object.keys(plz).map(function(s){var a=s.split(',');return [+a[0],+a[1]]}).filter(function(p){return inb(sc,p[0],p[1])&&sc.pass[p[0]][p[1]]});
 var ac=R.accent,O=sc.objs,res={};
 function add(o){o.accent=ac;if(typeof R.roof==='string'&&R.roof)o.roof=R.roof;if(o.type==='building'&&sc.motif)o.motif=sc.motif;O.push(o);res[o.c+','+o.r]=1;return o}
 add({type:'gate',kind:'gate',c:7,r:10,block:false});
 add({type:'deco',kind:'fountain',c:7,r:6,block:true});
 add({type:'deco',kind:'banner',c:5,r:9,block:true});add({type:'deco',kind:'banner',c:9,r:9,block:true});
 if(castle){
  add({type:'building',kind:'great',role:'hall',c:7,r:2,block:true,name:R.hall});
  add({type:'npc',role:'boss',c:7,r:3,block:true,name:R.boss.name,sp:R.boss});
  add({type:'npc',role:'guide',c:mir(10,i),r:5,block:true,name:R.herald.name,sp:R.herald});
  add({type:'chest',kind:'chest',role:'chest',c:2,r:4,block:true,i:i});
  if(window.Party)Party.cameo(add,i,true,mir);
 }else{
  add({type:'building',kind:R.hallKind,role:'hall',c:7,r:2,block:true,name:R.hall});
  add({type:'npc',role:'gate',c:7,r:3,block:true,name:R.gate.name,sp:R.gate});
  add({type:'npc',role:'teacher',c:mir(4,i),r:6,block:true,name:R.teacher.name,sp:R.teacher});
  add({type:'npc',role:'guide',c:mir(10,i),r:5,block:true,name:R.guide.name,sp:R.guide});
  add({type:'chest',kind:'chest',role:'chest',c:mir(2,i),r:4,block:true,i:i});
  if(R.sim)add({type:'building',kind:R.sim.building,role:'sim',c:mir(12,i),r:3,block:true,name:R.sim.name});
  if(window.Party)Party.cameo(add,i,false,mir);
 }
 for(c=0;c<cols;c++)for(r=0;r<rows;r++){if(!sc.pass[c][r]||res[c+','+r])continue;var rr=Math.sqrt(Math.pow((c+0.5*(r&1)-7)/7.4,2)+Math.pow((r-5.5)/5.9,2));
  if(rr<.7||plz[c+','+r])continue;var near=false;O.forEach(function(o){if(Art.hdist(c,r,o.c,o.r)<=1)near=true});if(near)continue;
  if(Art.hash(c,r,seed+9)<.36)O.push({type:'deco',kind:Math.random()<0?'rock':'tree',pine:B==='tundra'||B==='highland',snow:B==='tundra',c:c,r:r,block:true,accent:ac,v:Art.hash(c,r,seed+23)})}
 /* full effects: the scattered tree nearest the plaza's east side becomes this region's landmark (Low effects still draws the tree) */
 var lmk=null,lbest=1e9;O.forEach(function(o){if(o.type==='deco'&&o.kind==='tree'){var d=Art.hdist(o.c,o.r,mir(11,i),7);if(d<lbest){lbest=d;lmk=o}}});if(lmk){lmk.landmark=B;lmk.v=null}
 Art.paintScene(sc);index(sc);return sc}
function getScene(id){if(id==='w')return st.world;if(!st.scenes[id])st.scenes[id]=buildTown(id==='k'?NR:+id.slice(1));return st.scenes[id]}
/* ---------- walking ---------- */
function zoneOpen(z){return z===0||(z<NR?E.unlocked(z):allDone())}
function walkable(sc,c,r){return inb(sc,c,r)&&sc.pass[c][r]&&(sc.id!=='w'||zoneOpen(sc.zone[c][r]))}
function objAt(c,r){return st.scene.omap[c+','+r]}
function canWalk(c,r){if(!walkable(st.scene,c,r))return false;var o=objAt(c,r);return !(o&&o.block)}
function interactive(o){return o&&(o.type==='npc'||o.type==='building'||o.type==='chest')}
function stepDir(d){var h=st.hero,n=neigh(h.c,h.r,d),c=n[0],r=n[1];if(d===0||d===2||d===4)h.face=1;else if(d===1||d===3||d===5)h.face=-1;
 if(!inb(st.scene,c,r))return 'blocked';var o=objAt(c,r);
 if(interactive(o)){st.path=null;interact(o);return 'bump'}
 if(!walkable(st.scene,c,r)||(o&&o.block))return 'blocked';
 h.mv={fx:h.x,fy:h.y,tx:hx(c,r),ty:hy(r),t:0,c:c,r:r};return 'moved'}
function finishStep(){var h=st.hero,m=h.mv;h.c=m.c;h.r=m.r;h.x=m.tx;h.y=m.ty;h.mv=null;var w=PW();w.sid=st.sid;w.c=h.c;w.r=h.r;E.save();
 if(Math.random()<.5)blip(180+Math.random()*30,.05,.012,'triangle');
 var o=objAt(h.c,h.r);if(!o)return;
 if(o.type==='node'){st.path=null;visitNode(o)}
 else if(o.type==='gate'){st.path=null;leaveTown()}
 else if(o.type==='cache'&&!w.caches[o.i]){w.caches[o.i]=1;P().xp+=10;chime();E.toast('Supply cache found: +10 XP');if(Object.keys(w.caches).length>=NR)E.award('scout');E.save();hud()}}
function visitNode(o){var w=PW();w.visited[o.i]=1;enter(o.i<NR?'t'+o.i:'k',7,9)}
function leaveTown(){var w=world(),i=st.scene.i,nd=NODES[i],sc=st.world,pos=null;for(var d=0;d<6;d++){var n=neigh(nd[0],nd[1],d);if(walkable(sc,n[0],n[1])&&!sc.omap[n[0]+','+n[1]]){pos=n;break}}
 enter('w',pos?pos[0]:nd[0],pos?pos[1]:nd[1])}
function world(){return st.world}
function enter(sid,c,r){var sc=getScene(sid),h=st.hero;st.scene=sc;st.sid=sid;h.c=c;h.r=r;h.x=hx(c,r);h.y=hy(r);h.mv=null;st.path=null;st.cam.snap=true;var w=PW();w.sid=sid;w.c=c;w.r=r;E.save();showBanner(sc.title,sc.sub);hud();if(window.Narr&&(sid==='k'||/^t\d+$/.test(sid)))window.Narr.play(C.key,sid)}
function dirTo(a,b){for(var d=0;d<6;d++){var n=neigh(a[0],a[1],d);if(n[0]===b[0]&&n[1]===b[1])return d}return -1}
function bfs(gc,gr){var sc=st.scene,h=st.hero,K=function(c,r){return r*sc.cols+c},prev={},q=[[h.c,h.r]],qi=0;prev[K(h.c,h.r)]=-1;
 while(qi<q.length){var cu=q[qi++];if(cu[0]===gc&&cu[1]===gr)break;for(var d=0;d<6;d++){var n=neigh(cu[0],cu[1],d),k=K(n[0],n[1]);if(!inb(sc,n[0],n[1])||prev[k]!==undefined)continue;var goal=n[0]===gc&&n[1]===gr;if(goal?(walkable(sc,n[0],n[1])||interactive(objAt(n[0],n[1]))):(canWalk(n[0],n[1])&&!(objAt(n[0],n[1])&&objAt(n[0],n[1]).type==='node'))){prev[k]=K(cu[0],cu[1]);q.push(n)}}}
 var gk=K(gc,gr);if(prev[gk]===undefined)return null;var out=[],cur=gk;while(cur!==-1&&cur!==K(h.c,h.r)){out.unshift([cur%sc.cols,Math.floor(cur/sc.cols)]);cur=prev[cur]}return out}
function walkTo(c,r){if(st.mode!=='play')return false;var p=bfs(c,r);if(!p||!p.length)return false;st.path=p;return true}
function dirFromKeys(){var k=st.keys,L=k.left,R=k.right,U=k.up,D=k.down;if(st.pad>=0)return [st.pad];if(L&&R){L=R=false}
 if(U&&L)return [3];if(U&&R)return [2];if(D&&L)return [5];if(D&&R)return [4];if(L)return [1];if(R)return [0];
 if(U)return st.zig?[2,3]:[3,2];if(D)return st.zig?[4,5]:[5,4];return null}
/* ---------- dialogue ---------- */
var D={lines:[],sp:null,cb:null,choices:null,full:'',i:0,typing:false,shown:0};
function say(sp,lines,cb){D.lines=(typeof lines==='string'?[lines]:lines).slice();D.sp=sp;D.cb=cb||null;D.choices=null;st.mode='dlg';st.path=null;st.pad=-1;nextLine()}
function ask(sp,text,opts){D.sp=sp;D.lines=[];D.cb=null;D.choices=opts;D.full=text;st.mode='dlg';st.path=null;draw0()}
function nextLine(){D.full=D.lines.shift();D.choices=null;draw0()}
function plate(icon){var mk=window.LQMark&&LQMark(icon||'scroll',40);return '<div class="plate">'+(mk||esc(icon||''))+'</div>'}
function draw0(){var el=$('#dlg'),sp=D.sp||{};el.hidden=false;D.i=0;D.typing=true;D.shown=0;document.body.classList.add('indlg');
 var pic=sp.look?'<img alt="" src="'+Art.portrait(sp.look,84)+'">':plate(sp.icon);
 el.innerHTML='<div class="panel">'+pic+'<div class="tx"><span class="nameplate">'+esc(sp.name||'')+'</span>'+(sp.title?'<span class="ti">'+esc(sp.title)+'</span>':'')+'<div class="body"></div><div class="ch"></div></div></div>';
 el.firstChild.onclick=function(e){if(e.target.closest('.opt'))return;adv()};
 if(FX.rm&&FX.rm.matches){D.typing=false;D.shown=(D.full||'').length;finishType()}}
function typeTick(dt){if(!D.typing)return;D.i+=dt*55;var n=Math.min(D.full.length,Math.floor(D.i)),b=$('#dlg .body');if(!b)return;if(n!==D.shown){if(n%3===0)blip(520+(n%7)*18,.04,.012,'square');D.shown=n;b.textContent=D.full.slice(0,n)}if(n>=D.full.length){D.typing=false;finishType()}}
function finishType(){var b=$('#dlg .body');b.textContent=D.full;var ch=$('#dlg .ch');if(D.choices){ch.innerHTML=D.choices.map(function(o,i){return '<button class="opt" data-k="'+i+'">'+(i+1)+'. '+esc(o.t)+'</button>'}).join('');ch.onclick=function(e){var bt=e.target.closest('[data-k]');if(bt)pick(+bt.dataset.k)}}else{var more=window.LQMark?LQMark('go',14):'';b.insertAdjacentHTML('beforeend','<span class="more">'+(more||'▼')+'</span>')}}
function pick(k){var o=D.choices[k];if(!o)return;closeDlg();if(o.fn)o.fn()}
function adv(){if(st.mode!=='dlg')return;if(D.typing){D.typing=false;D.shown=D.full.length;finishType();return}if(D.choices)return;if(D.lines.length){nextLine();return}var cb=D.cb;closeDlg();if(cb)cb()}
function closeDlg(){$('#dlg').hidden=true;document.body.classList.remove('indlg');if(st.mode==='dlg')st.mode='play';$('#cv').focus()}
/* ---------- overlays ---------- */
function openOv(fn,after){st.mode='ov';st.path=null;st.pad=-1;st.after=after||null;$('#ov').hidden=false;E.setExit(closeOv);$('#ovbody').innerHTML='';fn();$('#ov').scrollTop=0}
function closeOv(){if($('#ov').hidden)return;$('#ov').hidden=true;st.mode='play';E.setExit(function(){});var a=st.after;st.after=null;hud();E.save();$('#cv').focus();if(a)a()}
function wrap(h){$('#ovbody').innerHTML='<main class="wrap">'+h+'</main>'}
/* ---------- interactions ---------- */
function region(){return st.scene.i}
function teacherTalk(i){var R=C.regions[i],L=A.levels[i],T=R.teacher,w=PW(),first=!w.taught[i];
 var lines=first?['Greetings, traveller. I am '+T.name+', '+T.title.toLowerCase()+'.','In this region we study: '+L.title+'. '+L.blurb]:['Welcome back, traveller.'];
 say(T,lines,function(){ask(T,first?'Shall I walk you through the lesson?':'What can I do for you?',[{t:'Teach me the lesson',fn:function(){lessonOf(i)}},{t:'Any hints?',fn:function(){say(T,R.guide.hint)}},{t:'Not now'}])})}
function lessonOf(i){var T=C.regions[i].teacher;openOv(function(){E.lessonDone=false;E.level(i,'lesson')},function(){if(E.lessonDone){PW().taught[i]=1;E.save();hud();say(T,['Well studied. When you feel ready, '+C.regions[i].gate.name+' awaits at the '+C.regions[i].hall+'.'])}})}
function gateTalk(i){var R=C.regions[i],G=R.gate,done=levelDone(i);
 if(!done)say(G,['Halt, traveller. I am '+G.name+', '+G.title.toLowerCase()+'.','Answer the questions in the '+R.hall+' and score at least 60% to pass. There is no penalty for trying again.'],function(){ask(G,'Will you take the trial?',[{t:'Take the trial',fn:function(){trial(i)}},{t:'Not yet'}])});
 else say(G,['You have passed, traveller. The way onward is open, and a chest awaits you in this town.'],function(){ask(G,'Replay the trial for a better score?',[{t:'Replay the trial',fn:function(){trial(i)}},{t:'No, thanks'}])})}
function trial(i){var G=C.regions[i].gate,was=levelDone(i);openOv(function(){E.level(i,'quiz')},function(){var now=levelDone(i);if(now&&!was){chime();var nx=i<NR-1?'The fog lifts from '+C.regions[i+1].name+'.':'The gates of the '+C.castle.name+' now stand open.';say(G,['Well fought. You may pass. '+nx,'Open the chest in this town, then take the south gate back to the map.'])}else if(!now)say(G,['Not this time. Re-read the lesson with the teacher and try again; there is no penalty.'])})}
function simTalk(i){var R=C.regions[i],s=R.sim,sp={name:s.name,icon:({vault:'🏦',guild:'📏',smithy:'🔨',tower:'🗼',lab:'🧪',observatory:'🔭'})[s.building]||'📜'};
 say(sp,[s.blurb+(s.render?' (A toy example with made-up numbers, not real model data.)':' (Example data, not advice. Nothing is ordered or connected.)')],function(){ask(sp,s.kind==='lesson'?'Climb the tower?':'Step inside?',[{t:'Enter',fn:function(){openSim(i)}},{t:'Not now'}])})}
function openSim(i){var s=C.regions[i].sim,w=PW();w.sim[i]=1;
 if(s.kind==='lesson'){openOv(function(){E.level(i,'lesson')});return}
 if(s.render){openOv(function(){wrap('<section class="panel"><p class="kicker">'+esc(C.regions[i].name)+'</p><h2>'+esc(s.name)+'</h2><p class="dim small">'+esc(s.blurb)+'</p></section><div id="simhost"></div>');var host=$('#simhost');s.render(host);host.insertAdjacentHTML('beforeend','<button class="btn btn-primary" id="simx" style="margin-top:12px">Leave</button>');$('#simx').onclick=function(){closeOv()}});return}
 var map={cash:'#s1',hedge:'#s2',trim:'#s3'};
 openOv(function(){wrap('<section class="panel"><p class="kicker">'+esc(C.regions[i].name)+'</p><h2>'+esc(s.name)+'</h2><p class="dim small">'+esc(s.blurb)+'</p></section><div id="simhost"></div>');
  var host=$('#simhost'),tab=A.tabs[0];tab.render(host,{award:E.award,save:E.save,toast:E.toast,P:P()});
  ['#s1','#s2','#s3'].forEach(function(id){if(id!==map[s.kind]){var e=$(id,host);if(e)e.style.display='none'}})
  host.insertAdjacentHTML('beforeend','<button class="btn btn-primary" id="simx">Leave</button>');$('#simx').onclick=function(){closeOv()}})}
function chestOpen(o){var i=o.i,w=PW(),sp={name:'Treasure chest',icon:'🎁'};
 if(i>=NR){if(!bossDone())return say(sp,['The chest is sealed. Only the Council can open it: finish the final challenge first.']);
  if(w.chests[i])return say(sp,['Empty now. You already took the '+C.castle.chest+'.']);w.chests[i]=1;P().xp+=50;E.award('crown');chime();E.save();hud();return say(sp,['You found the '+C.castle.chest+'! +50 XP and a badge.','The realm is yours to explore. Revisit any trial to earn three stars.'])}
 var R=C.regions[i];
 if(!levelDone(i))return say(sp,['The chest is locked. '+R.gate.name+' holds the key: pass the trial first.']);
 if(w.chests[i])return say(sp,['Empty now. You already took the Seal of '+R.name+'.']);
 w.chests[i]=1;P().xp+=25;E.award('seal_'+A.levels[i].id);chime();E.save();hud();say(sp,['You found the Seal of '+R.name+'! +25 XP and a badge.'])}
function bossTalk(){var B=C.castle.boss;
 if(!allDone())return say(B,['You are not ready. Clear all '+NR+' regions first.']);
 say(B,bossDone()?['You have faced us already, and did well. Care to try for a higher score?']:['So you have crossed the whole realm. I am '+B.name+'.',B.title+'. Make your five choices wisely.'],function(){ask(B,bossDone()?'Face the challenge again?':'Begin the final challenge?',[{t:'Begin',fn:function(){openOv(function(){E.boss()},function(){if(bossDone()){chime();say(B,['A fine piece of work. Open the chest by the wall, and take your crown.'])}})}},{t:'Not yet'}])})}
function interact(o){
 if(o.role==='teacher')teacherTalk(region());
 else if(o.role==='gate'||o.role==='hall'&&region()<NR)gateTalk(region());
 else if(o.role==='hall')bossTalk();
 else if(o.role==='boss')bossTalk();
 else if(o.role==='sim')simTalk(region());
 else if(o.role==='chest')chestOpen(o);
 else if(o.role==='party'||o.role==='workshop')Party.talk(o,{say:say,ask:ask,openOv:openOv,closeOv:closeOv,wrap:wrap,chime:chime,allDone:allDone,region:region,hud:hud});
 else if(o.role==='guide'){var sp=o.sp,hint=region()>=NR?C.castle.herald.hint:C.regions[region()].guide.hint;say(sp,['Hello there, traveller.',hint])}}
function actionKey(){if(st.mode==='dlg')return adv();if(st.mode!=='play')return;var h=st.hero,best=null;for(var d=0;d<6;d++){var n=neigh(h.c,h.r,d),o=objAt(n[0],n[1]);if(interactive(o)){var pref=(d===0||d===2||d===4)===(h.face>0);if(!best||pref)best=o}}
 if(best)interact(best)}
/* ---------- quest ---------- */
function incomplete(i){var w=PW(),s=C.regions[i].sim;return !levelDone(i)||!w.chests[i]||(s&&!w.sim[i])}
function find(role){var r=null;st.scene.objs.forEach(function(o){if(o.role===role)r=o});return r}
function objective(){var w=PW(),k=-1,i;for(i=0;i<NR;i++)if(incomplete(i)){k=i;break}
 if(k<0){if(!bossDone())k=NR;else if(!w.chests[NR])k=NR;else return {text:'Journey complete. Explore freely, replay trials for three stars, or start a new journey from the title screen.',target:null}}
 var inTown=st.sid==='t'+k||(k===NR&&st.sid==='k'),name=k<NR?C.regions[k].name:C.castle.name;
 if(!inTown){if(st.sid==='w')return {text:'Travel to '+name+(k<NR?' (Region '+(k+1)+').':'.'),target:{sid:'w',c:NODES[k][0],r:NODES[k][1]}};var g=find('hall')&&st.scene.objs.filter(function(o){return o.type==='gate'})[0];return {text:'Leave '+st.scene.title+' by the south gate and travel to '+name+'.',target:{sid:st.sid,c:g.c,r:g.r}}}
 var sc=st.scene,R=k<NR?C.regions[k]:null,o;
 if(k===NR){if(!bossDone()){o=find('boss');return {text:'Face '+C.castle.boss.name+' in the Great Hall.',target:{sid:'k',c:o.c,r:o.r}}}o=find('chest');return {text:'Open the chest: '+C.castle.chest+'.',target:{sid:'k',c:o.c,r:o.r}}}
 if(!levelDone(k)&&!w.taught[k]){o=find('teacher');return {text:'Speak to '+R.teacher.name+' to learn: '+A.levels[k].title+'.',target:{sid:sc.id,c:o.c,r:o.r}}}
 if(!levelDone(k)){o=find('gate');return {text:'Face '+R.gate.name+' and pass the trial (60% or more).',target:{sid:sc.id,c:o.c,r:o.r}}}
 if(!w.chests[k]){o=find('chest');return {text:'Open the treasure chest (Seal of '+R.name+').',target:{sid:sc.id,c:o.c,r:o.r}}}
 o=find('sim');return {text:'Visit '+R.sim.name+'.',target:{sid:sc.id,c:o.c,r:o.r}}}
/* ---------- warm light from the top left and a cool shade bottom right (screen space, built once per size; the game's own vignette stays) ---------- */
var fxl=null,vig=null;
function mkLight(){var w=cv.width,h=cv.height,c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d'),d=Math.sqrt(w*w+h*h);
 var wg=g.createRadialGradient(w*.15,-h*.05,0,w*.15,-h*.05,d*.75);wg.addColorStop(0,'rgba(255,214,150,.13)');wg.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=wg;g.fillRect(0,0,w,h);
 var cg=g.createRadialGradient(w*.95,h*1.05,0,w*.95,h*1.05,d*.7);cg.addColorStop(0,'rgba(8,16,44,.26)');cg.addColorStop(1,'rgba(8,16,44,0)');g.fillStyle=cg;g.fillRect(0,0,w,h);fxl={c:c,w:w,h:h}}
/* ---------- brass line icons (inline SVG, no emoji) ---------- */
var IC={map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1H9v11a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2z"/><path d="M9 11h7M9 14h7"/>',snd:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',ok:'<path d="M5 12l5 5 9-10"/>',go:'<path d="M8 5l11 7-11 7z"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'};
function ic(n,z){z=z||22;return '<svg class="ico" viewBox="0 0 24 24" width="'+z+'" height="'+z+'" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'}
function IC2(n){return ic(n,18)}
function brassStar(g,x,y,r){g.save();g.translate(x,y);g.fillStyle='#d7b56a';g.strokeStyle='#2a1d0a';g.lineWidth=1;g.beginPath();for(var i=0;i<5;i++){var a=-Math.PI/2+i*4*Math.PI/5;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.restore()}
function herePip(g,x,y,r){g.fillStyle='#f3e2b0';g.beginPath();g.arc(x,y,r||6,0,7);g.fill();g.strokeStyle='#6b4a0e';g.lineWidth=2;g.stroke()}
/* ---------- HUD ---------- */
function buildHud(){var h=$('#hud');
 h.innerHTML='<div id="lt"><div id="party" class="panel"><img class="hp" alt="" src="'+Art.portrait(C.hero,60)+'"><div class="pi"><div class="nm">'+esc(C.heroName)+'</div><div class="rk" id="rk"></div><div class="bar"><i id="xb" style="width:0"></i></div><div class="st" id="stt"></div><div id="pm"></div><div id="pc"></div></div></div>'
 +'<div id="quest" class="panel" role="button" tabindex="0" title="Open quest log"><p class="kicker">Next objective</p><div id="qt"></div></div></div>'
 +'<div id="tr"><canvas id="mm" width="300" height="220" title="Mini-map (tap for full map)"></canvas><div class="row"><button class="ib" id="bmap" title="Map (M)" aria-label="Map">'+ic('map')+'</button><button class="ib" id="bq" title="Quest log (J)" aria-label="Quest log">'+ic('scroll')+'</button><button class="ib" id="bsnd" title="Sound" aria-label="Sound">'+ic('snd')+'</button><button class="ib" id="bmenu" title="Menu (Esc)" aria-label="Menu">'+ic('menu')+'</button></div></div>'
 +'<div id="area"><p class="kicker"></p><b></b></div>'
 +'<div id="pad">'+[['↖',3],['↗',2],['←',1],['→',0],['↙',5],['↘',4]].map(function(a){return '<button class="ib" data-d="'+a[1]+'" aria-label="Move '+['east','west','north-east','north-west','south-east','south-west'][a[1]]+'">'+a[0]+'</button>'}).join('')+'</div>'
 +'<div id="acts"><button class="ib" id="bact" aria-label="Talk or interact">A</button></div>';
 $('#pm').innerHTML=C.regions.map(function(R){var ring=hexOk(R.accent)?R.accent:'#8a6528';return '<span class="pm" style="--ring:'+ring+'"><img alt="'+esc(R.gate.name)+'" title="'+esc(R.gate.name)+'" src="'+Art.portrait(R.gate.look,24)+'"></span>'}).join('');
 if(window.Party&&$('#pc'))Party.hud($('#pc'));
 $('#bmap').onclick=mapScreen;$('#mm').onclick=mapScreen;$('#bq').onclick=questLog;$('#quest').onclick=questLog;$('#bmenu').onclick=menu;$('#bsnd').onclick=toggleSound;$('#bact').onclick=function(){gest=true;actionKey()};
 [].forEach.call(document.querySelectorAll('#pad button'),function(b){var d=+b.dataset.d;b.addEventListener('pointerdown',function(e){e.preventDefault();gest=true;if(st.mode==='play')st.pad=d});['pointerup','pointerleave','pointercancel'].forEach(function(ev){b.addEventListener(ev,function(){if(st.pad===d)st.pad=-1})})});
 updSound()}
function updSound(){$('#bsnd').innerHTML=ic(muted?'mute':'snd');$('#bsnd').title=muted?'Sound off':'Sound on'}
function toggleSound(){muted=!muted;try{localStorage.setItem('learning-apps.mute',muted?'1':'0')}catch(e){}updSound();gest=true;if(window.Narr)window.Narr.setMuted(muted);if(!muted)blip(660,.1,.03)}
function hud(){if(st.mode==='title')return;var p=P(),r=A.rank,i=0,k;for(k=0;k<r.length;k++)if(p.xp>=r[k][0])i=k;var lo=r[i][0],hi=r[i+1]?r[i+1][0]:lo+1;
 $('#rk').textContent=E.rank()+(r[i+1]?' · next at '+hi+' XP':' · top rank');$('#xb').style.width=Math.min(100,r[i+1]?100*(p.xp-lo)/(hi-lo):100)+'%';
 var fl=window.LQMark?LQMark('flame',14):'';
 $('#stt').innerHTML='<span>'+p.xp+' XP</span><span class="stk">'+fl+' '+p.streak+'</span><span>'+E.doneCount()+'/'+NR+' regions</span>';
 [].forEach.call(document.querySelectorAll('#pm img'),function(im,k2){im.classList.toggle('on',levelDone(k2))});
 var o=objective();$('#qt').textContent=o.text;st.obj=o}
function showBanner(t,s){var a=$('#area');a.querySelector('.kicker').textContent=s||'';a.querySelector('b').textContent=t;a.classList.add('on');clearTimeout(st.bt);st.bt=setTimeout(function(){a.classList.remove('on')},3400)}
/* ---------- menus ---------- */
function nextTab(){var t=(A.tabs||[]).filter(function(x){return x.id==='next'})[0];return t||null}
function tabScreen(id){var t=(A.tabs||[]).filter(function(x){return x.id===id})[0];if(!t)return;openOv(function(){wrap('<div id="rd"></div><button class="btn btn-ghost" id="bk2">Back</button>');t.render($('#rd'),{award:E.award,save:E.save,toast:E.toast,P:P()});$('#bk2').onclick=closeOv})}
function extraTabBtns(){return (A.tabs||[]).filter(function(x){return x.id==='review'||x.id==='practice'||x.id==='scratch'||x.id==='party'||x.id==='satchel'||x.id==='gloss'||x.id==='primer'}).map(function(t){return '<button class="btn btn-ghost" data-m="tab:'+t.id+'">'+esc(t.label)+'</button>'}).join('')}
function readScreen(){var t=nextTab();if(!t)return;openOv(function(){wrap('<div id="rd"></div><button class="btn btn-ghost" id="bk2">Back</button>');t.render($('#rd'),{award:E.award,save:E.save,toast:E.toast,P:P()});$('#bk2').onclick=closeOv})}
function menu(){if(st.mode!=='play')return;openOv(function(){wrap('<section class="panel"><p class="kicker">Paused</p><h2>'+esc(A.title)+'</h2><div class="row" style="flex-direction:column"><button class="btn btn-primary" data-m="x">Resume</button><button class="btn btn-ghost" data-m="q">Quest log</button><button class="btn btn-ghost" data-m="m">World map</button><button class="btn btn-ghost" data-m="b">Badges</button><button class="btn btn-ghost" data-m="s">Skills map</button><button class="btn btn-ghost" data-m="h">How to play</button>'+(nextTab()?'<button class="btn btn-ghost" data-m="r">'+esc(nextTab().label)+'</button>':'')+extraTabBtns()+'<button class="btn btn-ghost" data-m="fx">Low effects: '+(FX.low?'On':'Off')+'</button><button class="btn btn-ghost" data-m="v">Save now</button><button class="btn btn-ghost" data-m="t">Title screen</button><a class="btn btn-ghost" href="../index.html">All games</a></div></section><p class="disc">'+esc(A.disclaimer)+'</p>');
  $('#ovbody').onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;var m=b.dataset.m;if(m==='x')closeOv();else if(m==='fx'){toggleFx(b)}else if(m==='v'){E.save();E.toast('Saved in this browser')}else if(m==='t'){closeOv();title()}else if(m.indexOf('tab:')===0){closeOv();tabScreen(m.slice(4))}else{closeOv();({q:questLog,m:mapScreen,b:badgeScreen,s:skillScreen,h:help,r:readScreen})[m]()}}})}
function toggleFx(b){FX.set(!FX.low);var all=[st.world].concat(Object.keys(st.scenes).map(function(k){return st.scenes[k]}));all.forEach(function(sc){if(sc){Art.paintScene(sc);if(sc.id==='w')mkFogCv(sc)}});fxl=null;redrawFog(true);b.textContent='Low effects: '+(FX.low?'On':'Off');E.toast(FX.low?'Low effects on: the plain map':'Low effects off: lighting and soft fog')}
function badgeScreen(){openOv(function(){wrap('<section class="panel"><p class="kicker">Party chest</p><h2>Badges</h2><div id="bd"></div></section><button class="btn btn-ghost" id="bk2">Back</button>');E.badges($('#bd'));$('#bk2').onclick=closeOv})}
function skillScreen(){openOv(function(){wrap('<div id="sk"></div><button class="btn btn-ghost" id="bk2">Back</button>');E.skills($('#sk'));$('#bk2').onclick=closeOv})}
function help(){openOv(function(){wrap('<section class="panel"><p class="kicker">How to play</p><h2>Controls</h2>'+controls()+'<button class="btn btn-primary" id="bk2">Got it</button></section>');$('#bk2').onclick=closeOv})}
function controls(){return '<p class="dim small"><span class="kbd">←</span> <span class="kbd">→</span> <span class="kbd">↑</span> <span class="kbd">↓</span> or <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> walk the hex map (hold ← or → with ↑ or ↓ for exact diagonals). <span class="kbd">Enter</span>/<span class="kbd">Space</span>/<span class="kbd">E</span> talk or advance. <span class="kbd">M</span> map, <span class="kbd">J</span> quest log, <span class="kbd">Esc</span> menu. Click or tap any tile to walk there; tap a person or building to approach them. On touch screens use the pad and the A button.</p>'}
function questLog(){if(st.mode!=='play')return;openOv(function(){var o=objective(),w=PW(),rows=C.regions.map(function(R,i){var d=levelDone(i),cur=!d&&zoneOpen(i)&&(i===0||levelDone(i-1)),ic=d?IC2('ok'):cur?IC2('go'):IC2('lock');return '<div class="qrow"><div class="ic">'+ic+'</div><div class="qb"><b>'+esc(R.name)+'</b><div class="small dim">'+esc(A.levels[i].title)+(d?' · cleared':cur?' · current':' · locked')+(w.chests[i]?' · seal':'')+'</div></div></div>'}).join('');
  wrap('<section class="panel"><p class="kicker">Quest log</p><h2>Next objective</h2><p>'+esc(o.text)+'</p>'+rows+'<div class="qrow"><div class="ic">'+(bossDone()?IC2('ok'):allDone()?IC2('go'):IC2('lock'))+'</div><div class="qb"><b>'+esc(C.castle.name)+'</b><div class="small dim">'+esc(C.castle.boss.title)+'</div></div></div><p class="small dim" style="margin-top:12px">Supply caches found: '+Object.keys(w.caches).length+' of '+NR+'.</p><button class="btn btn-primary" id="bk2">Back to the map</button></section>');$('#bk2').onclick=closeOv})}
function mapScreen(){if(st.mode!=='play')return;openOv(function(){var wc=st.world,w=PW();
  wrap('<section class="panel"><p class="kicker">World map</p><canvas id="mf" class="mapfull" width="900" height="'+Math.round(900*wc.H/wc.W)+'"></canvas><div id="mr"></div><button class="btn btn-primary" id="bk2" style="margin-top:12px">Back</button></section>');
  var cv=$('#mf'),g=cv.getContext('2d'),k=cv.width/wc.W;g.drawImage(wc.cv,0,0,cv.width,cv.height);redrawFog(true);g.drawImage(wc.fogCv,0,0,cv.width,cv.height);
  g.textAlign='center';g.font='700 20px "Cormorant Garamond",Georgia,serif';NODES.forEach(function(nd,i){var x=hx(nd[0],nd[1])*k,y=hy(nd[1])*k,open=zoneOpen(i),tn=i<NR?C.regions[i].tint:C.castle.tint;g.fillStyle=open?(hexOk(tn)?tn:'#d7b56a'):'#6a6a70';g.beginPath();g.arc(x,y,7,0,7);g.fill();g.strokeStyle='#2a1d0a';g.lineWidth=2;g.stroke();if(open){var t=i<NR?C.regions[i].name:C.castle.name,tw=g.measureText(t).width+18;g.fillStyle='rgba(10,15,21,.92)';g.strokeStyle='#c8a86a';g.lineWidth=1.4;g.beginPath();if(g.roundRect)g.roundRect(x-tw/2,y-34,tw,24,6);else g.rect(x-tw/2,y-34,tw,24);g.fill();g.stroke();g.fillStyle='#f3e2b0';g.fillText(t,x,y-16)}});
  if(st.sid==='w')herePip(g,st.hero.x*k,st.hero.y*k,6);
  $('#mr').innerHTML=NODES.map(function(nd,i){var open=zoneOpen(i),done=i<NR?levelDone(i):bossDone();return '<div class="qrow"><div class="ic">'+(done?IC2('ok'):open?IC2('go'):IC2('lock'))+'</div><div class="qb"><b>'+esc(i<NR?C.regions[i].name:C.castle.name)+'</b></div>'+(open?'<button class="btn btn-ghost" data-tv="'+i+'">Travel</button>':'')+'</div>'}).join('');
  $('#mr').onclick=function(e){var b=e.target.closest('[data-tv]');if(!b)return;var i=+b.dataset.tv;closeOv();st.scene=st.world;st.sid='w';var nd=NODES[i],pos=nd;for(var d=0;d<6;d++){var n=neigh(nd[0],nd[1],d);if(walkable(st.world,n[0],n[1])&&!st.world.omap[n[0]+','+n[1]]){pos=n;break}}enter('w',pos[0],pos[1])};
  $('#bk2').onclick=closeOv})}
function title(){st.mode='title';document.body.classList.add('intitle');var t=$('#ttl'),p=P(),has=!!p.w||p.xp>0||E.doneCount()>0,v1=!p.w&&(p.xp>0||E.doneCount()>0);
 t.style.display='flex';
 var legend=C.regions.map(function(R){return '<i style="background:'+(hexOk(R.tint)?R.tint:'#d7b56a')+'"></i>'}).join('')+'<i style="background:'+(hexOk(C.castle.tint)?C.castle.tint:'#c9a24f')+'"></i>';
 t.innerHTML='<section class="panel"><p class="kicker">'+esc(A.kicker)+' · exploration edition</p><h1>'+esc(A.title)+'</h1><p class="dim">'+esc(A.tagline.split('.')[0])+'. Walk a painted map, meet teachers, face gatekeepers and open chests.</p><p class="legend" aria-hidden="true">'+legend+'</p><div class="rule"></div>'
 +(has?'<button class="btn btn-primary" id="tc" style="margin-bottom:10px">Continue'+(v1?' (version 1 progress found: '+E.doneCount()+' of '+NR+' levels cleared, '+p.xp+' XP)':'')+'</button>':'<button class="btn btn-primary" id="tn" style="margin-bottom:10px">Begin your journey</button>')
 +(has?'<button class="btn btn-ghost" id="tn" style="margin-bottom:10px">New journey (erases saved progress)</button>':'')
 +'<a class="btn btn-ghost" href="../index.html" style="margin-bottom:12px">All games</a>'+controls()+'<p class="small dim">Progress saves in this browser only and is never sent anywhere.</p><p class="disc">'+esc(A.disclaimer)+'</p></section>';
 var c=$('#tc');if(c)c.onclick=function(){gest=true;start(false)};$('#tn').onclick=function(){gest=true;if(!has||confirm('Erase all saved progress for this game and start again?'))start(true)}}
function start(fresh){var t=$('#ttl');document.body.classList.remove('intitle');if(fresh){E.reset()}var p=P(),w;
 if(!p.w){w=PW();var nd=NODES[0],pos=nd;for(var d=0;d<6;d++){var n=neigh(nd[0],nd[1],d);if(walkable(st.world,n[0],n[1])&&!st.world.omap[n[0]+','+n[1]]){pos=n;break}}w.c=pos[0];w.r=pos[1];A.levels.forEach(function(L,i){if(levelDone(i))w.taught[i]=1});if(E.doneCount()>0||p.xp>0)w.intro=1}
 w=PW();t.style.display='none';st.mode='play';
 var sid=w.sid||'w',sc=getScene(sid);if(!inb(sc,w.c,w.r)){w.sid='w';sid='w';sc=st.world;w.c=NODES[0][0]+1;w.r=NODES[0][1]}
 /* a saved position inside an unopened zone or blocked tile falls back to the nearest town gate/node */
 st.scene=sc;st.sid=sid;var o=sc.omap[w.c+','+w.r];if(!walkable(sc,w.c,w.r)||(o&&o.block)){if(sid==='w'){w.c=NODES[0][0];w.r=NODES[0][1];w.c=neigh(w.c,w.r,0)[0]}else{w.c=7;w.r=9}}
 syncFog(true);enter(sid,w.c,w.r);hud();$('#cv').focus();
 if(!w.intro){w.intro=1;E.save();say(C.regions[0].teacher,C.intro)}}
/* ---------- fog ---------- */
var blobA,blobB;
function mkBlob(rad,col0,col1){var c=document.createElement('canvas');c.width=c.height=Math.ceil(rad*2);var g=c.getContext('2d'),gr=g.createRadialGradient(rad,rad,0,rad,rad,rad);gr.addColorStop(0,col0);gr.addColorStop(.55,col0);gr.addColorStop(1,col1);g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);return c}
function syncFog(snap){for(var z=0;z<=NR;z++){st.fogTgt[z]=zoneOpen(z)?0:1;if(snap||st.fog[z]===undefined)st.fog[z]=st.fogTgt[z]}redrawFog(true)}
/* full effects: fog is drawn at half size with bigger, softer blobs so its edge feathers into the open land */
function mkFogCv(sc){var k=FX.low?1:.5;sc.fogK=k;sc.fogCv=document.createElement('canvas');sc.fogCv.width=Math.ceil(sc.W*k);sc.fogCv.height=Math.ceil(sc.H*k)}
function mkSoft(rad){var c=document.createElement('canvas');c.width=c.height=Math.ceil(rad*2);var g=c.getContext('2d'),gr=g.createRadialGradient(rad,rad,0,rad,rad,rad);gr.addColorStop(0,'rgba(26,34,46,.96)');gr.addColorStop(.4,'rgba(26,34,46,.82)');gr.addColorStop(.7,'rgba(26,34,46,.34)');gr.addColorStop(1,'rgba(26,34,46,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);return c}
var blobMode=null;
function redrawFog(force){var sc=st.world;if(blobMode!==FX.low||!blobA){blobMode=FX.low;blobA=FX.low?mkBlob(S*1.25,'rgba(26,34,46,.95)','rgba(26,34,46,0)'):mkSoft(S*1.7);blobB=mkBlob(S*1.1,'rgba(150,158,170,.32)','rgba(150,158,170,0)')}
 var fk=sc.fogK||1,fr=FX.low?S*1.25:S*1.7;
 var g=sc.fogCv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,sc.fogCv.width,sc.fogCv.height);g.setTransform(fk,0,0,fk,0,0);for(var r=0;r<sc.rows;r++)for(var c=0;c<sc.cols;c++){var a=st.fog[sc.zone[c][r]];if(a<=.01)continue;var x=hx(c,r),y=hy(r);g.globalAlpha=a;g.drawImage(blobA,x-fr,y-fr);if(Art.hash(c,r,2)<.6){g.globalAlpha=a*.8;g.drawImage(blobB,x-S*1.1+(Art.hash(c,r,3)-.5)*S,y-S*1.1+(Art.hash(c,r,4)-.5)*S)}}g.globalAlpha=1;g.setTransform(1,0,0,1,0,0)}
/* ---------- main loop / drawing ---------- */
var cv,ctx,dpr=1,CW=0,CH=0,mm,mmg;
function resize(){var r=$('#stage').getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);CW=r.width;CH=r.height;cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr)}
function zoom(){return Math.max(.8,Math.min(1.35,Math.min(CW,CH)/640))}
function update(dt){st.time+=dt;
 var ch=false;for(var z=0;z<st.fog.length;z++){var t=st.fogTgt[z]=zoneOpen(z)?0:1;if(st.fog[z]!==t){st.fog[z]+=Math.sign(t-st.fog[z])*Math.min(Math.abs(t-st.fog[z]),dt*.7);ch=true}}if(ch)redrawFog();
 if(st.mode==='dlg')typeTick(dt);
 var h=st.hero;if(st.mode!=='play'&&st.mode!=='title'&&!h.mv)return;
 var spd=.14/st.speed;
 if(h.mv){var m=h.mv;m.t+=dt/spd;var k=Math.min(1,m.t);h.x=m.fx+(m.tx-m.fx)*k;h.y=m.fy+(m.ty-m.fy)*k;if(m.t>=1)finishStep()}
 if(!h.mv&&st.mode==='play'){var dd=dirFromKeys();
  if(dd){st.path=null;for(var i=0;i<dd.length;i++){var res=stepDir(dd[i]);if(res==='moved'){if(dd.length===2)st.zig=!st.zig;break}if(res==='bump')break}}
  else if(st.path&&st.path.length){var nx=st.path[0],d=dirTo([h.c,h.r],nx);if(d<0){st.path=null}else{var rs=stepDir(d);if(rs==='moved')st.path.shift();else st.path=null}}}
}
function figDraw(g,sp,x,y,o){Art.figure(g,x,y,sp.look||sp,o)}
function draw(){if(!st.scene)return;var sc=st.scene,z=zoom(),vw=CW/z,vh=CH/z,h=st.hero,g=ctx;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a0f15';g.fillRect(0,0,cv.width,cv.height);
 var tx=h.x-vw/2,ty=h.y-vh/2;if(st.mode==='title'&&sc.id==='w'){var drift=(FX.low||(FX.rm&&FX.rm.matches))?0:Math.sin(st.time*.2)*40;tx=hx(NODES[0][0],NODES[0][1])-vw/2+drift;ty=hy(NODES[0][1])-vh/2}
 var mx=sc.W-vw,my=sc.H-vh;tx=mx<0?mx/2:Math.max(0,Math.min(mx,tx));ty=my<0?my/2:Math.max(0,Math.min(my,ty));
 if(st.cam.snap){st.cam.x=tx;st.cam.y=ty;st.cam.snap=false}else{st.cam.x+=(tx-st.cam.x)*.18;st.cam.y+=(ty-st.cam.y)*.18}
 var cx=st.cam.x,cy=st.cam.y;g.setTransform(dpr*z,0,0,dpr*z,-cx*dpr*z,-cy*dpr*z);g.drawImage(sc.cv,0,0);if(!FX.low&&window.LQAnim)LQAnim.water(g,sc,st.time,cx,cy,vw,vh);
 var list=[],T=st.time,world=sc.id==='w',cur=st.obj&&st.obj.target;
 sc.objs.forEach(function(o){if(world&&!zoneOpen(sc.zone[o.c][o.r])&&st.fog[sc.zone[o.c][o.r]]>.8)return;list.push({y:hy(o.r),o:o})});
 if(st.mode!=='title')list.push({y:h.y,hero:true});list.sort(function(a,b){return a.y-b.y});
 var w=P().w||{chests:{},caches:{}};
 list.forEach(function(it){if(it.hero){Art.figure(g,h.x,h.y,C.hero,{t:T,moving:!!h.mv,face:h.face});return}
  var o=it.o,x=hx(o.c,o.r),y=hy(o.r);if(x<cx-90||x>cx+vw+90||y<cy-130||y>cy+vh+90)return;
  if(o.type==='npc'){var fc=h.x<x?-1:1;Art.figure(g,x,y,o.sp.look,{t:T+o.c,face:fc});
   if(Math.abs(h.x-x)<S*3&&Math.abs(h.y-y)<S*3){g.font='700 13px "Cormorant Garamond",Georgia,serif';g.textAlign='center';var nw=g.measureText(o.name).width+16,ny=y-S*1.45;g.fillStyle='rgba(10,15,21,.92)';g.strokeStyle='#c8a86a';g.lineWidth=1.2;g.beginPath();if(g.roundRect)g.roundRect(x-nw/2,ny-13,nw,18,5);else g.rect(x-nw/2,ny-13,nw,18);g.fill();g.stroke();g.fillStyle='#f3e2b0';g.fillText(o.name,x,ny)}}
  else{var op={accent:o.accent,t:T,pine:o.pine,snow:o.snow,v:o.v,landmark:o.landmark,biome:o.type==='node'?bio(o.i):null,motif:o.motif,roof:o.roof};
   if(o.type==='chest'){op.open=o.i>=NR?!!w.chests[o.i]:!!w.chests[o.i];op.glow=!op.open&&(o.i>=NR?bossDone():levelDone(o.i));op.locked=!(o.i>=NR?bossDone():levelDone(o.i))}
   if(o.role==='hall')op.lit=o.kind==='great'?bossDone():levelDone(region());
   if(o.type==='cache'&&w.caches[o.i])return;
   if(o.type==='node'){var cl=o.i<NR?levelDone(o.i):bossDone();if(cl)op.accent='#c9a24f'}
   Art.building(g,o.kind,x,y,op);
   if(o.type==='node'&&(zoneOpen(o.i)||st.fog[o.i]<.8)){var nm=o.i<NR?C.regions[o.i].name:C.castle.name,cl2=o.i<NR?levelDone(o.i):bossDone();g.font='700 15px "Cormorant Garamond",Georgia,serif';g.textAlign='center';var tw=g.measureText(nm).width+24+(cl2?16:0),by=y-S*(o.kind==='castle'?2.7:2.15);
    g.fillStyle='rgba(10,15,21,.92)';g.strokeStyle='#c8a86a';g.lineWidth=1.6;g.beginPath();if(g.roundRect)g.roundRect(x-tw/2,by-16,tw,24,6);else g.rect(x-tw/2,by-16,tw,24);g.fill();g.stroke();g.fillStyle=cl2?'#f3e2b0':'#e8dcc4';g.fillText(nm,x+(cl2?7:0),by+2);if(cl2)brassStar(g,x-tw/2+13,by-4,5.5)}}});
 if(!FX.low&&window.LQAnim){var zb=world?sc.zone[h.c]&&sc.zone[h.c][h.r]:null;LQAnim.particles(g,world?bio(zb==null||zb<0?0:zb):(sc.biome||'meadow'),st.dtRaw||0,cx,cy,vw,vh,T)}
 if(world){g.drawImage(sc.fogCv,0,0,sc.W,sc.H)}
 /* quest marker */
 if(cur&&cur.sid===sc.id){var nd=world&&sc.objs.filter(function(o){return o.type==='node'&&o.c===cur.c&&o.r===cur.r})[0];/* on an overworld town or castle, float above its name plaque */
  var stillM=FX.low||(FX.rm&&FX.rm.matches),qx=hx(cur.c,cur.r),qy=(nd?hy(cur.r)-S*(nd.kind==='castle'?2.7:2.15)-18-16:hy(cur.r)-S*(world?2.4:2.2))+(stillM?0:Math.sin(T*4)*4);g.fillStyle='#f3e2b0';g.strokeStyle='#6b4a0e';g.lineWidth=2;g.beginPath();g.moveTo(qx,qy+12);g.lineTo(qx-9,qy-2);g.lineTo(qx+9,qy-2);g.closePath();g.fill();g.stroke();
  if(!stillM){var pr=(T*1.5)%1;g.strokeStyle='rgba(243,226,176,'+(1-pr)+')';g.lineWidth=2.5;Art.hexPath(g,hx(cur.c,cur.r),hy(cur.r),S*(.7+pr*.5));g.stroke()}}
 g.setTransform(1,0,0,1,0,0);if(!FX.low){if(!fxl||fxl.w!==cv.width||fxl.h!==cv.height)mkLight();g.drawImage(fxl.c,0,0)}
 g.setTransform(dpr,0,0,dpr,0,0);
 if(cur&&cur.sid===sc.id&&st.mode==='play'){var sx=(hx(cur.c,cur.r)-cx)*z,sy=(hy(cur.r)-cy)*z;if(sx<10||sx>CW-10||sy<10||sy>CH-10){var ang=Math.atan2(sy-CH/2,sx-CW/2),ex=CW/2+Math.cos(ang)*Math.min(CW,CH)*.42,ey=CH/2+Math.sin(ang)*Math.min(CW,CH)*.42;g.save();g.translate(ex,ey);g.rotate(ang);g.fillStyle='#f3e2b0';g.strokeStyle='#6b4a0e';g.lineWidth=2;g.beginPath();g.moveTo(16,0);g.lineTo(-8,-11);g.lineTo(-3,0);g.lineTo(-8,11);g.closePath();g.fill();g.stroke();g.restore()}}
 if(!vig||vig.w!==CW||vig.h!==CH){var vc=document.createElement('canvas');vc.width=Math.max(1,CW);vc.height=Math.max(1,CH);var vgx=vc.getContext('2d'),vg=vgx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*.35,CW/2,CH/2,Math.max(CW,CH)*.75);vg.addColorStop(0,'rgba(8,10,16,0)');vg.addColorStop(1,'rgba(8,10,16,.55)');vgx.fillStyle=vg;vgx.fillRect(0,0,CW,CH);vig={c:vc,w:CW,h:CH}}
 g.drawImage(vig.c,0,0,CW,CH);
 st.mmT-=1;if(st.mmT<=0){st.mmT=6;drawMM()}}
function drawMM(){if(!mm||!st.scene)return;var sc=st.scene,g=mmg,W=mm.width,H=mm.height,k=Math.min(W/sc.W,H/sc.H),ox=(W-sc.W*k)/2,oy=(H-sc.H*k)/2;g.fillStyle='#0a0f15';g.fillRect(0,0,W,H);g.drawImage(sc.cv,ox,oy,sc.W*k,sc.H*k);if(sc.id==='w')g.drawImage(sc.fogCv,ox,oy,sc.W*k,sc.H*k);
 if(sc.id==='w')NODES.forEach(function(nd,i){var tn=i<NR?C.regions[i].tint:C.castle.tint;g.fillStyle=zoneOpen(i)?(hexOk(tn)?tn:'#f3e2b0'):'#555b64';g.beginPath();g.arc(ox+hx(nd[0],nd[1])*k,oy+hy(nd[1])*k,i<NR?5:7,0,7);g.fill();g.strokeStyle='#2a1d0a';g.lineWidth=1.5;g.stroke()});
 var tgt=st.obj&&st.obj.target;if(tgt&&tgt.sid===sc.id){var pulse=FX.low||(FX.rm&&FX.rm.matches)?0:Math.sin(st.time*5)*2;g.strokeStyle='#f3e2b0';g.lineWidth=2;g.beginPath();g.arc(ox+hx(tgt.c,tgt.r)*k,oy+hy(tgt.r)*k,9+pulse,0,7);g.stroke()}
 herePip(g,ox+st.hero.x*k,oy+st.hero.y*k,5)}
var last=0;function frame(ts){requestAnimationFrame(frame);if(document.hidden)return;var dt=Math.min(.05,(ts-last)/1000||0);last=ts;st.dtRaw=dt;try{update(dt);draw()}catch(e){console.error(e);throw e}}
/* ---------- input ---------- */
var KM={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
function key(e,down){gest=true;if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;var k=e.key;
 if(st.mode==='play'){if(KM[k]){st.keys[KM[k]]=down;e.preventDefault();return}
  if(down){if(k==='Enter'||k===' '||k==='e'||k==='E'){e.preventDefault();actionKey()}else if(k==='m'||k==='M')mapScreen();else if(k==='j'||k==='J')questLog();else if(k==='Escape'||k==='Tab'){e.preventDefault();menu()}}}
 else if(st.mode==='dlg'&&down){if(k==='Enter'||k===' '||k==='e'||k==='E'){e.preventDefault();adv()}else if(/^[1-9]$/.test(k)&&D.choices&&!D.typing)pick(+k-1)}
 else if(st.mode==='ov'&&down&&k==='Escape'){closeOv()}
 if(!down&&KM[k])st.keys[KM[k]]=false}
function pointer(e){gest=true;if(st.mode!=='play')return;var r=cv.getBoundingClientRect(),z=zoom(),x=(e.clientX-r.left)/z+st.cam.x,y=(e.clientY-r.top)/z+st.cam.y,hxy=Art.px2hex(x,y);if(!inb(st.scene,hxy[0],hxy[1]))return;
 var o=objAt(hxy[0],hxy[1]);var g=walkTo(hxy[0],hxy[1]);if(!g&&o&&interactive(o)){var h=st.hero;if(Art.hdist(h.c,h.r,o.c,o.r)===1)interact(o)}}
/* ---------- init ---------- */
function init(){cv=$('#cv');ctx=cv.getContext('2d');resize();window.addEventListener('resize',resize);buildHud();mm=$('#mm');mmg=mm.getContext('2d');
 st.world=buildWorld();syncFog(true);st.scene=st.world;st.hero.x=hx(NODES[0][0],NODES[0][1]);st.hero.y=hy(NODES[0][1]);
 window.addEventListener('keydown',function(e){key(e,true)});window.addEventListener('keyup',function(e){key(e,false)});window.addEventListener('blur',function(){st.keys={};st.pad=-1});
 cv.addEventListener('pointerup',pointer);$('#ovx').onclick=function(){closeOv()};
 document.addEventListener('visibilitychange',function(){st.keys={};st.pad=-1});
 document.body.addEventListener('pointerdown',function(){gest=true},{passive:true});
 var w=P().w;if(w&&w.sid){var sc=w.sid==='w'?st.world:null;if(sc){st.hero.c=w.c;st.hero.r=w.r}}
 title();requestAnimationFrame(frame);
 window.__w={interact:interact,st:st,walkTo:function(c,r){return new Promise(function(res){if(!walkTo(c,r))return res(false);var t0=Date.now();(function p(){if(!st.path&&!st.hero.mv||Date.now()-t0>60000)res(true);else setTimeout(p,30)})()})},warp:function(sid,c,r){enter(sid,c,r)},objective:objective,speed:function(n){st.speed=n},NODES:NODES,hud:hud,scene:function(){return st.scene},bfs:bfs,getScene:getScene,zoneOpen:zoneOpen,adv:adv,pick:pick,neigh:neigh,canWalk:canWalk,start:start}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
