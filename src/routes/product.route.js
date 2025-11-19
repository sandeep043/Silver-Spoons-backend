const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET /products/search?query=...&type=veg&minPrice=10&maxPrice=50&page=1&limit=20
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getAllCategories);

module.exports = router;

