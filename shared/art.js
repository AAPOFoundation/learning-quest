/* Procedural painterly hex-map art (no external assets). Civ-style soft-shaded terrain, brass-trimmed UI colours. */
(function(){
'use strict';
var S=34,SQ3=Math.sqrt(3),PI=Math.PI;
/* Visual effects: 'low' keeps the original flat look. Default is low only for reduced-motion or small devices; the choice is remembered. */
var FX=window.LQFx={low:(function(){try{var v=localStorage.getItem('learning-apps.fx');if(v)return v==='low'}catch(e){}return !!((window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2))})(),
 /* live reduced-motion query: animation (water shimmer, particles, the home hero walk) stops while it matches, even after Low effects has been toggled */
 rm:window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false},
 set:function(v){FX.low=!!v;try{localStorage.setItem('learning-apps.fx',v?'low':'full')}catch(e){}}};
function hash(a,b,s){var h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(s|0,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function vnoise(x,y,s){var x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);var a=hash(x0,y0,s),b=hash(x0+1,y0,s),c=hash(x0,y0+1,s),d=hash(x0+1,y0+1,s);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}
function hx(c,r){return S*SQ3*(c+0.5*(r&1))+S*SQ3/2}
function hy(r){return S*1.5*r+S}
var DE=[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]],DO=[[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]];
function neigh(c,r,d){var v=(r&1?DO:DE)[d];return [c+v[0],r+v[1]]}
function cube(c,r){var x=c-(r-(r&1))/2;return [x,-x-r,r]}
function hdist(a,b,c,d){var p=cube(a,b),q=cube(c,d);return Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]),Math.abs(p[2]-q[2]))}
function px2hex(px,py){var x=px-S*SQ3/2,y=py-S,q=(SQ3/3*x-y/3)/S,rr=2/3*y/S,xx=q,zz=rr,yy=-xx-zz,rx=Math.round(xx),ry=Math.round(yy),rz=Math.round(zz),dx=Math.abs(rx-xx),dy=Math.abs(ry-yy),dz=Math.abs(rz-zz);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return [rx+(rz-(rz&1))/2,rz]}
function hline(a,b,c,d){var p=cube(a,b),q=cube(c,d),n=Math.max(1,hdist(a,b,c,d)),out=[];for(var i=0;i<=n;i++){var t=i/n,x=p[0]+(q[0]-p[0])*t+1e-6,y=p[1]+(q[1]-p[1])*t+2e-6,z=p[2]+(q[2]-p[2])*t-3e-6,rx=Math.round(x),ry=Math.round(y),rz=Math.round(z),dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;out.push([rx+(rz-(rz&1))/2,rz])}return out}
function hexPath(g,x,y,s){g.beginPath();for(var k=0;k<6;k++){var a=(60*k-30)*PI/180,px=x+s*Math.cos(a),py=y+s*Math.sin(a);k?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
var EDGE=[[0,1],[3,4],[5,0],[4,5],[1,2],[2,3]];
function corner(x,y,k){var a=(60*k-30)*PI/180;return [x+S*Math.cos(a),y+S*Math.sin(a)]}
var COL={grass:[112,150,78],forest:[82,124,68],hills:[154,150,94],mountain:[124,118,108],sand:[216,188,128],snow:[228,235,238],marsh:[94,128,106],water:[46,96,128],plaza:[190,174,142],road:[168,132,84],crown:[126,162,86],rock:[110,104,98]};
function rgb(c,f,a){return 'rgba('+Math.min(255,Math.round(c[0]*f))+','+Math.min(255,Math.round(c[1]*f))+','+Math.min(255,Math.round(c[2]*f))+','+(a==null?1:a)+')'}
function hex2(c){var h=c.replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function mix(a,b,t){var p=hex2(a),q=hex2(b);return 'rgb('+Math.round(p[0]+(q[0]-p[0])*t)+','+Math.round(p[1]+(q[1]-p[1])*t)+','+Math.round(p[2]+(q[2]-p[2])*t)+')'}
function ell(g,x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,PI*2);g.fill()}
function tri(g,a,b,c,d,e,f,fill){g.fillStyle=fill;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.closePath();g.fill()}
function tree(g,x,y,s,kind,snow){ell(g,x+s*.12,y,s*.5,s*.17,'rgba(0,0,0,.22)');g.fillStyle='#5b4128';g.fillRect(x-s*.06,y-s*.34,s*.12,s*.34);
 if(kind==='pine'){for(var i=0;i<3;i++){var w=s*(.56-.12*i),yy=y-s*(.28+.3*i);tri(g,x,yy-s*.42,x-w,yy,x,yy,snow?'#e9eef0':'#4f8a55');tri(g,x,yy-s*.42,x,yy,x+w,yy,snow?'#b9c6cf':'#356b43')}}
 else{ell(g,x,y-s*.66,s*.44,s*.4,'#3c6838');ell(g,x-s*.12,y-s*.76,s*.33,s*.3,'#5b8f48');ell(g,x-s*.18,y-s*.86,s*.17,s*.14,'#86b65e')}}
function peak(g,x,y,w,h,snow){tri(g,x-w/2,y,x,y-h,x+w*.06,y,'#a49d90');tri(g,x,y-h,x+w/2,y,x+w*.06,y,'#6c675f');if(snow){tri(g,x-w*.15,y-h*.72,x,y-h,x+w*.12,y-h*.7,'#f4f6f6');tri(g,x,y-h,x+w*.14,y-h*.68,x+w*.02,y-h*.55,'#c6ced4')}}
function hill(g,x,y,w,h,col){ell(g,x+w*.05,y,w*.55,h*.22,'rgba(0,0,0,.2)');g.fillStyle=rgb(col,.78);g.beginPath();g.ellipse(x,y,w*.5,h,0,PI,0);g.fill();g.fillStyle=rgb(col,1.08);g.beginPath();g.ellipse(x-w*.1,y-h*.1,w*.34,h*.7,0,PI,0);g.fill()}
function stroke2(g,pts,w,col){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();for(var i=0;i<pts.length;i++){if(i===0)g.moveTo(pts[0][0],pts[0][1]);else{var m=[(pts[i-1][0]+pts[i][0])/2,(pts[i-1][1]+pts[i][1])/2];g.quadraticCurveTo(pts[i-1][0],pts[i-1][1],m[0],m[1])}}g.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]);g.stroke()}

function bevel(g,x,y){var a=corner(x,y,3),b=corner(x,y,4),c=corner(x,y,5),d=corner(x,y,0),e=corner(x,y,1),f=corner(x,y,2);g.lineWidth=1.4;g.lineCap='round';
 g.strokeStyle='rgba(255,244,210,.17)';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(c[0],c[1]);g.stroke();
 g.strokeStyle='rgba(20,10,0,.22)';g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(e[0],e[1]);g.lineTo(f[0],f[1]);g.stroke()}
