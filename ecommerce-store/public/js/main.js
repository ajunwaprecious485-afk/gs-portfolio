// ============================================
// ShopEase - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // ---- Announcement bar dismiss ----
  var announcement = document.getElementById('announcementBar');
  if (announcement) {
    if (localStorage.getItem('announceHidden') === '1') {
      announcement.style.display = 'none';
    }
  }

  // ---- Mobile menu ----
  var hamburger = document.getElementById('hamburgerMenu');
  var mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
    mobileNav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // ---- Back to top ----
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- AJAX Add to Cart ----
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form.matches('.js-add-to-cart')) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var origText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        productId: form.querySelector('[name="productId"]').value,
        quantity: form.querySelector('[name="quantity"]') ? form.querySelector('[name="quantity"]').value : 1
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        updateCartBadge(data.cartCount);
        showToast('Added to cart!');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added';
        setTimeout(function() { btn.innerHTML = origText; btn.disabled = false; }, 2000);
      } else {
        showToast(data.error || 'Failed to add to cart', 'error');
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    })
    .catch(function() { btn.innerHTML = origText; btn.disabled = false; });
  });

  // ---- Cart badge update ----
  function updateCartBadge(count) {
    document.querySelectorAll('.navbar__cart-count').forEach(function(el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ---- Toast notification ----
  function showToast(msg, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show';
    setTimeout(function() { toast.className = 'toast'; }, 3000);
  }
  window.showToast = showToast;

  // ---- Confirm delete ----
  document.querySelectorAll('.js-confirm-delete').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!confirm('Are you sure you want to delete this?')) e.preventDefault();
    });
  });

});
