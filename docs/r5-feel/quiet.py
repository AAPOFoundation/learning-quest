"""Quiet-mode check: Low effects and reduced motion on the Python meadow town (Chromium 1280x800, port 9152).
Reports page errors, whether LQFeel drew anything that moves, and that a chest open does not hold the frame."""
import asyncio, json
from playwright.async_api import async_playwright
def save():
    w={'sid':'t0','c':7,'r':8,'chests':{},'caches':{},'taught':{'0':1},'sim':{},'visited':{},'intro':1}
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':w})
async def main():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for mode in ['low','rm']:
            ca={'viewport':{'width':1280,'height':800}}
            if mode=='rm': ca['reduced_motion']='reduce'
            ctx=await b.new_context(**ca); await ctx.add_init_script("localStorage.setItem('learning-apps.fx','%s')"%('low' if mode=='low' else 'full'))
            pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.goto('http://127.0.0.1:9152/python-basics/index.html'); await pg.evaluate("s=>localStorage.setItem('learning-apps.python-basics',s)",save())
            await pg.reload(); await pg.wait_for_timeout(1200); await pg.click('#tc'); await pg.wait_for_timeout(2500)
            await pg.keyboard.press('ArrowLeft'); await pg.wait_for_timeout(100)
            r=await pg.evaluate("""()=>{const d=LQFeel._dust.length;LQFeel.kick(200,0,5);return {dust:d,held:LQFeel.held(),off:[LQFeel.off.x,LQFeel.off.y]}}""")
            await pg.screenshot(path=f'/tmp/quiet-{mode}.jpg',quality=80)
            r['errors']=errs; out[mode]=r; await ctx.close()
        await b.close()
    print(json.dumps(out,indent=1)); json.dump(out,open('quiet.json','w'),indent=1)
asyncio.run(main())