/* paint a scene's terrain to an offscreen canvas.  sc: {cols,rows,t[c][r],biome,roads:[[ [c,r].. ]],seed} */
function paintScene(sc){
 var W=Math.ceil(S*SQ3*(sc.cols+.5))+2,H=Math.ceil(S*1.5*sc.rows+S*.6)+2,cv=document.createElement('canvas');cv.width=W;cv.height=H;var g=cv.getContext('2d');
 var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#18222d');bg.addColorStop(1,'#0a0f15');g.fillStyle=bg;g.fillRect(0,0,W,H);
 var c,r,t,x,y,h1,h2,i,decos=[],lift=[],busy={};if(!FX.low){(sc.roads||[]).forEach(function(rd){rd.forEach(function(p){busy[p[0]+','+p[1]]=1})});(sc.plaza||[]).forEach(function(p){busy[p[0]+','+p[1]]=1});(sc.objs||[]).forEach(function(o){busy[o.c+','+o.r]=1})}
 for(r=0;r<sc.rows;r++)for(c=0;c<sc.cols;c++){t=sc.t[c][r];x=hx(c,r);y=hy(r);h1=hash(c,r,sc.seed);h2=hash(c,r,sc.seed+7);
  var base=COL[t==='pine'?'forest':t]||COL.grass;
  if(t==='forest'||t==='pine'){base=COL.forest}
  var f=.9+h1*.2,n2=0;if(!FX.low){f=.84+vnoise(c*.3,r*.3,sc.seed)*.22+h1*.08;n2=vnoise(c*.22+9,r*.22,sc.seed+3)}
  hexPath(g,x,y,S*1.03);g.fillStyle=rgb(base,f);g.fill();
  if(!FX.low&&(n2>.56||n2<.4)){g.fillStyle=n2>.56?'rgba(255,226,150,'+((n2-.56)*.5).toFixed(3)+')':'rgba(50,90,150,'+((.4-n2)*.5).toFixed(3)+')';g.fill()}
  if(!FX.low&&(t==='mountain'||t==='hills'||t==='forest'||t==='pine'))lift.push([y,x,t==='mountain'?4:t==='hills'?3:2,base,f]);
  if(t==='water'){var gr=g.createRadialGradient(x-S*.2,y-S*.3,2,x,y,S);gr.addColorStop(0,'rgba(120,190,215,.28)');gr.addColorStop(1,'rgba(10,30,60,.25)');g.fillStyle=gr;g.fill();
   g.strokeStyle='rgba(235,248,255,.16)';g.lineWidth=1.2;for(i=0;i<2;i++){var wx=x-S*.5+hash(c,r,i+3)*S,wy=y-S*.4+hash(c,r,i+9)*S*.8;g.beginPath();g.moveTo(wx-6,wy);g.quadraticCurveTo(wx,wy-3,wx+6,wy);g.stroke()}}
  else{var gr2=g.createRadialGradient(x-S*.3,y-S*.4,2,x,y,S*1.05);gr2.addColorStop(0,'rgba(255,246,214,.16)');gr2.addColorStop(1,'rgba(20,14,0,.12)');hexPath(g,x,y,S*1.03);g.fillStyle=gr2;g.fill();
   g.save();hexPath(g,x,y,S);g.clip();for(i=0;i<5;i++){var a=hash(c,r,20+i),b=hash(c,r,40+i);g.fillStyle=(i%2?'rgba(255,240,190,.07)':'rgba(30,20,0,.07)');g.beginPath();g.ellipse(x-S*.7+a*S*1.4,y-S*.7+b*S*1.4,S*.35,S*.12,a*3,0,PI*2);g.fill()}g.restore()}
  hexPath(g,x,y,S);g.strokeStyle='rgba(30,22,6,.10)';g.lineWidth=1;g.stroke();if(!FX.low&&t!=='water')bevel(g,x,y);
  if(t==='forest')decos.push([y,'forest',x,y,h1,h2]);else if(t==='pine')decos.push([y,'pine',x,y,h1,h2]);else if(t==='mountain')decos.push([y,'mountain',x,y,h1,h2]);else if(t==='hills')decos.push([y,'hills',x,y,h1,h2]);
  else if(t==='grass'||t==='crown'){if(h1<.16)decos.push([y,'lone',x,y,h1,h2])}else if(t==='sand'){if(h1<.5)decos.push([y,'dune',x,y,h1,h2]);if(h2<.1)decos.push([y,'rock',x,y,h1,h2])}else if(t==='snow'){if(h1<.4)decos.push([y,'drift',x,y,h1,h2])}else if(t==='marsh'){decos.push([y,'reed',x,y,h1,h2])}
  if(!FX.low&&!busy[c+','+r])props(decos,t,x,y,c,r,sc.seed)}
 /* raised tiles (mountain, hills, forest): a side wall, a soft shadow and the top lifted a few pixels */
 lift.sort(function(a,b){return a[0]-b[0]});
 lift.forEach(function(d){var y0=d[0],x0=d[1],e=d[2],bs=d[3],ff=d[4],k,p;ell(g,x0+S*.12,y0+S*.9,S*.85,S*.26,'rgba(0,0,0,.2)');
  var gw=g.createLinearGradient(x0-S,0,x0+S,0);gw.addColorStop(0,rgb(bs,ff*.62));gw.addColorStop(1,rgb(bs,ff*.4));g.fillStyle=gw;g.beginPath();
  for(k=4;k>=0;k--){p=corner(x0,y0,k);k===4?g.moveTo(p[0],p[1]):g.lineTo(p[0],p[1])}for(k=0;k<5;k++){p=corner(x0,y0,k);g.lineTo(p[0],p[1]+e)}g.closePath();g.fill();
  hexPath(g,x0,y0-e,S*1.01);g.fillStyle=rgb(bs,ff);g.fill();var l2=g.createRadialGradient(x0-S*.3,y0-e-S*.4,2,x0,y0-e,S*1.05);l2.addColorStop(0,'rgba(255,246,214,.16)');l2.addColorStop(1,'rgba(20,14,0,.12)');g.fillStyle=l2;g.fill();bevel(g,x0,y0-e)});
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
 if(!FX.low){var L=Math.max(W,H),lg=g.createRadialGradient(W*.18,H*.04,0,W*.18,H*.04,L*.95);lg.addColorStop(0,'rgba(255,228,170,.15)');lg.addColorStop(.65,'rgba(255,228,170,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);
  var dg=g.createLinearGradient(0,0,W,H);dg.addColorStop(.45,'rgba(6,10,24,0)');dg.addColorStop(1,'rgba(6,10,24,.3)');g.fillStyle=dg;g.fillRect(0,0,W,H)}
 /* grain */
 for(i=0;i<W*H/260;i++){g.fillStyle=Math.random()<.5?'rgba(255,245,210,.05)':'rgba(10,8,0,.05)';g.fillRect(Math.random()*W,Math.random()*H,2,2)}
 sc.cv=cv;sc.W=W;sc.H=H}

/* portraits */
var pc={};
function portrait(look,size){var key=JSON.stringify(look)+size;if(pc[key])return pc[key];var cv=document.createElement('canvas'),s=size*2;cv.width=cv.height=s;var g=cv.getContext('2d');
 var gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,mix(look.robe,'#1c2733',.55));gr.addColorStop(1,'#0a0f15');g.fillStyle=gr;g.fillRect(0,0,s,s);
 var rg=g.createRadialGradient(s*.5,s*.3,2,s*.5,s*.4,s*.6);rg.addColorStop(0,'rgba(243,226,176,.35)');rg.addColorStop(1,'rgba(243,226,176,0)');g.fillStyle=rg;g.fillRect(0,0,s,s);
 if(look.cape){g.fillStyle=look.cape;g.beginPath();g.moveTo(s*.04,s);g.quadraticCurveTo(s*.06,s*.6,s*.5,s*.58);g.quadraticCurveTo(s*.94,s*.6,s*.96,s);g.fill()}
 g.fillStyle=look.robe;g.beginPath();g.moveTo(s*.1,s);g.quadraticCurveTo(s*.14,s*.68,s*.5,s*.66);g.quadraticCurveTo(s*.86,s*.68,s*.9,s);g.fill();
 g.strokeStyle=look.trim;g.lineWidth=s*.035;g.lineJoin='round';g.beginPath();g.moveTo(s*.32,s*.7);g.lineTo(s*.5,s*.88);g.lineTo(s*.68,s*.7);g.stroke();
 g.fillStyle=mix(look.skin,'#000000',.2);g.fillRect(s*.44,s*.55,s*.12,s*.14);
 if(look.hat==='hood'){g.fillStyle=look.robe;g.beginPath();g.ellipse(s*.5,s*.42,s*.26,s*.3,0,0,PI*2);g.fill()}
 if(look.hair&&look.hat!=='helm'){g.fillStyle=look.hair;g.beginPath();g.ellipse(s*.5,s*.36,s*.21,s*.22,0,PI,0);g.fill();g.fillRect(s*.29,s*.36,s*.05,s*.14);g.fillRect(s*.66,s*.36,s*.05,s*.14)}
 var hg=g.createRadialGradient(s*.44,s*.38,2,s*.5,s*.43,s*.25);hg.addColorStop(0,mix(look.skin,'#ffffff',.18));hg.addColorStop(1,look.skin);g.fillStyle=hg;g.beginPath();g.ellipse(s*.5,s*.44,s*.18,s*.22,0,0,PI*2);g.fill();
 if(look.hat!=='helm'&&look.hair){g.fillStyle=look.hair;g.beginPath();g.ellipse(s*.5,s*.3,s*.19,s*.1,0,PI,0);g.fill()}
 g.fillStyle='#1a1208';ell(g,s*.43,s*.44,s*.018,s*.026,'#1a1208');ell(g,s*.57,s*.44,s*.018,s*.026,'#1a1208');g.strokeStyle='rgba(30,20,10,.6)';g.lineWidth=s*.012;g.beginPath();g.moveTo(s*.39,s*.4);g.lineTo(s*.46,s*.39);g.moveTo(s*.54,s*.39);g.lineTo(s*.61,s*.4);g.stroke();
 g.strokeStyle='rgba(120,60,40,.7)';g.beginPath();g.moveTo(s*.45,s*.55);g.quadraticCurveTo(s*.5,s*.57,s*.55,s*.55);g.stroke();g.strokeStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(s*.5,s*.45);g.lineTo(s*.48,s*.5);g.lineTo(s*.52,s*.5);g.stroke();
 if(look.beard){g.fillStyle=look.hair;g.beginPath();g.moveTo(s*.34,s*.5);g.quadraticCurveTo(s*.5,s*.8,s*.66,s*.5);g.quadraticCurveTo(s*.5,s*.6,s*.34,s*.5);g.fill()}
 if(look.hat==='helm'){g.fillStyle='#8a929c';g.beginPath();g.ellipse(s*.5,s*.36,s*.22,s*.2,0,PI,0);g.lineTo(s*.72,s*.4);g.lineTo(s*.28,s*.4);g.fill();g.fillStyle='#b9c0c8';g.beginPath();g.ellipse(s*.44,s*.3,s*.1,s*.08,0,PI,0);g.fill();g.fillStyle=look.trim;g.fillRect(s*.28,s*.38,s*.44,s*.03);g.fillStyle='#a32a2a';g.beginPath();g.ellipse(s*.5,s*.15,s*.04,s*.09,0,0,PI*2);g.fill()}
 if(look.hat==='cap'){g.fillStyle=look.robe;g.beginPath();g.ellipse(s*.5,s*.3,s*.23,s*.1,-.1,PI,0);g.fill();g.fillStyle=look.trim;g.fillRect(s*.28,s*.3,s*.44,s*.025)}
 if(look.hat==='scholar'){g.fillStyle='#1a1208';g.fillRect(s*.3,s*.22,s*.4,s*.07);g.beginPath();g.moveTo(s*.22,s*.22);g.lineTo(s*.5,s*.13);g.lineTo(s*.78,s*.22);g.lineTo(s*.5,s*.3);g.fill();g.strokeStyle=look.trim;g.lineWidth=s*.015;g.beginPath();g.moveTo(s*.5,s*.2);g.lineTo(s*.74,s*.3);g.stroke()}
 if(look.hat==='crown'){g.fillStyle=look.trim;g.beginPath();g.moveTo(s*.3,s*.27);g.lineTo(s*.3,s*.14);g.lineTo(s*.4,s*.21);g.lineTo(s*.5,s*.1);g.lineTo(s*.6,s*.21);g.lineTo(s*.7,s*.14);g.lineTo(s*.7,s*.27);g.closePath();g.fill();g.strokeStyle='#6b4a0e';g.lineWidth=s*.012;g.stroke();ell(g,s*.5,s*.2,s*.018,s*.018,'#c0392b')}
 var u=cv.toDataURL();pc[key]=u;return u}

