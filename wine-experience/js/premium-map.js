/**
 * Enhanced Wine Map Visualization
 * 
 * This script manages the interactive wine region maps throughout
 * the Terroir platform, featuring:
 * - Global hero map with animated region highlights
 * - Detailed interactive region explorer
 * - Integrated wine data visualization
 * - Shopping cart functionality
 */

// DOM Elements
const heroMapContainer = document.getElementById('hero-map');
const wineMapContainer = document.getElementById('wine-map');
const regionStatsContainer = document.getElementById('region-stats');
const regionDetailsContainer = document.getElementById('region-details');
const regionTitleElement = document.getElementById('region-title');
const continentSelect = document.getElementById('continent');
const countrySelect = document.getElementById('map-country');
const varietySelect = document.getElementById('map-variety');
const applyMapFiltersButton = document.getElementById('apply-map-filters');
const cartIcon = document.getElementById('cart-icon');
const cartCountElement = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const closeCartButton = document.getElementById('close-cart');
const checkoutButton = document.getElementById('checkout-btn');
const modalOverlay = document.getElementById('modal-overlay');

// Variables
let allWines = [];
let wineRegions = [];
let heroMap;
let detailMap;
let regionMarkers = [];
let selectedRegion = null;
let cart = [];
let isLoading = true;
let loadingElement;

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Initialize the app with proper error handling
function init() {
    showLoader();
    
    try {
        // Load cart from localStorage
        loadCart();
        
        // Update cart count
        updateCartCount();
        
        // Initialize maps directly without waiting for wine data
        if (heroMapContainer) initializeHeroMap();
        if (wineMapContainer) initializeDetailMap();
        
        // Load wine data in the background
        loadWineData()
            .then(() => {
                // Process wine regions after data loads
                processWineRegions();
                
                // Populate filter dropdowns
                populateFilters();
                
                // Refresh map markers if maps are initialized
                if (detailMap) addRegionMarkers();
            })
            .catch(error => {
                console.error('Error loading wine data:', error);
                // Show a non-blocking error message
                if (regionDetailsContainer) {
                    regionDetailsContainer.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i> 
                            Some wine data could not be loaded. Basic map functionality is still available.
                        </div>
                    `;
                }
            })
            .finally(() => {
                hideLoader();
            });
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing map:', error);
        hideLoader();
        showErrorMessage('An error occurred while loading the map. Please try refreshing the page.');
    }
}

// Show loader
function showLoader() {
    isLoading = true;
    
    // Create loader element if it doesn't exist
    if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.className = 'map-loader';
        loadingElement.innerHTML = `
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
            <p>Loading wine regions...</p>
        `;
        
        // Append to appropriate container
        if (wineMapContainer) {
            wineMapContainer.parentNode.appendChild(loadingElement);
            wineMapContainer.style.opacity = '0.2';
        } else if (heroMapContainer) {
            heroMapContainer.parentNode.appendChild(loadingElement);
            heroMapContainer.style.opacity = '0.2';
        }
    } else {
        loadingElement.style.display = 'flex';
    }
}

// Hide loader
function hideLoader() {
    isLoading = false;
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (wineMapContainer) {
        wineMapContainer.style.opacity = '1';
    }
    
    if (heroMapContainer) {
        heroMapContainer.style.opacity = '1';
    }
}

// Show error message
function showErrorMessage(message) {
    if (wineMapContainer) {
        wineMapContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
        `;
    } else if (regionDetailsContainer) {
        regionDetailsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
        `;
    }
}

// Load wine data with better error handling
async function loadWineData() {
    try {
        const response = await fetch('data/wines.json');
        if (!response.ok) {
            throw new Error(`Failed to load wine data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // If the response is not an array, convert it
        allWines = Array.isArray(data) ? data : [data];
        
        console.log(`Loaded ${allWines.length} wines`);
        
        if (allWines.length === 0) {
            throw new Error('No wine data found');
        }
        
        return allWines;
    } catch (error) {
        console.error('Error loading wine data:', error);
        throw error;
    }
}

// Process wine regions from wine data with validation and error handling
function processWineRegions() {
    try {
        // Get unique regions
        const regionMap = new Map();
        
        allWines.forEach(wine => {
            const region = wine.region_1 || wine.region;
            const country = wine.country;
            
            if (!region || !country) return; // Skip invalid entries
            
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
                    // Assign coordinates based on region/country
                    coordinates: getRegionCoordinates(region, country),
                    climate: getRegionClimate(region, country),
                    soil: getRegionSoil(region, country)
                });
            } else {
                // Update existing region
                const regionData = regionMap.get(regionKey);
                regionData.count++;
                
                // Safely add variety if it exists
                const variety = wine.variété || wine.varietal;
                if (variety) regionData.varieties.add(variety);
                
                // Update rating sum
                regionData.avgRating += wine.points || 0;
                
                // Update price range
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
        });
        
        // Convert to array and calculate averages
        wineRegions = Array.from(regionMap.values()).map(region => {
            return {
                ...region,
                varieties: Array.from(region.varieties).filter(Boolean), // Filter out undefined/null
                avgRating: region.count > 0 ? (region.avgRating / region.count).toFixed(1) : 'N/A',
                // Set default values for missing fields
                minPrice: region.minPrice !== undefined ? region.minPrice : 'N/A',
                maxPrice: region.maxPrice !== undefined ? region.maxPrice : 'N/A'
            };
        });
        
        console.log(`Processed ${wineRegions.length} wine regions`);
    } catch (error) {
        console.error('Error processing wine regions:', error);
        wineRegions = []; // Reset to empty array in case of error
        throw error;
    }
}

// Get coordinates for region (improved with better organization)
function getRegionCoordinates(region, country) {
    // Define coordinates by region and country
    const regionCoordinates = {
        // France
        'Bordeaux': [44.8378, -0.5792],
        'Burgundy': [47.0521, 4.3875],
        'Champagne': [49.0546, 3.9331],
        'Loire Valley': [47.2512, 0.6865],
        'Rhône Valley': [44.9, 4.8368],
        'Alsace': [48.2391, 7.5284],
        'Provence': [43.5283, 5.4497],
        
        // Italy
        'Tuscany': [43.7711, 11.2486],
        'Piedmont': [44.9918, 8.1979],
        'Veneto': [45.4414, 12.3155],
        'Sicily': [37.5994, 14.0154],
        'Umbria': [43.1122, 12.3888],
        
        // Spain
        'Rioja': [42.2871, -2.4789],
        'Ribera del Duero': [41.6295, -3.6892],
        'Priorat': [41.1836, 0.7545],
        
        // Portugal
        'Douro': [41.1579, -7.5484],
        'Alentejo': [38.5471, -7.9126],
        
        // United States
        'Napa Valley': [38.5025, -122.2654],
        'Sonoma': [38.3085, -122.4609],
        'Willamette Valley': [45.2236, -123.0338],
        'Finger Lakes': [42.6809, -76.7976],
        'Paso Robles': [35.6369, -120.6545],
        
        // Australia
        'Barossa Valley': [-34.5339, 138.9523],
        'Margaret River': [-33.9531, 115.0754],
        'Yarra Valley': [-37.6550, 145.4508],
        
        // New Zealand
        'Marlborough': [-41.5133, 173.8777],
        'Central Otago': [-45.0330, 169.1913],
        
        // South America
        'Mendoza': [-32.8908, -68.8272],
        'Maipo Valley': [-33.7958, -70.8042],
        'Valle de Colchagua': [-34.6363, -71.3270],
        
        // South Africa
        'Stellenbosch': [-33.9322, 18.8602],
        'Paarl': [-33.7274, 18.9574],
        
        // Germany
        'Mosel': [49.9787, 7.1242],
        'Rheingau': [50.0376, 7.9871],
    };
    
    // Country coordinates for fallback
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
        'South Africa': [-30.5595, 22.9375],
        'Austria': [47.5162, 14.5501],
        'Greece': [39.0742, 21.8243],
        'Hungary': [47.1625, 19.5033],
    };
    
    // Check for specific region coordinates
    if (regionCoordinates[region]) {
        return regionCoordinates[region];
    }
    
    // Fall back to country coordinates with slight offset for variety
    if (countryCoordinates[country]) {
        const randomOffset = () => (Math.random() * 2 - 1) * 0.8; // Smaller offsets for better grouping
        return [
            countryCoordinates[country][0] + randomOffset(),
            countryCoordinates[country][1] + randomOffset()
        ];
    }
    
    // Default coordinates (mid-Atlantic) if no match
    return [30, -30];
}

