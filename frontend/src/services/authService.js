// src/services/authService.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authService = {
  /**
   * Registers a new user (admin or student)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  /**
   * Admin login function
   * @param {Object} credentials - Admin credentials
   * @param {string} credentials.Nama - Admin username
   * @param {string} credentials.Password - Admin password
   * @returns {Promise<Object>} Login result with token
   */
  loginAdmin: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Admin login failed');
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data;
    } catch (error) {
      console.error('Error logging in as admin:', error);
      throw error;
    }
  },

  /**
   * Student login function
   * @param {Object} credentials - Student credentials
   * @param {string} credentials.NFCId - NFC identifier
   * @param {string} credentials.Pin - 4-digit PIN
   * @returns {Promise<Object>} Login result with token
   */
  loginSiswa: async (credentials) => {
    try {
      console.log("Making login request with:", credentials);
      
      const response = await fetch(`${API_URL}/login/murid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      const data = await response.json();
      console.log("Raw server response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Student login failed');
      }
  
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        return data;
      } else {
        throw new Error('No authentication token received');
      }
    } catch (error) {
      console.error('Error logging in as student:', error);
      throw error;
    }
  },
  /**
   * Get user by NFC ID
   * @param {string} NFCId - NFC identifier
   * @returns {Promise<Object>} User data with balance
   */
  getUserByNFC: async (NFCId) => {
    try {
      console.log("Fetching user with NFC ID:", NFCId);
      
      const response = await fetch(`${API_URL}/user/nfc/${NFCId}`, {
        method: 'GET',
        headers: {
          // You might need to add authorization here
          // Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
  
      const data = await response.json();
      console.log("getUserByNFC response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user by NFC');
      }
  
      // Map the response to the expected format
      // Backend returns Nama and Amount but our app expects NFCId, Nama, and Saldo
      const mappedData = {
        NFCId: NFCId, // Use the NFCId we sent in the request
        Nama: data.Nama,
        Saldo: data.Amount // Rename 'Amount' to 'Saldo'
      };
      
      console.log("Mapped user data:", mappedData);
      return mappedData;
    } catch (error) {
      console.error('Error fetching user by NFC:', error);
      throw error;
    }
  },

  /**
   * Get user data by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} User data with balance
   */
  getUserData: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('authToken'));
  },

  /**
   * Logout user by removing token
   */
  logout: () => {
    localStorage.removeItem('authToken');
  },

  /**
   * Get current auth token
   * @returns {string|null} Current authentication token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Get user information from JWT token
   * @returns {Object|null} Decoded token payload or null if not authenticated
   */
  getTokenInfo: () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Decode JWT payload (middle part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};