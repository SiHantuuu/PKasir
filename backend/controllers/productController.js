require("dotenv").config();
const mysql = require("mysql2/promise");
const getAllProducts = async (request, h) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM Products");
      return h.response(rows).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch products" }).code(500);
    }
  };
  const getProductById = async (request, h) => {
  const { id } = request.params;
  try {
    const [rows] = await pool.execute("SELECT * FROM Products WHERE ProductId = ?", [id]);
    if (rows.length === 0) return h.response({ message: "Product not found" }).code(404);
    return h.response(rows[0]).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: "Failed to fetch product" }).code(500);
  }
};

const updateProductById = async (request, h) => {
    const { id } = request.params;
    const { productName, price, category } = request.payload;
  
    try {
      const [result] = await pool.execute(
        "UPDATE Products SET ProductName = ?, Price = ?, Category = ? WHERE ProductId = ?",
        [productName, price, category, id]
      );
  
      if (result.affectedRows === 0) return h.response({ message: "Product not found" }).code(404);
      return h.response({ message: "Product updated successfully" }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to update product" }).code(500);
    }
  };

  const deleteProductById = async (request, h) => {
    const { id } = request.params;
    try {
      const [result] = await pool.execute("DELETE FROM Products WHERE ProductId = ?", [id]);
  
      if (result.affectedRows === 0) return h.response({ message: "Product not found" }).code(404);
      return h.response({ message: "Product deleted successfully" }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to delete product" }).code(500);
    }
  };

  const getProductsByCategory = async (request, h) => {
    const { category } = request.params;
    try {
      const [rows] = await pool.execute("SELECT * FROM Products WHERE Category = ?", [category]);
      return h.response(rows).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch products by category" }).code(500);
    }
  };

  const createCategory = async (request, h) => {
    const { category } = request.payload;
    try {
      await pool.execute("INSERT INTO Categories (CategoryName) VALUES (?)", [category]);
      return h.response({ message: "Category created successfully" }).code(201);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to create category" }).code(500);
    }
  };

  const createProduct = async (request, h) => {
    const { productName, price, category, image } = request.payload;
    try {
      await pool.execute(
        "INSERT INTO Products (ProductName, Price, Category, Image) VALUES (?, ?, ?, ?)",
        [productName, price, category, image]
      );
      return h.response({ message: "Product created successfully" }).code(201);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to create product" }).code(500);
    }
  };

  const getProductByName = async (request, h) => {
    const { name } = request.params;
    try {
      const [rows] = await pool.execute("SELECT * FROM Products WHERE ProductName LIKE ?", [`%${name}%`]);
      return h.response(rows).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ error: "Failed to fetch products by name" }).code(500);
    }
  };

  module.exports = {
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    getProductsByCategory,
    createCategory,
    createProduct,
    getProductByName,
  };