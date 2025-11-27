const PhieuBaoHanh = require('../models/phieubaohanh');
const SanPham = require('../models/sanpham');

// Lấy công việc được gán cho nhân viên
exports.getMyTasks = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const tickets = await PhieuBaoHanh.find({ nhanVienTiepNhanId: employeeId })
            .populate('sanPhamId')
            .populate('khachHangId')
            .sort({ ngayTiepNhan: -1 });

        const summary = {
            total: tickets.length,
            tiepNhan: tickets.filter(t => t.trangThai === 'tiep_nhan').length,
            dangKiemTra: tickets.filter(t => t.trangThai === 'dang_kiem_tra').length,
            dangSua: tickets.filter(t => t.trangThai === 'dang_sua').length,
            hoanTat: tickets.filter(t => t.trangThai === 'hoan_tat').length
        };

        res.json({ summary, tickets });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Kiểm tra sản phẩm
exports.inspectProduct = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { ketQuaKiemTra, loaiLoiDuDoan, moTaKiemTra, canThayThe, linhKienCanThay } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Cập nhật trạng thái và thông tin kiểm tra
        ticket.trangThai = 'dang_sua';
        ticket.loaiLoiDuDoan = loaiLoiDuDoan;
        ticket.ketQuaKiemTra = moTaKiemTra || ketQuaKiemTra;
        ticket.ngayBatDauXuLy = new Date();

        // Thêm vào lịch sử
        ticket.lichSuTrangThai.push({
            trangThai: 'dang_kiem_tra',
            thoiGian: new Date(),
            nhanVienId: req.user.id,
            ghiChu: 'Bắt đầu kiểm tra sản phẩm'
        });

        ticket.lichSuTrangThai.push({
            trangThai: 'dang_sua',
            thoiGian: new Date(),
            nhanVienId: req.user.id,
            ghiChu: moTaKiemTra || ketQuaKiemTra
        });

        // Nếu cần thay thế linh kiện
        if (canThayThe && linhKienCanThay) {
            ticket.moTaTienDo.push({
                noiDung: `Cần thay thế: ${linhKienCanThay}`,
                thoiGian: new Date(),
                nhanVienId: req.user.id
            });
        }

        await ticket.save();

        res.json({
            message: 'Kiểm tra sản phẩm thành công',
            data: ticket
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Cập nhật tiến độ sửa chữa
exports.updateRepairProgress = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { moTaTienDo } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Thêm tiến độ mới
        ticket.moTaTienDo.push({
            noiDung: moTaTienDo,
            thoiGian: new Date(),
            nhanVienId: req.user.id
        });

        await ticket.save();

        res.json({ message: 'Cập nhật tiến độ thành công', data: ticket });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Hoàn tất sửa chữa
exports.completeRepair = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { moTaXuLy, linhKienThayThe, chiPhiPhatSinh, ghiChu } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Cập nhật thông tin hoàn tất
        ticket.moTaXuLy = moTaXuLy;
        ticket.linhKienThayThe = linhKienThayThe || [];
        ticket.chiPhiPhatSinh = chiPhiPhatSinh || 0;
        ticket.trangThai = 'hoan_tat';
        ticket.ngayHoanTat = new Date();

        // Thêm vào lịch sử
        ticket.lichSuTrangThai.push({
            trangThai: 'hoan_tat',
            thoiGian: new Date(),
            nhanVienId: req.user.id,
            ghiChu: ghiChu || 'Hoàn tất sửa chữa'
        });

        await ticket.save();

        res.json({
            message: 'Hoàn tất sửa chữa thành công',
            data: ticket
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy công việc đã hoàn tất
exports.getCompletedWork = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const tickets = await PhieuBaoHanh.find({
            nhanVienTiepNhanId: employeeId,
            trangThai: 'hoan_tat'
        })
            .populate('sanPhamId')
            .populate('khachHangId')
            .sort({ ngayHoanTat: -1 });

        const stats = {
            totalCompleted: tickets.length,
            totalPartsReplaced: tickets.reduce((sum, t) => sum + (t.linhKienThayThe?.length || 0), 0),
            totalRepairCost: tickets.reduce((sum, t) =>
                sum + (t.linhKienThayThe?.reduce((s, p) => s + (p.chiPhi || 0), 0) || 0) + (t.chiPhiPhatSinh || 0), 0
            )
        };

        res.json({ stats, tickets });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Đánh dấu không thể sửa
exports.markUnableToRepair = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { lyDoKhongSua } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        ticket.trangThai = 'tu_choi';
        ticket.moTaXuLy = lyDoKhongSua;
        ticket.ngayHoanTat = new Date();

        ticket.lichSuTrangThai.push({
            trangThai: 'tu_choi',
            thoiGian: new Date(),
            nhanVienId: req.user.id,
            ghiChu: lyDoKhongSua
        });

        await ticket.save();

        res.json({
            message: 'Đánh dấu không thể sửa thành công',
            data: ticket
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Upload hình ảnh trong quá trình sửa
exports.uploadRepairImages = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { hinhAnhSua } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Thêm hình ảnh vào mảng
        if (hinhAnhSua && Array.isArray(hinhAnhSua)) {
            ticket.hinhAnhSua = [...(ticket.hinhAnhSua || []), ...hinhAnhSua];
        }

        // Thêm ghi chú vào tiến độ
        ticket.moTaTienDo.push({
            noiDung: `Đã tải lên ${hinhAnhSua.length} hình ảnh`,
            thoiGian: new Date(),
            nhanVienId: req.user.id
        });

        await ticket.save();

        res.json({ message: 'Upload hình ảnh thành công', data: ticket });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = exports;
