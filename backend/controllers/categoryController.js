const { Category, Product } = require('../models');

const getAllCategories = async (request, h) => {
  try {
    const categories = await Category.findAll();
    return h.response(categories).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to fetch categories' }).code(500);
  }
};

const getCategoryById = async (request, h) => {
  const { id } = request.params;
  try {
    const category = await Category.findByPk(id, {
      include: [{ model: Product }],
    });
    if (!category)
      return h.response({ message: 'Category not found' }).code(404);
    return h.response(category).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to fetch category' }).code(500);
  }
};

const createCategory = async (request, h) => {
  const { name } = request.payload;
  try {
    const category = await Category.create({ name });
    return h
      .response({
        message: 'Category created successfully',
        category,
      })
      .code(201);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to create category' }).code(500);
  }
};

const updateCategoryById = async (request, h) => {
  const { id } = request.params;
  const { name } = request.payload;

  try {
    const category = await Category.findByPk(id);
    if (!category)
      return h.response({ message: 'Category not found' }).code(404);

    await category.update({ name });
    return h
      .response({
        message: 'Category updated successfully',
        category,
      })
      .code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to update category' }).code(500);
  }
};

const deleteCategoryById = async (request, h) => {
  const { id } = request.params;
  try {
    const category = await Category.findByPk(id);
    if (!category)
      return h.response({ message: 'Category not found' }).code(404);

    await category.destroy();
    return h.response({ message: 'Category deleted successfully' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to delete category' }).code(500);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
