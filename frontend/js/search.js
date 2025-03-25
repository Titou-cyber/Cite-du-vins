// frontend/js/search.js
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchForm = document.getElementById('search-form');
        this.searchResults = null;
        this.lastQuery = '';
        this.debounceTimeout = null;
        
        this.init();
    }
    
    init() {
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
        if (this.searchInput) {
            // Implement search-as-you-type with debounce
            this.searchInput.addEventListener('input', () => {
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = setTimeout(() => {
                    if (this.searchInput.value.length >= 3) {
                        this.performSearch(true);
                    } else if (this.searchInput.value.length === 0) {
                        this.clearSearchPreview();
                    }
                }, 300);
            });
            
            // Handle focus and blur for search preview
            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.length >= 3) {
                    this.showSearchPreview();
                }
            });
            
            // Close search preview when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.searchInput.contains(e.target) && !e.target.closest('.search-preview')) {
                    this.clearSearchPreview();
                }
            });
        }
        
        // Check if we're on the search results page
        if (window.location.pathname.includes('search-results.html')) {
            this.loadSearchResults();
        }
    }
    
    async performSearch(isPreview = false) {
        const query = this.searchInput.value.trim();
        
        if (!query || query.length < 2) return;
        
        if (query === this.lastQuery && isPreview) return;
        
        this.lastQuery = query;
        
        try {
            // Show loading indicator
            this.showSearchLoading();
            
            // Perform search through API
            const results = await wineAPI.searchWines(query);
            
            if (isPreview) {
                // Show preview of results
                this.displaySearchPreview(results, query);
            } else {
                // Navigate to search results page
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError(error.message);
        }
    }
    
    async loadSearchResults() {
        // Get search query from URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (!query) {
            this.showNoResults('Veuillez entrer un terme de recherche');
            return;
        }
        
        // Update search input with query
        if (this.searchInput) {
            this.searchInput.value = query;
        }
        
        try {
            // Show loading indicator
            this.showResultsLoading();
            
            // Perform search through API
            const results = await wineAPI.searchWines(query);
            
            // Update results page with results
            this.displaySearchResults(results, query);
        } catch (error) {
            console.error('Search results error:', error);
            this.showResultsError(error.message);
        }
    }
    
    showSearchLoading() {
        // Create or get search preview container
        let preview = document.querySelector('.search-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'search-preview';
            this.searchForm.appendChild(preview);
        }
        
        preview.innerHTML = `
            <div class="search-loading">
                <div class="spinner"></div>
                <p>Recherche en cours...</p>
            </div>
        `;
        
        preview.style.display = 'block';
    }
    
    displaySearchPreview(results, query) {
        // Create or get search preview container
        let preview = document.querySelector('.search-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'search-preview';
            this.searchForm.appendChild(preview);
        }
        
        if (results.length === 0) {
            preview.innerHTML = `
                <div class="search-no-results">
                    <p>Aucun résultat pour "${query}"</p>
                </div>
            `;
        } else {
            // Display up to 5 results in preview
            const previewResults = results.slice(0, 5);
            
            preview.innerHTML = `
                <div class="search-preview-header">
                    <h3>Résultats pour "${query}"</h3>
                    <span>${results.length} résultats trouvés</span>
                </div>
                <div class="search-preview-items">
                    ${previewResults.map(wine => `
                        <a href="wine-details.html?id=${wine.id}" class="search-preview-item">
                            <div class="preview-item-image">
                                <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title}">
                            </div>
                            <div class="preview-item-content">
                                <h4>${wine.title}</h4>
                                <div class="preview-item-meta">
                                    <span>${wine.region_1 || ''}</span>
                                    ${wine.variety ? `<span>${wine.variety}</span>` : ''}
                                </div>
                                <div class="preview-item-price">€${wine.price || '?'}</div>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <div class="search-preview-footer">
                    <a href="search-results.html?q=${encodeURIComponent(query)}" class="btn-link">
                        Voir tous les résultats
                    </a>
                </div>
            `;
        }
        
        preview.style.display = 'block';
    }
    
    showSearchPreview() {
        const preview = document.querySelector('.search-preview');
        if (preview) {
            preview.style.display = 'block';
        }
    }
    
    clearSearchPreview() {
        const preview = document.querySelector('.search-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }
    
    showSearchError(message) {
        // Create or get search preview container
        let preview = document.querySelector('.search-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'search-preview';
            this.searchForm.appendChild(preview);
        }
        
        preview.innerHTML = `
            <div class="search-error">
                <p>${message || 'Une erreur est survenue lors de la recherche.'}</p>
            </div>
        `;
        
        preview.style.display = 'block';
    }
    
    showResultsLoading() {
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-results-loading">
                    <div class="spinner"></div>
                    <p>Recherche en cours...</p>
                </div>
            `;
        }
    }
    
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results-container');
        const resultsCount = document.getElementById('search-results-count');
        const resultsQuery = document.getElementById('search-query');
        
        if (resultsQuery) {
            resultsQuery.textContent = query;
        }
        
        if (resultsCount) {
            resultsCount.textContent = results.length;
        }
        
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            this.showNoResults(`Aucun résultat pour "${query}"`);
            return;
        }
        
        // Generate HTML for search results
        let html = '';
        
        results.forEach(wine => {
            html += `
                <div class="wine-card">
                    <div class="wine-image">
                        <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title || 'Wine'}">
                    </div>
                    <div class="wine-content">
                        <div class="wine-meta">
                            <span class="wine-region">${wine.region_1 || ''}</span>
                        </div>
                        <h3 class="wine-title">${wine.title || 'Unnamed Wine'}</h3>
                        <div class="wine-points">
                            <span class="wine-points-value">${wine.points || '?'}</span>
                            <span class="wine-points-label">pts</span>
                        </div>
                        <div class="wine-tags">
                            <span class="wine-tag">${wine.variety || ''}</span>
                        </div>
                        <div class="wine-footer">
                            <div class="wine-price">€${wine.price || '?'}</div>
                            <div class="wine-actions">
                                <button class="btn primary add-btn" data-id="${wine.id}">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                                <button class="favorite-btn" data-id="${wine.id}">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        
        // Add event listeners to buttons
        this.setupResultButtonHandlers();
    }
    
    showNoResults(message) {
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>${message}</h3>
                    <p>Essayez d'autres mots-clés ou vérifiez l'orthographe.</p>
                </div>
            `;
        }
    }
    
    showResultsError(message) {
        const resultsContainer = document.getElementById('search-results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h3>Erreur de recherche</h3>
                    <p>${message || 'Une erreur est survenue lors de la recherche.'}</p>
                </div>
            `;
        }
    }
    
    setupResultButtonHandlers() {
        // Add event listeners for add to cart buttons
        const addButtons = document.querySelectorAll('.add-btn');
        addButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const wineId = button.getAttribute('data-id');
                try {
                    // Get wine details
                    const wine = await wineAPI.getWineById(wineId);
                    
                    // Add to cart
                    await cartManager.addToCart(wine, 1);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                }
            });
        });
        
        // Add event listeners for favorite buttons
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                // Check if user is authenticated
                if (!authApi.isAuthenticated()) {
                    window.location.href = 'login.html';
                    return;
                }
                
                const wineId = button.getAttribute('data-id');
                const isFavorite = button.classList.contains('active');
                
                try {
                    if (isFavorite) {
                        await authApi.removeFromFavorites(wineId);
                        button.classList.remove('active');
                        button.querySelector('i').className = 'far fa-heart';
                    } else {
                        await authApi.addToFavorites(wineId);
                        button.classList.add('active');
                        button.querySelector('i').className = 'fas fa-heart';
                    }
                } catch (error) {
                    console.error('Error updating favorites:', error);
                }
            });
        });
    }
}

// Initialize search manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});