const express = require('express');
const router = express.Router();
const chiTietBaoHanhController = require('../controllers/chitietbaohang.controller');
const { protect } = require('../middleware/auth.middleware');

// Create warranty detail
router.post('/', protect, chiTietBaoHanhController.createChiTietBaoHanh);

// Get all warranty details
router.get('/', chiTietBaoHanhController.getAllChiTietBaoHanh);

// Get warranty details by ticket
router.get('/phieu/:phieuId', chiTietBaoHanhController.getChiTietBaoHanhByPhieu);

// Get warranty details by employee
router.get('/employee/:employeeId', chiTietBaoHanhController.getChiTietBaoHanhByEmployee);

// Get warranty detail by ID
router.get('/:id', chiTietBaoHanhController.getChiTietBaoHanhById);

// Complete warranty detail
router.patch('/:id/complete', protect, chiTietBaoHanhController.completeChiTietBaoHanh);

// Update warranty detail
router.put('/:id', protect, chiTietBaoHanhController.updateChiTietBaoHanh);

// Delete warranty detail
router.delete('/:id', protect, chiTietBaoHanhController.deleteChiTietBaoHanh);

module.exports = router;
