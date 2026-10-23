import asyncio, json, sys
from playwright.async_api import async_playwright
PORT=sys.argv[1]; OUT=sys.argv[2]; TAG=sys.argv[3]
VPS=[('390x844',390,844,True),('360x740',360,740,True),('1280x800',1280,800,False)]
COURSES=sys.argv[4].split(',') if len(sys.argv)>4 else ['ai-evals','ai-foundations','ai-safety','portfolio-guide','python-basics']
def save(w): return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':dict({'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1},**w)})
SHOW=open(''+__import__('os').path.dirname(__file__)+'/show.js').read()
MEAS=open(''+__import__('os').path.dirname(__file__)+'/meas.js').read()
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
              for scene,wv in [('town',{'sid':'t0','c':7,'r':4})]:
                await pg.goto(f'http://localhost:{PORT}/{c}/index.html')
                await pg.evaluate(f"localStorage.setItem('learning-apps.{c}',{json.dumps(save(wv))})")
                await pg.reload(); await pg.wait_for_timeout(1200)
                try: await pg.click('#tc',timeout=3000)
                except Exception: errs.append('no #tc '+c)
                await pg.wait_for_timeout(2500)
                await pg.evaluate(SHOW); await pg.wait_for_timeout(700)
                await pg.screenshot(path=f'{OUT}/{TAG}-{c}-town-{vn}.jpg',type='jpeg',quality=72)
                res[f'{c}-town-{vn}']=await pg.evaluate(MEAS)
                await pg.evaluate("document.getElementById('narrcap')&&(document.getElementById('narrcap').hidden=true)")
                if mob: await pg.click('#bact')
                else: await pg.keyboard.press('Enter')
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=f'{OUT}/{TAG}-{c}-dialog-{vn}.jpg',type='jpeg',quality=72)
                m=await pg.evaluate(MEAS); res[f'{c}-dialog-{vn}']=m
                await pg.evaluate(SHOW.replace("a.classList.add('on');","")); await pg.wait_for_timeout(500)
                await pg.screenshot(path=f'{OUT}/{TAG}-{c}-dialog-cap-{vn}.jpg',type='jpeg',quality=72)
                res[f'{c}-dialogcap-{vn}']=await pg.evaluate(MEAS)
            res[vn+'-errors']=errs
            await ctx.close()
        await b.close()
    json.dump(res,open(f'{OUT}/{TAG}-scenes-metrics.json','w'),indent=1)
    for k,v in res.items():
        if k.endswith('errors'): print(k,v)
        else: print(k,'DLG' if v['rects'].get('#dlg') else '-','OVL',v['overlaps'],'SMALL',v['small'])
asyncio.run(main())
