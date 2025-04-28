const { Transaction, Product, User, Balance, sequelize } = require('../models');

// CREATE - Process a new transaction
const processTransaction = async (request, h) => {
  const { userId, totalPrice, productId } = request.payload;

  // Input validation
  if (
    isNaN(userId) ||
    isNaN(totalPrice) ||
    isNaN(productId) ||
    totalPrice <= 0
  ) {
    return h.response({ message: 'Invalid input parameters' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    // 1. Verify the product exists
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return h.response({ message: 'Product not found' }).code(404);
    }

    // 2. Get user and check balance
    const user = await User.findByPk(userId, {
      include: [{ model: Balance, as: 'balance' }],
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return h.response({ message: 'User not found' }).code(404);
    }

    if (!user.balance) {
      await t.rollback();
      return h.response({ message: 'User has no balance record' }).code(400);
    }

    const currentBalance = user.balance.Amount;

    // 3. Check if user has enough balance
    if (currentBalance < totalPrice) {
      await t.rollback();
      return h.response({ message: 'Insufficient balance' }).code(400);
    }

    // 4. Create new transaction
    const newTransaction = await Transaction.create(
      {
        TransactionDate: new Date(),
        ProductId: productId,
        CustomerId: userId,
        Amount: totalPrice,
        TransactionType: 'PURCHASE',
        Description: `Purchase of product ID: ${productId}`,
      },
      { transaction: t }
    );

    // 5. Update user balance
    const newBalance = currentBalance - totalPrice;
    await user.balance.update({ Amount: newBalance }, { transaction: t });

    // Commit the transaction
    await t.commit();

    return h
      .response({
        message: 'Transaction successful',
        transactionId: newTransaction.id,
        newBalance: newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Transaction processing error:', error.message);
    return h
      .response({ error: 'Transaction failed. Please try again later.' })
      .code(500);
  }
};

// READ - Get all transactions
const getAllTransactions = async (request, h) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'Nama', 'NFCId'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
    });

    return h.response(transactions).code(200);
  } catch (error) {
    console.error('Get all transactions error:', error.message);
    return h
      .response({
        error: 'Failed to fetch transactions. Please try again later.',
      })
      .code(500);
  }
};

// READ - Get transaction by ID
const getTransactionById = async (request, h) => {
  const { id } = request.params;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid transaction ID' }).code(400);
  }

  try {
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'Nama', 'NFCId'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
    });

    if (!transaction) {
      return h.response({ message: 'Transaction not found' }).code(404);
    }

    return h.response(transaction).code(200);
  } catch (error) {
    console.error('Get transaction by ID error:', error.message);
    return h
      .response({
        error: 'Failed to fetch transaction. Please try again later.',
      })
      .code(500);
  }
};

// READ - Get transactions by user ID
const getTransactionsByUser = async (request, h) => {
  const { userId } = request.params;

  // Input validation
  if (isNaN(userId)) {
    return h.response({ message: 'Invalid user ID' }).code(400);
  }

  try {
    // First check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    const transactions = await Transaction.findAll({
      where: { CustomerId: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
      order: [['TransactionDate', 'DESC']], // Order by date, newest first
    });

    return h.response(transactions).code(200);
  } catch (error) {
    console.error('Get transactions by user error:', error.message);
    return h
      .response({
        error: 'Failed to fetch user transactions. Please try again later.',
      })
      .code(500);
  }
};

// UPDATE - Update transaction details
const updateTransaction = async (request, h) => {
  const { id } = request.params;
  const { description } = request.payload;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid transaction ID' }).code(400);
  }

  if (!description || description.trim() === '') {
    return h.response({ message: 'Description cannot be empty' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findByPk(id, { transaction: t });

    if (!transaction) {
      await t.rollback();
      return h.response({ message: 'Transaction not found' }).code(404);
    }

    // Only allowing description updates in this example
    await transaction.update({ Description: description }, { transaction: t });

    await t.commit();

    return h
      .response({
        message: 'Transaction updated successfully',
        transaction,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Update transaction error:', error.message);
    return h
      .response({
        error: 'Failed to update transaction. Please try again later.',
      })
      .code(500);
  }
};

// DELETE - Cancel/delete a transaction
const deleteTransaction = async (request, h) => {
  const { id } = request.params;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid transaction ID' }).code(400);
  }

  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findByPk(id, {
      transaction: t,
    });

    if (!transaction) {
      await t.rollback();
      return h.response({ message: 'Transaction not found' }).code(404);
    }

    // Check if transaction is within refund time window (24 hours)
    const transactionTime = new Date(transaction.TransactionDate);
    const currentTime = new Date();
    const diffHours = (currentTime - transactionTime) / (1000 * 60 * 60);

    if (diffHours > 24) {
      await t.rollback();
      return h
        .response({ message: 'Transaction cannot be refunded after 24 hours' })
        .code(400);
    }

    // Get the user and balance
    const user = await User.findByPk(transaction.CustomerId, {
      include: [{ model: Balance, as: 'balance' }],
      transaction: t,
    });

    if (!user || !user.balance) {
      await t.rollback();
      return h.response({ message: 'User or balance not found' }).code(404);
    }

    // Refund the user
    const currentBalance = user.balance.Amount;
    const newBalance = currentBalance + transaction.Amount;

    await user.balance.update({ Amount: newBalance }, { transaction: t });

    // Delete the transaction
    await transaction.destroy({ transaction: t });

    await t.commit();

    return h
      .response({
        message: 'Transaction deleted and payment refunded',
        refundAmount: transaction.Amount,
        newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Delete transaction error:', error.message);
    return h
      .response({
        error: 'Failed to delete transaction. Please try again later.',
      })
      .code(500);
  }
};

module.exports = {
  processTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  updateTransaction,
  deleteTransaction,
};
