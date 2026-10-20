/* Simulator for the Safety world: a refusal or misuse classifier threshold. */
(function(){var A=window.APP,W=window.WORLD;if(!window.AISims)return;
var i=A.levels.map(function(l){return l.id}).indexOf('l4');
if(i>=0)W.regions[i].sim={name:'The Gate Threshold Hall',kind:'custom',building:'guild',blurb:'Set the threshold of a misuse classifier. Every setting trades missed harm against blocked harmless requests.',render:function(h){AISims.confusion(h,{bad:'dangerous requests',who:'a misuse classifier',missName:'missed dangerous request',alarmName:'blocked harmless request'})}};
})();
