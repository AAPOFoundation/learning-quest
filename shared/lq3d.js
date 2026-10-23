/* Expedition camp viewer. A small WebGL diorama, no libraries.
   Y-up, right-handed. Character front is local -Z, and the camera sits on -Z so faces look toward the viewer.
   Full effects: directional shadow map, a slow orbit, and a small idle bob.
   Low effects or reduced motion: one still frame. Contact shadows are real meshes, so the still frame keeps them. */
(function(){
'use strict';
var FOV=34*Math.PI/180, SH=1024;

function mul(a,b,o){
 var c,r,s;
 for(c=0;c<4;c++)for(r=0;r<4;r++){
  s=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  o[c*4+r]=s;
 }
}
function lookAt(o,ex,ey,ez,tx,ty,tz){
 var zx=ex-tx,zy=ey-ty,zz=ez-tz,zl=Math.sqrt(zx*zx+zy*zy+zz*zz)||1;
 zx/=zl;zy/=zl;zz/=zl;
 var ux=0,uy=1,uz=0;
 if(zy>0.98||zy<-0.98){ux=1;uy=0;uz=0}
 var xx=uy*zz-uz*zy,xy=uz*zx-ux*zz,xz=ux*zy-uy*zx,xl=Math.sqrt(xx*xx+xy*xy+xz*xz)||1;
 xx/=xl;xy/=xl;xz/=xl;
 var yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
 o[0]=xx;o[4]=xy;o[8]=xz;o[12]=-(xx*ex+xy*ey+xz*ez);
 o[1]=yx;o[5]=yy;o[9]=yz;o[13]=-(yx*ex+yy*ey+yz*ez);
 o[2]=zx;o[6]=zy;o[10]=zz;o[14]=-(zx*ex+zy*ey+zz*ez);
 o[3]=0;o[7]=0;o[11]=0;o[15]=1;
}
function persp(o,fovy,aspect,near,far){
 var f=1/Math.tan(fovy*0.5),nf=1/(near-far);
 o[0]=f/aspect;o[1]=0;o[2]=0;o[3]=0;
 o[4]=0;o[5]=f;o[6]=0;o[7]=0;
 o[8]=0;o[9]=0;o[10]=(far+near)*nf;o[11]=-1;
 o[12]=0;o[13]=0;o[14]=2*far*near*nf;o[15]=0;
}
function ortho(o,l,r,b,t,n,f){
 var rl=1/(r-l),tb=1/(t-b),fn=1/(f-n);
 o[0]=2*rl;o[1]=0;o[2]=0;o[3]=0;
 o[4]=0;o[5]=2*tb;o[6]=0;o[7]=0;
 o[8]=0;o[9]=0;o[10]=-2*fn;o[11]=0;
 o[12]=-(r+l)*rl;o[13]=-(t+b)*tb;o[14]=-(f+n)*fn;o[15]=1;
}
function setModel(o,x,y,z,ry,s,sy){
 var c=Math.cos(ry),sn=Math.sin(ry),syy=s*sy;
 o[0]=c*s;o[1]=0;o[2]=-sn*s;o[3]=0;
 o[4]=0;o[5]=syy;o[6]=0;o[7]=0;
 o[8]=sn*s;o[9]=0;o[10]=c*s;o[11]=0;
 o[12]=x;o[13]=y;o[14]=z;o[15]=1;
}
function sh(gl,type,src){
 var s=gl.createShader(type);
 gl.shaderSource(s,src);
 gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null}
 return s;
}
function prog(gl,vs,fs){
 var a=sh(gl,gl.VERTEX_SHADER,vs),b=sh(gl,gl.FRAGMENT_SHADER,fs),p;
 if(!a||!b)return null;
 p=gl.createProgram();
 gl.attachShader(p,a);gl.attachShader(p,b);
 gl.bindAttribLocation(p,0,'aPos');
 gl.bindAttribLocation(p,1,'aNrm');
 gl.bindAttribLocation(p,2,'aCol');
 gl.bindAttribLocation(p,3,'aE');
 gl.linkProgram(p);
 gl.deleteShader(a);gl.deleteShader(b);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){gl.deleteProgram(p);return null}
 return p;
}
var CVS=[
'precision highp float;',
'attribute vec3 aPos;attribute vec3 aNrm;attribute vec3 aCol;attribute float aE;',
'uniform mat4 uMVP;uniform mat4 uM;uniform mat4 uLVP;',
'varying vec3 vCol;varying vec3 vN;varying vec3 vW;varying vec4 vS;varying float vE;',
'void main(){',
' vec4 w=uM*vec4(aPos,1.0);',
' vW=w.xyz;vN=mat3(uM)*aNrm;vCol=aCol;vE=aE;vS=uLVP*w;',
' gl_Position=uMVP*vec4(aPos,1.0);',
'}'
].join('\n');
var CFS=[
'precision highp float;',
'varying vec3 vCol;varying vec3 vN;varying vec3 vW;varying vec4 vS;varying float vE;',
'uniform vec3 uEye;uniform vec3 uLDir;uniform vec3 uLCol;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uFog;',
'uniform vec3 uFire;uniform vec3 uFireCol;',
'uniform float uFogN;uniform float uFogF;uniform float uShOn;uniform float uGlow;uniform float uFireR;uniform float uFireK;uniform sampler2D uSh;',
'float unpack(vec4 c){return dot(c,vec4(1.0,0.0039215686,0.0000153787,0.00000006035));}',
'float pcf(vec2 uv,float ref){',
' vec2 t=vec2(0.0009765625);float s=0.0;',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(-t.x,-t.y))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(0.0,-t.y))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(t.x,-t.y))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(-t.x,0.0))));',
' s+=step(ref,unpack(texture2D(uSh,uv)));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(t.x,0.0))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(-t.x,t.y))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(0.0,t.y))));',
' s+=step(ref,unpack(texture2D(uSh,uv+vec2(t.x,t.y))));',
' return s/9.0;',
'}',
'void main(){',
' vec3 N=normalize(vN);vec3 L=normalize(uLDir);vec3 col;',
' if(vE>0.95){col=vCol*uGlow;}',
' else if(vE>0.80){col=vCol*1.25;}',
' else{',
'  float wrap=dot(N,L)*0.5+0.5;wrap=wrap*wrap;float shade=1.0;',
'  if(uShOn>0.5){',
'   vec3 sp=vS.xyz/vS.w;vec2 uv=sp.xy*0.5+0.5;',
'   if(uv.x>0.0&&uv.x<1.0&&uv.y>0.0&&uv.y<1.0){',
'    float bias=0.0012+0.0016*(1.0-max(dot(N,L),0.0));',
'    float ref=sp.z*0.5+0.5-bias;',
'    shade=mix(pcf(uv,ref),1.0,0.5);',
'   }',
'  }',
'  vec3 hemi=mix(uGnd,uSky,N.y*0.5+0.5);',
'  vec3 V=normalize(uEye-vW);vec3 H=normalize(L+V);',
'  float spow=28.0;float sstr=0.10;',
'  if(vE>0.45){spow=16.0;sstr=0.55;}',
'  else if(vE>0.20){spow=48.0;sstr=0.38;}',
'  float spec=pow(max(dot(N,H),0.0),spow)*sstr*shade;',
'  col=vCol*(hemi+uLCol*wrap*shade)+uLCol*spec;',
'  if(vE>0.20&&vE<=0.45)col+=uSky*0.08;',
'  vec3 fillL=normalize(vec3(-0.35,0.42,-0.62));',
'  col+=vCol*vec3(0.40,0.52,0.68)*max(dot(N,fillL),0.0)*0.22;',
'  vec3 toF=uFire-vW;',
'  float fd=length(toF);',
'  float att=clamp(1.0-fd/uFireR,0.0,1.0);att=att*att;',
'  float fl=max(dot(N,toF/max(fd,0.001)),0.0);',
'  col+=vCol*uFireCol*att*(0.28+0.72*fl)*uFireK;',
'  float rim=pow(1.0-max(dot(N,V),0.0),2.2);',
'  col+=uSky*rim*0.16;',
' }',
' col=min(col,vec3(1.35));',
' float dist=length(vW-uEye);',
' float fog=clamp((dist-uFogN)/(uFogF-uFogN),0.0,1.0);',
' fog=fog*fog*(3.0-2.0*fog);',
' gl_FragColor=vec4(mix(col,uFog,fog),1.0);',
'}'
].join('\n');
var DVS=[
'precision highp float;',
'attribute vec3 aPos;uniform mat4 uMVP;varying vec2 vZW;',
'void main(){gl_Position=uMVP*vec4(aPos,1.0);vZW=gl_Position.zw;}'
].join('\n');
var DFS=[
'precision highp float;varying vec2 vZW;',
'vec4 pack(float d){vec4 e=vec4(1.0,255.0,65025.0,16581375.0)*d;e=fract(e);e-=e.yzww*vec4(0.0039215686,0.0039215686,0.0039215686,0.0);return e;}',
'void main(){gl_FragColor=pack(clamp(vZW.x/vZW.y*0.5+0.5,0.0,0.999));}'
].join('\n');

