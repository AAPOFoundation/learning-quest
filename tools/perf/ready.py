import asyncio,sys
from playwright.async_api import async_playwright
JS="window.__rd={};new MutationObserver(()=>{if(!__rd.tc&&window.__w)__rd.tc=performance.now()}).observe(document,{subtree:true,childList:true});document.addEventListener('DOMContentLoaded',()=>__rd.dcl=performance.now());"
async def main():
  async with async_playwright() as p:
    b=await p.webkit.launch();R={}
    for rep in range(3):
     for root in ['_base/','']:
      for c in ['ai-evals','portfolio-guide','python-basics','ai-safety','ai-foundations']:
        ctx=await b.new_context(**p.devices['iPhone 13']);await ctx.add_init_script(JS);pg=await ctx.new_page()
        await pg.goto(f'http://127.0.0.1:9161/{root}{c}/index.html',wait_until='commit');await pg.wait_for_function('window.__w',timeout=30000);await pg.evaluate('__rd.tc=__rd.tc||performance.now()')
        r=await pg.evaluate("__rd");R.setdefault((root,c),[]).append((r.get('dcl',0),r.get('tc',0)));await ctx.close()
    for k,v in R.items():
      v=sorted(v,key=lambda x:x[1]);print(k,'median DCL %.0f ms, title ready %.0f ms'%v[1])
    await b.close()
asyncio.run(main())
