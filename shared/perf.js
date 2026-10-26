/* r6 lane P: phone budget and idle care. Loaded first on every world page; every caller guards with `if(window.LQPerf)`.
   - Adaptive resolution: the world canvas starts at the device's pixel ratio (capped at 2, as before). On a phone, if frames
     run slow for a while it steps the ratio down a notch (2 > 1.75 > 1.5 > 1.25) and steps back up after a long stretch of
     smooth frames. Art, colours and brightness are untouched; only the pixel count changes. Desktops keep 2 unless frames
     are very slow (over 50 ms).
   - Canvas budget: iOS refuses canvases over about 16.7M pixels and caps total canvas memory, so the main canvas is held
     under 16M pixels, towns not visited lately are released (phones keep the 3 most recent, desktops 8), and the shared
     building cache is smaller on phones.
   - Hidden tab: pauses narration and cut-scene video and suspends the Web Audio context; they carry on when the tab returns.
   - Testing: localStorage 'learning-apps.perf' = 'full' pins the top tier, 'low' pins the lowest. LQPerf.stats() reports. */
(function(){if(window.LQPerf)return;
var ua=navigator.userAgent||'',iOS=/iP(hone|ad|od)/.test(ua)||(/Macintosh/.test(ua)&&(navigator.maxTouchPoints||0)>1),
 coarse=false;try{coarse=matchMedia('(pointer: coarse)').matches}catch(e){}
var small=Math.min(screen.width||9999,screen.height||9999)<=900,mobile=iOS||(coarse&&small);
var pin=null;try{pin=localStorage.getItem('learning-apps.perf')}catch(e){}
var CAPS=mobile?[2,1.75,1.5,1.25]:[2,2,1.75,1.5],UP=mobile?34:50,DOWN=mobile?21:26,MAXPX=16e6;
var tier=pin==='low'?3:0,ema=0,n=0,hot=0,cool=0,last=0,flips=0,lockUp=false,subs=[],use={},clock=0,released=0;
function cap(){return pin==='full'?2:CAPS[tier]}
/* pixel ratio for a canvas of w x h CSS px: never above the tier cap, and never over iOS's per-canvas pixel limit */
function dpr(w,h){var d=Math.min(cap(),window.devicePixelRatio||1),a=(w||1)*(h||1)*d*d;if(a>MAXPX)d*=Math.sqrt(MAXPX/a);return Math.max(.5,d)}
function set(t){if(t===tier)return;if(t<tier){if(lockUp)return;flips++}tier=t;hot=cool=0;n=0;ema=0;
 if(flips>=3)lockUp=true;/* stop see-sawing: after three climbs back up, stay at the lower tier for the session */
 for(var i=0;i<subs.length;i++)try{subs[i](tier)}catch(e){}}
/* world.js calls this once per drawn frame with the rAF timestamp; idle (throttled) frames pass idle=true and are not timed */
function frame(ts,idle){if(idle||document.hidden||pin){last=0;return}var ms=last?ts-last:0;last=ts;if(!(ms>0)||ms>200)return;
 n++;ema=ema?ema*.9+ms*.1:ms;if(n<30)return;
 if(ema>UP){hot+=ms;cool=0;if(hot>1500&&tier<3)set(tier+1)}
 else if(ema<DOWN){cool+=ms;hot=Math.max(0,hot-ms);if(cool>8000&&tier>0)set(tier-1)}
 else{hot=Math.max(0,hot-ms*.5);cool=Math.max(0,cool-ms*.5)}}
/* release canvases owned by a scene (sized to 1x1 rather than 0 so a stray drawImage cannot throw) */
function freeCanvases(o){for(var k in o){var v=o[k];if(v&&v.tagName==='CANVAS'&&v.width*v.height>1){v.width=1;v.height=1;released++}}}
function touch(id){use[id]=++clock}
/* keep the most recently used towns; never drop the one being entered or the one on screen */
function trimScenes(scenes,keepId,cur){touch(keepId);var keep=mobile?3:8,ids=Object.keys(scenes).filter(function(k){return scenes[k]&&k!==keepId&&scenes[k]!==cur});
 if(ids.length+1<=keep)return;ids.sort(function(a,b){return (use[a]||0)-(use[b]||0)});
 while(ids.length+1>keep){var id=ids.shift(),sc=scenes[id];delete scenes[id];delete use[id];if(sc)freeCanvases(sc)}}
/* hidden tab: nothing should keep running */
var pausedA=null,pausedV=null,acWas=false;
document.addEventListener('visibilitychange',function(){
 if(document.hidden){
  try{var a=window.Narr&&window.Narr.audio;if(a&&!a.paused){a.pause();pausedA=a}}catch(e){}
  try{var v=document.querySelector('#cutscene video');if(v&&!v.paused){v.pause();pausedV=v}}catch(e){}
  try{if(window.LQSfx&&window.LQSfx.on()){var ac=window.LQSfx.ctx();if(ac&&ac.state==='running'){acWas=true;ac.suspend()}}}catch(e){}
 }else{
  try{if(pausedA&&window.Narr&&window.Narr.audio===pausedA){var p=pausedA.play();if(p&&p.catch)p.catch(function(){})}}catch(e){}pausedA=null;
  try{if(pausedV&&pausedV.isConnected){var q=pausedV.play();if(q&&q.catch)q.catch(function(){})}}catch(e){}pausedV=null;
  try{if(acWas&&window.LQSfx&&window.LQSfx.on()){acWas=false;window.LQSfx.ctx()}}catch(e){}
 }});
window.LQPerf={mobile:mobile,iOS:iOS,dpr:dpr,frame:frame,trimScenes:trimScenes,touch:touch,freeCanvases:freeCanvases,
 get tier(){return tier},get slotCap(){return mobile?24:48},
 onTier:function(f){subs.push(f)},
 stats:function(){return {mobile:mobile,tier:tier,cap:cap(),pin:pin,emaMs:+ema.toFixed(1),released:released,lockUp:lockUp}}};
})();
