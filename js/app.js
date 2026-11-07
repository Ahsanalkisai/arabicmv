/* ArabicMV — state, helpers, actions and start-up. */
var TYPES = [["phrase","ޢިބާރާތް"],["noun","އިސްމު"],["verb","ފިޢުލު"],["tip","ޤަވާޢިދު"]];
var DEMO_PASSWORD = "1234"; /* prototype only; Supabase login replaces this */
var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';
var ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5h3.5v13H3zM9.5 1.5H13v13H9.5z"/></svg>';


var ICONS = {
  back:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  more:'<path d="M12 5v.01M12 12v.01M12 19v.01" stroke-width="3"/>',
  chev:'<path d="M15 6l-6 6 6 6"/>',
  fwd:'<path d="M9 6l6 6-6 6"/>',
  lock:'<path d="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  redo:'<path d="M4 12a8 8 0 0113.6-5.7L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 01-13.6 5.7L4 16M4 20v-4h4"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  read:'<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13"/>',
  practice:'<path d="M5 4h14v16H5zM9 12l2.5 2.5L15.5 9"/>',
  speak:'<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
  dash:'<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z"/>',
  ref:'<path d="M4 5h6a3 3 0 013 3v12a2 2 0 00-2-2H4zM20 5h-6a3 3 0 00-3 3v12a2 2 0 012-2h7z"/>',
  progress:'<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4M12 17v.01"/>',
  cardsI:'<rect x="8" y="3" width="13" height="15" rx="2"/><path d="M16 21H5a2 2 0 01-2-2V8"/>',
  matchI:'<path d="M10.5 13.5a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1.2 1.2"/><path d="M13.5 10.5a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1.2-1.2"/>',
  arrangeI:'<path d="M4 7h16M4 12h11M4 17h6"/>',
  speedI:'<path d="M13 2L5 13.5h6L11 22l8-11.5h-6z"/>',
  bookmark:'<path d="M7 3h10a1 1 0 011 1v17l-6-4.2L6 21V4a1 1 0 011-1z"/>',
  ear:'<path d="M4 18v-5a8 8 0 0116 0v5"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  clipboardCheck:'<path d="M9 4H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="M9 13l2 2 4-4"/>',
  bookOpen:'<path d="M12 7c-1.6-1.4-4.2-2-8-2v13c3.8 0 6.4.6 8 2 1.6-1.4 4.2-2 8-2V5c-3.8 0-6.4.6-8 2zM12 7v13"/>',
  gradCap:'<path d="M2 9.5l10-4.5 10 4.5-10 4.5z"/><path d="M6.5 11.5V16c0 1.4 2.6 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.5M21 9.5v5.5"/>'
};
var DIR_ICONS = {back:1, chev:1, fwd:1};
function ic(n){ return '<svg class="ic'+(DIR_ICONS[n]?" d":"")+'" viewBox="0 0 24 24" aria-hidden="true">'+ICONS[n]+'</svg>'; }

/* ---------- language modes ---------- */
/* mode: en = Arabic + English, dv = Arabic + Dhivehi, both = Arabic + English + Dhivehi.
   The interface language follows the mode: English for "en", Dhivehi for "dv" and "both". */

/* ---------- content loaded from data/book1/*.json ---------- */
var UNITS = [], UNITS_EN = [], UNIT_DATA = {}, UNIT_BONUS = {};
function unitSub(i){ return S.ui === "en" ? UNITS_EN[i] : UNITS[i][1]; }
/* supplementary entries ("bonus": true in index.json) are labelled as a bonus lesson, not a textbook unit */
function isBonus(n){ return !!UNIT_BONUS[n]; }
function unitKind(n){ return isBonus(n) ? "دَرْسٌ إِضَافِيٌّ" : "الوحدة"; }
function unitName(n){ return (isBonus(n) ? T("bonus") : T("unit"))+' '+n; }
function gTitle(g){ return S.ui === "en" && g.titleEn ? g.titleEn : g.title; }
function gBody(g){ return S.ui === "en" && g.bodyEn ? g.bodyEn : g.body; }
function lTask(l){ return S.ui === "en" ? (l.taskEn || "") : (l.task || ""); }
/* map a unit JSON file onto the in-memory shape the views use */
function adoptUnit(j){
  UNIT_DATA[j.unit] = {
    lessons: j.lessons.map(function(l){ return {num:l.num, ar:l.title_ar, task:l.task_dv, taskEn:l.task_en}; }),
    vocab: j.vocab,
    conv: j.dialogues.map(function(c){ return {lesson:c.lesson, audio:c.audio, lines:c.lines}; }),
    speak: j.speak,
    letters: j.letters || [],
    grammar: j.grammar.map(function(g){ return {lesson:g.lesson, title:g.title_dv, body:g.body_dv, titleEn:g.title_en, bodyEn:g.body_en, ex:g.examples}; })
  };
}
function loadBook(){
  return fetch("data/book1/index.json").then(function(r){ return r.json(); }).then(function(ix){
    UNITS = ix.units.map(function(u){ return [u.title_ar, u.title_dv]; });
    UNITS_EN = ix.units.map(function(u){ return u.title_en; });
    UNIT_BONUS = {}; ix.units.forEach(function(u){ if(u.bonus) UNIT_BONUS[u.unit] = true; });
    return Promise.all(ix.units.filter(function(u){ return u.file; }).map(function(u){
      return fetch("data/book1/"+u.file).then(function(r){ return r.json(); }).then(adoptUnit);
    }));
  });
}

