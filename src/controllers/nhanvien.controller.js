const NhanVien = require('../models/nhanvien');
const bcrypt = require('bcryptjs');

// Create employee
exports.createNhanVien = async (req, res) => {
    try {
        const { hoTen, email, matKhau, chucVu } = req.body;

        // Check if email already exists
        const existingEmployee = await NhanVien.findOne({ email });
        if (existingEmployee) return res.status(400).json({ message: 'Email đã tồn tại' });

        // Hash password
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        const newNhanVien = new NhanVien({
            hoTen,
            email,
            matKhau: hashedPassword,
            chucVu: chucVu || 'nhanvien'
        });

        await newNhanVien.save();
        res.status(201).json({ message: 'Tạo nhân viên thành công', data: { id: newNhanVien._id, hoTen, email, chucVu: newNhanVien.chucVu } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get all employees
exports.getAllNhanVien = async (req, res) => {
    try {
        const nhanViens = await NhanVien.find().select('-matKhau').sort({ createdAt: -1 });
        res.json({ data: nhanViens });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get employee by ID
exports.getNhanVienById = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findById(req.params.id).select('-matKhau');
        if (!nhanVien) return res.status(404).json({ message: 'Nhân viên không tồn tại' });
        res.json({ data: nhanVien });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Update employee info
exports.updateNhanVien = async (req, res) => {
    try {
        const { hoTen, email, chucVu } = req.body;

        // Check if email already exists when updating
        if (email) {
            const existingEmployee = await NhanVien.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (existingEmployee) return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const nhanVien = await NhanVien.findByIdAndUpdate(
            req.params.id,
            { hoTen, email, chucVu },
            { new: true }
        ).select('-matKhau');

        if (!nhanVien) return res.status(404).json({ message: 'Nhân viên không tồn tại' });
        res.json({ message: 'Cập nhật nhân viên thành công', data: nhanVien });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { matKhauCu, matKhauMoi } = req.body;

        const nhanVien = await NhanVien.findById(req.params.id);
        if (!nhanVien) return res.status(404).json({ message: 'Nhân viên không tồn tại' });

        // Verify old password
        const isPasswordValid = await bcrypt.compare(matKhauCu, nhanVien.matKhau);
        if (!isPasswordValid) return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });

        // Hash new password
        const hashedPassword = await bcrypt.hash(matKhauMoi, 10);
        nhanVien.matKhau = hashedPassword;

        await nhanVien.save();
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Delete employee
exports.deleteNhanVien = async (req, res) => {
    try {
        const nhanVien = await NhanVien.findByIdAndDelete(req.params.id);
        if (!nhanVien) return res.status(404).json({ message: 'Nhân viên không tồn tại' });
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Get employees by role
exports.getNhanVienByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const nhanViens = await NhanVien.find({ chucVu: role }).select('-matKhau');
        res.json({ data: nhanViens });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
