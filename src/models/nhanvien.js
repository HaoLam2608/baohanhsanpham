const mongoose = require('mongoose');

const NhanVienSchema = new mongoose.Schema({
    hoTen: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matKhau: { type: String, required: true },
    chucVu: { type: String, default: 'nhanvien' },
    soDienThoai: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NhanVien', NhanVienSchema);
