/* ═══════════════════════════════════════════════════════════
   VISION FORGE — Shared JavaScript
   Academic Editorial Theme · No 3D / WebGL dependencies
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Custom cursor ── */
  function initCursor() {
    const cursor = document.getElementById("cursor");
    if (!cursor) return;
    let visible = false;
    document.addEventListener("mousemove", (e) => {
      // Always update position FIRST, then reveal — prevents flash at 0,0
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      if (!visible) {
        // Use rAF so the position paint happens before opacity transition starts
        requestAnimationFrame(() => { cursor.style.opacity = "1"; });
        visible = true;
      }
    });
    document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; visible = false; });
    document.querySelectorAll("a, button, .btn, input, select, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
    });
  }

  /* ── Navbar scroll ── */
  function initNavbar() {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ── */
  function initMobileMenu() {
    const btn      = document.querySelector(".nav-hamburger");
    const menu     = document.querySelector(".mobile-menu");
    const closeBtn = document.querySelector(".mobile-close");
    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.add("open");
      btn.classList.add("open");
      document.body.style.overflow = "hidden";
      btn.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      menu.classList.remove("open");
      btn.classList.remove("open");
      document.body.style.overflow = "";
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", () => {
      menu.classList.contains("open") ? closeMenu() : openMenu();
    });

    closeBtn && closeBtn.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      // Check if already visible in viewport on load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("visible");
      } else {
        io.observe(el);
      }
    });
  }

  /* ── Animated counters ── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();
    const tick = (now) => {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + (el.dataset.suffix || "");
    };
    requestAnimationFrame(tick);
  }
  function initCounters() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
      }),
      { threshold: 0.5 }
    );
    document.querySelectorAll(".counter").forEach((el) => io.observe(el));
  }

  /* ── Testimonials carousel ── */
  function initTestimonials() {
    const track    = document.querySelector(".testimonials-track");
    const slides   = document.querySelectorAll(".testimonial-slide");
    const dotsWrap = document.querySelector(".testimonial-dots");
    if (!track || !slides.length) return;
    let current = 0, timer;
    const dots = [];
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "t-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      d.addEventListener("click", () => goto(i));
      dotsWrap && dotsWrap.appendChild(d);
      dots.push(d);
    });
    function goto(idx) {
      slides[current].classList.remove("active");
      dots[current] && dots[current].classList.remove("active");
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current] && dots[current].classList.add("active");
      track.style.transform = `translateX(-${current * 100}%)`;
      clearInterval(timer);
      timer = setInterval(() => goto(current + 1), 5000);
    }
    // Initialize first slide
    slides[0].classList.add("active");
    track.style.transform = "translateX(0%)";
    timer = setInterval(() => goto(current + 1), 5000);
    const prev = document.querySelector(".t-prev");
    const next = document.querySelector(".t-next");
    prev && prev.addEventListener("click", () => goto(current - 1));
    next && next.addEventListener("click", () => goto(current + 1));
  }

  /* ── FAQ accordion ── */
  function initFAQ() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const q = item.querySelector(".faq-question");
      const a = item.querySelector(".faq-answer");
      if (!q || !a) return;
      // Initialize: ensure all answers are collapsed
      a.style.maxHeight = "0";
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Close all open items
        document.querySelectorAll(".faq-item.open").forEach((o) => {
          o.classList.remove("open");
          const ans = o.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = "0";
        });
        // If it wasn't open, open it now
        if (!isOpen) {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  /* ── Password toggle ── */
  function initPasswordToggles() {
    document.querySelectorAll(".pw-toggle").forEach((btn) => {
      const input = btn.previousElementSibling;
      if (!input) return;
      btn.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        btn.querySelector(".eye-icon").textContent = input.type === "password" ? "👁" : "🙈";
      });
    });
  }

  /* ── Tab switch (login / signup) ── */
  function initAuthTabs() {
    const tabs   = document.querySelectorAll(".auth-tab");
    const panels = document.querySelectorAll(".auth-panel");
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        panels.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        const target = document.getElementById(tab.dataset.target);
        target && target.classList.add("active");
      });
    });
  }

  /* ── Auth form handling (login + signup) ── */
  function initAuthForms() {

    /* — Login — */
    const loginForm    = document.getElementById("login-form");
    const loginSuccess = document.getElementById("login-success");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;

        loginForm.querySelectorAll("[required]").forEach((field) => {
          let fieldValid = true;
          if (!field.value.trim()) {
            fieldValid = false;
          } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
            fieldValid = false;
          }
          field.classList.toggle("invalid", !fieldValid);
          if (!fieldValid) valid = false;
        });
        if (!valid) return;

        const btn  = loginForm.querySelector('[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = "Signing in…";
        btn.disabled    = true;

        setTimeout(() => {
          btn.textContent = "✓ Signed In!";
          if (loginSuccess) { loginSuccess.classList.add("show"); }
          setTimeout(() => {
            btn.textContent = orig;
            btn.disabled    = false;
            if (loginSuccess) loginSuccess.classList.remove("show");
          }, 3000);
        }, 1200);
      });

      loginForm.querySelectorAll("[required]").forEach((f) =>
        f.addEventListener("input", () => f.classList.remove("invalid"))
      );
    }

    /* — Signup — */
    const signupForm    = document.getElementById("signup-form");
    const signupSuccess = document.getElementById("signup-success");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;

        signupForm.querySelectorAll("[required]").forEach((field) => {
          let fieldValid = true;
          if (field.type === "checkbox" && !field.checked) {
            fieldValid = false;
          } else if (field.type !== "checkbox" && field.tagName !== "SELECT" && !field.value.trim()) {
            fieldValid = false;
          } else if (field.tagName === "SELECT" && !field.value) {
            fieldValid = false;
          } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
            fieldValid = false;
          } else if (field.minLength > 0 && field.value.trim().length < field.minLength) {
            fieldValid = false;
          }
          field.classList.toggle("invalid", !fieldValid);
          if (!fieldValid) valid = false;
        });
        if (!valid) return;

        const btn  = signupForm.querySelector('[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = "Creating account…";
        btn.disabled    = true;

        setTimeout(() => {
          btn.textContent = "✓ Account Created!";
          if (signupSuccess) { signupSuccess.classList.add("show"); }
          setTimeout(() => {
            btn.textContent = orig;
            btn.disabled    = false;
            if (signupSuccess) signupSuccess.classList.remove("show");
          }, 3500);
        }, 1400);
      });

      signupForm.querySelectorAll("[required]").forEach((f) =>
        f.addEventListener("input", () => f.classList.remove("invalid"))
      );
    }
  }

  /* ── Generic data-vf forms (contact page etc.) ── */
  function initForms() {
    document.querySelectorAll("form[data-vf]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll("[required]").forEach((field) => {
          const empty = !field.value.trim();
          field.classList.toggle("invalid", empty);
          if (empty) valid = false;
        });
        if (!valid) return;
        const btn  = form.querySelector('[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled    = true;
        setTimeout(() => {
          btn.textContent = "✓ Message Sent!";
          form.reset();
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
        }, 1200);
      });
      form.querySelectorAll("[required]").forEach((f) =>
        f.addEventListener("input", () => f.classList.remove("invalid"))
      );
    });
  }

  /* ── Staggered hero text ── */
  function initHeroStagger() {
    document.querySelectorAll(".hero-stagger").forEach((el, i) => {
      el.style.transitionDelay = `${0.18 + i * 0.16}s`;
      // Double rAF: first frame sets opacity:0 state, second triggers transition to visible
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visible")));
    });
  }

  /* ── Boot ── */
  document.addEventListener("DOMContentLoaded", () => {
    initCursor();
    initNavbar();
    initMobileMenu();
    initReveal();
    initCounters();
    initTestimonials();
    initFAQ();
    initPasswordToggles();
    initAuthTabs();
    initAuthForms();
    initForms();
    initHeroStagger();
  });

})();

