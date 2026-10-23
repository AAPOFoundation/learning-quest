/* World config: Python Basics. Six regions map 1:1 to levels b1 to b6 in content.js. */
(function(){
function lk(skin,hair,robe,hat,beard){var o={skin:skin,hair:hair,robe:robe,trim:'#d7b56a',hat:hat};if(beard)o.beard=true;return o}
window.WORLD={
key:'python-basics',heroName:'Newcomer',
hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#2f6a4a',trim:'#d7b56a',cape:'#8a5a2a',hat:'cap',staff:false},
intro:['Welcome, traveller. This is the Basin of Code, six regions where you learn Python from nothing.','Walk with the arrow keys or WASD, or tap a tile. Each town has a teacher, a guide, a Trial Hall and a chest. The teacher shows you the ideas, and every example in the lessons is live: edit it and press Run.','You do not need any experience. The Python scratchpad in the pause menu (Esc) is yours for free play whenever you want to try something.'],
regions:[
{name:'Valley of Values',biome:'meadow',accent:'#4f7a3a',
 teacher:{name:'Scribe Ember',title:'Keeper of Values',look:lk('#e3b896','#7a3b22','#3d6b4f','scholar')},
 gate:{name:'Warden Bram',title:'Gatekeeper of the Valley',look:lk('#c99568','#2a2118','#6a2f2a','helm')},
 guide:{name:'Tilly the Shepherd',look:lk('#e8bd94','#8a4a22','#5a6a38','hood'),hint:'Tip: before you press Run, say out loud what you expect to see. If you are surprised, you have just learned something.'},hall:'Value Lodge',hallKind:'guild',sim:null},
{name:'Listwood',biome:'forest',accent:'#8a3b2a',
 teacher:{name:'Archivist Odo',title:'Keeper of Lists',look:lk('#d9a97c','#d8d4cc','#5a3f7a','scholar',true)},
 gate:{name:'Warden Rook',title:'Gatekeeper of the Wood',look:lk('#bf8c62','#3a2a1a','#33425a','helm',true)},
 guide:{name:'Maple the Woodcutter',look:lk('#d2a078','#5a3a20','#5a6a38','cap'),hint:'Tip: counting starts at 0. If a position feels off by one, write the list out and number the items.'},hall:'Index Library',hallKind:'hall',sim:null},
{name:'Loop Heights',biome:'hills',accent:'#3f5f8f',
 teacher:{name:'Foreman Brindle',title:'Master of Repeats',look:lk('#d2a078','#4a4a52','#9a5a2a','cap',true)},
 gate:{name:'Warden Cass',title:'Gatekeeper of the Heights',look:lk('#e3b896','#2a1c14','#7a3a22','helm')},
 guide:{name:'Dot the Pedlar',look:lk('#e8bd94','#2a1c14','#8a6a4a','hood'),hint:'Tip: the indented lines belong inside the loop or the if. Four spaces is the usual step. The editor keeps your indent when you press Enter.'},hall:'Condition Court',hallKind:'hall',sim:null},
{name:'Function Forge',biome:'desert',accent:'#a0442a',
 teacher:{name:'Smith Calder',title:'Maker of Functions',look:lk('#b98458','#1a1410','#7a3a22','hood',true)},
 gate:{name:'Warden Sela',title:'Gatekeeper of the Forge',look:lk('#c99568','#1a1410','#4a2a30','helm')},
 guide:{name:'Pike the Apprentice',look:lk('#d9a97c','#6a4a2a','#b08a38','cap'),hint:'Tip: print shows a value; return hands it back. If your function gives back None, you probably forgot return.'},hall:'Smithy of Steps',hallKind:'smithy',sim:null},
{name:'Lookup Harbour',biome:'marsh',accent:'#2f6a62',
 teacher:{name:'Harbourmaster Quill',title:'Keeper of Dictionaries',look:lk('#e6c0a0','#cfd6dc','#3a5878','crown',true)},
 gate:{name:'Warden Nia',title:'Gatekeeper of the Harbour',look:lk('#a8744a','#14100e','#2e4560','helm')},
 guide:{name:'Reed the Ferryman',look:lk('#d2a078','#4a5a3a','#4f6a58','hood'),hint:'Tip: when you meet unfamiliar nested data, print it one layer at a time. Printing is how you see what you are holding.'},hall:'Ledger Vault',hallKind:'vault',sim:null},
{name:'Bugfix Highland',biome:'highland',accent:'#274a7a',
 teacher:{name:'Inspector Marlow',title:'Hunter of Bugs',look:lk('#dcae88','#2a2a3a','#7a5a2a','scholar')},
 gate:{name:'Warden Aurel',title:'Gatekeeper of the Highland',look:lk('#e3b896','#e0c070','#27406a','helm')},
 guide:{name:'Wick the Lamplighter',look:lk('#c99568','#7a7a7a','#6a6a70','cap',true),hint:'Tip: read the last line of an error first. Then shrink the input until you can work out the right answer by hand.'},hall:'Repair Tower',hallKind:'tower',sim:null}
],
castle:{name:'Citadel of Working Code',biome:'crown',accent:'#c9a24f',
 boss:{name:'The Review Council',title:'Final challenge: review the code',look:lk('#d9a97c','#e8e4dc','#6a2f4a','crown',true)},
 herald:{name:'Herald Wynn',look:lk('#e3b896','#5a3a22','#274a7a','cap'),hint:'The Council will ask five questions about finding and fixing problems. Use the routine from Bugfix Highland: read the error, shrink the input, look inside, change one thing.'},
 chest:'Debugger\'s Lens',hall:'Great Hall'}
};
})();
/* ---- Course scene art (graphics pass): colour identity + themed landmark and map props for python-basics.
   Uses only window.Art (S, building, ell, mix) and window.LQFx.low from shared/. Full effects only; Low effects keeps the shared art. ---- */
