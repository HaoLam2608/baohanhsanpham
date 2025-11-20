const SanPham = require('../models/sanpham');

// Create new product
exports.createSanPham = async (req, res) => {
    try {
        const { loaiSanPham, thuongHieu, tenSP, soSerial, ngayMua, thoiHanBaoHanhThang, thongTinKyThuat, khachHangId, hinhAnhHoaDon } = req.body;

        const newSanPham = new SanPham({
            loaiSanPham,
            thuongHieu,
            tenSP,
            soSerial,
            ngayMua,
            thoiHanBaoHanhThang,
            thongTinKyThuat,
            khachHangId,
            hinhAnhHoaDon
        });

        await newSanPham.save();
        res.status(201).json({ message: 'Tạo sản phẩm thành công', data: newSanPham });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get all products
exports.getAllSanPham = async (req, res) => {
    try {
        const sanPhams = await SanPham.find().populate('khachHangId');
        res.json({ data: sanPhams });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get product by ID
exports.getSanPhamById = async (req, res) => {
    try {
        const sanPham = await SanPham.findById(req.params.id).populate('khachHangId');
        if (!sanPham) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        res.json({ data: sanPham });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update product
exports.updateSanPham = async (req, res) => {
    try {
        const sanPham = await SanPham.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sanPham) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        res.json({ message: 'Cập nhật sản phẩm thành công', data: sanPham });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Delete product
exports.deleteSanPham = async (req, res) => {
    try {
        const sanPham = await SanPham.findByIdAndDelete(req.params.id);
        if (!sanPham) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get products by serial number
exports.getSanPhamBySerial = async (req, res) => {
    try {
        const sanPham = await SanPham.findOne({ soSerial: req.params.serial }).populate('khachHangId');
        if (!sanPham) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        res.json({ data: sanPham });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
