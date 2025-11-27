const mongoose = require('mongoose');

const LinhKienSchema = new mongoose.Schema({
    maLinhKien: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    tenLinhKien: {
        type: String,
        required: true,
        trim: true
    },
    soLuongTon: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    giaNhap: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    giaXuat: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    moTa: {
        type: String,
        trim: true
    },
    ngayTao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LinhKien', LinhKienSchema);
