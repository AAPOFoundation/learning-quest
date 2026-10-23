/* Graphics Phase 2 animation: water shimmer, ambient particles by biome, and a sparkle burst on rewards.
   Everything here is skipped when Low effects is on (window.LQFx.low). Drawn in world space each frame, only for what is on screen;
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
 st.setProperty('--k',(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))/20*1.05).toFixed(1));d.innerHTML=html;document.body.appendChild(d);setTimeout(function(){d.remove()},ms||2400);return d}
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
/* water: two drifting highlight strokes and an occasional glint per visible water tile */
/* round 2b: the shimmer is batched. Each stroke's alpha is snapped to one of 5 levels and all strokes of a level go into one path,
   so a frame costs about 5 stroke calls instead of 2 per water tile (and no per-stroke colour strings). Glints share one path too.
   (An offscreen 12 Hz cache was measured first and was slower here: the full-view blit cost more than it saved.) */
var NB=5,BK=[],BCOL=[];for(var bi=0;bi<NB;bi++){BK.push([]);BCOL.push('rgba(225,244,255,'+(.07+.09*(bi+.5)/NB).toFixed(3)+')')}
function water(g,sc,T,cx,cy,vw,vh){if(FX.low||(FX.rm&&FX.rm.matches))return;var l=waterList(sc);if(!l.length)return;
 var i,k,b,gls=[],x0=cx-S,x1=cx+vw+S,y0=cy-S,y1=cy+vh+S;for(b=0;b<NB;b++)BK[b].length=0;
 for(i=0;i<l.length;i++){var w=l[i],x=w[0],y=w[1];if(x<x0||x>x1||y<y0||y>y1)continue;var ph=w[2]*6.28,sy=Math.sin(T*.8+ph)*1.5;
  for(k=0;k<2;k++){var q=.5+.5*Math.sin(T*1.3+ph+k*2.1);b=q*NB|0;if(b>=NB)b=NB-1;BK[b].push(x-S*.18+k*S*.3+Math.sin(T*.45+ph+k)*S*.22,y-S*.22+k*S*.42+sy)}
  var gl=Math.sin(T*2.2+ph*3);if(gl>.92)gls.push(x+(w[2]-.5)*S*.8,y+(w[2]*7%1-.5)*S*.6,(gl-.92)*8)}
 g.save();g.lineCap='round';g.lineWidth=1.3;
 for(b=0;b<NB;b++){var L=BK[b];if(!L.length)continue;g.strokeStyle=BCOL[b];g.beginPath();for(i=0;i<L.length;i+=2){var xx=L[i],yy=L[i+1];g.moveTo(xx-7,yy);g.quadraticCurveTo(xx,yy-2.6,xx+7,yy)}g.stroke()}
 if(gls.length){g.fillStyle='rgb(255,252,235)';for(i=0;i<gls.length;i+=3){g.globalAlpha=gls[i+2];g.beginPath();g.arc(gls[i],gls[i+1],1.6,0,6.3);g.fill()}}
 g.restore()}
/* ambient particles */
var KIND={meadow:{n:22,col:'243,226,176',sz:1.9,vy:-6,vx:5,glow:false},forest:{n:24,col:'214,240,140',sz:2.0,vy:-3,vx:4,glow:true},hills:{n:20,col:'243,226,176',sz:1.8,vy:-5,vx:7,glow:false},desert:{n:26,col:'226,196,140',sz:1.6,vy:-1,vx:22,glow:false},
 tundra:{n:34,col:'250,252,255',sz:2.1,vy:16,vx:4,glow:false},marsh:{n:24,col:'200,240,170',sz:2.0,vy:-2,vx:3,glow:true},highland:{n:20,col:'220,228,240',sz:1.8,vy:-4,vx:9,glow:false},crown:{n:22,col:'243,215,138',sz:2.0,vy:-7,vx:3,glow:true}};
