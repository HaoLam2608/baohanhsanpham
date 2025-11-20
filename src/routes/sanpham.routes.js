const express = require('express');
const router = express.Router();
const sanPhamController = require('../controllers/sanpham.controller');
const { protect } = require('../middleware/auth.middleware');

// Create product
router.post('/', protect, sanPhamController.createSanPham);

// Get all products
router.get('/', sanPhamController.getAllSanPham);

// Get product by serial number
router.get('/serial/:serial', sanPhamController.getSanPhamBySerial);

// Get product by ID
router.get('/:id', sanPhamController.getSanPhamById);

// Update product
router.put('/:id', protect, sanPhamController.updateSanPham);

// Delete product
router.delete('/:id', protect, sanPhamController.deleteSanPham);

module.exports = router;
