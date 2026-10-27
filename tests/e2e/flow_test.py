"""Play every gate question in one world, using the real answer key.

Two stale checks in the old harness, both test-side:

1. wait_for_selector('#ovbody button, #ovbody textarea') matches the primer's
   worked-example box first. That box sits in a closed <details>, so the 5s
   wait times out on Python Basics even though the real editor #cq-ed is on
   screen. This waits for the control the question actually uses.

2. Entering some towns plays a region clip (#cutscene, above the quiz).
   AI Evals and the Portfolio Guide do this on the first town, and the
   Portfolio Guide also does it on two later towns. A kid skips the clip
   before the gate trial. This test closes it the same way (Narr.closeCut)
   before it clicks.

Run: BASE=http://localhost:8000 python3 tests/e2e/flow_test.py <world>
"""
import os, sys
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8000')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
world = sys.argv[1]

def dismiss(pg):
    pg.evaluate("window.Narr&&Narr.closeCut();var c=document.getElementById('cutscene');if(c)c.remove()")

def ready(pg, q):
    if q['t'] == 'code':
        pg.wait_for_selector('#cq-ed', state='visible', timeout=8000)
    elif q['t'] == 'num':
        pg.wait_for_selector('#nv', state='visible', timeout=8000)
    elif q['t'] in ('mc', 'multi'):
        pg.wait_for_selector('#ovbody [data-o]', state='visible', timeout=8000)
    elif q['t'] == 'grade':
        pg.wait_for_selector('#ovbody [data-g]', state='visible', timeout=8000)
    else:
        raise SystemExit('unknown q ' + str(q['t']))

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1100, 'height': 800})
    pg.set_default_timeout(30000)
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('response', lambda r: errs.append('HTTP %s %s' % (r.status, r.url)) if r.status >= 400 else None)
    pg.goto(BASE + '/%s/index.html' % world)
    pg.wait_for_timeout(800)
    pg.evaluate("localStorage.clear()")
    pg.reload()
    pg.wait_for_timeout(800)
    pg.click('#tn')
    pg.wait_for_timeout(500)
    dismiss(pg)
    n = pg.evaluate("APP.levels.length")
    for i in range(n):
        pg.evaluate("__w.warp('t%d',7,9)" % i)
        pg.wait_for_timeout(250)
        dismiss(pg)
        pg.evaluate("Engine.setExit(function(){});var o=document.getElementById('ov');o.hidden=false;Engine.setExit(function(){o.hidden=true});Engine.level(%d,'quiz')" % i)
        dismiss(pg)
        cnt = pg.evaluate("APP.levels[%d].qs.length" % i)
        for k in range(cnt):
            q = pg.evaluate("(function(q){return {t:q.t,a:q.a,items:q.items&&q.items.map(x=>x.a),sol:q.solution}})(APP.levels[%d].qs[%d])" % (i, k))
            dismiss(pg)
            ready(pg, q)
            if q['t'] == 'mc':
                pg.click('#ovbody [data-o="%d"]' % q['a'])
                pg.click('#ck')
                pg.click('#nx')
            elif q['t'] == 'multi':
                for a in q['a']:
                    pg.click('#ovbody [data-o="%d"]' % a)
                pg.click('#ck')
                pg.click('#nx')
            elif q['t'] == 'num':
                pg.fill('#nv', str(q['a']))
                pg.click('#ck')
                pg.click('#nx')
            elif q['t'] == 'grade':
                for j, a in enumerate(q['items']):
                    pg.click('#ovbody [data-g="%d:%s"]' % (j, a))
                pg.click('#ck')
                pg.click('#nx')
            elif q['t'] == 'code':
                pg.fill('#cq-ed', q['sol'])
                pg.click('#cq-chk')
                pg.wait_for_selector('#cq-next', timeout=120000)
                pg.click('#cq-next')
            else:
                raise SystemExit('unknown q ' + q['t'])
        txt = pg.inner_text('#ovbody')[:60].replace('\n', ' ')
        print('level', i + 1, '->', txt)
    done = pg.evaluate("Engine.doneCount()")
    print('done levels', done, 'of', n, 'code solved', pg.evaluate("Object.keys(Engine.P().code||{}).length"), 'badges', pg.evaluate("Engine.P().badges"))
    print('console errors:', errs)
    b.close()
fails = 0
if done != n:
    print('FAIL levels completed', done, 'of', n)
    fails += 1
if errs:
    print('FAIL console errors', errs)
    fails += 1
if fails:
    print('FAILS', fails)
    sys.exit(1)
print('FAILS 0')
