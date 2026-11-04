/* ArabicMV — Azure TTS generation for Listening/Speaking audio (all units, incl. bonus lessons).
 *
 * SCOPE (policy approved 2026-11-01, reaffirmed 2026-11-04): audio ONLY for the
 * Listening and Speaking activities, i.e. data/book1 `speak[]` questions and
 * answers. Vocabulary, dialogues, roleplays, grammar and quizzes get NO audio,
 * and this script cannot generate them.
 *
 * DRY RUN (default — no network, no credentials, writes manifests only):
 *   node prototype/audio/generate.js --all            every unit in data/book1/index.json
 *   node prototype/audio/generate.js --unit 11        one unit
 *   Writes prototype/audio/manifest-uNN.json and prints the plan: files to make,
 *   reused recordings, files already done, and STALE files (recorded from text
 *   that has since changed). Nothing is synthesized.
 *
 * REAL RUN (only after approval):
 *   node prototype/audio/generate.js --all --run
 *   Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in the environment (never in a file).
 *   Writes MP3s to audio/book1/uNN/, a ledger of what each file was made from,
 *   audio/book1/ready.json (what the app may play) and audio/book1/report.json.
 *   Resume-safe: a file is skipped when it exists AND the ledger says it was made
 *   from exactly the current text/voice/format. Changed text → regenerated (reported).
 *
 * TEST MODE (no network): --mock <dir> writes small fake MP3s into <dir> instead of
 *   calling Azure; --mock-fail id1,id2 makes those items fail every attempt and
 *   --mock-flaky id1,id2 makes them fail twice then succeed (exercises the retries).
 *
 * Other flags: --force (regenerate everything selected), --voice m|f, --rate -10%,
 *   --index (rebuild ready.json from the ledger, no synthesis), --data <dir>, --out <dir>.
 *
 * File naming: audio/book1/uNN/uNN-sSS-{q|a}-{m|f}.mp3, SS = 1-based index in speak[].
 * Identical text in the same voice is recorded once; later items reuse that file.
 * The app never derives file names itself — it only plays what ready.json lists,
 * and only when the listed text fingerprint still matches the text on screen.
 */
"use strict";
var fs = require("fs"), path = require("path"), crypto = require("crypto");

var VOICES = { m: "ar-SA-HamedNeural", f: "ar-SA-ZariyahNeural" };
var FORMAT = "audio-24khz-48kbitrate-mono-mp3"; /* good speech quality, ~6 KB/s */
var DELAY_MS = 250;                              /* pause between requests — gentle on the free tier */
var RETRIES = 3, RETRY_BASE_MS = 1000;           /* up to 3 retries: 1 s, 2 s, 4 s (or Retry-After) */
var TIMEOUT_MS = 30000;

/* ---- voice policy -------------------------------------------------------------
 * Units 1–16 (from a full read of all 144 speak[] pairs):
 *  - answers: Hamed (m) — many contain masculine self-reference (أَنَا مَالْدِيفِيٌّ…);
 *  - questions: Zariyah (f) for a natural two-voice exchange (the asker is not
 *    grammatically marked), EXCEPT where the answer addresses the asker as a man.
 *  - no question in units 1–16 addresses a woman and no answer refers to a woman
 *    speaker, so no answer needs the female voice (the lint below re-checks this).
 * Bonus lessons (Lesson 17 — passport and airport):
 *  - the officer asks (Zariyah), the passenger answers (Hamed; the passenger
 *    speaks with masculine forms: «مَعَ زَوْجَتِي»);
 *  - "to a woman" drills — the answer is the card's form for a woman of the
 *    question — are both spoken by the officer, so both use Zariyah. */
var MALE_ASKER = {
  "5-4": "answer says مِنْ فَضْلِكَ (masc.) to the asker",
  "6-9": "answer says اِنْتَظِرْ ... مَعَكَ (masc.) to the asker"
};
var FEMALE_ANSWERER = {}; /* "unit-SS": evidence — none needed today */

