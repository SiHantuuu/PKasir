const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Balance } = require('../models'); // Import both User and Balance models
require('dotenv').config();

const register = async (request, h) => {
  try {
    let { Nama, NFCId, Pin, Password, Amount, role } = request.payload;
    role = role || 'murid'; // Default to "murid" if not specified

    if (role === 'admin') {
      if (!Password) {
        return h
          .response({ message: 'Admin harus memasukkan password' })
          .code(400);
      }
      Password = await bcrypt.hash(Password, 10);
      Pin = null; // Admin doesn't need PIN
    } else if (role === 'murid') {
      if (!Pin || !/^\d{6}$/.test(Pin)) {
        return h
          .response({ message: 'Murid harus memiliki PIN 6 angka' })
          .code(400);
      }
      Pin = await bcrypt.hash(Pin, 10);
      Password = null; // Students don't need Password
    } else {
      return h.response({ message: 'Role tidak valid' }).code(400);
    }

    // Start a transaction to ensure both user and balance are created or neither
    const result = await sequelize.transaction(async (t) => {
      // Create user first
      const user = await User.create(
        {
          Nama,
          NFCId,
          Pin,
          Password,
          role,
        },
        { transaction: t }
      );

      // Create balance record with initial amount
      await Balance.create(
        {
          UserId: user.id,
          Amount: Amount || 0,
        },
        { transaction: t }
      );

      return user;
    });

    return h
      .response({ message: 'User registered successfully', user: result })
      .code(201);
  } catch (error) {
    console.error('Register Error:', error);
    return h
      .response({ message: 'Internal server error', error: error.message })
      .code(500);
  }
};

const loginAdmin = async (request, h) => {
  try {
    const { Nama, Password } = request.payload;

    const user = await User.findOne({ where: { Nama, role: 'admin' } });
    if (!user) {
      return h.response({ message: 'Admin not found' }).code(404);
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '1h' }
    );

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Login Error:', error);
    return h
      .response({ message: 'Internal server error', error: error.message })
      .code(500);
  }
};

const loginSiswa = async (request, h) => {
  try {
    const { Nama, Pin } = request.payload;

    const user = await User.findOne({ where: { Nama, role: 'murid' } });
    if (!user) {
      return h.response({ message: 'Murid not found' }).code(404);
    }

    const isMatch = await bcrypt.compare(Pin, user.Pin);
    if (!isMatch) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '1h' }
    );

    return h.response({ token }).code(200);
  } catch (error) {
    console.error('Login Error:', error);
    return h
      .response({ message: 'Internal server error', error: error.message })
      .code(500);
  }
};

const getUserByNFC = async (request, h) => {
  try {
    const { NFCId } = request.params;

    // Get user with associated balance
    const user = await User.findOne({
      where: { NFCId },
      include: [
        {
          model: Balance,
          as: 'balance',
          attributes: ['Amount'],
        },
      ],
      attributes: ['Nama'], // Only get name
    });

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    // Format response
    return h
      .response({
        Nama: user.Nama,
        Amount: user.balance ? user.balance.Amount : 0,
      })
      .code(200);
  } catch (error) {
    console.error('NFC Lookup Error:', error);
    return h
      .response({ message: 'Internal server error', error: error.message })
      .code(500);
  }
};

const getUserData = async (request, h) => {
  try {
    const userId = request.params.id;

    // Get user with associated balance
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Balance,
          as: 'balance',
          attributes: ['Amount'],
        },
      ],
      attributes: ['id', 'NFCId', 'Nama', 'role'],
    });

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    // Return formatted response
    return h
      .response({
        Id: user.id,
        Nim: user.NFCId,
        Balance: user.balance ? user.balance.Amount : 0,
        Nama: user.Nama,
        Role: user.role,
      })
      .code(200);
  } catch (error) {
    console.error('Get User Data Error:', error);
    return h
      .response({ message: 'Internal server error', error: error.message })
      .code(500);
  }
};

module.exports = {
  register,
  loginAdmin,
  loginSiswa,
  getUserByNFC,
  getUserData,
};
