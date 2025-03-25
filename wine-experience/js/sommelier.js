// Sommelier JavaScript

// DOM Elements
const sommelierForm = document.getElementById('sommelier-form');
const recommendationsContainer = document.getElementById('recommendations');

// Variables
let allWines = [];

// Initialize the application
window.addEventListener('DOMContentLoaded', init);

// Initialize the app
async function init() {
    try {
        // Load wine data
        await loadWineData();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing sommelier:', error);
        recommendationsContainer.innerHTML = `
            <div class="col-12">
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

// Set up event listeners
function setupEventListeners() {
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
    const flavorFloral = document.getElementById('flavor-floral').checked;
    const pricePreference = document.getElementById('price-preference').value;
    const typePreference = document.getElementById('type-preference').value;
    const foodPreference = document.getElementById('food-preference').value;
    
    // Filter wines based on preferences
    let matchedWines = allWines.filter(wine => {
        // Only include wines with ratings
        if (!(wine.points > 0)) return false;
        
        // Price filter
        const price = wine.prix || wine.price || 0;
        if (pricePreference === 'budget' && price > 20) return false;
        if (pricePreference === 'moderate' && (price < 20 || price > 50)) return false;
        if (pricePreference === 'premium' && (price < 50 || price > 100)) return false;
        if (pricePreference === 'luxury' && price < 100) return false;
        
        // Type filter
        const variety = (wine.variété || wine.varietal || '').toLowerCase();
        if (typePreference !== 'any') {
            if (typePreference === 'red' && 
                !(variety.includes('rouge') || 
                  variety.includes('red') || 
                  variety.includes('noir') || 
                  variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('syrah') || 
                  variety.includes('grenache'))) {
                return false;
            }
            if (typePreference === 'white' && 
                !(variety.includes('blanc') || 
                  variety.includes('white') || 
                  variety.includes('chardonnay') || 
                  variety.includes('sauvignon') || 
                  variety.includes('riesling'))) {
                return false;
            }
            if (typePreference === 'rose' && 
                !(variety.includes('rosé') || 
                  variety.includes('rose'))) {
                return false;
            }
            if (typePreference === 'sparkling' && 
                !(variety.includes('sparkling') || 
                  variety.includes('champagne') || 
                  variety.includes('cava') || 
                  variety.includes('prosecco'))) {
                return false;
            }
        }
        
        // Food pairing filter (basic)
        if (foodPreference !== 'none') {
            const description = (wine.description || '').toLowerCase();
            
            if (foodPreference === 'beef' && 
                !(variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('syrah') || 
                  variety.includes('malbec'))) {
                return false;
            }
            if (foodPreference === 'chicken' && 
                !(variety.includes('chardonnay') || 
                  variety.includes('pinot noir') || 
                  variety.includes('zinfandel'))) {
                return false;
            }
            if (foodPreference === 'fish' && 
                !(variety.includes('sauvignon blanc') || 
                  variety.includes('pinot grigio') || 
                  variety.includes('albariño') || 
                  variety.includes('chablis'))) {
                return false;
            }
            if (foodPreference === 'pasta' && 
                !(variety.includes('chianti') || 
                  variety.includes('barbera') || 
                  variety.includes('sangiovese'))) {
                return false;
            }
            if (foodPreference === 'cheese' && 
                !(variety.includes('chardonnay') || 
                  variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('port'))) {
                return false;
            }
            if (foodPreference === 'dessert' && 
                !(variety.includes('port') || 
                  variety.includes('sauternes') || 
                  variety.includes('riesling') || 
                  variety.includes('moscato'))) {
                return false;
            }
        }
        
        // Flavor preference scoring (add points for matching flavors)
        let score = 0;
        const description = (wine.description || '').toLowerCase();
        
        if (flavorFruity && 
            (description.includes('fruit') || 
             description.includes('berry') || 
             description.includes('cherry') || 
             description.includes('apple') || 
             description.includes('citrus'))) {
            score += 2;
        }
        
        if (flavorEarthy && 
            (description.includes('earth') || 
             description.includes('soil') || 
             description.includes('mineral') || 
             description.includes('leather') || 
             description.includes('tobacco'))) {
            score += 2;
        }
        
        if (flavorSpicy && 
            (description.includes('spice') || 
             description.includes('pepper') || 
             description.includes('cinnamon') || 
             description.includes('clove'))) {
            score += 2;
        }
        
        if (flavorFloral && 
            (description.includes('floral') || 
             description.includes('flower') || 
             description.includes('blossom') || 
             description.includes('rose') || 
             description.includes('violet'))) {
            score += 2;
        }
        
        // Only include wines with a decent flavor match
        return score > 0;
    });
    
    // Calculate match scores
    matchedWines = matchedWines.map(wine => {
        // Base score is the wine's rating
        let matchScore = wine.points || 85;
        
        // Adjust score based on preferences
        const description = (wine.description || '').toLowerCase();
        
        // Flavor preference adjustments
        if (flavorFruity && 
            (description.includes('fruit') || 
             description.includes('berry') || 
             description.includes('cherry') || 
             description.includes('apple') || 
             description.includes('citrus'))) {
            matchScore += 3;
        }
        
        if (flavorEarthy && 
            (description.includes('earth') || 
             description.includes('soil') || 
             description.includes('mineral') || 
             description.includes('leather') || 
             description.includes('tobacco'))) {
            matchScore += 3;
        }
        
        if (flavorSpicy && 
            (description.includes('spice') || 
             description.includes('pepper') || 
             description.includes('cinnamon') || 
             description.includes('clove'))) {
            matchScore += 3;
        }
        
        if (flavorFloral && 
            (description.includes('floral') || 
             description.includes('flower') || 
             description.includes('blossom') || 
             description.includes('rose') || 
             description.includes('violet'))) {
            matchScore += 3;
        }
        
        // Add a slight random factor for variety
        matchScore += Math.random() * 2;
        
        // Cap at 100
        matchScore = Math.min(Math.round(matchScore), 100);
        
        return { ...wine, matchScore };
    });
    
    // Sort by match score
    matchedWines.sort((a, b) => b.matchScore - a.matchScore);
    
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
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <span>Your Match</span>
                    <span class="badge bg-white text-primary">${wine.matchScore}% Match</span>
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
    
    // Add a "Why these recommendations" section
    const explanationRow = document.createElement('div');
    explanationRow.className = 'row mt-4';
    explanationRow.innerHTML = `
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title h5">Why We Recommended These Wines</h4>
                    <p>Based on your preferences, we selected wines that:</p>
                    <ul>
                        ${flavorFruity ? '<li>Have fruity flavor profiles</li>' : ''}
                        ${flavorEarthy ? '<li>Feature earthy or mineral notes</li>' : ''}
                        ${flavorSpicy ? '<li>Include spicy characteristics</li>' : ''}
                        ${flavorFloral ? '<li>Contain floral aromas</li>' : ''}
                        <li>Match your ${pricePreference} price range</li>
                        ${typePreference !== 'any' ? `<li>Are ${typePreference} wines</li>` : ''}
                        ${foodPreference !== 'none' ? `<li>Pair well with ${foodPreference}</li>` : ''}
                        <li>Have high quality ratings</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    recommendationsContainer.appendChild(explanationRow);
}