var ROOT = path.resolve(__dirname, "..", "..");
var args = process.argv.slice(2);
function flag(name, dflt){ var i = args.indexOf("--" + name); if(i < 0) return dflt; var v = args[i + 1]; return (v && v.indexOf("--") !== 0) ? v : true; }
function has(name){ return args.indexOf("--" + name) >= 0; }
var DATA = path.resolve(String(flag("data", path.join(ROOT, "data", "book1"))));
var MOCK = flag("mock", null), RUN = has("run") || !!MOCK, FORCE = has("force"), INDEX_ONLY = has("index");
var OUT = path.resolve(String(flag("out", MOCK && MOCK !== true ? MOCK : path.join(ROOT, "audio", "book1"))));
var VOICE_SEL = String(flag("voice", "both")), RATE = flag("rate", null);
var MOCK_FAIL = String(flag("mock-fail", "")).split(",").filter(Boolean), MOCK_FLAKY = String(flag("mock-flaky", "")).split(",").filter(Boolean);
if(MOCK === true){ console.error("--mock needs a directory"); process.exit(1); }
if(MOCK){ RETRY_BASE_MS = +flag("retry-base-ms", 20); DELAY_MS = 0; }
var voiceKeys = VOICE_SEL === "both" ? ["m", "f"] : [VOICE_SEL];
if(voiceKeys.some(function(k){ return !VOICES[k]; })){ console.error("--voice must be m, f or both"); process.exit(1); }

var index = JSON.parse(fs.readFileSync(path.join(DATA, "index.json"), "utf8"));
var allUnits = index.units.filter(function(u){ return u.file; });
var SEL = has("all") ? allUnits.map(function(u){ return u.unit; }) : [parseInt(flag("unit", "0"), 10)];
if(SEL.some(function(n){ return !allUnits.some(function(u){ return u.unit === n; }); })){
  console.error("Choose --all or --unit N with N one of: " + allUnits.map(function(u){ return u.unit; }).join(", ")); process.exit(1);
}

/* ---- fingerprints ---- */
function nfc(s){ return String(s).normalize("NFC"); }
/* FNV-1a 32-bit over UTF-16 units — identical to fnv() in js/app.js (text check in the browser) */
function fnv(s){ s = nfc(s); var h = 0x811c9dc5; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = (h + (h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24)) >>> 0; } return ("0000000" + h.toString(16)).slice(-8); }
/* what a recording is made from: voice + format + rate + exact text */
function fingerprint(voice, text){ return crypto.createHash("sha256").update([VOICES[voice], FORMAT, RATE || "", nfc(text)].join("\u0000")).digest("hex").slice(0, 16); }
function pad2(n){ return ("0" + n).slice(-2); }
function uu(n){ return pad2(n); }

/* ---- plan every unit (deterministic: reuse is decided over all units in index order) ---- */
var FEM_ADDR = /كِ(?=[\s.،؟!؛]|$)|أَنْتِ(?=[\s.،؟!؛]|$)/;   /* lint: text addressing a woman */
var plan = {}, byPrint = {}, warnings = [];
allUnits.forEach(function(e){
  var n = e.unit, d = JSON.parse(fs.readFileSync(path.join(DATA, e.file), "utf8")), items = [];
  var femOf = {}; (d.vocab || []).forEach(function(v){ if(v.fem) femOf[nfc(v.ar)] = nfc(v.fem); });
  (d.speak || []).forEach(function(s, si){
    var ss = pad2(si + 1), base = "u" + uu(n) + "-s" + ss, q = s.q && s.q.ar, a = s.a && s.a.ar;
    var qv, av, qr, ar;
    if(e.bonus){
      var drill = q && a && femOf[nfc(q)] === nfc(a);
      qv = "f"; qr = "officer asks (bonus lesson)";
      av = drill ? "f" : "m"; ar = drill ? "officer — same expression to a woman" : "passenger answers";
    } else {
      qv = MALE_ASKER[n + "-" + (si + 1)] ? "m" : "f"; qr = MALE_ASKER[n + "-" + (si + 1)] || "default question voice";
      av = FEMALE_ANSWERER[n + "-" + (si + 1)] ? "f" : "m"; ar = FEMALE_ANSWERER[n + "-" + (si + 1)] || "default answer voice";
      if(q && FEM_ADDR.test(q) && av === "m") warnings.push(base + "-q addresses a woman but its answer uses the male voice: " + q);
    }
    [["q", q, qv, qr], ["a", a, av, ar]].forEach(function(p){
      if(!p[1]){ warnings.push(base + "-" + p[0] + " has no Arabic text"); return; }
      var id = base + "-" + p[0], fp = fingerprint(p[2], p[1]);
      var it = { id: id, key: (si + 1) + p[0], type: "speak-" + p[0], lesson: s.lesson, voice: p[2], voiceName: VOICES[p[2]], reason: p[3],
                 text: p[1], chars: p[1].length, fingerprint: fp, textHash: fnv(p[1]), file: "u" + uu(n) + "/" + id + "-" + p[2] + ".mp3" };
      if(byPrint[fp]){ it.file = byPrint[fp].file; it.reuseOf = byPrint[fp].id; } else byPrint[fp] = it;
      items.push(it);
    });
  });
  plan[n] = { entry: e, items: items };
});