// Get region climate information
function getRegionClimate(region, country) {
    const regionClimates = {
        // France
        'Bordeaux': 'Maritime with mild winters and warm summers',
        'Burgundy': 'Continental with cold winters and warm summers',
        'Champagne': 'Cool continental with frequent rainfall',
        'Loire Valley': 'Temperate maritime to continental',
        'Rhône Valley': 'Mediterranean with hot summers',
        'Alsace': 'Semi-continental with significant sunshine',
        'Provence': 'Mediterranean with long, hot summers',
        
        // Italy
        'Tuscany': 'Mediterranean with hot, dry summers',
        'Piedmont': 'Continental with foggy autumns',
        'Veneto': 'Varied from alpine to Mediterranean',
        
        // United States
        'Napa Valley': 'Mediterranean with hot days and cool nights',
        'Sonoma': 'Varied with coastal influence',
        
        // Default climates by country
        'France': 'Varied from maritime to Mediterranean',
        'Italy': 'Predominantly Mediterranean',
        'Spain': 'Hot and dry with Mediterranean influence',
        'United States': 'Diverse across regions',
        'Australia': 'Warm to hot with varying humidity',
        'New Zealand': 'Maritime with cool, wet conditions',
        'Germany': 'Cool continental with significant seasonal variation',
    };
    
    // Return specific region climate or country default
    return regionClimates[region] || regionClimates[country] || 'Varied climate suitable for viticulture';
}

