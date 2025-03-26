/**
 * Enhanced Wine Cards Component
 * 
 * This script handles the display and interaction with wine cards throughout
 * the La Cité Du Vin platform, featuring:
 * - Dynamic loading of wine data
 * - Advanced filtering capabilities
 * - Visually appealing wine card presentation
 * - Shopping cart integration
 */

// DOM Elements
const wineListContainer = document.getElementById('wine-list');
const featuredWinesContainer = document.getElementById('featured-wines-container');
const loadMoreButton = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const regionSelect = document.getElementById('region');
const varietySelect = document.getElementById('variety');
const countrySelect = document.getElementById('country');
const typeSelect = document.getElementById('type');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const ratingFilter = document.getElementById('rating-filter');
const sortOption = document.getElementById('sort-option');
const applyFiltersButton = document.getElementById('apply-filters');
const cartIcon = document.getElementById('cart-icon');
const cartCountElement = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const closeCartButton = document.getElementById('close-cart');
const checkoutButton = document.getElementById('checkout-btn');
const modalOverlay = document.getElementById('modal-overlay');
const resultCountElement = document.getElementById('result-count');
const showingCountElement = document.getElementById('showing-count');
const totalCountElement = document.getElementById('total-count');
const searchIcon = document.getElementById('search-icon');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');

// Variables
let allWines = [];
let displayedWines = [];
let filteredWines = [];
let searchTimeout;
let page = 1;
const pageSize = 9;
let isLoading = false;
let filters = {
    search: '',
    region: '',
    variety: '',
    minPrice: null,
    maxPrice: null,
    type: '',
    rating: 0,
    country: ''
};
let cart = [];
let sortBy = 'rating'; // Default sort

// Initialize the application
window.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load cart from localStorage
        loadCart();
        
        // Update cart count
        updateCartCount();
        
        // Load wine data
        await loadWineData();
        
        // Populate filter options
        populateFilters();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize URL parameters if present
        initializeFromUrl();
        
        // Display wines
        if (wineListContainer) {
            displayWines(true);
        }
        
        // Display featured wines if container exists
        if (featuredWinesContainer) {
            displayFeaturedWines();
        }
        
    } catch (error) {
        console.error('Error initializing wine display:', error);
        showErrorMessage('Error loading wine data. Please try refreshing the page.');
    }
}

/**
 * Show error message in wine containers
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    if (wineListContainer) {
        wineListContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> ${message}
                </div>
            </div>
        `;
    }
    
    if (featuredWinesContainer) {
        featuredWinesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> ${message}
                </div>
            </div>
        `;
    }
}

/**
 * Show loading spinner
 * @param {HTMLElement} container - The container to show loading in
 */
