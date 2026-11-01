/* ArabicMV Phase 4B — Azure TTS generation script.
 *
 * SCOPE (policy approved 2026-11-01): audio is permitted ONLY in Listening
 * and Speaking activities. The sole such content is data/book1 `speak[]`
 * (the Speaking tab's Q/A drills, which also feed its "Say it" mode).
 * Vocabulary, flashcards, dialogues, reading and grammar get NO audio.
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
 *   --voice m|f|both   (default both; filters which of the assigned files to make)
 *   --rate -10%        optional SSML prosody rate, e.g. "-10%" for slower speech
 *
 * File naming (JSON stays untouched; the app derives these paths):
 *   speak question  uNN-sSS-q-<voice>.mp3     SS = 1-based index in unit speak array
 *   speak answer    uNN-sSS-a-<voice>.mp3
 *   <voice> is m (ar-SA-HamedNeural) or f (ar-SA-ZariyahNeural).
 *   One recording per utterance — no duplicate voices.
 */
"use strict";
var fs = require("fs"), path = require("path"), https = require("https");

var VOICES = { m: "ar-SA-HamedNeural", f: "ar-SA-ZariyahNeural" };

/* Voice assignment for speak[] Q/A drills, from a full read of all 72 pairs
 * in units 1-8 (2026-11-01). Every gender-marked utterance is masculine
 * (اسْمُكَ، أَنْتَ، أَنَا مَالْدِيفِيٌّ، سَأَكُونُ مُدَرِّسًا...); there are no
 * feminine addressees or self-references anywhere in speak[].
 *  - Answers: always Hamed (male) — many contain masculine self-reference.
 *  - Questions: Zariyah (female) for conversational two-voice contrast —
 *    the asker is grammatically unmarked in every question — EXCEPT where an
 *    answer genders the asker as male, listed below with the evidence.
 * One recording per utterance; no duplicate voices, no pitch tricks. */
var MALE_ASKER = {
  "u05-s04": "answer says مِنْ فَضْلِكَ (masc.) to the asker",
  "u06-s09": "answer says اِنْتَظِرْ ... مَعَكَ (masc.) to the asker"
};
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
var RATE = flag("rate", null); /* e.g. "-10%" */

if(!(UNIT >= 1 && UNIT <= 8)){ console.error("Unit must be 1-8 (units 9-16 have no data)."); process.exit(1); }
var voiceKeys = VOICE_SEL === "both" ? ["m", "f"] : [VOICE_SEL];
if(voiceKeys.some(function(k){ return !VOICES[k]; })){ console.error("--voice must be m, f or both"); process.exit(1); }

var uu = (UNIT < 10 ? "0" : "") + UNIT;
var unitFile = path.join(DATA, "unit" + uu + ".json");
var d = JSON.parse(fs.readFileSync(unitFile, "utf8"));

/* ---- build the utterance list (exact JSON strings, nothing invented) ---- */
function pad2(n){ return ("0" + n).slice(-2); }
var items = [];
function add(id, type, lesson, text, voice){
  if(!text) return;
  if(voiceKeys.indexOf(voice) < 0) return; /* excluded by --voice filter */
  items.push({ id: id, type: type, lesson: lesson, text: text, chars: text.length, voices: [voice] });
}
(d.speak || []).forEach(function(s, si){
  var base = "u" + uu + "-s" + pad2(si + 1);
  var qVoice = MALE_ASKER[base] ? "m" : "f";
  add(base + "-q", "speak-q", s.lesson, s.q && s.q.ar, qVoice);
  add(base + "-a", "speak-a", s.lesson, s.a && s.a.ar, "m");
});

/* ---- manifest ---- */
var outDir = path.join(AUDIO_ROOT, "u" + uu);
var totalChars = items.reduce(function(a, it){ return a + it.chars; }, 0);
var totalFiles = items.reduce(function(a, it){ return a + it.voices.length; }, 0);
var billedChars = items.reduce(function(a, it){ return a + it.chars * it.voices.length; }, 0);
var manifest = {
  generated: new Date().toISOString().slice(0, 10),
  unit: UNIT,
  source: "data/book1/unit" + uu + ".json",
  voices: VOICES,
  voicePolicy: "speak[] only (Listening/Speaking scope); answers Hamed, questions Zariyah except male-marked askers (u05-s04, u06-s09); one voice per utterance",
  format: FORMAT,
  rate: RATE || "default",
  outDir: "audio/book1/u" + uu + "/",
  counts: items.reduce(function(a, it){ a[it.type] = (a[it.type] || 0) + 1; return a; }, {}),
  utterances: items.length,
  files: totalFiles,
  arabicChars: totalChars,
  billedChars: billedChars,
  items: items.map(function(it){
    var files = {};
    it.voices.forEach(function(k){ files[k] = "audio/book1/u" + uu + "/" + it.id + "-" + k + ".mp3"; });
    var o = { id: it.id, type: it.type, lesson: it.lesson, text: it.text, chars: it.chars, files: files };
    if(it.who) o.who = it.who;
    return o;
  })
};
var manifestPath = path.join(__dirname, "manifest-u" + uu + ".json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

console.log("Unit " + UNIT + " manifest -> " + path.relative(ROOT, manifestPath));
console.log("  utterances: " + items.length + "  " + JSON.stringify(manifest.counts));
console.log("  voices: " + voiceKeys.map(function(k){ return VOICES[k]; }).join(", "));
console.log("  files to create: " + manifest.files + "  (in " + manifest.outDir + ")");
var vc = { m: 0, f: 0 };
manifest.items.forEach(function(it){ Object.keys(it.files).forEach(function(k){ vc[k]++; }); });
console.log("  per voice: Hamed (m) " + vc.m + " files, Zariyah (f) " + vc.f + " files");
console.log("  Arabic characters: " + totalChars + "  | billed under voice policy: " + manifest.billedChars);
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
  Object.keys(it.files).forEach(function(k){
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
