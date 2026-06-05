/* RayCres Technologies — main JS
 * Handles: page loader, footer year, mobile nav, smooth scroll, scroll-reveal,
 *          counter animations, mailto form submissions with validation + toast.
 */
(function () {
  'use strict';

  // -- Page loader ---------------------------------------------------------
  // Script runs deferred (after DOM parse), so window.load is not needed.
  // Plain timeout is reliable regardless of CDN/font load timing.
  const loader = document.getElementById('pageLoader');
  if (loader) {
    const dismissLoader = () => loader.classList.add('loaded');
    setTimeout(dismissLoader, 900);
    // Failsafe: also dismiss on window.load in case timeout fires too early
    window.addEventListener('load', () => setTimeout(dismissLoader, 300), { once: true });
  }

  // -- Footer year ---------------------------------------------------------
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // -- Mobile nav toggle ---------------------------------------------------
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -- Scroll reveal -------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // -- Counter animation ---------------------------------------------------
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && statEls.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => counterIO.observe(el));
  }

  // -- Collapsible job cards (Careers) ------------------------------------
  document.querySelectorAll('[data-collapse-trigger]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = panel.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      const icon = btn.querySelector('[data-collapse-icon]');
      if (icon) icon.style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
    });
  });

  // -- Toast ---------------------------------------------------------------
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => t.classList.remove('show'), 4000);
  }

  // -- Form validator + mailto handler ------------------------------------
  function validateForm(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(field => {
      const wrap = field.closest('.field') || field.parentElement;
      const err = wrap.querySelector('.field-error');
      let msg = '';
      if (!field.value.trim()) {
        msg = 'This field is required.';
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        msg = 'Please enter a valid email.';
      } else if (field.type === 'url' && field.value && !/^https?:\/\/\S+$/i.test(field.value)) {
        msg = 'Please enter a valid URL (starting with http/https).';
      }
      if (msg) {
        ok = false;
        field.classList.add('border-red-500');
        field.setAttribute('aria-invalid', 'true');
        if (err) err.textContent = msg;
      } else {
        field.classList.remove('border-red-500');
        field.removeAttribute('aria-invalid');
        if (err) err.textContent = '';
      }
    });
    return ok;
  }

  function buildMailto(form) {
    const to = form.dataset.mailto;
    const subject = form.dataset.subject || 'Website inquiry';
    const fields = Array.from(form.querySelectorAll('input, select, textarea'))
      .filter(f => f.name && f.type !== 'submit')
      .map(f => `${f.dataset.label || f.name}: ${f.value}`)
      .join('\n');
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fields)}`;
  }

  document.querySelectorAll('form[data-mailto]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) { showToast('Please fix the highlighted fields.'); return; }
      window.location.href = buildMailto(form);
      showToast('Opening your email client…');
      setTimeout(() => form.reset(), 600);
    });
  });

  // -- Active nav link -----------------------------------------------------
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav').toLowerCase() === path) {
      a.classList.add('text-brand-blue-600', 'font-semibold');
    }
  });
})();
