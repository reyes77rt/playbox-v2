/* ════════════════════════════════════════════════════════════
   PLAYBOX — script.js  v3.0
   Módulos:
     00 · Bootstrap & Lucide
     01 · Cursor personalizado
     02 · Navbar scroll + active link
     03 · Mobile menu
     04 · Scroll Reveal (IntersectionObserver)
     05 · Hero — contador animado de jugadores
     06 · Leaderboard dinámico
     07 · Galería (filtros + lightbox)
     08 · FAQ acordeón
     09 · Mini-juego Sobreviviente Pixel (Canvas)
     10 · Newsletter
     11 · Back-to-top
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   00 · BOOTSTRAP
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Inicializar Lucide Icons (si están disponibles)
  if (window.lucide) lucide.createIcons();

  initCursor();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initPlayerCounter();
  initLeaderboard();
  initGallery();
  initFAQ();
  initMiniGame();
  initNewsletter();
  initBackToTop();

});


/* ─────────────────────────────────────────────────
   01 · CURSOR PERSONALIZADO
───────────────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Sólo activar en dispositivos con puntero fino (no táctil)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // El punto sigue instantáneo
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // El anillo sigue con lag suave
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expandir anillo sobre elementos interactivos
  const interactiveSelector = 'a, button, [role="button"], input, .gallery-item, .feat-glass, .faq-trigger';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.style.width  = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'var(--cyan)';
      dot.style.background   = 'var(--neon)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'var(--neon)';
      dot.style.background   = 'var(--cyan)';
    }
  });

  // Ocultar cursor al salir de la ventana
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}


/* ─────────────────────────────────────────────────
   02 · NAVBAR — scroll + active link
───────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const navLinks = navbar.querySelectorAll('.nav-link');

  // Scroll → clase "scrolled"
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveLink();
  }

  // Active link basado en sección visible
  const sections = document.querySelectorAll('section[id]');
  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // ejecutar al cargar

  // Cerrar menú móvil al hacer clic en un nav-link
  navLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}


/* ─────────────────────────────────────────────────
   03 · MOBILE MENU
───────────────────────────────────────────────── */
let mobileMenuOpen = false;

function closeMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  mobileMenuOpen = false;
  toggle.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;
    toggle.classList.toggle('is-open', mobileMenuOpen);
    toggle.setAttribute('aria-expanded', mobileMenuOpen);
    menu.classList.toggle('is-open', mobileMenuOpen);
    menu.setAttribute('aria-hidden', !mobileMenuOpen);
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenuOpen) closeMobileMenu();
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (mobileMenuOpen && !toggle.contains(e.target) && !menu.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Cerrar al seleccionar enlace móvil
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}


/* ─────────────────────────────────────────────────
   04 · SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────────────── */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  // Respetar prefers-reduced-motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Mostrar todo de inmediato sin animar
    targets.forEach(el => {
      el.style.opacity  = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;

          // Respetar el delay declarado en el CSS o en el atributo
          const delay = parseFloat(getComputedStyle(el).getPropertyValue('--anim-delay') || 0) * 1000;

          setTimeout(() => {
            el.classList.add('is-visible');
          }, delay || 0);

          observer.unobserve(el); // sólo una vez
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  targets.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────────────
   05 · HERO — contador animado de jugadores
───────────────────────────────────────────────── */
function initPlayerCounter() {
  const el = document.getElementById('hero-players');
  if (!el) return;

  const target = 6700;
  const duration = 2200; // ms
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOutQuart(progress) * target);
    el.textContent = value.toLocaleString('es-MX');
    if (progress < 1) requestAnimationFrame(tick);
  }

  // Arrancar cuando el hero sea visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(tick);
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  const hero = document.getElementById('hero');
  if (hero) observer.observe(hero);
}


/* ─────────────────────────────────────────────────
   06 · LEADERBOARD DINÁMICO
───────────────────────────────────────────────── */

