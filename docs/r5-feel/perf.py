"""Round 5 lane F perf: python3 perf.py OUT.json
Interleaves the baseline (origin/main served on :9153) and this branch (:9152) scene by scene, 2 rounds, Chromium headless.
Per load: median and p95 ms of draw() over 50 calls, (a) the whole frame including the GL light pass (SwiftShader, software GL; desktop only),
(b) the 2D canvas only (GL pass stubbed), and on the branch (c) the time inside LQFeel (grass, foam, props, dust, drift, birds, prompt).
Profiles: desktop 1280x800 DPR1; phone 390x844 DPR3 with 4x CPU throttle. The box is shared, so read the medians, not single runs."""
import asyncio, json, sys, statistics as stt
from playwright.async_api import async_playwright
OUT=sys.argv[1]; BUILDS=[('base','http://127.0.0.1:9153/'),('r5','http://127.0.0.1:9152/')]
SC=[('meadow','python-basics','t0'),('desert','python-basics','t3'),('tundra','ai-foundations','t4'),('world','python-basics','w')]
def save(sid):
    w={'sid':sid,'c':7 if sid!='w' else -1,'r':8 if sid!='w' else -1,'chests':{},'caches':{},'taught':{'0':1},'sim':{},'visited':{},'intro':1}
    return json.dumps({'v':1,'xp':40,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':w})
MEAS='''()=>{const q=a=>{a.sort((x,y)=>x-y);return [a[a.length>>1],a[Math.floor(a.length*.95)]]};
 let fe=0;const F=window.LQFeel;if(F){['groundPass','airPass','drawProp','prompt'].forEach(k=>{const f=F[k];F[k]=function(){const a=performance.now();const r=f.apply(this,arguments);fe+=performance.now()-a;return r}})}
 const run=()=>{const t=[],e=[];for(let i=0;i<50;i++){fe=0;const a=performance.now();__w.draw();t.push(performance.now()-a);e.push(fe)}return [q(t),q(e)]};
 const full=window.__noFull?[[0,0],[0,0]]:run();const L=window.LQLight,fr=L&&L.frame;if(L)L.frame=function(){return true};const d2=run();if(L)L.frame=fr;
 return {full:full[0],canvas2d:d2[0],feel:d2[1]}}'''
async def main():
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for prof,ca,thr in [('desk',{'viewport':{'width':1280,'height':800}},1),('phone',{'viewport':{'width':390,'height':844},'device_scale_factor':3,'is_mobile':True,'has_touch':True},4)]:
            ctx=await b.new_context(**ca); await ctx.add_init_script("localStorage.setItem('learning-apps.fx','full')"); pg=await ctx.new_page(); cdp=await ctx.new_cdp_session(pg)
            for nm,app,sid in SC:
                for rnd in range(2):
                    for bn,base in BUILDS:
                        try:
                            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
                            await pg.goto(base+app+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{app}',{json.dumps(save(sid))})")
                            await pg.reload(); await pg.wait_for_timeout(1200); await pg.click('#tc',timeout=60000); await pg.wait_for_timeout(3000)
                            if thr>1: await pg.evaluate('window.__noFull=1')
                            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':thr})
                            r=await pg.evaluate(MEAS); res.setdefault(f'{prof}-{nm}',{}).setdefault(bn,[]).append(r); print(prof,nm,bn,r,flush=True)
                        except Exception as e: print('skip',prof,nm,bn,str(e)[:120],flush=True)
            await ctx.close()
        await b.close()
    summ={}
    for k,v in res.items():
        summ[k]={}
        for bn,runs in v.items():
            summ[k][bn]={'full_med':round(stt.median(r['full'][0] for r in runs),2),'canvas2d_med':round(stt.median(r['canvas2d'][0] for r in runs),2),'canvas2d_p95':round(stt.median(r['canvas2d'][1] for r in runs),2),'feel_med':round(stt.median(r['feel'][0] for r in runs),2)}
    json.dump({'summary':summ,'runs':res},open(OUT,'w'),indent=1); print(json.dumps(summ,indent=1))
asyncio.run(main())
