"use strict";

/**
 * Mongoose Schema SmartHome Model.
 */

// Imports
const mongoose = require('mongoose');

/**
 * Database description of a complete SmartHome Model.
 */
let homeSchema = new mongoose.Schema({
    user: { type: String, required: true },
    name: { type: String, required: true },
    lightbulbs: { },
    doors: {  },
    windows: {  },
    cars: {  },
    computers: {  }
  });

let Home = mongoose.model('Game', homeSchema);

module.exports = Home;