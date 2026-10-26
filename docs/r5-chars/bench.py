"""Figure draw bench: python3 bench.py [port] -> mean ms per frame (8 figures) in Chromium and WebKit iPhone 13, full and low effects, 5 runs each (median)."""
import sys, json, statistics
from playwright.sync_api import sync_playwright
port=sys.argv[1] if len(sys.argv)>1 else "9153"; B=f"http://127.0.0.1:{port}/docs/r5-chars/bench.html"
res={}
with sync_playwright() as p:
    for eng in ["chromium","webkit"]:
        b=(p.chromium if eng=="chromium" else p.webkit).launch(); ctx=b.new_context(**({"viewport":{"width":390,"height":844},"device_scale_factor":3} if eng=="chromium" else p.devices["iPhone 13"]))
        pg=ctx.new_page()
        for low in [0,1]:
            v=[]
            for run in range(5):
                pg.goto(B+f"?frames=240&low={low}&r={run}"); pg.wait_for_function("window.BENCH"); v.append(pg.evaluate("BENCH.msPerFrame"))
            res[f"{eng}-{'low' if low else 'full'}"]={"median_ms":statistics.median(v),"runs":v}
        b.close()
print(json.dumps(res,indent=1))
