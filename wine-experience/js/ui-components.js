/**
 * Terroir UI Components
 * 
 * This script provides shared UI functionality across the platform including:
 * - Navigation enhancements
 * - Search overlay functionality
 * - Scroll animations
 * - Modal dialogs
 * - Toast notifications
 * - Responsive behaviors
 */

// DOM Elements
const navbar = document.querySelector('.navbar');
const searchIcon = document.querySelector('.search-icon');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const closeSearchButton = document.getElementById('close-search');
const searchResultsContainer = document.getElementById('search-results');
const searchSuggestions = document.querySelectorAll('.suggestion-tag');
const modalOverlay = document.getElementById('modal-overlay');

// Global state
let isSearchActive = false;
let searchTimeout;
let activeToasts = [];

// Initialize UI components when document is ready
document.addEventListener('DOMContentLoaded', initUI);

/**
 * Initialize UI components
 */
function initUI() {
    // Setup navigation enhancements
    setupNavigation();
    
    // Initialize search functionality
    initSearch();
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Initialize tooltips if Bootstrap is available
    initTooltips();
    
    // Prepare lazySizes if available
    initLazyLoading();
    
    // Add touch support detection
    detectTouchSupport();
}

/**
 * Setup navigation enhancements
 */
function setupNavigation() {
    // Navbar scroll behavior
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Trigger immediately to set correct initial state
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip empty anchors or javascript: links
            if (targetId === '#' || targetId.startsWith('javascript:')) {
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - navbarHeight - 20, // Add some padding
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Add active state to current navigation item
    highlightCurrentNavItem();
    
    // Add scroll indicator interaction
    initScrollIndicator();
}

/**
 * Highlight the current navigation item
 */
function highlightCurrentNavItem() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    if (navLinks.length === 0) return;
    
    // Get current page URL
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if this link matches the current page
        if (linkPath === currentPath || 
            (currentPath.endsWith('/') && linkPath === currentPath + 'index.html') ||
            (linkPath === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
            
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Initialize scroll indicator interaction
 */
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (!scrollIndicator) return;
    
    // Add click handler to scroll to content
    scrollIndicator.addEventListener('click', () => {
        const exploreSection = document.getElementById('explore-section');
        
        if (exploreSection) {
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = exploreSection.getBoundingClientRect().top + window.pageYOffset;
            
            window.scrollTo({
                top: targetPosition - navbarHeight - 20,
                behavior: 'smooth'
            });
        }
    });
    
    // Hide scroll indicator when scrolled
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
        }
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    // Search icon click handler
    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearch);
        searchIcon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleSearch();
                e.preventDefault();
            }
        });
    }
    
    // Close search button
    if (closeSearchButton) {
        closeSearchButton.addEventListener('click', closeSearch);
    }
    
    // Close search on overlay click
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
        
        // Close search on escape key
        searchOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }
    
    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        
        // Handle enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
    
    // Search suggestion tags
    if (searchSuggestions) {
        searchSuggestions.forEach(tag => {
            tag.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = tag.textContent;
                    performSearch(tag.textContent);
                }
            });
        });
    }
}

/**
 * Toggle search overlay
 */
function toggleSearch() {
    if (!searchOverlay) return;
    
    if (isSearchActive) {
        closeSearch();
    } else {
        openSearch();
    }
}

/**
 * Open search overlay
 */
function openSearch() {
    if (!searchOverlay) return;
    
    isSearchActive = true;
    searchOverlay.classList.add('active');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus search input
    if (searchInput) {
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }
}

/**
 * Close search overlay
 */
function closeSearch() {
    if (!searchOverlay) return;
    
    isSearchActive = false;
    searchOverlay.classList.remove('active');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Return focus to search icon
    if (searchIcon) {
        searchIcon.focus();
    }
}

/**
 * Handle search input with debounce
 * @param {Event} event - Input event
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search to avoid excessive API calls
    searchTimeout = setTimeout(() => {
        if (query.length >= 2) {
            performSearch(query);
        } else {
            clearSearchResults();
        }
    }, 300);
}

/**
 * Perform search
 * @param {string} query - Search query
 */
