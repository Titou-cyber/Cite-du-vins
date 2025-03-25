// Fix in routes/api.js - Search route issue
// Move the search route before the ID route to prevent conflicts

const express = require('express');
const router = express.Router();
const wineService = require('../services/wineService');

// Get all wines
router.get('/wines', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    console.log(`API request for wines: page=${page}, limit=${limit}`);
    
    const wines = wineService.getAllWines(page, limit);
    res.json(wines);
  } catch (error) {
    console.error('Error fetching wines:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search wines - MOVED BEFORE :id route to ensure it takes precedence
router.get('/wines/search', (req, res) => {
  try {
    const { query } = req.query;
    const results = wineService.searchWines(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get wine by ID
router.get('/wines/:id', (req, res) => {
  try {
    const wine = wineService.getWineById(req.params.id);
    if (wine) {
      res.json(wine);
    } else {
      res.status(404).json({ message: 'Wine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enhanced filter endpoint with better error handling
router.get('/wines/filter', (req, res) => {
  try {
    console.log('Raw filter request query:', req.query);
    
    // Extract filters with more options
    const { region, variety, minPrice, maxPrice, type, country, rating } = req.query;
    
    console.log('Processing filter request with params:', {
      region: region || 'not specified',
      variety: variety || 'not specified',
      minPrice: minPrice || 'not specified',
      maxPrice: maxPrice || 'not specified',
      type: type || 'not specified',
      country: country || 'not specified',
      rating: rating || 'not specified'
    });
    
    // Get filtered wines
    const results = wineService.filterWines(region, variety, minPrice, maxPrice, type, country, rating);
    
    console.log(`Filter returned ${results.length} wines`);
    
    // Always return a successful response, even if no wines match
    return res.json(results);
  } catch (error) {
    console.error('Server error during filtering:', error);
    // Send a clear error message
    return res.status(500).json({ 
      message: 'Server error while filtering wines', 
      details: error.message 
    });
  }
});

// NEW: Get wine details with recommendations
router.get('/wines/:id/details', (req, res) => {
  try {
    const wineDetails = wineService.getWineDetailsWithRecommendations(req.params.id);
    if (wineDetails) {
      res.json(wineDetails);
    } else {
      res.status(404).json({ message: 'Wine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Other existing routes...
module.exports = router;