/* animated figure, feet at (x, y+0.38S). Chunky, friendly proportions (big head, short body) with a soft ink outline so characters read at small sizes.
   o: {t, moving, face:1|-1, celebrate:bool}. Idle: gentle breathing and blinking. Walk: leg/arm swing with bob. Celebrate: hop with arms up. */
var OUT='rgba(28,18,12,.88)';
function oFill(g,fill,lw){g.fillStyle=fill;g.fill();g.strokeStyle=OUT;g.lineWidth=lw;g.lineJoin='round';g.lineCap='round';g.stroke()}
function limb(g,x0,y0,x1,y1,w,col,lw){g.lineCap='round';g.strokeStyle=OUT;g.lineWidth=w+lw*2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke()}
function figure(g,x,y,look,o){var u=S/34,t=o.t||0,mv=o.moving,f=o.face||1,cel=!!o.celebrate,lw=1.1*u,ph=t*12,
  bob=mv?Math.abs(Math.sin(ph))*2.2*u:cel?Math.abs(Math.sin(t*7))*7*u:0,breath=mv||cel?0:Math.sin(t*2.2+x*.13)*.6*u,
  blink=((t+x*.017)%3.7)<.12,robeD=mix(look.robe,'#000000',.32),robeL=mix(look.robe,'#ffffff',.22),skinD=mix(look.skin,'#5a2a1a',.22);
 g.save();g.translate(x,y+S*.38);
 /* soft contact shadow, shrinks while hopping */
 var sh=1-bob/(12*u);ell(g,0,.5*u,11*u*sh,3.6*u*sh,'rgba(10,8,4,.32)');ell(g,0,.5*u,6*u*sh,2*u*sh,'rgba(10,8,4,.25)');
 g.translate(0,-bob);
 /* legs + boots */
 var sw=mv?Math.sin(ph)*3.4*u:0;limb(g,-2.6*u,-9*u,-2.6*u+sw*.6,-1.6*u,3.4*u,robeD,lw);limb(g,2.6*u,-9*u,2.6*u-sw*.6,-1.6*u,3.4*u,robeD,lw);
 [[-2.6*u+sw*.6,-1],[2.6*u-sw*.6,1]].forEach(function(b){g.beginPath();g.ellipse(b[0]+f*.8*u,-1.2*u,2.8*u,1.9*u,0,0,PI*2);oFill(g,'#4a2f1c',lw*.8)});
 /* cape (behind body), sways with motion */
 if(look.cape){var cs=(mv?Math.sin(ph*.5)*1.5:Math.sin(t*1.6)*.6)*u;g.beginPath();g.moveTo(-6*u,-24*u);g.quadraticCurveTo(-f*9*u,-14*u,-f*10*u+cs-f*2*u,-4*u);g.lineTo(f*3*u+cs,-4.5*u);g.lineTo(6*u,-24*u);g.closePath();oFill(g,mix(look.cape,'#000000',.15),lw)}
 /* arms behind (far side) */
 var as=mv?Math.sin(ph)*4*u:0,armC=mix(look.robe,'#000000',.18);
 if(cel){limb(g,-5.5*u,-21*u,-10*u,-31*u-Math.sin(t*7)*1.5*u,3.2*u,armC,lw)}else limb(g,-f*5.5*u,-21*u,-f*7.5*u-as,-12.5*u,3.2*u,armC,lw);
 /* tunic body: rounded bell with left-lit shading */
 g.beginPath();g.moveTo(-5.6*u,-24.5*u+breath);g.quadraticCurveTo(-10.5*u,-14*u,-9*u,-7.5*u);g.quadraticCurveTo(0,-5*u,9*u,-7.5*u);g.quadraticCurveTo(10.5*u,-14*u,5.6*u,-24.5*u+breath);g.quadraticCurveTo(0,-26.5*u+breath,-5.6*u,-24.5*u+breath);g.closePath();
 var rb=g.createLinearGradient(-9*u,-20*u,9*u,-8*u);rb.addColorStop(0,robeL);rb.addColorStop(.55,look.robe);rb.addColorStop(1,robeD);oFill(g,rb,lw);
 /* belt, hem trim and a collar V */
 g.save();g.clip();g.fillStyle=look.trim;g.fillRect(-11*u,-15.6*u,22*u,1.8*u);g.fillRect(-11*u,-9.4*u,22*u,1.6*u);g.fillStyle=mix(look.trim,'#000000',.35);g.fillRect(-1.3*u,-16*u,2.6*u,2.6*u);
 g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.ellipse(-4*u,-19*u,2*u,5*u,.3,0,PI*2);g.fill();g.restore();
 g.strokeStyle=look.trim;g.lineWidth=1.2*u;g.beginPath();g.moveTo(-2.8*u,-24.6*u+breath);g.lineTo(0,-21*u+breath);g.lineTo(2.8*u,-24.6*u+breath);g.stroke();
 /* near arm + hand */
 var hx2,hy2;if(cel){hx2=10*u;hy2=-31*u-Math.cos(t*7)*1.5*u;}else{hx2=f*7.5*u+as;hy2=-12.5*u}
 limb(g,f*5.5*u*(cel?1:1),-21*u,hx2,hy2,3.2*u,look.robe,lw);g.beginPath();g.arc(hx2,hy2,1.9*u,0,PI*2);oFill(g,look.skin,lw*.8);
 if(cel){g.beginPath();g.arc(-10*u,-31*u-Math.sin(t*7)*1.5*u,1.9*u,0,PI*2);oFill(g,look.skin,lw*.8)}
 /* head */
 var hy0=-32*u+breath*.6,hr=8.4*u;
 if(look.hat==='hood'){g.beginPath();g.ellipse(0,hy0-.6*u,hr+2*u,hr+1.8*u,0,0,PI*2);oFill(g,look.robe,lw)}
 if(look.hair&&look.hat!=='helm'&&look.hat!=='hood'){g.beginPath();g.ellipse(-f*.8*u,hy0+1*u,hr+.9*u,hr+.6*u,0,0,PI*2);oFill(g,look.hair,lw)}
 g.beginPath();g.arc(0,hy0,hr,0,PI*2);var hg=g.createRadialGradient(-3*u,hy0-3*u,1,0,hy0,hr*1.1);hg.addColorStop(0,mix(look.skin,'#ffffff',.25));hg.addColorStop(.7,look.skin);hg.addColorStop(1,skinD);oFill(g,hg,lw);
 /* hood inner rim over the forehead */
 if(look.hat==='hood'){g.beginPath();g.arc(0,hy0+.5*u,hr+.6*u,PI*1.05,PI*1.95);g.quadraticCurveTo(0,hy0-hr*.35,-hr*.98,hy0-2.4*u);g.closePath();oFill(g,robeD,lw*.7)}
 /* hair fringe */
 if(look.hair&&look.hat!=='helm'&&look.hat!=='hood'){g.beginPath();g.moveTo(-hr*.98,hy0-1*u);g.quadraticCurveTo(-hr*.9,hy0-hr*1.05,0,hy0-hr*1.02);g.quadraticCurveTo(hr*.9,hy0-hr*1.05,hr*.98,hy0-1*u);g.quadraticCurveTo(f*2*u,hy0-5.2*u,-hr*.98,hy0-1*u);g.closePath();oFill(g,look.hair,lw*.7)}
 /* face: big friendly eyes with catch-lights, rosy cheeks, smile; looks toward facing side */
 var ex=f*1.6*u,ey=hy0+.6*u;
 [-1,1].forEach(function(s){var px=ex+s*3*u;if(blink||cel){g.strokeStyle='#1a1208';g.lineWidth=1.1*u;g.beginPath();if(cel){g.arc(px,ey+.6*u,1.5*u,PI*1.15,PI*1.85)}else{g.moveTo(px-1.4*u,ey);g.lineTo(px+1.4*u,ey)}g.stroke()}else{ell(g,px,ey,1.5*u,2*u,'#1a1208');ell(g,px+.5*u,ey-.7*u,.6*u,.6*u,'#ffffff')}
  ell(g,px+s*.8*u,ey+2.8*u,1.6*u,1*u,'rgba(235,110,100,.35)')});
 g.strokeStyle='rgba(90,40,24,.9)';g.lineWidth=1*u;g.beginPath();if(cel){g.moveTo(ex-2*u,ey+3.4*u);g.quadraticCurveTo(ex,ey+6.4*u,ex+2*u,ey+3.4*u);g.closePath();g.fillStyle='#7a2a22';g.fill();g.stroke()}else{g.arc(ex,ey+2.6*u,1.8*u,PI*.2,PI*.8);g.stroke()}
 if(look.beard){g.beginPath();g.moveTo(-hr*.8,hy0+2*u);g.quadraticCurveTo(-hr*.6,hy0+hr+4*u,0,hy0+hr+5*u);g.quadraticCurveTo(hr*.6,hy0+hr+4*u,hr*.8,hy0+2*u);g.quadraticCurveTo(ex,hy0+5.8*u,-hr*.8,hy0+2*u);oFill(g,look.hair,lw*.8);g.strokeStyle='rgba(90,40,24,.9)';g.lineWidth=1*u;g.beginPath();g.arc(ex,ey+3*u,1.4*u,PI*.2,PI*.8);g.stroke()}
 /* hats */
 var top=hy0-hr;
 if(look.hat==='helm'){g.beginPath();g.arc(0,hy0-1*u,hr+1.2*u,PI,0);g.lineTo(hr+1.2*u,hy0-.2*u);g.lineTo(-hr-1.2*u,hy0-.2*u);g.closePath();var mg=g.createLinearGradient(-hr,0,hr,0);mg.addColorStop(0,'#c9d0d8');mg.addColorStop(1,'#6a727c');oFill(g,mg,lw);g.fillStyle=look.trim;g.fillRect(-hr-1.2*u,hy0-1.8*u,2*(hr+1.2*u),1.6*u);g.beginPath();g.ellipse(0,top-3*u,1.8*u,3.4*u,0,0,PI*2);oFill(g,'#d2483a',lw*.7)}
 if(look.hat==='cap'){g.beginPath();g.ellipse(0,top+3*u,hr+.6*u,4.6*u,0,PI,0);g.closePath();oFill(g,look.robe,lw);g.beginPath();g.ellipse(f*5*u,top+3.2*u,5*u,1.4*u,0,0,PI*2);oFill(g,robeD,lw*.7);ell(g,0,top-1.3*u,1.4*u,1.4*u,look.trim)}
 if(look.hat==='scholar'){g.beginPath();g.moveTo(-hr-2*u,top+1*u);g.lineTo(0,top-2.6*u);g.lineTo(hr+2*u,top+1*u);g.lineTo(0,top+4*u);g.closePath();oFill(g,'#2a2230',lw);g.fillStyle='#2a2230';g.fillRect(-5*u,top+1.5*u,10*u,3*u);g.strokeStyle=look.trim;g.lineWidth=1*u;g.beginPath();g.moveTo(0,top+.6*u);g.quadraticCurveTo(f*6*u,top+1*u,f*7*u,top+6*u);g.stroke();ell(g,f*7*u,top+6.6*u,1.2*u,1.4*u,look.trim)}
 if(look.hat==='crown'){g.beginPath();g.moveTo(-6*u,top+2.5*u);g.lineTo(-6.5*u,top-4*u);g.lineTo(-3*u,top-1*u);g.lineTo(0,top-5.5*u);g.lineTo(3*u,top-1*u);g.lineTo(6.5*u,top-4*u);g.lineTo(6*u,top+2.5*u);g.closePath();oFill(g,'#f2c84b',lw);ell(g,0,top+.4*u,1.2*u,1.2*u,'#d2483a');ell(g,-4*u,top+.8*u,.9*u,.9*u,'#4f8fd0');ell(g,4*u,top+.8*u,.9*u,.9*u,'#4f8fd0')}
 /* staff with a glowing orb, held in the near hand */
 if(look.staff&&!cel){var sx=hx2+f*.6*u;limb(g,sx,hy2+11*u,sx,hy2-24*u,2*u,'#8a5a2a',lw*.8);var gl=.55+.25*Math.sin(t*3);var og=g.createRadialGradient(sx,hy2-26.5*u,0,sx,hy2-26.5*u,7*u);og.addColorStop(0,'rgba(255,240,180,'+gl+')');og.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=og;g.fillRect(sx-7*u,hy2-33.5*u,14*u,14*u);g.beginPath();g.arc(sx,hy2-26.5*u,3.3*u,0,PI*2);oFill(g,'#ffe9a8',lw*.8);ell(g,sx-1*u,hy2-27.5*u,1.1*u,1.1*u,'#ffffff')}
 /* celebrate sparkles */
 if(cel){for(var i=0;i<5;i++){var a=t*2+i*1.256,r=15*u+Math.sin(t*5+i)*2*u,spx=Math.cos(a)*r,spy=hy0-4*u+Math.sin(a)*r*.7,ss=(1.2+Math.sin(t*8+i))*u;g.fillStyle=['#ffe27a','#ff9fb5','#9fd8ff','#b8f28a','#ffffff'][i];g.beginPath();g.moveTo(spx,spy-ss*2);g.lineTo(spx+ss*.6,spy);g.lineTo(spx,spy+ss*2);g.lineTo(spx-ss*.6,spy);g.closePath();g.fill()}}
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
function roofHouse(g,x,y,w,h,wallc,roofc,u){wallG(g,x-w/2,y,w,h,wallc);tri(g,x-w/2-2*u,y-h,x,y-h-h*.9,x+w/2+2*u,y-h,roofc);tri(g,x,y-h-h*.9,x+w/2+2*u,y-h,x+1,y-h,'rgba(0,0,0,.25)');g.fillStyle='#2a1d0a';g.fillRect(x-1.6*u,y-h*.5,3.2*u,h*.5)}
function flag(g,x,y,len,ac,t,u){g.fillStyle='#6a4a22';g.fillRect(x-.8*u,y-len,1.6*u,len);var w=Math.sin(t*4)*1.6*u;tri(g,x+.8*u,y-len,x+11*u+w,y-len+4*u,x+.8*u,y-len+8*u,ac)}
function townVariant(g,b,u,ac,t){
 if(b==='meadow'){roofHouse(g,-15*u,-2*u,16*u,11*u,'#e6d6b2',mix(ac,'#6a3a1a',.3),u);roofHouse(g,13*u,4*u,15*u,10*u,'#eadfc4',ac,u);
  g.fillStyle='#d9cdb0';g.beginPath();g.moveTo(-5*u,0);g.lineTo(-3*u,-30*u);g.lineTo(3*u,-30*u);g.lineTo(5*u,0);g.fill();tri(g,-5*u,-30*u,0,-37*u,5*u,-30*u,mix(ac,'#000',.2));
  g.save();g.translate(0,-30*u);g.rotate(t*.8);g.fillStyle='#f3e8cc';g.strokeStyle='#6a4a22';g.lineWidth=1*u;for(var k=0;k<4;k++){g.rotate(PI/2);g.fillRect(-1.2*u,0,2.4*u,15*u);g.strokeRect(-1.2*u,0,2.4*u,15*u);g.fillRect(1.2*u,3*u,4*u,11*u)}g.restore();ell(g,0,-30*u,1.8*u,1.8*u,'#6a4a22')}
 else if(b==='forest'){bush(g,-20*u,6*u,16*u,'#3c6838');g.fillStyle='#7a5530';g.fillRect(-14*u,-14*u,28*u,14*u);for(var j=0;j<4;j++){g.fillStyle=j%2?'#6a4626':'#8a6036';g.fillRect(-14*u,-14*u+j*3.5*u,28*u,3.5*u)}shade(g,-14*u,0,28*u,14*u);
  tri(g,-18*u,-14*u,0,-30*u,18*u,-14*u,'#4a5a2a');tri(g,0,-30*u,18*u,-14*u,1,-14*u,'rgba(0,0,0,.25)');g.fillStyle='#f3d78a';g.fillRect(-9*u,-9*u,4*u,4*u);g.fillStyle='#2a1d0a';g.fillRect(3*u,-8*u,4*u,8*u);tree(g,19*u,4*u,30*u,'pine');flag(g,-14*u,-14*u,16*u,ac,t,u)}
 else if(b==='hills'){g.fillStyle='#9a8f74';g.beginPath();g.ellipse(0,0,26*u,9*u,0,PI,0);g.fill();wallG(g,-16*u,-4*u,32*u,16*u,'#bdb39a');g.fillStyle='#bdb39a';for(var m=0;m<5;m++)g.fillRect(-16*u+m*7*u,-24*u,4*u,4*u);
  wallG(g,-5*u,-6*u,10*u,30*u,'#cfc6ac');tri(g,-7*u,-36*u,0,-46*u,7*u,-36*u,ac);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-3*u,-4*u);g.lineTo(-3*u,-11*u);g.quadraticCurveTo(0,-14*u,3*u,-11*u);g.lineTo(3*u,-4*u);g.fill();g.fillStyle='#f3d78a';g.fillRect(-1.2*u,-30*u,2.4*u,4*u);flag(g,0,-46*u,10*u,ac,t,u)}
 else if(b==='desert'){wallG(g,-20*u,0,22*u,12*u,'#d9b98a');g.fillStyle='#d9b98a';g.beginPath();g.ellipse(-9*u,-12*u,10*u,9*u,0,PI,0);g.fill();g.fillStyle='rgba(120,70,30,.25)';g.fillRect(-4*u,-12*u,6*u,12*u);
  wallG(g,4*u,0,16*u,9*u,'#e6c99a');g.fillStyle='#c9a46e';g.fillRect(4*u,-10*u,16*u,2*u);ell(g,-9*u,-21*u,2*u,2*u,ac);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-12*u,0);g.lineTo(-12*u,-6*u);g.quadraticCurveTo(-9*u,-9*u,-6*u,-6*u);g.lineTo(-6*u,0);g.fill();g.fillRect(9*u,-6*u,3*u,3*u);g.fillRect(15*u,-6*u,3*u,3*u);
  g.strokeStyle='#7a5a32';g.lineWidth=2*u;g.beginPath();g.moveTo(22*u,2*u);g.quadraticCurveTo(24*u,-12*u,21*u,-24*u);g.stroke();for(var f=0;f<5;f++){var a=-PI+f*PI/4+Math.sin(t*1.5)*.05;g.strokeStyle='#4f8a45';g.lineWidth=2.4*u;g.beginPath();g.moveTo(21*u,-24*u);g.quadraticCurveTo(21*u+Math.cos(a)*6*u,-24*u+Math.sin(a)*6*u-3*u,21*u+Math.cos(a)*11*u,-24*u+Math.sin(a)*8*u+2*u);g.stroke()}}
 else if(b==='tundra'){wallG(g,-22*u,0,34*u,10*u,'#8a6a4a');g.fillStyle='#f4f7f9';g.beginPath();g.moveTo(-25*u,-10*u);g.quadraticCurveTo(-5*u,-28*u,15*u,-10*u);g.fill();g.fillStyle='#c6d2da';g.beginPath();g.moveTo(-5*u,-19*u);g.quadraticCurveTo(6*u,-17*u,15*u,-10*u);g.lineTo(-5*u,-10*u);g.fill();
  g.fillStyle='#f3d78a';g.fillRect(-15*u,-7*u,4*u,3*u);g.fillStyle='#2a1d0a';g.fillRect(-2*u,-7*u,4*u,7*u);g.fillStyle='#6a625a';g.fillRect(6*u,-24*u,4*u,8*u);for(var sm=0;sm<3;sm++){var ph=(t*.35+sm/3)%1;ell(g,8*u+Math.sin(ph*6+sm)*3*u,-27*u-ph*16*u,(2+ph*4)*u,(1.6+ph*3)*u,'rgba(220,226,232,'+(.45*(1-ph))+')')}tree(g,18*u,4*u,24*u,'pine',true);flag(g,-22*u,-10*u,14*u,ac,t,u)}
 else if(b==='marsh'){ell(g,0,2*u,26*u,6*u,'rgba(60,110,130,.55)');[[-12,-3,14],[10,0,13]].forEach(function(h){var hx2=h[0]*u,hy2=h[1]*u,w=h[2]*u;g.strokeStyle='#5a4028';g.lineWidth=1.6*u;g.beginPath();g.moveTo(hx2-w*.35,hy2+4*u);g.lineTo(hx2-w*.35,hy2-6*u);g.moveTo(hx2+w*.35,hy2+4*u);g.lineTo(hx2+w*.35,hy2-6*u);g.stroke();
  g.fillStyle='#9a7a52';g.fillRect(hx2-w/2,hy2-14*u,w,8*u);g.fillStyle='#c9a85a';g.beginPath();g.moveTo(hx2-w/2-3*u,hy2-14*u);g.lineTo(hx2,hy2-24*u);g.lineTo(hx2+w/2+3*u,hy2-14*u);g.fill();g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.moveTo(hx2,hy2-24*u);g.lineTo(hx2+w/2+3*u,hy2-14*u);g.lineTo(hx2,hy2-14*u);g.fill();g.fillStyle='#2a1d0a';g.fillRect(hx2-1.5*u,hy2-11*u,3*u,5*u)});
  g.strokeStyle='#7a5a32';g.lineWidth=1.2*u;g.beginPath();g.moveTo(-5*u,-8*u);g.lineTo(3*u,-6*u);g.stroke();flag(g,10*u,-24*u,9*u,ac,t,u)}
 else if(b==='highland'){g.fillStyle='#8a929c';g.beginPath();g.moveTo(-24*u,0);g.lineTo(-14*u,-10*u);g.lineTo(14*u,-10*u);g.lineTo(24*u,0);g.fill();g.fillStyle='#c4baa0';g.fillRect(-18*u,-20*u,36*u,12*u);for(var cc=0;cc<6;cc++)g.fillRect(-18*u+cc*6.6*u,-23*u,3.6*u,3*u);
  g.fillStyle='#d6ccb0';g.fillRect(-6*u,-44*u,12*u,26*u);g.fillStyle='#bfb598';for(var c2=0;c2<3;c2++)g.fillRect(-6*u+c2*4.5*u,-47*u,3*u,3*u);var lt=.75+.25*Math.sin(t*2.5);g.fillStyle='rgba(243,215,138,'+lt+')';g.fillRect(-1.6*u,-38*u,3.2*u,5*u);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-3*u,-8*u);g.lineTo(-3*u,-14*u);g.quadraticCurveTo(0,-17*u,3*u,-14*u);g.lineTo(3*u,-8*u);g.fill();flag(g,0,-47*u,14*u,ac,t,u)}
 else return false;return true}
