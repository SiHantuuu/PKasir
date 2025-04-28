const { Transaction, Product, User, Balance, sequelize } = require('../models');

// CREATE - Process a new history
const processhistory = async (request, h) => {
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

  const t = await sequelize.history();

  try {
    // 1. Verify the product exists
    const product = await Product.findByPk(productId, { history: t });
    if (!product) {
      await t.rollback();
      return h.response({ message: 'Product not found' }).code(404);
    }

    // 2. Get user and check balance
    const user = await User.findByPk(userId, {
      include: [{ model: Balance, as: 'balance' }],
      history: t,
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

    // 4. Create new history
    const newhistory = await history.create(
      {
        historyDate: new Date(),
        ProductId: productId,
        CustomerId: userId,
        Amount: totalPrice,
        historyType: 'PURCHASE',
        Description: `Purchase of product ID: ${productId}`,
      },
      { history: t }
    );

    // 5. Update user balance
    const newBalance = currentBalance - totalPrice;
    await user.balance.update({ Amount: newBalance }, { history: t });

    // Commit the history
    await t.commit();

    return h
      .response({
        message: 'history successful',
        historyId: newhistory.id,
        newBalance: newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('history processing error:', error.message);
    return h
      .response({ error: 'history failed. Please try again later.' })
      .code(500);
  }
};

// READ - Get all history
const getAllhistory = async (request, h) => {
  try {
    const history = await Transaction.findAll({
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

    return h.response(history).code(200);
  } catch (error) {
    console.error('Get all history error:', error.message);
    return h
      .response({
        error: 'Failed to fetch history. Please try again later.',
      })
      .code(500);
  }
};

// READ - Get history by ID
const gethistoryById = async (request, h) => {
  const { id } = request.params;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid history ID' }).code(400);
  }

  try {
    const history = await history.findByPk(id, {
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

    if (!history) {
      return h.response({ message: 'history not found' }).code(404);
    }

    return h.response(history).code(200);
  } catch (error) {
    console.error('Get history by ID error:', error.message);
    return h
      .response({
        error: 'Failed to fetch history. Please try again later.',
      })
      .code(500);
  }
};

// READ - Get history by user ID
const gethistoryByUser = async (request, h) => {
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

    const history = await history.findAll({
      where: { CustomerId: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'ProductName', 'Price', 'CategoryId'],
        },
      ],
      order: [['historyDate', 'DESC']], // Order by date, newest first
    });

    return h.response(history).code(200);
  } catch (error) {
    console.error('Get history by user error:', error.message);
    return h
      .response({
        error: 'Failed to fetch user history. Please try again later.',
      })
      .code(500);
  }
};

// UPDATE - Update history details
const updatehistory = async (request, h) => {
  const { id } = request.params;
  const { description } = request.payload;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid history ID' }).code(400);
  }

  if (!description || description.trim() === '') {
    return h.response({ message: 'Description cannot be empty' }).code(400);
  }

  const t = await sequelize.history();

  try {
    const history = await history.findByPk(id, { history: t });

    if (!history) {
      await t.rollback();
      return h.response({ message: 'history not found' }).code(404);
    }

    // Only allowing description updates in this example
    await history.update({ Description: description }, { history: t });

    await t.commit();

    return h
      .response({
        message: 'history updated successfully',
        history,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Update history error:', error.message);
    return h
      .response({
        error: 'Failed to update history. Please try again later.',
      })
      .code(500);
  }
};

// DELETE - Cancel/delete a history
const deletehistory = async (request, h) => {
  const { id } = request.params;

  // Input validation
  if (isNaN(id)) {
    return h.response({ message: 'Invalid history ID' }).code(400);
  }

  const t = await sequelize.history();

  try {
    const history = await history.findByPk(id, {
      history: t,
    });

    if (!history) {
      await t.rollback();
      return h.response({ message: 'history not found' }).code(404);
    }

    // Check if history is within refund time window (24 hours)
    const historyTime = new Date(history.historyDate);
    const currentTime = new Date();
    const diffHours = (currentTime - historyTime) / (1000 * 60 * 60);

    if (diffHours > 24) {
      await t.rollback();
      return h
        .response({ message: 'history cannot be refunded after 24 hours' })
        .code(400);
    }

    // Get the user and balance
    const user = await User.findByPk(history.CustomerId, {
      include: [{ model: Balance, as: 'balance' }],
      history: t,
    });

    if (!user || !user.balance) {
      await t.rollback();
      return h.response({ message: 'User or balance not found' }).code(404);
    }

    // Refund the user
    const currentBalance = user.balance.Amount;
    const newBalance = currentBalance + history.Amount;

    await user.balance.update({ Amount: newBalance }, { history: t });

    // Delete the history
    await history.destroy({ history: t });

    await t.commit();

    return h
      .response({
        message: 'history deleted and payment refunded',
        refundAmount: history.Amount,
        newBalance,
      })
      .code(200);
  } catch (error) {
    await t.rollback();
    console.error('Delete history error:', error.message);
    return h
      .response({
        error: 'Failed to delete history. Please try again later.',
      })
      .code(500);
  }
};

module.exports = {
  processhistory,
  getAllhistory,
  gethistoryById,
  gethistoryByUser,
  updatehistory,
  deletehistory,
};
