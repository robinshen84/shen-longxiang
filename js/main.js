// ═══════════════════════════════════════════
// 沈龙翔个人站 — Canvas粒子爆炸 + 蓝色光标文字跟随 + 交互
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCustomCursor();
  initNavScroll();
  initMobileNav();
  initRevealOnScroll();
  initCounters();
  initSmoothScroll();
});

// ── Loader — Canvas Particle Explosion ──
function initLoader() {
  const loader = document.getElementById('loader');
  const canvas = document.getElementById('loaderCanvas');
  if (!loader || !canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  let exploded = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 10;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - Math.random() * 3;
      this.size = 1.5 + Math.random() * 4;
      this.life = 1;
      this.decay = 0.008 + Math.random() * 0.025;
      this.color = Math.random() < 0.5
        ? `rgba(59,130,246,${0.4 + Math.random() * 0.6})`
        : `rgba(96,165,250,${0.3 + Math.random() * 0.5})`;
      this.gravity = 0.06 + Math.random() * 0.08;
      this.friction = 0.985;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y, life: this.life });
      if (this.trail.length > 6) this.trail.shift();

      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw(ctx) {
      // Trail
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const alpha = (i / this.trail.length) * this.life * 0.3;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${alpha})`;
        ctx.fill();
      }
      // Main particle with glow
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.shadowColor = 'rgba(59,130,246,0.8)';
      ctx.shadowBlur = this.size * 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnParticles(x, y) {
    const count = 120 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => p.life > 0.02);

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(animate);
    } else if (exploded) {
      animId = null;
    }
  }

  // Phase 1: Characters animate in
  setTimeout(() => {
    loader.classList.add('visible');
  }, 150);

  // Phase 2: Explosion — spawn particles + explode chars
  setTimeout(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy);
    if (!animId) {
      animId = requestAnimationFrame(animate);
    }
    loader.classList.add('explode');
    exploded = true;
  }, 2200);

  // Phase 3: Remove loader, trigger hero
  setTimeout(() => {
    loader.remove();
    initHeroAnimation();
  }, 3000);
}

// ── Hero split-text animation ──
function initHeroAnimation() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  title.classList.add('visible');
}

// ── Custom Cursor — Blue Dot + Text Trail ──
function initCustomCursor() {
  const cursor = document.getElementById('cursorCustom');
  if (!cursor) return;

  // Skip on touch devices
  if ('ontouchstart' in window) {
    cursor.remove();
    document.body.style.cursor = 'auto';
    return;
  }

  document.body.style.cursor = 'none';

  let mouseX = -100;
  let mouseY = -100;
  let currentX = -100;
  let currentY = -100;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateCursor);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (mouseX > 0) cursor.style.opacity = '1';
  });

  // Hover effect on links and buttons
  const hoverTargets = document.querySelectorAll('a, button, .btn-primary, .btn-ghost, .badge, .project-card, .about-card, .exp-card, .num-card, .contact-item, .skill-tags span');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  function updateCursor() {
    // Smooth lerp for the dot
    currentX += (mouseX - currentX) * 0.25;
    currentY += (mouseY - currentY) * 0.25;

    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    cursor.style.opacity = '1';

    rafId = null;

    if (Math.abs(mouseX - currentX) > 0.3 || Math.abs(mouseY - currentY) > 0.3) {
      rafId = requestAnimationFrame(updateCursor);
    }
  }
}

// ── Navigation: sticky + scroll effect ──
function initNavScroll() {
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ── Mobile nav toggle ──
function initMobileNav() {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav-toggle');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ── Scroll reveal with IntersectionObserver ──
function initRevealOnScroll() {
  const elements = document.querySelectorAll('.reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ── Counter animation ──
function initCounters() {
  const counters = document.querySelectorAll('.num-value[data-target]');

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;

        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(eased * target);

          el.textContent = value.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

// ── Smooth scroll for anchor links ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
