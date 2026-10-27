/* Graphics Phase 2 animation: water shimmer, ambient particles by biome, reward burst, rising labels, and step dust.
   Everything here is skipped when Low effects is on (window.LQFx.low) or reduced motion matches. Drawn in world space each frame, only for what is on screen;
   capped at about 30 updates a second and nothing runs while the tab is hidden (requestAnimationFrame pauses). No assets. */
(function(){
'use strict';
/* LQCelebrate: DOM confetti + a short cheer message for wins (level cleared, review round done).
   Respects prefers-reduced-motion and Low effects: then only the message shows, without movement. One overlay at a time, removed when done. */
var COLS=['#ffd25a','#f3e2b0','#8fcf9a','#7fd4ff','#ff9fb2','#c9a24f'],live=null;
function calm(){var FX=window.LQFx;try{return (FX&&FX.low)||window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return !!(FX&&FX.low)}}
function cheer(msg){if(!msg)return;var old=document.querySelector('.lq-cheer');if(old)old.remove();var c=document.createElement('div');c.className='lq-cheer';c.setAttribute('role','status');c.textContent=msg;document.body.appendChild(c);setTimeout(function(){c.remove()},calm()?2200:1900)}
function confetti(n){if(calm())return;if(live)live.remove();var box=document.createElement('div'),f=document.createDocumentFragment(),small=Math.min(innerWidth,innerHeight)<500;box.className='lq-confetti';box.setAttribute('aria-hidden','true');
 n=n||(small?36:60);for(var i=0;i<n;i++){var e=document.createElement('i'),st=e.style;st.left=(Math.random()*100).toFixed(1)+'%';st.background=COLS[i%COLS.length];
  st.setProperty('--x',((Math.random()-.5)*160).toFixed(0)+'px');st.setProperty('--r',(360+Math.random()*540).toFixed(0)+'deg');st.setProperty('--d',(1.2+Math.random()*1.1).toFixed(2)+'s');st.animationDelay=(Math.random()*.35).toFixed(2)+'s';if(i%3===0){st.width='8px';st.height='8px';st.borderRadius='50%'}f.appendChild(e)}
 box.appendChild(f);document.body.appendChild(box);live=box;setTimeout(function(){if(live===box){box.remove();live=null}},2900)}
/* LQVfx (round 2): screen-space light that brightens the scene for big moments. Pure DOM + CSS, no assets, one layer per effect, removed when done.
   beam(x,y): a warm shaft of light falling onto (x,y) with slowly turning god-rays and a floor glow (chest open).
   shockwave(x,y): a bright radial ring plus a soft bloom that washes over the screen (level clear).
   Calm mode (prefers-reduced-motion or Low effects): the same light appears as a still, soft glow that fades out, with no movement. */
var CSS='.lq-vfx{position:fixed;inset:0;z-index:49;pointer-events:none;overflow:hidden;contain:strict}'
+'.lq-vfx .glow{position:absolute;left:var(--x);top:var(--y);width:var(--g);height:var(--g);margin:calc(var(--g)/-2) 0 0 calc(var(--g)/-2);border-radius:50%;background:radial-gradient(circle,rgba(255,236,170,.75) 0,rgba(255,214,120,.35) 28%,rgba(255,200,90,.1) 55%,rgba(255,200,90,0) 70%);mix-blend-mode:screen;animation:lqvglow 1.9s ease-out forwards}'
+'.lq-vfx .shaft{position:absolute;left:var(--x);top:0;width:var(--w);height:var(--y);margin-left:calc(var(--w)/-2);background:linear-gradient(180deg,rgba(255,240,190,0) 0,rgba(255,236,170,.32) 45%,rgba(255,246,210,.85) 100%);filter:blur(6px);mix-blend-mode:screen;transform-origin:50% 100%;animation:lqvshaft 2.1s ease-out forwards}'
+'.lq-vfx .core{position:absolute;left:var(--x);top:0;width:calc(var(--w)*.28);height:var(--y);margin-left:calc(var(--w)*-.14);background:linear-gradient(180deg,rgba(255,255,240,0),rgba(255,255,240,.9));filter:blur(2px);mix-blend-mode:screen;animation:lqvshaft 1.7s ease-out forwards}'
+'.lq-vfx .rays{position:absolute;left:var(--x);top:var(--y);width:var(--r);height:var(--r);margin:calc(var(--r)/-2) 0 0 calc(var(--r)/-2);border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,232,160,.42) 0 5deg,rgba(255,232,160,0) 5deg 22deg);-webkit-mask:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 35%,transparent 68%);mask:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 35%,transparent 68%);mix-blend-mode:screen;animation:lqvrays 2.2s ease-out forwards}'
+'.lq-vfx .ring{position:absolute;left:var(--x);top:var(--y);width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:6px solid rgba(255,240,190,.95);box-shadow:0 0 24px 6px rgba(255,214,120,.8),inset 0 0 18px 4px rgba(255,214,120,.6);animation:lqvring 1.15s cubic-bezier(.15,.7,.3,1) forwards}'
+'.lq-vfx .ring.r2{border-width:3px;border-color:rgba(160,225,255,.85);box-shadow:0 0 18px 4px rgba(127,212,255,.6);animation-delay:.14s;opacity:0}'
+'.lq-vfx .wash{position:absolute;inset:0;background:radial-gradient(circle at var(--x) var(--y),rgba(255,236,170,.5) 0,rgba(255,214,120,.18) 30%,rgba(255,214,120,0) 65%);mix-blend-mode:screen;animation:lqvwash 1.6s ease-out forwards}'
+'.lq-vfx.calm *{animation:lqvcalm 2.2s linear forwards!important;transform:none!important}.lq-vfx.calm .ring,.lq-vfx.calm .rays{display:none}'
+'@keyframes lqvglow{0%{opacity:0;transform:scale(.4)}18%{opacity:1;transform:scale(1)}70%{opacity:.85}100%{opacity:0;transform:scale(1.15)}}'
+'@keyframes lqvshaft{0%{opacity:0;transform:scaleX(.2)}15%{opacity:1;transform:scaleX(1)}65%{opacity:.8;transform:scaleX(.85)}100%{opacity:0;transform:scaleX(.5)}}'
+'@keyframes lqvrays{0%{opacity:0;transform:rotate(0) scale(.5)}20%{opacity:1;transform:rotate(12deg) scale(1)}100%{opacity:0;transform:rotate(55deg) scale(1.1)}}'
+'@keyframes lqvring{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(var(--k,18))}}'
+'@keyframes lqvwash{0%{opacity:0}15%{opacity:1}100%{opacity:0}}'
+'@keyframes lqvcalm{0%,75%{opacity:.7}100%{opacity:0}}';
function vfxLayer(kind,x,y,html,ms){if(!document.getElementById('lq-vfx-css')){var s=document.createElement('style');s.id='lq-vfx-css';s.textContent=CSS;document.head.appendChild(s)}
 var old=document.querySelector('.lq-vfx.'+kind);if(old)old.remove();var d=document.createElement('div'),m=Math.min(innerWidth,innerHeight);d.className='lq-vfx '+kind+(calm()?' calm':'');d.setAttribute('aria-hidden','true');
 if(x==null)x=innerWidth/2;if(y==null)y=innerHeight/2;var st=d.style;st.setProperty('--x',Math.round(x)+'px');st.setProperty('--y',Math.round(y)+'px');st.setProperty('--g',Math.round(m*.7)+'px');st.setProperty('--r',Math.round(m*.95)+'px');st.setProperty('--w',Math.round(Math.max(70,m*.16))+'px');
 st.setProperty('--k',(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))/20*1.05).toFixed(1));d.innerHTML=html;document.body.appendChild(d);
 /* r6: the WebGL pass (below) turns this effect into real light on the ground while it plays */
 var FL=window.LQFxLights||(window.LQFxLights=[]);FL.push({k:kind,x:x,y:y,t0:performance.now()});if(FL.length>4)FL.shift();setTimeout(function(){d.remove()},ms||2400);return d}
