"""AI Foundations l4, question index 4: the 0-based validation-loss index.

The wording in fixes.js asks for the index (right answer 2). Typing 2 must
be marked correct, and the old 1-based key 3 must not.

Run: BASE=http://127.0.0.1:8000 python3 tests/e2e/af_l4_num.py
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:8000')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
fails = 0

def ck(cond, msg):
    global fails
    print(('OK   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails += 1

def dismiss(pg):
    pg.evaluate(
        "window.Narr&&Narr.closeCut();"
        "var c=document.getElementById('cutscene');if(c)c.remove();"
        "window.LQMilestones&&LQMilestones.close();"
        "var m=document.getElementById('lqms');if(m)m.remove();"
        "var t=document.getElementById('ttl');if(t)t.hidden=true;"
    )

def open_quiz(pg):
    dismiss(pg)
    # l4 Generalisation is levels[3]
    pg.evaluate("Engine.setExit(function(){});var o=document.getElementById('ov');if(o)o.hidden=false;Engine.level(3,'quiz')")
    pg.wait_for_selector('#q [data-o], #q #nv, #q #ck', state='visible', timeout=8000)

def current_prompt(pg):
    return pg.evaluate("document.querySelector('#q h2, #q .q, #q p, #ovbody, #q') ? document.querySelector('#q').innerText : ''")

def click_next_until_num(pg):
    """Answer the first four questions so the number prompt is showing."""
    for _ in range(8):
        if pg.locator('#nv').count() and pg.locator('#nv').is_visible():
            return
        # mc / multi
        if pg.locator('[data-o]').count():
            # Use the in-page key so this test does not hard-code option
            # indices for the earlier questions (only the number key is under test).
            pg.evaluate("""() => {
              var L=APP.levels[3], i=0, box=document.getElementById('q');
              /* engine does not expose the index; click the keyed option(s) */
            }""")
            a = pg.evaluate("""() => {
              var text=(document.querySelector('#q h2, #q .kicker, #q')||{}).innerText||'';
              var qs=APP.levels[3].qs;
              for (var i=0;i<qs.length;i++){
                if (text.indexOf(qs[i].q.slice(0,40))>=0) return {t:qs[i].t,a:qs[i].a};
              }
              return null;
            }""")
            if not a:
                # fallback: click first option
                pg.locator('[data-o]').first.click()
            elif a['t']=='mc':
                pg.click('#q [data-o="%d"]' % a['a'])
            elif a['t']=='multi':
                for i in a['a']:
                    pg.click('#q [data-o="%d"]' % i)
            pg.click('#ck')
            pg.wait_for_selector('#nx', timeout=5000)
            pg.click('#nx')
            pg.wait_for_timeout(250)
        else:
            raise SystemExit('unexpected quiz prompt: ' + current_prompt(pg)[:200])
    raise SystemExit('number question never appeared')

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1100, 'height': 800})
    pg.set_default_timeout(15000)
    pg.goto(BASE + '/ai-foundations/index.html')
    pg.wait_for_timeout(800)
    pg.evaluate("localStorage.clear(); localStorage.setItem('learning-apps.fx','full')")
    pg.reload()
    pg.wait_for_timeout(800)
    pg.click('#tn')
    pg.wait_for_timeout(500)
    dismiss(pg)
    q = pg.evaluate("APP.levels[3].qs[4]")
    print('patched question', q)
    ck(q and q['t']=='num' and q['a']==2, 'patched key is 2 (got %s)' % (q and q.get('a')))
    ck(q and 'Counting positions from 0' in (q.get('q') or ''), 'wording asks for a 0-based index')

    def result_after(value):
        open_quiz(pg)
        click_next_until_num(pg)
        prompt = pg.inner_text('#q')
        ck('lowest validation loss' in prompt.lower() or 'Counting positions from 0' in prompt,
           'number prompt is the validation-loss question')
        pg.fill('#nv', str(value))
        pg.click('#ck')
        pg.wait_for_selector('#q .fb', timeout=5000)
        fb = pg.inner_text('#q .fb')
        cls = pg.get_attribute('#q .fb', 'class') or ''
        print('typed %s -> class=%s text=%r' % (value, cls, fb[:120]))
        return cls, fb

    cls2, fb2 = result_after(2)
    ck('ok' in cls2.split() and 'Correct' in fb2, 'typing 2 is marked correct')
    ck('Not quite' not in fb2, 'typing 2 is not marked wrong')

    cls3, fb3 = result_after(3)
    ck('no' in cls3.split() and 'Not quite' in fb3, 'typing 3 (the old 1-based key) is marked wrong')
    b.close()

print('FAILS', fails)
sys.exit(1 if fails else 0)
