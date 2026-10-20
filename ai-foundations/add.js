/* Simulators for the Foundations world. */
(function(){var A=window.APP,W=window.WORLD;if(!window.AISims)return;
function at(id){return A.levels.map(function(l){return l.id}).indexOf(id)}
var a=at('l3'),b=at('l5');
if(a>=0)W.regions[a].sim={name:'The Step-Size Forge',kind:'custom',building:'smithy',blurb:'Change the learning rate and watch gradient descent crawl, settle, bounce or blow up.',render:function(h){AISims.lr(h)}};
if(b>=0)W.regions[b].sim={name:'The Temperature Tower',kind:'custom',building:'tower',blurb:'Turn the temperature up and down and watch the next-word probabilities change.',render:function(h){AISims.softmax(h)}};
})();
