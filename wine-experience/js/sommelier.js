// Enhanced Sommelier JavaScript

// DOM Elements
const sommelierProgressEl = document.getElementById('sommelier-progress');
const step1Form = document.getElementById('step-form-1');
const step2Form = document.getElementById('step-form-2');
const step1Next = document.getElementById('step-1-next');
const step2Back = document.getElementById('step-2-back');
const step2Next = document.getElementById('step-2-next');
const recommendationsContainer = document.getElementById('recommendations-container');
const recommendationsDiv = document.getElementById('recommendations');
const restartButton = document.getElementById('restart-sommelier');
const recommendationReasons = document.getElementById('recommendation-reasons');
const recommendationExplanation = document.getElementById('recommendation-explanation');

// Step elements
const step1El = document.getElementById('step-1');
const step2El = document.getElementById('step-2');
const step3El = document.getElementById('step-3');

// Variables
let allWines = [];
let userPreferences = {
    flavors: {
        fruity: false,
        earthy: false,
        spicy: false,
        floral: false
    },
    priceRange: 'moderate',
    wineType: 'any',
    foodPairing: 'none',
    occasion: 'casual'
};

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
        recommendationsDiv.innerHTML = `
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

// Set up event listeners for the UI
function setupEventListeners() {
    // Step 1 (Flavors) preference selection
    const preferenceOptions = document.querySelectorAll('.preference-option');
    preferenceOptions.forEach(option => {
        option.addEventListener('click', togglePreferenceOption);
    });
    
    // Step Navigation
    step1Next.addEventListener('click', goToStep2);
    step2Back.addEventListener('click', goToStep1);
    step2Next.addEventListener('click', submitPreferences);
    restartButton.addEventListener('click', resetSommelier);
}

// Toggle flavor preference selection
function togglePreferenceOption(event) {
    const option = event.currentTarget;
    const preference = option.getAttribute('data-preference');
    
    option.classList.toggle('selected');
    userPreferences.flavors[preference] = option.classList.contains('selected');
}

// Go to step 2
function goToStep2() {
    // Update progress indicator
    step1El.classList.remove('active');
    step1El.classList.add('completed');
    step2El.classList.add('active');
    
    // Show step 2 form, hide step 1
    step1Form.classList.add('d-none');
    step2Form.classList.remove('d-none');
}

// Go back to step 1
function goToStep1() {
    // Update progress indicator
    step2El.classList.remove('active');
    step1El.classList.remove('completed');
    step1El.classList.add('active');
    
    // Show step 1 form, hide step 2
    step2Form.classList.add('d-none');
    step1Form.classList.remove('d-none');
}

// Submit preferences and show recommendations
function submitPreferences() {
    // Gather form data
    userPreferences.priceRange = document.getElementById('price-preference').value;
    userPreferences.wineType = document.getElementById('type-preference').value;
    userPreferences.foodPairing = document.getElementById('food-preference').value;
    userPreferences.occasion = document.getElementById('occasion-preference').value;
    
    // Update progress indicator
    step2El.classList.remove('active');
    step2El.classList.add('completed');
    step3El.classList.add('active');
    
    // Hide step forms, show recommendations
    document.getElementById('step-form-container').classList.add('d-none');
    recommendationsContainer.classList.remove('d-none');
    
    // Generate recommendations
    generateRecommendations();
}

// Reset the sommelier to start over
function resetSommelier() {
    // Reset progress indicator
    step1El.classList.add('active');
    step1El.classList.remove('completed');
    step2El.classList.remove('active');
    step2El.classList.remove('completed');
    step3El.classList.remove('active');
    
    // Reset form display
    recommendationsContainer.classList.add('d-none');
    document.getElementById('step-form-container').classList.remove('d-none');
    step1Form.classList.remove('d-none');
    step2Form.classList.add('d-none');
    
    // Reset preference selections
    document.querySelectorAll('.preference-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset userPreferences
    userPreferences = {
        flavors: {
            fruity: false,
            earthy: false,
            spicy: false,
            floral: false
        },
        priceRange: 'moderate',
        wineType: 'any',
        foodPairing: 'none',
        occasion: 'casual'
    };
    
    // Reset form values
    document.getElementById('price-preference').value = 'moderate';
    document.getElementById('type-preference').value = 'any';
    document.getElementById('food-preference').value = 'none';
    document.getElementById('occasion-preference').value = 'casual';
}

// Generate wine recommendations
function generateRecommendations() {
    // Filter wines based on preferences
    let matchedWines = allWines.filter(wine => {
        // Price filter
        const price = wine.prix || wine.price || 0;
        if (userPreferences.priceRange === 'budget' && price > 20) return false;
        if (userPreferences.priceRange === 'moderate' && (price < 20 || price > 50)) return false;
        if (userPreferences.priceRange === 'premium' && (price < 50 || price > 100)) return false;
        if (userPreferences.priceRange === 'luxury' && price < 100) return false;
        
        // Type filter
        const variety = (wine.variété || wine.varietal || '').toLowerCase();
        if (userPreferences.wineType !== 'any') {
            if (userPreferences.wineType === 'red' && 
                !(variety.includes('rouge') || 
                  variety.includes('red') || 
                  variety.includes('noir') || 
                  variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('syrah') || 
                  variety.includes('grenache'))) {
                return false;
            }
            if (userPreferences.wineType === 'white' && 
                !(variety.includes('blanc') || 
                  variety.includes('white') || 
                  variety.includes('chardonnay') || 
                  variety.includes('sauvignon') || 
                  variety.includes('riesling'))) {
                return false;
            }
            if (userPreferences.wineType === 'rose' && 
                !(variety.includes('rosé') || 
                  variety.includes('rose'))) {
                return false;
            }
            if (userPreferences.wineType === 'sparkling' && 
                !(variety.includes('sparkling') || 
                  variety.includes('champagne') || 
                  variety.includes('cava') || 
                  variety.includes('prosecco'))) {
                return false;
            }
        }
        
        // Food pairing filter (basic)
        if (userPreferences.foodPairing !== 'none') {
            const description = (wine.description || '').toLowerCase();
            
            if (userPreferences.foodPairing === 'beef' && 
                !(variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('syrah') || 
                  variety.includes('malbec'))) {
                return false;
            }
            if (userPreferences.foodPairing === 'chicken' && 
                !(variety.includes('chardonnay') || 
                  variety.includes('pinot noir') || 
                  variety.includes('zinfandel'))) {
                return false;
            }
            if (userPreferences.foodPairing === 'fish' && 
                !(variety.includes('sauvignon blanc') || 
                  variety.includes('pinot grigio') || 
                  variety.includes('albariño') || 
                  variety.includes('chablis'))) {
                return false;
            }
            if (userPreferences.foodPairing === 'pasta' && 
                !(variety.includes('chianti') || 
                  variety.includes('barbera') || 
                  variety.includes('sangiovese'))) {
                return false;
            }
            if (userPreferences.foodPairing === 'cheese' && 
                !(variety.includes('chardonnay') || 
                  variety.includes('cabernet') || 
                  variety.includes('merlot') || 
                  variety.includes('port'))) {
                return false;
            }
            if (userPreferences.foodPairing === 'dessert' && 
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
        
        if (userPreferences.flavors.fruity && 
            (description.includes('fruit') || 
             description.includes('berry') || 
             description.includes('cherry') || 
             description.includes('apple') || 
             description.includes('citrus'))) {
            score += 2;
        }
        
        if (userPreferences.flavors.earthy && 
            (description.includes('earth') || 
             description.includes('soil') || 
             description.includes('mineral') || 
             description.includes('leather') || 
             description.includes('tobacco'))) {
            score += 2;
        }
        
        if (userPreferences.flavors.spicy && 
            (description.includes('spice') || 
             description.includes('pepper') || 
             description.includes('cinnamon') || 
             description.includes('clove'))) {
            score += 2;
        }
        
        if (userPreferences.flavors.floral && 
            (description.includes('floral') || 
             description.includes('flower') || 
             description.includes('blossom') || 
             description.includes('rose') || 
             description.includes('violet'))) {
            score += 2;
        }
        
        // Only consider high-rated wines
        if ((wine.points || 0) < 85) {
            return false;
        }
        
        // Only include wines with some flavor match
        return score > 0;
    });

    // Calculate match scores
    matchedWines = matchedWines.map(wine => {
        // Base score is the wine's rating
        let matchScore = wine.points || 85;
        
        // Adjust score based on preferences
        const description = (wine.description || '').toLowerCase();
        
        // Flavor preference adjustments
        if (userPreferences.flavors.fruity && 
            (description.includes('fruit') || 
             description.includes('berry') || 
             description.includes('cherry') || 
             description.includes('apple') || 
             description.includes('citrus'))) {
            matchScore += 3;
        }
        
        if (userPreferences.flavors.earthy && 
            (description.includes('earth') || 
             description.includes('soil') || 
             description.includes('mineral') || 
             description.includes('leather') || 
             description.includes('tobacco'))) {
            matchScore += 3;
        }
        
        if (userPreferences.flavors.spicy && 
            (description.includes('spice') || 
             description.includes('pepper') || 
             description.includes('cinnamon') || 
             description.includes('clove'))) {
            matchScore += 3;
        }
        
        if (userPreferences.flavors.floral && 
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
    displayRecommendations(matchedWines);
}

// Display wine recommendations
function displayRecommendations(wines) {
    recommendationsDiv.innerHTML = '';
    
    if (wines.length === 0) {
        recommendationsDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No wines match your preferences. Try adjusting your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    // Create wine recommendation cards
    wines.forEach(wine => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        // Determine wine type and visuals
        const wineType = wine.variété || wine.varietal || '';
        let typeClass = 'wine-type-red';
        let iconClass = 'wine-icon-red';
        
        if (wineType.toLowerCase().includes('blanc') || 
            wineType.toLowerCase().includes('white') || 
            wineType.toLowerCase().includes('chardonnay') || 
            wineType.toLowerCase().includes('sauvignon')) {
            typeClass = 'wine-type-white';
            iconClass = 'wine-icon-white';
        } else if (wineType.toLowerCase().includes('sparkling') || 
                wineType.toLowerCase().includes('champagne')) {
            typeClass = 'wine-type-sparkling';
            iconClass = 'wine-icon-sparkling';
        } else if (wineType.toLowerCase().includes('rosé') || 
                wineType.toLowerCase().includes('rose')) {
            typeClass = 'wine-type-rose';
            iconClass = 'wine-icon-rose';
        }
        
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <span>Perfect Match</span>
                    <span class="match-percentage">${wine.matchScore}% Match</span>
                </div>
                <div class="wine-type-icon ${typeClass}">
                    <div class="wine-icon-container">
                        <div class="wine-icon ${iconClass}"></div>
                        <div class="mt-2">${wineType}</div>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="card-title h5">${wine.title || 'Unnamed Wine'}</h3>
                    <p class="card-subtitle text-muted mb-2">${wine.winery || 'Unknown Winery'}</p>
                    <div class="card-text small mb-3" style="max-height: 100px; overflow-y: auto;">
                        ${wine.description || 'No description available.'}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge ${typeClass === 'wine-type-red' ? 'badge-red' : 
                                typeClass === 'wine-type-white' ? 'badge-white' : 
                                typeClass === 'wine-type-sparkling' ? 'badge-sparkling' : 'badge-rose'}">
                            ${wineType}
                        </span>
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
        
        recommendationsDiv.appendChild(col);
    });
    
    // Display recommendation explanation
    updateRecommendationExplanation();
}

// Update recommendation explanation based on user preferences
function updateRecommendationExplanation() {
    recommendationReasons.innerHTML = '';
    
    // Add explanation points based on user preferences
    if (userPreferences.flavors.fruity) {
        addRecommendationReason('Have fruity flavor profiles (berries, citrus)');
    }
    
    if (userPreferences.flavors.earthy) {
        addRecommendationReason('Feature earthy or mineral notes');
    }
    
    if (userPreferences.flavors.spicy) {
        addRecommendationReason('Include spicy characteristics');
    }
    
    if (userPreferences.flavors.floral) {
        addRecommendationReason('Contain floral aromas');
    }
    
    // Price range
    let priceText = '';
    switch (userPreferences.priceRange) {
        case 'budget':
            priceText = 'budget-friendly (under $20)';
            break;
        case 'moderate':
            priceText = 'moderate ($20-$50)';
            break;
        case 'premium':
            priceText = 'premium ($50-$100)';
            break;
        case 'luxury':
            priceText = 'luxury ($100+)';
            break;
    }
    addRecommendationReason(`Match your ${priceText} price range`);
    
    // Wine type
    if (userPreferences.wineType !== 'any') {
        addRecommendationReason(`Are ${userPreferences.wineType} wines`);
    }
    
    // Food pairing
    if (userPreferences.foodPairing !== 'none') {
        addRecommendationReason(`Pair well with ${userPreferences.foodPairing}`);
    }
    
    // Occasion
    const occasionText = {
        casual: 'a casual dinner',
        celebration: 'a celebration',
        gift: 'giving as a gift',
        collection: 'adding to your collection'
    };
    addRecommendationReason(`Are suitable for ${occasionText[userPreferences.occasion]}`);
    
    // Always add this point
    addRecommendationReason('Have high quality ratings from wine experts');
}

// Add a reason to the recommendation explanation list
function addRecommendationReason(reason) {
    const li = document.createElement('li');
    li.textContent = reason;
    recommendationReasons.appendChild(li);
}