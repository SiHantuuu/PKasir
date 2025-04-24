'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin and sample users
    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          Nama: 'Admin User',
          NFCId: 'ADMIN001',
          Pin: bcrypt.hashSync('1234', 10),
          Password: bcrypt.hashSync('adminpass', 10),
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Nama: 'Budi Santoso',
          NFCId: 'NFC00001',
          Pin: bcrypt.hashSync('1234', 10),
          Password: bcrypt.hashSync('password123', 10),
          role: 'murid',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Nama: 'Ani Wijaya',
          NFCId: 'NFC00002',
          Pin: bcrypt.hashSync('5678', 10),
          Password: bcrypt.hashSync('password456', 10),
          role: 'murid',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Nama: 'Deni Pratama',
          NFCId: 'NFC00003',
          Pin: bcrypt.hashSync('9012', 10),
          Password: bcrypt.hashSync('password789', 10),
          role: 'murid',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Nama: 'Siti Rahayu',
          NFCId: 'NFC00004',
          Pin: bcrypt.hashSync('3456', 10),
          Password: bcrypt.hashSync('passwordabc', 10),
          role: 'murid',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    return users;
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded users
    return queryInterface.bulkDelete('users', null, {});
  },
};
