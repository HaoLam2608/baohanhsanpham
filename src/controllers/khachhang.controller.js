const KhachHang = require('../models/khachhang');

// Create new customer
exports.createKhachHang = async (req, res) => {
    try {
        const { hoTen, soDienThoai, email, diaChi } = req.body;

        // Check if phone already exists
        const existingCustomer = await KhachHang.findOne({ soDienThoai });
        if (existingCustomer) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });

        const newKhachHang = new KhachHang({
            hoTen,
            soDienThoai,
            email,
            diaChi
        });

        await newKhachHang.save();
        res.status(201).json({ message: 'Tạo khách hàng thành công', data: newKhachHang });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get all customers
exports.getAllKhachHang = async (req, res) => {
    try {
        const khachHangs = await KhachHang.find().sort({ ngayTao: -1 });
        res.json({ data: khachHangs });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get customer by ID
exports.getKhachHangById = async (req, res) => {
    try {
        const khachHang = await KhachHang.findById(req.params.id);
        if (!khachHang) return res.status(404).json({ message: 'Khách hàng không tồn tại' });
        res.json({ data: khachHang });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update customer
exports.updateKhachHang = async (req, res) => {
    try {
        // Check if phone already exists when updating
        if (req.body.soDienThoai) {
            const existingCustomer = await KhachHang.findOne({
                soDienThoai: req.body.soDienThoai,
                _id: { $ne: req.params.id }
            });
            if (existingCustomer) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
        }

        const khachHang = await KhachHang.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!khachHang) return res.status(404).json({ message: 'Khách hàng không tồn tại' });
        res.json({ message: 'Cập nhật khách hàng thành công', data: khachHang });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Delete customer
exports.deleteKhachHang = async (req, res) => {
    try {
        const khachHang = await KhachHang.findByIdAndDelete(req.params.id);
        if (!khachHang) return res.status(404).json({ message: 'Khách hàng không tồn tại' });
        res.json({ message: 'Xóa khách hàng thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Search customer by phone
exports.searchKhachHangByPhone = async (req, res) => {
    try {
        const khachHang = await KhachHang.findOne({ soDienThoai: req.params.phone });
        if (!khachHang) return res.status(404).json({ message: 'Khách hàng không tồn tại' });
        res.json({ data: khachHang });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
