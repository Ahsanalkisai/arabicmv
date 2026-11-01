/* ArabicMV Phase 4B — Azure TTS generation script.
 *
 * DRY RUN (default, no network):   node generate.js --unit 1
 *   Reads data/book1/unitNN.json, builds the utterance manifest
 *   (manifest-uNN.json next to this script) and prints a summary.
 *   Nothing is synthesized, no credentials needed.
 *
 * REAL RUN (only after approval):  node generate.js --unit 1 --run
 *   Requires environment variables:
 *     AZURE_SPEECH_KEY    — Speech resource key (never committed, never in frontend)
 *     AZURE_SPEECH_REGION — e.g. "southeastasia", "uaenorth", "westeurope"
 *   Writes MP3s to audio/book1/uNN/ at the project root, one request at a
 *   time with a polite delay. Existing files are skipped (resume-safe),
 *   use --force to regenerate.
 *
 * Other flags:
 *   --voice m|f|both   (default both)
 *   --only vocab,dialogues,speak,grammar   (default all)
 *   --rate -10%        optional SSML prosody rate, e.g. "-10%" for slower speech
 *
 * File naming convention (JSON stays untouched; the app derives these paths):
 *   vocab word     uNN-vIII-<voice>.mp3          III = 1-based index in unit vocab array
 *   vocab plural   uNN-vIII-pl-<voice>.mp3
 *   vocab command  uNN-vIII-cm-<voice>.mp3
 *   dialogue line  uNN-dDD-lLL-<voice>.mp3       DD = dialogue block, LL = line
 *   speak Q / A    uNN-sSS-q-<voice>.mp3 / uNN-sSS-a-<voice>.mp3
 *   grammar ex.    uNN-gGG-eEE-<voice>.mp3       GG = grammar note, EE = example
 *   <voice> is m (ar-SA-HamedNeural) or f (ar-SA-ZariyahNeural).
 */
"use strict";
var fs = require("fs"), path = require("path"), https = require("https");

var VOICES = { m: "ar-SA-HamedNeural", f: "ar-SA-ZariyahNeural" };
var FORMAT = "audio-24khz-48kbitrate-mono-mp3"; /* good speech quality, ~6 KB/s */
var DELAY_MS = 250; /* pause between requests — gentle on the free tier */

var ROOT = path.resolve(__dirname, "..", "..");          /* project root */
var DATA = path.join(ROOT, "data", "book1");
var AUDIO_ROOT = path.join(ROOT, "audio", "book1");

/* ---- args ---- */
var args = process.argv.slice(2);
function flag(name, dflt){
  var i = args.indexOf("--" + name);
  if(i < 0) return dflt;
  var v = args[i + 1];
  return (v && v.indexOf("--") !== 0) ? v : true;
}
var UNIT = parseInt(flag("unit", "1"), 10);
var RUN = args.indexOf("--run") >= 0;
var FORCE = args.indexOf("--force") >= 0;
var VOICE_SEL = String(flag("voice", "both"));
var ONLY = String(flag("only", "vocab,dialogues,speak,grammar")).split(",");
var RATE = flag("rate", null); /* e.g. "-10%" */

if(!(UNIT >= 1 && UNIT <= 8)){ console.error("Unit must be 1-8 (units 9-16 have no data)."); process.exit(1); }
var voiceKeys = VOICE_SEL === "both" ? ["m", "f"] : [VOICE_SEL];
if(voiceKeys.some(function(k){ return !VOICES[k]; })){ console.error("--voice must be m, f or both"); process.exit(1); }

var uu = (UNIT < 10 ? "0" : "") + UNIT;
var unitFile = path.join(DATA, "unit" + uu + ".json");
var d = JSON.parse(fs.readFileSync(unitFile, "utf8"));

/* ---- build the utterance list (exact JSON strings, nothing invented) ---- */
function pad3(n){ return ("00" + n).slice(-3); }
function pad2(n){ return ("0" + n).slice(-2); }
var items = [];
function add(id, type, lesson, text){
  if(!text) return;
  items.push({ id: id, type: type, lesson: lesson, text: text, chars: text.length });
}
if(ONLY.indexOf("vocab") >= 0){
  (d.vocab || []).forEach(function(v, i){
    var base = "u" + uu + "-v" + pad3(i + 1);
    add(base, "vocab", v.lesson, v.ar);
    add(base + "-pl", "vocab-plural", v.lesson, v.pl);
    add(base + "-cm", "vocab-command", v.lesson, v.command);
  });
}
if(ONLY.indexOf("dialogues") >= 0){
  (d.dialogues || []).forEach(function(c, ci){
    (c.lines || []).forEach(function(ln, li){
      add("u" + uu + "-d" + pad2(ci + 1) + "-l" + pad2(li + 1), "dialogue", c.lesson, ln.ar);
    });
  });
}
if(ONLY.indexOf("speak") >= 0){
  (d.speak || []).forEach(function(s, si){
    var base = "u" + uu + "-s" + pad2(si + 1);
    add(base + "-q", "speak-q", s.lesson, s.q && s.q.ar);
    add(base + "-a", "speak-a", s.lesson, s.a && s.a.ar);
  });
}
if(ONLY.indexOf("grammar") >= 0){
  (d.grammar || []).forEach(function(g, gi){
    (g.examples || []).forEach(function(e, ei){
      add("u" + uu + "-g" + pad2(gi + 1) + "-e" + pad2(ei + 1), "grammar", g.lesson, e.ar);
    });
  });
}

