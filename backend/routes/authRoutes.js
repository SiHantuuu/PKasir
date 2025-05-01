const authController = require('../controllers/authController');

const authRoutes = [
  {
    method: 'POST',
    path: '/register',
    handler: authController.register,
  },
  {
    method: 'POST',
    path: '/login/admin',
    handler: authController.loginAdmin,
  },
  {
    method: 'POST',
    path: '/login/murid',
    handler: authController.loginSiswa,
  },
  {
    method: 'GET',
    path: '/user/nfc/{NFCId}',
    handler: authController.getUserByNFC,
  },
  {
    method: 'GET',
    path: '/user/{id}',
    handler: authController.getUserData,
  },
];

module.exports = authRoutes;
