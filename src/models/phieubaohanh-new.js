const mongoose = require('mongoose');

const PhieuSchema = new mongoose.Schema({
    maPhieu: { type: String, required: true, unique: true },
    sanPhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
    khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
    nhanVienTiepNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien' },

    // Thông tin lỗi cơ bản
    moTaLoi: { type: String },
    loaiLoiDuDoan: { type: String, enum: ['loi_nsx', 'loi_su_dung', 'hong_tu_nhien'] },
    thongTinLienHe: {
        hoTen: { type: String },
        soDienThoai: { type: String },
        email: { type: String },
        maDonHang: { type: String },
        soSerial: { type: String }
    },

    // Thông tin xử lý cơ bản
    ketQuaKiemTra: { type: String },
    moTaXuLy: { type: String },

    // Trạng thái và thời gian
    trangThai: {
        type: String,
        enum: ['dang_cho', 'tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat', 'tu_choi'],
        default: 'dang_cho'
    },
    trangThaiThanhToan: {
        type: String,
        enum: ['chua_thanh_toan', 'da_thanh_toan'],
        default: 'chua_thanh_toan'
    },
    ngayTiepNhan: { type: Date, default: Date.now },
    ngayBatDauXuLy: { type: Date },
    ngayHoanTat: { type: Date },

    // Đánh giá
    qualityRating: { type: Number, min: 1, max: 5 },
    qualityComments: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('PhieuBaoHanh', PhieuSchema);