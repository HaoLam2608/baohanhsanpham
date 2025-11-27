import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  User,
  Briefcase,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Zap,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { authAPI, storage } from '../services/api'
import RegisterPage from './RegisterPage'

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
      storage.setToken(data.token)
      storage.setUser(data.user || { email, chucVu: role })
      onLogin(role)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { id: 'khachhang', label: 'Khách hàng', icon: User, color: 'blue' },
    { id: 'nhanvien', label: 'Nhân viên', icon: Briefcase, color: 'emerald' },
    { id: 'quanly', label: 'Quản lý', icon: Building2, color: 'purple' },
  ]

  const activeRole = roles.find(r => r.id === role)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-indigo-900/90" />

        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-24 left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold mb-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <span>WarrantyPro</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Quản lý bảo hành <br />
              <span className="text-blue-400">Chuyên nghiệp & Hiệu quả</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Hệ thống toàn diện giúp doanh nghiệp tối ưu hóa quy trình bảo hành và nâng cao trải nghiệm khách hàng.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { icon: Zap, title: 'Xử lý nhanh chóng', desc: 'Tự động hóa quy trình tiếp nhận' },
              { icon: Shield, title: 'Bảo mật tuyệt đối', desc: 'Mã hóa dữ liệu chuẩn quốc tế' },
              { icon: BarChart3, title: 'Thống kê chi tiết', desc: 'Báo cáo trực quan theo thời gian thực' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-blue-200">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-300">
          © 2024 WarrantyPro System. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100"
          >
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 text-sm font-medium group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Quay lại trang chủ
              </button>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
              <p className="text-gray-500">Chào mừng trở lại! Vui lòng nhập thông tin.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Chọn vai trò</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((r) => {
                    const isActive = role === r.id
                    const Icon = r.icon
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isActive
                            ? `border-${r.color}-500 bg-${r.color}-50 text-${r.color}-700`
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500'
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? `text-${r.color}-600` : ''}`} />
                        <span className="text-xs font-semibold">{r.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email hoặc Tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2
                  ${activeRole.id === 'khachhang' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : ''}
                  ${activeRole.id === 'nhanvien' ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800' : ''}
                  ${activeRole.id === 'quanly' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' : ''}
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
