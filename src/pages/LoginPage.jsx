import { useState } from 'react'
import { authAPI, storage } from '../services/api'
import RegisterPage from './RegisterPage'
import '../styles/LoginPage.css'

export default function LoginPage({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('khachhang')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await authAPI.login(email, password, role)
      
      // Lưu token và thông tin user
      storage.setToken(data.token)
      storage.setUser(data.user || { email, chucVu: role })
      
      // Chuyển sang trang tương ứng
      onLogin(role)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Hệ thống Quản lý Bảo hành</h1>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Tài khoản</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="khachhang">Khách hàng</option>
              <option value="nhanvien">Nhân viên</option>
              <option value="quanly">Người quản lý</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="btn-link"
            style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
          >
            Chưa có tài khoản? Đăng ký ngay
          </button>
        </form>
      </div>
    </div>
  )
}
