document.addEventListener('DOMContentLoaded', function () {
    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
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

    // --- Active Navigation Link Styling ---
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if ((currentPage === '' || currentPage === 'index') && link.dataset.page === 'index') {
            link.classList.add('active');
        } else if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });

    // --- Product Carousel ---
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.next-btn');
        const prevButton = carousel.querySelector('.prev-btn');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        
        if (slides.length > 0) {
            let slideWidth = slides[0].getBoundingClientRect().width;
            let currentIndex = 0;

            // Create dots
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => moveToSlide(i));
                dotsContainer.appendChild(dot);
            });
            const dots = Array.from(dotsContainer.children);

            const moveToSlide = (targetIndex) => {
                const newTransform = -slideWidth * targetIndex;
                track.style.transform = 'translateX(' + newTransform + 'px)';
                currentIndex = targetIndex;
                updateDots(targetIndex);
            };

            const updateDots = (targetIndex) => {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[targetIndex].classList.add('active');
            };

            // Click listeners for nav buttons
            prevButton.addEventListener('click', e => {
                const newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
                moveToSlide(newIndex);
            });

            nextButton.addEventListener('click', e => {
                const newIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
                moveToSlide(newIndex);
            });

            // Recalculate width on resize
            window.addEventListener('resize', () => {
                slideWidth = slides[0].getBoundingClientRect().width;
                moveToSlide(currentIndex);
            });
        }
    }

    // --- Product Filtering ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-grid .product-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filter = button.dataset.filter;

                products.forEach(product => {
                    if (filter === 'all' || product.dataset.category === filter) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Set current year in footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
