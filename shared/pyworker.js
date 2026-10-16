/* Python runner (Pyodide in a Web Worker so a runaway loop can be stopped). Loaded from the jsDelivr CDN. */
var PYV='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
var HARNESS=[
'import io, sys, json, traceback, contextlib',
'def _fmt(e):',
'    ln=None',
'    if isinstance(e,SyntaxError): return "SyntaxError: %s (line %s)"%(e.msg,e.lineno)',
'    tb=e.__traceback__',
'    while tb is not None:',
'        if tb.tb_frame.f_code.co_filename=="<your code>": ln=tb.tb_lineno',
'        tb=tb.tb_next',
'    return "%s: %s%s"%(type(e).__name__,e,(" (line %d)"%ln if ln else ""))',
'def _exec(code):',
'    ns={"__name__":"__main__"}',
'    buf=io.StringIO()',
'    err=None',
'    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):',
'        try: exec(compile(code,"<your code>","exec"),ns)',
'        except BaseException as e: err=_fmt(e)',
'    return ns,buf.getvalue(),err',
'def run_code(code):',
'    ns,out,err=_exec(code)',
'    return json.dumps({"out":out[:4000],"err":err})',
'def run_tests(code,tests_json):',
'    tests=json.loads(tests_json)',
'    ns,out,err=_exec(code)',
'    if err: return json.dumps({"out":out[:4000],"err":err,"res":[]})',
'    res=[]',
'    for t in tests:',
'        ns2=dict(ns)',
'        buf=io.StringIO()',
'        try:',
'            with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):',
'                exec(compile(t["code"],"<test>","exec"),ns2)',
'            res.append({"ok":True})',
'        except AssertionError as e:',
'            res.append({"ok":False,"msg":str(e)[:300]})',
'        except BaseException as e:',
'            res.append({"ok":False,"msg":"%s: %s"%(type(e).__name__,str(e)[:200])})',
'    return json.dumps({"out":out[:4000],"err":None,"res":res})'
].join('\n');
var py=null;
try{importScripts(PYV+'pyodide.js')}catch(e){postMessage({type:'fatal',msg:'Could not load the Python engine from the CDN.'});}
if(self.loadPyodide){
 loadPyodide({indexURL:PYV}).then(function(p){py=p;py.runPython(HARNESS);postMessage({type:'ready'})}).catch(function(e){postMessage({type:'fatal',msg:String(e&&e.message||e)})});
}
onmessage=function(ev){var m=ev.data;if(!py){postMessage({type:'result',id:m.id,error:'Python engine not ready'});return}
 try{var f=py.globals.get(m.kind==='tests'?'run_tests':'run_code');var r=m.kind==='tests'?f(m.code,m.tests):f(m.code);f.destroy&&f.destroy();postMessage({type:'result',id:m.id,data:JSON.parse(r)})}
 catch(e){postMessage({type:'result',id:m.id,error:String(e&&e.message||e)})}};
