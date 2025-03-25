/**
 * Enhanced AI Sommelier
 * 
 * This script powers the interactive wine recommendation system that analyzes
 * user preferences and suggests personalized wine selections based on taste
 * profile, occasion, food pairings, and price range.
 */

// DOM Elements - Main UI Components
const sommelierProgressEl = document.getElementById('sommelier-progress');
const step1Form = document.getElementById('step-form-1');
const step2Form = document.getElementById('step-form-2');
const recommendationsContainer = document.getElementById('recommendations-container');
const recommendationsDiv = document.getElementById('recommendations');
const recommendationReasons = document.getElementById('recommendation-reasons');
const recommendationExplanation = document.getElementById('recommendation-explanation');
const restartButton = document.getElementById('restart-sommelier');

// Step navigation buttons
const step1Next = document.getElementById('step-1-next');
const step2Back = document.getElementById('step-2-back');
const step2Next = document.getElementById('step-2-next');

// Step elements for progress tracking
const step1El = document.getElementById('step-1');
const step2El = document.getElementById('step-2');
const step3El = document.getElementById('step-3');

// Variables
let allWines = [];
let loading = false;
let userPreferences = {
    flavors: {
        fruity: false,
        earthy: false,
        spicy: false,
        floral: false,
        tannic: false,
        acidic: false,
        oaky: false,
        smooth: false
    },
    priceRange: 'moderate',
    wineType: 'any',
    foodPairing: 'none',
    occasion: 'casual',
    ageability: 'any',
    bodyPreference: 'medium'
};

