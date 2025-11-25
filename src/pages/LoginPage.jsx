import { useState } from 'react'
import { authAPI, storage } from '../services/api'
import RegisterPage from './RegisterPage'
import '../styles/LoginPage.css'

export default function LoginPage({ onLogin, onBackToLanding }) {
  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('khachhang')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  const getRoleIcon = (roleValue) => {
    switch(roleValue) {
      case 'khachhang': return '👤'
      case 'nhanvien': return '👨‍💼'
      case 'quanly': return '🏢'
      default: return '👤'
    }
  }

  const getRoleColor = (roleValue) => {
    switch(roleValue) {
      case 'khachhang': return '#3b82f6'
      case 'nhanvien': return '#10b981'
      case 'quanly': return '#8b5cf6'
      default: return '#3b82f6'
    }
  }

  return (
    <div className="login-page">
      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      <div className="login-split-container">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="login-branding">
            <div className="brand-logo">
              <span className="brand-icon">🛡️</span>
              <span className="brand-name">WarrantyPro</span>
            </div>
            <h1 className="brand-title">
              Chào mừng trở lại!
            </h1>
            <p className="brand-description">
              Đăng nhập để tiếp tục quản lý hệ thống bảo hành của bạn một cách hiệu quả và chuyên nghiệp.
            </p>
            
            <div className="feature-highlights">
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  <strong>Xử lý nhanh</strong>
                  <span>Quản lý phiếu bảo hành hiệu quả</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <strong>Bảo mật cao</strong>
                  <span>Dữ liệu được mã hóa an toàn</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  <strong>Thống kê chi tiết</strong>
                  <span>Báo cáo và phân tích dữ liệu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-form-container">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="btn-back-to-landing"
              >
                <span>←</span> Trang chủ
              </button>
            )}

            <div className="form-header">
              <h2>Đăng nhập</h2>
              <p>Nhập thông tin tài khoản của bạn</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="role-selector">
                <label className="role-label">Chọn vai trò của bạn</label>
                <div className="role-options">
                  <label 
                    className={`role-option ${role === 'khachhang' ? 'active' : ''}`}
                    style={{ '--role-color': getRoleColor('khachhang') }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="khachhang"
                      checked={role === 'khachhang'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <div className="role-content">
                      <span className="role-icon">{getRoleIcon('khachhang')}</span>
                      <span className="role-name">Khách hàng</span>
                    </div>
                  </label>

                  <label 
                    className={`role-option ${role === 'nhanvien' ? 'active' : ''}`}
                    style={{ '--role-color': getRoleColor('nhanvien') }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="nhanvien"
                      checked={role === 'nhanvien'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <div className="role-content">
                      <span className="role-icon">{getRoleIcon('nhanvien')}</span>
                      <span className="role-name">Nhân viên</span>
                    </div>
                  </label>

                  <label 
                    className={`role-option ${role === 'quanly' ? 'active' : ''}`}
                    style={{ '--role-color': getRoleColor('quanly') }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="quanly"
                      checked={role === 'quanly'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <div className="role-content">
                      <span className="role-icon">{getRoleIcon('quanly')}</span>
                      <span className="role-name">Quản lý</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email / Tài khoản
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email hoặc tên tài khoản"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label>
                  <span className="label-icon">🔒</span>
                  Mật khẩu
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-login" 
                disabled={loading}
                style={{ '--btn-color': getRoleColor(role) }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <span className="arrow">→</span>
                  </>
                )}
              </button>

              <div className="form-footer">
                <p>Chưa có tài khoản?</p>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="btn-register-link"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