// Get region soil information
function getRegionSoil(region, country) {
    const regionSoils = {
        // France
        'Bordeaux': 'Gravel, clay, and limestone',
        'Burgundy': 'Limestone-rich clay and marl',
        'Champagne': 'Chalk and limestone',
        'Loire Valley': 'Diverse including limestone, flint, and schist',
        'Rhône Valley': 'Granite, sandy soils, and limestone',
        'Alsace': 'Varied with granite, limestone, and schist',
        
        // Italy
        'Tuscany': 'Galestro and alberese (limestone and clay)',
        'Piedmont': 'Calcareous marl soils',
        'Veneto': 'Varied from volcanic to limestone',
        
        // Default soils by country
        'France': 'Varied soil compositions, often limestone-based',
        'Italy': 'Diverse soils including volcanic, clay, and limestone',
        'Spain': 'Limestone, clay, and sandy soils',
        'United States': 'Wide variety depending on region',
        'Australia': 'Ancient soils with varied compositions',
        'New Zealand': 'Mostly alluvial gravel beds',
        'Germany': 'Slate, quartz, and volcanic soils',
    };
    
    // Return specific region soil or country default
    return regionSoils[region] || regionSoils[country] || 'Complex soil composition ideal for vineyards';
}

// Initialize Hero Map
function initializeHeroMap() {
    if (!heroMapContainer) return;
    
    try {
        // Create map with custom styling
        heroMap = L.map(heroMapContainer, {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false,
            attributionControl: false
        }).setView([46.6031, 2.3522], 4); // Center on France by default
        
        // Add dark tile layer with custom styling
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(heroMap);
        
        // Add some default wine regions even if data hasn't loaded
        const defaultRegions = [
            { name: "Bordeaux", coordinates: [44.8378, -0.5792], country: "France" },
            { name: "Tuscany", coordinates: [43.7711, 11.2486], country: "Italy" },
            { name: "Napa Valley", coordinates: [38.5025, -122.2654], country: "United States" },
            { name: "Mendoza", coordinates: [-32.8908, -68.8272], country: "Argentina" },
            { name: "Barossa Valley", coordinates: [-34.5339, 138.9523], country: "Australia" }
        ];
        
        // Add the default regions to the map
        defaultRegions.forEach(region => {
            // Create a pulsing circle marker
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: 8,
                fillColor: '#0099cc', // Updated color
                fillOpacity: 0.7,
                color: '#FFFFFF',
                weight: 0.5,
                opacity: 0.8
            }).addTo(heroMap);
            
            // Add a pulse animation
            setTimeout(() => {
                addPulseAnimation(region.coordinates, heroMap);
            }, Math.random() * 2000);
        });
        
        hideLoader();
    } catch (error) {
        console.error('Error initializing hero map:', error);
        showErrorMessage('Failed to initialize the world wine map.');
    }
}

// Add pulse animation for map markers
function addPulseAnimation(coordinates, map) {
    let size = 0;
    let opacity = 0.5;
    let animationFrame;
    
    const animate = () => {
        size += 0.5;
        opacity -= 0.01;
        
        if (size <= 20 && opacity > 0) {
            // Remove previous pulse if exists
            if (window.currentPulse) {
                map.removeLayer(window.currentPulse);
            }
            
            // Create new pulse
            window.currentPulse = L.circleMarker([coordinates[0], coordinates[1]], {
                radius: size,
                fillColor: '#D4AF37',
                fillOpacity: 0,
                color: '#D4AF37',
                weight: 1.5,
                opacity: opacity
            }).addTo(map);
            
            // Schedule next frame
            animationFrame = requestAnimationFrame(animate);
        } else {
            // End animation and schedule next pulse
            if (window.currentPulse) {
                map.removeLayer(window.currentPulse);
            }
            setTimeout(() => {
                addPulseAnimation(coordinates, map);
            }, Math.random() * 15000 + 5000); // Random interval for natural effect
        }
    };
    
    // Start animation
    animate();
    
    return () => {
        // Cancel animation if needed
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    };
}

