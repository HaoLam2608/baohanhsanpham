import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Zap,
  BarChart3,
  Lock,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  Star,
  Users,
  Building2,
  HeadphonesIcon,
  Search,
  Wrench
} from 'lucide-react'

export default function LandingPage({ onNavigateToLogin }) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: 'Quản lý Phiếu Bảo Hành',
      description: 'Theo dõi và quản lý toàn bộ quy trình bảo hành từ tiếp nhận đến hoàn tất một cách dễ dàng và hiệu quả.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Xử Lý Nhanh Chóng',
      description: 'Hệ thống tự động hóa giúp giảm thời gian xử lý, tăng tốc độ phản hồi và cải thiện trải nghiệm khách hàng.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Thống Kê Chi Tiết',
      description: 'Báo cáo và phân tích dữ liệu bảo hành giúp doanh nghiệp đưa ra quyết định chính xác và tối ưu hóa dịch vụ.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="landing-page overflow-hidden bg-white">
      {/* Hero Section */}
      <header className="landing-header relative">
        <nav className="landing-nav z-50 relative bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="nav-content max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="logo flex items-center gap-2">
              <Shield className="logo-icon w-8 h-8 text-blue-600" />
              <span className="logo-text font-bold text-xl text-gray-900">WarrantyPro</span>
            </div>
            <button
              className="btn-login-nav group flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200"
              onClick={onNavigateToLogin}
            >
              Đăng Nhập
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </nav>

        <div className="hero-content grid md:grid-cols-2 gap-12 items-center pt-20 pb-16 px-4 max-w-7xl mx-auto">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4 mr-2 fill-current" />
              Giải pháp quản lý bảo hành số 1
            </motion.div>
            <h1 className="hero-title text-5xl font-bold leading-tight mb-6 text-gray-900">
              Hệ Thống Quản Lý
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Bảo Hành Sản Phẩm</span>
            </h1>
            <p className="hero-description text-lg text-gray-600 mb-8 leading-relaxed">
              Giải pháp toàn diện giúp doanh nghiệp quản lý quy trình bảo hành một cách
              chuyên nghiệp, hiệu quả và minh bạch. Nâng cao trải nghiệm khách hàng,
              tối ưu hóa vận hành.
            </p>
            <div className="hero-buttons flex gap-4">
              <button
                className="btn-primary-hero group px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                onClick={onNavigateToLogin}
              >
                Bắt Đầu Ngay
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                className="btn-secondary-hero px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                onClick={() => {
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Tìm Hiểu Thêm
              </button>
            </div>
          </motion.div>

          <motion.div
            className="hero-image relative h-[500px] hidden md:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Abstract Background Shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />

            <motion.div
              className="floating-card absolute top-10 left-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="card-icon bg-blue-100 text-blue-600 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="card-text">
                <strong className="block text-gray-900">Phiếu #BH001234</strong>
                <span className="text-blue-600 text-sm font-medium">Đang xử lý</span>
              </div>
            </motion.div>

            <motion.div
              className="floating-card absolute bottom-20 right-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 z-20"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            >
              <div className="card-icon bg-green-100 text-green-600 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="card-text">
                <strong className="block text-gray-900">Hoàn tất</strong>
                <span className="text-green-600 text-sm font-medium">+125 hôm nay</span>
              </div>
            </motion.div>

            <motion.div
              className="floating-card absolute top-1/2 right-0 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-4 z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="card-icon bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="card-text">
                <strong className="block text-gray-900">Đánh giá</strong>
                <span className="text-yellow-600 text-sm font-medium">4.9/5.0</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section bg-blue-600 py-12 text-white">
        <div className="stats-container max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-item"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-value text-4xl font-bold mb-2">{stat.value}</div>
              <div className="stat-label text-blue-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-20 bg-gray-50">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="section-header-center text-center mb-16">
            <h2 className="section-title text-3xl font-bold text-gray-900 mb-4">Tính Năng Nổi Bật</h2>
            <p className="section-description text-gray-600 max-w-2xl mx-auto">
              Hệ thống cung cấp đầy đủ các công cụ cần thiết để quản lý bảo hành hiệu quả
            </p>
          </div>

          <motion.div
            className="features-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`feature-card bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 ${activeFeature === index ? 'ring-2 ring-blue-500' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
                whileHover={{ y: -5 }}
              >
                <div className="feature-icon-wrapper mb-6 text-blue-600 bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="feature-title text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="feature-description text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-20">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="section-header-center text-center mb-16">
            <h2 className="section-title text-3xl font-bold text-gray-900 mb-4">Quy Trình Hoạt Động</h2>
            <p className="section-description text-gray-600">
              Đơn giản, nhanh chóng và hiệu quả trong 4 bước
            </p>
          </div>

          <div className="steps-container flex flex-col md:flex-row items-center justify-between gap-8 relative">
            {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />

            {[
              { icon: <ClipboardList className="w-6 h-6" />, title: 'Tiếp Nhận', desc: 'Khách hàng gửi yêu cầu' },
              { icon: <Search className="w-6 h-6" />, title: 'Kiểm Tra', desc: 'Kỹ thuật viên đánh giá' },
              { icon: <Wrench className="w-6 h-6" />, title: 'Sửa Chữa', desc: 'Tiến hành xử lý' },
              { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Hoàn Tất', desc: 'Trả hàng & Đánh giá' }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="step-item bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center w-full md:w-64"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-number w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4 text-sm">
                  {index + 1}
                </div>
                <div className="step-icon w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section py-20 bg-gray-50">
        <div className="section-container max-w-7xl mx-auto px-4">
          <div className="section-header-center text-center mb-16">
            <h2 className="section-title text-3xl font-bold text-gray-900 mb-4">Dành Cho Mọi Vai Trò</h2>
            <p className="section-description text-gray-600">
              Giao diện và tính năng được tối ưu hóa cho từng đối tượng sử dụng
            </p>
          </div>

          <div className="roles-grid grid md:grid-cols-3 gap-8">
            <motion.div
              className="role-card bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              whileHover={{ y: -10 }}
            >
              <div className="role-icon w-16 h-16 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Khách Hàng</h3>
              <ul className="role-features space-y-3">
                {['Gửi yêu cầu bảo hành', 'Theo dõi trạng thái phiếu', 'Kiểm tra thông tin bảo hành', 'Đánh giá chất lượng dịch vụ'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="role-card bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-500 relative transform md:-translate-y-4"
              whileHover={{ y: -14 }}
            >
              <div className="role-badge absolute top-4 right-4 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Phổ biến</div>
              <div className="role-icon w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nhân Viên</h3>
              <ul className="role-features space-y-3">
                {['Xem danh sách yêu cầu', 'Quản lý phiếu bảo hành', 'Cập nhật tiến độ xử lý', 'Ghi chú kỹ thuật chi tiết'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="role-card bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              whileHover={{ y: -10 }}
            >
              <div className="role-icon w-16 h-16 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quản Lý</h3>
              <ul className="role-features space-y-3">
                {['Quản lý sản phẩm & chính sách', 'Xem thống kê & báo cáo', 'Quản lý người dùng', 'Giám sát toàn bộ hệ thống'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-20 bg-blue-600 text-white text-center">
        <div className="cta-container max-w-4xl mx-auto px-4">
          <h2 className="cta-title text-4xl font-bold mb-6">Sẵn Sàng Bắt Đầu?</h2>
          <p className="cta-description text-xl text-blue-100 mb-8">
            Đăng nhập ngay để trải nghiệm hệ thống quản lý bảo hành chuyên nghiệp
          </p>
          <button
            className="btn-cta group px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto"
            onClick={onNavigateToLogin}
          >
            Đăng Nhập Ngay
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer bg-gray-900 text-gray-400 py-12">
        <div className="footer-content max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div className="footer-section">
            <div className="footer-logo flex items-center gap-2 mb-4 text-white">
              <Shield className="logo-icon w-6 h-6" />
              <span className="logo-text font-bold text-lg">WarrantyPro</span>
            </div>
            <p className="footer-description text-sm">
              Giải pháp quản lý bảo hành hàng đầu cho doanh nghiệp hiện đại
            </p>
          </div>

          <div className="footer-section">
            <h4 className="text-white font-bold mb-4">Sản Phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>Tính năng</li>
              <li>Bảng giá</li>
              <li>Tích hợp</li>
              <li>API</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="text-white font-bold mb-4">Công Ty</h4>
            <ul className="space-y-2 text-sm">
              <li>Về chúng tôi</li>
              <li>Liên hệ</li>
              <li>Tuyển dụng</li>
              <li>Blog</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="text-white font-bold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>Trung tâm trợ giúp</li>
              <li>Tài liệu</li>
              <li>Điều khoản</li>
              <li>Bảo mật</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 text-center text-sm">
          <p>© 2025 WarrantyPro. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
