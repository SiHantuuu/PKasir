const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const productService = {
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('Fetched all products:', data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      console.log(`Fetched product with ID ${id}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productData.productName,
          price: productData.price,
          categoryId: productData.categoryId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      const data = await response.json();
      console.log('Created product:', data);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productData.productName,
          price: productData.price,
          categoryId: productData.categoryId
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      const data = await response.json();
      console.log(`Updated product with ID ${id}:`, data);
      return data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      const data = await response.json();
      console.log(`Deleted product with ID ${id}:`, data);
      return data;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },

  getProductsByCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/products/category/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }
      const data = await response.json();
      console.log(`Fetched products for category ${categoryId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw error;
    }
  },

  searchProductsByName: async (name) => {
    try {
      const response = await fetch(`${API_URL}/products/name/${name}`);
      if (!response.ok) {
        throw new Error('Failed to search products by name');
      }
      const data = await response.json();
      console.log(`Searched products with name "${name}":`, data);
      return data;
    } catch (error) {
      console.error(`Error searching products with name ${name}:`, error);
      throw error;
    }
  }
};
