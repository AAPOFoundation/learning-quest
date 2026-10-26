import asyncio,json
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:9143/'
WORLDS=['python-basics','ai-foundations','ai-evals','ai-safety','portfolio-guide']
def save(): return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':'w','c':-1,'r':-1,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
PROBE='''()=>{const R=id=>{const e=document.getElementById(id);if(!e||e.offsetParent===null)return null;const b=e.getBoundingClientRect();return b.width?b:null};
const ov=(a,b)=>a&&b&&a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
const ids=['lt','tr','pad','acts','narrcap'];const hits=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)if(ov(R(ids[i]),R(ids[j])))hits.push(ids[i]+'/'+ids[j]);
const off=[];ids.forEach(k=>{const b=R(k);if(b&&(b.left<-1||b.right>innerWidth+1||b.top<-1||b.bottom>innerHeight+1))off.push(k)});
const cv=document.getElementById('cv'),cb=cv&&cv.getBoundingClientRect();
return {vp:[innerWidth,innerHeight],bodyH:Math.round(document.body.getBoundingClientRect().height),scrollW:document.documentElement.scrollWidth,
cv:cv?[cv.width,cv.height,Math.round(cb.width),Math.round(cb.height)]:null,dpr:devicePixelRatio,overlaps:hits,offscreen:off,
gl:(()=>{const c=document.getElementById('lqgl');return c?c.style.visibility:null})(),dvh:CSS.supports('height','100dvh'),has:CSS.supports('selector(:has(a))'),colormix:CSS.supports('color','color-mix(in srgb,red 50%,blue)')}}'''
async def main():
  out={}
  async with async_playwright() as p:
    b=await p.webkit.launch()
    for name,vp in [('portrait844',{'width':390,'height':844}),('safari664',{'width':390,'height':664}),('landscape',{'width':844,'height':390})]:
      ctx=await b.new_context(**{**p.devices['iPhone 13'],'viewport':vp}); await ctx.add_init_script("try{localStorage.setItem('learning-apps.fx','full')}catch(e){}")
      pg=await ctx.new_page(); errs=[]
      pg.on('pageerror',lambda e: errs.append(str(e)[:160])); pg.on('console',lambda m: errs.append('console '+m.text[:160]) if m.type=='error' and 'fonts.g' not in m.text else None)
      await pg.goto(BASE+'index.html'); await pg.wait_for_timeout(1500); out[name+':home']=await pg.evaluate(PROBE)
      for w in WORLDS:
        await pg.goto(BASE+w+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{w}',{json.dumps(save())})"); await pg.reload(); await pg.wait_for_timeout(1300)
        await pg.click('#tc'); await pg.wait_for_timeout(2200)
        await pg.mouse.click(vp['width']//2, vp['height']//2)  # a tap: audio unlock path runs
        await pg.wait_for_timeout(400)
        r=await pg.evaluate(PROBE); r['narrUnlockedAudio']=await pg.evaluate("!!(window.Narr&&Narr.audio)"); out[name+':'+w]=r
        if name=='landscape' and w=='python-basics': await pg.screenshot(path='./after-iphone-landscape-map.png')
      out[name+':errors']=errs; await ctx.close()
    await b.close()
  json.dump(out,open('./webkit-audit.json','w'),indent=1)
  for k,v in out.items(): print(k, v if 'errors' in k else {kk:v[kk] for kk in ['vp','bodyH','scrollW','cv','overlaps','offscreen','gl','dvh','has','colormix'] if kk in v})
asyncio.run(main())
