const categoryController = require('../controllers/categoryController');

const categoryRoutes = [
  {
    method: 'GET',
    path: '/categories',
    handler: categoryController.getAllCategories,
  },
  {
    method: 'GET',
    path: '/categories/{id}',
    handler: categoryController.getCategoryById,
  },
  {
    method: 'POST',
    path: '/categories',
    handler: categoryController.createCategory,
  },
  {
    method: 'PUT',
    path: '/categories/{id}',
    handler: categoryController.updateCategoryById,
  },
  {
    method: 'DELETE',
    path: '/categories/{id}',
    handler: categoryController.deleteCategoryById,
  },
];

module.exports = categoryRoutes;
