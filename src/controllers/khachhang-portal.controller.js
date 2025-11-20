const KhachHang = require('../models/khachhang');
const SanPham = require('../models/sanpham');
const PhieuBaoHanh = require('../models/phieubaohanh');

// Lấy thông tin bảo hành của khách hàng
exports.getWarrantyInfo = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        // Lấy thông tin khách hàng
        const customer = await KhachHang.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Khách hàng không tồn tại' });

        // Lấy tất cả sản phẩm
        const products = await SanPham.find({ khachHangId: customerId });

        // Lấy tất cả phiếu bảo hành
        const tickets = await PhieuBaoHanh.find({ khachHangId: customerId })
            .populate('sanPhamId')
            .sort({ ngayTiepNhan: -1 });

        res.json({
            customer,
            products,
            tickets,
            summary: {
                tongSanPham: products.length,
                tongPhieu: tickets.length,
                phieuDangXuLy: tickets.filter(t => !['hoan_tat', 'tu_choi'].includes(t.trangThai)).length,
                phieuHoanTat: tickets.filter(t => t.trangThai === 'hoan_tat').length,
                phieuTuChoi: tickets.filter(t => t.trangThai === 'tu_choi').length
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Theo dõi trạng thái phiếu bảo hành
exports.trackWarrantyTicket = async (req, res) => {
    try {
        const ticket = await PhieuBaoHanh.findById(req.params.ticketId)
            .populate('sanPhamId')
            .populate('khachHangId')
            .populate('nhanVienTiepNhanId');

        if (!ticket) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });

        res.json({
            maPhieu: ticket.maPhieu,
            trangThai: ticket.trangThai,
            sanPham: ticket.sanPhamId,
            ngayTiepNhan: ticket.ngayTiepNhan,
            ngayHoanTat: ticket.ngayHoanTat,
            moTaLoi: ticket.moTaLoi,
            lichSuTrangThai: ticket.lichSuTrangThai
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Gửi yêu cầu bảo hành
exports.submitWarrantyRequest = async (req, res) => {
    try {
        const { khachHangId, sanPhamId, moTaLoi, loaiLoiDuDoan, hinhAnhLoi } = req.body;

        // Tạo mã phiếu
        const maPhieu = `BH-${Date.now()}`;

        const newTicket = new PhieuBaoHanh({
            maPhieu,
            sanPhamId,
            khachHangId,
            moTaLoi,
            loaiLoiDuDoan,
            trangThai: 'tiep_nhan',
            ngayTiepNhan: new Date(),
            hinhAnhLoi,
            lichSuTrangThai: [{
                trangThai: 'tiep_nhan',
                thoiGian: new Date()
            }]
        });

        await newTicket.save();
        res.status(201).json({
            message: 'Gửi yêu cầu bảo hành thành công',
            data: newTicket
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy khuyến nghị gia hạn bảo hành
exports.getWarrantyRecommendations = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        // Lấy tất cả sản phẩm có thể hết hạn bảo hành
        const products = await SanPham.find({ khachHangId: customerId });

        const recommendations = products.map(product => {
            const purchaseDate = new Date(product.ngayMua);
            const warrantyEndDate = new Date(purchaseDate.getTime() + product.thoiHanBaoHanhThang * 30 * 24 * 60 * 60 * 1000);
            const today = new Date();
            const daysLeft = Math.ceil((warrantyEndDate - today) / (1000 * 60 * 60 * 24));

            return {
                sanPham: product.tenSP,
                soSerial: product.soSerial,
                ngayMua: product.ngayMua,
                ngayHetHan: warrantyEndDate,
                trangThai: daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn bảo hành',
                canRenew: daysLeft <= 30 && daysLeft > 0
            };
        });

        res.json({ recommendations });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = exports;
