/* ============================================
   SKITO THEME — JavaScript
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // Header scroll behavior (only for sticky headers)
  // ============================================
  const header = document.querySelector('.site-header--sticky');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ============================================
  // Mobile menu
  // ============================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // FAQ Accordion
  // ============================================
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
          openItem.classList.remove('open');
        });

        // Open clicked (if wasn't open)
        if (!isOpen) {
          item.classList.add('open');
        }
      });

      // Keyboard accessibility
      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }
  initFAQ();

  // ============================================
  // Quantity Selector
  // ============================================
  function initQuantitySelectors() {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
      const input = selector.querySelector('.quantity-input');
      const btnMinus = selector.querySelector('[data-action="minus"]');
      const btnPlus = selector.querySelector('[data-action="plus"]');

      if (!input) return;

      const min = parseInt(input.min || '1');
      const max = parseInt(input.max || '99');

      function updateQty(val) {
        const newVal = Math.max(min, Math.min(max, parseInt(val) || min));
        input.value = newVal;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      btnMinus && btnMinus.addEventListener('click', () => updateQty(parseInt(input.value) - 1));
      btnPlus && btnPlus.addEventListener('click', () => updateQty(parseInt(input.value) + 1));

      input.addEventListener('change', () => updateQty(input.value));
      input.addEventListener('blur', () => updateQty(input.value));
    });
  }
  initQuantitySelectors();

  // ============================================
  // Product Gallery
  // ============================================
  function initProductGallery() {
    const gallery = document.querySelector('.product-gallery');
    if (!gallery) return;

    const mainImage = gallery.querySelector('.product-gallery-main img');
    const thumbs = gallery.querySelectorAll('.product-gallery-thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-src');
        if (mainImage && src) {
          mainImage.src = src;
        }
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    if (thumbs.length > 0) thumbs[0].classList.add('active');
  }
  initProductGallery();

  // ============================================
  // Sticky Add to Cart (mobile)
  // ============================================
  function initStickyATC() {
    const stickyATC = document.querySelector('.sticky-atc');
    const mainATC = document.querySelector('.product-atc-area');

    if (!stickyATC || !mainATC) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stickyATC.classList.add('visible');
        } else {
          stickyATC.classList.remove('visible');
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(mainATC);
  }
  initStickyATC();

  // ============================================
  // Scroll Animations (Intersection Observer)
  // ============================================
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }
  initScrollAnimations();

  // ============================================
  // Bundle Selector
  // ============================================
  function initBundleSelector() {
    const bundleCards = document.querySelectorAll('[data-bundle]');
    if (!bundleCards.length) return;

    bundleCards.forEach(card => {
      const btn = card.querySelector('.bundle-atc-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const bundleId = card.getAttribute('data-bundle');
        const variantId = card.getAttribute('data-variant');
        const qty = parseInt(card.getAttribute('data-qty') || '1');

        if (variantId) {
          addToCart(variantId, qty);
        }
      });
    });
  }
  initBundleSelector();

  // ============================================
  // Cart Count Update
  // ============================================
  function updateCartCount() {
    fetch('/cart.js')
      .then(r => r.json())
      .then(cart => {
        const counts = document.querySelectorAll('.cart-count');
        counts.forEach(el => {
          el.textContent = cart.item_count;
          el.classList.toggle('has-items', cart.item_count > 0);
        });
      })
      .catch(() => {});
  }
  updateCartCount();

  // ============================================
  // Add to Cart (AJAX)
  // ============================================
  function addToCart(variantId, quantity = 1, callback) {
    const body = JSON.stringify({
      items: [{ id: variantId, quantity }]
    });

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body
    })
    .then(r => r.json())
    .then(data => {
      updateCartCount();
      showNotification('✓ Produit ajouté au panier !');
      if (callback) callback(data);
    })
    .catch(err => {
      console.error('Cart error:', err);
    });
  }

  // Expose globally for Liquid templates
  window.SkitoCart = { addToCart, updateCartCount };

  // ============================================
  // ATC Form Handler
  // ============================================
  document.querySelectorAll('.atc-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const variantInput = form.querySelector('[name="id"]');
      const qtyInput = form.querySelector('[name="quantity"]');
      if (!variantInput) return;

      const variantId = variantInput.value;
      const qty = qtyInput ? parseInt(qtyInput.value) : 1;
      const btn = form.querySelector('[type="submit"]');

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Ajout en cours...';
      }

      addToCart(variantId, qty, () => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Ajouté ✓';
          setTimeout(() => {
            btn.textContent = btn.getAttribute('data-original-text') || 'Ajouter au panier';
          }, 2000);
        }
      });
    });
  });

  // ============================================
  // Notification Toast
  // ============================================
  let notifTimeout;
  function showNotification(message) {
    let notif = document.querySelector('.notification');
    if (!notif) {
      notif = document.createElement('div');
      notif.className = 'notification';
      notif.innerHTML = `<span class="notification-icon">🛒</span><span class="notification-text"></span>`;
      document.body.appendChild(notif);
    }
    notif.querySelector('.notification-text').textContent = message;
    notif.classList.add('show');

    clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => notif.classList.remove('show'), 3000);
  }

  // ============================================
  // Cart Page — Update / Remove
  // ============================================
  function initCartPage() {
    const cartForm = document.querySelector('.cart-form');
    if (!cartForm) return;

    // Remove item
    cartForm.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const line = btn.getAttribute('data-line');
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, quantity: 0 })
        })
        .then(r => r.json())
        .then(() => location.reload())
        .catch(console.error);
      });
    });

    // Quantity change
    cartForm.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', () => {
        const line = input.getAttribute('data-line');
        const qty = parseInt(input.value);
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, quantity: qty })
        })
        .then(r => r.json())
        .then(() => location.reload())
        .catch(console.error);
      });
    });
  }
  initCartPage();

  // ============================================
  // Review Bars Animation
  // ============================================
  function initReviewBars() {
    const bars = document.querySelectorAll('.review-bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute('data-width') || '0%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => {
      const width = bar.style.width;
      bar.setAttribute('data-width', width);
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }
  initReviewBars();

  // ============================================
  // Announcement Bar — Dismiss
  // ============================================
  const announcementBar = document.querySelector('.announcement-bar');
  const announcementClose = document.querySelector('.announcement-close');
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.style.display = 'none';
      sessionStorage.setItem('announcement-dismissed', '1');
    });

    if (sessionStorage.getItem('announcement-dismissed') === '1') {
      announcementBar.style.display = 'none';
    }
  }

  // ============================================
  // Smooth Scroll for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
