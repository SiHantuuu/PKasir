"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Roles", [
      { name: "admin", createdAt: new Date(), updatedAt: new Date() },
      { name: "student", createdAt: new Date(), updatedAt: new Date() },
      { name: "teacher", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
