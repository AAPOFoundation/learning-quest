/* Adds Fluency Fields (4 habits for working with AI, citation and flattery checks, Autocomplete Workshop) after the last Foundations region. */
(function(){var K=window.InsertKit,A=window.APP;if(!K||!window.NEWLV||!window.NEWLV.lF)return;var lk=K.lk;
var R={lF:{name:'Fluency Fields',biome:'meadow',accent:'#6a8a3a',
 teacher:{name:'Steward Lio',title:'Keeper of the Four Habits',look:lk('#e3b896','#7a3b22','#3d6b4f','scholar')},
 gate:{name:'Warden Check',title:'Gatekeeper of the Fields',look:lk('#c99568','#2a2118','#33425a','helm',true)},
 guide:{name:'Ada the Gleaner',look:lk('#e8bd94','#5a3a20','#8a6a4a','cap'),hint:'Tip: whatever an AI tells you, look for the specific that you can check: a name, a number, a source. That is where the mistakes hide.'},
 hall:'Habit Hall',hallKind:'guild',
 sim:{name:'The Autocomplete Workshop',kind:'custom',building:'tower',blurb:'Build a tiny autocomplete from your own text, then turn temperature, top-k and top-p and watch the odds change.',render:function(h){AISims.workshop(h)}}}};
var order=A.levels.map(function(l){return l.id}).concat(['lF']);
K.apply({prefix:'fd-',order:order,regions:R,
 tagline:'{N} short levels on how modern AI systems are built and trained, from data to neural networks to transformers, fine-tuning and human feedback, plus four habits for working with AI, with Python you run in the browser.',
 skillsAfter:{l7:[{level:'lF',name:'Fluency: working with AI',note:'Delegate, Describe, Discern, be Diligent; next-token prediction and sampling; catching invented citations and flattery'}]}});
})();
