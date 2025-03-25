// Wine Map JavaScript

// Variables
let allWines = [];
let wineRegions = [];
let map;
let regionMarkers = [];
let selectedRegion = null;

// DOM Elements
const wineMapContainer = document.getElementById('wine-map');
const regionDetailsContainer = document.getElementById('region-details');
const regionStatsContainer = document.getElementById('region-stats');
const regionTitleElement = document.getElementById('region-title');
const continentSelect = document.getElementById('continent');
const countrySelect = document.getElementById('map-country');
const varietySelect = document.getElementById('map-variety');
const applyMapFiltersButton = document.getElementById('apply-map-filters');

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Initialize the app
async function init() {
    try {
        // Load wine data
        await loadWineData();
        
        // Process wine regions
        processWineRegions();
        
        // Initialize map
        initializeMap();
        
        // Populate filter dropdowns
        populateFilters();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing map:', error);
        wineMapContainer.innerHTML = `
            <div class="alert alert-danger">
                Error loading map data. Please try refreshing the page.
            </div>
        `;
    }
}

// Load wine data
async function loadWineData() {
    try {
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error('Failed to load wine data');
        }
        
        allWines = await response.json();
        
        // If the response is not an array, convert it
        if (!Array.isArray(allWines)) {
            allWines = [allWines];
        }
        
        console.log(`Loaded ${allWines.length} wines`);
    } catch (error) {
        console.error('Error loading wine data:', error);
        throw error;
    }
}

// Process wine regions from wine data
function processWineRegions() {
    // Get unique regions
    const regionMap = new Map();
    
    allWines.forEach(wine => {
        const region = wine.region_1 || wine.region;
        const country = wine.country;
        
        if (region && country) {
            const regionKey = `${region}-${country}`;
            
            if (!regionMap.has(regionKey)) {
                // Create new region entry
                regionMap.set(regionKey, {
                    name: region,
                    country: country,
                    count: 1,
                    varieties: new Set([wine.variété || wine.varietal]),
                    avgRating: wine.points || 0,
                    minPrice: wine.prix || wine.price,
                    maxPrice: wine.prix || wine.price,
                    // Assign coordinates based on region/country (simplified)
                    coordinates: getRegionCoordinates(region, country)
                });
            } else {
                // Update existing region
                const regionData = regionMap.get(regionKey);
                regionData.count++;
                regionData.varieties.add(wine.variété || wine.varietal);
                regionData.avgRating += wine.points || 0;
                
                const price = wine.prix || wine.price || 0;
                if (price > 0) {
                    if (regionData.minPrice === undefined || price < regionData.minPrice) {
                        regionData.minPrice = price;
                    }
                    if (regionData.maxPrice === undefined || price > regionData.maxPrice) {
                        regionData.maxPrice = price;
                    }
                }
            }
        }
    });
    
    // Convert to array and calculate averages
    wineRegions = Array.from(regionMap.values()).map(region => {
        return {
            ...region,
            varieties: Array.from(region.varieties),
            avgRating: region.count > 0 ? (region.avgRating / region.count).toFixed(1) : 'N/A'
        };
    });
    
    console.log(`Processed ${wineRegions.length} wine regions`);
}

