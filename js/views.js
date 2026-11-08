/* ArabicMV — screens. Each function returns HTML for one view. */
/* ---------- views ---------- */
/* main navigation: Home, Lessons, Practice, My progress (Reference is in the menu) */
function SECTIONS(){ return [["home",T("navHome"),"dash",T("navDash")],["book",T("lessons"),"read",T("lessons")],["practice",T("secPractice"),"practice",T("navPractice")],["progress",T("secProgress"),"progress",T("navProgress")]]; }
function secTitle(s){ var m = SECTIONS().filter(function(x){ return x[0] === s; })[0]; return m ? m[1] : s === "ref" ? T("secRef") : ""; }
/* four lesson activities, open in any order. Grammar is inside Practise; its saved-progress key stays "help" */
function LESSON_TABS(){ return [["read",T("read")],["practice",T("practise")],["listen",T("listening")],["speak",T("speak")]]; }
/* Practise counts as done when both of its saved parts are: exercises ("practice") and grammar ("help") */
function tabDone(t){ return t === "practice" ? isDone("practice") && isDone("help") : isDone(t); }
function TYPESL(){ return TYPES.map(function(t){ return [t[0], T(t[0])]; }); }
function bar(back, small, title, isAr){
  return '<div class="hdr">'+(back ? '<button class="ib" data-a="'+back+'" aria-label="'+T("back")+'">'+ic("back")+'</button>' : '<span class="ib"></span>')+'<div class="hc">'+
    (small ? '<div class="hs ar">'+small+'</div>' : '')+'<div class="ht'+(isAr?" ar":"")+'">'+title+'</div></div>'+
    '<button class="ib" data-a="menu" aria-label="'+T("menu")+'">'+ic("more")+'</button></div>';
}
function inLessonView(){ return S.sec === "book" && S.unit && S.lesson && !S.cls; }
function renderChrome(){
  var h;
  if(!S.mode) h = "";
  else if(S.cls){
    var c = store.classes.filter(function(x){ return x.id === S.classId; })[0];
    h = bar("clsBack", "", c ? esc(c.name) : T("yourClass"), false);
  }
  else if(S.sec === "home") h = "";
  else if(S.sec === "ref") h = bar("home", "", T("secRef"), false);
  else if(S.sec === "book" && !S.unit) h = bar("", "", T("lessons"), false);
  else if(S.sec === "book" && S.unit && !S.lesson) h = bar("units", "", T("lessons"), false);
  else if(inLessonView()) h = '<div class="hdr"><button class="ib" data-a="lessons" aria-label="'+T("back")+'">'+ic("back")+'</button>'+
    '<div class="hc"><div class="hl" dir="rtl">'+unitKind(S.unit)+' ('+arNum(S.unit)+')<span class="hmid"> - '+UNITS[S.unit-1][0]+'</span> - '+(S.review ? "مراجعة" : "الدرس ("+arNum(UNIT_DATA[S.unit].lessons[S.lesson-1].num || S.lesson)+")")+'</div></div>'+
    '<button class="ib" data-a="menu" aria-label="'+T("menu")+'">'+ic("more")+'</button></div>';
  else h = bar("", "", secTitle(S.sec), false);
  document.getElementById("hdr").innerHTML = h;
  /* every screen after the language choice has the navigation, the homepage included */
  var show = !!S.mode;
  function navBtns(short){ return SECTIONS().map(function(n){
    return '<button class="'+(S.sec===n[0]?"on":"")+'" data-a="sec" data-s="'+n[0]+'"'+(S.sec===n[0]?' aria-current="page"':'')+' aria-label="'+n[1]+'">'+ic(n[2])+'<span>'+(short ? n[3] : n[1])+'</span></button>'; }).join(""); }
  var navs = navBtns(true), sideNavs = navBtns(false);
  var nav = document.getElementById("nav"), side = document.getElementById("side");
  nav.hidden = !show; side.hidden = !show; document.body.classList.toggle("has-nav", show);
  nav.innerHTML = navs;
  side.innerHTML = '<button class="brand" data-a="home" aria-label="'+T("home")+'"><span class="blogo">'+ic("read")+'</span><span class="bname">ArabicMV</span></button><div class="snav">'+sideNavs+'</div>'+
    '<div class="sfoot"><span class="avatar">'+ic("user")+'</span><span>'+T("guest")+'</span></div>';
}
function lessonTabs(){
  return '<div class="ltabs">'+LESSON_TABS().map(function(t){
    var dn = !S.review && tabDone(t[0]);
    return '<button class="'+(S.tab===t[0]?"on":"")+'" data-a="tab" data-t="'+t[0]+'">'+t[1]+(dn ? '<span class="td" aria-hidden="true"></span>' : '')+'</button>';
  }).join("")+'</div>';
}
/* guided flow: one quiet call-to-action at the end of each lesson tab */
function flowHTML(){
  var d = UNIT_DATA[S.unit];
  function btn(action, extra, label){ return '<button class="flow" data-a="'+action+'"'+extra+'><span>'+label+'</span>'+ic("chev")+'</button>'; }
  if(S.tab === "read") return btn("tab", ' data-t="practice"', T("next")+': '+T("practise"));
  if(S.tab === "practice") return btn("tab", ' data-t="listen"', T("next")+': '+T("listening"));
  if(S.tab === "listen") return btn("tab", ' data-t="speak"', T("next")+': '+T("speak"));
  if(S.review) return btn("lessons", '', T("allLessons"));
  return btn("nextLesson", '', S.lesson < d.lessons.length ? T("nextLessonL") : T("reviewUnit"));
}
function welcomeHTML(){
  function opt(m, lab, sub){ return '<button class="wopt" data-a="setMode" data-m="'+m+'"><span class="wl">'+lab+'</span><span class="ws">'+sub+'</span></button>'; }
  return '<div class="welcome"><div class="wlogo">'+ic("read")+'</div><div class="wtitle ar">العربية بين يديك</div><h1 class="wh">Learn Arabic with Fun</h1>'+
    '<p class="wsub">Choose how you want to learn · ދަސްކުރަން ބޭނުންވާ ގޮތް ޚިޔާރުކުރޭ</p>'+
    opt("en","Arabic + English","English interface and translations")+
    opt("dv","Arabic + Dhivehi","ދިވެހި އިންޓަރފޭސް އަދި ތަރުޖަމާ")+
    opt("both","Arabic + English + Dhivehi","ދިވެހި އިންޓަރފޭސް، އިނގިރޭސި އަދި ދިވެހި ތަރުޖަމާ")+
    '<p class="wnote">You can change this later from the menu · ފަހުން މެނޫއިން ބަދަލުކުރެވޭނެ</p></div>';
}
/* the lesson to continue: the most recently opened one (aby-recent), else the last lesson of the last unit */
function lastLesson(){
  var r = recent.filter(function(x){ return UNIT_DATA[x.u]; })[0];
  if(r) return r;
  var u = S.lastUnit, l = u && S.last[u];
  return u && UNIT_DATA[u] && l ? {u:u, l:l} : null;
}
/* homepage: welcome, continue, explore lessons, quick practice, recent progress */
function homeHTML(){
  var last = lastLesson(), st = dashStats();
  var h = '<div class="hwel"><button class="ib hmenu" data-a="menu" aria-label="'+T("menu")+'">'+ic("more")+'</button>'+
    '<h1 class="lpname">ArabicMV</h1><p class="lptag">Your Arabic Practice Companion</p><p class="lpsub">Practise Arabic. Every day.</p></div>';
  /* B. continue learning, or where to begin */
  h += last
    ? '<button class="ccard" data-a="goRecent" data-u="'+last.u+'" data-l="'+last.l+'"><span class="cbody"><span class="ck">'+T("continueL")+' · '+T("book1")+'</span><span class="cv ar">'+UNITS[last.u-1][0]+'</span><span class="cs">'+unitName(last.u)+' · '+lessonLabel(last.u, last.l)+'</span></span><span class="cbtn">'+T("cont")+'</span></button>'
    : '<div class="cempty"><p>'+T("chooseLesson")+'</p><button class="btn" data-a="sec" data-s="book">'+T("lessons")+'</button></div>';
  /* C. explore lessons: Book 1 and a shortcut to every unit; later books are only announced */
  h += '<h2>'+T("lessons")+'</h2><div class="books">'+
    '<button class="hcard" data-a="sec" data-s="book"><span class="hic">'+ic("bookOpen")+'</span><span class="hlab">'+T("book1")+'<span class="hsub">'+st.unitsReady+' '+T("unitsN")+' · '+st.lessonsTotal+' '+T("lessonsN")+'</span></span><span class="hgo">'+ic("chev")+'</span></button>'+
    [2,3].map(function(n){ return '<div class="hcard off" aria-disabled="true"><span class="hic">'+ic("bookOpen")+'</span><span class="hlab">'+T("bookN")+' '+n+'</span><span class="hsoon">'+T("soon")+'</span></div>'; }).join("")+'</div>'+
    '<div class="ugrid">'+Object.keys(UNIT_DATA).map(function(k){
      return '<button class="utile" data-a="openUnit" data-n="'+k+'" aria-label="'+unitName(+k)+' · '+esc(UNITS[k-1][0])+'" title="'+esc(UNITS[k-1][0])+'">'+k+(isBonus(+k) ? '<small>'+T("bonus")+'</small>' : '')+'</button>'; }).join("")+'</div>';
  /* D. quick practice */
  h += '<h2>'+T("quickPractice")+'</h2><div class="pgrid">'+
    '<button class="pbtn" data-a="dashLesson" data-t="listen">'+ic("ear")+'<span>'+T("listening")+'</span></button>'+
    '<button class="pbtn" data-a="dashLesson" data-t="speak">'+ic("speak")+'<span>'+T("speak")+'</span></button>'+
    '<button class="pbtn" data-a="dashPractice" data-t="fc">'+ic("practice")+'<span>'+T("exercises")+'</span></button></div>';
  /* E. recent progress */
  var rec = recent.filter(function(r){ return UNIT_DATA[r.u]; }).slice(0, 3);
  if(rec.length)
    h += '<h2>'+T("recentProgress")+'</h2><div class="rlist">'+rec.map(recentCard).join("")+'</div>'+
      '<p class="sub">'+activityTotals().acts+' '+T("activitiesDone")+' · <button class="lnk" data-a="sec" data-s="progress">'+T("secProgress")+'</button></p>';
  return h+'<p class="credit">Developed by Ahmed Ahsan</p>';
}
/* fully completed lessons in a unit (all four section flags set) */
function lessonsDoneIn(u){
  var d = UNIT_DATA[u], n = 0;
  if(!d) return 0;
  d.lessons.forEach(function(_,i){ var dk = done[u+"-"+(i+1)]; if(dk && dk.read && dk.practice && dk.speak && dk.help) n++; });
  return n;
}
/* the four lesson activities and whether each is done, read from the saved aby-done flags.
   Lesson completion (the tick and unit progress) stays defined by the original four
   flags (read, practice, speak, help) so earlier progress keeps its meaning. */
