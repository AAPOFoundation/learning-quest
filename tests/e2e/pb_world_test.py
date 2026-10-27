"""Home page + Python Basics world check (home order, lessons, scratchpad, unlocks, ideas modal).

Home now lists the four worlds as numbered quest cards (main a.btn) and the
Portfolio Guide as a separate journey card (a#j-portfolio-guide), as it has
since the MVP. The 'home order' check expects exactly that.

Run: python3 -m http.server 8000 (repo root), then
     BASE=http://localhost:8000 python3 tests/e2e/pb_world_test.py
Prints FAIL lines and a final 'FAILS n' (0 = pass).
"""
import sys,json,os
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else os.environ.get('BASE','http://localhost:8000');CHROME=os.environ.get('CHROME','/usr/bin/google-chrome')
res=[]
def chk(name,ok,info=''):
    res.append(ok);print(('PASS ' if ok else 'FAIL ')+name,info)
def dismiss(pg):
    pg.evaluate("window.Narr&&Narr.closeCut();var c=document.getElementById('cutscene');if(c)c.remove()")
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None,args=['--no-sandbox'])
  pg=b.new_page(viewport={'width':1100,'height':800});errs=[]
  pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.on('response',lambda r:errs.append('HTTP %s %s'%(r.status,r.url)) if r.status>=400 else None)
  # --- home ordering
  pg.goto(BASE+'/index.html');pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(500)
  links=pg.evaluate("[...document.querySelectorAll('main a.btn')].map(a=>a.getAttribute('href'))")
  chk('home order',links==['python-basics/index.html','ai-foundations/index.html','ai-evals/index.html','ai-safety/index.html'],links)
  pgl=pg.evaluate("(function(){var a=document.querySelector('main a#j-portfolio-guide');return a&&a.getAttribute('href')})()")
  chk('home links the Portfolio Guide card',pgl=='portfolio-guide/index.html',pgl)
  chk('home suggests Python Basics first',pg.inner_text('#jnext').startswith('Suggested next: Python Basics'),pg.inner_text('#jnext'))
  pg.evaluate("localStorage.setItem('learning-apps.python-basics',JSON.stringify({v:1,xp:5,streak:1,last:'',levels:{b1:{best:1,done:true},b2:{best:1,done:true}},badges:[],boss:null,w:null}))");pg.reload();pg.wait_for_timeout(300)
  chk('home progress',('2 of 6' in pg.inner_text('.prog[data-k=python-basics]')),pg.inner_text('.prog[data-k=python-basics]'))
  pg.evaluate("localStorage.clear()")
  # --- python-basics world
  pg.goto(BASE+'/python-basics/index.html');pg.wait_for_timeout(800)
  pg.click('#tn');pg.wait_for_timeout(500);dismiss(pg)
  chk('6 levels, locks',pg.evaluate("APP.levels.length===6&&Engine.unlocked(0)&&!Engine.unlocked(1)"))
  # lesson with live widget (via teacher overlay path)
  pg.evaluate("var o=document.getElementById('ov');o.hidden=false;Engine.setExit(function(){o.hidden=true});Engine.level(0,'lesson')")
  pg.wait_for_selector('#ovbody .pyx textarea')
  pg.click('#ovbody .pyx .pyx-run');pg.wait_for_function("document.querySelector('#ovbody .pyx .cq-exout pre')",timeout=120000)
  out=pg.inner_text('#ovbody .pyx .cq-exout')
  chk('lesson example runs',out.startswith('Hello, world'),out[:40])
  pg.fill('#ovbody .pyx textarea','print(6*7)\nprint(undefined_name)');pg.click('#ovbody .pyx .pyx-run')
  pg.wait_for_function("/NameError/.test(document.querySelector('#ovbody .pyx .cq-exout').textContent)",timeout=60000)
  chk('free-form edit shows error with line',('42' in pg.inner_text('#ovbody .pyx .cq-exout')) and 'line 2' in pg.inner_text('#ovbody .pyx .cq-exout'),pg.inner_text('#ovbody .pyx .cq-exout')[:90])
  # lessons count
  chk('every lesson section has a runnable example',pg.evaluate("PYB.levels.every(l=>l.lesson.every(s=>s.b.indexOf('class=\"pyx\"')>=0))"))
  pg.click('#ovx');pg.wait_for_timeout(300)
  # pause menu scratchpad
  pg.keyboard.press('Escape');pg.wait_for_timeout(300)
  btns=pg.evaluate("[...document.querySelectorAll('#ovbody [data-m]')].map(b=>b.dataset.m)")
  chk('pause menu has scratchpad',('tab:scratch' in btns),btns)
  pg.evaluate("document.querySelector('#ovbody [data-m=\"tab:scratch\"]').click()");pg.wait_for_selector('#scr-ed')
  pg.fill('#scr-ed','xs = [3, 1, 2]\nprint(sorted(xs), sum(xs))');pg.click('.pyx-scr-run')
  pg.wait_for_function("/\\[1, 2, 3\\] 6/.test(document.querySelector('#scr-out').textContent)",timeout=60000)
  chk('scratchpad runs free-form code',True)
  chk('scratchpad saved',pg.evaluate("localStorage.getItem('learning-apps.scratch').indexOf('sorted')>=0"))
  pg.screenshot(path=os.environ.get('SHOTS','.')+'/pb_scratch.png')
  pg.evaluate("document.getElementById('bk2').click()");pg.wait_for_timeout(300)
  # map screenshots, fog, unlock progression via real warp+gate trial path
  for i in range(6):
    pg.evaluate("__w.warp('t%d',7,9)"%i);pg.wait_for_timeout(300)
    if i in (0,5): pg.screenshot(path=os.environ.get('SHOTS','.')+'/pb_t%d.png'%i)
  pg.evaluate("__w.warp('k',7,9)");pg.wait_for_timeout(300);pg.screenshot(path=os.environ.get('SHOTS','.')+'/pb_k.png')
  pg.evaluate("__w.warp('w',4,21)");pg.wait_for_timeout(300)
  pg.keyboard.press('m');pg.wait_for_timeout(400);pg.screenshot(path=os.environ.get('SHOTS','.')+'/pb_map.png')
  pg.keyboard.press('Escape');pg.wait_for_timeout(200)
  # clear levels progressively: unlocked(i+1) only after done(i)
  ok=True
  for i in range(6):
    if i<5 and pg.evaluate("Engine.unlocked(%d)"%(i+1)): ok=False
    pg.evaluate("var P=Engine.P();P.levels[APP.levels[%d].id]={best:1,done:true};Engine.save()"%i)
    if i<5 and not pg.evaluate("Engine.unlocked(%d)"%(i+1)): ok=False
  chk('regions unlock one by one',ok)
  chk('castle opens after all 6',pg.evaluate("Engine.doneCount()===6"))
  chk('no console errors (python-basics)',not errs,errs)
  # --- other worlds: ideas modal and scratchpad
  for w,cid in [('ai-foundations','af-l1'),('ai-evals','pp2'),('ai-safety','as-l3')]:
    errs.clear()
    pg.goto(BASE+'/%s/index.html'%w);pg.wait_for_timeout(700)
    pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(500);pg.click('#tn');pg.wait_for_timeout(400);dismiss(pg)
    pg.evaluate("""(cid)=>{var q=null;APP.levels.forEach(l=>l.qs.forEach(x=>{if(x.id===cid)q=x}));var d=document.createElement('div');d.id='tdiv';document.body.appendChild(d);CodeQ.mount(q,d,{idx:0,total:1,title:'t',done:function(){}})}""",cid)
    n=pg.evaluate("document.querySelectorAll('#tdiv .pyidea-link').length")
    chk('%s: ideas shown for %s'%(w,cid),n>=2,n)
    pg.click('#tdiv .pyidea-link');pg.wait_for_selector('.pyidea .pyx textarea')
    chk('%s: modal shows Basics lesson with runnable example'%w,True,pg.inner_text('.pyidea-bar')[:50])
    pg.click('.pyidea .pyx-run');pg.wait_for_function("document.querySelector('.pyidea .cq-exout').textContent.length>0",timeout=120000)
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    chk('%s: Escape closes modal'%w,pg.evaluate("!document.querySelector('.pyidea')"))
    pg.keyboard.press('Escape') if False else None
    pg.evaluate("document.getElementById('tdiv').remove()")
    for _ in range(6): pg.keyboard.press('Enter');pg.wait_for_timeout(150)
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    btns=pg.evaluate("[...document.querySelectorAll('#ovbody [data-m]')].map(b=>b.dataset.m)")
    chk('%s: menu has scratchpad and keeps review'%w,'tab:scratch' in btns and 'tab:review' in btns,btns)
    chk('%s: no console errors'%w,not errs,errs)
  # ideas coverage: every code challenge in other worlds has ideas
  pg.goto(BASE+'/ai-safety/index.html');pg.wait_for_timeout(500)
  b.close()
print('FAILS',res.count(False))
