/* Agent Loop Stepper: a small simulator for the Agent Proving Grounds. A pretend model asks for tools; step through the loop, break a tool, change the step limit. */
(function(){var A=window.APP,W=window.WORLD;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var PRICE={notebook:4,pen:2};
function stepper(host){
 var st={i:0,broken:false,max:6,log:[],done:null};
 var MOVES=[{say:'I need the price of a notebook.',tool:'price',arg:'notebook'},{say:'And the price of a pen.',tool:'price',arg:'pen'},{say:'Now add 3 notebooks and 2 pens.',tool:'add',arg:'3*4+2*2'},{final:'3 notebooks and 2 pens cost 16.'}];
 host.innerHTML='<section class="panel sim"><p class="kicker">Simulator</p><h3>Agent Loop Stepper</h3><p class="dim small">Task: <b>How much do 3 notebooks and 2 pens cost?</b> A pretend model has its moves written in advance. Your code (the loop) runs the tools and hands results back. Press Step to run one pass.</p>'
 +'<div class="sim-row"><label><input type="checkbox" id="lp-b"> Break the price tool (it keeps failing)</label></div><div class="sim-row"><label>Step limit: <b id="lp-mv">6</b><input type="range" id="lp-m" min="2" max="8" step="1" value="6"></label></div>'
 +'<p><button class="btn btn-primary btn-sm" id="lp-s" style="animation:pop .22s ease backwards">Step</button> <button class="btn btn-ghost btn-sm" id="lp-r" style="animation:pop .22s ease backwards;animation-delay:.06s">Reset</button></p><div id="lp-out"></div><p class="small dim">Try this: break the tool. The pretend model has a retry in it, so you will see it try again and again until the step limit stops the loop with &ldquo;gave up&rdquo;. With no limit a real loop would carry on, and keep costing money. Every line in the log is what you grade as the trajectory.</p></section>';
 var $=function(s){return host.querySelector(s)};
 function draw(from){var h='<ol class="small">'+st.log.map(function(l,i){return '<li'+(from!=null&&i>=from?' style="animation:pop .22s ease backwards;animation-delay:'+((i-from)*40)+'ms"':'')+'>'+l+'</li>'}).join('')+'</ol>';if(st.done)h+='<p'+(from!=null?' style="animation:pop .22s ease backwards"':'')+'><b>'+esc(st.done)+'</b></p>';$('#lp-out').innerHTML=h}
 function step(){if(st.done)return;var from=st.log.length;
  st.stepsUsed=(st.stepsUsed||0)+1;
  var m=MOVES[Math.min(st.i,MOVES.length-1)];
  if(m.final){st.log.push('Model: final answer &rarr; '+esc(m.final));st.done='Done in '+st.stepsUsed+' steps. Answer: '+m.final;draw(from);return}
  var res;
  if(m.tool==='price'){res=st.broken?'error: price service is down':String(PRICE[m.arg])}else{res=String(3*PRICE.notebook+2*PRICE.pen)}
  st.log.push('Model: '+esc(m.say)+' &rarr; <code>'+esc(m.tool)+'('+esc(m.arg)+')</code> &rarr; result: <code>'+esc(res)+'</code>');
  if(res.indexOf('error')===0){st.log.push('Loop: the tool failed, so the model will try the same step again.')}else st.i++;
  if(st.stepsUsed>=st.max&&!st.done){st.done='Step limit reached: gave up.'}
  draw(from)}
 function reset(){st.i=0;st.log=[];st.done=null;st.stepsUsed=0;draw()}
 $('#lp-s').onclick=step;$('#lp-r').onclick=reset;$('#lp-b').onchange=function(){st.broken=this.checked;reset()};$('#lp-m').oninput=function(){st.max=+this.value;$('#lp-mv').textContent=st.max;reset()};reset()}
window.AISims=window.AISims||{};window.AISims.stepper=stepper;
var ix=A.levels.map(function(l){return l.id}).indexOf('lA');
if(ix>=0&&!W.regions[ix].sim)W.regions[ix].sim={name:'The Agent Loop Stepper',kind:'custom',building:'tower',blurb:'Step through an agent loop one pass at a time. Break a tool and watch the step limit stop it.',render:function(h){stepper(h)}};
})();
