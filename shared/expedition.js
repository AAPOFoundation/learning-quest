/* Expedition: a real-model practice path (Inspect framework) that unlocks stage by stage as regions are cleared.
   Replaces the plain "Real-model practice" tab when a world defines window.APP.expedition. Nothing here runs or checks your code;
   you do the work on your own computer and record a note here. Progress is stored in the world's save under P.exp. */
(function(){var A=window.APP;if(!A||!A.expedition)return;
var X=A.expedition;if(!X.camp)X.camp=window.EXPED_CAMP;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
A.badges=A.badges.concat([{id:'camp',icon:'⛺',name:'Base camp',desc:'Set up Inspect and run the free dry run'},{id:'expedition',icon:'🥾',name:'Expeditioner',desc:'Finish every Expedition stage'}]);
function copyText(t,btn){var done=function(){var o=btn.textContent;btn.textContent='Copied';btn.style.animation='none';void btn.offsetWidth;btn.style.animation='optpop .2s ease';setTimeout(function(){btn.textContent=o;btn.style.animation=''},1200)};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){fallback()});else fallback();
 function fallback(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){}ta.remove()}}
function getFile(name){return fetch('../expedition/'+name).then(function(r){if(!r.ok)throw new Error('missing');return r.text()})}
function download(name,btn){getFile(name).then(function(t){var b=new Blob([t],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)},function(){btn.textContent='Could not fetch (offline?)'})}
function levelTitle(id){var l=A.levels.filter(function(x){return x.id===id})[0];return l?l.title:id}
function mark(kind){
 var body=kind==='done'?'<path d="M5 12.6 9.2 16.8 19 7"/>':kind==='lock'?'<rect x="6.2" y="10.6" width="11.6" height="8.6" rx="1.6"/><path d="M8.6 10.6V8.2a3.4 3.4 0 0 1 6.8 0v2.4"/>':'<path d="M9 6.5 15 12 9 17.5"/>';
 return '<svg class="lq-exp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'+body+'</svg>'}
function ensureStyle(){if(document.getElementById('lq-exp-style'))return;
 var s=document.createElement('style');s.id='lq-exp-style';
 s.textContent=[
'.lq-exp .lq-exp-ico{width:18px;height:18px;color:var(--gold);flex:none;margin-top:4px}',
'.lq-exp .lq-exp-ico path,.lq-exp .lq-exp-ico rect{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
'.lq-exp .lq-exp-head{display:flex;align-items:flex-start;gap:10px;margin:0 0 10px}',
'.lq-exp .lq-exp-head h3{display:flex;align-items:flex-start;gap:8px;flex:1;min-width:0;margin:0}',
'.lq-exp .lq-exp-title{flex:1;min-width:0}',
'.lq-exp .lq-exp-idx{font-family:var(--display);font-weight:700;font-size:28px;line-height:1;color:var(--gold-hi);letter-spacing:.04em;flex:none;padding-top:2px}',
'.lq-exp .lq-exp-path{margin:0 0 0 8px;padding:0 0 0 16px;border-left:2px solid var(--brass)}',
'.lq-exp .lq-exp-card.is-locked{border-color:var(--brass-mid);border-top-color:var(--brass-mid);border-bottom-color:var(--brass-lo);box-shadow:0 0 0 1px var(--brass-ink)}',
'.lq-exp .lq-exp-card.is-done{border-color:var(--gold);border-top-color:var(--gold-hi)}',
'.lq-exp .lq-exp-card.is-locked h3{color:var(--brass)}',
'.lq-exp .lq-exp-card.is-locked .lq-exp-idx{color:var(--brass)}',
'.lq-exp .lq-exp-lock{color:var(--ink);font:700 16px/1.45 var(--font);margin:0}',
'.lq-exp .small{font-size:16px;line-height:1.45}',
'.lq-exp label{display:block;color:var(--ink);font:700 16px/1.45 var(--font)}',
'.lq-exp .exp-note{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:9px;background:#070b10;border:1px solid var(--brass-mid);color:var(--ink);border-radius:8px;min-height:44px;font:800 16px/1.45 var(--font);transition:border-color 160ms}',
'.lq-exp .exp-note::placeholder{color:var(--ink-dim);opacity:1}',
'.lq-exp .exp-note:hover,.lq-exp .exp-note:focus-visible{border-color:var(--gold)}',
'.lq-exp .btn{min-height:44px}',
'.lq-exp .exp-note:focus-visible,.lq-exp .btn:focus-visible{outline:2px solid var(--gold-hi);outline-offset:2px}',
'.lq-exp .lq-exp-bar{height:8px;margin:0 0 4px;border-radius:99px;background:#070b10;border:1px solid var(--brass-mid);overflow:hidden}',
'.lq-exp .lq-exp-bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--brass),var(--gold-hi));transition:width .4s}',
'.lq-exp pre.ex{white-space:pre-wrap}',
'.lq-exp pre.lq-exp-view{max-height:320px;overflow:auto}',
'.lq-exp .lq-exp-card{transition:border-color 160ms}',
'@media (prefers-reduced-motion:reduce){.lq-exp .exp-note,.lq-exp .lq-exp-card,.lq-exp .lq-exp-bar>i{transition:none}}'
 ].join('');
 (document.head||document.documentElement).appendChild(s)}