function beam(x,y){return vfxLayer('beam',x,y,'<div class="rays"></div><div class="shaft"></div><div class="core"></div><div class="glow"></div>',2500)}
function shockwave(x,y){return vfxLayer('shock',x,y,'<div class="wash"></div><div class="glow"></div><div class="ring"></div><div class="ring r2"></div>',2400)}
/* gate(x,y): a soft warm glow that blooms and fades where a gate opens (no ring). Calm mode shows it still. */
function gate(x,y){return vfxLayer('gate',x,y,'<div class="wash"></div><div class="glow"></div>',2200)}
window.LQVfx={beam:beam,shockwave:shockwave,gate:gate};
function celebrate(msg,opts){opts=opts||{};if(opts.vfx==='beam')beam(opts.x,opts.y);else if(opts.vfx==='shockwave')shockwave(opts.x,opts.y);else if(opts.vfx==='gate')gate(opts.x,opts.y);if(opts.confetti!==false)confetti(opts.count);cheer(msg)}
/* small helper: replay a one-shot CSS animation class on an element */
function pop(el,cls){if(!el||calm())return;cls=cls||'lq-pop';el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
window.LQCelebrate={celebrate:celebrate,beam:beam,shockwave:shockwave,gate:gate,confetti:confetti,cheer:cheer,pop:pop,calm:calm};
/* any script can fire: document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:{msg:'Level cleared!',vfx:'shockwave'}}))
   detail: msg, vfx ('beam'|'shockwave'|'gate'), x/y (screen px; default centre), confetti (false to skip), count */
document.addEventListener('lq:celebrate',function(e){var d=e.detail||{};celebrate(d.msg,d)});
})();
(function(){
'use strict';
var Art=window.Art,FX=window.LQFx;if(!Art||!FX)return;
var S=Art.S,hx=Art.hx,hy=Art.hy,hash=Art.hash;
function waterList(sc){if(sc._wl)return sc._wl;var l=[];for(var c=0;c<sc.cols;c++)for(var r=0;r<sc.rows;r++)if(sc.t[c][r]==='water')l.push([hx(c,r),hy(r),hash(c,r,99)]);sc._wl=l;return l}
function skip(){return FX.low||(FX.rm&&FX.rm.matches)}
function zap(){parts.length=0;bursts.length=0;rings.length=0;floats.length=0;puffs.length=0}
/* water: two drifting highlight strokes and an occasional glint per visible water tile.
   Long lists skip the glint sine unless the phase is near the peak, so a glint still fires at the same threshold. */
function water(g,sc,T,cx,cy,vw,vh,map){if(skip()){zap();return}var l=waterList(sc);if(!l.length)return;g.save();g.lineCap='round';g.lineWidth=1.3;g.strokeStyle='rgb(225,244,255)';g.fillStyle='rgb(255,252,235)';
 var long=l.length>48;
 for(var i=0;i<l.length;i++){var w=l[i],x=w[0],y=w[1];if(map){var m=map(x,y);x=m[0];y=m[1]}if(x<cx-S*2||x>cx+vw+S*2||y<cy-S*2||y>cy+vh+S*2)continue;var ph=w[2]*6.28;
  for(var k=0;k<2;k++){var a=.07+.09*(.5+.5*Math.sin(T*1.3+ph+k*2.1)),dx=Math.sin(T*.45+ph+k)*S*.22,yy=y-S*.22+k*S*.42+Math.sin(T*.8+ph)*1.5,xx=x-S*.18+k*S*.3+dx;
   g.globalAlpha=a;g.beginPath();g.moveTo(xx-7,yy);g.quadraticCurveTo(xx,yy-2.6,xx+7,yy);g.stroke()}
  var th=T*2.2+ph*3,show=!long;if(!show){var m=th%6.283185307179586;show=m>1.12&&m<2.02}
  if(show){var gl=Math.sin(th);if(gl>.92){g.globalAlpha=(gl-.92)*8;g.beginPath();g.arc(x+(w[2]-.5)*S*.8,y+(w[2]*7%1-.5)*S*.6,1.6,0,6.3);g.fill()}}}
 g.restore();g.globalAlpha=1}
/* ambient particles */
var KIND={meadow:{n:22,col:'243,226,176',sz:1.9,vy:-6,vx:5,glow:false},forest:{n:24,col:'214,240,140',sz:2.0,vy:-3,vx:4,glow:true},hills:{n:20,col:'243,226,176',sz:1.8,vy:-5,vx:7,glow:false},desert:{n:26,col:'226,196,140',sz:1.6,vy:-1,vx:22,glow:false},
 tundra:{n:34,col:'250,252,255',sz:2.1,vy:16,vx:4,glow:false},marsh:{n:24,col:'200,240,170',sz:2.0,vy:-2,vx:3,glow:true},highland:{n:20,col:'220,228,240',sz:1.8,vy:-4,vx:9,glow:false},crown:{n:22,col:'243,215,138',sz:2.0,vy:-7,vx:3,glow:true}};
var parts=[],pk=null,bursts=[],rings=[],floats=[],puffs=[],acc=0,small=Math.min(screen.width||999,screen.height||999)<500;
function seedParts(k,cx,cy,vw,vh){var K=KIND[k]||KIND.meadow,n=Math.round(K.n*(small?.6:1));parts=[];for(var i=0;i<n;i++)parts.push({x:cx+Math.random()*vw,y:cy+Math.random()*vh,p:Math.random()*6.28,s:.6+Math.random()*.8});pk=k}
function step(dt,k,cx,cy,vw,vh,T){var K=KIND[k]||KIND.meadow,i,q,j,b,n,p;
 for(i=0;i<parts.length;i++){q=parts[i];q.x+=(K.vx*q.s+Math.sin(T*.7+q.p)*6)*dt;q.y+=(K.vy*q.s+Math.cos(T*.9+q.p)*4)*dt;
  if(q.x<cx-10)q.x+=vw+20;else if(q.x>cx+vw+10)q.x-=vw+20;if(q.y<cy-10)q.y+=vh+20;else if(q.y>cy+vh+10)q.y-=vh+20}
 for(j=bursts.length-1;j>=0;j--){b=bursts[j];b.t+=dt;if(b.t>1.3){bursts.splice(j,1);continue}for(n=0;n<b.ps.length;n++){p=b.ps[n];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt}}
 for(j=rings.length-1;j>=0;j--){rings[j].t+=dt;if(rings[j].t>.7)rings.splice(j,1)}
 for(j=floats.length-1;j>=0;j--){floats[j].t+=dt;if(floats[j].t>1.15)floats.splice(j,1)}
 for(j=puffs.length-1;j>=0;j--){b=puffs[j];b.t+=dt;if(b.t>.4){puffs.splice(j,1);continue}for(n=0;n<b.ps.length;n++){p=b.ps[n];p.x+=p.vx*dt;p.y+=p.vy*dt}}}
function star(g,p,a){var L=p.r*(1.3+a*2.2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-L,-.75,L*2,1.5);g.rotate(1.5707963);g.fillRect(-L,-.75,L*2,1.5);g.restore()}
function particles(g,k,dtRaw,cx,cy,vw,vh,T){if(skip()){zap();glows.length=0;return}if(pk!==k||!parts.length)seedParts(k,cx,cy,vw,vh);
 acc+=dtRaw;if(acc>=1/30){step(Math.min(acc,.1),k,cx,cy,vw,vh,T);acc=0}
 var K=KIND[k]||KIND.meadow,i,q,j,b,n,p,a,tw;g.save();g.fillStyle='rgb('+K.col+')';
 for(i=0;i<parts.length;i++){q=parts[i];tw=K.glow?.35+.65*Math.max(0,Math.sin(T*1.7+q.p*3)):.55+.3*Math.sin(T+q.p);
  if(K.glow&&tw>.5){g.globalAlpha=.12*tw;g.beginPath();g.arc(q.x,q.y,K.sz*3.4*q.s,0,6.3);g.fill()}
  g.globalAlpha=.75*tw;g.beginPath();g.arc(q.x,q.y,K.sz*q.s,0,6.3);g.fill()}
 g.fillStyle='rgb(243,226,176)';
 for(j=0;j<bursts.length;j++){b=bursts[j];a=Math.max(0,1-b.t/1.3);g.globalAlpha=a;
  for(n=0;n<b.ps.length;n++){p=b.ps[n];if(p.star)star(g,p,a);else{g.beginPath();g.arc(p.x,p.y,p.r*(.6+a*.6),0,6.3);g.fill()}}
  g.globalAlpha=a*.8;g.fillStyle='rgb(255,255,255)';for(n=0;n<b.ps.length;n++){p=b.ps[n];g.fillRect(p.x-.5,p.y-.5,1,1)}g.fillStyle='rgb(243,226,176)'}
 g.lineWidth=2;g.strokeStyle='rgb(243,226,176)';
 for(i=0;i<rings.length;i++){b=rings[i];a=Math.max(0,1-b.t/.7);g.globalAlpha=a;g.beginPath();g.arc(b.x,b.y,8+b.t*78,0,6.283185307179586);g.stroke()}
 g.fillStyle='rgb(180,150,100)';
 for(j=0;j<puffs.length;j++){b=puffs[j];a=Math.max(0,1-b.t/.4);g.globalAlpha=a;for(n=0;n<b.ps.length;n++){p=b.ps[n];g.beginPath();g.arc(p.x,p.y,p.r,0,6.3);g.fill()}}
 if(floats.length){g.font='800 16px Nunito, system-ui, sans-serif';g.textAlign='center';g.lineWidth=3;g.lineJoin='round';g.strokeStyle='#0a0f15';g.fillStyle='#f3e2b0';
  for(i=0;i<floats.length;i++){var f=floats[i],u=f.t/1.15;a=u<2/3?1:Math.max(0,(1-u)*3);g.globalAlpha=a;var yy=f.y-36*u;g.strokeText(f.s,f.x,yy);g.fillText(f.s,f.x,yy)}}
 g.restore();g.globalAlpha=1;fillGlows(k)}
function burst(x,y){if(skip()){zap();return}var ps=[];for(var i=0;i<16;i++){var a=Math.random()*6.283185,v=40+Math.random()*90;ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,r:1.2+Math.random()*1.8,star:i<7,rot:Math.random()*1.57})}
 bursts.push({t:0,ps:ps,x:x,y:y});if(bursts.length>4)bursts.shift();rings.push({x:x,y:y,t:0});if(rings.length>3)rings.shift()}
