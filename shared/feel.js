/* Round 5 lane F: game feel and a living world (26 Oct 2026). window.LQFeel. Procedural canvas and Web Audio only; no assets.
   Juice: a short hit-stop and a gentle camera nudge on chest open, gate pass and level clear (its own lq:celebrate listener; the fx2 handler is untouched),
   terrain footstep dust and synth footsteps, a pulsing interaction prompt, a sparkle on a correct answer and a soft, encouraging wobble on a wrong one (lq:answer).
   Living world: grass and flowers that sway in the wind, water-edge foam, drifting leaves, snow or sand by biome, birds crossing the sky,
   and seeded props (crates, barrels, fences, stones, pots) beside buildings and along the town edge.
   Low effects skips all of it except sound. Reduced motion draws the grass, foam and props still, and drops hit-stop, nudge, dust, drift and birds.
   Nothing here changes the colour grade or overall brightness. */
(function(){
'use strict';
var Art=window.Art,FX=window.LQFx;if(!Art||!FX)return;
var S=Art.S,hx=Art.hx,hy=Art.hy,hash=Art.hash,PI2=Math.PI*2;
var small=Math.min(screen.width||999,screen.height||999)<500;
function low(){return !!FX.low}
function rm(){return !!(FX.rm&&FX.rm.matches)}
function calm(){return low()||rm()}
function now(){return (window.performance&&performance.now)?performance.now():Date.now()}

/* ---------- hit-stop and camera nudge ---------- */
var stopUntil=0,rampUntil=0,nud={t0:-1e9,dx:0,dy:0,dur:420},off={x:0,y:0};
function kick(stopMs,dx,dy){if(calm())return;var t=now();stopUntil=Math.max(stopUntil,t+stopMs);rampUntil=stopUntil+120;nud={t0:t,dx:dx||0,dy:dy||0,dur:440}}
/* frame(): pass the raw dt; returns the dt the game should use (0 while held, then eased back in over 120 ms). Also updates the nudge offset. */
function scale(dt){var t=now(),k=1;if(t<stopUntil)k=0;else if(t<rampUntil)k=.35+.65*(1-(rampUntil-t)/120);
 var a=(t-nud.t0)/nud.dur;if(a>=0&&a<1&&!calm()){var env=Math.pow(1-a,2.2),w=Math.cos(a*Math.PI*3.2);off.x=nud.dx*env*w;off.y=nud.dy*env*w}else{off.x=0;off.y=0}
 return dt*k}
function held(){return now()<stopUntil}

/* ---------- synth sound (shares world.js's AudioContext and mute through window.LQSfx) ---------- */
var NB=null;
function ac(){var s=window.LQSfx;if(!s||!s.on())return null;return s.ctx()}
function noiseBuf(c){if(NB&&NB.sampleRate===c.sampleRate)return NB;var n=Math.floor(c.sampleRate*.5),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0),l=0;for(var i=0;i<n;i++){var w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=w*.7+l*3}NB=b;return b}
function tone(c,f,d,v,type,f2,at){var t=c.currentTime+(at||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
function noise(c,d,v,ftype,fq,q,at,fq2){var t=c.currentTime+(at||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);f.type=ftype||'bandpass';f.frequency.setValueAtTime(fq||1500,t);if(fq2)f.frequency.exponentialRampToValueAtTime(fq2,t+d);f.Q.value=q||1;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t,Math.random()*.3);s.stop(t+d+.03)}
var SFX={
 chest:function(c){tone(c,150,.22,.05,'sine',70);noise(c,.35,.012,'highpass',5000,.7,.05);[1047,1319,1568,2093].forEach(function(f,i){tone(c,f,.32,.022,'triangle',0,.06+i*.06)})},
 gate:function(c){tone(c,196,.7,.035,'sine');tone(c,294,.6,.025,'sine',0,.04);noise(c,.5,.01,'bandpass',600,.8,0,2400)},
 clear:function(c){tone(c,130,.25,.045,'sine',65);[784,988,1175,1568].forEach(function(f,i){tone(c,f,.36,.02,'triangle',0,.05+i*.07)})},
 right:function(c){[1047,1319,1568].forEach(function(f,i){tone(c,f,.26,.025,'triangle',0,i*.055)});noise(c,.25,.006,'highpass',6000,.7,.1)},
 soft:function(c){tone(c,392,.16,.022,'sine',370);tone(c,349,.22,.02,'sine',330,.13)},
 grass:function(c){noise(c,.07,.014,'highpass',2600,.6)},
 road:function(c){noise(c,.045,.02,'bandpass',1300,2.2);tone(c,140+Math.random()*30,.04,.008,'triangle')},
 sand:function(c){noise(c,.1,.018,'lowpass',900,.8)},
 snow:function(c){noise(c,.05,.016,'bandpass',2200,1.4);noise(c,.05,.012,'bandpass',1700,1.4,.035)},
 splash:function(c){noise(c,.14,.016,'bandpass',1600,.9,0,700);tone(c,320,.09,.012,'sine',560,.02)}};
function sfx(k){var c=ac();if(!c||!SFX[k])return false;try{SFX[k](c)}catch(e){}return true}

/* ---------- terrain under a tile ---------- */
function roadSet(sc){if(sc._lqRoad)return sc._lqRoad;var m={};(sc.roads||[]).forEach(function(l){l.forEach(function(p){m[p[0]+','+p[1]]=1})});(sc.plaza||[]).forEach(function(p){m[p[0]+','+p[1]]=1});sc._lqRoad=m;return m}
function ground(sc,c,r){if(!sc||!sc.t||!sc.t[c])return 'grass';if(roadSet(sc)[c+','+r])return 'road';var t=sc.t[c][r];
 return t==='sand'?'sand':t==='snow'||t==='pine'?'snow':t==='marsh'||t==='water'?'splash':t==='hills'||t==='mountain'?'road':'grass'}
/* finishStep(): sound on every step (if sound is on), dust only when motion is allowed. Returns true when it handled the step. */
function step(sc,c,r,x,y,face,dust){var k=ground(sc,c,r);var played=Math.random()<.85?sfx(k):true;if(dust&&!calm())spawnDust(k,x,y,face||1);return played}

/* ---------- particles: footstep dust and per-biome drift ---------- */
var dust=[],drift=[],driftKey=null;
var DUST={grass:{n:6,col:['#7fae4a','#a7cf6a','#5f8a3e'],kind:'fleck',g:220,life:.42},road:{n:5,col:['#b8a483','#cbb894'],kind:'puff',g:0,life:.45},
 sand:{n:7,col:['#e2c48c','#d4b074','#f0d9a8'],kind:'puff',g:0,life:.6},snow:{n:7,col:['#ffffff','#e8f1fb'],kind:'puff',g:30,life:.55},splash:{n:8,col:['#dff3ff','#a9d6f0','#ffffff'],kind:'drop',g:260,life:.45}};
function spawnDust(k,x,y,face){var D=DUST[k]||DUST.grass,n=small?Math.ceil(D.n*.7):D.n;
 for(var i=0;i<n;i++){var a=Math.PI+Math.random()*Math.PI,sp=D.kind==='puff'?10+Math.random()*16:30+Math.random()*40;
  dust.push({x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*3,vx:Math.cos(a)*sp*.9-face*8,vy:Math.sin(a)*sp*(D.kind==='puff'?.35:.9)-(D.kind==='puff'?6:18),t:0,life:D.life*(.7+Math.random()*.5),
   r:D.kind==='puff'?2+Math.random()*2.6:1+Math.random()*1.2,col:D.col[i%D.col.length],kind:D.kind,g:D.g,rot:Math.random()*3}) }
 if(k==='splash')dust.push({x:x,y:y,t:0,life:.5,kind:'ring',r:3,col:'#e8f6ff'});
 if(dust.length>90)dust.splice(0,dust.length-90)}
function stepDust(dt){for(var i=dust.length-1;i>=0;i--){var p=dust[i];p.t+=dt;if(p.t>p.life){dust.splice(i,1);continue}if(p.kind==='ring'){p.r+=dt*26;continue}
 p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(p.kind==='puff'){p.vx*=1-dt*2.5;p.vy*=1-dt*2.5;p.r+=dt*5}p.rot+=dt*9}}
function drawDust(g){if(!dust.length)return;g.save();for(var i=0;i<dust.length;i++){var p=dust[i],a=1-p.t/p.life;
 if(p.kind==='ring'){g.globalAlpha=.55*a;g.strokeStyle=p.col;g.lineWidth=1.2;g.beginPath();g.ellipse(p.x,p.y,p.r,p.r*.42,0,0,PI2);g.stroke();continue}
 g.globalAlpha=(p.kind==='puff'?.5:.9)*a;g.fillStyle=p.col;
 if(p.kind==='fleck'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-p.r*1.6,-.6,p.r*3.2,1.2);g.restore()}
 else{g.beginPath();g.arc(p.x,p.y,p.r,0,PI2);g.fill()}}
 g.restore()}
/* drift: leaves (green and gold), snowflakes, sand wisps or marsh seed fluff, in view space, wrapping round the view. */
var DRIFT={meadow:{n:7,k:'leaf',col:['#9cc165','#d7b56a','#c98a4a']},forest:{n:11,k:'leaf',col:['#7fae4a','#c98a4a','#d7b56a','#a75a2a']},hills:{n:6,k:'leaf',col:['#b9c46a','#d7b56a']},
 highland:{n:6,k:'leaf',col:['#b9c46a','#cfd8e2']},crown:{n:7,k:'leaf',col:['#d7b56a','#f3e2b0','#9cc165']},tundra:{n:16,k:'flake',col:['#ffffff','#eef6ff']},desert:{n:10,k:'wisp',col:['#f0d9a8','#e2c48c']},marsh:{n:8,k:'fluff',col:['#f4f1e4','#e4f0d0']}};
function seedDrift(k,cx,cy,vw,vh){var D=DRIFT[k]||DRIFT.meadow,n=Math.round(D.n*(small?.65:1));drift=[];for(var i=0;i<n;i++)drift.push({x:cx+Math.random()*vw,y:cy+Math.random()*vh,p:Math.random()*PI2,s:.6+Math.random()*.7,rot:Math.random()*PI2,col:D.col[i%D.col.length]});driftKey=k}
function wind(x,T){return Math.sin(T*1.3+x*.011)*.55+Math.sin(T*.47+x*.004)*.45+gust(x,T)}
function gust(x,T){var s=Math.sin(x*.0035-T*.55);return s>0?Math.pow(s,6)*1.2:0}
function stepDrift(k,dt,cx,cy,vw,vh,T){if(driftKey!==k||!drift.length)seedDrift(k,cx,cy,vw,vh);var D=DRIFT[k]||DRIFT.meadow;
 for(var i=0;i<drift.length;i++){var q=drift[i],w=wind(q.x,T),vx,vy;
  if(D.k==='leaf'){vx=(14+w*16)*q.s;vy=(9+Math.sin(T*1.7+q.p)*10)*q.s;q.rot+=dt*(2+w)*q.s}
  else if(D.k==='flake'){vx=(5+w*8)*q.s+Math.sin(T*.9+q.p)*6;vy=20*q.s;q.rot+=dt*.8}
  else if(D.k==='wisp'){vx=(46+w*30)*q.s;vy=Math.sin(T*1.1+q.p)*4}
  else{vx=(8+w*10)*q.s;vy=(-3+Math.sin(T*1.3+q.p)*6)*q.s;q.rot+=dt}
  q.x+=vx*dt;q.y+=vy*dt;if(q.x<cx-20)q.x+=vw+40;else if(q.x>cx+vw+20)q.x-=vw+40;if(q.y<cy-20)q.y+=vh+40;else if(q.y>cy+vh+20)q.y-=vh+40}}
function drawDrift(g,k,T){var D=DRIFT[k]||DRIFT.meadow;g.save();
 for(var i=0;i<drift.length;i++){var q=drift[i];g.fillStyle=q.col;
  if(D.k==='leaf'){var fl=Math.cos(q.rot*1.3);g.globalAlpha=.85;g.save();g.translate(q.x,q.y);g.rotate(q.rot);g.scale(1,.35+.65*Math.abs(fl));g.beginPath();g.moveTo(-3.6*q.s,0);g.quadraticCurveTo(0,-2.6*q.s,3.6*q.s,0);g.quadraticCurveTo(0,2.6*q.s,-3.6*q.s,0);g.fill();g.restore()}
  else if(D.k==='flake'){g.globalAlpha=.85;var r=1.6+q.s*1.6;g.beginPath();g.arc(q.x,q.y,r,0,PI2);g.fill();if(q.s>1){g.globalAlpha=.35;g.beginPath();g.arc(q.x,q.y,r*2,0,PI2);g.fill()}}
  else if(D.k==='wisp'){g.globalAlpha=.32;g.strokeStyle=q.col;g.lineWidth=1.2;g.beginPath();g.moveTo(q.x-16*q.s,q.y);g.quadraticCurveTo(q.x-6*q.s,q.y-2.5,q.x+4*q.s,q.y);g.stroke();g.globalAlpha=.7;g.fillRect(q.x+4*q.s,q.y-.6,1.4,1.4)}
  else{g.globalAlpha=.8;g.beginPath();g.arc(q.x,q.y,1.3,0,PI2);g.fill();g.globalAlpha=.4;g.strokeStyle=q.col;g.lineWidth=.8;for(var j=0;j<4;j++){var a=q.rot+j*1.57;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(a)*3.4,q.y+Math.sin(a)*3.4);g.stroke()}}}
 g.restore()}

