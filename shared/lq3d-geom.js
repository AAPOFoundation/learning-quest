/* Procedural low-poly camp for the Expedition tab.
   Y-up, right-handed. Character front, tent door and chest lip face local -Z.
   Yaw matches Three.js: ry > 0 turns counter-clockwise from above,
   and a mesh faces direction d with ry = atan2(-d.x, -d.z).
   The emissive float is a material id: 0 diffuse, 0.35 water, 0.55 metal,
   0.9 steady unlit, 1 flickering unlit.
   No image files. Flat faces, one normal per triangle. */
(function(root){
'use strict';
var TAU=Math.PI*2;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function hex(h){h=String(h).replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function norm(v){var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]}
function frameY(dir){var y=norm(dir), hint=Math.abs(y[1])>0.85?[1,0,0]:[0,1,0], x=norm(cross(hint,y)), z=cross(x,y);return {x:x,y:y,z:z}}
function yawToward(x,z,tx,tz){return Math.atan2(-(tx-x), -(tz-z))}

function Builder(){this.p=[];this.n=[];this.c=[];this.e=[];this.idx=[]}
Builder.prototype._tri=function(a,b,c,col,em){
 var ax=b[0]-a[0], ay=b[1]-a[1], az=b[2]-a[2];
 var bx=c[0]-a[0], by=c[1]-a[1], bz=c[2]-a[2];
 var nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx, len=Math.sqrt(nx*nx+ny*ny+nz*nz);
 if(len<1e-10)return; nx/=len;ny/=len;nz/=len;
 var ev=em||0, lift=1;
 if(!ev){lift=ny<0?1+ny*0.34:1+ny*0.14}
 var cr=clamp(col[0]*lift,0,1), cg=clamp(col[1]*lift,0,1), cb=clamp(col[2]*lift,0,1);
 var base=this.p.length/3, pts=[a,b,c], i;
 for(i=0;i<3;i++){this.p.push(pts[i][0],pts[i][1],pts[i][2]);this.n.push(nx,ny,nz);this.c.push(cr,cg,cb);this.e.push(ev)}
 this.idx.push(base, base+1, base+2);
};
/* Each triangle keeps its own normal, so a bent cloth quad still flat-shades. */
Builder.prototype.poly=function(pts,col,em){
 var k; if(!pts||pts.length<3)return;
 for(k=1;k<pts.length-1;k++)this._tri(pts[0],pts[k],pts[k+1],col,em);
};
Builder.prototype.polyOut=function(pts,center,col,em){
 var ax=pts[1][0]-pts[0][0], ay=pts[1][1]-pts[0][1], az=pts[1][2]-pts[0][2];
 var bx=pts[2][0]-pts[0][0], by=pts[2][1]-pts[0][1], bz=pts[2][2]-pts[0][2];
 var nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx;
 var vx=pts[0][0]-center[0], vy=pts[0][1]-center[1], vz=pts[0][2]-center[2];
 if(nx*vx+ny*vy+nz*vz<0){var q=[],i;for(i=pts.length-1;i>=0;i--)q.push(pts[i]);pts=q}
 this.poly(pts,col,em);
};
/* Corner order matches an axis-aligned box whose outward faces are CCW from outside. */
Builder.prototype.axesBox=function(c,ax,ay,az,sx,sy,sz,col,em){
 function p(ix,iy,iz){return [
  c[0]+ix*sx*0.5*ax[0]+iy*sy*0.5*ay[0]+iz*sz*0.5*az[0],
  c[1]+ix*sx*0.5*ax[1]+iy*sy*0.5*ay[1]+iz*sz*0.5*az[1],
  c[2]+ix*sx*0.5*ax[2]+iy*sy*0.5*ay[2]+iz*sz*0.5*az[2]]}
 var s=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], v=[], i;
 for(i=0;i<8;i++)v.push(p(s[i][0],s[i][1],s[i][2]));
 this.poly([v[0],v[3],v[2],v[1]],col,em);
 this.poly([v[4],v[5],v[6],v[7]],col,em);
 this.poly([v[3],v[7],v[6],v[2]],col,em);
 this.poly([v[0],v[1],v[5],v[4]],col,em);
 this.poly([v[1],v[2],v[6],v[5]],col,em);
 this.poly([v[4],v[7],v[3],v[0]],col,em);
};
Builder.prototype.box=function(cx,cy,cz,sx,sy,sz,col,em){this.axesBox([cx,cy,cz],[1,0,0],[0,1,0],[0,0,1],sx,sy,sz,col,em)};

function pack(b){
 if(b.p.length/3>65535)throw new Error('mesh too large');
 return {positions:new Float32Array(b.p),normals:new Float32Array(b.n),colors:new Float32Array(b.c),emissive:new Float32Array(b.e),indices:new Uint16Array(b.idx)};
}
function cyl(b,cx,cy,cz,r,h,seg,col,em){
 var y0=cy-h/2, y1=cy+h/2, i, a0, a1, c0, s0, c1, s1;
 seg=seg||8;
 for(i=0;i<seg;i++){
  a0=i/seg*TAU; a1=(i+1)/seg*TAU; c0=Math.cos(a0); s0=Math.sin(a0); c1=Math.cos(a1); s1=Math.sin(a1);
  b.polyOut([[cx+c0*r,y0,cz+s0*r],[cx+c0*r,y1,cz+s0*r],[cx+c1*r,y1,cz+s1*r],[cx+c1*r,y0,cz+s1*r]],[cx,cy,cz],col,em);
  b.polyOut([[cx,y1,cz],[cx+c0*r,y1,cz+s0*r],[cx+c1*r,y1,cz+s1*r]],[cx,y1-4,cz],col,em);
  b.polyOut([[cx,y0,cz],[cx+c1*r,y0,cz+s1*r],[cx+c0*r,y0,cz+s0*r]],[cx,y0+4,cz],col,em);
 }
}
function sphere(b,cx,cy,cz,r,seg,ring,col,em){
 var grid=[], j, i, v, rr, y, row, u, n;
 seg=seg||8; ring=ring||5;
 for(j=0;j<=ring;j++){
  v=j/ring*Math.PI; rr=Math.sin(v)*r; y=Math.cos(v)*r; row=[]; n=(j===0||j===ring)?1:seg;
  for(i=0;i<n;i++){u=i/seg*TAU; row.push([cx+Math.cos(u)*(j===0||j===ring?0:rr), cy+y, cz+Math.sin(u)*(j===0||j===ring?0:rr)])}
  grid.push(row);
 }
 for(j=0;j<ring;j++)for(i=0;i<seg;i++){
  var i1=(i+1)%seg;
  var a=grid[j][j===0?0:i], c=grid[j][j===0?0:i1];
  var d=grid[j+1][j+1===ring?0:i1], e=grid[j+1][j+1===ring?0:i];
  if(j===0)b.polyOut([a,e,d],[cx,cy,cz],col,em);
  else if(j+1===ring)b.polyOut([a,e,c],[cx,cy,cz],col,em);
  else b.polyOut([a,e,d,c],[cx,cy,cz],col,em);
 }
}
function hemi(b,cx,cy,cz,r,seg,col){
 var top=[cx,cy+r,cz], rows=[], j, i, i1, v, rr, y, row, u;
 for(j=1;j<=3;j++){
  v=j/3*(Math.PI*0.52); rr=Math.sin(v)*r; y=Math.cos(v)*r; row=[];
  for(i=0;i<seg;i++){u=i/seg*TAU; row.push([cx+Math.cos(u)*rr, cy+y, cz+Math.sin(u)*rr])}
  rows.push(row);
 }
 for(i=0;i<seg;i++){i1=(i+1)%seg; b.polyOut([top, rows[0][i], rows[0][i1]],[cx,cy,cz],col,0)}
 for(j=0;j<rows.length-1;j++)for(i=0;i<seg;i++){i1=(i+1)%seg; b.polyOut([rows[j][i], rows[j+1][i], rows[j+1][i1], rows[j][i1]],[cx,cy,cz],col,0)}
}
function cone(b,cx,cy,cz,r,h,seg,col,em){
 var tip=[cx,cy+h,cz], base=[], i, i1, a;
 for(i=0;i<seg;i++){a=i/seg*TAU; base.push([cx+Math.cos(a)*r, cy, cz+Math.sin(a)*r])}
 for(i=0;i<seg;i++){i1=(i+1)%seg;
  b.polyOut([base[i], tip, base[i1]],[cx,cy+h*0.25,cz],col,em);
  b.polyOut([[cx,cy,cz], base[i1], base[i]],[cx,cy+4,cz],col,em);
 }
}
function limb(b,a,c,rad,col){
 var d=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], len=Math.sqrt(d[0]*d[0]+d[1]*d[1]+d[2]*d[2])||0.001;
 var mid=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2], fr=frameY(d);
 b.axesBox(mid, fr.x, fr.y, fr.z, rad*2, len, rad*2, col, 0);
 sphere(b, c[0], c[1], c[2], rad*1.2, 6, 4, col, 0);
}
function ring(y,w,d){return [[-w,y,-d],[w,y,-d],[w,y,d],[-w,y,d]]}
function linkRings(b,a,c,inside,col){
 var i, j;
 for(i=0;i<4;i++){j=(i+1)%4; b.polyOut([a[i],a[j],c[j],c[i]], inside, col, 0)}
}
function hood(b,col){
 /* Pointed cowl: brim over the eyes, cloth on the shoulders, drape down the back. */
 cyl(b, 0, 1.62, 0.02, 0.3, 0.045, 8, col, 0);
 b.box(0, 1.66, -0.16, 0.4, 0.04, 0.24, col, 0);
 b.polyOut([[-0.1,1.68,0.02],[0.1,1.68,0.02],[0,1.9,0.05]],[0,1.3,-1],col,0);
 b.polyOut([[0,1.9,0.05],[0.1,1.68,0.02],[-0.1,1.68,0.02]],[0,1.3,1],col,0);
 b.box(-0.2, 1.2, 0.02, 0.08, 0.38, 0.14, col, 0);
 b.box(0.2, 1.2, 0.02, 0.08, 0.38, 0.14, col, 0);
 b.polyOut([[-0.24,1.5,0.1],[0.24,1.5,0.1],[0.3,0.48,0.32],[-0.3,0.48,0.32]],[0,1,-0.6],col,0);
}

