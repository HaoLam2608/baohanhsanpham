const NhanVien = require('../models/nhanvien');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, matKhau } = req.body;
    const nv = await NhanVien.findOne({ email });
    if (!nv) return res.status(401).json({ message: 'Sai thông tin' });
    const ok = await bcrypt.compare(matKhau, nv.matKhau);
    if (!ok) return res.status(401).json({ message: 'Sai thông tin' });
    const token = jwt.sign({ id: nv._id, role: nv.chucVu }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: nv._id, hoTen: nv.hoTen, chucVu: nv.chucVu } });
};
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err });
    }
};