/* Procedural low-poly camp for the Expedition tab.
   Y-up, right-handed. Character front, tent door and chest lip face local -Z.
   Yaw matches Three.js: ry > 0 turns counter-clockwise from above,
   and a mesh faces direction d with ry = atan2(-d.x, -d.z).
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
 var lift=1; if(!em){lift=ny<0?1+ny*0.34:1+ny*0.14}
 var cr=clamp(col[0]*lift,0,1), cg=clamp(col[1]*lift,0,1), cb=clamp(col[2]*lift,0,1);
 var base=this.p.length/3, ev=em?1:0, pts=[a,b,c], i;
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
 /* A rim around the hair and a short cloth down the back. Stays clear of the eyes. */
 cyl(b, 0, 1.6, -0.02, 0.3, 0.055, 8, col, 0);
 b.polyOut([[-0.24,1.52,0.02],[0.24,1.52,0.02],[0.3,0.62,0.26],[-0.3,0.62,0.26]],[0,1.0,-0.5],col,0);
}

function person(o){
 var b=new Builder();
 o=o||{};
 var skin=hex(o.skin||'#e2b48c'), hair=hex(o.hair||'#3b2a1d'), robe=hex(o.robe||'#274a7a'), trim=hex(o.trim||'#d7b56a');
 var boot=hex('#3a2a22'), trouser=hex('#2a3138'), hs=o.head||1, hr=0.25*hs, hy=1.40+ (hs-1)*0.06;
 var top=ring(1.06, 0.30, 0.16), waist=ring(0.76, 0.18, 0.125), hem=ring(0.50, 0.34, 0.22);
 linkRings(b, top, waist, [0,0.8,0], robe);
 linkRings(b, waist, hem, [0,0.7,0], robe);
 b.polyOut([hem[0],hem[3],hem[2],hem[1]], [0,2,0], mix(robe,[0,0,0],0.15), 0);
 b.box(0, 0.98, -0.155, 0.18, 0.055, 0.04, trim, 0);
 b.box(0, 0.72, -0.145, 0.26, 0.045, 0.035, trim, 0);
 cyl(b, 0, 1.16, 0, 0.07, 0.14, 6, skin, 0);
 sphere(b, 0, hy, 0, hr, 8, 6, skin, 0);
 hemi(b, 0, hy+0.06, 0.02, hr+0.025, 8, hair);
 var eyeY=hy+0.02, eyeZ=-hr*0.95;
 sphere(b, 0.085, eyeY, eyeZ, 0.055*hs, 6, 4, hex('#f7f1e6'), 0);
 sphere(b, -0.085, eyeY, eyeZ, 0.055*hs, 6, 4, hex('#f7f1e6'), 0);
 sphere(b, 0.085, eyeY, eyeZ-0.03, 0.028*hs, 5, 3, hex('#241812'), 0);
 sphere(b, -0.085, eyeY, eyeZ-0.03, 0.028*hs, 5, 3, hex('#241812'), 0);
 sphere(b, 0.1, eyeY+0.018, eyeZ-0.05, 0.012, 4, 2, hex('#fff6d8'), 1);
 sphere(b, -0.07, eyeY+0.018, eyeZ-0.05, 0.012, 4, 2, hex('#fff6d8'), 1);
 sphere(b, 0, hy-0.055, eyeZ-0.015, 0.038, 5, 3, skin, 0);
 b.box(0, hy-0.105, eyeZ-0.01, 0.09, 0.018, 0.02, hex('#c47a74'), 0);
 if(o.hat==='cap'){
  cyl(b, 0, hy+hr+0.02, 0, hr*0.72, 0.12, 8, hair, 0);
  cyl(b, 0, hy+hr*0.55, -0.02, hr*1.15, 0.03, 8, trim, 0);
 }else if(o.hat!=='none'){
  hood(b, mix(robe,[0.04,0.05,0.08],0.4));
 }
 if(o.cape){
  var cape=hex(o.cape);
  b.polyOut([[-0.16,1.05,0.02],[-0.4,0.98,0.08],[-0.46,0.46,0.22],[-0.14,0.5,0.08]],[0,0.75,-0.8],cape,0);
  b.polyOut([[0.16,1.05,0.02],[0.14,0.5,0.08],[0.46,0.46,0.22],[0.4,0.98,0.08]],[0,0.75,-0.8],cape,0);
 }
 limb(b, [-0.32,1.02,0], [-0.4,0.58,0.02], 0.055, skin);
 limb(b, [0.34,1.0,-0.02], [0.44,0.64,-0.16], 0.055, skin);
 limb(b, [-0.1,0.52,0.02], [-0.11,0.14,0.02], 0.065, trouser);
 limb(b, [0.1,0.52,0.02], [0.12,0.14,0], 0.065, trouser);
 b.box(-0.11, 0.06, -0.03, 0.14, 0.12, 0.24, boot, 0);
 b.box(0.12, 0.06, -0.03, 0.14, 0.12, 0.24, boot, 0);
 if(o.stick){
  var fr=frameY([0.06,-1,-0.18]);
  b.axesBox([0.5,0.46,-0.18], fr.x, fr.y, fr.z, 0.04, 0.7, 0.04, hex('#6b4428'), 0);
  sphere(b, 0.47, 0.82, -0.1, 0.05, 6, 4, trim, 0);
 }
 if(o.pack!==false){
  b.box(0, 0.8, 0.24, 0.26, 0.28, 0.14, hex('#6b4428'), 0);
  b.box(0, 0.96, 0.25, 0.2, 0.06, 0.16, hex('#5a3824'), 0);
  b.box(0.18, 0.72, 0.2, 0.1, 0.14, 0.1, trim, 0);
 }
 return pack(b);
}