function floatText(x,y,text){if(skip()){zap();return}if(text==null||text==='')return;text=String(text).slice(0,18);if(!text)return;floats.push({x:x,y:y,t:0,s:text});if(floats.length>5)floats.shift()}
function puff(x,y){if(skip()){zap();return}var ps=[];for(var i=0;i<5;i++){var a=Math.random()*6.283185,sp=8+Math.random()*14;ps.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.4-8,r:.6+Math.random()*.8})}
 puffs.push({t:0,ps:ps});if(puffs.length>8)puffs.shift()}
/* A few glow spots the WebGL pass can turn into real light. World coordinates. [x,y,r,colour,kind]: kind 3 is a glow the bloom picks up, 0 a pool on the ground.
   r6: a sparkle burst also lights the ground under it (the burst sits about a body height above the feet). */
var glows=[];
function fillGlows(k){glows.length=0;var K=KIND[k]||KIND.meadow,i,j;
 for(j=0;j<bursts.length&&glows.length<4;j++){var b=bursts[j];if(b.t<1.1){var f=1-b.t/1.3;glows.push([b.x,b.y,72*f,[0.46,0.32,0.1],3]);glows.push([b.x,b.y+S*.95,96*f,[0.3*f,0.22*f,0.08*f],0])}}
 if(K.glow){for(i=0;i<parts.length&&glows.length<8;i+=4)glows.push([parts[i].x,parts[i].y,26,[0.2,0.26,0.08],3])}}
/* round 2b ambient light (full effects only; off for Low effects and reduced motion):
   pools(): warm lamplight pools on the ground around houses, halls and towns, breathing gently, added with 'lighter' so they light the paint.
   fireflies(): a few soft glowing motes drifting on fixed sine paths near the edges of the view (stateless, cheap). */
var POOL=null;function poolSprite(){if(POOL)return POOL;var c=document.createElement('canvas'),R=64;c.width=c.height=R*2;var x=c.getContext('2d'),gr=x.createRadialGradient(R,R,0,R,R,R);
 gr.addColorStop(0,'rgba(255,190,100,.85)');gr.addColorStop(.4,'rgba(255,165,75,.35)');gr.addColorStop(1,'rgba(255,150,60,0)');x.fillStyle=gr;x.fillRect(0,0,R*2,R*2);POOL=c;return c}
var LIT={building:1,node:1};
function pools(g,sc,T,cx,cy,vw,vh){if(FX.low||(FX.rm&&FX.rm.matches)||!sc||!sc.objs)return;var sp=poolSprite();g.save();g.globalCompositeOperation='lighter';
 for(var i=0;i<sc.objs.length;i++){var o=sc.objs[i];if(!LIT[o.type]&&o.role!=='hall')continue;var x=hx(o.c,o.r),y=hy(o.r);if(x<cx-S*2||x>cx+vw+S*2||y<cy-S*2||y>cy+vh+S*2)continue;
  var big=o.role==='hall'||o.kind==='castle',r=S*(big?1.9:1.45)*(1+.04*Math.sin(T*1.6+o.c*1.3+o.r)),a=.55+.12*Math.sin(T*2.3+o.c*2.1)+.06*Math.sin(T*7.1+o.r);
  g.globalAlpha=Math.max(0,Math.min(1,a));g.drawImage(sp,x-r,y+S*.15-r*.62,r*2,r*1.24)}
 g.restore()}
function fireflies(g,sc,T,cx,cy,vw,vh){if(FX.low||(FX.rm&&FX.rm.matches))return;var n=small?8:14;g.save();g.globalCompositeOperation='lighter';
 for(var i=0;i<n;i++){var h1=hash(i,7,3),h2=hash(i,9,5),u=(h1+T*.012*(h2+.4))%1,v=(h2+.5*Math.sin(T*.21+i)+.5)%1;
  var x=cx+u*vw+Math.sin(T*.9+i*2.3)*14,y=cy+(.2+.75*v)*vh+Math.cos(T*1.1+i)*10,on=Math.max(0,Math.sin(T*(1.1+h1)+i*1.7));if(on<.15)continue;
  g.globalAlpha=.16*on;g.fillStyle='#ffe58a';g.beginPath();g.arc(x,y,6,0,6.3);g.fill();g.globalAlpha=.9*on;g.fillStyle='#fff6c0';g.beginPath();g.arc(x,y,1.5,0,6.3);g.fill()}
 g.restore()}
/* r6: cheap warm lamplight for when the WebGL light pass is off (the speed guard tripped on a slow phone, or no WebGL).
   lamps2d(g,lights): the same light list world.js packs for the GL pass (canvas px), drawn as soft pool sprites with 'lighter'.
   At most 10 sprites, no per-pixel work, so a slow phone still gets warm pools under lamps, windows and the hero. Still when calm. */
function lamps2d(g,L){if(FX.low||!g||!L||!L.length)return;var sp=poolSprite(),n=0,i,l,m,r,yo;g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';
 for(i=0;i<L.length&&n<10;i++){l=L[i];m=Math.max(l.c[0],l.c[1],l.c[2]);if(m<0.05)continue;r=l.r*(l.k===3?0.7:1.05);yo=l.k===1?l.r*0.55:l.k===2?l.r*0.2:0;
  g.globalAlpha=Math.min(0.7,m*(l.p===0?1.1:1.5));g.drawImage(sp,l.x-r,l.y+yo-r*0.62,r*2,r*1.24);n++}
 g.restore()}
