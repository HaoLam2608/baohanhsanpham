const ChiTietBaoHanh = require('../models/chitietbaohang');
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
        const { ketQuaKiemTra, loaiLoiDuDoan } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        ticket.trangThai = 'dang_sua';
        ticket.loaiLoiDuDoan = loaiLoiDuDoan;

        ticket.lichSuTrangThai.push({
            trangThai: 'dang_kiem_tra',
            thoiGian: new Date(),
            nhanVienId: req.user.id
        });

        await ticket.save();

        // Tạo bản ghi chi tiết sửa chữa
        const detail = new ChiTietBaoHanh({
            phieuBaoHanhId: ticketId,
            nhanVienId: req.user.id,
            ketQuaKiemTra,
            moTaXuLy: '',
            ngayBatDau: new Date(),
            trangThai: 'dang_sua'
        });

        await detail.save();

        res.json({
            message: 'Kiểm tra hàng thành công',
            data: { ticket, detail }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Cập nhật tiến độ sửa chữa
exports.updateRepairProgress = async (req, res) => {
    try {
        const { detailId } = req.params;
        const { moTaXuLy, linhKienThayThe, trangThai } = req.body;

        const detail = await ChiTietBaoHanh.findByIdAndUpdate(
            detailId,
            {
                moTaXuLy,
                linhKienThayThe,
                trangThai: trangThai || 'dang_sua'
            },
            { new: true }
        ).populate('phieuBaoHanhId');

        if (!detail) return res.status(404).json({ message: 'Chi tiết không tồn tại' });

        res.json({ message: 'Cập nhật tiến độ thành công', data: detail });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Hoàn tất sửa chữa
exports.completeRepair = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { ketQuaKiemTra, moTaXuLy, linhKienThayThe } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Cập nhật hoặc tạo chi tiết sửa chữa
        let detail = await ChiTietBaoHanh.findOne({ phieuBaoHanhId: ticketId });

        if (!detail) {
            detail = new ChiTietBaoHanh({
                phieuBaoHanhId: ticketId,
                nhanVienId: req.user.id,
                ngayBatDau: new Date()
            });
        }

        detail.moTaXuLy = moTaXuLy;
        detail.ketQuaKiemTra = ketQuaKiemTra;
        detail.linhKienThayThe = linhKienThayThe;
        detail.ngayHoanTat = new Date();
        detail.trangThai = 'hoan_tat';

        await detail.save();

        // Cập nhật trạng thái phiếu
        ticket.trangThai = 'hoan_tat';
        ticket.ngayHoanTat = new Date();

        ticket.lichSuTrangThai.push({
            trangThai: 'hoan_tat',
            thoiGian: new Date(),
            nhanVienId: req.user.id
        });

        await ticket.save();

        res.json({
            message: 'Hoàn tất sửa chữa thành công',
            data: { ticket, detail }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy công việc đã hoàn tất
exports.getCompletedWork = async (req, res) => {
    try {
        const employeeId = req.user.id;

        const details = await ChiTietBaoHanh.find({ nhanVienId: employeeId, trangThai: 'hoan_tat' })
            .populate({
                path: 'phieuBaoHanhId',
                populate: ['sanPhamId', 'khachHangId']
            })
            .sort({ ngayHoanTat: -1 });

        const stats = {
            totalCompleted: details.length,
            totalPartsReplaced: details.reduce((sum, d) => sum + (d.linhKienThayThe?.length || 0), 0),
            totalRepairCost: details.reduce((sum, d) =>
                sum + (d.linhKienThayThe?.reduce((s, p) => s + (p.chiPhi || 0), 0) || 0), 0
            )
        };

        res.json({ stats, details });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Đánh dấu không thể sửa
exports.markUnableToRepair = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { reason } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        ticket.trangThai = 'tu_choi';
        ticket.moTaLoi += `\n[Không thể sửa: ${reason}]`;

        ticket.lichSuTrangThai.push({
            trangThai: 'tu_choi',
            thoiGian: new Date(),
            nhanVienId: req.user.id
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

module.exports = exports;