function showLoading(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
            <p class="mt-4">Discovering exceptional wines...</p>
        </div>
    `;
}

/**
 * Initialize filters from URL parameters
 */
function initializeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for region parameter
    const regionParam = urlParams.get('region');
    if (regionParam && regionSelect) {
        // Look for matching option
        const option = Array.from(regionSelect.options).find(opt => 
            opt.text.toLowerCase() === decodeURIComponent(regionParam).toLowerCase()
        );
        
        if (option) {
            regionSelect.value = option.value;
            filters.region = option.value;
        }
    }
    
    // Check for variety parameter
    const varietyParam = urlParams.get('variety');
    if (varietyParam && varietySelect) {
        // Look for matching option
        const option = Array.from(varietySelect.options).find(opt => 
            opt.text.toLowerCase() === decodeURIComponent(varietyParam).toLowerCase()
        );
        
        if (option) {
            varietySelect.value = option.value;
            filters.variety = option.value;
        }
    }
    
    // Check for search parameter
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) {
        searchInput.value = decodeURIComponent(searchParam);
        filters.search = decodeURIComponent(searchParam);
    }
    
    // Check for type parameter
    const typeParam = urlParams.get('type');
    if (typeParam && typeSelect) {
        filters.type = decodeURIComponent(typeParam);
        typeSelect.value = filters.type;
    }
    
    // Check for country parameter
    const countryParam = urlParams.get('country');
    if (countryParam && countrySelect) {
        filters.country = decodeURIComponent(countryParam);
        countrySelect.value = filters.country;
    }
    
    // Check for rating parameter
    const ratingParam = urlParams.get('rating');
    if (ratingParam && ratingFilter) {
        filters.rating = parseInt(ratingParam);
        ratingFilter.value = filters.rating;
    }
    
    // Check for price parameters
    const minPrice = urlParams.get('minPrice');
    if (minPrice && minPriceInput) {
        minPriceInput.value = minPrice;
        filters.minPrice = parseFloat(minPrice);
    }
    
    const maxPrice = urlParams.get('maxPrice');
    if (maxPrice && maxPriceInput) {
        maxPriceInput.value = maxPrice;
        filters.maxPrice = parseFloat(maxPrice);
    }
    
    // Check for sort parameter
    const sortParam = urlParams.get('sort');
    if (sortParam && sortOption) {
        sortOption.value = sortParam;
        sortBy = sortParam;
    }
    
    // Check for checkout parameter
    const checkoutParam = urlParams.get('checkout');
    if (checkoutParam === 'true') {
        setTimeout(() => {
            openCart();
            
            // If checkout modal exists, open it
            const checkoutModal = document.getElementById('checkout-modal');
            if (checkoutModal && checkoutButton) {
                setTimeout(() => {
                    checkoutButton.click();
                }, 500);
            }
        }, 500);
    }
}

/**
 * Load wine data
 * @returns {Promise<Array>} - The loaded wine data
 */
async function loadWineData() {
    try {
        isLoading = true;
        
        // Show loading indicator in wine containers
        if (wineListContainer) {
            showLoading(wineListContainer);
        }
        
        if (featuredWinesContainer) {
            showLoading(featuredWinesContainer);
        }
        
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error(`Failed to load wine data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // If the response is not an array, convert it
        allWines = Array.isArray(data) ? data : [data];
        
        // Ensure all wines have unique IDs for cart functionality
        allWines = allWines.map(wine => ({
            ...wine,
            id: wine.id || generateWineId(wine)
        }));
        
        console.log(`Loaded ${allWines.length} wines`);
        
        // Update total count
        if (totalCountElement) {
            totalCountElement.textContent = allWines.length;
        }
        
        if (allWines.length === 0) {
            throw new Error('No wine data found');
        }
        
        isLoading = false;
        return allWines;
    } catch (error) {
        console.error('Error loading wine data:', error);
        isLoading = false;
        throw error;
    }
}

/**
 * Generate a unique ID for a wine
 * @param {Object} wine - The wine object
 * @returns {string} - The generated ID
 */
