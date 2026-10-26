/* Exploration layer: hex overworld + towns, hero, NPC dialogue, quests, HUD. Lessons/quizzes/sims come from engine.js + content.js. */
/* r5 lane F: load shared/feel.js (game feel and living world) next to this file, so the page HTML stays untouched. Every LQFeel call is guarded, so play works before it arrives. */
(function(){try{if(window.LQFeel||document.querySelector('script[data-lq-feel]'))return;var me=document.currentScript,src=me&&me.src?me.src.replace(/world\.js(\?.*)?$/,'feel.js'):'../shared/feel.js',s=document.createElement('script');s.src=src;s.setAttribute('data-lq-feel','1');(me&&me.parentNode||document.head).appendChild(s)}catch(e){}})();
(function(){
'use strict';
var FX=window.LQFx||{low:true,set:function(){}},A=window.APP,E=window.Engine,C=window.WORLD,Art=window.Art,S=Art.S,hx=Art.hx,hy=Art.hy,neigh=Art.neigh;
if(C&&C.hero&&C.hero.gear==null)C.hero.gear=1;/* r4: hero gear layers (mantle, strap, satchel, belt, boots) on the map figure and the HUD portrait */
var $=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hexOk(c){return typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c)}
var NR=A.levels.length; /* 7 */
var P=function(){return E.P()};
function PW(){var p=P();if(!p.w)p.w={sid:'w',c:-1,r:-1,chests:{},caches:{},taught:{},sim:{},visited:{},intro:0};return p.w}
var st={mode:'title',scene:null,sid:'w',hero:{c:0,r:0,x:0,y:0,face:1,mv:null,foot:1,step:0,hop:0,turn:0},path:null,keys:{},pad:-1,zig:false,time:0,cam:{x:0,y:0,snap:true,err:99},fog:[],fogTgt:[],speed:1,after:null,worlds:null,scenes:{},mmT:0,banner:0,shake:0,bumpAt:-1,veil:0,idleAcc:0,rip:null,xpVis:null,xpFrom:0,xpTo:0,xpT:1,seenOpen:null};
/* ---------- config / badges ---------- */
A.badges=A.badges.concat(C.regions.map(function(R,i){return {id:'seal_'+A.levels[i].id,icon:'🏅',name:'Seal of '+R.name,desc:'Open the chest in '+R.name}}),[{id:'crown',icon:'👑',name:C.castle.chest,desc:'Open the chest in the final keep'},{id:'scout',icon:'🧭',name:'Pathfinder',desc:'Find every supply cache on the map'}]);
function levelDone(i){var r=P().levels[A.levels[i].id];return !!(r&&r.done)}
function allDone(){return E.doneCount()===NR}
function bossDone(){return !!(P().boss&&P().boss.done)}
/* ---------- sound ---------- */
var AC=null,muted=false,gest=false;try{muted=localStorage.getItem('learning-apps.mute')==='1'}catch(e){}
function blip(f,d,v,type,f2){if(muted||!gest)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended'){var rp=AC.resume();if(rp&&rp.catch)rp.catch(function(){})}var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.linearRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.025,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
/* r5: feel.js layers its synth sounds on the same context and mute */
window.LQSfx={on:function(){return !muted&&gest},ctx:function(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended'){var rp=AC.resume();if(rp&&rp.catch)rp.catch(function(){})}}catch(e){return null}return AC}};
function motionOn(){return !FX.low&&!(FX.rm&&FX.rm.matches)}
function chime(msg){if(st)st.celUntil=(st.time||0)+2.4;try{if(motionOn()&&window.LQAnim&&st&&st.hero){var bx=st.hero.x,by=st.hero.y-S*.9,fy=st.hero.y-S*1.4;if(useView()){var p=toView(st.hero.x,st.hero.y,heroH(),S*.9);bx=p.x;by=p.y;fy=p.y-S*.5}LQAnim.burst(bx,by);if(msg&&LQAnim.floatText)LQAnim.floatText(bx,fy,msg)}}catch(e){}blip(660,.25,.04,'triangle',880);setTimeout(function(){blip(990,.4,.035,'triangle')},120)}
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
function getScene(id){if(id==='w')return st.world;if(!st.scenes[id]){st.scenes[id]=buildTown(id==='k'?NR:+id.slice(1));if(window.LQPerf)LQPerf.trimScenes(st.scenes,id,st.scene)}else if(window.LQPerf)LQPerf.touch(id);return st.scenes[id]}/* r6: phones keep the 3 most recent towns and release the rest; a town rebuilds the same way on return */
/* ---------- walking ---------- */
function zoneOpen(z){return z===0||(z<NR?E.unlocked(z):allDone())}
function walkable(sc,c,r){return inb(sc,c,r)&&sc.pass[c][r]&&(sc.id!=='w'||zoneOpen(sc.zone[c][r]))}
function objAt(c,r){return st.scene.omap[c+','+r]}
function canWalk(c,r){if(!walkable(st.scene,c,r))return false;var o=objAt(c,r);return !(o&&o.block)}
function interactive(o){return o&&(o.type==='npc'||o.type==='building'||o.type==='chest')}
function stepDir(d){var h=st.hero,n=neigh(h.c,h.r,d),c=n[0],r=n[1],face=(d===0||d===2||d===4)?1:-1;if(h.face!==face){h.face=face;if(motionOn())h.turn=1}
 if(!inb(st.scene,c,r))return 'blocked';var o=objAt(c,r);
 if(interactive(o)){st.path=null;interact(o);return 'bump'}
 if(!walkable(st.scene,c,r)||(o&&o.block)){if(st.time-st.bumpAt>.32){if(motionOn())st.shake=.16;st.bumpAt=st.time;blip(98,.05,.02,'square')}return 'blocked'}
 h.mv={fx:h.x,fy:h.y,tx:hx(c,r),ty:hy(r),t:0,c:c,r:r};h.step=0;h.hop=0;return 'moved'}
function finishStep(){var h=st.hero,m=h.mv;h.c=m.c;h.r=m.r;h.x=m.tx;h.y=m.ty;h.mv=null;h.step=0;h.hop=0;h.foot=-(h.foot||1);if(motionOn()){h.land=1;h.settle=1}var w=PW();w.sid=st.sid;w.c=h.c;w.r=h.r;E.save();
 var o=objAt(h.c,h.r),nodeT=!!(o&&(o.type==='node'||o.type==='gate')),pq=useView()?toView(h.x,h.y+S*.32,tileH(st.scene,h.c,h.r),0):{x:h.x,y:h.y+S*.32};
 if(!(window.LQFeel&&LQFeel.step(st.scene,h.c,h.r,pq.x,pq.y,h.face,!nodeT&&motionOn())))if(Math.random()<.5)blip(180+Math.random()*30,.05,.012,'triangle');/* r5: terrain footsteps and dust */
 if(!nodeT&&motionOn()&&window.LQAnim&&LQAnim.puff&&!window.LQFeel)LQAnim.puff(pq.x,pq.y);
 if(!o)return;
 if(o.type==='node'){st.path=null;visitNode(o)}
 else if(o.type==='gate'){st.path=null;leaveTown()}
 else if(o.type==='cache'&&!w.caches[o.i]){w.caches[o.i]=1;P().xp+=10;chime('+10 XP');E.toast('Supply cache found: +10 XP');if(Object.keys(w.caches).length>=NR){E.award('scout');try{document.dispatchEvent(new CustomEvent('lq:milestone',{detail:{ms:{kind:'pathfinder'}}}))}catch(e){}}E.save();hud()}}
function visitNode(o){var w=PW();w.visited[o.i]=1;enter(o.i<NR?'t'+o.i:'k',7,9)}
function leaveTown(){var w=world(),i=st.scene.i,nd=NODES[i],sc=st.world,pos=null;for(var d=0;d<6;d++){var n=neigh(nd[0],nd[1],d);if(walkable(sc,n[0],n[1])&&!sc.omap[n[0]+','+n[1]]){pos=n;break}}
 enter('w',pos?pos[0]:nd[0],pos?pos[1]:nd[1])}
function world(){return st.world}
function enter(sid,c,r){var sc=getScene(sid),h=st.hero;st.scene=sc;st.sid=sid;h.c=c;h.r=r;h.x=hx(c,r);h.y=hy(r);h.mv=null;h.step=0;h.hop=0;st.path=null;st.cam.snap=true;st.cam.err=99;st.veil=motionOn()?1:0;var w=PW();w.sid=sid;w.c=c;w.r=r;E.save();showBanner(sc.title,sc.sub);hud();if(window.Narr&&(sid==='k'||/^t\d+$/.test(sid)))window.Narr.play(C.key,sid)}
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
/* NPC look with stable per-name variety, and a portrait mood read from the line being spoken (neutral when unsure) */
function nl(sp){return sp&&sp.look&&Art.npcLook?Art.npcLook(sp.look,sp.name):(sp&&sp.look)}
function moodOf(t,q){t=String(t||'');if(/(you found|well done|well studied|you have passed|correct|great work|nicely done|excellent|\+\d+ XP|welcome|well met|hello)/i.test(t))return 'happy';if(/(not this time|not quite|try again|almost|nearly|no penalty|have another go|keep going|not ready)/i.test(t))return 'encouraging';if(/(halt|sealed|locked|oh!|whoa|wow)/i.test(t))return 'surprised';if(q||/\?\s*$/.test(t))return 'thinking';return 'neutral'}
function draw0(){var el=$('#dlg'),sp=D.sp||{};el.hidden=false;D.i=0;D.typing=true;D.shown=0;document.body.classList.add('indlg');
 var mood=sp.look?moodOf(D.full,!!D.choices):'',who=(sp.name||'')+'|'+(sp.look?JSON.stringify(sp.look):(sp.mark||sp.icon||''))+'|'+mood;
 if(el.dataset.who===who&&el.querySelector('.body')){el.querySelector('.body').textContent='';var ch=el.querySelector('.ch');if(ch)ch.innerHTML='';var more=el.querySelector('.more');if(more)more.remove();if(!motionOn())finishType();return}
 el.dataset.who=who;
 var pic=sp.look?'<img alt="" src="'+Art.portrait(nl(sp),84,mood)+'">':spotPic(sp.mark);
 el.innerHTML='<div class="panel">'+pic+'<div class="tx"><span class="nameplate">'+esc(sp.name||'')+'</span>'+(sp.title?'<span class="ti">'+esc(sp.title)+'</span>':'')+'<div class="body"></div><div class="ch"></div></div></div>';
 el.firstChild.onclick=function(e){if(e.target.closest('.opt'))return;adv()};if(!motionOn())finishType()}
function typeTick(dt){if(!D.typing)return;if(!motionOn()){D.typing=false;D.shown=D.full.length;finishType();return}D.i+=dt*55;var n=Math.min(D.full.length,Math.floor(D.i)),b=$('#dlg .body');if(!b)return;if(n!==D.shown){if(n%3===0)blip(520+(n%7)*18,.04,.012,'square');D.shown=n;b.textContent=D.full.slice(0,n)}if(n>=D.full.length){D.typing=false;finishType()}}
function finishType(){var b=$('#dlg .body');b.textContent=D.full;var ch=$('#dlg .ch');if(D.choices){ch.innerHTML=D.choices.map(function(o,i){return '<button class="opt" data-k="'+i+'" style="animation-delay:'+(i*45)+'ms">'+(i+1)+'. '+esc(o.t)+'</button>'}).join('');ch.onclick=function(e){var bt=e.target.closest('[data-k]');if(bt)pick(+bt.dataset.k)}}else{var more=window.LQMark?LQMark('go',14):'';b.insertAdjacentHTML('beforeend','<span class="more">'+(more||'▼')+'</span>')}}
function pick(k){var o=D.choices[k];if(!o)return;closeDlg();if(o.fn)o.fn()}
function adv(){if(st.mode!=='dlg')return;if(D.typing){D.typing=false;D.shown=D.full.length;finishType();return}if(D.choices)return;if(D.lines.length){nextLine();return}var cb=D.cb;closeDlg();if(cb)cb()}
function closeDlg(){var el=$('#dlg');el.hidden=true;el.dataset.who='';document.body.classList.remove('indlg');if(st.mode==='dlg')st.mode='play';$('#cv').focus()}
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
function trial(i){var G=C.regions[i].gate,was=levelDone(i);openOv(function(){E.level(i,'quiz')},function(){var now=levelDone(i);if(now&&!was){chime('Cleared');var hp=scr(st.hero.x,st.hero.y,heroH(),S*.5);cele({msg:'The way is open!',vfx:'gate',x:hp[0],y:hp[1],confetti:false,ms:{kind:'region',i:i}});var nx=i<NR-1?'The fog lifts from '+C.regions[i+1].name+'.':'The gates of the '+C.castle.name+' now stand open.';say(G,['Well fought. You may pass. '+nx,'Open the chest in this town, then take the south gate back to the map.'])}else if(!now)say(G,['Not this time. Re-read the lesson with the teacher and try again; there is no penalty.'])})}
function simTalk(i){var R=C.regions[i],s=R.sim,sp={name:s.name,mark:({vault:'vault',guild:'ruler',smithy:'hammer',tower:'tower',lab:'flask',observatory:'scope'})[s.building]||'scroll'};
 say(sp,[s.blurb+(s.render?' (A toy example with made-up numbers, not real model data.)':' (Example data, not advice. Nothing is ordered or connected.)')],function(){ask(sp,s.kind==='lesson'?'Climb the tower?':'Step inside?',[{t:'Enter',fn:function(){openSim(i)}},{t:'Not now'}])})}
function openSim(i){var s=C.regions[i].sim,w=PW();w.sim[i]=1;
 if(s.kind==='lesson'){openOv(function(){E.level(i,'lesson')});return}
 if(s.render){openOv(function(){wrap('<section class="panel"><p class="kicker">'+esc(C.regions[i].name)+'</p><h2>'+esc(s.name)+'</h2><p class="dim small">'+esc(s.blurb)+'</p></section><div id="simhost"></div>');var host=$('#simhost');s.render(host);host.insertAdjacentHTML('beforeend','<button class="btn btn-primary rise" id="simx" style="margin-top:12px">Leave</button>');$('#simx').onclick=function(){closeOv()}});return}
 var map={cash:'#s1',hedge:'#s2',trim:'#s3'};
 openOv(function(){wrap('<section class="panel"><p class="kicker">'+esc(C.regions[i].name)+'</p><h2>'+esc(s.name)+'</h2><p class="dim small">'+esc(s.blurb)+'</p></section><div id="simhost"></div>');
  var host=$('#simhost'),tab=A.tabs[0];tab.render(host,{award:E.award,save:E.save,toast:E.toast,P:P()});
  ['#s1','#s2','#s3'].forEach(function(id){if(id!==map[s.kind]){var e=$(id,host);if(e)e.style.display='none'}})
  host.insertAdjacentHTML('beforeend','<button class="btn btn-primary rise" id="simx">Leave</button>');$('#simx').onclick=function(){closeOv()}})}
/* round 2 fx: world point -> screen px (for lighting a chest or the hero), and fire the shared lq:celebrate event */
function scr(x,y,h,up){try{var r=cv.getBoundingClientRect(),z=zoom(),vx=x,vy=y-(up||0);if(useView()){var p=toView(x,y,h||0,up||0);vx=p.x;vy=p.y}return [r.left+(vx-st.cam.x)*z,r.top+(vy-st.cam.y)*z]}catch(e){return [innerWidth/2,innerHeight/2]}}
/* r4: chest reward card (shared/hud.js draws it) */
function reward(d){try{document.dispatchEvent(new CustomEvent('lq:reward',{detail:d}))}catch(e){}}
function cele(d){try{document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:d}))}catch(e){}}
function chestFx(o,msg){var p=scr(hx(o.c,o.r),hy(o.r),tileH(st.scene,o.c,o.r),S*.25);cele({msg:msg,vfx:'beam',x:p[0],y:p[1],ms:{kind:o.i>=NR?'finale':'seal',i:o.i}})}
function chestOpen(o){var i=o.i,w=PW(),was=!!w.chests[i],sp={name:'Treasure chest',mark:was?'gift-open':'gift'};
 if(i>=NR){if(!bossDone()){if(motionOn())o._nudge=.28;return say(sp,['The chest is sealed. Only the Council can open it: finish the final challenge first.'])}
  if(was)return say(sp,['Empty now. You already took the '+C.castle.chest+'.']);w.chests[i]=1;P().xp+=50;E.award('crown');chime('+50 XP');chestFx(o,'Treasure found!');reward({title:C.castle.chest,kind:'crown',rarity:'legendary',xp:50,where:C.castle.name,accent:C.castle.tint});E.save();hud();sp.mark='gift-lit';return say(sp,['You found the '+C.castle.chest+'! +50 XP and a badge.','The realm is yours to explore. Revisit any trial to earn three stars.'])}
 var R=C.regions[i];
 if(!levelDone(i)){if(motionOn())o._nudge=.28;return say(sp,['The chest is locked. '+R.gate.name+' holds the key: pass the trial first.'])}
 if(was)return say(sp,['Empty now. You already took the Seal of '+R.name+'.']);
 w.chests[i]=1;P().xp+=25;E.award('seal_'+A.levels[i].id);chime('+25 XP');chestFx(o,'Seal found!');reward({title:'Seal of '+R.name,kind:'seal',rarity:'rare',xp:25,where:R.name,accent:R.accent});E.save();hud();sp.mark='gift-lit';say(sp,['You found the Seal of '+R.name+'! +25 XP and a badge.'])}
function bossTalk(){var B=C.castle.boss;
 if(!allDone())return say(B,['You are not ready. Clear all '+NR+' regions first.']);
 say(B,bossDone()?['You have faced us already, and did well. Care to try for a higher score?']:['So you have crossed the whole realm. I am '+B.name+'.',B.title+'. Make your five choices wisely.'],function(){var was=bossDone();ask(B,was?'Face the challenge again?':'Begin the final challenge?',[{t:'Begin',fn:function(){openOv(function(){E.boss()},function(){if(bossDone()){chime('Well done');if(!was){var hp=scr(st.hero.x,st.hero.y,heroH(),S*.5);cele({msg:'Well done',vfx:'shockwave',x:hp[0],y:hp[1],confetti:false,ms:{kind:'council'}})}say(B,['A fine piece of work. Open the chest by the wall, and take your crown.'])}})}},{t:'Not yet'}])})}
function interact(o){
 if(motionOn()){st.hero.poke=1;if(o.type==='npc')o._greet=st.time}
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
var IC={map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1H9v11a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2z"/><path d="M9 11h7M9 14h7"/>',snd:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',ok:'<path d="M5 12l5 5 9-10"/>',go:'<path d="M8 5l11 7-11 7z"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',flame:'<path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.6 1.4-3.6C10 9 11 10 11 11c0-2 1-5 1-8z"/>',gift:'<rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M3 8h18v3H3zM12 8v12M12 8c-2-3-6-2-5 .5M12 8c2-3 6-2 5 .5"/>',vault:'<path d="M4 10h16v10H4z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>',ruler:'<path d="M4 16l16-8"/><path d="M7 13.2l1.2 1.2M10 11.2l1.2 1.2M13 9.2l1.2 1.2M16 7.2l1.2 1.2"/>',hammer:'<path d="M14 4l6 6-3 1-7 7-3-3 7-7z"/><path d="M4 20l5-5"/>',tower:'<path d="M8 20V9l4-4 4 4v11"/><path d="M8 20h8M12 13v3"/>',flask:'<path d="M10 3h4M11 4v6L6 19a3 3 0 0 0 2.6 4h6.8A3 3 0 0 0 18 19l-5-9V4"/>',scope:'<circle cx="10" cy="11" r="4"/><path d="M13 14l7 7M16 4v3M16 15v2"/>'};
function ic(n,z){z=z||22;return '<svg class="ico" viewBox="0 0 24 24" width="'+z+'" height="'+z+'" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'}
/* painted spot for a chest or a landmark. HUD buttons stay line icons. gift is shut, gift-lit has just opened, gift-open is already empty. */
var SPOT={gift:'chest','gift-open':'chest-lit','gift-lit':'chest-lit',scroll:'scroll',vault:'vault',ruler:'ruler',hammer:'hammer',tower:'tower',flask:'flask',scope:'scope'};
function spotPic(mark){var n=SPOT[mark||'scroll'];if(!n)return '<div class="spot" style="width:84px;height:84px;border-radius:12px;border:2px solid var(--brass);display:grid;place-items:center;background:var(--panel-lift);flex:none;color:var(--gold)">'+ic(mark||'scroll',44)+'</div>';
 var cls='spot-art'+(mark==='gift-lit'?' spot-lit':'')+(mark==='gift-open'?' spot-lit spot-spent':'');
 return '<img class="'+cls+'" alt="" width="84" height="84" src="../assets/art/spots/'+n+'.svg">'}
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
 $('#pm').innerHTML=C.regions.map(function(R){var ring=hexOk(R.accent)?R.accent:'#8a6528';return '<span class="pm" style="--ring:'+ring+'"><img alt="'+esc(R.gate.name)+'" title="'+esc(R.gate.name)+'" src="'+Art.portrait(nl(R.gate),24)+'"></span>'}).join('');
 if(window.Party&&$('#pc'))Party.hud($('#pc'));
 $('#bmap').onclick=mapScreen;$('#mm').onclick=mapScreen;$('#bq').onclick=questLog;$('#quest').onclick=questLog;$('#bmenu').onclick=menu;$('#bsnd').onclick=toggleSound;$('#bact').onclick=function(){gest=true;actionKey()};
 var ba=$('#bact');ba.addEventListener('pointerdown',function(){ba.classList.add('hold')});['pointerup','pointerleave','pointercancel'].forEach(function(ev){ba.addEventListener(ev,function(){ba.classList.remove('hold')})});
 [].forEach.call(document.querySelectorAll('#pad button'),function(b){var d=+b.dataset.d;b.addEventListener('pointerdown',function(e){e.preventDefault();gest=true;b.classList.add('hold');if(st.mode==='play')st.pad=d});['pointerup','pointerleave','pointercancel'].forEach(function(ev){b.addEventListener(ev,function(){b.classList.remove('hold');if(st.pad===d)st.pad=-1})})});
 updSound()}
function updSound(){$('#bsnd').innerHTML=ic(muted?'mute':'snd');$('#bsnd').title=muted?'Sound off':'Sound on'}
function toggleSound(){muted=!muted;try{localStorage.setItem('learning-apps.mute',muted?'1':'0')}catch(e){}updSound();var b=$('#bsnd');if(b&&motionOn()){b.classList.remove('tap');void b.offsetWidth;b.classList.add('tap')}gest=true;if(window.Narr)window.Narr.setMuted(muted);if(!muted)blip(660,.1,.03)}
function hud(){if(st.mode==='title')return;var p=P(),r=A.rank,i=0,k;for(k=0;k<r.length;k++)if(p.xp>=r[k][0])i=k;var lo=r[i][0],hi=r[i+1]?r[i+1][0]:lo+1;
 var xp=p.xp;if(st.xpVis==null||!motionOn()||Math.abs(xp-(st.xpT<1?st.xpTo:st.xpVis))>500){st.xpVis=st.xpFrom=st.xpTo=xp;st.xpT=1}else if(xp!==st.xpTo){st.xpFrom=st.xpVis;st.xpTo=xp;st.xpT=0}
 $('#rk').textContent=E.rank()+(r[i+1]?' · next at '+hi+' XP':' · top rank');$('#xb').style.width=Math.min(100,r[i+1]?100*(p.xp-lo)/(hi-lo):100)+'%';
 $('#stt').innerHTML='<span id="xpn"'+(st.xpT<1?' class="xpup"':'')+'>'+Math.round(st.xpVis)+' XP</span><span class="flame">'+ic('flame',14)+' '+p.streak+'</span><span>'+E.doneCount()+'/'+NR+' regions</span>';
 [].forEach.call(document.querySelectorAll('#pm img'),function(im,k2){var on=levelDone(k2),was=im.classList.contains('on');im.classList.toggle('on',on);if(st.pmReady&&on&&!was){im.classList.remove('fresh');void im.offsetWidth;im.classList.add('fresh')}});st.pmReady=true;
 var o=objective(),qt=$('#qt'),prev=qt?qt.textContent:'';if(qt)qt.textContent=o.text;if(qt&&prev&&prev!==o.text){var qe=$('#quest');qe.classList.remove('ping');void qe.offsetWidth;qe.classList.add('ping')}st.obj=o}
/* r4: the region banner must not cover a figure (the gatekeeper stands right under it on arrival in a town).
   figRects() gives each NPC's screen box (head and name plate included). While the banner shows, it is checked every 120ms:
   if it overlaps a figure it moves to the other slot (.dodge, bottom on phones, lower on desktop); if both slots overlap it
   shrinks to a slim plaque (.mini) and leaves after 1.6s instead of 3.4s. */
function figRects(){var out=[],sc=st.scene;if(!sc||!sc.objs)return out;var z=zoom(),hw=S*.62*z,ht=(S*1.95+26)*z;
 sc.objs.forEach(function(o){if(o.type!=='npc')return;var p=scr(hx(o.c,o.r),hy(o.r),tileH(sc,o.c,o.r),0);out.push({role:o.role||'npc',name:o.name||'',l:p[0]-hw,t:p[1]-ht,r:p[0]+hw,b:p[1]+6*z})});
 var h=st.hero;if(h){var q=scr(h.x,h.y,heroH(),0);out.push({role:'hero',name:'',l:q[0]-hw,t:q[1]-ht+20*z,r:q[0]+hw,b:q[1]+6*z})}return out}
function bannerHits(a){var b=a.getBoundingClientRect();if(!b.width)return false;return figRects().some(function(f){return f.l<b.right-4&&f.r>b.left+4&&f.t<b.bottom-2&&f.b>b.top+2})}
function bannerDodge(){var a=$('#area');if(!a||!a.classList.contains('on'))return;
 if(a.classList.contains('mini'))return;if(!bannerHits(a))return;
 if(!a.classList.contains('dodge')){a.classList.add('dodge');if(!bannerHits(a))return}
 a.classList.add('mini');if(bannerHits(a)){a.classList.remove('dodge');}clearTimeout(st.bt);st.bt=setTimeout(function(){a.classList.remove('on')},1600)}
function showBanner(t,s){var a=$('#area');a.querySelector('.kicker').textContent=s||'';a.querySelector('b').textContent=t;a.classList.remove('dodge','mini');a.classList.add('on');clearTimeout(st.bt);clearInterval(st.bdi);
 var t0=Date.now();st.bdi=setInterval(function(){if(!a.classList.contains('on')||Date.now()-t0>3600){clearInterval(st.bdi);return}bannerDodge()},120);
 st.bt=setTimeout(function(){a.classList.remove('on')},3400)}
/* ---------- menus ---------- */
function nextTab(){var t=(A.tabs||[]).filter(function(x){return x.id==='next'})[0];return t||null}
function tabScreen(id){var t=(A.tabs||[]).filter(function(x){return x.id===id})[0];if(!t)return;openOv(function(){wrap('<div id="rd"></div><button class="btn btn-ghost rise" id="bk2">Back</button>');t.render($('#rd'),{award:E.award,save:E.save,toast:E.toast,P:P()});$('#bk2').onclick=closeOv})}
function extraTabBtns(){return (A.tabs||[]).filter(function(x){return x.id==='review'||x.id==='practice'||x.id==='scratch'||x.id==='party'||x.id==='satchel'||x.id==='gloss'||x.id==='primer'}).map(function(t){return '<button class="btn btn-ghost" data-m="tab:'+t.id+'">'+esc(t.label)+'</button>'}).join('')}
function readScreen(){var t=nextTab();if(!t)return;openOv(function(){wrap('<div id="rd"></div><button class="btn btn-ghost rise" id="bk2">Back</button>');t.render($('#rd'),{award:E.award,save:E.save,toast:E.toast,P:P()});$('#bk2').onclick=closeOv})}
function menu(){if(st.mode!=='play')return;openOv(function(){wrap('<section class="panel"><p class="kicker">Paused</p><h2>'+esc(A.title)+'</h2>'+coverFig()+'<div class="row" style="flex-direction:column"><button class="btn btn-primary" data-m="x">Resume</button><button class="btn btn-ghost" data-m="q">Quest log</button><button class="btn btn-ghost" data-m="m">World map</button><button class="btn btn-ghost" data-m="b">Badges</button><button class="btn btn-ghost" data-m="s">Skills map</button><button class="btn btn-ghost" data-m="h">How to play</button>'+(nextTab()?'<button class="btn btn-ghost" data-m="r">'+esc(nextTab().label)+'</button>':'')+extraTabBtns()+'<button class="btn btn-ghost" data-m="fx">Low effects: '+(FX.low?'On':'Off')+'</button><button class="btn btn-ghost" data-m="v">Save now</button><button class="btn btn-ghost" data-m="t">Title screen</button><a class="btn btn-ghost" href="../index.html">Back to the Atlas</a></div></section><p class="disc">'+esc(A.disclaimer)+'</p>');
  [].forEach.call($('#ovbody .row').children,function(el,i){el.style.animation='pop .2s ease backwards';el.style.animationDelay=(i*35)+'ms'});
  $('#ovbody').onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;var m=b.dataset.m;if(m==='x')closeOv();else if(m==='fx'){toggleFx(b)}else if(m==='v'){E.save();E.toast('Saved in this browser')}else if(m==='t'){closeOv();title()}else if(m.indexOf('tab:')===0){closeOv();tabScreen(m.slice(4))}else{closeOv();({q:questLog,m:mapScreen,b:badgeScreen,s:skillScreen,h:help,r:readScreen})[m]()}}})}
function toggleFx(b){FX.set(!FX.low);var all=[st.world].concat(Object.keys(st.scenes).map(function(k){return st.scenes[k]}));all.forEach(function(sc){if(sc){Art.paintScene(sc);if(sc.id==='w')mkFogCv(sc)}});fxl=null;st.cam.snap=true;redrawFog(true);b.textContent='Low effects: '+(FX.low?'On':'Off');E.toast(FX.low?'Low effects on: the plain map':'Low effects off: angled ground, cliffs and light')}
function badgeScreen(){openOv(function(){wrap('<section class="panel"><p class="kicker">Party chest</p><h2>Badges</h2><div id="bd"></div></section><button class="btn btn-ghost rise" id="bk2">Back</button>');E.badges($('#bd'));$('#bk2').onclick=closeOv})}
function skillScreen(){openOv(function(){wrap('<div id="sk"></div><button class="btn btn-ghost rise" id="bk2">Back</button>');E.skills($('#sk'));$('#bk2').onclick=closeOv})}
function help(){openOv(function(){wrap('<section class="panel"><p class="kicker">How to play</p><h2>Controls</h2>'+controls()+'<button class="btn btn-primary rise" id="bk2">Got it</button></section>');$('#bk2').onclick=closeOv})}
function controls(){return '<p class="dim small"><span class="kbd">←</span> <span class="kbd">→</span> <span class="kbd">↑</span> <span class="kbd">↓</span> or <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> walk the hex map (hold ← or → with ↑ or ↓ for exact diagonals). <span class="kbd">Enter</span>/<span class="kbd">Space</span>/<span class="kbd">E</span> talk or advance. <span class="kbd">M</span> map, <span class="kbd">J</span> quest log, <span class="kbd">Esc</span> menu. Click or tap any tile to walk there; tap a person or building to approach them. On touch screens use the pad and the A button.</p>'}
function questLog(){if(st.mode!=='play')return;openOv(function(){var o=objective(),w=PW(),rows=C.regions.map(function(R,i){var d=levelDone(i),cur=!d&&zoneOpen(i)&&(i===0||levelDone(i-1)),ic=d?IC2('ok'):cur?IC2('go'):IC2('lock');return '<div class="qrow" style="animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*35)+'ms"><div class="ic">'+ic+'</div>'+plateImg(A.levels[i]&&A.levels[i].id)+'<div class="qb"><b>'+esc(R.name)+'</b><div class="small dim">'+esc(A.levels[i].title)+(d?' · cleared':cur?' · current':' · locked')+(w.chests[i]?' · seal ✓':'')+'</div></div></div>'}).join('');
  wrap('<section class="panel"><p class="kicker">Quest log</p><h2>Next objective</h2><p>'+esc(o.text)+'</p>'+rows+'<div class="qrow" style="animation:pop .22s ease both;animation-delay:'+(Math.min(NR,10)*35)+'ms"><div class="ic">'+(bossDone()?IC2('ok'):allDone()?IC2('go'):IC2('lock'))+'</div>'+plateImg('citadel')+'<div class="qb"><b>'+esc(C.castle.name)+'</b><div class="small dim">'+esc(C.castle.boss.title)+'</div></div></div><p class="small dim" style="margin-top:12px">Supply caches found: '+Object.keys(w.caches).length+' of '+NR+'.</p><button class="btn btn-primary rise" id="bk2">Back to the map</button></section>');$('#bk2').onclick=closeOv})}
function mapScreen(){if(st.mode!=='play')return;openOv(function(){var wc=st.world,w=PW();
  wrap('<section class="panel"><p class="kicker">World map</p><canvas id="mf" class="mapfull" width="900" height="'+Math.round(900*wc.H/wc.W)+'"></canvas><div id="mr"></div><button class="btn btn-primary rise" id="bk2" style="margin-top:12px">Back</button></section>');
  var cv=$('#mf'),g=cv.getContext('2d'),k=cv.width/wc.W;g.drawImage(wc.cv,0,0,cv.width,cv.height);redrawFog(true);g.drawImage(wc.fogCv,0,0,cv.width,cv.height);
  g.textAlign='center';g.font='700 20px "Cormorant Garamond",Georgia,serif';NODES.forEach(function(nd,i){var x=hx(nd[0],nd[1])*k,y=hy(nd[1])*k,open=zoneOpen(i),tn=i<NR?C.regions[i].tint:C.castle.tint;g.fillStyle=open?(hexOk(tn)?tn:'#d7b56a'):'#6a6a70';g.beginPath();g.arc(x,y,7,0,7);g.fill();g.strokeStyle='#2a1d0a';g.lineWidth=2;g.stroke();if(open){var t=i<NR?C.regions[i].name:C.castle.name,tw=g.measureText(t).width+18;g.fillStyle='rgba(10,15,21,.92)';g.strokeStyle='#c8a86a';g.lineWidth=1.4;g.beginPath();if(g.roundRect)g.roundRect(x-tw/2,y-34,tw,24,6);else g.rect(x-tw/2,y-34,tw,24);g.fill();g.stroke();g.fillStyle='#f3e2b0';g.fillText(t,x,y-16)}});
  if(st.sid==='w')herePip(g,st.hero.x*k,st.hero.y*k,6);
  var nDone=0;for(var q=0;q<NR;q++)if(levelDone(q))nDone++;var here=st.sid==='w'?-1:(st.scene&&st.scene.i!=null?st.scene.i:-1);
  $('#mr').innerHTML='<div class="mr-head"><span>'+nDone+' of '+NR+' regions cleared</span><div class="bar"><i style="width:'+Math.round(100*nDone/NR)+'%"></i></div></div><div class="mr-grid">'+NODES.map(function(nd,i){var open=zoneOpen(i),done=i<NR?levelDone(i):bossDone(),tn=i<NR?C.regions[i].tint:C.castle.tint,sub=i<NR&&A.levels[i]?A.levels[i].title:'Final challenge',chip=done?'<span class="chip ok">'+IC2('ok')+' Cleared</span>':open?'<span class="chip go">Open</span>':'<span class="chip lock">'+IC2('lock')+' Locked</span>';return '<div class="qrow mr-card'+(done?' done':open?' open':' locked')+(i===here?' here':'')+'" style="--rt:'+(hexOk(tn)?tn:'#8a6528')+';animation:pop .22s ease both;animation-delay:'+(Math.min(i,10)*35)+'ms"><span class="mr-n">'+(i<NR?(i+1):'\u2605')+'</span>'+plateImg(i<NR&&A.levels[i]?A.levels[i].id:'citadel')+'<div class="qb"><b>'+esc(i<NR?C.regions[i].name:C.castle.name)+'</b><span class="mr-sub">'+esc(sub)+'</span>'+chip+(i===here?'<span class="chip here">You are here</span>':'')+'</div>'+(open?'<button class="btn btn-ghost" data-tv="'+i+'">Travel</button>':'')+'</div>'}).join('')+'</div>';
  $('#mr').onclick=function(e){var b=e.target.closest('[data-tv]');if(!b)return;var i=+b.dataset.tv;closeOv();st.scene=st.world;st.sid='w';var nd=NODES[i],pos=nd;for(var d=0;d<6;d++){var n=neigh(nd[0],nd[1],d);if(walkable(st.world,n[0],n[1])&&!st.world.omap[n[0]+','+n[1]]){pos=n;break}}enter('w',pos[0],pos[1])};
  $('#bk2').onclick=closeOv})}
function artKey(){var k=String(A.key||'');return /^[a-z0-9-]+$/.test(k)?k:''}
function plateImg(id){var k=artKey(),n=String(id||'');if(!k||!/^[A-Za-z0-9-]+$/.test(n))return '';return '<img class="plate" alt="" width="56" height="36" src="../assets/art/plates/'+k+'/'+n+'.svg" onerror="this.remove()">'}
function paintWorldArt(){var k=artKey();if(!k)return;document.body.dataset.world=k;document.documentElement.style.setProperty('--world-bg','url("../assets/art/bg/'+k+'.svg")')}
function coverFig(){var k=artKey();if(!k)return '';return '<figure class="world-cover"><img src="../assets/art/covers/'+k+'.svg" alt="" width="640" height="360"></figure>'}
function title(){st.mode='title';document.body.classList.add('intitle');paintWorldArt();var t=$('#ttl'),p=P(),has=!!p.w||p.xp>0||E.doneCount()>0,v1=!p.w&&(p.xp>0||E.doneCount()>0);
 t.style.display='flex';
 var legend=C.regions.map(function(R){return '<i style="background:'+(hexOk(R.tint)?R.tint:'#d7b56a')+'"></i>'}).join('')+'<i style="background:'+(hexOk(C.castle.tint)?C.castle.tint:'#c9a24f')+'"></i>';
 t.innerHTML='<section class="panel">'+coverFig()+'<p class="kicker">The Wanderer\u2019s Atlas · '+esc(A.kicker)+'</p><h1>'+esc(A.title)+'</h1><p class="dim">'+esc(A.tagline.split('.')[0])+'. Walk a painted map, meet teachers, face gatekeepers and open chests.</p><p class="legend" aria-hidden="true">'+legend+'</p><div class="rule"></div>'
 +(has?'<button class="btn btn-primary" id="tc" style="margin-bottom:10px;animation:pop .28s ease backwards">Continue'+(v1?' (version 1 progress found: '+E.doneCount()+' of '+NR+' levels cleared, '+p.xp+' XP)':'')+'</button>':'<button class="btn btn-primary" id="tn" style="margin-bottom:10px;animation:pop .28s ease backwards">Begin your journey</button>')
 +(has?'<button class="btn btn-ghost" id="tn" style="margin-bottom:10px;animation:pop .28s ease backwards;animation-delay:.08s">New journey (erases saved progress)</button>':'')
 +'<a class="btn btn-ghost" href="../index.html" style="margin-bottom:12px;animation:pop .28s ease backwards;animation-delay:.16s">Back to the Atlas</a>'+controls()+'<p class="small dim">Progress saves in this browser only and is never sent anywhere.</p><p class="disc">'+esc(A.disclaimer)+'</p></section>';
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
function mkSoft(rad){var c=document.createElement('canvas');c.width=c.height=Math.ceil(rad*2);var g=c.getContext('2d'),gr=g.createRadialGradient(rad,rad,0,rad,rad,rad);gr.addColorStop(0,'rgba(58,74,112,.97)');gr.addColorStop(.4,'rgba(58,74,112,.84)');gr.addColorStop(.7,'rgba(58,74,112,.36)');gr.addColorStop(1,'rgba(58,74,112,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);return c}
var blobMode=null;
function redrawFog(force){var sc=st.world;if(blobMode!==FX.low||!blobA){blobMode=FX.low;blobA=FX.low?mkBlob(S*1.25,'rgba(26,34,46,.95)','rgba(26,34,46,0)'):mkSoft(S*1.7);blobB=mkBlob(S*1.1,'rgba(200,212,236,.38)','rgba(200,212,236,0)')}
 var fk=sc.fogK||1,fr=FX.low?S*1.25:S*1.7;
 var g=sc.fogCv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,sc.fogCv.width,sc.fogCv.height);g.setTransform(fk,0,0,fk,0,0);for(var r=0;r<sc.rows;r++)for(var c=0;c<sc.cols;c++){var a=st.fog[sc.zone[c][r]];if(a<=.01)continue;var x=hx(c,r),y=hy(r);g.globalAlpha=a;g.drawImage(blobA,x-fr,y-fr);if(Art.hash(c,r,2)<.6){g.globalAlpha=a*.8;g.drawImage(blobB,x-S*1.1+(Art.hash(c,r,3)-.5)*S,y-S*1.1+(Art.hash(c,r,4)-.5)*S)}}g.globalAlpha=1;g.setTransform(1,0,0,1,0,0);paintFogView(sc)}
/* Fog sits on the raised caps, with a second blob down a tall cliff so the face stays covered. */
function paintFogView(sc){if(FX.low||!sc.view){sc.fogView=null;return}var cv=sc.fogView,fw=Math.ceil(sc.view.width/2),fh=Math.ceil(sc.view.height/2);if(!cv||cv.width!==fw||cv.height!==fh){cv=sc.fogView=document.createElement('canvas');cv.width=fw;cv.height=fh}var g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(.5,0,0,.5,0,0);/* r6: half size (soft blobs), a quarter of the memory */var ox=sc.viewOx,oy=sc.viewOy,rad=S*1.7;for(var r=0;r<sc.rows;r++)for(var c=0;c<sc.cols;c++){var a=st.fog[sc.zone[c][r]];if(a<=.01)continue;var h=Art.groundH(sc.t[c][r]),p=Art.project(hx(c,r),hy(r),h),x=ox+p.x,y=oy+p.y;g.globalAlpha=a;g.drawImage(blobA,x-rad,y-rad);if(h>8)g.drawImage(blobA,x-rad,y-rad+h*.55)}g.globalAlpha=1}
/* ---------- main loop / drawing ---------- */
var cv,ctx,dpr=1,CW=0,CH=0,mm,mmg,mmBg=null,vig=null;
function vigLayer(){if(vig&&vig.w===CW&&vig.h===CH)return vig.c;var c=document.createElement('canvas');c.width=Math.max(1,Math.round(CW));c.height=Math.max(1,Math.round(CH));var vg=c.getContext('2d'),r0=Math.min(CW,CH)*.35,r1=Math.max(CW,CH)*.75,gr=vg.createRadialGradient(CW/2,CH/2,r0,CW/2,CH/2,r1);gr.addColorStop(0,'rgba(8,10,16,0)');gr.addColorStop(1,'rgba(8,10,16,.55)');vg.fillStyle=gr;vg.fillRect(0,0,CW,CH);vig={w:CW,h:CH,c:c};return c}
function resize(){var r=$('#stage').getBoundingClientRect();dpr=window.LQPerf?LQPerf.dpr(r.width,r.height):Math.min(2,window.devicePixelRatio||1);/* r6: adaptive pixel ratio on phones, held under iOS's canvas limit */CW=r.width;CH=r.height;cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr)}
function zoom(){return Math.max(.8,Math.min(1.35,Math.min(CW,CH)/640))}
function fogBusy(){for(var z=0;z<st.fog.length;z++)if(Math.abs((st.fog[z]||0)-(st.fogTgt[z]||0))>.01)return true;return false}
function markAct(){var h=st.hero;if(!h)return;var key=(st.scene?st.scene.id:'')+'|'+h.c+'|'+h.r+'|'+st.mode+'|'+(motionOn()?1:0);if(key===st.actKey)return;st.actKey=key;var on=false,d,n,ob;st.actObj=null;if(st.mode==='play'&&st.scene){for(d=0;d<6&&!on;d++){n=neigh(h.c,h.r,d);ob=objAt(n[0],n[1]);if(interactive(ob)){on=true;st.actObj=ob}}}var ba=$('#bact');if(ba)ba.classList.toggle('ready',on&&motionOn())}
function stepHov(dt){var want=st.mode==='play'?st.hov:null,on=motionOn(),k=1-Math.pow(0.82,Math.min(3,(dt||1/60)*60));
 if(!want){if(!on||!(st.hovA>0)){st.hovA=0;return}st.hovA+=-st.hovA*k;if(st.hovA<0.03)st.hovA=0;return}
 if(!st.hovTile||st.hovTile.c!==want.c||st.hovTile.r!==want.r)st.hovTile={c:want.c,r:want.r};
 if(!on){st.hovA=1;return}st.hovA+=(1-(st.hovA||0))*k;if(st.hovA>0.98)st.hovA=1}
function drawHov(g){if(!(st.hovA>0.02)||!st.hovTile)return;g.save();g.globalAlpha=.45*st.hovA;g.fillStyle='rgba(243,226,176,.45)';hexAt(g,st.hovTile.c,st.hovTile.r,S*.9);g.fill();g.globalAlpha=.8*st.hovA;g.strokeStyle='#f3e2b0';g.lineWidth=1.6;g.stroke();g.restore()}
function update(dt){st.time+=dt;stepHov(dt);if(st.shake>0)st.shake=Math.max(0,st.shake-dt);if(st.veil>0)st.veil=Math.max(0,st.veil-dt*2.4);
 if(st.hero.turn>0)st.hero.turn=Math.max(0,st.hero.turn-dt/.14);
 var hh=st.hero;if(hh.land>0)hh.land=Math.max(0,hh.land-dt/.24);if(hh.settle>0)hh.settle=Math.max(0,hh.settle-dt/.8);if(hh.poke>0)hh.poke=Math.max(0,hh.poke-dt/.32);
 if(st.scene&&st.scene.id!=='w')stepCritters(st.scene,dt);
 if(st.rip){st.rip.t+=dt;if(st.rip.t>.42)st.rip=null}
 if(st.xpT<1){st.xpT=Math.min(1,st.xpT+dt/.48);var eu=st.xpT*st.xpT*(3-2*st.xpT),en=Math.round(st.xpFrom+(st.xpTo-st.xpFrom)*eu);if(en!==st.xpVis){st.xpVis=en;var xe=$('#xpn');if(xe)xe.textContent=en+' XP'}}
 var ch=false;for(var z=0;z<st.fog.length;z++){var t=st.fogTgt[z]=zoneOpen(z)?0:1;if(st.fog[z]!==t){st.fog[z]+=Math.sign(t-st.fog[z])*Math.min(Math.abs(t-st.fog[z]),dt*.7);ch=true}}if(ch)redrawFog();
 if(!st.seenOpen){st.seenOpen=[];for(var z0=0;z0<st.fog.length;z0++)st.seenOpen[z0]=st.fogTgt[z0]===0?1:0}
 else if(st.scene&&st.scene.id==='w'){for(var z3=0;z3<st.fog.length;z3++){if(st.fogTgt[z3]!==0||st.seenOpen[z3]||!NODES[z3])continue;st.seenOpen[z3]=1;if(motionOn()&&st.time>.45&&window.LQAnim){var ox=hx(NODES[z3][0],NODES[z3][1]),oy=hy(NODES[z3][1]);if(useView()){var vq=toView(ox,oy,tileH(st.scene,NODES[z3][0],NODES[z3][1]),0);ox=vq.x;oy=vq.y}LQAnim.burst(ox,oy-S*.3);if(LQAnim.floatText)LQAnim.floatText(ox,oy-S*2.15,'Open')}}}
 if(st.mode==='dlg')typeTick(dt);
 var h=st.hero;if(st.mode!=='play'&&st.mode!=='title'&&!h.mv)return;
 var spd=.14/st.speed;
 if(h.mv){var m=h.mv;m.t+=dt/spd;var u=Math.min(1,m.t),k=u*u*(3-2*u);h.x=m.fx+(m.tx-m.fx)*k;h.y=m.fy+(m.ty-m.fy)*k;h.step=u;h.hop=motionOn()?Math.sin(u*Math.PI)*5.5:0;if(m.t>=1)finishStep()}
 if(!h.mv&&st.mode==='play'){var dd=dirFromKeys();
  if(dd){st.path=null;for(var i=0;i<dd.length;i++){var res=stepDir(dd[i]);if(res==='moved'){if(dd.length===2)st.zig=!st.zig;break}if(res==='bump')break}}
  else if(st.path&&st.path.length){var nx=st.path[0],d=dirTo([h.c,h.r],nx);if(d<0){st.path=null}else{var rs=stepDir(d);if(rs==='moved')st.path.shift();else st.path=null}}}
 markAct()}
/* r4 characters: per-NPC idle habit (from the name), a greeting hop after a talk, and the gatekeeper entrance.
   The entrance plays once per town visit the first time the hero comes within four tiles. Quiet mode skips all of it. */
var HABIT={teacher:[4,0,4,1],guide:[0,1,5,3]};
function npcAnim(o,op,bossy,T){var mo=motionOn();
 if(o._habit==null){var hh=0,nm=String(o.name||'');for(var i=0;i<nm.length;i++)hh=(hh*31+nm.charCodeAt(i))|0;hh=Math.abs(hh);var pool=HABIT[o.role];o._habit=pool?pool[hh%pool.length]:hh%6}
 op.habit=o._habit;op.greet=mo&&o._greet!=null?Math.max(0,1-(st.time-o._greet)/.42):0;
 if(bossy){op.boss=1;var sc=st.scene;op.accent=(sc&&sc.i<NR&&C.regions[sc.i]&&hexOk(C.regions[sc.i].accent))?C.regions[sc.i].accent:'#d7b56a';if(sc){op.motif=sc.motif;op.biome=sc.i<NR?bio(sc.i):'crown';op.gid=sc.i}/* r5: one gatekeeper design per region */
  if(!mo){op.ent=1;return}var h=st.hero;if(o._ent==null&&Art.hdist(h.c,h.r,o.c,o.r)<=4)o._ent=st.time;op.ent=o._ent==null?0:(st.time-o._ent)/1.25}}
/* r4 critters: a few friendly animals per town (bunnies, birds, butterflies, frogs, snow hares by biome). They nibble, peck and flutter,
   hop or fly a short way off when the hero comes close, then settle. Positions stay inside the town's open tiles. Quiet mode holds them still. */
var CRITS={meadow:['bunny','bird','butterfly','butterfly','bird'],forest:['bunny','bird','butterfly','bunny'],hills:['bird','bunny','butterfly','bird'],desert:['bird','butterfly','bird'],tundra:['hare','bird','hare'],marsh:['frog','frog','butterfly','bird'],highland:['bird','bunny','butterfly','hare'],crown:['butterfly','bird','butterfly','bunny']};
function critSpots(sc){var out=[],seen={},k,c,r;for(k=0;k<400&&out.length<40;k++){c=Math.floor(Art.hash(k,sc.i,71)*sc.cols);r=Math.floor(Art.hash(k,sc.i,73)*sc.rows);var key=c+','+r;if(seen[key])continue;seen[key]=1;
  if(!sc.pass[c][r]||sc.omap[key])continue;var near=false;for(var d=0;d<6;d++){var nb=neigh(c,r,d);if(sc.omap[nb[0]+','+nb[1]]){var ob=sc.omap[nb[0]+','+nb[1]];if(ob.type==='npc'||ob.type==='building'||ob.type==='gate'){near=true;break}}}if(near)continue;out.push([c,r])}return out}
function spawnCritters(sc){if(sc.critters||sc.id==='w')return;var b=sc.i<NR?bio(sc.i):'crown',kinds=CRITS[b]||CRITS.meadow,spots=critSpots(sc),list=[];
 for(var i=0;i<kinds.length&&i<spots.length;i++){var sp=spots[(i*7)%spots.length],x=hx(sp[0],sp[1])+(Art.hash(i,sc.i,5)-.5)*S*.5,y=hy(sp[1])+(Art.hash(i,sc.i,6)-.3)*S*.4;
  list.push({kind:kinds[i],x:x,y:y,hx:x,hy:y,c:sp[0],r:sp[1],face:Art.hash(i,sc.i,9)<.5?1:-1,seed:i+sc.i*3,mode:'idle',tm:.6+Art.hash(i,sc.i,8)*2.4,hop:0,nib:0,fly:0,mv:null,spots:spots})}
 sc.critters=list}
function critGo(cr,tx,ty,dur,arc){cr.mv={fx:cr.x,fy:cr.y,tx:tx,ty:ty,u:0,dur:dur,arc:arc};if(Math.abs(tx-cr.x)>1)cr.face=tx>cr.x?1:-1}
function critFree(sc,x,y){var p=Art.px2hex(x,y);return inb(sc,p[0],p[1])&&sc.pass[p[0]][p[1]]&&!sc.omap[p[0]+','+p[1]]}
function stepCritters(sc,dt){spawnCritters(sc);var L=sc.critters;if(!L||!motionOn())return;var h=st.hero,T=st.time;
 for(var i=0;i<L.length;i++){var cr=L[i],dx=cr.x-h.x,dy=cr.y-h.y,dh=Math.sqrt(dx*dx+dy*dy)||1;
  if(cr.kind==='butterfly'){var away=dh<S*1.4?S*.5:0;cr.x=cr.hx+Math.sin(T*.8+cr.seed)*S*.55+dx/dh*away;cr.y=cr.hy+Math.sin(T*1.15+cr.seed*2)*S*.28+dy/dh*away*.5;cr.face=Math.cos(T*.8+cr.seed)>0?1:-1;continue}
  if(cr.mv){var m=cr.mv;m.u=Math.min(1,m.u+dt/m.dur);var e=cr.kind==='bird'?m.u*m.u*(3-2*m.u):m.u;cr.x=m.fx+(m.tx-m.fx)*e;cr.y=m.fy+(m.ty-m.fy)*e;cr.hop=Math.sin(m.u*Math.PI)*m.arc;cr.fly=cr.kind==='bird'?Math.min(1,Math.sin(m.u*Math.PI)*3):0;
   if(m.u>=1){cr.mv=null;cr.hop=0;cr.fly=0;var pc=Art.px2hex(cr.x,cr.y);cr.c=pc[0];cr.r=pc[1];if(cr.kind==='bird'){cr.hx=cr.x;cr.hy=cr.y}cr.tm=.8+Math.random()*2.2}continue}
  cr.nib=cr.kind==='bird'?Math.max(0,Math.sin(T*7+cr.seed))*(((T+cr.seed)%3)<1.2?1:0):cr.kind==='frog'?0:Math.max(0,Math.sin(T*3+cr.seed))*.6;
  var scared=dh<S*(cr.kind==='bird'?1.9:1.45);
  if(scared){if(cr.kind==='bird'){var sp=cr.spots[Math.floor(Math.random()*cr.spots.length)],tx=hx(sp[0],sp[1]),ty=hy(sp[1]);if(Math.hypot(tx-h.x,ty-h.y)<S*3){tx=cr.x+dx/dh*S*3;ty=cr.y+dy/dh*S*2}critGo(cr,tx,ty,1.1,S*1.3)}
   else{var fx=cr.x+dx/dh*S*.75,fy=cr.y+dy/dh*S*.5;if(!critFree(sc,fx,fy)){fx=cr.x-dy/dh*S*.6;fy=cr.y+dx/dh*S*.4}if(critFree(sc,fx,fy))critGo(cr,fx,fy,cr.kind==='frog'?.36:.24,cr.kind==='frog'?11:7);else cr.tm=.3}continue}
  cr.tm-=dt;if(cr.tm>0)continue;
  if(cr.kind==='bird'){cr.tm=1+Math.random()*2;if(Math.random()<.5){var bx=cr.x+(Math.random()-.5)*S*.5,by=cr.y+(Math.random()-.5)*S*.3;if(critFree(sc,bx,by))critGo(cr,bx,by,.18,3)}continue}
  var ang=Math.random()*Math.PI*2,rr=S*(.25+Math.random()*.35),tx2=cr.hx+Math.cos(ang)*rr,ty2=cr.hy+Math.sin(ang)*rr*.6;
  if(Math.hypot(cr.x-cr.hx,cr.y-cr.hy)>S*.9){tx2=cr.x+(cr.hx-cr.x)*.5;ty2=cr.y+(cr.hy-cr.y)*.5}
  if(critFree(sc,tx2,ty2))critGo(cr,tx2,ty2,cr.kind==='frog'?.42:.3,cr.kind==='frog'?10:6);cr.tm=1.2+Math.random()*2.6}}
/* the quest arrow over a gatekeeper floats above the taller figure and its name */
function bossLift(sc,c){var b=sc.omap&&sc.omap[c.c+','+c.r];return b&&(b.role==='gate'||b.role==='boss')?S*.8:0}
var crOp={};
function drawCritter(g,cr,view,z,cx,cy,T){crOp.kind=cr.kind;crOp.t=T;crOp.face=cr.face;crOp.hop=cr.hop;crOp.nib=cr.nib;crOp.fly=cr.fly;crOp.seed=cr.seed;
 if(view){var p=toView(cr.x,cr.y,tileH(st.scene,cr.c,cr.r),0);upright(g,z,cx,cy,p.x,p.y);Art.critter(g,0,0,crOp);camXform(g,z,cx,cy)}else Art.critter(g,cr.x,cr.y,crOp)}
function figDraw(g,sp,x,y,o){Art.figure(g,x,y,sp.look||sp,o)}
/* Point lights for the WebGL pass. World pixels. Priority 0 is kept first (the hero). */
var lights=[],shadows=[],ldx=0,ldy=0;
/* In the angled view, lights and shadows sit on the projected anchor of the object that owns them. */
function lshift(dx,dy){ldx=dx;ldy=dy}
var MARK={
 'python-basics':{dy:0.06,r:68,c:[0.36,0.26,0.07]},
 'ai-foundations':{dy:-0.16,r:78,c:[0.4,0.3,0.1]},
 'ai-evals':{dy:-1.01,r:64,c:[0.38,0.28,0.08]},
 'ai-safety':{dy:-1.01,r:80,c:[0.38,0.28,0.1]},
 'portfolio-guide':{dy:-0.92,r:76,c:[0.38,0.28,0.08]}
};
function addLight(x,y,r,col,pri,k){lights.push({x:x+ldx,y:y+ldy,r:r,c:col,p:pri==null?5:pri,k:k|0})}/* k (r6): 0 pool, 1 window, 2 flame, 3 glow (see fx2.js) */
function addShadow(x,y,keep,k){var u=S/34*(k||1);shadows.push({x:x+ldx+9*u,y:y+ldy+S*.38+4.2*u,r:15*u,keep:!!keep})}
function lamp(o,x,y,op){var k=o.kind;
 if(o.type==='chest'){addShadow(x-S*.05,y-S*.12,false,1.25);if(op.glow){addLight(x,y+S*.42,58,[0.15,0.1,0.03],1);addLight(x,y-S*.2,22,[0.2,0.15,0.05],6,3)}else if(op.open)addLight(x,y+S*.42,30,[0.1,0.07,0.02],4);return}
 if(k==='gate'){addLight(x-S*.62,y-S*.15,34,[0.34,0.2,0.05],4,2);addLight(x+S*.62,y-S*.15,34,[0.34,0.2,0.05],4,2);return}/* torches on the gate posts */
 if(k==='fountain'){addLight(x,y+S*.1,46,[0.06,0.13,0.2],5);return}/* cool water light */
 if(o.landmark){var m=MARK[A.key]||{dy:-0.45,r:78,c:[0.42,0.32,0.12]};addLight(x,y+m.dy*S,m.r,m.c,2,3);addLight(x,y+S*.4,m.r*1.25,[m.c[0]*.32,m.c[1]*.32,m.c[2]*.32],6);addShadow(x-S*.08,y-S*.05,false,1.5);return}/* a wide low spill on the ground under the lamp */
 if(k==='smithy')addLight(x-6,y+S*.5-8,70,[0.62,0.24,0.05],2,2);
 else if(k==='tower'){addLight(x,y+S*.5-46,52,[0.48,0.36,0.12],2,1);addLight(x,y+S*.5-90,28,[0.5,0.4,0.14],3,3)}
 else if(k==='hall'&&op.lit)addLight(x,y+S*.5-12,68,[0.46,0.32,0.1],2,1);
 else if(k==='great'&&op.lit)addLight(x,y+S*.5-16,80,[0.48,0.34,0.1],2,1);
 else if(k==='castle')addLight(x,y-S*.7,100,[0.42,0.3,0.1],3,1);
 else if(k==='vault')addLight(x,y+S*.5-12,48,[0.4,0.32,0.12],3,3);
 else if(k==='cache')addLight(x,y-S*.2,30,[0.42,0.32,0.1],4,3);
 else if(k==='town'||o.type==='node')addLight(x,y-S*.35,44,[0.3,0.22,0.08],5)}
function packLights(cx,cy,z){var sc=z*dpr,i,L,sx,sy,rr,out=[],sh=[];
 for(i=0;i<lights.length;i++){L=lights[i];sx=(L.x-cx)*sc;sy=(L.y-cy)*sc;rr=L.r*sc;if(sx<-rr||sy<-rr||sx>cv.width+rr||sy>cv.height+rr)continue;
  var dx=sx-cv.width*.5,dy=sy-cv.height*.5;out.push({x:sx,y:sy,r:rr,c:L.c,p:L.p,k:L.k,d:dx*dx+dy*dy})}
 var lim=window.LQLight&&LQLight.limits?LQLight.limits():{lights:12,shadows:8};out.sort(function(a,b){return a.p-b.p||a.d-b.d});if(out.length>lim.lights)out.length=lim.lights;
 for(i=0;i<shadows.length;i++){L=shadows[i];sx=(L.x-cx)*sc;sy=(L.y-cy)*sc;rr=Math.max(8,L.r*sc);if(sx<-rr||sy<-rr||sx>cv.width+rr||sy>cv.height+rr)continue;
  sh.push({x:sx,y:sy,r:rr,k:L.keep?0:1,d:(sx-cv.width*.5)*(sx-cv.width*.5)+(sy-cv.height*.5)*(sy-cv.height*.5)})}
 sh.sort(function(a,b){return a.k-b.k||a.d-b.d});if(sh.length>lim.shadows)sh.length=lim.shadows;return {lights:out,shadows:sh}}
function useView(){return !FX.low&&!(FX.rm&&FX.rm.matches)&&st.scene&&st.scene.view}/* reduced motion uses the flat map */
function tileH(sc,c,r){return inb(sc,c,r)?Art.groundH(sc.t[c][r]):0}
function heroH(){var sc=st.scene,h=st.hero,a=tileH(sc,h.c,h.r);if(!h.mv)return a;var k=Math.max(0,Math.min(1,h.mv.t));return a+(tileH(sc,h.mv.c,h.mv.r)-a)*k}
/* Top-down pixel on terrain height h, then `up` upright pixels toward the top of the screen. */
function toView(x,y,h,up){var p=Art.project(x,y,h||0);return {x:p.x+st.scene.viewOx,y:p.y+st.scene.viewOy-(up||0)}}
function camXform(g,z,cx,cy){g.setTransform(dpr*z,0,0,dpr*z,-cx*dpr*z,-cy*dpr*z)}
function upright(g,z,cx,cy,vx,vy){g.setTransform(dpr*z,0,0,dpr*z,(vx-cx)*dpr*z,(vy-cy)*dpr*z)}
/* Click in view-canvas pixels. A cap is tested on its own height plane so a mountain top is not the tile to its north. */
function pickAt(vx,vy){var sc=st.scene,wx=vx-sc.viewOx,wy=vy-sc.viewOy,guess=Art.unproject(wx,wy),ctr=Art.px2hex(guess.x,guess.y),hits=[],dr,dc,c,r,h,x,y,hit,best=ctr,bestD=1e9,p,dx,dy,d;
 /* A tall cap can overlap the tile to its north. The southern tile is drawn later, so it wins. */
 for(dr=-3;dr<=3;dr++)for(dc=-3;dc<=3;dc++){c=ctr[0]+dc;r=ctr[1]+dr;if(!inb(sc,c,r))continue;h=Art.groundH(sc.t[c][r]);y=(wy+h)/Art.CAM.v;x=wx-Art.CAM.shear*y;hit=Art.px2hex(x,y);if(hit[0]===c&&hit[1]===r)hits.push([c,r,hy(r)])}
 if(hits.length){hits.sort(function(a,b){return b[2]-a[2]});return [hits[0][0],hits[0][1]]}
 for(dr=-3;dr<=3;dr++)for(dc=-3;dc<=3;dc++){c=ctr[0]+dc;r=ctr[1]+dr;if(!inb(sc,c,r))continue;h=Art.groundH(sc.t[c][r]);p=Art.project(hx(c,r),hy(r),h);dx=p.x-wx;dy=p.y-wy;d=dx*dx+dy*dy;if(d<bestD){bestD=d;best=[c,r]}}return best}
/* Dots march along a tapped route. The destination ring and the tap ripple draw later, on top of sprites and under the fog. */
var routePts=[];function drawRoute(g,rings){if(st.mode!=='play')return;if(!rings){var pth=st.path;if(!pth||!pth.length)return;var i,dx,dy,len,acc,x,y,n=0,step=14,march=motionOn()?(st.time*34)%step:7,p,npts=0;
 p=routePts[0]||(routePts[0]=[0,0]);p[0]=st.hero.x;p[1]=st.hero.y;npts=1;
 for(i=0;i<pth.length;i++){p=routePts[npts]||(routePts[npts]=[0,0]);p[0]=hx(pth[i][0],pth[i][1]);p[1]=hy(pth[i][1]);npts++}
 routePts.length=npts;
 g.save();g.fillStyle='#f3e2b0';acc=-march;
 for(i=1;i<npts;i++){dx=routePts[i][0]-routePts[i-1][0];dy=routePts[i][1]-routePts[i-1][1];len=Math.sqrt(dx*dx+dy*dy)||1;
  while(acc+step<=len&&n<48){acc+=step;x=routePts[i-1][0]+dx*(acc/len);y=routePts[i-1][1]+dy*(acc/len);var vp=vpt(x,y);g.globalAlpha=.5;g.beginPath();g.arc(vp[0],vp[1],2.1,0,6.283185);g.fill();n++}acc-=len}
 g.restore();return}
 if(st.path&&st.path.length){var last=st.path[st.path.length-1],pulse=motionOn()?.5+.5*Math.sin(st.time*5):.55;g.save();g.globalAlpha=.4+.25*pulse;g.strokeStyle='#f3e2b0';g.lineWidth=2;hexAt(g,last[0],last[1],S*(.58+.12*pulse));g.stroke();g.restore()}
 if(st.rip&&motionOn()){var a=1-st.rip.t/.42;g.save();g.globalAlpha=Math.max(0,a)*.65;g.strokeStyle='#f3e2b0';g.lineWidth=2;hexAt(g,st.rip.c,st.rip.r,S*(.3+st.rip.t*1.6));g.stroke();g.restore()}}
var drawList=[],drawOp={},emptyW={chests:{},caches:{}};function byY(a,b){return a.y-b.y}
function chestPool(g,x,y,a){if(a<=.02)return;var rg=g.createRadialGradient(x,y-S*.1,S*.25,x,y,S*1.35);rg.addColorStop(0,'rgba(255,236,170,'+(.5*a)+')');rg.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=rg;g.beginPath();g.ellipse(x,y+S*.12,S*1.15,S*.42,0,0,6.283185);g.fill()}
/* Route dots, tap ripple and hover ring follow the ground in the angled view. */
function vpt(x,y){if(!useView())return [x,y];var hh=Art.px2hex(x,y),p=toView(x,y,tileH(st.scene,hh[0],hh[1]),0);return [p.x,p.y]}
function hexAt(g,c,r,rad){if(!useView()){Art.hexPath(g,hx(c,r),hy(r),rad);return}var sc=st.scene,th=tileH(sc,c,r),xx=hx(c,r),yy=hy(r),pk,ang,q;g.beginPath();
 for(pk=0;pk<6;pk++){ang=(60*pk-30)*Math.PI/180;q=Art.project(xx+rad*Math.cos(ang),yy+rad*Math.sin(ang),th);pk?g.lineTo(q.x+sc.viewOx,q.y+sc.viewOy):g.moveTo(q.x+sc.viewOx,q.y+sc.viewOy)}g.closePath()}
/* Atmosphere for the GL pass: the biome under the hero (overworld) or the town's biome, the camera's top-left in world px, and the clock (held at 0 when calm). */
function atmOpts(world,sc,h,cx,cy,z){var zb=world&&sc.zone[h.c]?sc.zone[h.c][h.r]:null,b=world?bio(zb==null||zb<0?0:zb):(sc.biome||'meadow');var ri=world?(zb==null||zb<0?0:zb):(sc.i==null?0:sc.i);return {biome:b,late:NR>1?ri/(NR-1):0,cam:[cx,cy],scale:z*dpr,t:motionOn()?st.time:0,calm:!motionOn()}}/* late (r6): course progress of this region, for the mood */
function draw(){if(!st.scene)return;var sc=st.scene,z=zoom(),vw=CW/z,vh=CH/z,h=st.hero,g=ctx,view=useView();lights.length=0;shadows.length=0;ldx=0;ldy=0;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a0f15';g.fillRect(0,0,cv.width,cv.height);
 var tx,ty,camW,camH,sway=motionOn()?Math.sin(st.time*.2)*40:0;
 if(view){var feet=toView(h.x,h.y+S*.38,heroH(),0),bias=CW>=560?vh*.06:0;tx=feet.x-vw/2;ty=feet.y-vh/2-bias;
  if(st.mode==='title'&&sc.id==='w'){var nd0=NODES[0],tp=toView(hx(nd0[0],nd0[1]),hy(nd0[1]),tileH(sc,nd0[0],nd0[1]),0);tx=tp.x-vw/2+sway;ty=tp.y-vh/2}
  camW=sc.view.width;camH=sc.view.height}
 else{tx=h.x-vw/2;ty=h.y-vh/2;if(st.mode==='title'&&sc.id==='w'){tx=hx(NODES[0][0],NODES[0][1])-vw/2+sway;ty=hy(NODES[0][1])-vh/2}camW=sc.W;camH=sc.H}
 var mx=camW-vw,my=camH-vh,hp=window.LQHudPad,pt=hp&&hp.on?hp.t/z:0,pb=hp&&hp.on?hp.b/z:0;tx=mx<0?mx/2:Math.max(0,Math.min(mx,tx));var lim=my+pb;if(hp&&hp.on&&hp.bt){var fy=view?feet.y:h.y+S*.38;lim=Math.max(my,fy-(hp.bt-16)/z)}/* phone band: only as much night under the island as keeps the hero's feet 16px above the d-pad */
 ty=my<0?my/2:Math.max(-pt,Math.min(lim,ty));/* phone: camera may scroll past the map edge by the HUD height (guide.js) so the hero never sits under the HUD */
 if(st.cam.snap){st.cam.x=tx;st.cam.y=ty;st.cam.snap=false}else{var ck=1-Math.pow(0.82,Math.min(3,(st.dtRaw||1/60)*60));st.cam.x+=(tx-st.cam.x)*ck;st.cam.y+=(ty-st.cam.y)*ck}
 st.cam.err=Math.abs(tx-st.cam.x)+Math.abs(ty-st.cam.y);
 var shx=0,shy=0;if(st.shake>0&&motionOn()){var a=st.shake/.16;shx=Math.sin(st.time*62)*5*a;shy=Math.cos(st.time*48)*2.5*a}if(window.LQFeel&&motionOn()){shx+=LQFeel.off.x;shy+=LQFeel.off.y}
 var cx=st.cam.x+shx,cy=st.cam.y+shy;camXform(g,z,cx,cy);
 if(view){g.drawImage(sc.view,0,0);if(window.LQAnim)LQAnim.water(g,sc,st.time,cx,cy,vw,vh,function(x,y){var p=Art.project(x,y,0);return [p.x+sc.viewOx,p.y+sc.viewOy]})}
 else{g.drawImage(sc.cv,0,0);if(!FX.low&&window.LQAnim){LQAnim.water(g,sc,st.time,cx,cy,vw,vh);if(LQAnim.pools)LQAnim.pools(g,sc,st.time,cx,cy,vw,vh)}}/* lamplight pools: flat map only; the angled view lights buildings with the GL point lights */
 drawRoute(g,false);drawHov(g);if(window.LQFeel)LQFeel.groundPass(g,sc,st.time,cx,cy,vw,vh,!!view);
 var n=0,T=st.time,world=sc.id==='w',cur=st.obj&&st.obj.target,objs=sc.objs,i,o,oy,ox,it,cp;
 for(i=0;i<objs.length;i++){o=objs[i];if(world&&!zoneOpen(sc.zone[o.c][o.r])&&st.fog[sc.zone[o.c][o.r]]>.8)continue;oy=hy(o.r);ox=hx(o.c,o.r);
  if(view){cp=toView(ox,oy,tileH(sc,o.c,o.r),0);if(cp.x<cx-140||cp.x>cx+vw+140||cp.y<cy-220||cp.y>cy+vh+140)continue}else if(ox<cx-90||ox>cx+vw+90||oy<cy-130||oy>cy+vh+90)continue;
  it=drawList[n]||(drawList[n]={});it.y=oy;it.o=o;it.hero=false;it.cr=null;it.pr=null;n++}
 if(st.mode!=='title'){it=drawList[n]||(drawList[n]={});it.y=h.y;it.o=null;it.hero=true;it.cr=null;it.pr=null;n++}
 if(!world&&sc.critters){for(i=0;i<sc.critters.length;i++){var crt=sc.critters[i];if(!view&&(crt.x<cx-60||crt.x>cx+vw+60||crt.y<cy-80||crt.y>cy+vh+60))continue;it=drawList[n]||(drawList[n]={});it.y=crt.y-S*.38;it.o=null;it.hero=false;it.cr=crt;it.pr=null;n++}}
 if(window.LQFeel&&!FX.low&&sc.town){var pps=LQFeel.props(sc);for(i=0;i<pps.length;i++){var pq0=LQFeel.propPos(sc,pps[i],!!view);if(pq0.x<cx-60||pq0.x>cx+vw+60||pq0.y<cy-60||pq0.y>cy+vh+80)continue;it=drawList[n]||(drawList[n]={});it.y=pps[i].y;it.o=null;it.hero=false;it.cr=null;it.pr=pps[i];n++}}/* r5 seeded props */
 drawList.length=n;drawList.sort(byY);
 var w=P().w||emptyW;
 for(var di=0;di<n;di++){it=drawList[di];if(it.cr){drawCritter(g,it.cr,view,z,cx,cy,T);continue}if(it.pr){camXform(g,z,cx,cy);LQFeel.drawProp(g,sc,it.pr,!!view,T);continue}if(it.hero){var hop={t:T,moving:!!h.mv,face:h.face,step:h.mv?h.step:0,hop:h.hop||0,foot:h.foot||1,turn:h.turn||0,celebrate:motionOn()&&!h.mv&&st.celUntil>T,hero:1,land:h.land||0,settle:h.settle||0,poke:h.poke||0};
   if(view){var fp=toView(h.x,h.y+S*.38,heroH(),0);upright(g,z,cx,cy,fp.x,fp.y);Art.figure(g,0,-S*.38,C.hero,hop);lshift(fp.x-h.x,fp.y-S*.38-h.y)}else Art.figure(g,h.x,h.y,C.hero,hop);
   if(!FX.low){addLight(h.x,h.y-S*.22,76,[0.17,0.12,0.04],0);if(C.hero.staff)addLight(h.x+h.face*8,h.y-S*.95,28,[0.42,0.32,0.1],1,3);addShadow(h.x,h.y,true)}lshift(0,0);continue}
  var o=it.o,x=hx(o.c,o.r),y=hy(o.r),th=view?tileH(sc,o.c,o.r):0;
  if(o.type==='npc'){var fc=h.x<x?-1:1,dx=Math.abs(h.x-x),dy=Math.abs(h.y-y),near=dx<S*2.2&&dy<S*2.2,cheer=near&&motionOn()&&!h.mv&&st.celUntil>T,nop={t:T+o.c*.7,face:fc,wave:!cheer&&near&&motionOn()?.5+.5*Math.sin(T*3+o.c):0,celebrate:cheer},px0=x,py0=y-S*1.45-16,bossy=o.role==='gate'||o.role==='boss';npcAnim(o,nop,bossy,T);if(bossy)py0-=S*.62;
   if(view){var nf=toView(x,y+S*.38,th,0);upright(g,z,cx,cy,nf.x,nf.y);Art.figure(g,0,-S*.38,nl(o.sp),nop);lshift(nf.x-x,nf.y-S*.38-y);px0=0;py0=-S*1.83-16-(bossy?S*.62:0)}else Art.figure(g,x,y,nl(o.sp),nop);
   if(!FX.low){addShadow(x,y);var nm0=o.name||'';if(/lamp|wick|lantern/i.test(nm0))addLight(x+(fc>0?8:-8),y-S*.2,36,[0.3,0.21,0.06],2,2);if(o.sp&&o.sp.look&&o.sp.look.staff)addLight(x+fc*7,y-S*.8,28,[0.42,0.32,0.1],3,3);if(bossy)addLight(x,y-S*1.1,34,[0.16,0.13,0.06],3,3)}/* r6: a soft aura on the gatekeeper for the bloom */lshift(0,0);
   var nd=Math.max(dx,dy)/S,al=motionOn()?(nd>=3?0:nd>2.2?(3-nd)/.8:1):(nd<3?1:0);
   if(al>0.04){var pl=namePlate(g,o.name);g.globalAlpha=al;g.drawImage(pl,px0-pl._w/2,py0,pl._w,pl._h);g.globalAlpha=1}
   if(view)camXform(g,z,cx,cy)}
 else{var op=drawOp;op.accent=o.accent;op.t=T;op.pine=o.pine;op.snow=o.snow;op.v=o.v;op.landmark=o.landmark;op.biome=o.type==='node'?bio(o.i):null;op.motif=o.motif;op.roof=o.roof;op.open=op.glow=op.locked=op.lid=op.lit=op.lift=op.cheer=void 0;
   if(o.type==='chest'){op.open=!!w.chests[o.i];op.glow=!op.open&&(o.i>=NR?bossDone():levelDone(o.i));op.locked=!op.open&&!(o.i>=NR?bossDone():levelDone(o.i));if(!motionOn())op.lid=op.open?1:0;else{if(op.open&&o._wasOpen===false)o._lid=0;if(o._lid!=null&&o._lid<1){o._lid=Math.min(1,o._lid+(st.dtRaw||0)/.38);op.lid=o._lid;if(o._lid>=1)o._litAt=T}else if(op.open)op.lid=1;if(!op.open&&o._nudge>0){o._nudge=Math.max(0,o._nudge-(st.dtRaw||0));op.lid=Math.sin((.28-o._nudge)/.28*Math.PI)*.14}}o._wasOpen=op.open}
   if(o.role==='hall')op.lit=o.kind==='great'?bossDone():levelDone(region());
   if(o.type==='cache'&&w.caches[o.i])continue;
   if(o.type==='node'){var cl=o.i<NR?levelDone(o.i):bossDone();if(cl)op.accent='#c9a24f'}
   if(o.kind==='gate'){var gt=Art.hdist(h.c,h.r,o.c,o.r)<=2?1:0;if(o._lift==null)o._lift=0;if(!motionOn())o._lift=gt;else if(o._lift!==gt){var gd=gt-o._lift;o._lift+=Math.sign(gd)*Math.min(Math.abs(gd),(st.dtRaw||0)*2.6)}op.lift=o._lift}
   /* bx,by: where the building is drawn. In the angled view that is the upright frame on the projected tile. */
   var bx=x,byy=y;
   if(view){var base=toView(x,y+S*.5,th,0);upright(g,z,cx,cy,base.x,base.y);Art.podium(g,o.landmark?'landmark':o.kind);bx=0;byy=-S*.5;lshift(base.x-x,base.y-S*.5-y)}
   Art.building(g,o.kind,bx,byy,op);
   if(motionOn()&&Art.groundLight){var dxh=x-h.x,dyh=y-h.y;op.kind=o.kind;op.seed=o.c*5+o.r*3;op.cheer=st.celUntil>T&&dxh*dxh+dyh*dyh<S*S*18?Math.max(0,(st.celUntil-T)/2.4):0;Art.groundLight(g,bx,byy,op)}
   if(o.type==='chest'&&o._litAt!=null&&motionOn()){var cage=T-o._litAt;if(cage<1.6)chestPool(g,bx,byy,cage<.2?1:Math.max(0,1-(cage-.2)/1.4))}
   if(!FX.low)lamp(o,x,y,op);lshift(0,0);
   if(o.type==='node'&&(zoneOpen(o.i)||st.fog[o.i]<.8)){var nm=o.i<NR?C.regions[o.i].name:C.castle.name,cl2=o.i<NR?levelDone(o.i):bossDone(),label=(cl2?'★ ':'')+nm,knd=o.kind==='castle'?2.7:2.15,by=view?-S*(.5+knd):y-S*knd,lx=view?0:x,pl2=placePlate(label,cl2);
    g.drawImage(pl2,lx-pl2._w/2,by-13,pl2._w,pl2._h);g.lineWidth=1.3;g.beginPath();g.rect(lx-pl2._w/2,by-13,pl2._w,21);if(cl2&&motionOn()){g.strokeStyle='#f3e2b0';g.globalAlpha=.55+.45*Math.abs(Math.sin(T*2));g.stroke();g.globalAlpha=1}else{g.strokeStyle='#c8a86a';g.stroke()}}
   if(view)camXform(g,z,cx,cy)}}
 if(!FX.low&&window.LQAnim&&LQAnim.fireflies)LQAnim.fireflies(g,sc,T,cx,cy,vw,vh);
 if(!FX.low&&window.LQAnim){var zb=world?sc.zone[h.c]&&sc.zone[h.c][h.r]:null;LQAnim.particles(g,world?bio(zb==null||zb<0?0:zb):(sc.biome||'meadow'),st.dtRaw||0,cx,cy,vw,vh,T);if(LQAnim.glows)LQAnim.glows.forEach(function(q){if(view){var gp=toView(q[0],q[1],heroH(),0);lshift(gp.x-q[0],gp.y-q[1])}addLight(q[0],q[1],q[2],q[3],8,q[4]);lshift(0,0)})}
 camXform(g,z,cx,cy);if(window.LQFeel){var ao=st.actObj;if(ao&&st.mode==='play'&&!h.mv){var apx=hx(ao.c,ao.r),apy=hy(ao.r);if(view){var ap0=toView(apx,apy,tileH(sc,ao.c,ao.r),0);apx=ap0.x;apy=ap0.y}LQFeel.prompt(g,apx,apy,T,ao.type,ao.role==='gate'||ao.role==='boss'?S*.62:ao.type==='chest'?-S*.55:ao.type==='building'?S*.2:0)}
  var zb4=world?sc.zone[h.c]&&sc.zone[h.c][h.r]:null;LQFeel.airPass(g,world?bio(zb4==null||zb4<0?0:zb4):(sc.biome||'meadow'),st.dtRaw||0,st.time,cx,cy,vw,vh)}/* r5 prompt, dust, drift, birds */
 drawRoute(g,true);
 if(world){if(view&&sc.fogView)g.drawImage(sc.fogView,0,0,sc.view.width,sc.view.height);else g.drawImage(sc.fogCv,0,0,sc.W,sc.H)}
 /* quest marker */
 if(cur&&cur.sid===sc.id){var nd=null;if(world){for(i=0;i<objs.length;i++){o=objs[i];if(o.type==='node'&&o.c===cur.c&&o.r===cur.r){nd=o;break}}}/* on an overworld town or castle, float above its name plaque */
  var bob=motionOn()?Math.sin(T*4)*4:0,pr=motionOn()?(T*1.5)%1:0;
  if(view){var thq=tileH(sc,cur.c,cur.r),lift=(nd?S*(nd.kind==='castle'?2.7:2.15)+29:S*(world?2.4:2.2))+bossLift(sc,cur),qp=toView(hx(cur.c,cur.r),hy(cur.r),thq,lift-bob);
   upright(g,z,cx,cy,qp.x,qp.y);g.fillStyle='#f3e2b0';g.strokeStyle='#6b4a0e';g.lineWidth=2;g.beginPath();g.moveTo(0,12);g.lineTo(-9,-2);g.lineTo(9,-2);g.closePath();g.fill();g.stroke();camXform(g,z,cx,cy)}
  else{var qx=hx(cur.c,cur.r),qy=(nd?hy(cur.r)-S*(nd.kind==='castle'?2.7:2.15)-13-16:hy(cur.r)-S*(world?2.4:2.2)-bossLift(sc,cur))+bob;g.fillStyle='#f3e2b0';g.strokeStyle='#6b4a0e';g.lineWidth=2;g.beginPath();g.moveTo(qx,qy+12);g.lineTo(qx-9,qy-2);g.lineTo(qx+9,qy-2);g.closePath();g.fill();g.stroke()}
  g.strokeStyle='#f3e2b0';g.globalAlpha=1-pr;g.lineWidth=2.5;hexAt(g,cur.c,cur.r,S*(.7+pr*.5));g.stroke();g.globalAlpha=1}
 g.setTransform(dpr,0,0,dpr,0,0);
 if(cur&&cur.sid===sc.id&&st.mode==='play'){var ax,ay;if(view){var ap=toView(hx(cur.c,cur.r),hy(cur.r),tileH(sc,cur.c,cur.r),0);ax=ap.x;ay=ap.y}else{ax=hx(cur.c,cur.r);ay=hy(cur.r)}
  var sx=(ax-cx)*z,sy=(ay-cy)*z;if(sx<10||sx>CW-10||sy<10||sy>CH-10){var ang=Math.atan2(sy-CH/2,sx-CW/2),ex=CW/2+Math.cos(ang)*Math.min(CW,CH)*.42,ey=CH/2+Math.sin(ang)*Math.min(CW,CH)*.42;g.save();g.translate(ex,ey);g.rotate(ang);if(motionOn()){var bp=1+Math.sin(T*4)*.08;g.scale(bp,bp)}g.fillStyle='#f3e2b0';g.strokeStyle='#6b4a0e';g.lineWidth=2;g.beginPath();g.moveTo(16,0);g.lineTo(-8,-11);g.lineTo(-3,0);g.lineTo(-8,11);g.closePath();g.fill();g.stroke();g.restore()}}
 g.drawImage(vigLayer(),0,0,CW,CH);
 /* The WebGL pass reads this canvas, so the fade veil is drawn first and gets the same grade. If WebGL is not there, the old canvas light layer is used. */
 if(st.veil>0){g.save();g.globalAlpha=st.veil;g.fillStyle='#0a0f15';g.fillRect(0,0,CW,CH);g.restore()}
 var glOk=false;if(window.LQLight){var pk=packLights(cx,cy,z);glOk=LQLight.frame(cv,pk.lights,pk.shadows,A.key,null,atmOpts(world,sc,h,cx,cy,z))}
 if(!FX.low&&!glOk){g.setTransform(1,0,0,1,0,0);if(!fxl||fxl.w!==cv.width||fxl.h!==cv.height)mkLight();g.drawImage(fxl.c,0,0);if(window.LQAnim&&LQAnim.lamps2d&&pk)LQAnim.lamps2d(g,pk.lights);/* r6: warm pools when the GL pass is off */if(st.veil>0){g.setTransform(dpr,0,0,dpr,0,0);g.save();g.globalAlpha=st.veil;g.fillStyle='#0a0f15';g.fillRect(0,0,CW,CH);g.restore()}}
 st.mmT-=1;var rebake=st.mmT<=0;if(rebake)st.mmT=6;drawMM(rebake)}
function drawMM(rebake){if(!mm||!st.scene)return;var sc=st.scene,g=mmg,W=mm.width,H=mm.height,k=Math.min(W/sc.W,H/sc.H),ox=(W-sc.W*k)/2,oy=(H-sc.H*k)/2;
 if(!mmBg||mmBg.width!==W||mmBg.height!==H){mmBg=document.createElement('canvas');mmBg.width=W;mmBg.height=H;mmBg._sid=''}
 if(rebake||mmBg._sid!==sc.id){var bg=mmBg.getContext('2d');bg.setTransform(1,0,0,1,0,0);bg.fillStyle='#0a0f15';bg.fillRect(0,0,W,H);bg.drawImage(sc.cv,ox,oy,sc.W*k,sc.H*k);if(sc.id==='w'&&sc.fogCv)bg.drawImage(sc.fogCv,ox,oy,sc.W*k,sc.H*k);
  if(sc.id==='w')NODES.forEach(function(nd,i){var tn=i<NR?C.regions[i].tint:C.castle.tint;bg.fillStyle=zoneOpen(i)?(hexOk(tn)?tn:'#f3e2b0'):'#555b64';bg.beginPath();bg.arc(ox+hx(nd[0],nd[1])*k,oy+hy(nd[1])*k,i<NR?5:7,0,7);bg.fill();bg.strokeStyle='#2a1d0a';bg.lineWidth=1.5;bg.stroke()});
  mmBg._sid=sc.id}
 g.setTransform(1,0,0,1,0,0);g.drawImage(mmBg,0,0);
 var tgt=st.obj&&st.obj.target;if(tgt&&tgt.sid===sc.id){g.strokeStyle='#ffd25a';g.lineWidth=3;g.beginPath();g.arc(ox+hx(tgt.c,tgt.r)*k,oy+hy(tgt.r)*k,9+(motionOn()?Math.sin(st.time*5)*2:0),0,7);g.stroke()}
 g.fillStyle='#fff';g.strokeStyle='#c0392b';g.lineWidth=3;g.beginPath();g.arc(ox+st.hero.x*k,oy+st.hero.y*k,motionOn()?6+Math.sin(st.time*4):6,0,7);g.fill();g.stroke()}
var placePlates={},placeProbe=null,PLACE_FONT='700 15px "Cormorant Garamond",Georgia,serif';
function placePlate(text,gold){var ready=true;try{if(document.fonts&&document.fonts.check)ready=document.fonts.check(PLACE_FONT)}catch(e){}var k=text+'\0'+(ready?1:0),c=placePlates[k];if(c)return c;
 if(!placeProbe)placeProbe=document.createElement('canvas').getContext('2d');placeProbe.font=PLACE_FONT;var w=placeProbe.measureText(text).width+22,h=21;
 c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w))*2;c.height=h*2;var sg=c.getContext('2d');sg.scale(2,2);sg.font=PLACE_FONT;sg.textAlign='center';sg.fillStyle='rgba(10,15,21,.88)';sg.fillRect(0,0,w,h);sg.fillStyle=gold?'#f3e2b0':'#e8dcc4';sg.fillText(text,w/2,15);c._w=w;c._h=h;placePlates[k]=c;return c}
var plates={};function namePlate(g,text){var c=plates[text];if(c)return c;var font='700 13px "Cormorant Garamond",Georgia,serif';g.font=font;var w=Math.ceil(g.measureText(text).width)+8,h=22;c=document.createElement('canvas');c.width=w*2;c.height=h*2;var sg=c.getContext('2d');sg.scale(2,2);sg.font=font;sg.textAlign='center';sg.lineWidth=4;sg.lineJoin='round';sg.strokeStyle='rgba(10,15,21,.9)';sg.strokeText(text,w/2,16);sg.fillStyle='#f3e2b0';sg.fillText(text,w/2,16);c._w=w;c._h=h;plates[text]=c;return c}
var last=0;function frame(ts){requestAnimationFrame(frame);if(document.hidden){last=ts;return}var dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(window.LQFeel)dt=LQFeel.scale(dt);/* r5 hit-stop: 0 while held */st.dtRaw=dt;
 var kk=st.keys,busyIn=!motionOn()&&st.mode==='play'&&st.scene&&!st.hero.mv&&!st.path&&st.pad<0&&!kk.left&&!kk.right&&!kk.up&&!kk.down&&st.veil<=0&&st.shake<=0&&!fogBusy()&&st.cam.err<.5;if(window.LQPerf)LQPerf.frame(ts,busyIn);if(busyIn){st.idleAcc+=dt;if(st.idleAcc<.12)return;st.idleAcc=0}else st.idleAcc=0
 try{update(dt);draw()}catch(e){console.error(e);throw e}}
/* ---------- input ---------- */
var KM={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
function key(e,down){gest=true;if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;var k=e.key;
 if(st.mode==='play'){if(KM[k]){st.keys[KM[k]]=down;e.preventDefault();return}
  if(down){if(k==='Enter'||k===' '||k==='e'||k==='E'){e.preventDefault();actionKey()}else if(k==='m'||k==='M')mapScreen();else if(k==='j'||k==='J')questLog();else if(k==='Escape'||k==='Tab'){e.preventDefault();menu()}}}
 else if(st.mode==='dlg'&&down){if(k==='Enter'||k===' '||k==='e'||k==='E'){e.preventDefault();adv()}else if(/^[1-9]$/.test(k)&&D.choices&&!D.typing)pick(+k-1)}
 else if(st.mode==='ov'&&down&&k==='Escape'){closeOv()}
 if(!down&&KM[k])st.keys[KM[k]]=false}
function hover(e){if(st.mode!=='play'||!st.scene){st.hov=null;return}var r=cv.getBoundingClientRect(),z=zoom(),x=(e.clientX-r.left)/z+st.cam.x,y=(e.clientY-r.top)/z+st.cam.y,hxy=useView()?pickAt(x,y):Art.px2hex(x,y);if(!inb(st.scene,hxy[0],hxy[1])){st.hov=null;return}if(!st.hov||st.hov.c!==hxy[0]||st.hov.r!==hxy[1]){st.idleAcc=1;st.hov={c:hxy[0],r:hxy[1]}}}
function pointer(e){gest=true;if(st.mode!=='play')return;var r=cv.getBoundingClientRect(),z=zoom(),x=(e.clientX-r.left)/z+st.cam.x,y=(e.clientY-r.top)/z+st.cam.y,hxy=useView()?pickAt(x,y):Art.px2hex(x,y);if(!inb(st.scene,hxy[0],hxy[1]))return;
 var o=objAt(hxy[0],hxy[1]);if(motionOn())st.rip={c:hxy[0],r:hxy[1],t:0};var walked=walkTo(hxy[0],hxy[1]);if(!walked&&o&&interactive(o)){var h=st.hero;if(Art.hdist(h.c,h.r,o.c,o.r)===1)interact(o)}}
/* ---------- init ---------- */
function init(){cv=$('#cv');ctx=cv.getContext('2d');resize();window.addEventListener('resize',resize);if(window.LQPerf)LQPerf.onTier(function(){resize();st.cam.snap=true});buildHud();mm=$('#mm');mmg=mm.getContext('2d');
 st.world=buildWorld();syncFog(true);st.scene=st.world;st.hero.x=hx(NODES[0][0],NODES[0][1]);st.hero.y=hy(NODES[0][1]);
 window.addEventListener('keydown',function(e){key(e,true)});window.addEventListener('keyup',function(e){key(e,false)});window.addEventListener('blur',function(){st.keys={};st.pad=-1;[].forEach.call(document.querySelectorAll('.hold'),function(n){n.classList.remove('hold')})});
 cv.addEventListener('pointerup',pointer);cv.addEventListener('pointermove',hover);cv.addEventListener('pointerleave',function(){st.hov=null;st.idleAcc=1});$('#ovx').onclick=function(){closeOv()};
 document.addEventListener('visibilitychange',function(){st.keys={};st.pad=-1;[].forEach.call(document.querySelectorAll('.hold'),function(n){n.classList.remove('hold')})});
 document.body.addEventListener('pointerdown',function(){gest=true},{passive:true});
 /* r4 Safari: iOS only lets a page start Web Audio inside touchend/click/keydown (pointerdown on touch does not count),
    so create and resume the context there once, with a silent one-sample buffer. Removed once it is running. */
 var acU=function(){gest=true;try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running'){var rp=AC.resume();if(rp&&rp.catch)rp.catch(function(){})}var bf=AC.createBuffer(1,1,22050),sn=AC.createBufferSource();sn.buffer=bf;sn.connect(AC.destination);sn.start(0)}catch(e){}if(AC&&AC.state==='running')['touchend','click','keydown'].forEach(function(ev){window.removeEventListener(ev,acU,true)})};
 ['touchend','click','keydown'].forEach(function(ev){window.addEventListener(ev,acU,true)});
 var w=P().w;if(w&&w.sid){var sc=w.sid==='w'?st.world:null;if(sc){st.hero.c=w.c;st.hero.r=w.r}}
 title();requestAnimationFrame(frame);
 window.LQHud={figRects:figRects,gateRect:function(){var f=figRects().filter(function(x){return x.role==='gate'})[0];return f?{l:Math.round(f.l),t:Math.round(f.t),r:Math.round(f.r),b:Math.round(f.b)}:null},bannerRect:function(){var b=$('#area').getBoundingClientRect();return {l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom),on:$('#area').classList.contains('on'),cls:$('#area').className}}};
window.__w={interact:interact,st:st,walkTo:function(c,r){return new Promise(function(res){if(!walkTo(c,r))return res(false);var t0=Date.now();(function p(){if(!st.path&&!st.hero.mv||Date.now()-t0>60000)res(true);else setTimeout(p,30)})()})},warp:function(sid,c,r){enter(sid,c,r)},objective:objective,speed:function(n){st.speed=n},NODES:NODES,hud:hud,scene:function(){return st.scene},bfs:bfs,getScene:getScene,zoneOpen:zoneOpen,adv:adv,pick:pick,neigh:neigh,canWalk:canWalk,start:start,pickAt:pickAt,useView:useView,selfTest:function(){return Art.selfTestCam()},draw:function(){draw()}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
