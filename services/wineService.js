const fs = require('fs');
const path = require('path');

// Load wine data from JSON file
const loadWines = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/wines.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading wine data:', error);
    return [];
  }
};

// Get all wines with optional pagination
const getAllWines = (page = 1, limit = 21) => {
  // Ensure page and limit are numbers
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 21;
  
  const wines = loadWines();
  
  // Calculate start and end indices for slicing
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Get only the wines for the current page
  const paginatedWines = wines.slice(startIndex, endIndex);
  
  console.log(`Pagination: Returning ${paginatedWines.length} wines for page ${page}, limit ${limit}`);
  console.log(`Indices: start=${startIndex}, end=${endIndex}, total wines=${wines.length}`);
  
  return {
    total: wines.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(wines.length / limit),
    wines: paginatedWines
  };
};

// Get wine by ID (using index as ID for simplicity)
const getWineById = (id) => {
  const wines = loadWines();
  const index = parseInt(id);
  if (isNaN(index) || index < 0 || index >= wines.length) {
    return null;
  }
  return wines[index];
};

// Search wines by title, description, or winery
const searchWines = (query) => {
  if (!query) return [];
  
  const wines = loadWines();
  const lowercaseQuery = query.toLowerCase();
  
  return wines.filter(wine => {
    return (
      (wine.title && wine.title.toLowerCase().includes(lowercaseQuery)) ||
      (wine.description && wine.description.toLowerCase().includes(lowercaseQuery)) ||
      (wine.winery && wine.winery.toLowerCase().includes(lowercaseQuery))
    );
  });
};

// Filter wines by region, variety, and price range
const filterWines = (region, variety, minPrice, maxPrice) => {
  const wines = loadWines();
  
  return wines.filter(wine => {
    const matchesRegion = !region || wine.region_1 === region || wine.region_2 === region;
    const matchesVariety = !variety || wine.variety === variety;
    const matchesMinPrice = !minPrice || (wine.price && wine.price >= parseFloat(minPrice));
    const matchesMaxPrice = !maxPrice || (wine.price && wine.price <= parseFloat(maxPrice));
    
    return matchesRegion && matchesVariety && matchesMinPrice && matchesMaxPrice;
  });
};

// Simple recommendation system (in a real system, this would be more sophisticated)
const getRecommendations = (userId) => {
  // This is a placeholder for a real recommendation system
  // In a real implementation, you would:
  // 1. Fetch user preferences and purchase history
  // 2. Apply a recommendation algorithm
  
  const wines = loadWines();
  
  // For now, just return 5 random high-rated wines
  return wines
    .filter(wine => wine.points >= 90)
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
};

// Get unique regions
const getUniqueRegions = () => {
  const wines = loadWines();
  const regions = new Set();
  
  wines.forEach(wine => {
    if (wine.region_1) regions.add(wine.region_1);
    if (wine.region_2) regions.add(wine.region_2);
  });
  
  return Array.from(regions).filter(Boolean).sort();
};

// Get unique varieties
const getUniqueVarieties = () => {
  const wines = loadWines();
  const varieties = new Set();
  
  wines.forEach(wine => {
    if (wine.variety) varieties.add(wine.variety);
  });
  
  return Array.from(varieties).filter(Boolean).sort();
};

module.exports = {
  getAllWines,
  getWineById,
  searchWines,
  filterWines,
  getRecommendations,
  getUniqueRegions,
  getUniqueVarieties
};