"""Review deck and Practice tab check (ai-evals, ai-foundations, ai-safety).

The review deck only uses questions from levels the player has cleared
(shared/review.js, since the MVP), so a fresh save shows an empty deck with no
#rv-go / #rv-boss buttons. This test clears level 1 first, renders the tabs
with the same ctx the game passes (award/save/toast/P), then plays a full
10-card mixed round.

Run: python3 -m http.server 8000 (repo root), then
     BASE=http://localhost:8000 python3 tests/e2e/rev_test.py
Prints FAIL lines and a final 'FAILS n' (0 = pass).
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE','http://localhost:8000');CHROME=os.environ.get('CHROME','/usr/bin/google-chrome')
fails=0
def chk(name,ok,info=''):
  global fails
  fails+=0 if ok else 1;print(('PASS ' if ok else 'FAIL ')+name,info)
CTX="{award:Engine.award,save:Engine.save,toast:Engine.toast,P:Engine.P()}"
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None,args=['--no-sandbox'])
  for w in ['ai-evals','ai-foundations','ai-safety']:
    pg=b.new_page(viewport={'width':1100,'height':800});errs=[]
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(BASE+'/%s/index.html'%w);pg.wait_for_timeout(600);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(600)
    print(w,pg.evaluate("APP.tabs.map(t=>t.id)"))
    # fresh save: deck is empty by design
    pg.evaluate("(function(){var d=document.createElement('div');d.id='tt';document.body.appendChild(d);APP.tabs.filter(x=>x.id==='review')[0].render(d,%s)})()"%CTX)
    chk(w+': fresh save shows the empty-deck note',pg.evaluate("!document.querySelector('#tt #rv-boss')&&/Clear your first level/.test(document.getElementById('tt').innerText)"))
    # clear level 1, then the deck has cards
    pg.evaluate("var P=Engine.P();P.levels[APP.levels[0].id]={best:1,done:true};Engine.save();document.getElementById('tt').remove()")
    n=pg.evaluate("(function(){var d=document.createElement('div');d.id='tt';document.body.appendChild(d);APP.tabs.filter(x=>x.id==='review')[0].render(d,%s);return d.innerText.length})()"%CTX)
    chk(w+': review tab renders after level 1',n>50,n)
    chk(w+': mixed round button present',pg.evaluate("!!document.querySelector('#tt #rv-boss')"))
    pg.evaluate("document.querySelector('#tt #rv-boss').click()")
    total=pg.evaluate("(document.querySelector('#tt .kicker').textContent.match(/of (\\d+)/)||[0,0])[1]*1")
    for i in range(total):
      pg.evaluate("document.querySelector('#tt .opt').click()");pg.evaluate("document.querySelector('#tt #rv-nx').click()")
    end=pg.inner_text('#tt')[:70].replace('\n',' ');print(' ',end)
    chk(w+': round completes',total>0 and 'complete' in end.lower(),total)
    pg.evaluate("document.getElementById('tt').remove()")
    # practice tab with the real ctx. Foundations does not ship this tab.
    has=pg.evaluate("APP.tabs.some(function(t){return t.id==='practice'})")
    if has:
      n=pg.evaluate("(function(){var d=document.createElement('div');d.id='tt';document.body.appendChild(d);APP.tabs.filter(x=>x.id==='practice')[0].render(d,%s);return d.innerText.length})()"%CTX)
      chk(w+': practice tab renders',n>50,n)
      pg.evaluate("document.getElementById('tt').remove()")
    else:
      print(' ',w,'has no practice tab')
    chk(w+': no console errors',not errs,errs)
    pg.close()
  b.close()
print('FAILS',fails)
