document.addEventListener('DOMContentLoaded', function () {
    // --- CORE LOGIC ---
    let cart = JSON.parse(localStorage.getItem('sruthysWorldCart')) || [];

    const updateCartCount = () => {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            if (totalItems > 0) {
                el.classList.add('updated');
                setTimeout(() => {
                    el.classList.remove('updated');
                }, 300);
            }
        });
    };

    const saveCart = () => {
        localStorage.setItem('sruthysWorldCart', JSON.stringify(cart));
        updateCartCount();
    };

    // --- GLOBAL COMPONENTS INITIALIZATION ---
    function initGlobalComponents() {
        // Mobile Menu Toggle (for potential future use, currently replaced by dock)
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
            });
        }

        // Header Shadow on Scroll
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

        // Active Navigation Link Styling
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const navLinks = document.querySelectorAll('.nav-link, .dock-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === currentPage) {
                link.classList.add('active');
            }
        });

        // Set current year in footer
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Initial Cart Count Update on Page Load
        updateCartCount();
    }

    // --- PAGE-SPECIFIC INITIALIZERS ---

    function initHomepage() {

        const carousel = document.querySelector('.carousel-wrapper');
        if (!carousel) return;
        
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        const container = carousel.querySelector('.carousel-container');
        
        let currentIndex = 0;
        let slidesPerView = 1;
        let slideWidth = 0;
        let maxIndex = 0;
        let autoPlayInterval = null;
        let isDragging = false;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        
        // Calculate responsive values
        function calculateLayout() {
            const viewportWidth = window.innerWidth;
            
            if (viewportWidth >= 1024) {
                slidesPerView = 3;
            } else if (viewportWidth >= 640) {
                slidesPerView = 2;
            } else {
                slidesPerView = 1;
            }
            
            slideWidth = 100 / slidesPerView;
            maxIndex = Math.max(0, slides.length - slidesPerView);
            
            // Update slide widths
            slides.forEach(slide => {
                slide.style.minWidth = `${slideWidth}%`;
            });
            
            // Create dots
            createDots();
            
            // Go to current slide
            goToSlide(Math.min(currentIndex, maxIndex));
        }
        
        // Create dot indicators
        function createDots() {
            dotsContainer.innerHTML = '';
            const dotCount = maxIndex + 1;
            
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
                if (i === currentIndex) {
                    dot.classList.add('active');
                }
                
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoPlay();
                });
                
                dotsContainer.appendChild(dot);
            }
        }
        
        // Update active dot
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // Go to specific slide
        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            const translateX = -currentIndex * slideWidth;
            
            track.classList.add('smooth-transition');
            track.style.transform = `translateX(${translateX}%)`;
            
            updateDots();
            updateButtonStates();
            
            prevTranslate = translateX;
        }
        
        // Update button states
        function updateButtonStates() {
            if (prevBtn) {
                prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
                prevBtn.style.cursor = currentIndex === 0 ? 'default' : 'pointer';
            }
            
            if (nextBtn) {
                nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
                nextBtn.style.cursor = currentIndex === maxIndex ? 'default' : 'pointer';
            }
        }
        
        // Navigation
        function goToPrevious() {
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
        }
        
        // Smooth loop transition from last to first slide
        function goToNext() {
            if (currentIndex < maxIndex) {
                goToSlide(currentIndex + 1);
            } else {
                // Smooth transition to first slide
                currentIndex = 0;
                track.classList.add('smooth-transition');
                track.style.transform = `translateX(0%)`;
                updateDots();
                updateButtonStates();
                prevTranslate = 0;
            }
        }
        
        // Touch/Mouse drag support
        function handleDragStart(e) {
            isDragging = true;
            container.classList.add('dragging');
            track.classList.remove('smooth-transition');
            
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            
            e.preventDefault();
        }
        
        function handleDragMove(e) {
            if (!isDragging) return;
            
            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            const diff = currentX - startX;
            const translatePercent = (diff / container.offsetWidth) * 100;
            
            currentTranslate = prevTranslate + translatePercent;
            
            // Add resistance at boundaries
            if (currentTranslate > 0) {
                currentTranslate = currentTranslate * 0.3;
            } else if (currentTranslate < -maxIndex * slideWidth) {
                const overflow = currentTranslate + maxIndex * slideWidth;
                currentTranslate = -maxIndex * slideWidth + overflow * 0.3;
            }
            
            track.style.transform = `translateX(${currentTranslate}%)`;
        }
        
        function handleDragEnd(e) {
            if (!isDragging) return;
            
            isDragging = false;
            container.classList.remove('dragging');
            
            const moved = currentTranslate - prevTranslate;
            const threshold = slideWidth * 0.2;
            
            if (moved < -threshold && currentIndex < maxIndex) {
                goToSlide(currentIndex + 1);
            } else if (moved > threshold && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else {
                goToSlide(currentIndex);
            }
            
            resetAutoPlay();
        }
        
        // Auto-play functionality
        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            
            autoPlayInterval = setInterval(() => {
                goToNext();
            }, 4000);
        }
        
        function resetAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                // Only restart autoplay on tablet/desktop (640px+)
                if (window.innerWidth >= 640) {
                    startAutoPlay();
                }
            }
        }
        
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToPrevious();
                resetAutoPlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToNext();
                resetAutoPlay();
            });
        }
        
        // Touch events
        container.addEventListener('touchstart', handleDragStart, { passive: false });
        container.addEventListener('touchmove', handleDragMove, { passive: false });
        container.addEventListener('touchend', handleDragEnd);
        
        // Mouse events for desktop
        container.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        
        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                goToNext();
                resetAutoPlay();
            }
        });
        
        // Pause on hover (desktop only)
        carousel.addEventListener('mouseenter', () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            if (!isDragging && window.innerWidth >= 640) {
                startAutoPlay();
            }
        });
        
        // Initialize
        calculateLayout();
        // Only start autoplay on tablet/desktop
        if (window.innerWidth >= 640) {
            startAutoPlay();
        }
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                calculateLayout();
                // Restart autoplay based on new screen size
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    if (window.innerWidth >= 640) {
                        startAutoPlay();
                    }
                }
            }, 100);
        });
    
    
        // Show all and collapse button


        const showAllButton = document.getElementById('show-all-products');
        const collapseButton = document.getElementById('collapse-products');
        if(showAllButton && collapseButton) {
            const hiddenProducts = document.querySelectorAll('.product-card.hidden-mobile');
            
            showAllButton.addEventListener('click', () => {
                hiddenProducts.forEach(product => {
                    product.style.display = 'block';
                });
                showAllButton.style.display = 'none';
                collapseButton.style.display = 'inline-block';
            });

            collapseButton.addEventListener('click', () => {
                hiddenProducts.forEach(product => {
                    product.style.display = 'none';
                });
                collapseButton.style.display = 'none';
                showAllButton.style.display = 'inline-block';
            });
        }
    }

    function initProductPages() {
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            const filterButtons = document.querySelectorAll('.filter-btn');
            if (filterButtons.length > 0) {
                const products = Array.from(productGrid.querySelectorAll('.product-card'));
                filterButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        filterButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        const filter = button.dataset.filter;
                        products.forEach(product => {
                            product.style.display = (filter === 'all' || product.dataset.category === filter) ? 'block' : 'none';
                        });
                    });
                });
            }
        }
    }

    function initProductDetailPage() {
        const productInfo = document.querySelector('.product-info');
        if (!productInfo) return; // Exit if not a product detail page
        handleRecentlyViewed(productInfo);

        // Add to Cart Logic
        const addToCartButton = productInfo.querySelector('.add-to-cart-btn');
        addToCartButton.addEventListener('click', () => {
            const productId = productInfo.querySelector('h1').textContent;
            const sizeSelector = productInfo.querySelector('.size-selector');
            const quantitySelector = productInfo.querySelector('.quantity-selector');
            
            let cartId;
            let productToAdd;

            if (sizeSelector) {
                const selectedSize = productInfo.querySelector('input[name="size"]:checked');
                const size = selectedSize.value;
                const price = parseFloat(selectedSize.dataset.price);
                const quantity = quantitySelector ? parseInt(quantitySelector.querySelector('.quantity-input').value) : 1;
                cartId = `${productId} - ${size}`;
                productToAdd = { id: cartId, name: productId, size: size, price: price, image: document.getElementById('main-product-image').src, url: window.location.pathname, quantity: quantity };
            } else {
                const price = parseFloat(document.getElementById('product-price').textContent.replace('₹', ''));
                const quantity = quantitySelector ? parseInt(quantitySelector.querySelector('.quantity-input').value) : 1;
                cartId = productId;
                productToAdd = { id: cartId, name: productId, price: price, image: document.getElementById('main-product-image').src, url: window.location.pathname, quantity: quantity };
            }

            const existingProduct = cart.find(item => item.id === cartId);
            if (existingProduct) {
                existingProduct.quantity += productToAdd.quantity;
            } else {
                cart.push(productToAdd);
            }
            saveCart();
        });

        // Quantity Selector Logic
        const quantitySelector = productInfo.querySelector('.quantity-selector');
        if (quantitySelector) {
            const minusBtn = quantitySelector.querySelector('.minus-btn');
            const plusBtn = quantitySelector.querySelector('.plus-btn');
            const quantityInput = quantitySelector.querySelector('.quantity-input');

            minusBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
            });
        }

        // Size Selector Logic
        const sizeOptions = productInfo.querySelectorAll('.size-option input');
        const productPriceElement = document.getElementById('product-price');
        if (sizeOptions.length > 0 && productPriceElement) {
            sizeOptions.forEach(radio => {
                radio.addEventListener('change', () => {
                    const newPrice = parseFloat(radio.dataset.price);
                    productPriceElement.textContent = `₹${newPrice.toFixed(2)}`;
                });
            });
        }

        // Image Gallery Logic
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail-image');
        if (mainImage && thumbnails.length > 0) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    mainImage.src = this.src;
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
        
        // Share Links Logic
        const shareSection = document.querySelector('.share-section');
        if (shareSection) {
            const productUrl = window.location.href;
            const productTitle = document.querySelector('.product-info h1').textContent;

            const facebookLink = shareSection.querySelector('.facebook');
            const twitterLink = shareSection.querySelector('.twitter');
            const whatsappLink = shareSection.querySelector('.whatsapp');
            const copyLinkBtn = shareSection.querySelector('.copy-link');
            const tooltip = document.getElementById('copy-tooltip');

            facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
            twitterLink.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`;
            whatsappLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(productTitle + ' ' + productUrl)}`;

            copyLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const textArea = document.createElement('textarea');
                textArea.value = productUrl;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    tooltip.classList.add('show');
                    setTimeout(() => {
                        tooltip.classList.remove('show');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
                document.body.removeChild(textArea);
            });
        }
    }

    // ... after the initProductDetailPage() function ...

    // --- RECENTLY VIEWED LOGIC ---
    function handleRecentlyViewed(productInfo) {
        try {
            const currentProduct = {
                id: productInfo.querySelector('h1').textContent,
                name: productInfo.querySelector('h1').textContent,
                price: document.getElementById('product-price').textContent,
                image: document.getElementById('main-product-image').src,
                url: window.location.pathname.split('/').pop()
            };

            let recentlyViewed = JSON.parse(localStorage.getItem('sruthysRecentlyViewed')) || [];
            recentlyViewed = recentlyViewed.filter(item => item.id !== currentProduct.id);
            recentlyViewed.unshift(currentProduct);
            if (recentlyViewed.length > 4) recentlyViewed.pop();
            localStorage.setItem('sruthysRecentlyViewed', JSON.stringify(recentlyViewed));

            renderRecentlyViewed(currentProduct.id);
        } catch (error) {
            console.error("Error handling recently viewed items:", error);
        }
    }

    function renderRecentlyViewed(currentProductId) {
        const grid = document.getElementById('recently-viewed-grid');
        if (!grid) return;

        try {
            const recentlyViewed = JSON.parse(localStorage.getItem('sruthysRecentlyViewed')) || [];
            const itemsToDisplay = recentlyViewed.filter(item => item.id !== currentProductId);

            if (itemsToDisplay.length === 0) {
                grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">You haven\'t viewed any other products yet.</p>';
                return;
            }

            grid.innerHTML = itemsToDisplay.map(item => `
                <a href="${item.url}" class="product-card">
                    <img src="${item.image}" alt="${item.name}" class="product-card-image">
                    <div class="product-card-content">
                        <h3 class="product-card-title">${item.name}</h3>
                        <p class="product-card-price">${item.price}</p>
                    </div>
                </a>
            `).join('');
        } catch (error) {
            console.error("Error rendering recently viewed items:", error);
            grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Could not load recently viewed items.</p>';
        }
    }



    function initCartPage() {
        const cartContainer = document.getElementById('cart-container');
        if (!cartContainer) return; // Exit if not on the cart page
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `<div class="empty-cart-message">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.555c-.656 0-1.189-.585-1.119-1.243l1.263-12a1.125 1.125 0 011.119-1.007h8.858c.482 0 .923.29.1.08.744z" /></svg>
                <h2 class="section-title">Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <a href="products.html" class="btn btn-primary btn-large" style="margin-top: 1.5rem;">Start Shopping</a>
            </div>`;
        } else {
            const itemsHtml = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <a href="${item.url}"><img src="${item.image}" alt="${item.name}" class="cart-item-image"></a>
                    <div class="cart-item-details">
                        <a href="${item.url}"><h3>${item.name}</h3></a>
                        ${item.size ? `<p class="size">Size: ${item.size}</p>` : ''}
                        <p class="price">₹${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn minus-btn" type="button">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
                            <button class="quantity-btn plus-btn" type="button">+</button>
                        </div>
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            `).join('');

            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = subtotal;

            cartContainer.innerHTML = `
                <div class="cart-items">
                    ${itemsHtml}
                </div>
                <div class="cart-summary">
                    <h2 class="section-title">Order Summary</h2>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span id="subtotal">₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span id="total">₹${total.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary btn-large checkout-btn">Proceed to Checkout</button>
                </div>
            `;

            cartContainer.querySelectorAll('.cart-item').forEach(itemElement => {
                const productId = itemElement.dataset.id;
                const minusBtn = itemElement.querySelector('.minus-btn');
                const plusBtn = itemElement.querySelector('.plus-btn');
                const removeBtn = itemElement.querySelector('.remove-btn');

                minusBtn.addEventListener('click', () => {
                    const product = cart.find(item => item.id === productId);
                    if (product && product.quantity > 1) {
                        product.quantity--;
                        saveCart();
                        window.location.reload();
                    }
                });

                plusBtn.addEventListener('click', () => {
                    const product = cart.find(item => item.id === productId);
                    if (product) {
                        product.quantity++;
                        saveCart();
                        window.location.reload();
                    }
                });

                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(item => item.id !== productId);
                    saveCart();
                    window.location.reload();
                });
            });
        }
    }

    function initResultsPage() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const prevBtn = lightbox.querySelector('.prev');
        const nextBtn = lightbox.querySelector('.next');
        const closeBtn = lightbox.querySelector('.close');
        const galleryImages = document.querySelectorAll('.result-image-container img');
        let currentIndex = 0;
        let currentScale = 1;

        const showImage = (index) => {
            lightboxImage.src = galleryImages[index].src;
            currentIndex = index;
            lightbox.classList.add('show');
        };

        const hideLightbox = () => {
            lightbox.classList.remove('show');
            lightboxImage.style.transform = ''; // Reset zoom
            currentScale = 1;
        };

        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => showImage(index));
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            showImage(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            showImage(currentIndex);
        });

        closeBtn.addEventListener('click', hideLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                hideLightbox();
            }
        });

        // Mouse Wheel Zoom
        lightboxImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            let scale = currentScale;
            if (e.deltaY < 0) {
                scale *= 1.1; // Zoom in
            } else {
                scale /= 1.1; // Zoom out
            }
            currentScale = Math.min(Math.max(1, scale), 3); // Clamp scale between 1x and 3x
            lightboxImage.style.transform = `scale(${currentScale})`;
        });

        // Pinch-to-zoom logic
        let initialDistance = null;
        let initialScale = 1;

        const getDistance = (touches) => {
            return Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
        };

        lightboxImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches);
                const transformMatrix = window.getComputedStyle(lightboxImage).getPropertyValue('transform');
                if (transformMatrix !== 'none') {
                    initialScale = parseFloat(transformMatrix.split(',')[0].replace('matrix(', ''));
                } else {
                    initialScale = 1;
                }
            }
        });

        lightboxImage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const newDistance = getDistance(e.touches);
                const scale = (newDistance / initialDistance) * initialScale;
                currentScale = Math.min(Math.max(1, scale), 3); // Clamp scale
                lightboxImage.style.transform = `scale(${currentScale})`;
            }
        });

        lightboxImage.addEventListener('touchend', (e) => {
            initialDistance = null;
        });
    }
    
    function initAccountPage() {
        const loginToggle = document.getElementById('login-toggle');
        const registerToggle = document.getElementById('register-toggle');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginToggle && registerToggle && loginForm && registerForm) {
            registerToggle.addEventListener('click', () => {
                loginToggle.classList.remove('active');
                registerToggle.classList.add('active');
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            });

            loginToggle.addEventListener('click', () => {
                registerToggle.classList.remove('active');
                loginToggle.classList.add('active');
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
            });
        }
    }

    // --- RUN INITIALIZERS ---
    initGlobalComponents();
    initHomepage();
    initProductPages();
    initProductDetailPage();
    initCartPage();
    initResultsPage();
    initAccountPage();
    

});
