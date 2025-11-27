const mongoose = require('mongoose');

const PhieuSchema = new mongoose.Schema({
    maPhieu: { type: String, required: true, unique: true },
    sanPhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
    khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
    nhanVienTiepNhanId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien' },

    // Thông tin lỗi
    moTaLoi: { type: String },
    loaiLoiDuDoan: { type: String, enum: ['loi_nsx', 'loi_su_dung', 'hong_tu_nhien'] },
    hinhAnhLoi: [String],
    thongTinLienHe: {
        hoTen: { type: String },
        soDienThoai: { type: String },
        email: { type: String },
        maDonHang: { type: String },
        soSerial: { type: String }
    },
    tepDinhKem: [{
        tenTep: String,
        kieuNoiDung: String,
        duLieu: String,
        kichThuoc: Number
    }],

    // Thông tin xử lý (gộp từ ChiTietBaoHanh)
    ketQuaKiemTra: { type: String },
    moTaXuLy: { type: String },
    moTaTienDo: [{
        noiDung: String,
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId
    }],
    linhKienThayThe: [{
        tenLinhKien: String,
        maLinhKien: String,
        chiPhi: { type: Number, default: 0 }
    }],
    hinhAnhSua: [String],
    chiPhiPhatSinh: { type: Number, default: 0 },

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
    lichSuTrangThai: [{
        trangThai: String,
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId,
        ghiChu: String
    }],

    // Đánh giá
    qualityRating: { type: Number, min: 1, max: 5 },
    qualityComments: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('PhieuBaoHanh', PhieuSchema);
