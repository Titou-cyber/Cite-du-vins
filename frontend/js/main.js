/**
 * main.js - Enhanced main script for the Cité du Vin Marketplace
 * Handles UI interactions, animations, and marketplace functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Application state
    const state = {
        wines: [],
        currentPage: 1,
        totalPages: 1,
        totalWines: 0,
        itemsPerPage: 24,
        isLoading: false,
        searchQuery: '',
        filters: {
            region: '',
            variety: '',
            type: '',
            minPrice: '',
            maxPrice: '',
            rating: ''
        },
        viewMode: 'grid', // 'grid' or 'list'
        sortBy: 'rating-desc', // Default sorting
        activeFilters: [], // List of active filters for display
        recommendations: [], // User recommendations
        cart: [], // Shopping cart data
        userPreferences: loadUserPreferences() // Load saved preferences from localStorage
    };

    // Cache DOM elements
    const elements = {
        // Wine display elements
        winesGrid: document.getElementById('wines-grid'),
        winesList: document.getElementById('wines-list'),
        emptyState: document.getElementById('empty-state'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorContainer: document.getElementById('error-container'),
        winesCount: document.getElementById('wines-count'),
        
        // Filter form elements
        filterForm: document.getElementById('filter-form'),
        regionSelect: document.getElementById('region'),
        varietySelect: document.getElementById('variety'),
        typeSelect: document.getElementById('type'),
        minPriceInput: document.getElementById('minPrice'),
        maxPriceInput: document.getElementById('maxPrice'),
        ratingInput: document.getElementById('rating'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        clearFiltersBtn: document.getElementById('clear-filters-btn'),
        activeFiltersContainer: document.getElementById('active-filters'),
        
        // Price range UI elements
        priceMinValue: document.getElementById('price-min-value'),
        priceMaxValue: document.getElementById('price-max-value'),
        priceRangeTrack: document.getElementById('price-range-track'),
        ratingValue: document.getElementById('rating-value'),
        ratingRangeTrack: document.getElementById('rating-range-track'),
        
        // Search form elements
        searchForm: document.getElementById('search-form'),
        searchInput: document.getElementById('search-input'),
        
        // Sorting and view controls
        sortSelect: document.getElementById('sort-select'),
        gridViewBtn: document.getElementById('grid-view-btn'),
        listViewBtn: document.getElementById('list-view-btn'),
        
        // Pagination elements
        itemsPerPageSelect: document.getElementById('items-per-page'),
        paginationInfo: document.getElementById('pagination-info'),
        pageNumbers: document.getElementById('page-numbers'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        
        // Recommendations
        recommendationsContainer: document.getElementById('recommendations-container'),
        recommendationsLoading: document.getElementById('recommendations-loading'),
        
        // Header elements
        cartButton: document.getElementById('cart-button'),
        cartPreview: document.getElementById('cart-preview'),
        cartPreviewItems: document.getElementById('cart-preview-items'),
        cartPreviewClose: document.getElementById('cart-preview-close'),
        cartPreviewTotal: document.getElementById('cart-preview-total-amount'),
        cartCount: document.getElementById('cart-count'),
        userButton: document.getElementById('user-button'),
        userDropdown: document.getElementById('user-dropdown'),
        
        // Mobile navigation
        menuButton: document.getElementById('menu-button'),
        navLinks: document.getElementById('nav-links'),
        
        // Quick view modal
        quickViewModal: document.getElementById('quick-view-modal'),
        quickViewClose: document.getElementById('quick-view-close'),
        quickViewTitle: document.getElementById('quick-view-title'),
        quickViewContent: document.getElementById('quick-view-content'),
        
        // Footer elements
        currentYearSpan: document.getElementById('current-year'),
        
        // Logo (for animation)
        logoImage: document.getElementById('logo-image')
    };
    
    // ----------------------
    // Core Functions
    // ----------------------
    
    /**
     * Initialize the application
     */
    async function init() {
        try {
            // Set current year in footer copyright
            updateFooterYear();
            
            // Initialize UI components
            initializeUI();
            
            // Set default items per page in select dropdown
            if (elements.itemsPerPageSelect) {
                elements.itemsPerPageSelect.value = state.itemsPerPage.toString();
            }
            
            // Get filter options from API (regions and varieties)
            await fetchFilterOptions();
            
            // Get initial wines data
            await fetchWines();
            
            // Get user recommendations
            fetchRecommendations();
            
            // Load cart data
            loadCart();
            
            // Set up event handlers for user interaction
            setupEventListeners();
            
            // Apply user preferences if available
            applyUserPreferences();
            
            // Add entrance animations
            animateEntrance();
        } catch (error) {
            displayError('Application initialization failed: ' + error.message);
            console.error('Initialization error:', error);
        }
    }
    
    /**
     * Initialize UI components and apply visual enhancements
     */
    function initializeUI() {
        // Initialize range sliders if they exist
        if (elements.minPriceInput && elements.maxPriceInput) {
            initializeRangeSlider(
                elements.minPriceInput, 
                elements.maxPriceInput, 
                elements.priceMinValue, 
                elements.priceMaxValue, 
                elements.priceRangeTrack,
                '€'
            );
        }
        
        if (elements.ratingInput && elements.ratingValue) {
            initializeRangeSlider(
                elements.ratingInput, 
                null, 
                null, 
                elements.ratingValue, 
                elements.ratingRangeTrack
            );
        }
        
        // Initialize tooltips
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            element.appendChild(tooltip);
            
            element.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        });
    }
    
    /**
     * Set up all event listeners for interactive elements
     */
    function setupEventListeners() {
        // Search form submission
        if (elements.searchForm) {
            elements.searchForm.addEventListener('submit', handleSearchSubmit);
        }
        
        // Filter form submission and reset
        if (elements.filterForm) {
            elements.filterForm.addEventListener('submit', handleFilterSubmit);
        }
        
        if (elements.resetFiltersBtn) {
            elements.resetFiltersBtn.addEventListener('click', handleFilterReset);
        }
        
        if (elements.clearFiltersBtn) {
            elements.clearFiltersBtn.addEventListener('click', handleFilterReset);
        }
        
        // Pagination controls
        if (elements.prevPageBtn) {
            elements.prevPageBtn.addEventListener('click', () => navigateToPage(state.currentPage - 1));
        }
        
        if (elements.nextPageBtn) {
            elements.nextPageBtn.addEventListener('click', () => navigateToPage(state.currentPage + 1));
        }
        
        // Items per page selection
        if (elements.itemsPerPageSelect) {
            elements.itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
        }
        
        // Sorting selection
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', handleSortChange);
        }
        
        // View mode controls
        if (elements.gridViewBtn) {
            elements.gridViewBtn.addEventListener('click', () => setViewMode('grid'));
        }
        
        if (elements.listViewBtn) {
            elements.listViewBtn.addEventListener('click', () => setViewMode('list'));
        }
        
        // Cart and user dropdowns
        if (elements.cartButton) {
            elements.cartButton.addEventListener('click', toggleCartPreview);
        }
        
        if (elements.cartPreviewClose) {
            elements.cartPreviewClose.addEventListener('click', closeCartPreview);
        }
        
        if (elements.userButton) {
            elements.userButton.addEventListener('click', toggleUserDropdown);
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (event) => {
            if (elements.cartPreview && elements.cartPreview.classList.contains('show') && 
                !elements.cartPreview.contains(event.target) && 
                !elements.cartButton.contains(event.target)) {
                closeCartPreview();
            }
            
            if (elements.userDropdown && elements.userDropdown.classList.contains('show') && 
                !elements.userDropdown.contains(event.target) && 
                !elements.userButton.contains(event.target)) {
                elements.userDropdown.classList.remove('show');
            }
        });
        
        // Mobile menu toggle
        if (elements.menuButton) {
            elements.menuButton.addEventListener('click', toggleMobileMenu);
        }
        
        // Quick view modal close
        if (elements.quickViewClose) {
            elements.quickViewClose.addEventListener('click', closeQuickViewModal);
            
            // Close modal when clicking outside of the content
            elements.quickViewModal.addEventListener('click', (event) => {
                if (event.target === elements.quickViewModal) {
                    closeQuickViewModal();
                }
            });
            
            // Close modal with Escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && elements.quickViewModal.classList.contains('show')) {
                    closeQuickViewModal();
                }
            });
        }
        
        // Logo animation on hover
        if (elements.logoImage) {
            elements.logoImage.addEventListener('mouseenter', () => {
                elements.logoImage.style.transform = 'rotate(5deg) scale(1.1)';
            });
            
            elements.logoImage.addEventListener('mouseleave', () => {
                elements.logoImage.style.transform = 'rotate(0) scale(1)';
            });
        }
    }
    
    // ----------------------
    // Data Fetching
    // ----------------------
    
    /**
     * Fetch wines from API with pagination and sorting
     */
    async function fetchWines() {
        try {
            setLoading(true);
            clearError();
            
            // Check if filtering is active
            const isFiltering = Object.values(state.filters).some(value => value !== '');
            
            let data;
            
            if (state.searchQuery) {
                // Search mode
                data = await wineAPI.searchWines(state.searchQuery);
                state.wines = data;
                state.totalWines = data.length;
                state.totalPages = Math.ceil(data.length / state.itemsPerPage);
            } else if (isFiltering) {
                // Filter mode
                data = await wineAPI.filterWines(state.filters);
                state.wines = data;
                state.totalWines = data.length;
                state.totalPages = Math.ceil(data.length / state.itemsPerPage);
            } else {
                // Normal pagination mode
                data = await wineAPI.getWines(state.currentPage, state.itemsPerPage);
                state.wines = data.wines || [];
                state.totalWines = data.total || 0;
                state.totalPages = data.totalPages || Math.ceil(data.total / state.itemsPerPage);
            }
            
            // Apply client-side sorting
            sortWines();
            
            // If in search or filter mode, apply pagination on client side
            if (state.searchQuery || isFiltering) {
                const startIndex = (state.currentPage - 1) * state.itemsPerPage;
                const endIndex = startIndex + state.itemsPerPage;
                state.wines = state.wines.slice(startIndex, endIndex);
            }
            
            // Render wines and update pagination UI
            renderWinesList();
            updatePaginationControls();
            updateActiveFilters();
            
            setLoading(false);
            
            // Show message if no results found
            if (state.wines.length === 0) {
                if (elements.emptyState) {
                    elements.emptyState.style.display = 'block';
                }
            }
        } catch (error) {
            displayError('Failed to load wines: ' + error.message);
            setLoading(false);
        }
    }
    
    /**
     * Fetch filter options from API (regions and varieties)
     */
    async function fetchFilterOptions() {
        try {
            // Get regions from API
            const regions = await wineAPI.getRegions();
            if (elements.regionSelect) {
                populateDropdown(elements.regionSelect, regions);
            }
            
            // Get varieties from API
            const varieties = await wineAPI.getVarieties();
            if (elements.varietySelect) {
                populateDropdown(elements.varietySelect, varieties);
            }
        } catch (error) {
            displayError('Failed to load filter options: ' + error.message);
            console.error('Filter options error:', error);
        }
    }
    
    /**
     * Fetch personalized recommendations
     */
    async function fetchRecommendations() {
        if (!elements.recommendationsContainer) return;
        
        try {
            // Show loading indicator
            if (elements.recommendationsLoading) {
                elements.recommendationsLoading.style.display = 'flex';
            }
            
            // Get user ID from localStorage or use default
            const userId = localStorage.getItem('userId') || 'guest';
            
            // Get recommendations from API
            const recommendations = await wineAPI.getRecommendations(userId);
            state.recommendations = recommendations;
            
            // Render recommendations
            renderRecommendations();
            
            // Hide loading indicator
            if (elements.recommendationsLoading) {
                elements.recommendationsLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            
            // Hide loading indicator and show fallback content
            if (elements.recommendationsLoading) {
                elements.recommendationsLoading.style.display = 'none';
            }
            
            if (elements.recommendationsContainer) {
                elements.recommendationsContainer.innerHTML = `
                    <p>Explorez notre collection pour découvrir des vins qui correspondent à vos goûts.</p>
                `;
            }
        }
    }
    
    // ----------------------
    // Event Handlers
    // ----------------------
    
    /**
     * Handle search form submission
     */
    function handleSearchSubmit(event) {
        event.preventDefault();
        if (!elements.searchInput) return;
        
        const query = elements.searchInput.value.trim();
        state.searchQuery = query;
        
        // Reset to first page when searching
        state.currentPage = 1;
        
        // Clear filters when searching
        resetFilters(false); // Don't refetch wines
        
        // Fetch search results
        fetchWines();
        
        // Update browser history for bookmarking
        updateBrowserHistory();
    }
    
    /**
     * Handle filter form submission
     */
    function handleFilterSubmit(event) {
        event.preventDefault();
        
        // Get filter values from form
        const filters = {
            region: elements.regionSelect ? elements.regionSelect.value : '',
            variety: elements.varietySelect ? elements.varietySelect.value : '',
            type: elements.typeSelect ? elements.typeSelect.value : '',
            minPrice: elements.minPriceInput ? elements.minPriceInput.value : '',
            maxPrice: elements.maxPriceInput ? elements.maxPriceInput.value : '',
            rating: elements.ratingInput ? elements.ratingInput.value : ''
        };
        
        // Clear search when filtering
        state.searchQuery = '';
        if (elements.searchInput) {
            elements.searchInput.value = '';
        }
        
        // Update state
        state.filters = filters;
        
        // Reset to first page when filtering
        state.currentPage = 1;
        
        // Apply filters
        fetchWines();
        
        // Save user preferences
        saveUserPreferences();
        
        // Update browser history for bookmarking
        updateBrowserHistory();
    }
    
    /**
     * Handle filter reset button click
     */
    function handleFilterReset() {
        resetFilters(true); // Refetch wines after reset
    }
    
    /**
     * Handle changing the number of items per page
     */
    function handleItemsPerPageChange() {
        if (!elements.itemsPerPageSelect) return;
        
        // Update state with new items per page value
        state.itemsPerPage = parseInt(elements.itemsPerPageSelect.value);
        
        // Reset to first page and refetch wines
        state.currentPage = 1;
        fetchWines();
        
        // Save user preferences
        saveUserPreferences();
    }
    
    /**
     * Handle changing sort order
     */
    function handleSortChange() {
        if (!elements.sortSelect) return;
        
        // Update state with new sort value
        state.sortBy = elements.sortSelect.value;
        
        // Resort and render
        sortWines();
        renderWinesList();
        
        // Save user preferences
        saveUserPreferences();
    }
    
    /**
     * Set view mode (grid or list)
     */
    function setViewMode(mode) {
        if (!elements.gridViewBtn || !elements.listViewBtn || !elements.winesGrid || !elements.winesList) return;
        
        state.viewMode = mode;
        
        // Update view buttons
        elements.gridViewBtn.classList.toggle('active', mode === 'grid');
        elements.listViewBtn.classList.toggle('active', mode === 'list');
        
        // Toggle view containers
        elements.winesGrid.style.display = mode === 'grid' ? 'grid' : 'none';
        elements.winesList.style.display = mode === 'list' ? 'flex' : 'none';
        
        // Save user preferences
        saveUserPreferences();
    }
    
    /**
     * Toggle cart preview
     */
    function toggleCartPreview(event) {
        if (!elements.cartPreview) return;
        
        event.stopPropagation();
        elements.cartPreview.classList.toggle('show');
        
        // Close user dropdown if open
        if (elements.userDropdown && elements.userDropdown.classList.contains('show')) {
            elements.userDropdown.classList.remove('show');
        }
    }
    
    /**
     * Close cart preview
     */
    function closeCartPreview() {
        if (!elements.cartPreview) return;
        elements.cartPreview.classList.remove('show');
    }
    
    /**
     * Toggle user dropdown
     */
    function toggleUserDropdown(event) {
        if (!elements.userDropdown) return;
        
        event.stopPropagation();
        elements.userDropdown.classList.toggle('show');
        
        // Close cart preview if open
        if (elements.cartPreview && elements.cartPreview.classList.contains('show')) {
            closeCartPreview();
        }
    }
    
    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        if (!elements.navLinks) return;
        
        elements.navLinks.classList.toggle('show');
        
        // Add overlay
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', toggleMobileMenu);
        }
        
        overlay.classList.toggle('show');
        
        // Toggle scrolling on body
        document.body.style.overflow = elements.navLinks.classList.contains('show') ? 'hidden' : '';
    }
    
    /**
     * Open quick view modal for a wine
     */
    function openQuickViewModal(wine) {
        if (!elements.quickViewModal || !elements.quickViewTitle || !elements.quickViewContent) return;
        
        // Set wine details in modal
        elements.quickViewTitle.textContent = wine.title || 'Wine Details';
        
        elements.quickViewContent.innerHTML = `
            <div class="wine-details-image">
                <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title}">
            </div>
            
            <div class="wine-details-content">
                <div class="wine-details-header">
                    <h1>${wine.title || 'Unnamed Wine'}</h1>
                    
                    <div class="wine-details-meta">
                        <div class="wine-details-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${wine.region_1 || 'Region unknown'}</span>
                        </div>
                        <div class="wine-details-meta-item">
                            <i class="fas fa-wine-glass"></i>
                            <span>${wine.variety || 'Variety unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="wine-details-rating">
                        <div class="wine-details-points">
                            <span class="wine-details-points-value">${wine.points || '?'}</span>
                            <span class="wine-details-points-label">points</span>
                        </div>
                    </div>
                </div>
                
                <div class="wine-details-price-container">
                    <div class="wine-details-price">${wine.price ? `€${wine.price}` : 'Price unavailable'}</div>
                    <div class="wine-details-availability">
                        <span class="wine-details-in-stock">
                            <i class="fas fa-check-circle"></i> En stock
                        </span>
                    </div>
                </div>
                
                <div class="wine-details-description">
                    <p>${wine.description || 'No description available for this wine.'}</p>
                </div>
                
                <div class="wine-details-actions">
                    <div class="quantity-input">
                        <button type="button" class="quantity-btn decrease-quantity">-</button>
                        <input type="number" class="quantity-value" value="1" min="1" max="12">
                        <button type="button" class="quantity-btn increase-quantity">+</button>
                    </div>
                    
                    <button type="button" class="btn primary add-to-cart-btn" data-id="${wine.id}">
                        <i class="fas fa-shopping-cart"></i> Ajouter au panier
                    </button>
                    
                    <button type="button" class="favorite-btn" data-id="${wine.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <div class="wine-details-link">
                    <a href="wine-detail.html?id=${wine.id}" class="btn-link">
                        Voir tous les détails <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        // Show the modal
        elements.quickViewModal.classList.add('show');
        
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
        
        // Set up event listeners within the modal
        const decreaseBtn = elements.quickViewContent.querySelector('.decrease-quantity');
        const increaseBtn = elements.quickViewContent.querySelector('.increase-quantity');
        const quantityInput = elements.quickViewContent.querySelector('.quantity-value');
        const addToCartBtn = elements.quickViewContent.querySelector('.add-to-cart-btn');
        const favoriteBtn = elements.quickViewContent.querySelector('.favorite-btn');
        
        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                if (quantityInput.value < 12) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                }
            });
        }
        
        if (addToCartBtn && quantityInput) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                addToCart(wine, quantity);
                closeQuickViewModal();
                
                // Show notification
                showNotification(`${wine.title} a été ajouté à votre panier.`, 'success');
            });
        }
        
        if (favoriteBtn) {
            // Check if wine is in favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const isFavorite = favorites.some(fav => fav.id === wine.id);
            
            // Update UI based on favorite status
            if (isFavorite) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favoriteBtn.classList.add('active');
            }
            
            favoriteBtn.addEventListener('click', () => {
                toggleFavorite(wine);
                
                // Update UI based on new status
                const updatedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isNowFavorite = updatedFavorites.some(fav => fav.id === wine.id);
                
                favoriteBtn.innerHTML = isNowFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
                favoriteBtn.classList.toggle('active', isNowFavorite);
                
                // Show notification
                showNotification(
                    isNowFavorite 
                        ? `${wine.title} a été ajouté à vos favoris.` 
                        : `${wine.title} a été retiré de vos favoris.`,
                    'info'
                );
            });
        }
    }
    
    /**
     * Close quick view modal
     */
    function closeQuickViewModal() {
        if (!elements.quickViewModal) return;
        
        elements.quickViewModal.classList.remove('show');
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }
    
    /**
     * Handle removing a specific filter
     */
    function removeFilter(filterType, value) {
        // Reset the corresponding filter
        state.filters[filterType] = '';
        
        // Reset the form element if it exists
        switch (filterType) {
            case 'region':
                if (elements.regionSelect) elements.regionSelect.value = '';
                break;
            case 'variety':
                if (elements.varietySelect) elements.varietySelect.value = '';
                break;
            case 'type':
                if (elements.typeSelect) elements.typeSelect.value = '';
                break;
            case 'minPrice':
                if (elements.minPriceInput) elements.minPriceInput.value = 0;
                break;
            case 'maxPrice':
                if (elements.maxPriceInput) elements.maxPriceInput.value = 500;
                break;
            case 'rating':
                if (elements.ratingInput) elements.ratingInput.value = 0;
                break;
        }
        
        // Update range sliders if needed
        if (filterType === 'minPrice' || filterType === 'maxPrice') {
            updateRangeSliderTrack(
                elements.minPriceInput, 
                elements.maxPriceInput, 
                elements.priceRangeTrack
            );
            
            // Update displayed values
            if (elements.priceMinValue) elements.priceMinValue.textContent = `€${elements.minPriceInput.value}`;
            if (elements.priceMaxValue) elements.priceMaxValue.textContent = `€${elements.maxPriceInput.value}`;
        }
        
        if (filterType === 'rating') {
            updateRangeSliderTrack(
                elements.ratingInput, 
                null, 
                elements.ratingRangeTrack
            );
            
            // Update displayed value
            if (elements.ratingValue) elements.ratingValue.textContent = elements.ratingInput.value;
        }
        
        // Refetch wines with updated filters
        fetchWines();
        
        // Update active filters display
        updateActiveFilters();
        
        // Save user preferences
        saveUserPreferences();
    }
    
    /**
     * Navigate to a specific page
     */
    function navigateToPage(pageNumber) {
        // Validate page number
        if (pageNumber < 1 || pageNumber > state.totalPages || pageNumber === state.currentPage) {
            return; // Invalid page number or same page
        }
        
        // Update current page and fetch wines
        state.currentPage = pageNumber;
        fetchWines();
        
        // Scroll to top of the wines panel
        if (elements.winesGrid) {
            elements.winesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // ----------------------
    // UI Rendering Functions
    // ----------------------
    
    /**
     * Render the wines list based on the current view mode
     */
    function renderWinesList() {
        const wines = state.wines;
        
        // Update total wines count in UI
        if (elements.winesCount) {
            elements.winesCount.textContent = `(${state.totalWines} vins)`;
        }
        
        // Show empty state if no wines
        if (wines.length === 0) {
            if (elements.emptyState) elements.emptyState.style.display = 'block';
            if (elements.winesGrid) elements.winesGrid.style.display = 'none';
            if (elements.winesList) elements.winesList.style.display = 'none';
            return;
        }
        
        // Hide empty state and show appropriate view
        if (elements.emptyState) elements.emptyState.style.display = 'none';
        
        // Render grid view
        if (elements.winesGrid) {
            elements.winesGrid.innerHTML = '';
            elements.winesGrid.style.display = state.viewMode === 'grid' ? 'grid' : 'none';
            
            if (state.viewMode === 'grid') {
                wines.forEach(wine => {
                    const wineCard = createWineCard(wine);
                    elements.winesGrid.appendChild(wineCard);
                });
            }
        }
        
        // Render list view
        if (elements.winesList) {
            elements.winesList.innerHTML = '';
            elements.winesList.style.display = state.viewMode === 'list' ? 'flex' : 'none';
            
            if (state.viewMode === 'list') {
                wines.forEach(wine => {
                    const wineListItem = createWineListItem(wine);
                    elements.winesList.appendChild(wineListItem);
                });
            }
        }
    }
    
    /**
     * Create a wine card DOM element for grid view
     */
    function createWineCard(wine) {
        // Create card container
        const card = document.createElement('div');
        card.className = 'wine-card';
        
        // Check if wine is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.some(fav => fav.id === wine.id);
        
        // Format badges (organic, special offers, etc.)
        let badgeHtml = '';
        if (wine.organic) {
            badgeHtml += `<span class="wine-badge organic">Bio</span>`;
        }
        if (wine.special_offer) {
            badgeHtml += `<span class="wine-badge offer">Promo</span>`;
        }
        
        // Build card HTML
        card.innerHTML = `
            <div class="wine-image">
                <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title || 'Wine'}">
                ${badgeHtml}
            </div>
            <div class="wine-content">
                <div class="wine-meta">
                    <span class="wine-region">${wine.region_1 || 'Region unknown'}</span>
                </div>
                <h3 class="wine-title">${wine.title || 'Unnamed Wine'}</h3>
                <div class="wine-points">
                    <span class="wine-points-value">${wine.points || '?'}</span>
                    <span class="wine-points-label">pts</span>
                </div>
                <div class="wine-tags">
                    ${wine.variety ? `<span class="wine-tag">${wine.variety}</span>` : ''}
                    ${wine.type ? `<span class="wine-tag">${wine.type}</span>` : ''}
                </div>
                <p class="wine-description">${wine.description || 'No description available.'}</p>
                <div class="wine-footer">
                    <div class="wine-price">${wine.price ? `€${wine.price}` : 'Price unavailable'}</div>
                    <div class="wine-actions">
                        <button class="btn primary add-btn" data-id="${wine.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${wine.id}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Set up event listeners
        
        // Quick view on title click
        const titleElement = card.querySelector('.wine-title');
        if (titleElement) {
            titleElement.addEventListener('click', () => openQuickViewModal(wine));
            titleElement.style.cursor = 'pointer';
        }
        
        // Quick view on image click
        const imageElement = card.querySelector('.wine-image');
        if (imageElement) {
            imageElement.addEventListener('click', () => openQuickViewModal(wine));
            imageElement.style.cursor = 'pointer';
        }
        
        // Add to cart button
        const addButton = card.querySelector('.add-btn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                addToCart(wine, 1);
                
                // Show notification
                showNotification(`${wine.title} a été ajouté à votre panier.`, 'success');
            });
        }
        
        // Favorite button
        const favoriteButton = card.querySelector('.favorite-btn');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', () => {
                toggleFavorite(wine);
                
                // Update UI based on new status
                const updatedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isNowFavorite = updatedFavorites.some(fav => fav.id === wine.id);
                
                favoriteButton.innerHTML = isNowFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
                favoriteButton.classList.toggle('active', isNowFavorite);
                
                // Show notification
                showNotification(
                    isNowFavorite 
                        ? `${wine.title} a été ajouté à vos favoris.` 
                        : `${wine.title} a été retiré de vos favoris.`,
                    'info'
                );
            });
        }
        
        return card;
    }
    
    /**
     * Create a wine list item DOM element for list view
     */
    function createWineListItem(wine) {
        // Create list item container
        const listItem = document.createElement('div');
        listItem.className = 'wine-list-item';
        
        // Check if wine is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorite = favorites.some(fav => fav.id === wine.id);
        
        // Build list item HTML
        listItem.innerHTML = `
            <div class="wine-list-image">
                <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title || 'Wine'}">
            </div>
            <div class="wine-list-content">
                <div class="wine-list-header">
                    <h3 class="wine-list-title">${wine.title || 'Unnamed Wine'}</h3>
                    <div class="wine-list-points">
                        <span class="wine-list-points-value">${wine.points || '?'}</span>
                        <span class="wine-list-points-label">pts</span>
                    </div>
                </div>
                
                <div class="wine-list-meta">
                    <span class="wine-list-meta-item">${wine.region_1 || 'Region unknown'}</span>
                    <span class="wine-list-meta-item">${wine.variety || 'Variety unknown'}</span>
                    <span class="wine-list-meta-item">${wine.type || 'Type unknown'}</span>
                </div>
                
                <div class="wine-list-tags">
                    ${wine.organic ? `<span class="badge badge-success">Bio</span>` : ''}
                    ${wine.special_offer ? `<span class="badge badge-warning">Promo</span>` : ''}
                </div>
                
                <p class="wine-list-description">${wine.description || 'No description available.'}</p>
                
                <div class="wine-list-footer">
                    <div class="wine-list-price">${wine.price ? `€${wine.price}` : 'Price unavailable'}</div>
                    <div class="wine-list-actions">
                        <button class="btn primary add-btn" data-id="${wine.id}">
                            <i class="fas fa-shopping-cart"></i> Ajouter
                        </button>
                        <button class="btn secondary quick-view-btn" data-id="${wine.id}">
                            Aperçu rapide
                        </button>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${wine.id}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Set up event listeners
        
        // Quick view on title click
        const titleElement = listItem.querySelector('.wine-list-title');
        if (titleElement) {
            titleElement.addEventListener('click', () => openQuickViewModal(wine));
            titleElement.style.cursor = 'pointer';
        }
        
        // Add to cart button
        const addButton = listItem.querySelector('.add-btn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                addToCart(wine, 1);
                
                // Show notification
                showNotification(`${wine.title} a été ajouté à votre panier.`, 'success');
            });
        }
        
        // Quick view button
        const quickViewButton = listItem.querySelector('.quick-view-btn');
        if (quickViewButton) {
            quickViewButton.addEventListener('click', () => openQuickViewModal(wine));
        }
        
        // Favorite button
        const favoriteButton = listItem.querySelector('.favorite-btn');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', () => {
                toggleFavorite(wine);
                
                // Update UI based on new status
                const updatedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isNowFavorite = updatedFavorites.some(fav => fav.id === wine.id);
                
                favoriteButton.innerHTML = isNowFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
                favoriteButton.classList.toggle('active', isNowFavorite);
                
                // Show notification
                showNotification(
                    isNowFavorite 
                        ? `${wine.title} a été ajouté à vos favoris.` 
                        : `${wine.title} a été retiré de vos favoris.`,
                    'info'
                );
            });
        }
        
        return listItem;
    }
    
    /**
     * Render recommendations
     */
    function renderRecommendations() {
        if (!elements.recommendationsContainer || !state.recommendations || state.recommendations.length === 0) {
            return;
        }
        
        // Create recommendations HTML
        let html = '';
        
        state.recommendations.forEach(wine => {
            html += `
                <div class="recommendation-item" data-id="${wine.id}">
                    <div class="recommendation-image">
                        <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title || 'Wine'}">
                    </div>
                    <div class="recommendation-content">
                        <h4 class="recommendation-title">${wine.title || 'Unnamed Wine'}</h4>
                        <div class="recommendation-meta">
                            <span class="recommendation-points">${wine.points || '?'} pts</span>
                            <span class="recommendation-price">${wine.price ? `€${wine.price}` : 'Price unavailable'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Update container
        elements.recommendationsContainer.innerHTML = html;
        
        // Add event listeners
        const recommendationItems = elements.recommendationsContainer.querySelectorAll('.recommendation-item');
        recommendationItems.forEach(item => {
            item.addEventListener('click', () => {
                const wineId = item.getAttribute('data-id');
                const wine = state.recommendations.find(w => w.id == wineId);
                
                if (wine) {
                    openQuickViewModal(wine);
                }
            });
        });
    }
    
    /**
     * Update pagination controls
     */
    function updatePaginationControls() {
        if (!elements.paginationInfo || !elements.prevPageBtn || !elements.nextPageBtn || !elements.pageNumbers) {
            return;
        }
        
        // Update pagination info text
        elements.paginationInfo.textContent = `Affichage de ${state.wines.length} sur ${state.totalWines} vins (Page ${state.currentPage} sur ${state.totalPages})`;
        
        // Enable/disable previous and next buttons
        elements.prevPageBtn.disabled = state.currentPage === 1;
        elements.nextPageBtn.disabled = state.currentPage === state.totalPages;
        
        // Clear existing page number buttons
        elements.pageNumbers.innerHTML = '';
        
        // Generate page number buttons
        generatePageNumbers();
    }
    
    /**
     * Generate page number buttons
     */
    function generatePageNumbers() {
        if (!elements.pageNumbers) return;
        
        const maxVisiblePages = 5;
        let startPage = 1;
        let endPage = state.totalPages;
        
        // Calculate visible page range
        if (state.totalPages > maxVisiblePages) {
            if (state.currentPage <= 3) {
                // When near the beginning
                endPage = maxVisiblePages;
            } else if (state.currentPage >= state.totalPages - 2) {
                // When near the end
                startPage = state.totalPages - maxVisiblePages + 1;
            } else {
                // When in the middle
                startPage = state.currentPage - 2;
                endPage = state.currentPage + 2;
            }
        }
        
        // Create and append page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === state.currentPage ? 'active-page' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => navigateToPage(i));
            elements.pageNumbers.appendChild(pageBtn);
        }
    }
    
    /**
     * Update the display of active filters
     */
    function updateActiveFilters() {
        if (!elements.activeFiltersContainer) return;
        
        // Clear container
        elements.activeFiltersContainer.innerHTML = '';
        
        // Build array of active filters
        const activeFilters = [];
        
        if (state.filters.region) {
            activeFilters.push({
                type: 'region',
                label: 'Région',
                value: state.filters.region
            });
        }
        
        if (state.filters.variety) {
            activeFilters.push({
                type: 'variety',
                label: 'Cépage',
                value: state.filters.variety
            });
        }
        
        if (state.filters.type) {
            activeFilters.push({
                type: 'type',
                label: 'Type',
                value: state.filters.type
            });
        }
        
        if (state.filters.minPrice) {
            activeFilters.push({
                type: 'minPrice',
                label: 'Prix min',
                value: `€${state.filters.minPrice}`
            });
        }
        
        if (state.filters.maxPrice && state.filters.maxPrice < 500) {
            activeFilters.push({
                type: 'maxPrice',
                label: 'Prix max',
                value: `€${state.filters.maxPrice}`
            });
        }
        
        if (state.filters.rating) {
            activeFilters.push({
                type: 'rating',
                label: 'Note min',
                value: `${state.filters.rating} pts`
            });
        }
        
        // Store active filters in state
        state.activeFilters = activeFilters;
        
        // Create filter tags
        activeFilters.forEach(filter => {
            const filterElement = document.createElement('div');
            filterElement.className = 'active-filter';
            filterElement.innerHTML = `
                <span class="active-filter-label">${filter.label}:</span>
                <span class="active-filter-value">${filter.value}</span>
                <button class="active-filter-remove" data-type="${filter.type}" data-value="${filter.value}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add event listener for removal
            const removeButton = filterElement.querySelector('.active-filter-remove');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeFilter(filter.type, filter.value);
                });
            }
            
            elements.activeFiltersContainer.appendChild(filterElement);
        });
        
        // Show/hide container based on whether there are active filters
        elements.activeFiltersContainer.style.display = activeFilters.length > 0 ? 'flex' : 'none';
    }
    
    // ----------------------
    // Cart Functions
    // ----------------------
    
    /**
     * Load cart data from localStorage
     */
    function loadCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            state.cart = cart;
            
            // Update cart count
            updateCartCount();
            
            // Update cart preview
            updateCartPreview();
        } catch (error) {
            console.error('Error loading cart:', error);
            state.cart = [];
        }
    }
    
    /**
     * Add a wine to the cart
     */
    function addToCart(wine, quantity) {
        // Find if wine is already in cart
        const existingItemIndex = state.cart.findIndex(item => item.wine.id === wine.id);
        
        if (existingItemIndex !== -1) {
            // Increase quantity if already in cart
            state.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if not in cart
            state.cart.push({
                wine: {
                    id: wine.id,
                    title: wine.title,
                    price: wine.price,
                    image: wine.image || 'assets/images/wine-placeholder.jpg',
                    region_1: wine.region_1,
                    variety: wine.variety
                },
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.cart));
        
        // Update UI
        updateCartCount();
        updateCartPreview();
        
        // Show cart preview
        if (elements.cartPreview) {
            elements.cartPreview.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (elements.cartPreview.classList.contains('show')) {
                    closeCartPreview();
                }
            }, 5000);
        }
    }
    
    /**
     * Update cart count in UI
     */
    function updateCartCount() {
        if (!elements.cartCount) return;
        
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        
        // Hide badge if cart is empty
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    /**
     * Update cart preview in UI
     */
    function updateCartPreview() {
        if (!elements.cartPreviewItems || !elements.cartPreviewTotal) return;
        
        // Clear container
        elements.cartPreviewItems.innerHTML = '';
        
        // Calculate total
        let total = 0;
        
        // Generate items HTML
        state.cart.forEach(item => {
            const itemTotal = item.quantity * (item.wine.price || 0);
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-preview-item';
            itemElement.innerHTML = `
                <div class="cart-preview-item-img">
                    <img src="${item.wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${item.wine.title}">
                </div>
                <div class="cart-preview-item-details">
                    <div class="cart-preview-item-title">${item.wine.title}</div>
                    <div class="cart-preview-item-price">€${item.wine.price}</div>
                    <div class="cart-preview-item-quantity">Qté: ${item.quantity}</div>
                </div>
                <button class="cart-preview-item-remove" data-id="${item.wine.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add event listener for removal
            const removeButton = itemElement.querySelector('.cart-preview-item-remove');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeFromCart(item.wine.id);
                });
            }
            
            elements.cartPreviewItems.appendChild(itemElement);
        });
        
        // If cart is empty, show message
        if (state.cart.length === 0) {
            elements.cartPreviewItems.innerHTML = `
                <div class="cart-empty-message">
                    Votre panier est vide
                </div>
            `;
        }
        
        // Update total
        elements.cartPreviewTotal.textContent = `€${total.toFixed(2)}`;
    }
    
    /**
     * Remove an item from the cart
     */
    function removeFromCart(wineId) {
        // Find the item
        const index = state.cart.findIndex(item => item.wine.id === wineId);
        
        if (index !== -1) {
            // Remove the item
            state.cart.splice(index, 1);
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(state.cart));
            
            // Update UI
            updateCartCount();
            updateCartPreview();
            
            // Show notification
            showNotification('Produit retiré du panier.', 'info');
        }
    }
    
    // ----------------------
    // Favorites Functions
    // ----------------------
    
    /**
     * Toggle a wine's favorite status
     */
    function toggleFavorite(wine) {
        // Get current favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Check if wine is already in favorites
        const index = favorites.findIndex(fav => fav.id === wine.id);
        
        if (index !== -1) {
            // Remove from favorites
            favorites.splice(index, 1);
        } else {
            // Add to favorites
            favorites.push({
                id: wine.id,
                title: wine.title,
                price: wine.price,
                points: wine.points,
                variety: wine.variety,
                region_1: wine.region_1,
                image: wine.image || 'assets/images/wine-placeholder.jpg',
                addedAt: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // ----------------------
    // Helper Functions
    // ----------------------
    
    /**
     * Sort wines based on current sort criteria
     */
    function sortWines() {
        if (!state.wines || state.wines.length === 0) return;
        
        const sortBy = state.sortBy;
        
        switch (sortBy) {
            case 'rating-desc':
                state.wines.sort((a, b) => (b.points || 0) - (a.points || 0));
                break;
            case 'rating-asc':
                state.wines.sort((a, b) => (a.points || 0) - (b.points || 0));
                break;
            case 'price-asc':
                state.wines.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                state.wines.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name-asc':
                state.wines.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'name-desc':
                state.wines.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                break;
        }
    }
    
    /**
     * Reset all filters
     */
    function resetFilters(shouldFetchWines = true) {
        // Reset filter state
        state.filters = {
            region: '',
            variety: '',
            type: '',
            minPrice: '',
            maxPrice: '',
            rating: ''
        };
        
        // Reset form inputs
        if (elements.regionSelect) elements.regionSelect.value = '';
        if (elements.varietySelect) elements.varietySelect.value = '';
        if (elements.typeSelect) elements.typeSelect.value = '';
        if (elements.minPriceInput) elements.minPriceInput.value = 0;
        if (elements.maxPriceInput) elements.maxPriceInput.value = 500;
        if (elements.ratingInput) elements.ratingInput.value = 0;
        
        // Update range sliders
        if (elements.minPriceInput && elements.maxPriceInput && elements.priceRangeTrack) {
            updateRangeSliderTrack(
                elements.minPriceInput, 
                elements.maxPriceInput, 
                elements.priceRangeTrack
            );
            
            // Update displayed values
            if (elements.priceMinValue) elements.priceMinValue.textContent = `€${elements.minPriceInput.value}`;
            if (elements.priceMaxValue) elements.priceMaxValue.textContent = `€${elements.maxPriceInput.value}`;
        }
        
        if (elements.ratingInput && elements.ratingRangeTrack) {
            updateRangeSliderTrack(
                elements.ratingInput, 
                null, 
                elements.ratingRangeTrack
            );
            
            // Update displayed value
            if (elements.ratingValue) elements.ratingValue.textContent = elements.ratingInput.value;
        }
        
        // Reset to first page
        state.currentPage = 1;
        
        // Update active filters display
        updateActiveFilters();
        
        // Fetch wines if requested
        if (shouldFetchWines) {
            fetchWines();
        }
        
        // Save user preferences
        saveUserPreferences();
    }
    
    /**
     * Populate a dropdown with options
     */
    function populateDropdown(selectElement, options) {
        if (!selectElement) return;
        
        // Keep the first option (usually "All" option)
        const defaultOption = selectElement.options[0];
        selectElement.innerHTML = '';
        selectElement.appendChild(defaultOption);
        
        // Add all options from the array
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }
    
    /**
     * Initialize a range slider
     */
    function initializeRangeSlider(minInput, maxInput, minValueEl, maxValueEl, trackEl, prefix = '') {
        if (minInput && maxInput) {
            // Update track on input change
            minInput.addEventListener('input', () => {
                // Ensure min value doesn't exceed max value
                if (parseInt(minInput.value) > parseInt(maxInput.value)) {
                    minInput.value = maxInput.value;
                }
                
                updateRangeSliderTrack(minInput, maxInput, trackEl);
                
                // Update displayed values
                if (minValueEl) {
                    minValueEl.textContent = `${prefix}${minInput.value}`;
                }
            });
            
            maxInput.addEventListener('input', () => {
                // Ensure max value doesn't go below min value
                if (parseInt(maxInput.value) < parseInt(minInput.value)) {
                    maxInput.value = minInput.value;
                }
                
                updateRangeSliderTrack(minInput, maxInput, trackEl);
                
                // Update displayed values
                if (maxValueEl) {
                    maxValueEl.textContent = `${prefix}${maxInput.value}`;
                }
            });
            
            // Initialize track position
            updateRangeSliderTrack(minInput, maxInput, trackEl);
        } else if (minInput) {
            // Single slider
            minInput.addEventListener('input', () => {
                updateRangeSliderTrack(minInput, null, trackEl);
                
                // Update displayed value
                if (maxValueEl) {
                    maxValueEl.textContent = `${prefix}${minInput.value}`;
                }
            });
            
            // Initialize track position
            updateRangeSliderTrack(minInput, null, trackEl);
        }
    }
    
    /**
     * Update range slider track position
     */
    function updateRangeSliderTrack(minInput, maxInput, trackEl) {
        if (!trackEl) return;
        
        if (minInput && maxInput) {
            // Double range slider
            const min = parseInt(minInput.min);
            const max = parseInt(maxInput.max);
            const minVal = parseInt(minInput.value);
            const maxVal = parseInt(maxInput.value);
            
            const leftPercent = ((minVal - min) / (max - min)) * 100;
            const rightPercent = ((maxVal - min) / (max - min)) * 100;
            
            trackEl.style.left = `${leftPercent}%`;
            trackEl.style.width = `${rightPercent - leftPercent}%`;
        } else if (minInput) {
            // Single range slider
            const min = parseInt(minInput.min);
            const max = parseInt(minInput.max);
            const val = parseInt(minInput.value);
            
            const percent = ((val - min) / (max - min)) * 100;
            
            trackEl.style.width = `${percent}%`;
        }
    }
    
    /**
     * Show/hide loading indicator
     */
    function setLoading(isLoading) {
        state.isLoading = isLoading;
        
        if (elements.loadingIndicator) {
            elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        }
        
        // Only hide wines grid if loading and we have no wines to display
        if (elements.winesGrid) {
            if (isLoading && state.wines.length === 0) {
                elements.winesGrid.style.display = 'none';
            } else if (!isLoading && state.wines.length > 0) {
                elements.winesGrid.style.display = state.viewMode === 'grid' ? 'grid' : 'none';
            }
        }
        
        if (elements.winesList) {
            if (isLoading && state.wines.length === 0) {
                elements.winesList.style.display = 'none';
            } else if (!isLoading && state.wines.length > 0) {
                elements.winesList.style.display = state.viewMode === 'list' ? 'flex' : 'none';
            }
        }
    }
    
    /**
     * Display error message
     */
    function displayError(message) {
        if (!elements.errorContainer) return;
        
        elements.errorContainer.textContent = message;
        elements.errorContainer.style.display = 'block';
    }
    
    /**
     * Clear error message
     */
    function clearError() {
        if (!elements.errorContainer) return;
        
        elements.errorContainer.style.display = 'none';
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add animation class after a small delay (for transition to work)
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300); // Wait for transition to complete
            });
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300); // Wait for transition to complete
            }
        }, 5000);
    }
    
    /**
     * Update footer year to current year
     */
    function updateFooterYear() {
        if (!elements.currentYearSpan) return;
        elements.currentYearSpan.textContent = new Date().getFullYear();
    }
    
    /**
     * Load user preferences from localStorage
     */
    function loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return preferences;
        } catch (error) {
            console.error('Error loading user preferences:', error);
            return {};
        }
    }
    
    /**
     * Save user preferences to localStorage
     */
    function saveUserPreferences() {
        try {
            const preferences = {
                itemsPerPage: state.itemsPerPage,
                sortBy: state.sortBy,
                viewMode: state.viewMode,
                filters: state.filters
            };
            
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            state.userPreferences = preferences;
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }
    
    /**
     * Apply user preferences from localStorage
     */
    function applyUserPreferences() {
        const prefs = state.userPreferences;
        
        // Apply items per page
        if (prefs.itemsPerPage && elements.itemsPerPageSelect) {
            state.itemsPerPage = prefs.itemsPerPage;
            elements.itemsPerPageSelect.value = prefs.itemsPerPage.toString();
        }
        
        // Apply sort order
        if (prefs.sortBy && elements.sortSelect) {
            state.sortBy = prefs.sortBy;
            elements.sortSelect.value = prefs.sortBy;
        }
        
        // Apply view mode
        if (prefs.viewMode) {
            setViewMode(prefs.viewMode);
        }
        
        // Apply filters
        if (prefs.filters) {
            // Only apply if the filters form exists
            if (elements.filterForm) {
                // Apply each filter if form element exists
                if (prefs.filters.region && elements.regionSelect) {
                    elements.regionSelect.value = prefs.filters.region;
                    state.filters.region = prefs.filters.region;
                }
                
                if (prefs.filters.variety && elements.varietySelect) {
                    elements.varietySelect.value = prefs.filters.variety;
                    state.filters.variety = prefs.filters.variety;
                }
                
                if (prefs.filters.type && elements.typeSelect) {
                    elements.typeSelect.value = prefs.filters.type;
                    state.filters.type = prefs.filters.type;
                }
                
                if (prefs.filters.minPrice && elements.minPriceInput) {
                    elements.minPriceInput.value = prefs.filters.minPrice;
                    state.filters.minPrice = prefs.filters.minPrice;
                    if (elements.priceMinValue) {
                        elements.priceMinValue.textContent = `€${prefs.filters.minPrice}`;
                    }
                }
                
                if (prefs.filters.maxPrice && elements.maxPriceInput) {
                    elements.maxPriceInput.value = prefs.filters.maxPrice;
                    state.filters.maxPrice = prefs.filters.maxPrice;
                    if (elements.priceMaxValue) {
                        elements.priceMaxValue.textContent = `€${prefs.filters.maxPrice}`;
                    }
                }
                
                if (prefs.filters.rating && elements.ratingInput) {
                    elements.ratingInput.value = prefs.filters.rating;
                    state.filters.rating = prefs.filters.rating;
                    if (elements.ratingValue) {
                        elements.ratingValue.textContent = prefs.filters.rating;
                    }
                }
                
                // Update range sliders
                if (elements.minPriceInput && elements.maxPriceInput && elements.priceRangeTrack) {
                    updateRangeSliderTrack(
                        elements.minPriceInput, 
                        elements.maxPriceInput, 
                        elements.priceRangeTrack
                    );
                }
                
                if (elements.ratingInput && elements.ratingRangeTrack) {
                    updateRangeSliderTrack(
                        elements.ratingInput, 
                        null, 
                        elements.ratingRangeTrack
                    );
                }
                
                // Update active filters display
                updateActiveFilters();
            }
        }
    }
    
    /**
     * Update browser history to enable bookmarking
     */
    function updateBrowserHistory() {
        // Create URL with query parameters
        const url = new URL(window.location.href);
        
        // Clear existing parameters
        url.search = '';
        
        // Add search query if present
        if (state.searchQuery) {
            url.searchParams.set('q', state.searchQuery);
        }
        
        // Add current page if not first page
        if (state.currentPage > 1) {
            url.searchParams.set('page', state.currentPage);
        }
        
        // Add filters if present
        Object.entries(state.filters).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            }
        });
        
        // Add view mode if not default
        if (state.viewMode !== 'grid') {
            url.searchParams.set('view', state.viewMode);
        }
        
        // Add sort if not default
        if (state.sortBy !== 'rating-desc') {
            url.searchParams.set('sort', state.sortBy);
        }
        
        // Update browser URL without reloading the page
        window.history.replaceState({}, '', url);
    }
    
    /**
     * Add entrance animations
     */
    function animateEntrance() {
        // Add fading animations to featured sections
        const fadeElements = document.querySelectorAll('.features-grid, .hero-content');
        fadeElements.forEach(el => {
            el.classList.add('fade-in');
        });
        
        // Add slide-in animations to wine cards with staggered delay
        if (elements.winesGrid) {
            const cards = elements.winesGrid.querySelectorAll('.wine-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                
                // Stagger the animations
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 + (index * 50)); // 50ms delay between each card
            });
        }
    }
    
    // Initialize the application
    init();
});