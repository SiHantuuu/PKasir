const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Pakai Sequelize Model
require("dotenv").config();

const register = async (request, h) => {
    try {
        let { Nama, NFCId, Pin, Password, Amount, role } = request.payload;
        role = role || "murid"; // Default ke "murid" jika tidak ada

        if (role === "admin") {
            if (!Password) {
                return h.response({ message: "Admin harus memasukkan password" }).code(400);
            }
            Password = await bcrypt.hash(Password, 10);
            Pin = null; // Admin tidak boleh punya PIN
        } else if (role === "murid") {
            if (!Pin || !/^\d{6}$/.test(Pin)) {
                return h.response({ message: "Murid harus memiliki PIN 6 angka" }).code(400);
            }
            Pin = await bcrypt.hash(Pin, 10);
            Password = null; // Murid tidak boleh punya Password
        } else {
            return h.response({ message: "Role tidak valid" }).code(400);
        }

        // Simpan ke database pakai Sequelize
        const user = await User.create({
            Nama,
            NFCId,
            Pin,
            Password,
            Amount: Amount || 0,
            role,
        });

        return h.response({ message: "User registered successfully", user }).code(201);

    } catch (error) {
        console.error("Register Error:", error);
        return h.response({ message: "Internal server error", error }).code(500);
    }
};

const loginAdmin = async (request, h) => {
    try {
        const { Nama, Password } = request.payload;

        const user = await User.findOne({ where: { Nama, role: "admin" } });
        if (!user) {
            return h.response({ message: "Admin not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return h.response({ message: "Invalid credentials" }).code(401);
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "1h" }
        );

        return h.response({ token }).code(200);

    } catch (error) {
        console.error("Login Error:", error);
        return h.response({ message: "Internal server error" }).code(500);
    }
};

const loginSiswa = async (request, h) => {
    try {
        const { Nama, Pin } = request.payload;

        const user = await User.findOne({ where: { Nama, role: "murid" } });
        if (!user) {
            return h.response({ message: "Murid not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(Pin, user.Pin);
        if (!isMatch) {
            return h.response({ message: "Invalid credentials" }).code(401);
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "1h" }
        );

        return h.response({ token }).code(200);

    } catch (error) {
        console.error("Login Error:", error);
        return h.response({ message: "Internal server error" }).code(500);
    }
};

const getUserByNFC = async (request, h) => {
    try {
        const { NFCId } = request.params; // Ambil NFCId dari URL

        // Cari user berdasarkan NFCId
        const user = await User.findOne({ 
            where: { NFCId },
            attributes: ['nama', 'amount'] // Ambil hanya nama dan amount
        });

        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        return h.response(user).code(200);
    } catch (error) {
        console.error("NFC Lookup Error:", error);
        return h.response({ message: "Internal server error" }).code(500);
    }
};


module.exports = { register, loginAdmin, loginSiswa, getUserByNFC };   
