/* Python challenge component. window.CodeQ.mount(q, el, ctx) where ctx={idx,total,title,done(ok)} */
(function(){
'use strict';
var W=null,state='idle',waiters=[],failMsg='',seq=0,pending={};
function base(){var s=document.querySelector('script[src$="shared/code.js"]');return s?s.src.replace(/code\.js$/,''):'../shared/'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function boot(){if(state==='loading'||state==='ready')return;state='loading';failMsg='';
 try{W=new Worker(base()+'pyworker.js')}catch(e){fail('Your browser would not start the Python engine.');return}
 W.onmessage=function(ev){var m=ev.data;
  if(m.type==='ready'){state='ready';waiters.splice(0).forEach(function(w){w(true)})}
  else if(m.type==='fatal'){fail(m.msg)}
  else if(m.type==='result'){var p=pending[m.id];if(p){delete pending[m.id];clearTimeout(p.t);p.res(m)}}};
 W.onerror=function(e){fail('The Python engine could not start (are you offline?).')};
 setTimeout(function(){if(state==='loading')fail('The Python engine took too long to load (slow or offline connection).')},90000)}
function fail(msg){state='failed';failMsg=msg;try{W&&W.terminate()}catch(e){}W=null;waiters.splice(0).forEach(function(w){w(false)});Object.keys(pending).forEach(function(k){var p=pending[k];delete pending[k];clearTimeout(p.t);p.res({error:'Python engine stopped'})})}
function ready(){return new Promise(function(res){if(state==='ready')return res(true);if(state==='failed')boot();waiters.push(res);boot()})}
function call(kind,code,tests){return ready().then(function(ok){if(!ok)return {error:failMsg||'Python engine unavailable',unavailable:true};
 return new Promise(function(res){var id=++seq;pending[id]={res:res,t:setTimeout(function(){delete pending[id];try{W.terminate()}catch(e){}W=null;state='idle';res({error:'Your code ran for more than 8 seconds and was stopped. Check for a loop that never ends.',timeout:true})},8000)};
  W.postMessage({id:id,kind:kind,code:code,tests:tests})})})}
function mount(q,el,ctx){
 var code=q.starter,hints=0,tries=0,solved=false,gaveUp=false;
 var vis=(q.tests||[]).filter(function(t){return !t.hidden}).length,hid=(q.tests||[]).length-vis;
 var h='<section class="panel codeq"><p class="small dim">'+esc(ctx.title)+' · question '+(ctx.idx+1)+' of '+ctx.total+'</p><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.round(100*ctx.idx/ctx.total)+'%"></i></div><p class="kicker">Python challenge</p><h3 style="color:var(--ink);font-family:var(--font);font-size:18px;line-height:1.4">'+esc(q.title)+'</h3><div class="cq-prompt">'+q.q+'</div>'
 +'<label class="small dim" for="cq-ed">Your code (Tab indents, Shift+Tab un-indents, Enter keeps your indent)</label><div class="cq-edwrap"><div class="cq-gut" aria-hidden="true"><div class="cq-gin"></div></div><textarea id="cq-ed" class="cq-ed" spellcheck="false" autocapitalize="off" autocomplete="off" rows="14" wrap="off"></textarea></div>'
 +'<div class="row cq-btns"><button class="btn btn-ghost" id="cq-run">Run</button><button class="btn btn-primary" id="cq-chk">Check ('+vis+' shown, '+hid+' hidden tests)</button></div>'
 +'<div id="cq-out" class="cq-out" aria-live="polite"></div><div class="row cq-btns2"><button class="btn btn-ghost btn-sm" id="cq-hint">Hint</button><button class="btn btn-ghost btn-sm" id="cq-reset">Reset code</button><button class="btn btn-ghost btn-sm" id="cq-giveup">Show solution (counts as unsolved)</button></div><div id="cq-hints"></div><div id="cq-end"></div></section>';
 el.innerHTML=h;
 var ed=el.querySelector('#cq-ed'),out=el.querySelector('#cq-out');ed.value=code;
 var gin=el.querySelector('.cq-gin');
 function gutter(){var n=ed.value.split('\n').length,h='';for(var i=1;i<=n;i++)h+=i+'\n';gin.textContent=h;gin.style.transform='translateY('+(-ed.scrollTop)+'px)'}
 gutter();ed.addEventListener('input',gutter);ed.addEventListener('scroll',function(){gin.style.transform='translateY('+(-ed.scrollTop)+'px)'});
 function lineStart(v,i){return v.lastIndexOf('\n',i-1)+1}
 var kd=function(e){var v=ed.value,s0=ed.selectionStart,t0=ed.selectionEnd;
  if(e.key==='Tab'){e.preventDefault();
   var ls=lineStart(v,s0),multi=v.slice(s0,t0).indexOf('\n')>=0;
   if(e.shiftKey||multi){var blockEnd=t0,lines=v.slice(ls,blockEnd).split('\n'),removed0=0,total=0;
    var out=lines.map(function(l,k){if(e.shiftKey){var m=l.match(/^( {1,4}|\t)/),r=m?m[0].length:0;if(k===0)removed0=r;total+=r;return l.slice(r)}total+=4;if(k===0)removed0=-4;return '    '+l});
    ed.value=v.slice(0,ls)+out.join('\n')+v.slice(blockEnd);
    var d0=e.shiftKey?-Math.min(removed0,s0-ls):4;ed.selectionStart=Math.max(ls,s0+d0);ed.selectionEnd=e.shiftKey?t0-total:t0+total}
   else{ed.value=v.slice(0,s0)+'    '+v.slice(t0);ed.selectionStart=ed.selectionEnd=s0+4}
   gutter()}
  else if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();
   var ls2=lineStart(v,s0),cur=v.slice(ls2,s0),ind=cur.match(/^[ \t]*/)[0];
   if(/:\s*$/.test(cur.replace(/#.*$/,'')))ind+='    ';
   ed.value=v.slice(0,s0)+'\n'+ind+v.slice(t0);ed.selectionStart=ed.selectionEnd=s0+1+ind.length;gutter();
   var lh=21,top=ed.selectionStart&&ed.value.slice(0,ed.selectionStart).split('\n').length*lh;if(top-ed.scrollTop>ed.clientHeight-lh)ed.scrollTop=top-ed.clientHeight+lh*2}
  else if(e.key==='Backspace'&&s0===t0&&s0>0){var ls3=lineStart(v,s0),before=v.slice(ls3,s0);
   if(before.length>=4&&/^ +$/.test(before)&&before.length%4===0){e.preventDefault();ed.value=v.slice(0,s0-4)+v.slice(s0);ed.selectionStart=ed.selectionEnd=s0-4;gutter()}}
  else if(e.key==='Escape'){ed.blur()}
  e.stopPropagation()};
 ed.addEventListener('keydown',kd);ed.addEventListener('keyup',function(e){e.stopPropagation()});
 function busy(m){out.className='cq-out';out.innerHTML='<span class="dim">'+esc(m)+'</span>'}
 function loadMsg(){return state==='ready'?'Running…':'Loading the Python engine (about 10 MB, first time only)…'}
 function unavailable(r){out.className='cq-out bad';out.innerHTML='<b>Python could not run here.</b> '+esc(r.error)+'<div class="small dim" style="margin-top:6px">The challenge needs an internet connection to fetch the Python engine. You can retry, or skip it (it will count as unsolved, and the rest of the level still works).</div><div class="row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" id="cq-retry">Retry</button><button class="btn btn-ghost btn-sm" id="cq-skip">Skip this challenge</button></div>';
  out.querySelector('#cq-retry').onclick=function(){state='idle';busy(loadMsg());call('code','pass',null).then(function(r2){if(r2.unavailable)unavailable(r2);else{out.className='cq-out ok';out.textContent='Python is ready. Press Run or Check.'}})};
  out.querySelector('#cq-skip').onclick=function(){lock();ctx.done(false)}}
 function lock(){solved=true;ed.readOnly=true;['#cq-run','#cq-chk','#cq-hint','#cq-reset','#cq-giveup'].forEach(function(s){var b=el.querySelector(s);if(b)b.disabled=true})}
 el.querySelector('#cq-run').onclick=function(){if(solved)return;busy(loadMsg());call('code',ed.value).then(function(r){if(r.unavailable)return unavailable(r);if(r.error){out.className='cq-out bad';out.textContent=r.error;return}var d=r.data;out.className='cq-out'+(d.err?' bad':'');out.innerHTML=(d.out?'<pre>'+esc(d.out)+'</pre>':'')+(d.err?'<b>Error:</b> '+esc(d.err):(d.out?'':'<span class="dim">Ran with no printed output. Use print(...) to see values, or press Check.</span>'))})};
 el.querySelector('#cq-chk').onclick=function(){if(solved)return;tries++;hintBtn();busy(loadMsg());call('tests',ed.value,JSON.stringify(q.tests.map(function(t){return {code:t.code}}))).then(function(r){
  if(r.unavailable)return unavailable(r);if(r.error){out.className='cq-out bad';out.textContent=r.error;return}
  var d=r.data;if(d.err){out.className='cq-out bad';out.innerHTML='<b>Your code has an error:</b> '+esc(d.err);return}
  var pass=0,rows='',hn=0,hfail=0;d.res.forEach(function(x,i){var t=q.tests[i];if(x.ok)pass++;if(t.hidden){hn++;if(!x.ok)hfail++}else rows+='<div class="cq-t '+(x.ok?'ok':'no')+'">'+(x.ok?'✔ ':'✘ ')+esc(t.n)+(x.ok?'':'<div class="small">'+esc(x.msg||'failed')+'</div>')+'</div>'});
  var hmsgs=[];d.res.forEach(function(x,i){if(q.tests[i].hidden&&!x.ok)hmsgs.push(x.msg||'failed')});
  rows+='<div class="cq-t '+(hfail?'no':'ok')+'">'+(hfail?'✘ ':'✔ ')+'Hidden tests: '+(hn-hfail)+' of '+hn+' passed'+(hmsgs.length?hmsgs.map(function(m){return '<div class="small">Failed: '+esc(m)+'</div>'}).join(''):'')+'</div>';
  if(pass===d.res.length){out.className='cq-out ok';out.innerHTML='<b>All '+pass+' tests pass.</b>'+rows;finish(true)}
  else{out.className='cq-out bad';out.innerHTML='<b>'+pass+' of '+d.res.length+' tests pass.</b>'+rows}})};
 function finish(ok){lock();var E=window.Engine;if(ok&&E&&E.codeSolved)E.codeSolved(q.id);var end=el.querySelector('#cq-end');end.innerHTML='<div class="fb ok"><b>Solved. </b>'+(q.why||'')+'</div><button class="btn btn-primary" id="cq-next">Next</button>';end.querySelector('#cq-next').onclick=function(){ctx.done(true)}}
 function hintBtn(){var b=el.querySelector('#cq-hint'),hs=q.hints||[];if(hints>=hs.length){b.disabled=true;b.textContent='No more hints';return}b.disabled=false;b.textContent=(hints>=1&&tries<hints)?'Next hint (press Check first)':(hints?'Next hint':'Hint')}
 el.querySelector('#cq-hint').onclick=function(){var hs=q.hints||[];if(hints>=hs.length)return;if(hints>=1&&tries<hints){out.className='cq-out';out.innerHTML='<span class="dim">Try the hint you have, then press Check at least '+hints+' time'+(hints>1?'s':'')+' before the next hint opens. Working it out yourself is the point.</span>';return}hints++;el.querySelector('#cq-hints').innerHTML=hs.slice(0,hints).map(function(x,i){return '<div class="cq-hintbox"><b>Hint '+(i+1)+':</b> '+x+'</div>'}).join('');hintBtn()};
 el.querySelector('#cq-reset').onclick=function(){if(!solved&&confirm('Reset to the starter code?'))ed.value=q.starter};
 el.querySelector('#cq-giveup').onclick=function(){if(solved)return;lock();gaveUp=true;var end=el.querySelector('#cq-end');end.innerHTML='<div class="fb no"><b>Model solution (one of several valid ones):</b><pre class="cq-sol">'+esc(q.solution)+'</pre>'+(q.why||'')+'</div><button class="btn btn-primary" id="cq-next">Next</button>';end.querySelector('#cq-next').onclick=function(){ctx.done(false)}};
 /* warm the engine in the background so Run feels quick */
 setTimeout(boot,50);
}
window.CodeQ={mount:mount,boot:boot,state:function(){return state}};
})();
