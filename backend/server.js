require('dotenv').config(); // Load environment variables dari .env
const Hapi = require('@hapi/hapi');
const Sequelize = require('sequelize');
const Jwt = require('@hapi/jwt');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categorytRoutes = require('./routes/categoryRoutes');
const topupRoutes = require('./routes/topupRoutes');
const transcationtRoutes = require('./routes/historyRoutes');

// Ambil konfigurasi database
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('./config/config.json')[env];

const init = async () => {
  // Inisialisasi koneksi database
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: console.log, // Tampilkan query SQL di konsol (opsional)
    }
  );

  // Tes koneksi database
  try {
    await sequelize.authenticate();
    console.log(`✅ Berhasil terhubung ke database: ${dbConfig.database}`);
  } catch (error) {
    console.error('❌ Koneksi database gagal:', error);
    process.exit(1); // Hentikan aplikasi jika koneksi gagal
  }

  // Simpan instance sequelize agar bisa digunakan di seluruh aplikasi
  global.sequelize = sequelize;

  // Inisialisasi server Hapi
  const server = Hapi.server({
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Content-Type'],
        credentials: true,
      },
    },
  });

  // Register JWT plugin
  await server.register(Jwt);

  // Set up JWT authentication strategy
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET || 'default_secret_key',
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400,
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: { user: artifacts.decoded.payload },
      };
    },
  });

  // Daftarkan routes
  server.route(authRoutes);
  server.route(productRoutes);
  server.route(categorytRoutes);
  server.route(topupRoutes);
  server.route(transcationtRoutes);

  // Jalankan server
  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
};

// Tangani error global
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

init();
