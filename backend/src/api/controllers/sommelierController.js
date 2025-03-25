const Wine = require('../../models/Wine');
const { logger } = require('../../config/logger');

/**
 * @desc Get personalized wine recommendations
 * @route POST /api/sommelier/recommendations
 * @access Public
 */
exports.getWineRecommendations = async (req, res, next) => {
  try {
    const {
      preferences = {},
      limit = 10
    } = req.body;
    
    // Extract preference parameters
    const {
      types = [],
      regions = [],
      priceRange = {},
      flavors = {},
      occasion,
      food
    } = preferences;
    
    // Build query
    const query = {};
    
    // Wine types filter
    if (types.length > 0) {
      query.type = { $in: types };
    }
    
    // Regions filter
    if (regions.length > 0) {
      query.region = { $in: regions };
    }
    
    // Price range filter
    if (priceRange.min || priceRange.max) {
      query.price = {};
      if (priceRange.min) query.price.$gte = priceRange.min;
      if (priceRange.max) query.price.$lte = priceRange.max;
    }
    
    // Basic recommendation algorithm
    // In a real app, this would use ML-based recommendations
    const wines = await Wine.find(query)
      .limit(parseInt(limit, 10))
      .sort({ rating: -1 });
    
    // For each wine, calculate a match score based on preferences
    const recommendations = wines.map(wine => {
      // Calculate match score based on flavor preferences (simplified)
      let matchScore = 85; // Base score
      
      // Add logic to adjust match score based on flavor preferences
      if (flavors.sweet && wine.flavorProfile?.sweetness) {
        matchScore += (5 - Math.abs(flavors.sweet - wine.flavorProfile.sweetness)) * 2;
      }
      
      if (flavors.body && wine.flavorProfile?.body) {
        matchScore += (5 - Math.abs(flavors.body - wine.flavorProfile.body)) * 2;
      }
      
      // Adjust for food pairings
      if (food && wine.foodPairings && wine.foodPairings.some(f => f.toLowerCase().includes(food.toLowerCase()))) {
        matchScore += 5;
      }
      
      // Ensure score is within bounds
      matchScore = Math.min(100, Math.max(0, matchScore));
      
      return {
        ...wine.toObject(),
        matchScore: Math.round(matchScore)
      };
    });
    
    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    logger.error(`Error getting wine recommendations: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get similar wines to a specified wine
 * @route GET /api/sommelier/similar/:wineId
 * @access Public
 */
exports.getSimilarWines = async (req, res, next) => {
  try {
    const { wineId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Find the source wine
    const sourceWine = await Wine.findById(wineId);
    
    if (!sourceWine) {
      return res.status(404).json({
        success: false,
        error: 'Wine not found'
      });
    }
    
    // Build query to find similar wines
    const query = {
      _id: { $ne: wineId }, // Exclude the source wine
      $or: []
    };
    
    // Similar type
    if (sourceWine.type) {
      query.$or.push({ type: sourceWine.type });
    }
    
    // Similar region
    if (sourceWine.region) {
      query.$or.push({ region: sourceWine.region });
    }
    
    // Similar varietal
    if (sourceWine.varietal) {
      query.$or.push({ varietal: sourceWine.varietal });
    }
    
    // Similar price range (±30%)
    if (sourceWine.price) {
      const minPrice = sourceWine.price * 0.7;
      const maxPrice = sourceWine.price * 1.3;
      query.$or.push({ price: { $gte: minPrice, $lte: maxPrice } });
    }
    
    // Find similar wines
    const similarWines = await Wine.find(query)
      .limit(limit)
      .sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      count: similarWines.length,
      data: similarWines
    });
  } catch (error) {
    logger.error(`Error finding similar wines: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get perfect wine pairings for meal or occasion
 * @route POST /api/sommelier/pairings
 * @access Public
 */
exports.getPerfectPairings = async (req, res, next) => {
  try {
    const { meal, cuisine, occasion, limit = 5 } = req.body;
    
    // Build query
    const query = {};
    
    // For a real app, this would be more sophisticated
    if (meal) {
      query.foodPairings = { $elemMatch: { $regex: meal, $options: 'i' } };
    }
    
    // Find wines with matching food pairings
    const wines = await Wine.find(query)
      .limit(parseInt(limit, 10))
      .sort({ rating: -1 });
    
    // If no specific matching wines found, fallback to common pairings
    if (wines.length === 0) {
      // Common pairings based on cuisine or meal type
      const fallbackQuery = {};
      
      if (cuisine === 'Italian') {
        fallbackQuery.$or = [
          { region: 'Tuscany' },
          { region: 'Piedmont' },
          { varietal: 'Sangiovese' },
          { varietal: 'Nebbiolo' }
        ];
      } else if (cuisine === 'French') {
        fallbackQuery.$or = [
          { region: 'Bordeaux' },
          { region: 'Burgundy' },
          { varietal: 'Cabernet Sauvignon' },
          { varietal: 'Pinot Noir' }
        ];
      } else if (meal && meal.toLowerCase().includes('seafood')) {
        fallbackQuery.type = 'White';
      } else if (meal && meal.toLowerCase().includes('steak')) {
        fallbackQuery.type = 'Red';
      }
      
      // Get fallback recommendations
      const fallbackWines = await Wine.find(fallbackQuery)
        .limit(parseInt(limit, 10))
        .sort({ rating: -1 });
      
      return res.status(200).json({
        success: true,
        count: fallbackWines.length,
        data: fallbackWines,
        message: 'No exact matches found. Here are some recommended alternatives.'
      });
    }
    
    res.status(200).json({
      success: true,
      count: wines.length,
      data: wines
    });
  } catch (error) {
    logger.error(`Error finding wine pairings: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get detailed taste profile for a wine
 * @route GET /api/sommelier/taste-profile/:wineId
 * @access Public
 */
exports.getTasteProfile = async (req, res, next) => {
  try {
    const { wineId } = req.params;
    
    // Find the wine
    const wine = await Wine.findById(wineId);
    
    if (!wine) {
      return res.status(404).json({
        success: false,
        error: 'Wine not found'
      });
    }
    
    // Extract taste profile data
    const tasteProfile = {
      basic: {
        sweetness: wine.flavorProfile?.sweetness || 0,
        acidity: wine.flavorProfile?.acidity || 0,
        tannins: wine.flavorProfile?.tannins || 0,
        body: wine.flavorProfile?.body || 0,
        alcohol: wine.flavorProfile?.alcohol || 0
      },
      aromas: wine.aromas || [],
      flavors: wine.flavors || [],
      description: wine.tastingNotes || wine.description || 'No tasting notes available'
    };
    
    // Add additional taste data based on wine type (simplified)
    if (wine.type === 'Red') {
      tasteProfile.characteristics = [
        'Typically more tannins',
        'Often aged in oak',
        'Generally served at room temperature'
      ];
    } else if (wine.type === 'White') {
      tasteProfile.characteristics = [
        'Generally higher acidity',
        'Often fruit-forward',
        'Usually served chilled'
      ];
    } else if (wine.type === 'Sparkling') {
      tasteProfile.characteristics = [
        'Effervescent',
        'Usually high acidity',
        'Served well-chilled'
      ];
    }
    
    res.status(200).json({
      success: true,
      data: tasteProfile
    });
  } catch (error) {
    logger.error(`Error getting taste profile: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get food pairing suggestions for a wine
 * @route GET /api/sommelier/food-pairings/:wineId
 * @access Public
 */
exports.getFoodPairings = async (req, res, next) => {
  try {
    const { wineId } = req.params;
    
    // Find the wine
    const wine = await Wine.findById(wineId);
    
    if (!wine) {
      return res.status(404).json({
        success: false,
        error: 'Wine not found'
      });
    }
    
    // Get stored food pairings
    const storedPairings = wine.foodPairings || [];
    
    // Generate additional pairings based on wine characteristics
    let suggestedPairings = [];
    
    // In a real app, this would be more sophisticated and possibly use ML
    if (wine.type === 'Red') {
      if (wine.flavorProfile?.body >= 4) { // Full-bodied red
        suggestedPairings = [
          'Grilled ribeye steak',
          'Lamb chops',
          'Aged cheeses',
          'Wild game'
        ];
      } else if (wine.flavorProfile?.body >= 3) { // Medium-bodied red
        suggestedPairings = [
          'Roast chicken',
          'Mushroom dishes',
          'Duck',
          'Pork tenderloin'
        ];
      } else { // Light-bodied red
        suggestedPairings = [
          'Salmon',
          'Tuna',
          'Charcuterie',
          'Pizza'
        ];
      }
    } else if (wine.type === 'White') {
      if (wine.flavorProfile?.body >= 3) { // Full-bodied white
        suggestedPairings = [
          'Lobster with butter',
          'Creamy pasta dishes',
          'Roast chicken',
          'Veal'
        ];
      } else { // Light to medium-bodied white
        suggestedPairings = [
          'Shellfish',
          'Light salads',
          'Mild cheeses',
          'Vegetable dishes'
        ];
      }
    } else if (wine.type === 'Sparkling') {
      suggestedPairings = [
        'Oysters',
        'Fried foods',
        'Sushi',
        'Light appetizers'
      ];
    }
    
    // Combine and deduplicate pairings
    const allPairings = [...new Set([...storedPairings, ...suggestedPairings])];
    
    res.status(200).json({
      success: true,
      count: allPairings.length,
      data: {
        storedPairings,
        suggestedPairings,
        allPairings
      }
    });
  } catch (error) {
    logger.error(`Error getting food pairings: ${error.message}`);
    next(error);
  }
};