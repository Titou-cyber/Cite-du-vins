// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// In-memory storage for orders (in production, you'd use a database)
const orders = {};
let orderIdCounter = 1000;

// Create a new order
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const { items, shippingAddress, paymentInfo, total } = req.body;
  
  if (!items || !items.length || !shippingAddress || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Generate new order ID
  const orderId = `ORD-${orderIdCounter++}`;
  const date = new Date();
  
  // Create new order
  const newOrder = {
    orderId,
    userId,
    items,
    shippingAddress,
    paymentInfo,
    total,
    status: 'pending',
    createdAt: date,
    updatedAt: date
  };
  
  // Initialize user's orders array if it doesn't exist
  if (!orders[userId]) {
    orders[userId] = [];
  }
  
  // Add order to user's orders
  orders[userId].push(newOrder);
  
  res.status(201).json(newOrder);
});

// Get all orders for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!orders[userId]) {
    return res.json([]);
  }
  
  res.json(orders[userId]);
});

// Get specific order details
router.get('/:userId/:orderId', (req, res) => {
  const { userId, orderId } = req.params;
  
  if (!orders[userId]) {
    return res.status(404).json({ error: 'No orders found for this user' });
  }
  
  const order = orders[userId].find(order => order.orderId === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json(order);
});

// Update order status
router.put('/:userId/:orderId/status', (req, res) => {
  const { userId, orderId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  if (!orders[userId]) {
    return res.status(404).json({ error: 'No orders found for this user' });
  }
  
  const orderIndex = orders[userId].findIndex(order => order.orderId === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Update status and updatedAt timestamp
  orders[userId][orderIndex].status = status;
  orders[userId][orderIndex].updatedAt = new Date();
  
  res.json(orders[userId][orderIndex]);
});

// Cancel order
router.put('/:userId/:orderId/cancel', (req, res) => {
  const { userId, orderId } = req.params;
  
  if (!orders[userId]) {
    return res.status(404).json({ error: 'No orders found for this user' });
  }
  
  const orderIndex = orders[userId].findIndex(order => order.orderId === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Only allow cancellation if order is still pending
  if (orders[userId][orderIndex].status !== 'pending') {
    return res.status(400).json({ error: 'Cannot cancel order that is not in pending status' });
  }
  
  // Update status to cancelled
  orders[userId][orderIndex].status = 'cancelled';
  orders[userId][orderIndex].updatedAt = new Date();
  
  res.json(orders[userId][orderIndex]);
});

module.exports = router;