window.LQAnim={water:water,particles:particles,burst:burst,floatText:floatText,puff:puff,glows:glows,pools:pools,fireflies:fireflies,lamps2d:lamps2d};
})();
/* WebGL colour grade, gold glow, point lights, contact shadows and region atmosphere over the painted world.
   The 2D canvas stays the map. This canvas (#lqgl) covers it and ignores taps.
   Low effects hides the pass. No new dependency. If the shader cannot link, the caller keeps the old canvas light.
   Round 4 (light and atmosphere): each biome has an atmosphere (mist, sun shafts, a little dusk, a soft far-band focus,
   a tinted vignette). Mist is anchored to the world in two layers that scroll at different speeds, so the ground reads deeper
   as the camera moves. Lamps burn through the mist. Each figure gets a tight contact shadow at the feet under its soft cast.
   Calm (reduced motion) passes t=0, so mist and shafts hold still. The atmosphere eases between biomes; calm snaps.
   Round 6 (light and bloom):
   - Light kinds (lights[i].k): 0 plain pool, 1 window (a soft cone of light falls from it), 2 flame (flickers; a halo and a
     faint rising column in the mist), 3 glow (an emissive thing: crystal, chest glint, staff orb, sparkle, gatekeeper aura).
   - Selective bloom: a bright-pass that only keeps pixels near kinds 1-3 (plus each emitter's own core), drawn into a small
     target (a quarter of the canvas, long side at most 480px; on a phone at most 192px, refreshed every other frame) and blurred there. The grade and the
     ambient level are untouched; bloom only adds light around things that glow.
   - Cones, flame columns and halos scatter more where the mist is thicker, and the mist near a lamp takes the lamp's colour.
   - Chest beams, shockwaves, gate glows (LQVfx), sparkle bursts and footstep embers in lamp pools light the ground.
   - Flames flicker (colour and a little radius, mean unchanged). Shallow water gets soft moving caustics (still when calm).
   - One key light: cast shadows lean along KEY (the same 9:4.2 lean Art.figure paints) and the sun shafts share its azimuth.
   Calm (reduced motion): no flicker, no embers, caustics and mist hold still, the VFX light shows as a still glow that fades. */