function tri(v){return v&&v.length>=3?v:[0.5,0.5,0.5]}
function mount(figureEl,opts){
 var h={dead:false};
 try{
  if(!window.LQ3DGeom||!window.LQ3DGeom.buildCamp){h.dead=true;return h}
  var cv=figureEl&&figureEl.querySelector?figureEl.querySelector('canvas'):null;
  if(!cv){h.dead=true;return h}
  var scene=window.LQ3DGeom.buildCamp(opts);
  if(!scene||!scene.meshes){h.dead=true;return h}
  var gl=null;
  try{gl=cv.getContext('webgl',{alpha:false,antialias:true,depth:true,stencil:false,premultipliedAlpha:false})||cv.getContext('experimental-webgl',{alpha:false,antialias:true,depth:true,stencil:false})}catch(e1){gl=null}
  if(!gl){h.dead=true;return h}
  h.gl=gl;h.cv=cv;
  var col=prog(gl,CVS,CFS),dep=prog(gl,DVS,DFS);
  if(!col||!dep){unmount(h);h.dead=true;return h}
  h.col=col;h.dep=dep;
  function loc(p,n){return gl.getUniformLocation(p,n)}
  col.uMVP=loc(col,'uMVP');col.uM=loc(col,'uM');col.uLVP=loc(col,'uLVP');
  col.uEye=loc(col,'uEye');col.uLDir=loc(col,'uLDir');col.uLCol=loc(col,'uLCol');
  col.uSky=loc(col,'uSky');col.uGnd=loc(col,'uGnd');col.uFog=loc(col,'uFog');
  col.uFogN=loc(col,'uFogN');col.uFogF=loc(col,'uFogF');col.uShOn=loc(col,'uShOn');col.uSh=loc(col,'uSh');
  col.uGlow=loc(col,'uGlow');col.uFire=loc(col,'uFire');col.uFireCol=loc(col,'uFireCol');
  col.uFireR=loc(col,'uFireR');col.uFireK=loc(col,'uFireK');
  dep.uMVP=loc(dep,'uMVP');
  var gpu=[],i,src,m;
  function buf(type,data){var b=gl.createBuffer();gl.bindBuffer(type,b);gl.bufferData(type,data,gl.STATIC_DRAW);return b}
  for(i=0;i<scene.meshes.length;i++){
   src=scene.meshes[i];
   if(!src||!src.positions||!src.normals||!src.colors||!src.emissive||!src.indices||!src.indices.length)continue;
   m={name:src.name||'',x:src.x||0,y:src.y||0,z:src.z||0,ry:src.ry||0,s:src.s==null?1:src.s,cast:!!src.cast,count:src.indices.length,seed:i*1.7};
   m.bPos=buf(gl.ARRAY_BUFFER,src.positions);
   m.bNrm=buf(gl.ARRAY_BUFFER,src.normals);
   m.bCol=buf(gl.ARRAY_BUFFER,src.colors);
   m.bE=buf(gl.ARRAY_BUFFER,src.emissive);
   m.bIdx=buf(gl.ELEMENT_ARRAY_BUFFER,src.indices);
   gpu.push(m);
  }
  h.gpu=gpu;
  var shOk=false,shFb=null,shTex=null,shRb=null;
  function texParams(){
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  }
  try{
   shTex=gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D,shTex);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SH,SH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   texParams();
   shRb=gl.createRenderbuffer();
   gl.bindRenderbuffer(gl.RENDERBUFFER,shRb);
   gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SH,SH);
   shFb=gl.createFramebuffer();
   gl.bindFramebuffer(gl.FRAMEBUFFER,shFb);
   gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shTex,0);
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shRb);
   shOk=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   if(!shOk)throw new Error('shadow');
  }catch(eSh){
   if(shFb)gl.deleteFramebuffer(shFb);
   if(shRb)gl.deleteRenderbuffer(shRb);
   if(shTex)gl.deleteTexture(shTex);
   shFb=null;shRb=null;shTex=null;shOk=false;
   try{
    shTex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,shTex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
    texParams();
   }catch(eB){shTex=null}
  }
  gl.bindTexture(gl.TEXTURE_2D,null);
  h.shFb=shFb;h.shTex=shTex;h.shRb=shRb;
  var fog=tri(scene.fog),fogN=scene.fogNear!=null?scene.fogNear:9,fogF=scene.fogFar!=null?scene.fogFar:20;
  if(fogF<fogN+0.5)fogF=fogN+0.5;
  var ld=tri(scene.lightDir),lc=tri(scene.lightColor),sky=tri(scene.skyAmb),gnd=tri(scene.groundAmb);
  var fire=scene.firePos&&scene.firePos.length>=3?scene.firePos:[0.12,0.55,-1.5];
  var fireC=scene.fireColor&&scene.fireColor.length>=3?scene.fireColor:[1,0.48,0.16];
  var fireR=scene.fireRadius!=null?scene.fireRadius:3.6;
  var proj=new Float32Array(16),view=new Float32Array(16),vp=new Float32Array(16);
  var model=new Float32Array(16),mvp=new Float32Array(16);
  var lproj=new Float32Array(16),lview=new Float32Array(16),lvp=new Float32Array(16);
  lvp[0]=lvp[5]=lvp[10]=lvp[15]=1;
  var tx=0,ty=0.85,tz=0,yaw=0.2,pitch=0.46,radius=8.4,t=0;
  var rm=null;
  try{rm=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null}catch(e2){rm=null}
  function paused(){return !!((window.LQFx&&window.LQFx.low)||(rm&&rm.matches))}
  function fit(){
   var dpr=paused()?1:Math.min(1.5,window.devicePixelRatio||1);
   var r=cv.getBoundingClientRect(),w=r.width,hh=r.height;
   if(w<1||hh<1)return false;
   var pw=Math.max(1,Math.round(w*dpr)),ph=Math.max(1,Math.round(hh*dpr));
   if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph;h.dirty=true}
   return true;
  }
  function pose(mesh,st){
   var bob=0,sy=1,ry=mesh.ry;
   if(!st){
    if(mesh.name==='hero'||mesh.name==='friend'){
     bob=Math.sin(t*2+(mesh.name==='friend'?1:0))*0.025;
     ry=mesh.ry+Math.sin(t*1.3+mesh.seed)*0.035;
    }else if(mesh.name.indexOf('flame')===0)sy=0.82+0.22*Math.sin(t*8+mesh.seed);
   }
   setModel(model,mesh.x,mesh.y+bob,mesh.z,ry,mesh.s,sy);
  }
  function bindPos(mesh){
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.bPos);
   gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.bIdx);
  }
  function bindAll(mesh){
   bindPos(mesh);
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.bNrm);
   gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.bCol);
   gl.vertexAttribPointer(2,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.bE);
   gl.vertexAttribPointer(3,1,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.bIdx);
  }
  function render(st){
   var w=cv.width,hh=cv.height,k,cp,sp;
   if(w<1||hh<1)return;
   cp=Math.cos(pitch);sp=Math.sin(pitch);
   var ex=tx+Math.sin(yaw)*cp*radius,ey=ty+sp*radius,ez=tz-Math.cos(yaw)*cp*radius;
   lookAt(view,ex,ey,ez,tx,ty,tz);
   persp(proj,FOV,w/hh,0.15,Math.max(48,fogF+8));
   mul(proj,view,vp);
   if(!st&&shOk){
    lookAt(lview,ld[0]*16,ld[1]*16,ld[2]*16,0,0.6,0);
    ortho(lproj,-8,8,-8,8,0.5,40);
    mul(lproj,lview,lvp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,shFb);
    gl.viewport(0,0,SH,SH);
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(dep);
    for(k=0;k<gpu.length;k++){
     if(!gpu[k].cast)continue;
     pose(gpu[k],false);
     mul(lvp,model,mvp);
     gl.uniformMatrix4fv(dep.uMVP,false,mvp);
     bindPos(gpu[k]);
     gl.drawElements(gl.TRIANGLES,gpu[k].count,gl.UNSIGNED_SHORT,0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   }
   gl.viewport(0,0,w,hh);
   gl.clearColor(fog[0],fog[1],fog[2],1);
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.useProgram(col);
   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D,shTex);
   gl.uniformMatrix4fv(col.uLVP,false,lvp);
   gl.uniform3f(col.uEye,ex,ey,ez);
   gl.uniform1f(col.uShOn,(!st&&shOk)?1:0);
   gl.uniform3f(col.uFire,fire[0],fire[1],fire[2]);
   gl.uniform3f(col.uFireCol,fireC[0],fireC[1],fireC[2]);
   gl.uniform1f(col.uFireR,fireR);
   gl.uniform1f(col.uGlow,st?1.25:(1.15+0.22*Math.sin(t*6.0)));
   gl.uniform1f(col.uFireK,st?0.85:(0.72+0.28*Math.sin(t*7.0)));
   for(k=0;k<gpu.length;k++){
    pose(gpu[k],st);
    mul(vp,model,mvp);
    gl.uniformMatrix4fv(col.uMVP,false,mvp);
    gl.uniformMatrix4fv(col.uM,false,model);
    bindAll(gpu[k]);
    gl.drawElements(gl.TRIANGLES,gpu[k].count,gl.UNSIGNED_SHORT,0);
   }
  }
  gl.useProgram(col);
  gl.uniform3f(col.uLDir,ld[0],ld[1],ld[2]);
  gl.uniform3f(col.uLCol,lc[0],lc[1],lc[2]);
  gl.uniform3f(col.uSky,sky[0],sky[1],sky[2]);
  gl.uniform3f(col.uGnd,gnd[0],gnd[1],gnd[2]);
  gl.uniform3f(col.uFog,fog[0],fog[1],fog[2]);
  gl.uniform1f(col.uFogN,fogN);
  gl.uniform1f(col.uFogF,fogF);
  gl.uniform1i(col.uSh,0);
  gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);gl.enableVertexAttribArray(2);gl.enableVertexAttribArray(3);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);
  gl.disable(gl.BLEND);
  cv.style.touchAction='none';
  h.drag=false;h.pid=null;h.n=0;h.raf=0;h.timer=0;h.painted=false;h.dirty=true;h.last=0;
  function kick(){
   if(h.dead||h.raf)return;
   if(h.timer){clearTimeout(h.timer);h.timer=0}
   h.raf=requestAnimationFrame(loop);
  }
  function wake(){
   h.timer=0;
   if(h.dead)return;
   if(!cv.isConnected){unmount(h);return}
   if(!paused()||h.dirty||!h.painted)kick();
   else h.timer=setTimeout(wake,200);
  }
  function loop(ts){
   if(h.dead)return;
   h.raf=0;
   if(!cv.isConnected){unmount(h);return}
   var st=paused();
   if(!fit()){h.timer=setTimeout(function(){h.timer=0;if(!h.dead)kick()},200);return}
   if(st){
    if(!h.painted||h.dirty){try{render(true)}catch(eR){unmount(h);return}h.painted=true;h.dirty=false}
    h.timer=setTimeout(wake,200);
    return;
   }
   var dt=h.last?Math.min(0.05,(ts-h.last)/1000):0;
   h.last=ts;
   if(!h.drag)yaw+=dt*0.12;
   t+=dt;
   try{render(false)}catch(eR){unmount(h);return}
   h.painted=true;h.dirty=false;
   h.raf=requestAnimationFrame(loop);
  }
  function onDown(e){
   h.n++;
   if(h.n>1){h.drag=false;return}
   h.pid=e.pointerId;h.drag=true;h.px=e.clientX;h.py=e.clientY;
   try{if(cv.setPointerCapture)cv.setPointerCapture(e.pointerId)}catch(err){}
  }
  function onMove(e){
   if(!h.drag||h.n!==1||e.pointerId!==h.pid)return;
   var dx=e.clientX-h.px,dy=e.clientY-h.py;
   h.px=e.clientX;h.py=e.clientY;
   yaw+=dx*0.008;pitch+=dy*0.005;
   if(pitch<0.28)pitch=0.28;if(pitch>1.05)pitch=1.05;
   h.dirty=true;
   if(!h.raf)kick();
  }
  function onUp(e){
   if(h.n>0)h.n--;
   if(e.pointerId===h.pid||h.n===0){h.pid=null;h.drag=false}
  }
  function onWheel(e){
   if(e.preventDefault)e.preventDefault();
   var d=e.deltaY||0;
   if(e.deltaMode===1)d*=16;else if(e.deltaMode===2)d*=120;
   radius+=d*0.005;
   if(radius<6)radius=6;if(radius>13)radius=13;
   h.dirty=true;
   if(!h.raf)kick();
  }
  function onResize(){if(h.dead)return;h.dirty=true;kick()}
  h.onDown=onDown;h.onMove=onMove;h.onUp=onUp;h.onWheel=onWheel;h.onResize=onResize;
  cv.addEventListener('pointerdown',onDown);
  cv.addEventListener('pointermove',onMove);
  cv.addEventListener('pointerup',onUp);
  cv.addEventListener('pointercancel',onUp);
  try{cv.addEventListener('wheel',onWheel,{passive:false})}catch(e3){cv.addEventListener('wheel',onWheel)}
  if(window.ResizeObserver){h.ro=new ResizeObserver(onResize);h.ro.observe(cv)}
  else window.addEventListener('resize',onResize);
  if(rm){
   h.onRm=function(){if(!h.dead){h.dirty=true;h.last=0;kick()}};
   h.rm=rm;
   if(rm.addEventListener)rm.addEventListener('change',h.onRm);
   else if(rm.addListener)rm.addListener(h.onRm);
  }
  kick();
  return h;
 }catch(err){
  try{unmount(h)}catch(e4){}
  return {dead:true};
 }
}
function unmount(h){
 if(!h||h.dead)return;
 h.dead=true;
 if(h.raf)cancelAnimationFrame(h.raf);
 h.raf=0;
 if(h.timer)clearTimeout(h.timer);
 h.timer=0;
 var cv=h.cv;
 if(cv){
  if(h.onDown)cv.removeEventListener('pointerdown',h.onDown);
  if(h.onMove)cv.removeEventListener('pointermove',h.onMove);
  if(h.onUp){cv.removeEventListener('pointerup',h.onUp);cv.removeEventListener('pointercancel',h.onUp)}
  if(h.onWheel)cv.removeEventListener('wheel',h.onWheel);
 }
 if(h.ro)h.ro.disconnect();
 else if(h.onResize)window.removeEventListener('resize',h.onResize);
 if(h.rm&&h.onRm){
  if(h.rm.removeEventListener)h.rm.removeEventListener('change',h.onRm);
  else if(h.rm.removeListener)h.rm.removeListener(h.onRm);
 }
 var gl=h.gl,i,g=h.gpu;
 if(gl){
  if(g)for(i=0;i<g.length;i++){
   gl.deleteBuffer(g[i].bPos);gl.deleteBuffer(g[i].bNrm);gl.deleteBuffer(g[i].bCol);gl.deleteBuffer(g[i].bE);gl.deleteBuffer(g[i].bIdx);
  }
  if(h.shTex)gl.deleteTexture(h.shTex);
  if(h.shRb)gl.deleteRenderbuffer(h.shRb);
  if(h.shFb)gl.deleteFramebuffer(h.shFb);
  if(h.col)gl.deleteProgram(h.col);
  if(h.dep)gl.deleteProgram(h.dep);
  var ext=gl.getExtension('WEBGL_lose_context');
  if(ext)ext.loseContext();
 }
 h.gl=null;
}
window.LQ3D={mount:mount,unmount:unmount};
})();