/* ═══════════════════════════════════════════════════════
   VISION FORGE — Main JavaScript  (migrated from index.html)
   ─────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── NAVBAR SCROLL ── */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    function onNavScroll() { navbar.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* ══════════════════════════════════════
     HAMBURGER — iOS scroll-lock via position:fixed
     Saves scroll position before locking to prevent jump.
  ══════════════════════════════════════ */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var mobileMenu   = document.getElementById('mobileMenu');
  var menuCloseBtn = document.getElementById('menuCloseBtn');
  var menuOpen     = false;
  var _scrollY     = 0;

  function openMobileMenu() {
    if (menuOpen) return;
    menuOpen = true;
    _scrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top      = '-' + _scrollY + 'px';
    document.body.style.width    = '100%';
    document.body.style.overflow = 'hidden';
    mobileMenu.classList.add('is-open');
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close menu');
  }

  function closeMobileMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    document.body.style.overflow = '';
    window.scrollTo(0, _scrollY);
    mobileMenu.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open menu');
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      menuOpen ? closeMobileMenu() : openMobileMenu();
    });
  }
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMobileMenu(); closeFeedbackModal(); }
  });
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) { if (e.target === mobileMenu) closeMobileMenu(); });
    mobileMenu.querySelectorAll('a, button[data-page]').forEach(function (el) {
      el.addEventListener('click', closeMobileMenu);
    });
  }

  /* ── REVEAL ON SCROLL ── */
  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
      else io.observe(el);
    });
    window._vfRevealIO = io;
  }

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target   = parseInt(el.dataset.target, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1800;
    var startT   = performance.now();
    (function tick(now) {
      var t    = Math.min((now - startT) / duration, 1);
      var ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    })(performance.now());
  }
  window._vfAnimateCounter = animateCounter;

  function initCounters() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('.counter[data-target]').forEach(function (el) { io.observe(el); });
  }

  /* ── HERO SLIDESHOW ── */
  function initHeroSlideshow() {
    var slides   = Array.from(document.querySelectorAll('.hero-slide'));
    var dotsWrap = document.getElementById('heroSlideDots');
    if (!slides.length || !dotsWrap) return;
    var current = 0, timer, dots = [];
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'hero-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
    function goTo(idx) {
      slides[current].classList.remove('active'); dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');  dots[current].classList.add('active');
      clearInterval(timer); timer = setInterval(function () { goTo(current + 1); }, 5000);
    }
    timer = setInterval(function () { goTo(current + 1); }, 5000);
    var host = document.getElementById('heroSlideshow');
    if (host) {
      var sx = 0, sy = 0;
      host.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      host.addEventListener('touchend', function (e) {
        var dx = sx - e.changedTouches[0].clientX;
        var dy = Math.abs(sy - e.changedTouches[0].clientY);
        if (Math.abs(dx) > 44 && Math.abs(dx) > dy) dx > 0 ? goTo(current + 1) : goTo(current - 1);
      }, { passive: true });
    }
  }

  /* ── TESTIMONIALS ── */
  function initTestimonials() {
    var track    = document.getElementById('testimonialsTrack');
    var dotsWrap = document.getElementById('testimonialDots');
    if (!track) return;
    var slides = Array.from(track.querySelectorAll('.testimonial-slide'));
    var current = 0, timer, dots = [];
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 't-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      d.setAttribute('role', 'tab');
      d.addEventListener('click', function () { goTo(i); });
      if (dotsWrap) dotsWrap.appendChild(d);
      dots.push(d);
    });
    function goTo(idx) {
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      if (dots[current]) dots[current].classList.add('active');
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      clearInterval(timer); timer = setInterval(function () { goTo(current + 1); }, 5500);
    }
    timer = setInterval(function () { goTo(current + 1); }, 5500);
    var prevBtn = document.querySelector('.t-prev');
    var nextBtn = document.querySelector('.t-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    var wrapper = track.parentElement;
    if (wrapper) {
      var sx = 0, sy = 0;
      wrapper.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      wrapper.addEventListener('touchend', function (e) {
        var dx = sx - e.changedTouches[0].clientX;
        var dy = Math.abs(sy - e.changedTouches[0].clientY);
        if (Math.abs(dx) > 44 && Math.abs(dx) > dy) dx > 0 ? goTo(current + 1) : goTo(current - 1);
      }, { passive: true });
    }
  }

  /* ── FAQ ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-question');
      var a = item.querySelector('.faq-answer');
      if (!q || !a) return;
      a.style.maxHeight = '0';
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (o) {
          o.classList.remove('open');
          var ans = o.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = '0';
        });
        if (!isOpen) { item.classList.add('open'); a.style.maxHeight = (a.scrollHeight + 40) + 'px'; }
      });
    });
  }

  /* ── CONTACT FORM ── */
  function initForms() {
    document.querySelectorAll('form[data-vf]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        form.querySelectorAll('[required]').forEach(function (f) {
          var empty = !f.value.trim();
          f.classList.toggle('invalid', empty);
          if (empty) valid = false;
        });
        if (!valid) return;
        var btn  = form.querySelector('[type="submit"]');
        var orig = btn.textContent;
        btn.textContent = 'Sending\u2026'; btn.disabled = true;
        setTimeout(function () {
          btn.textContent = '\u2713 Message Sent!'; form.reset();
          setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2500);
        }, 1200);
      });
      form.querySelectorAll('[required]').forEach(function (f) {
        f.addEventListener('input', function () { f.classList.remove('invalid'); });
      });
    });
  }

  /* ── HERO STAGGER ── */
  function initHeroStagger() {
    document.querySelectorAll('.hero-stagger').forEach(function (el, i) {
      el.style.transitionDelay = (0.18 + i * 0.16) + 's';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('visible'); }); });
    });
  }

  /* ── EXPLORE NAV ── */
  function initExploreNav() {
    document.querySelectorAll('.explore-nav-card[data-anchor]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        var anchor = card.dataset.anchor;
        setTimeout(function () {
          var el = document.getElementById(anchor);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      });
    });
  }

  /* ── FEEDBACK MODAL ── */
  var feedbackOverlay = document.getElementById('feedbackOverlay');
  var feedbackClose   = document.getElementById('feedbackClose');
  var feedbackFab     = document.getElementById('feedbackFab');
  var feedbackForm    = document.getElementById('feedbackForm');

  function openFeedbackModal() {
    if (feedbackOverlay) { feedbackOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closeFeedbackModal() {
    if (feedbackOverlay) { feedbackOverlay.classList.remove('open'); document.body.style.overflow = ''; }
  }

  if (feedbackFab)     feedbackFab.addEventListener('click', openFeedbackModal);
  if (feedbackClose)   feedbackClose.addEventListener('click', closeFeedbackModal);
  if (feedbackOverlay) feedbackOverlay.addEventListener('click', function (e) { if (e.target === feedbackOverlay) closeFeedbackModal(); });

  var footerFeedbackLink = document.getElementById('openFeedbackFooter');
  if (footerFeedbackLink) footerFeedbackLink.addEventListener('click', function (e) { e.preventDefault(); openFeedbackModal(); });

  var selectedRating = 0;
  document.querySelectorAll('.fb-star').forEach(function (star) {
    star.addEventListener('click', function () {
      selectedRating = parseInt(star.dataset.val);
      document.querySelectorAll('.fb-star').forEach(function (s) {
        s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
      });
    });
  });
  document.querySelectorAll('.fb-type-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.fb-type-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });
  });
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('fb-message');
      if (!msg || !msg.value.trim()) { if (msg) msg.classList.add('invalid'); return; }
      msg.classList.remove('invalid');
      var btn = feedbackForm.querySelector('[type="submit"]');
      btn.textContent = 'Sending\u2026'; btn.disabled = true;
      setTimeout(function () {
        btn.textContent = '\u2713 Thank you!';
        setTimeout(function () {
          closeFeedbackModal(); feedbackForm.reset(); selectedRating = 0;
          document.querySelectorAll('.fb-star').forEach(function (s) { s.classList.remove('active'); });
          document.querySelectorAll('.fb-type-btn').forEach(function (b) { b.classList.remove('selected'); });
          btn.textContent = 'Send Feedback \u2192'; btn.disabled = false;
        }, 1600);
      }, 1000);
    });
    var fbMsg = document.getElementById('fb-message');
    if (fbMsg) fbMsg.addEventListener('input', function () { fbMsg.classList.remove('invalid'); });
  }

  /* ── SCROLL: reveals + counters ── */
  window.addEventListener('scroll', function () {
    var active = document.querySelector('.page-view.page-active');
    if (!active) return;
    active.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add('visible');
    });
    if (window._vfAnimateCounter) {
      active.querySelectorAll('.counter[data-target]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) window._vfAnimateCounter(el);
      });
    }
  }, { passive: true });

  /* ── INIT ── */
  function init() {
    initReveal(); initCounters(); initHeroSlideshow();
    initTestimonials(); initFAQ(); initForms();
    initHeroStagger(); initExploreNav();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();


/* ═══════════════════════════════════════════════════════
   PAGE ROUTER  (migrated from index.html)
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function showPage(pageId, anchor) {
    /* Close mobile menu properly (restoring scroll) */
    var mobileMenu   = document.getElementById('mobileMenu');
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    if (mobileMenu && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open');
      hamburgerBtn && hamburgerBtn.classList.remove('is-open');
      hamburgerBtn && hamburgerBtn.setAttribute('aria-expanded', 'false');
      hamburgerBtn && hamburgerBtn.setAttribute('aria-label', 'Open menu');
      /* Restore body scroll lock */
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.page-view').forEach(function (p) { p.classList.remove('page-active'); });

    var pg = document.getElementById('page-' + pageId);
    if (!pg) { pg = document.getElementById('page-home'); pageId = 'home'; }
    pg.classList.add('page-active');

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    setTimeout(function () {
      pg.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
        else if (window._vfRevealIO) window._vfRevealIO.observe(el);
      });
      if (window._vfAnimateCounter) {
        pg.querySelectorAll('.counter[data-target]').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) window._vfAnimateCounter(el);
        });
      }
      if (anchor) {
        setTimeout(function () {
          var target = document.getElementById(anchor);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, 60);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-page]');
    if (!el) return;
    var href = el.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('javascript') && el.tagName === 'A' && el.dataset.page === undefined) return;
    e.preventDefault();
    showPage(el.dataset.page || 'home', el.dataset.anchor || null);
  });

})();