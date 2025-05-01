const historyController = require('../controllers/historyController');
const Joi = require('joi');

const historyRoutes = [
  // CREATE
  {
    method: 'POST',
    path: '/history',
    handler: historyController.processHistory,
    options: {
      // auth: 'jwt', // Assuming you have a JWT authentication strategy
      validate: {
        payload: Joi.object({
          userId: Joi.number().integer().positive().required(),
          totalPrice: Joi.number().integer().positive().required(),
          productId: Joi.number().integer().positive().required(),
        }),
      },
    },
  },

  // READ - Get all history
  {
    method: 'GET',
    path: '/history',
    handler: historyController.getAllHistory,
    options: {
      // auth: 'jwt',
      // Add pagination options if needed
      // validate: {
      //   query: Joi.object({
      //     page: Joi.number().integer().min(1).default(1),
      //     limit: Joi.number().integer().min(1).max(100).default(10)
      //   })
      // }
    },
  },

  // READ - Get history by ID
  {
    method: 'GET',
    path: '/history/{id}',
    handler: historyController.getHistoryById,
    options: {
      // auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
      },
    },
  },

  // READ - Get history by user
  {
    method: 'GET',
    path: '/history/user/{userId}',
    handler: historyController.getHistoryByUser,
    options: {
      // auth: 'jwt',
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
    path: '/history/{id}',
    handler: historyController.updateHistory,
    options: {
      // auth: 'jwt',
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
    path: '/history/{id}',
    handler: historyController.deleteHistory,
    options: {
      // auth: 'jwt',
      validate: {
        params: Joi.object({
          id: Joi.number().integer().positive().required(),
        }),
      },
    },
  },
];

module.exports = historyRoutes;