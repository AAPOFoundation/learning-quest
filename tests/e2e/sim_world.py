"""Open the town simulator from the building on that level's town.

The Safety world's misuse-classifier simulator is attached to level l4
(ai-safety/add.js runs after insert.js). l4 is town t4, not t3. A kid who
clears the path and visits the l4 town finds the hall. The old harness
warped to t3, where there is no simulator.

Run: BASE=http://localhost:8000 python3 tests/e2e/sim_world.py
Prints FAIL lines and a final 'FAILS n' (0 = pass).
"""
import os
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8000')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
# world, town index, level id, simulator name
EXPECT = [
    ('ai-evals', 6, 'l4', 'The Threshold Workshop'),
    ('ai-foundations', 2, 'l3', 'The Step-Size Forge'),
    ('ai-safety', 4, 'l4', 'The Gate Threshold Hall'),
]
fails = 0
def chk(name, ok, info=''):
    global fails
    fails += 0 if ok else 1
    print(('PASS ' if ok else 'FAIL ') + name, info)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])
    for world, ti, lid, name in EXPECT:
        pg = b.new_page(viewport={'width': 1000, 'height': 800})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE + '/%s/index.html' % world)
        pg.wait_for_timeout(500)
        pg.evaluate("localStorage.clear()")
        pg.reload()
        pg.wait_for_timeout(600)
        pg.click('#tn')
        pg.wait_for_timeout(800)
        for _ in range(8):
            pg.keyboard.press('Enter')
            pg.wait_for_timeout(200)
        pg.evaluate("window.Narr&&Narr.closeCut()")
        pg.evaluate("var P=Engine.P();APP.levels.forEach(l=>{P.levels[l.id]={best:1,done:true}});Engine.save();Narr.closeCut()")
        got = pg.evaluate("""(ti)=>{var L=APP.levels[ti];var s=WORLD.regions[ti]&&WORLD.regions[ti].sim;return {id:L&&L.id,name:s&&s.name}}""", ti)
        chk('%s: town t%d is level %s' % (world, ti, lid), got['id'] == lid, got)
        chk('%s: %s is on that town' % (world, name), got['name'] == name, got)
        pg.evaluate("__w.warp('t%d',7,9)" % ti)
        pg.wait_for_timeout(400)
        pg.evaluate("Narr.closeCut()")
        o = pg.evaluate("(function(){var s=__w.scene();var x=s.objs.filter(o=>o.role==='sim')[0];return x&&{c:x.c,r:x.r,name:x.name}})()")
        chk('%s: sim building is in the town' % world, bool(o) and o['name'] == name, o)
        if o:
            pg.evaluate("__w.warp('t%d',%d,%d)" % (ti, o['c'], o['r'] + 3))
            pg.wait_for_timeout(400)
            pg.evaluate("Narr.closeCut();__w.interact(__w.scene().objs.filter(x=>x.role==='sim')[0])")
            pg.wait_for_timeout(600)
            opened = pg.is_visible('#dlg') or pg.is_visible('#ov')
            print(' opened', opened)
            for _i in range(4):
                if pg.is_visible('#dlg'):
                    txt = pg.inner_text('#dlg')[:140].replace('\n', ' ')
                    print(' dlg:', txt)
                    if pg.query_selector('#dlg [data-k="0"]'):
                        pg.click('#dlg [data-k="0"]')
                        break
                    pg.keyboard.press('Enter')
                    pg.wait_for_timeout(300)
            pg.wait_for_timeout(400)
            ov = pg.is_visible('#ov')
            body = pg.inner_text('#ovbody')[:120].replace('\n', ' ') if ov else ''
            print(' overlay:', body or 'none')
            chk('%s: simulator opens' % world, bool(ov) and name in body, body)
            if pg.query_selector('#simx'):
                pg.click('#simx')
                chk('%s: close returns to the map' % world, pg.evaluate("document.getElementById('ov').hidden") is True)
        chk('%s: no page errors' % world, not errs, errs)
        pg.close()
    b.close()
print('FAILS', fails)
