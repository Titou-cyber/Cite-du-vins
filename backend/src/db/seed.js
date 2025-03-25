const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');
require('dotenv').config();

// Import models
const Wine = require('../models/Wine');
const Region = require('../models/Region');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('MongoDB Connected for seeding');
    return mongoose.connection;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Data transformation function
const transformWineData = (wine) => {
  // Handle any special values or normalization
  if (wine.désignation === "zéro") wine.désignation = null;
  
  // Map points to rating
  wine.rating = wine.points;
  
  // Map French fields to English for consistency
  wine.price = wine.prix;
  wine.varietal = wine.variété;
  wine.region = wine.region_1;
  
  return wine;
};

// Seed database function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if data already exists
    const wineCount = await Wine.countDocuments();
    
    if (wineCount > 0) {
      logger.info(`Database already has ${wineCount} wines, skipping seeding...`);
      return;
    }
    
    // Load wines data
    logger.info('Reading wines.json file...');
    const wineDataPath = path.join(__dirname, '../../data/wines.json');
    
    if (!fs.existsSync(wineDataPath)) {
      logger.error(`wines.json file not found at ${wineDataPath}`);
      process.exit(1);
    }
    
    const winesJson = fs.readFileSync(wineDataPath, 'utf-8');
    let wineData;
    
    try {
      wineData = JSON.parse(winesJson);
    } catch (error) {
      logger.error(`Error parsing wines.json: ${error.message}`);
      process.exit(1);
    }
    
    if (!Array.isArray(wineData)) {
      logger.info('Wine data is not an array, wrapping in array');
      wineData = [wineData];
    }
    
    // Transform data
    logger.info(`Processing ${wineData.length} wines...`);
    const transformedWines = wineData.map(transformWineData);
    
    // Insert in batches to handle large datasets
    const BATCH_SIZE = 1000;
    const batches = Math.ceil(transformedWines.length / BATCH_SIZE);
    
    logger.info(`Inserting wines in ${batches} batches of ${BATCH_SIZE}...`);
    
    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, transformedWines.length);
      const batch = transformedWines.slice(start, end);
      
      logger.info(`Inserting batch ${i+1}/${batches} (${batch.length} wines)...`);
      await Wine.insertMany(batch, { ordered: false });
    }
    
    // Extract and create regions
    logger.info('Creating region documents...');
    
    // Get unique regions and their countries
    const regions = {};
    transformedWines.forEach(wine => {
      if (wine.region_1) {
        regions[wine.region_1] = {
          name: wine.region_1,
          country: wine.country || 'Unknown',
          province: wine.province
        };
      }
    });
    
    const regionDocs = Object.values(regions);
    
    if (regionDocs.length > 0) {
      logger.info(`Inserting ${regionDocs.length} regions...`);
      await Region.insertMany(regionDocs, { ordered: false });
    }
    
    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the seeding
seedDatabase();