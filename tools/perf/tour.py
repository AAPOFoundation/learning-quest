import asyncio, json, sys, time, re
from playwright.async_api import async_playwright
root=sys.argv[1]; tag=sys.argv[2]; out='/workspace/lq-r6-shots'
courses=sys.argv[3].split(',') if len(sys.argv)>3 else ['python-basics','ai-foundations','ai-safety','ai-evals','portfolio-guide']
HOOK=r"""(()=>{const P=HTMLCanvasElement.prototype;window.__cvs=[];window.__gl=0;const seen=new WeakSet();
function add(c){if(!seen.has(c)){seen.add(c);__cvs.push(new WeakRef(c))}}
const gc=P.getContext;P.getContext=function(t,...a){add(this);if(/webgl/.test(t)&&!this.__glc){this.__glc=1;__gl++}return gc.call(this,t,...a)};
for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{get(){return d.get.call(this)},set(v){add(this);d.set.call(this,v)}})}
window.__cvStats=()=>{let tot=0,max=0,n=0;for(const w of __cvs){const c=w.deref();if(!c)continue;const a=c.width*c.height;if(a<=1)continue;n++;tot+=a;if(a>max)max=a}return {n,MB:+(tot*4/1048576).toFixed(1),maxMpx:+(max/1e6).toFixed(2),glCtx:__gl}};
})()"""
async def one(p,b,course):
    ctx=await b.new_context(**p.devices['iPhone 13'])
    await ctx.add_init_script(HOOK)
    await ctx.add_init_script("try{['ai-evals.intro','portfolio-guide.cash-vault','portfolio-guide.hedge-smithy'].forEach(k=>localStorage.setItem('learning-apps.cut.'+k,'1'))}catch(e){}")
    async def patch(route):
        r=await route.fetch();s=await r.text()
        s=s.replace("\nfunction enter(sid,c,r){","\nwindow.__lqEnter=function(a,b,c){return enter(a,b,c)};function enter(sid,c,r){",1)
        await route.fulfill(response=r,body=s)
    await ctx.route(re.compile(r'.*/shared/world\.js$'),patch)
    pg=await ctx.new_page();pg.set_default_timeout(60000);ev=[]
    pg.on('pageerror',lambda e:ev.append('ERR '+str(e)[:160]));pg.on('crash',lambda *_:ev.append('CRASH'))
    await pg.goto(f'http://127.0.0.1:9161/{root}{course}/index.html')
    sv=json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':'w','c':-1,'r':-1,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
    await pg.evaluate(f"localStorage.setItem('learning-apps.{course}',{json.dumps(sv)})");await pg.reload();await pg.wait_for_timeout(900)
    print(ev,flush=True);await pg.click('#tc',timeout=8000);await pg.wait_for_timeout(1500)
    rows=[]
    for sid in ['w','t0','t1','t2','t3','t4','t5','t6','k','w']:
        try:
            await pg.evaluate(f"window.__lqEnter('{sid}',{-1 if sid=='w' else 7},{-1 if sid=='w' else 9})")
            await pg.wait_for_timeout(900)
            s=await pg.evaluate("__cvStats()");rows.append((sid,s['MB'],s['n']))
        except Exception as e: rows.append((sid,'EXC '+str(e)[:80]));break
    # hidden-tab CPU: count timer callbacks + rAF over 3s while hidden
    print(course,rows,ev,flush=True)
    await ctx.close()
    return {'course':course,'tour':rows,'events':ev}
async def main():
    res=[]
    async with async_playwright() as p:
        b=await p.webkit.launch()
        for c in courses: res.append(await one(p,b,c))
        await b.close()
    json.dump(res,open(f'{out}/{tag}-tour.json','w'),indent=1)
asyncio.run(main())
