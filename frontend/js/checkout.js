/**
 * checkout.js - Handles the checkout and payment process for the Cité du Vin Marketplace
 * Manages checkout form, validation, and payment processing
 */

class CheckoutManager {
    constructor() {
        // Initialize state
        this.state = {
            checkoutData: {
                customer: {
                    firstname: '',
                    lastname: '',
                    email: '',
                    phone: ''
                },
                shipping: {
                    address: '',
                    address2: '',
                    city: '',
                    postal: '',
                    country: ''
                },
                billing: {
                    sameAsShipping: true,
                    address: '',
                    address2: '',
                    city: '',
                    postal: '',
                    country: ''
                },
                payment: {
                    method: 'card',
                    cardNumber: '',
                    cardName: '',
                    cardExpiry: '',
                    cardCvc: ''
                },
                shipping_method: 'standard',
                orderNotes: '',
                terms_agreed: false
            },
            cart: {
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0
            },
            validationErrors: {},
            isProcessing: false,
            currentStep: 1, // 1: Info, 2: Shipping, 3: Payment, 4: Review
            paymentIntent: null,
            orderId: null
        };
        
        // Bind methods
        this.loadCheckoutData = this.loadCheckoutData.bind(this);
        this.loadCart = this.loadCart.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.processPayment = this.processPayment.bind(this);
        this.completeOrder = this.completeOrder.bind(this);
        
        // Initialize checkout
        this.init();
    }
    
