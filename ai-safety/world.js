window.WORLD=WorldKit.make({key:'ai-safety',
hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#3a2a38',trim:'#d7b56a',cape:'#6a4a2a',hat:'hood',staff:true},
intro:['Welcome, traveller. This land is the Guardian Realm, seven regions on how to make advanced AI go well: risk, alignment, red-teaming, dangerous-capability checks, robustness, interpretability and policy.','Walk the map with the arrow keys or WASD, or tap a tile. Speak to people, face each Gatekeeper, and write Python in the Trial Halls. The Reading and community list is in the pause menu (Esc).','Each region you clear lifts the fog from the next. This is general education. Where experts disagree, the game says so.'],
regions:[
{name:'Harbour of Stakes',biome:'meadow',accent:'#b5532f',tint:'#8a4a3a',motif:'shield',roof:'#6a4034',hall:'Trial Hall',teacher:['Sage Meridian','Keeper of Risk Maps'],gate:['Warden Severity','the Harbour'],guide:['Pip the Courier','Tip: say your likelihood and severity out loud, with a range. Honest uncertainty beats false confidence in either direction.']},
{name:'Alignment Hills',biome:'hills',accent:'#3f5f8f',tint:'#3f5f8f',motif:'scale',roof:'#343e56',hall:'Intent Hall',teacher:['Judge Intent','Teacher of Goals'],gate:['Warden Proxy','the Hills'],guide:['Mina the Shepherd','Tip: every score is a stand-in for something you want. Ask what a clever optimiser could do to the stand-in.']},
{name:'Red-team Redoubt',biome:'marsh',accent:'#7a2f3a',tint:'#7a3a48',motif:'bug',roof:'#5a3038',hall:'Probe Lodge',hallKind:'smithy',teacher:['Captain Vex','Red-Team Lead'],gate:['Warden Scope','the Redoubt'],guide:['Reed the Ferryman','Tip: agree the scope first, log everything, rank by severity, and re-test fixes with reworded attacks.']},
{name:'Dunes of Capability',biome:'desert',accent:'#a0442a',tint:'#a06040',motif:'lens',roof:'#7a4a30',hall:'Threshold House',hallKind:'vault',teacher:['Cartographer Yusra','Reader of Thresholds'],gate:['Warden Margin','the Dunes'],guide:['Zara the Caravaner','Tip: a failed test shows only that this attempt failed. Try hard, take the best result, and keep a margin.']},
{name:'Robustness Fells',biome:'tundra',accent:'#3c5a86',tint:'#3c5a86',motif:'shield',roof:'#3e4c5a',hall:'Hall of Variants',hallKind:'tower',teacher:['Warden Hale','Guardian of Consistency'],gate:['Warden Shift','the Fells'],guide:['Bjorn the Trapper','Tip: change things that should not matter and see whether the answer changes. Layer your defences.']},
{name:'Interpretability Depths',biome:'forest',accent:'#8a3b2a',tint:'#5a4038',motif:'neuron',roof:'#343e2c',hall:'Probe Hall',hallKind:'guild',teacher:['Scribe Isolde','Reader of Activations'],gate:['Warden Circuit','the Depths'],guide:['Fenn the Woodcutter','Tip: a probe shows information is present, not that it is used. Test explanations with interventions.']},
{name:'Policy Highland',biome:'highland',accent:'#274a7a',tint:'#274a6a',motif:'book',roof:'#3a4254',hall:'Hall of Frameworks',teacher:['Architect Lio','Drafter of Frameworks'],gate:['Warden Trigger','the Highland'],guide:['Dunmore the Mason','Tip: read the current version of any framework. They change, and the details are where the commitments live.']}],
castle:{name:'Citadel of the Safety Planner',tint:'#8a7040',motif:'shield',roof:'#6a5830',boss:['The Safety Council','Final challenge: plan the safety of an AI agent'],herald:['Herald Cael','The Council will ask five choices: risk mapping, red-teaming, capability checks, injection defences and release governance.'],chest:'Safety Planner\'s Crown'}});
/* ---- Course scene art (graphics pass): colour identity + themed landmark and map props for ai-safety.
   Uses only window.Art (S, building, ell, mix) and window.LQFx.low from shared/. Full effects only; Low effects keeps the shared art. ---- */
