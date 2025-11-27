const mongoose = require('mongoose');

// Schema mới cho attachments
const PhieuBaoHanhAttachmentSchema = new mongoose.Schema({
    phieuBaoHanhId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhieuBaoHanh', required: true },
    hinhAnhLoi: [String],
    tepDinhKem: [{
        tenTep: String,
        kieuNoiDung: String,
        duLieu: String,
        kichThuoc: Number
    }],
    hinhAnhSua: [String]
}, { timestamps: true });

module.exports = mongoose.model('PhieuBaoHanhAttachment', PhieuBaoHanhAttachmentSchema);