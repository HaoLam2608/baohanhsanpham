const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanvien.controller');
const { protect } = require('../middleware/auth.middleware');

// Create employee
router.post('/', protect, nhanVienController.createNhanVien);

// Get all employees
router.get('/', protect, nhanVienController.getAllNhanVien);

// Get employees by role
router.get('/role/:role', protect, nhanVienController.getNhanVienByRole);

// Get employee by ID
router.get('/:id', protect, nhanVienController.getNhanVienById);

// Update employee
router.put('/:id', protect, nhanVienController.updateNhanVien);

// Change password
router.patch('/:id/change-password', protect, nhanVienController.changePassword);

// Delete employee
router.delete('/:id', protect, nhanVienController.deleteNhanVien);

module.exports = router;
