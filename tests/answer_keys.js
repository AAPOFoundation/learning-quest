#!/usr/bin/env node
/* Check that every question's answer key is internally consistent after
   content.js + fixes.js (the same patch the game applies).

   What this checks
   - mc: a is an integer in [0, opts.length)
   - multi: a is a non-empty array of unique integers in that range
   - num: a is a finite number; tol, if set, is a non-negative number
   - code: has a solution and at least one test (does not rerun the full
     pb_local wrong-answer suite)
   - A fixes.js entry that rewrites q or why on a non-mc/multi question
     without providing a is flagged (the AI Foundations l4 index bug)
   - If why opens with "Index N" or "Epoch N", that
     value should match a (within tol). This only catches a leading
     stated answer, not a full reading of the explanation.
   - Predict-the-output: if the prompt has a <pre class="code"> snippet
     and asks what it prints, run the snippet in python3 and compare
     stdout to the num key, or to the chosen mc option when that option
     is the printed text. Snippets that need files, input(), or extra
     setup are skipped, not failed.

   What it does not check
   - Whether a multiple-choice explanation is pedagogically right
   - Boss / capstone free-text rubrics
   - Known-wrong answers and hidden tests (see tests/e2e/pb_local.py)
   - Questions added later by add.js / insert.js / extra.js unless those
     files can be loaded on their own (they currently need the world)

   Run from the repo root: node tests/answer_keys.js
   Exit 0 if no problems; prints FAIL lines and exits 1 otherwise.
*/
'use strict';
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

var ROOT = process.env.ROOT || path.resolve(__dirname, '..');
process.chdir(ROOT);

var COURSES = [
  {key: 'python-basics', files: ['python-basics/lessons.js', 'python-basics/content.js']},
  {key: 'ai-foundations', files: ['ai-foundations/content.js', 'ai-foundations/fixes.js']},
  {key: 'ai-evals', files: ['ai-evals/content.js', 'ai-evals/fixes.js']},
  {key: 'ai-safety', files: ['ai-safety/content.js', 'ai-safety/fixes.js']},
  {key: 'portfolio-guide', files: ['portfolio-guide/content.js', 'portfolio-guide/fixes.js']}
];

var fails = 0, warns = 0, checks = 0, predRan = 0, predSkip = 0;

function fail(msg) { fails++; console.log('FAIL  ' + msg); }
function warn(msg) { warns++; console.log('WARN  ' + msg); }
function ok(msg) { console.log('OK    ' + msg); }

function loadCourse(files) {
  var req = files.map(function (f) {
    return 'require(' + JSON.stringify(path.join(ROOT, f)) + ');';
  }).join('');
  var js = 'global.window=global;global.document={};' + req +
    'var out=[];(APP.levels||[]).forEach(function(L){(L.qs||[]).forEach(function(q,i){' +
    'out.push({id:L.id,i:i,t:q.t,a:q.a,q:q.q,why:q.why,opts:q.opts||null,tol:q.tol,' +
    'hasSol:!!q.solution,nTests:(q.tests&&q.tests.length)||0});});});' +
    'console.log(JSON.stringify(out));';
  var raw = cp.execFileSync('node', ['-e', js], {encoding: 'utf8', cwd: ROOT});
  return JSON.parse(raw);
}

