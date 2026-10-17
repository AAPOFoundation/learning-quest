"""Expedition doctor: checks your set-up for the Learning Quest Expedition. Safe to run: it sends nothing anywhere
and never prints API keys. It makes one offline test run with a fake model, so it costs nothing.

Run:   python doctor.py          (Windows: py doctor.py)
"""
import os, sys, shutil, subprocess, tempfile, textwrap

OK, BAD = "[ok]  ", "[fix] "
problems = 0

def say(good, text):
    global problems
    print((OK if good else BAD) + text)
    if not good:
        problems += 1

say(sys.version_info >= (3, 10), "Python %d.%d.%d (3.10 or newer is needed)" % sys.version_info[:3])
in_venv = sys.prefix != getattr(sys, "base_prefix", sys.prefix)
say(in_venv, "Running inside a virtual environment" + ("" if in_venv else " (recommended; see the Camp card in the game)"))
try:
    import inspect_ai
    say(True, "inspect-ai is installed (version %s)" % getattr(inspect_ai, "__version__", "unknown"))
except Exception:
    say(False, "inspect-ai is not installed. Run:  python -m pip install inspect-ai")
    print("\nFix the items marked [fix], then run this again.")
    sys.exit(1)

keys = {"OPENAI_API_KEY": "openai", "ANTHROPIC_API_KEY": "anthropic", "GOOGLE_API_KEY": "google", "XAI_API_KEY": "grok"}
found = [name for name in keys if os.environ.get(name)]
if found:
    print(OK + "API key variable(s) set: " + ", ".join(found) + " (values are not shown)")
else:
    print("[info] No API key variable found. That is fine for now: the dry run below needs none.")
    print("       When you are ready to use a real model, set one for this session only.")
    print("       Windows PowerShell:   $env:ANTHROPIC_API_KEY = \"paste-your-key-here\"")
    print("       (Set a spending limit with your provider first. Never put a key in a file you share.)")

code = textwrap.dedent('''
    from inspect_ai import Task, task
    from inspect_ai.dataset import Sample
    from inspect_ai.scorer import includes
    from inspect_ai.solver import generate

    @task
    def doctor_check():
        return Task(dataset=[Sample(input="Say the word Canberra.", target="Canberra")],
                    solver=generate(), scorer=includes())
''')
tmp = tempfile.mkdtemp(prefix="expedition_")
path = os.path.join(tmp, "doctor_check.py")
with open(path, "w", encoding="utf-8") as f:
    f.write(code)
cmd = [sys.executable, "-m", "inspect_ai", "eval", "doctor_check.py", "--model", "mockllm/model", "--log-dir", "logs", "--display", "plain"]
try:
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180, cwd=tmp)
    ran = r.returncode == 0 and "accuracy" in (r.stdout + r.stderr)
    say(ran, "Dry run with the fake model (mockllm/model) %s" % ("worked" if ran else "failed"))
    if not ran:
        print((r.stdout + r.stderr)[-1200:])
except Exception as e:
    say(False, "Dry run could not start: %s" % e)
say(shutil.which("inspect") is not None or in_venv, "The 'inspect' command is available (or use: python -m inspect_ai ...)")
shutil.rmtree(tmp, ignore_errors=True)
print()
print("Everything looks ready. Tick the Camp card in the game." if problems == 0 else "%d item(s) need fixing; see the [fix] lines above." % problems)
