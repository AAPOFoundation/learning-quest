"""Round 5 lane F shots: python3 shoot.py TAG OUTDIR [chromium,webkit] [port; 9153 served origin/main for the before set]
Stills of three town biomes (meadow, desert, tundra) plus the Python world map, and frame strips for motion
(ambient sway, a footstep, a chest open, a correct and a wrong answer). Served from http://127.0.0.1:9152/."""
import asyncio, json, sys, os, io
from playwright.async_api import async_playwright
from PIL import Image
TAG=sys.argv[1]; OUT=sys.argv[2].rstrip('/')+'/'; BASE='http://127.0.0.1:'+(sys.argv[4] if len(sys.argv)>4 else '9152')+'/'
SCENES=[('meadow','python-basics','t0'),('desert','python-basics','t3'),('tundra','ai-foundations','t4'),('world','python-basics','w')]
def save(sid,done=0):
    w={'sid':sid,'c':7 if sid!='w' else -1,'r':8 if sid!='w' else -1,'chests':{},'caches':{},'taught':{'0':1},'sim':{},'visited':{},'intro':1}
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':w})
async def strip(pg,name,clip,n,gap,pre=None):
    frames=[]
    if pre: await pre()
    for i in range(n):
        frames.append(Image.open(io.BytesIO(await pg.screenshot(clip=clip))))
        await pg.wait_for_timeout(gap)
    w,h=frames[0].size; s=Image.new('RGB',(w*n+4*(n-1),h),(10,15,21))
    for i,f in enumerate(frames): s.paste(f.convert('RGB'),(i*(w+4),0))
    s.save(name, quality=86); return name
async def hero_clip(pg,W,H,cw,ch):
    p=await pg.evaluate("""()=>{const f=LQHud.figRects().filter(x=>x.role==='hero')[0];return {x:(f.l+f.r)/2,y:f.b-20}}""")
    x=max(0,min(W-cw,p['x']-cw/2)); y=max(0,min(H-ch,p['y']-ch*0.55))
    return {'x':x,'y':y,'width':cw,'height':ch}
async def run(p,eng):
    if eng=='chromium':
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']); ca={'viewport':{'width':1280,'height':800}}; nm='desk'; W,H=1280,800
    else:
        b=await p.webkit.launch(); ca={**p.devices['iPhone 13'],'viewport':{'width':390,'height':844}}; nm='iphone'; W,H=390,844
    ctx=await b.new_context(**ca); await ctx.add_init_script("try{localStorage.setItem('learning-apps.fx','full');localStorage.setItem('learning-apps.guide','off')}catch(e){}")
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append('pageerror: '+str(e)))
    pg.on('console',lambda m: errs.append('console: '+m.text) if m.type=='error' and 'fonts.g' not in m.text else None)
    res={}
    for bi,app,sid in SCENES:
        await pg.goto(BASE+app+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{app}',{json.dumps(save(sid))})")
        await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(4200)
        await pg.screenshot(path=f'{OUT}{TAG}-{nm}-{bi}.jpg',quality=86)
        cw,ch=(520,320) if nm=='desk' else (320,280)
        clip=await hero_clip(pg,W,H,cw,ch)
        await strip(pg,f'{OUT}{TAG}-{nm}-{bi}-ambient-strip.jpg',clip,6,180)
        if bi!='world':
            async def step():
                await pg.keyboard.press('ArrowLeft')
            clip=await hero_clip(pg,W,H,cw,ch)
            await strip(pg,f'{OUT}{TAG}-{nm}-{bi}-step-strip.jpg',clip,6,55,pre=step)
    # chest open (meadow town, level 1 done)
    app='python-basics'
    await pg.goto(BASE+app+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{app}',{json.dumps(save('t0'))})")
    await pg.evaluate("""(()=>{const k='learning-apps.python-basics';const s=JSON.parse(localStorage.getItem(k));s.levels[APP.levels[0].id]={done:true,stars:2,best:4};localStorage.setItem(k,JSON.stringify(s))})()""")
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(4200)
    await pg.evaluate("(()=>{const o=__w.scene().objs.find(o=>o.role==='chest');__w.warp('t0',o.c+1,o.r)})()"); await pg.wait_for_timeout(1500)
    full={'x':0,'y':0,'width':W,'height':H}
    await strip(pg,f'{OUT}{TAG}-{nm}-prompt-strip.jpg',await hero_clip(pg,W,H,300,240),4,200)
    async def open_chest():
        await pg.evaluate("(()=>{const o=__w.scene().objs.find(o=>o.role==='chest');window.__t0=performance.now();__w.interact(o)})()")
    await strip(pg,f'{OUT}{TAG}-{nm}-chest-strip.jpg',full,6,70,pre=open_chest)
    await pg.wait_for_timeout(1200); await pg.screenshot(path=f'{OUT}{TAG}-{nm}-chest.jpg',quality=86)
    # quiz: correct and wrong answers
    await pg.goto(BASE+app+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{app}',{json.dumps(save('t0'))})")
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(3000)
    await pg.evaluate("""(async()=>{const o=__w.scene().objs.find(o=>o.role==='gate');__w.interact(o);for(let i=0;i<12;i++){await new Promise(r=>setTimeout(r,250));__w.adv()}__w.pick(0)})()""")
    await pg.wait_for_timeout(3500)
    got={}
    for qn in range(8):
        if len(got)==2: break
        opts=await pg.query_selector_all('#ov .opt'); nv=await pg.query_selector('#ov #nv')
        if opts: await opts[0].click()
        elif nv: await nv.fill('14' if 'correct' not in got else '0')
        else:
            nx=await pg.query_selector('#ov #nx')
            if nx: await nx.click(); await pg.wait_for_timeout(400); continue
            break
        await pg.wait_for_timeout(150)
        ck=await pg.query_selector('#ov #ck')
        if not ck: break
        await ck.click()
        ok=await pg.evaluate("!!document.querySelector('#ov .fb.ok')")
        k='correct' if ok else 'wrong'
        if k not in got:
            box=await pg.evaluate("(()=>{const e=document.querySelector('#ov .panel')||document.querySelector('#ov');const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()")
            clip={'x':max(0,box[0]),'y':max(0,box[1]),'width':min(W,box[2]),'height':min(H-max(0,box[1]),box[3])}
            await strip(pg,f'{OUT}{TAG}-{nm}-answer-{k}-strip.jpg',clip,5,90)
            got[k]=1
        nx=await pg.query_selector('#ov #nx')
        if nx: await nx.click(); await pg.wait_for_timeout(400)
    res['answers']=list(got); res['errors']=errs
    await b.close(); return res
async def main():
    os.makedirs(OUT,exist_ok=True); out={}
    async with async_playwright() as p:
        for e in (sys.argv[3].split(',') if len(sys.argv)>3 else ['chromium','webkit']): out[e]=await run(p,e)
    json.dump(out,open(f'{OUT}{TAG}-probe.json','w'),indent=1); print(json.dumps(out,indent=1))
asyncio.run(main())
