/* Context Bench: what fits in a pretend context window, what a cache saves, and what it costs. Every size and price here is MADE UP for practice. */
(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var SYS=800,TOOLS=1500,Q=200,TURN=600,OUT=500,P_IN=4,P_CA=0.4,P_OUT=20; /* dollars per million tokens, example only */
function k(n){return n>=1000?(n/1000).toFixed(n%1000?1:0)+'k':String(n)}
function usd(x){return '$'+(x<0.01?x.toFixed(4):x.toFixed(2))}
function bench(host){
 var s={win:32000,doc:12000,turns:10,room:1500,cache:true,calls:20};
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>Context Bench</h3><p class="dim small">A pretend model with a pretend context window. Move the sliders and see what fits, which text drops out, and what a call costs. <b>All sizes and prices are made up for practice</b> (example input $'+P_IN+', cached $'+P_CA+', output $'+P_OUT+' per million tokens). Real ones differ and change, so check a provider\'s price page.</p>'
 +'<div class="sim-row"><label>Window size <select id="cb-w"><option value="8000">8k tokens</option><option value="32000" selected>32k tokens</option><option value="100000">100k tokens</option><option value="200000">200k tokens</option></select></label></div>'
 +'<div class="sim-row"><label>Reference document pasted in: <b id="cb-dv"></b><input type="range" id="cb-d" min="0" max="150000" step="1000" value="12000"></label></div>'
 +'<div class="sim-row"><label>Conversation so far: <b id="cb-tv"></b> turns (about '+TURN+' tokens each)<input type="range" id="cb-t" min="0" max="80" step="1" value="10"></label></div>'
 +'<div class="sim-row"><label>Room kept free for the answer: <b id="cb-rv"></b><input type="range" id="cb-r" min="500" max="8000" step="500" value="1500"></label></div>'
 +'<div class="sim-row"><label><input type="checkbox" id="cb-c" checked> Cache the unchanged start (instructions, tools, document)</label></div>'
 +'<div class="sim-row"><label>Calls using the same start: <b id="cb-nv"></b><input type="range" id="cb-n" min="1" max="100" step="1" value="20"></label></div>'
 +'<div id="cb-bar" role="img"></div><div id="cb-out"></div><p class="small dim">Try this: grow the document until the oldest turns drop out, then until nothing fits at all. Then tick the cache and watch the price of 20 calls. A cache never makes more room: cached text still sits in the window.</p></section>';
 var $=function(q){return host.querySelector(q)};
 function draw(){
  var fixed=SYS+TOOLS+s.doc+Q,histAll=s.turns*TURN,avail=s.win-fixed-s.room,impossible=avail<0,
   keptTurns=impossible?0:Math.min(s.turns,Math.floor(avail/TURN)),kept=keptTurns*TURN,droppedTurns=s.turns-keptTurns;
  var parts=[['Instructions',SYS,'#6a8a3a'],['Tools',TOOLS,'#3f5f8f'],['Document',s.doc,'#8a5a2a'],['Conversation',kept,'#6a4a8f'],['Your question',Q,'#2f6a62'],['Answer room',s.room,'#7a2f3a']];
  var used=parts.reduce(function(a,p){return a+p[1]},0),free=Math.max(0,s.win-used);
  var h='<div style="display:flex;height:26px;border:1px solid #6b4a0e;border-radius:8px;overflow:hidden;background:#0b1118">';
  parts.forEach(function(p){var w=Math.min(100,p[1]/Math.max(s.win,used)*100);if(w>0)h+='<span title="'+esc(p[0])+': '+p[1]+' tokens" style="width:'+w+'%;background:'+p[2]+'"></span>'});
  h+='</div><p class="small" style="margin:6px 0">'+parts.map(function(p){return '<span style="color:'+p[2]+'">&#9632;</span> '+esc(p[0])+' '+k(p[1])}).join(' &nbsp; ')+'</p>';
  $('#cb-bar').innerHTML=h;
  var msg;
  if(impossible)msg='<p class="small" style="color:#e0a0a0"><b>Does not fit.</b> The instructions, tools, document, your question and the answer room already need '+k(used)+' tokens, more than the '+k(s.win)+' window, even with no conversation. Shrink the document, or use a bigger window.</p>';
  else if(droppedTurns>0)msg='<p class="small" style="color:#e8c070"><b>The oldest '+droppedTurns+' turn'+(droppedTurns>1?'s have':' has')+' dropped out.</b> The model can see the newest '+keptTurns+' of '+s.turns+'. Anything said in the dropped turns is invisible to it now.</p>';
  else msg='<p class="small" style="color:#a8d6a0"><b>Everything fits.</b> '+k(free)+' tokens still free.</p>';
  var inTok=fixed+kept,prefix=SYS+TOOLS+s.doc,rest=inTok-prefix;
  var plain=inTok/1e6*P_IN+OUT/1e6*P_OUT,later=(s.cache?prefix/1e6*P_CA+rest/1e6*P_IN:inTok/1e6*P_IN)+OUT/1e6*P_OUT;
  var totalPlain=plain*s.calls,total=plain+later*(s.calls-1);
  var cost=impossible?'':'<div class="sim-grid"><div class="cell"><b>'+usd(plain)+'</b><span>First call (nothing cached yet)</span></div><div class="cell '+(s.cache?'good':'')+'"><b>'+usd(later)+'</b><span>Each later call'+(s.cache?' (start reused from cache)':' (no cache)')+'</span></div><div class="cell"><b>'+usd(total)+'</b><span>All '+s.calls+' calls</span></div><div class="cell"><b>'+usd(totalPlain-total)+'</b><span>Saved by caching, against no cache ('+usd(totalPlain)+')</span></div></div><p class="small dim">Sums are for about '+k(inTok)+' input tokens and '+OUT+' output tokens per call, with the same size every time. Real caches only help while the start is <b>identical</b> and calls come close together, and some services charge a little extra the first time. These are example prices.</p>';
  $('#cb-out').innerHTML=msg+cost;
  $('#cb-dv').textContent=k(s.doc)+' tokens';$('#cb-tv').textContent=s.turns;$('#cb-rv').textContent=k(s.room)+' tokens';$('#cb-nv').textContent=s.calls}
 $('#cb-w').onchange=function(){s.win=+this.value;draw()};
 $('#cb-d').oninput=function(){s.doc=+this.value;draw()};$('#cb-t').oninput=function(){s.turns=+this.value;draw()};$('#cb-r').oninput=function(){s.room=+this.value;draw()};
 $('#cb-c').onchange=function(){s.cache=this.checked;draw()};$('#cb-n').oninput=function(){s.calls=+this.value;draw()};
 draw()}
window.AISims=window.AISims||{};window.AISims.ctxbench=bench;
})();