function arm(b, shoulder, elbow, hand, rad, col){
 limb(b, shoulder, elbow, rad, col);
 limb(b, elbow, hand, rad*0.86, col);
}
function shaft(b, a, c, rad, col, em){
 var d=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], len=Math.sqrt(d[0]*d[0]+d[1]*d[1]+d[2]*d[2])||0.001;
 var mid=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2], fr=frameY(d);
 b.axesBox(mid, fr.x, fr.y, fr.z, rad*2, len, rad*2, col, em||0);
}
function person(o){
 var b=new Builder();
 o=o||{};
 var skin=hex(o.skin||'#e2b48c'), hair=hex(o.hair||'#3b2a1d'), robe=hex(o.robe||'#274a7a'), trim=hex(o.trim||'#d7b56a');
 var boot=hex('#3a2a22'), trouser=hex('#2a3138'), hs=o.head||1, hr=0.26*hs, hy=1.42;
 var top=ring(1.08, 0.34, 0.18), waist=ring(0.74, 0.19, 0.13), hem=ring(0.40, 0.36, 0.22);
 var eyeY=hy+0.03, eyeZ=-0.33, brow=hex('#241812');
 linkRings(b, top, waist, [0,0.9,0], robe);
 linkRings(b, waist, hem, [0,0.55,0], robe);
 b.polyOut([hem[0],hem[3],hem[2],hem[1]], [0,2,0], mix(robe,[0,0,0],0.15), 0);
 b.box(0, 1.00, -0.18, 0.24, 0.042, 0.04, trim, 0.55);
 b.box(0, 0.68, -0.15, 0.30, 0.038, 0.035, trim, 0.55);
 cyl(b, 0, 1.22, 0, 0.065, 0.12, 6, skin, 0);
 sphere(b, 0, hy, 0, hr, 8, 6, skin, 0);
 if(o.hat!=='cap')hemi(b, 0, hy+0.05, 0.04, hr+0.02, 8, hair);
 sphere(b, 0.09, eyeY, eyeZ, 0.058, 6, 4, hex('#f7f1e6'), 0);
 sphere(b, -0.09, eyeY, eyeZ, 0.058, 6, 4, hex('#f7f1e6'), 0);
 sphere(b, 0.09, eyeY, eyeZ-0.04, 0.028, 5, 3, brow, 0);
 sphere(b, -0.09, eyeY, eyeZ-0.04, 0.028, 5, 3, brow, 0);
 sphere(b, 0.105, eyeY+0.02, eyeZ-0.055, 0.012, 4, 2, hex('#fff6d8'), 0.9);
 sphere(b, -0.075, eyeY+0.02, eyeZ-0.055, 0.012, 4, 2, hex('#fff6d8'), 0.9);
 b.box(0.09, eyeY+0.075, eyeZ+0.01, 0.07, 0.016, 0.018, brow, 0);
 b.box(-0.09, eyeY+0.075, eyeZ+0.01, 0.07, 0.016, 0.018, brow, 0);
 sphere(b, 0, hy-0.04, eyeZ+0.02, 0.032, 5, 3, skin, 0);
 b.box(0, hy-0.09, eyeZ+0.015, 0.08, 0.016, 0.018, hex('#c47a74'), 0);
 if(o.hat==='cap'){
  cyl(b, 0, hy+hr*0.78, 0.02, hr*1.12, 0.16, 8, robe, 0);
  b.box(0, hy+hr*0.5, -hr*0.5, hr*2.2, 0.028, hr*1.1, trim, 0.55);
  b.box(0, hy+0.04, -hr*0.9, hr*1.15, 0.045, 0.035, hair, 0);
 }else if(o.hat!=='none'){
  hood(b, mix(robe,[0.04,0.05,0.08],0.35));
 }
 if(o.cape){
  var cape=hex(o.cape);
  /* Flare past the robe (hem is x ±0.36) so a camera on -Z sees the cloth. Right side stays behind the stick. */
  card(b, [[-0.22,1.14,0.08],[-0.40,1.10,-0.04],[-0.58,0.34,-0.08],[-0.28,0.36,0.12]], cape);
  card(b, [[-0.36,1.08,-0.02],[-0.48,1.04,-0.12],[-0.66,0.32,-0.10],[-0.52,0.34,-0.02]], cape);
  card(b, [[0.22,1.14,0.10],[0.28,0.36,0.14],[0.52,0.34,0.02],[0.38,1.08,0.04]], cape);
  card(b, [[0.34,1.06,0.08],[0.48,0.34,0.04],[0.62,0.32,0.00],[0.46,1.02,0.02]], cape);
  card(b, [[-0.26,1.12,0.16],[0.26,1.12,0.16],[0.32,0.40,0.32],[-0.32,0.40,0.32]], cape);
  b.box(0, 1.15, -0.20, 0.07, 0.045, 0.03, trim, 0.55);
 }
 b.box(-0.11, 0.06, -0.03, 0.15, 0.12, 0.26, boot, 0);
 b.box(0.12, 0.06, -0.03, 0.15, 0.12, 0.26, boot, 0);
 limb(b, [-0.10,0.46,0.02], [-0.12,0.26,-0.05], 0.068, trouser);
 limb(b, [-0.12,0.26,-0.05], [-0.11,0.13,0.0], 0.055, trouser);
 limb(b, [0.10,0.46,0.02], [0.13,0.26,-0.05], 0.068, trouser);
 limb(b, [0.13,0.26,-0.05], [0.12,0.13,0.0], 0.055, trouser);
 if(o.stick){
  arm(b, [-0.30,1.02,0], [-0.40,0.66,-0.08], [-0.32,0.42,-0.16], 0.05, skin);
  arm(b, [0.28,1.02,-0.02], [0.42,0.74,-0.12], [0.48,0.52,-0.18], 0.05, skin);
  shaft(b, [0.52,0.08,-0.22], [0.46,0.96,-0.08], 0.022, hex('#6b4428'), 0);
  sphere(b, 0.45, 1.00, -0.06, 0.048, 6, 4, trim, 0.55);
 }else{
  arm(b, [-0.28,1.02,0], [-0.16,0.84,-0.10], [-0.08,0.74,-0.22], 0.048, skin);
  arm(b, [0.28,1.02,-0.02], [0.16,0.84,-0.10], [0.08,0.74,-0.22], 0.048, skin);
  b.box(0, 0.74, -0.32, 0.22, 0.15, 0.04, hex('#27406a'), 0);
  b.box(0, 0.74, -0.345, 0.18, 0.12, 0.012, hex('#f4ead8'), 0);
  b.box(0, 0.74, -0.352, 0.04, 0.16, 0.012, trim, 0.55);
 }
 if(o.pack!==false){
  b.box(0, 0.78, 0.30, 0.24, 0.26, 0.12, hex('#6b4428'), 0);
  b.box(0, 0.93, 0.31, 0.18, 0.05, 0.13, hex('#5a3824'), 0);
  b.box(0.02, 0.78, 0.37, 0.07, 0.08, 0.02, trim, 0.55);
  shaft(b, [-0.12,1.02,0.06], [-0.08,0.70,0.32], 0.012, hex('#4a3424'), 0);
 }
 return pack(b);
}

