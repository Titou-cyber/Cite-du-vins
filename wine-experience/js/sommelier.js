/**
 * La Cité Du Vin - AI Sommelier Experience
 * 
 * This script powers the interactive wine recommendation system 
 * that analyzes user preferences and suggests personalized
 * wine selections based on flavor profile, occasion, food pairings, 
 * and other preferences.
 */

// DOM Elements - Main UI Components
const sommelierProgress = document.getElementById('sommelier-progress');
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

// Step indicators
const step1El = document.getElementById('step-1');
const step2El = document.getElementById('step-2');
const step3El = document.getElementById('step-3');

// Global variables
let allWines = [];
let isLoading = false;
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
    bodyPreference: 3,
    occasion: 'casual',
    ageability: 'any'
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

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the AI Sommelier application
 */
async function initialize() {
    try {
        // Show loading state
        setLoading(true);
        
        // Load wine data
        await fetchWineData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize Bootstrap tooltips if available
        initializeTooltips();
        
        // Hide loading state
        setLoading(false);
        
    } catch (error) {
        console.error('Error initializing sommelier:', error);
        displayErrorMessage('Failed to initialize the sommelier experience. Please refresh the page and try again.');
        setLoading(false);
    }
}

/**
 * Set loading state and update UI accordingly
 * @param {boolean} loading - Whether the application is in loading state
 */
function setLoading(loading) {
    isLoading = loading;
    
    // Update UI elements based on loading state
    if (loading) {
        // Add loading class to main containers
        if (step1Form) step1Form.classList.add('loading');
        if (step2Form) step2Form.classList.add('loading');
        if (recommendationsContainer) recommendationsContainer.classList.add('loading');
        
        // Disable navigation buttons
        if (step1Next) step1Next.disabled = true;
        if (step2Back) step2Back.disabled = true;
        if (step2Next) step2Next.disabled = true;
        if (restartButton) restartButton.disabled = true;
        
        // Show loader if not already present
        if (!document.querySelector('.sommelier-loader')) {
            createAndAppendLoader();
        }
    } else {
        // Remove loading states
        if (step1Form) step1Form.classList.remove('loading');
        if (step2Form) step2Form.classList.remove('loading');
        if (recommendationsContainer) recommendationsContainer.classList.remove('loading');
        
        // Enable buttons (except step1Next which depends on selection)
        if (step2Back) step2Back.disabled = false;
        if (step2Next) step2Next.disabled = false;
        if (restartButton) restartButton.disabled = false;
        
        // Update step1Next based on flavor selection
        updateNextButtonState();
        
        // Remove loaders
        document.querySelectorAll('.sommelier-loader').forEach(loader => loader.remove());
    }
}

/**
 * Create and append loading indicator
 */
function createAndAppendLoader() {
    const loader = document.createElement('div');
    loader.className = 'sommelier-loader';
    loader.innerHTML = `
        <div class="spinner">
            <div class="double-bounce1"></div>
            <div class="double-bounce2"></div>
        </div>
        <p>Analyzing wine data...</p>
    `;
    
    if (step1Form && !step1Form.classList.contains('d-none')) {
        step1Form.appendChild(loader);
    } else if (step2Form && !step2Form.classList.contains('d-none')) {
        step2Form.appendChild(loader);
    } else if (recommendationsContainer && !recommendationsContainer.classList.contains('d-none')) {
        recommendationsContainer.appendChild(loader);
    }
}

/**
 * Fetch wine data from the server
 * @returns {Promise<Array>} - The loaded wine data
 */
