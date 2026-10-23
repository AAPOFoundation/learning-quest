/* Spaced review deck + boss round + real-model practice exercises. Adds tabs to window.APP. Loaded after the world's extra.js. */
(function(){
var A=window.APP;if(!A)return;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var KEY='learning-apps.'+A.key+'.review',DAY=864e5,GAP=[0,1,3,7,14,30];
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function store(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function cleared(L){try{var r=window.Engine.P().levels[L.id];return !!(r&&r.done)}catch(e){return false}}
function cards(){var out=[];A.levels.forEach(function(L,li){if(!cleared(L))return;L.qs.forEach(function(q,qi){if(q.t==='mc'&&q.opts&&q.opts.length>1)out.push({id:L.id+':'+qi+':'+String(q.q).length,q:q,level:L.title})})});return out}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function cheerEnd(pct){var C=window.LQCelebrate;if(!C)return;if(pct>=80)C.celebrate(pct===100?'Perfect round!':'Great work!');else C.cheer('Nice practice!')}
function review(el){
 var st=load(),all=cards(),now=Date.now();
 function due(){return all.filter(function(c){var s=st[c.id];return !s||s.due<=now})}
 function home(){if(!all.length){el.innerHTML='<div class="panel lesson"><p class="kicker">Review deck</p><p>Clear your first level and its questions will appear here. The deck only uses levels you have already cleared, so nothing from later regions is shown early.</p></div>';return}
  var d=due(),seen=Object.keys(st).length,mastered=all.filter(function(c){return st[c.id]&&st[c.id].box>=4}).length;
  el.innerHTML='<div class="panel lesson"><p class="kicker">Review deck</p><p>Questions you have met come back on a schedule (1, 3, 7, 14 and 30 days) so they stick. A miss sends a card back to the start. Nothing leaves this browser.</p><p class="small dim">'+all.length+' cards in this world &middot; '+seen+' started &middot; '+mastered+' well learned &middot; <b>'+d.length+' due now</b></p><div class="row"><button class="btn btn-primary" id="rv-go" style="animation:pop .22s ease backwards">'+(d.length?'Review '+Math.min(d.length,12)+' due cards':'Practise 8 random cards')+'</button><button class="btn btn-ghost" id="rv-boss" style="animation:pop .22s ease backwards;animation-delay:.08s">Mixed practice: 10 questions</button></div></div>';
  el.querySelector('#rv-go').onclick=function(){run(d.length?shuffle(d).slice(0,12):shuffle(all).slice(0,8),false)};
  el.querySelector('#rv-boss').onclick=function(){run(shuffle(all).slice(0,10),true)}}
 function run(deck,boss){var i=0,right=0;
  function show(){if(i>=deck.length){var pct=Math.round(100*right/deck.length);el.innerHTML='<div class="panel lesson lq-enter"><p class="kicker">'+(boss?'Mixed round':'Review')+' complete</p><h3>'+right+' of '+deck.length+' ('+pct+'%)</h3><p>'+(pct>=80?'Strong. The cards you got right will come back later.':'Good practice. Missed cards return soon; re-read the matching lesson if one keeps slipping.')+'</p><p><button class="btn btn-primary" id="rv-home" style="animation:pop .22s ease backwards">Back to deck</button></p></div>';el.querySelector('#rv-home').onclick=home;cheerEnd(pct);return}
   var c=deck[i],q=c.q,order=shuffle(q.opts.map(function(_,k){return k}));
   var h='<div class="panel lesson lq-enter"><p class="kicker">'+(boss?'Mixed round ':'Review ')+(i+1)+' of '+deck.length+' &middot; '+esc(c.level)+'</p><div class="bar" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="'+deck.length+'" aria-valuenow="'+i+'" style="margin:0 0 12px"><i style="width:0%"></i></div><p><b>'+q.q+'</b></p>'+(q.ex?'<div class="ex">'+esc(q.ex)+'</div>':'');
   order.forEach(function(k,n){h+='<button class="opt" data-k="'+k+'" style="animation:pop .22s ease backwards;animation-delay:'+(n*40)+'ms">'+q.opts[k]+'</button>'});
   h+='<div id="rv-fb"></div></div>';el.innerHTML=h;
   el.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){var k=+b.getAttribute('data-k'),ok=k===q.a;
    el.querySelectorAll('.opt').forEach(function(x){x.disabled=true;x.style.animation='';var kk=+x.getAttribute('data-k');if(kk===q.a)x.className+=' ok';else if(x===b)x.className+=' no'});
    var s=st[c.id]||{box:0};s.box=ok?Math.min(s.box+1,GAP.length-1):0;s.due=Date.now()+GAP[s.box]*DAY;st[c.id]=s;store(st);if(ok)right++;
    var fb=el.querySelector('#rv-fb');fb.className='fb '+(ok?'ok':'no');fb.setAttribute('role','status');fb.innerHTML='<p style="animation:pop .22s ease"><b>'+(ok?'Correct.':'Not quite.')+'</b> '+(q.why||'')+'</p><button class="btn btn-primary" id="rv-nx" style="animation:pop .22s ease backwards;animation-delay:.06s">'+(i+1>=deck.length?'Finish':'Next')+'</button>';
    var nx=el.querySelector('#rv-nx');nx.onclick=function(){i++;show()};try{nx.focus({preventScroll:true})}catch(e){}
    if(ok&&window.LQCelebrate)LQCelebrate.pop(b);else if(!ok)b.style.animation='optno .28s ease'}})}
  show()}
 home()}
A.tabs=A.tabs||[];
A.tabs.push({id:'review',label:'Review deck',render:review});
if(A.practice){A.tabs.push({id:'practice',label:'Real-model practice',render:function(el){
 var P=A.practice;
 var h='<div class="panel lesson"><p class="kicker">Real-model practice</p><p>'+P.intro+'</p><p class="small dim">These are exercises to do on your own computer with the free, open-source <b>Inspect</b> framework from the UK AI Security Institute. They are not run or checked by this game. Check the <a href="https://inspect.aisi.org.uk/" target="_blank" rel="noopener noreferrer">official Inspect documentation</a> for current commands, since the tool changes. Running a real model through an API usually costs money; set a spending limit first and keep all prompts harmless.</p><h3>Setup (one time)</h3><pre class="ex">'+esc(P.setup)+'</pre>';
 P.exercises.forEach(function(x,i){h+='<h3>'+(i+1)+'. '+esc(x.t)+'</h3><p>'+x.goal+'</p><ul>'+x.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul>'+(x.code?'<pre class="ex">'+esc(x.code)+'</pre>':'')+'<p class="small dim"><b>You have it when:</b> '+x.done+'</p>'});
 h+='<p class="small dim">'+P.safety+'</p></div>';el.innerHTML=h}})}
})();
