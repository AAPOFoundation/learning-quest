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