(function(){
var W=window.WORLD;if(!W)return;
var PAL=['#2f6ab0','#d0a020','#3a7ac0','#c08a1a','#2a5a9a','#b8961a','#4a80c8'];
W.palette=PAL;W.regions.forEach(function(r,i){r.accent=PAL[i%PAL.length]});if(W.castle)W.castle.accent='#ffd34a';
Object.assign(W.hero,{robe:'#2f6ab0',cape:'#d0a020',trim:'#ffd34a'});
var PI=Math.PI;
function E(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,PI*2);g.fill()}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function T(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function L(g,pts,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
function plinth(g,u,w,col){E(g,0,0,w*1.2*u,w*.45*u,'rgba(0,0,0,.28)');R(g,-w*u,-5*u,2*w*u,5*u,col);R(g,-w*u,-5*u,2*w*u,1.4*u,'rgba(255,255,255,.22)');R(g,(w-3)*u,-5*u,3*u,5*u,'rgba(0,0,0,.18)')}
/* Python Basics: a friendly coder's valley in blue and yellow. Landmark = a cheerful python curled around a code block; map prop = a ">_" prompt signpost. */
function landmark(g,u,ac,t,b){plinth(g,u,13,'#cfd6e0');R(g,-9*u,-19*u,18*u,14*u,'#26334a');R(g,-9*u,-19*u,18*u,2.4*u,'#3a4a6a');
 g.fillStyle='#ffd34a';g.font='bold '+(6*u)+'px monospace';g.textAlign='center';g.fillText('{ }',0,-9*u);
 var bob=Math.sin(t*2)*1*u;g.lineCap='round';g.strokeStyle='#2f6ab0';g.lineWidth=5*u;g.beginPath();g.moveTo(-14*u,-3*u);g.quadraticCurveTo(-16*u,-22*u,-2*u,-23*u);g.quadraticCurveTo(12*u,-24*u,12*u,-30*u+bob);g.stroke();
 g.strokeStyle='#ffd34a';g.lineWidth=1.6*u;g.setLineDash([2*u,3*u]);g.beginPath();g.moveTo(-14*u,-3*u);g.quadraticCurveTo(-16*u,-22*u,-2*u,-23*u);g.quadraticCurveTo(12*u,-24*u,12*u,-30*u+bob);g.stroke();g.setLineDash([]);
 E(g,13*u,-33*u+bob,5*u,4*u,'#2f6ab0');E(g,11.6*u,-34.4*u+bob,1.3*u,1.3*u,'#fff');E(g,15*u,-34.4*u+bob,1.3*u,1.3*u,'#fff');E(g,11.8*u,-34.2*u+bob,.6*u,.6*u,'#111');E(g,15.2*u,-34.2*u+bob,.6*u,.6*u,'#111');
 L(g,[11.6*u,-31.4*u+bob,13*u,-30.6*u+bob,14.6*u,-31.4*u+bob],'#ffd34a',.7*u);var s=.5+.5*Math.sin(t*3);glow(g,0,-12*u,12*u,'rgba(255,211,74,A)',.25*s)}
function mapProp(g,u,ac,t,kind){E(g,0,0,7*u,2.4*u,'rgba(0,0,0,.25)');R(g,-.8*u,-12*u,1.6*u,12*u,'#6a4a22');R(g,-7*u,-20*u,14*u,9*u,'#26334a');R(g,-7*u,-20*u,14*u,1.6*u,'#2f6ab0');
 g.fillStyle='#ffd34a';g.font='bold '+(5*u)+'px monospace';g.textAlign='left';g.fillText('>',-5.5*u,-13*u);if(Math.sin(t*5)>0)R(g,-1.5*u,-14.6*u,3.6*u,1.2*u,'#ffd34a')}

function install(){var A=window.Art;if(!A||!A.building||A.__courseArt)return;var base=A.building;A.__courseArt=W.key;
 A.building=function(g,kind,x,y,o){var low=!window.LQFx||window.LQFx.low;o=o||{};
  if(!low&&kind==='tree'&&o.landmark){var u=A.S/34,lmd=function(c){c.save();c.translate(x,y+A.S*.5);c.scale(1.25,1.25);try{landmark(c,u,o.accent||PAL[0],o.t||0,o.landmark)}catch(e){}c.restore()};/* painted outline + light glaze (shared/art.js), plain drawing if unavailable */if(!(A.painted&&A.painted(g,x,y,[-40,40,-84,14],lmd)))lmd(g);return}
  base.apply(this,arguments);
  if(!low&&(kind==='town'||kind==='castle')){var u2=A.S/34;g.save();g.translate(x-(kind==='castle'?34:26)*u2,y+A.S*.5-2*u2);g.scale(1.7,1.7);try{mapProp(g,u2,o.accent||PAL[0],o.t||0,kind)}catch(e){}g.restore()}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
