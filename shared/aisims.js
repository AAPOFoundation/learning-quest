/* Three small simulators for the AI worlds. All data is made up; nothing here is real model output. */
(function(){
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function lcg(seed){var s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function gauss(r){var u=Math.max(r(),1e-9),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function clip(x){return Math.max(0.01,Math.min(0.99,x))}
function f1(x,d){return (+x).toFixed(d===undefined?2:d)}
var RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
function calm(){return !!(RM&&RM.matches)}
/* ---------- 1. confusion matrix and threshold ---------- */
function confusion(host,cfg){
 cfg=cfg||{};var bad=cfg.bad||'bad answers',who=cfg.who||'an automatic grader',missName=cfg.missName||'missed bad answer',alarmName=cfg.alarmName||'false alarm';
 function make(nPos,nNeg){var r=lcg(7),a=[],i;for(i=0;i<nPos;i++)a.push({s:clip(.66+.17*gauss(r)),y:1});for(i=0;i<nNeg;i++)a.push({s:clip(.36+.17*gauss(r)),y:0});return a}
 var sets={bal:make(30,30),rare:make(6,54)},mode='bal',th=.5,cost=1;
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>Where do you set the threshold?</h3><p class="dim small">'+esc(who.charAt(0).toUpperCase()+who.slice(1))+' gives each of 60 test items a score from 0 to 1. Items scoring at or above the threshold are <b>flagged</b> as '+esc(bad)+'. Gold dots are items that really are bad; blue dots are fine. Made-up data.</p>'
 +'<div class="sim-row"><label>Mix of items <select id="cx-mode"><option value="bal">Half bad, half fine (30 / 30)</option><option value="rare">Bad is rare (6 / 54)</option></select></label></div>'
 +'<div class="sim-row"><label>Threshold: <b id="cx-tv">0.50</b><input type="range" id="cx-th" min="0.05" max="0.95" step="0.01" value="0.5"></label></div>'
 +'<div class="sim-row"><label>A '+esc(missName)+' costs <b id="cx-cv">1</b>x as much as a '+esc(alarmName)+'<input type="range" id="cx-cost" min="1" max="10" step="1" value="1"></label></div>'
 +'<svg id="cx-svg" viewBox="0 0 600 120" role="img" aria-label="Scores of test items with the threshold line" style="width:100%;height:auto"></svg>'
 +'<div id="cx-out"></div><p class="small dim" id="cx-note"></p></section>';
 var $=function(s){return host.querySelector(s)};
 var cxAt=null,cxTo=0,cxRaf=0,cxLast=0;
 function paintCx(){var line=$('#cx-line'),lab=$('#cx-lab');if(!line)return;var x=cxAt==null?cxTo:cxAt;line.setAttribute('x1',x);line.setAttribute('x2',x);if(lab)lab.setAttribute('x',Math.min(x+4,540))}
 function aimCx(x){cxTo=x;if(cxAt==null||calm()){cxAt=x;if(cxRaf){cancelAnimationFrame(cxRaf);cxRaf=0}paintCx();return}paintCx();if(Math.abs(cxTo-cxAt)<.4){cxAt=cxTo;paintCx();return}if(cxRaf)return;cxLast=performance.now();
  function tick(now){var dt=Math.min(.05,(now-cxLast)/1000||0);cxLast=now;cxAt+=(cxTo-cxAt)*(1-Math.exp(-dt/.08));if(Math.abs(cxTo-cxAt)<.4){cxAt=cxTo;cxRaf=0;paintCx();return}paintCx();cxRaf=requestAnimationFrame(tick)}
  cxRaf=requestAnimationFrame(tick)}
 function draw(){var d=sets[mode],tp=0,fp=0,fn=0,tn=0,svgEl=$('#cx-svg');
  if(svgEl.dataset.mode!==mode){svgEl.dataset.mode=mode;var h='<rect x="0" y="0" width="600" height="120" rx="8" fill="#0b1118"/>';d.forEach(function(it,i){var x=10+it.s*580,y=14+((i*37)%92);h+='<circle cx="'+x+'" cy="'+y+'" r="5.2" fill="'+(it.y?'#d7b56a':'#4f86c6')+'"/>'});h+='<line id="cx-line" y1="0" y2="120" stroke="#e58a7a" stroke-width="2"/><text id="cx-lab" y="12" fill="#e58a7a" font-size="11">flag here and above</text>';svgEl.innerHTML=h}
  var nodes=svgEl.querySelectorAll('circle');
  d.forEach(function(it,i){var fl=it.s>=th;if(it.y&&fl)tp++;else if(!it.y&&fl)fp++;else if(it.y)fn++;else tn++;var c=nodes[i];if(!c)return;c.style.opacity=fl?'1':'.55';c.setAttribute('stroke',fl?'#fff':'none');c.setAttribute('stroke-width','1')});
  aimCx(10+th*580);
  var prec=tp+fp?tp/(tp+fp):null,rec=tp+fn?tp/(tp+fn):null,acc=(tp+tn)/d.length,f=prec&&rec?2*prec*rec/(prec+rec):null,total=fn*cost+fp;
  var best=1e9,bt=th;for(var t=5;t<=95;t++){var tt=t/100,a=0,b=0;d.forEach(function(it){var fl=it.s>=tt;if(it.y&&!fl)a++;else if(!it.y&&fl)b++});var c=a*cost+b;if(c<best){best=c;bt=tt}}
  $('#cx-out').innerHTML='<div class="sim-grid"><div class="cell good"><b>'+tp+'</b><span>Flagged and truly bad (true positive)</span></div><div class="cell warn"><b>'+fp+'</b><span>Flagged but fine ('+esc(alarmName)+', false positive)</span></div><div class="cell bad"><b>'+fn+'</b><span>Not flagged but truly bad ('+esc(missName)+', false negative)</span></div><div class="cell good"><b>'+tn+'</b><span>Not flagged and fine (true negative)</span></div></div>'
   +'<p><b>Precision</b> '+(prec===null?'n/a (nothing flagged)':f1(prec))+' &middot; <b>Recall</b> '+(rec===null?'n/a':f1(rec))+' &middot; <b>F1</b> '+(f===null?'n/a':f1(f))+' &middot; <b>Accuracy</b> '+f1(acc)+'</p><p>Total cost: <b>'+total+'</b> (misses x '+cost+' + false alarms). Lowest cost on this data is near threshold <b>'+f1(bt)+'</b> (cost '+best+').</p>';
  $('#cx-note').textContent=mode==='rare'?'Try this: with bad items rare, a threshold of 0.95 flags almost nothing and still scores high accuracy. Accuracy alone can hide a grader that misses nearly everything that matters.':'Try this: slide the threshold up and watch precision rise while recall falls. Then raise the cost of a miss and see where the best threshold moves.'}
 $('#cx-mode').onchange=function(){mode=this.value;draw()};$('#cx-th').oninput=function(){th=+this.value;$('#cx-tv').textContent=f1(th);draw()};$('#cx-cost').oninput=function(){cost=+this.value;$('#cx-cv').textContent=cost;draw()};draw()}
/* ---------- 2. learning rate ---------- */
function lr(host){
 var W0=-4,W_MIN=3,steps=15,rate=.1;
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>How big a step?</h3><p class="dim small">Gradient descent walks downhill on a loss curve. Here the loss is the simple bowl <code>(w - 3)²</code>, starting at w = -4, taking 15 steps of <code>w = w - rate × slope</code>. Real models have millions of weights and bumpy surfaces, but too small and too large steps behave in just these ways.</p>'
 +'<div class="sim-row"><label>Learning rate: <b id="lr-v">0.10</b><input type="range" id="lr-r" min="0.01" max="1.3" step="0.01" value="0.1"></label></div><svg id="lr-svg" viewBox="0 0 600 220" style="width:100%;height:auto" role="img" aria-label="Loss bowl with the path of the steps"></svg><div id="lr-out"></div></section>';
 var $=function(s){return host.querySelector(s)};
 function f(w){return (w-W_MIN)*(w-W_MIN)}
 var shown=null,tgt=null,raf=0,tickAt=0;
 function X(v){return 30+(v+8)/22*540}
 function Y(v){var Ymax=140;return 200-Math.max(0,Math.min(v,Ymax))/Ymax*180}
 function ensure(){var svg=$('#lr-svg');if(svg.dataset.ready)return;svg.dataset.ready='1';
  var bowl='',x;for(x=-8;x<=14;x+=.25)bowl+=X(x).toFixed(1)+','+Y(f(x)).toFixed(1)+' ';
  var gx=X(W_MIN),h='<rect width="600" height="220" rx="8" fill="#0b1118"/><polyline fill="none" stroke="#6a7886" stroke-width="2" points="'+bowl+'"/>';
  h+='<line x1="'+gx+'" y1="20" x2="'+gx+'" y2="205" stroke="#4f7a3a" stroke-dasharray="4 4"/><text x="'+(gx+4)+'" y="30" fill="#8fbf6a" font-size="11">lowest loss</text>';
  h+='<path id="lr-path" d="" fill="none" stroke="#e58a7a" stroke-width="1.2" opacity=".7"/>';
  for(var i=0;i<steps+1;i++)h+='<circle r="'+(i===0?6:4)+'" fill="'+(i===0?'#d7b56a':'#e58a7a')+'" cx="30" cy="200"/>';
  svg.innerHTML=h}
 function paint(){var svg=$('#lr-svg'),path=svg.querySelector('#lr-path'),cs=svg.querySelectorAll('circle'),d='',i,started=false,p,c;
  for(i=0;i<shown.length;i++){p=shown[i];c=cs[i];if(c){c.setAttribute('cx',p.x.toFixed(1));c.setAttribute('cy',p.y.toFixed(1))}if(p.skip)continue;d+=(started?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)+' ';started=true}
  if(path)path.setAttribute('d',d)}
 function loop(now){var dt=Math.min(.05,(now-tickAt)/1000||0);tickAt=now;var k=1-Math.exp(-dt/.09),far=false,i,a,b;
  for(i=0;i<shown.length;i++){a=shown[i];b=tgt[i];a.x+=(b.x-a.x)*k;a.y+=(b.y-a.y)*k;a.skip=b.skip;if(Math.abs(b.x-a.x)>.6||Math.abs(b.y-a.y)>.6)far=true}
  paint();if(far)raf=requestAnimationFrame(loop);else{raf=0;for(i=0;i<shown.length;i++){shown[i].x=tgt[i].x;shown[i].y=tgt[i].y;shown[i].skip=tgt[i].skip}paint()}}
 function draw(){ensure();var ws=[W0],w=W0,i;for(i=0;i<steps;i++){w=w-rate*2*(w-W_MIN);ws.push(w)}
  tgt=ws.map(function(v){return {x:Math.max(8,Math.min(592,X(v))),y:Y(f(v)),skip:Math.abs(v)>1e6}});
  if(!shown||calm()){shown=tgt.map(function(p){return {x:p.x,y:p.y,skip:p.skip}});if(raf){cancelAnimationFrame(raf);raf=0}paint()}
  else if(!raf){tickAt=performance.now();raf=requestAnimationFrame(loop)}
  var last=ws[ws.length-1],loss=f(last),msg;
  if(rate>1.0001)msg='<b>Diverging.</b> Each step overshoots by more than it corrects, so the loss grows. This is what a learning rate that is too high looks like.';
  else if(Math.abs(rate-1)<1e-9)msg='<b>Stuck bouncing.</b> The steps jump from one side to the other and never settle.';
  else if(Math.abs(rate-.5)<.015)msg='<b>One big step lands almost on the bottom.</b> This only happens because this bowl is perfectly round; real surfaces are never this kind.';
  else if(rate>.5)msg='<b>Overshoots, then settles.</b> It crosses the bottom each step but the swings shrink. Wasteful, and risky on a bumpy surface.';
  else if(rate<.05)msg='<b>Crawling.</b> It is heading the right way but would need far more steps. Training would be slow and expensive.';
  else msg='<b>Steady progress.</b> Each step gets closer without overshooting.';
  $('#lr-out').innerHTML='<p>After '+steps+' steps: w = <b>'+(Math.abs(last)>1e6?'a huge number':f1(last)) +'</b>, loss = <b>'+(loss>1e6?'huge':f1(loss))+'</b></p><p>'+msg+'</p>'}
 $('#lr-r').oninput=function(){rate=+this.value;$('#lr-v').textContent=f1(rate);draw()};draw()}
/* ---------- 3. softmax temperature ---------- */
function softmax(host){
 var toks=['the','a','this','one','banana'],logits=[2.4,1.6,1.0,.2,-1.6],T=1,sampleTxt='';
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>Temperature</h3><p class="dim small">A language model gives every possible next word a score (a <b>logit</b>). Softmax turns the scores into probabilities: <code>p = exp(score / T) / sum of exp(score / T)</code>. The temperature T controls how sharply the top word dominates. These five words and scores are made up.</p>'
 +'<div class="sim-row"><label>Temperature T: <b id="sm-v">1.00</b><input type="range" id="sm-t" min="0.1" max="3" step="0.05" value="1"></label></div><div id="sm-bars"></div><div id="sm-out"></div><p><button class="btn btn-ghost btn-sm" id="sm-draw">Draw 30 words</button></p><p class="small" id="sm-s"></p></section>';
 var $=function(s){return host.querySelector(s)};
 function probs(){var z=logits.map(function(x){return x/T}),m=Math.max.apply(null,z),e=z.map(function(x){return Math.exp(x-m)}),s=e.reduce(function(a,b){return a+b},0);return e.map(function(x){return x/s})}
 function draw(){var p=probs(),h=0,box=$('#sm-bars');p.forEach(function(x){if(x>0)h-=x*Math.log2(x)});
  if(box.children.length!==toks.length)box.innerHTML=toks.map(function(t){return '<div class="sm-bar"><span class="sm-t">'+t+'</span><span class="sm-b"><i></i></span><span class="sm-p"></span></div>'}).join('');
  [].forEach.call(box.children,function(row,i){var bar=row.querySelector('i'),pct=(p[i]*100).toFixed(1)+'%';if(!bar.style.width){bar.style.width='0%';requestAnimationFrame(function(){bar.style.width=pct})}else bar.style.width=pct;row.querySelector('.sm-p').textContent=pct});
  var msg=T<.35?'Close to always picking the top word (near-greedy). Very repeatable, but every answer is alike.':T>2?'Close to a coin toss between all words, including the nonsense one. Varied, but unreliable.':T>1.2?'Flatter: more variety, and the unlikely words get a real chance.':T<.8?'Sharper: the top word dominates, answers become more predictable.':'Around the model\'s own scores (T = 1).';
  $('#sm-out').innerHTML='<p>Entropy (spread of the choice): <b>'+f1(h)+' bits</b> out of a maximum of '+f1(Math.log2(toks.length))+'. '+msg+'</p>'}
 $('#sm-t').oninput=function(){T=+this.value;$('#sm-v').textContent=f1(T);$('#sm-s').textContent='';draw()};
 $('#sm-draw').onclick=function(){var p=probs(),out=[];for(var i=0;i<30;i++){var r=Math.random(),c=0,k=0;for(;k<p.length-1;k++){c+=p[k];if(r<c)break}out.push(toks[k])}$('#sm-s').textContent=out.join(' ')};draw()}
window.AISims={confusion:confusion,lr:lr,softmax:softmax};
})();