var parts=[],pk=null,bursts=[],acc=0,small=Math.min(screen.width||999,screen.height||999)<500;
function seedParts(k,cx,cy,vw,vh){var K=KIND[k]||KIND.meadow,n=Math.round(K.n*(small?.6:1));parts=[];for(var i=0;i<n;i++)parts.push({x:cx+Math.random()*vw,y:cy+Math.random()*vh,p:Math.random()*6.28,s:.6+Math.random()*.8});pk=k}
function step(dt,k,cx,cy,vw,vh,T){var K=KIND[k]||KIND.meadow;for(var i=0;i<parts.length;i++){var q=parts[i];q.x+=(K.vx*q.s+Math.sin(T*.7+q.p)*6)*dt;q.y+=(K.vy*q.s+Math.cos(T*.9+q.p)*4)*dt;
  if(q.x<cx-10)q.x+=vw+20;else if(q.x>cx+vw+10)q.x-=vw+20;if(q.y<cy-10)q.y+=vh+20;else if(q.y>cy+vh+10)q.y-=vh+20}
 for(var j=bursts.length-1;j>=0;j--){var b=bursts[j];b.t+=dt;if(b.t>1.3){bursts.splice(j,1);continue}for(var m=0;m<b.ps.length;m++){var p=b.ps[m];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt}}}
function particles(g,k,dtRaw,cx,cy,vw,vh,T){if(FX.low||(FX.rm&&FX.rm.matches)){parts=[];bursts=[];return}if(pk!==k||!parts.length)seedParts(k,cx,cy,vw,vh);
 acc+=dtRaw;if(acc>=1/30){step(Math.min(acc,.1),k,cx,cy,vw,vh,T);acc=0}
 var K=KIND[k]||KIND.meadow,col='rgb('+K.col+')';g.save();g.fillStyle=col;for(var i=0;i<parts.length;i++){var q=parts[i],tw=K.glow?.35+.65*Math.max(0,Math.sin(T*1.7+q.p*3)):.55+.3*Math.sin(T+q.p);
  if(K.glow&&tw>.5){g.globalAlpha=.12*tw;g.beginPath();g.arc(q.x,q.y,K.sz*3.4*q.s,0,6.3);g.fill()}
  g.globalAlpha=.75*tw;g.beginPath();g.arc(q.x,q.y,K.sz*q.s,0,6.3);g.fill()}
 for(var j=0;j<bursts.length;j++){var b=bursts[j],a=Math.max(0,1-b.t/1.3),ps=b.ps;g.globalAlpha=a;g.fillStyle='#f3e2b0';g.beginPath();
  for(var m=0;m<ps.length;m++){var p=ps[m],r=p.r*(0.6+a*.6);g.moveTo(p.x+r,p.y);g.arc(p.x,p.y,r,0,6.3)}g.fill();
  g.globalAlpha=a*.8;g.fillStyle='#fff';for(m=0;m<ps.length;m++)g.fillRect(ps[m].x-.5,ps[m].y-.5,1,1)}
 g.restore()}
function burst(x,y){if(FX.low||(FX.rm&&FX.rm.matches))return;var ps=[];for(var i=0;i<26;i++){var a=Math.random()*6.28,v=40+Math.random()*90;ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,r:1.2+Math.random()*1.8})}bursts.push({t:0,ps:ps});if(bursts.length>4)bursts.shift()}
/* round 2b ambient light (full effects only; off for Low effects and reduced motion):
   pools(): warm lamplight pools on the ground around houses, halls and towns, breathing gently, added with 'lighter' so they light the paint.
   fireflies(): a few soft glowing motes drifting on fixed sine paths near the edges of the view (stateless, cheap). */
var POOL=null;function poolSprite(){if(POOL)return POOL;var c=document.createElement('canvas'),R=64;c.width=c.height=R*2;var x=c.getContext('2d'),gr=x.createRadialGradient(R,R,0,R,R,R);
 gr.addColorStop(0,'rgba(255,196,110,.55)');gr.addColorStop(.35,'rgba(255,170,80,.22)');gr.addColorStop(1,'rgba(255,150,60,0)');x.fillStyle=gr;x.fillRect(0,0,R*2,R*2);POOL=c;return c}
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
window.LQAnim={water:water,particles:particles,burst:burst,pools:pools,fireflies:fireflies};
})();
