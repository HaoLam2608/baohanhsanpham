const express = require('express');
const router = express.Router();
const customerController = require('../controllers/khachhang-portal.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + unique + ext);
	}
});

const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } }); // limit 8MB per file

// Lấy thông tin bảo hành cho khách hàng
router.get('/warranty-info/:customerId', protect, customerController.getWarrantyInfo);

// Theo dõi trạng thái phiếu bảo hành
router.get('/track/:ticketId', protect, customerController.trackWarrantyTicket);

// Gửi yêu cầu bảo hành
// Accept multipart/form-data with files under field name 'attachments'
router.post('/request', protect, upload.array('attachments', 5), customerController.submitWarrantyRequest);

// Đánh giá phiếu bảo hành
router.post('/rate/:ticketId', protect, customerController.submitRating);

// Lấy khuyến nghị gia hạn bảo hành
router.get('/recommendations/:customerId', protect, customerController.getWarrantyRecommendations);

module.exports = router;
