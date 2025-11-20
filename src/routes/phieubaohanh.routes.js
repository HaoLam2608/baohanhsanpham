const express = require('express');
const router = express.Router();
const phieuBaoHanhController = require('../controllers/phieubaohanh.controller');
const { protect } = require('../middleware/auth.middleware');

// Create warranty ticket
router.post('/', protect, phieuBaoHanhController.createPhieuBaoHanh);

// Get all warranty tickets
router.get('/', phieuBaoHanhController.getAllPhieuBaoHanh);

// Get warranty tickets by status
router.get('/status/:status', phieuBaoHanhController.getPhieuBaoHanhByStatus);

// Get warranty tickets by customer
router.get('/customer/:customerId', phieuBaoHanhController.getPhieuBaoHanhByCustomer);

// Get warranty ticket by ID
router.get('/:id', phieuBaoHanhController.getPhieuBaoHanhById);

// Update warranty ticket status
router.patch('/:id/status', protect, phieuBaoHanhController.updatePhieuBaoHanhStatus);

// Update warranty ticket
router.put('/:id', protect, phieuBaoHanhController.updatePhieuBaoHanh);

// Delete warranty ticket
router.delete('/:id', protect, phieuBaoHanhController.deletePhieuBaoHanh);

module.exports = router;
