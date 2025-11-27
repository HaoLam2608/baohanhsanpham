import { useState } from 'react'
import { authAPI } from '../services/api'
import '../styles/LoginPage.css'

export default function RegisterPage({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    password: '',
    confirmPassword: '',
    chucVu: 'khachhang', // Hardcoded role
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      setSuccess('Đăng ký thành công! Đang chuyển hướng...')
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
              Tạo tài khoản mới
            </h1>
            <p className="brand-description">
              Tham gia cùng chúng tôi để trải nghiệm dịch vụ bảo hành chuyên nghiệp và tận tâm.
            </p>

            <div className="feature-highlights">
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <div className="feature-text">
                  <strong>Dễ dàng sử dụng</strong>
                  <span>Giao diện thân thiện, trực quan</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <div className="feature-text">
                  <strong>Đa nền tảng</strong>
                  <span>Truy cập mọi lúc, mọi nơi</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤝</div>
                <div className="feature-text">
                  <strong>Hỗ trợ 24/7</strong>
                  <span>Đội ngũ hỗ trợ nhiệt tình</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="login-right">
          <div className="login-form-container">
            <button
              type="button"
              onClick={onBackToLogin}
              className="btn-back-to-landing"
            >
              <span>←</span> Đăng nhập
            </button>

            <div className="form-header">
              <h2>Đăng ký</h2>
              <p>Nhập thông tin để tạo tài khoản khách hàng</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Full Name Input */}
              <div className="form-group">
                <label>
                  <span className="label-icon">👤</span>
                  Họ và tên
                </label>
                <div className="input-wrapper">
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
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email
                </label>
                <div className="input-wrapper">
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
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
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

              {/* Confirm Password Input */}
              <div className="form-group">
                <label>
                  <span className="label-icon">🔐</span>
                  Xác nhận mật khẩu
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="btn-login"
                disabled={loading}
                style={{ '--btn-color': '#3b82f6' }} // Customer blue color
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    Đăng ký tài khoản
                    <span className="arrow">→</span>
                  </>
                )}
              </button>

              <div className="form-footer">
                <p>Đã có tài khoản?</p>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="btn-register-link"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
