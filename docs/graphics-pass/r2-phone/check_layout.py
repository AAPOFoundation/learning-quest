import asyncio, json, sys
from playwright.async_api import async_playwright
PORT=sys.argv[1]; OUT=sys.argv[2]; TAG=sys.argv[3]
VPS=[('390x844',390,844,True),('360x740',360,740,True),('430x932',430,932,True),('1280x800',1280,800,False)]
COURSES=['ai-evals','ai-foundations','ai-safety','portfolio-guide','python-basics']
if len(sys.argv)>4: COURSES=sys.argv[4].split(',')
SAVE=json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':'w','c':-1,'r':-1,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
SHOW='''()=>{var a=document.querySelector('#area');if(a){a.querySelector('.kicker').textContent='Region 2';a.querySelector('b').textContent='The Whispering Library';a.classList.add('on');}
var c=document.getElementById('narrcap');if(!c){c=document.createElement('div');c.id='narrcap';c.innerHTML='<span class="who">Guide</span><span class="tx"></span>';document.body.appendChild(c)}
c.querySelector('.tx').textContent='Walk to the glowing marker to start your next lesson. Tap A to talk to a friend.';c.hidden=false;}'''
MEAS='''()=>{function R(s){var e=document.querySelector(s);if(!e)return null;var cs=getComputedStyle(e);if(e.hidden||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return null;var r=e.getBoundingClientRect();return r.width?[r.left,r.top,r.right,r.bottom]:null}
var cv=document.getElementById('cv').getBoundingClientRect();var hx=cv.width/2,hy=cv.height/2;var o={hero:[hx-28,hy-70,hx+28,hy+10]};
['#party','#quest','#tr','#narrcap','#area','#pad','#acts','#dlg'].forEach(function(s){o[s]=R(s)});
var ov=[];var k=Object.keys(o);function X(a,b){return a&&b&&a[0]<b[2]-1&&b[0]<a[2]-1&&a[1]<b[3]-1&&b[1]<a[3]-1}
for(var i=0;i<k.length;i++)for(var j=i+1;j<k.length;j++)if(X(o[k[i]],o[k[j]]))ov.push(k[i]+' x '+k[j]);
var small=[].slice.call(document.querySelectorAll('#hud button,#hud [role=button],#hud canvas')).filter(function(b){var r=b.getBoundingClientRect();return r.width&&(r.width<47.5||r.height<47.5)}).map(function(b){var r=b.getBoundingClientRect();return (b.id||b.textContent)+':'+Math.round(r.width)+'x'+Math.round(r.height)});
return {overlaps:ov,small:small,rects:o}}'''
async def main():
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for vn,w,h,mob in VPS:
            ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if mob else 1,is_mobile=mob,has_touch=mob)
            await ctx.add_init_script("try{localStorage.setItem('learning-apps.fx','full');localStorage.setItem('learning-apps.mute','1')}catch(e){}")
            pg=await ctx.new_page(); errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e)))
            pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
            for c in COURSES:
                await pg.goto(f'http://localhost:{PORT}/{c}/index.html')
                await pg.evaluate(f"localStorage.setItem('learning-apps.{c}',{json.dumps(SAVE)})")
                await pg.reload(); await pg.wait_for_timeout(1200)
                try: await pg.click('#tc',timeout=3000)
                except Exception as e: errs.append('no #tc '+c)
                await pg.wait_for_timeout(2500)
                await pg.evaluate(SHOW); await pg.wait_for_timeout(800)
                await pg.screenshot(path=f'{OUT}/{TAG}-{c}-{vn}.png')
                res[f'{c}-{vn}']=await pg.evaluate(MEAS)
            res[vn+'-errors']=errs
            await ctx.close()
        await b.close()
    json.dump(res,open(f'{OUT}/{TAG}-metrics.json','w'),indent=1)
    for k,v in res.items():
        if k.endswith('errors'): print(k,v)
        else: print(k,'OVL',v['overlaps'],'SMALL',v['small'])
asyncio.run(main())