function landmark(g,b,u,ac,t){g.save();
 if(b==='meadow'||b==='crown'){ell(g,0,0,14*u,6*u,'rgba(0,0,0,.25)');g.fillStyle='#8a8a90';g.beginPath();g.ellipse(0,-2*u,10*u,5*u,0,0,PI*2);g.fill();ell(g,0,-3*u,7.5*u,3.4*u,'#2f6a88');g.fillStyle='#6a4a22';g.fillRect(-9*u,-20*u,2*u,18*u);g.fillRect(7*u,-20*u,2*u,18*u);tri(g,-12*u,-19*u,0,-27*u,12*u,-19*u,ac);g.strokeStyle='#3a2a1a';g.lineWidth=.8*u;g.beginPath();g.moveTo(0,-19*u);g.lineTo(0,-8*u);g.stroke();g.fillStyle='#7a5a32';g.fillRect(-2*u,-9*u,4*u,3*u)}
 else if(b==='forest'){ell(g,0,0,10*u,4*u,'rgba(0,0,0,.25)');g.fillStyle='#7a5530';g.fillRect(-3.5*u,-30*u,7*u,30*u);[['#b5532f',-26],['#d7b56a',-18],['#3f5f8f',-10]].forEach(function(r){g.fillStyle=r[0];g.fillRect(-4.5*u,r[1]*u,9*u,4*u)});ell(g,-2*u,-22*u,1.2*u,1.2*u,'#1a1208');ell(g,2*u,-22*u,1.2*u,1.2*u,'#1a1208');tri(g,-9*u,-30*u,0,-36*u,9*u,-30*u,ac)}
 else if(b==='hills'){[-8,0,8].forEach(function(dx,i){var hh=(i===1?26:18)*u;ell(g,dx*u,0,4*u,1.6*u,'rgba(0,0,0,.25)');g.fillStyle=i===1?'#a9a294':'#8d877c';g.fillRect(dx*u-3*u,-hh,6*u,hh);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(dx*u-3*u,-hh,2*u,hh)});g.fillStyle='#8d877c';g.fillRect(-11*u,-30*u,22*u,4*u)}
 else if(b==='desert'){ell(g,0,0,12*u,4*u,'rgba(0,0,0,.25)');g.fillStyle='#d9b98a';g.beginPath();g.moveTo(-4*u,0);g.lineTo(-2*u,-34*u);g.lineTo(2*u,-34*u);g.lineTo(4*u,0);g.fill();tri(g,-2*u,-34*u,0,-40*u,2*u,-34*u,'#f3e2b0');g.fillStyle='rgba(120,70,30,.28)';g.beginPath();g.moveTo(0,0);g.lineTo(0,-34*u);g.lineTo(2*u,-34*u);g.lineTo(4*u,0);g.fill();var gl=.4+.3*Math.sin(t*2);ell(g,0,-40*u,4*u,4*u,'rgba(243,226,176,'+gl+')')}
 else if(b==='tundra'){ell(g,0,0,12*u,4*u,'rgba(0,0,0,.25)');[[-6,24],[0,32],[6,22]].forEach(function(c){g.fillStyle='rgba(190,225,240,.9)';g.beginPath();g.moveTo(c[0]*u-3*u,0);g.lineTo(c[0]*u,-c[1]*u);g.lineTo(c[0]*u+3*u,0);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(c[0]*u-1.5*u,0);g.lineTo(c[0]*u,-c[1]*u);g.lineTo(c[0]*u,0);g.fill()});var sp=.5+.5*Math.sin(t*3);ell(g,0,-32*u,2.2*u*sp+1,2.2*u*sp+1,'rgba(255,255,255,.8)')}
 else if(b==='marsh'){ell(g,0,0,12*u,4*u,'rgba(60,110,130,.5)');g.fillStyle='#5a4028';g.fillRect(-1*u,-26*u,2*u,26*u);g.fillRect(-1*u,-26*u,9*u,1.6*u);g.strokeStyle='#3a2a1a';g.lineWidth=.8*u;g.beginPath();g.moveTo(7*u,-24.5*u);g.lineTo(7*u,-20*u);g.stroke();g.fillStyle='#3a3a40';g.fillRect(4.5*u,-20*u,5*u,6*u);var fl=.6+.4*Math.sin(t*6);ell(g,7*u,-17*u,5*u,5*u,'rgba(255,210,120,'+(.25*fl)+')');ell(g,7*u,-17*u,1.6*u,2*u,'rgba(255,220,140,'+fl+')')}
 else if(b==='highland'){ell(g,0,0,10*u,4*u,'rgba(0,0,0,.25)');for(var i=0;i<4;i++){var w=(9-i*2)*u;g.fillStyle=i%2?'#8d877c':'#a9a294';g.fillRect(-w/2,-(i+1)*6*u,w,6*u)}flag(g,0,-24*u,12*u,ac,t,u)}
 g.restore()}