// Initialize Detail Map
function initializeDetailMap() {
    if (!wineMapContainer) return;
    
    try {
        // Create map
        detailMap = L.map(wineMapContainer, {
            minZoom: 2,
            maxZoom: 10,
            worldCopyJump: true
        }).setView([20, 0], 2);
        
        // Add enhanced tile layer with proper attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            noWrap: false
        }).addTo(detailMap);
        
        // Add map controls
        L.control.zoom({
            position: 'bottomright'
        }).addTo(detailMap);
        
        // Add default wine regions if wine data hasn't loaded yet
        if (wineRegions.length === 0) {
            const defaultRegions = [
                { name: "Bordeaux", coordinates: [44.8378, -0.5792], country: "France", count: 100 },
                { name: "Tuscany", coordinates: [43.7711, 11.2486], country: "Italy", count: 75 },
                { name: "Napa Valley", coordinates: [38.5025, -122.2654], country: "United States", count: 90 },
                { name: "Mendoza", coordinates: [-32.8908, -68.8272], country: "Argentina", count: 60 },
                { name: "Barossa Valley", coordinates: [-34.5339, 138.9523], country: "Australia", count: 50 }
            ];
            
            defaultRegions.forEach(region => {
                const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                    radius: Math.sqrt(region.count) * 0.8,
                    fillColor: '#0099cc', // Updated color
                    fillOpacity: 0.7,
                    color: '#FFFFFF',
                    weight: 1.5,
                    className: 'wine-region-marker'
                }).addTo(detailMap);
                
                // Add simplified popup
                marker.bindPopup(`
                    <div class="map-popup">
                        <h4>${region.name}</h4>
                        <p class="popup-country">${region.country}</p>
                    </div>
                `);
                
                regionMarkers.push(marker);
            });
        }
        
        hideLoader();
    } catch (error) {
        console.error('Error initializing detail map:', error);
        showErrorMessage('Failed to initialize the detailed wine region map.');
    }
}

// Add region markers to detail map with improved visuals
function addRegionMarkers() {
    // Clear existing markers
    regionMarkers.forEach(marker => detailMap.removeLayer(marker));
    regionMarkers = [];
    
    // Add new markers
    wineRegions.forEach(region => {
        if (!region.coordinates) return; // Skip regions without coordinates
        
        try {
            // Calculate marker size based on wine count
            const baseSize = 5;
            const sizeMultiplier = 2;
            const maxSize = 22;
            const size = Math.min(baseSize + Math.sqrt(region.count) * sizeMultiplier, maxSize);
            
            // Create marker with enhanced styling
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: size,
                fillColor: '#7D1D3F', // Deep burgundy
                fillOpacity: 0.7,
                color: '#4E0707', // Darker border
                weight: 1.5,
                className: 'wine-region-marker'
            }).addTo(detailMap);
            
            // Add rich popup with improved content
            marker.bindPopup(createRegionPopup(region));
            
            // Add hover effect
            marker.on('mouseover', function() {
                this.setStyle({
                    fillColor: '#9E2B51', // Lighter burgundy
                    weight: 2
                });
                this.bringToFront();
            });
            
            marker.on('mouseout', function() {
                if (selectedRegion && selectedRegion.name === region.name && selectedRegion.country === region.country) {
                    // Keep highlight for selected region
                    this.setStyle({
                        fillColor: '#D5A021', // Gold
                        color: '#A27035',
                        weight: 2
                    });
                } else {
                    this.setStyle({
                        fillColor: '#7D1D3F', // Back to default
                        color: '#4E0707',
                        weight: 1.5
                    });
                }
            });
            
            // Add click event with animation
            marker.on('click', () => {
                selectedRegion = region;
                displayRegionDetails(region);
                
                // Update styling to highlight selected
                resetMarkerStyles();
                marker.setStyle({
                    fillColor: '#D5A021', // Gold for selected
                    color: '#A27035',
                    weight: 2
                });
                
                // Animate marker on selection
                const markerElement = marker.getElement();
                if (markerElement) {
                    markerElement.classList.add('pulse-once');
                    setTimeout(() => {
                        markerElement.classList.remove('pulse-once');
                    }, 1000);
                }
            });
            
            regionMarkers.push(marker);
        } catch (error) {
            console.error(`Error adding marker for ${region.name}:`, error);
        }
    });
}

// Create enhanced popup content for region markers
function createRegionPopup(region) {
    return `
        <div class="map-popup">
            <h4>${region.name}</h4>
            <p class="popup-country">${region.country}</p>
            <div class="popup-stat">
                <span class="popup-label">Wines:</span>
                <span class="popup-value">${region.count}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-label">Avg. Rating:</span>
                <span class="popup-value">${region.avgRating}/100</span>
            </div>
            <div class="popup-notes">
                ${region.varieties.length > 0 
                    ? `<p>Known for: ${region.varieties.slice(0, 3).join(', ')}${region.varieties.length > 3 ? '...' : ''}</p>` 
                    : ''}
            </div>
            <button class="popup-explore-btn">Explore Region</button>
        </div>
    `;
}

// Reset marker styles
function resetMarkerStyles() {
    regionMarkers.forEach(marker => {
        marker.setStyle({
            fillColor: '#7D1D3F',
            color: '#4E0707',
            weight: 1.5
        });
    });
}

