// src/services/categoryService.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  },
};