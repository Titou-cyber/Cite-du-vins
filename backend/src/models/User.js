const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    favoriteWineTypes: [{
      type: String,
      enum: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified']
    }],
    favoriteRegions: [{
      type: String
    }],
    tastePreferences: {
      sweetness: { type: Number, min: 1, max: 5 },
      acidity: { type: Number, min: 1, max: 5 },
      tannin: { type: Number, min: 1, max: 5 },
      body: { type: Number, min: 1, max: 5 },
      alcohol: { type: Number, min: 1, max: 5 }
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    }
  },
  savedWines: [{
    wine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wine'
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  tastedWines: [{
    wine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wine'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    tastedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);