function tentMesh(){
 var b=new Builder(), cloth=hex('#f4ead4'), shade=hex('#e4d2ae'), dark=hex('#3d2c22'), pole=hex('#6b4428'), rope=hex('#8a7a64');
 var peak=[0,1.36,0];
 var fl=[-1.02,0.02,-0.92], fr=[1.02,0.02,-0.92], bl=[-1.02,0.02,0.96], br=[1.02,0.02,0.96];
 b.polyOut([[-0.92,0.03,-0.78],[0.92,0.03,-0.78],[0.92,0.03,0.82],[-0.92,0.03,0.82]],[0,-3,0],hex('#6a5038'),0);
 b.polyOut([peak, bl, br],[0,0.5,-1.2],cloth,0);
 b.polyOut([peak, bl, fl],[0,0.5,0],shade,0);
 b.polyOut([peak, fr, br],[0,0.5,0],shade,0);
 b.polyOut([peak, fl, [-0.18,0.02,-1.02]],[0,0.45,1.2],shade,0);
 b.polyOut([peak, [0.18,0.02,-1.02], fr],[0,0.45,1.2],cloth,0);
 b.polyOut([[-0.42,0.78,0.18],[0.42,0.78,0.18],[0.5,0.08,0.42],[-0.5,0.08,0.42]],[0,0.45,-1.4],dark,0);
 cyl(b,-0.55,0.48,0,0.028,0.9,5,pole,0);
 cyl(b,0.55,0.48,0,0.028,0.9,5,pole,0);
 cyl(b,-0.78,0.34,-0.7,0.085,0.62,6,cloth,0);
 b.box(-0.78,0.46,-0.7,0.19,0.028,0.19,rope,0);
 b.box(-0.78,0.2,-0.7,0.19,0.028,0.19,rope,0);
 function guy(a,c){
  var mid=[(a[0]+c[0])*0.5, 0.1, (a[2]+c[2])*0.5];
  shaft(b, a, mid, 0.02, rope, 0);
  shaft(b, mid, c, 0.02, rope, 0);
  var peg=frameY([c[0]-a[0], 0.35, c[2]-a[2]]);
  b.axesBox([c[0], 0.07, c[2]], peg.x, peg.y, peg.z, 0.045, 0.16, 0.045, pole, 0);
 }
 guy([-0.7,0.52,-0.62], [-0.98,0.08,-0.92]);
 guy([0.7,0.52,-0.62], [0.98,0.08,-0.92]);
 guy([-0.7,0.52,0.7], [-0.98,0.08,1.02]);
 guy([0.7,0.52,0.7], [0.98,0.08,1.02]);
 return pack(b);
}
function chestMesh(){
 var b=new Builder(), wood=hex('#7a4e2e'), dark=hex('#4e301c'), gold=hex('#d7b56a');
 b.box(0,0.16,0,0.52,0.28,0.34,wood,0);
 b.box(0,0.22,0,0.54,0.04,0.36,gold,0.55);
 b.box(0,0.1,0,0.54,0.035,0.36,gold,0.55);
 var hingeL=[-0.26,0.33,0.16], hingeR=[0.26,0.33,0.16], lipL=[-0.26,0.52,-0.16], lipR=[0.26,0.52,-0.16];
 b.polyOut([hingeL, hingeR, lipR, lipL],[0,-1,0],wood,0);
 b.polyOut([hingeL, lipL, lipR, hingeR],[0,1.4,0],dark,0);
 b.polyOut([hingeL, lipL, [-0.26,0.3,0.16]],[ -0.5,0.4,0],wood,0);
 b.polyOut([hingeR, [0.26,0.3,0.16], lipR],[0.5,0.4,0],wood,0);
 b.box(0,0.24,-0.19,0.07,0.09,0.035,gold,0.55);
 return pack(b);
}
function fireMesh(){
 var b=new Builder(), i, a, fr, sy;
 for(i=0;i<7;i++){
  a=i/7*TAU; sy=0.09+(i%3)*0.015;
  fr=frameY([Math.cos(a)*0.2, 1, Math.sin(a)*0.2]);
  b.axesBox([Math.cos(a)*0.38, sy*0.5+0.04, Math.sin(a)*0.38], fr.x, fr.y, fr.z, 0.16+(i%2)*0.04, sy, 0.13, i%2?hex('#6a645c'):hex('#4a4640'), 0);
 }
 fr=frameY([1,0.04,0.22]); b.axesBox([0,0.08,0], fr.x, fr.y, fr.z, 0.07, 0.56, 0.07, hex('#5c3a28'), 0);
 fr=frameY([-0.28,0.05,1]); b.axesBox([0,0.1,0], fr.x, fr.y, fr.z, 0.06, 0.46, 0.06, hex('#6b4428'), 0);
 return pack(b);
}
function flameMesh(h,col){var b=new Builder(); cone(b,0,0,0,h*0.32,h,6,col,1); return pack(b)}
function lanternMesh(){
 var b=new Builder(), brass=hex('#c8a86a'), dark=hex('#4a4036');
 cyl(b,0,0.52,0,0.032,1.0,6,dark,0);
 b.box(-0.09,1.16,0,0.022,0.22,0.022,brass,0.55);
 b.box(0.09,1.16,0,0.022,0.22,0.022,brass,0.55);
 b.box(0,1.16,-0.09,0.022,0.22,0.022,brass,0.55);
 b.box(0,1.16,0.09,0.022,0.22,0.022,brass,0.55);
 b.box(0,1.16,0,0.07,0.12,0.07,hex('#ffc56a'),1);
 b.box(0,1.29,0,0.2,0.04,0.2,brass,0.55);
 b.box(0,1.04,0,0.18,0.028,0.18,hex('#8a6528'),0.55);
 return pack(b);
}
function shadowMesh(r){
 var b=new Builder(), col=[0.30,0.34,0.22], seg=14, i, a0, a1;
 var dx=-0.46, dz=-0.24, len=Math.sqrt(dx*dx+dz*dz)||1, px, pz, longR=r*1.25, shortR=r*0.82;
 dx/=len; dz/=len; px=-dz; pz=dx;
 function pt(ang){
  var c=Math.cos(ang), s=Math.sin(ang);
  return [c*longR*dx+s*shortR*px, 0.06, c*longR*dz+s*shortR*pz];
 }
 for(i=0;i<seg;i++){a0=i/seg*TAU; a1=(i+1)/seg*TAU;
  b.polyOut([[0,0.06,0], pt(a0), pt(a1)],[0,-4,0],col,0);
 }
 return pack(b);
}
function groundMesh(P){
 var b=new Builder(), g1=hex(P.g), g2=hex(P.g2), dirt=hex(P.dirt), seg=22, rings=5, R=5.3;
 var grid=[], j, i, i1, row, rad, a, x, z, y, path, col;
 for(j=0;j<=rings;j++){
  row=[]; rad=R*(j/rings);
  for(i=0;i<seg;i++){
   a=i/seg*TAU; x=Math.cos(a)*rad; z=Math.sin(a)*rad; y=0.025+Math.sin(a*3+j*0.7)*0.012;
   if(j===0){x=0;z=0;y=0.03}
   path=z<-0.25 && Math.abs(x)<1.2 && j>0 && j<4;
   var patch=0.5+0.5*Math.sin(i*0.85+j*0.55)+0.15*Math.sin(i*1.7-j);
   col=path?dirt:mix(g2,g1,clamp(0.35+patch*0.28,0,1));
   row.push({p:[x,y,z],c:col});
  }
  grid.push(row);
 }
 for(j=0;j<rings;j++)for(i=0;i<seg;i++){
  i1=(i+1)%seg;
  var A=grid[j][i], C=grid[j][i1], D=grid[j+1][i1], E=grid[j+1][i];
  if(j===0)b.polyOut([A.p, E.p, D.p],[0,-5,0],E.c,0);
  else b.polyOut([A.p, E.p, D.p, C.p],[0,-5,0],A.c,0);
 }
 var skirt=mix(g2,[0.04,0.05,0.06],0.55);
 for(i=0;i<seg;i++){
  i1=(i+1)%seg; var p0=grid[rings][i].p, p1=grid[rings][i1].p;
  b.polyOut([p0, p1, [p1[0],-0.42,p1[2]], [p0[0],-0.42,p0[2]]],[0,0.2,0],skirt,0);
 }
 return pack(b);
}
function pineMesh(snow){
 var b=new Builder(), trunk=hex('#5c4030'), bark=hex('#4a3424');
 var a=snow?hex('#b7ccc8'):hex('#1e5a32'), c=snow?hex('#e4eef0'):hex('#347a40'), d=snow?hex('#f5f8f8'):hex('#256838');
 shaft(b, [0,0.02,0], [0.06,0.48,0.02], 0.065, trunk, 0);
 shaft(b, [0.06,0.48,0.02], [0.12,0.84,-0.02], 0.04, bark, 0);
 shaft(b, [0.1,0.62,0.02], [0.72,0.46,0.2], 0.026, bark, 0);
 cone(b,0.04,0.36,0,0.62,0.7,7,a,0);
 cone(b,0.06,0.72,0,0.46,0.58,7,c,0);
 cone(b,0.08,1.05,0,0.26,0.48,6,d,0);
 return pack(b);
}
function roundTreeMesh(leaf,leaf2,trunk){
 var b=new Builder();
 shaft(b, [0,0.02,0], [0,0.42,0], 0.08, trunk, 0);
 shaft(b, [0,0.36,0], [-0.55,0.68,0.16], 0.05, trunk, 0);
 shaft(b, [0,0.36,0], [0.52,0.64,-0.18], 0.044, mix(trunk,[0,0,0],0.16), 0);
 sphere(b,0.02,1.0,0,0.4,7,5,leaf,0);
 sphere(b,-0.22,0.88,0.1,0.26,6,4,leaf2,0);
 sphere(b,0.2,0.9,-0.1,0.24,6,4,mix(leaf,leaf2,0.45),0);
 sphere(b,0.04,1.22,0.02,0.18,5,4,mix(leaf,[1,1,1],0.1),0);
 return pack(b);
}
function bushMesh(col){var b=new Builder(); sphere(b,0,0.16,0,0.22,6,4,col,0); sphere(b,0.14,0.12,0.05,0.15,5,3,mix(col,[1,1,1],0.12),0); return pack(b)}
function rockMesh(col){
 var b=new Builder(), lumps=[
  [0,0.16,0, 0.12,1,0.08, 0.48,0.26,0.36, col],
  [0.14,0.24,0.05, 0.4,1,0.15, 0.26,0.16,0.22, mix(col,[1,1,1],0.1)],
  [-0.12,0.14,-0.05, -0.2,1,0.35, 0.22,0.16,0.22, mix(col,[0,0,0],0.12)],
  [0.02,0.30,-0.02, 0.15,1,-0.2, 0.16,0.12,0.14, mix(col,[1,1,1],0.16)]
 ], i, d, fr;
 for(i=0;i<lumps.length;i++){
  d=lumps[i]; fr=frameY([d[3],d[4],d[5]]);
  b.axesBox([d[0],d[1],d[2]], fr.x, fr.y, fr.z, d[6], d[7], d[8], d[9], 0);
 }
 return pack(b);
}
function palmMesh(){
 var b=new Builder(), col=hex('#8a5a32'), leaf=hex('#2f7a34'), k, a, dir, fr, i;
 var pts=[[0,0.02,0],[0.1,0.34,0.02],[0.22,0.66,-0.04],[0.12,0.98,0.04],[-0.04,1.24,0]];
 for(i=0;i<pts.length-1;i++)shaft(b, pts[i], pts[i+1], 0.058-i*0.008, i%2?hex('#6b4428'):col, 0);
 var top=pts[pts.length-1];
 for(k=0;k<6;k++){
  a=k/6*TAU; dir=[Math.cos(a)*0.95, -0.55, Math.sin(a)*0.95]; fr=frameY(dir);
  b.axesBox([top[0]+dir[0]*0.32, top[1]+dir[1]*0.32, top[2]+dir[2]*0.32], fr.x, fr.y, fr.z, 0.1, 0.72, 0.16, k%2?leaf:hex('#3e8a42'), 0);
 }
 return pack(b);
}
function cactusMesh(){
 var b=new Builder(), col=hex('#3d7a48'), arm=mix(col,[1,1,1],0.1);
 cyl(b,0,0.42,0,0.13,0.84,6,col,0);
 shaft(b, [0.1,0.4,0], [0.3,0.56,0.02], 0.046, arm, 0);
 shaft(b, [0.3,0.56,0.02], [0.34,0.88,0], 0.04, col, 0);
 shaft(b, [-0.1,0.34,0], [-0.28,0.48,-0.02], 0.042, col, 0);
 shaft(b, [-0.28,0.48,-0.02], [-0.3,0.74,0], 0.036, arm, 0);
 sphere(b, 0.02, 0.86, -0.1, 0.035, 5, 3, hex('#e07a8a'), 0);
 return pack(b);
}
function mushroomMesh(){var b=new Builder(); cyl(b,0,0.08,0,0.028,0.14,5,hex('#eadcc4'),0); cone(b,0,0.14,0,0.11,0.09,6,hex('#b5453a'),0); return pack(b)}
function cattailMesh(){var b=new Builder(); cyl(b,0,0.26,0,0.016,0.52,4,hex('#3a5a32'),0); cyl(b,0,0.54,0,0.032,0.14,5,hex('#6a4a32'),0); return pack(b)}
function stumpMesh(col){var b=new Builder(); cyl(b,0,0.12,0,0.16,0.24,6,col,0); cyl(b,0,0.25,0,0.18,0.05,6,hex('#c4a574'),0); return pack(b)}
function iceMesh(){var b=new Builder(); b.box(0,0.22,0,0.18,0.44,0.14,hex('#d7eef6'),0); b.box(0.1,0.36,0.04,0.1,0.32,0.1,hex('#f4fbff'),0); return pack(b)}
function cairnMesh(col){
 var b=new Builder(), i, d, fr, stone=mix(col,[0.25,0.22,0.2],0.35), lumps=[
  [0,0.09,0, 0.7,1,0.25, 0.42,0.14,0.28, stone],
  [0.05,0.22,0.03, -0.85,1,0.4, 0.28,0.13,0.2, mix(stone,[1,1,1],0.1)],
  [-0.03,0.34,-0.02, 0.45,1,-0.7, 0.16,0.11,0.14, mix(stone,[0,0,0],0.12)]
 ];
 for(i=0;i<lumps.length;i++){
  d=lumps[i]; fr=frameY([d[3],d[4],d[5]]);
  b.axesBox([d[0],d[1],d[2]], fr.x, fr.y, fr.z, d[6], d[7], d[8], d[9], 0);
 }
 return pack(b);
}
function flowerMesh(col){
 var b=new Builder(), i, a, dir, fr, leaf=hex('#2f6a32');
 cyl(b,0,0.07,0,0.012,0.14,4,leaf,0);
 for(i=0;i<5;i++){
  a=i/5*TAU; dir=[Math.cos(a), 0.35, Math.sin(a)]; fr=frameY(dir);
  b.axesBox([Math.cos(a)*0.045, 0.155, Math.sin(a)*0.045], fr.x, fr.y, fr.z, 0.026, 0.07, 0.038, col, 0);
 }
 sphere(b,0,0.16,0,0.018,5,3,hex('#f3e2b0'),0);
 return pack(b);
}
function card(b, pts, col){
 b.poly(pts, col, 0);
 b.poly([pts[0], pts[3], pts[2], pts[1]], col, 0);
}
function grassMesh(){
 var b=new Builder(), i, a, c, s, h, cols=[hex('#3f7a34'), hex('#67a048'), hex('#2c6230')];
 for(i=0;i<3;i++){
  a=i*Math.PI/3; c=Math.cos(a)*0.11; s=Math.sin(a)*0.11; h=0.22+i*0.04;
  card(b, [[-c,0,-s],[c,0,s],[c*0.4,h,s*0.4],[-c*0.4,h,-s*0.4]], cols[i]);
 }
 return pack(b);
}
function fernMesh(){
 var b=new Builder(), i, a, c, s, cols=[hex('#2f6a38'), hex('#3e8a42'), hex('#245c30'), hex('#4a7a3a')];
 for(i=0;i<4;i++){
  a=-0.6+i*0.4; c=Math.cos(a)*0.22; s=Math.sin(a)*0.1;
  card(b, [[0,0.02,0],[c,0.04,s],[c*0.85,0.2,s*0.5],[c*0.15,0.22,-0.02]], cols[i]);
 }
 return pack(b);
}
function waterMesh(r){
 var b=new Builder(), col=hex('#2a6e78'), rim=hex('#8fd0cc'), rip=hex('#d5f4f2'), seg=16, i, a0, a1, r0=r*0.78;
 for(i=0;i<seg;i++){
  a0=i/seg*TAU; a1=(i+1)/seg*TAU;
  b.polyOut([[0,0.045,0],[Math.cos(a0)*r0,0.048,Math.sin(a0)*r0],[Math.cos(a1)*r0,0.048,Math.sin(a1)*r0]],[0,-4,0],col,0.35);
  b.polyOut([[Math.cos(a0)*r0,0.048,Math.sin(a0)*r0],[Math.cos(a0)*r,0.055,Math.sin(a0)*r],[Math.cos(a1)*r,0.055,Math.sin(a1)*r],[Math.cos(a1)*r0,0.048,Math.sin(a1)*r0]],[0,-4,0],rim,0.35);
 }
 function arc(rad){
  var s, w=r*0.035, u0, u1;
  for(s=0;s<12;s++){
   if(s%4===0)continue;
   u0=s/12*TAU; u1=(s+1)/12*TAU;
   b.polyOut([[Math.cos(u0)*(rad-w),0.07,Math.sin(u0)*(rad-w)],[Math.cos(u0)*(rad+w),0.07,Math.sin(u0)*(rad+w)],[Math.cos(u1)*(rad+w),0.07,Math.sin(u1)*(rad+w)],[Math.cos(u1)*(rad-w),0.07,Math.sin(u1)*(rad-w)]],[0,-3,0],rip,0.35);
  }
 }
 arc(r*0.42); arc(r*0.62);
 return pack(b);
}
function lilyMesh(){
 var b=new Builder(), seg=8, i, a0, a1, leaf=hex('#3e8a42');
 for(i=0;i<seg;i++){a0=i/seg*TAU; a1=(i+1)/seg*TAU;
  b.polyOut([[0,0.06,0],[Math.cos(a0)*0.16,0.06,Math.sin(a0)*0.16],[Math.cos(a1)*0.16,0.06,Math.sin(a1)*0.16]],[0,-2,0],leaf,0)}
 sphere(b,0.03,0.08,0.02,0.035,5,3,hex('#f0b4c4'),0);
 return pack(b);
}
function bedMesh(){
 var b=new Builder(), cloth=hex('#7a3a3a'), band=hex('#d7b56a');
 sphere(b,-0.22,0.12,0,0.1,6,4,cloth,0);
 sphere(b,0.22,0.12,0,0.1,6,4,mix(cloth,[0,0,0],0.12),0);
 b.box(0,0.12,0,0.4,0.16,0.16,cloth,0);
 b.box(0,0.1,0,0.06,0.18,0.18,band,0.55);
 return pack(b);
}
function woodpileMesh(){
 var b=new Builder(), bark=hex('#5c4030'), cut=hex('#c4a574'), i, L, fr, logs=[
  [-0.1,0.07,0.02,0.4],[0.08,0.08,-0.05,-0.55],[0.0,0.15,0.04,0.15],[-0.04,0.21,0.0,0.85]
 ];
 for(i=0;i<logs.length;i++){
  L=logs[i]; fr=frameY([Math.cos(L[3]), 0.12, Math.sin(L[3])]);
  b.axesBox([L[0],L[1],L[2]], fr.x, fr.y, fr.z, 0.08, 0.44, 0.08, i%2?bark:hex('#6b4428'), 0);
 }
 b.box(0.2,0.09,0.02,0.04,0.09,0.09,cut,0);
 return pack(b);
}
function logMesh(){
 var b=new Builder(), bark=hex('#5c4030'), cut=hex('#c4a574'), fr=frameY([1,0.04,0]);
 b.axesBox([0,0.14,0], fr.x, fr.y, fr.z, 0.16, 0.86, 0.15, bark, 0);
 b.box(-0.43,0.14,0,0.04,0.13,0.13,cut,0);
 b.box(0.43,0.14,0,0.04,0.13,0.13,cut,0);
 return pack(b);
}
function blanketMesh(){
 var b=new Builder(), cloth=hex('#8a3d4a'), hem=hex('#d7b56a');
 card(b, [[-0.26,0.26,-0.02],[0.26,0.26,-0.02],[0.26,0.24,0.08],[-0.26,0.24,0.08]], cloth);
 card(b, [[-0.28,0.25,-0.02],[-0.30,0.06,-0.20],[0.30,0.06,-0.20],[0.28,0.25,-0.02]], cloth);
 card(b, [[-0.26,0.24,0.06],[0.26,0.24,0.06],[0.24,0.10,0.16],[-0.24,0.10,0.16]], mix(cloth,[0,0,0],0.16));
 b.box(0, 0.27, 0.01, 0.5, 0.018, 0.05, hem, 0.55);
 return pack(b);
}
function potMesh(){
 var b=new Builder(), iron=hex('#3a3532'), brass=hex('#d7b56a'), wood=hex('#5c3a28');
 var apex=[0,0.98,0], feet=[[0.26,0.08,0.14],[-0.26,0.08,0.14],[0.02,0.08,-0.28]], i;
 for(i=0;i<feet.length;i++)shaft(b, feet[i], apex, 0.016, wood, 0);
 cyl(b,0,0.8,0,0.13,0.12,8,iron,0);
 cyl(b,0,0.87,0,0.155,0.03,8,brass,0.55);
 b.box(0.16,0.84,0,0.08,0.02,0.02,iron,0);
 return pack(b);
}
function cupMesh(){
 var b=new Builder(), clay=hex('#c4785a'), rim=hex('#e8a882');
 cyl(b, 0, 0.07, 0, 0.055, 0.12, 6, clay, 0);
 cyl(b, 0, 0.135, 0, 0.072, 0.022, 6, rim, 0);
 shaft(b, [0.05, 0.08, 0], [0.12, 0.1, 0.02], 0.016, clay, 0);
 return pack(b);
}
function crateMesh(){
 var b=new Builder(), wood=hex('#8a5a32'), dark=hex('#5c3a22'), slat=hex('#6b4428');
 b.box(0,0.16,0,0.36,0.32,0.28,wood,0);
 b.box(0,0.33,0,0.38,0.045,0.3,dark,0);
 b.box(0,0.18,-0.16,0.3,0.045,0.03,dark,0);
 b.box(-0.11,0.16,-0.165,0.08,0.26,0.035,slat,0);
 b.box(0.11,0.16,-0.165,0.08,0.26,0.035,slat,0);
 return pack(b);
}
function pennantMesh(){
 var b=new Builder(), cloth=hex('#d7b56a'), fold=hex('#c4a05a'), pole=hex('#5c4030');
 cyl(b,0,0.62,0,0.03,1.2,5,pole,0);
 sphere(b,0,1.26,0,0.05,6,4,cloth,0.55);
 card(b, [[0.05,1.14,0],[0.05,0.64,0],[0.46,0.78,0.05],[0.40,1.04,0.03]], cloth);
 card(b, [[0.38,1.02,0.03],[0.44,0.76,0.05],[0.74,0.88,0.01],[0.66,1.00,-0.02]], fold);
 return pack(b);
}
function stoneMesh(){
 var b=new Builder(), rock=hex('#8a8178'), top=hex('#a39b92');
 b.box(0,0.05,0,0.36,0.07,0.26,rock,0);
 b.box(0.05,0.09,0.02,0.18,0.04,0.14,top,0);
 b.box(-0.08,0.08,-0.03,0.12,0.035,0.1,mix(rock,[0,0,0],0.12),0);
 return pack(b);
}
function pebbleMesh(){
 var b=new Builder(), col=hex('#a09078');
 b.box(-0.08,0.04,0.02,0.1,0.06,0.08,col,0);
 b.box(0.06,0.035,-0.04,0.08,0.05,0.07,mix(col,[1,1,1],0.12),0);
 b.box(0.01,0.03,0.08,0.06,0.04,0.05,mix(col,[0,0,0],0.1),0);
 return pack(b);
}
function snowMesh(){
 var b=new Builder();
 hemi(b,0,0.08,0,0.28,8,hex('#f4f7fb'));
 return pack(b);
}
function moundMesh(col){
 var b=new Builder();
 hemi(b,0,0.06,0,0.9,7,col);
 return pack(b);
}