(function(){
var W=window.WORLD;if(!W)return;
var PAL=['#2f8a6a','#c9902a','#3a7a9a','#5a9a4a','#2a6a7a','#b07a3a','#3a8a8a','#6a8a3a'];
var PI=Math.PI;
function E(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,PI*2);g.fill()}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function T(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function L(g,pts,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
function plinth(g,u,w,col){if(window.Art&&Art.stoneBase)Art.stoneBase(g,false,w*1.2*u,w*.6*u,14*u,col);else E(g,0,0,w*1.2*u,w*.45*u,'rgba(0,0,0,.28)');/* default r3: no flat slab; the camera podium is the step */}
/* AI Safety: a guardian coast. Landmark = a shield-stone beacon with a calm, steady lamp and a watch-light sweep; map prop = a small shield banner with a check. */
function shield(g,u,s,col,edge){g.fillStyle=edge;g.beginPath();g.moveTo(0,-14*u*s);g.lineTo(10*u*s,-10*u*s);g.quadraticCurveTo(10*u*s,4*u*s,0,10*u*s);g.quadraticCurveTo(-10*u*s,4*u*s,-10*u*s,-10*u*s);g.closePath();g.fill();
 g.fillStyle=col;g.beginPath();g.moveTo(0,-11.5*u*s);g.lineTo(7.8*u*s,-8.4*u*s);g.quadraticCurveTo(7.8*u*s,3*u*s,0,7.6*u*s);g.quadraticCurveTo(-7.8*u*s,3*u*s,-7.8*u*s,-8.4*u*s);g.closePath();g.fill();
 L(g,[-3.6*u*s,-1*u*s,-1*u*s,2*u*s,4*u*s,-4.4*u*s],'#fff',1.4*u*s)}
function landmark(g,u,ac,t,b){plinth(g,u,12,'#b9c4c0');var gr=g.createLinearGradient(-6*u,0,6*u,0);gr.addColorStop(0,'#e8efe9');gr.addColorStop(1,'#8a9a96');g.fillStyle=gr;g.beginPath();g.moveTo(-7*u,-5*u);g.lineTo(-5*u,-38*u);g.lineTo(5*u,-38*u);g.lineTo(7*u,-5*u);g.fill();
 R(g,-7*u,-44*u,14*u,6*u,'#4a5a56');var p=.7+.3*Math.sin(t*1.5);glow(g,0,-41*u,16*u,'rgba(255,230,150,A)',.55*p);E(g,0,-41*u,3*u,2.4*u,'#fff2c0');T(g,-8*u,-44*u,0,-51*u,8*u,-44*u,ac);
 var a=t*.7;g.fillStyle='rgba(255,236,170,.13)';g.beginPath();g.moveTo(0,-41*u);g.lineTo(Math.cos(a)*38*u,-41*u+Math.sin(a)*8*u-6*u);g.lineTo(Math.cos(a)*38*u,-41*u+Math.sin(a)*8*u+6*u);g.fill();
 g.save();g.translate(0,-20*u);shield(g,u,.9,ac,'#e8d9a8');g.restore()}
function mapProp(g,u,ac,t,kind){E(g,0,0,7*u,2.4*u,'rgba(0,0,0,.25)');R(g,-.8*u,-16*u,1.6*u,16*u,'#5a4a32');var w=Math.sin(t*3)*.6*u;g.save();g.translate(w,-20*u);shield(g,u,.55,ac,'#e8d9a8');g.restore()}

function install(){var A=window.Art;if(!A||!A.building||A.__courseArt)return;var base=A.building;A.__courseArt=W.key;
 A.building=function(g,kind,x,y,o){var FX=window.LQFx,low=!FX||FX.low,still=low||!!(FX&&FX.rm&&FX.rm.matches),tt;o=o||{};tt=still?0:(o.t||0);
  if(!low&&kind==='tree'&&o.landmark){var u=A.S/34,lmd=function(c){c.save();c.translate(x,y+A.S*.5);c.scale(1.25,1.25);try{landmark(c,u,o.accent||PAL[0],tt,o.landmark)}catch(e){}c.restore()};/* PR #9: painted outline + light glaze (shared/art.js), plain drawing if unavailable */if(!(A.painted&&A.painted(g,x,y,[-40,40,-84,14],lmd,{dropShadows:true,shadowW:17})))lmd(g);return}
  base.apply(this,arguments);
  if(!low&&(kind==='town'||kind==='castle')){var u2=A.S/34;g.save();g.translate(x-(kind==='castle'?34:26)*u2,y+A.S*.5-2*u2);g.scale(1.7,1.7);try{mapProp(g,u2,o.accent||PAL[0],tt,kind)}catch(e){}g.restore()}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
