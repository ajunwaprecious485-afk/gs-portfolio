const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.pageYOffset > 60));

// Menu filter
const tabs = document.querySelectorAll('.menu-tab');
const items = document.querySelectorAll('.menu-item');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        items.forEach(item => {
            if (cat === 'all' || item.dataset.cat === cat) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// Reservation form
const form = document.getElementById('reserveForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you! Your reservation request has been received. We will confirm shortly.');
    form.reset();
});

// Scroll reveal
const reveals = document.querySelectorAll('.menu-item, .about-visual, .about-text, .special-card, .reserve-info, .reserve-form, .stat');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
reveals.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
