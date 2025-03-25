// Simple Wine Card Implementation with Static Data
// Add this to a new file called simple-wines.js in your js folder

document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the wine list container
    const wineListContainer = document.getElementById('wine-list');
    if (!wineListContainer) return;
    
    // Get reference to the load more button
    const loadMoreButton = document.getElementById('load-more');
    
    // Sample wine data
    const sampleWines = [
        {
            title: "Château Margaux 2018",
            winery: "Château Margaux",
            varietal: "Cabernet Sauvignon",
            region: "Bordeaux",
            country: "France",
            description: "Elegant and powerful with notes of blackcurrant, violet and cedar. Silky tannins and a long finish.",
            points: 97,
            price: 850
        },
        {
            title: "Cloudy Bay Sauvignon Blanc 2021",
            winery: "Cloudy Bay",
            varietal: "Sauvignon Blanc",
            region: "Marlborough",
            country: "New Zealand",
            description: "Vibrant and zesty with tropical fruit flavors, lemongrass and a crisp mineral finish.",
            points: 92,
            price: 32
        },
        {
            title: "Dom Pérignon 2010",
            winery: "Moët & Chandon",
            varietal: "Champagne Blend",
            region: "Champagne",
            country: "France",
            description: "Refined bubbles with notes of almond, powdered cocoa, white fruit and hints of dried flowers.",
            points: 96,
            price: 190
        },
        {
            title: "Whispering Angel 2022",
            winery: "Château d'Esclans",
            varietal: "Rosé Blend",
            region: "Provence",
            country: "France",
            description: "Fresh and crisp with notes of red berries, peach and a touch of minerality. Dry and elegant finish.",
            points: 90,
            price: 25
        },
        {
            title: "Opus One 2019",
            winery: "Opus One Winery",
            varietal: "Cabernet Blend",
            region: "Napa Valley",
            country: "United States",
            description: "Powerful yet elegant with dark fruit, cedar, and spice notes. Beautifully structured with firm tannins.",
            points: 98,
            price: 350
        },
        {
            title: "Penfolds Grange 2017",
            winery: "Penfolds",
            varietal: "Shiraz",
            region: "South Australia",
            country: "Australia",
            description: "Intense with layers of dark fruit, mocha, and spice. Full-bodied with exceptional depth and a long finish.",
            points: 97,
            price: 750
        },
        {
            title: "Tignanello 2019",
            winery: "Antinori",
            varietal: "Sangiovese Blend",
            region: "Tuscany",
            country: "Italy",
            description: "Rich and intense with cherry, spice and tobacco notes. Velvety texture with a persistent finish.",
            points: 96,
            price: 150
        },
        {
            title: "Egon Müller Scharzhofberger Riesling Auslese 2020",
            winery: "Egon Müller",
            varietal: "Riesling",
            region: "Mosel",
            country: "Germany",
            description: "Delicate and precise with honeyed notes, ripe peach, and vibrant acidity. Perfect balance of sweetness.",
            points: 95,
            price: 320
        },
        {
            title: "Vega Sicilia Único 2011",
            winery: "Vega Sicilia",
            varietal: "Tempranillo Blend",
            region: "Ribera del Duero",
            country: "Spain",
            description: "Complex with dark berries, leather, and tobacco. Powerful structure with elegant tannins and a memorable finish.",
            points: 98,
            price: 595
        }
    ];
    
    // Remove any loading spinners
    wineListContainer.innerHTML = '';
    
    // Display wine cards
    sampleWines.forEach(wine => {
        const wineCard = createWineCard(wine);
        wineListContainer.appendChild(wineCard);
    });
    
    // Set up load more button
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            // Generate more sample wines (just duplicating with different names)
            const moreWines = sampleWines.slice(0, 3).map(wine => {
                return {
                    ...wine,
                    title: wine.title + " (Reserve)",
                    price: Math.round(wine.price * 1.2)
                };
            });
            
            // Add more wine cards
            moreWines.forEach(wine => {
                const wineCard = createWineCard(wine);
                wineListContainer.appendChild(wineCard);
            });
        });
    }
    
    // Setup filter button event listener
    const applyFiltersButton = document.getElementById('apply-filters');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', function() {
            // In a real implementation, this would filter the wines
            // For now, just show a message
            alert('Filters applied! This would filter the wines in a real implementation.');
        });
    }
    
    // Create a wine card with the new design
    function createWineCard(wine) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = document.createElement('div');
        card.className = 'card wine-card';
        
        // Determine wine type and visuals
        const wineType = wine.varietal || '';
        let typeClass = 'wine-type-red';
        let iconClass = 'wine-icon-red';
        
        if (wineType.toLowerCase().includes('blanc') || 
            wineType.toLowerCase().includes('white') || 
            wineType.toLowerCase().includes('chardonnay') || 
            wineType.toLowerCase().includes('sauvignon')) {
            typeClass = 'wine-type-white';
            iconClass = 'wine-icon-white';
        } else if (wineType.toLowerCase().includes('sparkling') || 
                wineType.toLowerCase().includes('champagne')) {
            typeClass = 'wine-type-sparkling';
            iconClass = 'wine-icon-sparkling';
        } else if (wineType.toLowerCase().includes('rosé') || 
                wineType.toLowerCase().includes('rose')) {
            typeClass = 'wine-type-rose';
            iconClass = 'wine-icon-rose';
        }
        
        // Create wine type icon element
        const wineTypeIcon = document.createElement('div');
        wineTypeIcon.className = `wine-type-icon ${typeClass}`;
        
        const wineIconContainer = document.createElement('div');
        wineIconContainer.className = 'wine-icon-container';
        
        const wineIcon = document.createElement('div');
        wineIcon.className = `wine-icon ${iconClass}`;
        
        // Add bubbles for sparkling wine
        if (typeClass === 'wine-type-sparkling') {
            for (let i = 0; i < 8; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'wine-icon-bubble';
                bubble.style.width = `${3 + Math.random() * 5}px`;
                bubble.style.height = bubble.style.width;
                bubble.style.top = `${10 + Math.random() * 40}px`;
                bubble.style.left = `${5 + Math.random() * 10}px`;
                wineIcon.appendChild(bubble);
            }
        }
        
        wineIconContainer.appendChild(wineIcon);
        
        const typeLabel = document.createElement('div');
        typeLabel.className = 'mt-2';
        typeLabel.textContent = wineType;
        
        wineIconContainer.appendChild(typeLabel);
        wineTypeIcon.appendChild(wineIconContainer);
        
        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        cardBody.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title">${wine.title || 'Unnamed Wine'}</h5>
                <span class="wine-rating">${wine.points || 'N/A'}</span>
            </div>
            <h6 class="card-subtitle mb-2 text-muted">${wine.winery || 'Unknown Winery'}</h6>
            <p class="card-text small">${wine.description || 'No description available.'}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
                <span class="badge ${typeClass === 'wine-type-red' ? 'badge-red' : 
                                    typeClass === 'wine-type-white' ? 'badge-white' : 
                                    typeClass === 'wine-type-sparkling' ? 'badge-sparkling' : 'badge-rose'}">
                    ${wineType}
                </span>
                <span class="wine-price">$${wine.price || 'N/A'}</span>
            </div>
        `;
        
        // Create card footer
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer bg-white';
        cardFooter.innerHTML = `
            <small class="text-muted">${wine.region || 'Unknown Region'}, ${wine.country || 'Unknown Country'}</small>
        `;
        
        // Assemble the card
        card.appendChild(wineTypeIcon);
        card.appendChild(cardBody);
        card.appendChild(cardFooter);
        col.appendChild(card);
        
        return col;
    }
});