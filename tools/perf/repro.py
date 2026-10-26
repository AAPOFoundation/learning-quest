import asyncio, json, sys, time
from playwright.async_api import async_playwright
root=sys.argv[1]  # '' or '_base/'
courses=sys.argv[2].split(',') if len(sys.argv)>2 else ['python-basics','ai-foundations','ai-safety','ai-evals','portfolio-guide']
sids=sys.argv[3].split(',') if len(sys.argv)>3 else ['w','t0']
def save(sid,c,r):
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':sid,'c':c,'r':r,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
async def one(p,b,course,sid):
    ctx=await b.new_context(**p.devices['iPhone 13'])
    pg=await ctx.new_page();pg.set_default_timeout(60000);ev=[]
    pg.on('pageerror',lambda e:ev.append('ERR '+str(e)[:200]));pg.on('crash',lambda *_:ev.append('CRASH'))
    pg.on('console',lambda m:ev.append('LOG '+m.text[:160]) if m.type in('error','warning') else None)
    try:
        await pg.goto(f'http://127.0.0.1:9161/{root}{course}/index.html')
        await pg.evaluate(f"localStorage.setItem('learning-apps.{course}',{json.dumps(save(sid,-1 if sid=='w' else 7,-1 if sid=='w' else 9))})")
        await pg.reload();await pg.wait_for_timeout(900)
        t=time.time();await pg.click('#tc');await pg.wait_for_timeout(2500)
        r=await pg.evaluate("(()=>{let n=0,px=0,big=0;return {mode:typeof st!=='undefined'?1:0}})()")
        ev.append('OK %.1fs'%(time.time()-t))
    except Exception as e: ev.append('EXC '+str(e)[:150])
    print(course,sid,ev,flush=True)
    await ctx.close()
async def main():
    async with async_playwright() as p:
        import os
        env=dict(os.environ);
        if os.environ.get('NOGOOD'): env.update(GST_PLUGIN_SYSTEM_PATH_1_0='/tmp/gst-nogood',GST_REGISTRY_1_0='/tmp/gst-nogood.reg')
        b=await p.webkit.launch(env=env)
        for c in courses:
            for s in sids: await one(p,b,c,s)
        await b.close()
asyncio.run(main())
