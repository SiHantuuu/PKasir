const transactionController = require("../controllers/transactionController");

const Joi = require("joi");

const transactionRoutes = [
  {
    method: "POST",
    path: "/transactions/topup",
    handler: transactionController.createTopupTransaction,
    options: {
      validate: {
        payload: Joi.object({
          customer_id: Joi.number().integer().required(),
          amount: Joi.number().positive().required(),
          note: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/transactions/purchase",
    handler: transactionController.createPurchaseTransaction,
    options: {
      validate: {
        payload: Joi.object({
          customer_id: Joi.number().integer().required(),
          items: Joi.array()
            .items(
              Joi.object({
                product_id: Joi.number().integer().required(),
                amount: Joi.number().integer().positive().required(),
              })
            )
            .min(1)
            .required(),
          note: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/transactions/penalty",
    handler: transactionController.createPenaltyTransaction,
    options: {
      validate: {
        payload: Joi.object({
          customer_id: Joi.number().integer().required(),
          amount: Joi.number().positive().required(),
          note: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/transactions",
    handler: transactionController.getAllTransactions,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          sortBy: Joi.string().default("createdAt"),
          sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
          type: Joi.string()
            .valid("all", "topup", "purchase", "penalty")
            .default("all"),
          status: Joi.string()
            .valid("all", "completed", "pending")
            .default("all"),
          startDate: Joi.date().optional(),
          endDate: Joi.date().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/transactions/{id}",
    handler: transactionController.getTransactionById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/transactions/siswa/{siswaId}",
    handler: transactionController.getTransactionsBySiswa,
    options: {
      validate: {
        params: Joi.object({
          siswaId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          sortBy: Joi.string().default("createdAt"),
          sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
          type: Joi.string()
            .valid("all", "topup", "purchase", "penalty")
            .default("all"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/transactions/history",
    handler: transactionController.getTransactionHistory,
    options: {
      validate: {
        query: Joi.object({
          startDate: Joi.date().required(),
          endDate: Joi.date().required(),
          siswaId: Joi.number().integer().optional(),
          type: Joi.string()
            .valid("all", "topup", "purchase", "penalty")
            .default("all"),
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(50),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/transactions/{id}/details",
    handler: transactionController.getTransactionDetails,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/transactions/{id}",
    handler: transactionController.deleteTransaction,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          reason: Joi.string().optional(),
        }),
      },
    },
  },
];

module.exports = transactionRoutes;
