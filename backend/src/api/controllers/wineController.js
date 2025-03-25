const Wine = require('../../models/Wine');
const { logger } = require('../../config/logger');

/**
 * @desc Get all wines with pagination
 * @route GET /api/wines
 * @access Public
 */
exports.getWines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const total = await Wine.countDocuments();
    const wines = await Wine.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ points: -1 }); // Using points instead of rating for sorting
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: wines.length,
      pagination,
      data: wines
    });
  } catch (error) {
    logger.error(`Error fetching wines: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get single wine by ID
 * @route GET /api/wines/:id
 * @access Public
 */
exports.getWineById = async (req, res, next) => {
  try {
    const wine = await Wine.findById(req.params.id);
    
    if (!wine) {
      return res.status(404).json({
        success: false,
        error: 'Wine not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: wine
    });
  } catch (error) {
    logger.error(`Error fetching wine by ID: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Search wines by query
 * @route GET /api/wines/search
 * @access Public
 */
exports.searchWines = async (req, res, next) => {
  try {
    const { q, type, country, minPrice, maxPrice, minRating, varietal } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filters - handling both English and French field names
    if (country) query.country = country;
    if (varietal) {
      query.$or = [
        { varietal },
        { variété: varietal }
      ];
    }
    
    // Price range - handle both price and prix
    if (minPrice || maxPrice) {
      query.$or = [
        { price: {} },
        { prix: {} }
      ];
      
      if (minPrice) {
        const minValue = Number(minPrice);
        query.$or[0].price.$gte = minValue;
        query.$or[1].prix.$gte = minValue;
      }
      
      if (maxPrice) {
        const maxValue = Number(maxPrice);
        query.$or[0].price.$lte = maxValue;
        query.$or[1].prix.$lte = maxValue;
      }
    }
    
    // Minimum rating - handle as points
    if (minRating) {
      query.points = { $gte: Number(minRating) };
    }
    
    // Execute query
    const total = await Wine.countDocuments(query);
    const wines = await Wine.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ points: -1 }); // Sort by points
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: wines.length,
      pagination,
      data: wines
    });
  } catch (error) {
    logger.error(`Error searching wines: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get wines by region
 * @route GET /api/wines/region/:region
 * @access Public
 */
exports.getWinesByRegion = async (req, res, next) => {
  try {
    const { region } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Execute query - check both region and region_1 fields
    const query = {
      $or: [
        { region },
        { region_1: region }
      ]
    };
    
    const total = await Wine.countDocuments(query);
    const wines = await Wine.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ points: -1 });
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: wines.length,
      pagination,
      data: wines
    });
  } catch (error) {
    logger.error(`Error fetching wines by region: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get wines by varietal
 * @route GET /api/wines/varietal/:varietal
 * @access Public
 */
exports.getWinesByVarietal = async (req, res, next) => {
  try {
    const { varietal } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Execute query - check both varietal and variété fields
    const query = {
      $or: [
        { varietal },
        { variété: varietal }
      ]
    };
    
    const total = await Wine.countDocuments(query);
    const wines = await Wine.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ points: -1 });
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: wines.length,
      pagination,
      data: wines
    });
  } catch (error) {
    logger.error(`Error fetching wines by varietal: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get wines by price range
 * @route GET /api/wines/price
 * @access Public
 */
exports.getWinesByPriceRange = async (req, res, next) => {
  try {
    const { min, max } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Build query - handle both price and prix fields
    const query = {
      $or: [
        { price: {} },
        { prix: {} }
      ]
    };
    
    if (min) {
      const minValue = Number(min);
      query.$or[0].price.$gte = minValue;
      query.$or[1].prix.$gte = minValue;
    }
    
    if (max) {
      const maxValue = Number(max);
      query.$or[0].price.$lte = maxValue;
      query.$or[1].prix.$lte = maxValue;
    }
    
    // Execute query
    const total = await Wine.countDocuments(query);
    const wines = await Wine.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ prix: 1, price: 1 }); // Sort by price ascending
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: wines.length,
      pagination,
      data: wines
    });
  } catch (error) {
    logger.error(`Error fetching wines by price range: ${error.message}`);
    next(error);
  }
};

/**
 * @desc Get top rated wines
 * @route GET /api/wines/top-rated
 * @access Public
 */
exports.getTopRatedWines = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Execute query - using points field
    const wines = await Wine.find({ points: { $gte: 90 } })
      .sort({ points: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: wines.length,
      data: wines
    });
  } catch (error) {
    logger.error(`Error fetching top rated wines: ${error.message}`);
    next(error);
  }
};