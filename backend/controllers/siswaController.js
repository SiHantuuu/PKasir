// controllers/siswaController.js
const { User, Role } = require("../models");
const { Op } = require("sequelize");

const siswaController = {
  // 1. Get all students
  getAllSiswa: async (request, h) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        status = "all",
      } = request.query;

      const offset = (page - 1) * parseInt(limit);
      const whereClause = {};

      // Filter by active status
      if (status === "active") {
        whereClause.is_active = true;
      } else if (status === "inactive") {
        whereClause.is_active = false;
      }

      // Get students with role filtering
      const { count, rows: siswa } = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "NIS",
          "NISN",
          "username",
          "email",
          "Nama",
          "Gen",
          "NFC_id",
          "Balance",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: "Data siswa berhasil diambil",
          data: {
            siswa,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error getting all siswa:", error);
      return h
        .response({
          success: false,
          message: "Gagal mengambil data siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },

  // 2. Get student by ID
  getSiswaById: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return h
          .response({
            success: false,
            message: "ID siswa tidak valid",
          })
          .code(400);
      }

      const siswa = await User.findOne({
        where: { id: parseInt(id) },
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "NIS",
          "NISN",
          "username",
          "email",
          "Nama",
          "Gen",
          "NFC_id",
          "Balance",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!siswa) {
        return h
          .response({
            success: false,
            message: "Data siswa tidak ditemukan",
          })
          .code(404);
      }

      return h
        .response({
          success: true,
          message: "Data siswa berhasil diambil",
          data: siswa,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting siswa by ID:", error);
      return h
        .response({
          success: false,
          message: "Gagal mengambil data siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },

  // 3. Search students - FIXED for MySQL
  searchSiswa: async (request, h) => {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = request.query;

      if (!query || query.trim().length === 0) {
        return h
          .response({
            success: false,
            message: "Query pencarian tidak boleh kosong",
          })
          .code(400);
      }

      const searchQuery = query.trim();
      const offset = (page - 1) * parseInt(limit);

      // FIXED: Changed Op.iLike to Op.like for MySQL compatibility
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              { Nama: { [Op.like]: `%${searchQuery}%` } },
              { NIS: { [Op.like]: `%${searchQuery}%` } },
              { NISN: { [Op.like]: `%${searchQuery}%` } },
              { username: { [Op.like]: `%${searchQuery}%` } },
            ],
          },
        ],
      };

      const { count, rows: siswa } = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "NIS",
          "NISN",
          "username",
          "email",
          "Nama",
          "Gen",
          "NFC_id",
          "Balance",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      return h
        .response({
          success: true,
          message: `Ditemukan ${count} siswa dengan pencarian "${searchQuery}"`,
          data: {
            siswa,
            searchQuery,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalItems: count,
              itemsPerPage: parseInt(limit),
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error searching siswa:", error);
      return h
        .response({
          success: false,
          message: "Gagal melakukan pencarian siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },

  // 4. Deactivate student
  deactivateSiswa: async (request, h) => {
    try {
      const { id } = request.params;
      const { reason } = request.payload;

      if (!id || isNaN(parseInt(id))) {
        return h
          .response({
            success: false,
            message: "ID siswa tidak valid",
          })
          .code(400);
      }

      const siswa = await User.findOne({
        where: { id: parseInt(id) },
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
          },
        ],
      });

      if (!siswa) {
        return h
          .response({
            success: false,
            message: "Data siswa tidak ditemukan",
          })
          .code(404);
      }

      if (!siswa.is_active) {
        return h
          .response({
            success: false,
            message: "Siswa sudah dalam status non-aktif",
          })
          .code(400);
      }

      await siswa.update({
        is_active: false,
      });

      return h
        .response({
          success: true,
          message: "Siswa berhasil dinonaktifkan",
          data: {
            id: siswa.id,
            nama: siswa.Nama,
            nis: siswa.NIS,
            nisn: siswa.NISN,
            is_active: siswa.is_active,
            reason: reason || null,
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error deactivating siswa:", error);
      return h
        .response({
          success: false,
          message: "Gagal menonaktifkan siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },

  // 5. Activate student
  activateSiswa: async (request, h) => {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return h
          .response({
            success: false,
            message: "ID siswa tidak valid",
          })
          .code(400);
      }

      const siswa = await User.findOne({
        where: { id: parseInt(id) },
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
          },
        ],
      });

      if (!siswa) {
        return h
          .response({
            success: false,
            message: "Data siswa tidak ditemukan",
          })
          .code(404);
      }

      if (siswa.is_active) {
        return h
          .response({
            success: false,
            message: "Siswa sudah dalam status aktif",
          })
          .code(400);
      }

      await siswa.update({
        is_active: true,
      });

      return h
        .response({
          success: true,
          message: "Siswa berhasil diaktifkan kembali",
          data: {
            id: siswa.id,
            nama: siswa.Nama,
            nis: siswa.NIS,
            nisn: siswa.NISN,
            is_active: siswa.is_active,
          },
        })
        .code(200);
    } catch (error) {
      console.error("Error activating siswa:", error);
      return h
        .response({
          success: false,
          message: "Gagal mengaktifkan siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },

  // 6. Update student data
  updateSiswa: async (request, h) => {
    try {
      const { id } = request.params;
      const updateData = request.payload;

      if (!id || isNaN(parseInt(id))) {
        return h
          .response({
            success: false,
            message: "ID siswa tidak valid",
          })
          .code(400);
      }

      // Allowed fields to update
      const allowedFields = [
        "NIS",
        "NISN",
        "username",
        "email",
        "Nama",
        "Gen",
        "NFC_id",
      ];
      const filteredData = {};

      // Filter only allowed fields
      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        return h
          .response({
            success: false,
            message: "Tidak ada data yang valid untuk diupdate",
          })
          .code(400);
      }

      const siswa = await User.findOne({
        where: { id: parseInt(id) },
        include: [
          {
            model: Role,
            as: "role",
            where: { name: "student" },
          },
        ],
      });

      if (!siswa) {
        return h
          .response({
            success: false,
            message: "Data siswa tidak ditemukan",
          })
          .code(404);
      }

      await siswa.update(filteredData);

      const updatedSiswa = await User.findOne({
        where: { id: parseInt(id) },
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "NIS",
          "NISN",
          "username",
          "email",
          "Nama",
          "Gen",
          "NFC_id",
          "Balance",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
      });

      return h
        .response({
          success: true,
          message: "Data siswa berhasil diupdate",
          data: updatedSiswa,
        })
        .code(200);
    } catch (error) {
      console.error("Error updating siswa:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        const field = error.errors[0].path;
        return h
          .response({
            success: false,
            message: `${field} sudah digunakan oleh siswa lain`,
          })
          .code(400);
      }

      return h
        .response({
          success: false,
          message: "Gagal mengupdate data siswa",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
        })
        .code(500);
    }
  },
};

module.exports = siswaController;