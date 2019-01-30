"use strict";

const mongoose = require('mongoose');

let loginSchema = new mongoose.Schema({
    user: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true }
  });

let Login = mongoose.model('Login', loginSchema);

module.exports = Login;