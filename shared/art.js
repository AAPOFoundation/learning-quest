/* Procedural painterly hex-map art (no external assets). Civ-style soft-shaded terrain, brass-trimmed UI colours. */
(function(){
'use strict';
var S=34,SQ3=Math.sqrt(3),PI=Math.PI,stamps={};
/* Visual effects: 'low' keeps the original flat look. Default is low only for reduced-motion or small devices; the choice is remembered. */
var FX=window.LQFx={low:(function(){try{var v=localStorage.getItem('learning-apps.fx');if(v)return v==='low'}catch(e){}return !!((window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2))})(),
 /* live reduced-motion query: animation (water shimmer, particles, the home hero walk) stops while it matches, even after Low effects has been toggled */
 rm:window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false},
 set:function(v){FX.low=!!v;stamps={};bslots={};bcount=0;try{localStorage.setItem('learning-apps.fx',v?'low':'full')}catch(e){}}};
function quiet(){return !!(FX.low||(FX.rm&&FX.rm.matches))}
function hash(a,b,s){var h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(s|0,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function vnoise(x,y,s){var x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);var a=hash(x0,y0,s),b=hash(x0+1,y0,s),c=hash(x0,y0+1,s),d=hash(x0+1,y0+1,s);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}
function hx(c,r){return S*SQ3*(c+0.5*(r&1))+S*SQ3/2}
function hy(r){return S*1.5*r+S}
/* Angled three-quarter camera. One projection for the relief, sprites and taps.
   World +x is east, +y is south. View Y grows down. Height lifts straight up, so a cliff face is vertical.
   vx = x + shear * y.  vy = y * v - h.
   shear -0.36: a point 100px further south sits 36px to the left. v 0.62: north-south ground shrinks to 62%.
   Pinned: project(100, 200, 40) is (28, 84). unproject(28, 124) is (100, 200). */
var CAM={shear:-0.36,v:0.62};
function groundH(t){switch(t){case 'water':return 0;case 'sand':case 'marsh':return 1;case 'snow':return 6;case 'plaza':return 6;case 'forest':return 14;case 'pine':return 18;case 'hills':return 30;case 'mountain':return 52;default:return 5}}
function project(x,y,h){return {x:x+CAM.shear*y,y:y*CAM.v-(h||0)}}
function unproject(vx,vy){var y=vy/CAM.v;return {x:vx-CAM.shear*y,y:y}}
var DE=[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]],DO=[[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]];
function neigh(c,r,d){var v=(r&1?DO:DE)[d];return [c+v[0],r+v[1]]}
function cube(c,r){var x=c-(r-(r&1))/2;return [x,-x-r,r]}
function hdist(a,b,c,d){var p=cube(a,b),q=cube(c,d);return Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]),Math.abs(p[2]-q[2]))}
function px2hex(px,py){var x=px-S*SQ3/2,y=py-S,q=(SQ3/3*x-y/3)/S,rr=2/3*y/S,xx=q,zz=rr,yy=-xx-zz,rx=Math.round(xx),ry=Math.round(yy),rz=Math.round(zz),dx=Math.abs(rx-xx),dy=Math.abs(ry-yy),dz=Math.abs(rz-zz);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return [rx+(rz-(rz&1))/2,rz]}
function hline(a,b,c,d){var p=cube(a,b),q=cube(c,d),n=Math.max(1,hdist(a,b,c,d)),out=[];for(var i=0;i<=n;i++){var t=i/n,x=p[0]+(q[0]-p[0])*t+1e-6,y=p[1]+(q[1]-p[1])*t+2e-6,z=p[2]+(q[2]-p[2])*t-3e-6,rx=Math.round(x),ry=Math.round(y),rz=Math.round(z),dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;out.push([rx+(rz-(rz&1))/2,rz])}return out}
var HEXC=[],HEXS=[];for(var hk=0;hk<6;hk++){var ha=(60*hk-30)*PI/180;HEXC[hk]=Math.cos(ha);HEXS[hk]=Math.sin(ha)}
function hexPath(g,x,y,s){g.beginPath();for(var k=0;k<6;k++){var px=x+s*HEXC[k],py=y+s*HEXS[k];k?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
var EDGE=[[0,1],[3,4],[5,0],[4,5],[1,2],[2,3]];
function corner(x,y,k){return [x+S*HEXC[k],y+S*HEXS[k]]}
var COL={grass:[122,174,84],forest:[84,140,72],hills:[170,164,100],mountain:[136,128,118],sand:[230,200,134],snow:[234,242,248],marsh:[96,140,112],water:[52,124,170],plaza:[204,186,150],road:[176,138,86],crown:[134,176,90],rock:[120,112,104]};
function rgb(c,f,a){return 'rgba('+Math.min(255,Math.round(c[0]*f))+','+Math.min(255,Math.round(c[1]*f))+','+Math.min(255,Math.round(c[2]*f))+','+(a==null?1:a)+')'}
function hex2(c){var h=c.replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
var mixMemo={};function mix(a,b,t){var k=a+'\0'+b+'\0'+t,c=mixMemo[k];if(c)return c;var p=hex2(a),q=hex2(b);c='rgb('+Math.round(p[0]+(q[0]-p[0])*t)+','+Math.round(p[1]+(q[1]-p[1])*t)+','+Math.round(p[2]+(q[2]-p[2])*t)+')';mixMemo[k]=c;return c}
function ell(g,x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,PI*2);g.fill()}
function tri(g,a,b,c,d,e,f,fill){g.fillStyle=fill;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.closePath();g.fill()}
function tree(g,x,y,s,kind,snow){ell(g,x+s*.2,y+s*.02,s*.52,s*.16,'rgba(10,20,8,.28)');g.fillStyle='#6b4a2c';g.fillRect(x-s*.06,y-s*.34,s*.12,s*.34);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+s*.01,y-s*.34,s*.05,s*.34);
 if(kind==='pine'){for(var i=0;i<3;i++){var w=s*(.56-.12*i),yy=y-s*(.28+.3*i);tri(g,x,yy-s*.42,x-w,yy,x,yy,snow?'#eef4f8':'#55a060');tri(g,x,yy-s*.42,x,yy,x+w,yy,snow?'#b4c6d4':'#357a48');if(snow){tri(g,x,yy-s*.42,x-w*.45,yy-s*.22,x+w*.45,yy-s*.22,'#ffffff')}}}
 else{g.save();g.strokeStyle='rgba(24,40,18,.55)';g.lineWidth=Math.max(1,s*.04);g.beginPath();g.ellipse(x,y-s*.66,s*.46,s*.42,0,0,PI*2);g.stroke();g.restore();ell(g,x,y-s*.66,s*.46,s*.42,'#3f7a3a');ell(g,x+s*.14,y-s*.58,s*.3,s*.26,'#356a33');ell(g,x-s*.1,y-s*.76,s*.34,s*.3,'#5c9c4a');ell(g,x-s*.18,y-s*.88,s*.18,s*.14,'#94c868');ell(g,x+s*.16,y-s*.8,s*.05,s*.05,'#e0574a')}}
function peak(g,x,y,w,h,snow){tri(g,x-w/2,y,x,y-h,x+w*.06,y,'#b8ab96');tri(g,x,y-h,x+w/2,y,x+w*.06,y,'#6e6a78');tri(g,x-w*.3,y,x-w*.12,y-h*.5,x-w*.05,y,'rgba(255,240,200,.18)');if(snow){tri(g,x-w*.15,y-h*.72,x,y-h,x+w*.12,y-h*.7,'#f4f6f6');tri(g,x,y-h,x+w*.14,y-h*.68,x+w*.02,y-h*.55,'#c6ced4')}}
function hill(g,x,y,w,h,col){ell(g,x+w*.05,y,w*.55,h*.22,'rgba(0,0,0,.2)');g.fillStyle=rgb(col,.78);g.beginPath();g.ellipse(x,y,w*.5,h,0,PI,0);g.fill();g.fillStyle=rgb(col,1.08);g.beginPath();g.ellipse(x-w*.1,y-h*.1,w*.34,h*.7,0,PI,0);g.fill()}
function stroke2(g,pts,w,col){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();for(var i=0;i<pts.length;i++){if(i===0)g.moveTo(pts[0][0],pts[0][1]);else{var m=[(pts[i-1][0]+pts[i][0])/2,(pts[i-1][1]+pts[i][1])/2];g.quadraticCurveTo(pts[i-1][0],pts[i-1][1],m[0],m[1])}}g.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]);g.stroke()}

function bevel(g,x,y){var a=corner(x,y,3),b=corner(x,y,4),c=corner(x,y,5),d=corner(x,y,0),e=corner(x,y,1),f=corner(x,y,2);g.lineWidth=1.4;g.lineCap='round';
 g.strokeStyle='rgba(255,244,210,.17)';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(c[0],c[1]);g.stroke();
 g.strokeStyle='rgba(20,10,0,.22)';g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(e[0],e[1]);g.lineTo(f[0],f[1]);g.stroke()}
/* one soft hex, lit from the top left; reused so land tiles do not build a gradient each time */
var litHex=null,litWtr=null,litW=0;
function tileLight(){if(litHex)return;var s=S*1.03,pad=2,w=Math.ceil(s*2+pad*2),cx=w/2,cy=w/2;
 var cv=document.createElement('canvas');cv.width=cv.height=w;var gg=cv.getContext('2d');
 hexPath(gg,cx,cy,s);var gr=gg.createRadialGradient(cx-S*.3,cy-S*.4,2,cx,cy,S*1.05);gr.addColorStop(0,'rgba(255,246,214,.16)');gr.addColorStop(1,'rgba(20,14,0,.12)');gg.fillStyle=gr;gg.fill();litHex=cv;litW=w;
 var cv2=document.createElement('canvas');cv2.width=cv2.height=w;var gw=cv2.getContext('2d');
 hexPath(gw,cx,cy,s);var wr=gw.createRadialGradient(cx-S*.2,cy-S*.3,2,cx,cy,S);wr.addColorStop(0,'rgba(120,190,215,.28)');wr.addColorStop(1,'rgba(10,30,60,.25)');gw.fillStyle=wr;gw.fill();litWtr=cv2}
function rgbaHex(c,a){if(!c||c.charAt(0)!=='#')return null;var p=hex2(c);return 'rgba('+(p[0]||0)+','+(p[1]||0)+','+(p[2]||0)+','+a+')'}
function tileTint(sc,c,r){var zi=sc.zone&&sc.zone[c]?sc.zone[c][r]:null,zt=sc.zoneTint,tn=null;if(zt&&zi!=null&&typeof zt[zi]==='string'&&zt[zi])tn=zt[zi];else if(typeof sc.tint==='string'&&sc.tint)tn=sc.tint;return tn}
function matHint(g,t,x,y,c,r,seed){var i,n=2+(hash(c,r,seed+13)>.55?1:0);
 if(t==='grass'||t==='crown'){g.strokeStyle='rgba(36,72,28,.34)';g.lineWidth=1;g.lineCap='round';for(i=0;i<n;i++){var a=hash(c,r,80+i),b=hash(c,r,90+i),fx=x+(a-.5)*S*.9,fy=y+(b-.5)*S*.55;g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+(hash(c,i,91)-.5)*3.5,fy-2.4-hash(c,i,92)*2.6);g.stroke()}}
 else if(t==='sand'){for(i=0;i<4;i++){var a2=hash(c,r,80+i),b2=hash(c,r,90+i);g.fillStyle=i%2?'rgba(120,78,32,.28)':'rgba(255,236,190,.34)';g.fillRect(x+(a2-.5)*S*.85,y+(b2-.5)*S*.5,1.6,1.6)}}
 else if(t==='snow'){for(i=0;i<n;i++){var a3=hash(c,r,80+i),b3=hash(c,r,90+i);g.fillStyle='rgba(255,255,255,.72)';g.fillRect(x+(a3-.5)*S*.7,y+(b3-.5)*S*.45,1.5,1.5)}}}
/* brass line emblem, about 14px. Unknown kind is a diamond. Full effects only. */
function motifMark(g,x,y,kind,u,colour){if(FX.low||!kind)return;var c=colour||'#d7b56a';
 g.save();g.translate(x,y);g.lineCap='round';g.lineJoin='round';g.shadowColor='#2a1d0a';g.shadowOffsetX=.7*u;g.shadowOffsetY=.8*u;g.shadowBlur=0;
 g.strokeStyle=c;g.fillStyle=c;g.lineWidth=Math.max(1.15,1.25*u);
 if(kind==='seed'){g.beginPath();g.ellipse(0,.4*u,2.8*u,4.2*u,.35,0,PI*2);g.stroke();g.beginPath();g.moveTo(.6*u,-3.2*u);g.lineTo(2.8*u,-5.4*u);g.stroke()}
 else if(kind==='list'){for(var i=0;i<3;i++){g.beginPath();g.moveTo(-4.4*u,(-3+i*3)*u);g.lineTo(4.4*u,(-3+i*3)*u);g.stroke()}}
 else if(kind==='loop'){g.beginPath();g.arc(0,0,4*u,.6,PI*1.82);g.stroke()}
 else if(kind==='anvil'){g.beginPath();g.moveTo(-5*u,-2.2*u);g.lineTo(5*u,-2.2*u);g.lineTo(3*u,2.4*u);g.lineTo(-3*u,2.4*u);g.closePath();g.stroke()}
 else if(kind==='dict'){g.strokeRect(-4.6*u,-4*u,3.6*u,3.6*u);g.strokeRect(1*u,.6*u,3.6*u,3.6*u)}
 else if(kind==='bug'){g.beginPath();g.ellipse(0,1*u,3.2*u,2.4*u,0,0,PI*2);g.stroke();g.beginPath();g.moveTo(-1.4*u,-.8*u);g.lineTo(-3.1*u,-4*u);g.moveTo(1.4*u,-.8*u);g.lineTo(3.1*u,-4*u);g.stroke()}
 else if(kind==='book'){g.strokeRect(-3.8*u,-3*u,7.6*u,6.2*u);g.beginPath();g.moveTo(0,-3*u);g.lineTo(0,3.2*u);g.stroke()}
 else if(kind==='neuron'){g.beginPath();g.arc(0,0,2*u,0,PI*2);g.stroke();[[0,-1],[.86,.5],[-.86,.5]].forEach(function(d){g.beginPath();g.moveTo(d[0]*2.1*u,d[1]*2.1*u);g.lineTo(d[0]*5.1*u,d[1]*5.1*u);g.stroke()})}
 else if(kind==='slope'){g.beginPath();g.moveTo(-4.5*u,3.1*u);g.lineTo(4.5*u,-3.4*u);g.stroke()}
 else if(kind==='wave'){g.beginPath();g.moveTo(-5*u,1.8*u);g.quadraticCurveTo(0,-4.4*u,5*u,1.8*u);g.stroke()}
 else if(kind==='lens'){g.beginPath();g.ellipse(0,0,4.6*u,2.5*u,0,0,PI*2);g.stroke()}
 else if(kind==='scale'){g.beginPath();g.moveTo(0,4.6*u);g.lineTo(0,-.6*u);g.stroke();g.beginPath();g.moveTo(0,-3.8*u);g.lineTo(-4.1*u,1.6*u);g.lineTo(4.1*u,1.6*u);g.closePath();g.stroke()}
 else if(kind==='shield'){g.beginPath();g.moveTo(-3.8*u,-3.8*u);g.lineTo(3.8*u,-3.8*u);g.lineTo(3.8*u,.8*u);g.quadraticCurveTo(0,5.1*u,-3.8*u,.8*u);g.closePath();g.stroke()}
 else if(kind==='quill'){g.beginPath();g.moveTo(-3.2*u,4.2*u);g.lineTo(3.5*u,-4.2*u);g.stroke();g.beginPath();g.moveTo(-3.2*u,4.2*u);g.lineTo(-.4*u,2.2*u);g.lineTo(-4.6*u,2.1*u);g.closePath();g.fill()}
 else if(kind==='coin'){g.beginPath();g.arc(0,0,4.2*u,0,PI*2);g.stroke();g.beginPath();g.arc(0,0,1.9*u,0,PI*2);g.stroke()}
 else{g.beginPath();g.moveTo(0,-3.8*u);g.lineTo(3.3*u,0);g.lineTo(0,3.8*u);g.lineTo(-3.3*u,0);g.closePath();g.stroke()}
 g.restore()}
