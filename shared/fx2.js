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
 st.setProperty('--k',(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))/20*1.05).toFixed(1));d.innerHTML=html;document.body.appendChild(d);setTimeout(function(){d.remove()},ms||2400);return d}
function beam(x,y){return vfxLayer('beam',x,y,'<div class="rays"></div><div class="shaft"></div><div class="core"></div><div class="glow"></div>',2500)}
function shockwave(x,y){return vfxLayer('shock',x,y,'<div class="wash"></div><div class="glow"></div><div class="ring"></div><div class="ring r2"></div>',2400)}
window.LQVfx={beam:beam,shockwave:shockwave};
function celebrate(msg,opts){opts=opts||{};if(opts.vfx==='beam')beam(opts.x,opts.y);else if(opts.vfx==='shockwave')shockwave(opts.x,opts.y);if(opts.confetti!==false)confetti(opts.count);cheer(msg)}
/* small helper: replay a one-shot CSS animation class on an element */
function pop(el,cls){if(!el||calm())return;cls=cls||'lq-pop';el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
window.LQCelebrate={celebrate:celebrate,beam:beam,shockwave:shockwave,confetti:confetti,cheer:cheer,pop:pop,calm:calm};
/* any script can fire: document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:{msg:'Level cleared!',vfx:'shockwave'}}))
   detail: msg, vfx ('beam'|'shockwave'), x/y (screen px; default centre), confetti (false to skip), count */
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
function water(g,sc,T,cx,cy,vw,vh){if(skip()){zap();return}var l=waterList(sc);if(!l.length)return;g.save();g.lineCap='round';g.lineWidth=1.3;g.strokeStyle='rgb(225,244,255)';g.fillStyle='rgb(255,252,235)';
 var long=l.length>48;
 for(var i=0;i<l.length;i++){var w=l[i],x=w[0],y=w[1];if(x<cx-S||x>cx+vw+S||y<cy-S||y>cy+vh+S)continue;var ph=w[2]*6.28;
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
function particles(g,k,dtRaw,cx,cy,vw,vh,T){if(skip()){zap();return}if(pk!==k||!parts.length)seedParts(k,cx,cy,vw,vh);
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
 g.restore();g.globalAlpha=1}
function burst(x,y){if(skip()){zap();return}var ps=[];for(var i=0;i<16;i++){var a=Math.random()*6.283185,v=40+Math.random()*90;ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,r:1.2+Math.random()*1.8,star:i<7,rot:Math.random()*1.57})}
 bursts.push({t:0,ps:ps});if(bursts.length>4)bursts.shift();rings.push({x:x,y:y,t:0});if(rings.length>3)rings.shift()}
function floatText(x,y,text){if(skip()){zap();return}if(text==null||text==='')return;text=String(text).slice(0,18);if(!text)return;floats.push({x:x,y:y,t:0,s:text});if(floats.length>5)floats.shift()}
function puff(x,y){if(skip()){zap();return}var ps=[];for(var i=0;i<5;i++){var a=Math.random()*6.283185,sp=8+Math.random()*14;ps.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.4-8,r:.6+Math.random()*.8})}
 puffs.push({t:0,ps:ps});if(puffs.length>8)puffs.shift()}
window.LQAnim={water:water,particles:particles,burst:burst,floatText:floatText,puff:puff};
})();
