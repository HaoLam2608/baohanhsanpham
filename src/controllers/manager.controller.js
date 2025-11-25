const PhieuBaoHanh = require('../models/phieubaohanh');
const SanPham = require('../models/sanpham');
const NhanVien = require('../models/nhanvien');
const KhachHang = require('../models/khachhang');

// Lấy thống kê dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const totalTickets = await PhieuBaoHanh.countDocuments();
        const ticketsByStatus = await PhieuBaoHanh.aggregate([
            { $group: { _id: '$trangThai', count: { $sum: 1 } } }
        ]);

        const totalCustomers = await KhachHang.countDocuments();
        const totalProducts = await SanPham.countDocuments();
        const totalEmployees = await NhanVien.countDocuments();

        // Thời gian hoàn tất trung bình
        const completedTickets = await PhieuBaoHanh.find({ trangThai: 'hoan_tat' });
        const avgCompletionTime = completedTickets.length > 0
            ? completedTickets.reduce((sum, t) => sum + (t.ngayHoanTat - t.ngayTiepNhan) / (1000 * 60 * 60 * 24), 0) / completedTickets.length
            : 0;

        res.json({
            summary: {
                totalTickets,
                totalCustomers,
                totalProducts,
                totalEmployees,
                avgCompletionDays: Math.round(avgCompletionTime)
            },
            ticketsByStatus,
            recentTickets: await PhieuBaoHanh.find()
                .populate('sanPhamId')
                .populate('khachHangId')
                .populate('nhanVienTiepNhanId')
                .limit(5)
                .sort({ ngayTiepNhan: -1 })
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy tất cả phiếu bảo hành
exports.getAllTickets = async (req, res) => {
    try {
        const { status, employee, startDate, endDate } = req.query;
        const query = {};

        if (status) query.trangThai = status;
        if (employee) query.nhanVienTiepNhanId = employee;
        if (startDate && endDate) {
            query.ngayTiepNhan = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const tickets = await PhieuBaoHanh.find(query)
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId')
            .sort({ ngayTiepNhan: -1 });

        res.json({ tickets, total: tickets.length });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy báo cáo chi tiết
exports.getDetailedReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.ngayTiepNhan = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const tickets = await PhieuBaoHanh.find(query)
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId')
            .sort({ ngayTiepNhan: -1 });

        const report = {
            period: { startDate, endDate },
            totalTickets: tickets.length,
            byStatus: {},
            byProduct: {},
            byEmployee: {},
            totalRepairCost: 0
        };

        for (const ticket of tickets) {
            // Đếm theo trạng thái
            report.byStatus[ticket.trangThai] = (report.byStatus[ticket.trangThai] || 0) + 1;

            // Đếm theo sản phẩm
            const productName = ticket.sanPhamId?.tenSP || 'Unknown';
            report.byProduct[productName] = (report.byProduct[productName] || 0) + 1;

            // Đếm theo nhân viên
            const employeeName = ticket.nhanVienTiepNhanId?.hoTen || 'Chưa gán';
            report.byEmployee[employeeName] = (report.byEmployee[employeeName] || 0) + 1;

            // Tính tổng chi phí từ linhKienThayThe và chiPhiPhatSinh
            if (ticket.linhKienThayThe && ticket.linhKienThayThe.length > 0) {
                report.totalRepairCost += ticket.linhKienThayThe.reduce((sum, part) => sum + (part.chiPhi || 0), 0);
            }
            report.totalRepairCost += ticket.chiPhiPhatSinh || 0;
        }

        res.json(report);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Phê duyệt/Từ chối phiếu bảo hành
exports.approveTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { approved, reason } = req.body;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        if (approved) {
            ticket.trangThai = 'dang_kiem_tra';
        } else {
            ticket.trangThai = 'tu_choi';
            // Thêm lý do từ chối vào ghi chú
            ticket.moTaLoi += `\n[Từ chối: ${reason}]`;
        }

        ticket.lichSuTrangThai.push({
            trangThai: ticket.trangThai,
            thoiGian: new Date(),
            nhanVienId: req.user.id
        });

        await ticket.save();
        res.json({ message: 'Cập nhật phê duyệt thành công', data: ticket });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Gán nhân viên cho phiếu
exports.assignEmployee = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { nhanVienId } = req.body;

        // Kiểm tra nhân viên tồn tại
        const employee = await NhanVien.findById(nhanVienId);
        if (!employee) {
            return res.status(404).json({ message: 'Nhân viên không tồn tại' });
        }

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Phiếu không tồn tại' });
        }

        // Cập nhật nhân viên
        ticket.nhanVienTiepNhanId = nhanVienId;

        // Thêm vào lịch sử
        ticket.lichSuTrangThai.push({
            trangThai: ticket.trangThai,
            thoiGian: new Date(),
            nhanVienId: req.user.id,
            ghiChu: `Gán cho nhân viên: ${employee.hoTen}`
        });

        await ticket.save();

        // Populate lại để trả về đầy đủ thông tin
        await ticket.populate('nhanVienTiepNhanId');

        res.json({ 
            message: `Đã gán phiếu cho nhân viên ${employee.hoTen}`, 
            data: ticket 
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Đánh giá chất lượng
exports.qualityAssessment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { rating, comments } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1-5' });
        }

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Phiếu không tồn tại' });

        // Check if ticket already has a rating
        if (ticket.qualityRating) {
            return res.status(400).json({ message: 'Phiếu bảo hành này đã được đánh giá rồi' });
        }

        ticket.qualityRating = rating;
        ticket.qualityComments = comments;

        await ticket.save();
        res.json({ message: 'Đánh giá chất lượng thành công', data: ticket });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Báo cáo hiệu suất theo nhân viên
exports.getEmployeePerformance = async (req, res) => {
    try {
        const employees = await NhanVien.find();

        const performance = [];
        for (const emp of employees) {
            const tickets = await PhieuBaoHanh.find({ nhanVienTiepNhanId: emp._id });
            const completedTickets = tickets.filter(t => t.trangThai === 'hoan_tat');

            performance.push({
                employee: emp.hoTen,
                totalTickets: tickets.length,
                completedTickets: completedTickets.length,
                completionRate: tickets.length > 0 ? (completedTickets.length / tickets.length * 100).toFixed(2) + '%' : 'N/A',
                avgRating: completedTickets.length > 0
                    ? (completedTickets.reduce((sum, t) => sum + (t.qualityRating || 0), 0) / completedTickets.length).toFixed(2)
                    : 'N/A'
            });
        }

        res.json({ performance });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = exports;
