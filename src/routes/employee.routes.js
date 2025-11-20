const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');

// Lấy công việc được gán
router.get('/tasks', protect, employeeController.getMyTasks);

// Kiểm tra sản phẩm (kiểm tra lỗi)
router.post('/:ticketId/inspect', protect, employeeController.inspectProduct);

// Cập nhật tiến độ sửa chữa
router.put('/repair/:detailId', protect, employeeController.updateRepairProgress);

// Hoàn tất sửa chữa
router.post('/:ticketId/complete-repair', protect, employeeController.completeRepair);

// Lấy công việc đã hoàn tất
router.get('/work/completed', protect, employeeController.getCompletedWork);

// Đánh dấu không thể sửa
router.post('/:ticketId/unable-to-repair', protect, employeeController.markUnableToRepair);

module.exports = router;
