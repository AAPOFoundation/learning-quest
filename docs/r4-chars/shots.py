"""Before/after shots for the r4 character pass. Usage: python3 shots.py <before|after> [port]
Needs a static server on the repo root (python3 -m http.server <port>)."""
import sys
from playwright.sync_api import sync_playwright
tag=sys.argv[1]; port=sys.argv[2] if len(sys.argv)>2 else "9142"
B=f"http://127.0.0.1:{port}/"; out="/workspace/lq-shots/r4-chars/"
SEED="""(([sid,c,r,ndone])=>{var A=window.APP,lv={};A.levels.slice(0,ndone).forEach(function(L){lv[L.id]={done:true,best:1,stars:3}});
localStorage.setItem('learning-apps.'+A.key,JSON.stringify({v:1,xp:120,streak:1,last:'',levels:lv,badges:[],boss:null,w:{sid:sid,c:c,r:r,intro:1,chests:{},caches:{},taught:{0:1,1:1,2:1},sim:{},visited:{}}}));localStorage.setItem('learning-apps.fx','full')})"""
def town(pg,app,sid,c,r,nd,wait=3200):
    pg.goto(B+app+"/index.html",wait_until="load"); pg.wait_for_timeout(400)
    pg.evaluate(SEED,[sid,c,r,nd]); pg.reload(wait_until="load"); pg.wait_for_timeout(500)
    pg.click("#tc"); pg.wait_for_timeout(wait)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"])
    for vp,suf,mob in [({"width":1280,"height":800},"1280x800",False),({"width":390,"height":844},"390x844",True)]:
        ctx=b.new_context(viewport=vp,device_scale_factor=2,is_mobile=mob,has_touch=mob)
        pg=ctx.new_page(); pg.on("pageerror",lambda e: errs.append(str(e)))
        town(pg,"python-basics","t0",7,5,0)
        pg.screenshot(path=f"{out}{tag}-gatekeeper-python-{suf}.png")
        if not mob:
            pg.screenshot(path=f"{out}{tag}-closeup-python-1280x800.png",clip={"x":470,"y":180,"width":440,"height":260})
        town(pg,"ai-evals","t1",6,6,1)
        pg.screenshot(path=f"{out}{tag}-town-evals-{suf}.png")
        pg.goto(B+"docs/r4-chars/sheet.html?t=1.3",wait_until="load"); pg.wait_for_timeout(600)
        pg.screenshot(path=f"{out}{tag}-sheet-{suf}.png")
        ctx.close()
    b.close()
print("page errors:",errs)