var PAL={
 meadow:{g:'#5c8a3e',g2:'#3e6b32',dirt:'#8a6840',leaf:'#2f6a34',leaf2:'#6a9a3c',rock:'#7d7368',trunk:'#6b4428'},
 forest:{g:'#2c4a2c',g2:'#1e3824',dirt:'#5a4632',leaf:'#1d4a28',leaf2:'#2f6a38',rock:'#6a655e',trunk:'#4a3424'},
 hills:{g:'#6a8a48',g2:'#4e6a38',dirt:'#7a6244',leaf:'#3d6b34',leaf2:'#7aa04a',rock:'#8a8178',trunk:'#5c4030'},
 desert:{g:'#c4a36a',g2:'#d8bc82',dirt:'#b08958',leaf:'#2f6a34',leaf2:'#c45a3a',rock:'#a09078',trunk:'#8a5a32'},
 tundra:{g:'#d5dde2',g2:'#b7c4cc',dirt:'#9aa6ae',leaf:'#2a4a44',leaf2:'#e8eef2',rock:'#9aa3aa',trunk:'#5c4636'},
 marsh:{g:'#3e5a38',g2:'#2a4030',dirt:'#5a4834',leaf:'#2a5530',leaf2:'#6a8a40',rock:'#6a6558',trunk:'#4a3828'},
 highland:{g:'#6a7058',g2:'#4e5444',dirt:'#6a5a44',leaf:'#3a5a34',leaf2:'#7a8a58',rock:'#9a948c',trunk:'#4a3a2c'}
};