function actsOf(u, l){
  var dk = done[u+"-"+l] || {};
  return [["read",T("read"),!!dk.read],["practice",T("practise"),!!(dk.practice && dk.help)],["listen",T("listening"),!!dk.listen],["speak",T("speak"),!!dk.speak]];
}
function actsHTML(u, l){
  if(l === "r") return "";
  return '<span class="acts">'+actsOf(u, l).map(function(a){ return '<span class="act'+(a[2]?" on":"")+'">'+(a[2] ? ic("check") : '')+a[1]+'</span>'; }).join("")+'</span>';
}
function startHTML(){
  return '<div class="hero"><div class="hk">'+T("book1")+'</div><div class="hn ar">العَرَبِيَّةُ بَيْنَ يَدَيْكَ – الْكِتَابُ الْأَوَّلُ</div></div><ul class="ulist">'+UNITS.map(function(u,i){
    var n = i+1, d = UNIT_DATA[n];
    if(!d) return '<li><button class="ucard off" disabled>'+
      '<span class="thumb ar">'+arNum(n)+'</span><span class="ut"><span class="uk ar">الوحدة '+arNum(n)+'</span><span class="un ar">'+u[0]+'</span><span class="ud">'+esc(unitSub(i))+' · '+T("notReady")+'</span></span></button></li>';
    var total = d.lessons.length, dn = lessonsDoneIn(n);
    var sub = total+' '+T("lessonsN")+' · '+d.vocab.length+' '+T("wordsN");
    return '<li><button class="ucard" data-a="unit" data-n="'+n+'">'+
      '<span class="thumb ar">'+arNum(n)+'</span><span class="ut"><span class="uk ar">'+unitKind(n)+' '+arNum(n)+'</span><span class="un ar">'+u[0]+'</span><span class="ud">'+(isBonus(n) ? esc(T("bonusTag"))+' · ' : '')+esc(unitSub(i))+' · '+sub+'</span><span class="pbar upbar"><i style="width:'+(total ? Math.round(dn/total*100) : 0)+'%"></i></span></span>'+
      '<span class="uend">'+ic("chev")+'</span></button></li>';
  }).join("")+'</ul>';
}
function lessonsHTML(){
  var d = UNIT_DATA[S.unit], u = UNITS[S.unit-1];
  var hero = '<div class="hero"><div class="hk ar">'+unitKind(S.unit)+' ('+arNum(S.unit)+')</div><div class="hn ar">'+u[0]+'</div>'+(isBonus(S.unit) ? '<div class="sub">'+esc(T("bonusTag"))+'</div>' : '')+'</div>';
  if(!d) return hero+notReady();
  function meta(words, dl){ return '<span class="ud">'+words+' '+T("wordsN")+' · '+dl+' '+T("dialoguesN")+' · '+T("approx")+' '+(8 + Math.round(words/3))+' '+T("min")+'</span>'; }
  var review = '<button class="lcard'+(S.last[S.unit]==="r"?" cur":"")+'" data-a="lesson" data-n="r"><span class="lk ar">'+ic("redo")+'</span>'+
    '<span class="ut"><span class="un" style="font-size:1.1rem;font-weight:700">'+T("reviewUnit")+'</span>'+meta(d.vocab.length, d.conv.length)+'</span><span class="uend">'+ic("chev")+'</span></button>';
  return hero+'<div class="llist">'+d.lessons.map(function(l,i){
    var k = i+1, words = d.vocab.filter(function(v){ return v.lesson===k; }).length, dl = d.conv.filter(function(c){ return c.lesson===k; }).length;
    var dk = done[S.unit+"-"+k], all = dk && dk.read && dk.practice && dk.speak && dk.help;
    return '<button class="lcard'+(S.last[S.unit]===k?" cur":"")+'" data-a="lesson" data-n="'+k+'"><span class="lk ar'+(all?" ok":"")+'">'+(all ? ic("check") : arNum(l.num || k))+'</span>'+
      '<span class="ut"><span class="un ar">'+esc(l.ar)+'</span>'+meta(words, dl)+actsHTML(S.unit, k)+'</span><span class="uend">'+ic("chev")+'</span></button>';
  }).join("")+review+'</div>';
}
function convBlock(c, ci, n, total){
  /* the dialogue itself is Arabic, so its lines always run right-to-left, whatever the interface language */
  return '<section class="conv"><div class="chead"><b>'+T("dialogue")+' '+n+'</b>'+
    (total > 1 ? '<span class="count">'+num(n, total)+'</span><button class="ib" data-a="dlgPrev" aria-label="'+T("prevDialogue")+'">'+ic("fwd")+'</button><button class="ib" data-a="dlgNext" aria-label="'+T("nextDialogue")+'">'+ic("chev")+'</button>' : '')+'</div>'+
    '<div class="lines" dir="rtl">'+c.lines.map(function(l,li){
    var k = "c"+ci+"-"+li, on = !!S.open[k];
    return '<button class="line'+(on?" on":"")+'" data-a="line" data-k="'+k+'" aria-expanded="'+on+'"><span class="who ar">'+esc(l.who)+'</span><span class="say ar">'+esc(l.ar)+'</span><svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+ICONS.chev+'</svg>'+
      (on ? '<span class="tr">'+meaning(l)+'</span>' : '')+'</button>';
  }).join("")+'</div></section>';
}
function wordForms(v){
  var f = [];
  if(v.pl) f.push('<span>'+T("plural")+': <span class="ar">'+esc(v.pl)+'</span></span>');
  if(v.present) f.push('<span>'+T("present")+': <span class="ar">'+esc(v.present)+'</span></span>');
  if(v.command) f.push('<span>'+T("command")+': <span class="ar">'+esc(v.command)+'</span></span>');
  if(v.fem) f.push('<span>'+T("toWoman")+': <span class="ar">'+esc(v.fem)+'</span></span>');
  return f.length ? '<span class="forms">'+f.join("")+'</span>' : "";
}
function noteHTML(g, k){
  var on = !!S.open[k];
  return '<article class="note"><button class="nhead" data-a="line" data-k="'+k+'" aria-expanded="'+on+'"><span>'+esc(gTitle(g))+'</span>'+ic("chev")+'</button>'+
    (on ? '<div class="nbody"><p>'+esc(gBody(g))+'</p>'+g.ex.map(function(e){ return '<div class="ex"><span class="ar">'+esc(e.ar)+'</span><span class="tr">'+meaning(e)+'</span></div>'; }).join("")+'</div>' : '')+'</article>';
}
function readHTML(){
  var d = UNIT_DATA[S.unit], n = 0;
  var h = seg([["conv",T("dialogue")],["vocab",T("vocab")]], S.readTab, "readTab");
  if(S.readTab === "conv"){
    var idx = []; d.conv.forEach(function(c,ci){ if(S.review || c.lesson === S.lesson) idx.push(ci); });
    if(!idx.length) return h+'<div class="empty">'+T("noDialogue")+'</div>';
    S.dlg = ((S.dlg % idx.length) + idx.length) % idx.length; n = S.dlg;
    return h+convBlock(d.conv[idx[n]], idx[n], n+1, idx.length);
  }
  return h+'<ul class="vlist">'+d.vocab.map(function(v,i){
    if(!S.review && v.lesson !== S.lesson) return "";
    var k = "v"+i, on = !!S.open[k];
    return '<li class="vli"><button class="vcard'+(on?" on":"")+'" data-a="line" data-k="'+k+'" aria-expanded="'+on+'"><span class="ar">'+esc(v.ar)+'</span>'+(on ? '<span class="tr">'+meaning(v)+'</span>'+wordForms(v) : '<span class="vhint" aria-hidden="true">'+ic("eye")+'</span>')+'</button>'+vStarBtn(S.unit, v.lesson, v.ar)+'</li>';
  }).join("")+'</ul>';
}
function practiceHTML(){
  if(S.sec === "practice" && !UNIT_DATA[S.pUnit]) return "";
  var inLsn = inLessonView();
  var tl = (inLsn ? [["gram",T("grammar")]] : []).concat([["fc",T("cards")],["quiz",T("quiz")],["match",T("match")],["arr",T("arrange")],["speed",T("speed")]]);
  if(hasLetters(practiceUnit())) tl.push(["letters",T("letters")]);
  if(S.pracTab === "gram" && !inLsn){ S.pracTab = "fc"; initPractice(); }
  if(S.pracTab === "letters" && !hasLetters(practiceUnit())) initPractice();
  var tabs = seg(tl, S.pracTab, "pracTab");
  var cnt = (S.pracTab==="quiz" && quiz && quiz.qs && quiz.i < quiz.qs.length) ? '<span class="count tcount">'+T("question")+' '+num(quiz.i+1, quiz.qs.length)+'</span>' : '';
  tabs = tabs.replace('</div>', cnt+'</div>');
  if(!S.review && S.sec !== "practice" && S.pracTab !== "gram") tabs = '<div class="segrow">'+tabs+'<button class="fbtn'+(S.scope==="unit"?" on":"")+'" data-a="scopeToggle" aria-pressed="'+(S.scope==="unit")+'" aria-label="'+T("scope")+'" title="'+(S.scope==="unit" ? T("wholeUnit") : T("thisLesson"))+'">'+ic("filter")+'</button></div>';
  return tabs+
    (S.pracTab==="gram" ? helpHTML() : S.pracTab==="fc" ? fcHTML() : S.pracTab==="quiz" ? quizHTML() : S.pracTab==="match" ? matchHTML() : S.pracTab==="speed" ? speedHTML() : S.pracTab==="letters" ? ltHTML() : arrHTML());
}
/* ---------- listening (comprehension over the existing speak[] Q/A pairs) ---------- */
/* questions of the current lesson (or whole unit in review), with their
   absolute index in the unit's speak array */
