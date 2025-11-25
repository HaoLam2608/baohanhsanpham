import { useState } from 'react'
import '../styles/LandingPage.css'

function LandingPage({ onNavigateToLogin }) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: '🎯',
      title: 'Quản lý Phiếu Bảo Hành',
      description: 'Theo dõi và quản lý toàn bộ quy trình bảo hành từ tiếp nhận đến hoàn tất một cách dễ dàng và hiệu quả.'
    },
    {
      icon: '⚡',
      title: 'Xử Lý Nhanh Chóng',
      description: 'Hệ thống tự động hóa giúp giảm thời gian xử lý, tăng tốc độ phản hồi và cải thiện trải nghiệm khách hàng.'
    },
    {
      icon: '📊',
      title: 'Thống Kê Chi Tiết',
      description: 'Báo cáo và phân tích dữ liệu bảo hành giúp doanh nghiệp đưa ra quyết định chính xác và tối ưu hóa dịch vụ.'
    },
    {
      icon: '🔒',
      title: 'Bảo Mật & An Toàn',
      description: 'Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn cao nhất, đảm bảo thông tin khách hàng luôn an toàn.'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Phiếu Bảo Hành' },
    { value: '5,000+', label: 'Khách Hàng' },
    { value: '98%', label: 'Hài Lòng' },
    { value: '24/7', label: 'Hỗ Trợ' }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">🛡️</span>
              <span className="logo-text">WarrantyPro</span>
            </div>
            <button className="btn-login-nav" onClick={onNavigateToLogin}>
              Đăng Nhập →
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Hệ Thống Quản Lý
              <span className="gradient-text"> Bảo Hành Sản Phẩm</span>
            </h1>
            <p className="hero-description">
              Giải pháp toàn diện giúp doanh nghiệp quản lý quy trình bảo hành một cách
              chuyên nghiệp, hiệu quả và minh bạch. Nâng cao trải nghiệm khách hàng,
              tối ưu hóa vận hành.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-hero" onClick={onNavigateToLogin}>
                Bắt Đầu Ngay
              </button>
              <button className="btn-secondary-hero" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
              }}>
                Tìm Hiểu Thêm
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon">📋</div>
              <div className="card-text">
                <strong>Phiếu #BH001234</strong>
                <span>Đang xử lý</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">✅</div>
              <div className="card-text">
                <strong>Hoàn tất</strong>
                <span>+125 hôm nay</span>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">⭐</div>
              <div className="card-text">
                <strong>Đánh giá</strong>
                <span>4.9/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">Tính Năng Nổi Bật</h2>
            <p className="section-description">
              Hệ thống cung cấp đầy đủ các công cụ cần thiết để quản lý bảo hành hiệu quả
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">Quy Trình Hoạt Động</h2>
            <p className="section-description">
              Đơn giản, nhanh chóng và hiệu quả trong 4 bước
            </p>
          </div>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Tiếp Nhận</h3>
                <p>Khách hàng gửi yêu cầu bảo hành qua hệ thống</p>
              </div>
            </div>

            <div className="step-connector">→</div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Kiểm Tra</h3>
                <p>Nhân viên kỹ thuật kiểm tra và đánh giá</p>
              </div>
            </div>

            <div className="step-connector">→</div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Sửa Chữa</h3>
                <p>Tiến hành xử lý và sửa chữa sản phẩm</p>
              </div>
            </div>

            <div className="step-connector">→</div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Hoàn Tất</h3>
                <p>Trả sản phẩm và nhận đánh giá từ khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">Dành Cho Mọi Vai Trò</h2>
            <p className="section-description">
              Giao diện và tính năng được tối ưu hóa cho từng đối tượng sử dụng
            </p>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">👤</div>
              <h3>Khách Hàng</h3>
              <ul>
                <li>✓ Gửi yêu cầu bảo hành</li>
                <li>✓ Theo dõi trạng thái phiếu</li>
                <li>✓ Kiểm tra thông tin bảo hành</li>
                <li>✓ Đánh giá chất lượng dịch vụ</li>
              </ul>
            </div>

            <div className="role-card highlight">
              <div className="role-badge">Phổ biến</div>
              <div className="role-icon">👨‍💼</div>
              <h3>Nhân Viên</h3>
              <ul>
                <li>✓ Xem danh sách yêu cầu</li>
                <li>✓ Quản lý phiếu bảo hành</li>
                <li>✓ Cập nhật tiến độ xử lý</li>
                <li>✓ Ghi chú kỹ thuật chi tiết</li>
              </ul>
            </div>

            <div className="role-card">
              <div className="role-icon">🏢</div>
              <h3>Quản Lý</h3>
              <ul>
                <li>✓ Quản lý sản phẩm & chính sách</li>
                <li>✓ Xem thống kê & báo cáo</li>
                <li>✓ Quản lý người dùng</li>
                <li>✓ Giám sát toàn bộ hệ thống</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Sẵn Sàng Bắt Đầu?</h2>
          <p className="cta-description">
            Đăng nhập ngay để trải nghiệm hệ thống quản lý bảo hành chuyên nghiệp
          </p>
          <button className="btn-cta" onClick={onNavigateToLogin}>
            Đăng Nhập Ngay →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🛡️</span>
              <span className="logo-text">WarrantyPro</span>
            </div>
            <p className="footer-description">
              Giải pháp quản lý bảo hành hàng đầu cho doanh nghiệp hiện đại
            </p>
          </div>

          <div className="footer-section">
            <h4>Sản Phẩm</h4>
            <ul>
              <li>Tính năng</li>
              <li>Bảng giá</li>
              <li>Tích hợp</li>
              <li>API</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Công Ty</h4>
            <ul>
              <li>Về chúng tôi</li>
              <li>Liên hệ</li>
              <li>Tuyển dụng</li>
              <li>Blog</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li>Trung tâm trợ giúp</li>
              <li>Tài liệu</li>
              <li>Điều khoản</li>
              <li>Bảo mật</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 WarrantyPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
