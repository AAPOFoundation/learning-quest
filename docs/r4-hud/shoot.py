import asyncio, json, sys
from playwright.async_api import async_playwright
TAG=sys.argv[1]; BASE='http://127.0.0.1:9143/'+(sys.argv[3] if len(sys.argv)>3 else ''); OUT='./'
def save(town,xp=40):
    w={'sid':'t0','c':7,'r':9,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1} if town else {'sid':'w','c':-1,'r':-1,'chests':{},'caches':{},'taught':{},'sim':{},'visited':{},'intro':1}
    return json.dumps({'v':1,'xp':xp,'streak':1,'last':'','levels':{},'badges':[],'boss':None,'w':w})
PROBE='''()=>{const cv=document.getElementById('cv');const r=cv?cv.getBoundingClientRect():null;
const out={dpr:devicePixelRatio,inner:[innerWidth,innerHeight],cv:cv?[cv.width,cv.height,Math.round(r.width),Math.round(r.height)]:null,
docH:document.documentElement.scrollHeight,bodyOverflowX:document.documentElement.scrollWidth>innerWidth};
const rect=id=>{const e=document.getElementById(id);if(!e||e.offsetParent===null)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]};
['lt','tr','area','narrcap','pad','acts','dlg','lqreward'].forEach(k=>out[k]=rect(k));
const offs=[];document.querySelectorAll('#hud *').forEach(e=>{const b=e.getBoundingClientRect();if(b.width&&(b.right>innerWidth+1||b.left<-1||b.bottom>innerHeight+1))offs.push(e.id||e.className||e.tagName)});out.offscreen=offs.slice(0,8);
if(window.__w){const s=__w.st, sc=s.scene; out.mode=s.mode; out.sid=s.sid;}
return out}'''
async def run(p, eng):
    if eng=='chromium':
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); ctxargs={'viewport':{'width':1280,'height':800}}; nm='desk'
    else:
        b=await p.webkit.launch(); ctxargs={**p.devices['iPhone 13'],'viewport':{'width':390,'height':844}}; nm='iphone'
    res={}; ctx=await b.new_context(**ctxargs)
    await ctx.add_init_script("try{localStorage.setItem('learning-apps.fx','full')}catch(e){}")
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append('pageerror: '+str(e)))
    pg.on('console',lambda m: errs.append('console: '+m.text) if m.type=='error' and 'fonts.g' not in m.text else None)
    await pg.goto(BASE+'index.html'); await pg.wait_for_timeout(2000)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-1-home.png'); res['home']=await pg.evaluate(PROBE)
    c='python-basics'
    await pg.goto(BASE+c+'/index.html'); await pg.evaluate(f"localStorage.setItem('learning-apps.{c}',{json.dumps(save(False))})")
    await pg.reload(); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-2-title.png'); res['title']=await pg.evaluate(PROBE)
    await pg.click('#tc'); await pg.wait_for_timeout(3000)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-3-map.png'); res['map']=await pg.evaluate(PROBE)
    await pg.keyboard.press('m'); await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-4-fullmap.png'); res['fullmap']=await pg.evaluate(PROBE)
    # town arrival: banner vs gatekeeper
    await pg.evaluate(f"localStorage.setItem('learning-apps.{c}',{json.dumps(save(True))})")
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(1100)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-5-town-arrive.png'); res['town']=await pg.evaluate(PROBE)
    # gatekeeper screen pos (if exposed)
    res['gate']=await pg.evaluate("()=>window.LQHud&&LQHud.gateRect?LQHud.gateRect():null")
    await pg.wait_for_timeout(3000)
    # chest reward: real chest open with level 1 marked done
    await pg.evaluate("""(()=>{const k='learning-apps.python-basics';const s=JSON.parse(localStorage.getItem(k));s.levels=s.levels||{};s.levels[APP.levels[0].id]={done:true,stars:2,best:4};s.w.taught={0:1};localStorage.setItem(k,JSON.stringify(s))})()""")
    await pg.reload(); await pg.wait_for_timeout(1500); await pg.click('#tc'); await pg.wait_for_timeout(4200)
    ok=await pg.evaluate("(()=>{const o=__w.scene().objs.find(o=>o.role==='chest');if(!o)return false;__w.interact(o);return true})()")
    res['chestInteract']=ok
    await pg.wait_for_timeout(1800)
    await pg.screenshot(path=f'{OUT}{TAG}-{nm}-6-chest.png'); res['chest']=await pg.evaluate(PROBE)
    res['errors']=errs
    await b.close(); return res
async def main():
    out={}
    async with async_playwright() as p:
        engs=sys.argv[2].split(',') if len(sys.argv)>2 else ['chromium','webkit']
        for e in engs: out[e]=await run(p,e)
    json.dump(out,open(f'{OUT}{TAG}-probe.json','w'),indent=1); print(json.dumps(out,indent=1)[:6000])
asyncio.run(main())
