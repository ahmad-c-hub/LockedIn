/* ============================================================
   LockedIn Website — Shared JS
   ============================================================ */

let _rafId = null; // active canvas animation frame

/* ---- Bootstrap: runs once, survives all navigation ---- */
setupFullscreen();
setupRouter();
initPage();

/* ---- SPA Router ---- */
function setupRouter() {
  // Intercept internal link clicks
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (isInternalLink(href)) {
      e.preventDefault();
      spaNavigate(href);
    }
  });

  // Browser back / forward
  window.addEventListener('popstate', () => {
    spaNavigate(location.pathname.split('/').pop() || 'index.html', false);
  });
}

function isInternalLink(href) {
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto')) return false;
  const path = href.split('#')[0];
  return path.length > 0 && path.endsWith('.html');
}

function spaNavigate(url, pushState = true) {
  const [path, hash] = url.split('#');
  fetch(path)
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Swap page-specific inline styles
      document.querySelectorAll('style').forEach(s => s.remove());
      doc.querySelectorAll('style').forEach(s => document.head.appendChild(s.cloneNode(true)));

      // Swap body content
      document.body.innerHTML = doc.body.innerHTML;
      document.title = doc.title;

      if (pushState) history.pushState(null, doc.title, path);

      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }

      initPage();
    })
    .catch(() => { window.location.href = url; });
}

/* ---- Per-page init (re-called on every navigation) ---- */
function initPage() {
  // Cancel previous canvas loop
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }

  // Mobile nav toggle
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }

  // Highlight active nav link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });

  // Sync fullscreen icon after body swap
  const inFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
  document.body.classList.toggle('is-fullscreen', inFS);

  // Scroll reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  animateCounters();
  animateProgressBars();
  initCanvas();
  initTabs('.tabs-container');
}

/* ---- Fullscreen (one-time setup, event delegation survives body swaps) ---- */
function setupFullscreen() {
  const el = document.documentElement;
  const requestFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  const exitFS    = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  const getFS     = () => document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

  document.addEventListener('click', e => {
    if (!e.target.closest('#fullscreenBtn')) return;
    if (!getFS()) {
      requestFS && requestFS.call(el).catch(() => {});
    } else {
      exitFS && exitFS.call(document).catch(() => {});
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(ev => {
    document.addEventListener(ev, () => {
      document.body.classList.toggle('is-fullscreen', !!getFS());
    });
  });
}

/* ---- Counter animation ---- */
function animateCounters() {
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
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* ---- Progress bars ---- */
function animateProgressBars() {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { bar.style.width = bar.dataset.width || '0%'; obs.unobserve(bar); }
      });
    }, { threshold: 0.5 });
    obs.observe(bar);
  });
}

/* ---- Particle canvas ---- */
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

  const colors = ['rgba(57,255,136,', 'rgba(0,224,168,', 'rgba(0,255,204,'];
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
    _rafId = requestAnimationFrame(draw);
  }
  draw();
}

/* ---- Tabs ---- */
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
