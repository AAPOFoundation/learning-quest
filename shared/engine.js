/* Shared gamified-learning engine. App config: window.APP = {key,title,kicker,tagline,rank:[...],levels,boss,badges,skills,tabs,disclaimer,home} */
(function(){
'use strict';
var A=window.APP, K='learning-apps.'+A.key, $=function(s,r){return (r||document).querySelector(s)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){try{var p=JSON.parse(localStorage.getItem(K));if(p&&p.v===1)return p}catch(e){}return {v:1,xp:0,streak:0,last:'',levels:{},badges:[],boss:null,w:null}}
var P=load();
function save(){try{localStorage.setItem(K,JSON.stringify(P))}catch(e){}}
function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function touchStreak(){var t=today();if(P.last===t)return;var y=new Date();y.setDate(y.getDate()-1);var ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();P.streak=(P.last===ys)?P.streak+1:1;P.last=t;}
function toast(m,art){var e=document.createElement('div');e.className='toast'+(art?' toast-art':'');if(art){var img=document.createElement('img');img.className='mk';img.alt='';img.width=40;img.height=40;img.src=art;e.appendChild(img)}e.appendChild(document.createTextNode(m));var n=document.querySelectorAll('.toast').length;if(n)e.style.bottom=(18+n*68)+'px';document.body.appendChild(e);setTimeout(function(){e.remove()},2600)}
function rank(){var r=A.rank,i=0;for(var k=0;k<r.length;k++)if(P.xp>=r[k][0])i=k;return r[i][1]}
var held=null;
function award(id){if(P.badges.indexOf(id)<0){P.badges.push(id);var b=A.badges.filter(function(x){return x.id===id})[0],name=b?b.name:id,src=badgeSrc(id);if(held)held.push({name:name,src:src});else toast('Badge earned: '+name,src)}}
function holdMarks(){held=[]}
function marksHtml(){var rows=held||[];held=null;return rows.map(function(r){return '<p class="earn">'+(r.src?'<img class="mk" alt="" width="40" height="40" src="'+r.src+'">':'')+'Badge earned: '+esc(r.name)+'</p>'}).join('')}
function doneCount(){return A.levels.filter(function(l){return P.levels[l.id]&&P.levels[l.id].done}).length}
function unlocked(i){return i===0||(P.levels[A.levels[i-1].id]&&P.levels[A.levels[i-1].id].done)}
function stars(n){var s='<span class="stars" aria-label="'+n+' of 3 stars">';for(var i=0;i<3;i++)s+='<span class="star'+(i<n?' on':'')+'"></span>';return s+'</span>'}
function starsFor(p){return p>=1?3:p>=.8?2:p>=.6?1:0}

var root=document.getElementById('ovbody'),tab='path',EXIT=function(){},MODE=null;
function topScroll(){var o=document.getElementById('ov');if(o)o.scrollTop=0}
function shell_old(body){
 root.innerHTML='<header class="topbar"><a class="brand" href="../index.html"><span class="mark"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 6.3c2.5 1.8 3.8 3.9 3.8 5.9A3.8 3.8 0 0 1 12 16a3.8 3.8 0 0 1-3.8-3.8c0-2 1.3-4.1 3.8-5.9z" fill="currentColor"/></svg></span>'+esc(A.title)+'</a><div class="hud"><span class="chip" title="Experience points">'+P.xp+' XP</span><span class="chip" title="Days in a row">🔥 '+P.streak+'</span><span class="chip">'+esc(rank())+'</span></div></header><main class="wrap">'+body+'</main>';
 topScroll();
}
function shell(body){root.innerHTML='<main class="wrap">'+body+'</main>';topScroll()}
function home(){EXIT()}
function homeOld(){
 var n=doneCount(),tot=A.levels.length,nextI=0;
 for(var i=0;i<tot;i++){if(!(P.levels[A.levels[i].id]&&P.levels[A.levels[i].id].done)){nextI=i;break}nextI=-1}
 var tabs=[['path','Path'],['skills','Skills map'],['badges','Badges']].concat((A.tabs||[]).map(function(t){return [t.id,t.label]}));
 var h='<section class="panel"><p class="kicker">'+esc(A.kicker)+'</p><h1>'+esc(A.title)+'</h1><p class="dim">'+esc(A.tagline)+'</p><div class="bar" aria-label="progress"><i style="width:'+Math.round(100*n/tot)+'%"></i></div><p class="small dim" style="margin-top:6px">'+n+' of '+tot+' levels cleared'+(P.boss&&P.boss.done?' · final challenge done':'')+'</p>';
 if(nextI>=0)h+='<button class="btn btn-primary" data-go="'+nextI+'">'+(n?'Continue: '+esc(A.levels[nextI].title):'Begin level 1')+'</button>';
 else h+='<button class="btn btn-primary" data-boss>'+(P.boss&&P.boss.done?'Replay the final challenge':'Face the final challenge')+'</button>';
 h+='<p class="small dim" style="margin:10px 0 0">Your progress saves in this browser only and is never sent anywhere.</p></section><div class="tabs">'+tabs.map(function(t){return '<button class="btn btn-ghost '+(tab===t[0]?'on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div><div id="tabbody"></div><p class="disc">'+esc(A.disclaimer)+'</p>';
 shell(h);
 var tb=$('#tabbody');
 if(tab==='path')path(tb);else if(tab==='skills')skills(tb);else if(tab==='badges')badges(tb);else{var t=A.tabs.filter(function(x){return x.id===tab})[0];t.render(tb,{award:award,save:save,toast:toast,P:P})}
 root.onclick=function(e){var b=e.target.closest('[data-tab],[data-go],[data-boss],[data-reset]');if(!b)return;
  if(b.dataset.tab){tab=b.dataset.tab;home()}else if(b.hasAttribute('data-boss'))boss(0,[],0);else if(b.hasAttribute('data-reset')){if(confirm('Reset all progress on this app?')){localStorage.removeItem(K);P=load();tab='path';home()}}else level(+b.dataset.go)}
}
function path(tb){
 var h='<div class="grid">';
 A.levels.forEach(function(l,i){var s=P.levels[l.id],u=unlocked(i);
  h+='<button class="lvl" data-go="'+i+'" '+(u?'':'disabled')+'><span class="ico">'+l.icon+'</span><p class="kicker" style="margin-top:6px">Level '+(i+1)+(u?'':' · locked')+'</p><h3 style="margin:0 0 4px">'+esc(l.title)+'</h3><p class="small dim" style="margin:0 0 6px">'+esc(l.blurb)+'</p>'+stars(s?starsFor(s.best):0)+'</button>'});
 var allDone=doneCount()===A.levels.length;
 h+='<button class="lvl" data-boss '+(allDone?'':'disabled')+'><span class="ico">🏆</span><p class="kicker" style="margin-top:6px">Final challenge'+(allDone?'':' · locked')+'</p><h3 style="margin:0 0 4px">'+esc(A.boss.title)+'</h3><p class="small dim" style="margin:0 0 6px">'+esc(A.boss.blurb)+'</p>'+stars(P.boss?starsFor(P.boss.best):0)+'</button></div>';
 h+='<p style="margin-top:18px"><button class="btn btn-ghost btn-sm" data-reset>Reset progress</button></p>';
 tb.innerHTML=h}
function skills(tb){
 var h='<div class="panel"><p class="kicker">Skills map</p><p class="dim small">Each bar is your best score on that level\'s questions.</p>';
 A.skills.forEach(function(s){var l=A.levels.filter(function(x){return x.id===s.level})[0],b=P.levels[s.level]?Math.round(100*P.levels[s.level].best):0;
  h+='<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span class="skill-name">'+lessonPlate(s.level)+'<b>'+esc(s.name)+'</b></span><span class="dim small">'+b+'%</span></div><div class="bar"><i style="width:0" data-w="'+b+'"></i></div><div class="small dim">'+esc(s.note)+'</div></div>'});
 tb.innerHTML=h+'</div>';
 [].forEach.call(tb.querySelectorAll('.bar>i'),function(el){var w=el.getAttribute('data-w')+'%';requestAnimationFrame(function(){el.style.width=w})})}
/* brass medallions in assets/art/badges; a chest seal uses the course file when this world has one */
var BADGE_ART={first:1,perfect:1,streak3:1,all:1,boss:1,master:1,coder:1,pythonista:1,camp:1,expedition:1,capstone:1,crown:1,scout:1,seal:1,lab:1};
var SEAL_WORLD={'python-basics':1,'ai-foundations':1,'ai-evals':1,'ai-safety':1,'portfolio-guide':1};
function badgeName(id){if(/^seal_/.test(id)||id==='seal')return (A.key&&SEAL_WORLD[A.key])?'seal-'+A.key:'seal';return id}
function badgeSrc(id){var name=badgeName(id);if(name.indexOf('seal-')===0||BADGE_ART[name])return '../assets/art/badges/'+name+'.svg';return ''}
function badgeMark(id){var src=badgeSrc(id);if(!src)return '';return '<img class="mk" alt="" width="40" height="40" src="'+src+'">'}
function badges(tb){
 var h='<div class="grid">';A.badges.forEach(function(b,i){var on=P.badges.indexOf(b.id)>=0,art=badgeMark(b.id);h+='<div class="badge '+(on?'':'off')+'" style="animation:rise .22s ease both;animation-delay:'+(Math.min(i,12)*40)+'ms"><span class="mk-slot">'+(art||b.icon)+'</span><div><b>'+esc(b.name)+'</b><div class="small dim">'+esc(b.desc)+'</div></div></div>'});
 tb.innerHTML=h+'</div>'}

/* ---- questions ---- */
function qView(q,state,done){ // state: {sel}
 var h='<p class="kicker">'+({mc:'Choose one',multi:'Select all that apply',num:'Work it out',grade:'Grade each one'}[q.t])+'</p><h3 style="color:var(--ink);font-family:var(--font);font-size:18px;line-height:1.4">'+q.q+'</h3>';
 if(q.ex)h+='<div class="ex">'+esc(q.ex)+'</div>';
 return h}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function ask(q,idx,total,cb,headTitle){
 if(q.t==='code'){var ce=document.createElement('div');if(window.CodeQ)window.CodeQ.mount(q,ce,{idx:idx,total:total,title:headTitle,done:function(ok){cb(!!ok)}});else ce.innerHTML='<section class="panel"><p class="dim">The Python challenge component did not load.</p><button class="btn btn-primary" id="cq-x">Skip</button></section>',ce.onclick=function(e){if(e.target.id==='cq-x')cb(false)};return ce}
 var sel=q.t==='multi'?[]:q.t==='grade'?q.items.map(function(){return null}):null,answered=false,wrong=0,born=false;
 var el=document.createElement('div'),perm=(q.opts||[]).map(function(_,k){return k});
 if((q.t==='mc'||q.t==='multi')&&!q.fixed&&!perm.some(function(k){return /\b(all|none) of the above\b/i.test(q.opts[k])}))perm=shuf(perm);
 function draw(res){
  var h='<section class="panel"><p class="small dim">'+esc(headTitle)+' · question '+(idx+1)+' of '+total+'</p><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.round(100*idx/total)+'%"></i></div>'+qView(q);
  if(q.t==='mc'||q.t==='multi'){perm.forEach(function(i,n){var o=q.opts[i];var c='opt';if(q.t==='mc'?sel===i:sel.indexOf(i)>=0)c+=' sel';if(res){var corr=q.t==='mc'?q.a===i:q.a.indexOf(i)>=0;if(corr)c+=' ok';else if(c.indexOf('sel')>=0)c+=' no'}h+='<button class="'+c+'"'+(born?'':' style="animation:pop .22s ease backwards;animation-delay:'+(n*40)+'ms"')+' data-o="'+i+'" '+(res?'disabled':'')+'>'+o+'</button>'})}
  else if(q.t==='num'){h+='<div class="field"><label>Your answer'+(q.unit?' ('+esc(q.unit)+')':'')+'</label><input type="number" step="any" inputmode="decimal" id="nv" '+(res?'disabled':'')+' value="'+(sel===null?'':sel)+'"></div>'}
  else if(q.t==='grade'){q.items.forEach(function(it,i){h+='<div class="ex">'+esc(it.text)+'</div><div class="row" style="margin-bottom:10px">';['pass','fail'].forEach(function(v,n){var c='opt';if(sel[i]===v)c+=' sel';if(res){if(it.a===v)c+=' ok';else if(sel[i]===v)c+=' no'}h+='<button class="'+c+'" style="margin:0;text-align:center'+(born?'':';animation:pop .22s ease backwards;animation-delay:'+((i*2+n)*40)+'ms')+'" data-g="'+i+':'+v+'" '+(res?'disabled':'')+'>'+(v==='pass'?'✓ Pass':'✗ Fail')+'</button>'});h+='</div>'})}
  if(res)h+='<div class="fb '+(res.ok?'ok':'no')+'"><b>'+(res.ok?'Correct. ':'Not quite. ')+'</b>'+q.why+'</div><button class="btn btn-primary" id="nx" style="animation:pop .22s ease backwards;animation-delay:.08s">Next</button>';
  else h+='<button class="btn btn-primary" id="ck"'+(born?'':' style="animation:pop .22s ease backwards;animation-delay:.08s"')+'>Check answer</button>';
  el.innerHTML=h+'</section>';
  if(!born){var qb=el.querySelector('.bar>i');if(qb){var bw=qb.style.width;qb.style.width='0%';requestAnimationFrame(function(){qb.style.width=bw})}}
  born=true}
 draw();
 el.onclick=function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.dataset.o!==undefined&&!answered){var i=+b.dataset.o;if(q.t==='mc')sel=i;else{var p=sel.indexOf(i);if(p<0)sel.push(i);else sel.splice(p,1)}draw()}
  else if(b.dataset.g&&!answered){var s=b.dataset.g.split(':');sel[+s[0]]=s[1];draw()}
  else if(b.id==='ck'){
   var ok=false;
   if(q.t==='mc'){if(sel===null)return;ok=sel===q.a}
   else if(q.t==='multi'){if(!sel.length)return;ok=sel.length===q.a.length&&q.a.every(function(x){return sel.indexOf(x)>=0})}
   else if(q.t==='num'){var v=parseFloat($('#nv',el).value);if(isNaN(v))return;sel=v;ok=Math.abs(v-q.a)<=(q.tol||0)}
   else if(q.t==='grade'){if(sel.indexOf(null)>=0)return;ok=q.items.every(function(it,i){return it.a===sel[i]})}
   answered=true;draw({ok:ok});el._ok=ok}
  else if(b.id==='nx'){cb(!!el._ok)}
 };
 return el}

function runQs(qs,title,fin){var i=0,right=0,box=document.createElement('div');
 (function next(){if(i>=qs.length){fin(right/qs.length,right);return}
  var e=ask(qs[i],i,qs.length,function(ok){if(ok)right++;i++;next()},title);box.innerHTML='';box.appendChild(e);topScroll()})();
 return box}

function lessonPlate(id,lit){var k=String(A.key||''),n=String(id||'');if(!/^[a-z0-9-]+$/.test(k)||!/^[A-Za-z0-9-]+$/.test(n))return '';return '<img class="lesson-plate'+(lit?' plate-lit':'')+'" alt="" width="160" height="100" src="../assets/art/plates/'+k+'/'+n+'.svg" onerror="this.remove()">'}
function level(i,mode){
 var L=A.levels[i],step=0;MODE=mode||null;
 function lesson(){
  var c=L.lesson,quiet=window.LQFx&&(LQFx.low||(LQFx.rm&&LQFx.rm.matches)),h='<section class="panel lesson'+(quiet?'':' stepin')+'"><p class="kicker">Level '+(i+1)+' · lesson '+(step+1)+' of '+c.length+'</p><h2>'+(step?esc(c[step].h):esc(L.title))+'</h2>'+(step===0?lessonPlate(L.id):'')+(step===0&&window.LQGuide?window.LQGuide.slot(A.key+'-'+L.id):'')+(step===0?'<h3>'+esc(c[0].h)+'</h3>':'')+c[step].b+'<div class="row"><button class="btn btn-ghost" id="bk"'+(quiet?'':' style="animation:pop .22s ease backwards"')+'>'+(step?'Back':'Exit')+'</button><button class="btn btn-primary" id="fw"'+(quiet?'':' style="animation:pop .22s ease backwards;animation-delay:.06s"')+'>'+(step<c.length-1?'Next':(MODE==='lesson'?'Done':'Start the questions'))+'</button></div></section>';
  shell(h);if(window.LQGuide)window.LQGuide.scan();
  $('#bk').onclick=function(){step?(step--,lesson()):home()};
  $('#fw').onclick=function(){if(step<c.length-1){step++;lesson()}else if(MODE==='lesson'){E_.lessonDone=true;EXIT()}else quiz()}}
 function quiz(){
  shell('<div id="q"></div>');
  $('#q').appendChild(runQs(L.qs,'Level '+(i+1)+': '+L.title,function(p,r){
   touchStreak();var prev=P.levels[L.id],first=!prev||!prev.done,gain=r*(first?10:5);
   var pass=p>=.6;
   if(pass){gain+=first?20:0;if(p===1&&(!prev||prev.best<1))gain+=10}
   P.xp+=gain;var rec=P.levels[L.id]||{best:0,done:false};rec.best=Math.max(rec.best,p);if(pass)rec.done=true;P.levels[L.id]=rec;
   holdMarks();
   if(pass&&first&&i===0)award('first');if(p===1)award('perfect');if(P.streak>=3)award('streak3');
   if(doneCount()===A.levels.length)award('all');
   if(A.onLevel)A.onLevel(L.id,p,award);
   save();
   var h='<section class="panel'+(pass?' cheer':'')+'">'+(pass?lessonPlate(L.id,true):'')+'<p class="kicker">'+(pass?'Level cleared':'Not cleared yet')+'</p><h2>'+r+' of '+L.qs.length+' correct</h2>'+stars(pass?starsFor(p):0)+'<p class="dim" style="margin-top:10px">+'+gain+' XP. '+(pass?(p<1?'Replay for three stars; you only need 60% to move on.':'A clean sweep.'):'You need 60% to clear a level. Re-read the lesson and try again, there is no penalty.')+'</p>'+marksHtml()+'<div class="row"><button class="btn btn-ghost" id="rl" style="animation:pop .22s ease backwards">Re-read lesson</button><button class="btn btn-primary" id="nx2" style="animation:pop .22s ease backwards;animation-delay:.08s">'+('Back to the map')+'</button></div></section>';
   shell(h);if(pass){try{document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:{msg:p===1?'Perfect clear!':'Level cleared!',vfx:'shockwave'}}))}catch(e){}}$('#rl').onclick=function(){step=0;MODE=null;lesson()};$('#nx2').onclick=function(){EXIT()}}))}
 if(mode==='quiz')quiz();else lesson()}

