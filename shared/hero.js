/* Home page hero: a small painted strip of the journey, drawn with the game's own procedural art (art.js + fx2.js), no image files.
   Four towns (one per world, in path order) along a road to a citadel, a walking Wanderer, water shimmer and drifting motes.
   Low effects (same saved setting as the games) or the system's reduced-motion setting (checked live) draws one still frame. Animation runs at up to 30 fps, only while the hero is on screen and the tab is visible. */
(function(){
'use strict';
var cv=document.getElementById('hero');if(!cv||!window.Art)return;
var Art=window.Art,FX=window.LQFx,S=Art.S,hx=Art.hx,hy=Art.hy,hash=Art.hash,g=cv.getContext('2d');
var COLS=22,ROWS=8,SEED=7;
var TOWNS=[{c:3,r:3,biome:'meadow',accent:'#b5532f',name:'Python Basics'},{c:7,r:3,biome:'forest',accent:'#8a3b2a',name:'AI Foundations'},{c:11,r:3,biome:'hills',accent:'#3f5f8f',name:'AI Evaluation'},{c:15,r:3,biome:'tundra',accent:'#3c5a86',name:'AI Safety'}],CAST={c:19,r:3,accent:'#c9a24f',name:'Citadel'};
var HERO={skin:'#e2b48c',hair:'#3b2a1d',robe:'#274a7a',trim:'#d7b56a',cape:'#7a2e2a',hat:'hood',staff:true};
function terrain(){var t=[];for(var c=0;c<COLS;c++){t.push([]);for(var r=0;r<ROWS;r++){var h=hash(c,r,SEED),e=Art.vnoise(c*.35,r*.5,SEED),v='grass';
  if(r>=6&&c<6)v=(r===6&&h<.35)?'grass':'water';else if(r===0&&(c>10||h<.3))v=c>16?'mountain':'hills';else if(c>=14&&c<=17&&r!==3)v=(h<.45?'pine':'snow');else if(c>=5&&c<=8&&r!==3)v=(e>.42?'forest':'grass');else if(c>=10&&c<=12&&r!==3&&h<.4)v='hills';else if(r>=6&&c>=19)v='water';else if(r===7&&c>=7&&c<=10)v='water';t[c].push(v)}}
 TOWNS.concat([CAST]).forEach(function(n){t[n.c][n.r]=n.biome==='tundra'?'snow':'grass'});return t}
var sc={cols:COLS,rows:ROWS,seed:SEED,t:terrain(),roads:[(function(){var p=[];for(var c=1;c<=CAST.c;c++)p.push([c,3]);return p})()],objs:[],biome:'meadow',relief:false};
sc.objs=TOWNS.map(function(n){return {c:n.c,r:n.r}}).concat([{c:CAST.c,r:CAST.r}]);
Art.paintScene(sc);
var W=0,H=0,dpr=1,cam=0,T=0,last=0,acc=0,running=false,visible=true,ov=null,RM=FX.rm||{matches:false};
function still(){return FX.low||RM.matches}
/* the three light/shade overlays are baked once per size into one offscreen canvas */
function size(){var r=cv.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));cv.width=W*dpr;cv.height=H*dpr;
 ov=document.createElement('canvas');ov.width=cv.width;ov.height=cv.height;var o=ov.getContext('2d');o.setTransform(dpr,0,0,dpr,0,0);
 var lg=o.createRadialGradient(W*.15,-H*.2,0,W*.15,-H*.2,W*.9);lg.addColorStop(0,'rgba(255,226,160,.26)');lg.addColorStop(1,'rgba(255,226,160,0)');o.fillStyle=lg;o.fillRect(0,0,W,H);
 var bg=o.createLinearGradient(0,H*.75,0,H);bg.addColorStop(0,'rgba(14,20,28,0)');bg.addColorStop(1,'rgba(14,20,28,.35)');o.fillStyle=bg;o.fillRect(0,0,W,H);
 var vg=o.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.7);vg.addColorStop(0,'rgba(8,10,16,0)');vg.addColorStop(1,'rgba(8,10,16,.3)');o.fillStyle=vg;o.fillRect(0,0,W,H)}
