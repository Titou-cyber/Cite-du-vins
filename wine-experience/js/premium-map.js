// premium-map.js - Enhanced map functionality with shopping cart integration

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

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Initialize the app
async function init() {
    try {
        // Load cart from localStorage
        loadCart();
        
        // Update cart count
        updateCartCount();
        
        // Load wine data
        await loadWineData();
        
        // Process wine regions
        processWineRegions();
        
        // Initialize maps
        initializeHeroMap();
        initializeDetailMap();
        
        // Populate filter dropdowns
        populateFilters();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing map:', error);
        if (wineMapContainer) {
            wineMapContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading map data. Please try refreshing the page.
                </div>
            `;
        }
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

// Initialize Hero Map
function initializeHeroMap() {
    if (!heroMapContainer) return;
    
    // Create map
    heroMap = L.map(heroMapContainer, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false
    }).setView([30, 10], 2);
    
    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(heroMap);
    
    // Add region markers with a glow effect
    wineRegions.forEach(region => {
        if (region.coordinates) {
            // Create a pulsing circle marker
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 1.5, 15),
                fillColor: '#E6C17B',
                fillOpacity: 0.7,
                color: '#ffffff',
                weight: 0.5,
                opacity: 0.8
            }).addTo(heroMap);
            
            // Add a subtle pulse animation
            const pulseAnimation = () => {
                let size = 0;
                let opacity = 0.5;
                
                const animate = () => {
                    size += 0.5;
                    opacity -= 0.01;
                    
                    if (size <= 20 && opacity > 0) {
                        const pulseMarker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                            radius: size,
                            fillColor: '#E6C17B',
                            fillOpacity: 0,
                            color: '#E6C17B',
                            weight: 1.5,
                            opacity: opacity
                        }).addTo(heroMap);
                        
                        setTimeout(() => {
                            heroMap.removeLayer(pulseMarker);
                        }, 1000);
                        
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            };
            
            // Run the pulse animation
            setTimeout(pulseAnimation, Math.random() * 5000);
        }
    });
}

// Initialize Detail Map
function initializeDetailMap() {
    if (!wineMapContainer) return;
    
    // Create map
    detailMap = L.map(wineMapContainer).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(detailMap);
    
    // Add region markers
    addRegionMarkers();
}

// Add region markers to detail map
function addRegionMarkers() {
    // Clear existing markers
    regionMarkers.forEach(marker => detailMap.removeLayer(marker));
    regionMarkers = [];
    
    // Add new markers
    wineRegions.forEach(region => {
        if (region.coordinates) {
            // Create marker with popup
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 2, 20),
                fillColor: '#7D1D3F',
                fillOpacity: 0.7,
                color: '#4E0707',
                weight: 1
            }).addTo(detailMap);
            
            // Add popup
            marker.bindPopup(`
                <div class="map-popup">
                    <h4>${region.name}</h4>
                    <p>${region.country}</p>
                    <p><strong>${region.count}</strong> wines</p>
                </div>
            `);
            
            // Add click event
            marker.on('click', () => {
                selectedRegion = region;
                displayRegionDetails(region);
                // Update styling to highlight selected
                resetMarkerStyles();
                marker.setStyle({
                    fillColor: '#D5A021',
                    color: '#A27035',
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
            fillColor: '#7D1D3F',
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
        <div class="region-stat">
            <span class="stat-label">Wines:</span>
            <span class="stat-value">${region.count}</span>
        </div>
        <div class="region-stat">
            <span class="stat-label">Average Rating:</span>
            <span class="stat-value">${region.avgRating}/100</span>
        </div>
        <div class="region-stat">
            <span class="stat-label">Price Range:</span>
            <span class="stat-value">$${region.minPrice || 'N/A'} - $${region.maxPrice || 'N/A'}</span>
        </div>
        
        <h4 class="stat-subheading">Top Varieties:</h4>
        <ul class="variety-list">
            ${topVarieties.map(([variety, count]) => `
                <li class="variety-item">
                    <span class="variety-name">${variety}</span>
                    <span class="variety-count">${count}</span>
                </li>
            `).join('')}
        </ul>
    `;
    
    // Display region details with top wines
    regionDetailsContainer.innerHTML = `
        <div class="region-description">
            <p>${region.name} is a renowned wine region in ${region.country}, particularly known for its
            ${region.varieties.slice(0, 3).join(', ')} wines. The region features ${region.climate || 'diverse'} climate
            and ${region.soil || 'unique soil compositions'} that contribute to its distinctive terroir.</p>
        </div>
        
        <div class="top-wines">
            <h4 class="wines-heading">Top Rated Wines</h4>
            <div class="wines-grid">
                ${regionWines.slice(0, 3).map(wine => `
                    <div class="region-wine-card">
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
                        <button class="btn-add-wine" data-wine-id="${wine.id || generateWineId(wine)}">Add to Cart</button>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="region-link">
            <a href="wines.html?region=${encodeURIComponent(region.name)}" class="btn-explore">
                Explore All ${region.name} Wines
            </a>
        </div>
    `;
    
    // Add event listeners to "Add to Cart" buttons
    const addButtons = regionDetailsContainer.querySelectorAll('.btn-add-wine');
    addButtons.forEach(button => {
        const wineId = button.dataset.wineId;
        button.addEventListener('click', () => {
            const wine = regionWines.find(w => (w.id || generateWineId(w)) === wineId);
            if (wine) {
                addToCart(wine);
            }
        });
    });
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
    if (applyMapFiltersButton) {
        applyMapFiltersButton.addEventListener('click', applyMapFilters);
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
    regionMarkers.forEach(marker => detailMap.removeLayer(marker));
    regionMarkers = [];
    
    // Add filtered markers
    filtered.forEach(region => {
        if (region.coordinates) {
            const marker = L.circleMarker([region.coordinates[0], region.coordinates[1]], {
                radius: Math.min(Math.sqrt(region.count) * 2, 20),
                fillColor: '#7D1D3F',
                fillOpacity: 0.7,
                color: '#4E0707',
                weight: 1
            }).addTo(detailMap);
            
            marker.bindPopup(`
                <div class="map-popup">
                    <h4>${region.name}</h4>
                    <p>${region.country}</p>
                    <p><strong>${region.count}</strong> wines</p>
                </div>
            `);
            
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

// Generate a unique ID for a wine (if not present)
function generateWineId(wine) {
    // Create a simple hash from the wine name and winery
    const hash = `${wine.title || ''}-${wine.winery || ''}-${wine.vintage || ''}`.replace(/\s+/g, '-').toLowerCase();
    return hash;
}

// Cart functionality
// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('terroir-cart');
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('terroir-cart', JSON.stringify(cart));
}

// Add a wine to the cart
function addToCart(wine) {
    // Check if the wine is already in the cart
    const existingItemIndex = cart.findIndex(item => 
        (item.id && item.id === wine.id) || 
        ((!item.id || !wine.id) && item.title === wine.title && item.winery === wine.winery)
    );
    
    if (existingItemIndex !== -1) {
        // Increment quantity if already in cart
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            ...wine,
            id: wine.id || generateWineId(wine),
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
}

// Remove an item from the cart
function removeFromCart(wineId) {
    cart = cart.filter(item => item.id !== wineId);
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart UI
    updateCartCount();
    renderCart();
}

// Update item quantity in cart
function updateCartItemQuantity(wineId, quantity) {
    const itemIndex = cart.findIndex(item => item.id === wineId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = Math.max(1, quantity);
        
        // Save cart to localStorage
        saveCart();
        
        // Update cart UI
        updateCartCount();
        renderCart();
    }
}

// Update cart count
function updateCartCount() {
    if (!cartCountElement) return;
    
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = count;
    
    // Show/hide cart count
    if (count > 0) {
        cartCountElement.style.display = 'flex';
    } else {
        cartCountElement.style.display = 'none';
    }
}

// Calculate cart total
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = item.prix || item.price || 0;
        return total + (price * item.quantity);
    }, 0);
}

// Render cart items
function renderCart() {
    if (!cartItemsContainer) return;
    
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Display empty cart message
        cartItemsContainer.innerHTML = `
            <p class="empty-cart-message">Your collection is empty</p>
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
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
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
                if (!isNaN(newQuantity)) {
                    updateCartItemQuantity(item.id, newQuantity);
                }
            });
            
            removeBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update cart total
    if (cartTotalElement) {
        const cartTotal = calculateCartTotal();
        cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
    }
}

// Toggle cart visibility
function toggleCart() {
    if (cartModal.classList.contains('active')) {
        closeCart();
    } else {
        openCart();
    }
}

// Open cart
function openCart() {
    cartModal.classList.add('active');
    modalOverlay.classList.add('active');
    renderCart();
}

// Close cart
function closeCart() {
    cartModal.classList.remove('active');
    modalOverlay.classList.remove('active');
}