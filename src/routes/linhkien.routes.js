const express = require('express');
const router = express.Router();
const linhKienController = require('../controllers/linhkien.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.get('/', protect, linhKienController.getAllLinhKien);
router.post('/', protect, linhKienController.createLinhKien);
router.put('/:id', protect, linhKienController.updateLinhKien);
router.delete('/:id', protect, linhKienController.deleteLinhKien);

module.exports = router;
