const topupController = require('../controllers/topupController');

const topupRoutes = [
  {
    method: 'POST',
    path: '/user',
    handler: topupController.postUserId,
    options: {
      description: 'Verifikasi ID user',
      notes: 'Memeriksa apakah ID user tersedia di database',
      tags: ['api', 'user'],
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
  // {
  //   method: "GET",
  //   path: "/history/{id}",
  //   handler: topupController.getUserTransactionHistory,
  //   options: {
  //     description: "Ambil history transaksi user",
  //     notes: "Mengambil 5 transaksi terakhir dari user berdasarkan ID",
  //     tags: ["api", "history"],
  //   },
  // },
  {
    method: 'POST',
    path: '/topup',
    handler: topupController.topUpBalance,
    options: {
      description: 'Top-up balance user',
      notes: 'Menambahkan balance user sesuai dengan value input',
      tags: ['api', 'topup'],
    },
  },
  // New route to get user by NFC ID as URL parameter
  // {
  //   method: 'GET',
  //   path: '/user/nfc/{nfcId}',
  //   handler: topupController.getUserByNFC,
  //   options: {
  //     description: 'Ambil user berdasarkan NFC ID',
  //     notes: 'Mengembalikan informasi user yang sesuai dengan NFC ID',
  //     tags: ['api', 'user', 'nfc'],
  //   },
  // },
  // New route to verify user by NFC ID in the request body
  {
    method: 'POST',
    path: '/user/verify-nfc',
    handler: topupController.verifyUserByNFC,
    options: {
      description: 'Verifikasi user dengan NFC ID',
      notes:
        'Memeriksa apakah NFC ID tersedia di database dan mengembalikan informasi user',
      tags: ['api', 'user', 'nfc'],
    },
  },
];

module.exports = topupRoutes;
