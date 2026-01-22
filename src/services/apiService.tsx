import { useState, useEffect } from 'react';

/**
 * API SERVICE - LEARNING EXAMPLE
 * This shows how to communicate with your Node.js backend
 * Learn: Fetch API, async/await, error handling, data fetching
 */

const API_URL = 'http://localhost:5000/api';

// ============================================
// API FUNCTIONS
// ============================================

// Save a gesture to the backend
export async function saveGesture(gestureName, confidence = 0, duration = 0) {
  try {
    const response = await fetch(`${API_URL}/gestures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gestureName,
        confidence,
        duration,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving gesture:', error);
    return { success: false, error: error.message };
  }
}

// Get all saved gestures
export async function getGestures() {
  try {
    const response = await fetch(`${API_URL}/gestures`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching gestures:', error);
    return { gestures: [] };
  }
}

// Get statistics
export async function getStatistics() {
  try {
    const response = await fetch(`${API_URL}/statistics`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { totalGestures: 0 };
  }
}

// Clear all gestures
export async function clearGestures() {
  try {
    const response = await fetch(`${API_URL}/gestures/clear`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing gestures:', error);
    return { success: false };
  }
}

// ============================================
// REACT COMPONENT - API Demo
// ============================================

export function ApiDemo() {
  const [stats, setStats] = useState({ totalGestures: 0, averageConfidence: 0, gestures: {} });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load stats when component mounts
  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const data = await getStatistics();
    setStats(data);
    setLoading(false);
  }

  async function handleSaveGesture(gestureName) {
    setLoading(true);
    const result = await saveGesture(gestureName, Math.random());
    setMessage(result.message || 'Gesture saved!');
    await loadStats();
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleClear() {
    if (window.confirm('Clear all gestures?')) {
      setLoading(true);
      await clearGestures();
      await loadStats();
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 API Demo</h2>

      {loading && <p className="text-gray-600">Loading...</p>}

      <div className="bg-white p-4 rounded-lg mb-4 shadow">
        <p className="text-sm text-gray-600">Total Gestures: {stats.totalGestures}</p>
        <p className="text-sm text-gray-600">Avg Confidence: {stats.averageConfidence}</p>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={() => handleSaveGesture('thumbsup')}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          👍 Save Thumbs Up
        </button>
        <button
          onClick={() => handleSaveGesture('peace')}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          ✌️ Save Peace
        </button>
        <button
          onClick={() => handleSaveGesture('openpalm')}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ✋ Save Open Palm
        </button>
      </div>

      <button
        onClick={handleClear}
        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        🗑️ Clear All
      </button>

      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
}

export default ApiDemo;