/* ---------- storage (stand-in for Supabase) ---------- */
var KEY = "aby-addon-v1";
var store = {classes:[], entries:[]};
try{ var raw = localStorage.getItem(KEY); if(raw){ var p = JSON.parse(raw); if(p && p.classes && p.entries) store = p; } }catch(e){}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------- state ---------- */
var S = {mode:null, ui:"dv", sec:"home", pUnit:1, pLesson:0, dlg:0, review:false, unit:null, lastUnit:null, lesson:null, last:{}, tab:"read", readTab:"conv", pracTab:"fc", scope:"lesson", spTab:"qa", sp:0, spShown:false, open:{},
         li:0, liWrong:null, liA:{}, liText:false,
         cls:false, classId:null, type:"phrase", practice:null, teacher:false,
         libTab:"book", libQ:"", libU:0, libL:0, libSt:"all", libReview:false};
try{
  var m = localStorage.getItem("aby-mode"); if(MODES.indexOf(m) >= 0) S.mode = m;
  var lastUnit = +localStorage.getItem("aby-unit"); if(lastUnit >= 1) S.unit = S.lastUnit = lastUnit; /* a unit without data is cleared after loadBook */
  S.last = JSON.parse(localStorage.getItem("aby-last") || "{}") || {};
}catch(e){}
function applyMode(){
  S.ui = S.mode === "en" ? "en" : "dv";
  var root = document.documentElement;
  root.setAttribute("dir", S.ui === "en" ? "ltr" : "rtl");
  root.setAttribute("lang", S.ui === "en" ? "en" : "dv");
  root.setAttribute("data-ui", S.ui);
}
applyMode();
var fc = null, quiz = null, match = null, arr = null, lt = null;
var rv = null; /* vocabulary review session, separate from the lesson flashcards */
function rvAdvance(){ rv.i++; rv.flipped = false; }
var done = {}; try{ done = JSON.parse(localStorage.getItem("aby-done") || "{}") || {}; }catch(e){}
function markDone(sec){
  if(!S.unit || !S.lesson) return;
  var k = S.unit+"-"+S.lesson; done[k] = done[k] || {};
  if(done[k][sec]) return;
  done[k][sec] = 1; try{ localStorage.setItem("aby-done", JSON.stringify(done)); }catch(e){}
  recordDay();
}
function isDone(sec){ var d = done[S.unit+"-"+S.lesson]; return !!(d && d[sec]); }
/* the read section is done after revealing 5 translations in the lesson
   (or every one of them, in the rare lesson with fewer than 5) */
function checkReadDone(){
  if(!S.unit || !S.lesson || S.cls) return;
  var d = UNIT_DATA[S.unit]; if(!d) return;
  var n = 0, k; for(k in S.open){ if(S.open[k] && (k.charAt(0)==="c" || k.charAt(0)==="v")) n++; }
  var total = 0;
  d.conv.forEach(function(c){ if(S.review || c.lesson === S.lesson) total += c.lines.length; });
  d.vocab.forEach(function(v){ if(S.review || v.lesson === S.lesson) total++; });
  if(total && n >= Math.min(5, total)) markDone("read");
}
/* listening is done once every question in the lesson has been answered
   (correctly or by revealing); unit review never marks a lesson flag */
function liCheckDone(){
  if(S.review || !S.unit || !S.lesson) return;
  var list = liList();
  if(list.length && list.every(function(x){ return S.liA[S.unit + ":" + x.i]; })) markDone("listen");
}

/* ---------- Listening/Speaking audio (speak[] questions and answers only) ----------
   prototype/audio/generate.js writes audio/book1/ready.json, listing only recordings
   that were generated successfully from the current text:
     {"units":{"<unit>":{"<si><q|a>":{"f":"u01/u01-s01-q-f.mp3","t":"<fnv of the text>"}}}}
   An item has audio only if it is listed AND its "t" matches the Arabic text shown
   now, so a recording of older wording is never played. Everything else falls back
   to the text-only exercises. AUDIO_READY is the master switch: while false nothing
   is fetched and Listening/Speaking behave exactly as they did before audio. */
var AUDIO_READY = false;
var AUD = {map:null, el:null, key:null, st:"", bad:{}};
function fnv(s){ /* FNV-1a 32-bit over UTF-16 units of the NFC text; generate.js uses the same function */
  s = String(s); if(s.normalize) s = s.normalize("NFC");
  var h = 0x811c9dc5;
  for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = (h + (h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24)) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}
