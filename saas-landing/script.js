const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.pageYOffset > 60));

const reveals = document.querySelectorAll('.feature-card, .step, .price-card, .testimonial-card, .badge, .hero h1, .hero-desc, .hero-buttons, .hero-proof, .hero-visual');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
reveals.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