/* ---------- scene caches: grass tufts, water-edge foam, props ---------- */
var TUFT={grass:{p:2,h:8,c:['#4f7a34','#86b052'],fl:.14},crown:{p:2,h:7,c:['#557f38','#8db758'],fl:.16},forest:{p:2,h:9,c:['#3f6a2e','#6f9a44'],fl:.04},hills:{p:1,h:7,c:['#6a7f3a','#a3b25e'],fl:.1},
 marsh:{p:2,h:12,c:['#5f7a3a','#b0b866'],fl:0,reed:1},sand:{p:.35,h:7,c:['#a08a52','#cdb67a'],fl:0},snow:{p:.25,h:7,c:['#7e8a76','#b8c0ae'],fl:0},pine:{p:.4,h:7,c:['#55704a','#8fa284'],fl:0}};
var FLC=['#f3e2b0','#ff9fb2','#ffd25a','#c9b6ff'];
function vp(sc,x,y,h,view){if(!view)return [x,y];var p=Art.project(x,y,h||0);return [p.x+sc.viewOx,p.y+sc.viewOy]}
function blocked(sc){if(sc._lqBlk)return sc._lqBlk;var m={};(sc.objs||[]).forEach(function(o){if(o.type!=='deco'||o.kind!=='tree')m[o.c+','+o.r]=o});sc._lqBlk=m;return m}
function tufts(sc,view){var key=view?'_lqTV':'_lqTF';if(sc[key])return sc[key];var out=[],rd=roadSet(sc),bl=blocked(sc),seed=(sc.seed||7)+311;
 for(var c=0;c<sc.cols;c++)for(var r=0;r<sc.rows;r++){var t=sc.t[c][r],T=TUFT[t];if(!T||rd[c+','+r]||bl[c+','+r])continue;var h=Art.groundH(t),n=T.p*(small?.6:1),base=Math.floor(n)+(hash(c,r,seed)<n%1?1:0);
  for(var k=0;k<base;k++){var a=hash(c,r,seed+k*17)*PI2,d=S*(.25+.5*hash(c,r,seed+k*29)),x=hx(c,r)+Math.cos(a)*d,y=hy(r)+Math.sin(a)*d*.85,p=vp(sc,x,y,h,view),f=hash(c,r,seed+k*41);
   out.push({x:p[0],y:p[1],wx:x,h:T.h*(.75+.5*hash(c,r,seed+k*53)),t:T,fl:f<T.fl?FLC[Math.floor(f*997)%4]:null,ph:f*6})}}
 out.sort(function(a,b){return a.y-b.y});sc[key]=out;return out}