(function(){
'use strict';
var GRADES={
 'python-basics':{lift:[0.01,0.03,0.006],gain:[0.96,1.06,0.92],shade:[0.9,1.02,0.9],sat:1.08,glow:0.24,far:0.12},
 'ai-foundations':{lift:[0.036,0.014,0.004],gain:[1.06,0.96,0.86],shade:[1.02,0.9,0.8],sat:1.05,glow:0.18,far:0.12},
 'ai-evals':{lift:[0.006,0.014,0.04],gain:[0.9,0.98,1.08],shade:[0.84,0.94,1.08],sat:1.04,glow:0.16,far:0.14},
 'ai-safety':{lift:[0.038,0.016,0.01],gain:[1.05,0.93,0.84],shade:[1.04,0.88,0.78],sat:0.94,glow:0.16,far:0.13},
 'portfolio-guide':{lift:[0.008,0.032,0.012],gain:[0.92,1.06,0.94],shade:[0.88,1.02,0.92],sat:1.03,glow:0.26,far:0.11},
 home:{lift:[0.016,0.016,0.006],gain:[1.02,1.0,0.94],shade:[0.96,0.94,0.88],sat:1.04,glow:0.18,far:0.08}
},FALL={lift:[0.014,0.014,0.01],gain:[1,1,1],shade:[0.96,0.94,0.9],sat:1,glow:0.16,far:0.1};
/* Atmosphere by biome. a: [mist, shafts, dusk, far focus]. m: mist colour. r: shaft colour. k: contrast. v: vignette tint strength.
   r6 (Jensen, 27 Oct: "Noted. You may proceed with your recommendation."): the base is the warm, encouraging look for every region,
   with no dusk (round 4 had 0.012 to 0.072 everywhere). Mood is added only in the later half of a course (see MOOD and lateness()). */
var ATM={
 meadow:{a:[0.12,0.18,0.0,0.55],m:[0.86,0.9,0.78],r:[1.0,0.9,0.62],k:0.12,v:0.12},
 forest:{a:[0.18,0.26,0.0,0.6],m:[0.64,0.78,0.62],r:[0.98,0.93,0.6],k:0.14,v:0.15},
 hills:{a:[0.14,0.16,0.0,0.6],m:[0.8,0.85,0.92],r:[1.0,0.9,0.66],k:0.13,v:0.13},
 desert:{a:[0.09,0.14,0.0,0.45],m:[0.96,0.84,0.62],r:[1.0,0.86,0.55],k:0.1,v:0.11},
 tundra:{a:[0.18,0.08,0.0,0.55],m:[0.9,0.95,1.0],r:[0.86,0.93,1.0],k:0.1,v:0.12},
 marsh:{a:[0.18,0.08,0.0,0.6],m:[0.72,0.84,0.78],r:[0.92,0.95,0.8],k:0.12,v:0.14},
 highland:{a:[0.16,0.12,0.0,0.6],m:[0.78,0.82,0.93],r:[0.94,0.9,0.8],k:0.12,v:0.14},
 crown:{a:[0.1,0.22,0.0,0.5],m:[0.95,0.88,0.7],r:[1.0,0.86,0.5],k:0.14,v:0.13},
 home:{a:[0.0,0.06,0.0,0.0],m:[0.9,0.88,0.8],r:[1.0,0.9,0.62],k:0.08,v:0.0}
},
/* Mood at full lateness: a: added [mist, shafts, dusk, 0], m: mist colour it leans to, v: added vignette tint. Dusk dims the darks, and the pass gives
   the light back in the mids, the highlights and the lamps (see the shader), so the average brightness does not drop. Nothing goes dark or scary. */
MOOD={
 marsh:{a:[0.1,0.0,0.07,0],m:[0.62,0.76,0.76],v:0.06},
 highland:{a:[0.07,0.0,0.06,0],m:[0.72,0.77,0.92],v:0.05},
 tundra:{a:[0.05,0.0,0.035,0],m:[0.84,0.9,1.0],v:0.03},
 forest:{a:[0.04,0.0,0.04,0],m:[0.58,0.74,0.6],v:0.04},
 hills:{a:[0.03,0.0,0.03,0],m:[0.76,0.82,0.92],v:0.03},
 desert:{a:[0.0,0.0,0.015,0],m:[0.96,0.84,0.62],v:0.01},
 meadow:{a:[0.0,0.0,0.01,0],m:[0.86,0.9,0.78],v:0.01},
 crown:{a:[0.0,0.0,0.02,0],m:[0.95,0.88,0.7],v:0.02}
},cur=null,tgt={a:[0,0,0,0],m:[0,0,0],r:[0,0,0],k:0,v:0};
/* lateness: 0 for the first third of a course, rising smoothly to 1 at the last region and the castle. p = region index / (regions - 1). */
function lateness(p){var t=Math.max(0,Math.min(1,((p||0)-0.35)/0.65));return t*t*(3-2*t)}
function atmTarget(b,late){var B=ATM[b]||ATM.meadow,M=MOOD[b],w=M?lateness(late):0,i;
 for(i=0;i<4;i++)tgt.a[i]=B.a[i]+(M?M.a[i]*w:0);for(i=0;i<3;i++){tgt.m[i]=B.m[i]+(M?(M.m[i]-B.m[i])*w:0);tgt.r[i]=B.r[i]}tgt.k=B.k;tgt.v=B.v+(M?M.v*w:0);return tgt}
function ease(t,calm){var k=calm||!cur?1:0.06,i;if(!cur){cur={a:t.a.slice(),m:t.m.slice(),r:t.r.slice(),k:t.k,v:t.v}}
 for(i=0;i<4;i++)cur.a[i]+=(t.a[i]-cur.a[i])*k;for(i=0;i<3;i++){cur.m[i]+=(t.m[i]-cur.m[i])*k;cur.r[i]+=(t.r[i]-cur.r[i])*k}cur.k+=(t.k-cur.k)*k;cur.v+=(t.v-cur.v)*k;return cur}
/* One key light from the upper left. KEY is the ground lean of a cast shadow on screen (Art.figure paints its cast at 9:4.2,
   and world.js offsets the GL cast the same way). The sun shafts fall along the same azimuth, a little steeper because they come down through the air. */
var KEY=(function(){var l=Math.sqrt(81+4.2*4.2);return [9/l,4.2/l]})(),SHAFT=(function(){var x=KEY[0],y=KEY[1]+0.5,l=Math.sqrt(x*x+y*y);return [x/l,y/l]})();
var cvs,gl,prog,buf,tex,ntex,locs,failed=false,err='',nL=0,nS=0,px,pc,hs,watch=null,lastProbe=null;
var bp=null,blp=null,bt=[],black=null,bloomOff=false,ex=new Float32Array(24),ec=new Float32Array(24),stats={bloom:[0,0],passes:0,emit:0};
function fsSrc(L,S,VOL){
 return 'precision mediump float;'
 +'uniform sampler2D uS;uniform sampler2D uNz;uniform sampler2D uBl;uniform vec3 uLift;uniform vec3 uGain;uniform vec3 uShade;uniform vec4 uMisc;uniform vec2 uRes;uniform vec3 uP['+L+'];uniform vec4 uC['+L+'];uniform vec3 uH['+S+'];'
 +'uniform vec4 uAtm;uniform vec3 uMistC;uniform vec3 uRayC;uniform vec4 uCam;uniform vec4 uTone;uniform vec4 uKey;uniform vec4 uFx;varying vec2 v;'
 +'float gold(vec3 c){float y=dot(c,vec3(0.299,0.587,0.114));float w=smoothstep(0.42,0.82,c.r)*smoothstep(0.28,0.7,c.g);float nb=1.0-smoothstep(0.36,0.52,c.b);return w*nb*smoothstep(0.28,0.72,y);}'
 +'void main(){vec2 uv=vec2(v.x,1.0-v.y);vec2 p=uv*uRes;float far=smoothstep(0.2,0.92,1.0-uv.y);vec2 w=p/uCam.z;float tt=uMisc.w;'
 +'vec2 px=vec2(5.0)/uRes;vec3 src=texture2D(uS,uv).rgb;vec3 t1=texture2D(uS,uv+vec2(px.x,0.0)).rgb;vec3 t2=texture2D(uS,uv-vec2(px.x,0.0)).rgb;vec3 t3=texture2D(uS,uv+vec2(0.0,px.y)).rgb;vec3 t4=texture2D(uS,uv-vec2(0.0,px.y)).rgb;'
 /* far-band focus: the top of the frame is further away, so it softens a little (reuses the glow taps) */
 +'float dof=uAtm.w*smoothstep(0.35,1.0,far);vec3 col=mix(src,(src*2.0+t1+t2+t3+t4)/6.0,dof);'
 +'float l=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(l),col,uMisc.x);col=mix(col,col*uShade,smoothstep(0.62,0.08,l)*0.38);col=col*uGain+uLift*(1.0-l);'
 +'col=mix(col,col*col*(3.0-2.0*col),uTone.x);'
 +'col=mix(col,col*vec3(0.8,0.86,1.0),far*uMisc.z);'
 +'float b=gold(src)+gold(t1)+gold(t2)+gold(t3)+gold(t4);col+=vec3(1.0,0.78,0.34)*(b*0.2)*uMisc.y;'
 /* lights. k (uC.w): 1 window cone falling below the light, 2 flame halo and a faint rising column. vol only shows through the mist (below). */
 +'vec3 light=vec3(0.0);vec3 vol=vec3(0.0);for(int i=0;i<'+L+';i++){float on=step(float(i)+0.5,uCam.w);vec2 d=p-uP[i].xy;float r=max(uP[i].z,1.0);float nd=length(d)/r;float a=clamp(1.0-nd,0.0,1.0);float hot=clamp(1.0-nd*3.4,0.0,1.0);vec3 c=uC[i].rgb*on;light+=c*(a*a+hot*hot*0.36);float k=uC[i].w;'
 +(VOL?'if(k>0.5&&k<1.5){float al=d.y/(r*2.1);float sp=abs(d.x-d.y*0.24)/(r*(0.16+0.6*clamp(al,0.0,1.0)));vol+=c*(step(0.0,al)*smoothstep(0.0,0.12,al)*(1.0-smoothstep(0.2,1.0,al))*(1.0-smoothstep(0.3,1.0,sp)));}'
 +'else if(k>1.5&&k<2.5){float up=-d.y/(r*1.2);vol+=c*(step(0.0,up)*(1.0-smoothstep(0.0,1.0,up))*exp(-abs(d.x)/(r*0.13))*0.75+a*a*a*0.6);}}':'}')
 /* dusk (later regions only) dims the darks; the mids, highlights and lamps get it back, so the average stays put. Lamps light the paint a little more than in r4 (1.75 vs 1.5) so pools still read now the early regions have no dusk */
 +'col=col*(1.0-uAtm.z)+col*(uAtm.z*1.7*smoothstep(0.3,0.75,l))+col*light*(1.75+uAtm.z*4.0)+light*(0.6+uAtm.z*1.5);'
 /* cast shadows lean along the key light (uKey.xy); the tight contact sits at the feet */
 +'vec2 kd=uKey.xy;vec2 kn=vec2(-kd.y,kd.x);float sh=1.0;for(int i=0;i<'+S+';i++){float on=step(float(i)+0.5,uTone.w);float r=max(uH[i].z,1.0);vec2 f=uH[i].xy-kd*(0.66*r);vec2 sd=p-f-kd*(0.6*r);float su=dot(sd,kd)/(r*1.02);float sv=dot(sd,kn)/(r*0.4);float e=clamp(1.0-su*su-sv*sv,0.0,1.0);'
 +'vec2 cd=(p-f)/vec2(r*0.62,r*0.2);float ce=clamp(1.0-dot(cd,cd),0.0,1.0);sh*=(1.0-e*e*0.40*on)*(1.0-ce*ce*0.42*on);}col*=sh;'
 /* soft caustics on shallow (light blue) water, anchored to the world. Mean-neutral: the dark between the lines takes back what the lines add. */
 +'float wm=clamp((src.b-src.r)*3.2-0.25,0.0,1.0)*smoothstep(0.26,0.46,l)*(1.0-smoothstep(0.8,0.95,l))*uFx.y;'
 +(VOL?'':'wm=0.0;')+'if(wm>0.004){vec2 cw=(w+uCam.xy)/190.0;float c1=texture2D(uNz,cw+vec2(tt*0.011,tt*0.007)).g;float c2=texture2D(uNz,cw*1.37+vec2(0.31-tt*0.009,0.17+tt*0.012)).b;float ca=smoothstep(0.9,0.99,1.0-abs(c1-c2));col+=(vec3(0.8,0.97,0.92)*ca-0.035)*wm;}'
 /* world-anchored mist: a far layer that scrolls slower than the ground and a near layer that scrolls faster (parallax) */
 +'float lum=dot(light,vec3(0.4,0.4,0.2));'
 +'float n1=texture2D(uNz,(w+uCam.xy*0.82)/540.0+vec2(tt*0.006,tt*0.002)).r;float n2=texture2D(uNz,(w+uCam.xy*0.82)/230.0-vec2(tt*0.004,-tt*0.003)).g;'
 +'float md=smoothstep(0.38,0.86,n1*0.66+n2*0.34);float m=md*mix(0.3,1.0,far);'
 +'if(uTone.z>0.5){float n3=texture2D(uNz,(w+uCam.xy*1.22)/300.0+vec2(tt*0.012,tt*0.004)).b;m+=smoothstep(0.55,0.92,n3)*smoothstep(0.62,1.0,uv.y)*0.55;}'
 /* mist pools over water and the low night around the island; lamps burn through it and the mist left near a lamp takes its colour */
 +'float low=clamp((src.b-src.r)*2.4+(0.34-l)*1.6,0.0,1.0);m*=uAtm.x*(0.5+0.7*low)*(1.0-clamp(lum*2.6,0.0,0.85));col=mix(col,uMistC*(0.82+0.18*l)'+(VOL?'+light*0.9*uFx.z':'')+',clamp(m,0.0,0.5));'
 /* volumetric look: cones and flame columns scatter in the air, more where the mist is thicker; streaks drift slowly */
 +(VOL?'float sn=texture2D(uNz,vec2(p.x/uRes.y*2.4+tt*0.005,0.71)).a;col+=vol*uFx.z*(0.3+md*(0.5+uAtm.x*4.0))*(0.6+0.8*sn)*(1.0-col*0.55);':'')
 /* sun shafts from the upper left (the key light), fading as they fall */
 +'vec2 q=p/uRes.y;vec2 dir=uKey.zw;float s=dot(q,vec2(dir.y,-dir.x));float al=dot(q,dir);'
 +'float sh2=texture2D(uNz,vec2(s*1.7+tt*0.004,0.37)).a;float ray=smoothstep(0.52,0.95,sh2)*(1.0-smoothstep(0.1,1.25,al))*mix(0.45,1.0,far)*uAtm.y*(0.25+0.75*smoothstep(0.12,0.5,l));'
 +'col=col+uRayC*ray*(1.0-col);'
 /* selective bloom (emitters only), added like light: brighter colours take less */
 +'vec3 bl=texture2D(uBl,v).rgb*uFx.x;col+=bl*(1.0-col*0.6);'
 /* tinted vignette: the corners lean toward a dark version of the region mist */
 +'vec2 vc=(uv-0.5)*vec2(1.0,1.12);float vg=smoothstep(0.32,0.78,length(vc));col=mix(col,col*mix(vec3(1.0),uMistC*0.55,0.8),vg*uTone.y);'
 +'gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);}';
}
/* Bloom bright-pass, drawn at low resolution: four bilinear taps of the frame (a 4x4 box), kept only near an emitter, plus each emitter's own core. */
var BP='precision mediump float;uniform sampler2D uS;uniform vec2 uRes;uniform vec2 uTx;uniform vec3 uE[8];uniform vec3 uEC[8];uniform float uN;varying vec2 v;'
 +'void main(){vec2 uv=vec2(v.x,1.0-v.y);vec2 p=uv*uRes;vec3 c=(texture2D(uS,uv+uTx).rgb+texture2D(uS,uv-uTx).rgb+texture2D(uS,uv+vec2(uTx.x,-uTx.y)).rgb+texture2D(uS,uv+vec2(-uTx.x,uTx.y)).rgb)*0.25;'
 +'float mk=0.0;vec3 core=vec3(0.0);for(int i=0;i<8;i++){float on=step(float(i)+0.5,uN);float r=max(uE[i].z,1.0);float nd=length(p-uE[i].xy)/r;float a=clamp(1.0-nd,0.0,1.0);mk+=a*a*on;float h=clamp(1.0-nd*2.2,0.0,1.0);core+=uEC[i]*(h*h*on);}'
 +'float y=dot(c,vec3(0.299,0.587,0.114));vec3 br=max(c-vec3(0.46),0.0)*1.9*smoothstep(0.42,0.78,y);gl_FragColor=vec4(br*clamp(mk,0.0,1.0)+core,1.0);}';
/* Separable 9-tap gaussian as five bilinear taps. */
var BL='precision mediump float;uniform sampler2D uT;uniform vec2 uD;varying vec2 v;'
 +'void main(){vec3 c=texture2D(uT,v).rgb*0.227027;c+=(texture2D(uT,v+uD*1.384615).rgb+texture2D(uT,v-uD*1.384615).rgb)*0.316216;c+=(texture2D(uT,v+uD*3.230769).rgb+texture2D(uT,v-uD*3.230769).rgb)*0.070270;gl_FragColor=vec4(c,1.0);}';
var VS='attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}';
function shader(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){err=gl.getShaderInfoLog(s)||'shader';return null}return s}
function program(fs){var a=shader(gl.VERTEX_SHADER,VS),b=shader(gl.FRAGMENT_SHADER,fs);if(!a||!b)return null;var p=gl.createProgram();gl.attachShader(p,a);gl.attachShader(p,b);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){err=gl.getProgramInfoLog(p)||'link';return null}return p}
var UN=['uS','uNz','uBl','uLift','uGain','uShade','uMisc','uRes','uAtm','uMistC','uRayC','uCam','uTone','uKey','uFx'];
function link(L,S){err='';var p=program(fsSrc(L,S,!phone()));/* phone (VOL off): no per-light cones or flame columns, no lit mist, no caustics, so the per-pixel cost stays near round 5 */if(!p)return false;
 prog=p;nL=L;nS=S;px=new Float32Array(L*3);pc=new Float32Array(L*4);hs=new Float32Array(S*3);locs={};
 UN.forEach(function(n){locs[n]=gl.getUniformLocation(p,n)});locs.uP=gl.getUniformLocation(p,'uP[0]');locs.uC=gl.getUniformLocation(p,'uC[0]');locs.uH=gl.getUniformLocation(p,'uH[0]');
 return true}
