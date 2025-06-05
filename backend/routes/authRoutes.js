const { authController } = require("../controllers/authController");
const Joi = require("joi");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register/siswa",
    handler: authController.registerSiswa,
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
  },
  {
    method: "POST",
    path: "/auth/register/guru",
    handler: authController.registerGuru,
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
  },
  {
    method: "POST",
    path: "/auth/login/siswa",
    handler: authController.loginSiswa,
    options: {
      validate: {
        payload: Joi.object({
          identifier: Joi.string().required(),
          password: Joi.string().optional(),
          PIN: Joi.string().optional(),
        }).or("password", "PIN"),
      },
    },
  },
  {
    method: "POST",
    path: "/auth/login/guru",
    handler: authController.loginGuru,
    options: {
      validate: {
        payload: Joi.object({
          identifier: Joi.string().required(),
          password: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/auth/siswa/{id}",
    handler: authController.updateSiswaAccount,
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
  },
  {
    method: "PUT",
    path: "/auth/guru/{id}",
    handler: authController.updateGuruAccount,
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
  },
  {
    method: "GET",
    path: "/auth/guru/{id}",
    handler: authController.getGuruById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/auth/guru",
    handler: authController.getAllGuru,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow("").default(""),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/auth/siswa/{id}",
    handler: authController.getSiswaById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/auth/siswa",
    handler: authController.getAllSiswa,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
          search: Joi.string().allow("").default(""),
          gen: Joi.number().integer().optional(),
        }),
      },
    },
  },
];

module.exports = authRoutes;
