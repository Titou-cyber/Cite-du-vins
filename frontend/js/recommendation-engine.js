/**
 * recommendation-engine.js - AI-powered wine recommendation system
 * Processes user preferences and behavior to suggest personalized wine recommendations
 */

class WineRecommendationEngine {
    constructor() {
        // Initialize state
        this.state = {
            userPreferences: this.loadUserPreferences(),
            interactionHistory: this.loadInteractionHistory(),
            tasteProfile: this.loadTasteProfile(),
            wines: [],
            recommendations: [],
            isInitialized: false
        };
        
        // Preference weights for algorithms
        this.weights = {
            variety: 0.3,
            region: 0.25,
            price: 0.15,
            rating: 0.2,
            style: 0.1
        };
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.generateRecommendations = this.generateRecommendations.bind(this);
        this.recordInteraction = this.recordInteraction.bind(this);
        this.updateTasteProfile = this.updateTasteProfile.bind(this);
        this.findSimilarWines = this.findSimilarWines.bind(this);
        this.getTrendingWines = this.getTrendingWines.bind(this);
        this.getSeasonalRecommendations = this.getSeasonalRecommendations.bind(this);
        this.getMealPairingRecommendations = this.getMealPairingRecommendations.bind(this);
        
        // Initialize engine
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initialize);
        } else {
            this.initialize();
        }
    }
    
    /**
     * Initialize the recommendation engine
     */
    async initialize() {
        try {
            // Load wine data if needed
            if (this.state.wines.length === 0) {
                await this.loadWineData();
            }
            
            // Generate initial recommendations
            await this.generateRecommendations();
            
            // Set initialized flag
            this.state.isInitialized = true;
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load any personalized recommendations UI
            this.updateRecommendationsUI();
            
            console.log('Wine recommendation engine initialized');
        } catch (error) {
            console.error('Failed to initialize recommendation engine:', error);
        }
    }
    
    /**
     * Load wine data from API
     */
    async loadWineData() {
        try {
            // Fetch wine data from server
            const response = await fetch('/api/wines?limit=500');
            
            if (!response.ok) {
                throw new Error('Failed to fetch wine data');
            }
            
            const data = await response.json();
            this.state.wines = data.wines || [];
            
            console.log(`Loaded ${this.state.wines.length} wines for recommendation engine`);
            
            return this.state.wines;
        } catch (error) {
            console.error('Error loading wine data:', error);
            
            // Fallback to local storage or empty array
            this.state.wines = [];
            return [];
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('cduv_user_preferences') || '{}');
            
            // Set defaults if not present
            return {
                priceRange: preferences.priceRange || { min: 0, max: 500 },
                preferredVarieties: preferences.preferredVarieties || [],
                preferredRegions: preferences.preferredRegions || [],
                preferredStyles: preferences.preferredStyles || [],
                dislikedVarieties: preferences.dislikedVarieties || [],
                minRating: preferences.minRating || 85,
                sortPreference: preferences.sortPreference || 'rating-desc',
                viewMode: preferences.viewMode || 'grid'
            };
        } catch (error) {
            console.error('Error loading user preferences:', error);
            return {
                priceRange: { min: 0, max: 500 },
                preferredVarieties: [],
                preferredRegions: [],
                preferredStyles: [],
                dislikedVarieties: [],
                minRating: 85,
                sortPreference: 'rating-desc',
                viewMode: 'grid'
            };
        }
    }
    
    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('cduv_user_preferences', JSON.stringify(this.state.userPreferences));
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }
    
    /**
     * Load interaction history from localStorage
     */
    loadInteractionHistory() {
        try {
            return JSON.parse(localStorage.getItem('cduv_interaction_history') || '[]');
        } catch (error) {
            console.error('Error loading interaction history:', error);
            return [];
        }
    }
    
    /**
     * Save interaction history to localStorage
     */
    saveInteractionHistory() {
        try {
            // Limit to last 100 interactions to prevent localStorage from getting too large
            const limitedHistory = this.state.interactionHistory.slice(-100);
            localStorage.setItem('cduv_interaction_history', JSON.stringify(limitedHistory));
        } catch (error) {
            console.error('Error saving interaction history:', error);
        }
    }
    
    /**
     * Load taste profile from localStorage
     */
    loadTasteProfile() {
        try {
            return JSON.parse(localStorage.getItem('cduv_taste_profile') || '{}');
        } catch (error) {
            console.error('Error loading taste profile:', error);
            return {
                preferredTastes: {
                    sweetness: 0.5, // 0 (dry) to 1 (sweet)
                    acidity: 0.5,   // 0 (low) to 1 (high)
                    tannin: 0.5,    // 0 (soft) to 1 (firm)
                    body: 0.5,      // 0 (light) to 1 (full)
                    fruitForward: 0.5, // 0 (less) to 1 (more)
                    earthiness: 0.5,   // 0 (less) to 1 (more)
                    oakiness: 0.5      // 0 (less) to 1 (more)
                },
                preferredAromas: []
            };
        }
    }
    
    /**
     * Save taste profile to localStorage
     */
    saveTasteProfile() {
        try {
            localStorage.setItem('cduv_taste_profile', JSON.stringify(this.state.tasteProfile));
        } catch (error) {
            console.error('Error saving taste profile:', error);
        }
    }
    
    /**
     * Update taste profile based on interactions
     */
    updateTasteProfile(wine, interaction) {
        if (!wine || !this.state.tasteProfile) return;
        
        // Get current profile
        const profile = this.state.tasteProfile;
        
        // Weight factor based on interaction type
        let weight = 0.05; // Default small adjustment
        
        switch (interaction) {
            case 'view_details':
                weight = 0.02;
                break;
            case 'add_to_cart':
                weight = 0.1;
                break;
            case 'purchase':
                weight = 0.2;
                break;
            case 'favorite':
                weight = 0.15;
                break;
            case 'rate_high':
                weight = 0.2;
                break;
            case 'rate_low':
                weight = -0.1; // Negative for dislikes
                break;
            case 'remove_from_cart':
                weight = -0.05;
                break;
        }
        
        // Update taste preferences based on wine characteristics
        // In a real app, you would have detailed taste data for each wine
        // Here we use a simplistic model based on wine variety and type
        
        // Example: Adjust based on wine type
        if (wine.type === 'red') {
            // Red wines tend to have more tannins, body, earthiness
            profile.preferredTastes.tannin = this.adjustTasteParameter(profile.preferredTastes.tannin, 0.7, weight);
            profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.7, weight);
            profile.preferredTastes.earthiness = this.adjustTasteParameter(profile.preferredTastes.earthiness, 0.6, weight);
            profile.preferredTastes.sweetness = this.adjustTasteParameter(profile.preferredTastes.sweetness, 0.3, weight);
        } else if (wine.type === 'white') {
            // White wines tend to have more acidity, less tannins, lighter body
            profile.preferredTastes.acidity = this.adjustTasteParameter(profile.preferredTastes.acidity, 0.7, weight);
            profile.preferredTastes.tannin = this.adjustTasteParameter(profile.preferredTastes.tannin, 0.2, weight);
            profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.4, weight);
            profile.preferredTastes.fruitForward = this.adjustTasteParameter(profile.preferredTastes.fruitForward, 0.6, weight);
        } else if (wine.type === 'sparkling') {
            // Sparkling wines have high acidity, light body
            profile.preferredTastes.acidity = this.adjustTasteParameter(profile.preferredTastes.acidity, 0.8, weight);
            profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.3, weight);
            profile.preferredTastes.sweetness = this.adjustTasteParameter(profile.preferredTastes.sweetness, 0.5, weight);
        } else if (wine.type === 'dessert') {
            // Dessert wines are sweet, full-bodied
            profile.preferredTastes.sweetness = this.adjustTasteParameter(profile.preferredTastes.sweetness, 0.9, weight);
            profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.7, weight);
        }
        
        // Example: Adjust based on variety (very simplified)
        if (wine.variety) {
            const variety = wine.variety.toLowerCase();
            
            // Add to preferred aromas if it's a positive interaction
            if (weight > 0 && !profile.preferredAromas.includes(variety)) {
                profile.preferredAromas.push(variety);
                
                // Keep list to reasonable size
                if (profile.preferredAromas.length > 10) {
                    profile.preferredAromas.shift(); // Remove oldest preference
                }
            }
            
            // Adjust based on common variety characteristics
            if (variety.includes('cabernet') || variety.includes('merlot') || variety.includes('syrah')) {
                profile.preferredTastes.tannin = this.adjustTasteParameter(profile.preferredTastes.tannin, 0.7, weight);
                profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.8, weight);
            } else if (variety.includes('pinot noir')) {
                profile.preferredTastes.tannin = this.adjustTasteParameter(profile.preferredTastes.tannin, 0.4, weight);
                profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.5, weight);
                profile.preferredTastes.fruitForward = this.adjustTasteParameter(profile.preferredTastes.fruitForward, 0.7, weight);
            } else if (variety.includes('chardonnay')) {
                profile.preferredTastes.body = this.adjustTasteParameter(profile.preferredTastes.body, 0.6, weight);
                profile.preferredTastes.oakiness = this.adjustTasteParameter(profile.preferredTastes.oakiness, 0.6, weight);
            } else if (variety.includes('sauvignon blanc') || variety.includes('riesling')) {
                profile.preferredTastes.acidity = this.adjustTasteParameter(profile.preferredTastes.acidity, 0.8, weight);
                profile.preferredTastes.fruitForward = this.adjustTasteParameter(profile.preferredTastes.fruitForward, 0.7, weight);
            }
        }
        
        // Save updated profile
        this.saveTasteProfile();
    }
    
    /**
     * Helper to adjust taste parameter within bounds
     */
    adjustTasteParameter(currentValue, targetValue, weight) {
        // Calculate new value moving toward target
        let newValue = currentValue + (targetValue - currentValue) * weight;
        
        // Ensure value stays between 0 and 1
        return Math.max(0, Math.min(1, newValue));
    }
    
    /**
     * Record user interaction with a wine
     */
    recordInteraction(wine, interactionType) {
        if (!wine || !interactionType) return;
        
        // Create interaction record
        const interaction = {
            wineId: wine.id,
            type: interactionType,
            timestamp: new Date().toISOString()
        };
        
        // Add to history
        this.state.interactionHistory.push(interaction);
        
        // Save history
        this.saveInteractionHistory();
        
        // Update taste profile based on interaction
        this.updateTasteProfile(wine, interactionType);
        
        // Save preferences to adjust recommendations
        if (['add_to_cart', 'favorite', 'purchase', 'rate_high'].includes(interactionType)) {
            // Add to preferred varieties if not already there
            if (wine.variety && !this.state.userPreferences.preferredVarieties.includes(wine.variety)) {
                this.state.userPreferences.preferredVarieties.push(wine.variety);
            }
            
            // Add to preferred regions if not already there
            if (wine.region_1 && !this.state.userPreferences.preferredRegions.includes(wine.region_1)) {
                this.state.userPreferences.preferredRegions.push(wine.region_1);
            }
            
            // Save preferences
            this.saveUserPreferences();
        } else if (['remove_from_cart', 'rate_low'].includes(interactionType)) {
            // Add to disliked varieties if not already there
            if (wine.variety && !this.state.userPreferences.dislikedVarieties.includes(wine.variety)) {
                this.state.userPreferences.dislikedVarieties.push(wine.variety);
            }
            
            // Save preferences
            this.saveUserPreferences();
        }
        
        // Regenerate recommendations if it's a significant interaction
        if (['add_to_cart', 'purchase', 'favorite', 'rate_high', 'rate_low'].includes(interactionType)) {
            this.generateRecommendations();
        }
    }
    
    /**
     * Generate personalized wine recommendations
     */
    async generateRecommendations() {
        // Ensure we have wine data
        if (this.state.wines.length === 0) {
            await this.loadWineData();
        }
        
        // Start with all available wines
        let candidates = [...this.state.wines];
        
        // Filter out any wines that match disliked varieties
        if (this.state.userPreferences.dislikedVarieties.length > 0) {
            candidates = candidates.filter(wine => 
                !this.state.userPreferences.dislikedVarieties.includes(wine.variety)
            );
        }
        
        // Apply basic filters
        candidates = candidates.filter(wine => {
            // Filter by minimum rating
            if (wine.points && wine.points < this.state.userPreferences.minRating) {
                return false;
            }
            
            // Filter by price range
            const priceRange = this.state.userPreferences.priceRange;
            if (wine.price && (wine.price < priceRange.min || wine.price > priceRange.max)) {
                return false;
            }
            
            return true;
        });
        
        // Calculate relevance score for each wine
        candidates = candidates.map(wine => {
            let score = 0;
            
            // Base score from wine rating (0-100)
            score += (wine.points || 85) / 20; // Convert 0-100 to 0-5 scale
            
            // Boost for preferred varieties
            if (this.state.userPreferences.preferredVarieties.includes(wine.variety)) {
                score += 2;
            }
            
            // Boost for preferred regions
            if (this.state.userPreferences.preferredRegions.includes(wine.region_1)) {
                score += 1.5;
            }
            
            // Adjust based on taste profile matching
            score += this.calculateTasteMatch(wine) * 3;
            
            // Adjust based on recent interaction history
            score += this.calculateInteractionScore(wine);
            
            // Add some randomness for discovery (0-0.5)
            score += Math.random() * 0.5;
            
            return {
                ...wine,
                relevanceScore: score
            };
        });
        
        // Sort by relevance score
        candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Take top recommendations
        const recommendations = candidates.slice(0, 10);
        
        // Store recommendations
        this.state.recommendations = recommendations;
        
        // Update UI if available
        this.updateRecommendationsUI();
        
        return recommendations;
    }
    
    /**
     * Calculate taste profile match score (0-1)
     */
    calculateTasteMatch(wine) {
        // In a real application, each wine would have detailed taste parameters
        // Here we use a simplified approach based on available data
        
        if (!wine || !this.state.tasteProfile) return 0.5; // Neutral score
        
        const profile = this.state.tasteProfile.preferredTastes;
        let matchScore = 0.5; // Start with neutral score
        
        // Adjust based on wine type
        if (wine.type === 'red') {
            // Compare red wine characteristics with user preferences
            const redWineProfile = {
                sweetness: 0.2,
                acidity: 0.6,
                tannin: 0.7,
                body: 0.7,
                fruitForward: 0.6,
                earthiness: 0.7,
                oakiness: 0.6
            };
            
            matchScore = this.calculateProfileSimilarity(profile, redWineProfile);
        } else if (wine.type === 'white') {
            // Compare white wine characteristics with user preferences
            const whiteWineProfile = {
                sweetness: 0.3,
                acidity: 0.8,
                tannin: 0.1,
                body: 0.4,
                fruitForward: 0.7,
                earthiness: 0.3,
                oakiness: 0.4
            };
            
            matchScore = this.calculateProfileSimilarity(profile, whiteWineProfile);
        } else if (wine.type === 'sparkling') {
            // Compare sparkling wine characteristics with user preferences
            const sparklingWineProfile = {
                sweetness: 0.4,
                acidity: 0.9,
                tannin: 0.1,
                body: 0.3,
                fruitForward: 0.6,
                earthiness: 0.2,
                oakiness: 0.1
            };
            
            matchScore = this.calculateProfileSimilarity(profile, sparklingWineProfile);
        }
        
        // Adjust based on variety if available
        if (wine.variety && this.state.tasteProfile.preferredAromas.includes(wine.variety.toLowerCase())) {
            matchScore += 0.2; // Boost for matching aroma preference
        }
        
        // Ensure score is in 0-1 range
        return Math.max(0, Math.min(1, matchScore));
    }
    
    /**
     * Calculate similarity between two taste profiles (0-1)
     */
    calculateProfileSimilarity(userProfile, wineProfile) {
        let totalDifference = 0;
        let parameterCount = 0;
        
        // Calculate difference for each parameter
        for (const param in userProfile) {
            if (wineProfile[param] !== undefined) {
                const difference = Math.abs(userProfile[param] - wineProfile[param]);
                totalDifference += difference;
                parameterCount++;
            }
        }
        
        // Calculate average difference
        const avgDifference = parameterCount > 0 ? totalDifference / parameterCount : 0;
        
        // Convert to similarity score (0-1)
        return 1 - avgDifference;
    }
    
    /**
     * Calculate score adjustment based on interaction history
     */
    calculateInteractionScore(wine) {
        if (!wine || this.state.interactionHistory.length === 0) return 0;
        
        let score = 0;
        
        // Look for interactions with this wine
        const wineInteractions = this.state.interactionHistory.filter(
            interaction => interaction.wineId === wine.id
        );
        
        if (wineInteractions.length === 0) return 0;
        
        // Calculate score based on interaction types
        wineInteractions.forEach(interaction => {
            switch (interaction.type) {
                case 'view_details':
                    score += 0.1;
                    break;
                case 'add_to_cart':
                    score += 0.5;
                    break;
                case 'purchase':
                    score += 1.0;
                    break;
                case 'favorite':
                    score += 0.8;
                    break;
                case 'rate_high':
                    score += 1.0;
                    break;
                case 'rate_low':
                    score -= 2.0; // Significant negative impact
                    break;
                case 'remove_from_cart':
                    score -= 0.3;
                    break;
            }
        });
        
        // Look for interactions with similar wines
        const similarVarietyInteractions = this.state.interactionHistory.filter(
            interaction => {
                const interactionWine = this.findWineById(interaction.wineId);
                return interactionWine && interactionWine.variety === wine.variety;
            }
        );
        
        // Add smaller boosts for similar wine interactions
        similarVarietyInteractions.forEach(interaction => {
            if (['purchase', 'favorite', 'rate_high'].includes(interaction.type)) {
                score += 0.2;
            }
        });
        
        return score;
    }
    
    /**
     * Find wine by ID
     */
    findWineById(id) {
        return this.state.wines.find(wine => wine.id === id);
    }
    
    /**
     * Find similar wines to a given wine
     */
    findSimilarWines(wine, limit = 4) {
        if (!wine || this.state.wines.length === 0) return [];
        
        // Calculate similarity score for each wine
        const similarWines = this.state.wines
            .filter(w => w.id !== wine.id) // Exclude the same wine
            .map(w => {
                let similarityScore = 0;
                
                // Same variety is a strong indicator of similarity
                if (w.variety === wine.variety) {
                    similarityScore += 3;
                }
                
                // Same region is also important
                if (w.region_1 === wine.region_1) {
                    similarityScore += 2;
                }
                
                // Similar price range
                const priceDiff = wine.price && w.price 
                    ? Math.abs(wine.price - w.price) / Math.max(wine.price, w.price)
                    : 1;
                similarityScore += (1 - priceDiff) * 1.5;
                
                // Similar rating
                const ratingDiff = wine.points && w.points 
                    ? Math.abs(wine.points - w.points) / 100
                    : 0.2;
                similarityScore += (1 - ratingDiff) * 1.5;
                
                return {
                    ...w,
                    similarityScore
                };
            });
        
        // Sort by similarity score
        similarWines.sort((a, b) => b.similarityScore - a.similarityScore);
        
        // Return top matches
        return similarWines.slice(0, limit);
    }
    
    /**
     * Get trending wines based on recent interactions
     */
    getTrendingWines(limit = 6) {
        if (this.state.wines.length === 0) return [];
        
        // Get interactions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentInteractions = this.state.interactionHistory.filter(interaction => {
            const interactionDate = new Date(interaction.timestamp);
            return interactionDate >= thirtyDaysAgo;
        });
        
        // Count interactions per wine
        const wineInteractionCounts = {};
        
        recentInteractions.forEach(interaction => {
            if (!wineInteractionCounts[interaction.wineId]) {
                wineInteractionCounts[interaction.wineId] = 0;
            }
            
            // Weight different interactions
            switch (interaction.type) {
                case 'view_details':
                    wineInteractionCounts[interaction.wineId] += 1;
                    break;
                case 'add_to_cart':
                    wineInteractionCounts[interaction.wineId] += 3;
                    break;
                case 'purchase':
                    wineInteractionCounts[interaction.wineId] += 5;
                    break;
                case 'favorite':
                    wineInteractionCounts[interaction.wineId] += 3;
                    break;
            }
        });
        
        // Convert to array and sort
        const trendingWineIds = Object.entries(wineInteractionCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Get wine objects for trending IDs
        const trendingWines = trendingWineIds
            .map(id => this.findWineById(id))
            .filter(wine => wine !== undefined);
        
        // If we don't have enough trending wines, add some top-rated ones
        if (trendingWines.length < limit) {
            const topRatedWines = [...this.state.wines]
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .filter(wine => !trendingWines.some(tw => tw.id === wine.id))
                .slice(0, limit - trendingWines.length);
            
            trendingWines.push(...topRatedWines);
        }
        
        return trendingWines.slice(0, limit);
    }
    
    /**
     * Get seasonal wine recommendations
     */
    getSeasonalRecommendations(limit = 6) {
        if (this.state.wines.length === 0) return [];
        
        // Determine current season
        const currentMonth = new Date().getMonth();
        let season;
        
        if (currentMonth >= 2 && currentMonth <= 4) {
            season = 'spring';
        } else if (currentMonth >= 5 && currentMonth <= 7) {
            season = 'summer';
        } else if (currentMonth >= 8 && currentMonth <= 10) {
            season = 'fall';
        } else {
            season = 'winter';
        }
        
        // Filter wines based on season
        let seasonalWines;
        
        switch (season) {
            case 'spring':
                // Spring: Light reds, aromatic whites
                seasonalWines = this.state.wines.filter(wine => {
                    if (!wine.variety) return false;
                    const variety = wine.variety.toLowerCase();
                    return variety.includes('pinot noir') || 
                           variety.includes('riesling') || 
                           variety.includes('sauvignon blanc') ||
                           variety.includes('rosé');
                });
                break;
                
            case 'summer':
                // Summer: Crisp whites, rosés, light-bodied reds
                seasonalWines = this.state.wines.filter(wine => {
                    if (!wine.variety && !wine.type) return false;
                    const variety = wine.variety ? wine.variety.toLowerCase() : '';
                    const type = wine.type ? wine.type.toLowerCase() : '';
                    return type.includes('white') || 
                           type.includes('rosé') || 
                           variety.includes('pinot grigio') || 
                           variety.includes('sauvignon blanc') ||
                           variety.includes('rosé');
                });
                break;
                
            case 'fall':
                // Fall: Medium-bodied reds, fuller whites
                seasonalWines = this.state.wines.filter(wine => {
                    if (!wine.variety) return false;
                    const variety = wine.variety.toLowerCase();
                    return variety.includes('merlot') || 
                           variety.includes('syrah') || 
                           variety.includes('zinfandel') ||
                           variety.includes('chardonnay');
                });
                break;
                
            case 'winter':
                // Winter: Full-bodied reds, rich whites
                seasonalWines = this.state.wines.filter(wine => {
                    if (!wine.variety) return false;
                    const variety = wine.variety.toLowerCase();
                    return variety.includes('cabernet') || 
                           variety.includes('malbec') || 
                           variety.includes('shiraz') ||
                           variety.includes('port');
                });
                break;
        }
        
        // Sort by rating
        seasonalWines.sort((a, b) => (b.points || 0) - (a.points || 0));
        
        // If we don't have enough wines, add some high-rated ones
        if (seasonalWines.length < limit) {
            const additionalWines = this.state.wines
                .filter(wine => !seasonalWines.some(sw => sw.id === wine.id))
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .slice(0, limit - seasonalWines.length);
            
            seasonalWines.push(...additionalWines);
        }
        
        return seasonalWines.slice(0, limit);
    }
    
    /**
     * Get wine recommendations based on meal/dish
     */
    getMealPairingRecommendations(meal, limit = 6) {
        if (!meal || this.state.wines.length === 0) return [];
        
        const mealType = meal.toLowerCase();
        let recommendedWines = [];
        
        // Define pairings for common meal types
        const pairings = {
            'beef': {
                varieties: ['cabernet sauvignon', 'malbec', 'syrah', 'merlot'],
                type: 'red'
            },
            'steak': {
                varieties: ['cabernet sauvignon', 'malbec', 'syrah'],
                type: 'red'
            },
            'lamb': {
                varieties: ['cabernet sauvignon', 'syrah', 'merlot', 'pinot noir'],
                type: 'red'
            },
            'pork': {
                varieties: ['pinot noir', 'merlot', 'zinfandel', 'chardonnay'],
                type: ['red', 'white']
            },
            'chicken': {
                varieties: ['chardonnay', 'pinot noir', 'sauvignon blanc', 'riesling'],
                type: ['red', 'white']
            },
            'turkey': {
                varieties: ['pinot noir', 'zinfandel', 'chardonnay', 'riesling'],
                type: ['red', 'white']
            },
            'fish': {
                varieties: ['sauvignon blanc', 'pinot grigio', 'chardonnay', 'albariño'],
                type: 'white'
            },
            'salmon': {
                varieties: ['pinot noir', 'chardonnay', 'rosé'],
                type: ['red', 'white', 'rosé']
            },
            'seafood': {
                varieties: ['sauvignon blanc', 'pinot grigio', 'albariño', 'champagne'],
                type: ['white', 'sparkling']
            },
            'pasta': {
                varieties: ['sangiovese', 'nebbiolo', 'pinot noir', 'chardonnay'],
                type: ['red', 'white']
            },
            'pizza': {
                varieties: ['sangiovese', 'barbera', 'zinfandel'],
                type: 'red'
            },
            'cheese': {
                varieties: ['cabernet sauvignon', 'chardonnay', 'champagne', 'port'],
                type: ['red', 'white', 'sparkling', 'dessert']
            },
            'dessert': {
                varieties: ['moscato', 'riesling', 'port', 'sauternes'],
                type: ['dessert', 'white']
            },
            'chocolate': {
                varieties: ['port', 'cabernet sauvignon', 'zinfandel'],
                type: ['dessert', 'red']
            },
            'spicy': {
                varieties: ['riesling', 'gewürztraminer', 'zinfandel'],
                type: ['white', 'red']
            },
            'vegetarian': {
                varieties: ['pinot noir', 'sauvignon blanc', 'riesling'],
                type: ['red', 'white']
            }
        };
        
        // Find matching pairing
        let matchedPairing = null;
        
        for (const [key, value] of Object.entries(pairings)) {
            if (mealType.includes(key)) {
                matchedPairing = value;
                break;
            }
        }
        
        // If no specific pairing found, use a general recommendation
        if (!matchedPairing) {
            matchedPairing = {
                varieties: ['cabernet sauvignon', 'chardonnay', 'pinot noir', 'sauvignon blanc'],
                type: ['red', 'white']
            };
        }
        
        // Filter wines based on pairing
        recommendedWines = this.state.wines.filter(wine => {
            if (!wine.variety && !wine.type) return false;
            
            const variety = wine.variety ? wine.variety.toLowerCase() : '';
            const type = wine.type ? wine.type.toLowerCase() : '';
            
            // Check if wine variety matches any recommended variety
            const varietyMatch = matchedPairing.varieties.some(v => 
                variety.includes(v)
            );
            
            // Check if wine type matches recommended type(s)
            const typeMatch = Array.isArray(matchedPairing.type)
                ? matchedPairing.type.includes(type)
                : type === matchedPairing.type;
            
            return varietyMatch || typeMatch;
        });
        
        // Sort by rating
        recommendedWines.sort((a, b) => (b.points || 0) - (a.points || 0));
        
        return recommendedWines.slice(0, limit);
    }
    
    /**
     * Set up event listeners for recommendation engine
     */
    setupEventListeners() {
        // Listen for wine interactions
        document.addEventListener('click', (event) => {
            // Wine card click
            const wineCard = event.target.closest('.wine-card');
            if (wineCard) {
                const wineId = wineCard.getAttribute('data-id');
                if (wineId) {
                    const wine = this.findWineById(wineId);
                    if (wine) {
                        this.recordInteraction(wine, 'view_details');
                    }
                }
            }
            
            // Add to cart button click
            const addToCartBtn = event.target.closest('.add-btn');
            if (addToCartBtn) {
                const wineId = addToCartBtn.getAttribute('data-id');
                if (wineId) {
                    const wine = this.findWineById(wineId);
                    if (wine) {
                        this.recordInteraction(wine, 'add_to_cart');
                    }
                }
            }
            
            // Favorite button click
            const favoriteBtn = event.target.closest('.favorite-btn');
            if (favoriteBtn) {
                const wineId = favoriteBtn.getAttribute('data-id');
                if (wineId) {
                    const wine = this.findWineById(wineId);
                    if (wine) {
                        const isFavorite = favoriteBtn.classList.contains('active');
                        this.recordInteraction(wine, isFavorite ? 'favorite' : 'unfavorite');
                    }
                }
            }
        });
        
        // Listen for search and filter changes
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (event) => {
                const searchInput = document.getElementById('search-input');
                if (searchInput && searchInput.value.trim()) {
                    // Record search query for future analytics
                    console.log('Search query:', searchInput.value);
                }
            });
        }
        
        // Listen for filter form submission
        const filterForm = document.getElementById('filter-form');
        if (filterForm) {
            filterForm.addEventListener('submit', (event) => {
                // Update user preferences based on filter selections
                const regionSelect = document.getElementById('region');
                const varietySelect = document.getElementById('variety');
                const minPriceInput = document.getElementById('minPrice');
                const maxPriceInput = document.getElementById('maxPrice');
                const ratingInput = document.getElementById('rating');
                
                if (regionSelect && regionSelect.value) {
                    if (!this.state.userPreferences.preferredRegions.includes(regionSelect.value)) {
                        this.state.userPreferences.preferredRegions.push(regionSelect.value);
                    }
                }
                
                if (varietySelect && varietySelect.value) {
                    if (!this.state.userPreferences.preferredVarieties.includes(varietySelect.value)) {
                        this.state.userPreferences.preferredVarieties.push(varietySelect.value);
                    }
                }
                
                if (minPriceInput && maxPriceInput) {
                    this.state.userPreferences.priceRange.min = parseInt(minPriceInput.value) || 0;
                    this.state.userPreferences.priceRange.max = parseInt(maxPriceInput.value) || 500;
                }
                
                if (ratingInput) {
                    this.state.userPreferences.minRating = parseInt(ratingInput.value) || 85;
                }
                
                // Save updated preferences
                this.saveUserPreferences();
            });
        }
    }
    
    /**
     * Update recommendations UI
     */
    updateRecommendationsUI() {
        // Check if recommendations panel exists
        const recommendationsContainer = document.getElementById('recommendations-container');
        if (!recommendationsContainer || this.state.recommendations.length === 0) return;
        
        // Create HTML for recommendations
        let html = '';
        
        this.state.recommendations.slice(0, 3).forEach(wine => {
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
        recommendationsContainer.innerHTML = html;
        
        // Add event listeners
        const recommendationItems = recommendationsContainer.querySelectorAll('.recommendation-item');
        recommendationItems.forEach(item => {
            item.addEventListener('click', () => {
                const wineId = item.getAttribute('data-id');
                const wine = this.findWineById(wineId);
                
                if (wine) {
                    this.recordInteraction(wine, 'view_details');
                    
                    // In a real app, you would navigate to the wine details page
                    // window.location.href = `wine-detail.html?id=${wineId}`;
                }
            });
        });
    }
}

// Initialize recommendation engine when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create and expose recommendation engine globally
    window.recommendationEngine = new WineRecommendationEngine();
});