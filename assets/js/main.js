/* RayCres Technologies — main JS
 * Handles: footer year, mobile nav, smooth scroll, scroll-reveal,
 *          mailto form submissions with validation + toast.
 */
(function () {
  'use strict';

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
    // Close on link click
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
      if (!validateForm(form)) {
        showToast('Please fix the highlighted fields.');
        return;
      }
      const href = buildMailto(form);
      window.location.href = href;
      showToast('Opening your email client…');
      setTimeout(() => form.reset(), 600);
    });
  });

  // -- Active nav link -----------------------------------------------------
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-nav]').forEach(a => {
    const target = a.getAttribute('data-nav').toLowerCase();
    if (target === path) {
      a.classList.add('text-brand-blue-600', 'font-semibold');
    }
  });
})();
