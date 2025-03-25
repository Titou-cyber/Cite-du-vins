// backend/services/cartService.js
const fs = require('fs');
const path = require('path');

// In-memory cart storage - in a real app, this would be in a database
const carts = {};

// Load wine data
const loadWines = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/wines.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading wine data:', error);
    return [];
  }
};

// Get wine by ID
const getWineById = (wineId) => {
  const wines = loadWines();
  const index = parseInt(wineId);
  if (isNaN(index) || index < 0 || index >= wines.length) {
    return null;
  }
  return wines[index];
};

// Get or create cart for a user
const getCart = (userId) => {
  if (!carts[userId]) {
    carts[userId] = {
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return carts[userId];
};

// Add item to cart
const addToCart = (userId, wineId, quantity = 1) => {
  const cart = getCart(userId);
  const wine = getWineById(wineId);
  
  if (!wine) {
    throw new Error('Wine not found');
  }
  
  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(item => item.wine.id === wineId);
  
  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item if it doesn't exist
    cart.items.push({
      wine: {
        id: wineId,
        title: wine.title,
        price: wine.price,
        points: wine.points,
        variety: wine.variety,
        region_1: wine.region_1,
        thumbnail: wine.thumbnail || null
      },
      quantity,
      addedAt: new Date()
    });
  }
  
  cart.updatedAt = new Date();
  
  return cart;
};

// Update item quantity
const updateCartItem = (userId, wineId, quantity) => {
  const cart = getCart(userId);
  
  const itemIndex = cart.items.findIndex(item => item.wine.id === wineId);
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }
  
  cart.updatedAt = new Date();
  
  return cart;
};

// Remove item from cart
const removeFromCart = (userId, wineId) => {
  const cart = getCart(userId);
  
  const itemIndex = cart.items.findIndex(item => item.wine.id === wineId);
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  // Remove item
  cart.items.splice(itemIndex, 1);
  cart.updatedAt = new Date();
  
  return cart;
};

// Clear cart
const clearCart = (userId) => {
  const cart = getCart(userId);
  cart.items = [];
  cart.updatedAt = new Date();
  
  return cart;
};

// Calculate cart totals
const getCartWithTotals = (userId) => {
  const cart = getCart(userId);
  
  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (item.wine.price * item.quantity);
  }, 0);
  
  // Apply tax (for example, 10%)
  const tax = subtotal * 0.1;
  
  // Apply shipping (flat fee for simplicity)
  const shipping = cart.items.length > 0 ? 10 : 0;
  
  // Calculate grand total
  const total = subtotal + tax + shipping;
  
  return {
    ...cart,
    summary: {
      itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      subtotal,
      tax,
      shipping,
      total
    }
  };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartWithTotals
};

// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');

// Get cart contents
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const cart = cartService.getCartWithTotals(userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/:userId/items', (req, res) => {
  try {
    const { userId } = req.params;
    const { wineId, quantity } = req.body;
    
    if (!wineId) {
      return res.status(400).json({ message: 'Wine ID is required' });
    }
    
    const cart = cartService.addToCart(userId, wineId, quantity || 1);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update item quantity
router.put('/:userId/items/:wineId', (req, res) => {
  try {
    const { userId, wineId } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    const cart = cartService.updateCartItem(userId, wineId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/:userId/items/:wineId', (req, res) => {
  try {
    const { userId, wineId } = req.params;
    const cart = cartService.removeFromCart(userId, wineId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const cart = cartService.clearCart(userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;