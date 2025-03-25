/**
 * Enhanced API client for Cité du Vin Marketplace
 * Handles all API requests, error management, and caching
 */
class APIClient {
    constructor() {
      this.baseUrl = 'http://localhost:3000/api';
      this.cache = new Map();
      this.cacheExpiry = new Map();
      this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache by default
    }
  
    /**
     * Generic request method with error handling and request options
     */
    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Default request options
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };
  
      // Add body if provided
      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
      }
  
      try {
        // Check cache for GET requests if caching is enabled
        if (requestOptions.method === 'GET' && !options.noCache) {
          const cachedResponse = this.getFromCache(url);
          if (cachedResponse) {
            return cachedResponse;
          }
        }
  
        // Make the request
        const response = await fetch(url, requestOptions);
        
        // Handle non-success responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }
        
        // Parse response
        const data = await response.json();
        
        // Cache GET responses if caching is enabled
        if (requestOptions.method === 'GET' && !options.noCache) {
          this.cacheResponse(url, data, options.cacheDuration);
        }
        
        return data;
      } catch (error) {
        console.error(`Error in API request to ${endpoint}:`, error);
        
        // Attempt offline fallback if available
        if (requestOptions.method === 'GET' && this.getOfflineFallback) {
          const fallbackData = this.getOfflineFallback(endpoint);
          if (fallbackData) return fallbackData;
        }
        
        throw error;
      }
    }
  
    /**
     * Cache management
     */
    cacheResponse(url, data, duration) {
      const expiryTime = Date.now() + (duration || this.cacheDuration);
      this.cache.set(url, data);
      this.cacheExpiry.set(url, expiryTime);
    }
  
    getFromCache(url) {
      if (!this.cache.has(url)) return null;
      
      const expiryTime = this.cacheExpiry.get(url);
      if (Date.now() > expiryTime) {
        // Cache expired, remove it
        this.cache.delete(url);
        this.cacheExpiry.delete(url);
        return null;
      }
      
      return this.cache.get(url);
    }
  
    clearCache() {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  
    // --------- API Endpoints ---------
  
    /**
     * Get wines with pagination, sorting and filters
     */
    async getWines(params = {}) {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add sorting params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const endpoint = `/wines?${queryParams.toString()}`;
      return this.request(endpoint, { cacheDuration: 2 * 60 * 1000 }); // 2 minutes cache
    }
  
    /**
     * Search wines
     */
    async searchWines(query, options = {}) {
      if (!query) return [];
      
      const queryParams = new URLSearchParams({ query });
      
      // Add optional parameters
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      return this.request(`/wines/search?${queryParams.toString()}`, { noCache: true });
    }
  
    /**
     * Filter wines
     */
    async filterWines(filters = {}) {
      const queryParams = new URLSearchParams();
      
      // Add all filters that have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      return this.request(`/wines/filter?${queryParams.toString()}`, { noCache: true });
    }
  
    /**
     * Get wine by ID
     */
    async getWineById(id) {
      if (!id) throw new Error('Wine ID is required');
      return this.request(`/wines/${id}`);
    }
  
    /**
     * Get wine details with recommendations
     */
    async getWineDetailsWithRecommendations(id) {
      if (!id) throw new Error('Wine ID is required');
      return this.request(`/wines/${id}/details`);
    }
  
    /**
     * Get unique regions
     */
    async getRegions() {
      return this.request('/regions', { cacheDuration: 24 * 60 * 60 * 1000 }); // Cache for a day
    }
  
    /**
     * Get unique varieties
     */
    async getVarieties() {
      return this.request('/varieties', { cacheDuration: 24 * 60 * 60 * 1000 }); // Cache for a day
    }
  
    /**
     * Get cart contents
     */
    async getCart(userId) {
      if (!userId) throw new Error('User ID is required');
      return this.request(`/cart/${userId}`, { noCache: true });
    }
  
    /**
     * Add item to cart
     */
    async addToCart(userId, wineId, quantity = 1) {
      if (!userId) throw new Error('User ID is required');
      if (!wineId) throw new Error('Wine ID is required');
      
      return this.request(`/cart/${userId}/items`, {
        method: 'POST',
        body: { wineId, quantity }
      });
    }
  
    /**
     * Update cart item quantity
     */
    async updateCartItem(userId, wineId, quantity) {
      if (!userId) throw new Error('User ID is required');
      if (!wineId) throw new Error('Wine ID is required');
      if (quantity === undefined) throw new Error('Quantity is required');
      
      return this.request(`/cart/${userId}/items/${wineId}`, {
        method: 'PUT',
        body: { quantity }
      });
    }
  
    /**
     * Remove item from cart
     */
    async removeFromCart(userId, wineId) {
      if (!userId) throw new Error('User ID is required');
      if (!wineId) throw new Error('Wine ID is required');
      
      return this.request(`/cart/${userId}/items/${wineId}`, {
        method: 'DELETE'
      });
    }
  
    /**
     * Clear cart
     */
    async clearCart(userId) {
      if (!userId) throw new Error('User ID is required');
      
      return this.request(`/cart/${userId}`, {
        method: 'DELETE'
      });
    }
  
    /**
     * Create order
     */
    async createOrder(userId, orderData) {
      if (!userId) throw new Error('User ID is required');
      
      return this.request(`/orders`, {
        method: 'POST',
        body: { userId, ...orderData }
      });
    }
  
    /**
     * Get user orders
     */
    async getUserOrders(userId) {
      if (!userId) throw new Error('User ID is required');
      
      return this.request(`/orders/user/${userId}`, { noCache: true });
    }
  
    /**
     * Get wine recommendations
     */
    async getRecommendations(userId, options = {}) {
      const queryParams = new URLSearchParams();
      
      if (userId) queryParams.append('userId', userId);
      
      // Add optional parameters
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      return this.request(`/recommendations?${queryParams.toString()}`, { noCache: true });
    }
  }
  
  // Create a global instance
  window.apiClient = new APIClient();