/* ArabicMV — reusable exercise engines: flashcards, quiz, match, arrange, speed. */
/* ---------- practice engines ---------- */
function startFc(items){ fc = {items:shuffle(items), i:0, flipped:false}; }
function fcHTML(){
  if(!fc || !fc.items.length) return '<div class="empty">'+T("noCards")+'</div>';
  var it = fc.items[fc.i];
  return '<button class="fc" data-a="fcFlip">'+(fc.flipped ? meaning(it)+wordForms(it) : '<span class="ar">'+esc(it.ar)+'</span><span class="hint">'+T("tapMeaning")+'</span>')+'</button>'+
    '<div class="ctrl"><button class="rb" data-a="fcPrev" aria-label="'+T("prev")+'">'+ic("fwd")+'</button><span class="count">'+(fc.i+1)+' / '+fc.items.length+'</span><button class="rb" data-a="fcNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>';
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
    return '<div class="card"><p style="text-align:center;margin:0">'+T("quizDone")+'</p><p class="score">'+quiz.score+' / '+quiz.qs.length+'</p><div class="ctrl" style="justify-content:center"><button class="rb" data-a="quizRestart" aria-label="'+T("restart")+'">'+ic("redo")+'</button></div></div>';
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
  return '<div class="card"><div class="count">'+T("sentence")+' '+(arr.i+1)+' / '+arr.list.length+'</div><div class="prompt">'+meaning(it)+'</div>'+
    '<div class="slot'+(full?(ok?" good":" bad"):"")+'">'+slot+'</div><div class="bank">'+bank+'</div>'+
    '<p class="msg" style="color:var(--'+(ok?"good":full?"bad":"muted")+')">'+(full ? (ok ? T("correct") : T("arrWrong")) : T("arrHint"))+'</p></div>'+
    '<div class="ctrl"><button class="rb" data-a="arrReset" aria-label="'+T("restart")+'">'+ic("redo")+'</button><button class="rb'+(ok?" go":"")+'" data-a="arrNext" aria-label="'+T("nextSentence")+'">'+ic("chev")+'</button></div>';
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
  if(speed.over) return '<div class="card"><p style="text-align:center;margin:0">'+T("timeUp")+'</p><p class="score">'+speed.score+' / '+speed.total+'</p><div class="ctrl" style="justify-content:center"><button class="rb go" data-a="speedNew" aria-label="'+T("playAgain")+'">'+ic("redo")+'</button></div></div>';
  if(!speed.started) return '<div class="card" style="text-align:center"><p style="margin:0 0 10px">'+T("speedIntro")+'</p><button class="btn wide" data-a="speedGo">'+T("start")+'</button></div>';
  var q = speed.q, done = q.picked !== null;
  return '<div class="qcard"><div class="clabel"><span>'+speed.score+' / '+speed.total+'</span><span class="count"><b id="spdLeft">'+speed.left+'</b> '+T("sec")+'</span></div>'+
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
    return {d:d, vocab:f(d.vocab), conv:f(d.conv), speak:f(d.speak)};
  }
  var d2 = UNIT_DATA[S.unit]; if(!d2) return null;
  return {d:d2, vocab:inLesson(d2.vocab), conv:inLesson(d2.conv), speak:inLesson(d2.speak)};
}
function initPracticeFor(u, l){ S.pUnit = u; S.pLesson = l; initPractice(); }
function initPractice(){
  clearInterval(speedTimer);
  var src = practiceSource(); if(!src) return;
  var d = src.d, v = src.vocab;
  if(S.pracTab === "fc") startFc(v); else if(S.pracTab === "quiz") startQuiz(v);
  else if(S.pracTab === "match") startMatch(v); else if(S.pracTab === "speed") startSpeed(v); else startArr(sentences(src));
}