function performSearch(query) {
    if (!searchResultsContainer || !query || query.length < 2) return;
    
    // Show loading indicator
    searchResultsContainer.innerHTML = `
        <div class="search-loading">
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
            <p>Searching...</p>
        </div>
    `;
    
    // In a real application, this would make an API call to search the database
    // For this demo, we'll simulate a search with setTimeout
    setTimeout(() => {
        // For demo purposes, generate some mock results
        const mockResults = generateMockSearchResults(query);
        displaySearchResults(mockResults, query);
    }, 800);
}

/**
 * Generate mock search results
 * @param {string} query - Search query
 * @returns {Array} Mock search results
 */
function generateMockSearchResults(query) {
    query = query.toLowerCase();
    
    // Static mock data - in a real app this would come from an API
    const allMockItems = [
        {
            title: "Château Margaux 2018",
            type: "wine",
            category: "Red Wine",
            url: "wines.html?id=chateau-margaux-2018",
            image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Elegant Bordeaux with notes of blackcurrant and cedar"
        },
        {
            title: "Napa Valley",
            type: "region",
            category: "Wine Region",
            url: "index.html?region=Napa+Valley",
            image: "https://images.unsplash.com/photo-1507434800635-78f25bc18784?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Renowned region for Cabernet Sauvignon in California"
        },
        {
            title: "Sauvignon Blanc",
            type: "variety",
            category: "White Grape",
            url: "wines.html?variety=Sauvignon+Blanc",
            image: "https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Crisp white variety with citrus and herbaceous notes"
        },
        {
            title: "Champagne",
            type: "region",
            category: "Wine Region",
            url: "index.html?region=Champagne",
            image: "https://images.unsplash.com/photo-1605869310077-deaf8a22c128?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Famous French region for sparkling wine production"
        },
        {
            title: "Barolo",
            type: "wine",
            category: "Red Wine",
            url: "wines.html?variety=Nebbiolo",
            image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Powerful Italian red wine from the Piedmont region"
        },
        {
            title: "Wine Tasting Guide",
            type: "article",
            category: "Education",
            url: "knowledge.html",
            image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Learn the basics of professional wine tasting"
        },
        {
            title: "Dom Pérignon 2010",
            type: "wine",
            category: "Champagne",
            url: "wines.html?id=dom-perignon-2010",
            image: "https://images.unsplash.com/photo-1605869310077-deaf8a22c128?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Prestigious vintage champagne with complex flavors"
        },
        {
            title: "Bordeaux Wine Guide",
            type: "article",
            category: "Education",
            url: "knowledge.html?article=bordeaux-guide",
            image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            description: "Understanding Bordeaux classifications and styles"
        }
    ];
    
    // Filter mock data based on query
    return allMockItems.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
}

/**
 * Display search results
 * @param {Array} results - Search results
 * @param {string} query - Search query
 */