/* ---- ledger: what each existing file was actually generated from ---- */
var LEDGER = path.join(OUT, "ledger.json");
var ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, "utf8")) : {};
function saveJSON(p, o){ fs.mkdirSync(path.dirname(p), { recursive: true }); var tmp = p + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(o, null, 1)); fs.renameSync(tmp, p); }
function looksLikeMp3(file){ try{ var fd = fs.openSync(file, "r"), b = Buffer.alloc(3); fs.readSync(fd, b, 0, 3, 0); fs.closeSync(fd);
  return fs.statSync(file).size > 500 && (b.toString("latin1") === "ID3" || (b[0] === 0xFF && (b[1] & 0xE0) === 0xE0)); }catch(e){ return false; } }
function status(it){ /* ok | missing | stale */
  var f = path.join(OUT, it.file);
  if(!fs.existsSync(f)) return "missing";
  var l = ledger[it.file];
  return l && l.fingerprint === it.fingerprint && looksLikeMp3(f) ? "ok" : "stale";
}

/* ---- manifests (one per selected unit; deterministic, no timestamps) ---- */
var tot = { utterances: 0, files: 0, reused: 0, chars: 0, ok: 0, missing: 0, stale: 0, m: 0, f: 0 };
SEL.forEach(function(n){
  var p = plan[n], mine = p.items, own = mine.filter(function(it){ return !it.reuseOf; });
  var st = { ok: 0, missing: 0, stale: 0 };
  own.forEach(function(it){ st[status(it)]++; tot[it.voice]++; });
  var manifest = {
    unit: n, bonus: !!p.entry.bonus, title: p.entry.title_en, source: "data/book1/" + p.entry.file,
    scope: "Listening/Speaking only: speak[] questions and answers",
    voices: VOICES, format: FORMAT, rate: RATE || "default", outDir: "audio/book1/u" + uu(n) + "/",
    voicePolicy: p.entry.bonus ? "officer questions Zariyah; passenger answers Hamed; to-a-woman drill answers Zariyah"
                               : "questions Zariyah except male-addressed askers (" + Object.keys(MALE_ASKER).join(", ") + "); answers Hamed",
    counts: { utterances: mine.length, files: own.length, reused: mine.length - own.length, Hamed: own.filter(function(i){ return i.voice === "m"; }).length, Zariyah: own.filter(function(i){ return i.voice === "f"; }).length },
    arabicChars: own.reduce(function(a, it){ return a + it.chars; }, 0),
    items: mine.map(function(it){ var o = {}; ["id","key","type","lesson","voice","voiceName","reason","text","chars","fingerprint","textHash","file","reuseOf"].forEach(function(k){ if(it[k] !== undefined) o[k] = it[k]; }); return o; })
  };
  if(!MOCK) fs.writeFileSync(path.join(__dirname, "manifest-u" + uu(n) + ".json"), JSON.stringify(manifest, null, 1));
  tot.utterances += mine.length; tot.files += own.length; tot.reused += mine.length - own.length; tot.chars += manifest.arabicChars;
  tot.ok += st.ok; tot.missing += st.missing; tot.stale += st.stale;
  console.log("Unit " + pad2(n) + (p.entry.bonus ? " (bonus)" : "        ") + "  utterances " + pad2(mine.length) + "  files " + pad2(own.length) +
    "  reused " + (mine.length - own.length) + "  | ok " + st.ok + "  to make " + st.missing + "  stale " + st.stale);
});
console.log("TOTAL  utterances " + tot.utterances + ", files " + tot.files + " (Hamed " + tot.m + ", Zariyah " + tot.f + "), reused " + tot.reused +
  ", Arabic characters " + tot.chars + " (" + (tot.chars / 5000).toFixed(1) + "% of the 500,000/month free tier)");
