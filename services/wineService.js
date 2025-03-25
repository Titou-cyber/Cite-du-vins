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
const getAllWines = (page = 1, limit = 20) => {
  // Ensure page and limit are numbers
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  
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
  try {
    // Load all wines
    const allWines = loadWines();
    
    console.log(`Total wines before filtering: ${allWines.length}`);
    console.log('Filter criteria:', { 
      region: region || 'not specified', 
      variety: variety || 'not specified', 
      minPrice: minPrice || 'not specified', 
      maxPrice: maxPrice || 'not specified' 
    });
    
    // If no filters applied, return all wines
    if (!region && !variety && !minPrice && !maxPrice) {
      console.log('No filters applied, returning all wines');
      return allWines;
    }
    
    // Convert price filters to numbers if provided
    const minPriceValue = minPrice ? parseFloat(minPrice) : null;
    const maxPriceValue = maxPrice ? parseFloat(maxPrice) : null;
    
    // Apply filters one by one to see which ones might be causing issues
    let filtered = [...allWines];
    
    // Apply region filter if specified
    if (region && region.trim() !== '') {
      const regionLower = region.toLowerCase().trim();
      
      filtered = filtered.filter(wine => {
        const region1Match = wine.region_1 && wine.region_1.toLowerCase().includes(regionLower);
        const region2Match = wine.region_2 && wine.region_2.toLowerCase().includes(regionLower);
        return region1Match || region2Match;
      });
      
      console.log(`After region filter (${region}): ${filtered.length} wines`);
    }
    
    // Apply variety filter if specified
    if (variety && variety.trim() !== '') {
      const varietyLower = variety.toLowerCase().trim();
      
      filtered = filtered.filter(wine => {
        return wine.variety && wine.variety.toLowerCase().includes(varietyLower);
      });
      
      console.log(`After variety filter (${variety}): ${filtered.length} wines`);
    }
    
    // Apply price filters if specified
    if (minPriceValue !== null) {
      filtered = filtered.filter(wine => wine.price && wine.price >= minPriceValue);
      console.log(`After min price filter (${minPriceValue}): ${filtered.length} wines`);
    }
    
    if (maxPriceValue !== null) {
      filtered = filtered.filter(wine => wine.price && wine.price <= maxPriceValue);
      console.log(`After max price filter (${maxPriceValue}): ${filtered.length} wines`);
    }
    
    console.log(`Final count after all filters: ${filtered.length} wines`);
    
    // Analyze data if no results found
    if (filtered.length === 0) {
      console.log('No wines matched all filters. Analyzing data to help troubleshoot:');
      
      // Check for region existence if that filter was applied
      if (region && region.trim() !== '') {
        const regionLower = region.toLowerCase().trim();
        const regionsInData = new Set();
        
        allWines.forEach(wine => {
          if (wine.region_1) regionsInData.add(wine.region_1.toLowerCase());
          if (wine.region_2) regionsInData.add(wine.region_2.toLowerCase());
        });
        
        const exactMatch = regionsInData.has(regionLower);
        console.log(`Exact match for region "${region}" in data: ${exactMatch}`);
        
        // Find similar regions for troubleshooting
        const similarRegions = Array.from(regionsInData).filter(r => 
          r.includes(regionLower) || regionLower.includes(r)
        );
        
        if (similarRegions.length > 0) {
          console.log(`Similar regions found: ${similarRegions.join(', ')}`);
        }
      }
      
      // Check for variety existence if that filter was applied
      if (variety && variety.trim() !== '') {
        const varietyLower = variety.toLowerCase().trim();
        const varietiesInData = new Set();
        
        allWines.forEach(wine => {
          if (wine.variety) varietiesInData.add(wine.variety.toLowerCase());
        });
        
        const exactMatch = varietiesInData.has(varietyLower);
        console.log(`Exact match for variety "${variety}" in data: ${exactMatch}`);
        
        // Find similar varieties for troubleshooting
        const similarVarieties = Array.from(varietiesInData).filter(v => 
          v.includes(varietyLower) || varietyLower.includes(v)
        );
        
        if (similarVarieties.length > 0) {
          console.log(`Similar varieties found: ${similarVarieties.join(', ')}`);
        }
      }
    }
    
    return filtered;
  } catch (error) {
    console.error('Error in filterWines function:', error);
    return []; // Return empty array instead of throwing error
  }
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