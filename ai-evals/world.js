/* World config: AI Evaluation Skills. Regions map 1:1 to the seven levels in content.js. */
window.WORLD={
key:'ai-evals',heroName:'Wanderer',
hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#274a7a',trim:'#d7b56a',cape:'#7a2e2a',hat:'hood',staff:true},
intro:['Welcome, traveller. This land is the Evaluation Realm, seven regions of craft for measuring whether an AI system is any good.','Walk the map with the arrow keys or WASD, or tap a tile. Speak to people, face each Gatekeeper, and open the chests they guard.','Each region you clear lifts the fog from the next. This is general education, not career advice.'],
regions:[
{name:'Meadow of First Marks',biome:'meadow',accent:'#b5532f',
 teacher:{name:'Sage Orrin',title:'Keeper of Basics',look:{skin:'#d9a97c',hair:'#d8d4cc',robe:'#3d6b4f',trim:'#d7b56a',hat:'scholar',beard:true}},
 gate:{name:'Warden Pell',title:'Gatekeeper of the Meadow',look:{skin:'#c99568',hair:'#2a2118',robe:'#6a2f2a',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Pip the Courier',look:{skin:'#e8bd94',hair:'#8a4a22',robe:'#4a5f8a',trim:'#c8a86a',hat:'cap'},hint:'Tip: look at the raw outputs. Numbers hide problems. Start with twenty good cases, not two thousand careless ones.'},
 hall:'Trial Hall',hallKind:'hall',sim:null},
{name:'Rubric Wood',biome:'forest',accent:'#8a3b2a',
 teacher:{name:'Scribe Isolde',title:'Writer of Cases and Rubrics',look:{skin:'#e3b896',hair:'#7a3b22',robe:'#2f5d62',trim:'#d7b56a',hat:'hood'}},
 gate:{name:'Warden Tamsin',title:'Gatekeeper of the Wood',look:{skin:'#d8a47a',hair:'#1f1a16',robe:'#5b2d3a',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Fenn the Woodcutter',look:{skin:'#c99568',hair:'#5a3a20',robe:'#5a6a38',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: write down what "good" means before you run anything. A grader should be able to apply your rubric the same way twice.'},
 hall:'Rubric Lodge',hallKind:'guild',sim:null},
{name:"Judges' Hills",biome:'hills',accent:'#3f5f8f',
 teacher:{name:'Judge Corvin',title:'Master of Graders',look:{skin:'#d2a078',hair:'#4a4a52',robe:'#5a3f7a',trim:'#d7b56a',hat:'crown'}},
 gate:{name:'Warden Halvard',title:'Gatekeeper of the Hills',look:{skin:'#bf8c62',hair:'#3a2a1a',robe:'#33425a',trim:'#d7b56a',hat:'helm',beard:true}},
 guide:{name:'Mina the Shepherd',look:{skin:'#e8bd94',hair:'#2a1c14',robe:'#8a6a4a',trim:'#c8a86a',hat:'hood'},hint:'Tip: exact match is cheap but brittle; an LLM judge scales but has biases. Check any judge against human labels.'},
 hall:'Court of Graders',hallKind:'hall',sim:null},
{name:'Dunes of Measure',biome:'desert',accent:'#a0442a',
 teacher:{name:'Cartographer Yusra',title:'Reader of Metrics',look:{skin:'#b98458',hair:'#1a1410',robe:'#9a5a2a',trim:'#f3e2b0',hat:'hood'}},
 gate:{name:'Warden Khalid',title:'Gatekeeper of the Dunes',look:{skin:'#a8744a',hair:'#1a1410',robe:'#7a3a22',trim:'#d7b56a',hat:'helm',beard:true}},
 guide:{name:'Zara the Caravaner',look:{skin:'#c99568',hair:'#2a1c14',robe:'#b08a38',trim:'#6b4a0e',hat:'hood'},hint:'Tip: one accuracy number hides which errors matter. Look at precision, recall and agreement between graders, with a sense of the noise.'},
 hall:'Measure House',hallKind:'vault',sim:null},
{name:'Frost Reach',biome:'tundra',accent:'#3c5a86',
 teacher:{name:'Warden Hale',title:'Guardian of Validity',look:{skin:'#e6c0a0',hair:'#cfd6dc',robe:'#3a5878',trim:'#f3e2b0',hat:'hood',beard:true}},
 gate:{name:'Warden Ingrid',title:'Gatekeeper of the Reach',look:{skin:'#e8c4a4',hair:'#c9a24f',robe:'#2e4560',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Bjorn the Trapper',look:{skin:'#d9a97c',hair:'#6a4a2a',robe:'#5a5f66',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: when a measure becomes a target it stops being a good measure. Keep a held-out set you never tune against.'},
 hall:'Hall of Validity',hallKind:'tower',sim:null},
{name:'Redfen Marsh',biome:'marsh',accent:'#7a2f3a',
 teacher:{name:'Captain Vex',title:'Red-Team Lead',look:{skin:'#c99568',hair:'#8a1f2a',robe:'#3a2f3f',trim:'#e58a7a',hat:'cap'}},
 gate:{name:'Warden Sable',title:'Gatekeeper of the Marsh',look:{skin:'#b98458',hair:'#14100e',robe:'#4a2a30',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Reed the Ferryman',look:{skin:'#d2a078',hair:'#4a5a3a',robe:'#4f6a58',trim:'#c8a86a',hat:'hood'},hint:'Tip: probe for harmful or unreliable behaviour on purpose, and rank failures by severity, not just count.'},
 hall:'Probe Lodge',hallKind:'smithy',sim:null},
{name:'Highland of Synthesis',biome:'highland',accent:'#274a7a',
 teacher:{name:'Architect Lio',title:'Designer of Suites',look:{skin:'#dcae88',hair:'#2a2a3a',robe:'#7a5a2a',trim:'#f3e2b0',hat:'scholar'}},
 gate:{name:'Warden Aurelia',title:'Gatekeeper of the Highland',look:{skin:'#e3b896',hair:'#e0c070',robe:'#27406a',trim:'#f3e2b0',hat:'crown'}},
 guide:{name:'Dunmore the Mason',look:{skin:'#c99568',hair:'#7a7a7a',robe:'#6a6a70',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: a suite ties a ship/no-ship decision to behaviours, cases, graders, metrics and a report. Start from the decision.'},
 hall:'Synthesis Hall',hallKind:'hall',sim:null}
],
castle:{name:'Citadel of the Eval Designer',biome:'crown',accent:'#c9a24f',
 boss:{name:'The Launch Council',title:'Final challenge: design an eval',look:{skin:'#d9a97c',hair:'#e8e4dc',robe:'#6a2f4a',trim:'#f3e2b0',hat:'crown',beard:true}},
 herald:{name:'Herald Cael',look:{skin:'#e3b896',hair:'#5a3a22',robe:'#274a7a',trim:'#f3e2b0',hat:'cap'},hint:'The Council will ask for five design choices: decision, cases, grading, metrics and what you do about gaming. Use what the seven regions taught you.'},
 chest:'Eval Designer\'s Crown',hall:'Great Hall'}
};
/* ---- Course scene art (graphics pass): colour identity + themed landmark and map props for ai-evals.
   Uses only window.Art (S, building, ell, mix) and window.LQFx.low from shared/. Full effects only; Low effects keeps the shared art. ---- */
(function(){
var W=window.WORLD;if(!W)return;
var PAL=['#2a8a7a','#c98a2a','#3a6aa8','#c0603a','#4a8aa8','#a8445a','#2f6a9a','#7a5ab0','#3a9a6a','#b0782a','#4a6ab0','#9a4a8a'];
W.palette=PAL;W.regions.forEach(function(r,i){r.accent=PAL[i%PAL.length]});if(W.castle)W.castle.accent='#d7b56a';
Object.assign(W.hero,{robe:'#1f5f66',cape:'#c98a2a',trim:'#f3e2b0'});
var PI=Math.PI;
function E(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,PI*2);g.fill()}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function T(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function L(g,pts,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
function plinth(g,u,w,col){E(g,0,0,w*1.2*u,w*.45*u,'rgba(0,0,0,.28)');R(g,-w*u,-5*u,2*w*u,5*u,col);R(g,-w*u,-5*u,2*w*u,1.4*u,'rgba(255,255,255,.22)');R(g,(w-3)*u,-5*u,3*u,5*u,'rgba(0,0,0,.18)')}
/* AI Evals: a measuring lab. Landmark = golden balance scale over a checklist board; map prop = a scoreboard with ticks. */
function landmark(g,u,ac,t,b){plinth(g,u,13,'#cfc6b0');
 R(g,-1.4*u,-40*u,2.8*u,35*u,'#8a6a2a');R(g,-1.4*u,-40*u,1*u,35*u,'#c9a24f');
 var tilt=Math.sin(t*1.2)*.12;g.save();g.translate(0,-40*u);g.rotate(tilt);R(g,-18*u,-1.2*u,36*u,2.4*u,'#c9a24f');
 [-16,16].forEach(function(dx,i){var dy=0;L(g,[dx*u,0,(dx-5)*u,12*u],'#8a6a2a',.8*u);L(g,[dx*u,0,(dx+5)*u,12*u],'#8a6a2a',.8*u);
  g.save();g.translate(dx*u,12*u);g.rotate(-tilt);E(g,0,0,7*u,2.4*u,'#d7b56a');E(g,0,-.6*u,5.5*u,1.4*u,'#f3e2b0');
  if(i===0){E(g,-1.5*u,-2.2*u,2*u,2*u,'#3aa86a');L(g,[-2.6*u,-2.2*u,-1.6*u,-1.2*u,0,-3.6*u],'#fff',.7*u)}else{E(g,1.5*u,-2.2*u,2*u,2*u,ac)}g.restore()});
 g.restore();E(g,0,-41*u,2.6*u,2.6*u,'#f3e2b0');
 /* checklist board leaning on the plinth */
 g.save();g.translate(-17*u,-4*u);g.rotate(-.12);R(g,-6*u,-16*u,12*u,16*u,'#7a5530');R(g,-5*u,-15*u,10*u,14*u,'#f6efdc');
 for(var k=0;k<3;k++){var yy=-12.5*u+k*4.3*u;L(g,[-3.6*u,yy,-2.6*u,yy+1*u,-1*u,yy-1.2*u],k===2?ac:'#2f8a5a',.9*u);R(g,0,yy-.4*u,4*u,.9*u,'#9a9080')}g.restore();
 var p=.5+.5*Math.sin(t*3);glow(g,0,-41*u,9*u,'rgba(243,226,176,A)',.45*p)}
function mapProp(g,u,ac,t,kind){E(g,0,0,7*u,2.4*u,'rgba(0,0,0,.25)');R(g,-.8*u,-12*u,1.6*u,12*u,'#6a4a22');
 R(g,-7*u,-20*u,14*u,9*u,'#2a3a48');R(g,-6.2*u,-19.2*u,12.4*u,7.4*u,'#34505e');
 var bars=[3,5,4.2];bars.forEach(function(h,i){var hh=h*u*(.85+.15*Math.sin(t*2+i));R(g,(-4.8+i*3.6)*u,-12.6*u-hh,2.4*u,hh,i===1?ac:'#7fd0a8')});
 E(g,6*u,-21*u,2.4*u,2.4*u,'#2f8a5a');L(g,[4.9*u,-21*u,5.8*u,-20*u,7.2*u,-22.2*u],'#fff',.7*u)}

function install(){var A=window.Art;if(!A||!A.building||A.__courseArt)return;var base=A.building;A.__courseArt=W.key;
 A.building=function(g,kind,x,y,o){var low=!window.LQFx||window.LQFx.low;o=o||{};
  if(!low&&kind==='tree'&&o.landmark){var u=A.S/34;g.save();g.translate(x,y+A.S*.5);g.scale(1.25,1.25);try{landmark(g,u,o.accent||PAL[0],o.t||0,o.landmark)}catch(e){}g.restore();return}
  base.apply(this,arguments);
  if(!low&&(kind==='town'||kind==='castle')){var u2=A.S/34;g.save();g.translate(x-(kind==='castle'?34:26)*u2,y+A.S*.5-2*u2);g.scale(1.7,1.7);try{mapProp(g,u2,o.accent||PAL[0],o.t||0,kind)}catch(e){}g.restore()}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
