/**
 * Modern Side Panel Checkout
 * Provides an integrated shopping cart and checkout experience
 * that slides in from the side of the page.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create and append the side checkout HTML structure
    const sideCheckoutHTML = `
      <div class="side-checkout-container">
        <!-- Overlay -->
        <div class="side-checkout-overlay" id="side-checkout-overlay"></div>
        
        <!-- Side Panel -->
        <div class="side-checkout-panel" id="side-checkout-panel">
          <!-- Panel Content -->
          <div class="side-checkout-content">
            <!-- Header -->
            <div class="side-checkout-header">
              <h3 id="side-checkout-title">Your Collection</h3>
              <button id="side-checkout-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Progress Steps -->
            <div class="checkout-progress" id="checkout-progress">
              <div class="checkout-step active" data-step="shipping">
                <div class="checkout-step-circle">1</div>
                <div class="checkout-step-label">Shipping</div>
              </div>
              <div class="checkout-step" data-step="payment">
                <div class="checkout-step-circle">2</div>
                <div class="checkout-step-label">Payment</div>
              </div>
              <div class="checkout-step" data-step="review">
                <div class="checkout-step-circle">3</div>
                <div class="checkout-step-label">Review</div>
              </div>
              <div class="checkout-step" data-step="confirmation">
                <div class="checkout-step-circle">4</div>
                <div class="checkout-step-label">Confirmation</div>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="side-checkout-main" id="side-checkout-main">
              <!-- Content will be dynamically loaded here -->
            </div>
            
            <!-- Footer -->
            <div class="side-checkout-footer" id="side-checkout-footer">
              <!-- Footer content will be dynamically loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append to body
    const div = document.createElement('div');
    div.innerHTML = sideCheckoutHTML.trim();
    document.body.appendChild(div.firstChild);
    
    // DOM elements
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const sideCheckoutPanel = document.getElementById('side-checkout-panel');
    const sideCheckoutOverlay = document.getElementById('side-checkout-overlay');
    const closeBtn = document.getElementById('side-checkout-close');
    const checkoutProgress = document.getElementById('checkout-progress');
    const checkoutTitle = document.getElementById('side-checkout-title');
    const mainContent = document.getElementById('side-checkout-main');
    const footerContent = document.getElementById('side-checkout-footer');
    
    // State management
    let currentStep = 'cart';
    let cart = [];
    let shippingMethod = 'standard';
    let shippingCost = 12.00;
    let paymentMethod = 'card';
    let orderTotal = 0;
    let formData = {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'US',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardName: ''
    };
    
    // Sample cart data for demo (would normally come from localStorage or API)
    const sampleWines = [
      {
        id: 'wine1',
        title: 'Château Margaux 2018',
        type: 'Cabernet Blend',
        region: 'Bordeaux',
        price: 195.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 'wine2',
        title: 'Puligny-Montrachet 2020',
        type: 'Chardonnay',
        region: 'Burgundy',
        price: 72.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
      },
      {
        id: 'wine3',
        title: 'Rioja Reserva 2017',
        type: 'Tempranillo',
        region: 'Rioja',
        price: 30.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523986490752-c28064f26be3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80'
      }
    ];
    
    // Initialize
    function init() {
      // Load cart
      loadCart();
      
      // Set up event listeners
      setupEventListeners();
      
      // Update UI
      updateCartCount();
      
      // Hide progress initially (only show for checkout steps)
      checkoutProgress.style.display = 'none';
    }
    
    // Load cart from localStorage
    function loadCart() {
      try {
        const savedCart = localStorage.getItem('terroir-cart');
        if (savedCart) {
          cart = JSON.parse(savedCart);
        } else {
          // For demo purposes, use sample data
          cart = sampleWines;
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
      }
      
      calculateTotal();
    }
    
    // Save cart to localStorage
    function saveCart() {
      try {
        localStorage.setItem('terroir-cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
        showNotification('Failed to save cart data.', 'error');
      }
    }
    
    // Calculate order total
    function calculateTotal() {
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      orderTotal = subtotal + shippingCost;
      
      // Update tax (optional, assumes 8% tax)
      // const tax = subtotal * 0.08;
      // orderTotal = subtotal + shippingCost + tax;
      
      return orderTotal;
    }
    
    // Update cart count display
    function updateCartCount() {
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
      }
    }
    
    // Set up event listeners
    function setupEventListeners() {
      // Cart icon click
      if (cartIcon) {
        cartIcon.addEventListener('click', openPanel);
      }
      
      // Close button click
      if (closeBtn) {
        closeBtn.addEventListener('click', closePanel);
      }
      
      // Overlay click
      if (sideCheckoutOverlay) {
        sideCheckoutOverlay.addEventListener('click', closePanel);
      }
      
      // Delegate clicks in the main content area
      mainContent.addEventListener('click', handleMainContentClicks);
      
      // Delegate clicks in the footer
      footerContent.addEventListener('click', handleFooterClicks);
      
      // Handle form input events (delegate)
      mainContent.addEventListener('change', handleFormChanges);
      mainContent.addEventListener('input', handleFormInput);
    }
    
    // Open the side panel
    function openPanel() {
      sideCheckoutPanel.classList.add('active');
      sideCheckoutOverlay.classList.add('active');
      document.body.classList.add('side-checkout-open');
      
      // Render the current step
      renderStep(currentStep);
    }
    
    // Close the side panel
    function closePanel() {
      sideCheckoutPanel.classList.remove('active');
      sideCheckoutOverlay.classList.remove('active');
      document.body.classList.remove('side-checkout-open');
    }
    
    // Handle clicks in the main content area using event delegation
    function handleMainContentClicks(event) {
      // Update quantity buttons
      if (event.target.classList.contains('quantity-btn-minus')) {
        const wineId = event.target.closest('[data-wine-id]').dataset.wineId;
        updateQuantity(wineId, -1);
      } else if (event.target.classList.contains('quantity-btn-plus')) {
        const wineId = event.target.closest('[data-wine-id]').dataset.wineId;
        updateQuantity(wineId, 1);
      }
      
      // Remove item button
      if (event.target.classList.contains('item-remove-btn') || 
          event.target.closest('.item-remove-btn')) {
        const wineId = event.target.closest('[data-wine-id]').dataset.wineId;
        removeFromCart(wineId);
      }
      
      // Shipping method selection
      if (event.target.name === 'shipping-method') {
        shippingMethod = event.target.id;
        
        // Update shipping cost based on selection
        if (shippingMethod === 'standard-shipping') {
          shippingCost = 12.00;
        } else if (shippingMethod === 'express-shipping') {
          shippingCost = 24.00;
        } else if (shippingMethod === 'pickup') {
          shippingCost = 0.00;
        }
        
        calculateTotal();
        updateOrderSummary();
      }
      
      // Payment method selection
      if (event.target.name === 'payment-method') {
        paymentMethod = event.target.id;
        
        // Show/hide payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
          form.style.display = 'none';
        });
        
        const selectedForm = document.getElementById(`${paymentMethod}-form`);
        if (selectedForm) {
          selectedForm.style.display = 'block';
        }
      }
    }
    
    // Handle footer button clicks
    function handleFooterClicks(event) {
      // Continue to shipping
      if (event.target.id === 'continue-to-shipping-btn') {
        goToStep('shipping');
      }
      
      // Back to cart
      if (event.target.id === 'back-to-cart-btn') {
        goToStep('cart');
      }
      
      // Continue to payment
      if (event.target.id === 'continue-to-payment-btn') {
        goToStep('payment');
      }
      
      // Back to shipping
      if (event.target.id === 'back-to-shipping-btn') {
        goToStep('shipping');
      }
      
      // Continue to review
      if (event.target.id === 'continue-to-review-btn') {
        goToStep('review');
      }
      
      // Back to payment
      if (event.target.id === 'back-to-payment-btn') {
        goToStep('payment');
      }
      
      // Place order
      if (event.target.id === 'place-order-btn') {
        placeOrder();
      }
      
      // Continue shopping
      if (event.target.id === 'continue-shopping-btn') {
        currentStep = 'cart';
        closePanel();
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
      }
    }
    
    // Handle form changes
    function handleFormChanges(event) {
      // Store form data
      if (event.target.id && event.target.id in formData) {
        formData[event.target.id] = event.target.value;
      }
    }
    
    // Handle form input
    function handleFormInput(event) {
      // Format card number with spaces
      if (event.target.id === 'card-number') {
        event.target.value = formatCardNumber(event.target.value);
      }
      
      // Format expiry date
      if (event.target.id === 'card-expiry') {
        event.target.value = formatExpiryDate(event.target.value);
      }
      
      // Store form data
      if (event.target.id && event.target.id in formData) {
        formData[event.target.id] = event.target.value;
      }
    }
    
    // Format card number with spaces
    function formatCardNumber(value) {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      
      if (parts.length) {
        return parts.join(' ');
      } else {
        return value;
      }
    }
    
    // Format expiry date
    function formatExpiryDate(value) {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      
      if (v.length >= 2) {
        return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
      }
      
      return v;
    }
    
    // Update quantity
    function updateQuantity(wineId, change) {
      const item = cart.find(item => item.id === wineId);
      if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
          item.quantity = newQuantity;
          saveCart();
          updateCartCount();
          renderCartItems();
          calculateTotal();
          updateOrderSummary();
        }
      }
    }
    
    // Remove from cart
    function removeFromCart(wineId) {
      cart = cart.filter(item => item.id !== wineId);
      saveCart();
      updateCartCount();
      renderCartItems();
      calculateTotal();
      updateOrderSummary();
      
      // Show empty cart message if needed
      if (cart.length === 0) {
        renderEmptyCart();
      }
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `side-checkout-notification ${type}`;
      notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
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
      }, 3000);
    }
    
    // Navigate to a specific step
    function goToStep(step) {
      currentStep = step;
      renderStep(step);
    }
    
    // Render the current step
    function renderStep(step) {
      // Update title
      updateStepTitle(step);
      
      // Show/hide progress indicator
      if (step === 'cart') {
        checkoutProgress.style.display = 'none';
      } else {
        checkoutProgress.style.display = 'flex';
        
        // Update active step
        document.querySelectorAll('.checkout-step').forEach(stepEl => {
          stepEl.classList.remove('active', 'completed');
        });
        
        const steps = ['shipping', 'payment', 'review', 'confirmation'];
        const currentIndex = steps.indexOf(step);
        
        for (let i = 0; i < steps.length; i++) {
          const stepEl = document.querySelector(`.checkout-step[data-step="${steps[i]}"]`);
          if (i < currentIndex) {
            stepEl.classList.add('completed');
          } else if (i === currentIndex) {
            stepEl.classList.add('active');
          }
        }
      }
      
      // Clear content
      mainContent.innerHTML = '';
      footerContent.innerHTML = '';
      
      // Render appropriate content
      switch (step) {
        case 'cart':
          renderCart();
          renderCartFooter();
          break;
        case 'shipping':
          renderShipping();
          renderShippingFooter();
          break;
        case 'payment':
          renderPayment();
          renderPaymentFooter();
          break;
        case 'review':
          renderReview();
          renderReviewFooter();
          break;
        case 'confirmation':
          renderConfirmation();
          renderConfirmationFooter();
          break;
      }
    }
    
    // Update step title
    function updateStepTitle(step) {
      let title = 'Your Collection';
      
      switch (step) {
        case 'shipping':
          title = 'Shipping Information';
          break;
        case 'payment':
          title = 'Payment Method';
          break;
        case 'review':
          title = 'Review Order';
          break;
        case 'confirmation':
          title = 'Order Confirmed';
          break;
      }
      
      checkoutTitle.textContent = title;
    }
    
    // Render cart
    function renderCart() {
      if (cart.length === 0) {
        renderEmptyCart();
        return;
      }
      
      mainContent.innerHTML = `
        <div class="cart-items-container">
          ${renderCartItems()}
        </div>
      `;
    }
    
    // Render empty cart
    function renderEmptyCart() {
      mainContent.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">
            <i class="fas fa-wine-bottle"></i>
          </div>
          <p class="empty-cart-message">Your collection is empty</p>
          <p class="empty-cart-description">Explore our exceptional wines to add to your collection</p>
          <button class="btn-outline" onclick="closePanel()">
            <i class="fas fa-wine-glass-alt"></i> Browse Collection
          </button>
        </div>
      `;
      
      footerContent.innerHTML = `
        <div class="cart-total">
          <span>Total:</span>
          <span>$0.00</span>
        </div>
        <button id="continue-to-shipping-btn" class="btn-checkout" disabled>
          <i class="fas fa-credit-card"></i> Proceed to Checkout
        </button>
      `;
    }
    
    // Render cart items
    function renderCartItems() {
      let itemsHTML = '';
      
      cart.forEach(item => {
        itemsHTML += `
          <div class="cart-item" data-wine-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
              <h4 class="cart-item-title">${item.title}</h4>
              <p class="cart-item-variant">${item.type} - ${item.region}</p>
              <p class="cart-item-price">$${item.price.toFixed(2)}</p>
              <div class="cart-item-quantity">
                <button class="quantity-btn quantity-btn-minus">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                <button class="quantity-btn quantity-btn-plus">+</button>
              </div>
            </div>
            <div class="item-remove-btn">
              <i class="fas fa-times"></i>
            </div>
          </div>
        `;
      });
      
      return itemsHTML;
    }
    
    // Render cart footer
    function renderCartFooter() {
      footerContent.innerHTML = `
        <div class="cart-total">
          <span>Total:</span>
          <span>$${orderTotal.toFixed(2)}</span>
        </div>
        <button id="continue-to-shipping-btn" class="btn-checkout" ${cart.length === 0 ? 'disabled' : ''}>
          <i class="fas fa-credit-card"></i> Proceed to Checkout
        </button>
      `;
    }
    
    // Render shipping step
    function renderShipping() {
      mainContent.innerHTML = `
        <div class="checkout-section">
          <h4 class="section-heading">Shipping Method</h4>
          <div class="shipping-methods">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="shipping-method" id="standard-shipping" ${shippingMethod === 'standard-shipping' ? 'checked' : ''}>
              <label class="form-check-label" for="standard-shipping">
                <div class="method-details">
                  <strong>Standard Shipping</strong>
                  <span class="delivery-estimate">Delivery in 3-5 business days</span>
                </div>
                <span class="shipping-price">$12.00</span>
              </label>
            </div>
            
            <div class="form-check">
              <input class="form-check-input" type="radio" name="shipping-method" id="express-shipping" ${shippingMethod === 'express-shipping' ? 'checked' : ''}>
              <label class="form-check-label" for="express-shipping">
                <div class="method-details">
                  <strong>Express Shipping</strong>
                  <span class="delivery-estimate">Delivery in 1-2 business days</span>
                </div>
                <span class="shipping-price">$24.00</span>
              </label>
            </div>
            
            <div class="form-check">
              <input class="form-check-input" type="radio" name="shipping-method" id="pickup" ${shippingMethod === 'pickup' ? 'checked' : ''}>
              <label class="form-check-label" for="pickup">
                <div class="method-details">
                  <strong>Store Pickup</strong>
                  <span class="delivery-estimate">Pickup at La Cité Du Vin, Bordeaux</span>
                </div>
                <span class="shipping-price">Free</span>
              </label>
            </div>
          </div>
          
          <h4 class="section-heading">Your Information</h4>
          <div class="shipping-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" class="form-control" value="${formData.firstName}" required>
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" class="form-control" value="${formData.lastName}" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" value="${formData.email}" required>
            </div>
            
            <div class="form-group">
              <label for="address">Address</label>
              <input type="text" id="address" class="form-control" value="${formData.address}" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" class="form-control" value="${formData.city}" required>
              </div>
              
              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input type="text" id="postalCode" class="form-control" value="${formData.postalCode}" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" class="form-control" required>
                <option value="US" ${formData.country === 'US' ? 'selected' : ''}>United States</option>
                <option value="FR" ${formData.country === 'FR' ? 'selected' : ''}>France</option>
                <option value="UK" ${formData.country === 'UK' ? 'selected' : ''}>United Kingdom</option>
                <option value="DE" ${formData.country === 'DE' ? 'selected' : ''}>Germany</option>
                <option value="IT" ${formData.country === 'IT' ? 'selected' : ''}>Italy</option>
                <option value="ES" ${formData.country === 'ES' ? 'selected' : ''}>Spain</option>
              </select>
            </div>
          </div>
          
          <div class="order-summary">
            <h4>Order Summary</h4>
            ${renderOrderSummary()}
          </div>
        </div>
      `;
      
      updateOrderSummary();
    }
    
    // Render shipping footer
    function renderShippingFooter() {
      footerContent.innerHTML = `
        <button id="back-to-cart-btn" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Back to Cart
        </button>
        <button id="continue-to-payment-btn" class="btn btn-burgundy">
          Continue to Payment <i class="fas fa-arrow-right"></i>
        </button>
      `;
    }
    
    // Render payment step
    function renderPayment() {
      mainContent.innerHTML = `
        <div class="checkout-section">
          <h4 class="section-heading">Payment Method</h4>
          
          <div class="payment-options">
            <div class="payment-option ${paymentMethod === 'card' ? 'selected' : ''}">
              <input type="radio" name="payment-method" id="card" ${paymentMethod === 'card' ? 'checked' : ''}>
              <label for="card">
                <div class="payment-option-icon">
                  <i class="fas fa-credit-card"></i>
                </div>
                <p class="payment-option-label">Credit Card</p>
              </label>
            </div>
            
            <div class="payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}">
              <input type="radio" name="payment-method" id="paypal" ${paymentMethod === 'paypal' ? 'checked' : ''}>
              <label for="paypal">
                <div class="payment-option-icon">
                  <i class="fab fa-paypal"></i>
                </div>
                <p class="payment-option-label">PayPal</p>
              </label>
            </div>
            
            <div class="payment-option ${paymentMethod === 'applepay' ? 'selected' : ''}">
              <input type="radio" name="payment-method" id="applepay" ${paymentMethod === 'applepay' ? 'checked' : ''}>
              <label for="applepay">
                <div class="payment-option-icon">
                  <i class="fab fa-apple-pay"></i>
                </div>
                <p class="payment-option-label">Apple Pay</p>
              </label>
            </div>
          </div>
          
          <!-- Credit Card Form -->
          <div id="card-form" class="payment-form" style="display: ${paymentMethod === 'card' ? 'block' : 'none'}">
            <div class="form-group">
              <label for="card-number">Card Number</label>
              <input type="text" id="card-number" class="form-control" placeholder="1234 5678 9012 3456" value="${formData.cardNumber}">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">Expiration Date</label>
                <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY" value="${formData.cardExpiry}">
              </div>
              
              <div class="form-group">
                <label for="card-cvv">CVV</label>
                <input type="text" id="card-cvv" class="form-control" placeholder="123" value="${formData.cardCvv}">
              </div>
            </div>
            
            <div class="form-group">
              <label for="card-name">Name on Card</label>
              <input type="text" id="card-name" class="form-control" placeholder="John Doe" value="${formData.cardName}">
            </div>
          </div>
          
          <!-- PayPal Form -->
          <div id="paypal-form" class="payment-form" style="display: ${paymentMethod === 'paypal' ? 'block' : 'none'}">
            <p class="payment-redirect-message">
              You will be redirected to PayPal to complete your payment after reviewing your order.
            </p>
            <div class="payment-logo">
              <i class="fab fa-paypal fa-3x"></i>
            </div>
          </div>
          
          <!-- Apple Pay Form -->
          <div id="applepay-form" class="payment-form" style="display: ${paymentMethod === 'applepay' ? 'block' : 'none'}">
            <p class="payment-redirect-message">
              You will be able to use Apple Pay to complete your payment after reviewing your order.
            </p>
            <div class="payment-logo">
              <i class="fab fa-apple-pay fa-3x"></i>
            </div>
          </div>
          
          <div class="billing-same-as-shipping">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="same-billing" checked>
              <label class="form-check-label" for="same-billing">
                Billing address is the same as shipping address
              </label>
            </div>
          </div>
          
          <div class="order-summary">
            <h4>Order Summary</h4>
            ${renderOrderSummary()}
          </div>
        </div>
      `;
      
      updateOrderSummary();
    }
    
    // Render payment footer
    function renderPaymentFooter() {
      footerContent.innerHTML = `
        <button id="back-to-shipping-btn" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button id="continue-to-review-btn" class="btn btn-burgundy">
          Review Order <i class="fas fa-arrow-right"></i>
        </button>
      `;
    }
    
    // Render review step
    function renderReview() {
      const shippingDisplay = {
        'standard-shipping': 'Standard Shipping (3-5 business days)',
        'express-shipping': 'Express Shipping (1-2 business days)',
        'pickup': 'Store Pickup at La Cité Du Vin'
      };
      
      const paymentDisplay = {
        'card': `
          <i class="fas fa-credit-card"></i> Credit Card<br>
          <span class="masked-card">**** **** **** ${formData.cardNumber.slice(-4) || '1234'}</span><br>
          ${formData.cardName || 'Card Holder'}
        `,
        'paypal': '<i class="fab fa-paypal"></i> PayPal',
        'applepay': '<i class="fab fa-apple-pay"></i> Apple Pay'
      };
      
      mainContent.innerHTML = `
        <div class="checkout-section">
          <div class="review-section">
            <div class="review-section-header">
              <h4><i class="fas fa-map-marker-alt"></i> Shipping Information</h4>
              <button class="btn-edit" onclick="goToStep('shipping')">Edit</button>
            </div>
            <div class="review-section-content">
              <p>
                ${formData.firstName} ${formData.lastName}<br>
                ${formData.address}<br>
                ${formData.city}, ${formData.postalCode}<br>
                ${formData.country}
              </p>
              <p class="shipping-method">
                <strong>Shipping Method:</strong> ${shippingDisplay[shippingMethod] || 'Standard Shipping'}
              </p>
            </div>
          </div>
          
          <div class="review-section">
            <div class="review-section-header">
              <h4><i class="fas fa-credit-card"></i> Payment Method</h4>
              <button class="btn-edit" onclick="goToStep('payment')">Edit</button>
            </div>
            <div class="review-section-content">
              <p>${paymentDisplay[paymentMethod] || 'Credit Card'}</p>
            </div>
          </div>
          
          <div class="review-section">
            <div class="review-section-header">
              <h4><i class="fas fa-wine-bottle"></i> Order Items</h4>
              <button class="btn-edit" onclick="goToStep('cart')">Edit</button>
            </div>
            <div class="review-items">
              ${renderReviewItems()}
            </div>
          </div>
          
          <div class="review-order-summary">
            <h4>Order Total</h4>
            ${renderOrderSummary()}
            
            <div class="terms-agreement">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="terms-agreement" required>
                <label class="form-check-label" for="terms-agreement">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
      
      updateOrderSummary();
    }
    
    // Render review items
    function renderReviewItems() {
      let itemsHTML = '';
      
      cart.forEach(item => {
        itemsHTML += `
          <div class="review-item">
            <div class="review-item-image">
              <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="review-item-details">
              <h5>${item.title}</h5>
              <p>${item.type} - ${item.region}</p>
              <div class="review-item-price-qty">
                <span class="review-item-price">$${item.price.toFixed(2)}</span>
                <span class="review-item-qty">Qty: ${item.quantity}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      return itemsHTML;
    }
    
    // Render review footer
    function renderReviewFooter() {
      footerContent.innerHTML = `
        <button id="back-to-payment-btn" class="btn btn-outline">
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button id="place-order-btn" class="btn btn-burgundy">
          Place Order <i class="fas fa-check"></i>
        </button>
      `;
    }
    
    // Render confirmation step
    function renderConfirmation() {
      // Generate order number
      const orderNumber = `TRR-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Current date
      const now = new Date();
      const orderDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Estimated delivery
      const deliveryStart = new Date(now);
      deliveryStart.setDate(deliveryStart.getDate() + (shippingMethod === 'express-shipping' ? 2 : 5));
      const deliveryEnd = new Date(now);
      deliveryEnd.setDate(deliveryEnd.getDate() + (shippingMethod === 'express-shipping' ? 3 : 7));
      
      const formatDeliveryDate = (date) => {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        });
      };
      
      const deliveryDate = shippingMethod === 'pickup' 
        ? 'Available for pickup within 24 hours' 
        : `${formatDeliveryDate(deliveryStart)} - ${formatDeliveryDate(deliveryEnd)}, ${deliveryEnd.getFullYear()}`;
      
      mainContent.innerHTML = `
        <div class="order-confirmation">
          <div class="confirmation-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          
          <h3>Thank You for Your Order!</h3>
          <p class="confirmation-message">Your order has been successfully placed and is being processed.</p>
          
          <div class="order-details">
            <div class="order-detail-row">
              <span class="order-detail-label">Order Number:</span>
              <span class="order-detail-value">${orderNumber}</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Order Date:</span>
              <span class="order-detail-value">${orderDate}</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Order Total:</span>
              <span class="order-detail-value">$${orderTotal.toFixed(2)}</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Payment Method:</span>
              <span class="order-detail-value">${paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">${shippingMethod === 'pickup' ? 'Pickup Location:' : 'Shipping Method:'}</span>
              <span class="order-detail-value">
                ${shippingMethod === 'standard-shipping' ? 'Standard Shipping' :
                  shippingMethod === 'express-shipping' ? 'Express Shipping' :
                  'Store Pickup at La Cité Du Vin'}
              </span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">${shippingMethod === 'pickup' ? 'Pickup Time:' : 'Estimated Delivery:'}</span>
              <span class="order-detail-value">${deliveryDate}</span>
            </div>
          </div>
          
          <p class="email-confirmation">
            A confirmation email has been sent to <strong>${formData.email || 'your email address'}</strong>.
          </p>
          
          <div class="wine-decoration">
            <i class="fas fa-wine-glass-alt"></i>
            <i class="fas fa-wine-bottle"></i>
            <i class="fas fa-wine-glass-alt"></i>
          </div>
          
          ${shippingMethod === 'pickup' ? 
            `<div class="pickup-info">
              <h4>Pickup Instructions</h4>
              <p>
                Please visit La Cité Du Vin at<br>
                134 Quai de Bacalan, 33300 Bordeaux, France<br>
                with your order number and valid ID.
              </p>
            </div>` : ''}
        </div>
      `;
    }
    
    // Render confirmation footer
    function renderConfirmationFooter() {
      footerContent.innerHTML = `
        <button id="continue-shopping-btn" class="btn btn-burgundy full-width">
          <i class="fas fa-wine-bottle"></i> Continue Shopping
        </button>
      `;
    }
    
    // Render order summary
    function renderOrderSummary() {
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return `
        <div class="summary-item">
          <span class="summary-label">Items (${count})</span>
          <span class="summary-value">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Shipping</span>
          <span class="summary-value">$${shippingCost.toFixed(2)}</span>
        </div>
        <div class="summary-item total">
          <span class="summary-label">Total</span>
          <span class="summary-value">$${orderTotal.toFixed(2)}</span>
        </div>
      `;
    }
    
    // Update order summary
    function updateOrderSummary() {
      const summaryElements = document.querySelectorAll('.order-summary');
      if (summaryElements.length === 0) return;
      
      calculateTotal();
      
      summaryElements.forEach(el => {
        el.innerHTML = `<h4>Order Summary</h4>${renderOrderSummary()}`;
      });
    }
    
    // Place order
    function placeOrder() {
      // Validate terms agreement
      const termsCheckbox = document.getElementById('terms-agreement');
      if (termsCheckbox && !termsCheckbox.checked) {
        showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
      }
      
      // Process order
      goToStep('confirmation');
      
      // Clear cart (but keep it for the current session)
      // cart = [];
      // saveCart();
      // updateCartCount();
    }
    
    // Initialize the side checkout
    init();
    
    // Expose public methods
    window.openPanel = openPanel;
    window.closePanel = closePanel;
    window.goToStep = goToStep;
  });