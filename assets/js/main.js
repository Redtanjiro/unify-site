(()=>{
const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro = $('intro'), card = $('card'), nav = $('nav');
const wait = ms => new Promise(r => setTimeout(r, ms));

/* Monogram: load the logo file once and inline it so it can take any brand colour (gold on the seal, ivory on film, maroon on paper) */
const MONO = 'assets/logo/unify-monogram.svg?v=10';
fetch(MONO).then(r => r.ok ? r.text() : Promise.reject()).then(txt => {
  const svg = txt.replace(/<\?xml[^>]*>/,'')
    .replace(/fill="(?!none)[^"]*"/g,'fill="currentColor"')
    .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g,'fill:currentColor');
  document.querySelectorAll('.mono').forEach(el => {
    el.innerHTML = svg;
    const s = el.querySelector('svg'); if (s){ s.removeAttribute('width'); s.removeAttribute('height'); s.setAttribute('aria-hidden','true'); s.setAttribute('preserveAspectRatio','xMidYMid meet'); }
  });
}).catch(() => {
  document.querySelectorAll('.mono').forEach(el => { el.innerHTML = '<img alt="" src="assets/logo/unify-monogram-ivory.svg?v=10">'; });
});

/* ── Hero film: Jal Mahal, looped. Phones get the lighter 720px file ── */
const vids = [$('vidA')]; let cur = 0;
const small = matchMedia('(max-width: 760px)').matches;
vids[0].src = `assets/video/jaipur${small ? '-m' : ''}.mp4`;
function playClip(i){
  const v = vids[i];
  const p = v.play(); if (p && p.catch) p.catch(()=>{});
  v.classList.add('on'); cur = i;
}
vids[0].classList.add('on');
vids[0].addEventListener('error', () => { $('hero').style.background = '#1d1411 url(assets/video/jaipur-poster.jpg) center/cover'; });

/* ── Invitation sequence ── */
let opening = false;
function enter(){
  intro.classList.add('gone');
  document.body.classList.add('entered');
  document.documentElement.style.overflow = '';
  onScroll();
}
async function open(){
  if (opening) return; opening = true;
  clearTimeout(autoT);
  playClip(0);
  if (reduce){ intro.style.transition='opacity .3s'; intro.style.opacity='0'; await wait(300); enter(); return; }
  intro.classList.add('open');                  // seal splits, hint fades
  await foldFlap();                              // flap folds up and back
  await pull();                                  // card slides out and keeps rising until it is the screen
  const f = intro.animate([{opacity:1},{opacity:0}], {duration:450, easing:'ease-out', fill:'forwards'});
  await f.finished;
  enter();
}
const ease = t => -(Math.cos(Math.PI*t) - 1)/2;   // gentle sine in-out: no sudden burst mid-pull
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a)/(b - a))); return t*t*(3 - 2*t); };
const SEAL_OPEN = 'translate(-50%,-38%) rotate(-8deg)';

/* The flap folds flat over its top edge (no 3D, so nothing slices through the card).
   Outside face shows until it is edge-on, then the inside of the flap. Resolves just before the fold lands so the pull overlaps it. */
function foldFlap(){
  const flap = $('flap'), FD = 820, opt = {duration:FD, easing:'cubic-bezier(.5,0,.25,1)', fill:'forwards'};
  flap.animate([{transform:'scaleY(1)'},{transform:'scaleY(-1)'}], opt);
  const out = [{opacity:1},{opacity:1, offset:.5},{opacity:0, offset:.501},{opacity:0}];
  const inn = [{opacity:0},{opacity:0, offset:.5},{opacity:1, offset:.501},{opacity:1}];
  flap.querySelectorAll('.flap-face,.flap-line,.seal-top').forEach(el => el.animate(out, opt));
  flap.querySelector('.flap-in').animate(inn, opt);
  return wait(FD - 120).then(() => { flap.style.zIndex = 1; });
}

/* One unbroken motion, sampled from a single curve: the card's top edge travels steadily to the top of the screen
   while the envelope sinks and fades; growth eases in from zero, so there is no second "pop". */
