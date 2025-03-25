// Wines JavaScript

// DOM Elements
const wineListContainer = document.getElementById('wine-list');
const loadMoreButton = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const regionSelect = document.getElementById('region');
const varietySelect = document.getElementById('variety');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyFiltersButton = document.getElementById('apply-filters');

// Variables
let allWines = [];
let displayedWines = [];
let page = 1;
const pageSize = 12;
let filters = {
    search: '',
    region: '',
    variety: '',
    minPrice: null,
    maxPrice: null
};

// Initialize the application
window.addEventListener('DOMContentLoaded', init);

// Initialize the app
async function init() {
    try {
        // Load wine data
        await loadWineData();
        
        // Check for URL parameters
        parseUrlParams();
        
        // Populate filters
        populateFilters();
        
        // Display initial wines
        displayWines();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        wineListContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    Error loading wine data. Please try refreshing the page.
                </div>
            </div>
        `;
    }
}

// Parse URL parameters
function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('region')) {
        filters.region = urlParams.get('region');
        // Update the region select if it's loaded
        if (regionSelect) {
            setTimeout(() => {
                const option = Array.from(regionSelect.options).find(
                    opt => opt.text === filters.region
                );
                if (option) {
                    regionSelect.value = option.value;
                }
            }, 100);
        }
    }
    
    if (urlParams.has('variety')) {
        filters.variety = urlParams.get('variety');
    }
    
    if (urlParams.has('search')) {
        filters.search = urlParams.get('search');
        searchInput.value = filters.search;
    }
}

// Load wine data
async function loadWineData() {
    try {
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error('Failed to load wine data');
        }
        
        allWines = await response.json();
        
        // If the response is not an array, convert it
        if (!Array.isArray(allWines)) {
            allWines = [allWines];
        }
        
        console.log(`Loaded ${allWines.length} wines`);
    } catch (error) {
        console.error('Error loading wine data:', error);
        throw error;
    }
}

// Populate filter options
function populateFilters() {
    // Get unique regions
    const regions = [...new Set(allWines
        .map(wine => wine.region_1 || wine.region)
        .filter(Boolean))].sort();
    
    // Get unique varieties
    const varieties = [...new Set(allWines
        .map(wine => wine.variété || wine.varietal)
        .filter(Boolean))].sort();
    
    // Add region options
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
    
    // Add variety options
    varieties.forEach(variety => {
        const option = document.createElement('option');
        option.value = variety;
        option.textContent = variety;
        varietySelect.appendChild(option);
    });
    
    // Set initial values based on filters
    if (filters.region) {
        const regionOption = Array.from(regionSelect.options).find(
            opt => opt.text === filters.region
        );
        if (regionOption) {
            regionSelect.value = regionOption.value;
        }
    }
    
    if (filters.variety) {
        const varietyOption = Array.from(varietySelect.options).find(
            opt => opt.text === filters.variety
        );
        if (varietyOption) {
            varietySelect.value = varietyOption.value;
        }
    }
}

// Display wines
function displayWines(resetPage = true) {
    if (resetPage) {
        page = 1;
        wineListContainer.innerHTML = '';
    }
    
    // Filter wines
    const filteredWines = filterWines();
    displayedWines = filteredWines;
    
    // Calculate start and end indices
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredWines.length);
    
    // Get current page wines
    const currentPageWines = filteredWines.slice(startIndex, endIndex);
    
    // Show or hide load more button
    if (endIndex >= filteredWines.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'inline-block';
    }
    
    // Display wines
    if (currentPageWines.length === 0) {
        wineListContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p>No wines found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    // Add wine cards
    currentPageWines.forEach(wine => {
        const wineCard = createWineCard(wine);
        wineListContainer.appendChild(wineCard);
    });
}

// Filter wines based on current filters
function filterWines() {
    return allWines.filter(wine => {
        // Search filter
        if (filters.search) {
            const searchText = filters.search.toLowerCase();
            const title = (wine.title || '').toLowerCase();
            const winery = (wine.winery || '').toLowerCase();
            const description = (wine.description || '').toLowerCase();
            
            if (!title.includes(searchText) && 
                !winery.includes(searchText) && 
                !description.includes(searchText)) {
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
        
        // Price filters
        const price = wine.prix || wine.price || 0;
        if (filters.minPrice !== null && price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice !== null && price > filters.maxPrice) {
            return false;
        }
        
        return true;
    });
}

// Create a wine card
function createWineCard(wine) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const card = document.createElement('div');
    card.className = 'card h-100 wine-card';
    
    // Set wine type badge class
    let wineTypeBadge = 'badge-red';
    const wineType = wine.variété || wine.varietal || '';
    
    if (wineType.toLowerCase().includes('blanc') || 
        wineType.toLowerCase().includes('white') || 
        wineType.toLowerCase().includes('chardonnay') || 
        wineType.toLowerCase().includes('sauvignon')) {
        wineTypeBadge = 'badge-white';
    } else if (wineType.toLowerCase().includes('sparkling') || 
               wineType.toLowerCase().includes('champagne')) {
        wineTypeBadge = 'badge-sparkling';
    } else if (wineType.toLowerCase().includes('rosé') || 
               wineType.toLowerCase().includes('rose')) {
        wineTypeBadge = 'badge-rose';
    }
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title">${wine.title || 'Unnamed Wine'}</h5>
                <span class="wine-rating">${wine.points || 'N/A'}</span>
            </div>
            <h6 class="card-subtitle mb-2 text-muted">${wine.winery || 'Unknown Winery'}</h6>
            <p class="card-text small">${wine.description || 'No description available.'}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="badge ${wineTypeBadge}">${wine.variété || wine.varietal || 'Unknown'}</span>
                <span class="wine-price">$${wine.prix || wine.price || 'N/A'}</span>
            </div>
        </div>
        <div class="card-footer bg-white">
            <small class="text-muted">${wine.region_1 || wine.region || 'Unknown Region'}, ${wine.country || 'Unknown Country'}</small>
        </div>
    `;
    
    col.appendChild(card);
    return col;
}

// Set up event listeners
function setupEventListeners() {
    // Load more button
    loadMoreButton.addEventListener('click', () => {
        page++;
        displayWines(false);
    });
    
    // Apply filters button
    applyFiltersButton.addEventListener('click', () => {
        // Update filters
        filters.search = searchInput.value.trim();
        filters.region = regionSelect.options[regionSelect.selectedIndex].text;
        filters.variety = varietySelect.value;
        filters.minPrice = minPriceInput.value ? Number(minPriceInput.value) : null;
        filters.maxPrice = maxPriceInput.value ? Number(maxPriceInput.value) : null;
        
        // Display filtered wines
        displayWines();
    });
}
