// Base URL for the API - replace with your actual API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import axios from 'axios';

// Helper function to get auth token from local storage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to inject auth token to every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// API Service for history endpoints
export const historyService = {
  // CREATE - Process a new history (purchase)
  processHistory: async (userId, totalPrice, productId) => {
    try {
      const response = await api.post('/history', { 
        userId, 
        totalPrice, 
        productId 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to process history' };
    }
  },

  // READ - Get all history
  getAllHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch history' };
    }
  },

  // READ - Get history by ID
  getHistoryById: async (id) => {
    try {
      const response = await api.get(`/history/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch history' };
    }
  },

  // READ - Get history by user ID
  getHistoryByUser: async (userId) => {
    try {
      const response = await api.get(`/history/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user history' };
    }
  },

  // UPDATE - Update history details (only description can be updated)
  updateHistory: async (id, description) => {
    try {
      const response = await api.put(`/history/${id}`, { description });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update history' };
    }
  },

  // DELETE - Cancel/delete a history (refund will be processed if within 24 hours)
  deleteHistory: async (id) => {
    try {
      const response = await api.delete(`/history/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete history' };
    }
  },
};

// Add better error handling to display specific error messages from the backend
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
};

// Also export as default for backward compatibility
export default historyService;