async function fetchWineData() {
    try {
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error(`Failed to load wine data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Ensure the data is an array
        allWines = Array.isArray(data) ? data : [data];
        
        console.log(`Loaded ${allWines.length} wines for sommelier recommendations`);
        
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
 * Set up all event listeners for interactive elements
 */
function setupEventListeners() {
    // Setup flavor preference toggles
    setupFlavorPreferenceToggles();
    
    // Step navigation buttons
    if (step1Next) step1Next.addEventListener('click', navigateToStep2);
    if (step2Back) step2Back.addEventListener('click', navigateToStep1);
    if (step2Next) step2Next.addEventListener('click', submitPreferences);
    if (restartButton) restartButton.addEventListener('click', resetSommelier);
    
    // Form input change listeners
    setupFormInputListeners();
    
    // Range slider listeners
    setupRangeSliders();
}

/**
 * Set up event listeners for flavor preference toggles
 */
function setupFlavorPreferenceToggles() {
    const preferenceOptions = document.querySelectorAll('.preference-option');
    preferenceOptions.forEach(option => {
        option.addEventListener('click', toggleFlavorPreference);
        
        // Add flavor descriptions as tooltips
        const preference = option.getAttribute('data-preference');
        if (preference && flavorDescriptions[preference]) {
            option.setAttribute('title', flavorDescriptions[preference]);
            option.setAttribute('data-bs-toggle', 'tooltip');
            option.setAttribute('data-bs-placement', 'top');
        }
    });
}

/**
 * Set up change listeners for form inputs
 */
function setupFormInputListeners() {
    const formInputs = document.querySelectorAll('#preferences-form select, #preferences-form input');
    formInputs.forEach(input => {
        input.addEventListener('change', updatePreferenceFromInput);
    });
}

/**
 * Set up range slider event listeners
 */
function setupRangeSliders() {
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
 * Initialize Bootstrap tooltips if available
 */
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
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
 * Toggle a flavor preference selection and update UI
 * @param {Event} event - The click event
 */
function toggleFlavorPreference(event) {
    if (isLoading) return;
    
    const option = event.currentTarget;
    const preference = option.getAttribute('data-preference');
    
    if (!preference || !userPreferences.flavors.hasOwnProperty(preference)) return;
    
    // Toggle selection state with visual feedback
    option.classList.toggle('selected');
    option.classList.add('pulse');
    
    // Update preference in data model
    userPreferences.flavors[preference] = option.classList.contains('selected');
    
    // Remove animation class after it completes
    setTimeout(() => {
        option.classList.remove('pulse');
    }, 600);
    
    // Update next button state based on selections
    updateNextButtonState();
}

/**
 * Enable/disable the next button based on flavor selections
 */
function updateNextButtonState() {
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
 * Update preference model from form input changes
 * @param {Event} event - The change event
 */
function updatePreferenceFromInput(event) {
    const input = event.target;
    const id = input.id.replace('-preference', '');
    
    if (id === 'body') {
        userPreferences.bodyPreference = parseInt(input.value);
    } else if (userPreferences.hasOwnProperty(id)) {
        userPreferences[id] = input.value;
    }
}

/**
 * Navigate from step 1 to step 2
 */
function navigateToStep2() {
    if (isLoading) return;
    
    // Validate that at least one flavor is selected
    const anyFlavorSelected = Object.values(userPreferences.flavors).some(value => value);
    if (!anyFlavorSelected) {
        showNotification("Please select at least one flavor preference", "error");
        return;
    }
    
    // Update progress indicators
    updateProgressIndicator(2);
    
    // Animate transition between steps
    animateStepTransition(step1Form, step2Form);
}

/**
 * Navigate from step 2 back to step 1
 */
function navigateToStep1() {
    if (isLoading) return;
    
    // Update progress indicators
    updateProgressIndicator(1);
    
    // Animate transition between steps
    animateStepTransition(step2Form, step1Form, true);
}

/**
 * Update the progress indicator to show current step
 * @param {number} stepNumber - The current step (1, 2, or 3)
 */
function updateProgressIndicator(stepNumber) {
    // Remove active class from all steps
    [step1El, step2El, step3El].forEach(step => {
        step.classList.remove('active');
        step.classList.remove('completed');
    });
    
    // Set appropriate classes based on current step
    if (stepNumber === 1) {
        step1El.classList.add('active');
    } else if (stepNumber === 2) {
        step1El.classList.add('completed');
        step2El.classList.add('active');
    } else if (stepNumber === 3) {
        step1El.classList.add('completed');
        step2El.classList.add('completed');
        step3El.classList.add('active');
    }
    
    // Add animation class for visual feedback
    sommelierProgress.classList.add('progress-update');
    setTimeout(() => {
        sommelierProgress.classList.remove('progress-update');
    }, 500);
}

/**
 * Animate transition between step forms
 * @param {HTMLElement} currentStep - The current step element
 * @param {HTMLElement} nextStep - The next step element
 * @param {boolean} reverse - Whether this is a backward transition
 */
function animateStepTransition(currentStep, nextStep, reverse = false) {
    // Set transition classes based on direction
    const outClass = reverse ? 'slide-out-right' : 'slide-out';
    const inClass = reverse ? 'slide-in-left' : 'slide-in';
    
    // Apply exit animation to current step
    currentStep.classList.add(outClass);
    
    // After exit animation completes, hide current and show next
    setTimeout(() => {
        currentStep.classList.add('d-none');
        currentStep.classList.remove(outClass);
        
        nextStep.classList.remove('d-none');
        nextStep.classList.add(inClass);
        
        // Remove entry animation class after it completes
        setTimeout(() => {
            nextStep.classList.remove(inClass);
        }, 300);
    }, 300);
}

/**
 * Submit preferences and generate wine recommendations
 */
function submitPreferences() {
    if (isLoading) return;
    
    // Gather all form data into preferences model
    updatePreferencesFromForm();
    
    // Update progress indicator
    updateProgressIndicator(3);
    
    // Animate transition to recommendations
    animateStepTransition(step2Form, recommendationsContainer);
    
    // Generate recommendations with a slight delay for animation
    setTimeout(() => {
        generateRecommendations();
    }, 400);
}

/**
 * Update preferences model with all form values
 */
function updatePreferencesFromForm() {
    // Get elements by ID
    const priceRange = document.getElementById('price-preference');
    const wineType = document.getElementById('type-preference');
    const foodPairing = document.getElementById('food-preference');
    const bodyPreference = document.getElementById('body-preference');
    const occasion = document.getElementById('occasion-preference');
    const ageability = document.getElementById('ageability-preference');
    
    // Update preference model
    if (priceRange) userPreferences.priceRange = priceRange.value;
    if (wineType) userPreferences.wineType = wineType.value;
    if (foodPairing) userPreferences.foodPairing = foodPairing.value;
    if (bodyPreference) userPreferences.bodyPreference = parseInt(bodyPreference.value);
    if (occasion) userPreferences.occasion = occasion.value;
    if (ageability) userPreferences.ageability = ageability.value;
}

/**
 * Reset the sommelier experience to start over
 */
function resetSommelier() {
    if (isLoading) return;
    
    // Update progress indicator
    updateProgressIndicator(1);
    
    // Animate transition back to step 1
    animateStepTransition(recommendationsContainer, step1Form, true);
    
    // Reset preference selections UI
    resetPreferenceUI();
    
    // Reset preference data model
    resetPreferenceData();
}

/**
 * Reset the preference UI elements to default state
 */
function resetPreferenceUI() {
    // Unselect all flavor preferences
    document.querySelectorAll('.preference-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset form values
    const form = document.getElementById('preferences-form');
    if (form) form.reset();
    
    // Reset range slider displays
    const bodyValue = document.getElementById('body-preference-value');
    if (bodyValue) bodyValue.textContent = 'Medium';
    
    // Disable next button
    if (step1Next) {
        step1Next.disabled = true;
        step1Next.classList.remove('ready');
    }
}

/**
 * Reset preference data model to defaults
 */
function resetPreferenceData() {
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
        bodyPreference: 3,
        occasion: 'casual',
        ageability: 'any'
    };
}

/**
 * Generate wine recommendations based on user preferences
 */
function generateRecommendations() {
    try {
        // Show loading state
        setLoading(true);
        
        // Clear previous recommendations
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner">
                        <div class="double-bounce1"></div>
                        <div class="double-bounce2"></div>
                    </div>
                    <p class="mt-3">Finding your perfect wines...</p>
                </div>
            `;
        }
        
        // Apply filters to find matched wines
        let matchedWines = filterWinesByPreferences();
        
        // Calculate match scores for each wine
        matchedWines = calculateMatchScores(matchedWines);
        
        // Sort by match score (highest first)
        matchedWines.sort((a, b) => b.matchScore - a.matchScore);
        
        // Take top wines (up to 3)
        matchedWines = matchedWines.slice(0, 3);
        
        // If we have less than 3 matches, add additional recommendations
        if (matchedWines.length < 3) {
            const additionalWines = getAdditionalRecommendations(matchedWines);
            matchedWines = [...matchedWines, ...additionalWines];
        }
        
        // Short delay for better UX
        setTimeout(() => {
            // Display recommendations
            displayRecommendations(matchedWines);
            
            // Update explanation
            updateRecommendationExplanation();
            
            // Hide loading state
            setLoading(false);
        }, 800);
        
    } catch (error) {
        console.error('Error generating recommendations:', error);
        displayErrorMessage('An error occurred while generating recommendations. Please try again.');
        setLoading(false);
    }
}

