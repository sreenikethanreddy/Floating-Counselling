/**
 * Floating Counselling — Shared JavaScript
 * Handles: Navigation, Dropdowns, Cart, Checkout, Modals, FAQ, Gallery, Newsletter
 */

(function () {
  'use strict';

  // ───────────────────────── HEADER SCROLL ─────────────────────────
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
  }

  // ───────────────────────── FADE-IN OBSERVER ─────────────────────────
  function initFadeIn() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      fadeElements.forEach(function (el) { obs.observe(el); });
    } else {
      // Fallback
      fadeElements.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  // ───────────────────────── STAGGERED ENTRANCE ─────────────────────────
  function initStagger() {
    const staggerContainers = document.querySelectorAll('.stagger-container');
    if (!staggerContainers.length) return;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.stagger-item');
          items.forEach(function (item, i) {
            item.style.transitionDelay = (i * 150) + 'ms';
            item.classList.add('visible');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    staggerContainers.forEach(function (el) { obs.observe(el); });
  }

  // ───────────────────────── COUNT-UP METRICS ─────────────────────────
  function initCountUp() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function formatCount(value, target) {
      var rounded = Math.round(value);
      if (target >= 1000) return rounded.toLocaleString();
      return String(rounded);
    }

    function animateCounter(el) {
      if (el.dataset.counted === 'true') return;
      el.dataset.counted = 'true';

      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatCount(target * eased, target);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.45 });

      counters.forEach(function (el) { obs.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  // ───────────────────────── HAMBURGER MENU ─────────────────────────
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  }

  // ───────────────────────── CLICK DROPDOWNS ─────────────────────────
  function initDropdowns() {
    const triggers = document.querySelectorAll('.nav-dropdown-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const parent = trigger.closest('.nav-dropdown-wrap');
        const wasOpen = parent.classList.contains('open');

        // Close all others
        document.querySelectorAll('.nav-dropdown-wrap.open').forEach(function (el) {
          el.classList.remove('open');
        });

        if (!wasOpen) parent.classList.add('open');
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-dropdown-wrap')) {
        document.querySelectorAll('.nav-dropdown-wrap.open').forEach(function (el) {
          el.classList.remove('open');
        });
      }
    });
  }

  // ───────────────────────── CART SYSTEM ─────────────────────────
  var cart = [];

  function getCart() {
    try {
      var saved = localStorage.getItem('fc_cart');
      if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = []; }
    return cart;
  }

  function saveCart() {
    localStorage.setItem('fc_cart', JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function addToCart(name, price, variant) {
    getCart();
    var found = cart.find(function (item) { return item.name === name && item.variant === variant; });
    if (found) {
      found.qty++;
    } else {
      cart.push({ name: name, price: price, variant: variant, qty: 1 });
    }
    saveCart();
    openCartDrawer();
  }

  function removeFromCart(index) {
    getCart();
    cart.splice(index, 1);
    saveCart();
    renderCartDrawer();
  }

  function openCartDrawer() {
    var drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    renderCartDrawer();
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    var drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    var container = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartTotal');
    var emptyEl = document.getElementById('cartEmpty');
    var checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (!container) return;

    getCart();
    if (cart.length === 0) {
      container.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      if (totalEl) totalEl.textContent = '£0.00';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    var html = '';
    var total = 0;
    cart.forEach(function (item, i) {
      total += item.price * item.qty;
      html += '<div class="cart-item">' +
        '<div class="cart-item-info">' +
        '<h5>' + item.name + '</h5>' +
        '<p class="cart-item-variant">' + item.variant + '</p>' +
        '<p class="cart-item-price">£' + item.price.toFixed(2) + ' × ' + item.qty + '</p>' +
        '</div>' +
        '<button class="cart-item-remove" data-index="' + i + '" aria-label="Remove item">✕</button>' +
        '</div>';
    });
    container.innerHTML = html;
    if (totalEl) totalEl.textContent = '£' + total.toFixed(2);

    // Bind remove buttons
    container.querySelectorAll('.cart-item-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(parseInt(btn.dataset.index));
      });
    });
  }

  // ───────────────────────── CHECKOUT FLOW ─────────────────────────
  var checkoutStep = 1;

  function openCheckout() {
    var modal = document.getElementById('checkoutModal');
    if (!modal) return;
    checkoutStep = 1;
    updateCheckoutStep();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeCartDrawer();
  }

  function closeCheckout() {
    var modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateCheckoutStep() {
    for (var i = 1; i <= 3; i++) {
      var step = document.getElementById('checkoutStep' + i);
      var dot = document.getElementById('checkoutDot' + i);
      if (step) step.style.display = i === checkoutStep ? 'block' : 'none';
      if (dot) {
        dot.classList.toggle('active', i === checkoutStep);
        dot.classList.toggle('completed', i < checkoutStep);
      }
    }
  }

  function nextCheckoutStep() {
    if (checkoutStep < 3) {
      // Validate current step
      if (checkoutStep === 1) {
        var form = document.getElementById('shippingForm');
        if (form && !form.checkValidity()) { form.reportValidity(); return; }
      }
      checkoutStep++;
      if (checkoutStep === 3) {
        // Generate order number
        var orderNum = 'FC-' + Date.now().toString(36).toUpperCase();
        var orderEl = document.getElementById('orderNumber');
        if (orderEl) orderEl.textContent = orderNum;
        // Clear cart
        cart = [];
        saveCart();
      }
      updateCheckoutStep();
    }
  }

  function prevCheckoutStep() {
    if (checkoutStep > 1) {
      checkoutStep--;
      updateCheckoutStep();
    }
  }

  // ───────────────────────── BOOK A SESSION MODAL ─────────────────────────
  var bookStep = 1;

  function openBookModal() {
    var modal = document.getElementById('bookModal');
    if (!modal) return;
    bookStep = 1;
    updateBookStep();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBookModal() {
    var modal = document.getElementById('bookModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateBookStep() {
    for (var i = 1; i <= 3; i++) {
      var step = document.getElementById('bookStep' + i);
      var dot = document.getElementById('bookDot' + i);
      if (step) step.style.display = i === bookStep ? 'block' : 'none';
      if (dot) {
        dot.classList.toggle('active', i === bookStep);
        dot.classList.toggle('completed', i < bookStep);
      }
    }
  }

  function nextBookStep() {
    if (bookStep < 3) {
      bookStep++;
      updateBookStep();
    }
  }

  function prevBookStep() {
    if (bookStep > 1) {
      bookStep--;
      updateBookStep();
    }
  }

  // ───────────────────────── MEMBERSHIP PANEL ─────────────────────────
  function openMembershipPanel() {
    var panel = document.getElementById('membershipPanel');
    if (!panel) return;
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMembershipPanel() {
    var panel = document.getElementById('membershipPanel');
    if (!panel) return;
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ───────────────────────── FAQ ACCORDION ─────────────────────────
  function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var wasOpen = item.classList.contains('open');

        // Close siblings (optional — remove for multi-open)
        item.parentElement.querySelectorAll('.faq-item.open').forEach(function (el) {
          el.classList.remove('open');
        });

        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  function initFaqSearch() {
    var input = document.getElementById('faqSearch');
    if (!input) return;
    input.addEventListener('input', function () {
      var query = input.value.toLowerCase();
      document.querySelectorAll('.faq-item').forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // ───────────────────────── LIGHTBOX GALLERY ─────────────────────────
  var lightboxImages = [];
  var lightboxIndex = 0;

  function initLightbox() {
    document.querySelectorAll('[data-lightbox]').forEach(function (el, i) {
      lightboxImages.push(el.getAttribute('data-lightbox') || el.src);
      el.addEventListener('click', function () {
        lightboxIndex = i;
        openLightbox();
      });
    });
  }

  function openLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderLightbox();
  }

  function closeLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderLightbox() {
    var img = document.getElementById('lightboxImg');
    var counter = document.getElementById('lightboxCounter');
    if (img) img.src = lightboxImages[lightboxIndex];
    if (counter) counter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
  }

  function lightboxNext() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    renderLightbox();
  }

  function lightboxPrev() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    renderLightbox();
  }

  // ───────────────────────── NEWSLETTER ─────────────────────────
  function initNewsletter() {
    var forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var msg = form.querySelector('.newsletter-msg');
        if (input && input.value) {
          if (msg) {
            msg.textContent = 'Thank you for joining the Anchor List!';
            msg.style.display = 'block';
          }
          input.value = '';
          setTimeout(function () {
            if (msg) msg.style.display = 'none';
          }, 4000);
        }
      });
    });
  }

  // ───────────────────────── EXPOSE GLOBALS ─────────────────────────
  window.fcAddToCart = addToCart;
  window.fcOpenCartDrawer = openCartDrawer;
  window.fcCloseCartDrawer = closeCartDrawer;
  window.fcOpenCheckout = openCheckout;
  window.fcCloseCheckout = closeCheckout;
  window.fcNextCheckoutStep = nextCheckoutStep;
  window.fcPrevCheckoutStep = prevCheckoutStep;
  window.fcOpenBookModal = openBookModal;
  window.fcCloseBookModal = closeBookModal;
  window.fcNextBookStep = nextBookStep;
  window.fcPrevBookStep = prevBookStep;
  window.fcOpenMembershipPanel = openMembershipPanel;
  window.fcCloseMembershipPanel = closeMembershipPanel;
  window.fcCloseLightbox = closeLightbox;
  window.fcLightboxNext = lightboxNext;
  window.fcLightboxPrev = lightboxPrev;

  // ───────────────────────── INIT ─────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initFadeIn();
    initStagger();
    initCountUp();
    initHamburger();
    initDropdowns();
    initFaqAccordion();
    initFaqSearch();
    initLightbox();
    initNewsletter();
    getCart();
    updateCartBadge();

    // Close buttons
    document.querySelectorAll('[data-close-cart]').forEach(function (el) {
      el.addEventListener('click', closeCartDrawer);
    });
    document.querySelectorAll('[data-close-checkout]').forEach(function (el) {
      el.addEventListener('click', closeCheckout);
    });
    document.querySelectorAll('[data-close-book]').forEach(function (el) {
      el.addEventListener('click', closeBookModal);
    });
    document.querySelectorAll('[data-close-membership]').forEach(function (el) {
      el.addEventListener('click', closeMembershipPanel);
    });
    document.querySelectorAll('[data-close-lightbox]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    // Overlay clicks
    ['cartDrawerOverlay', 'checkoutOverlay', 'bookOverlay', 'membershipOverlay'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', function () {
        closeCartDrawer(); closeCheckout(); closeBookModal(); closeMembershipPanel();
      });
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeCartDrawer(); closeCheckout(); closeBookModal(); closeMembershipPanel(); closeLightbox();
      }
      if (document.getElementById('lightbox') && document.getElementById('lightbox').classList.contains('open')) {
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
      }
    });
  });

})();
