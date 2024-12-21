const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import your existing routes
const { router } = require('../server/src/routes/index.js');

// Use your existing routes
app.use('/api', router);

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app); 