function tentMesh(){
 var b=new Builder(), cloth=hex('#f4ead4'), shade=hex('#e4d2ae'), dark=hex('#3d2c22'), pole=hex('#6b4428');
 var ridgeL=[-0.72,1.06,0], ridgeR=[0.72,1.06,0];
 var fl=[-0.98,0.02,-0.82], fr=[0.98,0.02,-0.82], bl=[-0.98,0.02,0.82], br=[0.98,0.02,0.82];
 b.polyOut([[-0.9,0.025,-0.75],[0.9,0.025,-0.75],[0.9,0.025,0.75],[-0.9,0.025,0.75]],[0,-3,0],hex('#6a5038'),0);
 b.polyOut([ridgeL, ridgeR, br, bl],[0,0.45,0],cloth,0);
 b.polyOut([ridgeL, fl, [-0.14,0.02,-0.9], [-0.06,0.58,-0.06]],[0,0.45,0],shade,0);
 b.polyOut([ridgeR, [0.06,0.58,-0.06], [0.14,0.02,-0.9], fr],[0,0.45,0],cloth,0);
 b.polyOut([ridgeL, bl, fl],[0,0.45,0],shade,0);
 b.polyOut([ridgeR, fr, br],[0,0.45,0],shade,0);
 b.polyOut([[-0.45,0.72,0.2],[0.45,0.72,0.2],[0.55,0.06,0.48],[-0.55,0.06,0.48]],[0,0.4,-1.2],dark,0);
 cyl(b,-0.72,0.52,0,0.035,1.04,5,pole,0);
 cyl(b,0.72,0.52,0,0.035,1.04,5,pole,0);
 var fr=frameY([1,0,0]);
 b.axesBox([0,1.06,0], fr.x, fr.y, fr.z, 0.05, 1.55, 0.05, pole, 0);
 return pack(b);
}
function chestMesh(){
 var b=new Builder(), wood=hex('#7a4e2e'), dark=hex('#4e301c'), gold=hex('#d7b56a');
 b.box(0,0.16,0,0.52,0.28,0.34,wood,0);
 b.box(0,0.2,0,0.54,0.055,0.36,gold,0);
 var hingeL=[-0.26,0.33,0.16], hingeR=[0.26,0.33,0.16], lipL=[-0.26,0.52,-0.16], lipR=[0.26,0.52,-0.16];
 b.polyOut([hingeL, hingeR, lipR, lipL],[0,-1,0],wood,0);
 b.polyOut([hingeL, lipL, lipR, hingeR],[0,1.4,0],dark,0);
 b.polyOut([hingeL, lipL, [-0.26,0.3,0.16]],[ -0.5,0.4,0],wood,0);
 b.polyOut([hingeR, [0.26,0.3,0.16], lipR],[0.5,0.4,0],wood,0);
 b.box(0,0.24,-0.19,0.07,0.09,0.035,gold,0);
 return pack(b);
}
function fireMesh(){
 var b=new Builder(), i, a, fr;
 for(i=0;i<7;i++){a=i/7*TAU; b.box(Math.cos(a)*0.34, 0.07, Math.sin(a)*0.34, 0.14, 0.11, 0.12, i%2?hex('#6a645c'):hex('#4a4640'), 0)}
 fr=frameY([1,0.04,0.2]); b.axesBox([0,0.1,0], fr.x, fr.y, fr.z, 0.08, 0.52, 0.08, hex('#5c3a28'), 0);
 fr=frameY([-0.25,0.06,1]); b.axesBox([0,0.13,0], fr.x, fr.y, fr.z, 0.07, 0.44, 0.07, hex('#6b4428'), 0);
 return pack(b);
}
function flameMesh(h,col){var b=new Builder(); cone(b,0,0,0,h*0.32,h,6,col,1); return pack(b)}
function lanternMesh(){
 var b=new Builder();
 cyl(b,0,0.55,0,0.04,1.1,6,hex('#4a4036'),0);
 b.box(0,1.18,0,0.18,0.22,0.18,hex('#c8a86a'),0);
 b.box(0,1.18,0,0.09,0.12,0.09,hex('#ffc56a'),1);
 b.box(0,1.32,0,0.22,0.05,0.22,hex('#8a6528'),0);
 return pack(b);
}
function shadowMesh(r){
 var b=new Builder(), col=[0.07,0.075,0.055], seg=12, i, a0, a1;
 for(i=0;i<seg;i++){a0=i/seg*TAU; a1=(i+1)/seg*TAU;
  b.polyOut([[0,0.06,0],[Math.cos(a0)*r,0.06,Math.sin(a0)*r],[Math.cos(a1)*r,0.06,Math.sin(a1)*r]],[0,-4,0],col,0);
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
 var b=new Builder(), trunk=hex('#5c4030');
 var a=snow?hex('#b7ccc8'):hex('#1e5a32'), c=snow?hex('#e4eef0'):hex('#347a40'), d=snow?hex('#f5f8f8'):hex('#256838');
 cyl(b,0,0.28,0,0.07,0.55,6,trunk,0);
 cone(b,0,0.4,0,0.62,0.75,7,a,0);
 cone(b,0,0.78,0,0.46,0.64,7,c,0);
 cone(b,0,1.15,0,0.28,0.52,6,d,0);
 return pack(b);
}
function roundTreeMesh(leaf,leaf2,trunk){
 var b=new Builder();
 cyl(b,0,0.32,0,0.08,0.64,6,trunk,0);
 sphere(b,0,1.02,0,0.42,8,5,leaf,0);
 sphere(b,-0.22,0.88,0.08,0.28,6,4,leaf2,0);
 sphere(b,0.18,0.9,-0.1,0.24,6,4,mix(leaf,leaf2,0.4),0);
 return pack(b);
}
function bushMesh(col){var b=new Builder(); sphere(b,0,0.16,0,0.22,6,4,col,0); sphere(b,0.14,0.12,0.05,0.15,5,3,mix(col,[1,1,1],0.12),0); return pack(b)}
function rockMesh(col){
 var b=new Builder();
 b.box(0,0.16,0,0.48,0.26,0.36,col,0);
 b.box(0.16,0.26,0.06,0.28,0.2,0.22,mix(col,[1,1,1],0.08),0);
 b.box(-0.14,0.14,-0.08,0.22,0.16,0.2,mix(col,[0,0,0],0.12),0);
 return pack(b);
}
function palmMesh(){
 var b=new Builder(), col=hex('#8a5a32'), leaf=hex('#2f7a34'), i, y=0, k, a, dir, fr;
 for(i=0;i<5;i++){cyl(b, Math.sin(i*0.8)*0.06, y+0.16, 0, 0.055, 0.3, 6, col, 0); y+=0.26}
 for(k=0;k<6;k++){
  a=k/6*TAU; dir=[Math.cos(a)*0.85, -0.28, Math.sin(a)*0.85]; fr=frameY(dir);
  b.axesBox([Math.cos(a)*0.38, y+0.05, Math.sin(a)*0.38], fr.x, fr.y, fr.z, 0.1, 0.62, 0.18, k%2?leaf:hex('#3e8a42'), 0);
 }
 return pack(b);
}
function cactusMesh(){
 var b=new Builder(), col=hex('#3d7a48');
 cyl(b,0,0.36,0,0.12,0.72,6,col,0);
 cyl(b,0.18,0.5,0,0.07,0.28,5,col,0);
 cyl(b,-0.18,0.44,0,0.065,0.24,5,mix(col,[1,1,1],0.08),0);
 return pack(b);
}
function mushroomMesh(){var b=new Builder(); cyl(b,0,0.08,0,0.028,0.14,5,hex('#eadcc4'),0); cone(b,0,0.14,0,0.11,0.09,6,hex('#b5453a'),0); return pack(b)}
function cattailMesh(){var b=new Builder(); cyl(b,0,0.26,0,0.016,0.52,4,hex('#3a5a32'),0); cyl(b,0,0.54,0,0.032,0.14,5,hex('#6a4a32'),0); return pack(b)}
function stumpMesh(col){var b=new Builder(); cyl(b,0,0.12,0,0.16,0.24,6,col,0); cyl(b,0,0.25,0,0.18,0.05,6,hex('#c4a574'),0); return pack(b)}
function iceMesh(){var b=new Builder(); b.box(0,0.22,0,0.18,0.44,0.14,hex('#d7eef6'),0); b.box(0.1,0.36,0.04,0.1,0.32,0.1,hex('#f4fbff'),0); return pack(b)}
function cairnMesh(col){var b=new Builder(); b.box(0,0.1,0,0.36,0.16,0.28,col,0); b.box(0.04,0.24,0.02,0.24,0.14,0.2,mix(col,[1,1,1],0.06),0); b.box(-0.02,0.36,0,0.14,0.12,0.12,mix(col,[0,0,0],0.08),0); return pack(b)}
function flowerMesh(col){var b=new Builder(); cyl(b,0,0.08,0,0.012,0.16,4,hex('#2f6a32'),0); sphere(b,0,0.18,0,0.045,5,3,col,0); return pack(b)}
function waterMesh(r){
 var b=new Builder(), col=hex('#2c7580'), seg=14, i, a0, a1;
 for(i=0;i<seg;i++){a0=i/seg*TAU; a1=(i+1)/seg*TAU;
  b.polyOut([[0,0.045,0],[Math.cos(a0)*r,0.045,Math.sin(a0)*r],[Math.cos(a1)*r,0.045,Math.sin(a1)*r]],[0,-4,0],col,0)}
 return pack(b);
}
function bedMesh(){var b=new Builder(), fr=frameY([1,0.05,0.15]); b.axesBox([0,0.08,0], fr.x, fr.y, fr.z, 0.16, 0.58, 0.16, hex('#7a2e2a'), 0); return pack(b)}
function seatMesh(){var b=new Builder(), fr=frameY([1,0,0.1]); b.axesBox([0,0.12,0], fr.x, fr.y, fr.z, 0.16, 0.72, 0.16, hex('#6b4428'), 0); return pack(b)}

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
  return;
 }
 if(biome==='tundra'){
  put(pineMesh(true), -3.55,0,2.05,0,1.05,'pine'); put(shade,-3.55,0,2.05,0,1.15,'shadow');
  put(pineMesh(true), 3.5,0,2.35,0,0.85,'pine'); put(pineMesh(true), -3.7,0,-0.7,0,0.7,'pine');
  put(iceMesh(), 3.15,0,-1.25,0.4,1,'ice'); put(iceMesh(), -2.35,0,3.15,0.8,0.8,'ice');
  put(rockMesh(rock), 2.15,0,3.35,0,0.7,'rock'); return;
 }
 if(biome==='marsh'){
  put(roundTreeMesh(leaf,leaf2,trunk), -3.5+shift,0,2.15,0,1,'tree'); put(shade,-3.5+shift,0,2.15,0,1.2,'shadow');
  put(roundTreeMesh(leaf,leaf2,trunk), 3.4,0,2.45,0,0.85,'tree');
  put(waterMesh(1.15), 2.45,0,1.25,0,1,'water');
  put(cattailMesh(), 1.65,0,0.65,0,1,'cattail'); put(cattailMesh(), 3.15,0,0.85,0,1.1,'cattail'); put(cattailMesh(), 2.15,0,2.05,0,0.9,'cattail');
  put(mushroomMesh(), -2.55,0,-1.35,0,1,'mushroom'); put(mushroomMesh(), -3.2,0,0.35,0,0.8,'mushroom');
  return;
 }
 if(biome==='forest'){
  put(pineMesh(false), -3.65,0,1.85,0,1.12,'pine'); put(shade,-3.65,0,1.85,0,1.2,'shadow');
  put(pineMesh(false), 3.55,0,2.15,0,0.95,'pine'); put(pineMesh(false), -3.3,0,-1.55,0,0.8,'pine'); put(pineMesh(false), 3.15,0,-1.7,0,0.72,'pine');
  put(mushroomMesh(), -2.15,0,2.55,0,1,'mushroom'); put(mushroomMesh(), 1.95,0,3.15,0,0.85,'mushroom');
  put(stumpMesh(trunk), -2.75,0,0.15,0.5,1,'stump'); put(rockMesh(rock), 2.35,0,3.25,0,0.65,'rock');
  return;
 }
 if(biome==='hills'||biome==='highland'){
  var sc=biome==='highland'?0.72:1;
  put(pineMesh(false), -3.55,0,2.25,0,sc,'pine'); put(shade,-3.55,0,2.25,0,1.1,'shadow');
  put(pineMesh(false), 3.65,0,1.85,0,0.78,'pine');
  put(rockMesh(rock), -3.15,0,-1.35,0.3,1.25,'rock'); put(rockMesh(rock), 2.95,0,-1.55,0.8,1.05,'rock');
  put(rockMesh(rock), 0.35,0,3.55,0.2,1.35,'rock'); put(rockMesh(rock), -2.15,0,3.25,1,0.8,'rock');
  put(cairnMesh(rock), 2.55,0,3.05,0.4,1,'cairn');
  if(biome==='hills')put(bushMesh(leaf2), -2.45,0,-1.9,0,1,'bush');
  return;
 }
 put(roundTreeMesh(leaf,leaf2,trunk), -3.55+shift,0,2.15,0.3,1.05,'tree'); put(shade,-3.55+shift,0,2.15,0,1.25,'shadow');
 put(roundTreeMesh(leaf,leaf2,trunk), 3.5,0,1.95,-0.2,0.92,'tree'); put(shade,3.5,0,1.95,0,1.1,'shadow');
 put(bushMesh(leaf), -3.05,0,-1.45,0,1.05,'bush'); put(bushMesh(leaf2), 2.65,0,3.15,0.4,0.85,'bush'); put(bushMesh(leaf), -2.15,0,3.35,0,0.75,'bush');
 put(rockMesh(rock), 3.35,0,-1.35,0.6,0.8,'rock'); put(rockMesh(rock), -3.75,0,0.15,0.2,0.55,'rock');
 var cols=['#e07a8a','#f3e2b0','#d7b56a','#e7e2ef','#f0c36a'];
 var spots=[[-1.35,-0.65],[1.55,-0.5],[-1.75,0.45],[2.05,0.4],[-0.35,1.05]];
 for(i=0;i<spots.length;i++)put(flowerMesh(hex(cols[i])), spots[i][0],0,spots[i][1], i*0.2, 1, 'flower');
}

