// ═══════════════════════════════════════════
// 沈龙翔个人站 — 交互与动画
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileNav();
  initHeroAnimation();
  initRevealOnScroll();
  initCounters();
  initSmoothScroll();
});

// ── Navigation: sticky + scroll effect ──
function initNavScroll() {
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
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

  // Close nav when clicking a link
  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ── Hero split-text animation ──
function initHeroAnimation() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  // Trigger immediately with a small delay for page load
  setTimeout(() => {
    title.classList.add('visible');
  }, 400);
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

// ── Counter animation using Web Animations API ──
function initCounters() {
  const counters = document.querySelectorAll('.num-value[data-target]');

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;

        // Use Web Animations API for counter
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
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
