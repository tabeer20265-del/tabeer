/* ═══════════════════════════════════════
   TABEER — shared behaviour
   الحقول ترسل إلى Google Apps Script
   ═══════════════════════════════════════ */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRrO7qnyl2EYWtL9fpnEKbrUHf2wLUBzcNS5Var6eU7XIeHiveR_MSzph9eyTM_tW3/exec';

/* ── CURSOR ───────────────────────────── */
(function(){
  const dot = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if(!dot || !ring) return;
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
    const el = document.elementFromPoint(mx, my);
    const dark = el && (
      el.closest('.ticker') || el.closest('.contact-hero') ||
      el.closest('footer') || el.closest('.contact-info-side') ||
      el.closest('.quote-card') || el.closest('.pay-sec') ||
      el.closest('[style*="background:var(--black)"]') ||
      el.closest('[style*="background:#000"]')
    );
    dot.classList.toggle('light', !!dark);
    ring.classList.toggle('light', !!dark);
  });
  function animRing(){
    rx += (mx-rx) * .11;
    ry += (my-ry) * .11;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  document.addEventListener('mouseleave', () => { dot.style.opacity='0'; ring.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity='1'; ring.style.opacity='1'; });
})();

/* ── HEADER SCROLL ───────────────────── */
window.addEventListener('scroll', () => {
  const h = document.getElementById('hdr');
  if(h) h.classList.toggle('scrolled', window.scrollY > 80);
}, {passive:true});

/* ── MOBILE NAV ──────────────────────── */
function toggleMobileNav(){
  const nav = document.getElementById('mNav');
  const btn = document.getElementById('hamBtn');
  const open = nav.classList.toggle('open');
  btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/* ── CONTACT FORM → GOOGLE SHEETS ────── */
async function submitContact(e){
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('sendStatus');
  const data = {
    type: 'contact',
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    message: form.message.value,
    date: new Date().toLocaleString('ar-SA')
  };
  btn.disabled = true;
  btn.textContent = 'جاري الإرسال...';
  if(status) status.style.display = 'inline';
  try {
    await fetch(APPS_SCRIPT_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(data)
    });
    document.getElementById('fWrap').style.display = 'none';
    document.getElementById('fSuccess').style.display = 'block';
  } catch(err){
    btn.disabled = false;
    btn.textContent = 'إرسال الرسالة';
    if(status) status.style.display = 'none';
    alert('حدث خطأ، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.');
  }
}

/* ── SCROLL REVEAL ───────────────────── */
(function revealAll(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('v'); obs.unobserve(e.target); }
    });
  }, {threshold:.1});
  document.querySelectorAll('.r,.r-l,.r-r').forEach(el => obs.observe(el));
})();

/* ── NEWSLETTER ──────────────────────── */
document.querySelectorAll('.ft-sub-b').forEach(btn => {
  btn.addEventListener('click', async function() {
    const input = this.previousElementSibling;
    const email = input.value.trim();
    if (!email || !email.includes('@')) { input.focus(); return; }
    this.textContent = '...';
    this.disabled = true;
    try {
      await fetch(APPS_SCRIPT_URL, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify({type:'newsletter', email})
      });
      input.value = '';
      this.textContent = 'تم ✓';
      setTimeout(() => { this.textContent = 'اشتراك'; this.disabled = false; }, 3000);
    } catch(e) {
      this.textContent = 'اشتراك';
      this.disabled = false;
    }
  });
});