// ── Datos mock realistas (6,700 jugadores totales) ──
const LB_DATA = {
  global: [
    { rank:1,  name:'ThangX_MX',     country:'🇲🇽', avatar:'TX', pts:98_420, level:52, streak:18, badge:'legend' },
    { rank:2,  name:'NeonKnight',     country:'🇯🇵', avatar:'NK', pts:91_750, level:49, streak:11, badge:'legend' },
    { rank:3,  name:'BeatRaider',     country:'🇧🇷', avatar:'BR', pts:87_200, level:47, streak:7,  badge:'elite'  },
    { rank:4,  name:'FreqHunter',     country:'🇩🇪', avatar:'FH', pts:82_300, level:45, streak:14, badge:'elite'  },
    { rank:5,  name:'SoundBreaker',   country:'🇺🇸', avatar:'SB', pts:79_100, level:44, streak:9,  badge:'elite'  },
    { rank:6,  name:'PixelPulse',     country:'🇦🇷', avatar:'PP', pts:74_600, level:42, streak:5,  badge:'gold'   },
    { rank:7,  name:'CyberBeat',      country:'🇰🇷', avatar:'CB', pts:71_050, level:41, streak:3,  badge:'gold'   },
    { rank:8,  name:'GlitchRider',    country:'🇨🇱', avatar:'GR', pts:67_840, level:39, streak:6,  badge:'gold'   },
    { rank:9,  name:'WaveDestroyer',  country:'🇪🇸', avatar:'WD', pts:63_200, level:37, streak:2,  badge:'silver' },
    { rank:10, name:'RhythmPhantom',  country:'🇫🇷', avatar:'RP', pts:59_700, level:36, streak:4,  badge:'silver' },
  ],
  regional: [
    { rank:1,  name:'ThangX_MX',     country:'🇲🇽', avatar:'TX', pts:98_420, level:52, streak:18, badge:'legend' },
    { rank:2,  name:'BeatRaider',     country:'🇧🇷', avatar:'BR', pts:87_200, level:47, streak:7,  badge:'elite'  },
    { rank:3,  name:'PixelPulse',     country:'🇦🇷', avatar:'PP', pts:74_600, level:42, streak:5,  badge:'gold'   },
    { rank:4,  name:'GlitchRider',    country:'🇨🇱', avatar:'GR', pts:67_840, level:39, streak:6,  badge:'gold'   },
    { rank:5,  name:'SalsaBeat',      country:'🇨🇴', avatar:'SL', pts:61_200, level:38, streak:3,  badge:'silver' },
    { rank:6,  name:'LimaTech',       country:'🇵🇪', avatar:'LT', pts:55_900, level:35, streak:1,  badge:'silver' },
    { rank:7,  name:'CaracasRhythm',  country:'🇻🇪', avatar:'CR', pts:50_400, level:33, streak:8,  badge:'silver' },
    { rank:8,  name:'BuenosBeats',    country:'🇦🇷', avatar:'BB', pts:46_100, level:31, streak:2,  badge:'silver' },
    { rank:9,  name:'SonidoUY',       country:'🇺🇾', avatar:'SU', pts:41_800, level:30, streak:4,  badge:'silver' },
    { rank:10, name:'LaPazBeat',      country:'🇧🇴', avatar:'LB', pts:38_200, level:28, streak:1,  badge:'silver' },
  ],
  amigos: [
    { rank:1,  name:'ThangX_MX',     country:'🇲🇽', avatar:'TX', pts:98_420, level:52, streak:18, badge:'legend', isYou:true },
    { rank:2,  name:'NeonKnight',     country:'🇯🇵', avatar:'NK', pts:91_750, level:49, streak:11, badge:'legend' },
    { rank:3,  name:'SoundBreaker',   country:'🇺🇸', avatar:'SB', pts:79_100, level:44, streak:9,  badge:'elite'  },
    { rank:4,  name:'PixelPulse',     country:'🇦🇷', avatar:'PP', pts:74_600, level:42, streak:5,  badge:'gold'   },
    { rank:5,  name:'GlitchRider',    country:'🇨🇱', avatar:'GR', pts:67_840, level:39, streak:6,  badge:'gold'   },
  ],
};

const BADGE_MAP = {
  legend: 'lb-badge--legend',
  elite:  'lb-badge--elite',
  gold:   'lb-badge--gold',
  silver: 'lb-badge--silver',
};
const BADGE_LABEL = {
  legend: 'LEYENDA',
  elite:  'ÉLITE',
  gold:   'ORO',
  silver: 'PLATA',
};

