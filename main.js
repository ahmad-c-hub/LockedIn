/* ============================================================
   LockedIn Website  Shared JS
   ============================================================ */

/*  Mobile nav toggle  */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  /* highlight active nav link */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* scroll reveal */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* counter animation */
  animateCounters();

  /* star canvas */
  initCanvas();
});

/*  Counter animation  */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1600;
      const start = performance.now();
      const update = now => {
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        el.textContent = prefix + Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/*  Progress bars  */
function animateProgressBars() {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          bar.style.width = bar.dataset.width || '0%';
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(bar);
  });
}
document.addEventListener('DOMContentLoaded', animateProgressBars);

/*  Particle canvas  */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['rgba(123,111,255,', 'rgba(91,143,255,', 'rgba(236,72,153,'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.6 + 0.2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.a + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/*  Smooth tab switching  */
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const tabs = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector('#' + tab.dataset.tab)?.classList.add('active');
    });
  });
}
document.addEventListener('DOMContentLoaded', () => initTabs('.tabs-container'));
