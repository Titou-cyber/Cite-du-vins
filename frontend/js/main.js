/**
 * Main.js - Handles DOM manipulation and event listeners for the Cité du Vin marketplace
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Application state object
    const state = {
        wines: [],
        currentPage: 1,
        totalPages: 1,
        totalWines: 0,
        itemsPerPage: 20,
        isLoading: false,
        searchQuery: '',
        filters: {
            region: '',
            variety: '',
            minPrice: '',
            maxPrice: ''
        }
    };

    // Cache DOM elements
    const elements = {
        // Wine display elements
        winesGrid: document.getElementById('wines-grid'),
        emptyState: document.getElementById('empty-state'),
        loadingIndicator: document.getElementById('loading-indicator'),
        errorContainer: document.getElementById('error-container'),
        
        // Filter form elements
        filterForm: document.getElementById('filter-form'),
        regionSelect: document.getElementById('region'),
        varietySelect: document.getElementById('variety'),
        minPriceInput: document.getElementById('minPrice'),
        maxPriceInput: document.getElementById('maxPrice'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        
        // Search form elements
        searchForm: document.getElementById('search-form'),
        searchInput: document.getElementById('search-input'),
        
        // Pagination elements
        itemsPerPageSelect: document.getElementById('items-per-page'),
        paginationInfo: document.getElementById('pagination-info'),
        pageNumbers: document.getElementById('page-numbers'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        
        // Footer element
        currentYearSpan: document.getElementById('current-year')
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
            
            // Set default items per page in select dropdown
            elements.itemsPerPageSelect.value = state.itemsPerPage.toString();
            
            // Get filter options from API (regions and varieties)
            await fetchFilterOptions();
            
            // Get initial wines data
            await fetchWines();
            
            // Set up event handlers for user interaction
            setupEventListeners();
        } catch (error) {
            displayError('Application initialization failed: ' + error.message);
            console.error('Initialization error:', error);
        }
    }
    
    /**
     * Set up all event listeners for interactive elements
     */
    function setupEventListeners() {
        // Search form submission
        elements.searchForm.addEventListener('submit', handleSearchSubmit);
        
        // Filter form submission and reset
        elements.filterForm.addEventListener('submit', handleFilterSubmit);
        elements.resetFiltersBtn.addEventListener('click', handleFilterReset);
        
        // Pagination controls
        elements.prevPageBtn.addEventListener('click', () => navigateToPage(state.currentPage - 1));
        elements.nextPageBtn.addEventListener('click', () => navigateToPage(state.currentPage + 1));
        
        // Items per page selection
        elements.itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
    }
    
    // ----------------------
    // Data Fetching
    // ----------------------
    
    /**
     * Fetch wines from API with pagination
     */
    async function fetchWines() {
        try {
            setLoading(true);
            clearError();
            
            // Call the wine API to get paginated wines
            const data = await wineAPI.getWines(state.currentPage, state.itemsPerPage);
            
            // Update application state with new data
            state.wines = data.wines || [];
            state.totalWines = data.total || 0;
            state.totalPages = data.totalPages || Math.ceil(data.total / state.itemsPerPage);
            
            // Render wines and update pagination UI
            renderWinesList();
            updatePaginationControls();
            
            setLoading(false);
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
            populateDropdown(elements.regionSelect, regions);
            
            // Get varieties from API
            const varieties = await wineAPI.getVarieties();
            populateDropdown(elements.varietySelect, varieties);
        } catch (error) {
            displayError('Failed to load filter options: ' + error.message);
            console.error('Filter options error:', error);
        }
    }
    
    /**
     * Search wines by query term
     */
    async function searchWines(query) {
        try {
            setLoading(true);
            clearError();
            
            if (!query.trim()) {
                // If search is empty, reset to regular wine list
                await fetchWines();
                return;
            }
            
            // Get search results from API
            const results = await wineAPI.searchWines(query);
            
            // Update state and UI
            state.wines = results;
            state.totalWines = results.length;
            state.totalPages = 1; // Search results are not paginated
            state.currentPage = 1;
            
            // Render wines and update pagination UI
            renderWinesList();
            updatePaginationControls();
            
            setLoading(false);
            
            // Show message if no results found
            if (results.length === 0) {
                displayError(`No wines found matching "${query}". Try a different search term.`);
            }
        } catch (error) {
            displayError('Search failed: ' + error.message);
            setLoading(false);
        }
    }
    
    /**
     * Filter wines by selected criteria
     */
    async function filterWines(filters) {
        try {
            setLoading(true);
            clearError();
            
            // Call API with filter parameters
            const results = await wineAPI.filterWines(filters);
            
            // Update state and UI
            state.wines = results;
            state.totalWines = results.length;
            state.totalPages = 1; // Filter results are not paginated
            state.currentPage = 1;
            
            // Render wines and update pagination UI
            renderWinesList();
            updatePaginationControls();
            
            setLoading(false);
            
            // Show message if no results found
            if (results.length === 0) {
                displayError('No wines match your filter criteria. Try broadening your search.');
            }
        } catch (error) {
            displayError('Filtering failed: ' + error.message);
            setLoading(false);
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
        const query = elements.searchInput.value.trim();
        state.searchQuery = query;
        searchWines(query);
    }
    
    /**
     * Handle filter form submission
     */
    function handleFilterSubmit(event) {
        event.preventDefault();
        
        // Get filter values from form
        const filters = {
            region: elements.regionSelect.value,
            variety: elements.varietySelect.value,
            minPrice: elements.minPriceInput.value,
            maxPrice: elements.maxPriceInput.value
        };
        
        // Update state
        state.filters = filters;
        
        // Apply filters
        filterWines(filters);
    }
    
    /**
     * Handle filter reset button click
     */
    function handleFilterReset() {
        // Reset form inputs
        elements.regionSelect.value = '';
        elements.varietySelect.value = '';
        elements.minPriceInput.value = '';
        elements.maxPriceInput.value = '';
        
        // Clear filter state
        state.filters = {
            region: '',
            variety: '',
            minPrice: '',
            maxPrice: ''
        };
        
        // Reset to first page and fetch wines
        state.currentPage = 1;
        fetchWines();
    }
    
    /**
     * Handle changing the number of items per page
     */
    function handleItemsPerPageChange() {
        // Update state with new items per page value
        state.itemsPerPage = parseInt(elements.itemsPerPageSelect.value);
        
        // Reset to first page and refetch wines
        state.currentPage = 1;
        fetchWines();
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
    }
    
    // ----------------------
    // UI Rendering Functions
    // ----------------------
    
    /**
     * Render the wines list
     */
    function renderWinesList() {
        const wines = state.wines;
        elements.winesGrid.innerHTML = '';
        
        // Show empty state if no wines
        if (wines.length === 0) {
            elements.emptyState.style.display = 'block';
            elements.winesGrid.style.display = 'none';
            return;
        }
        
        // Hide empty state and show grid
        elements.emptyState.style.display = 'none';
        elements.winesGrid.style.display = 'grid';
        
        // Render each wine card
        wines.forEach(wine => {
            const wineCard = createWineCard(wine);
            elements.winesGrid.appendChild(wineCard);
        });
    }
    
    /**
     * Create a wine card DOM element
     */
    function createWineCard(wine) {
        // Create card container
        const card = document.createElement('div');
        card.className = 'wine-card';
        
        // Generate points badge HTML if points exist
        let pointsHtml = '';
        if (wine.points) {
            pointsHtml = `
                <div class="wine-points">
                    <span class="wine-points-value">${wine.points}</span>
                    <span class="wine-points-label">pts</span>
                </div>
            `;
        }
        
        // Generate tags HTML if variety or region exist
        let tagsHtml = '';
        if (wine.variety || wine.region_1) {
            tagsHtml = '<div class="wine-tags">';
            
            if (wine.variety) {
                tagsHtml += `<span class="wine-tag">${wine.variety}</span>`;
            }
            
            if (wine.region_1) {
                tagsHtml += `<span class="wine-tag">${wine.region_1}</span>`;
            }
            
            tagsHtml += '</div>';
        }
        
        // Build card HTML
        card.innerHTML = `
            <div class="wine-content">
                <h3 class="wine-title">${wine.title || 'Unnamed Wine'}</h3>
                ${pointsHtml}
                ${tagsHtml}
                <p class="wine-description">${wine.description || 'No description available.'}</p>
                <div class="wine-footer">
                    <div class="wine-price">${wine.price ? `$${wine.price}` : 'Price unavailable'}</div>
                    <button class="btn primary add-btn">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Update pagination controls
     */
    function updatePaginationControls() {
        // Update pagination info text
        elements.paginationInfo.textContent = `Showing ${state.wines.length} of ${state.totalWines} wines (Page ${state.currentPage} of ${state.totalPages})`;
        
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
    
    // ----------------------
    // Helper Functions
    // ----------------------
    
    /**
     * Populate a dropdown with options
     */
    function populateDropdown(selectElement, options) {
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
     * Show/hide loading indicator
     */
    function setLoading(isLoading) {
        state.isLoading = isLoading;
        elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        
        // Only hide wines grid if loading and we have no wines to display
        if (isLoading && state.wines.length === 0) {
            elements.winesGrid.style.display = 'none';
        } else if (!isLoading && state.wines.length > 0) {
            elements.winesGrid.style.display = 'grid';
        }
    }
    
    /**
     * Display error message
     */
    function displayError(message) {
        elements.errorContainer.textContent = message;
        elements.errorContainer.style.display = 'block';
    }
    
    /**
     * Clear error message
     */
    function clearError() {
        elements.errorContainer.style.display = 'none';
    }
    
    /**
     * Update footer year to current year
     */
    function updateFooterYear() {
        elements.currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // Initialize the application
    init();
});