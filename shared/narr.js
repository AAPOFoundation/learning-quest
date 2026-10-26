/* Region narration: plays a spoken line on entering a town; caption + mute. Safe if files are missing. */
(function(){var cur=null,pending=null,unlocked=false,muted=false,au=null,timer=null,cap=null;
try{muted=localStorage.getItem('learning-apps.mute')==='1'}catch(e){}
function capEl(){if(cap)return cap;cap=document.createElement('div');cap.id='narrcap';cap.hidden=true;cap.setAttribute('role','status');cap.setAttribute('aria-live','polite');cap.innerHTML='<span class="who">Guide</span><span class="tx"></span>';document.body.appendChild(cap);return cap}
function hide(){if(cap)cap.hidden=true;clearTimeout(timer)}
/* r6: a finished or replaced line drops its audio source so phones release the decoder and buffer */
function drop(a){try{a.pause();a.removeAttribute('src');a.load()}catch(e){}}
function stop(){if(au){drop(au);au=null}hide()}
function show(t,ms){var c=capEl();c.querySelector('.tx').textContent=t.replace(/R S I/g,'RSI').replace(/M A C D/g,'MACD');c.hidden=false;clearTimeout(timer);timer=setTimeout(hide,ms)}
function run(l){stop();show(l.text,Math.max(6000,l.text.length*75));if(muted)return;
 if(!l.audio)return;try{var a=new Audio('../narration/'+l.audio);a.preload='auto';au=a;a.addEventListener('error',function(){if(au===a)au=null});var p=a.play();if(p&&p.catch)p.catch(function(err){if(au===a)au=null;if(err&&err.name==='AbortError')return;if(err&&err.name==='NotAllowedError'){unlocked=false;pending=l}else if(!unlocked)pending=l})}catch(e){}}
var CUTS={'portfolio-guide:t1':'cash-vault','portfolio-guide:t3':'hedge-smithy'},ov=null,vid=null;
function seen(k){try{return localStorage.getItem('learning-apps.cut.'+k)==='1'}catch(e){return false}}
function mark(k){try{localStorage.setItem('learning-apps.cut.'+k,'1')}catch(e){}}
function closeCut(){if(!ov)return;if(vid)drop(vid);ov.remove();ov=null;vid=null;window.removeEventListener('keydown',ckey,true)}
function ckey(e){if(e.key==='Escape'||e.key==='Enter'||e.key===' '){closeCut()}e.stopImmediatePropagation();e.preventDefault()}
function cut(name){if(ov)closeCut();try{
 ov=document.createElement('div');ov.id='cutscene';ov.innerHTML='<video playsinline preload="auto"></video><button type="button" class="skip">Skip \u25B8</button>';
 document.body.appendChild(ov);vid=ov.querySelector('video');vid.muted=muted;vid.volume=.3;
 vid.addEventListener('error',closeCut);vid.addEventListener('ended',closeCut);
 ov.querySelector('.skip').addEventListener('click',closeCut);
 window.addEventListener('keydown',ckey,true);
 vid.src='../video/'+name+'.mp4';var p=vid.play();if(p&&p.catch)p.catch(function(){if(vid){vid.muted=true;vid.play().catch(closeCut)}});return true}catch(e){closeCut();return false}}
function maybeCut(world,sid){var n=null,k=null;
 if(sid==='t0'&&(world==='ai-evals'||world==='portfolio-guide')&&!seen(world+'.intro')){n='region-intro';k=world+'.intro'}
 else if(CUTS[world+':'+sid]&&!seen(world+'.'+CUTS[world+':'+sid])){n=CUTS[world+':'+sid];k=world+'.'+n}
 if(n){mark(k);cut(n)}}
function play(world,sid){var w=window.NARR&&window.NARR[world],l=w&&w[sid];maybeCut(world,sid);if(!l)return;cur=l;if(!unlocked){pending=l;show(l.text,8000);return}run(l)}
function unlock(){if(unlocked)return;unlocked=true;if(pending&&!muted){var l=pending;pending=null;run(l)}}
/* r4 Safari: on iOS a touch pointerdown is not a user gesture for media, so touchend and click also unlock; a NotAllowedError keeps the line pending for the next tap. */
['pointerdown','touchend','click','keydown'].forEach(function(ev){window.addEventListener(ev,unlock,{passive:true})});
window.Narr={play:play,closeCut:closeCut,get cutOpen(){return !!ov},setMuted:function(m){muted=m;if(vid)vid.muted=m;if(m)stop();else if(cur)run(cur)},replay:function(){if(cur)run(cur)},stop:stop,get audio(){return au}};
})();
