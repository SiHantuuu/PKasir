// services/historyService.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get auth token from local storage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create headers with authentication token
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const historyService = {
  // CREATE - Process a new history (purchase)
  processHistory: async (userId, totalPrice, productId) => {
    try {
      const response = await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, totalPrice, productId }),
      });
      if (!response.ok) {
        throw new Error('Failed to process history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error processing history:', error);
      throw error;
    }
  },

  // READ - Get all history
  getAllHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // READ - Get history by ID
  getHistoryById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching history with ID ${id}:`, error);
      throw error;
    }
  },

  // READ - Get history by user ID
  getHistoryByUser: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/history/user/${userId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user history');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching history for user ${userId}:`, error);
      throw error;
    }
  },

  // UPDATE - Update history details
  updateHistory: async (id, description) => {
    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ description }),
      });
      if (!response.ok) {
        throw new Error('Failed to update history');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating history with ID ${id}:`, error);
      throw error;
    }
  },

  // DELETE - Cancel/delete a history
  deleteHistory: async (id) => {
    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete history');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting history with ID ${id}:`, error);
      throw error;
    }
  },
};

export default historyService;