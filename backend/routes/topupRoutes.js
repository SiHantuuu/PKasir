const topupController = require("../controllers/topupController");

const topupRoutes = [
  {
    method: "POST",
    path: "/user",
    handler: topupController.postUserId,
    options: {
      description: "Verifikasi ID user",
      notes: "Memeriksa apakah ID user tersedia di database",
      tags: ["api", "user"],
    },
  },
  // {
  //   method: "GET",
  //   path: "/user/{userId}",
  //   handler: topupController.getUserInfo,
  //   options: {
  //     description: "Ambil informasi user",
  //     notes: "Mengembalikan nama dan balance user berdasarkan ID",
  //     tags: ["api", "user"],
  //   },
  // },
  {
    method: "GET",
    path: "/history/{userId}",
    handler: topupController.getUserTransactionHistory,
    options: {
      description: "Ambil history transaksi user",
      notes: "Mengambil 5 transaksi terakhir dari user berdasarkan ID",
      tags: ["api", "history"],
    },
  },
  {
    method: "POST",
    path: "/topup",
    handler: topupController.topUpBalance,
    options: {
      description: "Top-up balance user",
      notes: "Menambahkan balance user sesuai dengan value input",
      tags: ["api", "topup"],
    },
  },
];

module.exports = topupRoutes;
