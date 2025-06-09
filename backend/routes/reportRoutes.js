// routes/reportRoutes.js
const reportController = require("../controllers/reportController");

const reportRoutes = [
  {
    method: "GET",
    path: "/report/transaction-summary",
    handler: reportController.getTransactionSummary,
  },
  {
    method: "GET",
    path: "/report/student-balances",
    handler: reportController.getSaldoAllSiswa,
  },
  {
    method: "GET",
    path: "/report/transactions",
    handler: reportController.getTransactionsByDateRange,
  },
  {
    method: "GET",
    path: "/report/best-selling-products",
    handler: reportController.getBestSellingProducts,
  },
  {
    method: "GET",
    path: "/report/popular-categories",
    handler: reportController.getPopularCategories,
  },
  {
    method: "GET",
    path: "/report/student/{siswaId}",
    handler: reportController.getSiswaReport,
  },
  {
    method: "GET",
    path: "/report/export",
    handler: reportController.exportReport,
  },
  {
    method: "GET",
    path: "/report/dashboard",
    handler: reportController.getDashboardAnalytics,
  },
  {
    method: "GET",
    path: "/report/comparison",
    handler: reportController.getComparativeReport,
  },
];

module.exports = reportRoutes;
