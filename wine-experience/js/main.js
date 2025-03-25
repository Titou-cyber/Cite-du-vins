// Main JS file

// DOM Elements
const wineListContainer = document.getElementById('wine-list');
const loadMoreButton = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const regionSelect = document.getElementById('region');
const varietySelect = document.getElementById('variety');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyFiltersButton = document.getElementById('apply-filters');
const sommelierForm = document.getElementById('sommelier-form');
const recommendationsContainer = document.getElementById('recommendations');

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
        filters.region = regionSelect.value;
        filters.variety = varietySelect.value;
        filters.minPrice = minPriceInput.value ? Number(minPriceInput.value) : null;
        filters.maxPrice = maxPriceInput.value ? Number(maxPriceInput.value) : null;
        
        // Display filtered wines
        displayWines();
    });
    
    // Sommelier form
    sommelierForm.addEventListener('submit', event => {
        event.preventDefault();
        generateRecommendations();
    });
}

// Generate wine recommendations
function generateRecommendations() {
    // Get form values
    const flavorFruity = document.getElementById('flavor-fruity').checked;
    const flavorEarthy = document.getElementById('flavor-earthy').checked;
    const flavorSpicy = document.getElementById('flavor-spicy').checked;
    const pricePreference = document.getElementById('price-preference').value;
    
    // Filter wines based on preferences
    let matchedWines = allWines.filter(wine => {
        // Price filter
        const price = wine.prix || wine.price || 0;
        if (pricePreference === 'budget' && price > 20) return false;
        if (pricePreference === 'moderate' && (price < 20 || price > 50)) return false;
        if (pricePreference === 'premium' && (price < 50 || price > 100)) return false;
        if (pricePreference === 'luxury' && price < 100) return false;
        
        // Only include wines with good ratings
        if ((wine.points || 0) < 85) return false;
        
        return true;
    });
    
    // Sort by rating
    matchedWines.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Take top 3
    matchedWines = matchedWines.slice(0, 3);
    
    // Display recommendations
    recommendationsContainer.innerHTML = '';
    
    if (matchedWines.length === 0) {
        recommendationsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No wines match your preferences. Try adjusting your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    matchedWines.forEach(wine => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-primary text-white">
                    Recommended for You
                </div>
                <div class="card-body">
                    <h5 class="card-title">${wine.title || 'Unnamed Wine'}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${wine.winery || 'Unknown Winery'}</h6>
                    <p class="card-text">${wine.description || 'No description available.'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="badge bg-secondary">${wine.variété || wine.varietal || 'Unknown'}</span>
                        <span class="wine-rating">${wine.points || 'N/A'} pts</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${wine.region_1 || wine.region || 'Unknown Region'}</small>
                        <span class="wine-price">$${wine.prix || wine.price || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
        
        recommendationsContainer.appendChild(col);
    });
}