function dress(biome,P,put,key,shade){
 var n=0,i, leaf=hex(P.leaf), leaf2=hex(P.leaf2), rock=hex(P.rock), trunk=hex(P.trunk);
 for(i=0;i<(key||'').length;i++)n=(n*33+key.charCodeAt(i))>>>0;
 var shift=((n%5)-2)*0.14;
 if(biome==='desert'){
  put(palmMesh(), -3.5+shift,0,2.15,0.2,1,'palm'); put(shade,-3.5+shift,0,2.15,0,1.3,'shadow');
  put(palmMesh(), 3.45,0,1.7,-0.4,0.9,'palm'); put(shade,3.45,0,1.7,0,1.15,'shadow');
  put(cactusMesh(), -3.15,0,-1.25,0,1,'cactus'); put(cactusMesh(), 2.7,0,2.85,0,0.85,'cactus');
  put(rockMesh(rock), 3.55,0,-1.45,0.4,1.05,'rock'); put(rockMesh(rock), -2.15,0,3.25,0.2,0.75,'rock');
  put(pebbleMesh(), 1.7,0,2.4,0.4,1,'pebble'); put(pebbleMesh(), -1.55,0,-2.15,1.1,0.8,'pebble');
  return;
 }
 if(biome==='tundra'){
  put(pineMesh(true), -3.55,0,2.05,0,1.05,'pine'); put(shade,-3.55,0,2.05,0,1.15,'shadow');
  put(pineMesh(true), 3.5,0,2.35,0,0.85,'pine'); put(pineMesh(true), -3.7,0,-0.7,0,0.7,'pine');
  put(iceMesh(), 3.15,0,-1.25,0.4,1,'ice'); put(iceMesh(), -2.35,0,3.15,0.8,0.8,'ice');
  put(rockMesh(rock), 2.15,0,3.35,0,0.7,'rock');
  put(snowMesh(), -1.15,0,2.85,0.3,1,'snow'); return;
 }
 if(biome==='marsh'){
  put(roundTreeMesh(leaf,leaf2,trunk), -3.5+shift,0,2.15,0,1,'tree'); put(shade,-3.5+shift,0,2.15,0,1.2,'shadow');
  put(roundTreeMesh(leaf,leaf2,trunk), 3.4,0,2.45,0,0.85,'tree');
  put(waterMesh(1.15), 2.45,0,1.25,0,1,'water');
  put(lilyMesh(), 2.15,0,1.05,0.4,1,'lily');
  put(cattailMesh(), 1.65,0,0.65,0,1,'cattail'); put(cattailMesh(), 3.15,0,0.85,0,1.1,'cattail'); put(cattailMesh(), 2.15,0,2.05,0,0.9,'cattail');
  put(fernMesh(), -1.85,0,2.35,0.5,1,'fern');
  put(mushroomMesh(), -2.55,0,-1.35,0,1,'mushroom'); put(mushroomMesh(), -3.2,0,0.35,0,0.8,'mushroom');
  return;
 }
 if(biome==='forest'){
  put(pineMesh(false), -3.65,0,1.85,0,1.12,'pine'); put(shade,-3.65,0,1.85,0,1.2,'shadow');
  put(pineMesh(false), 3.55,0,2.15,0,0.95,'pine'); put(pineMesh(false), -3.3,0,-1.55,0,0.8,'pine'); put(pineMesh(false), 3.15,0,-1.7,0,0.72,'pine');
  put(mushroomMesh(), -2.15,0,2.55,0,1,'mushroom'); put(mushroomMesh(), 1.95,0,3.15,0,0.85,'mushroom');
  put(stumpMesh(trunk), -2.75,0,0.15,0.5,1,'stump'); put(rockMesh(rock), 2.35,0,3.25,0,0.65,'rock');
  put(fernMesh(), -1.7,0,2.65,0.8,1,'fern'); put(fernMesh(), 1.35,0,2.15,0.2,0.85,'fern');
  return;
 }
 if(biome==='hills'||biome==='highland'){
  var sc=biome==='highland'?0.72:1;
  put(pineMesh(false), -3.55,0,2.25,0,sc,'pine'); put(shade,-3.55,0,2.25,0,1.1,'shadow');
  put(pineMesh(false), 3.65,0,1.85,0,0.78,'pine');
  put(rockMesh(rock), -3.15,0,-1.35,0.3,1.25,'rock'); put(rockMesh(rock), 2.95,0,-1.55,0.8,1.05,'rock');
  put(rockMesh(rock), 0.35,0,3.55,0.2,1.35,'rock'); put(rockMesh(rock), -2.15,0,3.25,1,0.8,'rock');
  put(cairnMesh(rock), 2.55,0,3.05,0.4,1,'cairn');
  put(rockMesh(rock), 3.35,0,0.35,1.2,0.55,'rock');
  if(biome==='hills'){put(bushMesh(leaf2), -2.45,0,-1.9,0,1,'bush'); put(grassMesh(), 1.85,0,0.55,0.4,1,'grass'); put(grassMesh(), -1.15,0,2.55,1,0.9,'grass')}
  return;
 }
 put(roundTreeMesh(leaf,leaf2,trunk), -3.55+shift,0,2.15,0.3,1.05,'tree'); put(shade,-3.55+shift,0,2.15,0,1.25,'shadow');
 put(roundTreeMesh(leaf,leaf2,trunk), 3.5,0,1.95,-0.2,0.92,'tree'); put(shade,3.5,0,1.95,0,1.1,'shadow');
 put(bushMesh(leaf), -3.05,0,-1.45,0,1.05,'bush'); put(bushMesh(leaf2), 2.65,0,3.15,0.4,0.85,'bush'); put(bushMesh(leaf), -2.15,0,3.35,0,0.75,'bush');
 put(rockMesh(rock), 3.35,0,-1.35,0.6,0.8,'rock'); put(rockMesh(rock), -3.75,0,0.15,0.2,0.55,'rock');
 var cols=['#e07a8a','#f3e2b0','#d7b56a','#e7e2ef','#f0c36a'];
 var spots=[[-1.35,-0.65],[1.55,-0.5],[-1.75,0.45],[2.05,0.4],[-0.35,1.05]];
 var tufts=[[-2.35,-0.85],[2.15,0.15],[0.95,1.7],[-0.55,2.35]];
 for(i=0;i<spots.length;i++)put(flowerMesh(hex(cols[i])), spots[i][0],0,spots[i][1], i*0.2, 1, 'flower');
 for(i=0;i<tufts.length;i++)put(grassMesh(), tufts[i][0],0,tufts[i][1], i*0.4, 1, 'grass');
}

