()=>{function R(s){var e=document.querySelector(s);if(!e)return null;var cs=getComputedStyle(e);if(e.hidden||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return null;var r=e.getBoundingClientRect();return r.width?[r.left,r.top,r.right,r.bottom]:null}
var cv=document.getElementById('cv').getBoundingClientRect();var hx=cv.width/2,hy=cv.height/2;var o={hero:[hx-28,hy-70,hx+28,hy+10]};
['#party','#quest','#tr','#narrcap','#area','#pad','#acts','#dlg'].forEach(function(s){o[s]=R(s)});
var ov=[];var k=Object.keys(o);function X(a,b){return a&&b&&a[0]<b[2]-1&&b[0]<a[2]-1&&a[1]<b[3]-1&&b[1]<a[3]-1}
for(var i=0;i<k.length;i++)for(var j=i+1;j<k.length;j++)if(X(o[k[i]],o[k[j]]))ov.push(k[i]+' x '+k[j]);
var small=[].slice.call(document.querySelectorAll('#hud button,#hud [role=button],#hud canvas')).filter(function(b){var r=b.getBoundingClientRect();return r.width&&(r.width<47.5||r.height<47.5)}).map(function(b){var r=b.getBoundingClientRect();return (b.id||b.textContent)+':'+Math.round(r.width)+'x'+Math.round(r.height)});
return {overlaps:ov,small:small,rects:o}}