function foam(sc,view){var key=view?'_lqFV':'_lqFF';if(sc[key])return sc[key];var out=[];
 for(var c=0;c<sc.cols;c++)for(var r=0;r<sc.rows;r++){if(sc.t[c][r]!=='water')continue;var x=hx(c,r),y=hy(r);
  for(var d=0;d<6;d++){var n=Art.neigh(c,r,d);if(n[0]<0||n[1]<0||n[0]>=sc.cols||n[1]>=sc.rows)continue;var tn=sc.t[n[0]][n[1]];if(tn==='water')continue;
   var nx=hx(n[0],n[1]),ny=hy(n[1]),mx=(x+nx)/2,my=(y+ny)/2,dx=(nx-x),dy=(ny-y),L=Math.sqrt(dx*dx+dy*dy)||1;dx/=L;dy/=L;
   var tx=-dy,ty=dx,pts=[];for(var i=0;i<5;i++){var u=(i/4-.5)*S*.86;pts.push(vp(sc,mx+tx*u,my+ty*u,0,view))}
   var inw=vp(sc,mx-dx*6,my-dy*6,0,view),mm=vp(sc,mx,my,0,view);out.push({pts:pts,nx:inw[0]-mm[0],ny:inw[1]-mm[1],x:mm[0],y:mm[1],ph:hash(c,r,d*7+3)*PI2})}}
 sc[key]=out;return out}
