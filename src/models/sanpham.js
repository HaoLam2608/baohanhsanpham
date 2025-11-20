const mongoose = require('mongoose');

const SanPhamSchema = new mongoose.Schema({
    loaiSanPham: { type: String, enum: ['Vot', 'Giay', 'Balo', 'PhuKien'], required: true },
    thuongHieu: { type: String },
    tenSP: { type: String, required: true },
    soSerial: { type: String, required: true, index: true },
    ngayMua: { type: Date },
    thoiHanBaoHanhThang: { type: Number, default: 12 },
    thongTinKyThuat: { type: Object },
    khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang' },
    hinhAnhHoaDon: { type: String }
});

module.exports = mongoose.model('SanPham', SanPhamSchema);
