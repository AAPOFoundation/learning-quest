"""Round 6 lane A perf: python3 perf.py OUT.json [rounds]
Interleaves origin/main (/before/) and this branch (/after/), both on http://127.0.0.1:9162/, scene by scene, Chromium headless.
Scenes: the first town of Python Basics, AI Foundations and AI Safety, with the first region cleared and all four companions joined
(the branch draws 3 followers on desktop and 2 on a phone; main draws none). Per load: median and p95 ms of draw() over 90 real animation frames (one
timed draw() per requestAnimationFrame, so the phone sprites redraw at their real rate) with the GL light pass stubbed (canvas 2D only), and on the
branch the r6 logic time per frame (hero state machine, followers, townsfolk and gatekeeper moods) from 200 back-to-back simulated frames. Profiles: desktop 1280x800 DPR1; phone 390x844 DPR3 with 4x CPU throttle. The box is shared, so read the medians."""
import asyncio, json, sys, os, statistics as stt
from playwright.async_api import async_playwright
OUT=sys.argv[1]; ROUNDS=int(sys.argv[2]) if len(sys.argv)>2 else 3
SETUP=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'setup.js')).read()
BUILDS=[('main','http://127.0.0.1:9162/before/'),('r6','http://127.0.0.1:9162/after/')]
SC=[('python','python-basics'),('foundations','ai-foundations'),('safety','ai-safety')]
MEAS='''async()=>{const q=a=>{a=a.slice().sort((x,y)=>x-y);return [a[a.length>>1],a[Math.floor(a.length*.95)]]};
 const L=window.LQLight,fr=L&&L.frame;if(L)L.frame=function(){return true};
 const t=[];await new Promise(res=>{let k=0;(function f(){const a=performance.now();__w.draw();t.push(performance.now()-a);if(++k<90)requestAnimationFrame(f);else res()})()});
 if(L)L.frame=fr;
 let logic=0;if(window.Art&&Art.heroSM&&window.Party&&Party.follow){const st=__w.st,sc=__w.scene(),h=st.hero,npcs=sc.objs.filter(o=>o.type==='npc'),op={},T0=st.time;
  const a=performance.now();for(let i=0;i<200;i++){Art.heroSM.step(1/60,{mv:false,held:false,dlg:false,turn:0,cel:false});Party.follow.step(h,1/60,sc,'play');for(const o of npcs)Party.npc(o,op,T0+i/60,h,'play',sc)}logic=(performance.now()-a)/200}
 const nf=window.Party&&Party.follow?Party.follow.list().length:0;return {canvas2d:q(t),logic:logic,followers:nf}}'''
async def main():
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for prof,ca,thr in [('desk',{'viewport':{'width':1280,'height':800}},1),('phone',{'viewport':{'width':390,'height':844},'device_scale_factor':3,'is_mobile':True,'has_touch':True},4)]:
            ctx=await b.new_context(**ca); await ctx.add_init_script("localStorage.setItem('learning-apps.fx','full');localStorage.setItem('learning-apps.guide','off')"); pg=await ctx.new_page(); cdp=await ctx.new_cdp_session(pg)
            for nm,app in SC:
                for rnd in range(ROUNDS):
                    for bn,base in (BUILDS if rnd%2==0 else BUILDS[::-1]):
                        try:
                            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
                            await pg.goto(base+app+'/index.html'); await pg.evaluate(SETUP,[app,'t0'])
                            await pg.reload(); await pg.wait_for_timeout(1200); await pg.click('#tc',timeout=60000); await pg.wait_for_timeout(3000)
                            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':thr})
                            r=await pg.evaluate(MEAS); res.setdefault(f'{prof}-{nm}',{}).setdefault(bn,[]).append(r); print(prof,nm,bn,r,flush=True)
                        except Exception as e: print('skip',prof,nm,bn,str(e)[:160],flush=True)
            await ctx.close()
        await b.close()
    summ={}
    for k,v in res.items():
        summ[k]={bn:{'canvas2d_med':round(stt.median(r['canvas2d'][0] for r in runs),2),'canvas2d_p95':round(stt.median(r['canvas2d'][1] for r in runs),2),'logic_per_frame':round(stt.median(r['logic'] for r in runs),3),'followers':runs[0]['followers']} for bn,runs in v.items()}
    json.dump({'summary':summ,'runs':res},open(OUT,'w'),indent=1); print(json.dumps(summ,indent=1))
asyncio.run(main())