/* props: crates, barrels, sacks or pots beside buildings (on the building's own blocked tile, so nothing walkable is covered),
   stones and flowers at tree bases, and short fence runs on the town edge (between walkable and scenery tiles, away from the gate). */
var BUILD={building:1};
function props(sc){if(sc._lqProps)return sc._lqProps;var out=[],seed=(sc.seed||7)+733,B=sc.biome||'meadow',snow=B==='tundra',dry=B==='desert';
 if(sc.town){(sc.objs||[]).forEach(function(o){var x=hx(o.c,o.r),y=hy(o.r),h=hash(o.c,o.r,seed);
   if(BUILD[o.type]){var side=h<.5?-1:1,k1=dry?'pot':h<.33?'crate':h<.66?'barrel':'sack',k2=dry?'crate':h<.5?'barrel':'crate';
    out.push({c:o.c,r:o.r,x:x+side*S*.78,y:y+S*.42,k:k1,snow:snow,s:.95});out.push({c:o.c,r:o.r,x:x+side*S*.98,y:y+S*.2,k:k2,snow:snow,s:.8});
    if(hash(o.c,o.r,seed+5)<.6)out.push({c:o.c,r:o.r,x:x-side*S*.82,y:y+S*.46,k:'stones',snow:snow,s:1})}
   else if(o.type==='deco'&&o.kind==='tree'&&!o.landmark&&h<.55)out.push({c:o.c,r:o.r,x:x+(h-.27)*S*1.1,y:y+S*.34,k:h<.3&&!snow&&!dry?'flowers':'stones',snow:snow,s:.9})
   else if(o.type==='deco'&&o.kind==='fountain'){out.push({c:o.c,r:o.r,x:x-S*.7,y:y+S*.45,k:snow||dry?'stones':'flowers',snow:snow,s:1})}});
  var gate=(sc.objs||[]).filter(function(o){return o.type==='gate'})[0];
  for(var c=0;c<sc.cols;c++)for(var r=0;r<sc.rows;r++){if(!sc.pass[c][r])continue;if(gate&&Art.hdist(c,r,gate.c,gate.r)<=2)continue;
   for(var d=0;d<6;d++){var n=Art.neigh(c,r,d);if(n[0]<0||n[1]<0||n[0]>=sc.cols||n[1]>=sc.rows)continue;if(sc.pass[n[0]][n[1]])continue;if(sc.t[n[0]][n[1]]==='water'||hash(c,r,seed+d*13)>.45)continue;
    var x0=hx(c,r),y0=hy(r),x1=hx(n[0],n[1]),y1=hy(n[1]),mx=x0+(x1-x0)*.5,my=y0+(y1-y0)*.5,dx=x1-x0,dy=y1-y0,L=Math.sqrt(dx*dx+dy*dy);dx/=L;dy/=L;
    out.push({c:c,r:r,x:mx-dx*3,y:my-dy*3,k:'fence',ax:-dy*S*.48,ay:dx*S*.48,snow:snow,s:1})}}}
 sc._lqProps=out;return out}