function liList(){
  var d = UNIT_DATA[S.unit], out = [];
  if(!d) return out;
  d.speak.forEach(function(s, i){ if(S.review || s.lesson === S.lesson) out.push({s:s, i:i}); });
  return out;
}
/* Distractors come only from the same unit's existing answers, by default from
   other lessons ((i+3) and (i+6) mod 9). Six questions were audited as ambiguous
   under that default — a distractor could genuinely answer them — and use these
   hand-checked replacements instead (absolute speak[] indices):
     3:5 هل تريد مشاهدة الشقة   — "لا، شكرا" is also a valid answer
     3:8 هل تريد شيئا آخر       — the "أريد..." answers are also valid
     4:1 هل تنام بعد الصلاة     — the other "لا..." answer reads as valid
     4:6 ماذا تفعل في الصباح    — "أستيقظ عند الفجر" is also a valid answer
     8:0 ماذا تعمل              — "أنا مدرس" is also a valid answer
     8:6 ما مهنتك               — "أعمل مدرسا" is also a valid answer */
var LI_DX = {"3:5":[1,2], "3:8":[2,4], "4:1":[4,6], "4:6":[5,7], "8:0":[5,7], "8:6":[5,7]};
/* three stable answer options (absolute indices): the real answer plus two
   distractors, rotated by question index so the correct position varies but
   never moves between re-renders */
