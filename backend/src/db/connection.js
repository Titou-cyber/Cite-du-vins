const mongoose = require('mongoose');
const { logger } = require('../config/logger');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize Redis connection if needed
    // await initRedis();
    
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Database seeding function
const seedDatabase = async () => {
  try {
    // Import models
    const Wine = require('../models/Wine');
    const Region = require('../models/Region');
    
    // Check if data already exists
    const wineCount = await Wine.countDocuments();
    
    if (wineCount > 0) {
      logger.info('Database already seeded, skipping...');
      return;
    }
    
    // Load seed data
    const fs = require('fs');
    const path = require('path');
    
    // Read wines.json
    const wineData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/wines.json'), 'utf-8')
    );
    
    // Process and insert wine data
    logger.info('Seeding wine data...');
    await Wine.insertMany(wineData);
    
    // Extract and create regions
    const regions = [...new Set(wineData.map(wine => wine.region))].filter(Boolean);
    
    const regionDocs = regions.map(region => ({
      name: region,
      country: wineData.find(wine => wine.region === region)?.country || 'Unknown'
    }));
    
    await Region.insertMany(regionDocs);
    
    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
  }
};

module.exports = { connectDB, seedDatabase };