    /**
     * Initialize the checkout system
     */
    async init() {
        // Load cart data
        await this.loadCart();
        
        // Load any saved checkout data
        this.loadCheckoutData();
        
        // Set up form handlers
        this.setupFormHandlers();
        
        // Initialize payment methods
        this.initializePaymentMethods();
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Load checkout form data from localStorage
     */
    loadCheckoutData() {
        try {
            const savedData = localStorage.getItem('cduv_checkout_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.state.checkoutData = { ...this.state.checkoutData, ...parsedData };
            }
        } catch (error) {
            console.error('Error loading checkout data:', error);
        }
    }
    
    /**
     * Save checkout form data to localStorage
     */
    saveCheckoutData() {
        try {
            localStorage.setItem('cduv_checkout_data', JSON.stringify(this.state.checkoutData));
        } catch (error) {
            console.error('Error saving checkout data:', error);
        }
    }
    
    /**
     * Load cart data
     */
    async loadCart() {
        // Try to use cart manager if available
        if (window.cartManager) {
            this.state.cart = {
                items: window.cartManager.state.items,
                subtotal: window.cartManager.state.subtotal,
                tax: window.cartManager.state.tax,
                shipping: window.cartManager.state.shipping,
                total: window.cartManager.state.total
            };
            return;
        }
        
        // Otherwise, try to load from API
        try {
            const userId = localStorage.getItem('cduv_user_id');
            if (!userId) {
                throw new Error('User ID not found');
            }
            
            const response = await fetch(`/api/cart/${userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load cart');
            }
            
            const cartData = await response.json();
            
            // Update state
            this.state.cart.items = cartData.items || [];
            this.state.cart.subtotal = cartData.summary?.subtotal || 0;
            this.state.cart.tax = cartData.summary?.tax || 0;
            this.state.cart.shipping = cartData.summary?.shipping || 0;
            this.state.cart.total = cartData.summary?.total || 0;
        } catch (error) {
            console.error('Error loading cart:', error);
            
            // Fallback to localStorage
            try {
                const cartData = JSON.parse(localStorage.getItem('cduv_cart') || '{"items":[]}');
                this.state.cart.items = cartData.items || [];
                
                // Calculate totals
                this.calculateCartTotals();
            } catch (e) {
                console.error('Error loading cart from localStorage:', e);
                this.state.cart.items = [];
                this.calculateCartTotals();
            }
        }
    }
    
    /**
     * Calculate cart totals
     */
    calculateCartTotals() {
        // Calculate subtotal
        this.state.cart.subtotal = this.state.cart.items.reduce((sum, item) => {
            return sum + (item.wine.price * item.quantity);
        }, 0);
        
        // Calculate tax (10%)
        this.state.cart.tax = this.state.cart.subtotal * 0.1;
        
        // Calculate shipping (flat fee or free above certain amount)
        this.state.cart.shipping = this.state.cart.subtotal > 100 ? 0 : 15;
        
        // Calculate total
        this.state.cart.total = this.state.cart.subtotal + this.state.cart.tax + this.state.cart.shipping;
    }
    
    /**
     * Set up form event handlers
     */
    setupFormHandlers() {
        // Get checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (!checkoutForm) return;
        
        // Form submission
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleFormSubmit();
        });
        
        // Form input changes
        checkoutForm.addEventListener('change', (event) => {
            const target = event.target;
            const name = target.name;
            let value;
            
            if (target.type === 'checkbox') {
                value = target.checked;
                
                // Special handling for billing address checkbox
                if (name === 'billing_same') {
                    this.handleBillingSameChange(value);
                    return;
                }
            } else {
                value = target.value;
            }
            
            this.handleInputChange(name, value);
        });
        
        // Input event for real-time validation
        checkoutForm.addEventListener('input', (event) => {
            const target = event.target;
            const name = target.name;
            
            // Don't handle checkbox inputs here
            if (target.type === 'checkbox') return;
            
            const value = target.value;
            this.handleInputChange(name, value);
        });
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        if (paymentMethods.length > 0) {
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    const methodValue = method.querySelector('input').value;
                    this.handlePaymentMethodChange(methodValue);
                });
            });
        }
        
        // Shipping method selection
        const shippingMethods = document.querySelectorAll('[name="shipping_method"]');
        if (shippingMethods.length > 0) {
            shippingMethods.forEach(method => {
                method.addEventListener('change', () => {
                    this.handleShippingMethodChange(method.value);
                });
            });
        }
        
        // Billing same as shipping checkbox
        const billingSameCheckbox = document.getElementById('billing-same');
        if (billingSameCheckbox) {
            billingSameCheckbox.addEventListener('change', () => {
                this.handleBillingSameChange(billingSameCheckbox.checked);
            });
            
            // Initialize billing section visibility
            this.handleBillingSameChange(billingSameCheckbox.checked);
        }
    }
    
    /**
     * Handle form input changes
     */
    handleInputChange(name, value) {
        // Parse the field name to update the correct part of state
        // Format expected: section_field (e.g., customer_firstname, shipping_address)
        const parts = name.split('_');
        
        if (parts.length === 2) {
            const [section, field] = parts;
            
            // Update state
            if (this.state.checkoutData[section]) {
                this.state.checkoutData[section][field] = value;
                
                // Clear validation error if value is valid
                this.validateField(name, value);
            }
        } else {
            // Handle special cases without section prefix
            switch (name) {
                case 'shipping_method':
                    this.state.checkoutData.shipping_method = value;
                    break;
                case 'payment_method':
                    this.state.checkoutData.payment.method = value;
                    break;
                case 'order_notes':
                    this.state.checkoutData.orderNotes = value;
                    break;
                case 'terms_agreed':
                    this.state.checkoutData.terms_agreed = value;
                    break;
            }
        }
        
        // Save changes
        this.saveCheckoutData();
    }
    
    /**
     * Handle shipping method change
     */
    handleShippingMethodChange(method) {
        this.state.checkoutData.shipping_method = method;
        
        // Update shipping cost based on method
        if (method === 'express') {
            this.state.cart.shipping = 25;
        } else {
            this.state.cart.shipping = this.state.cart.subtotal > 100 ? 0 : 15;
        }
        
        // Recalculate total
        this.state.cart.total = this.state.cart.subtotal + this.state.cart.tax + this.state.cart.shipping;
        
        // Update UI
        this.updateCartSummary();
        
        // Save changes
        this.saveCheckoutData();
    }
    
    /**
     * Handle payment method change
     */
    handlePaymentMethodChange(method) {
        this.state.checkoutData.payment.method = method;
        
        // Update payment method UI
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(el => {
            el.classList.toggle('active', el.querySelector('input').value === method);
        });
        
        // Show/hide credit card form
        const creditCardForm = document.getElementById('credit-card-form');
        if (creditCardForm) {
            creditCardForm.style.display = method === 'card' ? 'block' : 'none';
        }
        
        // Save changes
        this.saveCheckoutData();
    }
    
    /**
     * Handle billing same as shipping checkbox change
     */
    handleBillingSameChange(isSame) {
        this.state.checkoutData.billing.sameAsShipping = isSame;
        
        // Show/hide billing address section
        const billingSection = document.getElementById('billing-address-section');
        if (billingSection) {
            billingSection.style.display = isSame ? 'none' : 'block';
        }
        
        // If same as shipping, copy shipping address to billing
        if (isSame) {
            this.state.checkoutData.billing.address = this.state.checkoutData.shipping.address;
            this.state.checkoutData.billing.address2 = this.state.checkoutData.shipping.address2;
            this.state.checkoutData.billing.city = this.state.checkoutData.shipping.city;
            this.state.checkoutData.billing.postal = this.state.checkoutData.shipping.postal;
            this.state.checkoutData.billing.country = this.state.checkoutData.shipping.country;
        }
        
        // Save changes
        this.saveCheckoutData();
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit() {
        // Validate form
        const isValid = this.validateForm();
        
        if (!isValid) {
            // Show validation errors
            this.showValidationErrors();
            return;
        }
        
        // Set processing state
        this.setProcessing(true);
        
        try {
            // Create order
            const order = await this.createOrder();
            
            if (!order) {
                throw new Error('Failed to create order');
            }
            
            // Store order ID
            this.state.orderId = order.id;
            
            // Process payment
            const paymentResult = await this.processPayment(order);
            
            if (!paymentResult.success) {
                throw new Error(paymentResult.message || 'Payment failed');
            }
            
            // Complete order
            await this.completeOrder(order.id, paymentResult.transactionId);
            
            // Clear checkout data
            localStorage.removeItem('cduv_checkout_data');
            
            // Clear cart
            if (window.cartManager) {
                await window.cartManager.clearCart();
            }
            
            // Redirect to confirmation page
            window.location.href = `confirmation.html?orderId=${order.id}`;
        } catch (error) {
            console.error('Checkout error:', error);
            this.showError(error.message || 'Une erreur s\'est produite lors du paiement. Veuillez réessayer.');
        } finally {
            // Clear processing state
            this.setProcessing(false);
        }
    }
    
    /**
     * Validate form
     */
    validateForm() {
        let isValid = true;
        this.state.validationErrors = {};
        
        // Customer section
        isValid = this.validateField('customer_firstname', this.state.checkoutData.customer.firstname) && isValid;
        isValid = this.validateField('customer_lastname', this.state.checkoutData.customer.lastname) && isValid;
        isValid = this.validateField('customer_email', this.state.checkoutData.customer.email) && isValid;
        isValid = this.validateField('customer_phone', this.state.checkoutData.customer.phone) && isValid;
        
        // Shipping section
        isValid = this.validateField('shipping_address', this.state.checkoutData.shipping.address) && isValid;
        isValid = this.validateField('shipping_city', this.state.checkoutData.shipping.city) && isValid;
        isValid = this.validateField('shipping_postal', this.state.checkoutData.shipping.postal) && isValid;
        isValid = this.validateField('shipping_country', this.state.checkoutData.shipping.country) && isValid;
        
        // Billing section (if not same as shipping)
        if (!this.state.checkoutData.billing.sameAsShipping) {
            isValid = this.validateField('billing_address', this.state.checkoutData.billing.address) && isValid;
            isValid = this.validateField('billing_city', this.state.checkoutData.billing.city) && isValid;
            isValid = this.validateField('billing_postal', this.state.checkoutData.billing.postal) && isValid;
            isValid = this.validateField('billing_country', this.state.checkoutData.billing.country) && isValid;
        }
        
        // Payment section
        if (this.state.checkoutData.payment.method === 'card') {
            isValid = this.validateField('payment_cardNumber', this.state.checkoutData.payment.cardNumber) && isValid;
            isValid = this.validateField('payment_cardName', this.state.checkoutData.payment.cardName) && isValid;
            isValid = this.validateField('payment_cardExpiry', this.state.checkoutData.payment.cardExpiry) && isValid;
            isValid = this.validateField('payment_cardCvc', this.state.checkoutData.payment.cardCvc) && isValid;
        }
        
        // Terms agreement
        isValid = this.validateField('terms_agreed', this.state.checkoutData.terms_agreed) && isValid;
        
        return isValid;
    }
    
    /**
     * Validate individual form field
     */
    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';
        
        const parts = fieldName.split('_');
        const field = parts.length === 2 ? parts[1] : fieldName;
        
        // Validate based on field type
        switch (field) {
            case 'firstname':
            case 'lastname':
            case 'address':
            case 'city':
                if (!value || value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Ce champ est requis';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Adresse email invalide';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^[0-9+\s()-]{8,20}$/;
                if (!value || !phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Numéro de téléphone invalide';
                }
                break;
                
            case 'postal':
                if (!value || value.trim().length < 3) {
                    isValid = false;
                    errorMessage = 'Code postal invalide';
                }
                break;
                
            case 'country':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Veuillez sélectionner un pays';
                }
                break;
                
            case 'cardNumber':
                // Remove spaces and dashes
                const cardNumber = value ? value.replace(/[\s-]/g, '') : '';
                if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16 || !/^\d+$/.test(cardNumber)) {
                    isValid = false;
                    errorMessage = 'Numéro de carte invalide';
                }
                break;
                
            case 'cardName':
                if (!value || value.trim().length < 3) {
                    isValid = false;
                    errorMessage = 'Nom sur la carte requis';
                }
                break;
                
            case 'cardExpiry':
                const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
                if (!value || !expiryRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Format MM/AA requis';
                } else {
                    // Check if card is expired
                    const [month, year] = value.split('/');
                    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
                    const today = new Date();
                    
                    if (expiryDate < today) {
                        isValid = false;
                        errorMessage = 'Carte expirée';
                    }
                }
                break;
                
            case 'cardCvc':
                if (!value || !/^\d{3,4}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Code de sécurité invalide';
                }
                break;
                
            case 'terms_agreed':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vous devez accepter les conditions générales';
                }
                break;
        }
        
        // Update validation error state
        if (!isValid) {
            this.state.validationErrors[fieldName] = errorMessage;
        } else {
            delete this.state.validationErrors[fieldName];
        }
        
        return isValid;
    }
    
    /**
     * Show validation errors in UI
     */
    showValidationErrors() {
        // Reset previous error messages
        document.querySelectorAll('.error-feedback').forEach(el => el.remove());
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        // Add error messages for each invalid field
        Object.entries(this.state.validationErrors).forEach(([fieldName, errorMessage]) => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            
            if (field) {
                // Add error class to field
                field.classList.add('is-invalid');
                
                // Create error message element
                const errorElement = document.createElement('div');
                errorElement.className = 'error-feedback';
                errorElement.textContent = errorMessage;
                
                // Add error message after field
                field.parentNode.appendChild(errorElement);
                
                // Scroll to first error
                if (field === document.querySelector('.is-invalid')) {
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        
        // Show general error message
        this.showError('Veuillez corriger les erreurs dans le formulaire.');
    }
    
    /**
     * Create order in the system
     */
    async createOrder() {
        try {
            // Prepare order data
            const orderData = {
                customer: this.state.checkoutData.customer,
                shipping: this.state.checkoutData.shipping,
                billing: this.state.checkoutData.billing.sameAsShipping 
                    ? this.state.checkoutData.shipping 
                    : this.state.checkoutData.billing,
                shipping_method: this.state.checkoutData.shipping_method,
                items: this.state.cart.items.map(item => ({
                    wine_id: item.wine.id,
                    quantity: item.quantity,
                    price: item.wine.price
                })),
                totals: {
                    subtotal: this.state.cart.subtotal,
                    tax: this.state.cart.tax,
                    shipping: this.state.cart.shipping,
                    total: this.state.cart.total
                },
                notes: this.state.checkoutData.orderNotes,
                payment_method: this.state.checkoutData.payment.method
            };
            
            // In a real application, you would send this to your API
            // For demo purposes, we'll simulate a successful order creation
            
            console.log('Creating order with data:', orderData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate successful order creation
            return {
                id: 'ORD-' + Date.now(),
                status: 'pending',
                created_at: new Date().toISOString(),
                ...orderData
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to create order. Please try again.');
        }
    }
    
    /**
     * Process payment for the order
     */
    async processPayment(order) {
        try {
            // Simulate payment processing based on payment method
            const paymentMethod = this.state.checkoutData.payment.method;
            
            console.log(`Processing payment with method: ${paymentMethod}`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For demo purposes, all payments are successful
            return {
                success: true,
                transactionId: 'TRX-' + Date.now(),
                status: 'completed',
                message: 'Payment processed successfully'
            };
        } catch (error) {
            console.error('Error processing payment:', error);
            throw new Error('Payment processing failed. Please try again or use a different payment method.');
        }
    }
    
    /**
     * Complete the order after successful payment
     */
    async completeOrder(orderId, transactionId) {
        try {
            console.log(`Completing order ${orderId} with transaction ${transactionId}`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // In a real application, you would update the order status in your API
            
            return {
                success: true,
                order_id: orderId,
                status: 'completed'
            };
        } catch (error) {
            console.error('Error completing order:', error);
            throw new Error('Failed to complete order. Please contact customer support.');
        }
    }
    
    /**
     * Initialize payment methods
     */
    initializePaymentMethods() {
        // Credit card input formatting
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                // Remove all non-digits
                let value = e.target.value.replace(/\D/g, '');
                
                // Add spaces every 4 digits
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                
                // Limit to 19 characters (16 digits + 3 spaces)
                value = value.substring(0, 19);
                
                // Update input value
                e.target.value = value;
                
                // Update state
                this.handleInputChange('payment_cardNumber', value);
            });
        }
        
        // Card expiry formatting
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                // Remove all non-digits
                let value = e.target.value.replace(/\D/g, '');
                
                // Add slash after 2 digits (MM/YY)
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                }
                
                // Limit to 5 characters (MM/YY)
                value = value.substring(0, 5);
                
                // Update input value
                e.target.value = value;
                
                // Update state
                this.handleInputChange('payment_cardExpiry', value);
            });
        }
        
        // CVC formatting
        const cardCvcInput = document.getElementById('card-cvc');
        if (cardCvcInput) {
            cardCvcInput.addEventListener('input', (e) => {
                // Remove all non-digits
                let value = e.target.value.replace(/\D/g, '');
                
                // Limit to 4 characters (some cards have 4-digit CVC)
                value = value.substring(0, 4);
                
                // Update input value
                e.target.value = value;
                
                // Update state
                this.handleInputChange('payment_cardCvc', value);
            });
        }
        
        // Card name formatting
        const cardNameInput = document.getElementById('card-name');
        if (cardNameInput) {
            cardNameInput.addEventListener('input', (e) => {
                // Update state
                this.handleInputChange('payment_cardName', e.target.value);
            });
        }
    }
    
    /**
     * Set processing state
     */
    setProcessing(isProcessing) {
        this.state.isProcessing = isProcessing;
        
        // Update UI
        const submitButton = document.querySelector('.place-order-btn');
        if (submitButton) {
            submitButton.disabled = isProcessing;
            submitButton.innerHTML = isProcessing 
                ? '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...'
                : 'Confirmer et Payer';
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        // Check if error container exists, create it if not
        let container = document.querySelector('.checkout-error');
        if (!container) {
            container = document.createElement('div');
            container.className = 'checkout-error alert alert-error';
            
            // Add before the first form section
            const firstSection = document.querySelector('.checkout-section');
            if (firstSection) {
                firstSection.parentNode.insertBefore(container, firstSection);
            }
        }
        
        // Set error message
        container.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;
        
        // Show container
        container.style.display = 'block';
        
        // Scroll to error
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Hide error message
     */
    hideError() {
        const container = document.querySelector('.checkout-error');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    /**
     * Update UI based on current state
     */
    updateUI() {
        // Fill form fields with saved data
        this.populateFormFields();
        
        // Update cart summary
        this.updateCartSummary();
        
        // Update payment method selection
        this.updatePaymentMethodUI();
        
        // Update shipping method selection
        this.updateShippingMethodUI();
    }
    
    /**
     * Populate form fields with saved data
     */
    populateFormFields() {
        // Customer section
        this.setFieldValue('customer_firstname', this.state.checkoutData.customer.firstname);
        this.setFieldValue('customer_lastname', this.state.checkoutData.customer.lastname);
        this.setFieldValue('customer_email', this.state.checkoutData.customer.email);
        this.setFieldValue('customer_phone', this.state.checkoutData.customer.phone);
        
        // Shipping section
        this.setFieldValue('shipping_address', this.state.checkoutData.shipping.address);
        this.setFieldValue('shipping_address2', this.state.checkoutData.shipping.address2);
        this.setFieldValue('shipping_city', this.state.checkoutData.shipping.city);
        this.setFieldValue('shipping_postal', this.state.checkoutData.shipping.postal);
        this.setFieldValue('shipping_country', this.state.checkoutData.shipping.country);
        
        // Billing section
        this.setFieldValue('billing_address', this.state.checkoutData.billing.address);
        this.setFieldValue('billing_address2', this.state.checkoutData.billing.address2);
        this.setFieldValue('billing_city', this.state.checkoutData.billing.city);
        this.setFieldValue('billing_postal', this.state.checkoutData.billing.postal);
        this.setFieldValue('billing_country', this.state.checkoutData.billing.country);
        
        // Billing same as shipping checkbox
        const billingSameCheckbox = document.getElementById('billing-same');
        if (billingSameCheckbox) {
            billingSameCheckbox.checked = this.state.checkoutData.billing.sameAsShipping;
            this.handleBillingSameChange(billingSameCheckbox.checked);
        }
        
        // Payment section (depends on payment method)
        if (this.state.checkoutData.payment.method === 'card') {
            this.setFieldValue('card-number', this.state.checkoutData.payment.cardNumber);
            this.setFieldValue('card-name', this.state.checkoutData.payment.cardName);
            this.setFieldValue('card-expiry', this.state.checkoutData.payment.cardExpiry);
            this.setFieldValue('card-cvc', this.state.checkoutData.payment.cardCvc);
        }
        
        // Terms checkbox
        this.setFieldValue('terms-agree', this.state.checkoutData.terms_agreed);
    }
    
    /**
     * Set value for a form field
     */
    setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (!field) return;
        
        if (field.type === 'checkbox') {
            field.checked = value;
        } else {
            field.value = value;
        }
    }
    
    /**
     * Update payment method UI
     */
    updatePaymentMethodUI() {
        const paymentMethod = this.state.checkoutData.payment.method;
        
        // Update radio buttons
        const paymentRadios = document.querySelectorAll('[name="payment_method"]');
        paymentRadios.forEach(radio => {
            radio.checked = radio.value === paymentMethod;
        });
        
        // Update payment method containers
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.classList.toggle('active', method.querySelector('input').value === paymentMethod);
        });
        
        // Show/hide credit card form
        const creditCardForm = document.getElementById('credit-card-form');
        if (creditCardForm) {
            creditCardForm.style.display = paymentMethod === 'card' ? 'block' : 'none';
        }
    }
    
    /**
     * Update shipping method UI
     */
    updateShippingMethodUI() {
        const shippingMethod = this.state.checkoutData.shipping_method;
        
        // Update radio buttons
        const shippingRadios = document.querySelectorAll('[name="shipping_method"]');
        shippingRadios.forEach(radio => {
            radio.checked = radio.value === shippingMethod;
        });
        
        // Update shipping method containers
        const shippingMethods = document.querySelectorAll('.payment-method');
        shippingMethods.forEach(method => {
            const input = method.querySelector('input[name="shipping_method"]');
            if (input) {
                method.classList.toggle('active', input.value === shippingMethod);
            }
        });
    }
    
    /**
     * Update cart summary
     */
    updateCartSummary() {
        // Update checkout items
        const checkoutItems = document.getElementById('checkout-items');
        if (checkoutItems) {
            checkoutItems.innerHTML = '';
            
            this.state.cart.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'checkout-item';
                itemElement.innerHTML = `
                    <div class="checkout-item-image">
                        <img src="${item.wine.image || 'assets/images/wine-placeholder.jpg'}" alt="${item.wine.title}">
                    </div>
                    <div class="checkout-item-details">
                        <h3 class="checkout-item-title">${item.wine.title}</h3>
                        <div class="checkout-item-meta">
                            Quantité: ${item.quantity}
                        </div>
                    </div>
                    <div class="checkout-item-price">€${(item.wine.price * item.quantity).toFixed(2)}</div>
                `;
                
                checkoutItems.appendChild(itemElement);
            });
        }
        
        // Update summary totals
        const subtotal = document.getElementById('checkout-subtotal');
        const shipping = document.getElementById('checkout-shipping');
        const tax = document.getElementById('checkout-tax');
        const total = document.getElementById('checkout-total');
        
        if (subtotal) subtotal.textContent = `€${this.state.cart.subtotal.toFixed(2)}`;
        if (shipping) shipping.textContent = `€${this.state.cart.shipping.toFixed(2)}`;
        if (tax) tax.textContent = `€${this.state.cart.tax.toFixed(2)}`;
        if (total) total.textContent = `€${this.state.cart.total.toFixed(2)}`;
    }
}

// Initialize checkout manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create checkout manager
    if (document.getElementById('checkout-form')) {
        window.checkoutManager = new CheckoutManager();
    }
    
    // Handle order confirmation page
    if (document.querySelector('.confirmation-page')) {
        // Get order ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
            // Update order number in UI
            const orderNumberElements = document.querySelectorAll('.order-number');
            orderNumberElements.forEach(el => {
                el.textContent = orderId;
            });
            
            // Set current date
            const dateElements = document.querySelectorAll('.order-date');
            const today = new Date();
            const formattedDate = today.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
            
            dateElements.forEach(el => {
                el.textContent = formattedDate;
            });
        }
    }
});