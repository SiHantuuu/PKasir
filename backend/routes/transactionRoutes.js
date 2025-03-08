const transactionController = require("../controllers/transactionController");
const transactionRoutes = [{
    method: "POST",
    path: "/transaction",
    handler: transactionController.processTransaction,
  }]

  module.exports = transactionRoutes;