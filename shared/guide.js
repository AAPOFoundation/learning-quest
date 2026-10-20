/* In-game guide clips. A slot is placed at the start of each region's lesson (concept id "<world>-<level id>", e.g. ai-evals-l4)
   and above each Python challenge (concept id = challenge id, e.g. ev-l4). If assets/guide/<concept-id>.mp4 exists it shows a
   short narrated clip with controls (never autoplays; a .webm twin is used by browsers without H.264); if the file does not exist the slot stays empty and invisible.
   An optional assets/guide/<concept-id>.vtt adds captions. Clips that ship are listed in assets/guide/README.md. */
(function(){
'use strict';
var s=document.querySelector('script[src$="shared/guide.js"]'),BASE=s?s.src.replace(/shared\/guide\.js$/,'assets/guide/'):'../assets/guide/',known={};
function slot(id){if(!id)return '';return '<div class="lq-guide" data-guide="'+String(id).replace(/[^a-zA-Z0-9_-]/g,'')+'" hidden></div>'}
function fill(el,id){var v=document.createElement('video');v.preload='metadata';v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.className='lq-guide-v';
 v.addEventListener('loadedmetadata',function(){known[id]=1;el.innerHTML='<p class="kicker">Guide</p>';el.appendChild(v);var t=document.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.src=BASE+id+'.vtt';v.appendChild(t);el.hidden=false},{once:true});
 v.addEventListener('error',function(){known[id]=0;el.remove()},{once:true});
 /* H.264 MP4 plays on Safari, Chrome, Edge and Firefox; a browser without it (e.g. some Linux builds) looks for a WebM twin instead */
 var mp4=v.canPlayType&&v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');v.src=BASE+id+(mp4?'.mp4':'.webm')}
function scan(root){Array.prototype.forEach.call((root||document).querySelectorAll('.lq-guide[data-guide]:not([data-done])'),function(el){var id=el.getAttribute('data-guide');el.setAttribute('data-done','1');if(known[id]===0){el.remove();return}fill(el,id)})}
window.LQGuide={slot:slot,scan:scan,base:BASE};
})();
