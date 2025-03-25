const express = require('express');
const router = express.Router();
const { 
  getWines, 
  getWineById, 
  searchWines,
  getWinesByRegion,
  getWinesByType,
  getWinesByVarietal,
  getWinesByPriceRange,
  getTopRatedWines
} = require('../controllers/wineController');
const { protect } = require('../middlewares/auth');

/**
 * @route GET /api/wines
 * @desc Get all wines with pagination
 * @access Public
 */
router.get('/', getWines);

/**
 * @route GET /api/wines/search
 * @desc Search wines by query
 * @access Public
 */
router.get('/search', searchWines);

/**
 * @route GET /api/wines/region/:region
 * @desc Get wines by region
 * @access Public
 */
router.get('/region/:region', getWinesByRegion);

/**
 * @route GET /api/wines/type/:type
 * @desc Get wines by type
 * @access Public
 */
router.get('/type/:type', getWinesByType);

/**
 * @route GET /api/wines/varietal/:varietal
 * @desc Get wines by varietal
 * @access Public
 */
router.get('/varietal/:varietal', getWinesByVarietal);

/**
 * @route GET /api/wines/price
 * @desc Get wines by price range
 * @access Public
 */
router.get('/price', getWinesByPriceRange);

/**
 * @route GET /api/wines/top-rated
 * @desc Get top rated wines
 * @access Public
 */
router.get('/top-rated', getTopRatedWines);

/**
 * @route GET /api/wines/:id
 * @desc Get single wine by ID
 * @access Public
 */
router.get('/:id', getWineById);

module.exports = router;