function propPos(sc,p,view){var key=view?'v':'f';if(p[key])return p[key];var h=Art.groundH(sc.t[p.c]&&sc.t[p.c][p.r]||'grass');if(p.k==='fence'){var a=vp(sc,p.x-p.ax,p.y-p.ay,h,view),b=vp(sc,p.x+p.ax,p.y+p.ay,h,view);p[key]={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,a:a,b:b}}else{var q=vp(sc,p.x,p.y,h,view);p[key]={x:q[0],y:q[1]}}return p[key]}

/* ---------- prop painters (ink outline, same style as the map) ---------- */
var INK='#2a1d0a';
function box(g,x,y,w,h,fill){g.fillStyle=fill;g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h)}
function snowCap(g,x,y,w){g.fillStyle='#f4f8fc';g.beginPath();g.ellipse(x,y,w,2.4,0,Math.PI,PI2);g.fill()}
function drawProp(g,sc,p,view,T){var q=propPos(sc,p,view),x=q.x,y=q.y,s=p.s||1;g.save();g.lineWidth=1.1;g.strokeStyle=INK;g.lineJoin='round';
 g.globalAlpha=.25;g.fillStyle='#0a0f15';g.beginPath();g.ellipse(x+2,y+1,(p.k==='fence'?0:7*s),2.6*s,0,0,PI2);g.fill();g.globalAlpha=1;
 if(p.k==='crate'){var w=11*s;box(g,x-w/2,y-w,w,w,'#a8743e');g.beginPath();g.moveTo(x-w/2,y-w);g.lineTo(x+w/2,y);g.moveTo(x+w/2,y-w);g.lineTo(x-w/2,y);g.stroke();g.fillStyle='rgba(255,236,190,.25)';g.fillRect(x-w/2+1,y-w+1,w-2,2);if(p.snow)snowCap(g,x,y-w,w/2+1)}
 else if(p.k==='barrel'){var bw=9*s,bh=12*s;g.fillStyle='#8a5a2e';g.beginPath();g.moveTo(x-bw/2,y-bh);g.quadraticCurveTo(x-bw/2-2*s,y-bh/2,x-bw/2,y);g.lineTo(x+bw/2,y);g.quadraticCurveTo(x+bw/2+2*s,y-bh/2,x+bw/2,y-bh);g.closePath();g.fill();g.stroke();
  g.strokeStyle='#4a4038';g.lineWidth=1.4;g.beginPath();g.moveTo(x-bw/2-1.2*s,y-bh*.3);g.lineTo(x+bw/2+1.2*s,y-bh*.3);g.moveTo(x-bw/2-1.2*s,y-bh*.72);g.lineTo(x+bw/2+1.2*s,y-bh*.72);g.stroke();g.fillStyle='#b07a44';g.strokeStyle=INK;g.lineWidth=1;g.beginPath();g.ellipse(x,y-bh,bw/2,2*s,0,0,PI2);g.fill();g.stroke();if(p.snow)snowCap(g,x,y-bh,bw/2+.5)}
 else if(p.k==='sack'){g.fillStyle='#c9b48a';g.beginPath();g.moveTo(x-5*s,y);g.quadraticCurveTo(x-7*s,y-7*s,x-2*s,y-10*s);g.lineTo(x+2*s,y-10*s);g.quadraticCurveTo(x+7*s,y-7*s,x+5*s,y);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(x-2.5*s,y-8.5*s);g.lineTo(x+2.5*s,y-8.5*s);g.stroke()}
 else if(p.k==='pot'){g.fillStyle='#c4703e';g.beginPath();g.moveTo(x-3*s,y-11*s);g.lineTo(x+3*s,y-11*s);g.quadraticCurveTo(x+8*s,y-6*s,x+4*s,y);g.lineTo(x-4*s,y);g.quadraticCurveTo(x-8*s,y-6*s,x-3*s,y-11*s);g.fill();g.stroke();g.strokeStyle='#f0d9a8';g.beginPath();g.moveTo(x-5.5*s,y-6*s);g.lineTo(x+5.5*s,y-6*s);g.stroke()}
 else if(p.k==='stones'){var cs=['#8d8f94','#a7a9ad','#7a7c82'];for(var i=0;i<3;i++){g.fillStyle=cs[i];g.beginPath();g.ellipse(x+(i-1)*5*s,y-1.6*s-(i===1?1:0),(3.4-i*.5)*s,(2.4-i*.3)*s,0,0,PI2);g.fill();g.stroke()}if(p.snow)snowCap(g,x,y-3.4*s,4)}
 else if(p.k==='flowers'){var sw=calm()?0:Math.sin(T*1.6+x*.02)*1.5;g.strokeStyle='#4f7a34';g.lineWidth=1;for(var j=0;j<4;j++){var fx=x+(j-1.5)*3.2*s;g.beginPath();g.moveTo(fx,y);g.quadraticCurveTo(fx+sw*.4,y-4*s,fx+sw,y-7*s-(j%2)*2);g.stroke()}
  for(var m=0;m<4;m++){g.fillStyle=FLC[(m+(p.c|0))%4];g.beginPath();g.arc(x+(m-1.5)*3.2*s+sw,y-7*s-(m%2)*2,1.9*s,0,PI2);g.fill()}}
 else if(p.k==='fence'){var a=q.a,b=q.b,ph=7*s;g.strokeStyle=INK;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(a[0],a[1]-ph*.4);g.lineTo(b[0],b[1]-ph*.4);g.moveTo(a[0],a[1]-ph*.85);g.lineTo(b[0],b[1]-ph*.85);g.stroke();
  g.strokeStyle='#9a6a3a';g.lineWidth=1.6;g.stroke();for(var k=0;k<3;k++){var u=k/2,px=a[0]+(b[0]-a[0])*u,py=a[1]+(b[1]-a[1])*u;g.fillStyle='#7a5230';g.strokeStyle=INK;g.lineWidth=1;g.fillRect(px-1.6,py-ph-2,3.2,ph+2);g.strokeRect(px-1.6,py-ph-2,3.2,ph+2);if(p.snow){g.fillStyle='#f4f8fc';g.fillRect(px-2,py-ph-3.4,4,1.8)}}}
 g.restore()}