// Display region details with improved content and animations
function displayRegionDetails(region) {
    if (!region) return;
    
    // Update region title with animation
    if (regionTitleElement) {
        regionTitleElement.textContent = `${region.name}, ${region.country}`;
        regionTitleElement.classList.add('region-title-animate');
        setTimeout(() => regionTitleElement.classList.remove('region-title-animate'), 500);
    }
    
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
    
    // Display region stats with animation
    if (regionStatsContainer) {
        regionStatsContainer.innerHTML = `
            <div class="region-stat fade-in" style="animation-delay: 0.1s">
                <span class="stat-label">Wines:</span>
                <span class="stat-value">${region.count}</span>
            </div>
            <div class="region-stat fade-in" style="animation-delay: 0.2s">
                <span class="stat-label">Average Rating:</span>
                <span class="stat-value">${region.avgRating}/100</span>
            </div>
            <div class="region-stat fade-in" style="animation-delay: 0.3s">
                <span class="stat-label">Price Range:</span>
                <span class="stat-value">$${region.minPrice !== 'N/A' ? region.minPrice : '?'} - $${region.maxPrice !== 'N/A' ? region.maxPrice : '?'}</span>
            </div>
            
            <h4 class="stat-subheading fade-in" style="animation-delay: 0.4s">Top Varieties:</h4>
            <ul class="variety-list">
                ${topVarieties.map((([variety, count], index) => `
                    <li class="variety-item fade-in" style="animation-delay: ${0.5 + index * 0.1}s">
                        <span class="variety-name">${variety}</span>
                        <span class="variety-count">${count}</span>
                    </li>
                `)).join('')}
            </ul>
            
            <div class="region-meta fade-in" style="animation-delay: 0.8s">
                <h4 class="stat-subheading">Terroir:</h4>
                <p><strong>Climate:</strong> ${region.climate}</p>
                <p><strong>Soil:</strong> ${region.soil}</p>
            </div>
        `;
    }
    
    // Safely generate wine IDs
    function generateWineId(wine) {
        return wine.id || `${wine.title || ''}-${wine.winery || ''}-${wine.vintage || ''}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }
    
    // Display region details with enhanced styling and animations
    if (regionDetailsContainer) {
        regionDetailsContainer.innerHTML = `
            <div class="region-description fade-in">
                <p>${region.name} is a renowned wine region in ${region.country}, particularly known for its
                ${region.varieties.slice(0, 3).join(', ')} wines. The region features ${region.climate || 'diverse climate'}
                and ${region.soil || 'unique soil compositions'} that contribute to its distinctive terroir.</p>
            </div>
            
            <div class="top-wines slide-in-right" style="animation-delay: 0.3s">
                <h4 class="wines-heading">Top Rated Wines</h4>
                <div class="wines-grid">
                    ${regionWines.slice(0, 3).map((wine, index) => `
                        <div class="region-wine-card" style="animation-delay: ${0.4 + index * 0.2}s">
                            <div class="wine-header">
                                <h5 class="wine-name">${wine.title || 'Unnamed Wine'}</h5>
                                <span class="wine-rating">${wine.points || 'N/A'}</span>
                            </div>
                            <p class="wine-producer">${wine.winery || 'Unknown Winery'}</p>
                            <p class="wine-description">${wine.description || 'No description available.'}</p>
                            <div class="wine-footer">
                                <span class="wine-varietal">${wine.variété || wine.varietal || 'Unknown Variety'}</span>
                                <span class="wine-price">$${wine.prix || wine.price || 'N/A'}</span>
                            </div>
                            <button class="btn-add-wine" data-wine-id="${generateWineId(wine)}">
                                <i class="fas fa-plus-circle"></i> Add to Cart
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="region-link fade-in" style="animation-delay: 0.9s">
                <a href="wines.html?region=${encodeURIComponent(region.name)}" class="btn-explore">
                    <i class="fas fa-wine-bottle me-2"></i> Explore All ${region.name} Wines
                </a>
            </div>
        `;
        
        // Add event listeners to "Add to Cart" buttons
        const addButtons = regionDetailsContainer.querySelectorAll('.btn-add-wine');
        addButtons.forEach(button => {
            const wineId = button.dataset.wineId;
            button.addEventListener('click', () => {
                const wine = regionWines.find(w => generateWineId(w) === wineId);
                if (wine) {
                    addToCart(wine);
                    
                    // Add visual feedback
                    button.innerHTML = '<i class="fas fa-check"></i> Added';
                    button.classList.add('added');
                    
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-plus-circle"></i> Add to Cart';
                        button.classList.remove('added');
                    }, 2000);
                }
            });
        });
    }
}

