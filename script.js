(function(){
  var DESIGN_W=1366, LP_W=1521, LP_H=1144;
  var root=document.documentElement, body=document.body;
  root.classList.add('js');
  var landing=document.getElementById('landing');
  var lpStage=landing.querySelector('.lp-stage');
  var secs=[].slice.call(document.querySelectorAll('#main-site .sec'));

  /* ---------- layout ---------- */
  function fit(){
    var vw=root.clientWidth, vh=window.innerHeight;
    // landing: contain-fit the envelope stage into the viewport
    lpStage.style.transform='scale('+Math.min(vw/LP_W,vh/LP_H)+')';
    // main site: scale the stage down on narrow screens
    var s=Math.min(1,vw/DESIGN_W);
    secs.forEach(function(sec){
      var h=parseFloat(sec.dataset.h), st=sec.firstElementChild;
      st.style.transform=s<1?'scale('+s+')':'none';
      sec.style.height=(h*s)+'px';
    });
  }
  fit(); window.addEventListener('resize',fit); window.addEventListener('orientationchange',fit);

  /* ---------- main site entrance animation ---------- */
  secs.forEach(function(sec){
    [].forEach.call(sec.firstElementChild.children,function(el,i){el.style.setProperty('--d',(i*0.08)+'s');});
  });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.08});
    secs.forEach(function(s){io.observe(s);});
  } else secs.forEach(function(s){s.classList.add('in');});

  /* ---------- landing -> main site ---------- */
  function enter(instant){
    if(body.classList.contains('entered')) return;
    function done(){ body.classList.add('entered'); fit(); window.scrollTo(0,0); }
    if(instant){ done(); return; }
    landing.classList.add('leaving');
    setTimeout(done,650);
  }
  landing.querySelector('.lp-stamp').addEventListener('click',function(ev){
    ev.preventDefault();
    history.replaceState(null,'','#invitation');
    enter(false);
  });
  // deep links (e.g. index.html#invitation) skip the envelope
  if(location.hash&&location.hash!=='#'&&location.hash!=='#landing') enter(true);

  /* ---------- smooth in-page anchors ---------- */
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('#main-site a[href^="#"]'); if(!a) return;
    var t=document.getElementById(a.getAttribute('href').slice(1)); if(!t) return;
    ev.preventDefault(); t.scrollIntoView({behavior:'smooth'}); history.replaceState(null,'',a.getAttribute('href'));
  });

  /* ---------- RSVP dialog (nothing is sent anywhere) ---------- */
  var dlg=document.getElementById('rsvp-dialog'), lastFocus=null;
  function openDlg(){ lastFocus=document.activeElement; dlg.hidden=false; dlg.querySelector('.dlg-ok').focus(); }
  function closeDlg(){ dlg.hidden=true; if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  document.getElementById('rsvp-form').addEventListener('submit',function(ev){ ev.preventDefault(); openDlg(); });
  document.addEventListener('click',function(ev){
    var t=ev.target.closest&&ev.target.closest('.shp');
    if(t&&t.querySelector('.rsvp-trigger')){ ev.preventDefault(); openDlg(); }
  });
  dlg.addEventListener('click',function(ev){ if(ev.target===dlg||ev.target.closest('.dlg-ok,.dlg-x')) closeDlg(); });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&!dlg.hidden) closeDlg(); });
})();
