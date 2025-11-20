const mongoose = require('mongoose');

const ChiTietSchema = new mongoose.Schema({
    phieuBaoHanhId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhieuBaoHanh', required: true },
    nhanVienId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien' },
    moTaXuLy: { type: String },
    linhKienThayThe: [{ tenLinhKien: String, maLinhKien: String, chiPhi: Number }],
    ngayBatDau: Date,
    ngayHoanTat: Date,
    ketQuaKiemTra: String,
    trangThai: String
});

module.exports = mongoose.model('ChiTietBaoHanh', ChiTietSchema);
