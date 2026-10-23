/* Builds a world config (window.WORLD) from compact region specs, with generated character looks. */
(function(){
var SK=['#d9a97c','#e3b896','#c99568','#b98458','#e8bd94','#d2a078','#a8744a','#e6c0a0'],HR=['#2a1c14','#d8d4cc','#7a3b22','#1a1410','#8a4a22','#4a4a52','#c9a24f','#5a3a20'],
RB=['#3d6b4f','#2f5d62','#5a3f7a','#9a5a2a','#3a5878','#3a2f3f','#7a5a2a','#274a7a'],GR=['#6a2f2a','#5b2d3a','#33425a','#7a3a22','#2e4560','#4a2a30','#27406a','#4a3a5a'],
GU=['#4a5f8a','#5a6a38','#8a6a4a','#b08a38','#5a5f66','#4f6a58','#6a6a70','#6a4a7a'];
function look(arr,i,o){return Object.assign({skin:SK[(i*3+o)%8],hair:HR[(i*5+o)%8],robe:arr[i%8],trim:'#d7b56a'},{})}
function make(c){
 var regs=c.regions.map(function(r,i){
  var t=look(RB,i,0);t.hat=['scholar','hood','crown','hood','scholar','cap','scholar'][i%7];if(i%3===0)t.beard=true;if(i%2)t.trim='#f3e2b0';
  if(typeof r.accent==='string')t.cape=r.accent;
  var g=look(GR,i,2);g.hat='helm';if(i%2===0)g.beard=true;
  var u=look(GU,i,4);u.hat=['cap','hood','cap','hood'][i%4];u.trim='#c8a86a';if(i%3===1)u.beard=true;
  var out={name:r.name,biome:r.biome,accent:r.accent,teacher:{name:r.teacher[0],title:r.teacher[1],look:t},gate:{name:r.gate[0],title:'Gatekeeper of '+(r.gate[1]||'the region'),look:g},guide:{name:r.guide[0],look:u,hint:r.guide[1]},hall:r.hall,hallKind:r.hallKind||'hall',sim:null};
  if(typeof r.tint==='string'&&r.tint)out.tint=r.tint;if(typeof r.motif==='string'&&r.motif)out.motif=r.motif;if(typeof r.roof==='string'&&r.roof)out.roof=r.roof;return out});
 var k=c.castle,bl={skin:'#d9a97c',hair:'#e8e4dc',robe:'#6a2f4a',trim:'#f3e2b0',hat:'crown',beard:true},hl={skin:'#e3b896',hair:'#5a3a22',robe:'#274a7a',trim:'#f3e2b0',hat:'cap'};
 var castle={name:k.name,biome:'crown',accent:'#c9a24f',boss:{name:k.boss[0],title:k.boss[1],look:bl},herald:{name:k.herald[0],look:hl,hint:k.herald[1]},chest:k.chest,hall:k.hall||'Great Hall'};
 if(typeof k.tint==='string'&&k.tint)castle.tint=k.tint;if(typeof k.motif==='string'&&k.motif)castle.motif=k.motif;if(typeof k.roof==='string'&&k.roof)castle.roof=k.roof;
 var hero=c.hero&&typeof c.hero==='object'?c.hero:{skin:'#e2b48c',hair:'#3b2a1d',robe:'#274a7a',trim:'#d7b56a',cape:'#7a2e2a',hat:'hood',staff:true};
 return {key:c.key,heroName:'Wanderer',hero:hero,intro:c.intro,regions:regs,castle:castle}}
window.WorldKit={make:make};
})();
