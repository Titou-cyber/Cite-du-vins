const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateJWT } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const result = await authService.register({
      firstName,
      lastName,
      email,
      password
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const user = authService.getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    const user = authService.updateUserProfile(userId, updates);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.post('/change-password', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = authService.changePassword(userId, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request password reset
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    
    const result = authService.requestPasswordReset(email);
    
    res.json({ message: 'Password reset link sent if email exists' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password using token
router.post('/reset-password', (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    const result = authService.resetPassword(resetToken, newPassword);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add wine to favorites
router.post('/favorites/:wineId', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { wineId } = req.params;
    
    const user = authService.addToFavorites(userId, wineId);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove wine from favorites
router.delete('/favorites/:wineId', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { wineId } = req.params;
    
    const user = authService.removeFromFavorites(userId, wineId);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add tasting note
router.post('/tasting-notes', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const note = req.body;
    
    const user = authService.addTastingNote(userId, note);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update preferences
router.put('/preferences', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const user = authService.updatePreferences(userId, preferences);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;