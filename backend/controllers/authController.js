// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { Op } = require('sequelize');

// Helper function to generate JWT token
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

// Helper function for response format
const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

const authController = {
  // 1. Register Student
  registerSiswa: async (request, h) => {
    try {
      const { NIS, NISN, username, email, Nama, Gen, password, PIN } =
        request.payload;

      // Check if username, email, NIS or NISN already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
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
              'Username, email, NIS, or NISN already registered'
            )
          )
          .code(409);
      }

      // Get student role
      const studentRole = await Role.findOne({ where: { name: 'student' } });
      if (!studentRole) {
        return h
          .response(createResponse(false, 'Student role not found'))
          .code(500);
      }

      // Create new user
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
        is_active: true,
      });

      // Get user with role for response
      const userWithRole = await User.findByPk(newUser.id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password', 'PIN'] },
      });

      const token = generateToken(userWithRole);

      return h
        .response(
          createResponse(true, 'Student registered successfully', {
            user: userWithRole,
            token,
          })
        )
        .code(201);
    } catch (error) {
      console.error('Error in registerSiswa:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 2. Register Teacher
  registerGuru: async (request, h) => {
    try {
      const { username, email, Nama, password } = request.payload;

      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: email || null }],
        },
      });

      if (existingUser) {
        return h
          .response(
            createResponse(false, 'Username or email already registered')
          )
          .code(409);
      }

      // Get teacher role
      const teacherRole = await Role.findOne({ where: { name: 'teacher' } });
      if (!teacherRole) {
        return h
          .response(createResponse(false, 'Teacher role not found'))
          .code(500);
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        Nama,
        password,
        role_id: teacherRole.id,
        is_active: true,
      });

      // Get user with role for response
      const userWithRole = await User.findByPk(newUser.id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password'] },
      });

      const token = generateToken(userWithRole);

      return h
        .response(
          createResponse(true, 'Teacher registered successfully', {
            user: userWithRole,
            token,
          })
        )
        .code(201);
    } catch (error) {
      console.error('Error in registerGuru:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 3. Student Login
  loginSiswa: async (request, h) => {
    try {
      const { identifier, password, PIN } = request.payload;

      // Find student user by identifier (username, NIS, or NISN)
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username: identifier },
            { NIS: identifier },
            { NISN: identifier },
          ],
        },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user || user.role.name !== 'student') {
        return h.response(createResponse(false, 'Student not found')).code(401);
      }

      if (!user.is_active) {
        return h
          .response(createResponse(false, 'Account is inactive'))
          .code(401);
      }

      // Verify password or PIN
      let isValid = false;
      if (password && user.password) {
        isValid = await bcrypt.compare(password, user.password);
      } else if (PIN && user.PIN) {
        isValid = PIN === user.PIN;
      }

      if (!isValid) {
        return h
          .response(createResponse(false, 'Invalid password or PIN'))
          .code(401);
      }

      const token = generateToken(user);

      // Prepare response without sensitive data
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;
      delete userResponse.PIN;

      return h
        .response(
          createResponse(true, 'Login successful', {
            user: userResponse,
            token,
          })
        )
        .code(200);
    } catch (error) {
      console.error('Error in loginSiswa:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 4. Teacher Login
  loginGuru: async (request, h) => {
    try {
      const { identifier, password } = request.payload;

      // Find teacher user by identifier (username or email)
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user || user.role.name !== 'teacher') {
        return h.response(createResponse(false, 'Teacher not found')).code(401);
      }

      if (!user.is_active) {
        return h
          .response(createResponse(false, 'Account is inactive'))
          .code(401);
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return h.response(createResponse(false, 'Invalid password')).code(401);
      }

      const token = generateToken(user);

      // Prepare response without sensitive data
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      return h
        .response(
          createResponse(true, 'Login successful', {
            user: userResponse,
            token,
          })
        )
        .code(200);
    } catch (error) {
      console.error('Error in loginGuru:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 5. Update Student Account
  updateSiswaAccount: async (request, h) => {
    try {
      const { id } = request.params;
      const { NIS, NISN, username, email, Nama, Gen, password, PIN, NFC_id } =
        request.payload;

      // Find student
      const user = await User.findOne({
        where: { id },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user || user.role.name !== 'student') {
        return h.response(createResponse(false, 'Student not found')).code(404);
      }

      // Check for duplicate unique fields (excluding current user)
      if (username || email || NIS || NISN || NFC_id) {
        const duplicateCheck = await User.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: [
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
                'Username, email, NIS, NISN, or NFC ID already in use'
              )
            )
            .code(409);
        }
      }

      // Prepare update data
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

      // Get updated user data
      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password', 'PIN'] },
      });

      return h
        .response(
          createResponse(
            true,
            'Student account updated successfully',
            updatedUser
          )
        )
        .code(200);
    } catch (error) {
      console.error('Error in updateSiswaAccount:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 6. Update Teacher Account
  updateGuruAccount: async (request, h) => {
    try {
      const { id } = request.params;
      const { username, email, Nama, password } = request.payload;

      // Find teacher
      const user = await User.findOne({
        where: { id },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user || user.role.name !== 'teacher') {
        return h.response(createResponse(false, 'Teacher not found')).code(404);
      }

      // Check for duplicate unique fields (excluding current user)
      if (username || email) {
        const duplicateCheck = await User.findOne({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: [username && { username }, email && { email }].filter(
              Boolean
            ),
          },
        });

        if (duplicateCheck) {
          return h
            .response(createResponse(false, 'Username or email already in use'))
            .code(409);
        }
      }

      // Prepare update data
      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (Nama !== undefined) updateData.Nama = Nama;
      if (password !== undefined) updateData.password = password;

      await user.update(updateData);

      // Get updated user data
      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password'] },
      });

      return h
        .response(
          createResponse(
            true,
            'Teacher account updated successfully',
            updatedUser
          )
        )
        .code(200);
    } catch (error) {
      console.error('Error in updateGuruAccount:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 7. Get Teacher By ID
  getGuruById: async (request, h) => {
    try {
      const { id } = request.params;

      const teacher = await User.findOne({
        where: { id },
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password'] },
      });

      if (!teacher || teacher.role.name !== 'teacher') {
        return h.response(createResponse(false, 'Teacher not found')).code(404);
      }

      return h
        .response(
          createResponse(true, 'Teacher data retrieved successfully', teacher)
        )
        .code(200);
    } catch (error) {
      console.error('Error in getGuruById:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 8. Get All Teachers
  getAllGuru: async (request, h) => {
    try {
      const { page = 1, limit = 10, search = '' } = request.query;
      const offset = (page - 1) * limit;

      // Get teacher role
      const teacherRole = await Role.findOne({ where: { name: 'teacher' } });
      if (!teacherRole) {
        return h
          .response(createResponse(false, 'Teacher role not found'))
          .code(500);
      }

      const whereClause = {
        role_id: teacherRole.id,
      };

      // Add search filter if provided
      if (search) {
        whereClause[Op.or] = [
          { Nama: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
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
          createResponse(true, 'Teachers data retrieved successfully', {
            teachers: rows,
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
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 9. Get Student By ID
  getSiswaById: async (request, h) => {
    try {
      const { id } = request.params;

      const student = await User.findOne({
        where: { id },
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password', 'PIN'] },
      });

      if (!student || student.role.name !== 'student') {
        return h.response(createResponse(false, 'Student not found')).code(404);
      }

      return h
        .response(
          createResponse(true, 'Student data retrieved successfully', student)
        )
        .code(200);
    } catch (error) {
      console.error('Error in getSiswaById:', error);
      return h
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },

  // 10. Get All Students
  getAllSiswa: async (request, h) => {
    try {
      const { page = 1, limit = 10, search = '', gen } = request.query;
      const offset = (page - 1) * limit;

      // Get student role
      const studentRole = await Role.findOne({ where: { name: 'student' } });
      if (!studentRole) {
        return h
          .response(createResponse(false, 'Student role not found'))
          .code(500);
      }

      const whereClause = {
        role_id: studentRole.id,
      };

      // Filter by generation if provided
      if (gen) {
        whereClause.Gen = gen;
      }

      // Add search filter if provided
      if (search) {
        whereClause[Op.or] = [
          { Nama: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
          { NIS: { [Op.iLike]: `%${search}%` } },
          { NISN: { [Op.iLike]: `%${search}%` } },
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
          createResponse(true, 'Students data retrieved successfully', {
            students: rows,
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
        .response(createResponse(false, 'Server error occurred', error.message))
        .code(500);
    }
  },
};

module.exports = authController;