// Colores de avatar generados por nombre
function avatarColor(name) {
  const colors = ['#FF6B00','#00F5FF','#FF2233','#FF00AA','#AAFF00','#a855f7','#f59e0b','#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Formato de puntos con separador de miles
function fmtPts(n) { return n.toLocaleString('es-MX'); }

// Construir pódium top-3
function buildPodium(data) {
  const podiumEl = document.getElementById('lb-podium');
  if (!podiumEl) return;

  const top3 = data.slice(0, 3);
  // Orden visual: 2° · 1° · 3°
  const order = [top3[1], top3[0], top3[2]];
  const podiumClass = ['podium-card--2nd', 'podium-card--1st', 'podium-card--3rd'];
  const borderColors = ['rgba(180,180,180,.5)', 'var(--neon)', 'rgba(180,100,40,.5)'];
  const ptColors      = ['var(--gray-400)',      'var(--neon)', '#b45309'];
  const rankColors    = ['var(--gray-400)',      'var(--neon)', '#b45309'];
  const crownHTML     = ['', '<div class="crown" aria-hidden="true">👑</div>', ''];

  podiumEl.innerHTML = order.map((p, i) => {
    const color = avatarColor(p.name);
    const glowStyle = i === 1
      ? `box-shadow:0 0 0 3px var(--neon),0 0 18px rgba(255,107,0,.35);animation:neonPulse 2.5s ease-in-out infinite;`
      : '';
    return `
      <div class="podium-card ${podiumClass[i]}" role="listitem">
        ${crownHTML[i]}
        <div class="podium-rank" style="color:${rankColors[i]}">${p.rank}</div>
        <div class="podium-avatar ${i === 1 ? 'podium-avatar--lg' : ''}"
             style="border-color:${borderColors[i]};${glowStyle}">
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                      background:${color}22;font-family:'Orbitron',sans-serif;font-weight:900;
                      font-size:.75rem;color:${color};">
            ${p.avatar}
          </div>
        </div>
        <div class="podium-name">${p.name}</div>
        <div class="podium-pts" style="color:${ptColors[i]}">${fmtPts(p.pts)}</div>
        <div class="podium-flag">${p.country}</div>
      </div>`;
  }).join('');
}

// Construir filas de la tabla (posiciones 4-10)
function buildTableRows(data) {
  const tbody = document.getElementById('lb-body');
  if (!tbody) return;

  const rows = data.slice(3);
  tbody.innerHTML = '';

  rows.forEach((p, idx) => {
    const isTop = p.rank <= 3;
    const color = avatarColor(p.name);
    const highlightClass = p.isYou ? 'lb-row--highlight' : '';

    const tr = document.createElement('tr');
    tr.className = `lb-row ${highlightClass}`;
    tr.innerHTML = `
      <td class="lb-td lb-td--center">
        <span class="lb-td-rank ${isTop ? 'is-top' : ''}">${p.rank}</span>
      </td>
      <td class="lb-td">
        <div class="lb-player">
          <div class="lb-avatar"
               style="display:flex;align-items:center;justify-content:center;
                      background:${color}22;font-family:'Orbitron',sans-serif;
                      font-weight:900;font-size:.58rem;color:${color};">
            ${p.avatar}
          </div>
          <div>
            <div class="lb-name">${p.isYou ? '★ ' : ''}${p.name}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--gray-500);">${p.country}</div>
          </div>
        </div>
      </td>
      <td class="lb-td lb-td--right lb-hide-xs">
        <span class="lb-pts ${isTop ? 'is-top' : ''}">${fmtPts(p.pts)}</span>
      </td>
      <td class="lb-td lb-td--center lb-hide-sm">
        <span style="font-family:'Orbitron',sans-serif;font-size:.7rem;color:var(--white);">Lv.${p.level}</span>
      </td>
      <td class="lb-td lb-td--center">
        <span class="lb-streak">
          🔥 ${p.streak}
        </span>
      </td>
      <td class="lb-td lb-td--right">
        <span class="lb-badge ${BADGE_MAP[p.badge]}">${BADGE_LABEL[p.badge]}</span>
      </td>`;

    // Animación escalonada de entrada
    tr.style.opacity = '0';
    tr.style.transform = 'translateY(10px)';
    tbody.appendChild(tr);

    requestAnimationFrame(() => {
      setTimeout(() => {
        tr.style.transition = 'opacity .35s ease, transform .35s ease';
        tr.style.opacity    = '1';
        tr.style.transform  = 'translateY(0)';
      }, idx * 55);
    });
  });
}

function renderLeaderboard(tabKey) {
  const data = LB_DATA[tabKey] || LB_DATA.global;
  buildPodium(data);
  buildTableRows(data);
}

// Simulación de actualización en vivo (micro-cambios de puntos)
function startLiveUpdates() {
  setInterval(() => {
    const tab = document.querySelector('.lb-tab--active');
    if (!tab) return;
    const key = tab.dataset.tab || 'global';
    const data = LB_DATA[key];

    // Fluctuar puntos de posiciones 4-10 aleatoriamente
    for (let i = 3; i < data.length; i++) {
      const delta = Math.floor(Math.random() * 120) - 40; // -40 a +80
      data[i].pts = Math.max(1000, data[i].pts + delta);
    }

    // Re-ordenar (excluyendo top-3)
    const stable = data.slice(0, 3);
    const rest   = data.slice(3).sort((a, b) => b.pts - a.pts);
    rest.forEach((p, i) => { p.rank = i + 4; });

    LB_DATA[key] = [...stable, ...rest];
    buildTableRows(LB_DATA[key]);
  }, 4500); // cada 4.5 segundos
}

function initLeaderboard() {
  const tabs = document.querySelectorAll('.lb-tab');
  if (!tabs.length) return;

  // Render inicial
  renderLeaderboard('global');
  startLiveUpdates();

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('lb-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('lb-tab--active');
      tab.setAttribute('aria-selected', 'true');
      renderLeaderboard(tab.dataset.tab);
    });
  });
}


