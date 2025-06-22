"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash("password123", 10);
    const now = new Date();

    return queryInterface.bulkInsert("Users", [
      {
        NIS: "12345",
        NISN: "67890",
        username: "admin_user",
        email: "admin@example.com",
        Nama: "Admin User",
        password: password,
        Balance: 1000000,
        role_id: 1,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        NIS: "54321",
        NISN: "09876",
        username: "student_user",
        email: "student@example.com",
        Nama: "Student User",
        password: password,
        Balance: 50000,
        role_id: 2,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        NIS: "11223",
        NISN: "44556",
        username: "teacher_user",
        email: "teacher@example.com",
        Nama: "Teacher User",
        password: password,
        Balance: 75000,
        role_id: 3,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
