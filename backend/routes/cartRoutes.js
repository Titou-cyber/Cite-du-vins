// routes/cartRoutes.js
const express = require('express');
const router = express.Router();

// In-memory storage for cart (in production, you'd use a database)
const carts = {};

// Get cart contents
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!carts[userId]) {
    carts[userId] = { items: [], total: 0 };
  }
  
  res.json(carts[userId]);
});

// Add item to cart
router.post('/:userId/add', (req, res) => {
  const { userId } = req.params;
  const { wineId, quantity = 1, price, title } = req.body;
  
  if (!wineId || !price || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Initialize cart if it doesn't exist
  if (!carts[userId]) {
    carts[userId] = { items: [], total: 0 };
  }
  
  // Check if item already exists in cart
  const existingItemIndex = carts[userId].items.findIndex(item => item.wineId == wineId);
  
  if (existingItemIndex > -1) {
    // Update quantity if item exists
    carts[userId].items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item if it doesn't exist
    carts[userId].items.push({
      wineId,
      title,
      price,
      quantity
    });
  }
  
  // Recalculate total
  carts[userId].total = carts[userId].items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  res.json(carts[userId]);
});

// Remove item from cart
router.delete('/:userId/remove/:wineId', (req, res) => {
  const { userId, wineId } = req.params;
  
  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  // Filter out the item to remove
  carts[userId].items = carts[userId].items.filter(item => item.wineId != wineId);
  
  // Recalculate total
  carts[userId].total = carts[userId].items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  res.json(carts[userId]);
});

// Update item quantity
router.put('/:userId/update/:wineId', (req, res) => {
  const { userId, wineId } = req.params;
  const { quantity } = req.body;
  
  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  
  // Find the item to update
  const itemIndex = carts[userId].items.findIndex(item => item.wineId == wineId);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
  
  // Update quantity
  carts[userId].items[itemIndex].quantity = quantity;
  
  // Recalculate total
  carts[userId].total = carts[userId].items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  res.json(carts[userId]);
});

// Clear cart
router.delete('/:userId/clear', (req, res) => {
  const { userId } = req.params;
  
  carts[userId] = { items: [], total: 0 };
  
  res.json(carts[userId]);
});

module.exports = router;