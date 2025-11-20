const NhanVien = require('../models/nhanvien');
const KhachHang = require('../models/khachhang');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, matKhau, chucVu } = req.body;
        
        let user;
        
        // Nếu là khách hàng, tìm trong KhachHang
        if (chucVu === 'khachhang') {
            user = await KhachHang.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
            }
            
            // Khách hàng không có mật khẩu trong schema hiện tại
            // Nếu muốn khách hàng đăng nhập, cần thêm field matKhau vào KhachHang schema
            if (!user.matKhau) {
                return res.status(401).json({ message: 'Tài khoản khách hàng chưa thiết lập mật khẩu' });
            }
            
            const ok = await bcrypt.compare(matKhau, user.matKhau);
            if (!ok) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
            
        } else {
            // Nhân viên hoặc quản lý
            user = await NhanVien.findOne({ email });
            if (!user) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
            
            const ok = await bcrypt.compare(matKhau, user.matKhau);
            if (!ok) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
        }
        
        const token = jwt.sign(
            { id: user._id, role: chucVu || user.chucVu }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                hoTen: user.hoTen, 
                chucVu: chucVu || user.chucVu,
                email: user.email 
            } 
        });
    } catch (err) {
        console.error('❌ Lỗi login:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
exports.register = async (req, res) => {
    try {
        const { hoTen, email, matKhau, chucVu = 'khachhang', soDienThoai, diaChi } = req.body;

        // Validate input
        if (!hoTen || !email || !matKhau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        if (chucVu === 'khachhang') {
            // Tạo tài khoản KHÁCH HÀNG vào collection khachhangs
            
            // Check if email exists
            const existingCustomer = await KhachHang.findOne({ email });
            if (existingCustomer) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }

            const newCustomer = new KhachHang({
                hoTen,
                email,
                matKhau: hashedPassword, // Thêm field này vào schema
                soDienThoai: soDienThoai || '',
                diaChi: diaChi || ''
            });

            await newCustomer.save();
            console.log('✅ Đăng ký khách hàng thành công:', email);
            
        } else {
            // Tạo tài khoản NHÂN VIÊN/QUẢN LÝ vào collection nhanviens
            
            // Check if email exists
            const existingEmployee = await NhanVien.findOne({ email });
            if (existingEmployee) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }

            const newEmployee = new NhanVien({
                hoTen,
                email,
                matKhau: hashedPassword,
                chucVu
            });

            await newEmployee.save();
            console.log('✅ Đăng ký nhân viên/quản lý thành công:', email, '- Chức vụ:', chucVu);
        }

        res.status(201).json({ message: "Đăng ký thành công" });
        
    } catch (err) {
        console.error('❌ Lỗi đăng ký:', err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};