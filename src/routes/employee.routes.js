const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer')
const path = require('path')

// configure multer to store uploads in src/uploads (server already serves this folder)
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'uploads'))
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		const name = `${file.fieldname}-${Date.now()}${ext}`
		cb(null, name)
	}
})
const upload = multer({ storage })

// Lấy công việc được gán
router.get('/tasks', protect, employeeController.getMyTasks);

// Kiểm tra sản phẩm (kiểm tra lỗi)
router.post('/:ticketId/inspect', protect, employeeController.inspectProduct);

// Cập nhật tiến độ sửa chữa (đổi từ detailId sang ticketId)
router.put('/:ticketId/progress', protect, employeeController.updateRepairProgress);

// Upload hình ảnh sửa chữa (accept multipart/form-data with field name 'images')
router.post('/:ticketId/upload-images', protect, upload.array('images', 20), employeeController.uploadRepairImages);

// Hoàn tất sửa chữa
router.post('/:ticketId/complete', protect, employeeController.completeRepair);

// Lấy công việc đã hoàn tất
router.get('/completed', protect, employeeController.getCompletedWork);

// Đánh dấu không thể sửa
router.post('/:ticketId/unable', protect, employeeController.markUnableToRepair);

// Thêm linh kiện vào phiếu
router.post('/:ticketId/add-part', protect, employeeController.addPartToTicket);

module.exports = router;
