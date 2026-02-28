/* ═══════════════════════════════════════
   GIGVAULT — APPLICATION LOGIC
   ═══════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════ SCREEN NAVIGATION ═══════
  const screens = {
    landing: document.getElementById('screen-landing'),
    role: document.getElementById('screen-role'),
    auth: document.getElementById('screen-auth'),
    clientDash: document.getElementById('screen-client-dashboard'),
    postJob: document.getElementById('screen-post-job'),
    freelancerDash: document.getElementById('screen-freelancer-dashboard'),
    jobDetail: document.getElementById('screen-job-detail'),
    payment: document.getElementById('screen-payment'),
  };

  let currentScreen = 'landing';
  let selectedRole = '';

  function showScreen(name) {
    Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
    if (screens[name]) {
      screens[name].classList.add('active');
      currentScreen = name;
      window.scrollTo(0, 0);
      triggerFadeIns(screens[name]);
    }
  }

  function triggerFadeIns(container) {
    const els = container.querySelectorAll('.fade-in-up');
    els.forEach((el, i) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 60 * i);
    });
  }

  // ═══════ LANDING PAGE ═══════
  document.getElementById('btn-start-client')?.addEventListener('click', () => {
    selectedRole = 'client';
    document.getElementById('auth-role-text').textContent = 'CLIENT';
    showScreen('auth');
  });
  document.getElementById('btn-join-freelancer')?.addEventListener('click', () => {
    selectedRole = 'freelancer';
    document.getElementById('auth-role-text').textContent = 'FREELANCER';
    showScreen('auth');
  });

  // Connect wallet button
  document.getElementById('btn-connect-wallet')?.addEventListener('click', () => {
    showScreen('role');
  });

  // ═══════ ROLE SELECTION ═══════
  const roleCards = document.querySelectorAll('.role-card');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role;
      document.getElementById('auth-role-text').textContent = selectedRole.toUpperCase();
      setTimeout(() => showScreen('auth'), 400);
    });
  });

  // ═══════ AUTH SCREEN ═══════
  const authTabs = document.querySelectorAll('.auth-tab');
  const signupFields = document.getElementById('signup-fields');
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'signup') {
        signupFields.style.display = 'block';
      } else {
        signupFields.style.display = 'none';
      }
    });
  });

  document.getElementById('btn-enter-vault')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedRole === 'client') {
      showScreen('clientDash');
    } else {
      showScreen('freelancerDash');
    }
  });

  document.getElementById('btn-google')?.addEventListener('click', () => {
    if (selectedRole === 'client') {
      showScreen('clientDash');
    } else {
      showScreen('freelancerDash');
    }
  });

  // ═══════ SIDEBAR NAVIGATION ═══════
  document.querySelectorAll('.nav-item[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      // Update active state for siblings in same sidebar
      const sidebar = item.closest('.sidebar-nav');
      sidebar.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      if (nav === 'post-job') showScreen('postJob');
      else if (nav === 'overview-client') showScreen('clientDash');
      else if (nav === 'overview-freelancer') showScreen('freelancerDash');
      else if (nav === 'browse-jobs') showScreen('freelancerDash');
    });
  });

  // ═══════ FAB BUTTON ═══════
  document.getElementById('fab-post-job')?.addEventListener('click', () => {
    showScreen('postJob');
  });

  // ═══════ POST JOB ═══════
  // Tag input
  const tagInput = document.getElementById('tag-input');
  const tagContainer = document.getElementById('tag-container');
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && tagInput.value.trim()) {
        e.preventDefault();
        addTag(tagInput.value.trim());
        tagInput.value = '';
      }
    });
  }

  function addTag(text) {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${text} <span class="remove-tag" onclick="this.parentElement.remove()">×</span>`;
    tagContainer.insertBefore(pill, tagInput);
  }

  // Budget display
  const budgetInput = document.getElementById('budget-input');
  const summaryAmount = document.getElementById('summary-amount');
  if (budgetInput) {
    budgetInput.addEventListener('input', () => {
      const val = budgetInput.value || '0';
      summaryAmount.textContent = val + ' MON';
    });
  }

  // Lock payment
  document.getElementById('btn-lock-payment')?.addEventListener('click', () => {
    showScreen('clientDash');
  });

  // ═══════ FREELANCER — ACCEPT JOB ═══════
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showScreen('jobDetail');
    });
  });

  // Browse card click
  document.querySelectorAll('.browse-card').forEach(card => {
    card.addEventListener('click', () => {
      showScreen('jobDetail');
    });
  });

  // Mark complete
  document.querySelectorAll('.btn-mark-complete').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✅ COMPLETED';
      btn.style.background = 'var(--gold)';
      btn.style.color = 'var(--bg)';
      btn.disabled = true;
    });
  });

  // ═══════ JOB DETAIL — SUBMIT WORK ═══════
  document.getElementById('btn-submit-work')?.addEventListener('click', () => {
    showScreen('freelancerDash');
  });

  // ═══════ RELEASE PAYMENT ═══════
  document.querySelectorAll('.btn-release').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showScreen('payment');
    });
  });

  document.getElementById('btn-cancel-release')?.addEventListener('click', () => {
    showScreen('clientDash');
  });

  document.getElementById('btn-confirm-release')?.addEventListener('click', () => {
    const confirmState = document.getElementById('confirm-state');
    const successState = document.getElementById('success-state');
    if (confirmState && successState) {
      confirmState.style.display = 'none';
      successState.classList.add('active');
      launchConfetti();
    }
  });

  // Back to dashboard from payment
  document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
    const confirmState = document.getElementById('confirm-state');
    const successState = document.getElementById('success-state');
    if (confirmState && successState) {
      successState.classList.remove('active');
      confirmState.style.display = 'block';
    }
    showScreen('clientDash');
  });

  // ═══════ NAVIGATION BACK BUTTONS ═══════
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      showScreen(el.dataset.goto);
    });
  });

  // ═══════ STATS COUNTER ANIMATION ═══════
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isFloat = target.includes('.');
      const end = parseFloat(target);
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * end;
        el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // Intersection Observer for counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) counterObserver.observe(statsBar);

  // ═══════ SCROLL FADE-IN ═══════
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));

  // ═══════ CONFETTI ═══════
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF6B35', '#FF4500', '#FF8C42', '#FFB347', '#FF2D00', '#F5E6D3'];
    const particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -18 - 4,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.25 + Math.random() * 0.15,
        opacity: 1,
      });
    }

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.006;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (alive && frame < 300) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(draw);
  }

  // ═══════ COPY TX HASH ═══════
  document.getElementById('tx-hash-copy')?.addEventListener('click', () => {
    const hash = '0xab34ef...9c2d8a71b3f0e56789012345678901234567890a';
    navigator.clipboard.writeText(hash).then(() => {
      const el = document.getElementById('tx-hash-copy');
      const orig = el.textContent;
      el.textContent = 'Copied!';
      setTimeout(() => { el.textContent = orig; }, 1500);
    });
  });

  // ═══════ INIT ═══════
  showScreen('landing');
  // Trigger landing page fade-ins after a tick
  setTimeout(() => {
    document.querySelectorAll('#screen-landing .fade-in-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 50 * i);
    });
  }, 100);

})();