function casts(name){
 if(name==='ground'||name==='shadow'||name==='water'||name==='grass'||name==='fern'||name==='lily'||name==='mound')return false;
 if(name.indexOf('flame')===0)return false;
 return true;
}
function buildCamp(opts){
 opts=opts||{};
 var biome=PAL[opts.biome]?opts.biome:'meadow', P=PAL[biome], items=[], heroLook=opts.hero||{};
 var shade=shadowMesh(0.5);
 function put(built,x,y,z,ry,s,name){
  items.push({name:name,positions:built.positions,normals:built.normals,colors:built.colors,emissive:built.emissive,indices:built.indices,x:x,y:y||0,z:z,ry:ry||0,s:s||1,cast:casts(name)});
 }
 put(groundMesh(P),0,0,0,0,1,'ground');
 put(tentMesh(),-1.6,0,1.2,0.18,1,'tent');
 put(shade,-1.6,0,1.2,0,1.45,'shadow');
 put(bedMesh(),-2.85,0,-0.85,0.35,1.3,'bed');
 put(chestMesh(),-2.25,0,-0.45,-0.55,1,'chest');
 put(crateMesh(),-1.75,0,-1.65,0.15,1.15,'crate');
 put(fireMesh(),0.12,0,-1.5,0.4,1,'fire');
 put(potMesh(),0.12,0,-1.5,0.3,1,'pot');
 put(shade,0.12,0,-1.5,0,0.7,'shadow');
 put(flameMesh(0.46, hex('#ffb03a')), 0.12,0.2,-1.5, 0,1,'flame');
 put(flameMesh(0.34, hex('#ffe08a')), 0.22,0.18,-1.4, 0.4,1,'flame');
 put(flameMesh(0.3, hex('#ff7a2a')), 0.02,0.18,-1.58, 0.8,1,'flame');
 var hx=0.82, hz=0.2, fx=0.12, fz=-1.5;
 put(person({skin:heroLook.skin||'#e2b48c',hair:heroLook.hair||'#3b2a1d',robe:heroLook.robe||'#274a7a',trim:heroLook.trim||'#d7b56a',cape:heroLook.cape||'#7a2e2a',hat:heroLook.hat||'hood',stick:heroLook.staff!==false,pack:true}), hx,0,hz, yawToward(hx,hz,fx,fz), 1, 'hero');
 put(shade,hx,0,hz,0,0.62,'shadow');
 var fx2=-0.62, fz2=-0.05;
 put(person({skin:'#e8bd94',hair:'#8a4a22',robe:'#4a5f8a',trim:'#c8a86a',cape:null,hat:'cap',stick:false,pack:true,head:1.12}), fx2,0,fz2, yawToward(fx2,fz2,fx,fz), 0.84, 'friend');
 put(shade,fx2,0,fz2,0,0.5,'shadow');
 put(lanternMesh(), 1.9,0,-1.75, 0,1,'lantern');
 put(logMesh(), 1.25,0,-1.05, 0.55,1,'log');
 put(cupMesh(), 0.72,0,-1.02, 0.8,1.35,'cup');
 put(blanketMesh(), 1.25,0,-1.05, 0.55,1,'blanket');
 put(logMesh(), -1.05,0,-1.15, -0.4,1,'log');
 /* ry faces the cloth at the default camp camera. It sits on open grass, clear of the tent guys. */
 put(pennantMesh(), 2.7,0,0.85, 0.14,1,'pennant');
 put(woodpileMesh(), 2.15,0,-0.72, 0.3,1,'wood');
 var stones=[[-1.35,0.15],[-1.05,0.05],[-0.35,-0.45],[0.05,-0.95]];
 for(var si=0;si<stones.length;si++)put(stoneMesh(), stones[si][0],0,stones[si][1], si*0.3, 1, 'stone');
 var rim=mix(hex(P.g2),[0.12,0.13,0.12],0.4);
 var mounds=[[4.5,1.4,0.62],[3.1,4.2,0.48],[-3.4,4.0,0.7],[-4.6,0.3,0.55],[4.7,-1.4,0.5]];
 for(si=0;si<mounds.length;si++)put(moundMesh(rim), mounds[si][0],0,mounds[si][1], si*0.2, mounds[si][2], 'mound');
 dress(biome, P, put, opts.key||'', shade);
 var air={
  meadow:{fog:[0.16,0.22,0.32],sky:[0.52,0.62,0.74],gnd:[0.28,0.24,0.16],far:20},
  forest:{fog:[0.10,0.16,0.14],sky:[0.32,0.46,0.40],gnd:[0.16,0.18,0.12],far:18},
  hills:{fog:[0.18,0.24,0.30],sky:[0.50,0.60,0.70],gnd:[0.26,0.24,0.16],far:20},
  desert:{fog:[0.34,0.26,0.16],sky:[0.70,0.55,0.36],gnd:[0.40,0.30,0.16],far:18},
  tundra:{fog:[0.24,0.30,0.36],sky:[0.60,0.70,0.78],gnd:[0.32,0.34,0.36],far:20},
  marsh:{fog:[0.12,0.20,0.20],sky:[0.30,0.46,0.48],gnd:[0.16,0.20,0.16],far:18},
  highland:{fog:[0.18,0.20,0.26],sky:[0.46,0.52,0.64],gnd:[0.24,0.22,0.20],far:20}
 }[biome];
 return {
  meshes:items,
  fog:air.fog, fogNear:8.5, fogFar:air.far,
  lightDir:norm([0.46,0.84,0.24]),
  lightColor:[1.0,0.93,0.78],
  skyAmb:air.sky,
  groundAmb:air.gnd,
  firePos:[0.12,0.55,-1.5],
  fireColor:[1.0,0.48,0.16],
  fireRadius:3.6
 };
}