function generateWineId(wine) {
    // Create a hash based on wine properties
    return `${wine.title || ''}-${wine.winery || ''}-${wine.vintage || ''}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

/**
 * Populate filter dropdown options
 */
function populateFilters() {
    if (!regionSelect && !varietySelect && !countrySelect) return;
    
    try {
        // Get unique regions
        const regions = [...new Set(allWines
            .map(wine => wine.region_1 || wine.region)
            .filter(Boolean))].sort();
        
        // Get unique varieties
        const varieties = [...new Set(allWines
            .map(wine => wine.variété || wine.varietal)
            .filter(Boolean))].sort();
        
        // Get unique countries
        const countries = [...new Set(allWines
            .map(wine => wine.country)
            .filter(Boolean))].sort();
        
        // Add region options
        if (regionSelect) {
            // Keep first option
            const firstOption = regionSelect.options[0];
            regionSelect.innerHTML = '';
            regionSelect.appendChild(firstOption);
            
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        }
        
        // Add variety options
        if (varietySelect) {
            // Keep first option
            const firstOption = varietySelect.options[0];
            varietySelect.innerHTML = '';
            varietySelect.appendChild(firstOption);
            
            varieties.forEach(variety => {
                const option = document.createElement('option');
                option.value = variety;
                option.textContent = variety;
                varietySelect.appendChild(option);
            });
        }
        
        // Add country options
        if (countrySelect) {
            // Keep first option
            const firstOption = countrySelect.options[0];
            countrySelect.innerHTML = '';
            countrySelect.appendChild(firstOption);
            
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating filters:', error);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Load more button
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            page++;
            displayWines(false);
        });
    }
    
    // Apply filters button
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }
    
    // Real-time search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Set new timeout for search
            searchTimeout = setTimeout(() => {
                filters.search = searchInput.value.trim();
                page = 1;
                displayWines(true);
            }, 500);
        });
        
        // Enter key to search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                filters.search = searchInput.value.trim();
                page = 1;
                displayWines(true);
                e.preventDefault();
            }
        });
    }
    
    // Min price input
    if (minPriceInput) {
        minPriceInput.addEventListener('change', () => {
            filters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        });
    }
    
    // Max price input
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', () => {
            filters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        });
    }
    
    // Region select
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            filters.region = regionSelect.value;
        });
    }
    
    // Variety select
    if (varietySelect) {
        varietySelect.addEventListener('change', () => {
            filters.variety = varietySelect.value;
        });
    }
    
    // Type select
    if (typeSelect) {
        typeSelect.addEventListener('change', () => {
            filters.type = typeSelect.value;
        });
    }
    
    // Country select
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            filters.country = countrySelect.value;
        });
    }
    
    // Rating filter
    if (ratingFilter) {
        ratingFilter.addEventListener('change', () => {
            filters.rating = parseInt(ratingFilter.value) || 0;
        });
    }
    
    // Sort option
    if (sortOption) {
        sortOption.addEventListener('change', () => {
            sortBy = sortOption.value;
            page = 1;
            displayWines(true);
        });
    }
    
    // Cart toggle
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    
    if (closeCartButton) {
        closeCartButton.addEventListener('click', closeCart);
    }
    
    // Modal overlay click to close cart
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCart);
    }
    
    // Checkout button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
    
    // Search modal toggle
    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearchModal);
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', closeSearchModal);
    }
    
    // Suggestion tags click
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = tag.textContent;
                filters.search = tag.textContent;
            }
            
            // Close search modal
            closeSearchModal();
            
            // Apply filter
            page = 1;
            displayWines(true);
        });
    });
}

/**
 * Toggle search modal
 */
function toggleSearchModal() {
    if (searchModal) {
        searchModal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus search input
        const searchInput = searchModal.querySelector('.search-input');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    }
}

/**
 * Close search modal
 */
function closeSearchModal() {
    if (searchModal) {
        searchModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Apply filters and update display
 */
function applyFilters() {
    // Collect filter values
    if (searchInput) {
        filters.search = searchInput.value.trim();
    }
    
    if (regionSelect) {
        filters.region = regionSelect.value;
    }
    
    if (varietySelect) {
        filters.variety = varietySelect.value;
    }
    
    if (countrySelect) {
        filters.country = countrySelect.value;
    }
    
    if (typeSelect) {
        filters.type = typeSelect.value;
    }
    
    if (minPriceInput) {
        filters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    }
    
    if (maxPriceInput) {
        filters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
    }
    
    if (ratingFilter) {
        filters.rating = parseInt(ratingFilter.value) || 0;
    }
    
    // Reset page and display wines
    page = 1;
    displayWines(true);
    
    // Add filter animation
    const filtersContainer = document.querySelector('.filters-container');
    if (filtersContainer) {
        filtersContainer.classList.add('filters-applied');
        setTimeout(() => {
            filtersContainer.classList.remove('filters-applied');
        }, 500);
    }
    
    // Update URL with filters
    updateUrlWithFilters();
}

/**
 * Update URL with current filters
 */
function updateUrlWithFilters() {
    // Create URL parameters
    const urlParams = new URLSearchParams();
    
    if (filters.search) {
        urlParams.set('search', filters.search);
    }
    
    if (filters.region) {
        urlParams.set('region', filters.region);
    }
    
    if (filters.variety) {
        urlParams.set('variety', filters.variety);
    }
    
    if (filters.country) {
        urlParams.set('country', filters.country);
    }
    
    if (filters.type) {
        urlParams.set('type', filters.type);
    }
    
    if (filters.minPrice) {
        urlParams.set('minPrice', filters.minPrice);
    }
    
    if (filters.maxPrice) {
        urlParams.set('maxPrice', filters.maxPrice);
    }
    
    if (filters.rating > 0) {
        urlParams.set('rating', filters.rating);
    }
    
    if (sortBy !== 'rating') {
        urlParams.set('sort', sortBy);
    }
    
    // Update URL without reloading the page
    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
    window.history.pushState({ path: newUrl }, '', newUrl);
}

/**
 * Display wines based on current filters and pagination
 * @param {boolean} resetPage - Whether to reset to the first page
 */
function displayWines(resetPage = true) {
    if (!wineListContainer) return;
    
    if (resetPage) {
        page = 1;
        showLoading(wineListContainer);
    }
    
    // Filter wines based on current filters
    filteredWines = filterWines();
    
    // Sort wines
    sortWines();
    
    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredWines.length);
    
    // Get current page wines
    const currentPageWines = filteredWines.slice(startIndex, endIndex);
    displayedWines = resetPage ? [] : displayedWines;
    displayedWines = [...displayedWines, ...currentPageWines];
    
    // Show or hide load more button
    if (loadMoreButton) {
        if (endIndex >= filteredWines.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'inline-block';
        }
    }
    
    // Display wines
    if (resetPage) {
        wineListContainer.innerHTML = '';
    }
    
    if (filteredWines.length === 0) {
        wineListContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No wines found matching your criteria.
                </div>
                <button class="btn btn-outline mt-3" onclick="resetFilters()">
                    <i class="fas fa-undo me-2"></i>Reset Filters
                </button>
            </div>
        `;
        
        // Update counts
        if (resultCountElement) resultCountElement.textContent = '0';
        if (showingCountElement) showingCountElement.textContent = '0';
        
        return;
    }
    
    // Update counts
    if (resultCountElement) resultCountElement.textContent = filteredWines.length;
    if (showingCountElement) showingCountElement.textContent = displayedWines.length;
    if (totalCountElement && totalCountElement.textContent === '0') {
        totalCountElement.textContent = allWines.length;
    }
    
    // Add wine cards with staggered animation
    currentPageWines.forEach((wine, index) => {
        const wineCard = createWineCard(wine, index);
        wineListContainer.appendChild(wineCard);
    });
}

