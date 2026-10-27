"""Pause menu -> Review deck / Practice path (ai-evals, ai-foundations, ai-safety, portfolio-guide).

Uses the real UI: start the game, open the pause menu with Escape, pick the
Review deck and start a round with #rv-go. The review deck only shows
questions from cleared levels (shared/review.js, since the MVP), so the test
clears level 1 first; on a fresh save it checks the empty-deck note instead.

Run: python3 -m http.server 8000 (repo root), then
     BASE=http://localhost:8000 python3 tests/e2e/menu_test.py
Prints FAIL lines and a final 'FAILS n' (0 = pass).
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.environ.get('BASE','http://localhost:8000');CHROME=os.environ.get('CHROME','/usr/bin/google-chrome')
fails=0
def chk(name,ok,info=''):
  global fails
  fails+=0 if ok else 1;print(('PASS ' if ok else 'FAIL ')+name,info)
def open_menu(pg):
  pg.keyboard.press('Escape');pg.wait_for_timeout(300)
  return pg.evaluate("[...document.querySelectorAll('#ovbody [data-m]')].map(b=>b.dataset.m)")
def back(pg):
  pg.evaluate("document.getElementById('bk2').click()");pg.wait_for_timeout(250)
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None,args=['--no-sandbox'])
  for w in ['ai-evals','ai-foundations','ai-safety','portfolio-guide']:
    pg=b.new_page(viewport={'width':1100,'height':800});errs=[]
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(BASE+'/%s/index.html'%w);pg.wait_for_timeout(600);pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(600)
    pg.click('#tn');pg.wait_for_timeout(500)
    for _ in range(8):
      pg.keyboard.press('Enter');pg.wait_for_timeout(250)
    btns=open_menu(pg);print(w,btns)
    chk(w+': pause menu opens',len(btns)>3,btns)
    if 'tab:review' in btns:
      pg.evaluate("document.querySelector('#ovbody [data-m=\"tab:review\"]').click()");pg.wait_for_timeout(300)
      chk(w+': fresh save shows the empty-deck note',pg.evaluate("!document.querySelector('#rv-go')&&/Clear your first level/.test(document.getElementById('rd').innerText)"))
      back(pg)
      pg.evaluate("var P=Engine.P();P.levels[APP.levels[0].id]={best:1,done:true};Engine.save()")
      btns=open_menu(pg)
    for t in ['tab:review','tab:practice']:
      if t not in btns: continue
      pg.evaluate("document.querySelector('#ovbody [data-m=\"%s\"]').click()"%t);pg.wait_for_timeout(300)
      txt=pg.inner_text('#ovbody')[:60].replace('\n',' ');print(' ',t,txt)
      chk('%s: %s opens'%(w,t),len(txt)>10,txt)
      if t=='tab:review':
        chk(w+': review start button present',pg.evaluate("!!document.querySelector('#rv-go')"))
        pg.evaluate("document.querySelector('#rv-go').click()");pg.wait_for_timeout(250)
        q=pg.inner_text('#rd')[:50].replace('\n',' ');print('   ',q)
        chk(w+': review round starts with a question',pg.evaluate("document.querySelectorAll('#rd .opt').length>1"),q)
      back(pg);btns=open_menu(pg)
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    chk(w+': no console errors',not errs,errs)
    pg.close()
  b.close()
print('FAILS',fails)