/* paint a scene's terrain to an offscreen canvas.  sc: {cols,rows,t[c][r],biome,roads:[[ [c,r].. ]],seed} */
function paintScene(sc){
 var W=Math.ceil(S*SQ3*(sc.cols+.5))+2,H=Math.ceil(S*1.5*sc.rows+S*.6)+2,cv=document.createElement('canvas');cv.width=W;cv.height=H;var g=cv.getContext('2d');tileLight();
 var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1d3a4c');bg.addColorStop(1,'#0f2030');g.fillStyle=bg;g.fillRect(0,0,W,H);
 var c,r,t,x,y,h1,h2,i,decos=[],lift=[],busy={};if(!FX.low){(sc.roads||[]).forEach(function(rd){rd.forEach(function(p){busy[p[0]+','+p[1]]=1})});(sc.plaza||[]).forEach(function(p){busy[p[0]+','+p[1]]=1});(sc.objs||[]).forEach(function(o){busy[o.c+','+o.r]=1})}
 for(r=0;r<sc.rows;r++)for(c=0;c<sc.cols;c++){t=sc.t[c][r];x=hx(c,r);y=hy(r);h1=hash(c,r,sc.seed);h2=hash(c,r,sc.seed+7);
  var base=COL[t==='pine'?'forest':t]||COL.grass;
  if(t==='forest'||t==='pine'){base=COL.forest}
  var f=.9+h1*.2,n2=0;if(!FX.low){f=.84+vnoise(c*.3,r*.3,sc.seed)*.22+h1*.08;n2=vnoise(c*.22+9,r*.22,sc.seed+3)}
  hexPath(g,x,y,S*1.03);g.fillStyle=rgb(base,f);g.fill();
  if(!FX.low&&(n2>.56||n2<.4)){g.fillStyle=n2>.56?'rgba(255,226,150,'+((n2-.56)*.5).toFixed(3)+')':'rgba(50,90,150,'+((.4-n2)*.5).toFixed(3)+')';g.fill()}
  var tn=!FX.low?tileTint(sc,c,r):null;if(tn){var al=(t==='water'||t==='crown')?0.08:t==='road'?0.06:0.16,tc=t==='road'?'rgba(255,230,180,'+al+')':rgbaHex(tn,al);if(tc){hexPath(g,x,y,S*1.03);g.fillStyle=tc;g.fill()}}
  if(t==='water'){if(!FX.low)g.drawImage(litWtr,x-litW/2,y-litW/2);
   g.save();hexPath(g,x,y,S*.98);g.clip();g.fillStyle='rgba(6,22,46,.34)';g.beginPath();g.ellipse(x+S*.22,y+S*.16,S*.4,S*.2,-.35,0,PI*2);g.fill();
   g.strokeStyle='rgba(214,238,255,.28)';g.lineWidth=1.3;g.beginPath();g.moveTo(x-S*.38,y-S*.12);g.quadraticCurveTo(x-S*.05,y-S*.3,x+S*.22,y-S*.1);g.stroke();g.restore();
   g.strokeStyle='rgba(235,248,255,.16)';g.lineWidth=1.2;for(i=0;i<2;i++){var wx=x-S*.5+hash(c,r,i+3)*S,wy=y-S*.4+hash(c,r,i+9)*S*.8;g.beginPath();g.moveTo(wx-6,wy);g.quadraticCurveTo(wx,wy-3,wx+6,wy);g.stroke()}}
  else{if(!FX.low)g.drawImage(litHex,x-litW/2,y-litW/2);
   g.save();hexPath(g,x,y,S);g.clip();for(i=0;i<5;i++){var a=hash(c,r,20+i),b=hash(c,r,40+i);g.fillStyle=(i%2?'rgba(255,240,190,.07)':'rgba(30,20,0,.07)');g.beginPath();g.ellipse(x-S*.7+a*S*1.4,y-S*.7+b*S*1.4,S*.35,S*.12,a*3,0,PI*2);g.fill()}
   if(t==='snow'){g.fillStyle='rgba(62,98,128,.18)';g.beginPath();g.ellipse(x+S*.18,y+S*.12,S*.4,S*.18,0,0,PI*2);g.fill()}
   else if(t==='sand'){g.fillStyle='rgba(110,62,18,.16)';g.beginPath();g.ellipse(x+S*.16,y+S*.1,S*.46,S*.16,-.25,0,PI*2);g.fill()}
   else if(t==='marsh'){g.fillStyle='rgba(16,52,62,.22)';g.beginPath();g.ellipse(x+S*.04,y+S*.08,S*.36,S*.16,0,0,PI*2);g.fill()}
   if(!FX.low)matHint(g,t,x,y,c,r,sc.seed);g.restore()}
  hexPath(g,x,y,S);g.strokeStyle='rgba(30,22,6,.10)';g.lineWidth=1;g.stroke();if(!FX.low&&t!=='water')bevel(g,x,y);
  if(t==='forest')decos.push([y,'forest',x,y,h1,h2]);else if(t==='pine')decos.push([y,'pine',x,y,h1,h2]);else if(t==='mountain')decos.push([y,'mountain',x,y,h1,h2]);else if(t==='hills')decos.push([y,'hills',x,y,h1,h2]);
  else if(t==='grass'||t==='crown'){if(h1<.16)decos.push([y,'lone',x,y,h1,h2])}else if(t==='sand'){if(h1<.5)decos.push([y,'dune',x,y,h1,h2]);if(h2<.1)decos.push([y,'rock',x,y,h1,h2])}else if(t==='snow'){if(h1<.4)decos.push([y,'drift',x,y,h1,h2])}else if(t==='marsh'){decos.push([y,'reed',x,y,h1,h2])}
  if(!FX.low&&!busy[c+','+r])props(decos,t,x,y,c,r,sc.seed)}
 /* shoreline foam */
 for(r=0;r<sc.rows;r++)for(c=0;c<sc.cols;c++){t=sc.t[c][r];if(t==='water')continue;x=hx(c,r);y=hy(r);for(i=0;i<6;i++){var n=neigh(c,r,i),nt=(n[0]>=0&&n[1]>=0&&n[0]<sc.cols&&n[1]<sc.rows)?sc.t[n[0]][n[1]]:null;if(nt==='water'){var p=corner(x,y,EDGE[i][0]),q=corner(x,y,EDGE[i][1]);g.strokeStyle='rgba(245,238,210,.5)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();g.strokeStyle='rgba(120,90,40,.35)';g.lineWidth=1;g.stroke()}}}
 /* roads */
 (sc.roads||[]).forEach(function(rd){var pts=rd.map(function(p){return [hx(p[0],p[1]),hy(p[1])]});stroke2(g,pts,S*.46,'rgba(70,44,14,.42)');stroke2(g,pts,S*.34,'rgba(196,156,98,.92)');stroke2(g,pts,S*.12,'rgba(236,208,150,.55)')});
 if(sc.plaza)sc.plaza.forEach(function(p){var xx=hx(p[0],p[1]),yy=hy(p[1]);hexPath(g,xx,yy,S*1.03);g.fillStyle=rgb(COL.plaza,.94+hash(p[0],p[1],5)*.1);g.fill();hexPath(g,xx,yy,S*.86);g.strokeStyle='rgba(255,246,214,.25)';g.lineWidth=1.5;g.stroke();hexPath(g,xx,yy,S);g.strokeStyle='rgba(60,44,20,.22)';g.lineWidth=1;g.stroke()});
 decos.sort(function(a,b){return a[0]-b[0]});
 decos.forEach(function(d){var k=d[1],x=d[2],y=d[3],h1=d[4],h2=d[5];
  if(k==='forest'){var n=2+Math.floor(h1*3);for(var i=0;i<n;i++)tree(g,x-S*.45+hash(x|0,i,3)*S*.9,y-S*.15+hash(y|0,i,4)*S*.55,S*(.62+h2*.3),'oak')}
  else if(k==='pine'){var n2=2+Math.floor(h1*2);for(var j=0;j<n2;j++)tree(g,x-S*.4+hash(x|0,j,3)*S*.8,y-S*.1+hash(y|0,j,4)*S*.5,S*(.7+h2*.25),'pine',true)}
  else if(k==='lone')tree(g,x+(h2-.5)*S*.6,y+S*.2,S*.7,'oak');
  else if(k==='mountain'){peak(g,x-S*.38,y+S*.28,S*.9,S*.8,h1>.3);peak(g,x+S*.3,y+S*.34,S*1.0,S*(.9+h2*.3),true);peak(g,x-S*.02,y+S*.46,S*1.2,S*(1.2+h1*.3),true)}
  else if(k==='hills'){hill(g,x-S*.28,y+S*.1,S*.9,S*.45,COL.hills);hill(g,x+S*.3,y+S*.3,S*.8,S*.4,COL.hills)}
  else if(k==='dune'){g.strokeStyle='rgba(150,106,50,.32)';g.lineWidth=2;g.beginPath();g.arc(x+(h2-.5)*S*.4,y+S*.5,S*.55,PI*1.15,PI*1.85);g.stroke();g.strokeStyle='rgba(255,236,180,.4)';g.beginPath();g.arc(x+(h2-.5)*S*.4,y+S*.46,S*.55,PI*1.2,PI*1.8);g.stroke()}
  else if(k==='rock'){hill(g,x,y+S*.3,S*.5,S*.3,COL.rock)}
  else if(k==='drift'){ell(g,x,y+S*.3,S*.6,S*.18,'rgba(255,255,255,.55)');ell(g,x-S*.1,y+S*.25,S*.35,S*.1,'rgba(255,255,255,.7)')}
  else if(PROPK[k])PROPK[k](g,x,y,h1,h2);
  else if(k==='reed'){ell(g,x+(h2-.5)*S*.5,y+S*.1,S*.55,S*.2,'rgba(70,120,140,.55)');ell(g,x+(h1-.5)*S*.6,y+S*.05,S*.3,S*.1,'rgba(150,210,225,.25)');g.strokeStyle='#44663f';g.lineWidth=1.6;for(var q=0;q<4;q++){var rx=x-S*.3+q*S*.2+h1*6;g.beginPath();g.moveTo(rx,y+S*.3);g.lineTo(rx+(q-1.5)*1.5,y-S*.1-(q%2)*S*.1);g.stroke()}}
 });
 if(!FX.low){var L=Math.max(W,H),lg=g.createRadialGradient(W*.18,H*.04,0,W*.18,H*.04,L*.95);lg.addColorStop(0,'rgba(255,232,170,.22)');lg.addColorStop(.7,'rgba(255,232,170,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);
  var dg=g.createLinearGradient(0,0,W,H);dg.addColorStop(.5,'rgba(20,30,70,0)');dg.addColorStop(1,'rgba(20,30,70,.2)');g.fillStyle=dg;g.fillRect(0,0,W,H)}
 /* grain: one seeded tile, stamped as a pattern, so a repaint does not reshuffle. Low effects drops it (r3 default). */
 if(!FX.low)grainStamp(g,W,H,sc.seed||1);
 sc.cv=cv;sc.W=W;sc.H=H;paintRelief(sc)}
var grainCvs={};
function grainStamp(g,W,H,seed){var key=seed||1,src=grainCvs[key];
 if(!src){src=document.createElement('canvas');src.width=src.height=128;var gg=src.getContext('2d'),n=18,k;
  for(k=0;k<n;k++){gg.fillStyle=hash(k,key,3)<.5?'rgba(255,245,210,.05)':'rgba(10,8,0,.05)';gg.fillRect(hash(k,key,1)*128,hash(k,key,2)*128,2,2)}
  grainCvs[key]=src}
 g.fillStyle=g.createPattern(src,'repeat');g.fillRect(0,0,W,H)}
/* Low-poly relief in the three-quarter projection. Tops are the painted tiles, lifted by groundH.
   A drop to a lower neighbour becomes two cliff triangles (lit and shaded). Back faces sit under the cap.
   sc.relief === false skips this (the home strip stays flat). Low effects skips it too. */
function paintRelief(sc){
 if(FX.low||sc.relief===false){sc.view=null;sc.fogView=null;return}
 var pad=28,minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9,c,r,x,y,h,k,a,q;
 for(r=0;r<sc.rows;r++)for(c=0;c<sc.cols;c++){x=hx(c,r);y=hy(r);h=groundH(sc.t[c][r]);
  for(k=0;k<6;k++){a=(60*k-30)*PI/180;var p0=project(x+S*Math.cos(a),y+S*Math.sin(a),0),p1=project(x+S*Math.cos(a),y+S*Math.sin(a),h);
   if(p0.x<minX)minX=p0.x;if(p1.x<minX)minX=p1.x;if(p0.y<minY)minY=p0.y;if(p1.y<minY)minY=p1.y;
   if(p0.x>maxX)maxX=p0.x;if(p1.x>maxX)maxX=p1.x;if(p0.y>maxY)maxY=p0.y;if(p1.y>maxY)maxY=p1.y}}
 var ox=pad-minX,oy=pad-minY,W=Math.ceil(maxX-minX+pad*2),Hh=Math.ceil(maxY-minY+pad*2);
 var cv=document.createElement('canvas');cv.width=Math.max(1,W);cv.height=Math.max(1,Hh);var g=cv.getContext('2d');
 var bg=g.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#1d3a4c');bg.addColorStop(1,'#0f2030');g.fillStyle=bg;g.fillRect(0,0,cv.width,cv.height);
 var tiles=[];for(r=0;r<sc.rows;r++)for(c=0;c<sc.cols;c++)tiles.push([hy(r),c,r]);
 tiles.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});
 var groups={},heights=[];
 for(var i=0;i<tiles.length;i++){c=tiles[i][1];r=tiles[i][2];x=hx(c,r);y=hy(r);h=groundH(sc.t[c][r]);
  for(var e=0;e<6;e++){var n=neigh(c,r,e),inside=n[0]>=0&&n[1]>=0&&n[0]<sc.cols&&n[1]<sc.rows,nh=inside?groundH(sc.t[n[0]][n[1]]):0;if(nh>=h-0.5)continue;
   var ed=EDGE[e],A=corner(x,y,ed[0]),B=corner(x,y,ed[1]);
   var tA=project(A[0],A[1],h),tB=project(B[0],B[1],h),bA=project(A[0],A[1],nh),bB=project(B[0],B[1],nh);
   var nx=hx(n[0],n[1])-x,ny=hy(n[1])-y,ln=Math.hypot(nx,ny)||1;nx/=ln;ny/=ln;
   /* A darkened cap went near-black (mountain rgb ~29). Faces are stone, earth or a sand bank. Shade stays above ~0.55. */
   var drop=h-nh,stone=drop>=16?[152,144,132]:drop>=8?[146,112,74]:[186,158,108];
   var lam=nx*-0.55+ny*-0.84,sh=0.70+0.30*(lam*0.5+0.5);
   var A1=[ox+tA.x,oy+tA.y],B1=[ox+tB.x,oy+tB.y],A0=[ox+bA.x,oy+bA.y],B0=[ox+bB.x,oy+bB.y];
   g.fillStyle=rgb(stone,Math.min(1.08,sh*1.02));g.beginPath();g.moveTo(A1[0],A1[1]);g.lineTo(B1[0],B1[1]);g.lineTo(A0[0],A0[1]);g.closePath();g.fill();
   g.fillStyle=rgb(stone,sh*0.78);g.beginPath();g.moveTo(B1[0],B1[1]);g.lineTo(B0[0],B0[1]);g.lineTo(A0[0],A0[1]);g.closePath();g.fill();
   if(drop>=12){g.strokeStyle='rgba(48,36,24,.35)';g.lineWidth=1;var steps=drop>=28?3:2,si,tt;
    for(si=1;si<=steps;si++){tt=si/(steps+1);g.beginPath();g.moveTo(A1[0]+(A0[0]-A1[0])*tt,A1[1]+(A0[1]-A1[1])*tt);g.lineTo(B1[0]+(B0[0]-B1[0])*tt,B1[1]+(B0[1]-B1[1])*tt);g.stroke()}}
   g.strokeStyle='rgba(255,244,210,.45)';g.lineWidth=1.4;g.beginPath();g.moveTo(A1[0],A1[1]);g.lineTo(B1[0],B1[1]);g.stroke()}
  if(!groups[h]){groups[h]=[];heights.push(h)}groups[h].push([c,r])}
 heights.sort(function(a,b){return a-b});
 heights.forEach(function(hv){g.save();g.beginPath();groups[hv].forEach(function(cr){var xx=hx(cr[0],cr[1]),yy=hy(cr[1]);
  for(var k=0;k<6;k++){var ang=(60*k-30)*PI/180;q=project(xx+S*1.05*Math.cos(ang),yy+S*1.05*Math.sin(ang),hv);k?g.lineTo(ox+q.x,oy+q.y):g.moveTo(ox+q.x,oy+q.y)}g.closePath()});
  g.clip();g.setTransform(1,0,CAM.shear,CAM.v,ox,oy-hv);g.drawImage(sc.cv,0,0);g.restore()});
 sc.view=cv;sc.viewOx=ox;sc.viewOy=oy}
/* Low-poly plinth under a building or landmark. (0,0) is the ground contact in upright sprite space.
   The footprint uses the same shear and v as the ground, then extrudes straight up. West face is lit.
   The sprite shadow reaches about 8px below the feet, so the south face clears that.
   The face stops near 18px down. The next row's feet are about 29px down, so a neighbour stays on the ground. */
function podium(g,kind){var spec={hall:[32,14,10],guild:[30,14,10],smithy:[30,14,10],vault:[28,13,9],tower:[18,12,10],great:[40,14,10],town:[34,14,10],castle:[38,14,10],gate:[28,12,8],fountain:[22,12,8],landmark:[20,12,8],chest:[16,8,7],cache:[13,7,6]}[kind];if(!spec)return;
 var u=S/34,hw=spec[0]*u,hd=spec[1]*u,ht=spec[2]*u,sh=CAM.shear,v=CAM.v;
 function gp(gx,gy,up){return [gx+sh*gy,gy*v-up]}
 /* Top is the foot line (up 0). The block hangs down-screen so the sprite stands on it. */
 var p=[gp(-hw,-hd,0),gp(hw,-hd,0),gp(hw,hd,0),gp(-hw,hd,0),gp(-hw,-hd,-ht),gp(hw,-hd,-ht),gp(hw,hd,-ht),gp(-hw,hd,-ht)];
 function quad(a,b,d,e,col){g.fillStyle=col;g.beginPath();g.moveTo(p[a][0],p[a][1]);g.lineTo(p[b][0],p[b][1]);g.lineTo(p[d][0],p[d][1]);g.lineTo(p[e][0],p[e][1]);g.closePath();g.fill()}
 quad(3,2,6,7,'#6a5438');quad(0,3,7,4,'#d9cbb0');quad(1,2,6,5,'#3e342c');quad(0,1,2,3,'#efe4cc');
 g.strokeStyle='#c8a86a';g.lineWidth=Math.max(1,1.1*u);g.beginPath();g.moveTo(p[0][0],p[0][1]);g.lineTo(p[1][0],p[1][1]);g.lineTo(p[2][0],p[2][1]);g.lineTo(p[3][0],p[3][1]);g.closePath();g.stroke()}
function selfTestCam(){var errs=[],near=function(a,b){return Math.abs(a-b)<1e-4};
 var p=project(100,200,40);if(!near(p.x,28)||!near(p.y,84))errs.push('pinned project');
 var u=unproject(28,124);if(!near(u.x,100)||!near(u.y,200))errs.push('pinned unproject');
 [[10,20,0],[100,400,42],[0,0,5],[800,50,18]].forEach(function(s){var g0=project(s[0],s[1],0),gh=project(s[0],s[1],s[2]);
  if(!near(gh.x,g0.x))errs.push('height moved x');if(!near(gh.y,g0.y-s[2]))errs.push('height not vertical');
  var w=unproject(g0.x,g0.y);if(Math.hypot(w.x-s[0],w.y-s[1])>1e-4)errs.push('roundtrip')});
 var south=project(hx(4,5),hy(5),0),north=project(hx(4,4),hy(4),0);if(!(south.y>north.y))errs.push('south not down-screen');
 var top=project(50,80,42),bot=project(50,80,5);if(!near(top.x,bot.x)||!near(bot.y-top.y,37))errs.push('cliff');
 var cap=project(hx(3,4),hy(4),groundH('mountain')),y2=(cap.y+groundH('mountain'))/CAM.v,x2=cap.x-CAM.shear*y2,hit=px2hex(x2,y2);
 if(hit[0]!==3||hit[1]!==4)errs.push('cap pick '+hit.join(','));
 if(groundH('mountain')<=groundH('hills')||groundH('hills')<=groundH('forest')||groundH('grass')<=groundH('water'))errs.push('height order');
 return {ok:!errs.length,errs:errs}}

/* portraits: painted head-and-shoulders busts (r2). Rendered at the screen's pixel density (at least 2x, at most 3x) so they stay crisp on
   retina, with soft gradients, a warm key light from the upper left, a cool rim light on the right, brush-dab texture and catch-lit eyes.
   Same look object as the map figure (skin, hair, robe, trim, cape, hat, beard), so hero and NPCs stay consistent. Cached as data URLs. */
var pc={},MOODS={neutral:1,happy:1,thinking:1,surprised:1,encouraging:1};
/* stable per-NPC variety: hair style, skin tone, eye colour and outfit colours picked from a hash of the NPC's id (its name), so each NPC
   looks different from the others but always the same. The hero is never passed through this. */
var SKINS=['#f3d2b8','#efc4a0','#e2b48c','#d9a97c','#c99568','#b07c54','#8f5e3e','#6e4630'],EYES=['#5a3a22','#3f6a8a','#4a6a3a','#6a4a2a','#2f2a26','#5a5a7a'],
 TRIMS=['#d7b56a','#c9ced6','#e08a5a','#8cc4a4','#e6c46e','#b894d6','#7fb2e0'],TINTS=['#3a5f9a','#3f7a4f','#8a3a3a','#6a4a8a','#9a6a2a','#2f6f7a','#7a3a5a'],STYLES=['short','bun','pony','curly','braids','spiky'],nlc={};
function mixHex(a,b,t){var p=hex2(a),q=hex2(b);return '#'+[0,1,2].map(function(i){var v=Math.round(p[i]+(q[i]-p[i])*t);return (v<16?'0':'')+v.toString(16)}).join('')}
function idHash(id){var h=2166136261;id=String(id||'');for(var i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function npcLook(look,id){if(!look||!id)return look;var key=id+'|'+JSON.stringify(look);if(nlc[key])return nlc[key];var h=idHash(id),o={};for(var k in look)o[k]=look[k];
 function pick(a,n){return a[(h>>>n)%a.length]}
 if(!o.style)o.style=pick(STYLES,0);if(!o.eyes)o.eyes=pick(EYES,5);o.skin=pick(SKINS,9);o.trim=pick(TRIMS,13);o.robe=mixHex(look.robe||'#4a5f8a',pick(TINTS,17),.35);
 return nlc[key]=o}
function seedOf(look){var s=JSON.stringify(look),h=7;for(var i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h}
function portrait(look,size,mood){mood=MOODS[mood]?mood:'neutral';var dpr=Math.max(2,Math.min(3,Math.ceil(window.devicePixelRatio||1))),key=JSON.stringify(look)+size+'@'+dpr+(FX.low?'L':'')+mood;if(pc[key])return pc[key];
 var cv=document.createElement('canvas'),s=Math.round(size*dpr);cv.width=cv.height=s;var g=cv.getContext('2d');
 try{paintBust(g,look,s,seedOf(look),mood)}catch(e){g.setTransform(1,0,0,1,0,0);var k=s/27,lk2={};for(var kk in look)lk2[kk]=look[kk];lk2.staff=false;g.save();g.scale(k,k);figure(g,13.5,31.6,lk2,{t:0,face:1,flat:1});g.restore()}
 var u=cv.toDataURL();pc[key]=u;return u}
function paintBust(g,L,s,seed,mood){mood=mood||'neutral';var ST=L.style||'short',HV=false;var k=s/100,P=PI,low=FX.low;g.save();g.scale(k,k);
 var skin=L.skin||'#e2b48c',hair=L.hair||'#3b2a1d',robe=L.robe||'#4a5f8a',trim=L.trim||'#d7b56a',hat=L.hat,
  skinL=mix(skin,'#fff3e0',.35),skinD=mix(skin,'#6a2a2a',.32),skinDD=mix(skin,'#3a1a24',.5),robeL=mix(robe,'#fff4d8',.3),robeD=mix(robe,'#0a0a1a',.45),hairL=mix(hair,'#fff0d0',.35),hairD=mix(hair,'#000000',.4),
  RIM='rgba(170,220,255,',KEY='rgba(255,236,190,',INK='rgba(40,22,18,.55)';
 function R(i){return hash(seed,i,91)}
 function E(x,y,rx,ry,f,rot){g.fillStyle=f;g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,P*2);g.fill()}
 /* background: dusky painted sky tinted by the robe, a warm key glow and loose brush dabs */
 var bg=g.createLinearGradient(0,0,0,100);bg.addColorStop(0,mix(robe,'#2a3a52',.6));bg.addColorStop(1,mix(robe,'#0b1018',.82));g.fillStyle=bg;g.fillRect(0,0,100,100);
 var kg=g.createRadialGradient(28,22,2,32,30,70);kg.addColorStop(0,'rgba(255,224,160,.55)');kg.addColorStop(.5,'rgba(255,200,140,.14)');kg.addColorStop(1,'rgba(255,200,140,0)');g.fillStyle=kg;g.fillRect(0,0,100,100);
 if(!low)for(var i=0;i<26;i++){g.fillStyle=(i%3?'rgba(255,238,200,':'rgba(10,16,30,')+(.05+R(i)*.07).toFixed(3)+')';E(R(i+40)*100,R(i+80)*70,6+R(i+120)*12,2+R(i+160)*4,g.fillStyle,R(i+200)*P)}
 /* cape / hood back */
 if(L.cape){g.fillStyle=mix(L.cape,'#000',.25);g.beginPath();g.moveTo(8,100);g.quadraticCurveTo(10,66,30,62);g.lineTo(70,62);g.quadraticCurveTo(90,66,92,100);g.fill()}
 if(hat==='hood'){var hg0=g.createRadialGradient(40,34,4,50,44,40);hg0.addColorStop(0,robeL);hg0.addColorStop(.6,robe);hg0.addColorStop(1,robeD);g.fillStyle=hg0;g.beginPath();g.moveTo(18,74);g.quadraticCurveTo(13,34,28,20);g.quadraticCurveTo(44,8,60,3);g.quadraticCurveTo(62,12,72,20);g.quadraticCurveTo(86,30,82,74);g.closePath();g.fill();g.strokeStyle=INK;g.lineWidth=1.2;g.stroke()}
 /* hair back mass (long enough to frame the face), plus the per-NPC style pieces that sit behind the head */
 HV=!!hair&&hat!=='helm'&&hat!=='hood';
 if(HV){var hbg=g.createLinearGradient(30,0,80,90);hbg.addColorStop(0,hairL);hbg.addColorStop(.5,hair);hbg.addColorStop(1,hairD);
  if(ST==='bun'&&!hat){E(50,13,10,9,hbg);E(46,10,4,2.4,'rgba(255,240,210,.3)',-.4);g.strokeStyle=INK;g.lineWidth=1;g.beginPath();g.ellipse(50,13,10,9,0,0,P*2);g.stroke()}
  if(ST==='pony'){g.fillStyle=hbg;g.beginPath();g.moveTo(66,26);g.bezierCurveTo(90,30,88,58,80,74);g.bezierCurveTo(78,60,74,44,64,36);g.closePath();g.fill();g.strokeStyle=INK;g.lineWidth=1;g.stroke();g.strokeStyle='rgba(255,240,210,.3)';g.beginPath();g.moveTo(72,32);g.quadraticCurveTo(84,44,80,62);g.stroke()}
  if(ST==='curly'){for(var ci=0;ci<11;ci++){var ca=P*.95+ci*(P*1.1/10),cx2=50+Math.cos(ca)*25,cy2=44+Math.sin(ca)*26;E(cx2,cy2,7,7,ci%2?hair:hairD)}for(var cj=0;cj<4;cj++)E(28+cj*.5,52+cj*5,5.5,5.5,cj%2?hair:hairD),E(72-cj*.5,52+cj*5,5.5,5.5,cj%2?hairD:hair)}}
 if(HV){var hb=g.createLinearGradient(30,20,74,70);hb.addColorStop(0,hairL);hb.addColorStop(.45,hair);hb.addColorStop(1,hairD);g.fillStyle=hb;g.beginPath();g.moveTo(26,62);g.quadraticCurveTo(20,26,48,18);g.quadraticCurveTo(80,16,76,60);g.quadraticCurveTo(66,66,62,58);g.lineTo(38,58);g.quadraticCurveTo(32,66,26,62);g.fill()}
 /* shoulders + tunic: lit from the left, rim on the right, a couple of fold strokes */
 g.beginPath();g.moveTo(4,100);g.bezierCurveTo(6,80,18,70,36,66);g.quadraticCurveTo(50,72,64,66);g.bezierCurveTo(82,70,94,80,96,100);g.closePath();
 var tg=g.createLinearGradient(10,66,92,100);tg.addColorStop(0,robeL);tg.addColorStop(.5,robe);tg.addColorStop(1,robeD);g.fillStyle=tg;g.fill();g.strokeStyle=INK;g.lineWidth=1.2;g.stroke();
 g.save();g.clip();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(30,80);g.quadraticCurveTo(28,90,32,100);g.moveTo(72,78);g.quadraticCurveTo(76,90,72,100);g.stroke();
 g.strokeStyle='rgba(255,246,220,.22)';g.lineWidth=3;g.beginPath();g.moveTo(14,92);g.quadraticCurveTo(20,78,34,72);g.stroke();
 g.strokeStyle=RIM+'.55)';g.lineWidth=2.2;g.beginPath();g.moveTo(66,67);g.bezierCurveTo(82,70,92,80,95,96);g.stroke();
 /* collar V with trim */
 g.fillStyle=mix(robe,'#000',.3);g.beginPath();g.moveTo(40,66);g.lineTo(50,82);g.lineTo(60,66);g.fill();g.restore();
 g.strokeStyle=trim;g.lineWidth=2.6;g.lineJoin='round';g.beginPath();g.moveTo(38,66);g.lineTo(50,83);g.lineTo(62,66);g.stroke();g.strokeStyle='rgba(255,250,220,.6)';g.lineWidth=.8;g.beginPath();g.moveTo(39,65.4);g.lineTo(50,81.4);g.stroke();
 E(50,86,2.4,2.4,trim);E(49.3,85.3,.8,.8,'rgba(255,255,240,.9)');
 /* neck with the chin's shadow */
 g.fillStyle=skinD;g.beginPath();g.moveTo(43,58);g.lineTo(42,70);g.quadraticCurveTo(50,76,58,70);g.lineTo(57,58);g.fill();E(50,62,8,3.4,'rgba(60,20,20,.25)');
 /* ears */
 [[-1,27.5],[1,72.5]].forEach(function(e){E(e[1],46,4,6,e[0]<0?skin:skinD);E(e[1]-e[0]*.6,46,1.8,3.4,'rgba(120,50,40,.35)')});
 /* head: soft subsurface gradient, terminator shadow on the right, rim light */
 g.beginPath();g.ellipse(50,44,22,24,0,0,P*2);var hg=g.createRadialGradient(40,34,2,50,46,28);hg.addColorStop(0,skinL);hg.addColorStop(.55,skin);hg.addColorStop(1,skinD);g.fillStyle=hg;g.fill();
 g.save();g.clip();var sg=g.createLinearGradient(52,0,74,0);sg.addColorStop(0,'rgba(90,30,40,0)');sg.addColorStop(1,'rgba(90,30,40,.32)');g.fillStyle=sg;g.fillRect(50,18,26,54);
 E(50,70,20,6,'rgba(90,30,40,.18)');
 g.strokeStyle=RIM+'.6)';g.lineWidth=1.8;g.beginPath();g.ellipse(50,44,21.4,23.4,0,-.9,.9);g.stroke();
 if(!low)for(var j=0;j<18;j++){g.fillStyle=(j%2?KEY+'.07)':'rgba(120,40,40,.06)');E(30+R(j+300)*40,24+R(j+330)*44,3+R(j+360)*4,1.2+R(j+390)*1.6,g.fillStyle,R(j+420)*P)}
 g.restore();g.strokeStyle=INK;g.lineWidth=1.1;g.beginPath();g.ellipse(50,44,22,24,0,0,P*2);g.stroke();
 /* cheeks */
 var cg1=g.createRadialGradient(36,52,0,36,52,7);cg1.addColorStop(0,'rgba(236,110,110,.42)');cg1.addColorStop(1,'rgba(236,110,110,0)');g.fillStyle=cg1;g.fillRect(28,44,16,16);
 var cg2=g.createRadialGradient(64,52,0,64,52,7);cg2.addColorStop(0,'rgba(236,110,110,.36)');cg2.addColorStop(1,'rgba(236,110,110,0)');g.fillStyle=cg2;g.fillRect(56,44,16,16);
 /* eyes, brows and mouth follow the mood: neutral, happy (smiling closed eyes), thinking (glance up, one brow raised), surprised (wide eyes, round mouth) */
 var iris=L.eyes||(hash(seed,1,5)<.5?'#5a3a22':'#3f6a8a'),eo=mood==='surprised'?1.18:1,gx=mood==='thinking'?1.6:0,gy=mood==='thinking'?-1.8:0;
 [[41,45],[59,45]].forEach(function(p){var x=p[0],y=p[1];
  if(mood==='happy'){g.strokeStyle='#2a1610';g.lineWidth=2;g.lineCap='round';g.beginPath();g.arc(x,y+2.4,4.6,P*1.15,P*1.85);g.stroke();return}
  E(x,y,5*eo,5.6*eo,'#fbf6ee');g.save();g.beginPath();g.ellipse(x,y,5*eo,5.6*eo,0,0,P*2);g.clip();
  var ix=x+.6+gx,iy=y+.8+gy,ir=mood==='surprised'?.85:1;
  var ig=g.createRadialGradient(ix,iy+.4,.5,ix,iy,4.4*ir);ig.addColorStop(0,mix(iris,'#ffffff',.35));ig.addColorStop(.7,iris);ig.addColorStop(1,mix(iris,'#000',.5));E(ix,iy,4.2*ir,4.6*ir,ig);E(ix,iy+.1,2*ir,2.2*ir,'#140c08');
  if(mood==='encouraging')E(x,y-4.4,6.4,3.4,skin);if(mood!=='surprised')E(x,y-4,6,2.4,'rgba(60,30,30,.25)');g.restore();E(ix-1.5,iy-2,1.4,1.4,'#ffffff');E(ix+1.4,iy+1.4,.6,.6,'rgba(255,255,255,.85)');
  g.strokeStyle='#2a1610';g.lineWidth=1.5;g.lineCap='round';g.beginPath();g.ellipse(x,y,5.2*eo,5.8*eo,0,P*1.08,P*1.92);g.stroke()});
 /* brows */
 g.strokeStyle=mix(hair,'#000',.2);g.lineWidth=1.8;g.lineCap='round';g.beginPath();
 if(mood==='surprised'){g.moveTo(35,33.5);g.quadraticCurveTo(41,30,46,33);g.moveTo(54,33);g.quadraticCurveTo(59,30,65,33.5)}
 else if(mood==='thinking'){g.moveTo(36,38);g.quadraticCurveTo(41,37,46,38);g.moveTo(54,35);g.quadraticCurveTo(59,31.5,64,34)}
 else if(mood==='encouraging'){g.moveTo(36,37.6);g.quadraticCurveTo(41,36.4,46,34.6);g.moveTo(54,34.6);g.quadraticCurveTo(59,36.4,64,37.6)}
 else if(mood==='happy'){g.moveTo(36,36.5);g.quadraticCurveTo(41,33.5,46,36);g.moveTo(54,36);g.quadraticCurveTo(59,33.5,64,36.5)}
 else{g.moveTo(36,37.5);g.quadraticCurveTo(41,35,46,37);g.moveTo(54,37);g.quadraticCurveTo(59,35,64,37.5)}g.stroke();
 /* nose: shadow on the right, highlight on the bridge */
 g.strokeStyle='rgba(120,50,40,.45)';g.lineWidth=1.3;g.beginPath();g.moveTo(51.5,47);g.quadraticCurveTo(53.5,53,50.5,54);g.stroke();E(48.6,51.6,1.1,1.6,KEY+'.55)');
 function mouth(dy){g.save();g.translate(0,dy);g.lineCap='round';
  if(mood==='happy'){g.fillStyle='#7a2a26';g.beginPath();g.moveTo(42,57);g.quadraticCurveTo(50,68,58,57);g.quadraticCurveTo(50,59.5,42,57);g.fill();g.strokeStyle='rgba(90,30,24,.85)';g.lineWidth=1;g.stroke();g.fillStyle='#fbf6ee';g.beginPath();g.moveTo(44,58);g.quadraticCurveTo(50,60.4,56,58);g.lineTo(55,60);g.quadraticCurveTo(50,61.4,45,60);g.closePath();g.fill();E(50,64.2,3.4,1.4,'rgba(255,150,140,.85)')}
  else if(mood==='surprised'){E(50,60,3.6,4.4,'#6a2420');E(50,62.2,2.2,1.6,'rgba(255,150,140,.7)');g.strokeStyle='rgba(90,30,24,.85)';g.lineWidth=1;g.beginPath();g.ellipse(50,60,3.6,4.4,0,0,P*2);g.stroke()}
  else if(mood==='encouraging'){g.strokeStyle='rgba(110,40,34,.9)';g.lineWidth=1.7;g.beginPath();g.moveTo(43,58);g.quadraticCurveTo(50,63.4,57,58);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(42.2,57.2);g.lineTo(43.4,58.6);g.moveTo(57.8,57.2);g.lineTo(56.6,58.6);g.stroke()}
  else if(mood==='thinking'){g.strokeStyle='rgba(110,40,34,.9)';g.lineWidth=1.6;g.beginPath();g.moveTo(46,60);g.quadraticCurveTo(51,58.6,56,59.4);g.stroke()}
  else{g.fillStyle='#8a3a32';g.beginPath();g.moveTo(44,58);g.quadraticCurveTo(50,64.5,56,58);g.quadraticCurveTo(50,60,44,58);g.fill();g.strokeStyle='rgba(90,30,24,.8)';g.lineWidth=1;g.stroke();E(50,61,2.4,.8,'rgba(255,170,160,.6)')}
  g.restore()}
 if(!L.beard)mouth(0);
 /* beard */
 if(L.beard){var bdg=g.createLinearGradient(30,50,70,72);bdg.addColorStop(0,hairL);bdg.addColorStop(1,hairD);g.fillStyle=bdg;g.beginPath();g.moveTo(29,48);g.quadraticCurveTo(30,72,50,76);g.quadraticCurveTo(70,72,71,48);g.quadraticCurveTo(66,58,58,56.5);g.quadraticCurveTo(50,54,42,56.5);g.quadraticCurveTo(34,58,29,48);g.fill();g.strokeStyle=INK;g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(255,250,235,.25)';g.lineWidth=.8;for(var b2=0;b2<7;b2++){var bx=36+b2*4.5;g.beginPath();g.moveTo(bx,60+R(b2+500)*3);g.quadraticCurveTo(bx+1,67,bx+(bx<50?2:-2),72);g.stroke()}
  mouth(1.5)}
 /* hair fringe with painted strands and a sheen */
 if(hair&&hat!=='helm'&&hat!=='hood'){var fg=g.createLinearGradient(30,18,70,40);fg.addColorStop(0,hairL);fg.addColorStop(.5,hair);fg.addColorStop(1,hairD);g.fillStyle=fg;g.beginPath();g.moveTo(27,46);g.quadraticCurveTo(24,20,50,17);g.quadraticCurveTo(77,18,73,46);g.quadraticCurveTo(70,32,60,30);g.quadraticCurveTo(54,36,44,32);g.quadraticCurveTo(34,34,27,46);g.fill();g.strokeStyle=INK;g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(255,240,210,.35)';g.lineWidth=1.1;g.lineCap='round';for(var h3=0;h3<6;h3++){var sx=34+h3*5;g.beginPath();g.moveTo(sx,22+R(h3+600)*2);g.quadraticCurveTo(sx-3,27,sx-5+R(h3+620)*2,33);g.stroke()}
  g.strokeStyle=RIM+'.5)';g.lineWidth=1.4;g.beginPath();g.moveTo(66,21);g.quadraticCurveTo(74,28,73,44);g.stroke()}
 /* hats */
 if(hat==='hood'){g.strokeStyle=robeD;g.lineWidth=5;g.beginPath();g.ellipse(50,40,25,27,0,P*1.02,P*1.98);g.stroke();g.strokeStyle='rgba(255,240,210,.22)';g.lineWidth=1.4;g.beginPath();g.moveTo(22,60);g.quadraticCurveTo(20,30,40,16);g.stroke();
  g.fillStyle=hair;g.beginPath();g.moveTo(31,38);g.quadraticCurveTo(40,22,50,24);g.quadraticCurveTo(62,22,69,38);g.quadraticCurveTo(58,30,50,33);g.quadraticCurveTo(40,30,31,38);g.fill()}
 if(hat==='cap'){var cpg=g.createLinearGradient(28,8,72,30);cpg.addColorStop(0,robeL);cpg.addColorStop(1,robeD);g.fillStyle=cpg;g.beginPath();g.moveTo(26,32);g.quadraticCurveTo(28,8,50,8);g.quadraticCurveTo(72,8,74,32);g.quadraticCurveTo(50,26,26,32);g.fill();g.strokeStyle=INK;g.lineWidth=1.1;g.stroke();
  g.fillStyle=robeD;g.beginPath();g.moveTo(26,32);g.quadraticCurveTo(50,25,74,32);g.quadraticCurveTo(84,34,86,38);g.quadraticCurveTo(60,33,26,36);g.closePath();g.fill();g.stroke();g.fillStyle=trim;g.fillRect(28,28.6,44,2.6);E(50,9,3,2.4,trim);E(36,16,5,2.2,'rgba(255,250,230,.25)',-.5)}
 if(hat==='scholar'){g.fillStyle='#2a2230';g.beginPath();g.moveTo(26,22);g.quadraticCurveTo(50,14,74,22);g.lineTo(72,30);g.quadraticCurveTo(50,24,28,30);g.closePath();g.fill();
  g.beginPath();g.moveTo(16,18);g.lineTo(50,6);g.lineTo(84,18);g.lineTo(50,28);g.closePath();var bdg2=g.createLinearGradient(16,6,84,28);bdg2.addColorStop(0,'#4a3e58');bdg2.addColorStop(1,'#1a1420');g.fillStyle=bdg2;g.fill();g.strokeStyle=INK;g.lineWidth=1;g.stroke();
  g.strokeStyle='rgba(200,220,255,.35)';g.beginPath();g.moveTo(16,18);g.lineTo(50,6);g.stroke();
  g.strokeStyle=trim;g.lineWidth=1.4;g.beginPath();g.moveTo(50,16);g.quadraticCurveTo(70,16,76,34);g.stroke();E(76,36,2.2,3.2,trim);E(50,16,1.6,1.6,trim)}
 if(hat==='helm'){var mg=g.createLinearGradient(26,0,74,0);mg.addColorStop(0,'#eef2f6');mg.addColorStop(.4,'#aab4c0');mg.addColorStop(1,'#4e5660');g.fillStyle=mg;g.beginPath();g.moveTo(26,36);g.quadraticCurveTo(24,8,50,8);g.quadraticCurveTo(76,8,74,36);g.lineTo(26,36);g.fill();g.strokeStyle=INK;g.lineWidth=1.1;g.stroke();
  g.fillStyle=trim;g.fillRect(25,32,50,4);E(38,18,4,7,'rgba(255,255,255,.4)',-.4);g.strokeStyle=RIM+'.6)';g.lineWidth=1.4;g.beginPath();g.moveTo(66,12);g.quadraticCurveTo(74,20,74,32);g.stroke();g.fillStyle='#d2483a';g.beginPath();g.ellipse(50,4,3.4,6,0,0,P*2);g.fill()}
 if(hat==='crown'){g.beginPath();g.moveTo(32,24);g.lineTo(30,8);g.lineTo(40,16);g.lineTo(50,4);g.lineTo(60,16);g.lineTo(70,8);g.lineTo(68,24);g.closePath();var crg=g.createLinearGradient(30,4,70,24);crg.addColorStop(0,'#fff0a8');crg.addColorStop(.5,'#f2c84b');crg.addColorStop(1,'#a8781e');g.fillStyle=crg;g.fill();g.strokeStyle=INK;g.lineWidth=1;g.stroke();E(50,18,2.6,2.6,'#d2483a');E(39,20,1.8,1.8,'#4f8fd0');E(61,20,1.8,1.8,'#4f8fd0');E(49.2,17.2,.8,.8,'#fff')}
 /* front style pieces */
 if(HV&&ST==='braids'){[[29,1],[71,-1]].forEach(function(b){for(var q=0;q<5;q++){var by=54+q*6,bx=b[0]+b[1]*q*.4;E(bx,by,4.2,3.6,q%2?hair:hairD);E(bx-1,by-1,1.6,1,'rgba(255,240,210,.35)')}E(b[0]+b[1]*2,86,2.6,2,trim)})}
 if(HV&&ST==='spiky'&&hat!=='scholar'&&hat!=='crown'){g.fillStyle=hair;g.strokeStyle=INK;g.lineWidth=1;[[34,24,30,12,42,20],[44,20,46,7,54,19],[54,19,62,8,64,24],[62,22,74,16,70,30]].forEach(function(t){g.beginPath();g.moveTo(t[0],t[1]);g.lineTo(t[2],t[3]);g.lineTo(t[4],t[5]);g.closePath();g.fill();g.stroke()})}
 if(mood==='encouraging'){g.fillStyle='rgba(255,150,170,.9)';g.beginPath();g.moveTo(86,24);g.bezierCurveTo(78,18,80,11,86,15);g.bezierCurveTo(92,11,94,18,86,24);g.fill();E(83.6,15.6,1.2,.8,'rgba(255,255,255,.7)')}
 if(mood==='thinking'){E(82,22,3.2,3.2,'rgba(255,248,230,.85)');E(88,14,2.2,2.2,'rgba(255,248,230,.75)');E(92,8,1.4,1.4,'rgba(255,248,230,.65)')}
 if(mood==='surprised'){g.strokeStyle='rgba(255,240,170,.9)';g.lineWidth=1.8;g.lineCap='round';[[80,20,88,14],[84,28,93,27],[78,13,82,5]].forEach(function(l){g.beginPath();g.moveTo(l[0],l[1]);g.lineTo(l[2],l[3]);g.stroke()})}
 if(mood==='happy'&&!low){[[84,18],[16,22]].forEach(function(p,i){var r=i?2.2:3;g.fillStyle='rgba(255,236,160,.9)';g.beginPath();g.moveTo(p[0],p[1]-r*2);g.lineTo(p[0]+r*.6,p[1]);g.lineTo(p[0],p[1]+r*2);g.lineTo(p[0]-r*.6,p[1]);g.closePath();g.fill()})}
 /* painterly finish: canvas grain, a warm glaze, vignette and an inner bevel */
 if(!low){for(var n=0;n<160;n++){var nx=R(n+700)*100,ny=R(n+900)*100;g.fillStyle=n%2?'rgba(255,245,220,.05)':'rgba(20,10,0,.06)';g.fillRect(nx,ny,1.6,.6)}}
 var vg=g.createRadialGradient(46,42,30,50,50,74);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(4,6,12,.5)');g.fillStyle=vg;g.fillRect(0,0,100,100);
 g.strokeStyle='rgba(255,236,190,.28)';g.lineWidth=1.2;g.strokeRect(1.2,1.2,97.6,97.6);
 g.restore()}

/* Ground-plane squash for shadows. world.js writes s and y each frame. flat:1 (portraits) skips it. */
var camSkew={s:0,y:1};
function groundBlob(g,flat,draw){g.save();if(!flat)g.transform(1,0,camSkew.s,camSkew.y,0,0);draw();g.restore()}
/* A stone pad under a building or landmark. The cap lies on the leaned ground.
   A short front wall, in the same three facets as a cliff, shows only while the camera leans.
   A flat camera, Low effects, or a portrait keeps the old soft shadow. */
function stoneBase(g,flat,hw,hd,rise,col){
 var leaned=!flat&&!FX.low&&camSkew.y<0.95&&rise>1;
 if(!leaned){groundBlob(g,flat,function(){ell(g,8,3,32,7,'rgba(8,12,18,.3)');ell(g,2,1,18,4,'rgba(8,12,18,.18)')});return}
 col=col||'#c4b89a';var ry=Math.max(3,hd*.46);
 groundBlob(g,flat,function(){
  ell(g,hw*.12,ry*.35,hw*1.08,ry*1.15,'rgba(8,12,18,.34)');
  ell(g,0,0,hw,ry,col);
  ell(g,-hw*.24,-ry*.16,hw*.46,Math.max(2,ry*.38),mix(col,'#ffffff',.2))});
 var sy=camSkew.y,sh=camSkew.s,angs=[.16*PI,.4*PI,.6*PI,.84*PI,PI-.16*PI],top=[],i;
 for(i=0;i<angs.length;i++){var lx=hw*Math.cos(angs[i]),ly=ry*Math.sin(angs[i]);top.push([lx+sh*ly,ly*sy])}
 function facet(a,b,fill){g.fillStyle=fill;g.beginPath();g.moveTo(top[a][0],top[a][1]);g.lineTo(top[b][0],top[b][1]);g.lineTo(top[b][0],top[b][1]+rise);g.lineTo(top[a][0],top[a][1]+rise);g.closePath();g.fill()}
 facet(3,4,mix(col,'#ffffff',.16));
 facet(2,3,mix(col,'#000000',.1));
 facet(1,2,mix(col,'#000000',.24));
 facet(0,1,mix(col,'#000000',.4));
 g.strokeStyle='rgba(255,244,220,.28)';g.lineWidth=Math.max(1,rise*.12);g.beginPath();g.moveTo(top[4][0],top[4][1]);for(i=3;i>=0;i--)g.lineTo(top[i][0],top[i][1]);g.stroke()}
/* animated figure, feet at (x, y+0.38S). Chunky, friendly proportions (big head, short body) with a soft ink outline so characters read at small sizes.
   o: {t, moving, face:1|-1, step, hop, foot, turn, wave, celebrate}.
   When step is set, one stride matches one hex, the leading foot lifts, and hop lifts the body only. A turn squashes sideways. Idle stirs hair, hood, plume, cap, crown and beard.
   A celebrate pose leaves a gold pool on the ground. The pool stays put while the body hops. */
var OUT='rgba(28,18,12,.88)';var RIMC='rgba(176,224,255,';
function oFill(g,fill,lw){g.fillStyle=fill;g.fill();g.strokeStyle=OUT;g.lineWidth=lw;g.lineJoin='round';g.lineCap='round';g.stroke()}
function limb(g,x0,y0,x1,y1,w,col,lw){g.lineCap='round';g.strokeStyle=OUT;g.lineWidth=w+lw*2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function figure(g,x,y,look,o){look=look||{};o=o||{};var u=S/34,t=o.t||0,mv=!!o.moving,f=o.face||1,cel=!!o.celebrate&&!mv,lw=1.1*u,
  has=mv&&typeof o.step==='number',phase=mv?(has?Math.sin(o.step*Math.PI)*(o.foot||1):Math.sin(t*12)):0,
  hop=(!cel&&typeof o.hop==='number')?o.hop:0,
  bob=mv?(has?0:Math.abs(phase)*2.2*u):(cel?Math.abs(Math.sin(t*7))*7*u:0),
  breath=mv||cel?0:Math.sin(t*2.2+(x||0)*.13)*.6*u,
  blink=!cel&&((t+Math.abs((x||0)*.017))%3.7)<.12,robe=look.robe||'#888',skin=look.skin||'#e2b48c',trim=look.trim||'#d7b56a',
  robeD=mix(robe,'#000000',.32),robeL=mix(robe,'#ffffff',.22),skinD=mix(skin,'#5a2a1a',.22);
 g.save();g.translate(x,y+S*.38);
 var lift=bob+hop,sh=Math.max(.45,1-lift/(14*u));
 /* contact shadow. Full effects casts it down-right, the same way as the key light (upper left). flat keeps the round shadow for portraits. Low effects keeps the old centred blob. */
 if(!FX.low&&!o.flat){ell(g,9*u*sh,4.2*u,15*u*sh,4.4*u*sh,'rgba(8,10,16,.40)');ell(g,3.2*u*sh,1.6*u,6.4*u*sh,2.1*u*sh,'rgba(8,10,16,.22)');}
 else{ell(g,0,.5*u,11*u*sh,3.6*u*sh,'rgba(10,8,4,.32)');ell(g,0,.5*u,6*u*sh,2*u*sh,'rgba(10,8,4,.25)');}

 if(cel){var gp=.42+.22*Math.abs(Math.sin(t*6)),pg=g.createRadialGradient(0,0,2*u,0,0,24*u);pg.addColorStop(0,'rgba(255,228,140,'+gp+')');pg.addColorStop(1,'rgba(255,228,140,0)');g.fillStyle=pg;g.beginPath();g.ellipse(0,1*u,24*u,9*u,0,0,PI*2);g.fill()}
 g.translate(0,-lift);
 if(has&&o.step>.82)g.scale(1.05,.94);
 if(o.turn>0){var ts=.34+.66*(1-Math.min(1,o.turn));g.scale(ts,1)}
 var sw=phase*3.4*u,up=4.2*u,lUp=Math.max(0,phase)*up,rUp=Math.max(0,-phase)*up,lx=-2.6*u+sw*.6,ly=-1.6*u-lUp,rx=2.6*u-sw*.6,ry=-1.6*u-rUp;
 limb(g,-2.6*u,-9*u,lx,ly,3.4*u,robeD,lw);limb(g,2.6*u,-9*u,rx,ry,3.4*u,robeD,lw);
 [[lx,ly],[rx,ry]].forEach(function(b){g.beginPath();g.ellipse(b[0]+f*.8*u,b[1]+.4*u,2.8*u,1.9*u,0,0,PI*2);oFill(g,'#4a2f1c',lw*.8)});
 if(look.cape){var cs=(mv?phase*1.5:Math.sin(t*1.6+(x||0))*1.6)*u;g.beginPath();g.moveTo(-6*u,-24*u);g.quadraticCurveTo(-f*9*u,-14*u,-f*10*u+cs-f*2*u,-4*u);g.lineTo(f*3*u+cs,-4.5*u);g.lineTo(6*u,-24*u);g.closePath();oFill(g,mix(look.cape,'#000000',.15),lw)}
 var as=phase*4*u,armC=mix(robe,'#000000',.18),wave=o.wave||0,raise=!cel&&wave>.35;
 if(cel){limb(g,-5.5*u,-21*u,-10*u,-31*u-Math.sin(t*7)*1.5*u,3.2*u,armC,lw)}
 else limb(g,-f*5.5*u,-21*u,-f*7.5*u-as,-12.5*u,3.2*u,armC,lw);
 g.beginPath();g.moveTo(-5.6*u,-24.5*u+breath);g.quadraticCurveTo(-10.5*u,-14*u,-9*u,-7.5*u);g.quadraticCurveTo(0,-5*u,9*u,-7.5*u);g.quadraticCurveTo(10.5*u,-14*u,5.6*u,-24.5*u+breath);g.quadraticCurveTo(0,-26.5*u+breath,-5.6*u,-24.5*u+breath);g.closePath();
 var rb=g.createLinearGradient(-9*u,-20*u,9*u,-8*u);rb.addColorStop(0,robeL);rb.addColorStop(.55,robe);rb.addColorStop(1,robeD);oFill(g,rb,lw);
 g.save();g.clip();g.fillStyle=trim;g.fillRect(-11*u,-15.6*u,22*u,1.8*u);g.fillRect(-11*u,-9.4*u,22*u,1.6*u);g.fillStyle=mix(trim,'#000000',.35);g.fillRect(-1.3*u,-16*u,2.6*u,2.6*u);
 g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.ellipse(-4*u,-19*u,2*u,5*u,.3,0,PI*2);g.fill();g.restore();
 g.strokeStyle=trim;g.lineWidth=1.2*u;g.beginPath();g.moveTo(-2.8*u,-24.6*u+breath);g.lineTo(0,-21*u+breath);g.lineTo(2.8*u,-24.6*u+breath);g.stroke();
 /* painterly pass (PR #5, full effects): shadow under the chin, fabric folds and a cool rim light on the side away from the sun */
 if(!FX.low){ell(g,0,-23.6*u+breath,5*u,1.5*u,'rgba(40,14,20,.28)');g.lineCap='round';g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=.9*u;g.beginPath();g.moveTo(-3.4*u,-14*u);g.quadraticCurveTo(-4.4*u,-11*u,-3.8*u,-8.2*u);g.moveTo(3.6*u,-14*u);g.quadraticCurveTo(4.6*u,-11*u,4.2*u,-8.2*u);g.stroke();
  g.strokeStyle=RIMC+'.6)';g.lineWidth=1*u;g.beginPath();g.moveTo(5.2*u,-23.6*u+breath);g.quadraticCurveTo(9.6*u,-14*u,8.4*u,-8.3*u);g.stroke()}
 var hx2,hy2;
 if(cel){hx2=10*u;hy2=-31*u-Math.cos(t*7)*1.5*u}
 else if(raise){hx2=f*9*u;hy2=-32*u-Math.sin(t*3)*1.4*u}
 else{hx2=f*7.5*u+as;hy2=-12.5*u}
 limb(g,f*5.5*u,-21*u,hx2,hy2,3.2*u,robe,lw);g.beginPath();g.arc(hx2,hy2,1.9*u,0,PI*2);oFill(g,skin,lw*.8);
 if(cel){g.beginPath();g.arc(-10*u,-31*u-Math.sin(t*7)*1.5*u,1.9*u,0,PI*2);oFill(g,skin,lw*.8)}
 var hs=mv||cel?0:Math.sin(t*1.7+(x||0))*u,hd=mv||cel?0:Math.sin(t*1.5+(x||0))*.6*u;
 var hy0=-32*u+breath*.6,hr=8.4*u;
 if(look.hat==='hood'){g.beginPath();g.ellipse(hd,hy0-.6*u,hr+2*u,hr+1.8*u,0,0,PI*2);oFill(g,robe,lw)}
 var hv=look.hair&&look.hat!=='helm'&&look.hat!=='hood',hst=look.style;/* PR #7 hair styles, from Art.npcLook */
 if(hv&&hst==='bun'&&!look.hat){g.beginPath();g.arc(-f*1*u+hs,hy0-hr-1.4*u,3.6*u,0,PI*2);oFill(g,look.hair,lw)}
 if(hv&&hst==='pony'){g.beginPath();g.moveTo(-f*5*u+hs,hy0-4*u);g.quadraticCurveTo(-f*13*u+hs,hy0+1*u,-f*10*u+hs,hy0+10*u);g.quadraticCurveTo(-f*8*u+hs,hy0+3*u,-f*3*u+hs,hy0);g.closePath();oFill(g,look.hair,lw)}
 if(hv&&hst==='curly'){for(var cq=0;cq<7;cq++){var ca2=PI*.95+cq*(PI*1.1/6);g.beginPath();g.arc(Math.cos(ca2)*(hr+.6*u)+hs,hy0+Math.sin(ca2)*(hr+.6*u),2.8*u,0,PI*2);oFill(g,look.hair,lw*.7)}}
 if(look.hair&&look.hat!=='helm'&&look.hat!=='hood'){g.beginPath();g.ellipse(-f*.8*u+hs,hy0+1*u,hr+.9*u,hr+.6*u,0,0,PI*2);oFill(g,look.hair,lw)}
 if(hv&&hst==='braids'){[-1,1].forEach(function(sd){for(var bq=0;bq<3;bq++){g.beginPath();g.arc(sd*(hr+.6*u)+hs,hy0+3*u+bq*2.6*u,1.7*u,0,PI*2);oFill(g,look.hair,lw*.6)}})}
 g.beginPath();g.arc(0,hy0,hr,0,PI*2);var hg=g.createRadialGradient(-3*u,hy0-3*u,1,0,hy0,hr*1.1);hg.addColorStop(0,mix(skin,'#ffffff',.25));hg.addColorStop(.7,skin);hg.addColorStop(1,skinD);oFill(g,hg,lw);
 if(!FX.low){g.save();g.beginPath();g.arc(0,hy0,hr,0,PI*2);g.clip();var tg2=g.createLinearGradient(1*u,0,hr,0);tg2.addColorStop(0,'rgba(90,30,40,0)');tg2.addColorStop(1,'rgba(90,30,40,.26)');g.fillStyle=tg2;g.fillRect(0,hy0-hr,hr,hr*2);ell(g,-3.4*u,hy0-3.6*u,2.6*u,1.8*u,'rgba(255,240,210,.28)');g.strokeStyle=RIMC+'.42)';g.lineWidth=.8*u;g.beginPath();g.arc(-.4*u,hy0,hr-.4*u,-.9,.8);g.stroke();g.restore()}
 if(look.hat==='hood'){g.beginPath();g.arc(hd,hy0+.5*u,hr+.6*u,PI*1.05,PI*1.95);g.quadraticCurveTo(hd,hy0-hr*.35,hd-hr*.98,hy0-2.4*u);g.closePath();oFill(g,robeD,lw*.7)}
 if(look.hair&&look.hat!=='helm'&&look.hat!=='hood'){g.beginPath();g.moveTo(-hr*.98+hs,hy0-1*u);g.quadraticCurveTo(-hr*.9+hs,hy0-hr*1.05,hs,hy0-hr*1.02);g.quadraticCurveTo(hr*.9+hs,hy0-hr*1.05,hr*.98+hs,hy0-1*u);g.quadraticCurveTo(f*2*u+hs,hy0-5.2*u,-hr*.98+hs,hy0-1*u);g.closePath();oFill(g,look.hair,lw*.7)}
 if(!FX.low&&look.hair&&look.hat!=='helm'&&look.hat!=='hood'){g.strokeStyle='rgba(255,240,210,.38)';g.lineWidth=.8*u;g.lineCap='round';for(var hsI=0;hsI<3;hsI++){var hx3=(-4+hsI*2.6)*u+hs;g.beginPath();g.moveTo(hx3+1.2*u,hy0-hr*.92);g.quadraticCurveTo(hx3-.4*u,hy0-hr*.7,hx3-1*u,hy0-hr*.45);g.stroke()}g.strokeStyle=RIMC+'.55)';g.lineWidth=.9*u;g.beginPath();g.arc(-f*.8*u+hs,hy0+1*u,hr+.5*u,-1.3,-.3);g.stroke()}
 var ex=f*1.6*u,ey=hy0+.6*u;
 [-1,1].forEach(function(s){var px=ex+s*3*u;if(blink||cel){g.strokeStyle='#1a1208';g.lineWidth=1.1*u;g.beginPath();if(cel){g.arc(px,ey+.6*u,1.5*u,PI*1.15,PI*1.85)}else{g.moveTo(px-1.4*u,ey);g.lineTo(px+1.4*u,ey)}g.stroke()}else{ell(g,px,ey,1.5*u,2*u,'#1a1208');ell(g,px+.5*u,ey-.7*u,.6*u,.6*u,'#ffffff')}
  ell(g,px+s*.8*u,ey+2.8*u,1.6*u,1*u,'rgba(235,110,100,.35)')});
 g.strokeStyle='rgba(90,40,24,.9)';g.lineWidth=1*u;g.beginPath();if(cel){g.moveTo(ex-2*u,ey+3.4*u);g.quadraticCurveTo(ex,ey+6.4*u,ex+2*u,ey+3.4*u);g.closePath();g.fillStyle='#7a2a22';g.fill();g.stroke()}else{g.arc(ex,ey+2.6*u,1.8*u,PI*.2,PI*.8);g.stroke()}
 if(look.beard){var bd=mv||cel?0:Math.sin(t*1.5+(x||0))*u;g.beginPath();g.moveTo(-hr*.8,hy0+2*u);g.quadraticCurveTo(-hr*.6+bd,hy0+hr+4*u,bd,hy0+hr+5*u);g.quadraticCurveTo(hr*.6+bd,hy0+hr+4*u,hr*.8,hy0+2*u);g.quadraticCurveTo(ex,hy0+5.8*u,-hr*.8,hy0+2*u);oFill(g,look.hair,lw*.8);g.strokeStyle='rgba(90,40,24,.9)';g.lineWidth=1*u;g.beginPath();g.arc(ex,ey+3*u,1.4*u,PI*.2,PI*.8);g.stroke()}
 var top=hy0-hr,idle=!mv&&!cel;
 if(look.hat==='helm'){g.beginPath();g.arc(0,hy0-1*u,hr+1.2*u,PI,0);g.lineTo(hr+1.2*u,hy0-.2*u);g.lineTo(-hr-1.2*u,hy0-.2*u);g.closePath();var mg=g.createLinearGradient(-hr,0,hr,0);mg.addColorStop(0,'#c9d0d8');mg.addColorStop(1,'#6a727c');oFill(g,mg,lw);g.fillStyle=trim;g.fillRect(-hr-1.2*u,hy0-1.8*u,2*(hr+1.2*u),1.6*u);var pl=idle?Math.sin(t*2.4+(x||0))*u:0;g.beginPath();g.ellipse(0,top-3*u+pl,1.8*u,3.4*u,0,0,PI*2);oFill(g,'#d2483a',lw*.7)}
 if(look.hat==='cap'){var cp=idle?Math.sin(t*1.4+(x||0))*.04:0;g.save();g.translate(0,top+3*u);g.rotate(cp);g.beginPath();g.ellipse(0,0,hr+.6*u,4.6*u,0,PI,0);g.closePath();oFill(g,robe,lw);g.beginPath();g.ellipse(f*5*u,.2*u,5*u,1.4*u,0,0,PI*2);oFill(g,robeD,lw*.7);ell(g,0,-4.3*u,1.4*u,1.4*u,trim);g.restore()}
 if(look.hat==='scholar'){var shb=idle?Math.sin(t*1.4+(x||0))*.05:0;g.save();g.translate(0,top+1*u);g.rotate(shb);g.beginPath();g.moveTo(-hr-2*u,0);g.lineTo(0,-3.6*u);g.lineTo(hr+2*u,0);g.lineTo(0,3*u);g.closePath();oFill(g,'#2a2230',lw);g.fillStyle='#2a2230';g.fillRect(-5*u,.5*u,10*u,3*u);g.strokeStyle=trim;g.lineWidth=1*u;g.beginPath();g.moveTo(0,-.4*u);g.quadraticCurveTo(f*6*u,0,f*7*u,5*u);g.stroke();ell(g,f*7*u,5.6*u,1.2*u,1.4*u,trim);g.restore()}
 if(look.hat==='crown'){var cr=idle?Math.sin(t*1.6+(x||0))*.05:0;g.save();g.translate(0,top);g.rotate(cr);g.beginPath();g.moveTo(-6*u,2.5*u);g.lineTo(-6.5*u,-4*u);g.lineTo(-3*u,-1*u);g.lineTo(0,-5.5*u);g.lineTo(3*u,-1*u);g.lineTo(6.5*u,-4*u);g.lineTo(6*u,2.5*u);g.closePath();oFill(g,'#f2c84b',lw);ell(g,0,.4*u,1.2*u,1.2*u,'#d2483a');ell(g,-4*u,.8*u,.9*u,.9*u,'#4f8fd0');ell(g,4*u,.8*u,.9*u,.9*u,'#4f8fd0');g.restore()}
 if(look.staff&&!cel){var sx=hx2+f*.6*u;limb(g,sx,hy2+11*u,sx,hy2-24*u,2*u,'#8a5a2a',lw*.8);var gl=mv?.7:(.55+.25*Math.sin(t*3));var og=g.createRadialGradient(sx,hy2-26.5*u,0,sx,hy2-26.5*u,7*u);og.addColorStop(0,'rgba(255,240,180,'+gl+')');og.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=og;g.fillRect(sx-7*u,hy2-33.5*u,14*u,14*u);g.beginPath();g.arc(sx,hy2-26.5*u,3.3*u,0,PI*2);oFill(g,'#ffe9a8',lw*.8);ell(g,sx-1*u,hy2-27.5*u,1.1*u,1.1*u,'#ffffff')}
 if(cel){for(var i=0;i<5;i++){var a=t*2+i*1.256,r=16*u+Math.sin(t*5+i)*2*u,spx=Math.cos(a)*r,spy=hy0-7*u+Math.sin(a)*r*.6,ss=(1.2+Math.sin(t*8+i))*u;g.fillStyle=['#ffe27a','#ff9fb5','#9fd8ff','#b8f28a','#ffffff'][i];g.beginPath();g.moveTo(spx,spy-ss*2);g.lineTo(spx+ss*.6,spy);g.lineTo(spx,spy+ss*2);g.lineTo(spx-ss*.6,spy);g.closePath();g.fill()}}
 g.restore()}


/* ---------- Phase 2 props (full effects only): flowers, bushes, stones, stumps, ferns, mushrooms, cacti, pebbles, ice, lilies, cattails ---------- */
var FLW=['#f3e2b0','#e9a3b8','#c9d6ff','#f6c25a','#ffffff','#e07a5f'];
function props(decos,t,x,y,c,r,seed){var p=hash(c,r,seed+31),q=hash(c,r,seed+57),k=null;
 if(t==='grass'||t==='crown')k=p<.11?'flowers':p<.17?'bush':p<.21?'stone':p<.23?'stump':null;
 else if(t==='forest')k=p<.22?'fern':p<.3?'mushroom':null;
 else if(t==='pine')k=p<.18?'stone':null;
 else if(t==='hills')k=p<.25?'stone':p<.38?'flowers':null;
 else if(t==='sand')k=p<.12?'cactus':p<.22?'pebbles':null;
 else if(t==='snow')k=p<.16?'ice':null;
 else if(t==='marsh')k=p<.35?'lily':p<.55?'cattail':null;
 else if(t==='water')k=p<.035?'wrock':null;
 if(k)decos.push([y+S*.05,k,x+(q-.5)*S*.7,y+(hash(c,r,seed+77)-.5)*S*.5,p,q])}
function bush(g,x,y,s,col){ell(g,x+s*.1,y+s*.05,s*.55,s*.18,'rgba(0,0,0,.2)');ell(g,x-s*.22,y-s*.18,s*.3,s*.26,mix(col,'#000',.25));ell(g,x+s*.2,y-s*.16,s*.32,s*.27,mix(col,'#000',.12));ell(g,x,y-s*.3,s*.34,s*.3,col);ell(g,x-s*.08,y-s*.4,s*.16,s*.12,mix(col,'#fff',.25))}
function stone(g,x,y,s,snow){ell(g,x+s*.08,y+s*.04,s*.42,s*.13,'rgba(0,0,0,.24)');g.fillStyle='#8d877c';g.beginPath();g.moveTo(x-s*.38,y);g.quadraticCurveTo(x-s*.34,y-s*.34,x-s*.02,y-s*.38);g.quadraticCurveTo(x+s*.36,y-s*.32,x+s*.38,y);g.closePath();g.fill();g.fillStyle='#b4ada0';g.beginPath();g.moveTo(x-s*.3,y-s*.06);g.quadraticCurveTo(x-s*.26,y-s*.3,x-s*.02,y-s*.33);g.quadraticCurveTo(x+s*.04,y-s*.16,x-s*.3,y-s*.06);g.fill();if(snow){g.fillStyle='rgba(250,252,255,.9)';g.beginPath();g.ellipse(x,y-s*.33,s*.26,s*.08,0,0,PI*2);g.fill()}}
/* small props scale with the tile (k = S/34) */
var PROPK={
 flowers:function(g,x,y,h1,h2){var n=5+Math.floor(h2*4);for(var i=0;i<n;i++){var a=hash(x|0,i,11),b=hash(y|0,i,12),fx=x+(a-.5)*S*.6,fy=y+(b-.5)*S*.32;g.strokeStyle='rgba(60,100,40,.6)';var k=S/34;g.lineWidth=k;g.beginPath();g.moveTo(fx,fy+3*k);g.lineTo(fx,fy);g.stroke();ell(g,fx,fy,2.5*k,2.5*k,FLW[Math.floor(hash(x|0,y|0,i)*FLW.length)]);ell(g,fx-.5*k,fy-.5*k,.9*k,.9*k,'rgba(255,255,255,.7)')}},
 bush:function(g,x,y,h1,h2){bush(g,x,y,S*(.42+h2*.16),h1<.15?'#5f8f4a':'#4f7f45')},
 fern:function(g,x,y,h1,h2){g.strokeStyle='#3f7a45';g.lineWidth=1.4;g.lineCap='round';for(var i=0;i<5;i++){var a=-PI/2+(i-2)*.42;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*S*.18,y+Math.sin(a)*S*.28,x+Math.cos(a)*S*.3,y+Math.sin(a)*S*.22);g.stroke()}},
 mushroom:function(g,x,y){var k=S/34;for(var i=0;i<2;i++){var mx=x+i*5*k,my=y+i*2*k;g.fillStyle='#efe3c8';g.fillRect(mx-k,my-4*k,2*k,4*k);ell(g,mx,my-4*k,3.6*k,2.4*k,i?'#c0392b':'#b5532f');ell(g,mx-k,my-5*k,.8*k,.6*k,'#fff')}},
 stone:function(g,x,y,h1,h2){stone(g,x,y,S*(.38+h2*.2),false)},
 ice:function(g,x,y,h1,h2){stone(g,x,y,S*(.32+h2*.15),true)},
 wrock:function(g,x,y,h1,h2){ell(g,x,y,S*.2,S*.07,'rgba(235,248,255,.28)');stone(g,x,y,S*.26,false)},
 stump:function(g,x,y){ell(g,x+2,y+1,S*.2,S*.07,'rgba(0,0,0,.22)');g.fillStyle='#6a4a2a';g.fillRect(x-S*.12,y-S*.14,S*.24,S*.14);ell(g,x,y-S*.14,S*.12,S*.05,'#c8a070');ell(g,x,y-S*.14,S*.05,S*.02,'#8a6538')},
 cactus:function(g,x,y,h1,h2){var hgt=S*(.5+h2*.25);ell(g,x+3,y+1,S*.18,S*.06,'rgba(0,0,0,.22)');g.strokeStyle='#4f7f3a';g.lineCap='round';g.lineWidth=S*.13;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-hgt);g.moveTo(x,y-hgt*.5);g.lineTo(x-S*.14,y-hgt*.5);g.lineTo(x-S*.14,y-hgt*.78);g.moveTo(x,y-hgt*.62);g.lineTo(x+S*.13,y-hgt*.62);g.lineTo(x+S*.13,y-hgt*.88);g.stroke();g.strokeStyle='rgba(200,230,150,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x-1.5,y-2);g.lineTo(x-1.5,y-hgt+2);g.stroke()},
 pebbles:function(g,x,y){for(var i=0;i<4;i++){var a=hash(x|0,i,21),b=hash(y|0,i,22);ell(g,x+(a-.5)*S*.5,y+(b-.5)*S*.2,(2.4+a*1.6)*S/34,(1.6+b)*S/34,i%2?'#a89a80':'#c9b896')}},
 lily:function(g,x,y,h1,h2){var k=S/34;for(var i=0;i<3;i++){var a=hash(x|0,i,31),b=hash(y|0,i,32),lx=x+(a-.5)*S*.5,ly=y+(b-.5)*S*.25;g.fillStyle='#4f8a55';g.beginPath();g.ellipse(lx,ly,4.4*k,2.6*k,0,.3,PI*2-.1);g.lineTo(lx,ly);g.fill();if(i===0&&h2<.5)ell(g,lx+k,ly-k,1.8*k,1.4*k,'#f2c6d6')}},
 cattail:function(g,x,y){var k=S/34;g.strokeStyle='#5a7a3e';g.lineWidth=1.3*k;for(var i=0;i<3;i++){var cx=x+(i-1)*3.4*k;g.beginPath();g.moveTo(cx,y+2*k);g.lineTo(cx+(i-1)*k,y-S*.42);g.stroke();g.fillStyle='#6a4426';g.fillRect(cx+(i-1)*k-1.4*k,y-S*.4,2.8*k,6*k)}}
};
/* ---------- Phase 2 distinct towns per biome and a landmark in each town (full effects only) ---------- */
/* shaded wall (light from the left), shared by the Citadel, towers and the Phase 3 town buildings; (x0,y)=bottom-left */
function wallG(g,x0,y,w,h,col){var gr=g.createLinearGradient(x0,0,x0+w,0);gr.addColorStop(0,mix(col,'#fff',.2));gr.addColorStop(1,mix(col,'#000',.25));g.fillStyle=gr;g.fillRect(x0,y-h,w,h)}
function shade(g,x0,y,w,h){var gr=g.createLinearGradient(x0,0,x0+w,0);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fillRect(x0,y-h,w,h)}
function roofHouse(g,x,y,w,h,wallc,roofc,u){ell(g,x+2*u,y,w*.62,2.4*u,'rgba(0,0,0,.22)');g.fillStyle='#7a6a5a';g.fillRect(x+w*.18,y-h-h*.75,2.6*u,h*.5);wallG(g,x-w/2,y,w,h,wallc);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-w/2,y-h,w,1.4*u);tri(g,x-w/2-2*u,y-h,x,y-h-h*.9,x+w/2+2*u,y-h,roofc);tri(g,x,y-h-h*.9,x+w/2+2*u,y-h,x+1,y-h,'rgba(0,0,0,.25)');g.strokeStyle='rgba(255,240,200,.35)';g.lineWidth=.9*u;g.beginPath();g.moveTo(x-w/2-2*u,y-h);g.lineTo(x,y-h-h*.9);g.stroke();g.fillStyle='#2a1d0a';g.fillRect(x-1.6*u,y-h*.5,3.2*u,h*.5);g.fillStyle='#ffd77a';g.fillRect(x-w*.36,y-h*.72,2.8*u,2.6*u);g.fillRect(x+w*.36-2.8*u,y-h*.72,2.8*u,2.6*u)}
/* The pole is painted with the building. The cloth is recorded and drawn live, so it is not stuck at the building picture's 15 frames a second. Quiet mode holds the cloth still.
   Sails, jets, smoke, a window and a glint are recorded the same way. The still picture is painted once. */
var flagRec=null,partRec=null;
function flag(g,x,y,len,ac,t,u){g.fillStyle='#6a4a22';g.fillRect(x-.8*u,y-len,1.6*u,len);if(flagRec){flagRec.push({x:x,y:y,len:len,ac:ac,u:u});return}var w=Math.sin(t*4)*1.6*u;tri(g,x+.8*u,y-len,x+11*u+w,y-len+4*u,x+.8*u,y-len+8*u,ac)}
function waveFlags(g,x,y,flags,o){if(!flags||!flags.length)return;o=o||{};var quiet=FX.low||(FX.rm&&FX.rm.matches),t=quiet?0:(o.t||0),seed=quiet?0:x*.017+y*.013;g.save();g.translate(x,y+S*.5);for(var i=0;i<flags.length;i++){var f=flags[i],w=Math.sin(t*4+seed)*1.6*f.u;tri(g,f.x+.8*f.u,f.y-f.len,f.x+11*f.u+w,f.y-f.len+4*f.u,f.x+.8*f.u,f.y-f.len+8*f.u,f.ac)}g.restore()}
function notePart(p){if(partRec){partRec.push(p);return true}return false}
function millSails(g,u,ang){g.save();g.translate(0,-30*u);g.rotate(ang);g.fillStyle='#f3e8cc';g.strokeStyle='#6a4a22';g.lineWidth=1*u;for(var k=0;k<4;k++){g.rotate(PI/2);g.fillRect(-1.2*u,0,2.4*u,15*u);g.strokeRect(-1.2*u,0,2.4*u,15*u);g.fillRect(1.2*u,3*u,4*u,11*u)}g.restore();ell(g,0,-30*u,1.8*u,1.8*u,'#6a4a22')}
function smokePuffs(g,u,t){for(var sm=0;sm<3;sm++){var ph=(t*.35+sm/3)%1;ell(g,8*u+Math.sin(ph*6+sm)*3*u,-27*u-ph*16*u,(2+ph*4)*u,(1.6+ph*3)*u,'rgba(220,226,232,'+(.45*(1-ph))+')')}}
function palmFronds(g,u,t){for(var f=0;f<5;f++){var a=-PI+f*PI/4+Math.sin(t*1.5)*.05;g.strokeStyle='#4f8a45';g.lineWidth=2.4*u;g.beginPath();g.moveTo(21*u,-24*u);g.quadraticCurveTo(21*u+Math.cos(a)*6*u,-24*u+Math.sin(a)*6*u-3*u,21*u+Math.cos(a)*11*u,-24*u+Math.sin(a)*8*u+2*u);g.stroke()}}
function hallWindow(g,u,t){var lt=.75+.25*Math.sin(t*2.5);g.fillStyle='rgba(243,215,138,'+lt+')';g.fillRect(-1.6*u,-38*u,3.2*u,5*u)}
function towerGlow(g,u,t){var sp=.8+.2*Math.sin(t*3);g.fillStyle='rgba(243,215,138,'+sp+')';g.fillRect(-3*u,-46*u,6*u,9*u);g.fillRect(-3*u,-26*u,6*u,9*u)}
function fountainJets(g,u,t){g.strokeStyle='rgba(200,235,250,.8)';g.lineWidth=1.6*u;for(var s2=-1;s2<=1;s2+=2){g.beginPath();g.moveTo(0,-16*u);g.quadraticCurveTo(s2*7*u,-24*u+Math.sin(t*5)*u,s2*10*u,-6*u);g.stroke()}}
function cacheOrb(g,u,t){var b=1+.12*Math.sin(t*3);ell(g,0,-16*u*b,3*u,3*u,'rgba(243,226,176,.8)')}
function desertGlint(g,u,t){var gl=.4+.3*Math.sin(t*2);ell(g,0,-40*u,4*u,4*u,'rgba(243,226,176,'+gl+')')}
function iceSpark(g,u,t){var sp=.5+.5*Math.sin(t*3);ell(g,0,-32*u,2.2*u*sp+1,2.2*u*sp+1,'rgba(255,255,255,.8)')}
function marshLamp(g,u,t){var fl=.6+.4*Math.sin(t*6);ell(g,7*u,-17*u,5*u,5*u,'rgba(255,210,120,'+(.25*fl)+')');ell(g,7*u,-17*u,1.6*u,2*u,'rgba(255,220,140,'+fl+')')}
function paintCloth(g,p,phase){var w=Math.sin(phase)*p.wave;tri(g,p.x,p.y,p.x+p.dx+w,p.y+p.dy,p.x,p.y+p.h,p.ac)}
function drawParts(g,x,y,parts,o){if(!parts||!parts.length)return;o=o||{};var quiet=FX.low||(FX.rm&&FX.rm.matches),t=quiet?0:(o.t||0),seed=quiet?0:x*.017+y*.013;g.save();g.translate(x,y+S*.5);for(var i=0;i<parts.length;i++){var p=parts[i];g.save();if(p.sc)g.scale(p.sc,p.sc);if(p.k==='mill')millSails(g,p.u,t*.8+seed);else if(p.k==='smoke')smokePuffs(g,p.u,t+seed);else if(p.k==='palm')palmFronds(g,p.u,t+seed);else if(p.k==='hwin')hallWindow(g,p.u,t+seed);else if(p.k==='tower')towerGlow(g,p.u,t+seed);else if(p.k==='jets')fountainJets(g,p.u,t+seed);else if(p.k==='orb')cacheOrb(g,p.u,t+seed);else if(p.k==='dglint')desertGlint(g,p.u,t+seed);else if(p.k==='ispark')iceSpark(g,p.u,t+seed);else if(p.k==='mlamp')marshLamp(g,p.u,t+seed);else if(p.k==='cloth')paintCloth(g,p,t*(p.spd||4)+seed);g.restore()}g.restore()}
function townVariant(g,b,u,ac,t,roofC){var rf=roofC||ac;
 if(b==='meadow'){roofHouse(g,-15*u,-2*u,16*u,11*u,'#e6d6b2',mix(rf,'#3a2414',.35),u);roofHouse(g,13*u,4*u,15*u,10*u,'#eadfc4',rf,u);
  g.fillStyle='#d9cdb0';g.beginPath();g.moveTo(-5*u,0);g.lineTo(-3*u,-30*u);g.lineTo(3*u,-30*u);g.lineTo(5*u,0);g.fill();tri(g,-5*u,-30*u,0,-37*u,5*u,-30*u,mix(rf,'#000',.25));
  if(!notePart({k:'mill',u:u}))millSails(g,u,t*.8)}
 else if(b==='forest'){bush(g,-20*u,6*u,16*u,'#3c6838');g.fillStyle='#7a5530';g.fillRect(-14*u,-14*u,28*u,14*u);for(var j=0;j<4;j++){g.fillStyle=j%2?'#6a4626':'#8a6036';g.fillRect(-14*u,-14*u+j*3.5*u,28*u,3.5*u)}shade(g,-14*u,0,28*u,14*u);
  tri(g,-18*u,-14*u,0,-30*u,18*u,-14*u,rf);tri(g,0,-30*u,18*u,-14*u,1,-14*u,'rgba(0,0,0,.25)');g.fillStyle='#f3d78a';g.fillRect(-9*u,-9*u,4*u,4*u);g.fillStyle='#2a1d0a';g.fillRect(3*u,-8*u,4*u,8*u);tree(g,19*u,4*u,30*u,'pine');flag(g,-14*u,-14*u,16*u,ac,t,u)}
 else if(b==='hills'){g.fillStyle='#9a8f74';g.beginPath();g.ellipse(0,0,26*u,9*u,0,PI,0);g.fill();wallG(g,-16*u,-4*u,32*u,16*u,'#bdb39a');g.fillStyle='#bdb39a';for(var m=0;m<5;m++)g.fillRect(-16*u+m*7*u,-24*u,4*u,4*u);
  wallG(g,-5*u,-6*u,10*u,30*u,'#cfc6ac');tri(g,-7*u,-36*u,0,-46*u,7*u,-36*u,rf);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-3*u,-4*u);g.lineTo(-3*u,-11*u);g.quadraticCurveTo(0,-14*u,3*u,-11*u);g.lineTo(3*u,-4*u);g.fill();g.fillStyle='#f3d78a';g.fillRect(-1.2*u,-30*u,2.4*u,4*u);flag(g,0,-46*u,10*u,ac,t,u)}
 else if(b==='desert'){wallG(g,-20*u,0,22*u,12*u,'#d9b98a');g.fillStyle='#d9b98a';g.beginPath();g.ellipse(-9*u,-12*u,10*u,9*u,0,PI,0);g.fill();g.fillStyle='rgba(120,70,30,.25)';g.fillRect(-4*u,-12*u,6*u,12*u);
  wallG(g,4*u,0,16*u,9*u,'#e6c99a');g.fillStyle=rf;g.fillRect(4*u,-10*u,16*u,2*u);ell(g,-9*u,-21*u,2*u,2*u,rf);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-12*u,0);g.lineTo(-12*u,-6*u);g.quadraticCurveTo(-9*u,-9*u,-6*u,-6*u);g.lineTo(-6*u,0);g.fill();g.fillRect(9*u,-6*u,3*u,3*u);g.fillRect(15*u,-6*u,3*u,3*u);
  g.strokeStyle='#7a5a32';g.lineWidth=2*u;g.beginPath();g.moveTo(22*u,2*u);g.quadraticCurveTo(24*u,-12*u,21*u,-24*u);g.stroke();if(!notePart({k:'palm',u:u}))palmFronds(g,u,t)}
 else if(b==='tundra'){wallG(g,-22*u,0,34*u,10*u,'#8a6a4a');g.fillStyle='#f4f7f9';g.beginPath();g.moveTo(-25*u,-10*u);g.quadraticCurveTo(-5*u,-28*u,15*u,-10*u);g.fill();g.strokeStyle=rf;g.lineWidth=1.4*u;g.beginPath();g.moveTo(-25*u,-10*u);g.quadraticCurveTo(-5*u,-28*u,15*u,-10*u);g.stroke();g.fillStyle='#c6d2da';g.beginPath();g.moveTo(-5*u,-19*u);g.quadraticCurveTo(6*u,-17*u,15*u,-10*u);g.lineTo(-5*u,-10*u);g.fill();
  g.fillStyle='#f3d78a';g.fillRect(-15*u,-7*u,4*u,3*u);g.fillStyle='#2a1d0a';g.fillRect(-2*u,-7*u,4*u,7*u);g.fillStyle='#6a625a';g.fillRect(6*u,-24*u,4*u,8*u);if(!notePart({k:'smoke',u:u}))smokePuffs(g,u,t);tree(g,18*u,4*u,24*u,'pine',true);flag(g,-22*u,-10*u,14*u,ac,t,u)}
 else if(b==='marsh'){ell(g,0,2*u,26*u,6*u,'rgba(60,110,130,.55)');[[-12,-3,14],[10,0,13]].forEach(function(h){var hx2=h[0]*u,hy2=h[1]*u,w=h[2]*u;g.strokeStyle='#5a4028';g.lineWidth=1.6*u;g.beginPath();g.moveTo(hx2-w*.35,hy2+4*u);g.lineTo(hx2-w*.35,hy2-6*u);g.moveTo(hx2+w*.35,hy2+4*u);g.lineTo(hx2+w*.35,hy2-6*u);g.stroke();
  g.fillStyle='#9a7a52';g.fillRect(hx2-w/2,hy2-14*u,w,8*u);g.fillStyle=rf;g.beginPath();g.moveTo(hx2-w/2-3*u,hy2-14*u);g.lineTo(hx2,hy2-24*u);g.lineTo(hx2+w/2+3*u,hy2-14*u);g.fill();g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.moveTo(hx2,hy2-24*u);g.lineTo(hx2+w/2+3*u,hy2-14*u);g.lineTo(hx2,hy2-14*u);g.fill();g.fillStyle='#2a1d0a';g.fillRect(hx2-1.5*u,hy2-11*u,3*u,5*u)});
  g.strokeStyle='#7a5a32';g.lineWidth=1.2*u;g.beginPath();g.moveTo(-5*u,-8*u);g.lineTo(3*u,-6*u);g.stroke();flag(g,10*u,-24*u,9*u,ac,t,u)}
 else if(b==='highland'){g.fillStyle='#8a929c';g.beginPath();g.moveTo(-24*u,0);g.lineTo(-14*u,-10*u);g.lineTo(14*u,-10*u);g.lineTo(24*u,0);g.fill();g.fillStyle='#c4baa0';g.fillRect(-18*u,-20*u,36*u,12*u);for(var cc=0;cc<6;cc++)g.fillRect(-18*u+cc*6.6*u,-23*u,3.6*u,3*u);
  g.fillStyle='#d6ccb0';g.fillRect(-6*u,-44*u,12*u,26*u);g.fillStyle=rf;g.fillRect(-6*u,-46*u,12*u,2.2*u);g.fillStyle='#bfb598';for(var c2=0;c2<3;c2++)g.fillRect(-6*u+c2*4.5*u,-47*u,3*u,3*u);if(!notePart({k:'hwin',u:u}))hallWindow(g,u,t);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-3*u,-8*u);g.lineTo(-3*u,-14*u);g.quadraticCurveTo(0,-17*u,3*u,-14*u);g.lineTo(3*u,-8*u);g.fill();flag(g,0,-47*u,14*u,ac,t,u)}
 else return false;return true}