function liOpts(qi){
  var pool = UNIT_DATA[S.unit].speak, n = pool.length;
  var dx = LI_DX[S.unit + ":" + qi] || [(qi + 3) % n, (qi + 6) % n];
  var opts = [qi], seen = {}; seen[qi] = 1;
  dx.forEach(function(i){ if(!seen[i] && pool[i]){ seen[i] = 1; opts.push(i); } });
  for(var r = 0; r < (qi % opts.length); r++) opts.push(opts.shift());
  return opts;
}
function listenHTML(){
  var list = liList(), n = list.length;
  if(!n) return '<div class="empty">'+T("noQuestions")+'</div>';
  S.li = ((S.li % n) + n) % n;
  var it = list[S.li], st = S.liA[S.unit + ":" + it.i] || 0, opts = liOpts(it.i);
  var pool = UNIT_DATA[S.unit].speak, hasQ = !!audioUrl(S.unit, it.i, "q");
  var h = '<div class="card"><div class="clabel"><span>'+T("listening")+'</span><span class="count">'+num(S.li+1, n)+'</span></div>'+
    /* with a current recording the question is audio-first (text hidden until the
       student asks for it or has answered); without one — audio off, not generated
       yet, or failed to play — this stays the honest coming-soon notice and the
       question text is shown */
    (hasQ ? '<div class="audioRow">'+audBtn(S.unit, it.i, "q")+'<span class="ast" aria-live="polite"></span></div>'
          : audErrHTML(S.unit, it.i, "q") || '<div class="audioStub"><span class="asBtn" aria-hidden="true">'+ic("ear")+'</span><span>'+T("audioSoon")+'</span></div>')+
    (!hasQ || S.liText || st
      ? '<div class="prompt" style="margin:6px 0 10px"><span class="ar">'+esc(it.s.q.ar)+'</span></div>'
      : '<div class="row" style="justify-content:center;margin:6px 0 10px"><button class="btn ghost small" data-a="liText">'+ic("eye")+'<span>'+T("showQuestion")+'</span></button></div>')+
    (st ? '' : '<p class="sub" style="text-align:center;margin:0 0 10px">'+T("chooseAnswer")+'</p>')+
    '<div class="opts">'+opts.map(function(o){
      var cls = st && o === it.i ? " right" : (!st && S.liWrong === o ? " wrong" : "");
      return '<button class="opt ar'+cls+'" data-a="liPick" data-i="'+o+'"><span class="radio"></span><span class="otext">'+esc(pool[o].a.ar)+'</span></button>';
    }).join("")+'</div>'+
    (st === 1 ? '<p class="fb ok">'+T("correct")+'</p>' : '')+
    (!st && S.liWrong !== null ? '<p class="fb no">'+T("wrongTry")+'</p>' : '')+
    (st ? '' : '<button class="btn wide reveal ghost" data-a="liReveal">'+ic("eye")+'<span>'+T("showAnswer")+'</span></button>')+
    '</div>'+
    (st ? '<div class="model"><div class="count">'+T("modelAnswer")+'</div><span class="ar">'+esc(it.s.a.ar)+'</span>'+audBtn(S.unit, it.i, "a")+'<span class="tr">'+meaning(it.s.a)+'</span></div>' : '')+
    '<div class="ctrl"><button class="rb" data-a="liPrev" aria-label="'+T("prev")+'">'+ic("fwd")+'</button><button class="rb'+(st?" go":"")+'" data-a="liNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>';
  if(list.every(function(x){ return S.liA[S.unit + ":" + x.i]; }))
    h += '<p class="fb ok" style="margin-top:12px">'+T("listenDone")+'</p>';
  return h;
}
/* play button for one speak[] question or answer; empty while it has no current recording */
function audBtn(u, si, part){
  if(!audioUrl(u, si, part)) return audErrHTML(u, si, part);
  var k = audioKey(u, si, part);
  return '<button class="abtn" data-a="aud" data-k="'+k+'" aria-pressed="false" aria-label="'+T("audPlay")+'">'+ICON_PLAY+'</button>';
}
function audErrHTML(u, si, part){ return AUDIO_READY && AUD.bad[audioKey(u, si, part)] ? '<p class="aerr" role="status">'+T("audErr")+'</p>' : ''; }
function sayList(d){ var out = []; ofLesson(d.speak).forEach(function(x){ out.push(x.q); out.push(x.a); }); return out; }
function spCount(){ var d = UNIT_DATA[S.unit]; return S.spTab==="say" ? sayList(d).length : ofLesson(d.speak).length; }
function speakHTML(){
  var d = UNIT_DATA[S.unit], say = S.spTab === "say", list = say ? sayList(d) : ofLesson(d.speak), it = list[S.sp];
  var h = seg([["qa",T("qa")],["say",T("sayIt")]], S.spTab, "spTab");
  if(!it) return h+'<div class="empty">'+T("noQuestions")+'</div>';
  var task = S.review ? "" : lTask(d.lessons[S.lesson-1]);
  /* audio reference: Q/A item → its question and answer; say-it prompt → the one utterance it shows */
  var si = d.speak.indexOf(say ? ofLesson(d.speak)[Math.floor(S.sp/2)] : it), sayPart = S.sp % 2 ? "a" : "q";
  return h+'<div class="card"><div class="clabel"><span>'+(say ? T("sayPrompt") : T("question"))+'</span><span class="count">'+num(S.sp+1, list.length)+'</span></div>'+
    '<div class="prompt" style="margin:10px 0 14px">'+(say ? meaning(it) : '<span class="ar">'+esc(it.q.ar)+'</span>'+audBtn(S.unit, si, "q"))+'</div>'+
    (S.spShown ? '' : '<button class="btn wide reveal" data-a="spShow">'+ic("eye")+'<span>'+T("showAnswer")+'</span></button>')+'</div>'+
    (S.spShown ? '<div class="model"><div class="count">'+T("modelAnswer")+'</div><span class="ar">'+esc(say ? it.ar : it.a.ar)+'</span>'+audBtn(S.unit, si, say ? sayPart : "a")+'</div>' : '')+
    '<div class="ctrl"><button class="rb" data-a="spPrev" aria-label="'+T("prev")+'">'+ic("fwd")+'</button><button class="rb'+(S.spShown?" go":"")+'" data-a="spNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>'+
    (task ? '<h2>'+T("withClassmate")+'</h2><div class="card tips"><p>'+esc(task)+'</p></div>' : '');
}
function helpHTML(){
  var d = UNIT_DATA[S.unit];
  return '<h2 style="margin-top:0">'+T("grammar")+'</h2>'+d.grammar.map(function(g,i){ return noteHTML(g, "g"+i); }).join("")+
    '<h2>'+T("howTo")+'</h2><div class="card tips">'+
    '<p><strong>'+T("read")+':</strong> '+T("howRead")+'</p>'+
    '<p><strong>'+T("practise")+':</strong> '+T("howDo")+'</p>'+
    '<p><strong>'+T("listening")+':</strong> '+T("howListen")+'</p>'+
    '<p><strong>'+T("speak")+':</strong> '+T("howSpeak")+'</p></div>'+
    '<h2>'+T("tips")+'</h2><div class="card tips"><p>'+T("tip1")+'</p><p>'+T("tip2")+'</p><p>'+T("tip3")+'</p></div>';
}

