const express = require('express');
const router = express.Router();
const customerController = require('../controllers/khachhang-portal.controller');
const { protect } = require('../middleware/auth.middleware');

// Lấy thông tin bảo hành cho khách hàng
router.get('/warranty-info/:customerId', protect, customerController.getWarrantyInfo);

// Theo dõi trạng thái phiếu bảo hành
router.get('/track/:ticketId', protect, customerController.trackWarrantyTicket);

// Gửi yêu cầu bảo hành
router.post('/request', protect, customerController.submitWarrantyRequest);

// Lấy khuyến nghị gia hạn bảo hành
router.get('/recommendations/:customerId', protect, customerController.getWarrantyRecommendations);

module.exports = router;
