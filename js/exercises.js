/* ArabicMV — reusable exercise engines: flashcards, quiz, match, arrange, speed. */
/* "n / m" counters must read left-to-right even inside the RTL interface */
function num(a, b){ return '<span class="num">'+a+' / '+b+'</span>'; }
/* ---------- practice engines ---------- */
function startFc(items){ fc = {items:shuffle(items), i:0, flipped:false}; }
function fcHTML(){
  if(!fc || !fc.items.length) return '<div class="empty">'+T("noCards")+'</div>';
  var it = fc.items[fc.i];
  return '<button class="fc" data-a="fcFlip">'+(fc.flipped ? meaning(it)+wordForms(it) : '<span class="ar">'+esc(it.ar)+'</span><span class="hint">'+T("tapMeaning")+'</span>')+'</button>'+
    '<div class="ctrl"><button class="rb" data-a="fcPrev" aria-label="'+T("prev")+'">'+ic("fwd")+'</button><span class="count">'+num(fc.i+1, fc.items.length)+'</span><button class="rb" data-a="fcNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>';
}
function startQuiz(items){
  var pool = items.filter(function(x){ return x.ar && x.dv; });
  if(pool.length < 4){ quiz = {few:true}; return; }
  var qs = shuffle(pool).slice(0,8).map(function(it){
    var others = shuffle(pool.filter(function(x){ return x.ar !== it.ar && x.dv !== it.dv; })).slice(0,3);
    var opts = shuffle(others.concat([it]));
    return {toMeaning:Math.random() < .5, it:it, opts:opts, ans:opts.indexOf(it)};
  });
  quiz = {qs:qs, i:0, score:0, sel:null, checked:false, nudge:false};
}
/* quiz: pick an answer, then Check Answer; feedback stays until Next */
function quizHTML(){
  if(!quiz || quiz.few) return '<div class="empty">'+T("quizFew")+'</div>';
  if(quiz.i >= quiz.qs.length)
    return '<div class="card"><p style="text-align:center;margin:0">'+T("quizDone")+'</p><p class="score">'+num(quiz.score, quiz.qs.length)+'</p><div class="ctrl" style="justify-content:center"><button class="rb" data-a="quizRestart" aria-label="'+T("restart")+'">'+ic("redo")+'</button></div></div>';
  var q = quiz.qs[quiz.i], chk = quiz.checked, right = chk && quiz.sel === q.ans;
  var opts = q.opts.map(function(o,k){
    var cls = "opt"+(q.toMeaning?"":" ar");
    if(chk && k === q.ans) cls += " right"; else if(chk && k === quiz.sel) cls += " wrong"; else if(!chk && k === quiz.sel) cls += " sel";
    return '<button class="'+cls+'" role="radio" aria-checked="'+(quiz.sel===k)+'" data-a="quizPick" data-k="'+k+'"'+(chk?" disabled":"")+'><span class="radio"></span><span class="otext">'+(q.toMeaning ? meaning(o) : esc(o.ar))+'</span></button>';
  }).join("");
  return '<div class="qplain"><div class="prompt">'+(q.toMeaning ? '<span class="ar">'+esc(q.it.ar)+'</span>' : meaning(q.it))+'</div></div>'+
    '<div class="opts" role="radiogroup">'+opts+'</div>'+
    (chk ? '<div class="fb '+(right?"ok":"no")+'">'+(right ? T("correct") : T("incorrect"))+'</div><div class="ctrl" style="justify-content:flex-end"><button class="rb go" data-a="quizNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>'
         : '<p class="msg" style="color:var(--bad)">'+(quiz.nudge ? T("chooseOne") : "")+'</p><button class="btn wide" data-a="quizCheck">'+T("check")+'</button>');
}
var MATCH_COLOURS = ["#dbeafe","#fde68a","#d1fae5","#fbcfe8","#e9d5ff","#fed7aa","#cffafe","#e2e8f0"];
function startMatch(items){
  var pairs = shuffle(items).slice(0,5), idx = pairs.map(function(_,i){ return i; });
  match = {pairs:pairs, left:shuffle(idx), right:shuffle(idx), selL:null, selR:null, done:{}, wrong:null, ci:0, cur:MATCH_COLOURS[0]};
}
function matchHTML(){
  if(!match || match.pairs.length < 2) return '<div class="empty">'+T("matchFew")+'</div>';
  var all = Object.keys(match.done).length === match.pairs.length;
  function col(order, side){
    return '<div class="col">'+order.map(function(i){
      var cls = "mbtn"+(side==="L"?" ar":""), bg = "";
      if(match.done[i]){ cls += " done"; bg = match.done[i]; }
      else if(match.wrong && match.wrong[side==="L"?0:1] === i) cls += " wrong";
      else if(match["sel"+side] === i){ cls += " sel"; bg = match.cur; }
      return '<button class="'+cls+'"'+(bg ? ' style="background:'+bg+'"' : '')+' data-a="matchPick" data-side="'+side+'" data-i="'+i+'"'+(match.done[i]||match.wrong?" disabled":"")+'>'+(side==="L" ? esc(match.pairs[i].ar) : meaning(match.pairs[i]))+'</button>';
    }).join("")+'</div>';
  }
  return '<div class="match">'+col(match.left,"L")+col(match.right,"R")+'</div>'+
    '<p class="msg" style="color:var(--'+(match.wrong?"bad":"good")+')">'+(all ? T("matchAll") : match.wrong ? T("matchWrong") : T("matchHint"))+'</p>'+
    (all ? '<div class="ctrl" style="justify-content:center"><button class="rb" data-a="matchNew" aria-label="'+T("newWords")+'">'+ic("redo")+'</button></div>' : '');
}
function sentences(src){
  var seen = {}, out = [];
  function add(x){ var n = x.ar.split(" ").length; if(n >= 3 && n <= 6 && !seen[x.ar]){ seen[x.ar] = 1; out.push(x); } }
  src.conv.forEach(function(c){ c.lines.forEach(add); });
  src.speak.forEach(function(x){ add(x.q); add(x.a); });
  return out;
}
function loadArr(){
  var it = arr.list[arr.i], words = it.ar.split(" "), bank, tries = 0;
  do { bank = shuffle(words.map(function(w,k){ return {w:w, id:k}; })); tries++; }
  while(tries < 10 && bank.map(function(b){ return b.w; }).join(" ") === it.ar);
  arr.bank = bank; arr.picked = [];
}
function startArr(list){ arr = {list:shuffle(list), i:0}; if(arr.list.length) loadArr(); }
function arrHTML(){
  if(!arr || !arr.list.length) return '<div class="empty">'+T("arrNone")+'</div>';
  var it = arr.list[arr.i], full = arr.picked.length === arr.bank.length;
  function byId(id){ return arr.bank.filter(function(b){ return b.id === id; })[0]; }
  var ok = full && arr.picked.map(function(id){ return byId(id).w; }).join(" ") === it.ar;
  var slot = arr.picked.map(function(id){ return '<button class="word ar" data-a="arrBack" data-id="'+id+'"'+(ok?" disabled":"")+'>'+esc(byId(id).w)+'</button>'; }).join("");
  var bank = arr.bank.filter(function(b){ return arr.picked.indexOf(b.id) < 0; }).map(function(b){ return '<button class="word ar" data-a="arrPick" data-id="'+b.id+'">'+esc(b.w)+'</button>'; }).join("");
  return '<div class="card"><div class="count">'+T("sentence")+' '+num(arr.i+1, arr.list.length)+'</div><div class="prompt">'+meaning(it)+'</div>'+
    '<div class="slot'+(full?(ok?" good":" bad"):"")+'">'+slot+'</div><div class="bank">'+bank+'</div>'+
    '<p class="msg" style="color:var(--'+(ok?"good":full?"bad":"muted")+')">'+(full ? (ok ? T("correct") : T("arrWrong")) : T("arrHint"))+'</p></div>'+
    '<div class="ctrl"><button class="rb" data-a="arrReset" aria-label="'+T("restart")+'">'+ic("redo")+'</button><button class="rb'+(ok?" go":"")+'" data-a="arrNext" aria-label="'+T("nextSentence")+'">'+ic("chev")+'</button></div>';
}
/* ---------- arrange the letters (units whose data has letters[]: Bonus 17 only for now) ---------- */
/* a word is split into letter clusters: one base letter (hamza forms, tā' marbūṭa and alif
   maqṣūra are letters in their own right) plus the marks that follow it. Anything else —
   dagger alif, tatweel, spaces, punctuation — makes the word unsafe, and it is skipped. */