console.log("STATUS ok " + tot.ok + ", to make " + tot.missing + ", stale (text changed since recording) " + tot.stale);
if(warnings.length) console.log("POLICY WARNINGS:\n  " + warnings.join("\n  "));
if(!MOCK) console.log("Manifests -> prototype/audio/manifest-uNN.json");

/* ---- ready.json: only files that exist and match the current text ---- */
function writeReady(){
  var units = {}, n = 0;
  Object.keys(plan).forEach(function(u){ plan[u].items.forEach(function(it){
    var src = it.reuseOf ? findItem(it.reuseOf) : it;
    if(status(src) !== "ok") return;
    (units[u] = units[u] || {})[it.key] = { f: it.file, t: it.textHash }; n++;
  }); });
  saveJSON(path.join(OUT, "ready.json"), { scope: "speak[] Listening/Speaking", format: FORMAT, units: units });
  return n;
}
function findItem(id){ var u = +id.slice(1, 3); return plan[u].items.filter(function(x){ return x.id === id; })[0]; }

if(INDEX_ONLY){ console.log("ready.json rebuilt: " + writeReady() + " playable items"); process.exit(0); }
if(!RUN){
  console.log("\nDRY RUN ONLY — no audio generated, no network calls made.");
  console.log("After approval: set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, then add --run");
  process.exit(0);
}

