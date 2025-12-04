// api.js for dashboard stats
// Provides functions to fetch stats from backend
// Author: GitHub Copilot (GPT-4.1)

import axios from 'axios';

// Fetch stats for current user
export async function fetchUserStats() {
  try {
    const res = await axios.get('/api/users/stats');
    return res.data;
  } catch (err) {
    // Return error for UI to handle
    return { success: false, error: err?.response?.data?.error || err.message };
  }
}
