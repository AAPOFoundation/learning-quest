/* World config: Portfolio Guide. Regions map 1:1 to the seven levels in content.js. */
window.WORLD={
key:'portfolio-guide',heroName:'Wanderer',
hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#2c4a3c',trim:'#d7b56a',cape:'#8a6530',hat:'hood',staff:true},
intro:['Welcome, traveller. This is the Steady Realm, seven regions that explain the plan behind a portfolio that is mostly long positions: a cash floor, small hedges and written rules.','Walk with the arrow keys or WASD, or tap a tile. Visit the Cash Vault, Trim Guild, Hedge Smithy and Signal Tower to try the simulators.','Everything here is general education, not financial advice. Numbers are examples, and nothing connects to a brokerage or places an order.'],
regions:[
{name:'Harbour of Purpose',biome:'meadow',accent:'#b5532f',tint:'#8a5a32',motif:'coin',roof:'#7a5230',
 teacher:{name:'Steward Aldous',title:'Keeper of the Plan',look:{skin:'#d9a97c',hair:'#d8d4cc',robe:'#3d6b4f',trim:'#d7b56a',cape:'#b5532f',hat:'scholar',beard:true}},
 gate:{name:'Warden Pell',title:'Gatekeeper of the Harbour',look:{skin:'#c99568',hair:'#2a2118',robe:'#6a2f2a',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Pip the Dockhand',look:{skin:'#e8bd94',hair:'#8a4a22',robe:'#4a5f8a',trim:'#c8a86a',hat:'cap'},hint:'Tip: the book is mostly long positions. Shorts and hedges exist to cut drawdown and make cash for later entries.'},
 hall:'Trial Hall',hallKind:'hall',sim:null},
{name:'Cash Vault Plains',biome:'forest',accent:'#8a3b2a',tint:'#3d6b4f',motif:'coin',roof:'#2f4a38',
 teacher:{name:'Treasurer Bryn',title:'Keeper of the Floor',look:{skin:'#e3b896',hair:'#7a3b22',robe:'#2f5d62',trim:'#d7b56a',cape:'#8a3b2a',hat:'hood'}},
 gate:{name:'Warden Tamsin',title:'Gatekeeper of the Plains',look:{skin:'#d8a47a',hair:'#1f1a16',robe:'#5b2d3a',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Fenn the Teller',look:{skin:'#c99568',hair:'#5a3a20',robe:'#5a6a38',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: the floor is 20% and never invested. The flexible layer moves with the regime: 50% risk-off, 35% neutral, toward the floor in risk-on.'},
 hall:'Trial Hall',hallKind:'hall',
 sim:{name:'The Cash Vault',kind:'cash',blurb:'Slide your cash level and see it against the floor and the regime target.',building:'vault'}},
{name:'Trim Guild Hills',biome:'hills',accent:'#3f5f8f',tint:'#5a4a78',motif:'scale',roof:'#3a3858',
 teacher:{name:'Guildmaster Rowan',title:'Keeper of the Caps',look:{skin:'#d2a078',hair:'#4a4a52',robe:'#5a3f7a',trim:'#d7b56a',cape:'#3f5f8f',hat:'crown'}},
 gate:{name:'Warden Halvard',title:'Gatekeeper of the Hills',look:{skin:'#bf8c62',hair:'#3a2a1a',robe:'#33425a',trim:'#d7b56a',hat:'helm',beard:true}},
 guide:{name:'Mina the Tallyman',look:{skin:'#e8bd94',hair:'#2a1c14',robe:'#8a6a4a',trim:'#c8a86a',hat:'hood'},hint:'Tip: caps stop one position sinking the book. Trim the amount above the cap, staged into bounces rather than all at a low.'},
 hall:'Trial Hall',hallKind:'hall',
 sim:{name:'The Trim Guild',kind:'trim',blurb:'Plan trims to the caps using editable example holdings.',building:'guild'}},
{name:'Hedge Smithy Dunes',biome:'desert',accent:'#a0442a',tint:'#a0442a',motif:'shield',roof:'#7a3a28',
 teacher:{name:'Smith Garrick',title:'Forger of Hedges',look:{skin:'#b98458',hair:'#1a1410',robe:'#9a5a2a',trim:'#f3e2b0',cape:'#a0442a',hat:'cap',beard:true}},
 gate:{name:'Warden Khalid',title:'Gatekeeper of the Dunes',look:{skin:'#a8744a',hair:'#1a1410',robe:'#7a3a22',trim:'#d7b56a',hat:'helm',beard:true}},
 guide:{name:'Zara the Apprentice',look:{skin:'#c99568',hair:'#2a1c14',robe:'#b08a38',trim:'#6b4a0e',hat:'hood'},hint:'Tip: a put debit spread pays at most width × 100 × contracts, and loses at most the premium paid.'},
 hall:'Trial Hall',hallKind:'hall',
 sim:{name:'The Hedge Smithy',kind:'hedge',blurb:'Forge a put spread: max payout, breakeven and result at expiry.',building:'smithy'}},
{name:'Basis Frost',biome:'tundra',accent:'#3c5a86',tint:'#3c5a86',motif:'lens',roof:'#3e4c5a',
 teacher:{name:'Assayer Nadia',title:'Measurer of Basis Risk',look:{skin:'#e6c0a0',hair:'#cfd6dc',robe:'#3a5878',trim:'#f3e2b0',cape:'#3c5a86',hat:'hood'}},
 gate:{name:'Warden Ingrid',title:'Gatekeeper of the Frost',look:{skin:'#e8c4a4',hair:'#c9a24f',robe:'#2e4560',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Bjorn the Smith\'s Hand',look:{skin:'#d9a97c',hair:'#6a4a2a',robe:'#5a5f66',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: a hedge on one stock only helps if your holdings move with it. Size to a payout target, then check what the hedge really tracks.'},
 hall:'Trial Hall',hallKind:'hall',
 sim:{name:'Hedge Smithy Annex',kind:'hedge',blurb:'The same spread calculator, now for sizing and exits.',building:'smithy'}},
{name:'Signal Tower Heights',biome:'marsh',accent:'#7a2f3a',tint:'#6a3a48',motif:'wave',roof:'#5a3038',
 teacher:{name:'Stargazer Ilse',title:'Reader of RSI and MACD',look:{skin:'#c99568',hair:'#8a1f2a',robe:'#3a2f3f',trim:'#e58a7a',cape:'#7a2f3a',hat:'hood'}},
 gate:{name:'Warden Sable',title:'Gatekeeper of the Heights',look:{skin:'#b98458',hair:'#14100e',robe:'#4a2a30',trim:'#d7b56a',hat:'helm'}},
 guide:{name:'Reed the Lamplighter',look:{skin:'#d2a078',hair:'#4a5a3a',robe:'#4f6a58',trim:'#c8a86a',hat:'cap'},hint:'Tip: ask for two of three signals (price, RSI, MACD) on the daily chart, then deploy in thirds from the flexible layer only.'},
 hall:'Trial Hall',hallKind:'hall',
 sim:{name:'The Signal Tower',kind:'lesson',blurb:'Climb the tower to re-read the RSI, MACD and staged-deployment lessons.',building:'tower'}},
{name:'Patience Highland',biome:'highland',accent:'#274a7a',tint:'#274a7a',motif:'book',roof:'#3a4254',
 teacher:{name:'Hermit Odo',title:'Keeper of Patience',look:{skin:'#dcae88',hair:'#8a8a8a',robe:'#7a5a2a',trim:'#f3e2b0',cape:'#274a7a',hat:'hood',beard:true}},
 gate:{name:'Warden Aurelia',title:'Gatekeeper of the Highland',look:{skin:'#e3b896',hair:'#e0c070',robe:'#27406a',trim:'#f3e2b0',hat:'crown'}},
 guide:{name:'Dunmore the Mason',look:{skin:'#c99568',hair:'#7a7a7a',robe:'#6a6a70',trim:'#c8a86a',hat:'cap',beard:true},hint:'Tip: cash-secured puts and covered calls come later, using flexible cash only, once signals turn neutral or risk-on.'},
 hall:'Trial Hall',hallKind:'hall',sim:null}
],
castle:{name:'Keep of the Risk-Off Scenario',biome:'crown',accent:'#c9a24f',tint:'#c9a24f',motif:'scale',roof:'#8a6528',
 boss:{name:'The Storm Marshal',title:'Final scenario: a falling market',look:{skin:'#d9a97c',hair:'#e8e4dc',robe:'#2e3f5f',trim:'#f3e2b0',hat:'helm',beard:true}},
 herald:{name:'Herald Cael',look:{skin:'#e3b896',hair:'#5a3a22',robe:'#274a7a',trim:'#f3e2b0',hat:'cap'},hint:'The Marshal will put five decisions to you in a weak market. Use the regime, the caps, the hedge and the patience rules.'},
 chest:'Steady Hand\'s Crown',hall:'Great Hall'}
};
/* ---- Course scene art (graphics pass): colour identity + themed landmark and map props for portfolio-guide.
   Uses only window.Art (S, building, ell, mix) and window.LQFx.low from shared/. Full effects only; Low effects keeps the shared art. ---- */
(function(){
var W=window.WORLD;if(!W)return;
var PAL=['#2f6a4a','#b08a2a','#2a5a6a','#4a7a3a','#8a6a2a','#2a6a5a','#3a5a3a','#a07a3a'];
var PI=Math.PI;
function E(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,PI*2);g.fill()}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function T(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function L(g,pts,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke()}
function glow(g,x,y,r,col,a){var gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
function plinth(g,u,w,col){if(window.Art&&Art.stoneBase)Art.stoneBase(g,false,w*1.2*u,w*.6*u,14*u,col);else E(g,0,0,w*1.2*u,w*.45*u,'rgba(0,0,0,.28)');/* default r3: no flat slab; the camera podium is the step */}
/* Portfolio Guide: a steady harbour of savings. Landmark = a lighthouse-vault with a steady beam over neat coin stacks (a cash floor); map prop = three coin stacks. */
function coins(g,u,x,n,ac){for(var i=0;i<n;i++){E(g,x*u,-i*2.2*u-1*u,4*u,1.6*u,'#8a6a1a');E(g,x*u,-i*2.2*u-1.8*u,4*u,1.6*u,i%2?'#e8c45a':'#f3d77a')}}
function landmark(g,u,ac,t,b){plinth(g,u,15,'#c9bfa4');
 var gr=g.createLinearGradient(-5*u,0,5*u,0);gr.addColorStop(0,'#f4efe2');gr.addColorStop(1,'#a89f88');g.fillStyle=gr;g.beginPath();g.moveTo(-6*u,-5*u);g.lineTo(-4*u,-36*u);g.lineTo(4*u,-36*u);g.lineTo(6*u,-5*u);g.fill();
 R(g,-5.4*u,-24*u,10.8*u,3*u,ac);R(g,-4.8*u,-14*u,9.6*u,3*u,ac);R(g,-5.5*u,-41*u,11*u,5*u,'#3a4a4a');var p=.75+.25*Math.sin(t*2);glow(g,0,-38.5*u,12*u,'rgba(255,226,140,A)',.6*p);E(g,0,-38.5*u,2.2*u,1.8*u,'#fff2b8');T(g,-6.5*u,-41*u,0,-47*u,6.5*u,-41*u,'#2f5a4a');
 coins(g,u,-11,4,ac);coins(g,u,11,5,ac);coins(g,u,15.5,3,ac);R(g,-15*u,-1.2*u,6*u,.9*u,'#2f8a5a')}
function mapProp(g,u,ac,t,kind){E(g,0,0,8*u,2.6*u,'rgba(0,0,0,.25)');coins(g,u,-4,3,ac);coins(g,u,0,5,ac);coins(g,u,4,4,ac);var s=.5+.5*Math.sin(t*3);E(g,0,-13*u,1.2*u*s+.3,1.2*u*s+.3,'rgba(255,255,255,.9)')}

function install(){var A=window.Art;if(!A||!A.building||A.__courseArt)return;var base=A.building;A.__courseArt=W.key;
 A.building=function(g,kind,x,y,o){var FX=window.LQFx,low=!FX||FX.low,still=low||!!(FX&&FX.rm&&FX.rm.matches),tt;o=o||{};tt=still?0:(o.t||0);
  if(!low&&kind==='tree'&&o.landmark){var u=A.S/34;g.save();g.translate(x,y+A.S*.5);g.scale(1.25,1.25);try{landmark(g,u,o.accent||PAL[0],tt,o.landmark)}catch(e){}g.restore();return}
  base.apply(this,arguments);
  if(!low&&(kind==='town'||kind==='castle')){var u2=A.S/34;g.save();g.translate(x-(kind==='castle'?34:26)*u2,y+A.S*.5-2*u2);g.scale(1.7,1.7);try{mapProp(g,u2,o.accent||PAL[0],tt,kind)}catch(e){}g.restore()}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