/* ---- synthesis ---- */
var KEY = process.env.AZURE_SPEECH_KEY, REGION = process.env.AZURE_SPEECH_REGION;
if(!MOCK && (!KEY || !REGION)){
  console.error("\n--run requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables.");
  console.error("See prototype/audio/SETUP.md. The key is never stored in any file."); process.exit(1);
}
function xmlEsc(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function ssml(voiceName, text){
  var body = xmlEsc(nfc(text)); if(RATE) body = '<prosody rate="' + RATE + '">' + body + "</prosody>";
  return '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="' + voiceName + '">' + body + "</voice></speak>";
}
function azure(voiceName, text, cb){ /* cb(err, buffer); err.retry = true when worth retrying */
  var https = require("https"), done = false;
  function fin(e, b){ if(!done){ done = true; cb(e, b); } }
  var req = https.request({ hostname: REGION + ".tts.speech.microsoft.com", path: "/cognitiveservices/v1", method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": FORMAT, "User-Agent": "ArabicMV-audio" } },
    function(res){
      var chunks = []; res.on("data", function(c){ chunks.push(c); });
      res.on("end", function(){
        var buf = Buffer.concat(chunks);
        if(res.statusCode !== 200){ var e = new Error("HTTP " + res.statusCode + " " + buf.toString("utf8").slice(0, 160));
          e.retry = res.statusCode === 408 || res.statusCode === 429 || res.statusCode >= 500; e.fatal = res.statusCode === 401 || res.statusCode === 403;
          e.wait = +res.headers["retry-after"] * 1000 || 0; return fin(e); }
        fin(null, buf);
      });
    });
  req.setTimeout(TIMEOUT_MS, function(){ var e = new Error("timeout after " + TIMEOUT_MS / 1000 + " s"); e.retry = true; req.destroy(e); });
  req.on("error", function(e){ if(e.retry === undefined) e.retry = true; fin(e); });
  req.end(ssml(voiceName, text));
}
var flakyCount = {};
function mock(it){ return function(voiceName, text, cb){
  setTimeout(function(){
    if(MOCK_FAIL.indexOf(it.id) >= 0){ var e = new Error("mock: HTTP 503"); e.retry = true; return cb(e); }
    if(MOCK_FLAKY.indexOf(it.id) >= 0 && (flakyCount[it.id] = (flakyCount[it.id] || 0) + 1) <= 2){ var e2 = new Error("mock: HTTP 429"); e2.retry = true; return cb(e2); }
    var b = Buffer.alloc(800, 0x55); b.write("ID3", 0, "latin1"); b.write("MOCK " + voiceName + " " + it.id, 10, "utf8"); cb(null, b);
  }, 1);
}; }
function synthWithRetry(it, cb){
  var synth = MOCK ? mock(it) : azure, attempt = 0;
  (function tryOnce(){
    attempt++;
    synth(it.voiceName, it.text, function(err, buf){
      if(!err && !(buf && buf.length > 500)) err = Object.assign(new Error("suspiciously small response (" + (buf ? buf.length : 0) + " bytes)"), { retry: true });
      if(!err) return cb(null, buf, attempt);
      if(err.fatal || !err.retry || attempt > RETRIES) return cb(err, null, attempt);
      var wait = err.wait || RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.log("  retry " + it.id + " in " + wait + " ms (" + err.message + ")");
      setTimeout(tryOnce, wait);
    });
  })();
}

var queue = [];
SEL.forEach(function(n){ plan[n].items.forEach(function(it){
  if(it.reuseOf || voiceKeys.indexOf(it.voice) < 0) return;
  var s = status(it); if(s === "ok" && !FORCE) return; it.was = s; queue.push(it);
}); });
var report = { started: new Date().toISOString(), mode: MOCK ? "mock" : "azure", units: SEL, generated: [], replacedStale: [], failed: [], skippedOk: tot.ok - (FORCE ? tot.ok : 0), reused: tot.reused };
console.log("\n" + queue.length + " files to synthesize" + (MOCK ? " (MOCK — no network)" : "") + "…");
var i = 0;
(function next(){
  if(i >= queue.length) return finish();
  var it = queue[i++], file = path.join(OUT, it.file);
  synthWithRetry(it, function(err, buf, attempts){
    if(err){
      report.failed.push({ id: it.id, file: it.file, attempts: attempts, error: err.message });
      console.log("  FAIL " + it.id + " after " + attempts + " attempt(s): " + err.message);
      if(err.fatal){ console.error("Authentication/permission error — stopping the run."); return finish(); }
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      var tmp = file + ".part"; fs.writeFileSync(tmp, buf); fs.renameSync(tmp, file);
      ledger[it.file] = { fingerprint: it.fingerprint, voice: it.voiceName, textHash: it.textHash, bytes: buf.length, at: new Date().toISOString() };
      saveJSON(LEDGER, ledger);
      (it.was === "stale" ? report.replacedStale : report.generated).push(it.id);
      console.log("  ok   " + it.id + "  (" + (buf.length / 1024).toFixed(1) + " KB" + (attempts > 1 ? ", " + attempts + " attempts" : "") + ")  [" + i + "/" + queue.length + "]");
    }
    setTimeout(next, DELAY_MS);
  });
})();
function finish(){
  report.finished = new Date().toISOString(); report.playable = writeReady();
  saveJSON(path.join(OUT, "report.json"), report);
  console.log("\nDone: " + report.generated.length + " generated, " + report.replacedStale.length + " stale replaced, " + report.skippedOk + " already done, " +
    report.reused + " reused, " + report.failed.length + " failed. ready.json lists " + report.playable + " playable items. Report: " + path.relative(ROOT, path.join(OUT, "report.json")));
  if(report.failed.length) console.log("Re-run the same command to retry the failures (finished files are skipped).");
  process.exit(report.failed.length ? 1 : 0);
}