function boss(){
 var B=A.boss,i=0,pts=0,picks=[];
 function step(){
  if(i>=B.steps.length){touchStreak();var p=pts/B.steps.reduce(function(a,s){return a+Math.max.apply(null,s.opts.map(function(o){return o.pts}))},0);
   var first=!(P.boss&&P.boss.done),gain=Math.round(p*60)+(first?40:0);P.xp+=gain;P.boss={done:true,best:Math.max(P.boss?P.boss.best:0,p)};holdMarks();award('boss');if(p>=.9)award('master');save();
   shell('<section class="panel cheer">'+lessonPlate('citadel',true)+'<p class="kicker">Final challenge complete</p><h2>'+Math.round(p*100)+'% design score</h2>'+stars(starsFor(p))+'<p class="dim" style="margin-top:10px">+'+gain+' XP.</p>'+picks.map(function(x){return '<p class="small"><b>'+esc(x.t)+':</b> '+x.why+'</p>'}).join('')+marksHtml()+'<div class="row"><button class="btn btn-ghost" id="rp" style="animation:pop .22s ease backwards">Replay</button><button class="btn btn-primary" id="hm" style="animation:pop .22s ease backwards;animation-delay:.08s">Back to the map</button></div></section>');
   try{document.dispatchEvent(new CustomEvent('lq:celebrate',{detail:{msg:'Well done',vfx:'shockwave'}}))}catch(e){}
   $('#rp').onclick=function(){boss()};$('#hm').onclick=home;return}
  var s=B.steps[i],h='<section class="panel"><p class="kicker">'+esc(B.title)+' · step '+(i+1)+' of '+B.steps.length+'</p>'+(i===0?'<p class="dim">'+B.intro+'</p>':'')+'<h3 style="color:var(--ink);font-family:var(--font);font-size:18px">'+s.q+'</h3>';
  shuf(s.opts.map(function(_,k){return k})).forEach(function(k,n){var o=s.opts[k];h+='<button class="opt" data-k="'+k+'" style="animation:pop .22s ease backwards;animation-delay:'+(n*40)+'ms">'+o.t+'</button>'});
  shell(h+'</section>');
  root.onclick=function(e){var b=e.target.closest('[data-k]');if(b){var o=s.opts[+b.dataset.k];pts+=o.pts;picks.push({t:'Step '+(i+1),why:o.why});
   shell('<section class="panel"><p class="kicker">Step '+(i+1)+' result</p><div class="fb '+(o.pts===2?'ok':'no')+'"><b>'+(o.pts===2?'Strong choice. ':o.pts===1?'Workable, with a gap. ':'Weak choice. ')+'</b>'+o.why+'</div><button class="btn btn-primary" id="nb" style="animation:pop .22s ease backwards">Continue</button></section>');
   root.onclick=null;$('#nb').onclick=function(){i++;step()}}}}
 step()}
function codeSolved(id){if(!P.code)P.code={};if(P.code[id])return;P.code[id]=1;P.xp+=15;var n=Object.keys(P.code).length;if(n>=3)award('coder');if(n>=8)award('pythonista');save()}
var E_=window.Engine={codeSolved:codeSolved,level:level,boss:boss,setExit:function(f){EXIT=f},P:function(){return P},save:save,award:award,toast:toast,rank:rank,doneCount:doneCount,unlocked:unlocked,skills:skills,badges:badges,stars:stars,starsFor:starsFor,touchStreak:touchStreak,lessonDone:false,reset:function(){localStorage.removeItem(K);P=load()},K:K};
})();
