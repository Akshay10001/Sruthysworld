document.addEventListener('DOMContentLoaded', function () {
    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            // Optional: Change icon based on state
            mobileMenuButton.innerHTML = isOpen
                ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.5rem; height:1.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.5rem; height:1.5rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`;
        });
    }

    // --- Header Shadow on Scroll ---
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Active Navigation Link Styling for Multi-Page Site ---
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if ((currentPage === '' || currentPage === 'index') && link.dataset.page === 'index') {
            link.classList.add('active');
        } else if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });

    // --- Contact Form Submission (if on index page) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formMessage = document.getElementById('form-message');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
            formMessage.style.color = '#3B666B';
            contactForm.reset();
            setTimeout(() => {
                formMessage.textContent = '';
            }, 5000);
        });
    }

    // --- Set current year in footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});