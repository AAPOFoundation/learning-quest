/* Inserts new levels (window.NEWLV) with their regions into a world in a chosen order; keeps narration, skills and counts in step. */
window.InsertKit={lk:function(skin,hair,robe,hat,beard){var o={skin:skin,hair:hair,robe:robe,trim:'#d7b56a',hat:hat};if(beard)o.beard=true;return o},
apply:function(o){var A=window.APP,W=window.WORLD,N=window.NEWLV||{},R=o.regions;
 var oldRegs=W.regions.slice(),byId={};A.levels.forEach(function(l,i){byId[l.id]={lv:l,rg:oldRegs[i],ix:i}});
 var lv=[],rg=[],map=[];
 o.order.forEach(function(id){if(byId[id]){lv.push(byId[id].lv);rg.push(byId[id].rg);map.push(byId[id].ix)}else if(N[id]&&R[id]){lv.push(N[id]);rg.push(R[id]);map.push(-1)}});
 A.levels=lv;W.regions=rg;A.__narrMap=map;
 var key=A.key,NN=window.NEWNARR||{};
 if(window.NARR&&window.NARR[key]){var old=window.NARR[key],nn={};map.forEach(function(ix,j){if(ix>=0&&old['t'+ix])nn['t'+j]=old['t'+ix];else if(ix<0&&NN[o.prefix+lv[j].id])nn['t'+j]=NN[o.prefix+lv[j].id]});nn.k=old.k;window.NARR[key]=nn}
 var pos=[];A.skills.forEach(function(s){pos.push(s);(o.skillsAfter&&o.skillsAfter[s.level]||[]).forEach(function(x){if(N[x.level])pos.push(x)})});A.skills=pos;
 var n=lv.length,words={7:'Seven',8:'Eight',9:'Nine',10:'Ten',11:'Eleven',12:'Twelve'}[n]||String(n);
 if(o.tagline)A.tagline=o.tagline.replace('{N}',words);
 A.badges.forEach(function(b){if(b.id==='all')b.desc='Clear all '+n+' levels'});
 if(W.intro&&W.intro[0])W.intro[0]=W.intro[0].replace(/(seven|\d+) regions/,n+' regions');
 return {n:n,words:words}}};
