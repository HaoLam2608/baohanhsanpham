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
        const { ticketId } = req.params;

        // Tìm theo maPhieu hoặc _id
        let ticket;
        if (ticketId.startsWith('BH')) {
            // Nếu bắt đầu bằng BH thì là mã phiếu
            ticket = await PhieuBaoHanh.findOne({ maPhieu: ticketId })
                .populate('sanPhamId')
                .populate('khachHangId')
                .populate('nhanVienTiepNhanId');
        } else {
            // Nếu không thì coi như là ObjectId
            ticket = await PhieuBaoHanh.findById(ticketId)
                .populate('sanPhamId')
                .populate('khachHangId')
                .populate('nhanVienTiepNhanId');
        }

        if (!ticket) return res.status(404).json({ message: 'Phiếu bảo hành không tồn tại' });

        res.json({
            maPhieu: ticket.maPhieu,
            trangThai: ticket.trangThai,
            sanPham: ticket.sanPhamId,
            khachHang: ticket.khachHangId,
            nhanVien: ticket.nhanVienTiepNhanId,
            ngayTiepNhan: ticket.ngayTiepNhan,
            ngayHoanTat: ticket.ngayHoanTat,
            moTaLoi: ticket.moTaLoi,
            loaiLoiDuDoan: ticket.loaiLoiDuDoan,
            lichSuTrangThai: ticket.lichSuTrangThai,
            moTaTienDo: ticket.moTaTienDo,
            chiPhiPhatSinh: ticket.chiPhiPhatSinh,
            linhKienThayThe: ticket.linhKienThayThe,
            trangThaiThanhToan: ticket.trangThaiThanhToan,
            // Include attachments so frontend can display files
            tepDinhKem: ticket.tepDinhKem || [],
            hinhAnhLoi: ticket.hinhAnhLoi || [],
            qualityRating: ticket.qualityRating,
            qualityComments: ticket.qualityComments
        });
    } catch (err) {
        console.error('❌ Error tracking ticket:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Gửi yêu cầu bảo hành
exports.submitWarrantyRequest = async (req, res) => {
    try {
        // Support both JSON body (old) and multipart/form-data (new)
        // For multipart, files are available in req.files and other fields in req.body
        let {
            khachHangId,
            sanPhamId,
            moTaLoi,
            loaiLoiDuDoan,
            thongTinLienHe = '{}',
            tepDinhKem = []
        } = req.body || {};

        // If thongTinLienHe sent as JSON string (from FormData), parse it
        if (typeof thongTinLienHe === 'string') {
            try {
                thongTinLienHe = JSON.parse(thongTinLienHe);
            } catch (e) {
                // ignore parse error, keep as string
            }
        }

        // Build attachments from uploaded files (if any)
        const uploadedFiles = Array.isArray(req.files) ? req.files : [];
        const uploadedAttachments = uploadedFiles.map(f => ({
            tenTep: f.originalname,
            kieuNoiDung: f.mimetype,
            duLieu: `/uploads/${f.filename}`,
            kichThuoc: f.size
        }));

        // If tepDinhKem provided in body (JSON), try to parse/merge
        let bodyAttachments = [];
        if (typeof tepDinhKem === 'string') {
            try {
                bodyAttachments = JSON.parse(tepDinhKem);
            } catch (e) {
                bodyAttachments = [];
            }
        } else if (Array.isArray(tepDinhKem)) {
            bodyAttachments = tepDinhKem;
        }

        const allAttachments = [...uploadedAttachments, ...bodyAttachments];

        if (!khachHangId || !sanPhamId || !moTaLoi) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const {
            hoTen = '',
            soDienThoai = '',
            email = '',
            maDonHang = '',
            soSerial = ''
        } = thongTinLienHe || {};

        if (!hoTen.trim() || !soDienThoai.trim()) {
            return res.status(400).json({ message: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ' });
        }

        if (!maDonHang.trim() && !soSerial.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập mã đơn hàng hoặc số serial sản phẩm' });
        }

        const maxAttachments = 5;
        const sanitizedAttachments = allAttachments
            .filter((item) => item && item.tenTep && item.duLieu)
            .slice(0, maxAttachments)
            .map((item) => ({
                tenTep: item.tenTep,
                kieuNoiDung: item.kieuNoiDung,
                duLieu: item.duLieu,
                kichThuoc: item.kichThuoc
            }));

        const attachmentImages = sanitizedAttachments
            .filter((item) => typeof item.kieuNoiDung === 'string' && item.kieuNoiDung.startsWith('image/'))
            .map((item) => item.duLieu);

        const maPhieu = `BH-${Date.now()}`;

        const newTicket = new PhieuBaoHanh({
            maPhieu,
            sanPhamId,
            khachHangId,
            moTaLoi,
            loaiLoiDuDoan,
            trangThai: 'dang_cho',
            ngayTiepNhan: new Date(),
            hinhAnhLoi: attachmentImages.slice(0, maxAttachments),
            thongTinLienHe: {
                hoTen: hoTen.trim(),
                soDienThoai: soDienThoai.trim(),
                email: email.trim() || undefined,
                maDonHang: maDonHang.trim() || undefined,
                soSerial: soSerial.trim() || undefined
            },
            tepDinhKem: sanitizedAttachments,
            lichSuTrangThai: [{
                trangThai: 'dang_cho',
                thoiGian: new Date()
            }]
        });

        await newTicket.save();

        res.status(201).json({
            message: 'Gửi yêu cầu bảo hành thành công',
            confirmation: 'Hệ thống đã ghi nhận yêu cầu và sẽ gửi thông báo xác nhận qua email hoặc số điện thoại bạn cung cấp.',
            data: newTicket
        });
    } catch (err) {
        console.error('Error in submitWarrantyRequest:', err);
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

// Khách hàng gửi đánh giá cho phiếu bảo hành
exports.submitRating = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        }

        // Tìm phiếu bảo hành
        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu bảo hành' });
        }

        // Kiểm tra phiếu đã hoàn tất chưa
        if (ticket.trangThai !== 'hoan_tat') {
            return res.status(400).json({ message: 'Chỉ có thể đánh giá phiếu đã hoàn tất' });
        }

        // Kiểm tra đã đánh giá chưa
        if (ticket.qualityRating) {
            return res.status(400).json({ message: 'Phiếu bảo hành này đã được đánh giá rồi. Mỗi phiếu chỉ được đánh giá một lần.' });
        }

        // Kiểm tra quyền (chỉ khách hàng của phiếu mới được đánh giá)
        if (req.user && req.user.id && ticket.khachHangId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền đánh giá phiếu này' });
        }

        // Cập nhật đánh giá
        ticket.qualityRating = rating;
        ticket.qualityComments = comment || '';
        await ticket.save();

        res.json({
            message: 'Cảm ơn bạn đã gửi đánh giá!',
            data: {
                qualityRating: ticket.qualityRating,
                qualityComments: ticket.qualityComments
            }
        });
    } catch (err) {
        console.error('❌ Error submitting rating:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Xử lý thanh toán
exports.processPayment = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await PhieuBaoHanh.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu bảo hành' });
        }

        // Tính tổng chi phí
        const totalCost = (ticket.chiPhiPhatSinh || 0) +
            (ticket.linhKienThayThe || []).reduce((sum, item) => sum + (item.chiPhi || 0), 0);

        if (totalCost <= 0) {
            return res.status(400).json({ message: 'Phiếu bảo hành này không có chi phí cần thanh toán' });
        }

        if (ticket.trangThaiThanhToan === 'da_thanh_toan') {
            return res.status(400).json({ message: 'Phiếu bảo hành này đã được thanh toán' });
        }

        // Cập nhật trạng thái thanh toán
        ticket.trangThaiThanhToan = 'da_thanh_toan';

        // Thêm vào lịch sử tiến độ
        ticket.moTaTienDo.push({
            noiDung: `Khách hàng đã thanh toán ${totalCost.toLocaleString('vi-VN')} VNĐ`,
            thoiGian: new Date()
        });

        await ticket.save();

        res.json({
            message: 'Thanh toán thành công!',
            data: {
                trangThaiThanhToan: ticket.trangThaiThanhToan,
                moTaTienDo: ticket.moTaTienDo
            }
        });
    } catch (err) {
        console.error('❌ Error processing payment:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

module.exports = exports;
