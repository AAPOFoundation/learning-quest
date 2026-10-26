import asyncio, json, sys, statistics as S
from playwright.async_api import async_playwright
courses=['python-basics','ai-foundations','ai-safety','ai-evals','portfolio-guide']
VAR=[('before','_base/',None),('after-full','','full'),('after-low','','low')]
def save(sid):
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':sid,'c':-1 if sid=='w' else 7,'r':-1 if sid=='w' else 9,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
async def run(p,b,root,pin,course,sid):
    ctx=await b.new_context(**p.devices['iPhone 13'])
    await ctx.add_init_script("try{['ai-evals.intro','portfolio-guide.cash-vault','portfolio-guide.hedge-smithy'].forEach(k=>localStorage.setItem('learning-apps.cut.'+k,'1'))}catch(e){}"+(f"localStorage.setItem('learning-apps.perf','{pin}');" if pin else ""))
    pg=await ctx.new_page()
    await pg.goto(f'http://127.0.0.1:9161/{root}{course}/index.html')
    await pg.evaluate(f"localStorage.setItem('learning-apps.{course}',{json.dumps(save(sid))})");await pg.reload();await pg.wait_for_timeout(700)
    await pg.click('#tc');await pg.wait_for_timeout(2500)
    ms=await pg.evaluate("(()=>{const d=window.__w.draw;for(let i=0;i<3;i++)d();const t=[];for(let i=0;i<15;i++){const a=performance.now();d();t.push(performance.now()-a)}t.sort((a,b)=>a-b);return t[7]})()")
    px=await pg.evaluate("document.getElementById('cv').width*document.getElementById('cv').height")
    await ctx.close();return ms,px
async def main():
    res={}
    async with async_playwright() as p:
        b=await p.webkit.launch()
        for rep in range(2):
            for c in courses:
                for sid in ['t0','w']:
                    for tag,root,pin in VAR:
                        ms,px=await run(p,b,root,pin,c,sid)
                        res.setdefault(f'{c}|{sid}|{tag}',[]).append(ms);res[f'{c}|{sid}|{tag}|px']=px
                print(rep,c,flush=True)
        await b.close()
    out={k:(round(S.median(v),1) if isinstance(v,list) else v) for k,v in res.items()}
    json.dump(out,open('/workspace/lq-r6-shots/bench.json','w'),indent=1);print(json.dumps(out))
asyncio.run(main())