function casts(name){
 if(name==='ground'||name==='shadow'||name==='water')return false;
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
 put(bedMesh(),-2.15,0,0.45,0.5,1,'bed');
 put(chestMesh(),-2.25,0,-0.45,-0.55,1,'chest');
 put(fireMesh(),0.12,0,-1.5,0.4,1,'fire');
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
 put(seatMesh(), 1.45,0,-0.72, 0.35,1,'seat');
 dress(biome, P, put, opts.key||'', shade);
 return {
  meshes:items,
  fog:[0.110,0.153,0.200], fogNear:9, fogFar:20,
  lightDir:norm([0.46,0.84,0.24]),
  lightColor:[1.0,0.93,0.78],
  skyAmb:[0.48,0.58,0.70],
  groundAmb:[0.30,0.24,0.18]
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
 }
 var img=raster(buildCamp({biome:'meadow', key:'ai-evals'}));
 var skin=hex('#e2b48c'), tent=hex('#f4ead4'), grass=hex('#5c8a3e'), grass2=hex('#3e6b32'), dirt=hex('#8a6840');
 var nSkin=countNear(img,function(c){return dist2(c,skin)<0.22*0.22}), nTent=countNear(img,function(c){return dist2(c,tent)<0.26*0.26||dist2(c,hex('#e4d2ae'))<0.26*0.26});
 var nFire=countNear(img,function(c){return c[0]>0.82&&c[1]>0.32&&c[2]<0.45});
 var nGround=countNear(img,function(c){return dist2(c,grass)<0.34*0.34||dist2(c,grass2)<0.34*0.34||dist2(c,dirt)<0.3*0.3});
 var sky=0, top=10*img.w, pi;
 for(pi=0;pi<top;pi++)if(dist2([img.color[pi*3],img.color[pi*3+1],img.color[pi*3+2]],img.bg)<1e-6)sky++;
 stats.skin=nSkin; stats.tent=nTent; stats.fire=nFire; stats.ground=nGround; stats.skyTop=sky/top;
 if(nSkin<20)errors.push('skin pixels '+nSkin);
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
