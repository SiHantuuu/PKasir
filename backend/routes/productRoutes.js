const productController = require("../controllers/productController");
const productRoutes = [{ method: "GET", path: "/products", handler: productController.getAllProducts },
    { method: "GET", path: "/products/{id}", handler: productController.getProductById },
    { method: "PUT", path: "/products/{id}", handler: productController.updateProductById },
    { method: "DELETE", path: "/products/{id}", handler: productController.deleteProductById },
    { method: "GET", path: "/products/category/{category}", handler: productController.getProductsByCategory },
    { method: "POST", path: "/categories", handler: productController.createCategory },
    { method: "POST", path: "/products", handler: productController.createProduct },
    { method: "GET", path: "/products/name/{name}", handler: productController.getProductByName },]


    module.exports = productRoutes;