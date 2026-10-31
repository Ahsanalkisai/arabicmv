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
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4M12 17v.01"/>'
};
var DIR_ICONS = {back:1, chev:1, fwd:1};
function ic(n){ return '<svg class="ic'+(DIR_ICONS[n]?" d":"")+'" viewBox="0 0 24 24" aria-hidden="true">'+ICONS[n]+'</svg>'; }

/* ---------- language modes ---------- */
/* mode: en = Arabic + English, dv = Arabic + Dhivehi, both = Arabic + English + Dhivehi.
   The interface language follows the mode: English for "en", Dhivehi for "dv" and "both". */

/* ---------- content loaded from data/book1/*.json ---------- */
var UNITS = [], UNITS_EN = [], UNIT_DATA = {};
function unitSub(i){ return S.ui === "en" ? UNITS_EN[i] : UNITS[i][1]; }
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
    grammar: j.grammar.map(function(g){ return {lesson:g.lesson, title:g.title_dv, body:g.body_dv, titleEn:g.title_en, bodyEn:g.body_en, ex:g.examples}; })
  };
}
function loadBook(){
  return fetch("data/book1/index.json").then(function(r){ return r.json(); }).then(function(ix){
    UNITS = ix.units.map(function(u){ return [u.title_ar, u.title_dv]; });
    UNITS_EN = ix.units.map(function(u){ return u.title_en; });
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
var S = {mode:null, ui:"dv", sec:"dash", pUnit:1, pLesson:0, dlg:0, review:false, unit:null, lesson:null, last:{}, tab:"read", readTab:"conv", pracTab:"fc", scope:"lesson", spTab:"qa", sp:0, spShown:false, open:{},
         cls:false, classId:null, type:"phrase", practice:null, teacher:false};
try{
  var m = localStorage.getItem("aby-mode"); if(MODES.indexOf(m) >= 0) S.mode = m;
  var lastUnit = +localStorage.getItem("aby-unit"); if(lastUnit >= 1 && lastUnit <= 16) S.unit = lastUnit;
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
var fc = null, quiz = null, match = null, arr = null;
var done = {}; try{ done = JSON.parse(localStorage.getItem("aby-done") || "{}") || {}; }catch(e){}
function markDone(sec){
  if(!S.unit || !S.lesson) return;
  var k = S.unit+"-"+S.lesson; done[k] = done[k] || {};
  if(done[k][sec]) return;
  done[k][sec] = 1; try{ localStorage.setItem("aby-done", JSON.stringify(done)); }catch(e){}
}
function isDone(sec){ var d = done[S.unit+"-"+S.lesson]; return !!(d && d[sec]); }

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
  sec:function(d){
    closeModal(); clearInterval(speedTimer); S.sec = d.s; S.cls = false;
    if(d.s === "book"){ S.lesson = null; S.review = false; }
    if(d.s === "practice"){ if(!UNIT_DATA[S.pUnit]) S.pUnit = 1; initPracticeFor(S.pUnit, S.pLesson); }
    window.scrollTo(0,0);
  },
  resume:function(){
    var u = S.unit, l = S.last[u];
    S.sec = "book";
    if(u && UNIT_DATA[u] && l){ S.review = l === "r"; S.lesson = S.review ? 1 : +l; S.tab = "read"; S.readTab = "conv"; S.dlg = 0; S.open = {}; }
    else { S.unit = null; S.lesson = null; }
    window.scrollTo(0,0);
  },
  pUnit:function(d){ S.pUnit = +d.n; S.pLesson = 0; initPracticeFor(S.pUnit, 0); },
  pLesson:function(d){ S.pLesson = +d.n; initPracticeFor(S.pUnit, S.pLesson); },
  changeLang:function(){ closeModal(); clearInterval(speedTimer); S.mode = null; try{ localStorage.removeItem("aby-mode"); }catch(e){} window.scrollTo(0,0); },
  menu:function(){ menuModal(); return false; },
  units:function(){ closeModal(); S.sec="book"; S.cls=false; S.unit=null; S.lesson=null; S.practice=null; window.scrollTo(0,0); },
  unit:function(d){ S.unit=+d.n; S.lesson=null; try{ localStorage.setItem("aby-unit", String(S.unit)); }catch(e){} window.scrollTo(0,0); },
  lessons:function(){ S.lesson=null; S.review=false; window.scrollTo(0,0); },
  lesson:function(d){
    S.review = d.n==="r"; S.lesson = S.review ? 1 : +d.n; S.dlg=0; S.tab="read"; S.readTab="conv"; S.scope="lesson"; S.open={}; S.sp=0; S.spShown=false; S.last[S.unit]=S.review ? "r" : S.lesson;
    try{ localStorage.setItem("aby-last", JSON.stringify(S.last)); }catch(e){}
    window.scrollTo(0,0);
  },
  tab:function(d){
    clearInterval(speedTimer); S.tab=d.t;
    if(d.t==="read" && S.readTab==="turn") S.readTab="conv";
    if(d.t==="practice") initPractice();
    if(d.t==="speak"){ S.sp=0; S.spShown=false; }
    if(d.t==="help") markDone("help");
    window.scrollTo(0,0);
  },
  clsOpen:function(){ closeModal(); S.cls=true; S.classId=null; S.practice=null; window.scrollTo(0,0); },
  clsBack:function(){ if(S.practice) S.practice=null; else if(S.classId) S.classId=null; else S.cls=false; },
  readTab:function(d){ S.readTab=d.t; clearInterval(speedTimer); if(d.t==="vocab") markDone("read"); if(d.t==="turn") initPractice(); },
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
  line:function(d){ S.open[d.k]=!S.open[d.k]; },
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
  if(fn(t.dataset, ev) !== false) render();
});
document.addEventListener("change", function(ev){
  if(ev.target.id === "pUnitSel"){ A.pUnit({n:ev.target.value}); render(); }
  if(ev.target.id === "pLessonSel"){ A.pLesson({n:ev.target.value}); render(); }
});
app.innerHTML = '<div class="empty">'+T("loading")+'</div>';
loadBook().then(function(){ if(S.unit && !UNIT_DATA[S.unit]) S.unit = null; render(); })
  .catch(function(){ app.innerHTML = '<div class="empty">'+T("loadFail")+'</div>'; });
