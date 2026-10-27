"""Python Basics: solutions pass, starters do not, and known wrong answers fail.

The longest-word task (pb3-4) must reject text.split(" "), which keeps a new
line glued to a word. A hidden test uses "hi\\nthere".

Run from a checkout of this repo:
  python3 tests/e2e/pb_local.py
Prints BAD n (0 = pass).
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get('ROOT') or os.path.abspath(os.path.join(HERE, '..', '..'))
WPATH = os.environ.get('WPATH') or os.path.join(HERE, 'fixtures', 'wrong_pb.json')
d = json.loads(subprocess.check_output(['node', '-e',
    "global.window=global;global.document={};var base=process.env.ROOT+'/';"
    "require(base+'python-basics/lessons.js');require(base+'python-basics/content.js');"
    "console.log(JSON.stringify(APP.levels.map(l=>l.qs.filter(q=>q.t==='code'))))"],
    env=dict(os.environ, ROOT=ROOT)))
W = json.load(open(WPATH))
def run(code, tests):
    ns = {}
    try:
        exec(compile(code, '<c>', 'exec'), ns)
    except BaseException as e:
        return None, 'ERR ' + type(e).__name__
    res = []
    for t in tests:
        n2 = dict(ns)
        try:
            exec(t['code'], n2)
            res.append(True)
        except BaseException as e:
            res.append(str(e)[:90] or type(e).__name__)
    return res, ''
bad = 0
for lv in d:
    for q in lv:
        r, e = run(q['solution'], q['tests'])
        if e or not all(x is True for x in r):
            print('SOLFAIL', q['id'], e, r)
            bad += 1
        r, e = run(q['starter'], q['tests'])
        if not e and all(x is True for x in r):
            print('STARTER PASSES', q['id'])
            bad += 1
        for i, w in enumerate(W.get(q['id'], [])):
            r, e = run(w, q['tests'])
            if not e and all(x is True for x in r):
                print('WRONG PASSES', q['id'], i)
                bad += 1
            elif not e:
                first = [x for x in r if x is not True][0]
                print('  ok', q['id'], i, '-> ', first)
        hid = [t for t in q['tests'] if t.get('hidden')]
        print(q['id'], len(q['tests']), 'tests', len(hid), 'hidden')
print('BAD', bad)
sys.exit(1 if bad else 0)
