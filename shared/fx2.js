/* Graphics Phase 2 animation: water shimmer, ambient particles by biome, reward burst, rising labels, and step dust.
   Everything here is skipped when Low effects is on (window.LQFx.low) or reduced motion matches. Drawn in world space each frame, only for what is on screen;
   capped at about 30 updates a second and nothing runs while the tab is hidden (requestAnimationFrame pauses). No assets. */
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
