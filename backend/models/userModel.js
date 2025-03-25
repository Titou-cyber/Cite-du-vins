const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UserModel {
  constructor() {
    this.usersFilePath = path.join(__dirname, '../data/users.json');
    this.users = this.loadUsers();
  }

  // Load users from JSON file
  loadUsers() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        return JSON.parse(data);
      }
      // If file doesn't exist, create it with empty array
      this.saveUsers([]);
      return [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users to JSON file
  saveUsers(users) {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Get all users
  getAllUsers() {
    return this.users;
  }

  // Get user by ID
  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  // Get user by email
  getUserByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Create a new user
  createUser(userData) {
    // Check if user with this email already exists
    const existingUser = this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate salt and hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(userData.password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      hash,
      salt,
      createdAt: new Date().toISOString(),
      role: userData.role || 'customer',
      favoriteWines: [],
      tastingNotes: [],
      preferences: {
        favoriteRegions: [],
        favoriteVarieties: [],
        tastePreferences: {
          sweetness: 0.5,
          acidity: 0.5,
          tannin: 0.5,
          body: 0.5
        }
      }
    };

    // Add user to array and save
    this.users.push(newUser);
    this.saveUsers(this.users);

    // Return user without sensitive info
    const { hash: _, salt: __, ...userWithoutSensitiveInfo } = newUser;
    return userWithoutSensitiveInfo;
  }

  // Update user
  updateUser(id, updates) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user fields
    const updatedUser = { ...this.users[userIndex] };
    
    // Only allow updating certain fields
    const allowedUpdates = [
      'firstName', 'lastName', 'email', 'preferences',
      'favoriteWines', 'tastingNotes'
    ];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updatedUser[key] = updates[key];
      }
    }

    // If password is being updated
    if (updates.password) {
      updatedUser.salt = crypto.randomBytes(16).toString('hex');
      updatedUser.hash = crypto
        .pbkdf2Sync(updates.password, updatedUser.salt, 1000, 64, 'sha512')
        .toString('hex');
    }

    updatedUser.updatedAt = new Date().toISOString();
    
    // Update user in array and save
    this.users[userIndex] = updatedUser;
    this.saveUsers(this.users);

    // Return user without sensitive info
    const { hash, salt, ...userWithoutSensitiveInfo } = updatedUser;
    return userWithoutSensitiveInfo;
  }

  // Validate user credentials
  validateUser(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) {
      return false;
    }

    // Hash the provided password with the stored salt
    const hash = crypto
      .pbkdf2Sync(password, user.salt, 1000, 64, 'sha512')
      .toString('hex');

    // Compare hashes
    if (hash !== user.hash) {
      return false;
    }

    // Return user without sensitive info
    const { hash: _, salt: __, ...userWithoutSensitiveInfo } = user;
    return userWithoutSensitiveInfo;
  }

  // Delete user
  deleteUser(id) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Remove user from array and save
    this.users.splice(userIndex, 1);
    this.saveUsers(this.users);
    return true;
  }

  // Add wine to user's favorites
  addToFavorites(userId, wineId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.favoriteWines.includes(wineId)) {
      user.favoriteWines.push(wineId);
      return this.updateUser(userId, { favoriteWines: user.favoriteWines });
    }

    return user;
  }

  // Remove wine from user's favorites
  removeFromFavorites(userId, wineId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const index = user.favoriteWines.indexOf(wineId);
    if (index !== -1) {
      user.favoriteWines.splice(index, 1);
      return this.updateUser(userId, { favoriteWines: user.favoriteWines });
    }

    return user;
  }

  // Add tasting note
  addTastingNote(userId, note) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.tastingNotes) {
      user.tastingNotes = [];
    }

    const newNote = {
      id: Date.now().toString(),
      wineId: note.wineId,
      date: new Date().toISOString(),
      rating: note.rating,
      notes: note.notes,
      aromas: note.aromas || [],
      tastingData: note.tastingData || {}
    };

    user.tastingNotes.push(newNote);
    return this.updateUser(userId, { tastingNotes: user.tastingNotes });
  }

  // Update user preferences
  updatePreferences(userId, preferences) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    return this.updateUser(userId, { preferences: updatedPreferences });
  }
}

module.exports = new UserModel();