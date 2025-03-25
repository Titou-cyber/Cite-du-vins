const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Region name is required'],
    trim: true,
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  climate: {
    type: String,
    enum: ['Cool', 'Moderate', 'Warm', 'Hot', 'Mediterranean', 'Maritime', 'Continental', 'Desert', 'Other'],
    required: false
  },
  soilTypes: [{
    type: String,
    trim: true
  }],
  topVarietals: [{
    type: String,
    trim: true
  }],
  famousWineries: [{
    type: String,
    trim: true
  }],
  history: {
    type: String,
    required: false
  },
  appellations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: false
    },
    regulations: {
      type: String,
      required: false
    }
  }],
  imageUrl: {
    type: String,
    required: false
  },
  mapCoordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  wineStyles: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
RegionSchema.index({ name: 'text', description: 'text' });
RegionSchema.index({ country: 1 });
RegionSchema.index({ climate: 1 });

module.exports = mongoose.model('Region', RegionSchema);