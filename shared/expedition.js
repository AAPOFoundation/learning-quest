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
function render(el,ctx){var P=typeof ctx.P==='function'?ctx.P():ctx.P;P.exp=P.exp||{};
 if(el._lq3d&&window.LQ3D){try{window.LQ3D.unmount(el._lq3d)}catch(err){}el._lq3d=null}
 function isDone(k){return !!P.exp[k]}
 function open(st){return (st.needs||[]).every(function(id){var r=P.levels[id];return r&&r.done})}
 function counts(){var n=0;X.stages.forEach(function(s){if(isDone(s.id))n++});return n}
 var h='<figure class="exp-stage" data-exp-stage><canvas aria-label="Base camp. Drag to turn the camp."></canvas><figcaption class="small dim">Drag to turn the camp.</figcaption></figure><div class="panel lesson"><p class="kicker">Expedition</p><h3>'+esc(X.title)+'</h3><p>'+X.intro+'</p>'
  +'<p class="small dim">Stages unlock as you clear regions on the map. You do the work on your own computer, and the game cannot see or check it, so the note you write is for you. Running a real model through an API usually costs money: set a spending limit with the provider first, use the free dry run (<code>mockllm/model</code>) while you build, and keep every prompt harmless. Progress: <b>'+counts()+' of '+X.stages.length+'</b> stages done'+(isDone('camp')?'':', base camp not yet ticked')+'.</p></div>';
 function card(id,title,open_,body,doneNote,locked,lockMsg){var d=P.exp[id];
  return '<div class="panel lesson" data-card="'+id+'"><h3>'+(d?'✔️ ':locked?'🔒 ':'▶️ ')+esc(title)+'</h3>'+(locked?'<p class="small dim">'+lockMsg+'</p>':body+(d?'<p class="small dim">Your note: <i>'+esc(d.note||'')+'</i></p>':'<p><label class="small dim">'+esc(doneNote)+'<br><textarea class="exp-note" data-note="'+id+'" rows="2" style="width:100%;box-sizing:border-box" placeholder="One or two sentences, at least 10 characters"></textarea></label></p><p><button class="btn btn-primary" data-done="'+id+'">Mark as done</button> <span class="small dim" data-msg="'+id+'"></span></p>'))+'</div>'}
 function codeBlock(txt,label){return '<div class="small dim">'+esc(label||'')+'</div><pre class="ex" style="white-space:pre-wrap">'+esc(txt)+'</pre><p><button class="btn btn-ghost btn-sm" data-copy="'+encodeURIComponent(txt)+'">Copy</button></p>'}
 var c=X.camp,body='<p>'+c.goal+'</p><ol>'+c.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol>';
 c.blocks.forEach(function(b){body+=codeBlock(b.code,b.label)});
 body+='<p>'+c.files.map(function(f){return '<button class="btn btn-ghost btn-sm" data-dl="'+f+'">Download '+esc(f)+'</button>'}).join(' ')+'</p><p class="small dim">'+c.note+'</p>';
 h+=card('camp','Base camp: set up (about 20 minutes, once)',true,body,'What did you see when you ran the doctor script?',false,'');
 X.stages.forEach(function(st,i){var op=open(st),b='<p>'+st.goal+'</p><ol>'+st.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol>';
  if(st.files&&st.files.length)b+='<p>'+st.files.map(function(f){return '<button class="btn btn-ghost btn-sm" data-dl="'+f+'">Download '+esc(f)+'</button> <button class="btn btn-ghost btn-sm" data-show="'+f+'">Show code</button>'}).join(' ')+'</p><div data-view="'+(st.files[0])+'"></div>';
  if(st.play)b+='<p><button class="btn btn-primary btn-sm" data-play="'+st.play+'">Run it here, in your browser</button> <span class="small dim">(no setup; the first run downloads the Python engine, about 10 MB)</span></p><div class="cq-exout" data-pout="'+st.play+'" aria-live="polite"></div>';
  if(st.run)b+=codeBlock(st.run,'Commands (run them in the folder that holds the file)');
  if(st.code)b+=codeBlock(st.code,'Starting code');
  if(st.game)b+='<p class="small dim">Reuse from the game: '+st.game+'</p>';
  b+='<p class="small dim"><b>You have it when:</b> '+st.done+'</p>';
  h+=card(st.id,'Stage '+(i+1)+': '+st.t,op,b,st.ask||'What did you find? Include a number if you have one.',!op,'Unlocks when you clear: <b>'+st.needs.map(levelTitle).map(esc).join(', ')+'</b>.')});
 h+='<div class="panel lesson"><p class="small dim">'+X.safety+'</p></div>';
 el.innerHTML=h;
 var stage=el.querySelector('[data-exp-stage]');
 if(stage&&window.LQ3D){var W=window.WORLD||{},biome='meadow',hero=null,key='';
  if(W.regions&&W.regions[0]&&W.regions[0].biome)biome=W.regions[0].biome;
  if(W.hero)hero=W.hero; if(W.key)key=W.key;
  el._lq3d=window.LQ3D.mount(stage,{biome:biome,hero:hero,key:key})}
 el.onclick=function(e){var t=e.target;
  if(t.dataset.copy){copyText(decodeURIComponent(t.dataset.copy),t);return}
  if(t.dataset.play){var po=el.querySelector('[data-pout="'+t.dataset.play+'"]');if(!window.PyPlay){po.textContent='The Python component did not load.';return}getFile(t.dataset.play).then(function(x){window.PyPlay.run(x,po)},function(){po.textContent='Could not load the file.'});return}
  if(t.dataset.dl){download(t.dataset.dl,t);return}
  if(t.dataset.show){var v=el.querySelector('[data-view="'+t.dataset.show+'"]');if(v.innerHTML){v.innerHTML='';t.textContent='Show code';return}getFile(t.dataset.show).then(function(x){v.innerHTML='<pre class="ex" style="white-space:pre-wrap;max-height:320px;overflow:auto">'+esc(x)+'</pre>';t.textContent='Hide code'},function(){v.innerHTML='<p class="small dim">Could not load the file (offline?).</p>'});return}
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