/* ---------- class section ---------- */
function classItems(id){ return store.entries.filter(function(e){ return e.classId === id && e.type !== "tip"; }); }
function classListHTML(){
  return (S.teacher ? '<p class="sub">'+T("teacherMode")+'</p>' : '')+
    (store.classes.length ? '<div class="chips">'+store.classes.map(function(c){
        var n = store.entries.filter(function(e){ return e.classId === c.id; }).length;
        return '<button class="chip" data-a="class" data-id="'+c.id+'">'+esc(c.name)+' ('+n+')</button>'; }).join("")+'</div>'
      : '<div class="empty">'+(S.teacher ? T("noClassesT") : T("noClasses"))+'</div>')+
    (S.teacher ? '<div class="row" style="margin-top:12px"><button class="btn" data-a="classNew">'+T("newClass")+'</button></div>' : "");
}
function entryHTML(e){
  var x = e.extra || {}, k = "e"+e.id, on = S.teacher || !!S.open[k], h;
  if(e.type === "tip"){
    h = '<span class="dv" style="font-weight:700;display:block">'+esc(e.dv)+'</span>'+
      (on ? '<span class="tr">'+(x.body?'<span class="dv">'+esc(x.body)+'</span>':'')+(e.ar?'<span class="ar" style="font-size:1.35rem">'+esc(e.ar)+'</span>':'')+(e.en?'<span class="en" dir="ltr">'+esc(e.en)+'</span>':'')+'</span>' : '');
  } else {
    h = '<span class="ar">'+esc(e.ar)+'</span>';
    if(e.type === "noun" && x.plural) h += '<span class="forms"><span>'+T("plural")+': <span class="ar">'+esc(x.plural)+'</span></span></span>';
    if(e.type === "verb" && (x.present || x.command)) h += '<span class="forms">'+(x.present?'<span>'+T("present")+': <span class="ar">'+esc(x.present)+'</span></span>':'')+(x.command?'<span>'+T("command")+': <span class="ar">'+esc(x.command)+'</span></span>':'')+'</span>';
    if(on) h += '<span class="tr">'+meaning(e)+'</span>';
  }
  return '<li><button class="vcard'+(on&&!S.teacher?" on":"")+'" data-a="line" data-k="'+k+'">'+h+'</button>'+
    (S.teacher ? '<div class="tools"><button class="btn ghost small" data-a="entryEdit" data-id="'+e.id+'">'+T("edit")+'</button><button class="btn danger small" data-a="entryDel" data-id="'+e.id+'">'+T("del")+'</button></div>' : '')+'</li>';
}
function classHTML(){
  var c = store.classes.filter(function(x){ return x.id === S.classId; })[0];
  if(!c){ S.classId = null; return classListHTML(); }
  if(S.practice)
    return seg([["",T("list")],["fc",T("cards")],["quiz",T("quiz")]], S.practice, "practice")+(S.practice === "fc" ? fcHTML() : quizHTML());
  var list = store.entries.filter(function(e){ return e.classId === c.id && e.type === S.type; });
  return seg(TYPESL(), S.type, "type")+
    (list.length ? '<ul class="vlist">'+list.map(entryHTML).join("")+'</ul>' : '<div class="empty">'+T("nothingHere")+'</div>')+
    '<div class="row" style="margin-top:12px">'+
    (S.teacher ? '<button class="btn" data-a="entryNew">'+T("add")+'</button>' : "")+
    (classItems(c.id).length ? '<button class="btn ghost" data-a="practice" data-t="fc">'+T("cards")+'</button><button class="btn ghost" data-a="practice" data-t="quiz">'+T("quiz")+'</button>' : "")+'</div>'+
    (S.teacher ? '<div class="row" style="margin-top:18px"><button class="btn ghost small" data-a="classRename">'+T("rename")+'</button><button class="btn danger small" data-a="classDel">'+T("delClass")+'</button></div>' : "");
}
function lessonLabel(u, l){
  var d = UNIT_DATA[u];
  return l === "r" ? T("reviewUnit") : T("lesson")+' '+(d && d.lessons[l-1] ? (d.lessons[l-1].num || l) : l);
}
function dashStats(){
  /* textbook totals only; bonus lessons are counted separately */
  var st = {unitsReady:0, unitsDone:0, lessonsTotal:0, lessonsDone:0, words:0, bonusTotal:0, bonusDone:0};
  Object.keys(UNIT_DATA).forEach(function(k){
    var dd = UNIT_DATA[k], n = lessonsDoneIn(k);
    if(isBonus(+k)){ st.bonusTotal += dd.lessons.length; st.bonusDone += n; return; }
    st.unitsReady++; st.lessonsTotal += dd.lessons.length; st.lessonsDone += n; st.words += dd.vocab.length;
    if(n === dd.lessons.length) st.unitsDone++;
  });
  st.pct = st.lessonsTotal ? Math.round(st.lessonsDone / st.lessonsTotal * 100) : 0;
  return st;
}
/* totals over the saved aby-done flags (only lessons that exist) */
function activityTotals(){
  var t = {practised:0, acts:0, listen:0, speak:0, lessons:[]};
  Object.keys(UNIT_DATA).forEach(function(u){
    UNIT_DATA[u].lessons.forEach(function(_, i){
      var a = actsOf(+u, i+1), n = a.filter(function(x){ return x[2]; }).length, dk = done[u+"-"+(i+1)] || {};
      if(n || dk.practice || dk.help){ t.practised++; t.lessons.push({u:+u, l:i+1}); }
      t.acts += n; if(a[2][2]) t.listen++; if(a[3][2]) t.speak++;
    });
  });
  return t;
}
function recentCard(r){
  return '<button class="rcard" data-a="goRecent" data-u="'+r.u+'" data-l="'+r.l+'"><span class="rk ar">'+arNum(r.u)+'</span><span class="ut"><span class="un ar">'+UNITS[r.u-1][0]+'</span><span class="ud">'+unitName(r.u)+' · '+lessonLabel(r.u, r.l)+'</span>'+actsHTML(r.u, r.l)+'</span><span class="uend">'+ic("chev")+'</span></button>';
}
/* Practice page: choose book, unit, lesson and the kind of activity; everything reuses the lesson content and engines */
function practicePickHTML(){
  var d = UNIT_DATA[S.pUnit] || UNIT_DATA[1];
  var bk = '<select id="pBookSel" aria-label="'+T("bookN")+'"><option value="1" selected>'+T("book1")+'</option>'+[2,3].map(function(n){ return '<option disabled>'+T("bookN")+' '+n+' · '+T("soon")+'</option>'; }).join("")+'</select>';
  var us = Object.keys(UNIT_DATA).map(function(k){ return '<option value="'+k+'"'+(+k===S.pUnit?" selected":"")+'>'+unitName(+k)+' · '+esc(UNITS[k-1][0])+'</option>'; }).join("");
  var ls = '<option value="0"'+(S.pLesson===0?" selected":"")+'>'+T("allLessons")+'</option>'+d.lessons.map(function(l,i){ return '<option value="'+(i+1)+'"'+(S.pLesson===i+1?" selected":"")+'>'+T("lesson")+' '+(l.num||i+1)+' · '+esc(l.ar)+'</option>'; }).join("");
  return '<div class="pick pick3">'+bk+'<select id="pUnitSel" aria-label="'+T("unit")+'">'+us+'</select><select id="pLessonSel" aria-label="'+T("lesson")+'">'+ls+'</select></div>'+
    '<div class="ptypes" role="group" aria-label="'+T("chooseContent")+'">'+[["vocab","vocab","cardsI"],["gram","grammar","gradCap"],["ex","exercises","practice"],["listen","listening","ear"],["speak","speak","speak"]].map(function(t){
      return '<button class="ptype'+(S.pType===t[0]?" on":"")+'" data-a="pType" data-t="'+t[0]+'" aria-pressed="'+(S.pType===t[0])+'">'+ic(t[2])+'<span>'+T(t[1])+'</span></button>'; }).join("")+'</div>';
}
function unitHasAudio(u){ return !!(AUDIO_READY && AUD.map && AUD.map[u] && Object.keys(AUD.map[u]).length); }
function practicePageHTML(){
  var d = UNIT_DATA[S.pUnit], h = practicePickHTML();
  if(!d) return h;
  if(S.pType === "vocab"){
    var vs = d.vocab.filter(function(v){ return !S.pLesson || v.lesson === S.pLesson; });
    return h+'<p class="sub">'+vs.length+' '+T("wordsN")+'</p><ul class="vlist">'+vs.map(function(v){ return libCard(S.pUnit, v); }).join("")+'</ul>'+
      '<div class="row" style="margin-top:12px"><button class="btn ghost" data-a="sec" data-s="ref">'+T("searchPh")+'</button></div>';
  }
  if(S.pType === "gram"){
    var gs = []; d.grammar.forEach(function(g, i){ if(!S.pLesson || g.lesson === S.pLesson) gs.push(noteHTML(g, "pg"+i)); });
    return h+(gs.length ? gs.join("") : '<div class="empty">'+T("noGrammar")+'</div>');
  }
  if(S.pType === "listen" || S.pType === "speak"){
    /* listening and speaking run inside the lesson (audio, answers, progress): list where to start */
    var t = S.pType, rows = d.lessons.map(function(l, i){
      var k = i+1; if(S.pLesson && S.pLesson !== k) return "";
      var ok = !!(done[S.pUnit+"-"+k] || {})[t];
      return '<button class="rcard" data-a="openAct" data-u="'+S.pUnit+'" data-l="'+k+'" data-t="'+t+'"><span class="rk ar">'+arNum(l.num || k)+'</span><span class="ut"><span class="un ar">'+esc(l.ar)+'</span><span class="ud">'+lessonLabel(S.pUnit, k)+(ok ? ' · '+T("completed") : '')+'</span></span><span class="uend">'+ic("chev")+'</span></button>';
    }).join("");
    if(!S.pLesson) rows += '<button class="rcard" data-a="openAct" data-u="'+S.pUnit+'" data-l="r" data-t="'+t+'"><span class="rk">'+ic("redo")+'</span><span class="ut"><span class="un" style="font-size:1.05rem">'+T("reviewUnit")+'</span></span><span class="uend">'+ic("chev")+'</span></button>';
    return h+(t === "listen" && !unitHasAudio(S.pUnit) ? '<p class="sub">'+T("audioSoon")+'</p>' : '')+'<div class="rlist">'+rows+'</div>';
  }
  return h+practiceHTML();
}
/* ---------- vocabulary library (Reference section) ---------- */
/* example sentences block for a word's reveal, textbook content only */
function vExHTML(u, v){
  var exs = vExamples(u, v.ar);
  if(!exs.length) return "";
  return '<span class="vexs"><span class="count">'+T("examples")+'</span>'+exs.map(function(e){
    return '<span class="vex"><span class="ar">'+esc(e.ar)+'</span><span class="tr">'+meaning(e)+'</span></span>'; }).join("")+'</span>';
}
function vStarBtn(u, l, ar){
  var saved = vSaved(u, ar);
  return '<button class="vstar'+(saved?" on":"")+'" data-a="vSave" data-u="'+u+'" data-l="'+l+'" data-ar="'+esc(ar)+'" aria-label="'+T(saved ? "unsaveWord" : "saveWord")+'" aria-pressed="'+saved+'">'+ic("bookmark")+'</button>';
}
function libCard(u, v, extra){
  var k = "L"+u+"|"+v.ar, on = !!S.open[k];
  return '<li class="vli"><button class="vcard'+(on?" on":"")+'" data-a="line" data-k="'+esc(k)+'" aria-expanded="'+on+'">'+
    '<span class="ar">'+esc(v.ar)+'</span>'+
    (on ? '<span class="tr">'+meaning(v)+'</span>'+wordForms(v)+'<span class="vref">'+unitName(+u)+' · '+T("lesson")+' '+v.lesson+'</span>'+vExHTML(u, v) :'<span class="vhint" aria-hidden="true">'+ic("eye")+'</span>')+
    '</button>'+vStarBtn(u, v.lesson, v.ar)+(extra || "")+'</li>';
}
function libMatch(v, q, qa, ql){
  return stripTash(v.ar).indexOf(qa) >= 0 ||
    (v.pl && stripTash(v.pl).indexOf(qa) >= 0) ||
    (v.command && stripTash(v.command).indexOf(qa) >= 0) ||
    (v.fem && stripTash(v.fem).indexOf(qa) >= 0) ||
    v.en.toLowerCase().indexOf(ql) >= 0 || v.dv.indexOf(q) >= 0;
}
/* saved words resolved to live entries; unresolvable references are skipped */
function myWords(){
  var q = S.libQ.trim(), qa = stripTash(q), ql = q.toLowerCase(), out = [];
  Object.keys(vocabStore.words).forEach(function(k){
    var w = vocabStore.words[k], v = vResolve(k);
    if(!v) return;
    if(S.libSt !== "all" && w.st !== S.libSt) return;
    if(q && !libMatch(v, q, qa, ql)) return;
    out.push({key:k, w:w, u:w.u, v:v});
  });
  out.sort(function(a, b){ return a.u - b.u || a.v.lesson - b.v.lesson; });
  return out;
}
function stChip(key, st){
  var lab = st === "mastered" ? "stMastered" : st === "learning" ? "stLearning" : "stNew";
  return '<button class="vst vst-'+st+'" data-a="vStatus" data-k="'+esc(key)+'" aria-label="'+T(lab)+'">'+T(lab)+'</button>';
}
function libMatches(){
  var q = S.libQ.trim(), qa = stripTash(q), ql = q.toLowerCase(), out = [];
  Object.keys(UNIT_DATA).forEach(function(u){
    if(S.libU && +u !== S.libU) return;
    UNIT_DATA[u].vocab.forEach(function(v){
      if(S.libU && S.libL && v.lesson !== S.libL) return;
      if(q && !libMatch(v, q, qa, ql)) return;
      out.push({u:+u, v:v});
    });
  });
  return out;
}
/* vocabulary review: Arabic first, flip for meanings, Known / Practise again */
function rvHTML(){
  var qn = rv.queue.length;
  if(rv.i >= qn)
    return '<div class="card" style="text-align:center"><p style="margin:0">'+T("reviewDone")+'</p><p class="score">'+num(rv.known, qn)+'</p>'+
      '<div class="row" style="justify-content:center"><button class="btn" data-a="rvStart">'+T("restart")+'</button><button class="btn ghost" data-a="rvClose">'+T("close")+'</button></div></div>';
  var key = rv.queue[rv.i], w = vocabStore.words[key], v = vResolve(key);
  if(!v){ rv.queue.splice(rv.i, 1); return rvHTML(); }
  var u = w ? w.u : +key.split("|")[0];
  var head = '<div class="rvhead"><button class="ib" data-a="rvClose" aria-label="'+T("close")+'">'+ic("x")+'</button><span class="count">'+num(rv.i+1, qn)+'</span></div>';
  if(!rv.flipped)
    return head+'<button class="fc" data-a="rvFlip"><span class="ar">'+esc(v.ar)+'</span><span class="hint">'+T("tapMeaning")+'</span></button>';
  return head+'<div class="fc rvback"><span class="ar">'+esc(v.ar)+'</span><span class="tr">'+meaning(v)+'</span>'+wordForms(v)+vExHTML(u, v)+'<span class="vref">'+unitName(+u)+' · '+T("lesson")+' '+v.lesson+'</span></div>'+
    '<div class="row rvbtns"><button class="btn" data-a="rvKnown">'+T("known")+'</button><button class="btn ghost" data-a="rvAgain">'+T("needsPractice")+'</button>'+
    (w && w.st !== "mastered" ? '<button class="btn ghost small" data-a="rvMaster">'+T("markMastered")+'</button>' : '')+'</div>';
}
function libHTML(){
  if(S.libReview && rv) return rvHTML();
  var h = seg([["book",T("bookVocab")],["mine",T("myWords")]], S.libTab, "libTab")+
    '<input id="libQ" class="search" type="search" placeholder="'+T("searchPh")+'" aria-label="'+T("searchPh")+'" value="'+esc(S.libQ)+'">';
  if(S.libTab === "book"){
    var us = '<option value="0">'+T("allUnits")+'</option>'+Object.keys(UNIT_DATA).map(function(k){
      return '<option value="'+k+'"'+(+k===S.libU?" selected":"")+'>'+unitName(+k)+' · '+esc(UNITS[k-1][0])+'</option>'; }).join("");
    var d = UNIT_DATA[S.libU];
    var ls = '<option value="0">'+T("allLessons")+'</option>'+(d ? d.lessons.map(function(l,i){
      return '<option value="'+(i+1)+'"'+(S.libL===i+1?" selected":"")+'>'+T("lesson")+' '+(l.num||i+1)+'</option>'; }).join("") : '');
    h += '<div class="pick"><select id="libUSel" aria-label="'+T("unit")+'">'+us+'</select><select id="libLSel" aria-label="'+T("lesson")+'"'+(d?'':' disabled')+'>'+ls+'</select></div>';
    var list = libMatches();
    h += '<p class="sub">'+list.length+' '+T("wordsN")+'</p>';
    h += list.length ? '<ul class="vlist">'+list.map(function(x){ return libCard(x.u, x.v); }).join("")+'</ul>' : '<div class="empty">'+T("noResults")+'</div>';
  } else {
    h += seg([["all",T("all")],["new",T("stNew")],["learning",T("stLearning")],["mastered",T("stMastered")]], S.libSt, "libSt");
    var mine = myWords();
    if(Object.keys(vocabStore.words).length === 0) h += '<div class="empty">'+T("noSaved")+'</div>';
    else {
      h += '<p class="sub">'+mine.length+' '+T("wordsN")+'</p>'+
        (mine.length ? '<div class="row" style="margin-bottom:12px"><button class="btn" data-a="rvStart">'+T("reviewWords")+' ('+mine.length+')</button></div>' : '');
      h += mine.length ? '<ul class="vlist">'+mine.map(function(x){ return libCard(x.u, x.v, stChip(x.key, x.w.st)); }).join("")+'</ul>'
                       : '<div class="empty">'+T("noResults")+'</div>';
    }
  }
  return h+'<p class="sub" style="margin-top:14px">'+T("moreComing")+'</p>';
}
function progressHTML(){
  var t = activityTotals(), rec = recent.filter(function(r){ return UNIT_DATA[r.u]; });
  function stat(n, label){ return '<div class="stat"><b>'+n+'</b><span>'+label+'</span></div>'; }
  var top = '<div class="stats">'+stat(t.practised, T("lessonsPractisedN"))+stat(t.acts, T("activitiesDone"))+stat(t.listen, T("listenDoneN"))+stat(t.speak, T("speakDoneN"))+'</div>'+
    (rec.length ? '<h2>'+T("recent")+'</h2><div class="rlist">'+rec.map(recentCard).join("")+'</div>' : '')+
    (t.lessons.length ? '<h2>'+T("practisedH")+'</h2><div class="rlist">'+t.lessons.map(recentCard).join("")+'</div>' : '<div class="cempty" style="margin-top:14px"><p>'+T("chooseLesson")+'</p><button class="btn" data-a="sec" data-s="book">'+T("lessons")+'</button></div>');
  function rows(bonus){ return Object.keys(UNIT_DATA).filter(function(k){ return isBonus(+k) === bonus; }).map(function(k){
    var dd = UNIT_DATA[k], n = lessonsDoneIn(k);
    var st = n === dd.lessons.length ? T("completed") : n ? T("inProgress") : T("notStarted");
    return '<li><span class="ar">'+UNITS[k-1][0]+'</span><span class="pbar"><i style="width:'+(n/dd.lessons.length*100)+'%"></i></span><span class="count">'+num(n, dd.lessons.length)+' · '+st+'</span></li>';
  }).join(""); }
  var b = rows(true);
  return top+'<h2>'+T("textbookProgress")+'</h2><ul class="plist">'+rows(false)+'</ul>'+
    (b ? '<h2>'+T("bonusTag")+'</h2><ul class="plist">'+b+'</ul>' : '')+'<p class="sub">'+T("savedOnDevice")+'</p>';
}
function render(){
  renderChrome();
  if(!S.mode) app.innerHTML = welcomeHTML();
  else if(S.cls) app.innerHTML = S.classId ? classHTML() : classListHTML();
  else switch(S.sec){
    case "home": app.innerHTML = homeHTML(); break;
    case "practice": app.innerHTML = practicePageHTML(); break;
    case "ref": app.innerHTML = libHTML(); break;
    case "progress": app.innerHTML = progressHTML(); break;
    default:
      if(!S.unit) app.innerHTML = startHTML();
      else if(!S.lesson) app.innerHTML = lessonsHTML();
      else app.innerHTML = lessonTabs()+(S.tab === "practice" ? practiceHTML() : S.tab === "listen" ? listenHTML() : S.tab === "speak" ? speakHTML() : readHTML())+flowHTML();
  }
  audAfterRender();
  pracTabKeep();
}
/* every render rebuilds the scrolling practice-tab row at its start; on a phone the last
   tabs (Speed, Letters) would slide out of view again, so bring the chosen one back —
   sideways only, the page itself does not move */