function pull(){
  const r = card.getBoundingClientRect();
  const s = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.03;
  const dx = innerWidth/2 - (r.left + r.width/2), ty = -r.top;
  card.style.zIndex = 2;
  const D = 3000, N = 60;
  const K = {card:[], inner:[], front:[], back:[], flap:[], seal:[]};
  for (let i = 0; i <= N; i++){
    const t = i/N, p = ease(t), g = Math.pow(ss(.08, 1, p), 1.35), drop = ss(.06, .55, p), o = +(1 - drop).toFixed(4), y = (drop*34).toFixed(2);
    K.card.push({offset:t, transform:`translate(${(dx*g).toFixed(2)}px,${(ty*p).toFixed(2)}px) scale(${(1 + (s - 1)*g).toFixed(4)})`});
    K.inner.push({offset:t, opacity:+(1 - ss(.22, .55, p)).toFixed(4)});
    K.front.push({offset:t, opacity:o, transform:`translateY(${y}%)`});
    K.back.push({offset:t, opacity:o, transform:`translateY(${y}%)`});
    K.flap.push({offset:t, opacity:o, transform:`translateY(${(drop*60).toFixed(2)}%) scaleY(-1)`});
    K.seal.push({offset:t, opacity:o, transform:`${SEAL_OPEN} translateY(${(drop*140).toFixed(2)}%)`});
  }
  const opt = {duration:D, fill:'forwards'};
  const q = sel => intro.querySelector(sel);
  q('.env-front').animate(K.front, opt);
  q('.env-back').animate(K.back, opt);
  $('flap').animate(K.flap, opt);
  q('.seal-bot').animate(K.seal, opt);
  q('.card-inner').animate(K.inner, opt);
  return card.animate(K.card, opt).finished;
}
function resetIntro(){
  intro.getAnimations({subtree:true}).forEach(a => { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); });
  intro.className = 'intro'; intro.removeAttribute('style'); card.removeAttribute('style'); $('flap').removeAttribute('style');
  opening = false; document.documentElement.style.overflow = 'hidden';
  document.body.classList.remove('entered');
  location.hash = '#home'; scrollTo(0,0);
  autoT = setTimeout(open, 9000);
}
$('sealBtn').addEventListener('click', open);
$('env').addEventListener('click', open);
$('skip').addEventListener('click', ()=>{ clearTimeout(autoT); opening = true; playClip(0); enter(); });
addEventListener('keydown', e=>{ if (!intro.classList.contains('gone') && (e.key==='Enter' || e.key===' ')) { e.preventDefault(); open(); } });
$('replay').addEventListener('click', resetIntro);

let autoT;
document.documentElement.style.overflow = 'hidden'; autoT = setTimeout(open, 9000);

/* ── Header: clear over the film, solid on paper ── */
const views = ['home','about','services','destinations','process','work','gallery','investment','enquire','terms'];
const moved = {experiences:'services', portfolio:'work'};   // old prototype links
const anchors = {quiz:'destinations', standard:'services', meaning:'services', serve:'about', form:'enquire'};   // section → its page
let page = 'home';
const invite = $('invite'), fab = $('enqFab');
function onScroll(){
  const h = innerHeight;
  nav.classList.toggle('solid', page !== 'home' || scrollY > h - 70);
  // the white card rises inside the pocket as the pocket comes up
  const q = page === 'home' ? Math.min(1, Math.max(0, scrollY / h)) : 1;
  invite.style.setProperty('--lift', ((1 - q) * 160).toFixed(1) + 'px');
  if (page === 'home'){ const v = vids[cur]; if (scrollY > h * 1.3) { if (!v.paused) v.pause(); } else if (v.paused && document.body.classList.contains('entered')) { const pp = v.play(); if (pp && pp.catch) pp.catch(()=>{}); } }
  fab.classList.toggle('on', document.body.classList.contains('entered') && page !== 'enquire' && (page !== 'home' || scrollY > h * .55));
}
addEventListener('scroll', onScroll, {passive:true});

