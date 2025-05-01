// src/services/topupService.js
import { historyService } from './historyService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const topupService = {
  verifyUser: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to verify user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  },

  getUserInfo: async (userId) => {
    console.log(`[DEBUG] Fetching user info for ID: ${userId}`);
    try {
      const response = await fetch(`${API_URL}/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const userData = await response.json();
      console.log('[DEBUG] User info fetched:', userData);
      console.log('[DEBUG] User balance from getUserInfo:', userData.balance);
      return userData;
    } catch (error) {
      console.error(`Error fetching user info with ID ${userId}:`, error);
      throw error;
    }
  },

  getUserTransactionHistory: async (userId) => {
    try {
      // Using historyService to get transaction history
      return await historyService.getHistoryByUser(userId);
    } catch (error) {
      console.error(
        `Error fetching transaction history for user ${userId}:`,
        error
      );
      throw error;
    }
  },

  topUpBalance: async (topupData) => {
    console.log('[DEBUG] Topping up with data:', topupData);
    try {
      const response = await fetch(`${API_URL}/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topupData),
      });
      if (!response.ok) {
        throw new Error('Failed to top up balance');
      }
      const result = await response.json();
      console.log('[DEBUG] Top up result:', result);
      console.log('[DEBUG] New balance after top up:', result.newBalance);
      
      // Record the top-up transaction in history
      if (topupData.userId && topupData.amount) {
        try {
          // Using null for productId since this is a top-up, not a purchase
          await historyService.processHistory(
            topupData.userId,
            topupData.amount,
            null
          );
          console.log('[DEBUG] Top-up transaction recorded in history');
        } catch (historyError) {
          console.error('Error recording top-up in history:', historyError);
          // We don't throw this error to avoid affecting the top-up flow
          // The top-up was successful even if history recording failed
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error topping up balance:', error);
      throw error;
    }
  },

  // Get user by NFC ID
  getUserByNFC: async (nfcId) => {
    try {
      const response = await fetch(`${API_URL}/user/nfc/${nfcId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user by NFC ID');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user with NFC ID ${nfcId}:`, error);
      throw error;
    }
  },

  // Verify user by NFC ID
  verifyUserByNFC: async (nfcId) => {
    console.log(`[DEBUG] Verifying user with NFC ID: ${nfcId}`);
    try {
      const response = await fetch(`${API_URL}/user/verify-nfc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nfcId }),
      });
      if (!response.ok) {
        throw new Error('Failed to verify user by NFC ID');
      }
      const userData = await response.json();
      console.log('[DEBUG] User data from verifyUserByNFC:', userData);
      console.log('[DEBUG] Original balance from NFC auth:', userData.balance);

      // If user has an ID but no balance or balance is 0, fetch complete user info
      if (userData && userData.id) {
        if (
          userData.balance === undefined ||
          userData.balance === null ||
          userData.balance === 0
        ) {
          console.log(
            '[DEBUG] Balance missing or zero, fetching complete user info'
          );
          try {
            const userInfo = await topupService.getUserInfo(userData.id);
            if (userInfo) {
              console.log('[DEBUG] Fetched additional user info:', userInfo);
              console.log(
                '[DEBUG] Updated balance from getUserInfo:',
                userInfo.balance
              );
              return {
                ...userData,
                balance: userInfo.balance !== undefined ? userInfo.balance : 0,
              };
            }
          } catch (balanceError) {
            console.error('[DEBUG] Error fetching user balance:', balanceError);
          }
        }
      }

      return userData;
    } catch (error) {
      console.error(`Error verifying user with NFC ID ${nfcId}:`, error);
      throw error;
    }
  },
};