/**
 * cart.js - Handles all shopping cart functionality for Cité du Vin Marketplace
 * Manages cart state, user interactions, and API calls for cart management
 */

class CartManager {
    constructor() {
        // Initialize state
        this.state = {
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            userId: this.getUserId()
        };
        
        // Bind methods
        this.loadCart = this.loadCart.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.updateCartItem = this.updateCartItem.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
        this.clearCart = this.clearCart.bind(this);
        this.updateCartUI = this.updateCartUI.bind(this);
        this.updateCartCount = this.updateCartCount.bind(this);
        this.updateCartPreview = this.updateCartPreview.bind(this);
        this.updateCartPage = this.updateCartPage.bind(this);
        
        // Initialize cart
        this.init();
    }
    
    /**
     * Initialize the cart system
     */
    async init() {
        // Try to load cart from server-side storage
        await this.loadCart();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Get or create user ID for cart management
     */
    getUserId() {
        // Check if user ID exists in localStorage
        let userId = localStorage.getItem('cduv_user_id');
        
        // If not, create a new one
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cduv_user_id', userId);
        }
        
        return userId;
    }
    
    /**
     * Load cart data from server
     */
    async loadCart() {
        try {
            const response = await fetch(`/api/cart/${this.state.userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load cart');
            }
            
            const cartData = await response.json();
            
            // Update state
            this.state.items = cartData.items || [];
            this.state.subtotal = cartData.summary?.subtotal || 0;
            this.state.tax = cartData.summary?.tax || 0;
            this.state.shipping = cartData.summary?.shipping || 0;
            this.state.total = cartData.summary?.total || 0;
            
            // Update UI
            this.updateCartUI();
            
            return cartData;
        } catch (error) {
            console.error('Error loading cart:', error);
            
            // Fallback to local storage if API fails
            this.loadCartFromLocalStorage();
            
            return {
                items: this.state.items,
                summary: {
                    subtotal: this.state.subtotal,
                    tax: this.state.tax,
                    shipping: this.state.shipping,
                    total: this.state.total
                }
            };
        }
    }
    
    /**
     * Fallback method to load cart from localStorage
     */
    loadCartFromLocalStorage() {
        try {
            const cartData = JSON.parse(localStorage.getItem('cduv_cart') || '{"items":[]}');
            
            // Update state
            this.state.items = cartData.items || [];
            
            // Calculate totals
            this.calculateTotals();
            
            // Update UI
            this.updateCartUI();
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            this.state.items = [];
            this.calculateTotals();
            this.updateCartUI();
        }
    }
    
    /**
     * Save cart to localStorage as fallback
     */
    saveCartToLocalStorage() {
        try {
            localStorage.setItem('cduv_cart', JSON.stringify({
                items: this.state.items
            }));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }
    
    /**
     * Calculate cart totals
     */
    calculateTotals() {
        // Calculate subtotal
        this.state.subtotal = this.state.items.reduce((sum, item) => {
            return sum + (item.wine.price * item.quantity);
        }, 0);
        
        // Calculate tax (10%)
        this.state.tax = this.state.subtotal * 0.1;
        
        // Calculate shipping (flat fee or free above certain amount)
        this.state.shipping = this.state.subtotal > 100 ? 0 : 15;
        
        // Calculate total
        this.state.total = this.state.subtotal + this.state.tax + this.state.shipping;
    }
    
    /**
     * Add a wine to the cart
     * @param {Object} wine - Wine object to add
     * @param {number} quantity - Quantity to add
     */
    async addToCart(wine, quantity = 1) {
        try {
            // API request to add item to cart
            const response = await fetch(`/api/cart/${this.state.userId}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    wineId: wine.id,
                    quantity: quantity
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            
            // Reload cart data
            await this.loadCart();
            
            // Show notification
            this.showNotification(`${wine.title || 'Vin'} ajouté à votre panier.`, 'success');
            
            // Show cart preview
            this.showCartPreview();
            
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            
            // Fallback to local storage method
            this.addToCartLocally(wine, quantity);
            
            // Show notification
            this.showNotification(`${wine.title || 'Vin'} ajouté à votre panier.`, 'success');
            
            // Show cart preview
            this.showCartPreview();
            
            return true;
        }
    }
    
    /**
     * Fallback method to add item to cart locally
     */
    addToCartLocally(wine, quantity = 1) {
        // Check if item already exists in cart
        const existingItemIndex = this.state.items.findIndex(item => item.wine.id === wine.id);
        
        if (existingItemIndex !== -1) {
            // Increase quantity if already in cart
            this.state.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if not in cart
            this.state.items.push({
                wine: {
                    id: wine.id,
                    title: wine.title,
                    price: wine.price,
                    image: wine.image || 'assets/images/wine-placeholder.jpg',
                    region_1: wine.region_1,
                    variety: wine.variety
                },
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        // Recalculate totals
        this.calculateTotals();
        
        // Save to localStorage
        this.saveCartToLocalStorage();
        
        // Update UI
        this.updateCartUI();
    }
    
    /**
     * Update item quantity in cart
     * @param {string} wineId - ID of the wine to update
     * @param {number} quantity - New quantity
     */
    async updateCartItem(wineId, quantity) {
        try {
            // API request to update item quantity
            const response = await fetch(`/api/cart/${this.state.userId}/items/${wineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity: quantity
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update cart item');
            }
            
            // Reload cart data
            await this.loadCart();
            
            return true;
        } catch (error) {
            console.error('Error updating cart item:', error);
            
            // Fallback to local storage method
            this.updateCartItemLocally(wineId, quantity);
            
            return true;
        }
    }
    
    /**
     * Fallback method to update cart item locally
     */
    updateCartItemLocally(wineId, quantity) {
        // Find item index
        const itemIndex = this.state.items.findIndex(item => item.wine.id === wineId);
        
        if (itemIndex === -1) {
            return false;
        }
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            this.state.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            this.state.items[itemIndex].quantity = quantity;
        }
        
        // Recalculate totals
        this.calculateTotals();
        
        // Save to localStorage
        this.saveCartToLocalStorage();
        
        // Update UI
        this.updateCartUI();
        
        return true;
    }
    
    /**
     * Remove item from cart
     * @param {string} wineId - ID of the wine to remove
     */
    async removeFromCart(wineId) {
        try {
            // API request to remove item
            const response = await fetch(`/api/cart/${this.state.userId}/items/${wineId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }
            
            // Reload cart data
            await this.loadCart();
            
            // Show notification
            this.showNotification('Produit retiré du panier.', 'info');
            
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            
            // Fallback to local storage method
            this.removeFromCartLocally(wineId);
            
            // Show notification
            this.showNotification('Produit retiré du panier.', 'info');
            
            return true;
        }
    }
    
    /**
     * Fallback method to remove item from cart locally
     */
    removeFromCartLocally(wineId) {
        // Find item index
        const itemIndex = this.state.items.findIndex(item => item.wine.id === wineId);
        
        if (itemIndex === -1) {
            return false;
        }
        
        // Remove item
        this.state.items.splice(itemIndex, 1);
        
        // Recalculate totals
        this.calculateTotals();
        
        // Save to localStorage
        this.saveCartToLocalStorage();
        
        // Update UI
        this.updateCartUI();
        
        return true;
    }
    
    /**
     * Clear the cart
     */
    async clearCart() {
        try {
            // API request to clear cart
            const response = await fetch(`/api/cart/${this.state.userId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }
            
            // Reload cart data
            await this.loadCart();
            
            // Show notification
            this.showNotification('Votre panier a été vidé.', 'info');
            
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            
            // Fallback to local storage method
            this.clearCartLocally();
            
            // Show notification
            this.showNotification('Votre panier a été vidé.', 'info');
            
            return true;
        }
    }
    
    /**
     * Fallback method to clear cart locally
     */
    clearCartLocally() {
        // Clear items
        this.state.items = [];
        
        // Recalculate totals
        this.calculateTotals();
        
        // Save to localStorage
        this.saveCartToLocalStorage();
        
        // Update UI
        this.updateCartUI();
        
        return true;
    }
    
    /**
     * Setup event listeners for cart functionality
     */
    setupEventListeners() {
        // Cart page specific elements
        document.addEventListener('click', (event) => {
            // Add to cart buttons
            if (event.target.closest('.add-btn')) {
                const button = event.target.closest('.add-btn');
                const wineId = button.getAttribute('data-id');
                
                if (wineId) {
                    this.handleAddToCartClick(wineId);
                }
            }
            
            // Remove from cart buttons
            if (event.target.closest('.cart-remove')) {
                const button = event.target.closest('.cart-remove');
                const wineId = button.getAttribute('data-id');
                
                if (wineId) {
                    this.removeFromCart(wineId);
                }
            }
            
            // Clear cart button
            if (event.target.closest('#clear-cart')) {
                this.clearCart();
            }
            
            // Quantity decrease buttons
            if (event.target.closest('.decrease-btn')) {
                const button = event.target.closest('.decrease-btn');
                const wineId = button.getAttribute('data-id');
                const input = document.querySelector(`.quantity-value[data-id="${wineId}"]`);
                
                if (wineId && input) {
                    let quantity = parseInt(input.value || 1);
                    if (quantity > 1) {
                        quantity--;
                        input.value = quantity;
                        this.updateCartItem(wineId, quantity);
                    }
                }
            }
            
            // Quantity increase buttons
            if (event.target.closest('.increase-btn')) {
                const button = event.target.closest('.increase-btn');
                const wineId = button.getAttribute('data-id');
                const input = document.querySelector(`.quantity-value[data-id="${wineId}"]`);
                
                if (wineId && input) {
                    let quantity = parseInt(input.value || 1);
                    quantity++;
                    input.value = quantity;
                    this.updateCartItem(wineId, quantity);
                }
            }
        });
        
        // Add change event listener to quantity inputs
        document.addEventListener('change', (event) => {
            if (event.target.classList.contains('quantity-value')) {
                const wineId = event.target.getAttribute('data-id');
                let quantity = parseInt(event.target.value || 1);
                
                // Ensure quantity is at least 1
                if (quantity < 1) {
                    quantity = 1;
                    event.target.value = 1;
                }
                
                if (wineId) {
                    this.updateCartItem(wineId, quantity);
                }
            }
        });
        
        // Cart preview toggle
        const cartButton = document.getElementById('cart-button');
        const cartPreview = document.getElementById('cart-preview');
        const cartPreviewClose = document.getElementById('cart-preview-close');
        
        if (cartButton && cartPreview) {
            cartButton.addEventListener('click', (event) => {
                event.stopPropagation();
                cartPreview.classList.toggle('show');
            });
            
            if (cartPreviewClose) {
                cartPreviewClose.addEventListener('click', () => {
                    cartPreview.classList.remove('show');
                });
            }
            
            // Close cart preview when clicking outside
            document.addEventListener('click', (event) => {
                if (cartPreview.classList.contains('show') && 
                    !cartPreview.contains(event.target) && 
                    !cartButton.contains(event.target)) {
                    cartPreview.classList.remove('show');
                }
            });
        }
    }
    
    /**
     * Handle add to cart button click
     * @param {string} wineId - ID of the wine to add
     */
    async handleAddToCartClick(wineId) {
        try {
            // Get wine details
            const wine = await this.getWineDetails(wineId);
            
            if (wine) {
                // Add to cart
                this.addToCart(wine, 1);
            }
        } catch (error) {
            console.error('Error handling add to cart:', error);
            this.showNotification('Erreur lors de l\'ajout au panier.', 'error');
        }
    }
    
    /**
     * Get wine details
     * @param {string} wineId - ID of the wine to get details for
     */
    async getWineDetails(wineId) {
        try {
            const response = await fetch(`/api/wines/${wineId}`);
            
            if (!response.ok) {
                throw new Error('Failed to get wine details');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting wine details:', error);
            return null;
        }
    }
    
    /**
     * Show cart preview
     */
    showCartPreview() {
        const cartPreview = document.getElementById('cart-preview');
        
        if (cartPreview) {
            cartPreview.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (cartPreview.classList.contains('show')) {
                    cartPreview.classList.remove('show');
                }
            }, 5000);
        }
    }
    
    /**
     * Update all cart UI elements
     */
    updateCartUI() {
        this.updateCartCount();
        this.updateCartPreview();
        this.updateCartPage();
    }
    
    /**
     * Update cart count in header
     */
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        
        if (cartCount) {
            const totalItems = this.state.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems.toString();
            
            // Hide badge if cart is empty
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    /**
     * Update cart preview
     */
    updateCartPreview() {
        const cartPreviewItems = document.getElementById('cart-preview-items');
        const cartPreviewTotal = document.getElementById('cart-preview-total-amount');
        
        if (!cartPreviewItems || !cartPreviewTotal) {
            return;
        }
        
        // Clear container
        cartPreviewItems.innerHTML = '';
        
        // Generate items HTML
        if (this.state.items.length > 0) {
            this.state.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-preview-item';
                itemElement.innerHTML = `
                    <div class="cart-preview-item-img">
                        <img src="${item.wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${item.wine.title}">
                    </div>
                    <div class="cart-preview-item-details">
                        <div class="cart-preview-item-title">${item.wine.title}</div>
                        <div class="cart-preview-item-price">€${item.wine.price.toFixed(2)}</div>
                        <div class="cart-preview-item-quantity">Qté: ${item.quantity}</div>
                    </div>
                    <button class="cart-preview-item-remove" data-id="${item.wine.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                cartPreviewItems.appendChild(itemElement);
            });
        } else {
            // If cart is empty, show message
            cartPreviewItems.innerHTML = `
                <div class="cart-empty-message">
                    Votre panier est vide
                </div>
            `;
        }
        
        // Update total
        cartPreviewTotal.textContent = `€${this.state.subtotal.toFixed(2)}`;
    }
    
    /**
     * Update cart page if on the cart page
     */
    updateCartPage() {
        // Check if we're on the cart page
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartShipping = document.getElementById('cart-shipping');
        const cartTax = document.getElementById('cart-tax');
        const cartTotal = document.getElementById('cart-total');
        const cartEmpty = document.getElementById('cart-empty');
        const cartWithItems = document.getElementById('cart-with-items');
        
        if (!cartItemsContainer) {
            return; // Not on cart page
        }
        
        // Show/hide empty cart message
        if (cartEmpty && cartWithItems) {
            if (this.state.items.length === 0) {
                cartEmpty.style.display = 'block';
                cartWithItems.style.display = 'none';
                return;
            } else {
                cartEmpty.style.display = 'none';
                cartWithItems.style.display = 'block';
            }
        }
        
        // Clear container
        cartItemsContainer.innerHTML = '';
        
        // Generate items HTML
        this.state.items.forEach(item => {
            const itemTotal = item.quantity * item.wine.price;
            
            const tr = document.createElement('tr');
            tr.className = 'cart-item-row';
            tr.innerHTML = `
                <td>
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${item.wine.title}">
                        </div>
                        <div class="cart-item-details">
                            <h3 class="cart-item-title">${item.wine.title}</h3>
                            <div class="cart-item-meta">
                                <span>${item.wine.region_1 || ''}</span>
                                ${item.wine.variety ? `| <span>${item.wine.variety}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="cart-price">€${item.wine.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-input">
                        <button type="button" class="quantity-btn decrease-btn" data-id="${item.wine.id}">-</button>
                        <input type="number" class="quantity-value" value="${item.quantity}" min="1" max="12" data-id="${item.wine.id}">
                        <button type="button" class="quantity-btn increase-btn" data-id="${item.wine.id}">+</button>
                    </div>
                </td>
                <td class="cart-subtotal">€${itemTotal.toFixed(2)}</td>
                <td>
                    <button type="button" class="cart-remove" data-id="${item.wine.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            cartItemsContainer.appendChild(tr);
        });
        
        // Update totals
        if (cartSubtotal) cartSubtotal.textContent = `€${this.state.subtotal.toFixed(2)}`;
        if (cartShipping) cartShipping.textContent = `€${this.state.shipping.toFixed(2)}`;
        if (cartTax) cartTax.textContent = `€${this.state.tax.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `€${this.state.total.toFixed(2)}`;
    }
    
    /**
     * Show notification
     * @param {string} message - Message to show
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Check if notification container exists, create it if not
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Add animation class after a small delay (for transition to work)
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300); // Wait for transition to complete
            });
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300); // Wait for transition to complete
            }
        }, 5000);
    }
}

// Initialize cart manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create and expose cart manager globally
    window.cartManager = new CartManager();
});