// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const Joi = require('joi');

// Helper function untuk generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role?.name,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Helper function untuk response format
const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

const authController = {
  // 1. Register Siswa
  registerSiswa: {
    method: 'POST',
    path: '/api/auth/register/siswa',
    options: {
      validate: {
        payload: Joi.object({
          NIS: Joi.string().required(),
          NISN: Joi.string().required(),
          username: Joi.string().required(),
          email: Joi.string().email().optional(),
          Nama: Joi.string().required(),
          Gen: Joi.number().integer().required(),
          password: Joi.string().min(6).required(),
          PIN: Joi.string().length(6).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { NIS, NISN, username, email, Nama, Gen, password, PIN } =
          request.payload;

        // Cek apakah username atau email sudah ada
        const existingUser = await User.findOne({
          where: {
            $or: [
              { username },
              { email: email || null },
              { NIS: NIS || null },
              { NISN: NISN || null },
            ],
          },
        });

        if (existingUser) {
          return h
            .response(
              createResponse(
                false,
                'Username, email, NIS, atau NISN sudah terdaftar'
              )
            )
            .code(409);
        }

        // Dapatkan role student
        const studentRole = await Role.findOne({ where: { name: 'student' } });
        if (!studentRole) {
          return h
            .response(createResponse(false, 'Role student tidak ditemukan'))
            .code(500);
        }

        // Buat user baru
        const newUser = await User.create({
          NIS,
          NISN,
          username,
          email,
          Nama,
          Gen,
          password,
          PIN,
          role_id: studentRole.id,
          Balance: 0,
        });

        // Ambil user dengan role untuk response
        const userWithRole = await User.findByPk(newUser.id, {
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'PIN'] },
        });

        const token = generateToken(userWithRole);

        return h
          .response(
            createResponse(true, 'Siswa berhasil didaftarkan', {
              user: userWithRole,
              token,
            })
          )
          .code(201);
      } catch (error) {
        console.error('Error in registerSiswa:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 2. Register Guru
  registerGuru: {
    method: 'POST',
    path: '/api/auth/register/guru',
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          email: Joi.string().email().optional(),
          Nama: Joi.string().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { username, email, Nama, password } = request.payload;

        // Cek apakah username atau email sudah ada
        const existingUser = await User.findOne({
          where: {
            $or: [{ username }, { email: email || null }],
          },
        });

        if (existingUser) {
          return h
            .response(
              createResponse(false, 'Username atau email sudah terdaftar')
            )
            .code(409);
        }

        // Dapatkan role teacher
        const teacherRole = await Role.findOne({ where: { name: 'teacher' } });
        if (!teacherRole) {
          return h
            .response(createResponse(false, 'Role teacher tidak ditemukan'))
            .code(500);
        }

        // Buat user baru
        const newUser = await User.create({
          username,
          email,
          Nama,
          password,
          role_id: teacherRole.id,
          Balance: 0,
        });

        // Ambil user dengan role untuk response
        const userWithRole = await User.findByPk(newUser.id, {
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] },
        });

        const token = generateToken(userWithRole);

        return h
          .response(
            createResponse(true, 'Guru berhasil didaftarkan', {
              user: userWithRole,
              token,
            })
          )
          .code(201);
      } catch (error) {
        console.error('Error in registerGuru:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 3. Login Siswa
  loginSiswa: {
    method: 'POST',
    path: '/api/auth/login/siswa',
    options: {
      validate: {
        payload: Joi.object({
          identifier: Joi.string().required(), // username, NIS, atau NISN
          password: Joi.string().optional(),
          PIN: Joi.string().optional(),
        }).or('password', 'PIN'),
      },
    },
    handler: async (request, h) => {
      try {
        const { identifier, password, PIN } = request.payload;

        // Cari user siswa berdasarkan identifier
        const user = await User.findOne({
          where: {
            $or: [
              { username: identifier },
              { NIS: identifier },
              { NISN: identifier },
            ],
          },
          include: [{ model: Role, as: 'role' }],
        });

        if (!user || user.role.name !== 'student') {
          return h
            .response(createResponse(false, 'Siswa tidak ditemukan'))
            .code(401);
        }

        if (!user.is_active) {
          return h
            .response(createResponse(false, 'Akun tidak aktif'))
            .code(401);
        }

        // Verifikasi password atau PIN
        let isValid = false;
        if (password && user.password) {
          isValid = await user.comparePassword(password);
        } else if (PIN && user.PIN) {
          isValid = PIN === user.PIN;
        }

        if (!isValid) {
          return h
            .response(createResponse(false, 'Password atau PIN tidak valid'))
            .code(401);
        }

        const token = generateToken(user);

        // Response tanpa password dan PIN
        const userResponse = { ...user.toJSON() };
        delete userResponse.password;
        delete userResponse.PIN;

        return h
          .response(
            createResponse(true, 'Login berhasil', {
              user: userResponse,
              token,
            })
          )
          .code(200);
      } catch (error) {
        console.error('Error in loginSiswa:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 4. Login Guru
  loginGuru: {
    method: 'POST',
    path: '/api/auth/login/guru',
    options: {
      validate: {
        payload: Joi.object({
          identifier: Joi.string().required(), // username atau email
          password: Joi.string().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { identifier, password } = request.payload;

        // Cari user guru berdasarkan identifier
        const user = await User.findOne({
          where: {
            $or: [{ username: identifier }, { email: identifier }],
          },
          include: [{ model: Role, as: 'role' }],
        });

        if (!user || user.role.name !== 'teacher') {
          return h
            .response(createResponse(false, 'Guru tidak ditemukan'))
            .code(401);
        }

        if (!user.is_active) {
          return h
            .response(createResponse(false, 'Akun tidak aktif'))
            .code(401);
        }

        // Verifikasi password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return h
            .response(createResponse(false, 'Password tidak valid'))
            .code(401);
        }

        const token = generateToken(user);

        // Response tanpa password
        const userResponse = { ...user.toJSON() };
        delete userResponse.password;

        return h
          .response(
            createResponse(true, 'Login berhasil', {
              user: userResponse,
              token,
            })
          )
          .code(200);
      } catch (error) {
        console.error('Error in loginGuru:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 5. Update Siswa Account
  updateSiswaAccount: {
    method: 'PUT',
    path: '/api/auth/siswa/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          NIS: Joi.string().optional(),
          NISN: Joi.string().optional(),
          username: Joi.string().optional(),
          email: Joi.string().email().optional(),
          Nama: Joi.string().optional(),
          Gen: Joi.number().integer().optional(),
          password: Joi.string().min(6).optional(),
          PIN: Joi.string().length(6).optional(),
          NFC_id: Joi.string().optional(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { NIS, NISN, username, email, Nama, Gen, password, PIN, NFC_id } =
          request.payload;

        // Cari siswa
        const user = await User.findOne({
          where: { id },
          include: [{ model: Role, as: 'role' }],
        });

        if (!user || user.role.name !== 'student') {
          return h
            .response(createResponse(false, 'Siswa tidak ditemukan'))
            .code(404);
        }

        // Cek duplikasi untuk field unique (kecuali untuk user saat ini)
        if (username || email || NIS || NISN || NFC_id) {
          const duplicateCheck = await User.findOne({
            where: {
              id: { $ne: id },
              $or: [
                username && { username },
                email && { email },
                NIS && { NIS },
                NISN && { NISN },
                NFC_id && { NFC_id },
              ].filter(Boolean),
            },
          });

          if (duplicateCheck) {
            return h
              .response(
                createResponse(
                  false,
                  'Username, email, NIS, NISN, atau NFC ID sudah digunakan'
                )
              )
              .code(409);
          }
        }

        // Update data
        const updateData = {};
        if (NIS !== undefined) updateData.NIS = NIS;
        if (NISN !== undefined) updateData.NISN = NISN;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (Nama !== undefined) updateData.Nama = Nama;
        if (Gen !== undefined) updateData.Gen = Gen;
        if (password !== undefined) updateData.password = password;
        if (PIN !== undefined) updateData.PIN = PIN;
        if (NFC_id !== undefined) updateData.NFC_id = NFC_id;

        await user.update(updateData);

        // Ambil data terbaru
        const updatedUser = await User.findByPk(id, {
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'PIN'] },
        });

        return h
          .response(
            createResponse(true, 'Data siswa berhasil diperbarui', updatedUser)
          )
          .code(200);
      } catch (error) {
        console.error('Error in updateSiswaAccount:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 6. Update Guru Account
  updateGuruAccount: {
    method: 'PUT',
    path: '/api/auth/guru/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          username: Joi.string().optional(),
          email: Joi.string().email().optional(),
          Nama: Joi.string().optional(),
          password: Joi.string().min(6).optional(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { username, email, Nama, password } = request.payload;

        // Cari guru
        const user = await User.findOne({
          where: { id },
          include: [{ model: Role, as: 'role' }],
        });

        if (!user || user.role.name !== 'teacher') {
          return h
            .response(createResponse(false, 'Guru tidak ditemukan'))
            .code(404);
        }

        // Cek duplikasi untuk field unique (kecuali untuk user saat ini)
        if (username || email) {
          const duplicateCheck = await User.findOne({
            where: {
              id: { $ne: id },
              $or: [username && { username }, email && { email }].filter(
                Boolean
              ),
            },
          });

          if (duplicateCheck) {
            return h
              .response(
                createResponse(false, 'Username atau email sudah digunakan')
              )
              .code(409);
          }
        }

        // Update data
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (Nama !== undefined) updateData.Nama = Nama;
        if (password !== undefined) updateData.password = password;

        await user.update(updateData);

        // Ambil data terbaru
        const updatedUser = await User.findByPk(id, {
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] },
        });

        return h
          .response(
            createResponse(true, 'Data guru berhasil diperbarui', updatedUser)
          )
          .code(200);
      } catch (error) {
        console.error('Error in updateGuruAccount:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 7. Get Guru By ID
  getGuruById: {
    method: 'GET',
    path: '/api/auth/guru/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;

        const guru = await User.findOne({
          where: { id },
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] },
        });

        if (!guru || guru.role.name !== 'teacher') {
          return h
            .response(createResponse(false, 'Guru tidak ditemukan'))
            .code(404);
        }

        return h
          .response(createResponse(true, 'Data guru berhasil diambil', guru))
          .code(200);
      } catch (error) {
        console.error('Error in getGuruById:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 8. Get All Guru
  getAllGuru: {
    method: 'GET',
    path: '/api/auth/guru',
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow('').default(''),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { page, limit, search } = request.query;
        const offset = (page - 1) * limit;

        // Dapatkan role teacher
        const teacherRole = await Role.findOne({ where: { name: 'teacher' } });
        if (!teacherRole) {
          return h
            .response(createResponse(false, 'Role teacher tidak ditemukan'))
            .code(500);
        }

        const whereClause = {
          role_id: teacherRole.id,
        };

        // Tambahkan pencarian jika ada
        if (search) {
          whereClause.$or = [
            { Nama: { $iLike: `%${search}%` } },
            { username: { $iLike: `%${search}%` } },
            { email: { $iLike: `%${search}%` } },
          ];
        }

        const { count, rows } = await User.findAndCountAll({
          where: whereClause,
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] },
          limit,
          offset,
          order: [['createdAt', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        return h
          .response(
            createResponse(true, 'Data guru berhasil diambil', {
              guru: rows,
              pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit,
              },
            })
          )
          .code(200);
      } catch (error) {
        console.error('Error in getAllGuru:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 9. Get Siswa By ID
  getSiswaById: {
    method: 'GET',
    path: '/api/auth/siswa/{id}',
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;

        const siswa = await User.findOne({
          where: { id },
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'PIN'] },
        });

        if (!siswa || siswa.role.name !== 'student') {
          return h
            .response(createResponse(false, 'Siswa tidak ditemukan'))
            .code(404);
        }

        return h
          .response(createResponse(true, 'Data siswa berhasil diambil', siswa))
          .code(200);
      } catch (error) {
        console.error('Error in getSiswaById:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },

  // 10. Get All Siswa
  getAllSiswa: {
    method: 'GET',
    path: '/api/auth/siswa',
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow('').default(''),
          gen: Joi.number().integer().optional(),
        }),
      },
    },
    handler: async (request, h) => {
      try {
        const { page, limit, search, gen } = request.query;
        const offset = (page - 1) * limit;

        // Dapatkan role student
        const studentRole = await Role.findOne({ where: { name: 'student' } });
        if (!studentRole) {
          return h
            .response(createResponse(false, 'Role student tidak ditemukan'))
            .code(500);
        }

        const whereClause = {
          role_id: studentRole.id,
        };

        // Filter berdasarkan generasi jika ada
        if (gen) {
          whereClause.Gen = gen;
        }

        // Tambahkan pencarian jika ada
        if (search) {
          whereClause.$or = [
            { Nama: { $iLike: `%${search}%` } },
            { username: { $iLike: `%${search}%` } },
            { NIS: { $iLike: `%${search}%` } },
            { NISN: { $iLike: `%${search}%` } },
          ];
        }

        const { count, rows } = await User.findAndCountAll({
          where: whereClause,
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'PIN'] },
          limit,
          offset,
          order: [['createdAt', 'DESC']],
        });

        const totalPages = Math.ceil(count / limit);

        return h
          .response(
            createResponse(true, 'Data siswa berhasil diambil', {
              siswa: rows,
              pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit,
              },
            })
          )
          .code(200);
      } catch (error) {
        console.error('Error in getAllSiswa:', error);
        return h
          .response(
            createResponse(false, 'Terjadi kesalahan server', error.message)
          )
          .code(500);
      }
    },
  },
};

module.exports = authController;
