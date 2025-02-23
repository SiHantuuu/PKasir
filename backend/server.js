require("dotenv").config(); // Load environment variables dari .env
const Hapi = require("@hapi/hapi");
const authRoutes = require("./routes/authRoutes");

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3001, // Bisa diubah lewat .env
        host: process.env.HOST || "localhost",
        routes: {
            cors: {
                origin: ["*"], // Aktifkan CORS untuk akses dari frontend
                headers: ["Accept", "Content-Type"],
                credentials: true,
            },
        },
    });

    // Daftarkan routes
    server.route(authRoutes);

    // Jalankan server
    await server.start();
    console.log(`✅ Server running on ${server.info.uri}`);
};

// Tangani error global
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    process.exit(1);
});

init();
