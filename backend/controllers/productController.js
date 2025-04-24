const { Product, Category } = require('../models'); // Perbaikan nama model
const { Op } = require('sequelize'); // Tambahkan import untuk operator

const getAllProducts = async (request, h) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }],
    });
    return h.response(products).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to fetch products' }).code(500);
  }
};

const getProductById = async (request, h) => {
  const { id } = request.params;
  try {
    const product = await Product.findByPk(id, {
      include: [{ model: Category }],
    });
    if (!product) return h.response({ message: 'Product not found' }).code(404);
    return h.response(product).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to fetch product' }).code(500);
  }
};

const updateProductById = async (request, h) => {
  const { id } = request.params;
  const { productName, price, categoryId } = request.payload;

  try {
    const product = await Product.findByPk(id);
    if (!product) return h.response({ message: 'Product not found' }).code(404);

    await product.update({
      ProductName: productName,
      Price: price,
      CategoryId: categoryId,
    });

    return h
      .response({ message: 'Product updated successfully', product })
      .code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to update product' }).code(500);
  }
};

const deleteProductById = async (request, h) => {
  const { id } = request.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return h.response({ message: 'Product not found' }).code(404);

    await product.destroy();
    return h.response({ message: 'Product deleted successfully' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to delete product' }).code(500);
  }
};

const getProductsByCategory = async (request, h) => {
  const { categoryId } = request.params;
  try {
    const products = await Product.findAll({
      where: { CategoryId: categoryId },
      include: [{ model: Category }],
    });
    return h.response(products).code(200);
  } catch (error) {
    console.error(error);
    return h
      .response({ error: 'Failed to fetch products by category' })
      .code(500);
  }
};

const createProduct = async (request, h) => {
  const { productName, price, categoryId } = request.payload;
  try {
    const product = await Product.create({
      ProductName: productName,
      Price: price,
      CategoryId: categoryId,
    });
    return h
      .response({
        message: 'Product created successfully',
        product,
      })
      .code(201);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to create product' }).code(500);
  }
};

const getProductByName = async (request, h) => {
  const { name } = request.params;
  try {
    const products = await Product.findAll({
      where: {
        ProductName: {
          [Op.like]: `%${name}%`,
        },
      },
      include: [{ model: Category }],
    });
    return h.response(products).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: 'Failed to fetch products by name' }).code(500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getProductsByCategory,
  createProduct,
  getProductByName,
};