function heroX(){var a=hx(1,3),b=hx(CAST.c-1,3),span=b-a,p=(T*26)%(span*2);return p<span?[a+p,1]:[b-(p-span),-1]}
var X0=hx(1,3)-S*.6,X1=hx(CAST.c+1,3)+S*.6;
function draw(){var full=X1-X0,z=Math.max(W/full,H/(S*1.5*6.8)),vw=W/z,vh=H/z,top=Math.max(0,Math.min(sc.H-vh,hy(3)-vh*.55)),hp=heroX(),fits=vw>=full-1,tx=fits?X0-(vw-full)/2:(still()?hx(3,3)-vw*.25:hp[0]-vw*.42);
 if(!fits)tx=Math.max(X0,Math.min(X1-vw,tx));cam=still()||!cam?tx:cam+(tx-cam)*.02;var cx=cam,cy=top;
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a0f15';g.fillRect(0,0,cv.width,cv.height);
 g.setTransform(dpr*z,0,0,dpr*z,-cx*dpr*z,-cy*dpr*z);g.drawImage(sc.cv,0,0);
 if(!FX.low&&window.LQAnim)LQAnim.water(g,sc,T,cx,cy,vw,vh);
 var list=TOWNS.map(function(n){return {y:hy(n.r),f:function(){Art.building(g,'town',hx(n.c,n.r),hy(n.r),{accent:n.accent,t:T,biome:n.biome})}}});
 list.push({y:hy(CAST.r),f:function(){Art.building(g,'castle',hx(CAST.c,CAST.r),hy(CAST.r),{accent:CAST.accent,t:T})}});
 var st=still(),hxp=st?hx(5,3):hp[0];/* still frame: on the road between towns 1 and 2 */list.push({y:hy(3)+1,f:function(){Art.figure(g,hxp,hy(3)+S*.2,HERO,{t:T,moving:!st,face:st?1:hp[1]})}});
 list.sort(function(a,b){return a.y-b.y}).forEach(function(o){o.f()});
 /* name plaques, in the map's own style */
 var fs=Math.min(30,(W<520?10:11)/z),short=W<520;g.font='700 '+fs+'px "Cormorant Garamond",Georgia,serif';g.textAlign='center';TOWNS.concat([CAST]).forEach(function(n,i){var nm=short?n.name.replace(/^(AI |Python )/,''):n.name,x=hx(n.c,n.r),y=hy(n.r)+S*1.15,tw=g.measureText((i<4?(i+1)+' · ':'')+nm).width+fs*1.2;g.fillStyle='rgba(10,15,21,.86)';g.strokeStyle='#c8a86a';g.lineWidth=1/z;g.beginPath();g.rect(x-tw/2,y-fs*.95,tw,fs*1.45);g.fill();g.stroke();g.fillStyle='#f3e2b0';g.fillText((i<4?(i+1)+' · ':'')+nm,x,y+fs*.12)});
 if(!FX.low){g.save();for(var ci=0;ci<3;ci++){var ccx=X0+((T*6+ci*sc.W/3)%(X1-X0+S*8))-S*4,ccy=hy(1+ci*2)+Math.sin(ci*2.1)*S*.5;g.fillStyle='rgba(20,30,50,.10)';g.beginPath();g.ellipse(ccx,ccy,S*2.6,S*.9,0,0,Math.PI*2);g.ellipse(ccx+S*1.4,ccy+S*.3,S*1.6,S*.7,0,0,Math.PI*2);g.fill()}g.restore()}
 if(!FX.low&&window.LQAnim)LQAnim.particles(g,'meadow',1/30,cx,cy,vw,vh,T);
 g.setTransform(1,0,0,1,0,0);if(ov)g.drawImage(ov,0,0);
 if(window.LQLight){var ls=[],ss=[],scz=z*dpr,wy=hy(3);
  function PL(wx,wyy,rad,col){ls.push({x:(wx-cx)*scz,y:(wyy-cy)*scz,r:rad*scz,c:col})}
  PL(hxp,wy-S*.15,48,[0.18,0.12,0.045]);ss.push({x:(hxp+9-cx)*scz,y:(wy+S*.38+4.2-cy)*scz,r:15*scz});
  for(var ti=0;ti<TOWNS.length;ti++)PL(hx(TOWNS[ti].c,TOWNS[ti].r),hy(TOWNS[ti].r)-S*.4,36,[0.24,0.17,0.06]);
  PL(hx(CAST.c,CAST.r),hy(CAST.r)-S*.8,70,[0.36,0.26,0.08]);
  LQLight.frame(cv,ls,ss,'home',cv.parentNode)}}
function frame(ts){if(!running)return;requestAnimationFrame(frame);var dt=Math.min(.1,(ts-last)/1000||0);last=ts;acc+=dt;if(acc<1/30)return;T+=acc;acc=0;draw()}
function update(){var want=!still()&&visible&&!document.hidden;if(want&&!running){running=true;last=performance.now();requestAnimationFrame(frame)}else if(!want){running=false;draw()}}
size();draw();
window.addEventListener('resize',function(){size();draw()});
document.addEventListener('visibilitychange',update);
if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;update()}).observe(cv);
var b=document.getElementById('hero-fx');function lbl(){if(b){b.textContent='Low effects: '+(FX.low?'On':'Off');b.setAttribute('aria-pressed',FX.low?'true':'false')}}
if(b){lbl();b.onclick=function(){FX.set(!FX.low);Art.paintScene(sc);cam=0;lbl();update();draw()}}
if(RM.addEventListener)RM.addEventListener('change',function(){update();draw()});else if(RM.addListener)RM.addListener(function(){update();draw()});
update();
})();