/* ---------- ground pass (before figures): swaying grass and flowers, water-edge foam ---------- */
function groundPass(g,sc,T,cx,cy,vw,vh,view){if(low()||!sc||!sc.t)return;var still=rm(),tt=still?0:T;
 var L=tufts(sc,view),x0=cx-20,x1=cx+vw+20,y0=cy-10,y1=cy+vh+20,i,q,w,lean,dk=null,lt=null;
 /* two batched strokes per palette: shaded blades, then lit blades */
 var groups={};for(i=0;i<L.length;i++){q=L[i];if(q.y<y0||q.y>y1||q.x<x0||q.x>x1)continue;var key=q.t.c[0];(groups[key]||(groups[key]={t:q.t,l:[]})).l.push(q)}
 g.save();g.lineCap='round';
 for(var kk in groups){var G=groups[kk],T2=G.t,l=G.l;
  for(var pass=0;pass<2;pass++){g.strokeStyle=T2.c[pass];g.lineWidth=pass?1.1:1.5;g.globalAlpha=pass?.9:.8;g.beginPath();
   for(i=0;i<l.length;i++){q=l[i];w=still?.15:wind(q.wx,tt);lean=(.18+w*.32)+Math.sin(tt*2.3+q.ph)*.06;var hh=q.h*(T2.reed?1.2:1),nb=T2.reed?3:(small?3:4);
    for(var b=0;b<nb;b++){if((b&1)!==pass)continue;var bx=q.x+(b-(nb-1)/2)*1.9,bh=hh*(.7+.3*((b*7+3)%5)/4),tip=lean*bh*(1+b*.12);g.moveTo(bx,q.y);g.quadraticCurveTo(bx+tip*.25,q.y-bh*.6,bx+tip,q.y-bh)}}
   g.stroke()}
  for(i=0;i<l.length;i++){q=l[i];if(!q.fl)continue;w=still?.15:wind(q.wx,tt);var fx=q.x+(.18+w*.32)*q.h*1.3,fy=q.y-q.h*1.15;g.globalAlpha=1;g.fillStyle=q.fl;g.beginPath();g.arc(fx,fy,1.9,0,PI2);g.fill();g.fillStyle='#ffe58a';g.fillRect(fx-.5,fy-.5,1,1)}
  if(T2.reed){g.fillStyle='#7a4e2a';for(i=0;i<l.length;i+=2){q=l[i];w=still?.15:wind(q.wx,tt);var rx=q.x+(.18+w*.32)*q.h*1.2,ry=q.y-q.h*1.2;g.fillRect(rx-1,ry-3,2,4)}}}
 /* water-edge foam: lapping lines that breathe in and out from the shore */
 var F=foam(sc,view);g.strokeStyle='#eef8ff';g.lineWidth=1.5;
 for(var ph=0;ph<2;ph++){g.beginPath();var any=false;
  for(i=ph;i<F.length;i+=2){var f=F[i];if(f.x<x0-30||f.x>x1+30||f.y<y0-30||f.y>y1+30)continue;any=true;var s=still?.5:.5+.5*Math.sin(tt*1.5+f.ph),ox=f.nx*s*.6,oy=f.ny*s*.6;
   g.moveTo(f.pts[0][0]+ox,f.pts[0][1]+oy);for(var j=1;j<5;j++)g.lineTo(f.pts[j][0]+ox+(j%2?f.nx*.15:0),f.pts[j][1]+oy+(j%2?f.ny*.15:0))}
  if(any){g.globalAlpha=still?.35:.22+.22*(.5+.5*Math.sin(tt*1.1+ph*2.2));g.stroke()}}
 if(!still){g.fillStyle='#ffffff';for(i=0;i<F.length;i+=3){var e=F[i];if(e.x<x0||e.x>x1||e.y<y0||e.y>y1)continue;var u=(tt*.25+e.ph)%1,p=e.pts[Math.floor(u*4.99)];g.globalAlpha=.5*Math.sin(u*Math.PI);g.beginPath();g.arc(p[0]+e.nx*.9,p[1]+e.ny*.9,1.2,0,PI2);g.fill()}}
 g.restore();g.globalAlpha=1}