// Get coordinates for region (simplified mapping)
function getRegionCoordinates(region, country) {
    // This is a simplified mapping - in a real app, you would use a proper geocoding database
    const regionCoordinates = {
        // France
        'Bordeaux': [44.8378, -0.5792],
        'Burgundy': [47.0521, 4.3875],
        'Champagne': [49.0546, 3.9331],
        'Loire Valley': [47.2512, 0.6865],
        'Rhône Valley': [44.9, 4.8368],
        'Alsace': [48.2391, 7.5284],
        
        // Italy
        'Tuscany': [43.7711, 11.2486],
        'Piedmont': [44.9918, 8.1979],
        'Veneto': [45.4414, 12.3155],
        'Sicily': [37.5994, 14.0154],
        
        // USA
        'Napa Valley': [38.5025, -122.2654],
        'Sonoma': [38.3085, -122.4609],
        'Willamette Valley': [45.2236, -123.0338],
        
        // Spain
        'Rioja': [42.2871, -2.4789],
        'Ribera del Duero': [41.6295, -3.6892],
        
        // Argentina
        'Mendoza': [-32.8908, -68.8272],
        
        // Chile
        'Maipo Valley': [-33.7958, -70.8042],
        
        // Australia
        'Barossa Valley': [-34.5339, 138.9523],
        'Margaret River': [-33.9531, 115.0754],
        
        // New Zealand
        'Marlborough': [-41.5133, 173.8777],
        
        // Germany
        'Mosel': [49.9787, 7.1242],
        
        // South Africa
        'Stellenbosch': [-33.9322, 18.8602]
    };
    
    // Check if we have specific coordinates for this region
    if (regionCoordinates[region]) {
        return regionCoordinates[region];
    }
    
    // If no specific region match, use country coordinates
    const countryCoordinates = {
        'France': [46.6031, 2.3522],
        'Italy': [42.8333, 12.8333],
        'Spain': [40.4168, -3.7038],
        'Portugal': [39.3999, -8.2245],
        'Germany': [51.1657, 10.4515],
        'United States': [37.0902, -95.7129],
        'US': [37.0902, -95.7129],
        'Argentina': [-38.4161, -63.6167],
        'Chile': [-35.6751, -71.5430],
        'Australia': [-25.2744, 133.7751],
        'New Zealand': [-40.9006, 174.8860],
        'South Africa': [-30.5595, 22.9375]
    };
    
    if (countryCoordinates[country]) {
        // Add a small random offset so points don't overlap
        const lat = countryCoordinates[country][0] + (Math.random() * 2 - 1);
        const lng = countryCoordinates[country][1] + (Math.random() * 2 - 1);
        return [lat, lng];
    }
    
    // Default coordinates (mid-Atlantic) if no match
    return [30, -30];
}

// Initialize Leaflet map
function initializeMap() {
    // Create map
    map = L.map(wineMapContainer).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add region markers
    addRegionMarkers();
}

// Add region markers to map
function addRegionMarkers() {
    // Clear existing markers
    regionMarkers.forEach(marker => map.removeLayer(marker));
    regionMarkers = [];
    
    // Add new markers
    wineRegions.forEach(region => {
        if (region.coordinates) {
            // Create marker with popup
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 2, 20),
                fillColor: '#722F37',
                fillOpacity: 0.7,
                color: '#4E0707',
                weight: 1
            }).addTo(map);
            
            // Add popup
            marker.bindPopup(`
                <strong>${region.name}</strong><br>
                ${region.country}<br>
                ${region.count} wines
            `);
            
            // Add click event
            marker.on('click', () => {
                selectedRegion = region;
                displayRegionDetails(region);
                // Update styling to highlight selected
                resetMarkerStyles();
                marker.setStyle({
                    fillColor: '#E6C17B',
                    color: '#722F37',
                    weight: 2
                });
            });
            
            regionMarkers.push(marker);
        }
    });
}

// Reset marker styles
function resetMarkerStyles() {
    regionMarkers.forEach(marker => {
        marker.setStyle({
            fillColor: '#722F37',
            color: '#4E0707',
            weight: 1
        });
    });
}

