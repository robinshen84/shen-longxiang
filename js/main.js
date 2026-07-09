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
  initPhotoWall();
  initBadgeConfetti();
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
  const textTrail = cursor.querySelector('.cursor-text-trail');

  // Skip on touch devices
  if ('ontouchstart' in window) {
    cursor.remove();
    document.body.style.cursor = 'auto';
    return;
  }

  document.body.style.cursor = 'none';

  // Split the cursor text into characters so each one can move like a wave.
  let textWaveRafId = null;
  if (textTrail) {
    const chars = Array.from(textTrail.textContent || '');
    textTrail.innerHTML = chars
      .map(char => `<span class="cursor-wave-char">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const waveChars = textTrail.querySelectorAll('.cursor-wave-char');

    function animateTextWave(time) {
      waveChars.forEach((char, index) => {
        const offsetY = Math.sin(time / 180 + index * 0.55) * 4;
        const offsetX = Math.cos(time / 260 + index * 0.35) * 1.5;
        char.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
      textWaveRafId = requestAnimationFrame(animateTextWave);
    }

    textWaveRafId = requestAnimationFrame(animateTextWave);
  }

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

// ── Photo Wall — hover focus + click lightbox ──
function initPhotoWall() {
  const wall = document.getElementById('photo-wall');
  const track = wall?.querySelector('.photo-wall-track');
  const cards = wall?.querySelectorAll('.photo-card');
  const lightbox = document.getElementById('photoLightbox');
  const lightboxMedia = document.getElementById('photoLightboxMedia');
  const lightboxCaption = document.getElementById('photoLightboxTitle');
  const lightboxClose = document.getElementById('photoLightboxClose');

  if (!wall || !track || !cards?.length || !lightbox || !lightboxMedia || !lightboxCaption || !lightboxClose) {
    return;
  }

  let activeCard = null;

  function setActiveCard(card) {
    activeCard = card;
    track.classList.add('is-paused', 'is-hovering');
    cards.forEach(item => item.classList.toggle('is-active', item === card));
  }

  function clearActiveCard() {
    if (lightbox.classList.contains('is-open')) return;
    activeCard = null;
    track.classList.remove('is-paused', 'is-hovering');
    cards.forEach(item => item.classList.remove('is-active'));
  }

  function getMediaMarkup(card) {
    const image = card.querySelector('img');
    const placeholder = card.querySelector('.photo-placeholder');

    if (image) {
      return `<img src="${image.getAttribute('src')}" alt="${image.getAttribute('alt') || ''}">`;
    }

    return placeholder ? placeholder.outerHTML : '';
  }

  function openLightbox(card) {
    const caption = card.querySelector('.photo-caption')?.textContent?.trim() || '';
    lightboxMedia.innerHTML = getMediaMarkup(card);
    lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('photo-lightbox-open');
    setActiveCard(card);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('photo-lightbox-open');
    lightboxMedia.innerHTML = '';
    lightboxCaption.textContent = '';
    clearActiveCard();
  }

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => setActiveCard(card));
    card.addEventListener('mouseleave', () => {
      if (activeCard === card) clearActiveCard();
    });
    card.addEventListener('focus', () => setActiveCard(card));
    card.addEventListener('blur', () => {
      if (activeCard === card) clearActiveCard();
    });
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(card);
      }
    });
  });

  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.dataset.close === 'true') {
      closeLightbox();
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

// ── Recognition badges — confetti celebration ──
function initBadgeConfetti() {
  const recognition = document.getElementById('recognition');
  const badges = recognition?.querySelectorAll('.badge');

  if (!recognition || !badges?.length) return;

  const stage = document.createElement('div');
  stage.className = 'confetti-stage';
  document.body.appendChild(stage);

  const baseHues = [0, 28, 52, 95, 150, 198, 232, 274, 316];

  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function createPalette() {
    const rotation = Math.floor(Math.random() * 360);
    return shuffle(baseHues).map(hue => `hsl(${(hue + rotation) % 360} 92% 62%)`);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function attachVars(element, originX, originY, dx, dy, color, rotation, duration, startRotation) {
    element.style.setProperty('--origin-x', `${originX}px`);
    element.style.setProperty('--origin-y', `${originY}px`);
    element.style.setProperty('--dx', `${dx}px`);
    element.style.setProperty('--dy', `${dy}px`);
    element.style.setProperty('--confetti-color', color);
    element.style.setProperty('--rot', `${rotation}deg`);
    element.style.setProperty('--duration', `${duration}ms`);
    if (typeof startRotation === 'number') {
      element.style.setProperty('--start-rot', `${startRotation}deg`);
    }
  }

  function spawnBurst(originX, originY) {
    const palette = createPalette();
    const allNodes = [];

    const glowCount = 3;
    const flareCount = 14;
    const chipCount = 24;
    const ribbonCount = 12;

    for (let i = 0; i < glowCount; i++) {
      const glow = document.createElement('span');
      glow.className = 'confetti-glow';
      attachVars(
        glow,
        originX + randomBetween(-10, 10),
        originY + randomBetween(-10, 10),
        0,
        0,
        palette[i % palette.length],
        0,
        650
      );
      stage.appendChild(glow);
      allNodes.push(glow);
    }

    for (let i = 0; i < flareCount; i++) {
      const angle = (Math.PI * 2 * i) / flareCount + randomBetween(-0.14, 0.14);
      const distance = randomBetween(70, 150);
      const flare = document.createElement('span');
      flare.className = 'confetti-flare';
      attachVars(
        flare,
        originX,
        originY,
        Math.cos(angle) * distance,
        Math.sin(angle) * distance - randomBetween(6, 34),
        palette[i % palette.length],
        randomBetween(90, 320),
        randomBetween(800, 1100)
      );
      stage.appendChild(flare);
      allNodes.push(flare);
    }

    for (let i = 0; i < chipCount; i++) {
      const angle = randomBetween(-Math.PI * 0.92, -Math.PI * 0.08);
      const distance = randomBetween(90, 240);
      const chip = document.createElement('span');
      chip.className = 'confetti-piece';
      chip.style.width = `${randomBetween(8, 14)}px`;
      chip.style.height = `${randomBetween(8, 14)}px`;
      attachVars(
        chip,
        originX,
        originY,
        Math.cos(angle) * distance,
        Math.sin(angle) * distance + randomBetween(-35, 70),
        palette[i % palette.length],
        randomBetween(180, 760),
        randomBetween(900, 1300)
      );
      stage.appendChild(chip);
      allNodes.push(chip);
    }

    for (let i = 0; i < ribbonCount; i++) {
      const angle = randomBetween(-Math.PI * 0.88, -Math.PI * 0.12);
      const distance = randomBetween(110, 280);
      const ribbon = document.createElement('span');
      ribbon.className = 'confetti-ribbon';
      ribbon.style.width = `${randomBetween(6, 10)}px`;
      ribbon.style.height = `${randomBetween(28, 48)}px`;
      attachVars(
        ribbon,
        originX,
        originY,
        Math.cos(angle) * distance,
        Math.sin(angle) * distance + randomBetween(-12, 96),
        palette[i % palette.length],
        randomBetween(220, 840),
        randomBetween(1150, 1650),
        randomBetween(-70, 70)
      );
      stage.appendChild(ribbon);
      allNodes.push(ribbon);
    }

    window.setTimeout(() => {
      allNodes.forEach(node => node.remove());
    }, 1800);
  }

  badges.forEach(badge => {
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'button');

    function celebrate(event) {
      const rect = badge.getBoundingClientRect();
      const originX = event?.clientX ?? rect.left + rect.width / 2;
      const originY = event?.clientY ?? rect.top + rect.height / 2;

      badge.classList.remove('is-celebrating');
      void badge.offsetWidth;
      badge.classList.add('is-celebrating');
      window.setTimeout(() => badge.classList.remove('is-celebrating'), 700);

      spawnBurst(originX, originY);
    }

    badge.addEventListener('click', celebrate);
    badge.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        celebrate();
      }
    });
  });
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
