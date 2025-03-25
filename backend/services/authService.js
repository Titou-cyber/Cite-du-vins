const userModel = require('../models/userModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Secret key for JWT (in production, store this in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      // Basic validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Missing required fields');
      }

      // Create user
      const user = userModel.createUser(userData);
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Validate credentials
      const user = userModel.validateUser(email, password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get user profile
  getUserProfile(userId) {
    return userModel.getUserById(userId);
  }

  // Update user profile
  updateUserProfile(userId, updates) {
    return userModel.updateUser(userId, updates);
  }

  // Change password
  changePassword(userId, currentPassword, newPassword) {
    const user = userModel.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Validate current password
    const hash = crypto
      .pbkdf2Sync(currentPassword, user.salt, 1000, 64, 'sha512')
      .toString('hex');
    
    if (hash !== user.hash) {
      throw new Error('Current password is incorrect');
    }
    
    // Update password
    return userModel.updateUser(userId, { password: newPassword });
  }

  // Request password reset
  requestPasswordReset(email) {
    const user = userModel.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal whether the email exists
      return { success: true };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    
    // In a real application, you would store the reset token and expiry in the database
    // and send an email to the user with a link containing the reset token
    
    return { 
      success: true,
      // These would typically not be returned, just used internally
      resetToken,
      resetTokenExpiry
    };
  }

  // Reset password using token
  resetPassword(resetToken, newPassword) {
    // In a real application, you would verify the reset token and expiry
    // For simplicity, we're just returning a success message
    return { success: true };
  }
}

module.exports = new AuthService();