var LT_LETTER = /[\u0621-\u063A\u0641-\u064A]/, LT_MARK = /[\u064B-\u0652]/, LT_PUNCT = /[.،؟!]/g;
function ltSegs(w){
  w = String(w).normalize ? String(w).normalize("NFC") : String(w);
  var out = [];
  for(var i = 0; i < w.length; i++){
    var c = w.charAt(i);
    if(LT_LETTER.test(c)) out.push({b:c, full:c});
    else if(LT_MARK.test(c) && out.length) out[out.length-1].full += c;
    else return null;
  }
  return out;
}
function hasLetters(u){ var d = UNIT_DATA[u]; return !!(d && d.letters && d.letters.length); }
/* questions for the open lesson (or Practice picker): only words that segment safely and
   still appear, as a whole word, in the vocabulary item they came from */
function ltItems(src){
  var out = [];
  (src.letters || []).forEach(function(x){
    var segs = ltSegs(x.ar), v = src.d.vocab.filter(function(y){ return y.ar === x.src; })[0];
    if(!segs || segs.length < 3 || !v) return;
    var toks = v.ar.split(" "), at = -1;
    toks.forEach(function(t, k){ if(at < 0 && t.replace(LT_PUNCT, "") === x.ar) at = k; });
    if(at < 0) return;
    out.push({ar:x.ar, segs:segs, v:v, toks:toks, at:at});
  });
  return out;
}
function ltLoad(){
  var q = lt.list[lt.i], ids = q.segs.map(function(_, k){ return k; }), want = q.segs.map(function(s){ return s.b; }).join(""), order, tries = 0;
  do { order = shuffle(ids); tries++; }
  while(tries < 30 && order.map(function(k){ return q.segs[k].b; }).join("") === want);
  if(order.map(function(k){ return q.segs[k].b; }).join("") === want) order.push(order.shift());
  lt.order = order; lt.slots = q.segs.map(function(){ return null; }); lt.status = null;
}
function startLt(items){
  lt = {all:items, list:items, i:0, done:false, att:{}, ok:{}, miss:{}, wrong:0, hints:0};
  if(items.length) ltLoad();
}
function ltRound(items){ var keep = lt.all; startLt(items); lt.all = keep; }
function ltSolved(){ return Object.keys(lt.ok).length; }
function ltFull(){ return lt.slots.every(function(s){ return s !== null; }); }
function ltRight(){ var q = lt.list[lt.i]; return ltFull() && lt.slots.map(function(k){ return q.segs[k].b; }).join("") === q.segs.map(function(s){ return s.b; }).join(""); }
function ltHTML(){
  if(!lt || !lt.list.length) return '<div class="empty">'+T("letNone")+'</div>';
  var head = '<div class="lthead"><h3 class="ar" lang="ar">تَرْتِيبُ الْحُرُوفِ</h3><p class="ltsub">'+meaning({en:L.lettersSub[0], dv:L.lettersSub[1]})+'</p></div>';
  var n = lt.list.length, solved = ltSolved();
  if(lt.done){
    var missed = lt.list.filter(function(q){ return !lt.ok[q.ar] || lt.miss[q.ar]; }).length;
    return '<div class="card ltcard">'+head+'<p class="fb ok">'+T("letDone")+'</p><p class="score">'+num(solved, n)+'</p>'+ltStats()+
      '<div class="ltctl">'+(missed ? '<button class="btn" data-a="ltRetry">'+ic("redo")+'<span>'+T("letRetry")+' ('+missed+')</span></button>' : '')+
      '<button class="btn ghost" data-a="ltRestart">'+T("restart")+'</button></div></div>';
  }
  var q = lt.list[lt.i], ok = lt.status === "ok";
  var used = {}; lt.slots.forEach(function(k){ if(k !== null) used[k] = 1; });
  var phrase = q.toks.length > 1 ? '<div class="ltsrc ar" lang="ar">'+q.toks.map(function(t, k){
      return k === q.at ? (ok ? '<b>'+esc(t)+'</b>' : '<span class="ltgap" aria-hidden="true"></span>'+esc(t.replace(q.ar, ""))) : esc(t);
    }).join(" ")+'</div>' : '';
  var slots = lt.slots.map(function(k, p){
    var f = k !== null;
    return '<button class="ltslot'+(f?" on":"")+'" data-a="ltSlot" data-i="'+p+'" data-slot="'+p+'"'+(f && !ok ? ' draggable="true" data-drag="s'+p+'"' : '')+
      ' aria-label="'+(f ? T("letRemove")+' '+q.segs[k].b : T("letBox")+' '+(p+1))+'"'+(ok?" disabled":"")+'>'+(f ? esc(q.segs[k].b) : '')+'</button>';
  }).join("");
  var tiles = lt.order.map(function(k){
    var u = !!used[k];
    return '<button class="lttile'+(u?" used":"")+'" data-a="ltPick" data-id="'+k+'"'+(u || ok ? ' disabled' : ' draggable="true" data-drag="t'+k+'"')+'>'+esc(q.segs[k].b)+'</button>';
  }).join("");
  var fb = ok ? '<div class="fb ok" role="status">'+T("letGood")+'</div><div class="ltans ar" lang="ar">'+esc(q.ar)+'</div><div class="tr">'+meaning(q.v)+'</div>'
    : lt.status === "no" ? '<div class="fb no" role="status">'+T("letWrong")+'</div>'
    : lt.status === "fill" ? '<p class="msg" role="status" style="color:var(--bad)">'+T("letFill")+'</p>'
    : '<p class="msg">'+T("letTap")+'</p>';
  return '<div class="card ltcard">'+head+
    '<div class="ltbar"><span class="count">'+T("question")+' '+num(lt.i+1, n)+'</span><span class="count">'+T("letScore")+' '+num(solved, n)+'</span></div>'+
    '<div class="prog" aria-hidden="true"><i style="width:'+(solved/n*100)+'%"></i></div>'+
    '<div class="ltq">'+(ok ? '' : meaning(q.v))+phrase+'</div>'+
    '<div class="ltscr ar" dir="rtl" lang="ar" aria-label="'+T("letScrambled")+'">'+lt.order.map(function(k){ return '<span>'+esc(q.segs[k].b)+'</span>'; }).join("")+'</div>'+
    '<div class="ltslots'+(ok?" ok":lt.status==="no"?" no":"")+'" dir="rtl" role="group" aria-label="'+T("letAnswer")+'">'+slots+'</div>'+
    '<div class="lttiles" dir="rtl" role="group" data-slot="bank" aria-label="'+T("letTiles")+'">'+tiles+'</div>'+fb+
    '<div class="ltctl">'+(ok ? '' : '<button class="btn" data-a="ltCheck">'+T("check")+'</button><button class="btn ghost" data-a="ltHint">'+T("letHint")+'</button><button class="btn ghost" data-a="ltReset">'+T("letReset")+'</button>')+
    '<button class="btn '+(ok?"":"ghost")+'" data-a="ltNext">'+T("letNext")+ic("chev")+'</button></div>'+ltStats()+'</div>';
}
function ltStats(){
  return '<dl class="ltstats"><div><dt>'+T("letAttempted")+'</dt><dd>'+Object.keys(lt.att).length+'</dd></div><div><dt>'+T("correct")+'</dt><dd>'+ltSolved()+'</dd></div><div><dt>'+T("letWrongN")+'</dt><dd>'+lt.wrong+'</dd></div></dl>';
}
var speed = null, speedTimer = null;
function startSpeed(items){
  clearInterval(speedTimer);
  var pool = items.filter(function(x){ return x.ar && x.dv; });
  if(pool.length < 4){ speed = {few:true}; return; }
  speed = {pool:pool, order:shuffle(pool), left:45, score:0, total:0, q:null, over:false, started:false};
  speedQ();
}
/* each word is asked once; the deck is reshuffled only when every word has been used */
function speedQ(){
  if(!speed.order.length) speed.order = shuffle(speed.pool.filter(function(x){ return !speed.q || x.ar !== speed.q.it.ar; }));
  var it = speed.order.pop();
  var others = shuffle(speed.pool.filter(function(x){ return x.ar !== it.ar && x.dv !== it.dv; })).slice(0,3);
  var opts = shuffle(others.concat([it]));
  speed.q = {it:it, opts:opts, ans:opts.indexOf(it), picked:null};
}
function speedTick(){
  if(!speed || speed.over) return;
  speed.left--;
  var el = document.getElementById("spdLeft"); if(el) el.textContent = speed.left;
  var bar = document.getElementById("spdBar"); if(bar) bar.style.width = (speed.left/45*100)+"%";
  if(speed.left <= 0){ speed.over = true; clearInterval(speedTimer); render(); }
}
function speedHTML(){
  if(!speed || speed.few) return '<div class="empty">'+T("speedFew")+'</div>';
  if(speed.over) return '<div class="card"><p style="text-align:center;margin:0">'+T("timeUp")+'</p><p class="score">'+num(speed.score, speed.total)+'</p><div class="ctrl" style="justify-content:center"><button class="rb go" data-a="speedNew" aria-label="'+T("playAgain")+'">'+ic("redo")+'</button></div></div>';
  if(!speed.started) return '<div class="card" style="text-align:center"><p style="margin:0 0 10px">'+T("speedIntro")+'</p><button class="btn wide" data-a="speedGo">'+T("start")+'</button></div>';
  var q = speed.q, done = q.picked !== null;
  return '<div class="qcard"><div class="clabel"><span>'+num(speed.score, speed.total)+'</span><span class="count"><b id="spdLeft">'+speed.left+'</b> '+T("sec")+'</span></div>'+
    '<div class="prog" style="margin:6px 0 10px"><i id="spdBar" style="width:'+(speed.left/45*100)+'%"></i></div>'+
    '<div class="prompt"><span class="ar">'+esc(q.it.ar)+'</span></div></div><div class="opts">'+q.opts.map(function(o,k){
      var cls = "opt"; if(done && k === q.ans) cls += " right"; else if(done && k === q.picked) cls += " wrong";
      return '<button class="'+cls+'" data-a="speedPick" data-k="'+k+'"'+(done?" disabled":"")+'><span class="otext">'+meaning(o)+'</span></button>'; }).join("")+'</div>';
}
/* which words/sentences an exercise draws from: the open lesson, or the Practice picker */
function practiceSource(){
  if(S.sec === "practice"){
    var d = UNIT_DATA[S.pUnit]; if(!d) return null;
    var f = function(a){ return S.pLesson ? a.filter(function(x){ return x.lesson === S.pLesson; }) : a; };
    return {d:d, vocab:f(d.vocab), conv:f(d.conv), speak:f(d.speak), letters:f(d.letters || [])};
  }
  var d2 = UNIT_DATA[S.unit]; if(!d2) return null;
  return {d:d2, vocab:inLesson(d2.vocab), conv:inLesson(d2.conv), speak:inLesson(d2.speak), letters:inLesson(d2.letters || [])};
}
function practiceUnit(){ return S.sec === "practice" ? S.pUnit : S.unit; }
function initPracticeFor(u, l){ S.pUnit = u; S.pLesson = l; initPractice(); }
function initPractice(){
  clearInterval(speedTimer);
  var src = practiceSource(); if(!src) return;
  var d = src.d, v = src.vocab;
  if(S.pracTab === "letters" && !hasLetters(practiceUnit())) S.pracTab = "fc";
  if(S.pracTab === "fc") startFc(v); else if(S.pracTab === "quiz") startQuiz(v);
  else if(S.pracTab === "match") startMatch(v); else if(S.pracTab === "speed") startSpeed(v);
  else if(S.pracTab === "letters") startLt(ltItems(src)); else startArr(sentences(src));
}