/* 128px tileable value noise, four independent channels (mist far, mist detail, mist near, shafts). Built once, no image file. */
function noiseTex(){var N=128,d=new Uint8Array(N*N*4),ch,x,y,o;
 function grid(seed,cells){var g=[],i;for(i=0;i<cells*cells;i++){var h=Math.sin(i*127.1+seed*311.7)*43758.5453;g.push(h-Math.floor(h))}return g}
 var specs=[[1,4],[2,8],[3,6],[4,16]];
 for(ch=0;ch<4;ch++){var cells=specs[ch][1],g=grid(specs[ch][0],cells),g2=grid(specs[ch][0]+9,cells*2);
  for(y=0;y<N;y++)for(x=0;x<N;x++){var val=0,k;for(k=0;k<2;k++){var cc=k?cells*2:cells,gg=k?g2:g,fx=x/N*cc,fy=ch===3?0:y/N*cc,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy;
    tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);var x0=ix%cc,x1=(ix+1)%cc,y0=iy%cc,y1=(iy+1)%cc,
    a=gg[y0*cc+x0],b=gg[y0*cc+x1],c=gg[y1*cc+x0],e=gg[y1*cc+x1];val+=((a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+e*tx)*ty)*(k?0.35:0.65)}
   o=(y*N+x)*4+ch;d[o]=Math.round(val*255)}}
 var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,N,N,0,gl.RGBA,gl.UNSIGNED_BYTE,d);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return t}
function clampTex(t){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
/* Bloom targets: two small RGBA textures with framebuffers, resized when the canvas changes. Any failure turns bloom off for the page (the rest of the pass is unchanged). */
function target(w,h){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);clampTex(t);
 var f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);var ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 return ok?{t:t,f:f,w:w,h:h}:null}