function landmark(g,b,u,ac,t){g.save();
 if(b==='meadow'||b==='crown'){ell(g,0,0,14*u,6*u,'rgba(0,0,0,.25)');g.fillStyle='#8a8a90';g.beginPath();g.ellipse(0,-2*u,10*u,5*u,0,0,PI*2);g.fill();ell(g,0,-3*u,7.5*u,3.4*u,'#2f6a88');g.fillStyle='#6a4a22';g.fillRect(-9*u,-20*u,2*u,18*u);g.fillRect(7*u,-20*u,2*u,18*u);tri(g,-12*u,-19*u,0,-27*u,12*u,-19*u,ac);g.strokeStyle='#3a2a1a';g.lineWidth=.8*u;g.beginPath();g.moveTo(0,-19*u);g.lineTo(0,-8*u);g.stroke();g.fillStyle='#7a5a32';g.fillRect(-2*u,-9*u,4*u,3*u)}
 else if(b==='forest'){ell(g,0,0,10*u,4*u,'rgba(0,0,0,.25)');g.fillStyle='#7a5530';g.fillRect(-3.5*u,-30*u,7*u,30*u);[['#b5532f',-26],['#d7b56a',-18],['#3f5f8f',-10]].forEach(function(r){g.fillStyle=r[0];g.fillRect(-4.5*u,r[1]*u,9*u,4*u)});ell(g,-2*u,-22*u,1.2*u,1.2*u,'#1a1208');ell(g,2*u,-22*u,1.2*u,1.2*u,'#1a1208');tri(g,-9*u,-30*u,0,-36*u,9*u,-30*u,ac)}
 else if(b==='hills'){[-8,0,8].forEach(function(dx,i){var hh=(i===1?26:18)*u;ell(g,dx*u,0,4*u,1.6*u,'rgba(0,0,0,.25)');g.fillStyle=i===1?'#a9a294':'#8d877c';g.fillRect(dx*u-3*u,-hh,6*u,hh);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(dx*u-3*u,-hh,2*u,hh)});g.fillStyle='#8d877c';g.fillRect(-11*u,-30*u,22*u,4*u)}
 else if(b==='desert'){ell(g,0,0,12*u,4*u,'rgba(0,0,0,.25)');g.fillStyle='#d9b98a';g.beginPath();g.moveTo(-4*u,0);g.lineTo(-2*u,-34*u);g.lineTo(2*u,-34*u);g.lineTo(4*u,0);g.fill();tri(g,-2*u,-34*u,0,-40*u,2*u,-34*u,'#f3e2b0');g.fillStyle='rgba(120,70,30,.28)';g.beginPath();g.moveTo(0,0);g.lineTo(0,-34*u);g.lineTo(2*u,-34*u);g.lineTo(4*u,0);g.fill();if(!notePart({k:'dglint',u:u}))desertGlint(g,u,t)}
 else if(b==='tundra'){ell(g,0,0,12*u,4*u,'rgba(0,0,0,.25)');[[-6,24],[0,32],[6,22]].forEach(function(c){g.fillStyle='rgba(190,225,240,.9)';g.beginPath();g.moveTo(c[0]*u-3*u,0);g.lineTo(c[0]*u,-c[1]*u);g.lineTo(c[0]*u+3*u,0);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(c[0]*u-1.5*u,0);g.lineTo(c[0]*u,-c[1]*u);g.lineTo(c[0]*u,0);g.fill()});if(!notePart({k:'ispark',u:u}))iceSpark(g,u,t)}
 else if(b==='marsh'){ell(g,0,0,12*u,4*u,'rgba(60,110,130,.5)');g.fillStyle='#5a4028';g.fillRect(-1*u,-26*u,2*u,26*u);g.fillRect(-1*u,-26*u,9*u,1.6*u);g.strokeStyle='#3a2a1a';g.lineWidth=.8*u;g.beginPath();g.moveTo(7*u,-24.5*u);g.lineTo(7*u,-20*u);g.stroke();g.fillStyle='#3a3a40';g.fillRect(4.5*u,-20*u,5*u,6*u);if(!notePart({k:'mlamp',u:u}))marshLamp(g,u,t)}
 else if(b==='highland'){ell(g,0,0,10*u,4*u,'rgba(0,0,0,.25)');for(var i=0;i<4;i++){var w=(9-i*2)*u;g.fillStyle=i%2?'#8d877c':'#a9a294';g.fillRect(-w/2,-(i+1)*6*u,w,6*u)}flag(g,0,-24*u,12*u,ac,t,u)}
 g.restore()}

