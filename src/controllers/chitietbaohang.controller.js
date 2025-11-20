const ChiTietBaoHanh = require('../models/chitietbaohang');
const PhieuBaoHanh = require('../models/phieubaohanh');

// Create warranty detail
exports.createChiTietBaoHanh = async (req, res) => {
    try {
        const { phieuBaoHanhId, nhanVienId, moTaXuLy, linhKienThayThe, ngayBatDau, ketQuaKiemTra } = req.body;

        const newChiTiet = new ChiTietBaoHanh({
            phieuBaoHanhId,
            nhanVienId,
            moTaXuLy,
            linhKienThayThe,
            ngayBatDau: ngayBatDau || new Date(),
            ketQuaKiemTra,
            trangThai: 'dang_sua'
        });

        await newChiTiet.save();
        res.status(201).json({ message: 'Tạo chi tiết bảo hành thành công', data: newChiTiet });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get all warranty details
exports.getAllChiTietBaoHanh = async (req, res) => {
    try {
        const chiTiets = await ChiTietBaoHanh.find()
            .populate('phieuBaoHanhId')
            .populate('nhanVienId')
            .sort({ ngayBatDau: -1 });
        res.json({ data: chiTiets });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty detail by ID
exports.getChiTietBaoHanhById = async (req, res) => {
    try {
        const chiTiet = await ChiTietBaoHanh.findById(req.params.id)
            .populate('phieuBaoHanhId')
            .populate('nhanVienId');
        if (!chiTiet) return res.status(404).json({ message: 'Chi tiết bảo hành không tồn tại' });
        res.json({ data: chiTiet });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update warranty detail
exports.updateChiTietBaoHanh = async (req, res) => {
    try {
        const chiTiet = await ChiTietBaoHanh.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('phieuBaoHanhId')
            .populate('nhanVienId');
        if (!chiTiet) return res.status(404).json({ message: 'Chi tiết bảo hành không tồn tại' });
        res.json({ message: 'Cập nhật chi tiết bảo hành thành công', data: chiTiet });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Complete warranty detail
exports.completeChiTietBaoHanh = async (req, res) => {
    try {
        const { ketQuaKiemTra } = req.body;

        const chiTiet = await ChiTietBaoHanh.findById(req.params.id);
        if (!chiTiet) return res.status(404).json({ message: 'Chi tiết bảo hành không tồn tại' });

        chiTiet.ngayHoanTat = new Date();
        chiTiet.ketQuaKiemTra = ketQuaKiemTra;
        chiTiet.trangThai = 'hoan_tat';

        await chiTiet.save();
        res.json({ message: 'Hoàn tất chi tiết bảo hành thành công', data: chiTiet });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Delete warranty detail
exports.deleteChiTietBaoHanh = async (req, res) => {
    try {
        const chiTiet = await ChiTietBaoHanh.findByIdAndDelete(req.params.id);
        if (!chiTiet) return res.status(404).json({ message: 'Chi tiết bảo hành không tồn tại' });
        res.json({ message: 'Xóa chi tiết bảo hành thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty details by ticket
exports.getChiTietBaoHanhByPhieu = async (req, res) => {
    try {
        const chiTiets = await ChiTietBaoHanh.find({ phieuBaoHanhId: req.params.phieuId })
            .populate('phieuBaoHanhId')
            .populate('nhanVienId')
            .sort({ ngayBatDau: -1 });
        res.json({ data: chiTiets });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty details by employee
exports.getChiTietBaoHanhByEmployee = async (req, res) => {
    try {
        const chiTiets = await ChiTietBaoHanh.find({ nhanVienId: req.params.employeeId })
            .populate('phieuBaoHanhId')
            .populate('nhanVienId')
            .sort({ ngayBatDau: -1 });
        res.json({ data: chiTiets });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
