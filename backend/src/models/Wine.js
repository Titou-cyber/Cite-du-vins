const mongoose = require('mongoose');

const WineSchema = new mongoose.Schema({
  // English fields
  points: {
    type: Number,
    required: false
  },
  title: {
    type: String,
    required: [true, 'Wine title is required'],
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  taster_name: {
    type: String,
    required: false,
    trim: true
  },
  taster_twitter_handle: {
    type: String,
    required: false
  },
  winery: {
    type: String,
    required: false,
    trim: true
  },
  country: {
    type: String,
    required: false,
    trim: true
  },
  province: {
    type: String,
    required: false,
    trim: true
  },
  region_1: {
    type: String,
    required: false,
    trim: true
  },
  region_2: {
    type: String,
    required: false,
    trim: true
  },
  
  // French fields
  prix: {
    type: Number,
    required: false
  },
  désignation: {
    type: String,
    required: false,
    trim: true
  },
  variété: {
    type: String,
    required: false,
    trim: true
  },
  
  // Computed/transformed fields (for convenience)
  price: {
    type: Number,
    required: false
  },
  rating: {
    type: Number,
    required: false
  },
  region: {
    type: String,
    required: false,
    trim: true
  },
  varietal: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full wine name
WineSchema.virtual('name').get(function() {
  return this.title;
});

// Pre-save middleware to map fields
WineSchema.pre('save', function(next) {
  // Map French fields to English for consistency in the API
  if (this.prix && !this.price) this.price = this.prix;
  if (this.variété && !this.varietal) this.varietal = this.variété;
  if (this.region_1 && !this.region) this.region = this.region_1;
  if (this.points && !this.rating) this.rating = this.points;
  
  // Handle any special values like "zéro"
  if (this.désignation === "zéro") this.désignation = null;
  
  next();
});

// Index for faster queries
WineSchema.index({ title: 'text', description: 'text', winery: 'text' });
WineSchema.index({ region_1: 1, country: 1 });
WineSchema.index({ province: 1 });
WineSchema.index({ price: 1, prix: 1 });
WineSchema.index({ points: 1 });
WineSchema.index({ variété: 1 });

module.exports = mongoose.model('Wine', WineSchema);