var psil=null,PAINTED={castle:[-56,56,-124,14],great:[-48,48,-100,12],tower:[-24,24,-100,10],hall:[-34,34,-56,10]},LMBOX=[-26,26,-56,10],pcv=null,pol=null,ptex=null;
function brushTex(){if(ptex)return ptex;var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d');for(var i=0;i<140;i++){x.fillStyle=i%2?'rgba(255,240,210,.5)':'rgba(30,20,10,.5)';x.save();x.translate(hash(i,1,77)*64,hash(i,2,77)*64);x.rotate(hash(i,3,77)*PI);x.fillRect(-4,-.6,8,1.2);x.restore()}ptex=c;return c}
/* painted(g, x, y, box, draw): draw(c) paints in map coordinates onto an offscreen canvas at the current screen scale; the result gets the
   ink outline, light glaze and brush texture and is composited at the same place. box=[left,right,top,bottom] in tile units (u) relative to
   (x, y+S/2). Returns false (draws nothing) when it cannot help: Low effects, rotated transforms, or a sprite that would be too big. */
function painted(g,x,y,box,draw,opt){if(FX.low||!g.getTransform)return false;var m=g.getTransform();if(Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6)return false;
 var u=S/34,sc=m.a,bx=x+box[0]*u,by=y+S*.5+box[2]*u,bw=(box[1]-box[0])*u,bh=(box[3]-box[2])*u,W=Math.ceil(bw*sc)+8,H=Math.ceil(bh*sc)+8;
 if(W>2048||H>2048||W<8)return false;
 if(!pcv){pcv=document.createElement('canvas');pol=document.createElement('canvas')}
 if(pcv.width<W||pcv.height<H){pcv.width=pol.width=Math.max(W,pcv.width);pcv.height=pol.height=Math.max(H,pcv.height)}
 var c=pcv.getContext('2d'),q=pol.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W+2,H+2);q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,W+2,H+2);
 c.setTransform(sc,0,0,sc,(-bx)*sc+4,(-by)*sc+4);
 /* opt.dropShadows: skip the drawing's own translucent black ground shadows (they would be outlined and darkened) and lay one soft shadow on the map instead */
 if(opt&&opt.dropShadows){ell(g,x+1.5*S/34,y+S*.5+1*S/34,(opt.shadowW||16)*S/34,(opt.shadowW||16)*.38*S/34,'rgba(10,16,8,.26)');var f0=c.fill;c.fill=function(){var fs=c.fillStyle;if(typeof fs==='string'&&/^rgba\(0, 0, 0, 0?\.[0-3]\d*\)$/.test(fs))return;return f0.apply(c,arguments)};try{draw(c)}finally{delete c.fill}}
 else draw(c);
 c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';
 var lg=c.createLinearGradient(0,0,W,0);lg.addColorStop(0,'rgba(255,226,170,.22)');lg.addColorStop(.45,'rgba(255,226,170,0)');lg.addColorStop(.62,'rgba(30,40,90,0)');lg.addColorStop(1,'rgba(30,40,90,.26)');c.fillStyle=lg;c.fillRect(0,0,W,H);
 var tg=c.createLinearGradient(0,0,0,H);tg.addColorStop(0,'rgba(255,240,200,.12)');tg.addColorStop(.7,'rgba(0,0,0,0)');tg.addColorStop(1,'rgba(20,10,0,.18)');c.fillStyle=tg;c.fillRect(0,0,W,H);
 c.globalAlpha=.07;c.fillStyle=c.createPattern(brushTex(),'repeat');c.fillRect(0,0,W,H);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 /* silhouette with alpha cubed, so soft see-through bits (ground shadows, glows) barely count and only solid shapes get the ink line */
 if(!psil)psil=document.createElement('canvas');if(psil.width<pcv.width||psil.height<pcv.height){psil.width=pcv.width;psil.height=pcv.height}
 var sl=psil.getContext('2d');sl.setTransform(1,0,0,1,0,0);sl.globalCompositeOperation='source-over';sl.clearRect(0,0,W+2,H+2);sl.drawImage(pcv,0,0);sl.globalCompositeOperation='destination-in';sl.drawImage(pcv,0,0);sl.drawImage(pcv,0,0);sl.globalCompositeOperation='source-over';
 var d=Math.max(1,Math.round(sc*.55));[[d,0],[-d,0],[0,d],[0,-d],[d,d],[-d,d],[d,-d],[-d,-d]].forEach(function(v){q.drawImage(psil,0,0,W,H,v[0],v[1],W,H)});
 q.globalCompositeOperation='destination-out';q.drawImage(pcv,0,0);q.globalCompositeOperation='source-over';
 q.globalCompositeOperation='source-in';q.fillStyle='rgba(30,20,14,.78)';q.fillRect(0,0,W,H);q.globalCompositeOperation='source-over';
 var dx=Math.round(m.a*bx+m.e-4),dy=Math.round(m.d*by+m.f-4);g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(pol,0,0,W,H,dx,dy,W,H);g.drawImage(pcv,0,0,W,H,dx,dy,W,H);g.restore();return true}