function route(){
  const h = location.hash.slice(1);
  if (moved[h]) { location.replace('#' + moved[h]); return; }
  page = views.includes(h) ? h : (anchors[h] || 'home');
  views.forEach(v=>$('v-'+v).classList.toggle('on', v===page));
  document.querySelectorAll('nav.links a, .menu-links a').forEach(a=>{ if (a.getAttribute('href')==='#'+page) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('ctaBand').hidden = page === 'enquire';
  document.body.classList.toggle('inner', page !== 'home');
  closeMenu(false); closePanel(false); closeLb(false);
  scrollTo({top:0, behavior:'instant'}); onScroll();   // resets --lift before any section is measured
  if (anchors[h]) { const el = $(h); if (el) scrollTo({top: el.getBoundingClientRect().top + scrollY - nav.offsetHeight - 16, behavior:'instant'}); }   // reading the rect forces layout of the newly shown page
  if (page==='home'){ const v=vids[cur]; const p=v.play(); if(p&&p.catch)p.catch(()=>{}); } else vids.forEach(v=>v.pause());
  onScroll();
}

/* Focus trap shared by the menu, the panel and the viewer */
function trap(box, e){
  const f = [...box.querySelectorAll('button, a[href], input, select, textarea')].filter(el => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
const lock = () => document.body.classList.toggle('menu-open', !menu.hidden || !panel.hidden || !lb.hidden);

/* ── Menu: full-screen paper overlay listing every page ── */
const menu = $('menu'), mb = $('menuBtn');
function openMenu(){
  menu.hidden = false; void menu.offsetWidth; menu.classList.add('on');   // reflow, so the fade starts from 0
  lock(); mb.setAttribute('aria-expanded', 'true');
  (menu.querySelector('[aria-current]') || menu.querySelector('.menu-links a')).focus();
}
function closeMenu(refocus = true){
  if (menu.hidden) return;
  menu.classList.remove('on'); mb.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!menu.classList.contains('on')) { menu.hidden = true; lock(); } }, reduce ? 0 : 350);
  if (refocus) mb.focus();
}
mb.addEventListener('click', openMenu);
$('menuClose').addEventListener('click', () => closeMenu());
// a link to the page already open does not fire hashchange, so close the menu here too
menu.querySelectorAll('.menu-links a').forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === '#' + page) closeMenu(); }));

/* ── Enquire tab + side panel ── */
const panel = $('enqPanel'), scrim = $('enqScrim');
function openPanel(){
  panel.hidden = false; scrim.hidden = false; void panel.offsetWidth; panel.classList.add('on'); scrim.classList.add('on');
  fab.setAttribute('aria-expanded', 'true'); lock();
  $('q-name').focus();
}
function closePanel(refocus = true){
  if (panel.hidden) return;
  panel.classList.remove('on'); scrim.classList.remove('on'); fab.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!panel.classList.contains('on')) { panel.hidden = true; scrim.hidden = true; lock(); } }, reduce ? 0 : 400);
  if (refocus) fab.focus();
}
fab.addEventListener('click', openPanel);
$('enqClose').addEventListener('click', () => closePanel());
scrim.addEventListener('click', () => closePanel());
$('enqFull').addEventListener('click', () => { if (page === 'enquire') closePanel(false); });
$('enqQuick').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('q-name').value.trim(), em = $('q-email').value.trim(), note = $('quickNote');
  if (!name || !/.+@.+\..+/.test(em)) { note.textContent = 'Add your names and a valid email so we can reply.'; return; }
  note.textContent = `Thank you, ${name}. This prototype doesn't send enquiries yet; on the live site a planner replies to arrange your call.`;
});

