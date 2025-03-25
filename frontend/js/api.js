/**
 * API service for Cité du Vin marketplace
 */
class WineAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    /**
     * Handles API request errors
     */
    handleError(error) {
        console.error('API Error:', error);
        return Promise.reject(error.message || 'Something went wrong');
    }

    /**
     * Get wines with pagination
     */
    async getWines(page = 1, limit = 20) {
        try {
            const response = await fetch(`${this.baseUrl}/wines?page=${page}&limit=${limit}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch wines');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search wines by query
     */
    async searchWines(query) {
        try {
            if (!query.trim()) {
                return [];
            }
            
            const response = await fetch(`${this.baseUrl}/wines/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Filter wines by criteria
     */
    async filterWines(filters) {
        try {
            const queryParams = new URLSearchParams();
            
            // Only add parameters that have values
            if (filters.region) queryParams.append('region', filters.region);
            if (filters.variety) queryParams.append('variety', filters.variety);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            
            const url = `${this.baseUrl}/wines/filter?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error during filtering');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get wine by ID
     */
    async getWineById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/wines/${id}`);
            
            if (!response.ok) {
                throw new Error('Wine not found');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get unique regions
     */
    async getRegions() {
        try {
            const response = await fetch(`${this.baseUrl}/regions`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch regions');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get unique varieties
     */
    async getVarieties() {
        try {
            const response = await fetch(`${this.baseUrl}/varieties`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch varieties');
            }
            
            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }
}

// Create a single instance to use throughout the application
const wineAPI = new WineAPI();