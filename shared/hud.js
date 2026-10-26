/* r4 HUD feel (UI only, no game rules): the chest reward card, the XP gain float and the rank-up glow.
   world.js fires lq:reward {title, kind:'seal'|'crown', rarity:'rare'|'legendary', xp, where, accent} when a chest is opened.
   The card sits above the dialogue box, closes on Collect, a tap outside, Enter, Space or Escape, or by itself after 7 s.
   Reduced motion shows it still. Nothing here changes XP, badges or saves. */
(function(){'use strict';
var RAR={common:{label:'Common find',col:'#cfc6b0'},magic:{label:'Magic find',col:'#6aa8ff'},rare:{label:'Rare find',col:'#7fb2ff'},epic:{label:'Epic find',col:'#c890ff'},legendary:{label:'Legendary find',col:'#ff9f3a'}};
function calm(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches||(window.LQFx&&window.LQFx.low)}catch(e){return false}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hex(c){return /^#[0-9a-fA-F]{6}$/.test(c||'')?c:'#8a6528'}
function icon(kind,acc){if(kind==='crown')return '<svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true"><defs><linearGradient id="rwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".5" stop-color="#e8bf5a"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient></defs><path d="M14 70 L10 30 L32 48 L48 18 L64 48 L86 30 L82 70 Z" fill="url(#rwg)" stroke="#5a3a0a" stroke-width="3" stroke-linejoin="round"/><rect x="14" y="70" width="68" height="12" rx="3" fill="url(#rwg)" stroke="#5a3a0a" stroke-width="3"/><circle cx="48" cy="56" r="7" fill="#d84a3a" stroke="#5a1a10" stroke-width="2"/><circle cx="28" cy="62" r="4.5" fill="#4a8ad8" stroke="#1a2a5a" stroke-width="2"/><circle cx="68" cy="62" r="4.5" fill="#4ab07a" stroke="#1a4a2a" stroke-width="2"/><circle cx="10" cy="30" r="4" fill="#fff1c4" stroke="#5a3a0a" stroke-width="2"/><circle cx="48" cy="18" r="4" fill="#fff1c4" stroke="#5a3a0a" stroke-width="2"/><circle cx="86" cy="30" r="4" fill="#fff1c4" stroke="#5a3a0a" stroke-width="2"/></svg>';
 acc=hex(acc);return '<svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true"><defs><radialGradient id="rws" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".35" stop-color="'+acc+'"/><stop offset="1" stop-color="#140c06"/></radialGradient></defs><path d="M48 6 l9 8 12-2 4 11 11 5-2 12 8 9-8 9 2 12-11 5-4 11-12-2-9 8-9-8-12 2-4-11-11-5 2-12-8-9 8-9-2-12 11-5 4-11 12 2z" fill="url(#rws)" stroke="#2a1d0a" stroke-width="3" stroke-linejoin="round"/><circle cx="48" cy="48" r="24" fill="none" stroke="#f3e2b0" stroke-width="3" opacity=".9"/><path d="M48 30 l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L48 57.1l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z" fill="#f3e2b0" stroke="#5a3a0a" stroke-width="2" stroke-linejoin="round"/></svg>'}
var el=null,tmr=null,raf=0;
function close(){if(!el)return;var e=el;el=null;clearTimeout(tmr);cancelAnimationFrame(raf);window.removeEventListener('keydown',key,true);e.classList.add('out');setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},calm()?0:220)}
function key(e){if(e.key==='Enter'||e.key===' '||e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}}
function show(d){d=d||{};if(el)close();var r=RAR[d.rarity]||RAR.rare,still=calm();
 el=document.createElement('div');el.id='lqreward';el.className='rw-'+(RAR[d.rarity]?d.rarity:'rare')+(still?' calm':'');el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-labelledby','rw-name');el.style.setProperty('--rar',r.col);el.style.setProperty('--acc',hex(d.accent));
 el.innerHTML='<div class="rw-rays" aria-hidden="true"></div><div class="rw-card panel"><p class="kicker">Treasure chest</p><div class="rw-icon">'+icon(d.kind,d.accent)+'</div><div class="rw-rar">'+r.label+'</div><h3 class="rw-name" id="rw-name">'+esc(d.title||'Treasure')+'</h3><p class="rw-where">Added to your badges'+(d.where?' · '+esc(d.where):'')+'</p>'+(d.xp?'<div class="rw-xp" aria-label="plus '+(+d.xp)+' XP">+<span>'+(still?(+d.xp):0)+'</span> XP</div>':'')+'<button type="button" class="btn btn-primary rw-ok">Collect</button></div>';
 document.body.appendChild(el);
 el.addEventListener('click',function(e){if(e.target===el||e.target.closest('.rw-ok'))close()});
 window.addEventListener('keydown',key,true);
 var b=el.querySelector('.rw-ok');try{b.focus({preventScroll:true})}catch(e){}
 if(d.xp&&!still){var sp=el.querySelector('.rw-xp span'),t0=performance.now()+420,n=+d.xp;(function f(){var k=Math.max(0,Math.min(1,(performance.now()-t0)/700));sp.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1&&el)raf=requestAnimationFrame(f)})();setTimeout(function(){sp.textContent=n},1300)}
 tmr=setTimeout(close,7000)}
document.addEventListener('lq:reward',function(e){show(e.detail)});
/* XP float + bar shine + rank glow: watch the HUD numbers world.js already writes */
var lastXp=null,lastRank=null;
function hudTick(){var stt=document.getElementById('stt'),rk=document.getElementById('rk'),xb=document.getElementById('xb');if(!stt||!xb)return;
 var rank=rk?rk.textContent.split(' · ')[0]:'';
 if(lastRank!=null&&rank&&rank!==lastRank){var p=document.getElementById('party');if(p&&!calm()){p.classList.remove('rankup');void p.offsetWidth;p.classList.add('rankup')}floatTxt('Rank up! '+rank,true)}
 lastRank=rank}
function floatTxt(t,big){var xb=document.getElementById('xb');if(!xb)return;var r=xb.parentNode.getBoundingClientRect(),f=document.createElement('div');f.className='xpfloat'+(big?' big':'')+(calm()?' calm':'');f.textContent=t;f.style.left=Math.round(r.left+r.width*.5)+'px';f.style.top=Math.round(r.bottom+4)+'px';document.body.appendChild(f);setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f)},calm()?1400:1300)}
function shine(){var xb=document.getElementById('xb');if(!xb||calm())return;var b=xb.parentNode;b.classList.remove('gain');void b.offsetWidth;b.classList.add('gain')}
/* the XP target lives in the save; the HUD counts up to it. Compare the save value between HUD writes. */
function saveXp(){try{var k=document.body.dataset.world;var s=JSON.parse(localStorage.getItem('learning-apps.'+k)||'null');return s&&typeof s.xp==='number'?s.xp:null}catch(e){return null}}
function onHud(){var x=saveXp();if(x!=null){if(lastXp!=null&&x>lastXp){floatTxt('+'+(x-lastXp)+' XP');shine()}lastXp=x}hudTick()}
function hook(){var stt=document.getElementById('stt');if(!stt)return false;new MutationObserver(function(){clearTimeout(hook.t);hook.t=setTimeout(onHud,40)}).observe(stt,{childList:true,subtree:true,characterData:true});onHud();return true}
(function wait(n){if(hook()||n>200)return;setTimeout(function(){wait(n+1)},150)})(0);
window.LQReward={show:show,close:close};
})();
