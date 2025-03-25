const express = require('express');
const router = express.Router();
const { 
  getWineRecommendations,
  getSimilarWines,
  getPerfectPairings,
  getTasteProfile,
  getFoodPairings
} = require('../controllers/sommelierController');
const { protect } = require('../middlewares/auth');

/**
 * @route POST /api/sommelier/recommendations
 * @desc Get personalized wine recommendations
 * @access Public
 */
router.post('/recommendations', getWineRecommendations);

/**
 * @route GET /api/sommelier/similar/:wineId
 * @desc Get similar wines to a specified wine
 * @access Public
 */
router.get('/similar/:wineId', getSimilarWines);

/**
 * @route POST /api/sommelier/pairings
 * @desc Get perfect wine pairings for meal or occasion
 * @access Public
 */
router.post('/pairings', getPerfectPairings);

/**
 * @route GET /api/sommelier/taste-profile/:wineId
 * @desc Get detailed taste profile for a wine
 * @access Public
 */
router.get('/taste-profile/:wineId', getTasteProfile);

/**
 * @route GET /api/sommelier/food-pairings/:wineId
 * @desc Get food pairing suggestions for a wine
 * @access Public
 */
router.get('/food-pairings/:wineId', getFoodPairings);

module.exports = router;