// Flavor descriptions for tooltips
const flavorDescriptions = {
    fruity: "Wines with pronounced fruit flavors like berries, citrus, or tropical fruits",
    earthy: "Wines with notes of soil, mushroom, or forest floor",
    spicy: "Wines with peppery, herbal, or warm spice notes",
    floral: "Wines with delicate floral aromas like violet, rose, or blossom",
    tannic: "Wines with that mouth-drying sensation, common in bold reds",
    acidic: "Wines with bright, refreshing tartness",
    oaky: "Wines with vanilla, toast, or woody flavors from oak aging",
    smooth: "Wines with a velvety, round texture and balanced profile"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the application by loading data and setting up event listeners
 */
async function init() {
    try {
        // Show loading state
        toggleLoading(true);
        
        // Load wine data
        await loadWineData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
        
        // Hide loading state
        toggleLoading(false);
        
    } catch (error) {
        console.error('Error initializing sommelier:', error);
        
        // Display error message
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> 
                        Error loading wine data. Please try refreshing the page.
                    </div>
                </div>
            `;
        }
        
        toggleLoading(false);
    }
}

/**
 * Toggle loading state
 * @param {boolean} isLoading - Whether the application is loading
 */
function toggleLoading(isLoading) {
    loading = isLoading;
    
    // Update UI elements based on loading state
    if (isLoading) {
        if (step1Form) step1Form.classList.add('loading');
        if (step2Form) step2Form.classList.add('loading');
        if (recommendationsContainer) recommendationsContainer.classList.add('loading');
        
        // Disable buttons
        if (step1Next) step1Next.disabled = true;
        if (step2Back) step2Back.disabled = true;
        if (step2Next) step2Next.disabled = true;
        if (restartButton) restartButton.disabled = true;
        
        // Show loader if not already present
        if (!document.querySelector('.sommelier-loader')) {
            const loader = document.createElement('div');
            loader.className = 'sommelier-loader';
            loader.innerHTML = `
                <div class="spinner">
                    <div class="double-bounce1"></div>
                    <div class="double-bounce2"></div>
                </div>
                <p>Analyzing wine data...</p>
            `;
            
            if (step1Form) {
                step1Form.appendChild(loader);
            } else if (step2Form) {
                step2Form.appendChild(loader);
            } else if (recommendationsContainer) {
                recommendationsContainer.appendChild(loader);
            }
        }
    } else {
        // Remove loading state
        if (step1Form) step1Form.classList.remove('loading');
        if (step2Form) step2Form.classList.remove('loading');
        if (recommendationsContainer) recommendationsContainer.classList.remove('loading');
        
        // Enable buttons
        if (step1Next) step1Next.disabled = false;
        if (step2Back) step2Back.disabled = false;
        if (step2Next) step2Next.disabled = false;
        if (restartButton) restartButton.disabled = false;
        
        // Remove loaders
        const loaders = document.querySelectorAll('.sommelier-loader');
        loaders.forEach(loader => loader.remove());
    }
}

/**
 * Load wine data from the server
 * @returns {Promise<Array>} - The loaded wine data
 */
async function loadWineData() {
    try {
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error(`Failed to load wine data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // If the response is not an array, convert it
        allWines = Array.isArray(data) ? data : [data];
        
        console.log(`Loaded ${allWines.length} wines`);
        
        if (allWines.length === 0) {
            throw new Error('No wine data found');
        }
        
        return allWines;
    } catch (error) {
        console.error('Error loading wine data:', error);
        throw error;
    }
}

/**
 * Set up event listeners for the UI components
 */
function setupEventListeners() {
    // Step 1 (Flavors) preference selection
    const preferenceOptions = document.querySelectorAll('.preference-option');
    preferenceOptions.forEach(option => {
        option.addEventListener('click', togglePreferenceOption);
        
        // Add flavor descriptions as tooltips
        const preference = option.getAttribute('data-preference');
        if (preference && flavorDescriptions[preference]) {
            option.setAttribute('title', flavorDescriptions[preference]);
            option.setAttribute('data-bs-toggle', 'tooltip');
            option.setAttribute('data-bs-placement', 'top');
        }
    });
    
    // Step Navigation
    if (step1Next) step1Next.addEventListener('click', goToStep2);
    if (step2Back) step2Back.addEventListener('click', goToStep1);
    if (step2Next) step2Next.addEventListener('click', submitPreferences);
    if (restartButton) restartButton.addEventListener('click', resetSommelier);
    
    // Add input change listeners for form fields
    const formInputs = document.querySelectorAll('#step-form-2 select, #step-form-2 input');
    formInputs.forEach(input => {
        input.addEventListener('change', updatePreferenceFromInput);
    });
    
    // Special handling for range sliders if they exist
    const rangeSliders = document.querySelectorAll('input[type="range"]');
    rangeSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}-value`);
        if (output) {
            // Update output value when slider changes
            slider.addEventListener('input', () => {
                updateRangeSliderOutput(slider, output);
            });
            
            // Initialize output value
            updateRangeSliderOutput(slider, output);
        }
    });
}

/**
 * Update the displayed value for a range slider
 * @param {HTMLElement} slider - The range slider element
 * @param {HTMLElement} output - The output element to update
 */
function updateRangeSliderOutput(slider, output) {
    // Get the value based on the slider ID
    let displayValue = slider.value;
    
    if (slider.id === 'body-preference') {
        // Convert numeric value to text for body preference
        const bodyValues = ['Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full'];
        displayValue = bodyValues[slider.value - 1] || 'Medium';
    }
    
    // Update the output element
    output.textContent = displayValue;
}

/**
 * Toggle a flavor preference option selection
 * @param {Event} event - The click event
 */
function togglePreferenceOption(event) {
    if (loading) return;
    
    const option = event.currentTarget;
    const preference = option.getAttribute('data-preference');
    
    if (!preference || !userPreferences.flavors.hasOwnProperty(preference)) return;
    
    // Toggle selection state
    option.classList.toggle('selected');
    userPreferences.flavors[preference] = option.classList.contains('selected');
    
    // Enable next button only if at least one flavor is selected
    if (step1Next) {
        const anyFlavorSelected = Object.values(userPreferences.flavors).some(value => value);
        step1Next.disabled = !anyFlavorSelected;
        
        if (anyFlavorSelected) {
            step1Next.classList.add('ready');
        } else {
            step1Next.classList.remove('ready');
        }
    }
}

/**
 * Update user preferences based on form input changes
 * @param {Event} event - The change event
 */
function updatePreferenceFromInput(event) {
    const input = event.target;
    const preferenceName = input.id.replace('-preference', '');
    
    if (userPreferences.hasOwnProperty(preferenceName)) {
        userPreferences[preferenceName] = input.value;
    }
}

/**
 * Navigate to step 2
 */
function goToStep2() {
    if (loading) return;
    
    // Validate that at least one flavor is selected
    const anyFlavorSelected = Object.values(userPreferences.flavors).some(value => value);
    if (!anyFlavorSelected) {
        showValidationMessage("Please select at least one flavor preference");
        return;
    }
    
    // Update progress indicator with animation
    step1El.classList.add('transitioning');
    setTimeout(() => {
        step1El.classList.remove('active');
        step1El.classList.add('completed');
        step1El.classList.remove('transitioning');
        step2El.classList.add('active');
    }, 300);
    
    // Show step 2 form, hide step 1
    step1Form.classList.add('slide-out');
    setTimeout(() => {
        step1Form.classList.add('d-none');
        step1Form.classList.remove('slide-out');
        step2Form.classList.remove('d-none');
        step2Form.classList.add('slide-in');
        
        setTimeout(() => {
            step2Form.classList.remove('slide-in');
        }, 300);
    }, 300);
}

/**
 * Navigate back to step 1
 */
function goToStep1() {
    if (loading) return;
    
    // Update progress indicator with animation
    step2El.classList.add('transitioning');
    setTimeout(() => {
        step2El.classList.remove('active');
        step1El.classList.remove('completed');
        step1El.classList.add('active');
        step2El.classList.remove('transitioning');
    }, 300);
    
    // Show step 1 form, hide step 2
    step2Form.classList.add('slide-out-right');
    setTimeout(() => {
        step2Form.classList.add('d-none');
        step2Form.classList.remove('slide-out-right');
        step1Form.classList.remove('d-none');
        step1Form.classList.add('slide-in-left');
        
        setTimeout(() => {
            step1Form.classList.remove('slide-in-left');
        }, 300);
    }, 300);
}

/**
 * Display a validation message
 * @param {string} message - The validation message to display
 */
function showValidationMessage(message) {
    const existingAlert = document.querySelector('.validation-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = 'validation-alert';
    alert.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Add to the appropriate container
    if (step1Form && !step1Form.classList.contains('d-none')) {
        step1Form.prepend(alert);
    } else if (step2Form && !step2Form.classList.contains('d-none')) {
        step2Form.prepend(alert);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.querySelector('.alert').classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Submit preferences and generate recommendations
 */
function submitPreferences() {
    if (loading) return;
    
    // Gather form data
    const priceRange = document.getElementById('price-preference');
    const wineType = document.getElementById('type-preference');
    const foodPairing = document.getElementById('food-preference');
    const occasion = document.getElementById('occasion-preference');
    const bodyPreference = document.getElementById('body-preference');
    const ageability = document.getElementById('ageability-preference');
    
    if (priceRange) userPreferences.priceRange = priceRange.value;
    if (wineType) userPreferences.wineType = wineType.value;
    if (foodPairing) userPreferences.foodPairing = foodPairing.value;
    if (occasion) userPreferences.occasion = occasion.value;
    if (bodyPreference) userPreferences.bodyPreference = bodyPreference.value;
    if (ageability) userPreferences.ageability = ageability.value;
    
    // Update progress indicator with animation
    step2El.classList.add('transitioning');
    setTimeout(() => {
        step2El.classList.remove('active');
        step2El.classList.add('completed');
        step2El.classList.remove('transitioning');
        step3El.classList.add('active');
    }, 300);
    
    // Hide step forms, show recommendations with animation
    const formContainer = document.getElementById('step-form-container');
    if (formContainer) {
        formContainer.classList.add('slide-out');
        setTimeout(() => {
            formContainer.classList.add('d-none');
            formContainer.classList.remove('slide-out');
            
            if (recommendationsContainer) {
                recommendationsContainer.classList.remove('d-none');
                recommendationsContainer.classList.add('slide-in');
                
                setTimeout(() => {
                    recommendationsContainer.classList.remove('slide-in');
                }, 300);
            }
            
            // Generate recommendations with a slight delay for animation
            setTimeout(() => {
                generateRecommendations();
            }, 300);
        }, 300);
    } else {
        // Fallback if animation container is missing
        generateRecommendations();
    }
}

/**
 * Reset the sommelier to start over
 */
function resetSommelier() {
    if (loading) return;
    
    // Reset progress indicator with animation
    step3El.classList.add('transitioning');
    setTimeout(() => {
        step1El.classList.add('active');
        step1El.classList.remove('completed');
        step2El.classList.remove('active');
        step2El.classList.remove('completed');
        step3El.classList.remove('active');
        step3El.classList.remove('transitioning');
    }, 300);
    
    // Reset form display with animation
    recommendationsContainer.classList.add('slide-out');
    setTimeout(() => {
        recommendationsContainer.classList.add('d-none');
        recommendationsContainer.classList.remove('slide-out');
        
        const formContainer = document.getElementById('step-form-container');
        if (formContainer) {
            formContainer.classList.remove('d-none');
            formContainer.classList.add('slide-in');
            
            setTimeout(() => {
                formContainer.classList.remove('slide-in');
            }, 300);
        }
        
        step1Form.classList.remove('d-none');
        step2Form.classList.add('d-none');
    }, 300);
    
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
            floral: false,
            tannic: false,
            acidic: false,
            oaky: false,
            smooth: false
        },
        priceRange: 'moderate',
        wineType: 'any',
        foodPairing: 'none',
        occasion: 'casual',
        ageability: 'any',
        bodyPreference: 'medium'
    };
    
    // Reset form values
    if (document.getElementById('price-preference')) {
        document.getElementById('price-preference').value = 'moderate';
    }
    
    if (document.getElementById('type-preference')) {
        document.getElementById('type-preference').value = 'any';
    }
    
    if (document.getElementById('food-preference')) {
        document.getElementById('food-preference').value = 'none';
    }
    
    if (document.getElementById('occasion-preference')) {
        document.getElementById('occasion-preference').value = 'casual';
    }
    
    if (document.getElementById('body-preference')) {
        document.getElementById('body-preference').value = '3';
        const output = document.getElementById('body-preference-value');
        if (output) output.textContent = 'Medium';
    }
    
    if (document.getElementById('ageability-preference')) {
        document.getElementById('ageability-preference').value = 'any';
    }
    
    // Disable next button
    if (step1Next) {
        step1Next.disabled = true;
        step1Next.classList.remove('ready');
    }
}

/**
 * Generate wine recommendations based on user preferences
 */
function generateRecommendations() {
    try {
        // Show loading state
        toggleLoading(true);
        
        // Apply all filters to get matched wines
        let matchedWines = allWines.filter(wine => {
            if (!wine) return false;
            
            // Price filter
            const price = parseFloat(wine.prix || wine.price || 0);
            if (userPreferences.priceRange === 'budget' && price > 25) return false;
            if (userPreferences.priceRange === 'moderate' && (price < 20 || price > 60)) return false;
            if (userPreferences.priceRange === 'premium' && (price < 50 || price > 120)) return false;
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
                      variety.includes('zinfandel') ||
                      variety.includes('malbec') ||
                      variety.includes('grenache') || 
                      variety.includes('sangiovese'))) {
                    return false;
                }
                
                if (userPreferences.wineType === 'white' && 
                    !(variety.includes('blanc') || 
                      variety.includes('white') || 
                      variety.includes('chardonnay') || 
                      variety.includes('sauvignon') || 
                      variety.includes('riesling') ||
                      variety.includes('pinot gris') ||
                      variety.includes('gewurztraminer') ||
                      variety.includes('chenin') ||
                      variety.includes('semillon'))) {
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
                      variety.includes('prosecco') ||
                      variety.includes('cremant') ||
                      variety.includes('lambrusco'))) {
                    return false;
                }
                
                if (userPreferences.wineType === 'dessert' && 
                    !(variety.includes('port') ||
                      variety.includes('sauternes') ||
                      variety.includes('tokaji') ||
                      variety.includes('ice wine') ||
                      variety.includes('late harvest') ||
                      variety.includes('moscato') ||
                      wine.description?.toLowerCase().includes('sweet'))) {
                    return false;
                }
            }
            
            // Food pairing filter
            if (userPreferences.foodPairing !== 'none') {
                const description = (wine.description || '').toLowerCase();
                
                // Define wine varieties that pair well with each food type
                const pairingMap = {
                    'beef': ['cabernet sauvignon', 'merlot', 'syrah', 'malbec', 'bordeaux', 'barolo', 'chianti'],
                    'chicken': ['chardonnay', 'pinot noir', 'sauvignon blanc', 'riesling'],
                    'fish': ['sauvignon blanc', 'pinot grigio', 'albariño', 'chablis', 'vermentino'],
                    'pasta': ['chianti', 'barbera', 'sangiovese', 'pinot noir', 'nebbiolo'],
                    'cheese': ['chardonnay', 'cabernet', 'merlot', 'port', 'champagne'],
                    'dessert': ['port', 'sauternes', 'riesling', 'moscato', 'ice wine'],
                    'spicy': ['riesling', 'gewurztraminer', 'zinfandel', 'syrah'],
                    'vegetarian': ['pinot noir', 'beaujolais', 'sauvignon blanc', 'grüner veltliner'],
                    'salad': ['sauvignon blanc', 'pinot grigio', 'verdejo', 'albariño'],
                }
                
                // Check if this wine's variety matches the preferred food pairing
                const pairs = pairingMap[userPreferences.foodPairing] || [];
                let pairsWithFood = false;
                
                // Check variety match
                for (const pairingVariety of pairs) {
                    if (variety.includes(pairingVariety)) {
                        pairsWithFood = true;
                        break;
                    }
                }
                
                // Check description for food pairing mentions
                if (!pairsWithFood) {
                    const foodTerms = {
                        'beef': ['beef', 'steak', 'red meat'],
                        'chicken': ['chicken', 'poultry', 'fowl'],
                        'fish': ['fish', 'seafood', 'shellfish'],
                        'pasta': ['pasta', 'italian', 'tomato sauce'],
                        'cheese': ['cheese', 'creamy', 'dairy'],
                        'dessert': ['dessert', 'sweet', 'chocolate'],
                        'spicy': ['spicy', 'spice', 'hot'],
                        'vegetarian': ['vegetable', 'vegetarian', 'herb'],
                        'salad': ['salad', 'fresh', 'light']
                    };
                    
                    const terms = foodTerms[userPreferences.foodPairing] || [];
                    for (const term of terms) {
                        if (description.includes(term)) {
                            pairsWithFood = true;
                            break;
                        }
                    }
                }
                
                if (!pairsWithFood) return false;
            }
            
            // Body preference filter if applicable
            if (userPreferences.bodyPreference && userPreferences.bodyPreference !== '3') { // 3 is medium (default)
                const bodyValue = parseInt(userPreferences.bodyPreference);
                const description = (wine.description || '').toLowerCase();
                
                // Light-bodied indicators
                const lightBodyTerms = ['light', 'delicate', 'elegant', 'crisp'];
                
                // Full-bodied indicators
                const fullBodyTerms = ['full', 'bold', 'robust', 'powerful', 'rich', 'intense'];
                
                // Determine if wine matches body preference
                if (bodyValue <= 2) { // Light to medium-light
                    // For lighter wines
                    let hasLightIndicator = false;
                    
                    for (const term of lightBodyTerms) {
                        if (description.includes(term)) {
                            hasLightIndicator = true;
                            break;
                        }
                    }
                    
                    // Exclude wines with full-body indicators
                    for (const term of fullBodyTerms) {
                        if (description.includes(term)) {
                            return false;
                        }
                    }
                    
                    // For very light preference (1), require explicit light body indicator
                    if (bodyValue === 1 && !hasLightIndicator) {
                        return false;
                    }
                    
                } else if (bodyValue >= 4) { // Medium-full to full
                    // For fuller wines
                    let hasFullIndicator = false;
                    
                    for (const term of fullBodyTerms) {
                        if (description.includes(term)) {
                            hasFullIndicator = true;
                            break;
                        }
                    }
                    
                    // Exclude wines with light-body indicators
                    for (const term of lightBodyTerms) {
                        if (description.includes(term)) {
                            return false;
                        }
                    }
                    
                    // For very full preference (5), require explicit full body indicator
                    if (bodyValue === 5 && !hasFullIndicator) {
                        return false;
                    }
                }
            }
            
            // Ageability filter if applicable
            if (userPreferences.ageability && userPreferences.ageability !== 'any') {
                const description = (wine.description || '').toLowerCase();
                
                if (userPreferences.ageability === 'now') {
                    // Filter for wines ready to drink now
                    if (description.includes('age') || 
                        description.includes('cellar') || 
                        description.includes('years') ||
                        description.includes('develop')) {
                        return false;
                    }
                } else if (userPreferences.ageability === 'aging') {
                    // Filter for age-worthy wines
                    const ageTerms = ['age', 'cellar', 'aging', 'develop', 'potential', 'structure', 'tannin'];
                    let hasAgingPotential = false;
                    
                    for (const term of ageTerms) {
                        if (description.includes(term)) {
                            hasAgingPotential = true;
                            break;
                        }
                    }
                    
                    if (!hasAgingPotential) {
                        return false;
                    }
                }
            }
            
            // Flavor preference scoring
            const description = (wine.description || '').toLowerCase();
            let flavorMatch = false;
            
            // Check if any selected flavor preference matches the wine description
            for (const [flavor, isSelected] of Object.entries(userPreferences.flavors)) {
                if (!isSelected) continue;
                
                const flavorTerms = getFlavorTerms(flavor);
                for (const term of flavorTerms) {
                    if (description.includes(term)) {
                        flavorMatch = true;
                        break;
                    }
                }
                
                if (flavorMatch) break;
            }
            
            // Only include wines that match at least one flavor preference
            if (!flavorMatch && Object.values(userPreferences.flavors).some(v => v)) {
                return false;
            }
            
            // Only consider wines with ratings
            if ((wine.points || 0) < 85) {
                return false;
            }
            
            return true;
        });
        
        // Calculate match scores
        matchedWines = matchedWines.map(wine => {
            // Base score is the wine's rating
            let matchScore = wine.points || 85;
            
            // Adjust score based on preferences
            const description = (wine.description || '').toLowerCase();
            
            // Flavor preference adjustments
            let flavorMatches = 0;
            let totalSelectedFlavors = 0;
            
            for (const [flavor, isSelected] of Object.entries(userPreferences.flavors)) {
                if (!isSelected) continue;
                totalSelectedFlavors++;
                
                const flavorTerms = getFlavorTerms(flavor);
                for (const term of flavorTerms) {
                    if (description.includes(term)) {
                        flavorMatches++;
                        matchScore += 2;
                        break;
                    }
                }
            }
            
            // Calculate flavor match percentage
            const flavorMatchPercentage = totalSelectedFlavors > 0 
                ? Math.min(100, Math.round((flavorMatches / totalSelectedFlavors) * 100))
                : 0;
            
            // Adjust for price range match
            const price = parseFloat(wine.prix || wine.price || 0);
            if (userPreferences.priceRange === 'budget' && price <= 25) {
                matchScore += 3;
            } else if (userPreferences.priceRange === 'moderate' && price >= 20 && price <= 60) {
                matchScore += 3;
            } else if (userPreferences.priceRange === 'premium' && price >= 50 && price <= 120) {
                matchScore += 3;
            } else if (userPreferences.priceRange === 'luxury' && price >= 100) {
                matchScore += 3;
            }
            
            // Adjust for wine type match
            const variety = (wine.variété || wine.varietal || '').toLowerCase();
            if (userPreferences.wineType !== 'any') {
                if ((userPreferences.wineType === 'red' && 
                    (variety.includes('rouge') || variety.includes('red') || 
                     variety.includes('noir') || variety.includes('cabernet') || 
                     variety.includes('merlot'))) ||
                    (userPreferences.wineType === 'white' && 
                    (variety.includes('blanc') || variety.includes('white') || 
                     variety.includes('chardonnay') || variety.includes('sauvignon'))) ||
                    (userPreferences.wineType === 'rose' && 
                    (variety.includes('rosé') || variety.includes('rose'))) ||
                    (userPreferences.wineType === 'sparkling' && 
                    (variety.includes('sparkling') || variety.includes('champagne'))) ||
                    (userPreferences.wineType === 'dessert' && 
                    (variety.includes('port') || variety.includes('sauternes')))) {
                    matchScore += 5;
                }
            }
            
            // Add a slight random factor for variety
            matchScore += Math.random() * 2;
            
            // Cap at 100
            matchScore = Math.min(Math.round(matchScore), 100);
            
            return { 
                ...wine, 
                matchScore,
                flavorMatchPercentage
            };
        });
        
        // Sort by match score
        matchedWines.sort((a, b) => b.matchScore - a.matchScore);
        
        // Take top wines
        matchedWines = matchedWines.slice(0, 3);
        
        // If we have less than 3 matches, relax the filters and try again
        if (matchedWines.length < 3) {
            console.log('Not enough matches, relaxing filters...');
            
            // Get additional recommendations with relaxed criteria
            const additionalWines = allWines
                .filter(wine => {
                    // Exclude wines already in matches
                    if (matchedWines.some(match => match.id === wine.id)) {
                        return false;
                    }
                    
                    // Apply only basic filters
                    return (wine.points || 0) >= 85;
                })
                .map(wine => {
                    let score = wine.points || 85;
                    
                    // Add small preference adjustments
                    if (userPreferences.wineType !== 'any') {
                        const variety = (wine.variété || wine.varietal || '').toLowerCase();
                        if ((userPreferences.wineType === 'red' && 
                            (variety.includes('rouge') || variety.includes('red'))) ||
                            (userPreferences.wineType === 'white' && 
                            (variety.includes('blanc') || variety.includes('white'))) ||
                            (userPreferences.wineType === 'rose' && 
                            (variety.includes('rosé') || variety.includes('rose'))) ||
                            (userPreferences.wineType === 'sparkling' && 
                            (variety.includes('sparkling') || variety.includes('champagne')))) {
                            score += 3;
                        }
                    }
                    
                    // Add random factor
                    score += Math.random() * 5;
                    
                    return {
                        ...wine,
                        matchScore: Math.min(Math.round(score), 95), // Cap slightly lower than primary matches
                        flavorMatchPercentage: 0
                    };
                })
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 3 - matchedWines.length);
            
            // Add additional wines to matches
            matchedWines = [...matchedWines, ...additionalWines];
        }
        
        // Hide loading state
        toggleLoading(false);
        
        // Display recommendations
        displayRecommendations(matchedWines);
        
    } catch (error) {
        console.error('Error generating recommendations:', error);
        
        // Hide loading state
        toggleLoading(false);
        
        // Display error message
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> 
                        An error occurred while generating recommendations. Please try again.
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Get flavor related terms for matching
 * @param {string} flavor - The flavor preference
 * @returns {string[]} - Array of related terms
 */
function getFlavorTerms(flavor) {
    const flavorTermMap = {
        'fruity': ['fruit', 'berry', 'cherry', 'apple', 'citrus', 'peach', 'plum', 'tropical', 'melon', 'apricot', 'pear'],
        'earthy': ['earth', 'soil', 'mineral', 'leather', 'tobacco', 'forest', 'mushroom', 'truffle', 'wet stone'],
        'spicy': ['spice', 'pepper', 'cinnamon', 'clove', 'nutmeg', 'ginger', 'herbs', 'peppery'],
        'floral': ['floral', 'flower', 'blossom', 'rose', 'violet', 'lavender', 'jasmine', 'honeysuckle'],
        'tannic': ['tannin', 'grippy', 'astringent', 'structured', 'firm', 'chewy'],
        'acidic': ['acid', 'crisp', 'fresh', 'bright', 'zesty', 'lively', 'tart'],
        'oaky': ['oak', 'vanilla', 'toast', 'wood', 'smoky', 'coconut', 'cedar', 'spice'],
        'smooth': ['smooth', 'silky', 'velvety', 'round', 'soft', 'balanced', 'elegant', 'refined']
    };
    
    return flavorTermMap[flavor] || [];
}

/**
 * Display wine recommendations
 * @param {Array} wines - The recommended wines
 */
function displayRecommendations(wines) {
    if (!recommendationsDiv) return;
    
    recommendationsDiv.innerHTML = '';
    
    if (wines.length === 0) {
        recommendationsDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No wines match your preferences. Try adjusting your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    // Create wine recommendation cards
    wines.forEach((wine, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4 fade-in';
        col.style.animationDelay = `${index * 0.2}s`;
        
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
        
        // Determine pairing icon
        let pairingIcon = '';
        if (userPreferences.foodPairing !== 'none') {
            const pairingIconMap = {
                'beef': '<i class="fas fa-drumstick-bite"></i>',
                'chicken': '<i class="fas fa-drumstick-bite"></i>',
                'fish': '<i class="fas fa-fish"></i>',
                'pasta': '<i class="fas fa-utensils"></i>',
                'cheese': '<i class="fas fa-cheese"></i>',
                'dessert': '<i class="fas fa-birthday-cake"></i>',
                'spicy': '<i class="fas fa-pepper-hot"></i>',
                'vegetarian': '<i class="fas fa-carrot"></i>',
                'salad': '<i class="fas fa-leaf"></i>'
            };
            
            pairingIcon = pairingIconMap[userPreferences.foodPairing] || '';
        }
        
        // Build recommendation card
        col.innerHTML = `
            <div class="card h-100 recommendation-card">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <span>Perfect Match</span>
                    <span class="match-percentage">
                        <div class="circular-progress" style="--progress: ${wine.matchScore}%">
                            <div class="inner">
                                <span class="match-text">${wine.matchScore}%</span>
                            </div>
                        </div>
                    </span>
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
                    <div class="wine-meta mb-3">
                        <span class="wine-region">
                            <i class="fas fa-map-marker-alt"></i> 
                            ${wine.region_1 || wine.region || 'Unknown Region'}, ${wine.country || 'Unknown Country'}
                        </span>
                        ${pairingIcon ? `
                            <span class="wine-pairing">
                                ${pairingIcon} Pairs with ${userPreferences.foodPairing}
                            </span>
                        ` : ''}
                    </div>
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
                        <div class="flavor-match">
                            <div class="flavor-match-bar" style="--match-percentage: ${wine.flavorMatchPercentage}%"></div>
                            <span class="flavor-match-text">Flavor match: ${wine.flavorMatchPercentage}%</span>
                        </div>
                        <span class="wine-price">$${(wine.prix || wine.price || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        recommendationsDiv.appendChild(col);
    });
    
    // Display recommendation explanation
    updateRecommendationExplanation();
    
    // Add bubbles to sparkling wine icons
    setTimeout(() => {
        document.querySelectorAll('.wine-icon-sparkling').forEach(icon => {
            addBubbles(icon);
        });
    }, 500);
}

