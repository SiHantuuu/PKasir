const db = require('../config/db');
// const bcrypt = require('bcrypt');
const jwt = require('@hapi/jwt');

exports.getUsers = async (request, h) => {
  try {
    const [users] = await db.query('SELECT id, username FROM users');
    return h.response(users);
  } catch (err) {
    return h.response({ error: err.message }).code(500);
  }
};

exports.registerUser = async (request, h) => {
  try {
    const { username, password } = request.payload;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ]);
    return h.response({ message: 'User registered' }).code(201);
  } catch (err) {
    return h.response({ error: err.message }).code(500);
  }
};
