const express = require('express');
const router = express.Router();
const wineService = require('../services/wineService');

// Get all wines
router.get('/wines', (req, res) => {
  try {
    const wines = wineService.getAllWines();
    res.json(wines);
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

// Search wines
router.get('/wines/search', (req, res) => {
  try {
    const { query } = req.query;
    const results = wineService.searchWines(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Filter wines
router.get('/wines/filter', (req, res) => {
  try {
    const { region, variety, minPrice, maxPrice } = req.query;
    const results = wineService.filterWines(region, variety, minPrice, maxPrice);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get wine recommendations
router.get('/recommendations/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = wineService.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unique regions
router.get('/regions', (req, res) => {
  try {
    const regions = wineService.getUniqueRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unique varieties
router.get('/varieties', (req, res) => {
  try {
    const varieties = wineService.getUniqueVarieties();
    res.json(varieties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;