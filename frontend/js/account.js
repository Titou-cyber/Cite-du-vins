// frontend/js/account.js
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user profile data
    loadProfileData();
    
    // Load user favorites
    loadFavorites();
    
    // Load user orders
    loadOrders();
    
    // Load tasting notes
    loadTastingNotes();
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up form submissions
    setupFormSubmissions();
});

async function loadProfileData() {
    try {
        // Get user data from localStorage or fetch fresh data
        const user = authApi.user;
        
        // Update profile form
        document.getElementById('profile-firstName').value = user.firstName || '';
        document.getElementById('profile-lastName').value = user.lastName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        
        if (user.birthdate) {
            document.getElementById('profile-birthdate').value = new Date(user.birthdate).toISOString().split('T')[0];
        }
        
        // Update profile header
        document.getElementById('user-name').textContent = `${user.firstName || ''} ${user.lastName || ''}`;
        document.getElementById('user-email').textContent = user.email || '';
        
        // Update stats
        document.getElementById('favorites-count').textContent = (user.favoriteWines || []).length;
        document.getElementById('reviews-count').textContent = (user.tastingNotes || []).length;
        document.getElementById('orders-count').textContent = '0'; // This would be updated when orders are loaded
        
        // Load preferences if available
        if (user.preferences) {
            loadPreferences(user.preferences);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        showErrorMessage('Failed to load profile data. Please try again.');
    }
}

function loadPreferences(preferences) {
    // Wine types preferences
    const wineTypes = preferences.wineTypes || [];
    wineTypes.forEach(type => {
        const checkbox = document.getElementById(`wine-type-${type}`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Favorite regions
    const favoriteRegions = preferences.favoriteRegions || [];
    const regionsSelect = document.getElementById('favorite-regions');
    if (regionsSelect) {
        Array.from(regionsSelect.options).forEach(option => {
            option.selected = favoriteRegions.includes(option.value);
        });
    }
    
    // Favorite varieties
    const favoriteVarieties = preferences.favoriteVarieties || [];
    const varietiesSelect = document.getElementById('favorite-varieties');
    if (varietiesSelect) {
        Array.from(varietiesSelect.options).forEach(option => {
            option.selected = favoriteVarieties.includes(option.value);
        });
    }
    
    // Taste preferences
    const tastePreferences = preferences.tastePreferences || {};
    if (tastePreferences.sweetness) document.getElementById('taste-sweetness').value = tastePreferences.sweetness;
    if (tastePreferences.acidity) document.getElementById('taste-acidity').value = tastePreferences.acidity;
    if (tastePreferences.tannin) document.getElementById('taste-tannin').value = tastePreferences.tannin;
    if (tastePreferences.body) document.getElementById('taste-body').value = tastePreferences.body;
}

async function loadFavorites() {
    try {
        const user = authApi.user;
        const favoriteWines = user.favoriteWines || [];
        
        // Show loader while fetching
        document.getElementById('favorites-loader').style.display = 'block';
        document.getElementById('favorites-empty').style.display = 'none';
        
        if (favoriteWines.length === 0) {
            // Show empty state
            document.getElementById('favorites-loader').style.display = 'none';
            document.getElementById('favorites-empty').style.display = 'block';
            return;
        }
        
        // Fetch details for all favorite wines
        const winesPromises = favoriteWines.map(id => wineAPI.getWineById(id));
        const wines = await Promise.all(winesPromises);
        
        // Create HTML for each wine
        const favoritesContainer = document.getElementById('favorites-container');
        let html = '';
        
        wines.forEach(wine => {
            if (!wine) return; // Skip if wine not found
            
            html += `
                <div class="wine-card">
                    <div class="wine-image">
                        <img src="${wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${wine.title || 'Wine'}">
                    </div>
                    <div class="wine-content">
                        <div class="wine-meta">
                            <span class="wine-region">${wine.region_1 || ''}</span>
                        </div>
                        <h3 class="wine-title">${wine.title || 'Unnamed Wine'}</h3>
                        <div class="wine-points">
                            <span class="wine-points-value">${wine.points || '?'}</span>
                            <span class="wine-points-label">pts</span>
                        </div>
                        <div class="wine-tags">
                            <span class="wine-tag">${wine.variety || ''}</span>
                        </div>
                        <div class="wine-footer">
                            <div class="wine-price">€${wine.price || '?'}</div>
                            <div class="wine-actions">
                                <button class="btn primary add-btn" data-id="${wine.id}">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                                <button class="favorite-btn active" data-id="${wine.id}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        favoritesContainer.innerHTML = html;
        document.getElementById('favorites-loader').style.display = 'none';
        
        // Add event listeners to buttons
        favoritesContainer.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const wineId = btn.getAttribute('data-id');
                try {
                    await authApi.removeFromFavorites(wineId);
                    // Reload favorites
                    loadFavorites();
                    // Update counter
                    document.getElementById('favorites-count').textContent = 
                        (parseInt(document.getElementById('favorites-count').textContent) - 1).toString();
                } catch (error) {
                    console.error('Error removing from favorites:', error);
                }
            });
        });
        
        favoritesContainer.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const wineId = btn.getAttribute('data-id');
                try {
                    await cartManager.addToCart({id: wineId}, 1);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error loading favorites:', error);
        document.getElementById('favorites-loader').style.display = 'none';
        const favoritesContainer = document.getElementById('favorites-container');
        favoritesContainer.innerHTML = '<div class="error-message">Failed to load favorites. Please try again.</div>';
    }
}

async function loadTastingNotes() {
    try {
        const user = authApi.user;
        const tastingNotes = user.tastingNotes || [];
        
        // Show loader while fetching
        document.getElementById('tastings-loader').style.display = 'block';
        document.getElementById('tastings-empty').style.display = 'none';
        
        if (tastingNotes.length === 0) {
            // Show empty state
            document.getElementById('tastings-loader').style.display = 'none';
            document.getElementById('tastings-empty').style.display = 'block';
            return;
        }
        
        // Create HTML for each tasting note
        const tastingNotesContainer = document.getElementById('tasting-notes-container');
        let html = '';
        
        // Get wine details for all notes
        const wineIds = tastingNotes.map(note => note.wineId);
        const uniqueWineIds = [...new Set(wineIds)];
        const winesPromises = uniqueWineIds.map(id => wineAPI.getWineById(id));
        const wines = await Promise.all(winesPromises);
        const wineMap = {};
        wines.forEach(wine => {
            if (wine) wineMap[wine.id] = wine;
        });
        
        tastingNotes.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(note => {
            const wine = wineMap[note.wineId] || { title: 'Unknown Wine' };
            
            html += `
                <div class="tasting-note-card">
                    <div class="tasting-note-header">
                        <div class="wine-info">
                            <h3 class="wine-title">${wine.title}</h3>
                            <div class="wine-meta">
                                <span class="wine-vintage">${wine.vintage || ''}</span>
                                <span class="wine-region">${wine.region_1 || ''}</span>
                            </div>
                        </div>
                        <div class="tasting-date">
                            ${new Date(note.date).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                    <div class="tasting-rating">
                        ${Array(Math.floor(note.rating || 0)).fill('<i class="fas fa-star"></i>').join('')}
                        ${(note.rating % 1 >= 0.5) ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        ${Array(5 - Math.ceil(note.rating || 0)).fill('<i class="far fa-star"></i>').join('')}
                        <span class="rating-value">${note.rating}/5</span>
                    </div>
                    <div class="tasting-note-content">
                        <p>${note.notes || ''}</p>
                    </div>
                    <div class="tasting-note-tags">
                        ${(note.aromas || []).map(aroma => `<span class="tasting-tag">${aroma}</span>`).join('')}
                    </div>
                </div>
            `;
        });
        
        tastingNotesContainer.innerHTML = html;
        document.getElementById('tastings-loader').style.display = 'none';
    } catch (error) {
        console.error('Error loading tasting notes:', error);
        document.getElementById('tastings-loader').style.display = 'none';
        const tastingNotesContainer = document.getElementById('tasting-notes-container');
        tastingNotesContainer.innerHTML = '<div class="error-message">Failed to load tasting notes. Please try again.</div>';
    }
}

async function loadOrders() {
    // This would fetch the user's order history from the server
    // Since this is not fully implemented yet, we'll just show a placeholder
    document.getElementById('orders-loader').style.display = 'none';
    document.getElementById('orders-empty').style.display = 'block';
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Get the tab target
            const target = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show target tab content
            document.getElementById(`${target}-tab`).classList.add('active');
        });
    });
}

function setupFormSubmissions() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = {
                    firstName: document.getElementById('profile-firstName').value,
                    lastName: document.getElementById('profile-lastName').value,
                    email: document.getElementById('profile-email').value,
                    phone: document.getElementById('profile-phone').value,
                    birthdate: document.getElementById('profile-birthdate').value
                };
                
                // Update profile
                await authApi.updateProfile(formData);
                
                // Show success message
                const successMessage = document.getElementById('profile-success-message');
                successMessage.textContent = 'Profil mis à jour avec succès!';
                successMessage.style.display = 'block';
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
                
                // Update profile header
                document.getElementById('user-name').textContent = `${formData.firstName} ${formData.lastName}`;
                document.getElementById('user-email').textContent = formData.email;
            } catch (error) {
                console.error('Error updating profile:', error);
                showErrorMessage('Failed to update profile. Please try again.');
            }
        });
    }
    
    // Preferences form submission
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get selected wine types
                const wineTypesInputs = document.querySelectorAll('input[name="wineTypes"]:checked');
                const wineTypes = Array.from(wineTypesInputs).map(input => input.value);
                
                // Get selected regions
                const favoriteRegionsSelect = document.getElementById('favorite-regions');
                const favoriteRegions = Array.from(favoriteRegionsSelect.selectedOptions).map(option => option.value);
                
                // Get selected varieties
                const favoriteVarietiesSelect = document.getElementById('favorite-varieties');
                const favoriteVarieties = Array.from(favoriteVarietiesSelect.selectedOptions).map(option => option.value);
                
                // Get taste preferences
                const tastePreferences = {
                    sweetness: parseFloat(document.getElementById('taste-sweetness').value),
                    acidity: parseFloat(document.getElementById('taste-acidity').value),
                    tannin: parseFloat(document.getElementById('taste-tannin').value),
                    body: parseFloat(document.getElementById('taste-body').value)
                };
                
                // Build preferences object
                const preferences = {
                    wineTypes,
                    favoriteRegions,
                    favoriteVarieties,
                    tastePreferences
                };
                
                // Update preferences
                await authApi.updatePreferences(preferences);
                
                // Show success message
                const successMessage = document.getElementById('preferences-success-message');
                successMessage.textContent = 'Préférences mises à jour avec succès!';
                successMessage.style.display = 'block';
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            } catch (error) {
                console.error('Error updating preferences:', error);
                showErrorMessage('Failed to update preferences. Please try again.');
            }
        });
    }
    
    // Change password form submission
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                const errorMessage = document.getElementById('security-error-message');
                errorMessage.textContent = 'Les mots de passe ne correspondent pas.';
                errorMessage.style.display = 'block';
                return;
            }
            
            try {
                // Change password
                await authApi.changePassword(currentPassword, newPassword);
                
                // Clear form
                changePasswordForm.reset();
                
                // Show success message
                const successMessage = document.getElementById('security-success-message');
                successMessage.textContent = 'Mot de passe changé avec succès!';
                successMessage.style.display = 'block';
                document.getElementById('security-error-message').style.display = 'none';
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            } catch (error) {
                console.error('Error changing password:', error);
                const errorMessage = document.getElementById('security-error-message');
                errorMessage.textContent = error.message || 'Échec du changement de mot de passe. Veuillez réessayer.';
                errorMessage.style.display = 'block';
                document.getElementById('security-success-message').style.display = 'none';
            }
        });
    }
}

function showErrorMessage(message) {
    // Create error message if it doesn't exist
    let errorContainer = document.querySelector('.global-error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'global-error-message alert alert-error';
        document.querySelector('.account-content').prepend(errorContainer);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Hide error message after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}