/**
 * SIMPLE NODE.JS + EXPRESS BACKEND SERVER
 * This is a beginner-friendly backend for your hand gesture website
 * Learn: Express basics, REST APIs, middleware, file handling, and CORS
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================
// SETUP
// ============================================
const app = express();
const PORT = 5000;

// Get current directory (needed for ES modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

// MIDDLEWARE - These process requests before they reach your routes
app.use(cors()); // Allow requests from your React frontend
app.use(express.json()); // Parse JSON data from request bodies

// ============================================
// HELPER FUNCTIONS
// ============================================

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Save gesture data to a JSON file
async function saveGestureData(gesture) {
  try {
    const filePath = path.join(dataDir, 'gestures.json');
    let gestures = [];

    // Read existing data
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      gestures = JSON.parse(data);
    } catch {
      gestures = [];
    }

    // Add new gesture with timestamp
    gestures.push({
      ...gesture,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 gestures
    if (gestures.length > 100) {
      gestures = gestures.slice(-100);
    }

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(gestures, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving gesture:', err);
    return false;
  }
}

// ============================================
// ROUTES - These define what happens when clients request certain URLs
// ============================================

// ROOT ROUTE - GET request to /
app.get('/', (req, res) => {
  res.json({
    message: '👋 Welcome to Hand Gesture API!',
    version: '1.0.0',
    endpoints: {
      'GET /api/health': 'Check if server is running',
      'GET /api/gestures': 'Get all saved gestures',
      'POST /api/gestures': 'Save a new gesture',
      'DELETE /api/gestures/clear': 'Clear all gestures',
    },
  });
});

// HEALTH CHECK - Simple way to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET ALL GESTURES - Retrieve stored gesture data
app.get('/api/gestures', async (req, res) => {
  try {
    const filePath = path.join(dataDir, 'gestures.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const gestures = JSON.parse(data);
    res.json({
      success: true,
      count: gestures.length,
      gestures,
    });
  } catch {
    res.json({
      success: true,
      count: 0,
      gestures: [],
      message: 'No gestures saved yet',
    });
  }
});

// SAVE A GESTURE - POST request to store new gesture
app.post('/api/gestures', async (req, res) => {
  try {
    const { gestureName, confidence, duration } = req.body;

    // VALIDATION - Check if required data is present
    if (!gestureName) {
      return res.status(400).json({
        success: false,
        error: 'gestureName is required',
      });
    }

    const gestureData = {
      gestureName,
      confidence: confidence || 0,
      duration: duration || 0,
    };

    const saved = await saveGestureData(gestureData);

    res.json({
      success: saved,
      message: saved ? 'Gesture saved successfully!' : 'Failed to save gesture',
      data: gestureData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// CLEAR ALL GESTURES - DELETE request to remove all data
app.delete('/api/gestures/clear', async (req, res) => {
  try {
    const filePath = path.join(dataDir, 'gestures.json');
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
    res.json({
      success: true,
      message: 'All gestures cleared!',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// STATISTICS - Get summary stats about gestures
app.get('/api/statistics', async (req, res) => {
  try {
    const filePath = path.join(dataDir, 'gestures.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const gestures = JSON.parse(data);

    const stats = {
      totalGestures: gestures.length,
      averageConfidence:
        gestures.length > 0
          ? (gestures.reduce((sum, g) => sum + g.confidence, 0) / gestures.length).toFixed(2)
          : 0,
      gestures: {},
    };

    // Count occurrences of each gesture
    gestures.forEach((g) => {
      stats.gestures[g.gestureName] = (stats.gestures[g.gestureName] || 0) + 1;
    });

    res.json(stats);
  } catch {
    res.json({
      totalGestures: 0,
      averageConfidence: 0,
      gestures: {},
    });
  }
});

// ERROR HANDLING - Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  await ensureDataDir();

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║  🚀 Hand Gesture Server Running!           ║
║  📍 http://localhost:${PORT}                     ║
║  🌐 API: http://localhost:${PORT}/api/*         ║
╚════════════════════════════════════════════╝
    `);
  });
}

startServer();

export default app;
