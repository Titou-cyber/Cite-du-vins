/**
 * UI Components for La Cité Du Vin
 * 
 * This script manages UI interactions including:
 * - Search functionality
 * - Navbar behavior
 * - Cart interactions
 * - Smooth scrolling
 * - Toast notifications
 */

// DOM Elements
const searchIcon = document.getElementById('search-icon');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.querySelector('.search-input');
const suggestionTags = document.querySelectorAll('.suggestion-tag');
const navbar = document.querySelector('.navbar');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCartButton = document.getElementById('close-cart');
const modalOverlay = document.getElementById('modal-overlay');

// ----- Search Functionality -----
function initSearchFunctionality() {
    if (!searchIcon || !searchModal || !searchClose) return;
    
    // Open search modal
    searchIcon.addEventListener('click', () => {
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Focus on search input after a short delay
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 100);
    });
    
    // Close search modal
    searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Click outside to close
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle suggestion tags
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = tag.textContent;
                searchInput.focus();
            }
        });
    });
    
    // Handle search form submission
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // Show a loading message in the search modal
                const searchModalContent = document.querySelector('.search-modal-content');
                searchModalContent.innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner">
                            <div class="double-bounce1"></div>
                            <div class="double-bounce2"></div>
                        </div>
                        <p class="mt-3">Searching for "${searchTerm}"...</p>
                    </div>
                `;
                
                // Redirect to search results page after a brief delay
                setTimeout(() => {
                    window.location.href = `wines.html?search=${encodeURIComponent(searchTerm)}`;
                }, 800);
            }
        });
    }
}

// ----- Navbar Scroll Behavior -----
function initNavbarBehavior() {
    if (!navbar) return;
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Initialize on load
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
}

// ----- Cart Functionality -----
function initCartFunctionality() {
    if (!cartIcon || !cartModal || !closeCartButton || !modalOverlay) return;
    
    // Open cart
    cartIcon.addEventListener('click', () => {
        cartModal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close cart
    closeCartButton.addEventListener('click', () => {
        cartModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Click overlay to close
    modalOverlay.addEventListener('click', () => {
        cartModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ----- Smooth Scrolling -----
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                e.preventDefault();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without page reload (for better UX)
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });
}

// ----- Toast Notifications -----
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                            type === 'error' ? 'fa-exclamation-circle' : 
                            type === 'warning' ? 'fa-exclamation-triangle' : 
                            'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto close after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            toast.classList.add('hide');
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);
}

// ----- Featured Wines Placeholder -----
function initFeaturedWines() {
    const featuredWinesContainer = document.getElementById('featured-wines-container');
    
    if (!featuredWinesContainer) return;
    
    // Simulate loading
    setTimeout(() => {
        // Sample wine data
        const featuredWines = [
            {
                title: "Château Margaux 2018",
                winery: "Château Margaux",
                region: "Bordeaux",
                country: "France",
                varietal: "Cabernet Sauvignon Blend",
                price: 599,
                rating: 97,
                image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "Elegant, complex, and profound with notes of black currant, violet, and cedar."
            },
            {
                title: "Sassicaia 2019",
                winery: "Tenuta San Guido",
                region: "Tuscany",
                country: "Italy",
                varietal: "Cabernet Sauvignon, Cabernet Franc",
                price: 299,
                rating: 96,
                image: "https://images.unsplash.com/photo-1568213816046-0a8e0e9a640d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "A Super Tuscan masterpiece with black cherry, Mediterranean herbs, and refined tannins."
            },
            {
                title: "Opus One 2018",
                winery: "Opus One Winery",
                region: "Napa Valley",
                country: "United States",
                varietal: "Bordeaux Blend",
                price: 379,
                rating: 95,
                image: "https://images.unsplash.com/photo-1624944556248-71d7a50373a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "Harmonious and full-bodied with blackberry, cassis, and a silky finish."
            },
            {
                title: "Dom Pérignon 2012",
                winery: "Moët & Chandon",
                region: "Champagne",
                country: "France",
                varietal: "Chardonnay, Pinot Noir",
                price: 229,
                rating: 94,
                image: "https://images.unsplash.com/photo-1549060260-76c870e0f8cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "Precise and mineral-driven with notes of toasted brioche, citrus, and white flowers."
            }
        ];
        
        // Generate HTML
        featuredWinesContainer.innerHTML = featuredWines.map(wine => `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="wine-card">
                    <div class="wine-type-icon wine-type-${wine.varietal.toLowerCase().includes('blanc') || wine.varietal.toLowerCase().includes('chardonnay') ? 'white' : 
                                                           wine.varietal.toLowerCase().includes('champagne') || wine.title.toLowerCase().includes('champagne') ? 'sparkling' : 
                                                           wine.varietal.toLowerCase().includes('rosé') || wine.varietal.toLowerCase().includes('rose') ? 'rose' : 'red'}">
                        <img src="${wine.image}" alt="${wine.title}" class="wine-image">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${wine.title}</h3>
                        <p class="card-subtitle">${wine.winery}</p>
                        <p class="card-text">${wine.description}</p>
                        
                        <div class="wine-meta">
                            <span class="wine-region">
                                <i class="fas fa-map-marker-alt"></i> ${wine.region}, ${wine.country}
                            </span>
                            <span class="wine-pairing">
                                <i class="fas fa-wine-glass-alt"></i> ${wine.varietal}
                            </span>
                            <span class="wine-rating">${wine.rating}/100</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="wine-price">$${wine.price}</span>
                            <button class="btn-add-to-cart">
                                <i class="fas fa-plus-circle"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to the Add to Cart buttons
        const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
        addToCartButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const wine = featuredWines[index];
                
                // Show success toast
                showToast(`Added ${wine.title} to your cart`, 'success');
                
                // Change button state temporarily
                button.innerHTML = '<i class="fas fa-check"></i> Added';
                button.classList.add('added');
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-plus-circle"></i> Add to Cart';
                    button.classList.remove('added');
                }, 2000);
                
                // Update cart count (simulated)
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    const currentCount = parseInt(cartCount.textContent) || 0;
                    cartCount.textContent = currentCount + 1;
                    cartCount.classList.add('pulse');
                    
                    setTimeout(() => {
                        cartCount.classList.remove('pulse');
                    }, 600);
                }
            });
        });
    }, 1500); // Simulate network delay
}

// ----- Animation on scroll -----
function initScrollAnimations() {
    // Simple function to check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    };
    
    // Elements to animate
    const animatedElements = document.querySelectorAll('.feature-card, .region-card, .wine-card, .section-header');
    
    // Add animation classes when elements come into view
    const handleScroll = () => {
        animatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated', 'fade-in');
            }
        });
    };
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize search functionality
    initSearchFunctionality();
    
    // Initialize navbar behavior
    initNavbarBehavior();
    
    // Initialize cart functionality
    initCartFunctionality();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize featured wines
    initFeaturedWines();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Log site initialization
    console.log('La Cité Du Vin UI components initialized');
});

// For global access to toast functionality
window.showToast = showToast;