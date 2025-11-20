const PhieuBaoHanh = require('../models/phieubaohanh');
const SanPham = require('../models/sanpham');

// Create warranty ticket
exports.createPhieuBaoHanh = async (req, res) => {
    try {
        const { maPhieu, sanPhamId, khachHangId, nhanVienTiepNhanId, moTaLoi, loaiLoiDuDoan, hinhAnhLoi } = req.body;

        // Check if ticket already exists
        const existingPhieu = await PhieuBaoHanh.findOne({ maPhieu });
        if (existingPhieu) return res.status(400).json({ message: 'Mã phiếu đã tồn tại' });

        const newPhieu = new PhieuBaoHanh({
            maPhieu,
            sanPhamId,
            khachHangId,
            nhanVienTiepNhanId,
            moTaLoi,
            loaiLoiDuDoan,
            trangThai: 'tiep_nhan',
            hinhAnhLoi,
            lichSuTrangThai: [{
                trangThai: 'tiep_nhan',
                thoiGian: new Date(),
                nhanVienId: nhanVienTiepNhanId
            }]
        });

        await newPhieu.save();
        res.status(201).json({ message: 'Tạo phiếu bảo hành thành công', data: newPhieu });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get all warranty tickets
exports.getAllPhieuBaoHanh = async (req, res) => {
    try {
        const phieus = await PhieuBaoHanh.find()
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId')
            .sort({ ngayTiepNhan: -1 });
        res.json({ data: phieus });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty ticket by ID
exports.getPhieuBaoHanhById = async (req, res) => {
    try {
        const phieu = await PhieuBaoHanh.findById(req.params.id)
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId');
        if (!phieu) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });
        res.json({ data: phieu });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update warranty ticket status
exports.updatePhieuBaoHanhStatus = async (req, res) => {
    try {
        const { trangThai, nhanVienId } = req.body;
        const validStatuses = ['tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat', 'tu_choi'];

        if (!validStatuses.includes(trangThai)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const phieu = await PhieuBaoHanh.findById(req.params.id);
        if (!phieu) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });

        phieu.trangThai = trangThai;
        if (trangThai === 'hoan_tat') phieu.ngayHoanTat = new Date();

        phieu.lichSuTrangThai.push({
            trangThai,
            thoiGian: new Date(),
            nhanVienId
        });

        await phieu.save();
        res.json({ message: 'Cập nhật trạng thái thành công', data: phieu });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update warranty ticket
exports.updatePhieuBaoHanh = async (req, res) => {
    try {
        const phieu = await PhieuBaoHanh.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId');
        if (!phieu) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });
        res.json({ message: 'Cập nhật phiếu bảo hành thành công', data: phieu });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Delete warranty ticket
exports.deletePhieuBaoHanh = async (req, res) => {
    try {
        const phieu = await PhieuBaoHanh.findByIdAndDelete(req.params.id);
        if (!phieu) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });
        res.json({ message: 'Xóa phiếu bảo hành thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty tickets by status
exports.getPhieuBaoHanhByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat', 'tu_choi'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const phieus = await PhieuBaoHanh.find({ trangThai: status })
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId')
            .sort({ ngayTiepNhan: -1 });
        res.json({ data: phieus });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get warranty tickets by customer
exports.getPhieuBaoHanhByCustomer = async (req, res) => {
    try {
        const phieus = await PhieuBaoHanh.find({ khachHangId: req.params.customerId })
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId')
            .sort({ ngayTiepNhan: -1 });
        res.json({ data: phieus });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