/* ---------- air pass (after figures): footstep dust, drift, birds ---------- */
function birds(g,T,cx,cy,vw,vh){var P=17,k=Math.floor(T/P),u=(T%P)/10;if(u>1)return;var h1=hash(k,3,11),h2=hash(k,5,13),dir=h1<.5?1:-1,n=3+Math.floor(h2*3),y=cy+vh*(.12+.3*h2),x=dir>0?cx-60+u*(vw+120):cx+vw+60-u*(vw+120);
 g.save();for(var i=0;i<n;i++){var bx=x-dir*(i*16+(i%2)*6),by=y+(i%2?9:-3)*(i>0?1:0)+i*4+Math.sin(T*1.2+i)*3,fl=Math.sin(T*11+i*1.7),sz=5.2-(i%2)*.8;
  g.globalAlpha=.12;g.fillStyle='#0a0f15';g.beginPath();g.ellipse(bx+26,by+vh*.22,sz*.9,1.6,0,0,PI2);g.fill();
  g.globalAlpha=.85;g.strokeStyle='#33302c';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(bx-sz,by-fl*sz*.7);g.quadraticCurveTo(bx-sz*.4,by-1.5-fl*1.2,bx,by);g.quadraticCurveTo(bx+sz*.4,by-1.5-fl*1.2,bx+sz,by-fl*sz*.7);g.stroke()}
 g.restore()}
function airPass(g,biome,dt,T,cx,cy,vw,vh){if(calm()){dust.length=0;return}stepDust(dt);drawDust(g);if(dt>0)stepDrift(biome,dt,cx,cy,vw,vh,T);else if(driftKey!==biome)seedDrift(biome,cx,cy,vw,vh);drawDrift(g,biome,T);birds(g,T,cx,cy,vw,vh)}

/* ---------- interaction prompt: a pulsing ring on the tile and a small bubble over the person or chest ---------- */
function prompt(g,x,y,T,kind){if(low())return;var still=rm(),p=still?.5:(T*1.4)%1,b=still?0:Math.sin(T*5)*1.5;g.save();
 g.strokeStyle='#f3e2b0';g.lineWidth=2;g.globalAlpha=(1-p)*.8;g.beginPath();g.ellipse(x,y,S*(.45+p*.35),S*(.45+p*.35)*.5,0,0,PI2);g.stroke();
 var bx=x+S*.62,by=y-S*1.55+b,sc=still?1:1+.08*Math.sin(T*5);g.globalAlpha=1;g.translate(bx,by);g.scale(sc,sc);g.fillStyle='#0e141c';g.strokeStyle='#d7b56a';g.lineWidth=1.6;
 g.beginPath();g.moveTo(-9,-8);g.lineTo(9,-8);g.quadraticCurveTo(12,-8,12,-5);g.lineTo(12,4);g.quadraticCurveTo(12,7,9,7);g.lineTo(0,7);g.lineTo(-4,11);g.lineTo(-3,7);g.lineTo(-9,7);g.quadraticCurveTo(-12,7,-12,4);g.lineTo(-12,-5);g.quadraticCurveTo(-12,-8,-9,-8);g.closePath();g.fill();g.stroke();
 g.fillStyle='#f3e2b0';if(kind==='chest'){g.beginPath();for(var i=0;i<8;i++){var a=i*Math.PI/4,r=i%2?2:5.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r-.5)}g.closePath();g.fill()}else if(kind==='building'){g.fillRect(-3.5,-4,7,8);g.fillStyle='#0e141c';g.fillRect(-1.5,0,3,4)}else{for(var j=-1;j<=1;j++){g.beginPath();g.arc(j*4.6,0,1.7,0,PI2);g.fill()}}
 g.restore()}