function triNormal(p,ia,ib,ic){
 var ax=p[ib*3]-p[ia*3], ay=p[ib*3+1]-p[ia*3+1], az=p[ib*3+2]-p[ia*3+2];
 var bx=p[ic*3]-p[ia*3], by=p[ic*3+1]-p[ia*3+1], bz=p[ic*3+2]-p[ia*3+2];
 return norm([ay*bz-az*by, az*bx-ax*bz, ax*by-ay*bx]);
}
function validateMesh(m, errors, tag){
 var p=m.positions, n=m.normals, c=m.colors, e=m.emissive, idx=m.indices, nv=p.length/3, t, i, a, b, c3, gn, sn, area;
 if(p.length%3||n.length!==p.length||c.length!==p.length||e.length!==nv)errors.push(tag+' buffers');
 if(idx.length%3)errors.push(tag+' index');
 if(nv>65535)errors.push(tag+' overflow');
 for(i=0;i<p.length;i++)if(p[i]!==p[i]||n[i]!==n[i]||c[i]!==c[i]){errors.push(tag+' nan');break}
 for(t=0;t<idx.length;t+=3){
  a=idx[t]; b=idx[t+1]; c3=idx[t+2];
  if(a>=nv||b>=nv||c3>=nv){errors.push(tag+' index range');break}
  gn=triNormal(p,a,b,c3);
  area=Math.abs(gn[0])+Math.abs(gn[1])+Math.abs(gn[2]);
  if(area<1e-4)continue;
  sn=norm([n[a*3]+n[b*3]+n[c3*3], n[a*3+1]+n[b*3+1]+n[c3*3+1], n[a*3+2]+n[b*3+2]+n[c3*3+2]]);
  if(gn[0]*sn[0]+gn[1]*sn[1]+gn[2]*sn[2]<0.9){errors.push(tag+' winding');break}
 }
}
function meshBy(camp,name){var i;for(i=0;i<camp.meshes.length;i++)if(camp.meshes[i].name===name)return camp.meshes[i];return null}
function band(arr,lo,hi){var i;for(i=0;i<arr.length;i++)if(arr[i]>=lo&&arr[i]<=hi)return true;return false}
function boundsY(m){
 var p=m.positions, s=m.s||1, y0=1e9, y1=-1e9, i;
 for(i=1;i<p.length;i+=3){var y=p[i]*s+m.y; if(y<y0)y0=y; if(y>y1)y1=y}
 return [y0,y1];
}
function raster(camp){
 var w=120, h=72, color=new Float32Array(w*h*3), depth=new Float32Array(w*h), i, m, t;
 var bg=[0.110,0.153,0.200];
 for(i=0;i<w*h;i++){depth[i]=1e9; color[i*3]=bg[0]; color[i*3+1]=bg[1]; color[i*3+2]=bg[2]}
 var yaw=0.2, pitch=0.42, radius=7.6, target=[0.05,0.78,0];
 var cp=Math.cos(pitch), eye=[Math.sin(yaw)*cp*radius, target[1]+Math.sin(pitch)*radius, target[2]-Math.cos(yaw)*cp*radius];
 var zaxis=norm([eye[0]-target[0], eye[1]-target[1], eye[2]-target[2]]);
 var xaxis=norm(cross([0,1,0], zaxis)), yaxis=cross(zaxis, xaxis);
 var f=1/Math.tan((34*Math.PI/180)/2), aspect=w/h;
 function xform(p,it,i3){
  var x=p[i3]*it.s, y=p[i3+1]*it.s, z=p[i3+2]*it.s, c=Math.cos(it.ry), s=Math.sin(it.ry);
  return [x*c+z*s+it.x, y+it.y, -x*s+z*c+it.z];
 }
 function project(q){
  var dx=q[0]-eye[0], dy=q[1]-eye[1], dz=q[2]-eye[2];
  var vx=dx*xaxis[0]+dy*xaxis[1]+dz*xaxis[2];
  var vy=dx*yaxis[0]+dy*yaxis[1]+dz*yaxis[2];
  var vz=dx*zaxis[0]+dy*zaxis[1]+dz*zaxis[2];
  if(vz>-0.05)return null;
  var inv=-1/vz, ndx=(vx*inv)*f/aspect, ndy=(vy*inv)*f;
  return [(ndx*0.5+0.5)*w, (1-(ndy*0.5+0.5))*h, -vz];
 }
 for(m=0;m<camp.meshes.length;m++){
  var it=camp.meshes[m], p=it.positions, col=it.colors, idx=it.indices;
  for(t=0;t<idx.length;t+=3){
   var a=idx[t], b=idx[t+1], c=idx[t+2];
   var wa=xform(p,it,a*3), wb=xform(p,it,b*3), wc=xform(p,it,c*3);
   var gn=norm(cross([wb[0]-wa[0],wb[1]-wa[1],wb[2]-wa[2]],[wc[0]-wa[0],wc[1]-wa[1],wc[2]-wa[2]]));
   var mid=[(wa[0]+wb[0]+wc[0])/3,(wa[1]+wb[1]+wc[1])/3,(wa[2]+wb[2]+wc[2])/3];
   var toE=[eye[0]-mid[0],eye[1]-mid[1],eye[2]-mid[2]];
   if(gn[0]*toE[0]+gn[1]*toE[1]+gn[2]*toE[2]<=0)continue;
   var pa=project(wa), pb=project(wb), pc=project(wc);
   if(!pa||!pb||!pc)continue;
   var minx=Math.floor(Math.min(pa[0],pb[0],pc[0])), maxx=Math.ceil(Math.max(pa[0],pb[0],pc[0]));
   var miny=Math.floor(Math.min(pa[1],pb[1],pc[1])), maxy=Math.ceil(Math.max(pa[1],pb[1],pc[1]));
   if(maxx<0||maxy<0||minx>=w||miny>=h)continue;
   if(minx<0)minx=0; if(miny<0)miny=0; if(maxx>=w)maxx=w-1; if(maxy>=h)maxy=h-1;
   var cr=(col[a*3]+col[b*3]+col[c*3])/3, cg=(col[a*3+1]+col[b*3+1]+col[c*3+1])/3, cb=(col[a*3+2]+col[b*3+2]+col[c*3+2])/3;
   var area=(pb[1]-pc[1])*(pa[0]-pc[0])+(pc[0]-pb[0])*(pa[1]-pc[1]);
   if(Math.abs(area)<1e-6)continue;
   var y,x,w0,w1,w2,dep,pi;
   for(y=miny;y<=maxy;y++)for(x=minx;x<=maxx;x++){
    w0=((pb[1]-pc[1])*(x-pc[0])+(pc[0]-pb[0])*(y-pc[1]))/area;
    w1=((pc[1]-pa[1])*(x-pc[0])+(pa[0]-pc[0])*(y-pc[1]))/area;
    w2=1-w0-w1;
    if(w0<-0.001||w1<-0.001||w2<-0.001)continue;
    dep=w0*pa[2]+w1*pb[2]+w2*pc[2]; pi=y*w+x;
    if(dep<depth[pi]){depth[pi]=dep; color[pi*3]=cr; color[pi*3+1]=cg; color[pi*3+2]=cb}
   }
  }
 }
 return {w:w,h:h,color:color,bg:bg};
}
function ascii(img){
 var chars=' .:-=+*#%@', rows=[], y, x, stepY=3, stepX=2, line, i, lum, k;
 for(y=0;y<img.h;y+=stepY){line='';
  for(x=0;x<img.w;x+=stepX){i=(y*img.w+x)*3; lum=(img.color[i]+img.color[i+1]+img.color[i+2])/3; k=Math.max(0,Math.min(9,Math.floor(lum*10))); line+=chars.charAt(k)}
  rows.push(line);
 }
 return rows.join('\n');
}
function countNear(img,pred){
 var n=0,i,c;
 for(i=0;i<img.w*img.h;i++){c=[img.color[i*3],img.color[i*3+1],img.color[i*3+2]]; if(pred(c))n++}
 return n;
}
function dist2(c,t){var dr=c[0]-t[0], dg=c[1]-t[1], db=c[2]-t[2]; return dr*dr+dg*dg+db*db}