// Display region details
function displayRegionDetails(region) {
    regionTitleElement.textContent = `${region.name}, ${region.country}`;
    
    // Get wines from this region
    const regionWines = allWines.filter(wine => 
        (wine.region_1 === region.name || wine.region === region.name) && 
        wine.country === region.country
    );
    
    // Sort by rating
    regionWines.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Get top varieties by count
    const varietyCounts = {};
    regionWines.forEach(wine => {
        const variety = wine.variété || wine.varietal;
        if (variety) {
            varietyCounts[variety] = (varietyCounts[variety] || 0) + 1;
        }
    });
    
    const topVarieties = Object.entries(varietyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Display region stats
    regionStatsContainer.innerHTML = `
        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span>Number of Wines:</span>
                <strong>${region.count}</strong>
            </div>
            <div class="d-flex justify-content-between">
                <span>Average Rating:</span>
                <strong>${region.avgRating}/100</strong>
            </div>
            <div class="d-flex justify-content-between">
                <span>Price Range:</span>
                <strong>$${region.minPrice || 'N/A'} - $${region.maxPrice || 'N/A'}</strong>
            </div>
        </div>
        <h6>Top Varieties:</h6>
        <ul class="list-unstyled">
            ${topVarieties.map(([variety, count]) => `
                <li>
                    <div class="d-flex justify-content-between">
                        <span>${variety}</span>
                        <span>${count} wines</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
    
    // Display region details with top wines
    regionDetailsContainer.innerHTML = `
        <p class="mb-3">
            ${region.name} is a wine region in ${region.country} known for its
            ${region.varieties.slice(0, 3).join(', ')} wines.
        </p>
        
        <h6 class="mt-4">Top Rated Wines:</h6>
        <div class="list-group">
            ${regionWines.slice(0, 5).map(wine => `
                <div class="list-group-item list-group-item-action flex-column align-items-start">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${wine.title || 'Unnamed Wine'}</h6>
                        <span class="wine-rating">${wine.points || 'N/A'}</span>
                    </div>
                    <p class="mb-1 small">${wine.description || 'No description available'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small>${wine.winery || 'Unknown Winery'}</small>
                        <span>$${wine.prix || wine.price || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="text-center mt-3">
            <a href="wines.html?region=${encodeURIComponent(region.name)}" class="btn btn-outline-primary btn-sm">
                View All ${region.name} Wines
            </a>
        </div>
    `;
}

// Populate filter options
function populateFilters() {
    // Get unique countries
    const countries = [...new Set(wineRegions.map(region => region.country))].sort();
    
    // Get unique varieties
    const varieties = [...new Set(wineRegions.flatMap(region => region.varieties))].filter(Boolean).sort();
    
    // Add country options
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
    
    // Add variety options
    varieties.forEach(variety => {
        const option = document.createElement('option');
        option.value = variety;
        option.textContent = variety;
        varietySelect.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Apply filters button
    applyMapFiltersButton.addEventListener('click', applyMapFilters);
}

// Apply map filters
function applyMapFilters() {
    const continent = continentSelect.value;
    const country = countrySelect.value;
    const variety = varietySelect.value;
    
    // Filter regions
    let filtered = wineRegions;
    
    if (continent !== 'all') {
        filtered = filtered.filter(region => getContinent(region.country) === continent);
    }
    
    if (country !== 'all') {
        filtered = filtered.filter(region => region.country === country);
    }
    
    if (variety !== 'all') {
        filtered = filtered.filter(region => region.varieties.includes(variety));
    }
    
    // Clear existing markers
    regionMarkers.forEach(marker => map.removeLayer(marker));
    regionMarkers = [];
    
    // Add filtered markers
    filtered.forEach(region => {
        if (region.coordinates) {
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 2, 20),
                fillColor: '#722F37',
                fillOpacity: 0.7,
                color: '#4E0707',
                weight: 1
            }).addTo(map);
            
            marker.bindPopup(`
                <strong>${region.name}</strong><br>
                ${region.country}<br>
                ${region.count} wines
            `);
            
            marker.on('click', () => {
                selectedRegion = region;
                displayRegionDetails(region);
                resetMarkerStyles();
                marker.setStyle({
                    fillColor: '#E6C17B',
                    color: '#722F37',
                    weight: 2
                });
            });
            
            regionMarkers.push(marker);
        }
    });
    
    // Reset details if no regions match
    if (filtered.length === 0) {
        regionDetailsContainer.innerHTML = '<p>No regions match your filter criteria.</p>';
        regionStatsContainer.innerHTML = '<p>No data available.</p>';
        regionTitleElement.textContent = 'Region Details';
    } else if (filtered.length === 1) {
        // If only one region matches, select it automatically
        selectedRegion = filtered[0];
        displayRegionDetails(selectedRegion);
    }
}

// Helper to determine continent from country
function getContinent(country) {
    const continentMap = {
        'France': 'europe',
        'Italy': 'europe',
        'Spain': 'europe',
        'Portugal': 'europe',
        'Germany': 'europe',
        'Austria': 'europe',
        'Greece': 'europe',
        'Hungary': 'europe',
        'United States': 'northamerica',
        'US': 'northamerica',
        'Canada': 'northamerica',
        'Mexico': 'northamerica',
        'Argentina': 'southamerica',
        'Chile': 'southamerica',
        'Brazil': 'southamerica',
        'Uruguay': 'southamerica',
        'Australia': 'oceania',
        'New Zealand': 'oceania',
        'South Africa': 'africa',
        'China': 'asia',
        'Japan': 'asia',
        'India': 'asia'
    };
    
    return continentMap[country] || 'unknown';
}