/* buildings and props. (x,y)=hex centre. Static trees and rocks are stamped once (2x) and blitted.
   Other buildings are painted into a shared 2x sprite and blitted. Sails, jets, smoke, cloth, windows and glints are drawn on top each frame, so that picture stays still. A forge flame and a glowing chest still redraw about 15 times a second. Low effects skips the cache and draws live. A chest lid mid-swing and the town gate stay live so those motions stay smooth. */
var bslots={},bcount=0,bclock=0,BW=280,BH=320;
function animKind(kind,o){if(kind==='chest')return !!o.glow;return kind==='smithy'}
function bkey(kind,o){var acc=(kind==='fountain'||kind==='vault'||kind==='cache'||kind==='chest')?'':(o.accent||'');var bio=kind==='town'?(o.biome||''):'';var lm=kind==='tree'?(o.landmark||''):'';return kind+'|'+acc+'|'+bio+'|'+lm+'|'+(o.roof||'')+'|'+(o.motif||'')+'|'+(o.lit?1:0)+'|'+(o.open?1:0)+'|'+(o.locked?1:0)+'|'+(o.glow?1:0)}
function bslot(kind,o){if(FX.low||kind==='gate')return null;if(kind==='chest'&&typeof o.lid==='number'&&o.lid>0.04&&o.lid<0.96)return null;var ph=animKind(kind,o)?Math.floor((o.t||0)*15):0,id=bkey(kind,o),slot=bslots[id],k;if(!slot){if(bcount>=48){var old=1e15,drop=null;for(k in bslots)if(bslots[k].used<old){old=bslots[k].used;drop=k}if(drop){delete bslots[drop];bcount--}}var cv=document.createElement('canvas');cv.width=BW;cv.height=BH;slot=bslots[id]={cv:cv,g:cv.getContext('2d'),ph:-1e9,used:0};bcount++}slot.used=++bclock;if(slot.ph===ph){slot.ready=true;return slot}var sg=slot.g;sg.setTransform(1,0,0,1,0,0);sg.globalAlpha=1;sg.clearRect(0,0,BW,BH);sg.setTransform(2,0,0,2,140,280);slot.want=ph;slot.ready=false;return slot}
function propKey(kind,o){if(kind==='rock')return 'rock';if(!FX.low&&o.v!=null&&o.v<.2)return 'bush'+(o.snow?1:0);if(!FX.low&&o.v!=null&&o.v<.3)return 'stone'+(o.snow?1:0);return 'tree|'+(o.pine?1:0)+'|'+(o.snow?1:0)+'|'+(FX.low?1:0)}
function propStamp(kind,o){var id=propKey(kind,o),c=stamps[id];if(c)return c;c=document.createElement('canvas');c.width=c.height=256;var sg=c.getContext('2d');sg.setTransform(2,0,0,2,0,0);sg.translate(64,100);var u=S/34;ell(sg,4*u,1*u,29*u,8*u,'rgba(10,16,8,.22)');ell(sg,0,0,24*u,6*u,'rgba(10,16,8,.22)');if(kind==='rock')hill(sg,0,2*u,24*u,12*u,COL.rock);else if(!FX.low&&o.v!=null&&o.v<.2)bush(sg,0,0,S*.9,o.snow?'#5a7a6a':'#4f7f45');else if(!FX.low&&o.v!=null&&o.v<.3)stone(sg,0,0,S*.85,!!o.snow);else tree(sg,0,0,S*1.05,o.pine?'pine':'oak',!!o.snow);stamps[id]=c;return c}
function building(g,kind,x,y,o){o=o||{};if(kind==='rock'||(kind==='tree'&&!o.landmark)){g.drawImage(propStamp(kind,o),x-64,y+S*.5-100,128,128);return}
 var host=g,ax=x,ay=y,slot=bslot(kind,o);if(slot&&slot.ready){host.drawImage(slot.cv,ax-70,ay+S*.5-140,140,160);waveFlags(host,ax,ay,slot.flags,o);drawParts(host,ax,ay,slot.parts,o);return}if(slot){g=slot.g;x=0;y=-S*.5;flagRec=[];partRec=[]}
 var u=S/34,ac=o.accent||'#b5532f',t=o.t||0,roofC=o.roof||null;g.save();g.translate(x,y+S*.5);
 if(FX.low){ell(g,4*u,1*u,29*u,8*u,'rgba(10,16,8,.22)');ell(g,0,0,24*u,6*u,'rgba(10,16,8,.22)');}
 else{ell(g,12*u,4.4*u,34*u,7.6*u,'rgba(8,10,16,.34)');ell(g,4*u,1.6*u,20*u,5*u,'rgba(8,10,16,.18)');}
 function wall(x0,w,h,col){wallG(g,x0,0,w,h,col)}
 function roof(x0,w,h,top,col){tri(g,x0-3*u,top,x0+w/2,top-h,x0+w+3*u,top,col);tri(g,x0+w/2,top-h,x0+w+3*u,top,x0+w/2+1,top,'rgba(0,0,0,.28)')}
 if(kind==='hall'){wall(-24*u,48*u,24*u,'#d9cfb6');g.fillStyle='#c9bf9f';g.fillRect(-27*u,-3*u,54*u,3*u);g.fillRect(-26*u,-27*u,52*u,3*u);
  for(var i=0;i<5;i++){g.fillStyle=mix('#eadfc4','#000',.0+(i%2)*.1);g.fillRect(-21*u+i*10.5*u,-24*u,4*u,21*u)}
  tri(g,-28*u,-27*u,0,-47*u,28*u,-27*u,roofC||'#d7b56a');tri(g,0,-47*u,28*u,-27*u,2*u,-27*u,'rgba(60,40,0,.3)');ell(g,0,-33*u,4*u,4*u,ac);
  g.fillStyle=o.lit?'#f3d78a':'#2a1d0a';g.beginPath();g.moveTo(-5*u,-3*u);g.lineTo(-5*u,-15*u);g.quadraticCurveTo(0,-21*u,5*u,-15*u);g.lineTo(5*u,-3*u);g.fill();if(o.lit){var lg=g.createRadialGradient(0,-10*u,1,0,-10*u,22*u);lg.addColorStop(0,'rgba(243,215,138,.5)');lg.addColorStop(1,'rgba(243,215,138,0)');g.fillStyle=lg;g.fillRect(-26*u,-34*u,52*u,40*u)}if(o.motif)motifMark(g,0,-23*u,o.motif,u,ac)}
 else if(kind==='guild'){wall(-22*u,44*u,22*u,'#e2d3b0');g.fillStyle='#4a3220';g.fillRect(-22*u,-22*u,44*u,2.4*u);g.fillRect(-1*u,-22*u,2.4*u,22*u);g.fillRect(-22*u,-11*u,44*u,2*u);roof(-22*u,44*u,22*u,-22*u,roofC||ac);g.fillStyle='#2a1d0a';g.fillRect(-14*u,-13*u,7*u,13*u);ell(g,10*u,-14*u,3.6*u,4.4*u,'#f3d78a');g.fillStyle='#6a4a22';g.fillRect(24*u,-26*u,2*u,24*u);g.fillRect(18*u,-26*u,9*u,7*u);g.fillStyle='#d7b56a';g.fillRect(19*u,-25*u,7*u,5*u);if(o.motif)motifMark(g,-10*u,-16*u,o.motif,u,ac)}
 else if(kind==='smithy'){wall(-22*u,44*u,18*u,'#b9a98a');roof(-24*u,48*u,16*u,-18*u,roofC||'#5a4a3e');g.fillStyle='#6a625a';g.fillRect(10*u,-44*u,8*u,24*u);var fl=.7+.3*Math.sin(t*9);ell(g,-6*u,-8*u,9*u,7*u,'rgba(255,150,40,'+(.45*fl)+')');g.fillStyle='#2a1d0a';g.fillRect(-12*u,-14*u,12*u,14*u);ell(g,-6*u,-6*u,4*u,3*u,'rgba(255,170,60,'+fl+')');ell(g,14*u,-47*u,5*u,3*u,'rgba(200,200,200,'+(.3+.15*Math.sin(t*2))+')');g.fillStyle='#3a3a40';g.fillRect(12*u,-6*u,10*u,4*u);g.fillRect(14*u,-3*u,6*u,3*u);if(o.motif)motifMark(g,20*u,-12*u,o.motif,u,ac)}
 else if(kind==='vault'){var vg=g.createLinearGradient(-24*u,0,24*u,0);vg.addColorStop(0,'#8aa0b4');vg.addColorStop(1,'#46586a');g.fillStyle=vg;g.beginPath();g.ellipse(0,-2*u,25*u,24*u,0,PI,0);g.fill();g.fillRect(-25*u,-4*u,50*u,6*u);g.fillStyle='#c8a86a';g.fillRect(-25*u,-6*u,50*u,2*u);ell(g,0,-12*u,10*u,10*u,'#d7b56a');ell(g,0,-12*u,8*u,8*u,'#b08a38');g.strokeStyle='#6b4a0e';g.lineWidth=1.5*u;for(var k=0;k<6;k++){var a=k*PI/3+t*0;g.beginPath();g.moveTo(0,-12*u);g.lineTo(Math.cos(a)*8*u,-12*u+Math.sin(a)*8*u);g.stroke()}ell(g,0,-12*u,2.6*u,2.6*u,'#f3e2b0');if(o.motif)motifMark(g,0,-24*u,o.motif,u,ac)}
 else if(kind==='tower'){var tg=g.createLinearGradient(-12*u,0,12*u,0);tg.addColorStop(0,'#c9c2b0');tg.addColorStop(1,'#6a6a70');g.fillStyle=tg;g.beginPath();g.moveTo(-14*u,0);g.lineTo(-10*u,-58*u);g.lineTo(10*u,-58*u);g.lineTo(14*u,0);g.fill();tri(g,-14*u,-58*u,0,-84*u,14*u,-58*u,roofC||ac);tri(g,0,-84*u,14*u,-58*u,1*u,-58*u,'rgba(0,0,0,.3)');g.fillStyle='#f3e2b0';g.beginPath();for(var q=0;q<5;q++){var a2=q*2*PI/5-PI/2,a3=a2+PI/5;g.lineTo(Math.cos(a2)*5*u,-90*u+Math.sin(a2)*5*u);g.lineTo(Math.cos(a3)*2*u,-90*u+Math.sin(a3)*2*u)}g.fill();if(!notePart({k:'tower',u:u}))towerGlow(g,u,t);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-5*u,0);g.lineTo(-5*u,-9*u);g.quadraticCurveTo(0,-14*u,5*u,-9*u);g.lineTo(5*u,0);g.fill();if(o.motif)motifMark(g,0,-31*u,o.motif,u,ac)}
 else if(kind==='great'){wall(-34*u,68*u,30*u,'#cfc4a8');for(var m=0;m<7;m++){g.fillStyle='#cfc4a8';g.fillRect(-34*u+m*10*u,-36*u,6*u,6*u)}[-34,26].forEach(function(tx){wall(tx*u,8*u,50*u,'#bfb598');for(var mm=0;mm<2;mm++){g.fillStyle='#bfb598';g.fillRect(tx*u+mm*5*u,-56*u,3*u,6*u)}});wall(-12*u,24*u,52*u,'#d6ccb0');tri(g,-14*u,-52*u,0,-70*u,14*u,-52*u,roofC||ac);g.fillStyle='#d7b56a';g.fillRect(-1*u,-86*u,2*u,18*u);var gv={k:'cloth',x:1*u,y:-86*u,dx:13*u,dy:4*u,h:9*u,wave:2*u,spd:4,ac:'#c0392b'};if(!notePart(gv))paintCloth(g,gv,t*4);g.fillStyle=o.lit?'#f3d78a':'#2a1d0a';g.beginPath();g.moveTo(-7*u,0);g.lineTo(-7*u,-20*u);g.quadraticCurveTo(0,-28*u,7*u,-20*u);g.lineTo(7*u,0);g.fill();if(o.motif)motifMark(g,0,-36*u,o.motif,u,ac)}
 else if(kind==='town'&&!FX.low&&o.biome&&townVariant(g,o.biome,u,ac,t,roofC)){if(o.motif){var mp={meadow:[-15,-10],forest:[3,-11],hills:[0,-18],desert:[12,-6],tundra:[-8,-6],marsh:[-12,-12],highland:[0,-22]}[o.biome]||[0,-24];motifMark(g,mp[0]*u,mp[1]*u,o.motif,u,ac)}}
 else if(kind==='town'){var trf=roofC||ac;[[-16,-4,.9,'#e2d3b0'],[14,-2,.85,'#d9c9a4'],[0,8,1,'#eadfc4']].forEach(function(h,ii){var hxx=h[0]*u,hyy=h[1]*u,k=h[2];g.fillStyle=h[3];g.fillRect(hxx-9*u*k,hyy-12*u*k,18*u*k,12*u*k);tri(g,hxx-11*u*k,hyy-12*u*k,hxx,hyy-24*u*k,hxx+11*u*k,hyy-12*u*k,ii===2?trf:mix(trf,'#3a2414',.4));tri(g,hxx,hyy-24*u*k,hxx+11*u*k,hyy-12*u*k,hxx+1,hyy-12*u*k,'rgba(0,0,0,.28)');g.fillStyle='#2a1d0a';g.fillRect(hxx-2*u,hyy-6*u*k,4*u,6*u*k)});g.fillStyle='#6a4a22';g.fillRect(-1*u,-44*u,2*u,26*u);var tv={k:'cloth',x:1*u,y:-44*u,dx:11*u,dy:4*u,h:9*u,wave:1.5*u,spd:4,ac:ac};if(!notePart(tv))paintCloth(g,tv,t*4);if(o.motif)motifMark(g,0,-30*u,o.motif,u,ac)}
 else if(kind==='castle'){g.scale(1.25,1.25);var crf=roofC||ac;[-22,16].forEach(function(tx){wall(tx*u,10*u,34*u,'#c4baa0');tri(g,(tx-2)*u,-34*u,(tx+5)*u,-46*u,(tx+12)*u,-34*u,crf)});wall(-14*u,28*u,26*u,'#d6ccb0');for(var cc=0;cc<4;cc++){g.fillStyle='#d6ccb0';g.fillRect(-14*u+cc*8*u,-31*u,5*u,5*u)}tri(g,-8*u,-26*u,0,-58*u,8*u,-26*u,roofC||'#d7b56a');g.fillStyle='#6a4a22';g.fillRect(-.8*u,-72*u,1.6*u,16*u);var cv2={k:'cloth',x:1*u,y:-72*u,dx:11*u,dy:4*u,h:9*u,wave:2*u,spd:4,ac:'#c0392b',sc:1.25};if(!notePart(cv2))paintCloth(g,cv2,t*4);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-4*u,0);g.lineTo(-4*u,-12*u);g.quadraticCurveTo(0,-17*u,4*u,-12*u);g.lineTo(4*u,0);g.fill();if(o.motif)motifMark(g,0,-22*u,o.motif,u,ac)}
 else if(kind==='fountain'){ell(g,0,0,16*u,8*u,'#8a8a90');ell(g,0,-1*u,13*u,6*u,'#4f9ab8');g.fillStyle='#b9b9c0';g.fillRect(-2*u,-14*u,4*u,12*u);ell(g,0,-14*u,6*u,2.5*u,'#9a9aa2');if(!notePart({k:'jets',u:u}))fountainJets(g,u,t)}
 else if(kind==='tree'&&!FX.low&&o.landmark){landmark(g,o.landmark,u,ac,t)}
 else if(kind==='tree'&&!FX.low&&o.v!=null&&o.v<.3){if(o.v<.2)bush(g,0,0,S*.9,o.snow?'#5a7a6a':'#4f7f45');else stone(g,0,0,S*.85,o.snow)}
 else if(kind==='tree'){tree(g,0,0,S*1.05,o.pine?'pine':'oak',o.snow)}
 else if(kind==='rock'){hill(g,0,2*u,24*u,12*u,COL.rock)}
 else if(kind==='banner'){g.fillStyle='#6a4a22';g.fillRect(-1*u,-30*u,2*u,30*u);var bv={k:'cloth',x:1*u,y:-30*u,dx:12*u,dy:6*u,h:14*u,wave:2*u,spd:3,ac:ac};if(!notePart(bv))paintCloth(g,bv,t*3)}
 else if(kind==='gate'){var lift=Math.max(0,Math.min(1,o.lift||0));g.fillStyle='#8a7a5a';g.fillRect(-22*u,-24*u,6*u,24*u);g.fillRect(16*u,-24*u,6*u,24*u);g.fillStyle='#d7b56a';g.fillRect(-24*u,-27*u,48*u,4*u);g.save();g.beginPath();g.rect(-16*u,-24*u,32*u,24*u);g.clip();g.fillStyle='rgba(243,215,138,.28)';g.fillRect(-16*u,-24*u-lift*28*u,32*u,24*u);g.restore()}
 else if(kind==='cache'){g.fillStyle='#6a4a22';g.fillRect(-8*u,-10*u,16*u,10*u);g.fillStyle='#8a6528';g.fillRect(-8*u,-10*u,16*u,3*u);g.fillStyle='#d7b56a';g.fillRect(-1.5*u,-8*u,3*u,4*u);if(!notePart({k:'orb',u:u}))cacheOrb(g,u,t)}
 else if(kind==='chest'){var lid=typeof o.lid==='number'?Math.max(0,Math.min(1,o.lid)):(o.open?1:0);g.fillStyle='#6a4a22';g.fillRect(-12*u,-12*u,24*u,12*u);g.fillStyle='#8a6528';g.fillRect(-12*u,-12*u,24*u,3*u);g.fillStyle='#d7b56a';g.fillRect(-12*u,-6*u,24*u,2*u);if(lid>.04)ell(g,0,-13*u,9*u,3*u,'#f3e2b0');g.save();g.translate(0,-12*u);g.rotate(-lid*1.15);g.fillStyle='#7a5628';g.beginPath();g.moveTo(-12*u,0);g.quadraticCurveTo(0,-14*u,12*u,0);g.fill();if(lid<.45){g.fillStyle='#d7b56a';g.fillRect(-2*u,-2*u,4*u,5*u)}g.restore();if(o.glow&&lid<.2){var gl=.5+.5*Math.sin(t*4);var cg=g.createRadialGradient(0,-12*u,1,0,-12*u,26*u);cg.addColorStop(0,'rgba(255,230,140,'+(.45*gl)+')');cg.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=cg;g.fillRect(-28*u,-38*u,56*u,52*u)}if(lid>.16&&lid<.96){var oa=(.96-lid)/.8,og=g.createRadialGradient(0,-4*u,10*u,0,2*u,36*u);og.addColorStop(0,'rgba(255,236,170,'+(.9*oa)+')');og.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=og;g.beginPath();g.ellipse(0,2*u,30*u,11*u,0,0,PI*2);g.fill()}if(o.locked){g.fillStyle='#2a1d0a';g.fillRect(-3*u,-10*u,6*u,6*u)}}
 g.restore();if(slot){slot.ph=slot.want;slot.flags=flagRec;slot.parts=partRec;flagRec=null;partRec=null;host.drawImage(slot.cv,ax-70,ay+S*.5-140,140,160);waveFlags(host,ax,ay,slot.flags,o);drawParts(host,ax,ay,slot.parts,o)}}
