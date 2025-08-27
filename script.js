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
                let isDragging = false;
                let startPos = 0;
                let currentTranslate = 0;
                let prevTranslate = 0;

                slides.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.classList.add('carousel-dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => moveToSlide(i));
                    dotsContainer.appendChild(dot);
                });
                const dots = Array.from(dotsContainer.children);

                const moveToSlide = (targetIndex) => {
                    track.style.transition = 'transform 0.5s ease-in-out';
                    const newTransform = -slideWidth * targetIndex;
                    track.style.transform = 'translateX(' + newTransform + 'px)';
                    currentIndex = targetIndex;
                    updateDots(targetIndex);
                    prevTranslate = newTransform;
                };

                const updateDots = (targetIndex) => {
                    dots.forEach(dot => dot.classList.remove('active'));
                    dots[targetIndex].classList.add('active');
                };

                prevButton.addEventListener('click', () => {
                    const newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
                    moveToSlide(newIndex);
                });

                nextButton.addEventListener('click', () => {
                    const newIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
                    moveToSlide(newIndex);
                });

                window.addEventListener('resize', () => {
                    slideWidth = slides[0].getBoundingClientRect().width;
                    moveToSlide(currentIndex);
                });

                // Touch/Drag functionality
                const getPositionX = e => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
                
                const dragStart = (e) => {
                    isDragging = true;
                    startPos = getPositionX(e);
                    lastPos = startPos;
                    velocity = 0;
                    track.style.transition = 'none';
                };

                const dragMove = (e) => {
                    if (isDragging) {
                        const currentPosition = getPositionX(e);
                        velocity = currentPosition - lastPos;
                        lastPos = currentPosition;
                        currentTranslate = prevTranslate + currentPosition - startPos;
                        setSliderPosition(); // Update position in real-time
                    }
                };

                const dragEnd = () => {
                    isDragging = false;
                    
                    // Momentum scroll
                    currentTranslate += velocity * 5; // Adjust multiplier for more/less fling
                    
                    // Snap to nearest slide
                    currentIndex = Math.round(currentTranslate / -slideWidth);
                    currentIndex = Math.max(0, Math.min(slides.length - 1, currentIndex));
                    
                    moveToSlide(currentIndex);
                };

                track.addEventListener('mousedown', dragStart);
                track.addEventListener('touchstart', dragStart);
                track.addEventListener('mouseup', dragEnd);
                track.addEventListener('touchend', dragEnd);
                track.addEventListener('mouseleave', () => { if (isDragging) dragEnd(); });
                track.addEventListener('mousemove', dragMove);
                track.addEventListener('touchmove', dragMove);
            }
        }

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