/**
 * Add animated bubbles to sparkling wine icons
 * @param {HTMLElement} iconElement - The sparkling wine icon element
 */
function addBubbles(iconElement) {
    const bubbleCount = 8;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'wine-icon-bubble';
        
        // Randomize bubble properties
        const size = 3 + Math.random() * 5;
        const left = 5 + Math.random() * 10;
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 2;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}px`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;
        
        iconElement.querySelector('.wine-icon').appendChild(bubble);
    }
}

/**
 * Update recommendation explanation based on user preferences
 */
function updateRecommendationExplanation() {
    if (!recommendationReasons) return;
    
    recommendationReasons.innerHTML = '';
    
    // Add explanation points based on user preferences
    const selectedFlavors = [];
    for (const [flavor, isSelected] of Object.entries(userPreferences.flavors)) {
        if (isSelected) {
            selectedFlavors.push(flavor);
        }
    }
    
    if (selectedFlavors.length > 0) {
        const flavorsList = selectedFlavors.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
        addRecommendationReason(`Have ${flavorsList} characteristics`);
    }
    
    // Price range
    let priceText = '';
    switch (userPreferences.priceRange) {
        case 'budget':
            priceText = 'budget-friendly (under $25)';
            break;
        case 'moderate':
            priceText = 'moderate ($20-$60)';
            break;
        case 'premium':
            priceText = 'premium ($50-$120)';
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
    
    // Body preference
    if (userPreferences.bodyPreference) {
        const bodyValue = parseInt(userPreferences.bodyPreference);
        let bodyText = 'medium';
        
        if (bodyValue === 1) bodyText = 'light';
        else if (bodyValue === 2) bodyText = 'medium-light';
        else if (bodyValue === 4) bodyText = 'medium-full';
        else if (bodyValue === 5) bodyText = 'full';
        
        addRecommendationReason(`Have a ${bodyText} body`);
    }
    
    // Ageability
    if (userPreferences.ageability && userPreferences.ageability !== 'any') {
        if (userPreferences.ageability === 'now') {
            addRecommendationReason('Are ready to drink now');
        } else {
            addRecommendationReason('Have good aging potential');
        }
    }
    
    // Occasion
    const occasionText = {
        'casual': 'a casual gathering',
        'celebration': 'a celebration',
        'gift': 'giving as a gift',
        'collection': 'adding to your collection',
        'dinner': 'a dinner party'
    };
    addRecommendationReason(`Are suitable for ${occasionText[userPreferences.occasion] || 'your occasion'}`);
    
    // Always add this point
    addRecommendationReason('Have high quality ratings from wine experts');
}

/**
 * Add a reason to the recommendation explanation list
 * @param {string} reason - The reason to add
 */
function addRecommendationReason(reason) {
    if (!recommendationReasons) return;
    
    const li = document.createElement('li');
    li.className = 'fade-in';
    li.textContent = reason;
    recommendationReasons.appendChild(li);
}