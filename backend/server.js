require('dotenv').config(); // Load environment variables dari .env
const Hapi = require('@hapi/hapi');
const Sequelize = require('sequelize');
const Jwt = require('@hapi/jwt');

const routes = require('./routes');

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
        origin: [
          'http://localhost:3000', // Next.js frontend
          'http://127.0.0.1:3000',
          'http://localhost:3001', // Backend itself (if needed)
        ],
        // Headers yang diizinkan untuk CORS
        headers: [
          'Accept',
          'Content-Type',
          'Authorization', // Penting untuk JWT
          'X-Requested-With',
        ],
        credentials: true,
        // Tambahkan maxAge untuk preflight cache
        maxAge: 86400, // 24 hours
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

  // Middleware untuk handle CORS secara manual
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    // Jika ini adalah preflight request (OPTIONS)
    if (request.method === 'options') {
      const corsResponse = h
        .response()
        .code(200)
        .header(
          'Access-Control-Allow-Origin',
          request.headers.origin || 'http://localhost:3000'
        )
        .header(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        )
        .header(
          'Access-Control-Allow-Headers',
          'Accept, Content-Type, Authorization, X-Requested-With'
        )
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Max-Age', '86400');

      return corsResponse;
    }

    // Untuk response biasa, pastikan CORS headers ada
    if (response.isBoom) {
      response.output.headers['Access-Control-Allow-Origin'] =
        request.headers.origin || 'http://localhost:3000';
      response.output.headers['Access-Control-Allow-Credentials'] = 'true';
      response.output.headers['Access-Control-Allow-Methods'] =
        'GET, POST, PUT, DELETE, OPTIONS';
      response.output.headers['Access-Control-Allow-Headers'] =
        'Accept, Content-Type, Authorization, X-Requested-With';
    } else if (response.header) {
      response.header(
        'Access-Control-Allow-Origin',
        request.headers.origin || 'http://localhost:3000'
      );
      response.header('Access-Control-Allow-Credentials', 'true');
      response.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.header(
        'Access-Control-Allow-Headers',
        'Accept, Content-Type, Authorization, X-Requested-With'
      );
    }

    return h.continue;
  });

  // Daftarkan routes
  server.route(routes);

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
