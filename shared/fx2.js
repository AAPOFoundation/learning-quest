/* Graphics Phase 2 animation: water shimmer, ambient particles by biome, and a sparkle burst on rewards.
   Everything here is skipped when Low effects is on (window.LQFx.low). Drawn in world space each frame, only for what is on screen;
   capped at about 30 updates a second and nothing runs while the tab is hidden (requestAnimationFrame pauses). No assets. */
(function(){
'use strict';
var Art=window.Art,FX=window.LQFx;if(!Art||!FX)return;
var S=Art.S,hx=Art.hx,hy=Art.hy,hash=Art.hash;
function waterList(sc){if(sc._wl)return sc._wl;var l=[];for(var c=0;c<sc.cols;c++)for(var r=0;r<sc.rows;r++)if(sc.t[c][r]==='water')l.push([hx(c,r),hy(r),hash(c,r,99)]);sc._wl=l;return l}
/* water: two drifting highlight strokes and an occasional glint per visible water tile */
function water(g,sc,T,cx,cy,vw,vh){if(FX.low)return;var l=waterList(sc);if(!l.length)return;g.save();g.lineCap='round';g.lineWidth=1.3;
 for(var i=0;i<l.length;i++){var w=l[i],x=w[0],y=w[1];if(x<cx-S||x>cx+vw+S||y<cy-S||y>cy+vh+S)continue;var ph=w[2]*6.28;
  for(var k=0;k<2;k++){var a=.07+.09*(.5+.5*Math.sin(T*1.3+ph+k*2.1)),dx=Math.sin(T*.45+ph+k)*S*.22,yy=y-S*.22+k*S*.42+Math.sin(T*.8+ph)*1.5,xx=x-S*.18+k*S*.3+dx;
   g.strokeStyle='rgba(225,244,255,'+a.toFixed(3)+')';g.beginPath();g.moveTo(xx-7,yy);g.quadraticCurveTo(xx,yy-2.6,xx+7,yy);g.stroke()}
  var gl=Math.sin(T*2.2+ph*3);if(gl>.92){g.fillStyle='rgba(255,252,235,'+((gl-.92)*8).toFixed(3)+')';g.beginPath();g.arc(x+(w[2]-.5)*S*.8,y+(w[2]*7%1-.5)*S*.6,1.6,0,6.3);g.fill()}}
 g.restore()}
/* ambient particles */
var KIND={meadow:{n:22,col:'243,226,176',sz:1.9,vy:-6,vx:5,glow:false},forest:{n:24,col:'214,240,140',sz:2.0,vy:-3,vx:4,glow:true},hills:{n:20,col:'243,226,176',sz:1.8,vy:-5,vx:7,glow:false},desert:{n:26,col:'226,196,140',sz:1.6,vy:-1,vx:22,glow:false},
 tundra:{n:34,col:'250,252,255',sz:2.1,vy:16,vx:4,glow:false},marsh:{n:24,col:'200,240,170',sz:2.0,vy:-2,vx:3,glow:true},highland:{n:20,col:'220,228,240',sz:1.8,vy:-4,vx:9,glow:false},crown:{n:22,col:'243,215,138',sz:2.0,vy:-7,vx:3,glow:true}};
var parts=[],pk=null,bursts=[],acc=0,small=Math.min(screen.width||999,screen.height||999)<500;
function seedParts(k,cx,cy,vw,vh){var K=KIND[k]||KIND.meadow,n=Math.round(K.n*(small?.6:1));parts=[];for(var i=0;i<n;i++)parts.push({x:cx+Math.random()*vw,y:cy+Math.random()*vh,p:Math.random()*6.28,s:.6+Math.random()*.8});pk=k}
function step(dt,k,cx,cy,vw,vh,T){var K=KIND[k]||KIND.meadow;for(var i=0;i<parts.length;i++){var q=parts[i];q.x+=(K.vx*q.s+Math.sin(T*.7+q.p)*6)*dt;q.y+=(K.vy*q.s+Math.cos(T*.9+q.p)*4)*dt;
  if(q.x<cx-10)q.x+=vw+20;else if(q.x>cx+vw+10)q.x-=vw+20;if(q.y<cy-10)q.y+=vh+20;else if(q.y>cy+vh+10)q.y-=vh+20}
 for(var j=bursts.length-1;j>=0;j--){var b=bursts[j];b.t+=dt;if(b.t>1.3){bursts.splice(j,1);continue}b.ps.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt})}}
function particles(g,k,dtRaw,cx,cy,vw,vh,T){if(FX.low){parts=[];bursts=[];return}if(pk!==k||!parts.length)seedParts(k,cx,cy,vw,vh);
 acc+=dtRaw;if(acc>=1/30){step(Math.min(acc,.1),k,cx,cy,vw,vh,T);acc=0}
 var K=KIND[k]||KIND.meadow;g.save();for(var i=0;i<parts.length;i++){var q=parts[i],tw=K.glow?.35+.65*Math.max(0,Math.sin(T*1.7+q.p*3)):.55+.3*Math.sin(T+q.p);
  if(K.glow&&tw>.5){g.fillStyle='rgba('+K.col+','+(.12*tw).toFixed(3)+')';g.beginPath();g.arc(q.x,q.y,K.sz*3.4*q.s,0,6.3);g.fill()}
  g.fillStyle='rgba('+K.col+','+(.75*tw).toFixed(3)+')';g.beginPath();g.arc(q.x,q.y,K.sz*q.s,0,6.3);g.fill()}
 bursts.forEach(function(b){var a=Math.max(0,1-b.t/1.3);b.ps.forEach(function(p){g.fillStyle='rgba(243,226,176,'+a.toFixed(3)+')';g.beginPath();g.arc(p.x,p.y,p.r*(0.6+a*.6),0,6.3);g.fill();g.fillStyle='rgba(255,255,255,'+(a*.8).toFixed(3)+')';g.fillRect(p.x-.5,p.y-.5,1,1)})});g.restore()}
function burst(x,y){if(FX.low)return;var ps=[];for(var i=0;i<26;i++){var a=Math.random()*6.28,v=40+Math.random()*90;ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,r:1.2+Math.random()*1.8})}bursts.push({t:0,ps:ps});if(bursts.length>4)bursts.shift()}
window.LQAnim={water:water,particles:particles,burst:burst};
})();