function displaySearchResults(results, query) {
    if (!searchResultsContainer) return;
    
    if (results.length === 0) {
        searchResultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No results found for "${query}"</p>
                <p class="suggestion">Try a different search term or browse our collection.</p>
            </div>
        `;
        return;
    }
    
    // Group results by type
    const groupedResults = {
        wine: results.filter(r => r.type === 'wine'),
        region: results.filter(r => r.type === 'region'),
        variety: results.filter(r => r.type === 'variety'),
        article: results.filter(r => r.type === 'article')
    };
    
    let html = `<p class="results-count">${results.length} results for "${query}"</p>`;
    
    // Generate HTML for each group
    for (const [type, items] of Object.entries(groupedResults)) {
        if (items.length === 0) continue;
        
        const groupTitle = {
            wine: 'Wines',
            region: 'Regions',
            variety: 'Grape Varieties',
            article: 'Articles & Guides'
        }[type] || 'Other Results';
        
        html += `
            <div class="result-group">
                <h4 class="result-group-title">${groupTitle}</h4>
                <div class="result-items">
                    ${items.map((item, index) => `
                        <a href="${item.url}" class="result-item fade-in" style="animation-delay: ${index * 0.1}s">
                            <div class="result-image">
                                <img src="${item.image}" alt="${item.title}">
                            </div>
                            <div class="result-content">
                                <h5 class="result-title">${item.title}</h5>
                                <span class="result-category">${item.category}</span>
                                <p class="result-description">${item.description}</p>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    searchResultsContainer.innerHTML = html;
}

/**
 * Clear search results
 */
function clearSearchResults() {
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = '';
    }
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length === 0) return;
    
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements
        animateElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animateElements.forEach(element => {
            element.classList.add('animated');
        });
    }
    
    // Reading progress indicator
    initReadingProgress();
}

/**
 * Initialize reading progress indicator
 */
function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Initialize tooltips if Bootstrap is available
 */
function initTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Initialize lazy loading
 */
function initLazyLoading() {
    // Add lazySizes if available
    if (typeof lazySizes !== 'undefined') {
        document.addEventListener('lazyloaded', (e) => {
            const img = e.target;
            
            // Add fade-in animation to lazy-loaded images
            img.classList.add('lazy-fade-in');
        });
    }
}

/**
 * Detect touch support and add appropriate class to body
 */
function detectTouchSupport() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    } else {
        document.body.classList.add('no-touch');
    }
}

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Generate unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;
    
    // Get appropriate icon
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const icon = iconMap[type] || iconMap.info;
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add to tracking array
    activeToasts.push(toastId);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close button handler
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        removeToast(toastId);
    });
    
    // Auto-dismiss after duration
    setTimeout(() => {
        removeToast(toastId);
    }, duration);
    
    return toastId;
}

/**
 * Remove toast notification
 * @param {string} toastId - Toast ID to remove
 */
function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    
    if (!toast) return;
    
    // Animate out
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Remove from tracking array
        activeToasts = activeToasts.filter(id => id !== toastId);
        
        // Remove container if no more toasts
        if (activeToasts.length === 0) {
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer && toastContainer.parentNode) {
                toastContainer.parentNode.removeChild(toastContainer);
            }
        }
    }, 300);
}

/**
 * Create and show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal content HTML
 * @param {Array} options.buttons - Array of button objects
 * @param {string} options.size - Modal size (small, medium, large)
 * @returns {Object} Modal control object
 */
function showModal(options) {
    const defaults = {
        title: 'Information',
        content: '',
        buttons: [
            {
                text: 'Close',
                type: 'secondary',
                handler: null
            }
        ],
        size: 'medium'
    };
    
    const settings = { ...defaults, ...options };
    
    // Create modal element
    const modalId = 'modal-' + Date.now();
    const modal = document.createElement('div');
    modal.className = `custom-modal modal-${settings.size}`;
    modal.id = modalId;
    
    // Create modal HTML
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${settings.title}</h3>
                <button class="modal-close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${settings.content}
            </div>
            <div class="modal-footer">
                ${settings.buttons.map(btn => `
                    <button class="btn btn-${btn.type || 'secondary'} modal-btn" 
                            data-action="${btn.action || 'close'}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Show modal overlay
    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Add event listeners
    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
        closeModal(modalId);
    });
    
    // Add button handlers
    const buttons = modal.querySelectorAll('.modal-btn');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            
            if (action === 'close') {
                closeModal(modalId);
            } else if (settings.buttons[index].handler) {
                settings.buttons[index].handler();
            }
        });
    });
    
    // Handle ESC key
    const keyHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    // Add outside click handler
    const clickHandler = (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    };
    
    modal.addEventListener('click', clickHandler);
    
    // Return control object
    return {
        id: modalId,
        close: () => closeModal(modalId),
        setContent: (html) => {
            const body = modal.querySelector('.modal-body');
            if (body) {
                body.innerHTML = html;
            }
        },
        setTitle: (title) => {
            const titleEl = modal.querySelector('.modal-title');
            if (titleEl) {
                titleEl.textContent = title;
            }
        }
    };
}

/**
 * Close a modal dialog
 * @param {string} modalId - Modal ID to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (!modal) return;
    
    // Animate out
    modal.classList.remove('show');
    modal.classList.add('hide');
    
    // Hide overlay if no other modals are open
    const otherModals = document.querySelectorAll('.custom-modal.show');
    if (otherModals.length <= 1 && modalOverlay) {
        modalOverlay.classList.remove('active');
    }
    
    // Restore body scrolling if no other modals/overlays are open
    const activeOverlays = document.querySelectorAll('.custom-modal.show, .cart-modal.active, #search-overlay.active');
    if (activeOverlays.length <= 1) {
        document.body.style.overflow = '';
    }
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Expose functions to global scope for HTML usage
window.showToast = showToast;
window.showModal = showModal;
window.toggleSearch = toggleSearch;