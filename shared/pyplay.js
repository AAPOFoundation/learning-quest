/* Python helpers shared by every world that runs code: runnable examples inside lessons (.pyx), a free-play scratchpad tab, and "Python ideas used here" links that open the matching Python Basics lesson section.
   Needs shared/code.js (window.CodeQ.run). Safe to load when python-basics/lessons.js is absent. */
(function(){
'use strict';
var A=window.APP;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function runInto(code,out){
 out.className='cq-exout';out.innerHTML='<span class="dim">Running… (the first run downloads the Python engine, about 10 MB)</span>';
 if(!window.CodeQ||!window.CodeQ.run){out.className='cq-exout bad';out.textContent='The Python component did not load.';return}
 window.CodeQ.run(code).then(function(r){
  if(r.unavailable||r.error){out.className='cq-exout bad';out.innerHTML='<b>Python could not run here.</b> '+esc(r.error||'')+'<div class="small dim">The engine is fetched from a public CDN, so it needs an internet connection.</div>';return}
  var d=r.data;out.className='cq-exout'+(d.err?' bad':'');
  out.innerHTML=(d.out?'<pre>'+esc(d.out)+'</pre>':'')+(d.err?'<b>Error:</b> '+esc(d.err):(d.out?'':'<span class="dim">Ran with no output. Add a print(...) line to see a value.</span>'))})}
/* runnable example markup, used by python-basics/lessons.js */
function widget(code,label){
 var rows=Math.max(2,String(code).split('\n').length);
 return '<div class="pyx">'+(label?'<p class="cq-exh">'+label+'</p>':'')+'<textarea class="cq-exed" spellcheck="false" autocapitalize="off" autocomplete="off" rows="'+rows+'" wrap="off" aria-label="Editable Python example">'+esc(code)+'</textarea><div class="row cq-exrow"><button type="button" class="btn btn-ghost btn-sm pyx-run">Run</button><button type="button" class="btn btn-ghost btn-sm pyx-reset" data-orig="'+esc(code)+'">Reset</button></div><div class="cq-exout" aria-live="polite"></div></div>'}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.pyx-run,.pyx-reset,[data-pyidea],.pyidea-x,.pyx-scr-run,.pyx-scr-sel');if(!b)return;
 if(b.classList.contains('pyx-run')){var w=b.closest('.pyx');runInto(w.querySelector('textarea').value,w.querySelector('.cq-exout'))}
 else if(b.classList.contains('pyx-reset')){var w2=b.closest('.pyx');w2.querySelector('textarea').value=b.getAttribute('data-orig');var o=w2.querySelector('.cq-exout');o.className='cq-exout';o.innerHTML=''}
 else if(b.hasAttribute('data-pyidea')){openIdea(b.getAttribute('data-pyidea'))}
 else if(b.classList.contains('pyidea-x')){closeIdea()}},true);
