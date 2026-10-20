/* Adds the new regions to the AI Evals world (Python primer first; statistics before Graders; judge engineering after Graders) and keeps narration and text in step. */
(function(){var A=window.APP,W=window.WORLD,N=window.NEWLV||{};
function lk(skin,hair,robe,hat,beard){var o={skin:skin,hair:hair,robe:robe,trim:'#d7b56a',hat:hat};if(beard)o.beard=true;return o}
var R={
lP:{name:'Primer Glade',biome:'meadow',accent:'#4f7a3a',
 teacher:{name:'Tutor Wren',title:'Keeper of First Code',look:lk('#e3b896','#7a3b22','#3d6b4f','scholar')},
 gate:{name:'Warden Pip',title:'Gatekeeper of the Glade',look:lk('#c99568','#2a2118','#6a2f2a','helm')},
 guide:{name:'Hob the Gardener',look:lk('#e8bd94','#8a4a22','#5a6a38','cap',true),hint:'Tip: type the code yourself and run it. Reading code is not the same as writing it. Break it on purpose to see the error messages.'},hall:'Practice Lodge',hallKind:'guild',sim:null},
lS:{name:'Variance Fens',biome:'marsh',accent:'#2f6a62',
 teacher:{name:'Statistician Mara',title:'Reader of Noise',look:lk('#d9a97c','#4a4a52','#2f5d62','scholar')},
 gate:{name:'Warden Ilse',title:'Gatekeeper of the Fens',look:lk('#b98458','#14100e','#4a2a30','helm',true)},
 guide:{name:'Tobias the Ferryman',look:lk('#d2a078','#4a5a3a','#4f6a58','hood'),hint:'Tip: a score from a small set can move a lot by chance. Report how many cases it rests on, and how wide the uncertainty is.'},hall:'Fen Observatory',hallKind:'hall',sim:null},
lJ:{name:'Tribunal Terraces',biome:'hills',accent:'#6a4a8f',
 teacher:{name:'Magistrate Soren',title:'Builder of Judges',look:lk('#d2a078','#d8d4cc','#5a3f7a','crown',true)},
 gate:{name:'Warden Briar',title:'Gatekeeper of the Terraces',look:lk('#bf8c62','#3a2a1a','#33425a','helm')},
 guide:{name:'Nell the Clerk',look:lk('#e8bd94','#2a1c14','#8a6a4a','hood'),hint:'Tip: a judge is a measuring instrument. Test it against your own labels, and swap the order of answers to see whether it just likes the first one.'},hall:'Judges\' Workshop',hallKind:'smithy',sim:null},
lA:{name:'Agent Proving Grounds',biome:'desert',accent:'#8a5a2a',
 teacher:{name:'Marshal Ketter',title:'Trainer of Trial Runs',look:lk('#d9a97c','#4a4a52','#3a5878','crown',true)},
 gate:{name:'Warden Relay',title:'Gatekeeper of the Grounds',look:lk('#c99568','#14100e','#6a2f2a','helm')},
 guide:{name:'Quill the Scout',look:lk('#e8bd94','#7a3b22','#4f6a58','cap'),hint:'Tip: grade where the agent ended up and what else it touched, and run each task more than once. One lucky run proves little.'},hall:'Obstacle Course',hallKind:'tower',sim:null}};
var ORDER=['lP','l1','l2','lS','l3','lJ','l4','l5','l6','lA','l7'];
var oldIds=A.levels.map(function(l){return l.id}),oldRegs=W.regions.slice();
var byId={};A.levels.forEach(function(l,i){byId[l.id]={lv:l,rg:oldRegs[i],ix:i}});
var lv=[],rg=[],map=[];
ORDER.forEach(function(id){if(byId[id]){lv.push(byId[id].lv);rg.push(byId[id].rg);map.push(byId[id].ix)}else if(N[id]){lv.push(N[id]);rg.push(R[id]);map.push(-1)}});
A.levels=lv;W.regions=rg;
/* narration: lines were written for the original seven towns; remap them to the new order, new towns have none */
A.__narrMap=map;
if(window.NARR&&window.NARR['ai-evals']){var o=window.NARR['ai-evals'],nn={},NN=window.NEWNARR||{};map.forEach(function(ix,j){if(ix>=0&&o['t'+ix])nn['t'+j]=o['t'+ix];else if(ix<0&&NN['ev-'+lv[j].id])nn['t'+j]=NN['ev-'+lv[j].id]});nn.k=NN['ev-k']||o.k;window.NARR['ai-evals']=nn}
/* skills map */
var sk=A.skills,extra=[];
if(N.lP)extra.push({level:'lP',name:'Python basics',note:'Variables, lists, loops, functions, simple probability'});
var pos=[];sk.forEach(function(s){pos.push(s);if(s.level==='l2'&&N.lS)pos.push({level:'lS',name:'Statistics for evals',note:'Confidence intervals, paired comparison, bootstrap, clustering, power'});if(s.level==='l6'&&N.lA)pos.push({level:'lA',name:'Agent and multi-turn evals',note:'Trajectory and outcome grading, side effects, pass@k vs pass^k, sandboxes'});if(s.level==='l3'&&N.lJ)pos.push({level:'lJ',name:'Judge engineering',note:'Write a judge, swap test, kappa against your labels, iterate the rubric'})});
A.skills=(N.lP?[extra[0]]:[]).concat(pos);
/* wording that said seven */
var n=A.levels.length,words={8:'Eight',9:'Nine',10:'Ten',11:'Eleven'}[n]||'Several';
A.tagline=words+(n>=10?' short levels, from your first lines of Python to building a judge and grading AI agents, and a final challenge where you design an eval yourself.':' short levels on how to measure whether an AI system is any good, and a final challenge where you design an eval yourself.');
A.badges.forEach(function(b){if(b.id==='all'){b.desc='Clear all '+n+' levels'}});
if(W.castle&&W.castle.herald&&W.castle.herald.hint)W.castle.herald.hint=W.castle.herald.hint.replace(/the seven regions/,'the '+words.toLowerCase()+' regions');
if(W.intro&&W.intro[0])W.intro[0]=W.intro[0].replace(/seven regions/,n+' regions');
/* simulators */
if(window.AISims){var ix=A.levels.map(function(l){return l.id}).indexOf('l4');if(ix>=0)W.regions[ix].sim={name:'The Threshold Workshop',kind:'custom',building:'guild',blurb:'Slide a threshold and watch precision, recall and the confusion matrix move.',render:function(h){AISims.confusion(h,{bad:'bad answers',who:'an automatic grader',missName:'missed bad answer',alarmName:'false alarm'})}}}
})();
