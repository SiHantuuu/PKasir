const userController = require('./controllers/userController');

module.exports = [
  {
    method: 'GET',
    path: '/users',
    handler: userController.getUsers,
  },
  {
    method: 'POST',
    path: '/users/register',
    handler: userController.registerUser,
  },
];
