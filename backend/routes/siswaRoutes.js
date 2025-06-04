const { siswaController } = require("../controllers/siswaController");
const Joi = require("joi");

const siswaRoutes = [
  {
    method: "GET",
    path: "/siswa",
    handler: siswaController.getAllSiswa,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).default(10),
          sortBy: Joi.string().default("createdAt"),
          sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
          status: Joi.string()
            .valid("all", "active", "inactive")
            .default("all"),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/siswa/{id}",
    handler: siswaController.getSiswaById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/siswa/search",
    handler: siswaController.searchSiswa,
    options: {
      validate: {
        query: Joi.object({
          query: Joi.string().required(),
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).default(10),
          sortBy: Joi.string().default("createdAt"),
          sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/siswa/{id}/deactivate",
    handler: siswaController.deactivateSiswa,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          reason: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/siswa/{id}/activate",
    handler: siswaController.activateSiswa,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/siswa/{id}",
    handler: siswaController.updateSiswa,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          NIS: Joi.string().optional(),
          NISN: Joi.string().optional(),
          username: Joi.string().optional(),
          email: Joi.string().email().optional(),
          Nama: Joi.string().optional(),
          Gen: Joi.number().integer().optional(),
          NFC_id: Joi.string().optional(),
        }),
      },
    },
  },
];

module.exports = siswaRoutes;
