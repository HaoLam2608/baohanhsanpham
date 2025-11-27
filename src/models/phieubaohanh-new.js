const mongoose = require('mongoose');

const PhieuSchema = new mongoose.Schema({
    maPhieu: { type: String, required: true, unique: true },
    sanPhamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham' },
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
    // Tiến độ xử lý (các cập nhật nhỏ trong quá trình sửa)
    // Lịch sử trạng thái & tiến độ
    lichSuTrangThai: [{
        trangThai: { type: String },
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId,
        ghiChu: { type: String }
    }],

    moTaTienDo:[{
        noiDung: { type: String },
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId
    }],

    // Linh kiện đã sử dụng / thay thế trong quá trình sửa
    linhKienSuDung: [{
        linhKienId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LinhKien'
        },
        tenLinhKien: String,
        soLuong: { type: Number, default: 1, min: 1 },
        donGia: Number,
        thanhTien: Number
    }],

    // Linh kiện thay thế (tổng quan, có thể dùng để báo cáo)
    linhKienThayThe: [{
        tenLinhKien: String,
        maLinhKien: String,
        chiPhi: { type: Number, default: 0 }
    }],

    // Hình ảnh quá trình sửa
    hinhAnhSua: [String],

    // Chi phí liên quan
    tongTienLinhKien: { type: Number, default: 0 },
    chiPhiPhatSinh: { type: Number, default: 0 },
    tongTien: { type: Number, default: 0 },

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