function loadAudioIndex(){
  if(!AUDIO_READY) return Promise.resolve();
  return fetch("audio/book1/ready.json", {cache:"no-cache"}).then(function(r){ return r.ok ? r.json() : null; })
    .then(function(j){ AUD.map = j && j.units ? j.units : {}; }, function(){ AUD.map = {}; });
}
function audioKey(u, si, part){ return u + "-" + si + "-" + part; } /* si = 0-based index in speak[] */
function audioUrl(u, si, part){
  if(!AUDIO_READY || !AUD.map || AUD.bad[audioKey(u, si, part)]) return null;
  var e = AUD.map[u] && AUD.map[u][(si + 1) + part], s = UNIT_DATA[u] && UNIT_DATA[u].speak[si];
  if(!e || !s || !s[part] || e.t !== fnv(s[part].ar)) return null;
  return "audio/book1/" + e.f;
}
/* one shared player; files load only when a play button is tapped */
function audPlayer(){
  if(AUD.el) return AUD.el;
  var a = AUD.el = new Audio(); a.preload = "none";
  function st(v){ return function(){ if(AUD.key){ AUD.st = v; audSync(); } }; }
  a.addEventListener("loadstart", st("loading")); a.addEventListener("waiting", st("loading"));
  a.addEventListener("playing", st("playing"));
  a.addEventListener("pause", st("")); a.addEventListener("ended", function(){ AUD.key = null; AUD.st = ""; audSync(); });
  a.addEventListener("error", function(){ audFail(AUD.key); });
  return a;
}
function audFail(k){ if(!k) return; AUD.bad[k] = 1; if(AUD.key === k){ AUD.key = null; AUD.st = ""; } render(); }
function audStop(){ if(AUD.el && AUD.key){ AUD.el.pause(); AUD.el.removeAttribute("src"); try{ AUD.el.load(); }catch(e){} } AUD.key = null; AUD.st = ""; }
function audToggle(k){
  var p = k.split("-"), url = audioUrl(+p[0], +p[1], p[2]); if(!url) return;
  if(AUD.key === k){ audStop(); audSync(); return; }
  audStop();
  var a = audPlayer(); AUD.key = k; AUD.st = "loading"; audSync();
  a.src = url;
  var pr = a.play(); if(pr && pr.catch) pr.catch(function(e){ if(e && e.name !== "AbortError") audFail(k); });
}
/* reflect the player state on the visible buttons without a full re-render */
function audSync(){
  Array.prototype.forEach.call(document.querySelectorAll(".abtn"), function(b){
    var on = b.getAttribute("data-k") === AUD.key, s = on ? AUD.st : "";
    b.className = "abtn" + (s ? " " + s : ""); b.setAttribute("aria-pressed", s === "playing" ? "true" : "false");
    b.setAttribute("aria-busy", s === "loading" ? "true" : "false");
    b.setAttribute("aria-label", s === "loading" ? T("loading") : s === "playing" ? T("pause") : T("audPlay"));
    b.innerHTML = s === "playing" ? ICON_PAUSE : ICON_PLAY;
    var st = b.parentNode && b.parentNode.querySelector(".ast"); if(st) st.textContent = s === "loading" ? T("loading") : "";
  });
}
/* after every render: stop audio whose button is no longer on screen */
function audAfterRender(){
  if(AUD.key && !document.querySelector('.abtn[data-k="' + AUD.key + '"]')) audStop();
  if(AUD.key) audSync();
}

/* ---------- daily activity + recent lessons (new keys; existing keys untouched) ---------- */
/* aby-days holds the dates on which a lesson section was completed, recorded from first use on;
   nothing is back-filled, so the streak only ever reflects real recorded activity */