/* ---- manifest ---- */
var outDir = path.join(AUDIO_ROOT, "u" + uu);
var totalChars = items.reduce(function(a, it){ return a + it.chars; }, 0);
var manifest = {
  generated: new Date().toISOString().slice(0, 10),
  unit: UNIT,
  source: "data/book1/unit" + uu + ".json",
  voices: VOICES,
  format: FORMAT,
  rate: RATE || "default",
  outDir: "audio/book1/u" + uu + "/",
  counts: items.reduce(function(a, it){ a[it.type] = (a[it.type] || 0) + 1; return a; }, {}),
  utterances: items.length,
  files: items.length * voiceKeys.length,
  arabicChars: totalChars,
  billedChars: totalChars * voiceKeys.length,
  items: items.map(function(it){
    var files = {};
    voiceKeys.forEach(function(k){ files[k] = "audio/book1/u" + uu + "/" + it.id + "-" + k + ".mp3"; });
    return { id: it.id, type: it.type, lesson: it.lesson, text: it.text, chars: it.chars, files: files };
  })
};
var manifestPath = path.join(__dirname, "manifest-u" + uu + ".json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

console.log("Unit " + UNIT + " manifest -> " + path.relative(ROOT, manifestPath));
console.log("  utterances: " + items.length + "  " + JSON.stringify(manifest.counts));
console.log("  voices: " + voiceKeys.map(function(k){ return VOICES[k]; }).join(", "));
console.log("  files to create: " + manifest.files + "  (in " + manifest.outDir + ")");
console.log("  Arabic characters: " + totalChars + "  | billed with " + voiceKeys.length + " voice(s): " + manifest.billedChars);
console.log("  Azure F0 free tier: 500,000 neural chars/month -> this run uses " + (manifest.billedChars / 5000).toFixed(1) + "% of it");

if(!RUN){
  console.log("\nDRY RUN ONLY — no audio generated, no network calls made.");
  console.log("After approval: set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, then add --run");
  process.exit(0);
}

/* ---- real run ---- */
var KEY = process.env.AZURE_SPEECH_KEY, REGION = process.env.AZURE_SPEECH_REGION;
if(!KEY || !REGION){
  console.error("\n--run requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables.");
  console.error("See prototype/audio/SETUP.md. The key is never stored in any file.");
  process.exit(1);
}
function xmlEsc(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function ssml(voiceName, text){
  var body = xmlEsc(text);
  if(RATE) body = '<prosody rate="' + RATE + '">' + body + "</prosody>";
  return '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">' +
         '<voice name="' + voiceName + '">' + body + "</voice></speak>";
}
function synth(voiceName, text, file, cb){
  var payload = ssml(voiceName, text);
  var req = https.request({
    hostname: REGION + ".tts.speech.microsoft.com",
    path: "/cognitiveservices/v1",
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": FORMAT,
      "User-Agent": "ArabicMV-audio-pilot"
    }
  }, function(res){
    if(res.statusCode !== 200){
      var errBody = "";
      res.on("data", function(c){ errBody += c; });
      res.on("end", function(){ cb(new Error("HTTP " + res.statusCode + " " + errBody.slice(0, 200))); });
      return;
    }
    var chunks = [];
    res.on("data", function(c){ chunks.push(c); });
    res.on("end", function(){
      var buf = Buffer.concat(chunks);
      if(buf.length < 500) return cb(new Error("suspiciously small response (" + buf.length + " bytes)"));
      fs.writeFileSync(file, buf);
      cb(null, buf.length);
    });
  });
  req.on("error", cb);
  req.end(payload);
}

fs.mkdirSync(outDir, { recursive: true });
var queue = [];
manifest.items.forEach(function(it){
  voiceKeys.forEach(function(k){
    queue.push({ voice: VOICES[k], text: it.text, file: path.join(outDir, it.id + "-" + k + ".mp3") });
  });
});
var i = 0, done = 0, skipped = 0, failed = [];
(function next(){
  if(i >= queue.length){
    console.log("\nDone: " + done + " generated, " + skipped + " skipped (already existed)" +
      (failed.length ? ", " + failed.length + " FAILED:\n  " + failed.join("\n  ") : "."));
    process.exit(failed.length ? 1 : 0);
  }
  var job = queue[i++];
  if(!FORCE && fs.existsSync(job.file)){ skipped++; return next(); }
  synth(job.voice, job.text, job.file, function(err, bytes){
    var name = path.basename(job.file);
    if(err){ failed.push(name + " — " + err.message); console.log("  FAIL " + name + ": " + err.message); }
    else { done++; console.log("  ok   " + name + "  (" + (bytes / 1024).toFixed(1) + " KB)  [" + (done + skipped) + "/" + queue.length + "]"); }
    setTimeout(next, DELAY_MS);
  });
})();
