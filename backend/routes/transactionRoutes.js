const transactionController = require('../controllers/transactionController');
const Joi = require('@hapi/joi'); // Assuming you're using Joi for validation

const transactionRoutes = [
  // CREATE
  {
    method: 'POST',
    path: '/transaction',
    handler: transactionController.processTransaction,
    options: {
      auth: 'jwt', // Assuming you have a JWT authentication strategy
      validate: {
        payload: Joi.object({
          userId: Joi.number().integer().positive().required(),
          totalPrice: Joi.number().integer().positive().required(),
          productId: Joi.number().integer().positive().required(),
        }),
      },
    },
  },

  // READ - Get all transactions
  {
    method: 'GET',
    path: '/transactions',
    handler: transactionController.getAllTransactions,
    options: {
      auth: 'jwt',
      // Add pagination options if needed
      // validate: {
      //   query: Joi.object({
      //     page: Joi.number().integer().min(1).default(1),
      //     limit: Joi.number().integer().min(1).max(100).default(10)
      //   })
      // }
    },
  },

  // READ - Get transaction by ID
  {
    method: 'GET',
    path: '/transaction/{id}',
    handler: transactionController.getTransactionById,
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
      },
    },
  },

  // READ - Get transactions by user
  {
    method: 'GET',
    path: '/transactions/user/{userId}',
    handler: transactionController.getTransactionsByUser,
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          userId: Joi.number().integer().positive().required(),
        }),
      },
    },
  },

  // UPDATE
  {
    method: 'PUT',
    path: '/transaction/{id}',
    handler: transactionController.updateTransaction,
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
        payload: Joi.object({
          description: Joi.string().required().min(1).max(255),
        }),
      },
    },
  },

  // DELETE
  {
    method: 'DELETE',
    path: '/transaction/{id}',
    handler: transactionController.deleteTransaction,
    options: {
      auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
      },
    },
  },
];

module.exports = transactionRoutes;
