const mongoose = require('mongoose');

// Schema mới cho chi phí
const PhieuBaoHanhCostSchema = new mongoose.Schema({
    phieuBaoHanhId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhieuBaoHanh', required: true },
    linhKienThayThe: [{
        tenLinhKien: String,
        maLinhKien: String,
        chiPhi: { type: Number, default: 0 }
    }],
    linhKienSuDung: [{
        linhKienId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LinhKien'
        },
        tenLinhKien: String,
        soLuong: { type: Number, required: true, min: 1 },
        donGia: Number,
        thanhTien: Number
    }],
    chiPhiPhatSinh: { type: Number, default: 0 },
    tongTienLinhKien: { type: Number, default: 0 },
    tongTien: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PhieuBaoHanhCost', PhieuBaoHanhCostSchema);