// Populate filter options
function populateFilters() {
    if (!continentSelect || !countrySelect || !varietySelect) return;
    
    try {
        // Get unique countries
        const countries = [...new Set(wineRegions.map(region => region.country))]
            .filter(Boolean)
            .sort();
        
        // Get unique varieties
        const varieties = [...new Set(wineRegions.flatMap(region => region.varieties))]
            .filter(Boolean)
            .sort();
        
        // Add country options
        countrySelect.innerHTML = '<option value="all">All Countries</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
        
        // Add variety options
        varietySelect.innerHTML = '<option value="all">All Varieties</option>';
        varieties.forEach(variety => {
            const option = document.createElement('option');
            option.value = variety;
            option.textContent = variety;
            varietySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating filters:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Apply filters button
    if (applyMapFiltersButton) {
        applyMapFiltersButton.addEventListener('click', applyMapFilters);
    }
    
    // Continent selector to update countries dropdown
    if (continentSelect) {
        continentSelect.addEventListener('change', updateCountryOptions);
    }
    
    // Cart toggle
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    
    if (closeCartButton) {
        closeCartButton.addEventListener('click', closeCart);
    }
    
    // Modal overlay click to close cart
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCart);
    }
    
    // Checkout button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'wines.html?checkout=true';
        });
    }
    
    // Add map popup button click handler via delegation
    if (detailMap) {
        detailMap.on('popupopen', function(e) {
            const popup = e.popup;
            const container = popup.getElement();
            const exploreButton = container.querySelector('.popup-explore-btn');
            
            if (exploreButton) {
                exploreButton.addEventListener('click', function() {
                    // Find the region associated with this popup
                    const latLng = popup.getLatLng();
                    const clickedRegion = wineRegions.find(region => 
                        region.coordinates && 
                        Math.abs(region.coordinates[0] - latLng.lat) < 0.1 && 
                        Math.abs(region.coordinates[1] - latLng.lng) < 0.1
                    );
                    
                    if (clickedRegion) {
                        selectedRegion = clickedRegion;
                        displayRegionDetails(clickedRegion);
                        
                        // Find and highlight the marker
                        const marker = regionMarkers.find(m => {
                            const markerLatLng = m.getLatLng();
                            return Math.abs(markerLatLng.lat - latLng.lat) < 0.1 && 
                                   Math.abs(markerLatLng.lng - latLng.lng) < 0.1;
                        });
                        
                        if (marker) {
                            resetMarkerStyles();
                            marker.setStyle({
                                fillColor: '#D5A021',
                                color: '#A27035',
                                weight: 2
                            });
                        }
                        
                        // Close the popup
                        popup.close();
                    }
                });
            }
        });
    }
}

// Update country dropdown based on selected continent
function updateCountryOptions() {
    if (!continentSelect || !countrySelect) return;
    
    const continent = continentSelect.value;
    
    // Reset the country dropdown
    countrySelect.innerHTML = '<option value="all">All Countries</option>';
    
    // If "all" is selected, show all countries
    if (continent === 'all') {
        const allCountries = [...new Set(wineRegions.map(region => region.country))]
            .filter(Boolean)
            .sort();
            
        allCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
        return;
    }
    
    // Filter countries by continent
    const continentCountries = wineRegions
        .filter(region => getContinent(region.country) === continent)
        .map(region => region.country);
    
    // Get unique countries in this continent
    const uniqueCountries = [...new Set(continentCountries)]
        .filter(Boolean)
        .sort();
    
    // Add filtered countries to dropdown
    uniqueCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Apply map filters with animation
function applyMapFilters() {
    if (!continentSelect || !countrySelect || !varietySelect) return;
    
    // Show loading indicator
    const filterButton = document.getElementById('apply-map-filters');
    if (filterButton) {
        const originalText = filterButton.textContent;
        filterButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Filtering...';
        filterButton.disabled = true;
        
        // Reset after a delay to simulate processing
        setTimeout(() => {
            filterButton.innerHTML = originalText;
            filterButton.disabled = false;
        }, 800);
    }
    
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
    
    // Clear existing markers with animation
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.classList.add('map-filter-transition');
        setTimeout(() => {
            mapContainer.classList.remove('map-filter-transition');
        }, 500);
    }
    
    regionMarkers.forEach(marker => detailMap.removeLayer(marker));
    regionMarkers = [];
    
    // Add filtered markers with staggered animations
    filtered.forEach((region, index) => {
        if (!region.coordinates) return;
        
        setTimeout(() => {
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 2, 20),
                fillColor: '#7D1D3F',
                fillOpacity: 0,  // Start invisible for animation
                color: '#4E0707',
                weight: 1
            }).addTo(detailMap);
            
            // Animate marker appearance
            setTimeout(() => {
                marker.setStyle({
                    fillOpacity: 0.7 // Fade in
                });
            }, 50);
            
            marker.bindPopup(createRegionPopup(region));
            
            marker.on('click', () => {
                selectedRegion = region;
                displayRegionDetails(region);
                resetMarkerStyles();
                marker.setStyle({
                    fillColor: '#D5A021',
                    color: '#A27035',
                    weight: 2
                });
            });
            
            regionMarkers.push(marker);
        }, index * 50); // Stagger marker creation for visual effect
    });
    
    // Reset details if no regions match
    if (filtered.length === 0) {
        regionDetailsContainer.innerHTML = `
            <div class="alert alert-info fade-in">
                <i class="fas fa-info-circle me-2"></i> No regions match your filter criteria.
                <p class="mt-2 mb-0">Try adjusting your filters to see more results.</p>
            </div>
        `;
        regionStatsContainer.innerHTML = `
            <p class="text-center fade-in">No data available for the selected filters.</p>
        `;
        regionTitleElement.textContent = 'Region Details';
    } else if (filtered.length === 1) {
        // If only one region matches, select it automatically
        selectedRegion = filtered[0];
        displayRegionDetails(selectedRegion);
        
        // Update map view to focus on this region
        if (detailMap && selectedRegion.coordinates) {
            detailMap.setView(selectedRegion.coordinates, 6, { animate: true });
        }
    }
}