/* A soft pool of light on the ground, drawn live so each lamp flickers on its own beat.
   The building picture can stay cached. Low effects draws nothing here. cheer (0 to 1) brightens a win. */
function groundLight(g,x,y,o){if(FX.low)return;o=o||{};var kind=o.kind,lm=o.landmark,warm=0,col='255,220,140',lift=S*.45,rad=S*.85;
 if(kind==='smithy'){warm=.5;col='255,160,60';lift=S*.35}
 else if(kind==='tower'){warm=.4;lift=S*1.05;rad=S*1.05}
 else if(kind==='chest'&&o.glow&&!(o.lid>.2)){warm=.48;lift=S*.32}
 else if(kind==='tree'&&lm==='marsh'){warm=.58;col='255,196,90';lift=S*.7}
 else if(kind==='tree'&&lm==='desert'){warm=.4;lift=S*1.15;rad=S*.7}
 else if(kind==='tree'&&lm==='tundra'){warm=.36;col='210,235,255';lift=S*.95}
 else if(kind==='town'&&o.biome==='highland'){warm=.34;lift=S*.85}
 var cheer=o.cheer||0;
 if(cheer>0&&(warm>0||kind==='fountain'||kind==='hall'||kind==='castle'||kind==='chest'||kind==='great'))warm=Math.max(warm,.22)+cheer*.5;
 if(warm<.04)return;
 var ph=(o.t||0)*(kind==='smithy'?8:lm==='marsh'?6:2.5)+(o.seed||0)*1.7,fl=.62+.38*Math.sin(ph),a=warm*fl;
 if(cheer>0){rad*=1+cheer*.4;a=Math.min(1,a+cheer*.15)}
 var gy=y+S*.5-lift,rg=g.createRadialGradient(x,gy,S*.06,x,y+S*.2,rad);
 rg.addColorStop(0,'rgba('+col+','+(a*.62)+')');rg.addColorStop(1,'rgba('+col+',0)');
 g.fillStyle=rg;g.beginPath();g.ellipse(x,y+S*.42,rad,rad*.36,0,0,PI*2);g.fill()}