/**
 * Filter wines based on user preferences
 * @returns {Array} - Wines that match the user's preferences
 */
function filterWinesByPreferences() {
    return allWines.filter(wine => {
        if (!wine) return false;
        
        // Filter by price range
        if (!matchesPriceRange(wine)) return false;
        
        // Filter by wine type
        if (!matchesWineType(wine)) return false;
        
        // Filter by food pairing
        if (!matchesFoodPairing(wine)) return false;
        
        // Filter by body preference
        if (!matchesBodyPreference(wine)) return false;
        
        // Filter by aging potential
        if (!matchesAgingPotential(wine)) return false;
        
        // Filter by flavor preferences
        if (!matchesFlavorProfile(wine)) return false;
        
        // Only consider wines with decent ratings
        if ((wine.points || 0) < 85) return false;
        
        return true;
    });
}

/**
 * Check if wine matches user's price range preference
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesPriceRange(wine) {
    const price = parseFloat(wine.prix || wine.price || 0);
    
    switch (userPreferences.priceRange) {
        case 'budget':
            return price <= 25;
        case 'moderate':
            return price >= 20 && price <= 60;
        case 'premium':
            return price >= 50 && price <= 120;
        case 'luxury':
            return price >= 100;
        default:
            return true;
    }
}

/**
 * Check if wine matches user's wine type preference
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesWineType(wine) {
    if (userPreferences.wineType === 'any') return true;
    
    const variety = (wine.variété || wine.varietal || '').toLowerCase();
    const description = (wine.description || '').toLowerCase();
    
    switch (userPreferences.wineType) {
        case 'red':
            return variety.includes('rouge') || 
                   variety.includes('red') || 
                   variety.includes('noir') || 
                   variety.includes('cabernet') || 
                   variety.includes('merlot') || 
                   variety.includes('syrah') || 
                   variety.includes('zinfandel') ||
                   variety.includes('malbec') ||
                   variety.includes('grenache') || 
                   variety.includes('sangiovese');
        case 'white':
            return variety.includes('blanc') || 
                   variety.includes('white') || 
                   variety.includes('chardonnay') || 
                   variety.includes('sauvignon') || 
                   variety.includes('riesling') ||
                   variety.includes('pinot gris') ||
                   variety.includes('gewurztraminer') ||
                   variety.includes('chenin') ||
                   variety.includes('semillon');
        case 'rose':
            return variety.includes('rosé') || 
                   variety.includes('rose');
        case 'sparkling':
            return variety.includes('sparkling') || 
                   variety.includes('champagne') || 
                   variety.includes('cava') || 
                   variety.includes('prosecco') ||
                   variety.includes('cremant') ||
                   variety.includes('lambrusco');
        case 'dessert':
            return variety.includes('port') ||
                   variety.includes('sauternes') ||
                   variety.includes('tokaji') ||
                   variety.includes('ice wine') ||
                   variety.includes('late harvest') ||
                   variety.includes('moscato') ||
                   description.includes('sweet');
        default:
            return true;
    }
}

/**
 * Check if wine matches user's food pairing preference
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesFoodPairing(wine) {
    if (userPreferences.foodPairing === 'none') return true;
    
    const variety = (wine.variété || wine.varietal || '').toLowerCase();
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
    };
    
    // Check if variety matches
    const pairs = pairingMap[userPreferences.foodPairing] || [];
    for (const pairingVariety of pairs) {
        if (variety.includes(pairingVariety)) {
            return true;
        }
    }
    
    // Check description for food pairing mentions
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
            return true;
        }
    }
    
    return false;
}

/**
 * Check if wine matches user's body preference
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesBodyPreference(wine) {
    // If no preference or middle preference (medium), accept all
    if (!userPreferences.bodyPreference || userPreferences.bodyPreference === 3) {
        return true;
    }
    
    const bodyValue = userPreferences.bodyPreference;
    const description = (wine.description || '').toLowerCase();
    
    // Light-bodied indicators
    const lightBodyTerms = ['light', 'delicate', 'elegant', 'crisp'];
    
    // Full-bodied indicators
    const fullBodyTerms = ['full', 'bold', 'robust', 'powerful', 'rich', 'intense'];
    
    // For lighter wine preference (1-2)
    if (bodyValue <= 2) {
        // Exclude wines with full-body indicators
        for (const term of fullBodyTerms) {
            if (description.includes(term)) {
                return false;
            }
        }
        
        // For very light preference (1), require explicit light body indicator
        if (bodyValue === 1) {
            for (const term of lightBodyTerms) {
                if (description.includes(term)) {
                    return true;
                }
            }
            return false;
        }
        
        return true;
    } 
    // For fuller wine preference (4-5)
    else if (bodyValue >= 4) {
        // Exclude wines with light-body indicators
        for (const term of lightBodyTerms) {
            if (description.includes(term)) {
                return false;
            }
        }
        
        // For very full preference (5), require explicit full body indicator
        if (bodyValue === 5) {
            for (const term of fullBodyTerms) {
                if (description.includes(term)) {
                    return true;
                }
            }
            return false;
        }
        
        return true;
    }
    
    return true;
}

/**
 * Check if wine matches user's aging potential preference
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesAgingPotential(wine) {
    if (userPreferences.ageability === 'any') return true;
    
    const description = (wine.description || '').toLowerCase();
    
    if (userPreferences.ageability === 'now') {
        // Filter for wines ready to drink now
        if (description.includes('age') || 
            description.includes('cellar') || 
            description.includes('years') ||
            description.includes('develop')) {
            return false;
        }
        return true;
    } else if (userPreferences.ageability === 'aging') {
        // Filter for age-worthy wines
        const ageTerms = ['age', 'cellar', 'aging', 'develop', 'potential', 'structure', 'tannin'];
        for (const term of ageTerms) {
            if (description.includes(term)) {
                return true;
            }
        }
        return false;
    }
    
    return true;
}

/**
 * Check if wine matches user's flavor profile preferences
 * @param {Object} wine - Wine object to check
 * @returns {boolean} - Whether the wine matches
 */
