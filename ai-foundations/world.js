window.WORLD=WorldKit.make({key:'ai-foundations',
intro:['Welcome, traveller. This land is the Foundry Realm, seven regions that show how modern AI is built: data, neural networks, training, transformers, fine-tuning and human feedback.','Walk the map with the arrow keys or WASD, or tap a tile. Speak to people, face each Gatekeeper, and write Python in the Trial Halls.','Each region you clear lifts the fog from the next. This is simplified general education, not career advice.'],
regions:[
{name:'Data Fields',biome:'meadow',accent:'#b5532f',hall:'Trial Hall',teacher:['Sage Datum','Keeper of Datasets'],gate:['Warden Split','the Fields'],guide:['Pip the Gleaner','Tip: look at your data before you model it, and keep the test set locked away until the end.']},
{name:'Neuron Grove',biome:'forest',accent:'#8a3b2a',hall:'Weight Lodge',hallKind:'guild',teacher:['Scribe Axon','Weaver of Neurons'],gate:['Warden Bias','the Grove'],guide:['Fenn the Woodcutter','Tip: a neuron is just a weighted sum, a bias and a squash. Everything else is repetition.']},
{name:'Gradient Hills',biome:'hills',accent:'#3f5f8f',hall:'Descent Hall',teacher:['Judge Slope','Master of Descent'],gate:['Warden Step','the Hills'],guide:['Mina the Shepherd','Tip: the learning rate is the size of your step. Too big and you tumble, too small and you never arrive.']},
{name:'Overfit Marsh',biome:'marsh',accent:'#7a2f3a',hall:'Validation Lodge',hallKind:'smithy',teacher:['Captain Holdout','Guardian of Honest Scores'],gate:['Warden Noise','the Marsh'],guide:['Reed the Ferryman','Tip: when training loss keeps falling and validation loss climbs, stop and keep the best checkpoint.']},
{name:'Attention Peaks',biome:'tundra',accent:'#3c5a86',hall:'Hall of Heads',hallKind:'tower',teacher:['Warden Query','Reader of Tokens'],gate:['Warden Mask','the Peaks'],guide:['Bjorn the Trapper','Tip: attention is a weighted average. The weights come from softmax and always add to one.']},
{name:'Fine-tune Forge',biome:'desert',accent:'#a0442a',hall:'The Forge',hallKind:'smithy',teacher:['Cartographer Lora','Smith of Specialists'],gate:['Warden Forget','the Forge'],guide:['Zara the Caravaner','Tip: clean your examples, remove duplicates, then re-test everything the model used to do.']},
{name:'Feedback Harbour',biome:'highland',accent:'#274a7a',hall:'Preference Hall',teacher:['Architect Pref','Keeper of Feedback'],gate:['Warden Reward','the Harbour'],guide:['Dunmore the Mason','Tip: a reward score is only a stand-in for what people want. Check it against the real thing.']}],
castle:{name:'Citadel of the Builder',boss:['The Foundation Council','Final challenge: plan a small assistant'],herald:['Herald Cael','The Council will ask five design choices: data splits, overfitting, whether to fine-tune, what to check afterwards, and how to use human feedback.'],chest:'Builder\'s Crown'}});
/* ---- Course scene art (graphics pass): colour identity + themed landmark and map props for ai-foundations.
   Uses only window.Art (S, building, ell, mix) and window.LQFx.low from shared/. Full effects only; Low effects keeps the shared art. ---- */
(function(){
var W=window.WORLD;if(!W)return;
var PAL=['#6a4ab0','#2a8ab0','#8a5ac8','#3a6ad0','#5a3a9a','#2a9a9a','#b05a9a','#4a7ad0'];
W.palette=PAL;W.regions.forEach(function(r,i){r.accent=PAL[i%PAL.length]});if(W.castle)W.castle.accent='#9ad0ff';
Object.assign(W.hero,{robe:'#3a2f6a',cape:'#2a8ab0',trim:'#cfe8ff'});
var PI=Math.PI;
function E(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,PI*2);g.fill()}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function T(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function L(g,pts,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
function plinth(g,u,w,col){E(g,0,0,w*1.2*u,w*.45*u,'rgba(0,0,0,.28)');R(g,-w*u,-5*u,2*w*u,5*u,col);R(g,-w*u,-5*u,2*w*u,1.4*u,'rgba(255,255,255,.22)');R(g,(w-3)*u,-5*u,3*u,5*u,'rgba(0,0,0,.18)')}
/* AI Foundations: a glowing workshop of learning machines. Landmark = a neural-network sculpture whose signals pulse layer to layer; map prop = a small three-node network. */
function net(g,u,ac,t,sc){var Ls=[[-12,[-26,-16,-6]],[0,[-30,-21,-12,-3]],[12,[-21,-11]]],k,i,j;
 for(k=0;k<2;k++)Ls[k][1].forEach(function(y1){Ls[k+1][1].forEach(function(y2){L(g,[Ls[k][0]*u*sc,y1*u*sc,Ls[k+1][0]*u*sc,y2*u*sc],'rgba(140,200,255,.55)',.7*u)})});
 for(k=0;k<3;k++)Ls[k][1].forEach(function(y,i){var ph=(Math.sin(t*3-k*1.6+i)+1)/2;glow(g,Ls[k][0]*u*sc,y*u*sc,5*u*sc,'rgba(150,210,255,A)',.5*ph);E(g,Ls[k][0]*u*sc,y*u*sc,2.4*u*sc,2.4*u*sc,k===2?ac:'#cfe8ff');E(g,Ls[k][0]*u*sc-.6*u,y*u*sc-.6*u,.8*u,.8*u,'#fff')});
 var p=(t*.6)%1;E(g,(-12+24*p)*u*sc,(-16-5*p)*u*sc,1.3*u,1.3*u,'#fff6c8')}
function landmark(g,u,ac,t,b){plinth(g,u,14,'#5a5f7a');R(g,-15*u,-36*u,2*u,31*u,'#3a3f5a');R(g,13*u,-36*u,2*u,31*u,'#3a3f5a');R(g,-15*u,-37*u,30*u,2*u,'#6a6f9a');net(g,u,ac,t,1)}
function mapProp(g,u,ac,t,kind){E(g,0,0,7*u,2.4*u,'rgba(0,0,0,.25)');R(g,-.8*u,-8*u,1.6*u,8*u,'#3a3f5a');g.save();g.translate(0,8*u);g.scale(.42,.42);net(g,u,ac,t,1);g.restore()}

function install(){var A=window.Art;if(!A||!A.building||A.__courseArt)return;var base=A.building;A.__courseArt=W.key;
 A.building=function(g,kind,x,y,o){var low=!window.LQFx||window.LQFx.low;o=o||{};
  if(!low&&kind==='tree'&&o.landmark){var u=A.S/34;g.save();g.translate(x,y+A.S*.5);g.scale(1.25,1.25);try{landmark(g,u,o.accent||PAL[0],o.t||0,o.landmark)}catch(e){}g.restore();return}
  base.apply(this,arguments);
  if(!low&&(kind==='town'||kind==='castle')){var u2=A.S/34;g.save();g.translate(x-(kind==='castle'?34:26)*u2,y+A.S*.5-2*u2);g.scale(1.7,1.7);try{mapProp(g,u2,o.accent||PAL[0],o.t||0,kind)}catch(e){}g.restore()}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
