"""Before/after shots for the r5 character pass. Usage: python3 shots.py <before|after> [port] [chromium|webkit]
Needs a static server on the repo root (python3 -m http.server <port>). Chromium 1280x800 and WebKit iPhone 13 (390x844).
Each shot gets a fresh browser context (WebKit on a busy Linux box sometimes crashes a page; the shot is retried)."""
import sys
from playwright.sync_api import sync_playwright
tag=sys.argv[1]; port=sys.argv[2] if len(sys.argv)>2 else "9153"; only=sys.argv[3] if len(sys.argv)>3 else ""
B=f"http://127.0.0.1:{port}/"; out="/workspace/lq-shots/r5-chars/"
SEED="""(([sid,c,r,ndone,xp])=>{var A=window.APP,lv={};A.levels.slice(0,ndone).forEach(function(L){lv[L.id]={done:true,best:1,stars:3}});
localStorage.setItem('learning-apps.'+A.key,JSON.stringify({v:1,xp:xp,streak:1,last:'',levels:lv,badges:[],boss:null,w:{sid:sid,c:c,r:r,intro:1,chests:{},caches:{},taught:{0:1,1:1,2:1},sim:{},visited:{}}}));localStorage.setItem('learning-apps.fx','full')})"""
TOWNS=[("python","python-basics","t0",7,5,0,120),("evals","ai-evals","t1",6,6,1,300),("safety","ai-safety","t0",7,5,0,500),("portfolio","portfolio-guide","t0",7,5,0,700)]
errs=[]
def shoot(b,eng,fn):
    for attempt in range(5):
        ctx=b.new_context(viewport={"width":1280,"height":800},device_scale_factor=2) if eng=="chromium" else b.new_context(**DEV)
        pg=ctx.new_page(); pg.on("pageerror",lambda e: errs.append(eng+": "+str(e)))
        try:
            fn(pg); ctx.close(); return True
        except Exception as e:
            print("retry",eng,str(e)[:90],flush=True)
            try: ctx.close()
            except Exception: pass
    return False
with sync_playwright() as p:
    DEV=p.devices["iPhone 13"]
    for eng,suf in [("chromium","1280x800"),("webkit","390x844")]:
        if only and eng!=only: continue
        b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"]) if eng=="chromium" else p.webkit.launch()
        for nm,app,sid,c,r,nd,xp in TOWNS:
            if eng=="webkit" and nm in ("evals","portfolio"): continue  # these two worlds crash the Linux WebKit build on main too (see NOTES)
            def f(pg,nm=nm,app=app,sid=sid,c=c,r=r,nd=nd,xp=xp):
                pg.goto(B+app+"/index.html",wait_until="load"); pg.wait_for_timeout(400)
                pg.evaluate(SEED,[sid,c,r,nd,xp]); pg.reload(wait_until="load"); pg.wait_for_timeout(500)
                pg.click("#tc"); pg.wait_for_timeout(3200)
                pg.screenshot(path=f"{out}{tag}-town-{nm}-{suf}.png")
                if nm=="python" and eng=="chromium":
                    pg.screenshot(path=f"{out}{tag}-closeup-python-1280x800.png",clip={"x":470,"y":180,"width":440,"height":260})
            print("shot",eng,nm,shoot(b,eng,f),flush=True)
        for q,n in [("","sheet"),("&close=1","sheet-closeup")]:
            def f(pg,q=q,n=n):
                pg.goto(B+"docs/r5-chars/sheet.html?t=1.3"+q,wait_until="load"); pg.wait_for_timeout(700); pg.screenshot(path=f"{out}{tag}-{n}-{suf}.png")
            print("shot",eng,n,shoot(b,eng,f),flush=True)
        b.close()
print("page errors:",errs)
