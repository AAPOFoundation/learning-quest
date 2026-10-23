/* Autocomplete Workshop: build a tiny word-chain "autocomplete" from text you can edit, then turn the temperature, top-k and top-p dials and generate.
   Toy only: a real model predicts pieces of words with a neural network, not a table of counts. Extends window.AISims. */
(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function lcg(seed){var s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
var SAMPLE='the cat sat on the mat. the cat saw the dog. the dog sat on the rug. the dog saw the cat and the cat ran. a cat sat on a rug. a dog ran to the mat. the cat ran to the dog and the dog sat.';
function words(t){return (t.toLowerCase().match(/[a-z']+|[.]/g)||[])}
function build(t){var w=words(t),m={},i;for(i=0;i+1<w.length;i++){var a=w[i],b=w[i+1];(m[a]=m[a]||{})[b]=(m[a][b]||0)+1}return {m:m,n:w.length,v:Object.keys(m).length}}
/* counts -> probabilities after temperature, top-k, top-p. Returns [{w,raw,p,kept}] sorted by raw prob. */
function dist(counts,T,k,top){var ks=Object.keys(counts),tot=0,i;ks.forEach(function(x){tot+=counts[x]});
 var arr=ks.map(function(x){return {w:x,raw:counts[x]/tot}}).sort(function(a,b){return b.raw-a.raw||(a.w<b.w?-1:1)});
 var s=0;arr.forEach(function(o){o.t=Math.pow(o.raw,1/T);s+=o.t});arr.forEach(function(o){o.t/=s});
 arr.sort(function(a,b){return b.t-a.t||(a.w<b.w?-1:1)});
 var cum=0;arr.forEach(function(o,j){o.kept=(j<k);});
 arr.forEach(function(o){if(o.kept){if(cum>=top)o.kept=false;else cum+=o.t}});
 if(!arr.some(function(o){return o.kept}))arr[0].kept=true;
 var z=0;arr.forEach(function(o){if(o.kept)z+=o.t});arr.forEach(function(o){o.p=o.kept?o.t/z:0});
 return arr}
function pick(arr,r){var u=r(),c=0,i;for(i=0;i<arr.length;i++){c+=arr[i].p;if(u<c&&arr[i].p>0)return arr[i].w}for(i=0;i<arr.length;i++)if(arr[i].p>0)return arr[i].w;return arr[0].w}
function workshop(host){
 var st={T:1,k:10,top:1,seed:1,start:'the'},chain=build(SAMPLE);
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>Autocomplete Workshop</h3>'
 +'<p class="dim small">A language model is, at heart, a very large autocomplete: given the words so far it scores every possible next piece and picks one. Here is a tiny one. <b>Step 1</b>: it reads some text and counts which word follows which. <b>Step 2</b>: you choose how adventurous the pick is.</p>'
 +'<p class="small dim">1. Text to learn from (edit it, then Build)</p><textarea id="ac-t" rows="5" style="width:100%;background:#0a0f15;color:inherit;border:1px solid #6b4a0e;border-radius:8px;padding:8px" spellcheck="false">'+esc(SAMPLE)+'</textarea>'
 +'<p><button class="btn btn-ghost btn-sm" id="ac-b">Build the chain</button> <span class="small dim" id="ac-info"></span></p>'
 +'<p class="small dim">2. Next-word odds</p><div class="sim-row"><label>Words so far end with <select id="ac-w"></select></label></div>'
 +'<div class="sim-row"><label>Temperature: <b id="ac-tv">1.0</b> <span class="dim small">(low = stick to the likeliest, high = flatter odds)</span><input type="range" id="ac-T" min="0.2" max="3" step="0.1" value="1"></label></div>'
 +'<div class="sim-row"><label>Top-k: <b id="ac-kv">all</b> <span class="dim small">(keep only the k likeliest words)</span><input type="range" id="ac-k" min="1" max="10" step="1" value="10"></label></div>'
 +'<div class="sim-row"><label>Top-p: <b id="ac-pv">1.00</b> <span class="dim small">(keep the smallest group whose odds add up to p)</span><input type="range" id="ac-p" min="0.1" max="1" step="0.05" value="1"></label></div>'
 +'<div id="ac-bars"></div>'
 +'<p class="small dim">3. Generate</p><p><button class="btn btn-primary btn-sm" id="ac-g">Write 5 sentences</button> <button class="btn btn-ghost btn-sm" id="ac-g2">Same dials, new luck</button></p><div id="ac-out" class="ex" style="white-space:pre-wrap"></div>'
 +'<p class="small dim" id="ac-note">Try this: set temperature to 0.2 and generate twice: the text barely changes. Then temperature 3 with top-k and top-p all the way up: odd word choices appear. Then keep the temperature high but set top-k to 2: the oddest choices are cut off. Real models do the same cutting on far bigger lists.</p></section>';
 var $=function(s){return host.querySelector(s)};
 function fillWords(){var ks=Object.keys(chain.m).sort(),sel=$('#ac-w'),keep=st.start;sel.innerHTML=ks.map(function(k){return '<option value="'+esc(k)+'">'+esc(k==='.'?'. (sentence end)':k)+'</option>'}).join('');if(ks.indexOf(keep)<0)keep=ks.indexOf('the')>=0?'the':ks[0];st.start=keep;sel.value=keep;
  $('#ac-info').textContent=chain.n+' words read, '+chain.v+' different words have a next word.'}
 function bars(){var c=chain.m[st.start];if(!c){$('#ac-bars').innerHTML='<p class="small dim">That word was never followed by anything in the text.</p>';return}
  var d=dist(c,st.T,st.k,st.top);
  $('#ac-bars').innerHTML=d.map(function(o){return '<div style="display:flex;align-items:center;gap:8px;margin:3px 0;opacity:'+(o.kept?1:.4)+'"><span style="width:90px">'+esc(o.w==='.'?'. (end)':o.w)+'</span><span style="flex:1;background:#0a0f15;border-radius:6px;overflow:hidden;height:14px"><span style="display:block;height:14px;width:'+Math.round(o.p*100)+'%;background:'+(o.kept?'#d7b56a':'#6b4a0e')+'"></span></span><span class="small" style="width:150px">'+(o.kept?Math.round(o.p*100)+'%':'cut off')+' <span class="dim">(raw '+Math.round(o.raw*100)+'%)</span></span></div>'}).join('')}
 function gen(){var r=lcg(st.seed*7919+13),out=[],sent=0,w=st.start==='.'?'the':st.start,cur=[],guard=0;
  if(!chain.m[w]){$('#ac-out').textContent='Pick a word that has followers.';return}
  cur.push(w);
  while(sent<5&&guard++<200){var c=chain.m[w];if(!c){break}var d=dist(c,st.T,st.k,st.top),nx=pick(d,r);if(nx==='.'){out.push(cur.join(' ')+'.');cur=[];sent++;var ks=Object.keys(chain.m).filter(function(x){return x!=='.'});w=ks[Math.floor(r()*ks.length)];cur.push(w);continue}cur.push(nx);w=nx}
  if(cur.length&&sent<5)out.push(cur.join(' ')+' …');
  $('#ac-out').textContent=out.join('\n')}
 $('#ac-b').onclick=function(){var c=build($('#ac-t').value);if(c.v<2){$('#ac-info').textContent='Write a few more words (at least two sentences).';return}chain=c;fillWords();bars()};
 $('#ac-w').onchange=function(){st.start=this.value;bars()};
 $('#ac-T').oninput=function(){st.T=+this.value;$('#ac-tv').textContent=st.T.toFixed(1);bars()};
 $('#ac-k').oninput=function(){st.k=+this.value;$('#ac-kv').textContent=st.k>=10?'all':st.k;bars()};
 $('#ac-p').oninput=function(){st.top=+this.value;$('#ac-pv').textContent=st.top.toFixed(2);bars()};
 $('#ac-g').onclick=function(){st.seed=1;gen()};$('#ac-g2').onclick=function(){st.seed++;gen()};
 fillWords();bars();gen()}
window.AISims=window.AISims||{};window.AISims.workshop=workshop;window.AISims._ac={dist:dist,build:build};
})();
