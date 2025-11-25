const KhachHang = require('../models/khachhang')
const NhanVien = require('../models/nhanvien')
const bcrypt = require('bcryptjs')

exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user || {}
    if (!id) return res.status(401).json({ message: 'Không xác định người dùng' })

    let user
    if (role === 'khachhang') {
      user = await KhachHang.findById(id).select('-matKhau')
    } else {
      user = await NhanVien.findById(id).select('-matKhau')
    }

    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' })
    res.json({ data: user })
  } catch (err) {
    console.error('Get profile error', err)
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user || {}
    if (!id) return res.status(401).json({ message: 'Không xác định người dùng' })

    const { hoTen, email, soDienThoai, matKhau } = req.body || {}

    let Model = role === 'khachhang' ? KhachHang : NhanVien
    const user = await Model.findById(id)
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' })

    if (hoTen !== undefined) user.hoTen = hoTen
    if (email !== undefined) user.email = email
    if (soDienThoai !== undefined) user.soDienThoai = soDienThoai
    if (matKhau && matKhau.trim().length > 0) {
      const hashed = await bcrypt.hash(matKhau, 10)
      user.matKhau = hashed
    }

    await user.save()
    const out = user.toObject()
    delete out.matKhau
    res.json({ data: out })
  } catch (err) {
    console.error('Update profile error', err)
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}
