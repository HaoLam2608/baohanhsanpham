const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');
const { protect } = require('../middleware/auth.middleware');

// Thống kê dashboard
router.get('/dashboard', protect, managerController.getDashboardStats);

// Lấy tất cả phiếu bảo hành (với filter)
router.get('/tickets', protect, managerController.getAllTickets);

// Lấy báo cáo chi tiết
router.get('/report', protect, managerController.getDetailedReport);

// Phê duyệt/Từ chối phiếu bảo hành
router.post('/:ticketId/approve', protect, managerController.approveTicket);

// Gán nhân viên cho phiếu
router.post('/:ticketId/assign', protect, managerController.assignEmployee);

// Đánh giá chất lượng
router.post('/:ticketId/quality', protect, managerController.qualityAssessment);

// Báo cáo hiệu suất nhân viên
router.get('/performance', protect, managerController.getEmployeePerformance);

module.exports = router;