/* ─────────────────────────────────────────────────
   07 · GALERÍA — filtros + lightbox
───────────────────────────────────────────────── */
function initGallery() {
  // ── Filtros ──
  const filters = document.querySelectorAll('.gallery-filter');
  const items   = document.querySelectorAll('.gallery-item');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach(item => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        item.style.transition = 'opacity .35s, transform .35s';
        if (show) {
          item.style.opacity   = '1';
          item.style.transform = 'scale(1)';
          item.style.pointerEvents = 'auto';
        } else {
          item.style.opacity   = '0';
          item.style.transform = 'scale(.95)';
          item.style.pointerEvents = 'none';
        }
      });
    });
  });

  // ── Lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbClose  = document.getElementById('lightbox-close');

  if (!lightbox || !lbImg) return;

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Abrir al hacer clic en cualquier imagen de galería
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-img');
      if (img) openLightbox(img.src, img.alt);
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}


/* ─────────────────────────────────────────────────
   08 · FAQ ACORDEÓN
───────────────────────────────────────────────── */
function initFAQ() {
  const accordion = document.getElementById('faq-accordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel   = item.querySelector('.faq-panel');
    const icon    = item.querySelector('.faq-icon');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Cerrar todos los demás
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-panel')?.classList.remove('is-open');
          other.querySelector('.faq-icon')?.classList.remove('is-rotated');
        }
      });

      // Toggle del actual
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
      panel.classList.toggle('is-open', !isOpen);
      icon?.classList.toggle('is-rotated', !isOpen);
    });
  });
}


