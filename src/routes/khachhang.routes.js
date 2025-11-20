const express = require('express');
const router = express.Router();
const khachHangController = require('../controllers/khachhang.controller');
const { protect } = require('../middleware/auth.middleware');

// Create customer
router.post('/', protect, khachHangController.createKhachHang);

// Get all customers
router.get('/', khachHangController.getAllKhachHang);

// Search customer by phone
router.get('/phone/:phone', khachHangController.searchKhachHangByPhone);

// Get customer by ID
router.get('/:id', khachHangController.getKhachHangById);

// Update customer
router.put('/:id', protect, khachHangController.updateKhachHang);

// Delete customer
router.delete('/:id', protect, khachHangController.deleteKhachHang);

module.exports = router;