function phone(){return Math.min(innerWidth,innerHeight)<560}
/* Bloom size: a quarter of the canvas, long side at most 480px; a phone at most 192px, one blur round instead of two, and refreshed every other frame (it is a soft blur, so the reuse does not show). */
function bloomSize(w,h){var cap=phone()?192:480,s=Math.max(4,Math.max(w,h)/cap);return [Math.max(8,Math.round(w/s)),Math.max(8,Math.round(h/s))]}
function bloomSetup(w,h){if(bloomOff)return false;var sz=bloomSize(w,h);if(bt[0]&&bt[0].w===sz[0]&&bt[0].h===sz[1])return true;
 bt.forEach(function(x){gl.deleteTexture(x.t);gl.deleteFramebuffer(x.f)});bt=[];
 if(!bp){var e0=err;bp=program(BP);blp=program(BL);err=e0;if(!bp||!blp){bloomOff=true;return false}
  bp.L={uS:gl.getUniformLocation(bp,'uS'),uRes:gl.getUniformLocation(bp,'uRes'),uTx:gl.getUniformLocation(bp,'uTx'),uE:gl.getUniformLocation(bp,'uE[0]'),uEC:gl.getUniformLocation(bp,'uEC[0]'),uN:gl.getUniformLocation(bp,'uN')};
  blp.L={uT:gl.getUniformLocation(blp,'uT'),uD:gl.getUniformLocation(blp,'uD')}}
 var a=target(sz[0],sz[1]),b=a&&target(sz[0],sz[1]);if(!a||!b){bloomOff=true;return false}bt=[a,b];stats.bloom=sz;return true}
function quad(){gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6)}
/* Runs the bright-pass and blur into bt[0]. Source frame is on TEXTURE0. Returns false (and draws nothing) without emitters. */
var bfr=0;
function bloom(w,h,nE){if(!nE||!bloomSetup(w,h))return false;var A=bt[0],B=bt[1],i,ph=phone(),rounds=ph?1:2;
 if(ph&&(bfr++&1)&&stats.passes)return true;/* phone: reuse last frame's bloom on odd frames */
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,black);/* never sample a target while drawing into it */
 gl.bindFramebuffer(gl.FRAMEBUFFER,A.f);gl.viewport(0,0,A.w,A.h);gl.useProgram(bp);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.uniform1i(bp.L.uS,0);gl.uniform2f(bp.L.uRes,w,h);var k=w/A.w*0.3;gl.uniform2f(bp.L.uTx,k/w,k/h);gl.uniform3fv(bp.L.uE,ex);gl.uniform3fv(bp.L.uEC,ec);gl.uniform1f(bp.L.uN,nE);quad();
 gl.useProgram(blp);gl.uniform1i(blp.L.uT,0);
 for(i=0;i<rounds;i++){var sp=1+i;gl.bindFramebuffer(gl.FRAMEBUFFER,B.f);gl.bindTexture(gl.TEXTURE_2D,A.t);gl.uniform2f(blp.L.uD,sp/A.w,0);quad();
  gl.bindFramebuffer(gl.FRAMEBUFFER,A.f);gl.bindTexture(gl.TEXTURE_2D,B.t);gl.uniform2f(blp.L.uD,0,sp/A.h);quad()}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);stats.passes=1+rounds*2;return true}
function boot(host){if(gl||failed)return !!gl;var stage=host||document.getElementById('stage');if(!stage){failed=true;err='no stage';return false}
 cvs=document.createElement('canvas');cvs.id='lqgl';cvs.setAttribute('aria-hidden','true');
 var home=stage.classList&&stage.classList.contains('hero-frame');
 cvs.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:'+(home?'0':'1')+';visibility:hidden';
 stage.appendChild(cvs);
 /* A still picture (the home strip, or reduced motion, which paints one frame) keeps its drawing buffer. Without it WebKit shows the pass as solid black
    after it re-composites the page (seen in Playwright WebKit, iPhone 13 profile, on a full-page capture). A moving map repaints every frame, so it does not need it. */
 var still=home;try{still=still||window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
 try{gl=cvs.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:still,failIfMajorPerformanceCaveat:false})}catch(e){gl=null}
 /* If the context is lost, hide the pass for this page so the painted canvas (and the caller's 2D light) shows instead of a black layer. */
 cvs.addEventListener('webglcontextlost',function(ev){failed=true;err='context lost';cvs.style.visibility='hidden';cvs.style.display='none'},false);
 if(!gl){failed=true;err='no webgl';cvs.style.display='none';return false}
 /* A phone keeps the round-3 budget (12 lights, 8 shadows), so the per-pixel loop costs the same there. A large GPU on a wide screen gets 12 shadows. */
 var cap=gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)||16,wide=Math.min(innerWidth,innerHeight)>=560,
  tries=cap>=64?(wide?[[12,12],[12,8],[8,4],[4,2]]:[[12,8],[8,4],[4,2]]):cap>=52?[[12,8],[8,4],[4,2]]:cap>=36?[[8,4],[4,2]]:[[4,2]],i;
 for(i=0;i<tries.length;i++){if(link(tries[i][0],tries[i][1]))break}
 if(!prog){failed=true;cvs.style.display='none';return false}
 buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 ntex=noiseTex();
 tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);clampTex(tex);
 black=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,black);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));clampTex(black);
 return true}