/* buildings and props. (x,y)=hex centre. */
function building(g,kind,x,y,o){var u=S/34,ac=o.accent||'#b5532f',t=o.t||0;g.save();g.translate(x,y+S*.5);ell(g,0,0,26*u,7*u,'rgba(0,0,0,.28)');
 function wall(x0,w,h,col){wallG(g,x0,0,w,h,col)}
 function roof(x0,w,h,top,col){tri(g,x0-3*u,top,x0+w/2,top-h,x0+w+3*u,top,col);tri(g,x0+w/2,top-h,x0+w+3*u,top,x0+w/2+1,top,'rgba(0,0,0,.28)')}
 if(kind==='hall'){wall(-24*u,48*u,24*u,'#d9cfb6');g.fillStyle='#c9bf9f';g.fillRect(-27*u,-3*u,54*u,3*u);g.fillRect(-26*u,-27*u,52*u,3*u);
  for(var i=0;i<5;i++){g.fillStyle=mix('#eadfc4','#000',.0+(i%2)*.1);g.fillRect(-21*u+i*10.5*u,-24*u,4*u,21*u)}
  tri(g,-28*u,-27*u,0,-47*u,28*u,-27*u,'#d7b56a');tri(g,0,-47*u,28*u,-27*u,2*u,-27*u,'rgba(60,40,0,.3)');ell(g,0,-33*u,4*u,4*u,ac);
  g.fillStyle=o.lit?'#f3d78a':'#2a1d0a';g.beginPath();g.moveTo(-5*u,-3*u);g.lineTo(-5*u,-15*u);g.quadraticCurveTo(0,-21*u,5*u,-15*u);g.lineTo(5*u,-3*u);g.fill();if(o.lit){var lg=g.createRadialGradient(0,-10*u,1,0,-10*u,22*u);lg.addColorStop(0,'rgba(243,215,138,.5)');lg.addColorStop(1,'rgba(243,215,138,0)');g.fillStyle=lg;g.fillRect(-26*u,-34*u,52*u,40*u)}}
 else if(kind==='guild'){wall(-22*u,44*u,22*u,'#e2d3b0');g.fillStyle='#4a3220';g.fillRect(-22*u,-22*u,44*u,2.4*u);g.fillRect(-1*u,-22*u,2.4*u,22*u);g.fillRect(-22*u,-11*u,44*u,2*u);roof(-22*u,44*u,22*u,-22*u,ac);g.fillStyle='#2a1d0a';g.fillRect(-14*u,-13*u,7*u,13*u);ell(g,10*u,-14*u,3.6*u,4.4*u,'#f3d78a');g.fillStyle='#6a4a22';g.fillRect(24*u,-26*u,2*u,24*u);g.fillRect(18*u,-26*u,9*u,7*u);g.fillStyle='#d7b56a';g.fillRect(19*u,-25*u,7*u,5*u)}
 else if(kind==='smithy'){wall(-22*u,44*u,18*u,'#b9a98a');roof(-24*u,48*u,16*u,-18*u,'#5a4a3e');g.fillStyle='#6a625a';g.fillRect(10*u,-44*u,8*u,24*u);var fl=.7+.3*Math.sin(t*9);ell(g,-6*u,-8*u,9*u,7*u,'rgba(255,150,40,'+(.45*fl)+')');g.fillStyle='#2a1d0a';g.fillRect(-12*u,-14*u,12*u,14*u);ell(g,-6*u,-6*u,4*u,3*u,'rgba(255,170,60,'+fl+')');ell(g,14*u,-47*u,5*u,3*u,'rgba(200,200,200,'+(.3+.15*Math.sin(t*2))+')');g.fillStyle='#3a3a40';g.fillRect(12*u,-6*u,10*u,4*u);g.fillRect(14*u,-3*u,6*u,3*u)}
 else if(kind==='vault'){var vg=g.createLinearGradient(-24*u,0,24*u,0);vg.addColorStop(0,'#8aa0b4');vg.addColorStop(1,'#46586a');g.fillStyle=vg;g.beginPath();g.ellipse(0,-2*u,25*u,24*u,0,PI,0);g.fill();g.fillRect(-25*u,-4*u,50*u,6*u);g.fillStyle='#c8a86a';g.fillRect(-25*u,-6*u,50*u,2*u);ell(g,0,-12*u,10*u,10*u,'#d7b56a');ell(g,0,-12*u,8*u,8*u,'#b08a38');g.strokeStyle='#6b4a0e';g.lineWidth=1.5*u;for(var k=0;k<6;k++){var a=k*PI/3+t*0;g.beginPath();g.moveTo(0,-12*u);g.lineTo(Math.cos(a)*8*u,-12*u+Math.sin(a)*8*u);g.stroke()}ell(g,0,-12*u,2.6*u,2.6*u,'#f3e2b0')}
 else if(kind==='tower'){var tg=g.createLinearGradient(-12*u,0,12*u,0);tg.addColorStop(0,'#c9c2b0');tg.addColorStop(1,'#6a6a70');g.fillStyle=tg;g.beginPath();g.moveTo(-14*u,0);g.lineTo(-10*u,-58*u);g.lineTo(10*u,-58*u);g.lineTo(14*u,0);g.fill();tri(g,-14*u,-58*u,0,-84*u,14*u,-58*u,ac);tri(g,0,-84*u,14*u,-58*u,1*u,-58*u,'rgba(0,0,0,.3)');var sp=.8+.2*Math.sin(t*3);g.fillStyle='#f3e2b0';g.beginPath();for(var q=0;q<5;q++){var a2=q*2*PI/5-PI/2,a3=a2+PI/5;g.lineTo(Math.cos(a2)*5*u,-90*u+Math.sin(a2)*5*u);g.lineTo(Math.cos(a3)*2*u,-90*u+Math.sin(a3)*2*u)}g.fill();g.fillStyle='rgba(243,215,138,'+sp+')';g.fillRect(-3*u,-46*u,6*u,9*u);g.fillRect(-3*u,-26*u,6*u,9*u);g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-5*u,0);g.lineTo(-5*u,-9*u);g.quadraticCurveTo(0,-14*u,5*u,-9*u);g.lineTo(5*u,0);g.fill()}
 else if(kind==='great'){wall(-34*u,68*u,30*u,'#cfc4a8');for(var m=0;m<7;m++){g.fillStyle='#cfc4a8';g.fillRect(-34*u+m*10*u,-36*u,6*u,6*u)}[-34,26].forEach(function(tx){wall(tx*u,8*u,50*u,'#bfb598');for(var mm=0;mm<2;mm++){g.fillStyle='#bfb598';g.fillRect(tx*u+mm*5*u,-56*u,3*u,6*u)}});wall(-12*u,24*u,52*u,'#d6ccb0');tri(g,-14*u,-52*u,0,-70*u,14*u,-52*u,ac);g.fillStyle='#d7b56a';g.fillRect(-1*u,-86*u,2*u,18*u);var wv=Math.sin(t*4)*2*u;tri(g,1*u,-86*u,14*u+wv,-82*u,1*u,-77*u,'#c0392b');g.fillStyle=o.lit?'#f3d78a':'#2a1d0a';g.beginPath();g.moveTo(-7*u,0);g.lineTo(-7*u,-20*u);g.quadraticCurveTo(0,-28*u,7*u,-20*u);g.lineTo(7*u,0);g.fill()}
 else if(kind==='town'&&!FX.low&&o.biome&&townVariant(g,o.biome,u,ac,t)){}
 else if(kind==='town'){[[-16,-4,.9,'#e2d3b0'],[14,-2,.85,'#d9c9a4'],[0,8,1,'#eadfc4']].forEach(function(h,ii){var hxx=h[0]*u,hyy=h[1]*u,k=h[2];g.fillStyle=h[3];g.fillRect(hxx-9*u*k,hyy-12*u*k,18*u*k,12*u*k);tri(g,hxx-11*u*k,hyy-12*u*k,hxx,hyy-24*u*k,hxx+11*u*k,hyy-12*u*k,ii===2?ac:mix(ac,'#6a3a1a',.4));tri(g,hxx,hyy-24*u*k,hxx+11*u*k,hyy-12*u*k,hxx+1,hyy-12*u*k,'rgba(0,0,0,.28)');g.fillStyle='#2a1d0a';g.fillRect(hxx-2*u,hyy-6*u*k,4*u,6*u*k)});g.fillStyle='#6a4a22';g.fillRect(-1*u,-44*u,2*u,26*u);var w2=Math.sin(t*4)*1.5*u;tri(g,1*u,-44*u,12*u+w2,-40*u,1*u,-35*u,ac)}
 else if(kind==='castle'){g.scale(1.25,1.25);[-22,16].forEach(function(tx){wall(tx*u,10*u,34*u,'#c4baa0');tri(g,(tx-2)*u,-34*u,(tx+5)*u,-46*u,(tx+12)*u,-34*u,ac)});wall(-14*u,28*u,26*u,'#d6ccb0');for(var cc=0;cc<4;cc++){g.fillStyle='#d6ccb0';g.fillRect(-14*u+cc*8*u,-31*u,5*u,5*u)}tri(g,-8*u,-26*u,0,-58*u,8*u,-26*u,'#d7b56a');g.fillStyle='#6a4a22';g.fillRect(-.8*u,-72*u,1.6*u,16*u);var w3=Math.sin(t*4)*2*u;tri(g,1*u,-72*u,12*u+w3,-68*u,1*u,-63*u,'#c0392b');g.fillStyle='#2a1d0a';g.beginPath();g.moveTo(-4*u,0);g.lineTo(-4*u,-12*u);g.quadraticCurveTo(0,-17*u,4*u,-12*u);g.lineTo(4*u,0);g.fill()}
 else if(kind==='fountain'){ell(g,0,0,16*u,8*u,'#8a8a90');ell(g,0,-1*u,13*u,6*u,'#4f9ab8');g.fillStyle='#b9b9c0';g.fillRect(-2*u,-14*u,4*u,12*u);ell(g,0,-14*u,6*u,2.5*u,'#9a9aa2');g.strokeStyle='rgba(200,235,250,.8)';g.lineWidth=1.6*u;for(var s2=-1;s2<=1;s2+=2){g.beginPath();g.moveTo(0,-16*u);g.quadraticCurveTo(s2*7*u,-24*u+Math.sin(t*5)*u,s2*10*u,-6*u);g.stroke()}}
 else if(kind==='tree'&&!FX.low&&o.landmark){landmark(g,o.landmark,u,ac,t)}
 else if(kind==='tree'&&!FX.low&&o.v!=null&&o.v<.3){if(o.v<.2)bush(g,0,0,S*.9,o.snow?'#5a7a6a':'#4f7f45');else stone(g,0,0,S*.85,o.snow)}
 else if(kind==='tree'){tree(g,0,0,S*1.05,o.pine?'pine':'oak',o.snow)}
 else if(kind==='rock'){hill(g,0,2*u,24*u,12*u,COL.rock)}
 else if(kind==='banner'){g.fillStyle='#6a4a22';g.fillRect(-1*u,-30*u,2*u,30*u);var w4=Math.sin(t*3)*2*u;tri(g,1*u,-30*u,13*u+w4,-24*u,1*u,-16*u,ac)}
 else if(kind==='gate'){g.fillStyle='#8a7a5a';g.fillRect(-22*u,-24*u,6*u,24*u);g.fillRect(16*u,-24*u,6*u,24*u);g.fillStyle='#d7b56a';g.fillRect(-24*u,-27*u,48*u,4*u);g.fillStyle='rgba(243,215,138,.28)';g.fillRect(-16*u,-24*u,32*u,24*u)}
 else if(kind==='cache'){var b=1+.12*Math.sin(t*3);g.fillStyle='#6a4a22';g.fillRect(-8*u,-10*u,16*u,10*u);g.fillStyle='#8a6528';g.fillRect(-8*u,-10*u,16*u,3*u);g.fillStyle='#d7b56a';g.fillRect(-1.5*u,-8*u,3*u,4*u);ell(g,0,-16*u*b,3*u,3*u,'rgba(243,226,176,.8)')}
 else if(kind==='chest'){var op=o.open;g.fillStyle='#6a4a22';g.fillRect(-12*u,-12*u,24*u,12*u);g.fillStyle='#8a6528';g.fillRect(-12*u,-12*u,24*u,3*u);g.fillStyle='#d7b56a';g.fillRect(-12*u,-6*u,24*u,2*u);if(op){g.fillStyle='#8a6528';g.beginPath();g.moveTo(-12*u,-12*u);g.lineTo(-10*u,-24*u);g.lineTo(10*u,-24*u);g.lineTo(12*u,-12*u);g.fill();ell(g,0,-13*u,9*u,3*u,'#f3e2b0')}else{g.fillStyle='#7a5628';g.beginPath();g.moveTo(-12*u,-12*u);g.quadraticCurveTo(0,-26*u,12*u,-12*u);g.fill();g.fillStyle='#d7b56a';g.fillRect(-2*u,-14*u,4*u,6*u);if(o.glow){var gl=.5+.5*Math.sin(t*4);var cg=g.createRadialGradient(0,-12*u,1,0,-12*u,26*u);cg.addColorStop(0,'rgba(255,230,140,'+(.45*gl)+')');cg.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=cg;g.fillRect(-28*u,-38*u,56*u,52*u)}}if(o.locked){g.fillStyle='#2a1d0a';g.fillRect(-3*u,-10*u,6*u,6*u)}}
 g.restore()}
window.Art={S:S,SQ3:SQ3,hash:hash,vnoise:vnoise,hx:hx,hy:hy,neigh:neigh,hdist:hdist,px2hex:px2hex,hline:hline,hexPath:hexPath,paintScene:paintScene,portrait:portrait,figure:figure,building:building,COL:COL,ell:ell,mix:mix};
})();
