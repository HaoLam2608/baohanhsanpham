const mongoose = require('mongoose');

// Schema mới cho timeline
const PhieuBaoHanhTimelineSchema = new mongoose.Schema({
    phieuBaoHanhId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhieuBaoHanh', required: true },
    lichSuTrangThai: [{
        trangThai: String,
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId,
        ghiChu: String
    }],
    moTaTienDo: [{
        noiDung: String,
        thoiGian: { type: Date, default: Date.now },
        nhanVienId: mongoose.Schema.Types.ObjectId
    }]
}, { timestamps: true });

module.exports = mongoose.model('PhieuBaoHanhTimeline', PhieuBaoHanhTimelineSchema);