const mongoose = require('mongoose');

const PhieuSchema = new mongoose.Schema({
    maPhieu: { type: String, required: true, unique: true },
    sanPhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
    khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
    nhanVienTiepNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien' },
    moTaLoi: { type: String },
    loaiLoiDuDoan: { type: String }, // lỗi NSX, lỗi người dùng, ...
    trangThai: { type: String, enum: ['tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat', 'tu_choi'], default: 'tiep_nhan' },
    ngayTiepNhan: { type: Date, default: Date.now },
    ngayHoanTat: { type: Date },
    hinhAnhLoi: [String],
    lichSuTrangThai: [{ trangThai: String, thoiGian: Date, nhanVienId: mongoose.Schema.Types.ObjectId }],
    qualityRating: { type: Number, min: 1, max: 5 },
    qualityComments: { type: String }
});

module.exports = mongoose.model('PhieuBaoHanh', PhieuSchema);