/* ── Gallery: placeholder tiles until photographs arrive. [ratio, kind, caption, src?] ── */
const G = [
  ['tall','Décor','Mandap'], ['wide','Rituals','Haldi'], ['sq','Families','Milni'], ['wide','Films','Wedding film'],
  ['sq','Venues','Lake palace'], ['tall','Rituals','Mehendi'], ['wide','Décor','Sangeet stage'], ['sq','Families','A parent’s blessing'],
  ['tall','Venues','Fort courtyard'], ['wide','Rituals','Baraat'], ['sq','Films','Sangeet film'], ['tall','Décor','Floral entrance'],
  ['wide','Families','Grandparents'], ['sq','Rituals','Pheras'], ['tall','Venues','Beach estate'], ['wide','Décor','Table setting'],
  ['sq','Films','Highlights'], ['tall','Families','Cousins'], ['wide','Venues','Haveli'], ['sq','Rituals','Vidaai'],
  ['wide','Décor','Reception lights'], ['tall','Families','First look'], ['sq','Venues','Garden lawn'], ['wide','Films','Guest arrivals']
];
const tileHTML = ([ratio, kind, cap, src], i) => `<button type="button" class="tile ${ratio}${kind==='Films'?' film':''}" data-i="${i}" data-kind="${kind}" data-cap="${cap}"${src?` data-src="${src}"`:''}${kind==='Films'&&src?' data-type="video"':''} aria-label="${cap}, ${kind === 'Films' ? 'film' : 'photo'} to come. Open in viewer">${src&&kind!=='Films'?`<img src="${src}" alt="${cap}" loading="lazy">`:''}<span class="tag">${kind}<span class="tc"> · ${kind==='Films'?'film':'photo'} to come</span></span>${kind==='Films'?'<span class="play" aria-hidden="true"></span>':''}</button>`;
const photos = G.map((g, i) => [g, i]).filter(([g]) => g[1] !== 'Films').slice(0, 9), films = G.map((g, i) => [g, i]).filter(([g]) => g[1] === 'Films').slice(0, 3);
const homeSet = [...photos.slice(0,3), films[0], ...photos.slice(3,6), films[1], ...photos.slice(6), films[2]];
$('homeGallery').innerHTML = homeSet.map(([g, i]) => tileHTML(g, i)).join('');
$('galleryGrid').innerHTML = G.map(tileHTML).join('');
document.querySelectorAll('.gfilter button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.gfilter button').forEach(x => x.setAttribute('aria-pressed', x === b));
  const k = b.dataset.k;
  $('galleryGrid').querySelectorAll('.tile').forEach(t => { t.hidden = k !== 'All' && t.dataset.kind !== k; });
}));

/* ── Viewer: any tile inside [data-gallery] ── */
const lb = $('lb'); let lbSet = [], lbI = 0, lbFrom = null;
function showLb(){
  const t = lbSet[lbI], kind = t.dataset.kind, src = t.dataset.src;
  $('lbStage').innerHTML = src ? (t.dataset.type === 'video' ? `<video src="${src}" controls autoplay playsinline></video>` : `<img src="${src}" alt="${t.dataset.cap}">`)
    : `<div class="plate ${t.classList.contains('tall')?'tall':t.classList.contains('wide')?'wide':'sq'}"><span class="tag">${kind} · ${kind==='Films'?'film':'photo'} to come</span></div>`;
  $('lbCap').textContent = t.dataset.cap; $('lbCount').textContent = `${lbI + 1} / ${lbSet.length}`;
}
function openLb(tile){
  lbFrom = tile; lbSet = [...tile.closest('[data-gallery]').querySelectorAll('.tile:not([hidden])')]; lbI = lbSet.indexOf(tile);
  showLb(); lb.hidden = false; void lb.offsetWidth; lb.classList.add('on'); lock(); $('lbClose').focus();
}
function closeLb(refocus = true){
  if (lb.hidden) return;
  lb.classList.remove('on'); $('lbStage').innerHTML = '';
  setTimeout(() => { if (!lb.classList.contains('on')) { lb.hidden = true; lock(); } }, reduce ? 0 : 300);
  if (refocus && lbFrom) lbFrom.focus();
}
const step = d => { lbI = (lbI + d + lbSet.length) % lbSet.length; showLb(); };
document.addEventListener('click', e => { const t = e.target.closest('[data-gallery] .tile'); if (t) openLb(t); });
$('lbClose').addEventListener('click', () => closeLb());
$('lbPrev').addEventListener('click', () => step(-1));
$('lbNext').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
let sx = null;
lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
lb.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); sx = null; });

