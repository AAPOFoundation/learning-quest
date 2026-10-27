"""r6 quiet checks: python3 quiet.py OUT.json (branch served at http://127.0.0.1:9162/after/).
1) docs/r6-anim/quiet.html under normal motion and under prefers-reduced-motion (Chromium and WebKit).
2) the r4 (docs/r4-chars/anim.html) and r5 (docs/r5-chars/quiet.html) quiet checks, which must still pass.
3) in game (Python Basics, first town, all four companions joined): Low effects and reduced motion show no followers, townsfolk stay on their
   tiles, the hero state machine gives no pose and no run speed-up while an arrow key is held, and there are no page errors."""
import asyncio, json, sys, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
B='http://127.0.0.1:9162/after/'
SETUP=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'setup.js')).read()
async def main():
    out={}
    async with async_playwright() as p:
        for eng in ['chromium','webkit']:
            b=await getattr(p,eng).launch()
            for rmo in ['no-preference','reduce']:
                ctx=await b.new_context(reduced_motion=rmo,viewport={'width':1000,'height':700}); pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
                r={}
                await pg.goto(B+'docs/r6-anim/quiet.html'); await pg.wait_for_timeout(400); r['r6']=await pg.evaluate('window.R6Q')
                await pg.goto(B+'docs/r5-chars/quiet.html'); await pg.wait_for_timeout(400); r['r5']=await pg.evaluate('window.R5Q')
                await pg.goto(B+'docs/r4-chars/anim.html'); await pg.wait_for_timeout(600); r['r4']=await pg.evaluate('window.quietStill')
                for mode in (['low','rm'] if rmo=='reduce' else ['low']):
                    fx='low' if mode=='low' else 'full'
                    await pg.goto(B+'python-basics/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.fx','{fx}')"); await pg.evaluate(SETUP,['python-basics','t0'])
                    await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(2500)
                    await pg.keyboard.down('ArrowLeft'); await pg.wait_for_timeout(1200)
                    g=await pg.evaluate("({pose:Art.heroSM.pose(),runK:Art.heroSM.runK,state:Art.heroSM.state,followers:Party.follow.list().length,folkMoved:__w.scene().objs.filter(o=>o._fk&&(o._fk.x||o._fk.y)).length,joined:Party.joined().length})")
                    await pg.keyboard.up('ArrowLeft'); await pg.wait_for_timeout(6000)
                    g['folkMovedLater']=await pg.evaluate("__w.scene().objs.filter(o=>o._fk&&(o._fk.x||o._fk.y)).length")
                    r['game-'+mode]=g
                r['errors']=errs; out[f'{eng}-{rmo}']=r; print(eng,rmo,json.dumps(r),flush=True); await ctx.close()
            await b.close()
    json.dump(out,open(sys.argv[1],'w'),indent=1)
asyncio.run(main())
