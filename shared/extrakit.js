/* Helper: applies extra lessons, questions and code challenges to window.APP. Questions go before the level's code challenge. */
window.ExtraKit={apply:function(X){var A=window.APP;
 A.levels.forEach(function(L){var x=X[L.id];if(!x)return;
  if(x.lesson)x.lesson.forEach(function(s){L.lesson.push(s)});
  if(x.mc){var at=L.qs.length;for(var i=0;i<L.qs.length;i++){if(L.qs[i].t==='code'){at=i;break}}
   var add=x.mc.map(function(m){var o={t:m.t||'mc',q:m.q,opts:m.opts,a:m.a,why:m.why};if(m.tol!==undefined)o.tol=m.tol;if(m.unit)o.unit=m.unit;return o});
   L.qs.splice.apply(L.qs,[at,0].concat(add))}
  if(x.code){x.code.forEach(function(c){c.t='code';L.qs.push(c)})}
 })}};