var days = []; try{ days = JSON.parse(localStorage.getItem("aby-days") || "[]") || []; }catch(e){}
function dayKey(t){ var d = t || new Date(); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function recordDay(){
  var k = dayKey();
  if(days.indexOf(k) < 0){ days.push(k); if(days.length > 400) days = days.slice(-400); try{ localStorage.setItem("aby-days", JSON.stringify(days)); }catch(e){} }
}
function streak(){
  var n = 0, t = new Date();
  if(days.indexOf(dayKey(t)) < 0) t.setDate(t.getDate()-1); /* today only joins the streak once something is done */
  while(days.indexOf(dayKey(t)) >= 0){ n++; t.setDate(t.getDate()-1); }
  return n;
}
var recent = []; try{ recent = JSON.parse(localStorage.getItem("aby-recent") || "[]") || []; }catch(e){}
function recordRecent(u, l){
  recent = recent.filter(function(r){ return !(r.u === u && r.l === l); });
  recent.unshift({u:u, l:l}); recent = recent.slice(0,5);
  try{ localStorage.setItem("aby-recent", JSON.stringify(recent)); }catch(e){}
}

/* ---------- personal vocabulary (aby-vocab-v1) ----------
   Saved words are references (unit + Arabic string), never copies; details are
   always resolved live from UNIT_DATA so textbook corrections propagate. */
var vocabStore = {words:{}};
try{ var vraw = localStorage.getItem("aby-vocab-v1"); if(vraw){ var vp = JSON.parse(vraw); if(vp && vp.words) vocabStore = vp; } }catch(e){}
function saveVocabStore(){ try{ localStorage.setItem("aby-vocab-v1", JSON.stringify(vocabStore)); }catch(e){} }
function stripTash(s){ return String(s || "").replace(/[ً-ْٰ]/g, ""); }
function vKey(u, ar){ return u+"|"+ar; }
function vSaved(u, ar){ return !!vocabStore.words[vKey(u, ar)]; }
/* resolve a saved reference to its live vocab entry; tashkeel-insensitive
   fallback covers later spelling corrections, null means safely skip */
function vResolve(key){
  var i = key.indexOf("|"), u = +key.slice(0, i), ar = key.slice(i+1), d = UNIT_DATA[u], hit = null;
  if(!d) return null;
  d.vocab.forEach(function(v){ if(!hit && v.ar === ar) hit = v; });
  if(!hit){ var bare = stripTash(ar); d.vocab.forEach(function(v){ if(!hit && stripTash(v.ar) === bare) hit = v; }); }
  return hit;
}
/* genuine example sentences: textbook lines of the same unit containing the word,
   deduplicated and never the bare word echoed back as its own example */
function vExamples(u, ar){
  function bare(s){ return stripTash(s).replace(/[.،؟!:]/g, "").replace(/\s+/g, " ").trim(); }
  var d = UNIT_DATA[u], w = bare(ar), out = [], seen = {};
  if(!d || w.length < 2) return out;
  function scan(line){
    if(out.length >= 2 || !line || !line.ar) return;
    var b = bare(line.ar);
    if(b.indexOf(w) >= 0 && b !== w && !seen[b]){ seen[b] = 1; out.push(line); }
  }
  d.conv.forEach(function(c){ c.lines.forEach(scan); });
  d.speak.forEach(function(s){ scan(s.q); scan(s.a); });
  return out;
}

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function arNum(n){ return String(n).split("").map(function(d){ return AR_DIGITS[+d]; }).join(""); }
function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
/* translation block, following the language mode: English, Dhivehi, or English then Dhivehi */
function meaning(it){
  var en = it.en ? '<span class="en" dir="ltr">'+esc(it.en)+'</span>' : '', dv = it.dv ? '<span class="dv">'+esc(it.dv)+'</span>' : '';
  return S.mode === "en" ? en : S.mode === "dv" ? dv : en+dv;
}
var app = document.getElementById("app"), modalRoot = document.getElementById("modalRoot");


/* ---------- shared pieces ---------- */
function seg(list, cur, action){
  return '<div class="seg">'+list.map(function(t){ return '<button class="'+(cur===t[0]?"on":"")+'" data-a="'+action+'" data-t="'+t[0]+'">'+t[1]+'</button>'; }).join("")+'</div>';
}
function ofLesson(a){ return S.review ? a : a.filter(function(x){ return x.lesson === S.lesson; }); }
function inLesson(a){ return (S.scope === "unit" || S.review) ? a : ofLesson(a); }
function notReady(){ return '<div class="empty">'+T("unitNotReady")+'</div>'; }

/* ---------- actions ---------- */
var A = {
  setMode:function(d){ S.mode = d.m; try{ localStorage.setItem("aby-mode", S.mode); }catch(e){} applyMode(); window.scrollTo(0,0); },
  /* homepage cards and header back buttons (the chrome's bar() takes an action name without data) */
  home:function(){ return A.sec({s:"home"}); },
  books:function(){ return A.sec({s:"books"}); },
  /* homepage cards and header back buttons (the chrome's bar() takes an action name without data) */
  home:function(){ return A.sec({s:"home"}); },
  books:function(){ return A.sec({s:"books"}); },
  /* homepage cards and header back buttons (the chrome's bar() takes an action name without data) */
  home:function(){ return A.sec({s:"home"}); },
  books:function(){ return A.sec({s:"books"}); },
  sec:function(d){
    closeModal(); clearInterval(speedTimer); S.sec = d.s; S.cls = false;
    /* Textbook always opens the all-units overview; the last unit stays in S.lastUnit for Continue */
    if(d.s === "book"){ S.unit = null; S.lesson = null; S.review = false; S.practice = null; }
    if(d.s === "practice"){ if(!UNIT_DATA[S.pUnit]) S.pUnit = 1; initPracticeFor(S.pUnit, S.pLesson); }
    if(d.s === "ref") S.libReview = false;
    window.scrollTo(0,0);
  },
  resume:function(){
    var u = S.lastUnit, l = S.last[u];
    S.sec = "book";
    if(u && UNIT_DATA[u] && l){ S.unit = u; S.review = l === "r"; S.lesson = S.review ? 1 : +l; S.tab = "read"; S.readTab = "conv"; S.dlg = 0; S.open = {}; }
    else { S.unit = null; S.lesson = null; }
    window.scrollTo(0,0);
  },
  pUnit:function(d){ S.pUnit = +d.n; S.pLesson = 0; initPracticeFor(S.pUnit, 0); },
  pLesson:function(d){ S.pLesson = +d.n; initPracticeFor(S.pUnit, S.pLesson); },
  changeLang:function(){ closeModal(); clearInterval(speedTimer); S.mode = null; try{ localStorage.removeItem("aby-mode"); }catch(e){} window.scrollTo(0,0); },
  menu:function(){ menuModal(); return false; },
  units:function(){ closeModal(); S.sec="book"; S.cls=false; S.unit=null; S.lesson=null; S.practice=null; window.scrollTo(0,0); },
  unit:function(d){ S.unit=S.lastUnit=+d.n; S.lesson=null; try{ localStorage.setItem("aby-unit", String(S.unit)); }catch(e){} window.scrollTo(0,0); },
  lessons:function(){ S.lesson=null; S.review=false; window.scrollTo(0,0); },
  lesson:function(d){
    S.review = d.n==="r"; S.lesson = S.review ? 1 : +d.n; S.dlg=0; S.tab="read"; S.readTab="conv"; S.scope="lesson"; S.open={}; S.sp=0; S.spShown=false; S.li=0; S.liWrong=null; S.liText=false; S.last[S.unit]=S.review ? "r" : S.lesson;
    try{ localStorage.setItem("aby-last", JSON.stringify(S.last)); }catch(e){}
    recordRecent(S.unit, S.review ? "r" : S.lesson);
    window.scrollTo(0,0);
  },
  tab:function(d){
    clearInterval(speedTimer); S.tab=d.t;
    if(d.t==="read" && S.readTab==="turn") S.readTab="conv";
    if(d.t==="practice") initPractice();
    if(d.t==="speak"){ S.sp=0; S.spShown=false; }
    if(d.t==="listen"){ S.li=0; S.liWrong=null; S.liText=false; }
    window.scrollTo(0,0);
  },
  clsOpen:function(){ closeModal(); S.cls=true; S.classId=null; S.practice=null; window.scrollTo(0,0); },
  clsBack:function(){ if(S.practice) S.practice=null; else if(S.classId) S.classId=null; else S.cls=false; },
  readTab:function(d){ S.readTab=d.t; clearInterval(speedTimer); if(d.t==="turn") initPractice(); },
  turnBack:function(){ clearInterval(speedTimer); S.readTab="conv"; window.scrollTo(0,0); },
  dlgNext:function(){ S.dlg++; },
  dlgPrev:function(){ S.dlg--; },
  pracTab:function(d){ S.pracTab=d.t; initPractice(); },
  scopeToggle:function(){
    openModal('<div class="pop"><button class="ib px" data-a="close" aria-label="'+T("close")+'">'+ic("x")+'</button><h3>'+T("scope")+'</h3><div class="menu">'+
      '<button class="'+(S.scope==="lesson"?"on":"")+'" data-a="scopeSet" data-v="lesson">'+T("thisLesson")+'</button>'+
      '<button class="'+(S.scope==="unit"?"on":"")+'" data-a="scopeSet" data-v="unit">'+T("wholeUnit")+'</button></div></div>', true);
    return false;
  },
  scopeSet:function(d){ S.scope = d.v; closeModal(); initPractice(); },
  spTab:function(d){ S.spTab=d.t; S.sp=0; S.spShown=false; },
  line:function(d){
    S.open[d.k]=!S.open[d.k];
    /* grammar counts as studied once a note is actually opened, not on tab visit */
    if(S.open[d.k] && d.k.charAt(0)==="g" && S.tab==="help") markDone("help");
    /* reading counts once enough dialogue lines or words have been revealed */
    if(S.open[d.k] && S.tab==="read" && (d.k.charAt(0)==="c" || d.k.charAt(0)==="v")) checkReadDone();
  },
  /* listening: answered = picked the right answer or revealed it; the lesson's
     listen flag is set only when every question in scope has been answered */
  liPick:function(d){
    var list = liList(), it = list[S.li]; if(!it) return false;
    var k = S.unit + ":" + it.i;
    if(S.liA[k]) return false;
    if(+d.i === it.i){ S.liA[k] = 1; S.liWrong = null; liCheckDone(); }
    else S.liWrong = +d.i;
  },
  liReveal:function(){
    var list = liList(), it = list[S.li]; if(!it) return false;
    var k = S.unit + ":" + it.i;
    if(S.liA[k]) return false;
    S.liA[k] = 2; S.liWrong = null; liCheckDone();
  },
  liNext:function(){ var n = liList().length; if(n){ S.li = (S.li + 1) % n; } S.liWrong = null; S.liText = false; },
  liPrev:function(){ var n = liList().length; if(n){ S.li = (S.li - 1 + n) % n; } S.liWrong = null; S.liText = false; },
  liText:function(){ S.liText = true; },
  aud:function(d){ audToggle(d.k); return false; },
  dashLesson:function(d){
    S.sec = "book"; S.cls = false;
    S.unit = S.lastUnit;
    if(!S.unit || !UNIT_DATA[S.unit]){ S.unit = S.lastUnit = 1; try{ localStorage.setItem("aby-unit", "1"); }catch(e){} }
    A.lesson({n:String(S.last[S.unit] || "1")});
    S.tab = d.t;
  },
  spShow:function(){ S.spShown=true; if(S.sp===spCount()-1) markDone("speak"); },
  spNext:function(){ S.sp=(S.sp+1)%spCount(); S.spShown=false; },
  spPrev:function(){ var n=spCount(); S.sp=(S.sp-1+n)%n; S.spShown=false; },
  fcFlip:function(){ fc.flipped=!fc.flipped; },
  fcNext:function(){ if((S.tab==="practice" || S.readTab==="turn") && fc.i===fc.items.length-1) markDone("practice"); fc.i=(fc.i+1)%fc.items.length; fc.flipped=false; },
  fcPrev:function(){ fc.i=(fc.i-1+fc.items.length)%fc.items.length; fc.flipped=false; },
  quizPick:function(d){ if(quiz.checked) return; quiz.sel=+d.k; quiz.nudge=false; },
  quizCheck:function(){
    if(quiz.sel===null){ quiz.nudge=true; return; }
    quiz.checked=true; if(quiz.sel===quiz.qs[quiz.i].ans) quiz.score++;
  },
  quizNext:function(){ quiz.i++; quiz.sel=null; quiz.checked=false; quiz.nudge=false; if((S.tab==="practice" || S.readTab==="turn") && quiz.i >= quiz.qs.length) markDone("practice"); },
  quizRestart:function(){ startQuiz(S.cls ? classItems(S.classId) : practiceSource().vocab); },
  matchPick:function(d){
    var i = +d.i;
    if(match.wrong) return;
    if(d.side === "L") match.selL = match.selL === i ? null : i; else match.selR = match.selR === i ? null : i;
    if(match.selL !== null && match.selR !== null){
      if(match.selL === match.selR){
        match.done[match.selL] = match.cur;              /* correct: both keep this attempt's colour for good */
        match.selL = match.selR = null; match.ci++; match.cur = MATCH_COLOURS[match.ci % MATCH_COLOURS.length];
      } else {
        match.wrong = [match.selL, match.selR];          /* wrong: both go red briefly, then back to white */
        match.selL = match.selR = null;
        setTimeout(function(){ if(match && match.wrong){ match.wrong = null; match.ci++; match.cur = MATCH_COLOURS[match.ci % MATCH_COLOURS.length]; render(); } }, 700);
      }
    }
  },
  speedGo:function(){ speed.started = true; clearInterval(speedTimer); speedTimer = setInterval(speedTick, 1000); },
  speedPick:function(d){
    if(speed.over || speed.q.picked !== null) return;
    speed.q.picked = +d.k; speed.total++; if(speed.q.picked === speed.q.ans) speed.score++;
    render(); setTimeout(function(){ if(speed && !speed.over){ speedQ(); render(); } }, 450); return false;
  },
  speedNew:function(){ startSpeed(practiceSource().vocab); },
  matchNew:function(){ startMatch(practiceSource().vocab); },
  arrPick:function(d){ arr.picked.push(+d.id); },
  arrBack:function(d){ arr.picked = arr.picked.filter(function(x){ return x !== +d.id; }); },
  arrReset:function(){ arr.picked = []; },
  arrNext:function(){ arr.i = (arr.i+1) % arr.list.length; loadArr(); },
  /* arrange the letters: a tile fills the first empty box; a filled box gives its letter back */
  ltPick:function(d){ if(lt.status === "ok") return; var p = lt.slots.indexOf(null); if(p >= 0 && lt.slots.indexOf(+d.id) < 0){ lt.slots[p] = +d.id; lt.status = null; } },
  ltSlot:function(d){ if(lt.status === "ok") return; lt.slots[+d.i] = null; lt.status = null; },
  ltReset:function(){ if(lt.status === "ok") return; lt.slots = lt.slots.map(function(){ return null; }); lt.status = null; },
  /* drag: "t<id>" is a tile, "s<box>" a filled box; dropping on a box swaps with what is there,
     dropping on the tile area gives the letter back */
  ltDrop:function(from, to){
    if(!lt || lt.done || lt.status === "ok") return;
    var id = from.charAt(0) === "s" ? lt.slots[+from.slice(1)] : +from.slice(1), was = lt.slots.indexOf(id);
    if(id === null || isNaN(id)) return;
    if(to === "bank"){ if(was >= 0) lt.slots[was] = null; }
    else { var p = +to, other = lt.slots[p]; lt.slots[p] = id; if(was >= 0 && was !== p) lt.slots[was] = other; }
    lt.status = null;
  },
  /* hint: put the right letter in the first box that is empty or wrong */
  ltHint:function(){
    if(lt.status === "ok") return;
    var q = lt.list[lt.i];
    function good(at){ var k = lt.slots[at]; return k !== null && q.segs[k].b === q.segs[at].b; }
    for(var p = 0; p < q.segs.length; p++){
      if(good(p)) continue;
      /* a tile with the needed letter that is not already sitting in a right box always exists */
      var pick = lt.order.filter(function(id){ var at = lt.slots.indexOf(id); return q.segs[id].b === q.segs[p].b && (at < 0 || !good(at)); })[0];
      if(pick === undefined) return;
      var from = lt.slots.indexOf(pick); if(from >= 0) lt.slots[from] = null;
      lt.slots[p] = pick; lt.hints++; lt.status = null; return;
    }
  },
  ltCheck:function(){
    if(lt.status === "ok") return;
    if(!ltFull()){ lt.status = "fill"; return; }
    var q = lt.list[lt.i]; lt.att[q.ar] = 1;
    if(ltRight()){ lt.status = "ok"; lt.ok[q.ar] = 1; } else { lt.status = "no"; lt.wrong++; lt.miss[q.ar] = 1; }
  },
  ltNext:function(){
    lt.i++;
    if(lt.i >= lt.list.length){ lt.done = true; if(S.tab==="practice" || S.readTab==="turn") markDone("practice"); }
    else ltLoad();
    window.scrollTo(0,0);
  },
  ltRetry:function(){ var keep = lt; ltRound(lt.list.filter(function(q){ return !keep.ok[q.ar] || keep.miss[q.ar]; })); },
  ltRestart:function(){ startLt(lt.all); },
  dashStart:function(){ S.sec="book"; S.cls=false; return A.unit({n:"1"}); },
  dashPractice:function(d){
    closeModal(); clearInterval(speedTimer); S.sec="practice"; S.cls=false; S.pracTab=d.t;
    if(UNIT_DATA[S.lastUnit]) S.pUnit = S.lastUnit; else if(!UNIT_DATA[S.pUnit]) S.pUnit = 1;
    initPracticeFor(S.pUnit, 0); window.scrollTo(0,0);
  },
  goRecent:function(d){
    var u = +d.u; if(!UNIT_DATA[u]) return;
    S.sec="book"; S.cls=false; S.unit=S.lastUnit=u; try{ localStorage.setItem("aby-unit", String(u)); }catch(e){}
    return A.lesson({n:d.l});
  },
  nextLesson:function(){
    var d = UNIT_DATA[S.unit]; if(!d) return;
    if(S.review) return A.lessons();
    if(S.lesson < d.lessons.length) return A.lesson({n:String(S.lesson+1)});
    return A.lesson({n:"r"});
  },
  libTab:function(d){ S.libTab = d.t; },
  libSt:function(d){ S.libSt = d.t; },
  vSave:function(d){
    var k = vKey(+d.u, d.ar);
    if(vocabStore.words[k]) delete vocabStore.words[k];
    else vocabStore.words[k] = {u:+d.u, l:+d.l || 0, st:"new", k:0, added:dayKey()};
    saveVocabStore();
  },
  vStatus:function(d){
    var w = vocabStore.words[d.k]; if(!w) return false;
    w.st = w.st === "new" ? "learning" : w.st === "learning" ? "mastered" : "new";
    saveVocabStore();
  },
  rvStart:function(){
    var items = myWords(); if(!items.length) return false;
    rv = {queue:items.map(function(x){ return x.key; }), i:0, flipped:false, known:0};
    S.libReview = true; window.scrollTo(0,0);
  },
  rvFlip:function(){ if(rv) rv.flipped = true; },
  rvKnown:function(){
    var w = vocabStore.words[rv.queue[rv.i]];
    if(w){ w.k = (w.k||0)+1; if(w.st === "new") w.st = "learning"; saveVocabStore(); }
    rv.known++; rvAdvance();
  },
  rvAgain:function(){
    var k = rv.queue[rv.i], w = vocabStore.words[k];
    if(w && w.st !== "mastered"){ w.st = "learning"; saveVocabStore(); }
    rv.queue.push(k); rvAdvance();
  },
  rvMaster:function(){
    var w = vocabStore.words[rv.queue[rv.i]];
    if(w){ w.st = "mastered"; saveVocabStore(); }
    rv.known++; rvAdvance();
  },
  rvClose:function(){ S.libReview = false; rv = null; },
  "class":function(d){ S.classId=d.id; S.type="phrase"; S.practice=null; window.scrollTo(0,0); },
  classList:function(){ S.classId=null; S.practice=null; },
  type:function(d){ S.type=d.t; },
  practice:function(d){ S.practice=d.t||null; var it=classItems(S.classId); if(d.t==="fc") startFc(it); if(d.t==="quiz") startQuiz(it); },
  loginOpen:function(){ loginModal(); return false; },
  loginDo:function(){ if(val("pw")===DEMO_PASSWORD){ S.teacher=true; closeModal(); } else { fail(T("wrongPw")); return false; } },
  logout:function(){ S.teacher=false; closeModal(); },
  close:function(){ closeModal(); return false; },
  veil:function(d,ev){ if(ev.target.classList.contains("veil")) closeModal(); return false; },
  classNew:function(){ classModal(null); return false; },
  classRename:function(){ classModal(store.classes.filter(function(c){ return c.id===S.classId; })[0]); return false; },
  classSave:function(d){
    var name = val("cname"); if(!name){ fail(T("enterName")); return false; }
    if(d.id){ store.classes.forEach(function(c){ if(c.id===d.id) c.name=name; }); }
    else { var c={id:uid(), name:name}; store.classes.push(c); S.cls=true; S.classId=c.id; S.type="phrase"; S.practice=null; }
    save(); closeModal();
  },
  classDel:function(){ confirmModal(T("delClassQ"),"classDelDo"); return false; },
  classDelDo:function(){
    store.entries = store.entries.filter(function(e){ return e.classId!==S.classId; });
    store.classes = store.classes.filter(function(c){ return c.id!==S.classId; });
    save(); closeModal(); S.classId=null;
  },
  entryNew:function(){ entryModal(null); return false; },
  entryEdit:function(d){ entryModal(store.entries.filter(function(e){ return e.id===d.id; })[0]); return false; },
  entrySave:function(d){
    var type = document.getElementById("f_type").value;
    var e = {type:type, ar:val("f_ar"), dv:val("f_dv"), en:val("f_en"), extra:{}};
    if(type==="noun") e.extra.plural = val("f_plural");
    if(type==="verb"){ e.extra.present = val("f_present"); e.extra.command = val("f_command"); }
    if(type==="tip"){ e.extra.body = val("f_body"); if(!e.dv){ fail(T("enterTitle")); return false; } }
    else if(!e.ar || !e.dv || !e.en){ fail(T("fillAll")); return false; }
    if(d.id){ store.entries.forEach(function(x){ if(x.id===d.id){ x.ar=e.ar; x.dv=e.dv; x.en=e.en; x.extra=e.extra; } }); }
    else { e.id=uid(); e.classId=S.classId; store.entries.push(e); S.type=type; }
    save(); closeModal();
  },
  entryDel:function(d){ confirmModal(T("delEntryQ"),"entryDelDo",d.id); return false; },
  entryDelDo:function(d){ store.entries = store.entries.filter(function(e){ return e.id!==d.id; }); save(); closeModal(); }
};

document.addEventListener("click", function(ev){
  var t = ev.target.closest("[data-a]"); if(!t) return;
  var fn = A[t.dataset.a]; if(!fn) return;
  if(fn(t.dataset, ev) !== false){ render(); navSync(); }
});
/* browser back/forward: one history entry per screen (section, unit, lesson); tabs inside a lesson are not entries */
function navKey(){
  if(!S.mode || S.cls) return null;
  var b = S.sec === "book";
  return S.sec+"|"+(b && S.unit || 0)+"|"+(b && S.unit && S.lesson ? (S.review ? "r" : S.lesson) : 0);
}
function navSync(){
  var k = navKey(); if(!k) return;
  var cur = history.state && history.state.k; if(cur === k) return;
  try{ if(cur) history.pushState({k:k}, ""); else history.replaceState({k:k}, ""); }catch(e){}
}
window.addEventListener("popstate", function(ev){
  var k = ev.state && ev.state.k; if(!k || !S.mode) return;
  var p = k.split("|");
  closeModal(); clearInterval(speedTimer); S.cls = false; S.practice = null; S.sec = p[0];
  if(p[0] === "book"){
    S.unit = UNIT_DATA[+p[1]] ? +p[1] : null; S.lesson = null; S.review = false;
    if(S.unit && p[2] !== "0"){
      S.review = p[2] === "r"; S.lesson = S.review ? 1 : +p[2];
      S.dlg=0; S.tab="read"; S.readTab="conv"; S.scope="lesson"; S.open={}; S.sp=0; S.spShown=false; S.li=0; S.liWrong=null; S.liText=false;
    }
  }
  if(p[0] === "practice"){ if(!UNIT_DATA[S.pUnit]) S.pUnit = 1; initPracticeFor(S.pUnit, S.pLesson); }
  if(p[0] === "ref") S.libReview = false;
  render(); window.scrollTo(0,0);
});
/* drag and drop for arrange-the-letters (mouse and pen; on touch screens tapping does the same) */
document.addEventListener("dragstart", function(ev){
  var t = ev.target.closest && ev.target.closest("[data-drag]"); if(!t) return;
  try{ ev.dataTransfer.setData("text/plain", t.dataset.drag); ev.dataTransfer.effectAllowed = "move"; }catch(e){}
});
document.addEventListener("dragover", function(ev){ if(ev.target.closest && ev.target.closest("[data-slot]")) ev.preventDefault(); });
document.addEventListener("drop", function(ev){
  var z = ev.target.closest && ev.target.closest("[data-slot]"); if(!z) return;
  ev.preventDefault();
  var from = ""; try{ from = ev.dataTransfer.getData("text/plain"); }catch(e){}
  if(/^[st]\d+$/.test(from)){ A.ltDrop(from, z.dataset.slot); render(); }
});
document.addEventListener("change", function(ev){
  if(ev.target.id === "pUnitSel"){ A.pUnit({n:ev.target.value}); render(); }
  if(ev.target.id === "pLessonSel"){ A.pLesson({n:ev.target.value}); render(); }
  if(ev.target.id === "libUSel"){ S.libU = +ev.target.value; S.libL = 0; render(); }
  if(ev.target.id === "libLSel"){ S.libL = +ev.target.value; render(); }
});
document.addEventListener("input", function(ev){
  if(ev.target.id === "libQ"){
    S.libQ = ev.target.value; render();
    var el = document.getElementById("libQ");
    if(el){ el.focus(); var n = el.value.length; try{ el.setSelectionRange(n, n); }catch(e){} }
  }
});
app.innerHTML = '<div class="empty">'+T("loading")+'</div>';
loadBook().then(loadAudioIndex).then(function(){ if(S.unit && !UNIT_DATA[S.unit]) S.unit = null; if(S.lastUnit && !UNIT_DATA[S.lastUnit]) S.lastUnit = null; render(); var k = navKey(); if(k){ try{ history.replaceState({k:k}, ""); }catch(e){} } })
  .catch(function(){ app.innerHTML = '<div class="empty">'+T("loadFail")+'</div>'; });