document.addEventListener('keydown',function(e){var t=e.target;if(!t||!t.classList||!t.classList.contains('cq-exed'))return;
 if(e.key==='Tab'){e.preventDefault();var s=t.selectionStart;t.value=t.value.slice(0,s)+'    '+t.value.slice(t.selectionEnd);t.selectionStart=t.selectionEnd=s+4}
 else if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();var b=t.closest('.pyx,.scratch').querySelector('.pyx-run,.pyx-scr-run');if(b)b.click()}
 else if(e.key==='Enter'){var v=t.value,s0=t.selectionStart,ls=v.lastIndexOf('\n',s0-1)+1,cur=v.slice(ls,s0),ind=cur.match(/^[ \t]*/)[0];if(/:\s*$/.test(cur.replace(/#.*$/,'')))ind+='    ';e.preventDefault();t.value=v.slice(0,s0)+'\n'+ind+v.slice(t.selectionEnd);t.selectionStart=t.selectionEnd=s0+1+ind.length;t.rows=Math.max(t.rows,t.value.split('\n').length)}
 e.stopPropagation()},true);
document.addEventListener('keyup',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('cq-exed'))e.stopPropagation()},true);
/* ---- Python ideas -> Basics lesson sections ---- */
var IDEAS={
 values:['b1',0,'values and printing'],variables:['b1',1,'variables and arithmetic'],strings:['b1',2,'text (strings)'],
 indexing:['b2',0,'lists and positions'],slicing:['b2',1,'slicing'],listtools:['b2',2,'list tools (sum, max, sorted, copy)'],modules:['b2',3,'import and random.Random(seed)'],
 conditions:['b3',0,'if / elif / else'],forloops:['b3',1,'for loops, range, zip'],whileloops:['b3',2,'while, break, continue'],comprehensions:['b3',3,'comprehensions'],
 functions:['b4',0,'def, parameters and return'],defaults:['b4',1,'default values'],funcvalues:['b4',3,'functions as values, lambda, sort keys'],
 dicts:['b5',0,'dictionaries'],getcount:['b5',1,'get, setdefault and counting'],tuples:['b5',2,'tuples, unpacking and sets'],records:['b5',3,'records (lists of dicts)'],
 errors:['b6',0,'reading error messages'],trycatch:['b6',2,'try / except and assert']};
var FOR={ /* challenge id -> ideas used */
 'af-l1':['modules','slicing','listtools','tuples'],'af-l2':['functions','forloops','comprehensions','listtools'],'af-l2b':['forloops','comprehensions','errors','listtools'],'af-l3':['forloops','funcvalues','functions'],
 'af-l4':['forloops','conditions','listtools'],'af-l5':['comprehensions','forloops','functions'],'af-l5b':['conditions','listtools','comprehensions'],'af-l6':['dicts','tuples','conditions','strings'],'af-l7':['comprehensions','functions','funcvalues'],
 'pp1':['listtools','conditions','functions'],'pp2':['forloops','conditions'],'pp3':['conditions','functions'],'pp4':['functions','variables'],'pp5':['forloops','tuples'],
 'ev-l1':['listtools','conditions'],'ev-l2':['strings','conditions'],'ev-l3':['strings','functions'],
 'st1':['conditions','functions','tuples'],'st2':['forloops','comprehensions','tuples'],'st3':['forloops','modules','listtools'],'st4':['comprehensions','listtools'],'st5':['functions','variables'],
 'ev-l4':['comprehensions','conditions','tuples'],'ev-l4b':['comprehensions','conditions','tuples','modules'],'ev-l5':['comprehensions','strings','tuples'],'ev-l6':['trycatch','funcvalues','tuples','listtools'],'ev-l7':['trycatch','funcvalues','dicts','forloops'],'ev-l7b':['comprehensions','tuples','listtools'],
 'jd1':['strings','conditions'],'jd2':['dicts','tuples','comprehensions'],'jd3':['dicts','comprehensions','listtools'],'jd4':['dicts','getcount','forloops'],
 'ag1':['forloops','conditions','listtools'],'ag2':['dicts','conditions','listtools'],'ag3':['comprehensions','listtools','tuples'],'ag4':['forloops','conditions'],
 'sy1':['conditions','listtools','comprehensions'],'sy2':['tuples','comprehensions'],'ea1':['conditions','comprehensions','listtools'],'ea2':['strings','forloops','listtools'],'af1':['conditions','comprehensions','listtools'],'af2':['conditions','records','comprehensions'],'cp1':['funcvalues','listtools','comprehensions'],'cp2':['conditions','forloops','functions'],
 'mcp1':['funcvalues','functions','dicts'],'mcp2':['dicts','getcount','forloops'],'mcp3':['conditions','trycatch','dicts'],'pr1':['strings','functions','dicts'],'pr2':['forloops','strings','functions'],'cb1':['forloops','dicts','conditions'],
 'as-l1':['dicts','funcvalues','listtools'],'as-l2':['comprehensions','dicts','funcvalues'],'as-l3':['getcount','trycatch','funcvalues','dicts'],'as-l4':['dicts','forloops','listtools'],'as-l4b':['dicts','comprehensions'],
 'as-l5':['funcvalues','forloops','dicts'],'as-l5b':['conditions','dicts','forloops'],'as-l6':['comprehensions','tuples','listtools'],'as-l7':['dicts','tuples','conditions']};
function basics(){return window.PYB&&window.PYB.levels}
function sectionHtml(key){var d=IDEAS[key],B=basics();if(!d||!B)return null;var L=B.filter(function(l){return l.id===d[0]})[0];if(!L||!L.lesson[d[1]])return null;return {lv:L,sec:L.lesson[d[1]],name:d[2]}}
function ideaBar(qid){var ks=(FOR[qid]||[]).filter(function(k){return IDEAS[k]});if(!ks.length||!basics())return '';
 return '<p class="cq-ideas small dim">Python ideas used here: '+ks.map(function(k){return '<button type="button" class="pyidea-link" data-pyidea="'+k+'">'+esc(IDEAS[k][2])+'</button>'}).join(' ')+'<span class="dim"> · opens the matching Python Basics lesson</span></p>'}
var ov=null;
function ikey(e){if(e.target&&e.target.classList&&e.target.classList.contains('cq-exed')&&e.key!=='Escape')return;if(e.key==='Escape'){closeIdea();e.stopImmediatePropagation();e.preventDefault()}}
function closeIdea(){if(ov){ov.remove();ov=null;window.removeEventListener('keydown',ikey,true)}}
function openIdea(key){var s=sectionHtml(key);if(!s)return;closeIdea();
 ov=document.createElement('div');ov.className='pyidea';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Python Basics lesson');
 ov.innerHTML='<div class="pyidea-in"><div class="pyidea-bar"><b>Python Basics · '+esc(s.lv.title)+'</b><button type="button" class="btn btn-ghost btn-sm pyidea-x">✕ Close</button></div><div class="lesson">'+'<h3>'+s.sec.h+'</h3>'+s.sec.b+'</div><p class="small dim">Full lessons, predict questions and practice tasks: <a href="'+(A&&A.key==='python-basics'?'':'../python-basics/')+'index.html">open the Python Basics world</a>.</p></div>';
 document.body.appendChild(ov);window.addEventListener('keydown',ikey,true)}
/* ---- scratchpad tab ---- */
var SNIP=[['Blank',''],['Variables and printing','name = "Ada"\nscore = 7\nprint(name, score * 2)\n'],['A list and a loop','scores = [3, 8, 5]\ntotal = 0\nfor s in scores:\n    total = total + s\nprint(total, total / len(scores))\n'],['A function','def double(x):\n    return x * 2\n\nprint(double(21))\n'],['A dictionary','ages = {"Asha": 31, "Ben": 27}\nfor name, age in ages.items():\n    print(name, "is", age)\n']];
var SKEY='learning-apps.scratch';
function scratch(el){var saved='';try{saved=localStorage.getItem(SKEY)||''}catch(e){}
 if(!saved)saved=SNIP[1][1];
 el.innerHTML='<section class="panel scratch"><p class="kicker">Free play</p><h2>Python scratchpad</h2><p class="dim small">Run any Python you like. Nothing here is marked or scored, and it is saved in this browser. <b>Ctrl+Enter</b> runs it. Print values with <code>print(...)</code>.</p><label class="small dim" for="scr-ed">Snippet</label> <select id="scr-sel" class="pyx-scr-sel" style="background:#0b1118;color:var(--ink);border:1px solid var(--brass-mid);border-radius:8px;padding:6px 8px;font:inherit">'+SNIP.map(function(s,i){return '<option value="'+i+'">'+esc(s[0])+'</option>'}).join('')+'</select><textarea id="scr-ed" class="cq-exed" spellcheck="false" autocapitalize="off" autocomplete="off" rows="14" wrap="off" style="margin-top:8px"></textarea><div class="row cq-exrow"><button type="button" class="btn btn-primary btn-sm pyx-scr-run">Run</button></div><div class="cq-exout" id="scr-out" aria-live="polite"></div></section>';
 var ta=el.querySelector('#scr-ed');ta.value=saved;
 el.querySelector('#scr-sel').onchange=function(){ta.value=SNIP[+this.value][1];try{localStorage.setItem(SKEY,ta.value)}catch(e){}};
 ta.addEventListener('input',function(){try{localStorage.setItem(SKEY,ta.value)}catch(e){}});
 el.querySelector('.pyx-scr-run').onclick=function(){runInto(ta.value,el.querySelector('#scr-out'))}}
if(A&&window.CodeQ){A.tabs=A.tabs||[];if(!A.tabs.some(function(t){return t.id==='scratch'}))A.tabs.push({id:'scratch',label:'Python scratchpad',render:scratch})}
window.PyPlay={widget:widget,ideaBar:ideaBar,openIdea:openIdea,IDEAS:IDEAS,FOR:FOR,run:runInto,scratch:scratch};
})();
