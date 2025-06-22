// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan, akses ditolak',
      });
    }

    // Periksa format token (Bearer <token>)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format token tidak valid',
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Ambil user dari database untuk memastikan user masih ada dan aktif
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid, user tidak ditemukan',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif',
      });
    }

    // Simpan informasi user ke req.user untuk digunakan di controller
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role?.name,
      roleId: user.role_id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
    });
  }
};

// Middleware untuk memverifikasi role tertentu
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak terautentikasi',
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak, role tidak sesuai',
      });
    }

    next();
  };
};

// Middleware khusus untuk siswa
const requireStudent = requireRole('student');

// Middleware khusus untuk guru
const requireTeacher = requireRole('teacher');

// Middleware untuk admin (jika ada)
const requireAdmin = requireRole('admin');

// Middleware untuk guru atau admin
const requireTeacherOrAdmin = requireRole(['teacher', 'admin']);

module.exports = {
  auth,
  requireRole,
  requireStudent,
  requireTeacher,
  requireAdmin,
  requireTeacherOrAdmin,
};