function render(el,ctx){ensureStyle();var P=typeof ctx.P==='function'?ctx.P():ctx.P;P.exp=P.exp||{};
 if(el._lq3d&&window.LQ3D){try{window.LQ3D.unmount(el._lq3d)}catch(err){}el._lq3d=null}
 function isDone(k){return !!P.exp[k]}
 function open(st){return (st.needs||[]).every(function(id){var r=P.levels[id];return r&&r.done})}
 function counts(){var n=0;X.stages.forEach(function(s){if(isDone(s.id))n++});return n}
 var nDone=counts(),pct=X.stages.length?Math.round(100*nDone/X.stages.length):0;
 var h='<figure class="exp-stage" data-exp-stage><canvas aria-label="Base camp. Drag to turn the camp."></canvas><figcaption class="small dim">Drag to turn the camp.</figcaption></figure><div class="panel lesson"><p class="kicker">Expedition</p><h3>'+esc(X.title)+'</h3><p>'+X.intro+'</p>'
  +'<p class="small dim">Stages unlock as you clear regions on the map. You do the work on your own computer, and the game cannot see or check it, so the note you write is for you. Running a real model through an API usually costs money: set a spending limit with the provider first, use the free dry run (<code>mockllm/model</code>) while you build, and keep every prompt harmless. Progress: <b>'+nDone+' of '+X.stages.length+'</b> stages done'+(isDone('camp')?'':', base camp not yet ticked')+'.</p>'
  +'<div class="lq-exp-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></div></div>';
 function card(id,title,open_,body,doneNote,locked,lockMsg,idx){var d=P.exp[id];
  var state=d?'is-done':locked?'is-locked':'is-open';
  var head='<div class="lq-exp-head">'+(idx?'<span class="lq-exp-idx" aria-hidden="true">'+idx+'</span>':'')+'<h3>'+mark(d?'done':locked?'lock':'open')+'<span class="lq-exp-title">'+esc(title)+'</span></h3></div>';
  return '<div class="panel lesson lq-exp-card '+state+'" data-card="'+id+'">'+head+(locked?'<p class="lq-exp-lock">'+lockMsg+'</p>':body+(d?'<p class="small dim">Your note: <i>'+esc(d.note||'')+'</i></p>':'<p><label>'+esc(doneNote)+'<textarea class="exp-note" data-note="'+id+'" rows="2" placeholder="One or two sentences, at least 10 characters"></textarea></label></p><p><button class="btn btn-primary" data-done="'+id+'">Mark as done</button> <span class="small dim" data-msg="'+id+'"></span></p>'))+'</div>'}
 function codeBlock(txt,label){return '<div class="small dim">'+esc(label||'')+'</div><pre class="ex">'+esc(txt)+'</pre><p><button class="btn btn-ghost btn-sm" data-copy="'+encodeURIComponent(txt)+'">Copy</button></p>'}
 var c=X.camp,body='<p>'+c.goal+'</p><ol>'+c.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol>';
 c.blocks.forEach(function(b){body+=codeBlock(b.code,b.label)});
 body+='<p>'+c.files.map(function(f){return '<button class="btn btn-ghost btn-sm" data-dl="'+f+'">Download '+esc(f)+'</button>'}).join(' ')+'</p><p class="small dim">'+c.note+'</p>';
 h+=card('camp','Base camp: set up (about 20 minutes, once)',true,body,'What did you see when you ran the doctor script?',false,'');
 h+='<div class="lq-exp-path">';
 X.stages.forEach(function(st,i){var op=open(st),b='<p>'+st.goal+'</p><ol>'+st.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol>';
  if(st.files&&st.files.length)b+='<p>'+st.files.map(function(f){return '<button class="btn btn-ghost btn-sm" data-dl="'+f+'">Download '+esc(f)+'</button> <button class="btn btn-ghost btn-sm" data-show="'+f+'">Show code</button>'}).join(' ')+'</p><div data-view="'+(st.files[0])+'"></div>';
  if(st.play)b+='<p><button class="btn btn-primary btn-sm" data-play="'+st.play+'">Run it here, in your browser</button> <span class="small dim">(no setup; the first run downloads the Python engine, about 10 MB)</span></p><div class="cq-exout" data-pout="'+st.play+'" aria-live="polite"></div>';
  if(st.run)b+=codeBlock(st.run,'Commands (run them in the folder that holds the file)');
  if(st.code)b+=codeBlock(st.code,'Starting code');
  if(st.game)b+='<p class="small dim">Reuse from the game: '+st.game+'</p>';
  b+='<p class="small dim"><b>You have it when:</b> '+st.done+'</p>';
  var num=i+1;
  h+=card(st.id,'Stage '+num+': '+st.t,op,b,st.ask||'What did you find? Include a number if you have one.',!op,'Unlocks when you clear: <b>'+st.needs.map(levelTitle).map(esc).join(', ')+'</b>.',(num<10?'0':'')+num)});
 h+='</div>';
 h+='<div class="panel lesson"><p class="small dim">'+X.safety+'</p></div>';
 el.innerHTML='<div class="lq-exp">'+h+'</div>';
 var stage=el.querySelector('[data-exp-stage]');
 if(stage&&window.LQ3D){var W=window.WORLD||{},biome='meadow',hero=null,key='';
  if(W.regions&&W.regions[0]&&W.regions[0].biome)biome=W.regions[0].biome;
  if(W.hero)hero=W.hero; if(W.key)key=W.key;
  el._lq3d=window.LQ3D.mount(stage,{biome:biome,hero:hero,key:key})}
 el.onclick=function(e){var t=e.target;
  if(t.dataset.copy){copyText(decodeURIComponent(t.dataset.copy),t);return}
  if(t.dataset.play){var po=el.querySelector('[data-pout="'+t.dataset.play+'"]');if(!window.PyPlay){po.textContent='The Python component did not load.';return}getFile(t.dataset.play).then(function(x){window.PyPlay.run(x,po)},function(){po.textContent='Could not load the file.'});return}
  if(t.dataset.dl){download(t.dataset.dl,t);return}
  if(t.dataset.show){var v=el.querySelector('[data-view="'+t.dataset.show+'"]');if(v.innerHTML){v.innerHTML='';t.textContent='Show code';return}getFile(t.dataset.show).then(function(x){v.innerHTML='<pre class="ex lq-exp-view">'+esc(x)+'</pre>';t.textContent='Hide code'},function(){v.innerHTML='<p class="small dim">Could not load the file (offline?).</p>'});return}
  if(t.dataset.done){var id=t.dataset.done,ta=el.querySelector('[data-note="'+id+'"]'),note=(ta.value||'').trim(),msg=el.querySelector('[data-msg="'+id+'"]');
   if(note.length<10){msg.textContent='Write a short note first (10+ characters). It is for you.';return}
   P.exp[id]={t:Date.now(),note:note};P.xp=(P.xp||0)+(id==='camp'?10:30);if(id==='camp')ctx.award('camp');
   if(X.stages.every(function(s){return P.exp[s.id]})&&P.exp.camp)ctx.award('expedition');
   ctx.save();ctx.toast(id==='camp'?'Base camp ready (+10 XP)':'Stage recorded (+30 XP)');
   var fig=el.querySelector('[data-exp-stage] canvas'), box=fig&&fig.getBoundingClientRect?fig.getBoundingClientRect():null;
   try{document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:{vfx:'beam',x:box?box.left+box.width/2:null,y:box?box.top+box.height*0.55:null}}))}catch(e){}
   render(el,ctx)}};
}
var tab=(A.tabs||[]).filter(function(t){return t.id==='practice'})[0];
if(tab){tab.label='Expedition';tab.render=render}else{A.tabs=A.tabs||[];A.tabs.push({id:'practice',label:'Expedition',render:render})}
})();
