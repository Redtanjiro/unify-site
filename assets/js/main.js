(()=>{
const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro = $('intro'), card = $('card'), nav = $('nav');
const wait = ms => new Promise(r => setTimeout(r, ms));

/* Monogram: load the logo file once and inline it so it can take any brand colour (gold on the seal, ivory on film, maroon on paper) */
const MONO = 'assets/logo/unify-monogram.svg';
fetch(MONO).then(r => r.ok ? r.text() : Promise.reject()).then(txt => {
  const svg = txt.replace(/<\?xml[^>]*>/,'')
    .replace(/fill="(?!none)[^"]*"/g,'fill="currentColor"')
    .replace(/fill:\s*#[0-9a-fA-F]{3,6}/g,'fill:currentColor');
  document.querySelectorAll('.mono').forEach(el => {
    el.innerHTML = svg;
    const s = el.querySelector('svg'); if (s){ s.removeAttribute('width'); s.removeAttribute('height'); s.setAttribute('aria-hidden','true'); s.setAttribute('preserveAspectRatio','xMidYMid meet'); }
  });
}).catch(() => {
  document.querySelectorAll('.mono').forEach(el => { el.innerHTML = '<img alt="" src="assets/logo/unify-monogram-ivory.svg">'; });
});

/* ── Hero film: two clips cross-fade in a loop ── */
const vids = [$('vidA')]; let cur = 0;
function playClip(i){
  const v = vids[i];
  const p = v.play(); if (p && p.catch) p.catch(()=>{});
  v.classList.add('on'); cur = i;
}
vids[0].classList.add('on');
vids.forEach(v => v.addEventListener('error', () => { $('hero').style.background = '#1d1411 url(assets/video/jaipur-poster.jpg) center/cover'; }));

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
const views = ['home','about','experiences','portfolio','enquire'];
let page = 'home';
const invite = $('invite');
function onScroll(){
  const h = innerHeight;
  nav.classList.toggle('solid', page !== 'home' || scrollY > h - 70);
  // the white card rises inside the pocket as the pocket comes up
  const q = page === 'home' ? Math.min(1, Math.max(0, scrollY / h)) : 1;
  invite.style.setProperty('--lift', ((1 - q) * 160).toFixed(1) + 'px');
  if (page === 'home'){ const v = vids[cur]; if (scrollY > h * 1.3) { if (!v.paused) v.pause(); } else if (v.paused && document.body.classList.contains('entered')) { const pp = v.play(); if (pp && pp.catch) pp.catch(()=>{}); } }
}
addEventListener('scroll', onScroll, {passive:true});

function route(){
  page = views.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  views.forEach(v=>$('v-'+v).classList.toggle('on', v===page));
  document.querySelectorAll('nav.links a').forEach(a=>{ if (a.getAttribute('href')==='#'+page) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('ctaBand').hidden = page === 'enquire';
  document.body.classList.toggle('inner', page !== 'home');
  $('navLinks').classList.remove('open');
  scrollTo({top:0, behavior:'instant'});
  if (page==='home'){ const v=vids[cur]; const p=v.play(); if(p&&p.catch)p.catch(()=>{}); } else vids.forEach(v=>v.pause());
  onScroll();
}
addEventListener('hashchange', route); route();

const mb = $('menuBtn');
mb.addEventListener('click',()=>{ const o = $('navLinks').classList.toggle('open'); mb.setAttribute('aria-expanded', o); nav.classList.add('solid'); if(!o) onScroll(); });

$('enqForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('f-name').value.trim(), em = $('f-email').value.trim(), note = $('formNote');
  if (!name || !/.+@.+\..+/.test(em)) { note.textContent = 'Add your name and a valid email so we can reply.'; return; }
  note.textContent = `Thank you, ${name}. This prototype doesn't send enquiries yet; on the live site this goes straight to the Unify team.`;
});
})();
