const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const siswaRoutes = require("./siswaRoutes");
const transactionRoutes = require("./transactionRoutes");
const authRoutes = require("./authRoutes");
const reportRoutes = require("./reportRoutes");
const predictRoutes = require("./predictRoutes");

const routes = [
  ...categoryRoutes,
  ...productRoutes,
  ...siswaRoutes,
  ...transactionRoutes,
  ...authRoutes,
  ...reportRoutes,
  ...predictRoutes,
];

module.exports = routes;
