const mongoose = require('mongoose');

const KhachHangSchema = new mongoose.Schema({
    hoTen: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matKhau: { type: String }, // Cho phép khách hàng đăng nhập
    soDienThoai: { type: String },
    avatar: { type: String },
    diaChi: { type: String },
    ngayTao: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KhachHang', KhachHangSchema);
