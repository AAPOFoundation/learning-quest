/* Round 5: milestone celebration clips. Plays a short (about 6 s) clip in a framed overlay AFTER the existing lq:celebrate VFX,
   for the milestones listed in video/milestones/manifest.js (keyed "<course>:<kind>", e.g. "python-basics:region-b3").
   Hooks: lq:celebrate with detail.ms {kind:'region'|'seal'|'finale'|'council', i} (world.js), detail.msg 'Perfect clear!' (engine.js)
   and 'Solved' (code.js), lq:milestone {ms:{kind:'pathfinder'}} (world.js), and the HUD rank text (rank-up).
   Safe before the videos exist: a clip with ship:false is never requested, and a missing or broken file shows nothing at all.
   Each milestone shows at most once per save (P.ms in the course's save); a milestone is only marked seen once its clip actually showed.
   The video has no text in it; the pun is the overlay caption, and the .vtt carries the spoken narration line.
   Muted autoplay with a tap for sound. Reduced motion or Low effects: a still caption card and a Play button, never autoplay.
   Close: Skip (it reads Continue once the clip ends), the x, a tap outside, Esc or Enter. No game rules, XP or badges change here. */
(function(){'use strict';
var MAN=window.LQMilestoneManifest,A=window.APP,E=window.Engine;if(!MAN||!A||!E||!document.getElementById('hud'))return;
var OVR=window.LQMilestoneOverride||null;/* test hook for local screenshots only: {ship:{clipId:1}, base:'url/'} */
var s=document.querySelector('script[src$="shared/milestones.js"]'),BASE=(OVR&&OVR.base)||(s?s.src.replace(/shared\/milestones\.js$/,'video/milestones/'):'../video/milestones/');
var COURSE=A.key,queue=[],busy=false,el=null,tmr=0;
function calm(){try{return !!(window.LQFx&&window.LQFx.low)||matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return !!(window.LQFx&&window.LQFx.low)}}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function seen(){var P=E.P();if(!P.ms||typeof P.ms!=='object')P.ms={};return P.ms}
function shipped(clip){var c=MAN.clips&&MAN.clips[clip];if(!c)return false;return !!(c.ship||(OVR&&OVR.ship&&OVR.ship[clip]))}
function want(kind){var id=COURSE+':'+kind,m=MAN.milestones&&MAN.milestones[id];if(!m||seen()[id]||!shipped(m.clip))return;
 for(var k=0;k<queue.length;k++)if(queue[k].id===id)return;queue.push({id:id,m:m,at:Date.now()});pump()}
/* wait for the VFX (about 2.5 s), the chest reward card, the lesson/trial overlay and the title screen to be gone */
function clear(){var ov=document.getElementById('ov'),t=document.getElementById('ttl');return !document.getElementById('lqreward')&&!(ov&&!ov.hidden)&&!document.querySelector('.lq-vfx')&&!(t&&t.offsetParent!==null&&!t.hidden)}
function pump(){if(busy||!queue.length)return;var q=queue[0];if(Date.now()-q.at<2600||!clear()){clearTimeout(tmr);tmr=setTimeout(pump,300);return}queue.shift();busy=true;play(q)}
function done(){busy=false;if(queue.length){queue.forEach(function(q){q.at=Math.max(q.at,Date.now()-1800)});pump()}}
var CSS='#lqms{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:rgba(8,6,4,.62);animation:lqmsin .22s ease both}'
+'#lqms.calm,#lqms.calm *{animation:none!important;transition:none!important}'
+'#lqms .ms-card{position:relative;width:min(680px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:14px 14px 16px;border-radius:18px;background:linear-gradient(180deg,#2a1d12,#1a120b);border:3px solid #c9a24f;box-shadow:0 0 0 2px #5a3a12 inset,0 0 0 6px rgba(201,162,79,.18),0 18px 60px rgba(0,0,0,.6);color:#f3e2b0;text-align:center}'
+'#lqms .ms-kick{margin:2px 0 4px;font:600 12px/1.2 var(--font,system-ui);letter-spacing:.16em;text-transform:uppercase;color:#e8bf5a}'
+'#lqms h2{margin:0 0 10px;font:700 clamp(19px,4.6vw,26px)/1.15 var(--font-d,var(--font,Georgia,serif));color:#fff1c4}'
+'#lqms .ms-frame{position:relative;border-radius:12px;overflow:hidden;border:2px solid #8a6528;background:#000;aspect-ratio:16/9}'
+'#lqms video{display:block;width:100%;height:100%;object-fit:cover;background:#000}'
+'#lqms video::cue{font-size:15px;background:rgba(0,0,0,.6)}'
+'#lqms .ms-snd{position:absolute;left:8px;top:8px;min-height:44px;padding:0 14px;border-radius:22px;border:2px solid #c9a24f;background:rgba(26,18,11,.86);color:#fff1c4;font:600 14px var(--font,system-ui);cursor:pointer}'
+'#lqms .ms-play{position:absolute;inset:0;margin:auto;width:84px;height:84px;border-radius:50%;border:3px solid #c9a24f;background:rgba(26,18,11,.8);color:#fff1c4;font-size:30px;cursor:pointer}'
+'#lqms .ms-still{display:grid;place-items:center;height:100%;background:radial-gradient(circle at 50% 40%,rgba(255,214,120,.35),rgba(26,18,11,1) 70%)}'
+'#lqms .ms-pun{margin:12px 4px 4px;font:600 clamp(17px,4.2vw,21px)/1.35 var(--font,system-ui);color:#fff6dc}'
+'#lqms .ms-row{display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap}'
+'#lqms [hidden]{display:none!important}#lqms .ms-row .btn{width:auto;margin:0;flex:0 1 auto;min-height:48px;min-width:160px}'
+'#lqms .ms-x{position:absolute;top:8px;right:8px;width:44px;height:44px;border-radius:50%;border:2px solid #8a6528;background:#1a120b;color:#f3e2b0;font-size:20px;line-height:1;cursor:pointer}'
+'@media (max-width:560px){#lqms{padding:10px;align-items:center}#lqms .ms-card{padding:12px 10px 12px;border-radius:14px}#lqms .ms-row .btn{flex:1 1 100%}}'
+'@media (max-height:500px) and (orientation:landscape){#lqms .ms-card{width:min(560px,100%)}#lqms .ms-pun{margin-top:8px;font-size:16px}#lqms h2{margin-bottom:6px;font-size:18px}}'
+'@keyframes lqmsin{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}';
function css(){if(document.getElementById('lqms-css'))return;var st=document.createElement('style');st.id='lqms-css';st.textContent=CSS;document.head.appendChild(st)}
function src(v,clip){var mp4=v.canPlayType&&v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');return BASE+clip+(mp4?'.mp4':'.webm')}
/* probe first: build the video off-screen and only open the overlay once its metadata loads; on error do nothing */
function play(q){var still=calm(),v=document.createElement('video'),ok=false;v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.playsInline=true;v.setAttribute('playsinline','');v.preload='metadata';
 var t=document.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.default=true;t.src=BASE+q.m.clip+'.vtt';v.appendChild(t);
 var guard=setTimeout(function(){if(!ok){v.removeAttribute('src');done()}},8000);
 v.addEventListener('error',function(){clearTimeout(guard);if(!ok)done()},{once:true});
 v.addEventListener('loadedmetadata',function(){if(ok)return;ok=true;clearTimeout(guard);open(q,v,still)},{once:true});
 v.src=src(v,q.m.clip)}
function open(q,v,still){css();var m=q.m;seen()[q.id]=Date.now();try{E.save()}catch(e){}
 el=document.createElement('div');el.id='lqms';el.className=still?'calm':'';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','lqms-t');el.setAttribute('aria-describedby','lqms-p');
 el.innerHTML='<div class="ms-card"><button type="button" class="ms-x" aria-label="Close">×</button><p class="ms-kick">Milestone!</p><h2 id="lqms-t">'+esc(m.title)+'</h2><div class="ms-frame"></div><p class="ms-pun" id="lqms-p">'+esc(m.pun)+'</p><div class="ms-row"><button type="button" class="btn btn-primary ms-ok">'+(still?'Continue':'Skip')+'</button></div></div>';
 var fr=el.querySelector('.ms-frame'),okb=el.querySelector('.ms-ok');
 if(still){fr.innerHTML='<div class="ms-still"></div>';var pb=document.createElement('button');pb.type='button';pb.className='ms-play';pb.setAttribute('aria-label','Play the clip');pb.textContent='▶';fr.appendChild(pb);
  pb.onclick=function(){fr.innerHTML='';fr.appendChild(v);v.controls=true;v.muted=false;v.play().catch(function(){})}}
 else{fr.appendChild(v);var sb=document.createElement('button');sb.type='button';sb.className='ms-snd';sb.textContent='🔈 Tap for sound';sb.setAttribute('aria-label','Turn the sound on');fr.appendChild(sb);
  function snd(e){if(e)e.stopPropagation();v.muted=!v.muted;sb.textContent=v.muted?'🔈 Tap for sound':'🔊 Sound on';sb.setAttribute('aria-label',v.muted?'Turn the sound on':'Turn the sound off');if(v.paused)v.play().catch(function(){})}
  sb.onclick=snd;v.addEventListener('click',snd);
  v.addEventListener('ended',function(){okb.textContent='Continue';clearTimeout(el._end);var me=el;el._end=setTimeout(function(){if(el===me)close()},4000)});
  var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
 try{for(var i=0;i<v.textTracks.length;i++)v.textTracks[i].mode='showing'}catch(e){}
 el.addEventListener('click',function(e){if(e.target===el||e.target.closest('.ms-ok,.ms-x'))close()});
 window.addEventListener('keydown',key,true);document.body.appendChild(el);
 try{el.querySelector('.ms-ok').focus({preventScroll:true})}catch(e){}}
function key(e){if(!el)return;if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();close();return}
 if(e.key==='Tab'){var f=el.querySelectorAll('button:not([hidden])'),i=Array.prototype.indexOf.call(f,document.activeElement);if(f.length){e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}}
 e.stopImmediatePropagation()}/* other keys (Space on a focused button still works) never reach the map while the clip is open */
function close(){if(!el)return;var e=el;el=null;window.removeEventListener('keydown',key,true);clearTimeout(e._end);var v=e.querySelector('video');if(v){try{v.pause();v.removeAttribute('src');v.load()}catch(x){}}if(e.parentNode)e.parentNode.removeChild(e);var cv=document.getElementById('cv');try{if(cv)cv.focus({preventScroll:true})}catch(x){}setTimeout(done,350)}
/* milestone ids from events */
function lvl(i){var L=A.levels&&A.levels[i];return L&&L.id}
function fromMs(ms){if(!ms||!ms.kind)return;var k=ms.kind;
 if(k==='region'){var id=lvl(ms.i);if(id)want('region-'+id)}else if(k==='seal')want('seal-first');else if(k==='finale')want('finale');else if(k==='council')want('council');else if(k==='pathfinder')want('pathfinder')}
document.addEventListener('lq:celebrate',function(e){var d=e.detail||{};if(d.ms)return fromMs(d.ms);if(d.msg==='Perfect clear!')want('perfect-first');else if(d.msg==='Solved')want('code-first')});
document.addEventListener('lq:milestone',function(e){var d=e.detail||{};fromMs(d.ms)});
/* rank-up: compare the rank index from the save XP each time the HUD rank text changes */
function rankIdx(){var r=A.rank||[],xp=E.P().xp||0,i=0;for(var k=0;k<r.length;k++)if(xp>=r[k][0])i=k;return i}
var lastR=null;function rk(){var i=rankIdx();if(lastR!=null&&i>lastR)for(var n=lastR+1;n<=i;n++)want('rank-'+n);lastR=i}
(function hook(n){var e=document.getElementById('rk');if(e){lastR=rankIdx();new MutationObserver(function(){clearTimeout(hook.t);hook.t=setTimeout(rk,60)}).observe(e,{childList:true,characterData:true,subtree:true});return}if(n<200)setTimeout(function(){hook(n+1)},150)})(0);
window.LQMilestones={want:want,close:close,queue:queue,base:BASE,course:COURSE};
})();