/* ---- light that comes from effects (all in canvas px; world px are mapped with opts.cam and opts.scale) ---- */
/* Flame flicker: three incommensurate sines seeded by the light's world position; mean 1. */
function flick(t,x,y){var s=(Math.floor(x/7)*12.9898+Math.floor(y/7)*78.233)%6.283;return 1+0.085*Math.sin(t*9.1+s)+0.055*Math.sin(t*17.3+s*2.1)+0.035*Math.sin(t*31.7+s*4.3)}
/* Footstep embers: when the hero walks through a lamp or window pool, a few warm sparks rise from the feet and fade (drawn into the frame, plus one small light). */
var embers=[],eacc=0,lastHero=null,lastT=0;
function emberStep(src,lights,scl,cam,calm,now){var dt=lastT?Math.min(0.05,(now-lastT)/1000):0;lastT=now;if(calm){embers.length=0;lastHero=null;return null}
 var hero=null,i,L;for(i=0;i<lights.length;i++)if(lights[i].p===0){hero=lights[i];break}
 var S=(window.Art&&Art.S)||34;
 if(hero){var hx=hero.x/scl+cam[0],hy=hero.y/scl+cam[1]+S*0.6,moved=lastHero&&Math.abs(hx-lastHero[0])+Math.abs(hy-lastHero[1])>0.25;lastHero=[hx,hy];
  var inPool=false;if(moved){for(i=0;i<lights.length;i++){L=lights[i];if(L.k!==1&&L.k!==2)continue;var ly=L.y+(L.k===1?L.r*0.9:L.r*0.25),dx=hero.x-L.x,dy=hero.y+S*0.6*scl-ly;if(dx*dx+dy*dy<L.r*L.r*0.9){inPool=true;break}}}
  if(inPool){eacc+=dt;while(eacc>0.06){eacc-=0.06;if(embers.length<28)embers.push({x:hx+(Math.random()-.5)*S*0.5,y:hy-Math.random()*3,vx:(Math.random()-.5)*14,vy:-(18+Math.random()*26),a:0,life:0.7+Math.random()*0.5})}}else eacc=0}
 if(!embers.length)return null;
 var g=src.getContext&&src.getContext('2d');var sx=0,sy=0,n=0;
 if(g){g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter'}
 for(i=embers.length-1;i>=0;i--){var e=embers[i];e.a+=dt;if(e.a>e.life){embers.splice(i,1);continue}e.x+=(e.vx+Math.sin(e.a*7+i)*6)*dt;e.y+=e.vy*dt;e.vy*=0.985;
  var f=1-e.a/e.life,X=(e.x-cam[0])*scl,Y=(e.y-cam[1])*scl;sx+=X;sy+=Y;n++;
  if(g){g.globalAlpha=0.22*f;g.fillStyle='#ffb347';g.beginPath();g.arc(X,Y,3.4*scl,0,6.283);g.fill();g.globalAlpha=0.95*f;g.fillStyle='#fff0b8';g.beginPath();g.arc(X,Y,1.0*scl+0.4,0,6.283);g.fill()}}
 if(g)g.restore();
 if(!n)return null;var k=Math.min(1,n/10);return {x:sx/n,y:sy/n+S*0.25*scl,r:44*scl,c:[0.3*k,0.17*k,0.05*k],p:1,k:3}}
/* Effect light from LQVfx (screen px, recorded in window.LQFxLights) and from LQAnim sparkle bursts. */
function vfxLights(src,out,now,calm){var q=window.LQFxLights;if(!q||!q.length)return;var r=src.getBoundingClientRect?src.getBoundingClientRect():null;if(!r||!r.width)return;var k=src.width/r.width,i;
 for(i=q.length-1;i>=0;i--){var e=q[i],a=(now-e.t0)/1000,X=(e.x-r.left)*k,Y=(e.y-r.top)*k,env,life=e.k==='beam'?2.4:e.k==='shock'?1.6:2.0;if(a>life||a<0){q.splice(i,1);continue}
  env=a<0.22?a/0.22:Math.max(0,1-(a-0.22)/(life-0.22));env*=env*(3-2*env);
  if(e.k==='beam'){out.push({x:X,y:Y+16*k,r:150*k,c:[0.5*env,0.4*env,0.16*env],p:1,k:0});out.push({x:X,y:Y-6*k,r:46*k,c:[0.62*env,0.52*env,0.26*env],p:1,k:3})}
  else if(e.k==='shock'){var g=calm?0.5:1-Math.pow(1-Math.min(1,a/1.1),3);out.push({x:X,y:Y,r:(70+520*g)*k,c:[0.36*env,0.3*env,0.14*env],p:1,k:0});out.push({x:X,y:Y,r:60*k,c:[0.5*env,0.42*env,0.2*env],p:1,k:3})}
  else out.push({x:X,y:Y,r:130*k,c:[0.36*env,0.27*env,0.1*env],p:1,k:3})}}
/* Speed guard: if the GL light pass holds frames above 45 ms for about 1.5 s (software GL, a weak GPU), switch to the 2D light layer for this page. */
var slow=false,lt=0,ema=0,nf=0,work=[];
function byP(a,b){return (a.p||0)-(b.p||0)}
/* opts (optional): biome (atmosphere key), cam [x,y] world px of the view's top left, scale (screen px per world px), t (seconds; 0 when calm), calm (snap and hold still).
   Without opts (the home strip) the pass uses the quiet 'home' atmosphere: no mist, faint shafts, no dusk, and no effect light.
   lights[i]: {x,y,r,c:[r,g,b],p (priority, 0 first), k (kind, see the top of this section)} in canvas px. */
function frame(src,lights,shadows,key,host,opts){var FX=window.LQFx;if(failed)return false;if(slow||!src||(FX&&FX.low)){if(cvs)cvs.style.visibility='hidden';return false}var now=performance.now(),d=lt?now-lt:16;lt=now;if(d<250){ema=ema?ema*.94+d*.06:d;nf++}if(nf>40&&ema>45){slow=true;window.LQLightSlow=true;if(cvs)cvs.style.visibility='hidden';return false}if(!boot(host))return false;
 var w=src.width,h=src.height;if(w<2||h<2)return false;if(cvs.width!==w||cvs.height!==h){cvs.width=w;cvs.height=h}
 var live=!!(opts&&opts.biome);opts=opts||{};var calm=!!opts.calm||!opts.biome,A=ease(atmTarget(opts.biome||'home',opts.late),calm),cam=opts.cam||[0,0],scl=opts.scale||1,tt=calm?0:(opts.t||0)%2000;
 /* the light list: the caller's lights, then effect light (embers, VFX), sorted by priority and cut to the shader's budget */
 work.length=0;var i,L;if(lights)for(i=0;i<lights.length;i++)work.push(lights[i]);
 if(live){var em=emberStep(src,work,scl,cam,calm,now);if(em)work.push(em);vfxLights(src,work,now,calm);work.sort(byP)}
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src)}catch(e){failed=true;err=String(e&&e.message||e);cvs.style.display='none';return false}
 var n=Math.min(nL,work.length),ns=Math.min(nS,shadows?shadows.length:0),nE=0,fl,kk;
 for(i=0;i<nL;i++){L=i<n?work[i]:null;kk=L?(L.k|0):0;fl=L&&kk===2&&!calm?flick(opts.t||0,L.x/scl+cam[0],L.y/scl+cam[1]):1;
  px[i*3]=L?L.x:0;px[i*3+1]=L?L.y:0;px[i*3+2]=L?L.r*(1+(fl-1)*0.35):1;pc[i*4]=L?L.c[0]*fl:0;pc[i*4+1]=L?L.c[1]*fl:0;pc[i*4+2]=L?L.c[2]*fl:0;pc[i*4+3]=kk;
  /* emitters for the bloom: windows, flames and glows (not the hero's pool or a ground spill) */
  if(L&&kk>0&&nE<8){ex[nE*3]=L.x;ex[nE*3+1]=L.y;ex[nE*3+2]=Math.max(10,L.r*(kk===3?0.75:0.55));ec[nE*3]=L.c[0]*fl*0.55;ec[nE*3+1]=L.c[1]*fl*0.55;ec[nE*3+2]=L.c[2]*fl*0.55;nE++}}
 for(i=nE;i<8;i++){ex[i*3+2]=1;ec[i*3]=ec[i*3+1]=ec[i*3+2]=0}
 stats.emit=nE;var hasBloom=bloom(w,h,nE);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.useProgram(prog);var g=GRADES[key]||FALL;
 gl.uniform3fv(locs.uLift,g.lift);gl.uniform3fv(locs.uGain,g.gain);gl.uniform3fv(locs.uShade,g.shade);gl.uniform4f(locs.uMisc,g.sat,g.glow,g.far,tt);gl.uniform2f(locs.uRes,w,h);
 for(i=0;i<nS;i++){L=i<ns?shadows[i]:null;hs[i*3]=L?L.x:0;hs[i*3+1]=L?L.y:0;hs[i*3+2]=L?L.r:1}
 var nearMist=Math.min(w,h)/(window.devicePixelRatio||1)>=560?1:0;/* phone: skip the near mist layer (bottom of the screen is the move pad) */
 gl.uniform4f(locs.uAtm,A.a[0],A.a[1],A.a[2],A.a[3]);gl.uniform3fv(locs.uMistC,A.m);gl.uniform3fv(locs.uRayC,A.r);
 gl.uniform4f(locs.uCam,cam[0]%4320,cam[1]%4320,scl,n);gl.uniform4f(locs.uTone,A.k,A.v,nearMist,ns);
 gl.uniform4f(locs.uKey,KEY[0],KEY[1],SHAFT[0],SHAFT[1]);gl.uniform4f(locs.uFx,hasBloom?0.95:0,live?0.2:0,live?1:0,0);
 gl.uniform3fv(locs.uP,px);gl.uniform4fv(locs.uC,pc);gl.uniform3fv(locs.uH,hs);
 gl.uniform1i(locs.uS,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,ntex);gl.uniform1i(locs.uNz,1);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,hasBloom?bt[0].t:black);gl.uniform1i(locs.uBl,2);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 quad();
 if(watch){var pts=watch,out=[],pix,q;for(q=0;q<pts.length;q++){pix=new Uint8Array(4);gl.readPixels(pts[q][0]|0,h-1-(pts[q][1]|0),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pix);out.push([pix[0],pix[1],pix[2],pix[3]])}lastProbe={pts:out,gl:gl.getError(),err:err,w:w,h:h,nL:nL,nS:nS,bloom:hasBloom?stats.bloom:null,emit:nE};watch=null}
 cvs.style.visibility='visible';return true}
window.LQLight={frame:frame,grades:GRADES,atmos:ATM,key:KEY,limits:function(){return {lights:nL||12,shadows:nS||8}},error:function(){return err},watch:function(pts){watch=pts||[[0,0]]},sample:function(){return lastProbe},
 stats:function(){return {bloom:bloomOff?null:stats.bloom,passes:stats.passes,emitters:stats.emit,embers:embers.length,phone:phone()}}};
})();
