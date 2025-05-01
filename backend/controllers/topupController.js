require('dotenv').config();
const { sequelize, User, Balance, Transaction } = require('../models');

const postUserId = async (request, h) => {
  const { userId } = request.payload;
  try {
    const user = await User.findByPk(userId);
    if (!user) return h.response({ message: 'User not found' }).code(404);

    return h.response({ message: 'User verified', userId }).code(200);
  } catch (error) {
    console.error('Error verifying user:', error);
    return h.response({ error: 'Failed to verify user' }).code(500);
  }
};

// New function to get user by NFC ID
const getUserByNFC = async (request, h) => {
  const { nfcId } = request.params;
  try {
    const user = await User.findOne({
      where: { NFCId: nfcId },
      include: [
        {
          model: Balance,
          as: 'balance',
          attributes: ['Amount'],
        },
      ],
      attributes: ['id', 'Nama', 'NFCId', 'role'],
    });

    if (!user) return h.response({ message: 'User not found' }).code(404);

    return h
      .response({
        id: user.id,
        Nama: user.Nama,
        NFCId: user.NFCId,
        role: user.role,
        Balance: user.balance ? user.balance.Amount : 0,
      })
      .code(200);
  } catch (error) {
    console.error('Error fetching user by NFC ID:', error);
    return h.response({ error: 'Failed to fetch user' }).code(500);
  }
};

// Alternative version that accepts NFC ID in the request body
const verifyUserByNFC = async (request, h) => {
  const { nfcId } = request.payload;
  try {
    const user = await User.findOne({
      where: { NFCId: nfcId },
      include: [
        {
          model: Balance,
          as: 'balance',
          attributes: ['Amount'],
        },
      ],
      attributes: ['id', 'Nama', 'NFCId', 'role'],
    });

    if (!user) return h.response({ message: 'User not found' }).code(404);

    return h
      .response({
        id: user.id,
        Nama: user.Nama,
        NFCId: user.NFCId,
        role: user.role,
        Balance: user.balance ? user.balance.Amount : 0,
      })
      .code(200);
  } catch (error) {
    console.error('Error verifying user by NFC ID:', error);
    return h.response({ error: 'Failed to verify user' }).code(500);
  }
};

const getUserInfo = async (request, h) => {
  const { userId } = request.params;
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Balance,
          as: 'balance',
          attributes: ['Amount'],
        },
      ],
      attributes: ['id', 'Nama'],
    });

    if (!user) return h.response({ message: 'User not found' }).code(404);

    return h
      .response({
        id: user.id,
        Nama: user.Nama,
        Balance: user.balance ? user.balance.Amount : 0,
      })
      .code(200);
  } catch (error) {
    console.error('Error fetching user info:', error);
    return h.response({ error: 'Failed to fetch user info' }).code(500);
  }
};

const getUserTransactionHistory = async (request, h) => {
  const { userId } = request.params;
  const limit = 5;
  const offset = 0;

  try {
    // Verify user exists first - make sure the model name matches your actual table
    // If your model is defined differently than "User", adjust accordingly
    const userExists = await sequelize.models.users.findByPk(userId);
    if (!userExists) {
      return h.response({ message: 'User not found' }).code(404);
    }

    const transactions = await Transaction.findAll({
      where: { CustomerId: userId }, // Make sure this field name matches your actual column name
      order: [['TransactionDate', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: sequelize.models.Product,
          as: 'product',
          attributes: ['id', 'name'],
        },
      ],
    });

    return h.response({ transactions }).code(200);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return h.response({ message: 'An error occurred while fetching transaction history' }).code(500);
  }
};

const topUpBalance = async (request, h) => {
  const { userId, amount, productId } = request.payload;

  // Validate amount
  if (!amount || amount <= 0) {
    return h
      .response({
        message: 'Invalid amount. Amount must be a positive number.',
      })
      .code(400);
  }

  // Set default product ID for top-up if not provided
  // Assuming there's a specific product for top-up operations
  const topupProductId = productId || 1; // You might want to replace 1 with an actual top-up product ID from your database

  try {
    // Use a transaction to ensure data integrity
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Balance,
            as: 'balance',
          },
        ],
        transaction: t,
      });

      if (!user) return null;

      // Check if user has a balance record
      if (!user.balance) {
        // Create a new balance record if one doesn't exist
        await Balance.create(
          {
            UserId: userId,
            Amount: parseInt(amount, 10),
          },
          { transaction: t }
        );
      } else {
        // Update existing balance
        const currentBalance = user.balance.Amount;
        const newBalance = currentBalance + parseInt(amount, 10);
        await user.balance.update({ Amount: newBalance }, { transaction: t });
      }

      // Get the updated balance
      const updatedUser = await User.findByPk(userId, {
        include: [
          {
            model: Balance,
            as: 'balance',
          },
        ],
        transaction: t,
      });

      // Create transaction record with ProductId
      const transaction = await Transaction.create(
        {
          CustomerId: userId,
          ProductId: topupProductId, // Adding the required ProductId field
          Amount: amount,
          TransactionType: 'TOP_UP',
          TransactionDate: new Date(),
          Description: 'Balance top-up',
        },
        { transaction: t }
      );

      return {
        newBalance: updatedUser.balance.Amount,
        transactionId: transaction.id,
      };
    });

    if (!result) return h.response({ message: 'User not found' }).code(404);

    return h
      .response({
        message: 'Balance updated successfully',
        newBalance: result.newBalance,
        transactionId: result.transactionId,
      })
      .code(200);
  } catch (error) {
    console.error('Error updating balance:', error);
    return h.response({ error: 'Failed to update balance' }).code(500);
  }
};

module.exports = {
  postUserId,
  getUserInfo,
  getUserTransactionHistory,
  topUpBalance,
  getUserByNFC,
  verifyUserByNFC,
};
