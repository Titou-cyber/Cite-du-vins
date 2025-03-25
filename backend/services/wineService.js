// Enhanced wineService.js with improved search and filtering

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

// Enhanced search with fuzzy matching and multiple fields
const searchWines = (query) => {
  if (!query) return [];
  
  const wines = loadWines();
  const lowercaseQuery = query.toLowerCase().trim();
  const terms = lowercaseQuery.split(/\s+/);
  
  return wines.filter(wine => {
    // Calculate a relevance score
    let relevanceScore = 0;
    
    // Check multiple fields with different weights
    const fields = [
      { name: 'title', weight: 3 },
      { name: 'winery', weight: 2 },
      { name: 'variety', weight: 1.5 },
      { name: 'region_1', weight: 1 },
      { name: 'region_2', weight: 0.5 },
      { name: 'description', weight: 0.3 }
    ];
    
    fields.forEach(field => {
      if (wine[field.name]) {
        const text = wine[field.name].toLowerCase();
        
        // Exact match gets a high score
        if (text === lowercaseQuery) {
          relevanceScore += field.weight * 3;
        }
        // Contains full query as substring
        else if (text.includes(lowercaseQuery)) {
          relevanceScore += field.weight * 2;
        }
        // Check for individual terms
        else {
          terms.forEach(term => {
            if (text.includes(term)) {
              relevanceScore += field.weight;
            }
          });
        }
      }
    });
    
    return relevanceScore > 0;
  }).sort((a, b) => {
    // Sort by points first, then price if points are equal
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return (a.price || 0) - (b.price || 0);
  }).slice(0, 50); // Limit to 50 results for performance
};

// Enhanced filter with more criteria
const filterWines = (region, variety, minPrice, maxPrice, type, country, rating) => {
  try {
    // Load all wines
    const allWines = loadWines();
    
    console.log(`Total wines before filtering: ${allWines.length}`);
    
    // If no filters applied, return all wines
    if (!region && !variety && !minPrice && !maxPrice && !type && !country && !rating) {
      console.log('No filters applied, returning all wines');
      return allWines;
    }
    
    // Convert price filters to numbers if provided
    const minPriceValue = minPrice ? parseFloat(minPrice) : null;
    const maxPriceValue = maxPrice ? parseFloat(maxPrice) : null;
    const minRatingValue = rating ? parseFloat(rating) : null;
    
    // Apply filters one by one
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
    
    // Apply type filter if specified (red, white, sparkling, etc.)
    if (type && type.trim() !== '') {
      const typeLower = type.toLowerCase().trim();
      
      filtered = filtered.filter(wine => {
        return wine.type && wine.type.toLowerCase().includes(typeLower);
      });
      
      console.log(`After type filter (${type}): ${filtered.length} wines`);
    }
    
    // Apply country filter if specified
    if (country && country.trim() !== '') {
      const countryLower = country.toLowerCase().trim();
      
      filtered = filtered.filter(wine => {
        return wine.country && wine.country.toLowerCase().includes(countryLower);
      });
      
      console.log(`After country filter (${country}): ${filtered.length} wines`);
    }
    
    // Apply rating filter if specified
    if (minRatingValue !== null) {
      filtered = filtered.filter(wine => wine.points && wine.points >= minRatingValue);
      console.log(`After rating filter (${minRatingValue}): ${filtered.length} wines`);
    }
    
    console.log(`Final count after all filters: ${filtered.length} wines`);
    
    return filtered;
  } catch (error) {
    console.error('Error in filterWines function:', error);
    return []; // Return empty array instead of throwing error
  }
};

// NEW: Get detailed wine information with similar wine recommendations
const getWineDetailsWithRecommendations = (id) => {
  const wines = loadWines();
  const index = parseInt(id);
  
  if (isNaN(index) || index < 0 || index >= wines.length) {
    return null;
  }
  
  const wine = wines[index];
  
  // Find similar wines based on variety, region, and price range
  const similarWines = wines
    .filter(w => w !== wine) // Exclude the current wine
    .filter(w => {
      // Match by variety
      const sameVariety = w.variety === wine.variety;
      
      // Match by region
      const sameRegion = (w.region_1 === wine.region_1) || (w.region_2 === wine.region_2);
      
      // Match by similar price (±30%)
      const similarPrice = wine.price && w.price && 
                           (w.price >= wine.price * 0.7) && 
                           (w.price <= wine.price * 1.3);
      
      // Match by similar rating (±5 points)
      const similarRating = wine.points && w.points && 
                           (w.points >= wine.points - 5) && 
                           (w.points <= wine.points + 5);
      
      // Return true if at least two of the criteria match
      let matchCount = 0;
      if (sameVariety) matchCount++;
      if (sameRegion) matchCount++;
      if (similarPrice) matchCount++;
      if (similarRating) matchCount++;
      
      return matchCount >= 2;
    })
    .sort((a, b) => b.points - a.points) // Sort by highest rating
    .slice(0, 4); // Get top 4 similar wines
  
  // Return the wine with additional information
  return {
    ...wine,
    similar_wines: similarWines
  };
};

// Export all functions
module.exports = {
  getAllWines,
  getWineById,
  searchWines,
  filterWines,
  getRecommendations,
  getUniqueRegions,
  getUniqueVarieties,
  getWineDetailsWithRecommendations
};