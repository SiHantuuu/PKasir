const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const siswaRoutes = require("./siswaRoutes");
const transactionRoutes = require("./transactionRoutes");
const authRoutes = require("./authRoutes");

const routes = [
  ...categoryRoutes,
  ...productRoutes,
  ...siswaRoutes,
  ...transactionRoutes,
  ...authRoutes,
];

module.exports = routes;