/* ---------- celebrate and answer listeners (separate from fx2's handler) ---------- */
document.addEventListener('lq:celebrate',function(e){var d=e.detail||{};
 if(d.vfx==='beam'){kick(85,0,5);sfx('chest')}else if(d.vfx==='gate'){kick(65,0,-4);sfx('gate')}else if(d.vfx==='shockwave'){kick(90,4,3);sfx('clear')}else kick(50,0,3)});
var CSS='.lq-hit{animation:lqhit .5s cubic-bezier(.2,.8,.3,1)}@keyframes lqhit{0%{transform:scale(1)}12%{transform:scale(1.014) translateY(2px)}24%{transform:scale(1.014) translateY(2px)}55%{transform:scale(.996) translateY(-1px)}100%{transform:none}}'
+'.lq-spark{position:fixed;z-index:60;pointer-events:none;width:10px;height:10px;margin:-5px 0 0 -5px;background:radial-gradient(circle,#fff6c0 0,#ffd25a 45%,rgba(255,210,90,0) 70%);border-radius:50%;animation:lqspark .75s cubic-bezier(.15,.7,.3,1) forwards}'
+'.lq-spark.st{background:none;width:14px;height:14px;margin:-7px 0 0 -7px}.lq-spark.st:before,.lq-spark.st:after{content:"";position:absolute;left:6px;top:0;width:2px;height:14px;background:#fff1b8;border-radius:1px;box-shadow:0 0 6px #ffd25a}.lq-spark.st:after{transform:rotate(90deg)}'
+'@keyframes lqspark{0%{opacity:1;transform:translate(0,0) scale(.4)}60%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.1) rotate(60deg)}}'
+'.opt.no.lq-wob{animation:lqwob .5s ease-out!important}@keyframes lqwob{0%{transform:none}20%{transform:translateX(-3px) rotate(-.6deg)}45%{transform:translateX(2px) rotate(.4deg)}70%{transform:translateX(-1px)}100%{transform:none}}'
+'.lq-try{display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;border:1px solid #c8a86a;background:#2a1f10;color:#f3e2b0;font-size:.85em;font-weight:800}'
+'@media (prefers-reduced-motion:reduce){.lq-hit,.opt.no.lq-wob{animation:none!important}.lq-spark{display:none}}';
function css(){if(document.getElementById('lq-feel-css'))return;var s=document.createElement('style');s.id='lq-feel-css';s.textContent=CSS;document.head.appendChild(s)}
function sparkle(el){if(!el||calm())return;var b=el.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,n=small?10:14;
 for(var i=0;i<n;i++){var s=document.createElement('i'),a=i/n*PI2+Math.random()*.4,r=40+Math.random()*50;s.className='lq-spark'+(i%3===0?' st':'');s.setAttribute('aria-hidden','true');
  s.style.left=(cx+Math.cos(a)*b.width*.25)+'px';s.style.top=(cy+Math.sin(a)*b.height*.3)+'px';s.style.setProperty('--dx',(Math.cos(a)*r).toFixed(0)+'px');s.style.setProperty('--dy',(Math.sin(a)*r*.7-14).toFixed(0)+'px');s.style.animationDelay=(Math.random()*.08).toFixed(2)+'s';document.body.appendChild(s);(function(s){setTimeout(function(){s.remove()},950)})(s)}}
function replay(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
document.addEventListener('lq:answer',function(e){var d=e.detail||{},root=d.el||document;css();
 if(d.ok){sfx('right');if(!calm()){var pan=root.querySelector&&root.querySelector('.panel');setTimeout(function(){replay(pan,'lq-hit')},0);sparkle(root.querySelector('.opt.ok')||root.querySelector('.fb.ok'))}}
 else{sfx('soft');var fb=root.querySelector&&root.querySelector('.fb.no');if(fb&&!fb.querySelector('.lq-try')){var t=document.createElement('span');t.className='lq-try';t.textContent='Good try! Keep going.';var bb=fb.querySelector('b');if(bb)bb.appendChild(t);else fb.insertBefore(t,fb.firstChild)}
  if(!calm())[].forEach.call(root.querySelectorAll('.opt.no'),function(o){replay(o,'lq-wob')})}});

window.LQFeel={kick:kick,scale:scale,held:held,off:off,step:step,ground:ground,sfx:sfx,groundPass:groundPass,airPass:airPass,props:props,propPos:propPos,drawProp:drawProp,prompt:prompt,wind:wind,_dust:dust};
})();
