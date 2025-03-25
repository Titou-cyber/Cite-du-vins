/**
 * region.js - Handles the interactive wine regions map and related functionality
 * for the Cité du Vin Marketplace
 */

class RegionManager {
    constructor() {
        // Initialize state
        this.state = {
            map: null,
            markers: [],
            activeCountry: 'all',
            regions: [],
            selectedRegion1: 'bordeaux',
            selectedRegion2: 'tuscany',
            comparisonChart: null
        };
        
        // Bind methods
        this.initMap = this.initMap.bind(this);
        this.loadRegionData = this.loadRegionData.bind(this);
        this.setupCountrySelector = this.setupCountrySelector.bind(this);
        this.filterMapByCountry = this.filterMapByCountry.bind(this);
        this.setupRegionComparison = this.setupRegionComparison.bind(this);
        this.updateComparisonChart = this.updateComparisonChart.bind(this);
        this.initWineTypeChart = this.initWineTypeChart.bind(this);
        this.initTemperatureChart = this.initTemperatureChart.bind(this);
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize region manager
     */
    async init() {
        // Load region data
        await this.loadRegionData();
        
        // Initialize map
        this.initMap();
        
        // Setup country selector
        this.setupCountrySelector();
        
        // Setup region comparison tool
        this.setupRegionComparison();
        
        // Initialize charts
        this.initWineTypeChart();
        this.initTemperatureChart();
    }
    
    /**
     * Load wine region data from API
     */
    async loadRegionData() {
        try {
            // In a real application, you would fetch this data from an API
            // For now, we'll use hardcoded data
            this.state.regions = [
                {
                    id: 'bordeaux',
                    name: "Bordeaux",
                    country: "france",
                    countryName: "France",
                    latLng: [44.8378, -0.5792],
                    description: "Plus grande région viticole de France, célèbre pour ses grands crus classés et ses assemblages de Cabernet Sauvignon et Merlot.",
                    image: "assets/images/regions/bordeaux.jpg",
                    varieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Sauvignon Blanc", "Sémillon"],
                    wineColors: { red: 87, white: 10, rose: 2, sparkling: 1 },
                    temperature: [6.5, 7.8, 10.3, 12.5, 16.1, 19.3, 21.5, 21.4, 18.7, 14.8, 9.5, 6.9],
                    rainfall: [80, 71, 69, 78, 80, 65, 57, 57, 75, 90, 110, 95],
                    soilTypes: ["Graves", "Argilo-calcaire", "Sable"],
                    area: 120000,
                    production: 700,
                    tasteProfile: {
                        acidity: 7,
                        tannins: 8,
                        body: 8,
                        fruitiness: 7,
                        spiciness: 6,
                        minerality: 6,
                        oakiness: 8,
                        complexity: 9
                    }
                },
                {
                    id: 'burgundy',
                    name: "Bourgogne",
                    country: "france",
                    countryName: "France",
                    latLng: [47.0521, 4.8332],
                    description: "Région prestigieuse connue pour ses vins de Pinot Noir et de Chardonnay, avec un système complexe de classification des terroirs.",
                    image: "assets/images/regions/burgundy.jpg",
                    varieties: ["Pinot Noir", "Chardonnay", "Aligoté", "Gamay"],
                    wineColors: { red: 60, white: 38, rose: 1, sparkling: 1 },
                    temperature: [3.2, 4.5, 7.7, 10.4, 14.3, 17.9, 20.3, 20.1, 16.5, 12.3, 7.1, 3.8],
                    rainfall: [55, 50, 55, 65, 85, 70, 60, 65, 70, 75, 65, 60],
                    soilTypes: ["Argilo-calcaire", "Marnes", "Kimméridgien"],
                    area: 29500,
                    production: 200,
                    tasteProfile: {
                        acidity: 8,
                        tannins: 6,
                        body: 6,
                        fruitiness: 8,
                        spiciness: 5,
                        minerality: 9,
                        oakiness: 7,
                        complexity: 9
                    }
                },
                {
                    id: 'rhone',
                    name: "Vallée du Rhône",
                    country: "france",
                    countryName: "France",
                    latLng: [44.937, 4.8927],
                    description: "Longue vallée divisée en nord et sud, produisant une grande diversité de vins, des Syrah puissantes aux assemblages méditerranéens.",
                    image: "assets/images/regions/rhone.jpg",
                    varieties: ["Syrah", "Grenache", "Mourvèdre", "Viognier", "Marsanne", "Roussanne"],
                    wineColors: { red: 80, white: 15, rose: 5, sparkling: 0 },
                    temperature: [5.5, 7.1, 10.7, 13.5, 17.7, 21.4, 24.2, 23.9, 20.1, 15.1, 9.6, 5.9],
                    rainfall: [65, 55, 60, 70, 75, 50, 40, 45, 80, 110, 90, 70],
                    soilTypes: ["Granite", "Galets roulés", "Calcaire", "Argile"],
                    area: 71000,
                    production: 400,
                    tasteProfile: {
                        acidity: 6,
                        tannins: 7,
                        body: 8,
                        fruitiness: 7,
                        spiciness: 8,
                        minerality: 7,
                        oakiness: 6,
                        complexity: 8
                    }
                },
                {
                    id: 'tuscany',
                    name: "Toscane",
                    country: "italy",
                    countryName: "Italie",
                    latLng: [43.7711, 11.2486],
                    description: "Région iconique au cœur de l'Italie, connue pour le Chianti, le Brunello di Montalcino et les Super Toscans à base de Sangiovese.",
                    image: "assets/images/regions/tuscany.jpg",
                    varieties: ["Sangiovese", "Cabernet Sauvignon", "Merlot", "Trebbiano", "Vernaccia"],
                    wineColors: { red: 85, white: 10, rose: 2, sparkling: 3 },
                    temperature: [7.2, 8.3, 10.8, 13.6, 17.5, 21.6, 24.9, 24.7, 21.3, 16.7, 12.1, 8.2],
                    rainfall: [60, 65, 70, 75, 65, 40, 25, 30, 65, 90, 100, 70],
                    soilTypes: ["Galestro", "Alberese", "Argilo-calcaire", "Sable"],
                    area: 60000,
                    production: 350,
                    tasteProfile: {
                        acidity: 8,
                        tannins: 7,
                        body: 7,
                        fruitiness: 8,
                        spiciness: 5,
                        minerality: 8,
                        oakiness: 6,
                        complexity: 8
                    }
                },
                {
                    id: 'piedmont',
                    name: "Piémont",
                    country: "italy",
                    countryName: "Italie",
                    latLng: [44.9989, 8.2069],
                    description: "Région du nord-ouest de l'Italie, célèbre pour ses grands vins de Nebbiolo (Barolo et Barbaresco) et le Barbera.",
                    image: "assets/images/regions/piedmont.jpg",
                    varieties: ["Nebbiolo", "Barbera", "Dolcetto", "Moscato", "Arneis"],
                    wineColors: { red: 70, white: 25, rose: 1, sparkling: 4 },
                    temperature: [1.8, 3.4, 8.5, 12.6, 17.1, 21.2, 23.6, 22.7, 19.1, 13.4, 7.2, 2.7],
                    rainfall: [45, 50, 65, 90, 100, 80, 55, 60, 70, 85, 75, 55],
                    soilTypes: ["Calcareous marl", "Clay", "Limestone", "Sand"],
                    area: 43500,
                    production: 280,
                    tasteProfile: {
                        acidity: 8,
                        tannins: 9,
                        body: 8,
                        fruitiness: 6,
                        spiciness: 7,
                        minerality: 8,
                        oakiness: 7,
                        complexity: 9
                    }
                },
                {
                    id: 'rioja',
                    name: "Rioja",
                    country: "spain",
                    countryName: "Espagne",
                    latLng: [42.2871, -2.5396],
                    description: "La plus célèbre région viticole d'Espagne, connue pour ses vins rouges de Tempranillo vieillis en fûts de chêne américain.",
                    image: "assets/images/regions/rioja.jpg",
                    varieties: ["Tempranillo", "Garnacha", "Graciano", "Mazuelo", "Viura"],
                    wineColors: { red: 85, white: 10, rose: 5, sparkling: 0 },
                    temperature: [5.9, 7.2, 10.6, 12.3, 16.1, 20.7, 23.5, 23.1, 19.4, 14.6, 9.3, 6.3],
                    rainfall: [40, 35, 40, 45, 50, 35, 25, 20, 35, 50, 45, 40],
                    soilTypes: ["Calcaire", "Argile", "Alluvions"],
                    area: 65000,
                    production: 300,
                    tasteProfile: {
                        acidity: 6,
                        tannins: 7,
                        body: 7,
                        fruitiness: 7,
                        spiciness: 8,
                        minerality: 5,
                        oakiness: 8,
                        complexity: 7
                    }
                },
                {
                    id: 'napa',
                    name: "Napa Valley",
                    country: "usa",
                    countryName: "États-Unis",
                    latLng: [38.5025, -122.2654],
                    description: "Région prestigieuse de Californie, célèbre pour ses Cabernet Sauvignon de classe mondiale et son œnotourisme développé.",
                    image: "assets/images/regions/napa.jpg",
                    varieties: ["Cabernet Sauvignon", "Chardonnay", "Merlot", "Pinot Noir", "Zinfandel"],
                    wineColors: { red: 75, white: 24, rose: 1, sparkling: 0 },
                    temperature: [10.1, 12.2, 13.6, 15.4, 18.2, 21.1, 22.8, 22.7, 21.5, 17.9, 13.4, 10.3],
                    rainfall: [110, 95, 70, 35, 15, 2, 0, 0, 5, 25, 65, 95],
                    soilTypes: ["Volcanic", "Gravel", "Clay", "Loam"],
                    area: 18000,
                    production: 120,
                    tasteProfile: {
                        acidity: 6,
                        tannins: 7,
                        body: 9,
                        fruitiness: 8,
                        spiciness: 6,
                        minerality: 5,
                        oakiness: 8,
                        complexity: 7
                    }
                },
                {
                    id: 'mendoza',
                    name: "Mendoza",
                    country: "argentina",
                    countryName: "Argentine",
                    latLng: [-33.1503, -68.7807],
                    description: "Principale région viticole d'Argentine au pied des Andes, célèbre pour ses Malbec puissants et fruités.",
                    image: "assets/images/regions/mendoza.jpg",
                    varieties: ["Malbec", "Cabernet Sauvignon", "Torrontés", "Chardonnay", "Bonarda"],
                    wineColors: { red: 80, white: 18, rose: 2, sparkling: 0 },
                    temperature: [24.2, 23.1, 20.7, 16.4, 12.3, 9.1, 8.6, 10.9, 14.2, 18.7, 21.5, 23.8],
                    rainfall: [15, 20, 15, 8, 5, 3, 3, 3, 5, 8, 10, 12],
                    soilTypes: ["Alluvial", "Sandy", "Stony"],
                    area: 150000,
                    production: 420,
                    tasteProfile: {
                        acidity: 5,
                        tannins: 6,
                        body: 8,
                        fruitiness: 9,
                        spiciness: 7,
                        minerality: 6,
                        oakiness: 5,
                        complexity: 7
                    }
                }
            ];
        } catch (error) {
            console.error('Error loading region data:', error);
            this.state.regions = [];
        }
    }
    
    /**
     * Initialize map with Leaflet
     */
    initMap() {
        try {
            // Check if Leaflet is available
            if (!window.L) {
                console.error('Leaflet library not found. Make sure to include the Leaflet script.');
                return;
            }
            
            // Create map
            const map = L.map('world-map').setView([46.2276, 2.2137], 4);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Store map reference
            this.state.map = map;
            
            // Add region markers
            this.addRegionMarkers();
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }
    
    /**
     * Add region markers to the map
     */
    addRegionMarkers() {
        if (!this.state.map || !this.state.regions.length) return;
        
        // Clear existing markers
        this.state.markers.forEach(marker => {
            this.state.map.removeLayer(marker);
        });
        this.state.markers = [];
        
        // Add markers for each region
        this.state.regions.forEach(region => {
            // Create custom icon
            const icon = L.divIcon({
                className: `region-marker ${region.country}`,
                html: `<i class="fas fa-wine-glass-alt"></i>`,
                iconSize: [30, 30]
            });
            
            // Create marker
            const marker = L.marker(region.latLng, { icon: icon }).addTo(this.state.map);
            
            // Add tooltip
            marker.bindTooltip(
                `<div class="map-tooltip">
                    <h3>${region.name}</h3>
                    <img src="${region.image}" class="map-tooltip-img" alt="${region.name}">
                    <p>${region.description}</p>
                    <p><strong>Pays:</strong> ${region.countryName}</p>
                </div>`,
                { 
                    className: 'map-tooltip',
                    direction: 'top',
                    offset: [0, -15]
                }
            );
            
            // Add click event to show region details
            marker.on('click', () => {
                // In a real application, you would load and display detailed information about the region
                console.log(`Showing details for ${region.name}`);
                
                // For demo, update the featured region
                this.updateFeaturedRegion(region.id);
            });
            
            // Store marker reference with country info for filtering
            marker.country = region.country;
            
            // Add to markers collection
            this.state.markers.push(marker);
        });
    }
    
    /**
     * Update featured region section
     */
    updateFeaturedRegion(regionId) {
        const region = this.state.regions.find(r => r.id === regionId);
        if (!region) return;
        
        // Update featured region title
        const titleElement = document.querySelector('.featured-region .region-info-title h3');
        if (titleElement) {
            titleElement.textContent = `${region.name}, ${region.countryName}`;
        }
        
        // Update featured region image
        const imageElement = document.querySelector('.featured-region .region-info-image img');
        if (imageElement) {
            imageElement.src = region.image;
            imageElement.alt = region.name;
        }
        
        // Update featured region stats
        const statsElements = document.querySelectorAll('.featured-region .stat-value');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = region.area.toLocaleString();
            statsElements[3].textContent = `${region.temperature.reduce((a, b) => a + b) / 12}°C`;
        }
        
        // Update featured region description
        const descriptionElement = document.querySelector('.featured-region .region-info-description');
        if (descriptionElement) {
            descriptionElement.innerHTML = `<p>${region.description}</p>`;
        }
        
        // Update variety tags
        const varietiesContainer = document.querySelector('.featured-region .variety-tags');
        if (varietiesContainer) {
            varietiesContainer.innerHTML = region.varieties.map(variety => 
                `<span class="variety-tag">${variety}</span>`
            ).join('');
        }
        
        // Update wine type distribution chart
        this.updateWineTypeChart(region.wineColors);
        
        // Update temperature chart
        this.updateTemperatureChart(region.temperature, region.rainfall);
    }
    
    /**
     * Setup country selector
     */
    setupCountrySelector() {
        const countryCards = document.querySelectorAll('.country-card');
        
        countryCards.forEach(card => {
            card.addEventListener('click', () => {
                // Update active state
                countryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Get selected country
                const country = card.getAttribute('data-country');
                this.state.activeCountry = country;
                
                // Filter map markers
                this.filterMapByCountry(country);
            });
        });
    }
    
    /**
     * Filter map markers by country
     */
    filterMapByCountry(country) {
        if (!this.state.map || !this.state.markers.length) return;
        
        // Filter markers and adjust map view
        if (country === 'all') {
            // Show all markers
            this.state.markers.forEach(marker => {
                marker.addTo(this.state.map);
            });
            
            // Adjust map view to show all markers
            this.state.map.setView([46.2276, 2.2137], 4);
        } else {
            // Filter markers by country
            const filteredMarkers = this.state.markers.filter(marker => marker.country === country);
            
            // Remove all markers
            this.state.markers.forEach(marker => {
                this.state.map.removeLayer(marker);
            });
            
            // Add filtered markers
            filteredMarkers.forEach(marker => {
                marker.addTo(this.state.map);
            });
            
            // Create bounds object and fit map to bounds
            if (filteredMarkers.length > 0) {
                const bounds = L.latLngBounds(filteredMarkers.map(marker => marker.getLatLng()));
                this.state.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }
    
    /**
     * Initialize wine type distribution chart
     */
    initWineTypeChart() {
        const ctx = document.getElementById('wine-type-chart');
        if (!ctx || !window.Chart) return;
        
        const region = this.state.regions.find(r => r.id === 'bordeaux');
        if (!region) return;
        
        // Create chart
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Rouge', 'Blanc', 'Rosé', 'Mousseux'],
                datasets: [{
                    data: [
                        region.wineColors.red,
                        region.wineColors.white,
                        region.wineColors.rose,
                        region.wineColors.sparkling
                    ],
                    backgroundColor: [
                        '#8B0000',
                        '#F4E992',
                        '#E4717A',
                        '#F8F4E1'
                    ],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
        
        // Store chart reference
        this.state.wineTypeChart = chart;
    }
    
    /**
     * Update wine type distribution chart
     */
    updateWineTypeChart(wineColors) {
        if (!this.state.wineTypeChart) return;
        
        // Update chart data
        this.state.wineTypeChart.data.datasets[0].data = [
            wineColors.red,
            wineColors.white,
            wineColors.rose,
            wineColors.sparkling
        ];
        
        // Update chart
        this.state.wineTypeChart.update();
    }
    
    /**
     * Initialize temperature chart
     */
    initTemperatureChart() {
        const ctx = document.getElementById('temperature-chart');
        if (!ctx || !window.Chart) return;
        
        const region = this.state.regions.find(r => r.id === 'bordeaux');
        if (!region) return;
        
        // Create chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                    label: 'Température moyenne (°C)',
                    data: region.temperature,
                    backgroundColor: 'rgba(139, 0, 0, 0.2)',
                    borderColor: 'rgba(139, 0, 0, 1)',
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(139, 0, 0, 1)'
                }, {
                    label: 'Précipitations (mm)',
                    data: region.rainfall,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Température (°C)'
                        },
                        suggestedMin: 0,
                        suggestedMax: 25
                    },
                    y1: {
                        title: {
                            display: true,
                            text: 'Précipitations (mm)'
                        },
                        position: 'right',
                        suggestedMin: 0,
                        suggestedMax: 120
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Store chart reference
        this.state.temperatureChart = chart;
    }
    
    /**
     * Update temperature chart
     */
    updateTemperatureChart(temperature, rainfall) {
        if (!this.state.temperatureChart) return;
        
        // Update chart data
        this.state.temperatureChart.data.datasets[0].data = temperature;
        this.state.temperatureChart.data.datasets[1].data = rainfall;
        
        // Update chart
        this.state.temperatureChart.update();
    }
    
    /**
     * Setup region comparison functionality
     */
    setupRegionComparison() {
        const region1Select = document.getElementById('region1-select');
        const region2Select = document.getElementById('region2-select');
        
        if (!region1Select || !region2Select) return;
        
        // Fill select options with regions
        this.state.regions.forEach(region => {
            const option1 = new Option(`${region.name}, ${region.countryName}`, region.id);
            const option2 = new Option(`${region.name}, ${region.countryName}`, region.id);
            
            region1Select.add(option1);
            region2Select.add(option2);
        });
        
        // Set default selections
        region1Select.value = this.state.selectedRegion1;
        region2Select.value = this.state.selectedRegion2;
        
        // Update comparison when selection changes
        region1Select.addEventListener('change', () => {
            this.state.selectedRegion1 = region1Select.value;
            this.updateComparisonChart();
            this.updateComparisonDetails();
        });
        
        region2Select.addEventListener('change', () => {
            this.state.selectedRegion2 = region2Select.value;
            this.updateComparisonChart();
            this.updateComparisonDetails();
        });
        
        // Initial update
        this.initComparisonChart();
        this.updateComparisonDetails();
    }
    
    /**
     * Initialize comparison chart
     */
    initComparisonChart() {
        const ctx = document.getElementById('comparison-chart');
        if (!ctx || !window.Chart) return;
        
        // Get selected regions
        const region1 = this.state.regions.find(r => r.id === this.state.selectedRegion1);
        const region2 = this.state.regions.find(r => r.id === this.state.selectedRegion2);
        
        if (!region1 || !region2) return;
        
        // Create radar chart
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Acidité', 'Tanins', 'Corps', 'Fruité', 'Épices', 'Minéralité', 'Boisé', 'Complexité'],
                datasets: [
                    {
                        label: region1.name,
                        data: [
                            region1.tasteProfile.acidity,
                            region1.tasteProfile.tannins,
                            region1.tasteProfile.body,
                            region1.tasteProfile.fruitiness,
                            region1.tasteProfile.spiciness,
                            region1.tasteProfile.minerality,
                            region1.tasteProfile.oakiness,
                            region1.tasteProfile.complexity
                        ],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(52, 152, 219, 1)'
                    },
                    {
                        label: region2.name,
                        data: [
                            region2.tasteProfile.acidity,
                            region2.tasteProfile.tannins,
                            region2.tasteProfile.body,
                            region2.tasteProfile.fruitiness,
                            region2.tasteProfile.spiciness,
                            region2.tasteProfile.minerality,
                            region2.tasteProfile.oakiness,
                            region2.tasteProfile.complexity
                        ],
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Store chart reference
        this.state.comparisonChart = chart;
    }
    
    /**
     * Update comparison chart
     */
    updateComparisonChart() {
        if (!this.state.comparisonChart) return;
        
        // Get selected regions
        const region1 = this.state.regions.find(r => r.id === this.state.selectedRegion1);
        const region2 = this.state.regions.find(r => r.id === this.state.selectedRegion2);
        
        if (!region1 || !region2) return;
        
        // Update chart datasets
        this.state.comparisonChart.data.datasets[0].label = region1.name;
        this.state.comparisonChart.data.datasets[0].data = [
            region1.tasteProfile.acidity,
            region1.tasteProfile.tannins,
            region1.tasteProfile.body,
            region1.tasteProfile.fruitiness,
            region1.tasteProfile.spiciness,
            region1.tasteProfile.minerality,
            region1.tasteProfile.oakiness,
            region1.tasteProfile.complexity
        ];
        
        this.state.comparisonChart.data.datasets[1].label = region2.name;
        this.state.comparisonChart.data.datasets[1].data = [
            region2.tasteProfile.acidity,
            region2.tasteProfile.tannins,
            region2.tasteProfile.body,
            region2.tasteProfile.fruitiness,
            region2.tasteProfile.spiciness,
            region2.tasteProfile.minerality,
            region2.tasteProfile.oakiness,
            region2.tasteProfile.complexity
        ];
        
        // Update chart
        this.state.comparisonChart.update();
    }
    
    /**
     * Update comparison details
     */
    updateComparisonDetails() {
        // Get selected regions
        const region1 = this.state.regions.find(r => r.id === this.state.selectedRegion1);
        const region2 = this.state.regions.find(r => r.id === this.state.selectedRegion2);
        
        if (!region1 || !region2) return;
        
        // Update headers
        const comparisonHeader = document.querySelector('.comparison-header');
        if (!comparisonHeader) return;
        
        const regionImages = comparisonHeader.querySelectorAll('.comparison-region-image img');
        const regionNames = comparisonHeader.querySelectorAll('.comparison-region h3');
        const regionCountries = comparisonHeader.querySelectorAll('.comparison-region p');
        
        if (regionImages.length >= 2) {
            regionImages[0].src = region1.image;
            regionImages[0].alt = region1.name;
            regionImages[1].src = region2.image;
            regionImages[1].alt = region2.name;
        }
        
        if (regionNames.length >= 2) {
            regionNames[0].textContent = region1.name;
            regionNames[1].textContent = region2.name;
        }
        
        if (regionCountries.length >= 2) {
            regionCountries[0].textContent = region1.countryName;
            regionCountries[1].textContent = region2.countryName;
        }
        
        // Update comparison rows
        const comparisonValues = document.querySelectorAll('.comparison-row .comparison-values');
        if (comparisonValues.length >= 8) {
            // Superficie
            const areaValues = comparisonValues[0].querySelectorAll('.comparison-value');
            if (areaValues.length >= 2) {
                areaValues[0].textContent = `${region1.area.toLocaleString()} ha`;
                areaValues[1].textContent = `${region2.area.toLocaleString()} ha`;
            }
            
            // Cépages principaux
            const varietiesValues = comparisonValues[1].querySelectorAll('.comparison-value');
            if (varietiesValues.length >= 2) {
                varietiesValues[0].textContent = region1.varieties.slice(0, 2).join(', ');
                varietiesValues[1].textContent = region2.varieties.slice(0, 2).join(', ');
            }
            
            // Style de vin dominant
            // This would require additional data not currently in our model
            
            // Climat
            // This would require additional data not currently in our model
            
            // Température moyenne
            const tempValues = comparisonValues[4].querySelectorAll('.comparison-value');
            if (tempValues.length >= 2) {
                tempValues[0].textContent = `${(region1.temperature.reduce((a, b) => a + b) / 12).toFixed(1)}°C`;
                tempValues[1].textContent = `${(region2.temperature.reduce((a, b) => a + b) / 12).toFixed(1)}°C`;
            }
            
            // Pluviométrie annuelle
            const rainfallValues = comparisonValues[5].querySelectorAll('.comparison-value');
            if (rainfallValues.length >= 2) {
                rainfallValues[0].textContent = `${region1.rainfall.reduce((a, b) => a + b)} mm`;
                rainfallValues[1].textContent = `${region2.rainfall.reduce((a, b) => a + b)} mm`;
            }
            
            // Sols dominants
            const soilValues = comparisonValues[6].querySelectorAll('.comparison-value');
            if (soilValues.length >= 2) {
                soilValues[0].textContent = region1.soilTypes.join(', ');
                soilValues[1].textContent = region2.soilTypes.join(', ');
            }
            
            // Production annuelle
            const productionValues = comparisonValues[7].querySelectorAll('.comparison-value');
            if (productionValues.length >= 2) {
                productionValues[0].textContent = `${region1.production} millions de bouteilles`;
                productionValues[1].textContent = `${region2.production} millions de bouteilles`;
            }
        }
    }
}

// Initialize the region manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and expose region manager globally
    window.regionManager = new RegionManager();
});