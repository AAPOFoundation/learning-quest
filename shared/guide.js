/* In-game guide clips. A slot is placed at the start of each region's lesson (concept id "<world>-<level id>", e.g. ai-evals-l4)
   and above each Python challenge (concept id = challenge id, e.g. ev-l4). Only ids in IDS below get a slot (the six shipped clips). It shows a
   short narrated clip with controls (never autoplays; a .webm twin is used by browsers without H.264); if the file does not exist the slot stays empty and invisible.
   An optional assets/guide/<concept-id>.vtt adds captions. Clips that ship are listed in assets/guide/README.md. */
(function(){
'use strict';
var s=document.querySelector('script[src$="shared/guide.js"]'),BASE=s?s.src.replace(/shared\/guide\.js$/,'assets/guide/'):'../assets/guide/',known={};
/* the clips that ship; any other id gets no slot, so no request is made for a missing video */
var IDS={'ai-evals-l3':1,'ai-evals-l4':1,'ai-evals-lS':1,'ai-foundations-l3':1,'ai-foundations-l5':1,'ai-safety-cp':1};
function slot(id){if(!id||!IDS[id])return '';return '<div class="lq-guide" data-guide="'+String(id).replace(/[^a-zA-Z0-9_-]/g,'')+'" hidden></div>'}
function fill(el,id){var v=document.createElement('video');v.preload='metadata';v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.className='lq-guide-v';
 v.addEventListener('loadedmetadata',function(){known[id]=1;el.innerHTML='<p class="kicker">Watch a short guide</p>';el.classList.add('lq-enter');el.appendChild(v);var t=document.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.src=BASE+id+'.vtt';v.appendChild(t);el.hidden=false},{once:true});
 v.addEventListener('error',function(){known[id]=0;el.remove()},{once:true});
 /* H.264 MP4 plays on Safari, Chrome, Edge and Firefox; a browser without it (e.g. some Linux builds) looks for a WebM twin instead */
 var mp4=v.canPlayType&&v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');v.src=BASE+id+(mp4?'.mp4':'.webm')}
function scan(root){Array.prototype.forEach.call((root||document).querySelectorAll('.lq-guide[data-guide]:not([data-done])'),function(el){var id=el.getAttribute('data-guide');el.setAttribute('data-done','1');if(known[id]===0){el.remove();return}fill(el,id)})}
window.LQGuide={slot:slot,scan:scan,base:BASE,ids:IDS};
})();
/* Phone HUD layout helper (r2): publish the bottom edge of the top HUD stack (#lt + #tr) as --lq-hud-b, so the region banner
   and guide caption can sit just under it whatever the objective text length or screen size. Layout only; no game logic.
   It also publishes window.LQHudPad (phones only): how far, in screen px, the world.js camera may scroll past the top/bottom map edge so the
   hero's feet stay >=140px below the HUD stack (room for the caption + banner) and above the move pad. */
(function(){'use strict';if(!window.ResizeObserver||!document.getElementById('hud'))return;
var root=document.documentElement,ro=new ResizeObserver(upd),seen=[];
function upd(){var b=0;['lt','tr'].forEach(function(id){var e=document.getElementById(id);if(e&&e.offsetParent!==null){var r=e.getBoundingClientRect();if(r.bottom>b)b=r.bottom}});if(b)root.style.setProperty('--lq-hud-b',Math.round(b)+'px');var ph=window.innerWidth<=560;var bt=0;['pad','acts'].forEach(function(id){var e=document.getElementById(id);if(e&&e.offsetParent!==null){var r=e.getBoundingClientRect();if(r.height&&(!bt||r.top<bt))bt=r.top}});window.LQHudPad={on:ph&&b>0,t:b+140,b:document.body.classList.contains('nopad')?24:210,bt:document.body.classList.contains('nopad')?0:Math.round(bt)};var d=document.getElementById('dlg');if(d&&!d.hidden){var dh=Math.round(d.getBoundingClientRect().height);if(dh)root.style.setProperty('--lq-dlg-h',dh+'px')}var c=document.getElementById('narrcap');if(c&&!c.hidden)root.style.setProperty('--lq-cap-h',Math.round(c.getBoundingClientRect().height)+'px')}
function watch(){['lt','tr','narrcap','dlg'].forEach(function(id){var e=document.getElementById(id);if(e&&seen.indexOf(e)<0){seen.push(e);ro.observe(e)}});upd()}
new MutationObserver(watch).observe(document.getElementById('hud'),{childList:true});new MutationObserver(watch).observe(document.body,{childList:true});window.addEventListener('resize',upd);watch()})();