// Helper to determine continent from country with improved mapping
function getContinent(country) {
    const continentMap = {
        // Europe
        'France': 'europe',
        'Italy': 'europe',
        'Spain': 'europe',
        'Portugal': 'europe',
        'Germany': 'europe',
        'Austria': 'europe',
        'Greece': 'europe',
        'Hungary': 'europe',
        'United Kingdom': 'europe',
        'Switzerland': 'europe',
        'Croatia': 'europe',
        'Slovenia': 'europe',
        'Georgia': 'europe',
        'Moldova': 'europe',
        
        // North America
        'United States': 'northamerica',
        'US': 'northamerica',
        'Canada': 'northamerica',
        'Mexico': 'northamerica',
        
        // South America
        'Argentina': 'southamerica',
        'Chile': 'southamerica',
        'Brazil': 'southamerica',
        'Uruguay': 'southamerica',
        
        // Oceania
        'Australia': 'oceania',
        'New Zealand': 'oceania',
        
        // Africa
        'South Africa': 'africa',
        
        // Asia
        'China': 'asia',
        'Japan': 'asia',
        'India': 'asia',
        'Lebanon': 'asia',
        'Israel': 'asia'
    };
    
    return continentMap[country] || 'unknown';
}

// Generate a unique ID for a wine (if not present)
function generateWineId(wine) {
    if (wine.id) return wine.id;
    
    // Create a simple hash from the wine properties
    const hash = `${wine.title || ''}-${wine.winery || ''}-${wine.vintage || ''}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return hash;
}

// Cart functionality
// Load cart from localStorage with better error handling
function loadCart() {
    try {
        const savedCart = localStorage.getItem('terroir-cart');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
            
            // Validate cart items
            cart = cart.filter(item => 
                item && 
                typeof item === 'object' && 
                (item.title || item.id) && 
                item.quantity > 0
            );
        }
    } catch (error) {
        console.error('Error loading cart data:', error);
        cart = [];
    }
}

// Save cart to localStorage with error handling
function saveCart() {
    try {
        localStorage.setItem('terroir-cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart data:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Failed to save your cart. Your browser may have privacy restrictions enabled.
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Add a wine to the cart with improved UX feedback
function addToCart(wine) {
    if (!wine) return;
    
    try {
        // Generate ID if not present
        const wineId = wine.id || generateWineId(wine);
        
        // Check if the wine is already in the cart
        const existingItemIndex = cart.findIndex(item => 
            (item.id && item.id === wineId) || 
            ((!item.id || !wineId) && item.title === wine.title && item.winery === wine.winery)
        );
        
        if (existingItemIndex !== -1) {
            // Increment quantity if already in cart
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                ...wine,
                id: wineId,
                quantity: 1
            });
        }
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart UI
        updateCartCount();
        renderCart();
        
        // Show cart
        openCart();
        
        // Show success notification
        showCartNotification(`<i class="fas fa-check-circle"></i> ${wine.title || 'Wine'} added to your collection`);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showCartNotification(`<i class="fas fa-exclamation-circle"></i> Failed to add wine to cart`, true);
    }
}

// Show notification for cart actions
function showCartNotification(message, isError = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cart-notification ${isError ? 'error' : 'success'}`;
    notification.innerHTML = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Remove an item from the cart with confirmation
function removeFromCart(wineId) {
    // Show mini-confirmation
    const itemElement = document.querySelector(`.cart-item[data-id="${wineId}"]`);
    if (itemElement) {
        itemElement.classList.add('removing');
        
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'remove-confirmation';
        confirmDiv.innerHTML = `
            <p>Remove from cart?</p>
            <div class="confirm-buttons">
                <button class="yes">Yes</button>
                <button class="no">No</button>
            </div>
        `;
        
        itemElement.appendChild(confirmDiv);
        
        // Handle confirmation
        confirmDiv.querySelector('.yes').addEventListener('click', () => {
            // Actually remove item
            cart = cart.filter(item => item.id !== wineId);
            
            // Save cart to localStorage
            saveCart();
            
            // Update cart UI with animation
            itemElement.classList.add('removed');
            
            setTimeout(() => {
                updateCartCount();
                renderCart();
            }, 300);
        });
        
        confirmDiv.querySelector('.no').addEventListener('click', () => {
            itemElement.classList.remove('removing');
            itemElement.removeChild(confirmDiv);
        });
    } else {
        // Fallback if element not found
        cart = cart.filter(item => item.id !== wineId);
        saveCart();
        updateCartCount();
        renderCart();
    }
}

// Update item quantity in cart
function updateCartItemQuantity(wineId, quantity) {
    const itemIndex = cart.findIndex(item => item.id === wineId);
    
    if (itemIndex !== -1) {
        // Update quantity with bounds checking
        cart[itemIndex].quantity = Math.max(1, Math.min(99, quantity));
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart UI
        updateCartCount();
        renderCart();
    }
}

// Update cart count with animation
function updateCartCount() {
    if (!cartCountElement) return;
    
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const oldCount = parseInt(cartCountElement.textContent) || 0;
    
    // Set new count
    cartCountElement.textContent = count;
    
    // Show/hide cart count
    if (count > 0) {
        cartCountElement.style.display = 'flex';
        
        // Add animation if count increased
        if (count > oldCount) {
            cartCountElement.classList.add('pulse');
            setTimeout(() => {
                cartCountElement.classList.remove('pulse');
            }, 300);
        }
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Calculate cart total
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.prix || item.price || 0);
        return total + (price * item.quantity);
    }, 0);
}

