import asyncio, json, sys, time
from playwright.async_api import async_playwright
root=sys.argv[1]; out=sys.argv[2]; tag=sys.argv[3]
courses=['python-basics','ai-foundations','ai-safety','ai-evals','portfolio-guide']
HOOK=r"""(()=>{const P=HTMLCanvasElement.prototype;window.__cvs=new Set();window.__gl=0;
const gc=P.getContext;P.getContext=function(t,...a){__cvs.add(this);if(/webgl/.test(t)&&!this.__glc){this.__glc=1;__gl++}return gc.call(this,t,...a)};
for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(P,k,{get(){return d.get.call(this)},set(v){__cvs.add(this);d.set.call(this,v)}})}
window.__ft=[];let lt=0;const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(cb){return raf.call(window,t=>{if(window.__rec&&lt)__ft.push(t-lt);lt=t;return cb(t)})};
window.__cvStats=()=>{let tot=0,max=0,n=0,live=0,gl=0;for(const c of __cvs){const a=c.width*c.height;if(!a)continue;n++;tot+=a;if(a>max)max=a;if(c.isConnected)live+=a;if(c.__glc)gl+=a}return {n,MB:+(tot*4/1048576).toFixed(1),maxMpx:+(max/1e6).toFixed(2),domMB:+(live*4/1048576).toFixed(1),glMB:+(gl*4/1048576).toFixed(1),glCtx:__gl}};
})()"""
def save(sid,c,r):
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':{'sid':sid,'c':c,'r':r,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}})
async def one(p,b,course,sid,res):
    ctx=await b.new_context(**p.devices['iPhone 13'])
    await ctx.add_init_script(HOOK)
    # mark cutscenes as seen so screenshots show the scene, not the intro video
    await ctx.add_init_script("try{['ai-evals.intro','portfolio-guide.cash-vault','portfolio-guide.hedge-smithy','portfolio-guide.intro'].forEach(k=>localStorage.setItem('learning-apps.cut.'+k,'1'))}catch(e){}")
    pg=await ctx.new_page();pg.set_default_timeout(60000);ev=[]
    pg.on('pageerror',lambda e:ev.append('ERR '+str(e)[:160]));pg.on('crash',lambda *_:ev.append('CRASH'))
    r={'course':course,'sid':sid}
    try:
        await pg.goto(f'http://127.0.0.1:9161/{root}{course}/index.html')
        await pg.evaluate(f"localStorage.setItem('learning-apps.{course}',{json.dumps(save(sid,-1 if sid=='w' else 7,-1 if sid=='w' else 9))})")
        t0=time.time();await pg.reload(wait_until='load');r['loadWall']=round(time.time()-t0,2)
        nav=await pg.evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0];const rs=performance.getEntriesByType('resource');let kb=0;rs.forEach(x=>kb+=(x.encodedBodySize||x.transferSize||0));return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),req:rs.length,kb:Math.round(kb/1024)}})()")
        r.update(nav)
        await pg.wait_for_timeout(700)
        t=time.time();await pg.click('#tc');await pg.wait_for_timeout(2500);r['enter']=round(time.time()-t,2)
        await pg.evaluate("document.querySelectorAll('.lq-cheer').forEach(e=>e.remove());window.__ft=[];window.__rec=1")
        await pg.wait_for_timeout(3000)
        r.update(await pg.evaluate("(()=>{const f=__ft.slice().sort((a,b)=>a-b);const m=f.length?f[Math.floor(f.length/2)]:0,p95=f.length?f[Math.floor(f.length*.95)]:0;return Object.assign({perf:window.LQPerf?LQPerf.stats():null,fps:+(f.length/3).toFixed(1),medMs:+m.toFixed(1),p95Ms:+p95.toFixed(1)},__cvStats())})()"))
        await pg.screenshot(path=f'{out}/{tag}-{course}-{"world" if sid=="w" else "town"}-iphone13-webkit.png')
        # hidden-tab idle: count rAF callbacks doing work while hidden is not observable in headless; measure timers instead
    except Exception as e: ev.append('EXC '+str(e)[:120])
    r['events']=ev;res.append(r);print(json.dumps(r),flush=True)
    await ctx.close()
async def main():
    res=[]
    async with async_playwright() as p:
        b=await p.webkit.launch()
        for c in courses:
            for s in ['t0','w']: await one(p,b,c,s,res)
        await b.close()
    json.dump(res,open(f'{out}/{tag}-metrics.json','w'),indent=1)
asyncio.run(main())