/* Keyboard for every overlay: Esc closes, Tab stays inside, arrows move the viewer */
addEventListener('keydown', e => {
  const box = !lb.hidden ? lb : !panel.hidden ? panel : !menu.hidden ? menu : null;
  if (!box) return;
  if (e.key === 'Escape') { box === lb ? closeLb() : box === panel ? closePanel() : closeMenu(); }
  else if (e.key === 'Tab') trap(box, e);
  else if (box === lb && e.key === 'ArrowRight') step(1);
  else if (box === lb && e.key === 'ArrowLeft') step(-1);
});

/* ── Clocks: New Jersey and Udaipur, with the gap between them ── */
document.querySelectorAll('.clock .ticks').forEach(g => {
  g.innerHTML = Array.from({length:12}, (_, i) => `<line x1="50" y1="${i % 3 ? 7 : 5}" x2="50" y2="${i % 3 ? 10 : 12}" transform="rotate(${i*30} 50 50)"/>`).join('');
});
function tzParts(tz, d){
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:tz, hour:'numeric', minute:'numeric', hour12:false, year:'numeric', month:'numeric', day:'numeric'}).formatToParts(d).map(x => [x.type, x.value]));
  return {h: +p.hour % 24, m: +p.minute, utc: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute)};
}
function tick(){
  const d = new Date(), at = {};
  document.querySelectorAll('.clock').forEach(c => {
    const tz = c.dataset.tz, p = tzParts(tz, d); at[tz] = p.utc;
    c.querySelector('.hh').setAttribute('transform', `rotate(${(p.h % 12) * 30 + p.m / 2} 50 50)`);
    c.querySelector('.mm').setAttribute('transform', `rotate(${p.m * 6} 50 50)`);
    c.querySelector('.t').textContent = new Intl.DateTimeFormat('en-US', {timeZone:tz, hour:'numeric', minute:'2-digit'}).format(d);
  });
  const gap = (at['Asia/Kolkata'] - at['America/New_York']) / 3600000;
  const gh = Math.floor(gap), gm = Math.round((gap - gh) * 60);
  $('tzGap').textContent = gm === 0 ? `${gh} hours apart` : gm === 30 ? `${gh}½ hours apart` : `${gh} h ${gm} min apart`;
}
tick(); setInterval(tick, 30000);

/* ── Counters: count up once, when the row comes into view ── */
const counters = document.querySelectorAll('[data-count]');
if (!reduce && 'IntersectionObserver' in window){
  counters.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); });
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    const run = now => { const k = Math.min(1, (now - t0) / 1800), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v + suf; if (k < 1) requestAnimationFrame(run); };
    requestAnimationFrame(run);
  }), {threshold:.6});
  counters.forEach(el => io.observe(el));
}

