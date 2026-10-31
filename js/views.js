/* ArabicMV — screens. Each function returns HTML for one view. */
/* ---------- views ---------- */
function SECTIONS(){ return [["dash",T("secDash"),"dash",T("navDash")],["book",T("secBook"),"read",T("navBook")],["practice",T("secPractice"),"practice",T("navPractice")],["talk",T("secTalk"),"speak",T("navTalk")],["ref",T("secRef"),"ref",T("navRef")],["progress",T("secProgress"),"progress",T("navProgress")]]; }
function LESSON_TABS(){ return [["read",T("read")],["practice",T("doo")],["speak",T("speak")],["help",T("help")]]; }
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
  else if(S.sec === "book" && S.unit && !S.lesson) h = bar("units", "", T("lessons"), false);
  else if(inLessonView()) h = '<div class="hdr"><button class="ib" data-a="'+(S.tab==="read" && S.readTab==="turn" ? "turnBack" : "lessons")+'" aria-label="'+T("back")+'">'+ic("back")+'</button>'+
    '<div class="hc"><div class="hl" dir="rtl">الوحدة ('+arNum(S.unit)+') - '+UNITS[S.unit-1][0].replace(/[\u064B-\u0652\u0670]/g,"")+' - '+(S.review ? "مراجعة" : "الدرس ("+arNum(UNIT_DATA[S.unit].lessons[S.lesson-1].num || S.lesson)+")")+'</div></div>'+
    '<button class="ib" data-a="menu" aria-label="'+T("menu")+'">'+ic("more")+'</button></div>';
  else { var sec = SECTIONS().filter(function(x){ return x[0] === S.sec; })[0]; h = bar("", "", sec ? sec[1] : "", false); }
  document.getElementById("hdr").innerHTML = h;
  var show = !!S.mode;
  function navBtns(short){ return SECTIONS().map(function(n){
    return '<button class="'+(S.sec===n[0]?"on":"")+'" data-a="sec" data-s="'+n[0]+'"'+(S.sec===n[0]?' aria-current="page"':'')+' aria-label="'+n[1]+'">'+ic(n[2])+'<span>'+(short ? n[3] : n[1])+'</span></button>'; }).join(""); }
  var navs = navBtns(true), sideNavs = navBtns(false);
  var nav = document.getElementById("nav"), side = document.getElementById("side");
  nav.hidden = !show; side.hidden = !show; document.body.classList.toggle("has-nav", show);
  nav.innerHTML = navs;
  side.innerHTML = '<div class="brand"><span class="blogo">'+ic("read")+'</span><span class="bname">ArabicMV</span></div><div class="snav">'+sideNavs+'</div>'+
    '<div class="sfoot"><span class="avatar">'+ic("user")+'</span><span>'+T("guest")+'</span></div>';
}
function lessonTabs(){
  return '<div class="ltabs">'+LESSON_TABS().map(function(t){ return '<button class="'+(S.tab===t[0]?"on":"")+'" data-a="tab" data-t="'+t[0]+'">'+t[1]+'</button>'; }).join("")+'</div>';
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
function startHTML(){
  return '<ul class="ulist">'+UNITS.map(function(u,i){
    var n = i+1, ready = !!UNIT_DATA[n];
    var sub = ready ? UNIT_DATA[n].lessons.length+' '+T("lessonsN")+' · '+UNIT_DATA[n].vocab.length+' '+T("wordsN") : T("notReady");
    return '<li><button class="ucard" data-a="unit" data-n="'+n+'">'+
      '<span class="thumb ar">'+arNum(n)+'</span><span class="ut"><span class="uk ar">الوحدة '+arNum(n)+'</span><span class="un ar">'+u[0]+'</span><span class="ud">'+esc(unitSub(i))+' · '+sub+'</span></span>'+
      '<span class="uend">'+ic("chev")+'</span></button></li>';
  }).join("")+'</ul>';
}
function lessonsHTML(){
  var d = UNIT_DATA[S.unit], u = UNITS[S.unit-1];
  var hero = '<div class="hero"><div class="hk ar">الوحدة ('+arNum(S.unit)+')</div><div class="hn ar">'+u[0]+'</div></div>';
  if(!d) return hero+notReady();
  function meta(words, dl){ return '<span class="ud">'+words+' '+T("wordsN")+' · '+dl+' '+T("dialoguesN")+' · '+T("approx")+' '+(8 + Math.round(words/3))+' '+T("min")+'</span>'; }
  var review = '<button class="lcard'+(S.last[S.unit]==="r"?" cur":"")+'" data-a="lesson" data-n="r"><span class="lk ar">'+ic("redo")+'</span>'+
    '<span class="ut"><span class="un" style="font-size:1.1rem;font-weight:700">'+T("reviewUnit")+'</span>'+meta(d.vocab.length, d.conv.length)+'</span><span class="uend">'+ic("chev")+'</span></button>';
  return hero+'<div class="llist">'+d.lessons.map(function(l,i){
    var k = i+1, words = d.vocab.filter(function(v){ return v.lesson===k; }).length, dl = d.conv.filter(function(c){ return c.lesson===k; }).length;
    var dk = done[S.unit+"-"+k], all = dk && dk.read && dk.practice && dk.speak && dk.help;
    return '<button class="lcard'+(S.last[S.unit]===k?" cur":"")+'" data-a="lesson" data-n="'+k+'"><span class="lk ar'+(all?" ok":"")+'">'+(all ? ic("check") : arNum(l.num || k))+'</span>'+
      '<span class="ut"><span class="un ar">'+esc(l.ar)+'</span>'+meta(words, dl)+'</span><span class="uend">'+ic("chev")+'</span></button>';
  }).join("")+review+'</div>';
}
function convBlock(c, ci, n, total){
  /* the dialogue itself is Arabic, so its lines always run right-to-left, whatever the interface language */
  return '<section class="conv"><div class="chead"><b>'+T("dialogue")+' '+n+'</b>'+
    (total > 1 ? '<span class="count">'+n+' / '+total+'</span><button class="ib" data-a="dlgPrev" aria-label="'+T("prevDialogue")+'">'+ic("fwd")+'</button><button class="ib" data-a="dlgNext" aria-label="'+T("nextDialogue")+'">'+ic("chev")+'</button>' : '')+'</div>'+
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
  return f.length ? '<span class="forms">'+f.join("")+'</span>' : "";
}
function noteHTML(g, k){
  var on = !!S.open[k];
  return '<article class="note"><button class="nhead" data-a="line" data-k="'+k+'" aria-expanded="'+on+'"><span>'+esc(gTitle(g))+'</span>'+ic("chev")+'</button>'+
    (on ? '<div class="nbody"><p>'+esc(gBody(g))+'</p>'+g.ex.map(function(e){ return '<div class="ex"><span class="ar">'+esc(e.ar)+'</span><span class="tr">'+meaning(e)+'</span></div>'; }).join("")+'</div>' : '')+'</article>';
}
function readHTML(){
  var d = UNIT_DATA[S.unit], n = 0;
  var h = seg([["conv",T("dialogue")],["vocab",T("vocab")],["turn",T("yourTurn")]], S.readTab, "readTab");
  if(S.readTab === "turn") return practiceHTML();
  if(S.readTab === "conv"){
    var idx = []; d.conv.forEach(function(c,ci){ if(S.review || c.lesson === S.lesson) idx.push(ci); });
    if(!idx.length) return h+'<div class="empty">'+T("noDialogue")+'</div>';
    S.dlg = ((S.dlg % idx.length) + idx.length) % idx.length; n = S.dlg;
    return h+convBlock(d.conv[idx[n]], idx[n], n+1, idx.length);
  }
  return h+'<ul class="vlist">'+d.vocab.map(function(v,i){
    if(!S.review && v.lesson !== S.lesson) return "";
    var k = "v"+i, on = !!S.open[k];
    return '<li><button class="vcard'+(on?" on":"")+'" data-a="line" data-k="'+k+'" aria-expanded="'+on+'"><span class="ar">'+esc(v.ar)+'</span>'+(on ? '<span class="tr">'+meaning(v)+'</span>'+wordForms(v) : '')+'</button></li>';
  }).join("")+'</ul>';
}
function practiceHTML(){
  if(S.sec === "practice" && !UNIT_DATA[S.pUnit]) return "";
  var tabs = seg([["fc",T("cards")],["quiz",T("quiz")],["match",T("match")],["arr",T("arrange")],["speed",T("speed")]], S.pracTab, "pracTab");
  var cnt = (S.pracTab==="quiz" && quiz && quiz.qs && quiz.i < quiz.qs.length) ? '<span class="count tcount">'+T("question")+' '+(quiz.i+1)+' / '+quiz.qs.length+'</span>' : '';
  tabs = tabs.replace('</div>', cnt+'</div>');
  if(!S.review && S.sec !== "practice") tabs = '<div class="segrow">'+tabs+'<button class="fbtn'+(S.scope==="unit"?" on":"")+'" data-a="scopeToggle" aria-pressed="'+(S.scope==="unit")+'" aria-label="'+T("scope")+'" title="'+(S.scope==="unit" ? T("wholeUnit") : T("thisLesson"))+'">'+ic("filter")+'</button></div>';
  return tabs+
    (S.pracTab==="fc" ? fcHTML() : S.pracTab==="quiz" ? quizHTML() : S.pracTab==="match" ? matchHTML() : S.pracTab==="speed" ? speedHTML() : arrHTML());
}
function sayList(d){ var out = []; ofLesson(d.speak).forEach(function(x){ out.push(x.q); out.push(x.a); }); return out; }
function spCount(){ var d = UNIT_DATA[S.unit]; return S.spTab==="say" ? sayList(d).length : ofLesson(d.speak).length; }
function speakHTML(){
  var d = UNIT_DATA[S.unit], say = S.spTab === "say", list = say ? sayList(d) : ofLesson(d.speak), it = list[S.sp];
  var h = seg([["qa",T("qa")],["say",T("sayIt")]], S.spTab, "spTab");
  if(!it) return h+'<div class="empty">'+T("noQuestions")+'</div>';
  var task = S.review ? "" : lTask(d.lessons[S.lesson-1]);
  return h+'<div class="card"><div class="clabel"><span>'+(say ? T("sayPrompt") : T("question"))+'</span><span class="count">'+(S.sp+1)+' / '+list.length+'</span></div>'+
    '<div class="prompt" style="margin:10px 0 14px">'+(say ? meaning(it) : '<span class="ar">'+esc(it.q.ar)+'</span>')+'</div>'+
    (S.spShown ? '' : '<button class="btn wide reveal" data-a="spShow">'+ic("eye")+'<span>'+T("showAnswer")+'</span></button>')+'</div>'+
    (S.spShown ? '<div class="model"><div class="count">'+T("modelAnswer")+'</div><span class="ar">'+esc(say ? it.ar : it.a.ar)+'</span></div>' : '')+
    '<div class="ctrl"><button class="rb" data-a="spPrev" aria-label="'+T("prev")+'">'+ic("fwd")+'</button><button class="rb'+(S.spShown?" go":"")+'" data-a="spNext" aria-label="'+T("next")+'">'+ic("chev")+'</button></div>'+
    (task ? '<h2>'+T("withClassmate")+'</h2><div class="card tips"><p>'+esc(task)+'</p></div>' : '');
}
function helpHTML(){
  var d = UNIT_DATA[S.unit];
  return '<h2 style="margin-top:0">'+T("grammar")+'</h2>'+d.grammar.map(function(g,i){ return noteHTML(g, "g"+i); }).join("")+
    '<h2>'+T("howTo")+'</h2><div class="card tips">'+
    '<p><strong>'+T("read")+':</strong> '+T("howRead")+'</p>'+
    '<p><strong>'+T("doo")+':</strong> '+T("howDo")+'</p>'+
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
function dashHTML(){
  var u = S.unit, l = S.last[u], d = u && UNIT_DATA[u];
  var ready = Object.keys(UNIT_DATA).length, lessonsTotal = 0, lessonsDone = 0, words = 0;
  Object.keys(UNIT_DATA).forEach(function(k){ var dd = UNIT_DATA[k]; lessonsTotal += dd.lessons.length; words += dd.vocab.length;
    dd.lessons.forEach(function(_,i){ var dk = done[k+"-"+(i+1)]; if(dk && dk.read && dk.practice && dk.speak && dk.help) lessonsDone++; }); });
  var cont = d && l ? '<button class="ccard" data-a="resume"><span class="ck">'+T("continueL")+'</span><span class="cv ar">'+UNITS[u-1][0]+'</span><span class="cs">'+(l==="r" ? T("reviewUnit") : T("lesson")+' '+(d.lessons[l-1] ? (d.lessons[l-1].num || l) : l))+'</span>'+ic("chev")+'</button>'
                      : '<button class="ccard" data-a="sec" data-s="book"><span class="ck">'+T("startL")+'</span><span class="cv ar">العربية بين يديك</span><span class="cs">'+T("book1")+'</span>'+ic("chev")+'</button>';
  return '<h1 class="wh2">'+T("welcome")+'</h1>'+cont+
    '<h2>'+T("overview")+'</h2><div class="stats"><div class="stat"><b>'+ready+'</b><span>'+T("unitsN")+'</span></div><div class="stat"><b>'+lessonsDone+' / '+lessonsTotal+'</b><span>'+T("lessonsDone")+'</span></div><div class="stat"><b>'+words+'</b><span>'+T("wordsAvail")+'</span></div></div>'+
    '<div class="row" style="margin-top:14px"><button class="btn ghost" data-a="sec" data-s="book">'+T("openBook")+'</button><button class="btn ghost" data-a="sec" data-s="practice">'+T("quickPractice")+'</button></div>'+
    '<p class="sub" style="margin-top:16px">'+T("savedOnDevice")+'</p>';
}
function practicePickHTML(){
  var d = UNIT_DATA[S.pUnit] || UNIT_DATA[1];
  var us = Object.keys(UNIT_DATA).map(function(k){ return '<option value="'+k+'"'+(+k===S.pUnit?" selected":"")+'>'+T("unit")+' '+k+' · '+esc(UNITS[k-1][0])+'</option>'; }).join("");
  var ls = '<option value="0"'+(S.pLesson===0?" selected":"")+'>'+T("allLessons")+'</option>'+d.lessons.map(function(l,i){ return '<option value="'+(i+1)+'"'+(S.pLesson===i+1?" selected":"")+'>'+T("lesson")+' '+(l.num||i+1)+' · '+esc(l.ar)+'</option>'; }).join("");
  return '<div class="pick"><select id="pUnitSel" aria-label="'+T("unit")+'">'+us+'</select><select id="pLessonSel" aria-label="'+T("lesson")+'">'+ls+'</select></div>';
}
function placeholderHTML(key){
  return '<div class="card"><p style="margin:0 0 8px">'+T("comingSoon")+'</p><h2 style="margin:8px 0 4px;font-size:1rem">'+T("planned")+'</h2><p class="sub" style="margin:0">'+T(key)+'</p></div>';
}
function progressHTML(){
  var h = '<h2 style="margin-top:0">'+T("textbookProgress")+'</h2><ul class="plist">';
  Object.keys(UNIT_DATA).forEach(function(k){
    var dd = UNIT_DATA[k], n = 0;
    dd.lessons.forEach(function(_,i){ var dk = done[k+"-"+(i+1)]; if(dk && dk.read && dk.practice && dk.speak && dk.help) n++; });
    var st = n === dd.lessons.length ? T("completed") : n ? T("inProgress") : T("notStarted");
    h += '<li><span class="ar">'+UNITS[k-1][0]+'</span><span class="pbar"><i style="width:'+(n/dd.lessons.length*100)+'%"></i></span><span class="count">'+n+' / '+dd.lessons.length+' · '+st+'</span></li>';
  });
  return h+'</ul><p class="sub">'+T("savedOnDevice")+'</p>';
}
function render(){
  renderChrome();
  if(!S.mode){ app.innerHTML = welcomeHTML(); return; }
  if(S.cls){ app.innerHTML = S.classId ? classHTML() : classListHTML(); return; }
  switch(S.sec){
    case "dash": app.innerHTML = dashHTML(); break;
    case "practice": app.innerHTML = practicePickHTML()+practiceHTML(); break;
    case "talk": app.innerHTML = placeholderHTML("talkItems"); break;
    case "ref": app.innerHTML = placeholderHTML("refItems"); break;
    case "progress": app.innerHTML = progressHTML(); break;
    default:
      if(!S.unit) app.innerHTML = startHTML();
      else if(!S.lesson) app.innerHTML = lessonsHTML();
      else app.innerHTML = lessonTabs()+(S.tab === "practice" ? practiceHTML() : S.tab === "speak" ? speakHTML() : S.tab === "help" ? helpHTML() : readHTML());
  }
}
function menuModal(){
  openModal('<div class="menu"><button data-a="clsOpen">'+T("yourClass")+'</button>'+
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
