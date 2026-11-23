/* ---------- pick full or light-weight images for this device ----------
   Light copies live in assets/media-lite/*.webp. Force a version with ?quality=high or ?quality=lite */
(function(){
  var q=(location.search.match(/[?&]quality=(high|lite)/)||[])[1];
  var c=navigator.connection||{};
  var lite = q ? q==='lite' :
    !!c.saveData || /(^|-)2g|3g/.test(c.effectiveType||'') ||
    Math.min(screen.width,screen.height)<=820 || (navigator.deviceMemory&&navigator.deviceMemory<=2);
  if(!lite) return;
  var re=/assets\/media\/([^\/"')]+)\.(png|jpe?g)$/i;
  function swap(el,attr){
    var v=el.getAttribute(attr), m=v&&v.match(re);
    if(m) el.setAttribute(attr,'assets/media-lite/'+m[1]+'.webp');
  }
  [].forEach.call(document.querySelectorAll('img[src]'),function(e){swap(e,'src');});
  [].forEach.call(document.querySelectorAll('image'),function(e){swap(e,'href');});
})();
(function(){
  var DESIGN_W=1366, LP_W=1521, LP_H=1144;
  var root=document.documentElement, body=document.body;
  root.classList.add('js');
  var landing=document.getElementById('landing');
  var lpStage=landing.querySelector('.lp-stage');
  var secs=[].slice.call(document.querySelectorAll('#main-site .sec')).filter(function(s){return parseFloat(s.dataset.h)>100;});
  var main=document.getElementById('main-site');

  /* ---------- layout ---------- */
  function fit(){
    var vw=root.clientWidth, vh=window.innerHeight;
    // landing: contain-fit the envelope stage into the viewport
    lpStage.style.transform='scale('+Math.min(vw/LP_W,vh/LP_H)+')';
    // main site: every slide is contain-fitted and centred in the viewport
    secs.forEach(function(sec){
      var h=parseFloat(sec.dataset.h), st=sec.firstElementChild;
      var s=Math.min(vw/DESIGN_W,vh/h,1.25);
      st.style.transform='scale('+s+')';
      st.style.top=Math.max(0,(vh-h*s)/2)+'px';
    });
  }
  fit(); window.addEventListener('resize',fit); window.addEventListener('orientationchange',fit);

  /* ---------- main site: full-screen slides replacing each other on scroll ---------- */
  secs.forEach(function(sec){
    [].forEach.call(sec.firstElementChild.children,function(el,i){el.style.setProperty('--d',(i*0.08)+'s');});
  });
  var cur=-1, locked=false, nav=document.createElement('div'), dots=[];
  nav.className='deck-nav';
  secs.forEach(function(sec,i){
    var d=document.createElement('button'); d.type='button'; d.setAttribute('aria-label','Slide '+(i+1));
    d.addEventListener('click',function(){go(i);}); nav.appendChild(d); dots.push(d);
  });
  main.appendChild(nav);
  function render(){
    secs.forEach(function(sec,i){
      var on=i===cur;
      sec.classList.toggle('active',on);
      sec.classList.toggle('before',i<cur);
      sec.classList.toggle('after',i>cur);
      if(on) sec.classList.add('in'); else setTimeout(function(){ if(i!==cur) sec.classList.remove('in'); },700);
      dots[i].classList.toggle('on',on);
    });
  }
  function go(i,instant){
    i=Math.max(0,Math.min(secs.length-1,i));
    if(i===cur) return;
    cur=i; render();
    locked=true; setTimeout(function(){locked=false;},instant?0:900);
  }
  function step(d){ if(!locked) go(cur+d); }
  window.addEventListener('wheel',function(ev){
    if(!body.classList.contains('entered')||!dlg.hidden) return;
    if(ev.target.closest&&ev.target.closest('.dlg')) return;
    ev.preventDefault();
    if(Math.abs(ev.deltaY)<8) return;
    step(ev.deltaY>0?1:-1);
  },{passive:false});
  var ty=null;
  window.addEventListener('touchstart',function(ev){ty=ev.touches[0].clientY;},{passive:true});
  window.addEventListener('touchmove',function(ev){ if(body.classList.contains('entered')&&dlg.hidden) ev.preventDefault(); },{passive:false});
  window.addEventListener('touchend',function(ev){
    if(ty===null||!body.classList.contains('entered')||!dlg.hidden){ty=null;return;}
    var dy=ty-ev.changedTouches[0].clientY; ty=null;
    if(Math.abs(dy)>45) step(dy>0?1:-1);
  });
  document.addEventListener('keydown',function(ev){
    if(!body.classList.contains('entered')||!dlg.hidden) return;
    if(/^(INPUT|TEXTAREA|BUTTON|A)$/.test(ev.target.tagName)&&(ev.key===' '||ev.key==='Enter')) return;
    if(ev.target.tagName==='INPUT'&&ev.target.type==='text') return;
    var k=ev.key;
    if(k==='ArrowDown'||k==='PageDown'||k===' '){ev.preventDefault();step(1);}
    else if(k==='ArrowUp'||k==='PageUp'){ev.preventDefault();step(-1);}
    else if(k==='Home'){ev.preventDefault();go(0);}
    else if(k==='End'){ev.preventDefault();go(secs.length-1);}
  });

  /* ---------- landing -> main site ---------- */
  function enter(instant){
    if(body.classList.contains('entered')) return;
    function done(){ body.classList.add('entered'); fit(); window.scrollTo(0,0); var t=document.getElementById((location.hash||'').slice(1)); var i=secs.indexOf(t); go(i>=0?i:0,true); }
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

  /* ---------- in-page anchors jump to slides ---------- */
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('#main-site a[href^="#"]'); if(!a) return;
    var i=secs.indexOf(document.getElementById(a.getAttribute('href').slice(1))); if(i<0) return;
    ev.preventDefault(); go(i); history.replaceState(null,'',a.getAttribute('href'));
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