/* ── Destination quiz: each destination scored on setting, feel, roots, season and scale ── */
const DEST = {
  Udaipur: {line:'The city of lakes and palaces',                       months:['oct','win','mar'], settings:{palace:3, heritage:1}, feel:{royal:3, intimate:1}, from:{north:2, west:2}, scale:'grand'},
  Jaipur:  {line:'The Pink City’s palaces, forts and gardens',           months:['oct','win','mar'], settings:{palace:3, fort:2},     feel:{royal:3},              from:{north:3, west:1}, scale:'grand'},
  Jodhpur: {line:'The Blue City, beneath a desert fort',                 months:['oct','win','mar'], settings:{fort:3, palace:1},     feel:{royal:2, intimate:1},  from:{north:2, west:1}},
  Goa:     {line:'Sea, sand and an unhurried coastal rhythm',            months:['win'],             settings:{beach:3},              feel:{relaxed:3, intimate:1},from:{west:2, south:1},  scale:'intimate'},
  Kerala:  {line:'Backwaters, palms and a quieter kind of luxury',       months:['sep','oct','win','mar'], settings:{backwater:3, beach:2, heritage:1}, feel:{intimate:3, relaxed:2}, from:{south:3}, scale:'intimate'},
  Gujarat: {line:'Heritage homes, and for many families, a homecoming', months:['win'],             settings:{heritage:3, palace:2}, feel:{homecoming:3, royal:1},from:{west:3}}
};
const SEASON = {Udaipur:'October to March', Jaipur:'October to March', Jodhpur:'October to March', Goa:'November to February', Kerala:'September to March', Gujarat:'November to February'};
const MAX = 3 + 3 + 3 + 2 + 1;
function rankQuiz(a){
  return Object.entries(DEST).map(([name, d]) => {
    const inSeason = a.month === 'any' || d.months.includes(a.month);
    let s = (d.settings[a.setting] || 0) + (d.feel[a.feel] || 0) + (a.from === 'any' ? 2 : (d.from[a.from] || 0)) + (inSeason ? 2 : 0);
    if ((a.guests === 's' && d.scale === 'intimate') || ((a.guests === 'l' || a.guests === 'xl') && d.scale === 'grand') || (a.guests === 'm' && !d.scale)) s += 1;
    return {name, pct: Math.round(s / MAX * 100), inSeason};
  }).sort((x, y) => y.pct - x.pct);
}
let quiz = null;
const row = (d, top) => `<li><strong>${d.name}</strong><span>${DEST[d.name].line} · ${SEASON[d.name]}${d.inSeason ? '' : ' · outside your months'}</span><em>${d.pct}% match${top ? ' · closest' : ''}</em></li>`;
$('quizForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target), a = Object.fromEntries(['guests','month','setting','feel','from','band'].map(k => [k, fd.get(k)])), out = $('quizOut');
  if (Object.values(a).some(v => v === null)){ out.innerHTML = '<p class="note">Answer all six questions and we’ll match your destinations.</p>'; return; }
  const r = rankQuiz(a); quiz = {a, r, email: quiz && quiz.email};
  out.innerHTML = `<span class="label">Your matches</span>
    <ol>${row(r[0], true)}</ol>
    <div class="gated${quiz.email ? ' open' : ''}" id="gated"><ol aria-hidden="${quiz.email ? 'false' : 'true'}">${r.slice(1).map(d => row(d)).join('')}</ol>
      <div class="gate" id="gate"><label>Add your email to see all six matches<input type="email" id="gateEmail" autocomplete="email" placeholder="you@example.com"></label><button type="button" class="link" id="gateBtn">Show all my matches <span class="ar">→</span></button><p class="note" id="gateNote" role="status"></p></div>
    </div>
    <p class="muted small">${a.band ? `With the ${a.band} collection in mind, a` : 'A'} planner follows up with a shortlist of venues.</p>
    <a class="link" href="#enquire" id="quizToForm">Get my venue shortlist <span class="ar">→</span></a>`;
  $('gateBtn').addEventListener('click', unlock);
  $('gateEmail').addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); unlock(); } });
  $('quizToForm').addEventListener('click', () => {   // carry the answers into the enquiry form
    const picks = quiz.email ? quiz.r.filter(d => d.inSeason).slice(0, 3).map(d => d.name) : [quiz.r[0].name];
    document.querySelectorAll('#f-dests input').forEach(i => { i.checked = picks.includes(i.value); });
    const opt = [...$('f-band').options].find(o => quiz.a.band && o.text.startsWith(quiz.a.band)); if (opt) $('f-band').value = opt.value;
    if (quiz.email) $('f-email').value = quiz.email;
  });
});
function unlock(){
  const em = $('gateEmail').value.trim();
  if (!/.+@.+\..+/.test(em)) { $('gateNote').textContent = 'Add a valid email to see the rest.'; return; }
  quiz.email = em;
  const g = $('gated'); g.classList.add('open'); g.querySelector('ol').setAttribute('aria-hidden', 'false');
  $('gateNote').textContent = 'This prototype doesn’t store your email. On the live site a planner follows up with your shortlist.';
}

$('enqForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('f-name').value.trim(), em = $('f-email').value.trim(), note = $('formNote');
  if (!name || !/.+@.+\..+/.test(em)) { note.textContent = 'Add your names and a valid email so we can reply.'; return; }
  note.textContent = `Thank you, ${name}. This prototype doesn't send enquiries yet; on the live site this goes straight to the Unify team, and a planner replies within two business hours.`;
});

/* Routing runs last: it calls closePanel() and closeLb(), defined above */
addEventListener('hashchange', route); route();
})();