/* Brass line marks for badges, dialogue plates and lists. Unknown text stays with the caller. */
var GLYPH={
 seed:'<path d="M12 19c2-4 5-6 8-7-3 4-5 7-8 7z"/><path d="M12 19c-2-4-5-7-8-8 3 4 5 7 8 8z"/>',
 star:'<path d="M12 3.2l2.2 4.6 5 .7-3.6 3.5.9 5L12 14.8 7.5 17l.9-5L4.8 8.5l5-.7z"/>',
 flame:'<path d="M12 3c2 3 3 4.2 3 6.2a3 3 0 0 1-6 0c0-1 .5-1.8 1-2.6.4 1.2 1.2 1.8 1.2 2.8a1 1 0 0 0 2-.2C13.2 7 12 5 12 3z"/>',
 map:'<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
 cup:'<path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M17 6h2.2a2.2 2.2 0 0 1 0 4.4H17"/><path d="M9 18h6M8 21h8M12 15v3"/>',
 cap:'<path d="M3 10l9-4 9 4-9 4z"/><path d="M7 12v3c1.6 1.4 3.2 2 5 2s3.4-.6 5-2v-3"/>',
 snake:'<path d="M5 15c2-6 5-6 7-3s2 6 5 3 3-6 2-8"/>',
 screen:'<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
 medal:'<circle cx="12" cy="14" r="4.2"/><path d="M9 4l3 6 3-6"/>',
 crown:'<path d="M4 16l2.2-8L10 12l2-7 2 7 3.8-4L20 16z"/>',
 compass:'<circle cx="12" cy="12" r="8"/><path d="M14.2 9.8l-1.6 4.4-4.4 1.6 1.6-4.4z"/>',
 tent:'<path d="M3 18L12 5l9 13z"/><path d="M12 18V10"/>',
 boot:'<path d="M8 4h5v8l4 2v3H6v-3l2-1z"/>',
 chest:'<path d="M4 10h16v8H4z"/><path d="M4 10c1-4 4-6 8-6s7 2 8 6"/><path d="M12 10v3"/>',
 scroll:'<path d="M7 5h10a2 2 0 0 1 2 2v1H8v10a2 2 0 0 1-4 0V7a2 2 0 0 1 2-2z"/><path d="M9 11h7M9 14h5"/>',
 vault:'<path d="M6 18V10a6 6 0 0 1 12 0v8"/><circle cx="12" cy="13" r="2"/>',
 scale:'<path d="M12 4v14M8 19h8"/><path d="M6 11h5l1-4 1 4h5"/>',
 anvil:'<path d="M4 11h12l2-3h2"/><path d="M7 11v4h6v-4"/>',
 tower:'<path d="M9 20l1-12 2-4 2 4 1 12"/><path d="M7 20h10"/>',
 lab:'<path d="M9 3v6L6 19h12l-3-10V3"/><path d="M9 3h6"/>',
 lens:'<circle cx="10.5" cy="10.5" r="5"/><path d="M14.5 14.5L20 20"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
 coin:'<circle cx="12" cy="12" r="7"/><path d="M12 8v8"/>',
 shield:'<path d="M12 3l7 3v6c0 4.2-3 6.8-7 8-4-1.2-7-3.8-7-8V6z"/>',
 book:'<path d="M5 5h6v14H8a3 3 0 0 0-3 3z"/><path d="M13 5h6v14h-3a3 3 0 0 1-3 3z"/>',
 ok:'<path d="M5 12.5l4.2 4.2L19 7"/>',
 borrow:'<path d="M12 4l7 12H5z"/>',
 no:'<path d="M7 7l10 10M17 7L7 17"/>',
 keep:'<path d="M4 20V9l4-3 4 3 4-3 4 3v11"/><path d="M10 20v-5h4v5"/>',
 diamond:'<path d="M12 4l7 8-7 8-7-8z"/>'
};
var GMAP={'🌱':'seed','⭐':'star','🔥':'flame','🗺️':'map','🗺':'map','🏆':'cup','🎓':'cap','🐍':'snake','💻':'screen','🏅':'medal','👑':'crown','🧭':'compass','⛺':'tent','🥾':'boot','🎁':'chest','📜':'scroll','🏦':'vault','📏':'scale','🔨':'anvil','🗼':'tower','🧪':'lab','🔭':'lens','⚙️':'gear','⚙':'gear','🧮':'coin','🛡️':'shield','🛡':'shield','📘':'book','🏛️':'keep','🏛':'keep','✅':'ok','🔶':'borrow','❌':'no'};
function LQMark(icon,z){if(!icon)return '';z=z||28;var k=GLYPH[icon]?icon:(GMAP[icon]||'');if(!k||!GLYPH[k])return '';
 return '<svg class="mk" viewBox="0 0 24 24" width="'+z+'" height="'+z+'" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+GLYPH[k]+'</svg>'}
window.LQMark=LQMark;
window.Art={npcLook:npcLook,painted:painted,S:S,SQ3:SQ3,hash:hash,vnoise:vnoise,hx:hx,hy:hy,neigh:neigh,hdist:hdist,px2hex:px2hex,hline:hline,hexPath:hexPath,paintScene:paintScene,portrait:portrait,figure:figure,building:building,groundLight:groundLight,COL:COL,ell:ell,mix:mix,CAM:CAM,project:project,unproject:unproject,groundH:groundH,podium:podium,selfTestCam:selfTestCam,stoneBase:stoneBase,camSkew:camSkew};
})();