// Render cart items with enhanced styling and animations
function renderCart() {
    if (!cartItemsContainer || !cartTotalElement) return;
    
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Display empty cart message
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-animation">
                <i class="fas fa-wine-glass-alt"></i>
            </div>
            <p class="empty-cart-message">Your collection is empty</p>
            <p class="empty-cart-submessage">Explore our wines to add to your collection</p>
        `;
        
        // Disable checkout button
        if (checkoutButton) {
            checkoutButton.disabled = true;
        }
    } else {
        // Enable checkout button
        if (checkoutButton) {
            checkoutButton.disabled = false;
        }
        
        // Render cart items
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item fade-in';
            cartItem.setAttribute('data-id', item.id);
            cartItem.style.animationDelay = `${index * 0.1}s`;
            
            // Determine wine image based on type
            let wineImage = 'https://via.placeholder.com/80?text=Wine';
            const wineType = item.variété || item.varietal || '';
            
            if (wineType.toLowerCase().includes('rouge') || 
                wineType.toLowerCase().includes('red')) {
                wineImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('blanc') || 
                       wineType.toLowerCase().includes('white')) {
                wineImage = 'https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('rosé') || 
                       wineType.toLowerCase().includes('rose')) {
                wineImage = 'https://images.unsplash.com/photo-1558682125-c504d85a63a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            } else if (wineType.toLowerCase().includes('sparkling') || 
                       wineType.toLowerCase().includes('champagne')) {
                wineImage = 'https://images.unsplash.com/photo-1605869310077-deaf8a22c128?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80';
            }
            
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${wineImage}" alt="${item.title || 'Wine'}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title || 'Unnamed Wine'}</h4>
                    <p class="cart-item-variant">${item.variété || item.varietal || 'Wine'} - ${item.winery || 'Unknown Winery'}</p>
                    <p class="cart-item-price">$${(item.prix || item.price || 0).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <div class="cart-item-remove">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            // Add event listeners for quantity controls
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const removeBtn = cartItem.querySelector('.cart-item-remove');
            
            minusBtn.addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity - 1);
            });
            
            plusBtn.addEventListener('click', () => {
                updateCartItemQuantity(item.id, item.quantity + 1);
            });
            
            quantityInput.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity > 0) {
                    updateCartItemQuantity(item.id, newQuantity);
                } else {
                    // Reset to previous valid value
                    e.target.value = item.quantity;
                }
            });
            
            removeBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update cart total with animation
    const cartTotal = calculateCartTotal();
    
    // Animate total if element exists
    if (cartTotalElement) {
        const currentTotal = parseFloat(cartTotalElement.textContent.replace('$', '')) || 0;
        
        if (Math.abs(cartTotal - currentTotal) > 0.01) {
            // Counting animation for significant changes
            animateCartTotal(currentTotal, cartTotal);
        } else {
            // Just update for minor changes
            cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
        }
    }
}

// Animate the cart total with counting effect
function animateCartTotal(from, to) {
    if (!cartTotalElement) return;
    
    const duration = 500; // ms
    const steps = 20;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;
    
    function updateValue() {
        step++;
        current += increment;
        
        // Ensure we land exactly on the target value in the final step
        if (step >= steps) current = to;
        
        cartTotalElement.textContent = `$${current.toFixed(2)}`;
        
        if (step < steps) {
            requestAnimationFrame(updateValue);
        }
    }
    
    updateValue();
}

// Toggle cart visibility with enhanced animations
function toggleCart() {
    if (cartModal.classList.contains('active')) {
        closeCart();
    } else {
        openCart();
    }
}

// Open cart with animation
function openCart() {
    cartModal.classList.add('active');
    modalOverlay.classList.add('active');
    
    // Pre-render cart content
    renderCart();
    
    // Prevent body scrolling when cart is open
    document.body.style.overflow = 'hidden';
    
    // Focus trap for accessibility
    setTimeout(() => {
        const firstFocusable = cartModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }, 100);
}

// Close cart with animation
function closeCart() {
    cartModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to cart icon
    if (cartIcon) cartIcon.focus();
}

// Document unload event to make sure cart is saved
window.addEventListener('beforeunload', () => {
    saveCart();
});