/* ─────────────────────────────────────────────────
   09 · MINI-JUEGO — Sobreviviente Pixel
───────────────────────────────────────────────── */
function initMiniGame() {
  const canvas  = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Referencias UI ──
  const scoreEl    = document.getElementById('game-score');
  const levelEl    = document.getElementById('game-level');
  const hiscoreEl  = document.getElementById('game-hiscore');
  const livesEl    = document.getElementById('game-lives');
  const overlay    = document.getElementById('game-overlay');
  const overEl     = document.getElementById('game-over-overlay');
  const pauseEl    = document.getElementById('game-pause-overlay');
  const finalScore = document.getElementById('final-score');
  const finalHi    = document.getElementById('final-hiscore');
  const startBtn   = document.getElementById('game-start-btn');
  const restartBtn = document.getElementById('game-restart-btn');
  const resumeBtn  = document.getElementById('game-resume-btn');
  const btnLeft    = document.getElementById('btn-left');
  const btnRight   = document.getElementById('btn-right');
  const btnJump    = document.getElementById('btn-jump');

  // ── Paleta de colores ──
  const C = {
    void:     '#030303',
    neon:     '#FF6B00',
    cyan:     '#00F5FF',
    electric: '#FF2233',
    acid:     '#AAFF00',
    plasma:   '#FF00AA',
    grid:     'rgba(0,245,255,0.04)',
    ground:   '#111111',
  };

  // ── Estado del juego ──
  const W = 800, H = 340;
  const GROUND_Y   = H - 50;
  const GRAVITY    = 0.55;
  const JUMP_FORCE = -13;

  let gameState = 'idle'; // idle | running | paused | over
  let score     = 0;
  let hiScore   = parseInt(localStorage.getItem('pb_hiscore') || '0');
  let lives     = 3;
  let level     = 1;
  let speed     = 5;
  let frameCount= 0;
  let rafId;

  // ── Jugador ──
  const player = {
    x: 100, y: GROUND_Y,
    w: 28,  h: 40,
    vy: 0,
    onGround: true,
    color: C.neon,
    trailColor: 'rgba(255,107,0,0.25)',
    invincible: false,
    invTimer: 0,
    trail: [],
  };

  // ── Obstáculos y partículas ──
  let obstacles  = [];
  let particles  = [];
  let bgStars    = [];
  let beatPulse  = 0;
  let beatTimer  = 0;

  // ── Input state ──
  const keys = { left: false, right: false, jump: false };

  // ── Inicializar estrellas de fondo ──
  function initStars() {
    bgStars = [];
    for (let i = 0; i < 60; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * GROUND_Y,
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }
  }

  // ── Reset completo ──
  function resetGame() {
    score      = 0;
    lives      = 3;
    level      = 1;
    speed      = 5;
    frameCount = 0;
    obstacles  = [];
    particles  = [];

    player.x         = 100;
    player.y         = GROUND_Y;
    player.vy        = 0;
    player.onGround  = true;
    player.invincible = false;
    player.invTimer   = 0;
    player.trail      = [];

    updateHUD();
  }

  // ── HUD ──
  function updateHUD() {
    if (scoreEl)   scoreEl.textContent   = String(score).padStart(6, '0');
    if (levelEl)   levelEl.textContent   = String(level).padStart(2, '0');
    if (hiscoreEl) hiscoreEl.textContent = String(hiScore).padStart(6, '0');
    if (livesEl) {
      livesEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('i');
        heart.className = `fa-solid fa-heart text-sm ${i < lives ? 'text-electric' : 'text-gray-700'}`;
        livesEl.appendChild(heart);
      }
    }
  }

  // ── Overlays ──
  function showOverlay(el) {
    [overlay, overEl, pauseEl].forEach(o => o && o.classList.add('hidden'));
    if (el) el.classList.remove('hidden');
  }

  // ── Spawn obstáculos ──
  function spawnObstacle() {
    const types = ['spike', 'block', 'wall'];
    const type  = types[Math.floor(Math.random() * types.length)];
    let h, w, color;

    if (type === 'spike') {
      w = 20; h = 28; color = C.electric;
    } else if (type === 'block') {
      w = 30 + Math.random() * 20;
      h = 22 + Math.random() * 22;
      color = C.plasma;
    } else {
      w = 18; h = 50 + Math.random() * 30; color = C.cyan;
    }

    obstacles.push({
      x: W + 10, y: GROUND_Y + player.h - h,
      w, h, type, color,
      passed: false,
    });
  }

  // ── Spawn partícula ──
  function spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * (Math.random() * 3 + 1),
        vy: Math.sin(angle) * (Math.random() * 3 + 1) - 2,
        life: 1, decay: 0.04 + Math.random() * 0.04,
        r: 2 + Math.random() * 3, color,
      });
    }
  }

  // ── Dibujar fondo ──
  function drawBackground() {
    // Base
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, W, H);

    // Estrellas
    bgStars.forEach(star => {
      star.x -= star.speed;
      if (star.x < 0) { star.x = W; star.y = Math.random() * GROUND_Y; }
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle   = C.cyan;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Beat pulse background flash
    if (beatPulse > 0) {
      ctx.fillStyle = `rgba(255,107,0,${beatPulse * 0.04})`;
      ctx.fillRect(0, 0, W, H);
      beatPulse -= 0.06;
    }

    // Grid lines
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 1;
    const gridSpacing = 60;
    for (let x = (frameCount * speed * 0.2) % gridSpacing; x < W; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    for (let y = 0; y < GROUND_Y; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Ground bar
    const grd = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    grd.addColorStop(0, '#1a0800');
    grd.addColorStop(1, C.void);
    ctx.fillStyle = grd;
    ctx.fillRect(0, GROUND_Y + player.h, W, H - GROUND_Y - player.h);

    // Ground neon line
    ctx.shadowBlur  = 10;
    ctx.shadowColor = C.neon;
    ctx.strokeStyle = C.neon;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + player.h);
    ctx.lineTo(W, GROUND_Y + player.h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Score HUD inside canvas
    ctx.font        = '700 12px "Share Tech Mono",monospace';
    ctx.fillStyle   = 'rgba(0,245,255,0.4)';
    ctx.textAlign   = 'right';
    ctx.fillText(`SPEED: ${speed.toFixed(1)}`, W - 12, 18);
    ctx.textAlign   = 'left';
  }

  // ── Dibujar jugador ──
  function drawPlayer() {
    // Trail
    player.trail.push({ x: player.x + player.w / 2, y: player.y + player.h / 2 });
    if (player.trail.length > 10) player.trail.shift();

    player.trail.forEach((pt, i) => {
      const alpha = (i / player.trail.length) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = player.trailColor;
      const size      = (i / player.trail.length) * player.w * 0.5;
      ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;

    // Cuerpo
    const blink = player.invincible && Math.floor(frameCount / 4) % 2 === 0;
    if (!blink) {
      // Glow
      ctx.shadowBlur  = 16;
      ctx.shadowColor = player.color;

      // Sprite: rectángulo con corte angular (pixel-art style)
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.moveTo(player.x + 4, player.y);
      ctx.lineTo(player.x + player.w, player.y);
      ctx.lineTo(player.x + player.w, player.y + player.h - 4);
      ctx.lineTo(player.x + player.w - 4, player.y + player.h);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x, player.y + 4);
      ctx.closePath();
      ctx.fill();

      // Visor (ventana del casco)
      ctx.shadowBlur  = 6;
      ctx.shadowColor = C.cyan;
      ctx.fillStyle   = C.cyan;
      ctx.fillRect(player.x + 8, player.y + 8, player.w - 14, 8);

      ctx.shadowBlur = 0;
    }
  }

  // ── Dibujar obstáculos ──
  function drawObstacles() {
    obstacles.forEach(obs => {
      ctx.shadowBlur  = 12;
      ctx.shadowColor = obs.color;
      ctx.fillStyle   = obs.color;

      if (obs.type === 'spike') {
        // Triángulo
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.lineTo(obs.x, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Borde brillante
        ctx.strokeStyle = `rgba(255,255,255,0.25)`;
        ctx.lineWidth   = 1;
        ctx.strokeRect(obs.x + 0.5, obs.y + 0.5, obs.w - 1, obs.h - 1);
      }

      ctx.shadowBlur = 0;
    });
  }

  // ── Dibujar partículas ──
  function drawParticles() {
    particles.forEach((p, i) => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.12;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); return; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
  }

  // ── Detección de colisión AABB ──
  function collides(a, b) {
    const margin = 4; // pequeño margen de tolerancia
    return (
      a.x + margin < b.x + b.w &&
      a.x + a.w - margin > b.x &&
      a.y + margin < b.y + b.h &&
      a.y + a.h - margin > b.y
    );
  }

  // ── Lógica de un frame ──
  function updateGame() {
    frameCount++;
    beatTimer++;

    // Beat visual cada ~30 frames
    if (beatTimer >= 30) {
      beatTimer = 0;
      beatPulse = 1;
    }

    // ── Movimiento horizontal del jugador ──
    if (keys.left)  { player.x = Math.max(10, player.x - 3.5); }
    if (keys.right) { player.x = Math.min(W / 2, player.x + 3.5); }

    // ── Salto ──
    if (keys.jump && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      spawnParticles(player.x + player.w / 2, player.y + player.h, C.neon, 6);
    }

    // ── Física vertical ──
    player.vy += GRAVITY;
    player.y  += player.vy;

    if (player.y >= GROUND_Y) {
      player.y       = GROUND_Y;
      player.vy      = 0;
      player.onGround = true;
    }

    // ── Invencibilidad post-golpe ──
    if (player.invincible) {
      player.invTimer--;
      if (player.invTimer <= 0) player.invincible = false;
    }

    // ── Spawn de obstáculos ──
    const spawnInterval = Math.max(45, 90 - level * 5);
    if (frameCount % spawnInterval === 0) spawnObstacle();

    // ── Actualizar obstáculos ──
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= speed;

      // Obstáculo superado → sumar puntos
      if (!obs.passed && obs.x + obs.w < player.x) {
        obs.passed = true;
        score += 10 * level;
        spawnParticles(obs.x + obs.w / 2, obs.y, C.acid, 5);
        updateHUD();
      }

      // Colisión
      if (!player.invincible && collides(player, obs)) {
        lives--;
        player.invincible = true;
        player.invTimer   = 90;
        spawnParticles(player.x + player.w / 2, player.y + player.h / 2, C.electric, 14);
        updateHUD();

        if (lives <= 0) {
          endGame();
          return;
        }
      }

      // Eliminar si salió de pantalla
      if (obs.x + obs.w < -20) obstacles.splice(i, 1);
    }

    // ── Subir de nivel cada 300 puntos ──
    const newLevel = Math.floor(score / 300) + 1;
    if (newLevel > level) {
      level = newLevel;
      speed = Math.min(14, 5 + level * 0.8);
      spawnParticles(W / 2, H / 2, C.acid, 20);
      updateHUD();
    }

    // ── Score incremental por tiempo ──
    if (frameCount % 12 === 0) {
      score++;
      updateHUD();
    }
  }

  // ── Game loop ──
  function loop() {
    if (gameState !== 'running') return;
    drawBackground();
    updateGame();
    drawObstacles();
    drawPlayer();
    drawParticles();
    rafId = requestAnimationFrame(loop);
  }

  // ── Fin del juego ──
  function endGame() {
    gameState = 'over';
    cancelAnimationFrame(rafId);

    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem('pb_hiscore', hiScore);
    }

    if (finalScore) finalScore.textContent = String(score).padStart(6, '0');
    if (finalHi)   finalHi.textContent    = String(hiScore).padStart(6, '0');
    if (hiscoreEl) hiscoreEl.textContent  = String(hiScore).padStart(6, '0');

    showOverlay(overEl);
  }

  // ── Start ──
  function startGame() {
    resetGame();
    initStars();
    showOverlay(null);
    gameState = 'running';
    loop();
  }

  // ── Pause / Resume ──
  function pauseGame() {
    if (gameState !== 'running') return;
    gameState = 'paused';
    cancelAnimationFrame(rafId);
    showOverlay(pauseEl);
  }

  function resumeGame() {
    if (gameState !== 'paused') return;
    showOverlay(null);
    gameState = 'running';
    loop();
  }

  // ── Eventos de teclado ──
  document.addEventListener('keydown', e => {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': keys.left  = true;  e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD': keys.right = true;  e.preventDefault(); break;
      case 'Space': case 'ArrowUp': case 'KeyW':
        keys.jump = true;
        e.preventDefault();
        break;
      case 'KeyP':
        if      (gameState === 'running') pauseGame();
        else if (gameState === 'paused')  resumeGame();
        break;
    }
  });
  document.addEventListener('keyup', e => {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': keys.left  = false; break;
      case 'ArrowRight': case 'KeyD': keys.right = false; break;
      case 'Space': case 'ArrowUp': case 'KeyW': keys.jump = false; break;
    }
  });

  // ── Controles móviles ──
  function setMobileKey(key, val) {
    keys[key] = val;
    if (key === 'jump' && val && gameState === 'running') {
      // Forzar un único impulso
      if (player.onGround) {
        player.vy       = JUMP_FORCE;
        player.onGround = false;
      }
    }
  }

  if (btnLeft) {
    btnLeft.addEventListener('touchstart',  e => { e.preventDefault(); setMobileKey('left',  true);  }, { passive: false });
    btnLeft.addEventListener('touchend',    e => { e.preventDefault(); setMobileKey('left',  false); }, { passive: false });
    btnLeft.addEventListener('mousedown',   () => setMobileKey('left',  true));
    btnLeft.addEventListener('mouseup',     () => setMobileKey('left',  false));
  }
  if (btnRight) {
    btnRight.addEventListener('touchstart', e => { e.preventDefault(); setMobileKey('right', true);  }, { passive: false });
    btnRight.addEventListener('touchend',   e => { e.preventDefault(); setMobileKey('right', false); }, { passive: false });
    btnRight.addEventListener('mousedown',  () => setMobileKey('right', true));
    btnRight.addEventListener('mouseup',    () => setMobileKey('right', false));
  }
  if (btnJump) {
    btnJump.addEventListener('touchstart',  e => { e.preventDefault(); setMobileKey('jump',  true);  }, { passive: false });
    btnJump.addEventListener('touchend',    e => { e.preventDefault(); setMobileKey('jump',  false); }, { passive: false });
    btnJump.addEventListener('mousedown',   () => setMobileKey('jump',  true));
    btnJump.addEventListener('mouseup',     () => setMobileKey('jump',  false));
  }

  // ── Botones UI ──
  startBtn?.addEventListener('click',   startGame);
  restartBtn?.addEventListener('click', startGame);
  resumeBtn?.addEventListener('click',  resumeGame);

  // ── Canvas responsive ──
  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    const ratio = W / H;
    const maxW  = Math.min(wrapper.clientWidth, W);
    canvas.style.width  = maxW + 'px';
    canvas.style.height = (maxW / ratio) + 'px';
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ── Dibujar pantalla de espera ──
  function drawIdleScreen() {
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Ground line
    ctx.shadowBlur  = 10;
    ctx.shadowColor = C.neon;
    ctx.strokeStyle = C.neon;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + player.h);
    ctx.lineTo(W, GROUND_Y + player.h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hi-score
    if (hiScore > 0) {
      ctx.font        = '600 11px "Share Tech Mono",monospace';
      ctx.fillStyle   = 'rgba(170,255,0,0.5)';
      ctx.textAlign   = 'center';
      ctx.fillText(`HI-SCORE: ${String(hiScore).padStart(6,'0')}`, W / 2, GROUND_Y - 10);
    }
  }
  drawIdleScreen();

  // Exponer hi-score inicial
  if (hiscoreEl) hiscoreEl.textContent = String(hiScore).padStart(6, '0');
}


/* ─────────────────────────────────────────────────
   10 · NEWSLETTER
───────────────────────────────────────────────── */
function initNewsletter() {
  const input = document.getElementById('newsletter-input');
  const btn   = document.getElementById('newsletter-btn');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = 'var(--electric)';
      input.style.boxShadow   = '0 0 0 1px rgba(255,34,51,.3)';
      input.focus();
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow   = '';
      }, 2000);
      return;
    }

    // Éxito visual
    btn.textContent = '✓ Suscrito';
    btn.style.background = 'var(--acid)';
    btn.style.color      = '#000';
    input.value    = '';
    input.disabled = true;
    btn.disabled   = true;

    setTimeout(() => {
      btn.innerHTML  = '<i class="fa-solid fa-paper-plane mr-2"></i>Suscribir';
      btn.style.background = '';
      btn.style.color      = '';
      input.disabled = false;
      btn.disabled   = false;
    }, 4000);
  });

  // Enter key
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
}


/* ─────────────────────────────────────────────────
   11 · BACK TO TOP
───────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