/**
 * Sort wines based on selected option
 */
function sortWines() {
    switch (sortBy) {
        case 'rating':
            filteredWines.sort((a, b) => (b.points || 0) - (a.points || 0));
            break;
        case 'price-asc':
            filteredWines.sort((a, b) => {
                const priceA = parseFloat(a.prix || a.price || 0);
                const priceB = parseFloat(b.prix || b.price || 0);
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            filteredWines.sort((a, b) => {
                const priceA = parseFloat(a.prix || a.price || 0);
                const priceB = parseFloat(b.prix || b.price || 0);
                return priceB - priceA;
            });
            break;
        case 'name':
            filteredWines.sort((a, b) => {
                const nameA = (a.title || '').toLowerCase();
                const nameB = (b.title || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
        default:
            // Default to rating sort
            filteredWines.sort((a, b) => (b.points || 0) - (a.points || 0));
    }
}

/**
 * Reset all filters to default values
 */
window.resetFilters = function() {
    // Reset filter values
    filters = {
        search: '',
        region: '',
        variety: '',
        minPrice: null,
        maxPrice: null,
        type: '',
        rating: 0,
        country: ''
    };
    
    // Reset sort
    sortBy = 'rating';
    if (sortOption) sortOption.value = 'rating';
    
    // Reset form inputs
    if (searchInput) searchInput.value = '';
    if (regionSelect) regionSelect.value = '';
    if (varietySelect) varietySelect.value = '';
    if (countrySelect) countrySelect.value = '';
    if (typeSelect) typeSelect.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (ratingFilter) ratingFilter.value = '0';
    
    // Reset page and display wines
    page = 1;
    displayWines(true);
    
    // Update URL to remove filters
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    
    // Show notification
    showNotification('Filters have been reset', 'success');
};

/**
 * Display featured wines
 */
function displayFeaturedWines() {
    if (!featuredWinesContainer) return;
    
    // Show loading indicator
    showLoading(featuredWinesContainer);
    
    try {
        // Get featured wines (high rating, diverse selection)
        const featuredWines = getFeaturedWines();
        
        if (featuredWines.length === 0) {
            featuredWinesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No featured wines available.
                    </div>
                </div>
            `;
            return;
        }
        
        // Clear loading indicator
        featuredWinesContainer.innerHTML = '';
        
        // Add featured wine cards
        featuredWines.forEach((wine, index) => {
            const wineCard = createWineCard(wine, index, true);
            featuredWinesContainer.appendChild(wineCard);
        });
    } catch (error) {
        console.error('Error displaying featured wines:', error);
        featuredWinesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading featured wines.
                </div>
            </div>
        `;
    }
}

/**
 * Get featured wines selection
 * @returns {Array} - Featured wines selection
 */
function getFeaturedWines() {
    // Get high-rated wines
    const highRatedWines = allWines
        .filter(wine => (wine.points || 0) >= 90)
        .sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Ensure variety in selection
    const featuredWines = [];
    const includedVarieties = new Set();
    const desiredCount = 3;
    
    // First pass: try to get diverse varieties
    for (const wine of highRatedWines) {
        const variety = wine.variété || wine.varietal;
        
        if (!includedVarieties.has(variety)) {
            featuredWines.push(wine);
            includedVarieties.add(variety);
            
            if (featuredWines.length >= desiredCount) {
                break;
            }
        }
    }
    
    // Second pass: fill remaining slots if needed
    if (featuredWines.length < desiredCount) {
        for (const wine of highRatedWines) {
            if (!featuredWines.includes(wine)) {
                featuredWines.push(wine);
                
                if (featuredWines.length >= desiredCount) {
                    break;
                }
            }
        }
    }
    
    return featuredWines;
}

/**
 * Filter wines based on current filters
 * @returns {Array} - Filtered wines
 */
function filterWines() {
    return allWines.filter(wine => {
        // Search filter
        if (filters.search) {
            const searchText = filters.search.toLowerCase();
            const title = (wine.title || '').toLowerCase();
            const winery = (wine.winery || '').toLowerCase();
            const description = (wine.description || '').toLowerCase();
            const variety = (wine.variété || wine.varietal || '').toLowerCase();
            const region = (wine.region_1 || wine.region || '').toLowerCase();
            const country = (wine.country || '').toLowerCase();
            
            if (!title.includes(searchText) && 
                !winery.includes(searchText) && 
                !description.includes(searchText) &&
                !variety.includes(searchText) &&
                !region.includes(searchText) &&
                !country.includes(searchText)) {
                return false;
            }
        }
        
        // Region filter
        if (filters.region && wine.region_1 !== filters.region && wine.region !== filters.region) {
            return false;
        }
        
        // Variety filter
        if (filters.variety && wine.variété !== filters.variety && wine.varietal !== filters.variety) {
            return false;
        }
        
        // Country filter
        if (filters.country && wine.country !== filters.country) {
            return false;
        }
        
        // Wine type filter - ENHANCED for better type detection
        if (filters.type) {
            const variety = (wine.variété || wine.varietal || '').toLowerCase();
            
            if (filters.type === 'red' && 
                !(variety.includes('rouge') || 
                  variety.includes('red') || 
                  variety.includes('noir') || 
                  variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('syrah') || 
                  variety.includes('shiraz') || 
                  variety.includes('malbec') || 
                  variety.includes('tempranillo') || 
                  variety.includes('sangiovese') || 
                  variety.includes('pinot noir'))) {
                return false;
            }
            
            if (filters.type === 'white' && 
                !(variety.includes('blanc') || 
                  variety.includes('white') || 
                  variety.includes('chardonnay') || 
                  variety.includes('sauvignon') || 
                  variety.includes('riesling'))) {
                return false;
            }
            
            if (filters.type === 'rose' && 
                !(variety.includes('rosé') || 
                  variety.includes('rose'))) {
                return false;
            }
            
            if (filters.type === 'sparkling' && 
                !(variety.includes('sparkling') || 
                  variety.includes('champagne') || 
                  variety.includes('cava') || 
                  variety.includes('prosecco'))) {
                return false;
            }
        }
        
        // Rating filter
        if (filters.rating > 0 && (wine.points || 0) < filters.rating) {
            return false;
        }
        
        // Price filters
        const price = parseFloat(wine.prix || wine.price || 0);
        if (filters.minPrice !== null && price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice !== null && price > filters.maxPrice) {
            return false;
        }
        
        return true;
    });
}

/**
 * Create a wine card element with consistent styling
 * @param {Object} wine - The wine data
 * @param {number} index - The index for staggered animation
 * @param {boolean} isFeatured - Whether this is a featured wine
 * @returns {HTMLElement} - The wine card element
 */
function createWineCard(wine, index, isFeatured = false) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4 fade-in';
    col.style.animationDelay = `${index * 0.1}s`;
    
    // Set wine type badge class
    let wineTypeBadge = 'badge-burgundy';
    let typeClass = 'wine-type-red';
    let wineType = wine.variété || wine.varietal || '';
    let wineTypeDisplay = 'Red Wine';
    
    // More sophisticated wine type detection
    if (wineType.toLowerCase().includes('blanc') || 
        wineType.toLowerCase().includes('white') || 
        wineType.toLowerCase().includes('chardonnay') || 
        wineType.toLowerCase().includes('sauvignon') ||
        wineType.toLowerCase().includes('riesling')) {
        wineTypeBadge = 'badge-gold';
        typeClass = 'wine-type-white';
        wineTypeDisplay = 'White Wine';
    } else if (wineType.toLowerCase().includes('sparkling') || 
               wineType.toLowerCase().includes('champagne') ||
               wineType.toLowerCase().includes('prosecco') ||
               wineType.toLowerCase().includes('cava')) {
        wineTypeBadge = 'badge-sparkle';
        typeClass = 'wine-type-sparkling';
        wineTypeDisplay = 'Sparkling Wine';
    } else if (wineType.toLowerCase().includes('rosé') || 
               wineType.toLowerCase().includes('rose')) {
        wineTypeBadge = 'badge-rose';
        typeClass = 'wine-type-rose';
        wineTypeDisplay = 'Rosé Wine';
    }
    
    // Create featured badge if applicable
    const featuredBadge = isFeatured ? 
        `<div class="featured-badge">
            <i class="fas fa-award"></i> Featured
        </div>` : '';
    
    // Calculate rating class
    let ratingClass = 'average';
    const rating = wine.points || 0;
    
    if (rating >= 95) {
        ratingClass = 'exceptional';
    } else if (rating >= 90) {
        ratingClass = 'excellent';
    } else if (rating >= 85) {
        ratingClass = 'very-good';
    } else if (rating < 80) {
        ratingClass = 'below-average';
    }
    
    // Wine image based on type
    let wineImage = '';
    if (wineTypeDisplay === 'Red Wine') {
        wineImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400&q=80';
    } else if (wineTypeDisplay === 'White Wine') {
        wineImage = 'https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400&q=80';
    } else if (wineTypeDisplay === 'Rosé Wine') {
        wineImage = 'https://images.unsplash.com/photo-1558682125-c504d85a63a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400&q=80';
    } else {
        wineImage = 'https://images.unsplash.com/photo-1605869310077-deaf8a22c128?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400&q=80';
    }
    
    col.innerHTML = `
        <div class="wine-card">
            ${featuredBadge}
            <div class="wine-image">
                <img src="${wineImage}" alt="${wine.title || 'Wine'}" loading="lazy">
                <div class="wine-badges">
                    <span class="badge ${wineTypeBadge}">${wineTypeDisplay}</span>
                    ${rating >= 90 ? `<span class="badge badge-rating">${rating} Points</span>` : ''}
                </div>
            </div>
            <div class="card-body">
                <h4 class="card-title">${wine.title || 'Unnamed Wine'}</h4>
                <p class="card-subtitle">
                    <span class="winery">${wine.winery || 'Unknown Winery'}</span>
                    <span class="vintage">${wine.vintage || ''}</span>
                </p>
                
                <div class="wine-meta">
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${wine.region_1 || wine.region || 'Unknown Region'}, ${wine.country || 'Unknown Country'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-wine-glass-alt"></i>
                        <span>${wineType}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-utensils"></i>
                        <span>${getWinePairing(wineType)}</span>
                    </div>
                </div>
                
                <div class="wine-rating ${ratingClass}">
                    ${generateStars(rating)}
                    <span class="rating-number">${rating || 'N/A'}</span>
                </div>
                
                <p class="card-description">${wine.description || 'No description available.'}</p>
                
                <div class="card-footer">
                    <span class="wine-price">$${(parseFloat(wine.prix || wine.price) || 0).toFixed(2)}</span>
                    <button class="btn-add-to-cart" data-wine-id="${wine.id}">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for add to cart button
    const addToCartButton = col.querySelector('.btn-add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', (e) => {
            e.preventDefault();
            const wineId = addToCartButton.getAttribute('data-wine-id');
            const selectedWine = allWines.find(w => w.id === wineId);
            
            if (selectedWine) {
                addToCart(selectedWine);
                
                // Add button animation
                addToCartButton.innerHTML = '<i class="fas fa-check me-2"></i>Added';
                addToCartButton.classList.add('added');
                
                setTimeout(() => {
                    addToCartButton.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Add to Cart';
                    addToCartButton.classList.remove('added');
                }, 2000);
            }
        });
    }
    
    return col;
}

/**
 * Generate star rating display
 * @param {number} rating - Wine rating out of 100
 * @returns {string} - HTML for star rating
 */
function generateStars(rating) {
    if (!rating) return '';
    
    // Convert rating from 100-point scale to 5-star scale
    const starRating = rating / 20;
    let stars = '';
    
    // Full stars
    for (let i = 1; i <= Math.floor(starRating); i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (starRating % 1 >= 0.5) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(starRating);
    for (let i = 1; i <= emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return `<div class="star-rating">${stars}</div>`;
}

/**
 * Get suggested wine pairing based on wine type
 * @param {string} wineType - The wine type/variety
 * @returns {string} - The suggested pairing
 */
function getWinePairing(wineType) {
    const type = wineType.toLowerCase();
    
    if (type.includes('blanc') || 
        type.includes('white') || 
        type.includes('chardonnay') || 
        type.includes('sauvignon')) {
        return 'Seafood';
    } else if (type.includes('sparkling') || type.includes('champagne')) {
        return 'Celebrations';
    } else if (type.includes('rosé') || type.includes('rose')) {
        return 'Light Dishes';
    } else if (type.includes('merlot')) {
        return 'Poultry';
    } else if (type.includes('cabernet')) {
        return 'Red Meats';
    } else if (type.includes('pinot noir')) {
        return 'Duck';
    } else if (type.includes('syrah') || type.includes('shiraz')) {
        return 'Grilled Meats';
    } else {
        return 'Fine Cuisine';
    }
}

// Cart functionality
/**
 * Load cart from localStorage
 */
function loadCart() {
    try {
        const savedCart = localStorage.getItem('laciteduvin-cart');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
            
            // Validate cart items
            cart = cart.filter(item => 
                item && 
                typeof item === 'object' && 
                (item.title || item.id) && 
                item.quantity > 0
            );
        }
    } catch (error) {
        console.error('Error loading cart data:', error);
        cart = [];
    }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem('laciteduvin-cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart data:', error);
        
        // Show notification
        showNotification('Failed to save cart. Browser storage may be limited or disabled.', 'error');
    }
}

/**
 * Add a wine to the cart
 * @param {Object} wine - The wine to add
 */
function addToCart(wine) {
    if (!wine) return;
    
    try {
        // Check if the wine is already in the cart
        const existingItemIndex = cart.findIndex(item => item.id === wine.id);
        
        if (existingItemIndex !== -1) {
            // Increment quantity if already in cart
            cart[existingItemIndex].quantity += 1;
            
            // Show notification
            showNotification(`Added another ${wine.title || 'wine'} to your collection`, 'success');
        } else {
            // Add new item to cart
            cart.push({
                ...wine,
                quantity: 1
            });
            
            // Show notification
            showNotification(`${wine.title || 'Wine'} added to your collection`, 'success');
        }
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart UI
        updateCartCount();
        renderCart();
        
        // Open the cart
        openCart();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add wine to collection', 'error');
    }
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Remove an item from the cart
 * @param {string} wineId - The wine ID to remove
 */
function removeFromCart(wineId) {
    // Find wine to be removed
    const wineToRemove = cart.find(item => item.id === wineId);
    
    if (!wineToRemove) return;
    
    // Update cart
    cart = cart.filter(item => item.id !== wineId);
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart UI
    updateCartCount();
    renderCart();
    
    // Show notification
    showNotification(`${wineToRemove.title || 'Wine'} removed from your collection`, 'success');
}

/**
 * Update item quantity in cart
 * @param {string} wineId - The wine ID
 * @param {number} quantity - The new quantity
 */
function updateCartItemQuantity(wineId, quantity) {
    if (quantity <= 0) {
        removeFromCart(wineId);
        return;
    }
    
    const itemIndex = cart.findIndex(item => item.id === wineId);
    
    if (itemIndex !== -1) {
        // Update quantity with max limit
        cart[itemIndex].quantity = Math.min(99, quantity);
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart UI
        updateCartCount();
        renderCart();
    }
}

/**
 * Update cart count display
 */
function updateCartCount() {
    if (!cartCountElement) return;
    
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update count
    cartCountElement.textContent = count;
    
    // Show/hide cart count
    if (count > 0) {
        cartCountElement.style.display = 'flex';
        
        // Add pulse animation
        cartCountElement.classList.add('pulse');
        setTimeout(() => {
            cartCountElement.classList.remove('pulse');
        }, 300);
    } else {
        cartCountElement.style.display = 'none';
    }
    
    // Update cart button state
    if (checkoutButton) {
        checkoutButton.disabled = count === 0;
    }
}

/**
 * Calculate cart total price
 * @returns {number} - The total price
 */
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.prix || item.price || 0);
        return total + (price * item.quantity);
    }, 0);
}

/**
 * Render cart items
 */
function renderCart() {
    if (!cartItemsContainer || !cartTotalElement) return;
    
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Display empty cart message
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-wine-glass-alt"></i>
                <p class="empty-cart-message">Your collection is empty</p>
                <p class="empty-cart-submessage">Explore our selection of fine wines</p>
                <a href="wines.html" class="btn btn-outline btn-sm mt-3">
                    <i class="fas fa-wine-bottle me-2"></i>Explore Collection
                </a>
            </div>
        `;
        
        // Disable checkout button
        if (checkoutButton) {
            checkoutButton.disabled = true;
        }
    } else {
        // Enable checkout button
        if (checkoutButton) {
            checkoutButton.disabled = false;
        }
        
        // Render cart items
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item fade-in';
            cartItem.style.animationDelay = `${index * 0.1}s`;
            
            // Determine wine image based on type
            let wineImage = 'https://via.placeholder.com/80?text=Wine';
            const wineType = item.variété || item.varietal || '';
            
            if (wineType.toLowerCase().includes('rouge') || 
                wineType.toLowerCase().includes('red')) {
                wineImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('blanc') || 
                       wineType.toLowerCase().includes('white')) {
                wineImage = 'https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('rosé') || 
                       wineType.toLowerCase().includes('rose')) {
                wineImage = 'https://images.unsplash.com/photo-1558682125-c504d85a63a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('sparkling') || 
                       wineType.toLowerCase().includes('champagne')) {
                wineImage = 'https://images.unsplash.com/photo-1605869310077-deaf8a22c128?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            }
            
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${wineImage}" alt="${item.title || 'Wine'}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title || 'Unnamed Wine'}</h4>
                    <p class="cart-item-variant">${wineType} - ${item.winery || 'Unknown Winery'}</p>
                    <div class="cart-item-price-qty">
                        <p class="cart-item-price">$${(parseFloat(item.prix || item.price) || 0).toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" aria-label="Item quantity">
                            <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                </div>
                <div class="cart-item-remove" role="button" aria-label="Remove item">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            // Add event listeners for quantity controls
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const removeBtn = cartItem.querySelector('.cart-item-remove');
            
            minusBtn.addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity - 1);
            });
            
            plusBtn.addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity + 1);
            });
            
            quantityInput.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity > 0) {
                    updateCartItemQuantity(item.id, newQuantity);
                } else {
                    // Reset to previous valid value
                    e.target.value = item.quantity;
                }
            });
            
            removeBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update cart total
    const cartTotal = calculateCartTotal();
    cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
    
    // Update cart summary if it exists
    const summarySubtotal = document.getElementById('summary-subtotal');
    if (summarySubtotal) {
        summarySubtotal.textContent = `$${cartTotal.toFixed(2)}`;
    }
    
    // Update summary total
    updateSummaryTotal();
}

/**
 * Update checkout summary total
 */
function updateSummaryTotal() {
    const summaryTotal = document.getElementById('summary-total');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    
    if (summaryTotal && summarySubtotal && summaryShipping) {
        const subtotal = parseFloat(summarySubtotal.textContent.replace('$', '')) || 0;
        const shipping = parseFloat(summaryShipping.textContent.replace('$', '')) || 0;
        
        summaryTotal.textContent = `$${(subtotal + shipping).toFixed(2)}`;
    }
}

/**
 * Toggle cart visibility
 */
function toggleCart() {
    if (cartModal.classList.contains('active')) {
        closeCart();
    } else {
        openCart();
    }
}

/**
 * Open cart
 */
function openCart() {
    cartModal.classList.add('active');
    modalOverlay.classList.add('active');
    
    // Render cart contents
    renderCart();
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus trap for accessibility
    setTimeout(() => {
        const firstFocusable = cartModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }, 100);
}

/**
 * Close cart
 */
function closeCart() {
    cartModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to cart icon
    if (cartIcon) cartIcon.focus();
}

// Export to window for HTML access
window.toggleCart = toggleCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.toggleSearchModal = toggleSearchModal;
window.closeSearchModal = closeSearchModal;