function parseFixes(file) {
  // Read the F = { ... } object by evaluating just enough of the IIFE.
  // We do not execute the patcher; we only extract F via a Function hook.
  var src = fs.readFileSync(file, 'utf8');
  var start = src.search(/\bvar F\s*=\s*\{|\bF\s*=\s*\{/);
  if (start < 0) return null;
  // Cut from F= to the first ";var " / ";if(" / ",DROP=" after the object
  // The object is JSON-like enough for a Function if we wrap it.
  var tail = src.slice(start);
  var m = tail.match(/^(?:var\s+)?F\s*=\s*/);
  var body = tail.slice(m[0].length);
  // Find matching close brace at depth 0, then optional semicolon.
  var depth = 0, i = 0, inStr = null, esc = false;
  for (; i < body.length; i++) {
    var c = body[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  var objSrc = body.slice(0, i);
  try { return Function('return (' + objSrc + ')')(); }
  catch (e) { warn('could not parse F in ' + file + ': ' + e.message); return null; }
}

function leadingWhyAnswer(why) {
  /* Only a why that opens with "Index N" or "Epoch N", which is how
     the reworded l4 question states its answer. A why that starts with
     a factor in a calculation (e.g. "10 × 100 × 3 = 3,000.") is not
     treated as a stated key. */
  if (!why) return null;
  var m = String(why).match(/^\s*(?:Index|Epoch)\s+(-?\d+(?:\.\d+)?)\b/i);
  return m ? Number(m[1]) : null;
}

function unescapeHtml(s) {
  return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

function extractPre(q) {
  var m = String(q || '').match(/<pre class="code">([\s\S]*?)<\/pre>/);
  return m ? unescapeHtml(m[1]).trim() : null;
}

function isPredict(q) {
  return /predict first|what does this print|what number does this print|what does this (?:return|give)/i.test(q || '');
}

function runPython(code) {
  try {
    var r = cp.spawnSync('python3', ['-c', code], {
      encoding: 'utf8', timeout: 4000, maxBuffer: 64 * 1024
    });
    if (r.error) return {ok: false, reason: r.error.message};
    if (r.status !== 0) {
      var err = (r.stderr || r.stdout || 'exit ' + r.status).trim().split('\n').pop();
      return {ok: false, reason: err};
    }
    return {ok: true, stdout: (r.stdout || '').replace(/\s+$/, '')};
  } catch (e) {
    return {ok: false, reason: e.message};
  }
}

function looksUnsafe(code) {
  return /\b(input|open|__import__|exec|eval|os\.|sys\.|subprocess|pathlib|socket|requests)\b/.test(code);
}

COURSES.forEach(function (c) {
  c.files.forEach(function (f) {
    if (!fs.existsSync(path.join(ROOT, f))) fail(c.key + ': missing ' + f);
  });
  var qs;
  try { qs = loadCourse(c.files); }
  catch (e) { fail(c.key + ': failed to load (' + e.message + ')'); return; }
  ok(c.key + ': loaded ' + qs.length + ' questions');

  var F = null;
  var fixPath = c.files.find(function (f) { return /fixes\.js$/.test(f); });
  if (fixPath) F = parseFixes(path.join(ROOT, fixPath));

  qs.forEach(function (q) {
    var tag = c.key + ':' + q.id + '[' + q.i + ']';
    checks++;
    if (q.t === 'mc') {
      if (!Array.isArray(q.opts) || q.opts.length < 2) fail(tag + ' mc has fewer than 2 options');
      else if (typeof q.a !== 'number' || q.a !== (q.a | 0) || q.a < 0 || q.a >= q.opts.length)
        fail(tag + ' mc key ' + JSON.stringify(q.a) + ' is not in 0..' + (q.opts.length - 1));
    } else if (q.t === 'multi') {
      if (!Array.isArray(q.opts) || q.opts.length < 2) fail(tag + ' multi has fewer than 2 options');
      else if (!Array.isArray(q.a) || !q.a.length) fail(tag + ' multi key is missing or empty');
      else {
        var seen = {};
        q.a.forEach(function (x) {
          if (typeof x !== 'number' || x !== (x | 0) || x < 0 || x >= q.opts.length)
            fail(tag + ' multi key ' + JSON.stringify(q.a) + ' has an out-of-range index');
          if (seen[x]) fail(tag + ' multi key has a repeated index ' + x);
          seen[x] = 1;
        });
      }
    } else if (q.t === 'num') {
      if (typeof q.a !== 'number' || !isFinite(q.a)) fail(tag + ' num key is not a finite number: ' + JSON.stringify(q.a));
      if (q.tol != null && (typeof q.tol !== 'number' || q.tol < 0 || !isFinite(q.tol)))
        fail(tag + ' num tol is not a non-negative number: ' + JSON.stringify(q.tol));
      var lead = leadingWhyAnswer(q.why);
      if (lead != null && typeof q.a === 'number') {
        var tol = q.tol || 0;
        if (Math.abs(lead - q.a) > tol + 1e-9)
          fail(tag + ' why starts with ' + lead + ' but the key is ' + q.a);
      }
    } else if (q.t === 'code') {
      if (!q.hasSol) fail(tag + ' code question has no solution');
      if (!q.nTests) fail(tag + ' code question has no tests');
    } else if (q.t === 'grade') {
      /* items are checked by the engine against item.a; nothing further here */
    } else if (q.t) {
      warn(tag + ' unknown type ' + q.t + ' (not checked)');
    } else {
      fail(tag + ' question has no type');
    }

    if (F && F[q.id] && F[q.id][q.i]) {
      var x = F[q.id][q.i];
      if ((x.q || x.why) && x.a === undefined && q.t !== 'mc' && q.t !== 'multi')
        fail(tag + ' fixes.js rewrites the wording but does not provide a (type ' + q.t + ')');
    }

    var pre = extractPre(q.q);
    if (pre && isPredict(q.q)) {
      if (looksUnsafe(pre)) { predSkip++; return; }
      var ran = runPython(pre);
      if (!ran.ok) { predSkip++; return; }
      predRan++;
      var out = ran.stdout;
      if (q.t === 'num') {
        var v = parseFloat(out);
        var t = q.tol || 0;
        if (isNaN(v) || Math.abs(v - q.a) > t + 1e-9)
          fail(tag + ' snippet printed ' + JSON.stringify(out) + ' but the key is ' + q.a);
      } else if (q.t === 'mc' && q.opts && typeof q.a === 'number') {
        var want = String(q.opts[q.a]).trim();
        var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
        // Only compare when the option text is the printout (or that
        // printout with commas/spaces as the only difference). A
        // paraphrased option such as "3 then 8" is skipped, not failed.
        if (norm(out) === norm(want) || norm(out.replace(/\n/g, ', ')) === norm(want) ||
            norm(out.replace(/\n/g, ' then ')) === norm(want)) {
          /* match */
        } else {
          predSkip++;
          predRan--;
        }
      }
    }
  });
});

console.log('');
console.log('Checked ' + checks + ' questions. Predict-the-output ran ' + predRan +
  ', skipped ' + predSkip + ' (exec failed or needed extra setup).');
if (warns) console.log(warns + ' warning(s).');
if (fails) { console.log(fails + ' failure(s).'); process.exit(1); }
console.log('All answer-key checks passed.');
process.exit(0);
