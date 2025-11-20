const mongoose = require('mongoose');

const KhachHangSchema = new mongoose.Schema({
    hoTen: { type: String, required: true },
    soDienThoai: { type: String, required: true, unique: true },
    email: { type: String },
    diaChi: { type: String },
    ngayTao: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KhachHang', KhachHangSchema);