function pracTabKeep(){
  var b = document.querySelector('.seg button.on[data-a="pracTab"]'); if(!b) return;
  var s = b.parentNode, br = b.getBoundingClientRect(), sr = s.getBoundingClientRect();
  if(br.right > sr.right) s.scrollLeft += br.right - sr.right + 8;
  else if(br.left < sr.left) s.scrollLeft -= sr.left - br.left + 8;
}
function menuModal(){
  openModal('<div class="menu">'+(S.sec !== "home" || S.cls ? '<button data-a="home">'+T("home")+'</button>' : '')+'<button data-a="sec" data-s="ref">'+T("secRef")+'</button><button data-a="clsOpen">'+T("yourClass")+'</button>'+
    (S.sec === "book" && (S.unit || S.cls) ? '<button data-a="units">'+T("allUnits")+'</button>' : '')+
    '<button data-a="changeLang">'+T("changeLang")+'</button>'+
    (S.teacher ? '<button data-a="logout">'+T("tLogout")+'</button>' : '<button data-a="loginOpen">'+T("tLogin")+'</button>')+
    '<button class="q" data-a="close">'+T("close")+'</button></div>');
}

/* ---------- modals ---------- */
function closeModal(){ modalRoot.innerHTML = ""; }
function openModal(html, centre){
  modalRoot.innerHTML = '<div class="veil'+(centre?" mid":"")+'" data-a="veil"><div class="modal'+(centre?" pop":"")+'" role="dialog" aria-modal="true">'+html+'</div></div>';
  var f = modalRoot.querySelector("input,select,textarea"); if(f) f.focus();
}
function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; }
function fail(msg){ var el = document.getElementById("err"); if(el) el.textContent = msg; }
var BTNS = function(action, id){ return '<p class="err" id="err"></p><div class="row"><button class="btn" data-a="'+action+'" data-id="'+(id||"")+'">'+T("save")+'</button><button class="btn ghost" data-a="close">'+T("cancel")+'</button></div>'; };
function loginModal(){
  openModal('<h3>'+T("tLogin")+'</h3><label for="pw">'+T("password")+'</label><input id="pw" type="password" dir="ltr" autocomplete="off">'+
    '<p class="err" id="err"></p><div class="row"><button class="btn" data-a="loginDo">'+T("login")+'</button><button class="btn ghost" data-a="close">'+T("cancel")+'</button></div>');
}
function classModal(c){
  openModal('<h3>'+(c?T("renameClass"):T("newClass"))+'</h3><label for="cname">'+T("className")+'</label><input id="cname" value="'+esc(c?c.name:"")+'">'+BTNS("classSave", c?c.id:""));
}
function confirmModal(text, action, id){
  openModal('<h3>'+text+'</h3><p class="sub">'+T("noUndo")+'</p><div class="row"><button class="btn danger" data-a="'+action+'" data-id="'+(id||"")+'">'+T("del")+'</button><button class="btn ghost" data-a="close">'+T("cancel")+'</button></div>');
}
function entryFields(type, e){
  e = e || {}; var x = e.extra || {};
  function inp(id, label, v, cls, dir){ return '<label for="'+id+'">'+label+'</label><input id="'+id+'" class="'+(cls||"")+'" dir="'+(dir||"rtl")+'" value="'+esc(v||"")+'">'; }
  if(type === "tip") return inp("f_dv",T("fTitle"),e.dv)+'<label for="f_body">'+T("fBody")+'</label><textarea id="f_body" rows="3" dir="rtl">'+esc(x.body||"")+'</textarea>'+
    inp("f_ar",T("fExample"),e.ar,"ar")+inp("f_en",T("fExampleEn"),e.en,"en","ltr");
  var h = inp("f_ar", type==="verb" ? T("fPast") : type==="noun" ? T("fSingular") : T("fArabic"), e.ar, "ar");
  if(type === "noun") h += inp("f_plural",T("fPlural"),x.plural,"ar");
  if(type === "verb") h += inp("f_present",T("fPresent"),x.present,"ar")+inp("f_command",T("fCommand"),x.command,"ar");
  return h+inp("f_en",T("fEn"),e.en,"en","ltr")+inp("f_dv",T("fDv"),e.dv);
}
function entryModal(e){
  var type = e ? e.type : S.type;
  openModal('<h3>'+(e?T("edit"):T("add"))+'</h3><label for="f_type">'+T("fType")+'</label><select id="f_type"'+(e?" disabled":"")+'>'+
    TYPESL().map(function(t){ return '<option value="'+t[0]+'"'+(t[0]===type?" selected":"")+'>'+t[1]+'</option>'; }).join("")+'</select>'+
    '<div id="fields">'+entryFields(type, e)+'</div>'+BTNS("entrySave", e?e.id:""));
}
document.addEventListener("change", function(ev){
  if(ev.target.id === "f_type") document.getElementById("fields").innerHTML = entryFields(ev.target.value);
});
document.addEventListener("keydown", function(ev){
  if(ev.key === "Escape") closeModal();
  if(ev.key === "Enter" && ev.target.tagName === "INPUT"){ var b = modalRoot.querySelector(".modal .btn"); if(b) b.click(); }
});
