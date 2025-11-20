import { useState } from 'react'
import { authAPI } from '../services/api'
import '../styles/LoginPage.css'

export default function RegisterPage({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    password: '',
    confirmPassword: '',
    chucVu: 'khachhang',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!')
      setLoading(false)
      return
    }

    try {
      await authAPI.register(
        formData.hoTen,
        formData.email,
        formData.password,
        formData.chucVu
      )
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
      setTimeout(() => {
        onBackToLogin()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản mới để sử dụng hệ thống</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên *</label>
            <input
              type="text"
              value={formData.hoTen}
              onChange={(e) =>
                setFormData({ ...formData, hoTen: e.target.value })
              }
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Vai trò</label>
            <select
              value={formData.chucVu}
              onChange={(e) =>
                setFormData({ ...formData, chucVu: e.target.value })
              }
            >
              <option value="khachhang">Khách hàng</option>
              <option value="nhanvien">Nhân viên</option>
              <option value="quanly">Người quản lý</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="btn-link"
            style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
          >
            Đã có tài khoản? Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