function selfCheck(){
 var errors=[], stats={}, biomes=['meadow','forest','hills','desert','tundra','marsh','highland'], bi, camp, hero, face, by, dot, dx, dz, len, i, p, eyeN=0;
 var bb=new Builder(); bb.box(0,0,0,2,2,2,[0.4,0.5,0.6],0);
 var counts={px:0,nx:0,py:0,ny:0,pz:0,nz:0}, idx=bb.idx, pos=bb.p;
 for(i=0;i<idx.length;i+=3){
  var gn=triNormal(pos, idx[i], idx[i+1], idx[i+2]);
  var ax=Math.abs(gn[0])>Math.abs(gn[1])&&Math.abs(gn[0])>Math.abs(gn[2])?'x':Math.abs(gn[1])>Math.abs(gn[2])?'y':'z';
  var key=(gn[ax==='x'?0:ax==='y'?1:2]>0?'p':'n')+ax; counts[key]=(counts[key]||0)+1;
 }
 if(counts.px!==2||counts.nx!==2||counts.py!==2||counts.ny!==2||counts.pz!==2||counts.nz!==2)errors.push('box faces '+JSON.stringify(counts));
 for(bi=0;bi<biomes.length;bi++){
  camp=buildCamp({biome:biomes[bi], key:bi?'ai-safety':'ai-evals', hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#274a7a',trim:'#d7b56a',cape:'#7a2e2a',hat:'hood',staff:true}});
  if(camp.meshes.length<12)errors.push(biomes[bi]+' sparse');
  hero=meshBy(camp,'hero'); face=meshBy(camp,'friend');
  if(!hero||!face||!meshBy(camp,'tent')||!meshBy(camp,'flame')||!meshBy(camp,'ground')||!meshBy(camp,'chest'))errors.push(biomes[bi]+' missing prop');
  for(i=0;i<camp.meshes.length;i++)validateMesh(camp.meshes[i], errors, biomes[bi]+':'+camp.meshes[i].name);
  if(hero){
   by=boundsY(hero);
   if(by[0]<-0.001||by[0]>0.08)errors.push(biomes[bi]+' feet '+by[0].toFixed(3));
   if(by[1]<1.45||by[1]>2.2)errors.push(biomes[bi]+' height '+by[1].toFixed(3));
   dx=0.12-hero.x; dz=-1.5-hero.z; len=Math.sqrt(dx*dx+dz*dz)||1;
   dot=(-Math.sin(hero.ry)*dx + -Math.cos(hero.ry)*dz)/len;
   if(dot<0.9)errors.push(biomes[bi]+' hero heading '+dot.toFixed(3));
  }
  if(bi===0&&hero){
   p=hero.positions;
   for(i=0;i<p.length;i+=3)if(p[i]>0.04&&p[i]<0.16&&p[i+1]>1.3&&p[i+1]<1.6&&p[i+2]<-0.2)eyeN++;
   if(eyeN<6)errors.push('eyes not on the front '+eyeN);
   stats.heroDot=dot; stats.heroH=by[1];
  }
  var upN=0, upT=0, g=meshBy(camp,'ground'), gt;
  if(g)for(gt=0;gt<g.indices.length;gt+=3){upT++; if(triNormal(g.positions,g.indices[gt],g.indices[gt+1],g.indices[gt+2])[1]>0.45)upN++}
  if(upT&&upN/upT<0.55)errors.push(biomes[bi]+' ground up '+upN+'/'+upT);
  var mi, mp, my, yv, sunk;
  for(mi=0;mi<camp.meshes.length;mi++){
   if(camp.meshes[mi].name==='ground')continue;
   mp=camp.meshes[mi].positions; my=camp.meshes[mi].y||0; sunk=false;
   for(yv=1;yv<mp.length;yv+=3)if(mp[yv]*(camp.meshes[mi].s||1)+my<-0.08){sunk=true;break}
   if(sunk)errors.push(biomes[bi]+' '+camp.meshes[mi].name+' below ground');
  }
  if(biomes[bi]==='meadow'){
   if(!meshBy(camp,'pot')||!meshBy(camp,'crate')||!meshBy(camp,'pennant')||!meshBy(camp,'grass')||!meshBy(camp,'log'))errors.push('meadow furniture');
   if(hero&&(!band(hero.emissive,0.5,0.6)||!band(hero.emissive,0.85,0.95)))errors.push('hero materials');
  }
  if(biomes[bi]==='marsh'){
   var water=meshBy(camp,'water');
   if(!water||!band(water.emissive,0.3,0.4))errors.push('marsh water');
  }
 }
 var img=raster(buildCamp({biome:'meadow', key:'ai-evals'}));
 var skin=hex('#e2b48c'), tent=hex('#f4ead4'), grass=hex('#5c8a3e'), grass2=hex('#3e6b32'), dirt=hex('#8a6840');
 var nSkin=countNear(img,function(c){return dist2(c,skin)<0.22*0.22}), nTent=countNear(img,function(c){return dist2(c,tent)<0.26*0.26||dist2(c,hex('#e4d2ae'))<0.26*0.26});
 var nFire=countNear(img,function(c){return c[0]>0.82&&c[1]>0.32&&c[2]<0.45});
 var nCape=countNear(img,function(c){return dist2(c,hex('#7a2e2a'))<0.06*0.06});
 var nGround=countNear(img,function(c){return dist2(c,grass)<0.34*0.34||dist2(c,grass2)<0.34*0.34||dist2(c,dirt)<0.3*0.3});
 var sky=0, top=10*img.w, pi;
 for(pi=0;pi<top;pi++)if(dist2([img.color[pi*3],img.color[pi*3+1],img.color[pi*3+2]],img.bg)<1e-6)sky++;
 stats.skin=nSkin; stats.tent=nTent; stats.fire=nFire; stats.cape=nCape; stats.ground=nGround; stats.skyTop=sky/top;
 if(nSkin<20)errors.push('skin pixels '+nSkin);
 if(nCape<8)errors.push('cape pixels '+nCape);
 if(nTent<12)errors.push('tent pixels '+nTent);
 if(nFire<4)errors.push('fire pixels '+nFire);
 if(nGround<img.w*img.h*0.12)errors.push('ground pixels '+nGround);
 if(sky/top<0.45)errors.push('sky '+((sky/top).toFixed(2)));
 if(errors.length)errors.push(ascii(img));
 return {ok:errors.length===0, errors:errors, stats:stats};
}

var api={buildCamp:buildCamp, selfCheck:selfCheck};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.LQ3DGeom=api;
})(typeof window!=='undefined'?window:global);

if(typeof require!=='undefined'&&require.main===module){
 var report=module.exports.selfCheck();
 console.log(JSON.stringify({ok:report.ok, errors:report.errors, stats:report.stats}, null, 2));
 if(!report.ok)process.exitCode=1;
}