function matchesFlavorProfile(wine) {
    const description = (wine.description || '').toLowerCase();
    
    // Check if any selected flavor preference matches the wine description
    const selectedFlavors = Object.entries(userPreferences.flavors)
        .filter(([_, isSelected]) => isSelected)
        .map(([flavor]) => flavor);
    
    // If no flavors selected, all wines pass
    if (selectedFlavors.length === 0) return true;
    
    // Look for any flavor match
    for (const flavor of selectedFlavors) {
        const flavorTerms = getFlavorTerms(flavor);
        for (const term of flavorTerms) {
            if (description.includes(term)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Get list of terms related to a specific flavor for matching
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
 * Calculate match scores for each wine based on preferences
 * @param {Array} wines - List of wines that passed initial filtering
 * @returns {Array} - Wines with added match scores
 */
function calculateMatchScores(wines) {
    return wines.map(wine => {
        // Base score starts with wine's rating
        let matchScore = wine.points || 85;
        
        // Description for flavor matching
        const description = (wine.description || '').toLowerCase();
        
        // Flavor preference adjustments
        let flavorMatches = 0;
        let totalSelectedFlavors = 0;
        
        // Count flavor matches
        for (const [flavor, isSelected] of Object.entries(userPreferences.flavors)) {
            if (!isSelected) continue;
            totalSelectedFlavors++;
            
            const flavorTerms = getFlavorTerms(flavor);
            for (const term of flavorTerms) {
                if (description.includes(term)) {
                    flavorMatches++;
                    matchScore += 2; // Bonus points for each flavor match
                    break;
                }
            }
        }
        
        // Calculate flavor match percentage
        const flavorMatchPercentage = totalSelectedFlavors > 0 
            ? Math.min(100, Math.round((flavorMatches / totalSelectedFlavors) * 100))
            : 0;
        
        // Price range precision bonus
        const price = parseFloat(wine.prix || wine.price || 0);
        if (userPreferences.priceRange === 'budget' && price <= 25) {
            matchScore += 3;
        } else if (userPreferences.priceRange === 'moderate' && price >= 25 && price <= 60) {
            matchScore += 3;
        } else if (userPreferences.priceRange === 'premium' && price >= 60 && price <= 120) {
            matchScore += 3;
        } else if (userPreferences.priceRange === 'luxury' && price >= 120) {
            matchScore += 3;
        }
        
        // Wine type match bonus
        if (userPreferences.wineType !== 'any') {
            const variety = (wine.variété || wine.varietal || '').toLowerCase();
            
            const wineTypeMap = {
                'red': ['rouge', 'red', 'noir', 'cabernet', 'merlot', 'syrah', 'pinot noir'],
                'white': ['blanc', 'white', 'chardonnay', 'sauvignon', 'riesling'],
                'rose': ['rosé', 'rose'],
                'sparkling': ['sparkling', 'champagne', 'prosecco', 'cava'],
                'dessert': ['port', 'sauternes', 'sweet', 'dessert']
            };
            
            const typeTerms = wineTypeMap[userPreferences.wineType] || [];
            for (const term of typeTerms) {
                if (variety.includes(term)) {
                    matchScore += 5;
                    break;
                }
            }
        }
        
        // Food pairing bonus
        if (userPreferences.foodPairing !== 'none' && matchesFoodPairing(wine)) {
            matchScore += 4;
        }
        
        // Body preference precision bonus
        if (userPreferences.bodyPreference !== 3 && matchesBodyPreference(wine)) {
            matchScore += 3;
        }
        
        // Occasion bonus (slight adjustment)
        if (userPreferences.occasion === 'celebration' && price > 50) {
            matchScore += 2;
        } else if (userPreferences.occasion === 'gift' && price > 40) {
            matchScore += 2;
        } else if (userPreferences.occasion === 'collection' && (wine.points || 0) > 90) {
            matchScore += 2;
        }
        
        // Add a slight random factor for variety
        matchScore += Math.random() * 3;
        
        // Cap at 100 and round to integer
        matchScore = Math.min(Math.round(matchScore), 100);
        
        return { 
            ...wine, 
            matchScore,
            flavorMatchPercentage
        };
    });
}

/**
 * Get additional wine recommendations if needed
 * @param {Array} currentMatches - Current matched wines
 * @returns {Array} - Additional wine recommendations
 */
function getAdditionalRecommendations(currentMatches) {
    console.log('Finding additional recommendations...');
    
    // Get IDs of wines already matched
    const matchedIds = currentMatches.map(wine => wine.id);
    
    // Find additional wines with more relaxed criteria
    return allWines
        .filter(wine => {
            // Exclude wines already in matches
            if (matchedIds.includes(wine.id)) return false;
            
            // Basic quality filter
            return (wine.points || 0) >= 85;
        })
        .map(wine => {
            let score = wine.points || 85;
            
            // Small bonus for matching wine type
            if (userPreferences.wineType !== 'any') {
                const variety = (wine.variété || wine.varietal || '').toLowerCase();
                const description = (wine.description || '').toLowerCase();
                
                if (userPreferences.wineType === 'red' && 
                    (variety.includes('rouge') || variety.includes('red'))) {
                    score += 3;
                } else if (userPreferences.wineType === 'white' && 
                    (variety.includes('blanc') || variety.includes('white'))) {
                    score += 3;
                } else if (userPreferences.wineType === 'rose' && 
                    (variety.includes('rosé') || variety.includes('rose'))) {
                    score += 3;
                } else if (userPreferences.wineType === 'sparkling' && 
                    (variety.includes('sparkling') || variety.includes('champagne'))) {
                    score += 3;
                } else if (userPreferences.wineType === 'dessert' && 
                    (variety.includes('dessert') || description.includes('sweet'))) {
                    score += 3;
                }
            }
            
            // Random factor to vary results
            score += Math.random() * 5;
            
            return {
                ...wine,
                matchScore: Math.min(Math.round(score), 95), // Cap slightly lower than primary matches
                flavorMatchPercentage: 0 // These are backup matches, so no flavor match percentage
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3 - currentMatches.length);
}

/**
 * Display wine recommendations to the user
 * @param {Array} wines - The recommended wines to display
 */
function displayRecommendations(wines) {
    if (!recommendationsDiv) return;
    
    // Clear previous recommendations
    recommendationsDiv.innerHTML = '';
    
    // Handle case with no matches
    if (wines.length === 0) {
        recommendationsDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No wines match your specific preferences. Try adjusting your criteria for better results.
                </div>
            </div>
        `;
        return;
    }
    
    // Create wine recommendation cards
    wines.forEach((wine, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4 fade-in';
        col.style.animationDelay = `${index * 0.2}s`;
        
        // Determine wine type for styling
        const wineType = wine.variété || wine.varietal || '';
        let typeClass = 'wine-type-red';
        let typeBadge = 'badge-burgundy';
        let typeIcon = 'wine-bottle';
        
        if (wineType.toLowerCase().includes('blanc') || 
            wineType.toLowerCase().includes('white') || 
            wineType.toLowerCase().includes('chardonnay') || 
            wineType.toLowerCase().includes('sauvignon')) {
            typeClass = 'wine-type-white';
            typeBadge = 'badge-gold';
            typeIcon = 'wine-glass-alt';
        } else if (wineType.toLowerCase().includes('sparkling') || 
                   wineType.toLowerCase().includes('champagne')) {
            typeClass = 'wine-type-sparkling';
            typeBadge = 'badge-sparkle';
            typeIcon = 'glass-cheers';
        } else if (wineType.toLowerCase().includes('rosé') || 
                   wineType.toLowerCase().includes('rose')) {
            typeClass = 'wine-type-rose';
            typeBadge = 'badge-rose';
            typeIcon = 'wine-glass';
        }
        
        // Determine food pairing icon if applicable
        let pairingHtml = '';
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
            
            const icon = pairingIconMap[userPreferences.foodPairing] || '';
            if (icon) {
                pairingHtml = `
                    <div class="meta-item">
                        ${icon} Pairs with ${userPreferences.foodPairing}
                    </div>
                `;
            }
        }
        
        // Get rating class based on points
        let ratingClass = 'average';
        const points = wine.points || 0;
        if (points >= 95) ratingClass = 'exceptional';
        else if (points >= 90) ratingClass = 'excellent';
        else if (points >= 87) ratingClass = 'very-good';
        else if (points < 85) ratingClass = 'below-average';
        
        // Create star display
        const fullStars = Math.floor(points / 20);
        const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
        
        // Build card HTML
        col.innerHTML = `
            <div class="wine-card">
                <div class="wine-badges">
                    <span class="badge ${typeBadge}">
                        <i class="fas fa-${typeIcon} me-1"></i>${wineType}
                    </span>
                </div>
                
                ${wine.matchScore >= 95 ? `
                    <div class="featured-badge">
                        <i class="fas fa-award me-1"></i> Perfect Match
                    </div>
                ` : ''}
                
                <div class="card-body">
                    <h3 class="card-title">${wine.title || wine.name || 'Unnamed Wine'}</h3>
                    <div class="card-subtitle">
                        <span class="winery">${wine.winery || wine.producer || 'Unknown Producer'}</span>
                        <span class="vintage">${wine.vintage || 'NV'}</span>
                    </div>
                    
                    <div class="wine-meta">
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i> 
                            ${wine.region || wine.region_1 || 'Unknown Region'}, ${wine.country || 'Unknown Country'}
                        </div>
                        ${pairingHtml}
                    </div>
                    
                    <div class="wine-rating ${ratingClass}">
                        <div class="star-rating">${stars}</div>
                        <div class="rating-number">${points}</div>
                    </div>
                    
                    <p class="card-description">
                        ${wine.description || 'No description available.'}
                    </p>
                    
                    <div class="match-meter" title="${wine.flavorMatchPercentage}% flavor profile match">
                        <div class="match-label">Flavor Match</div>
                        <div class="match-bar">
                            <div class="match-fill" style="width: ${wine.flavorMatchPercentage}%"></div>
                        </div>
                        <div class="match-percentage">${wine.flavorMatchPercentage}%</div>
                    </div>
                    
                    <div class="card-footer">
                        <span class="wine-price">$${(wine.prix || wine.price || 0).toFixed(2)}</span>
                        <button class="btn-add-to-cart" onclick="addToCart('${wine.id}')">
                            <i class="fas fa-plus me-2"></i>Add to Collection
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        recommendationsDiv.appendChild(col);
    });
    
    // Add fade-in animation to give a staggered effect
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('show');
        });
    }, 100);
}

/**
 * Update the recommendation explanation based on user preferences
 */
function updateRecommendationExplanation() {
    if (!recommendationReasons) return;
    
    // Clear previous reasons
    recommendationReasons.innerHTML = '';
    
    // Get selected flavors
    const selectedFlavors = [];
    for (const [flavor, isSelected] of Object.entries(userPreferences.flavors)) {
        if (isSelected) {
            selectedFlavors.push(flavor);
        }
    }
    
    // Add explanation for flavor preferences
    if (selectedFlavors.length > 0) {
        const flavorsList = selectedFlavors.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
        addRecommendationReason(`Have ${flavorsList} characteristics that match your taste profile`);
    }
    
    // Explanation for price range
    const priceMap = {
        'budget': 'budget-friendly (under $25)',
        'moderate': 'moderate ($25-$60)',
        'premium': 'premium ($60-$120)',
        'luxury': 'luxury ($120+)'
    };
    addRecommendationReason(`Fall within your preferred ${priceMap[userPreferences.priceRange]} price range`);
    
    // Wine type explanation
    if (userPreferences.wineType !== 'any') {
        addRecommendationReason(`Are ${userPreferences.wineType} wines as you requested`);
    }
    
    // Food pairing explanation
    if (userPreferences.foodPairing !== 'none') {
        addRecommendationReason(`Pair exceptionally well with ${userPreferences.foodPairing}`);
    }
    
    // Body preference explanation
    if (userPreferences.bodyPreference) {
        const bodyValue = userPreferences.bodyPreference;
        let bodyText = 'medium';
        
        if (bodyValue === 1) bodyText = 'light';
        else if (bodyValue === 2) bodyText = 'medium-light';
        else if (bodyValue === 4) bodyText = 'medium-full';
        else if (bodyValue === 5) bodyText = 'full';
        
        addRecommendationReason(`Have a ${bodyText} body that matches your preference`);
    }
    
    // Ageability explanation
    if (userPreferences.ageability !== 'any') {
        if (userPreferences.ageability === 'now') {
            addRecommendationReason('Are ready to drink now, without further aging');
        } else {
            addRecommendationReason('Have excellent aging potential for your collection');
        }
    }
    
    // Occasion explanation
    const occasionMap = {
        'casual': 'casual gatherings',
        'celebration': 'special celebrations',
        'gift': 'giving as a memorable gift',
        'collection': 'adding to a distinguished collection',
        'dinner': 'impressive dinner parties'
    };
    addRecommendationReason(`Are perfectly suited for ${occasionMap[userPreferences.occasion] || 'your occasion'}`);
    
    // Quality statement (always included)
    addRecommendationReason('Have been highly rated by wine experts and critics');
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
    
    // Stagger animation
    setTimeout(() => {
        li.classList.add('show');
    }, 100 * recommendationReasons.children.length);
}

/**
 * Add a wine to the cart
 * @param {string} wineId - The ID of the wine to add
 */
function addToCart(wineId) {
    // Find wine in the dataset
    const wine = allWines.find(w => w.id === wineId);
    if (!wine) return;
    
    // Show notification
    showNotification(`${wine.title || wine.name || 'Wine'} added to your collection`, 'success');
    
    // Update cart count (this would connect to your cart system)
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const currentCount = parseInt(cartCount.textContent);
        cartCount.textContent = (currentCount + 1).toString();
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 600);
    }
    
    // Toggle button state on the wine card
    const button = event.currentTarget;
    button.classList.add('added');
    button.innerHTML = '<i class="fas fa-check me-2"></i>Added to Collection';
    
    setTimeout(() => {
        button.classList.remove('added');
        button.innerHTML = '<i class="fas fa-plus me-2"></i>Add to Collection';
    }, 2000);
}

/**
 * Display a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add click handler to close button
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

/**
 * Display an error message in the recommendations area
 * @param {string} message - The error message to display
 */
function displayErrorMessage(message) {
    if (!recommendationsDiv) return;
    
    recommendationsDiv.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> 
                ${message}
            </div>
        </div>
    `;
}

// Add to cart function (to be connected to your cart system)
window.addToCart = addToCart;