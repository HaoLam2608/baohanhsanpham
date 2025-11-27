import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Tag,
  Search,
  Settings,
  Star,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  ChevronRight,
  History,
  MapPin,
  FileText,
  Image as ImageIcon,
  Trash2,
  Filter
} from 'lucide-react'
import { customerAPI, generalAPI } from '../services/api'
import SettingsPage from './SettingsPage'

export default function CustomerPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data states
  const [myTickets, setMyTickets] = useState([])
  const [myProducts, setMyProducts] = useState([])

  // Forms & Search states
  const [ticketSearch, setTicketSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pwSearch, setPwSearch] = useState('')



  // Create Ticket Form
  const createInitialWarrantyForm = () => ({
    maDonHang: '',
    soSerial: '',
    sanPhamId: '',
    moTaLoi: '',
    attachments: []
  })
  const [warrantyForm, setWarrantyForm] = useState(createInitialWarrantyForm())

  // Tracking
  const [ticketCode, setTicketCode] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)

  // Product Warranty Detail
  const [productWarrantyInfo, setProductWarrantyInfo] = useState(null)

  // Rating
  const [ratingForm, setRatingForm] = useState({ ticketId: '', rating: 0, comment: '' })

  // Constants
  const MAX_ATTACHMENT_SIZE_MB = 5
  const MAX_ATTACHMENT_COUNT = 3

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ticketsRes, productsRes] = await Promise.all([
        customerAPI.getMyTickets(),
        customerAPI.getMyProducts()
      ])
      setMyTickets(ticketsRes.data)
      setMyProducts(productsRes.data)
    } catch (err) {
      console.error(err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Helper Functions
  const getStatusBadge = (status) => {
    const config = {
      dang_cho: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" />, text: 'Đang chờ' },
      tiep_nhan: { color: 'bg-blue-100 text-blue-700', icon: <ClipboardList className="w-4 h-4" />, text: 'Đã tiếp nhận' },
      dang_kiem_tra: { color: 'bg-indigo-100 text-indigo-700', icon: <Search className="w-4 h-4" />, text: 'Đang kiểm tra' },
      dang_sua: { color: 'bg-purple-100 text-purple-700', icon: <Wrench className="w-4 h-4" />, text: 'Đang sửa' },
      hoan_tat: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" />, text: 'Hoàn tất' },
      tu_choi: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-4 h-4" />, text: 'Từ chối' }
    }
    return config[status] || { color: 'bg-gray-100 text-gray-700', icon: <AlertCircle className="w-4 h-4" />, text: 'Không xác định' }
  }

  const getProgressPercentage = (status) => {
    const map = {
      dang_cho: 10,
      tiep_nhan: 30,
      dang_kiem_tra: 50,
      dang_sua: 70,
      hoan_tat: 100,
      tu_choi: 100
    }
    return map[status] || 0
  }

  // Handlers
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      // Include customer id so backend knows which customer is submitting
      if (user?._id || user?.id) formData.append('khachHangId', user._id || user.id)
      if (warrantyForm.maDonHang) formData.append('maDonHang', warrantyForm.maDonHang)
      if (warrantyForm.soSerial) formData.append('soSerial', warrantyForm.soSerial)
      if (warrantyForm.sanPhamId) formData.append('sanPhamId', warrantyForm.sanPhamId)
      formData.append('moTaLoi', warrantyForm.moTaLoi)

      // Include contact info (thongTinLienHe) so backend validation can read hoTen/soDienThoai
      const contactInfo = {
        hoTen: user?.hoTen || '',
        soDienThoai: user?.soDienThoai || '',
        email: user?.email || '',
        maDonHang: warrantyForm.maDonHang || '',
        soSerial: warrantyForm.soSerial || ''
      }
      formData.append('thongTinLienHe', JSON.stringify(contactInfo))

      warrantyForm.attachments.forEach(file => {
        formData.append('attachments', file)
      })

      await customerAPI.createTicket(formData)
      setSuccess('Gửi yêu cầu bảo hành thành công!')
      setWarrantyForm(createInitialWarrantyForm())
      fetchData()
      setActiveTab('myTickets')
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Lỗi khi gửi yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await customerAPI.submitRating(ratingForm.ticketId, {
        rating: ratingForm.rating,
        comment: ratingForm.comment
      })

      setSuccess('Cảm ơn bạn đã đánh giá dịch vụ!')
      // Update local rating form + tickets
      setRatingForm({ ticketId: '', rating: 0, comment: '' })
      fetchData() // Reload tickets to update list

      // If the user is currently viewing the tracked ticket, re-fetch it from server so the UI shows saved rating
      try {
        if (trackingResult) {
          // use ticket _id if available (ratingForm.ticketId is _id), track endpoint accepts id or maPhieu
          const refreshed = await customerAPI.trackTicket(ratingForm.ticketId)
          if (refreshed) setTrackingResult(refreshed)
        }
      } catch (e) {
        // ignore refresh errors
      }
    } catch (err) {
      setError(err.message || 'Gửi đánh giá thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackTicket = async (e) => {
    e.preventDefault()
    if (!ticketCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await customerAPI.trackTicket(ticketCode)
      setTrackingResult(res)
    } catch (err) {
      setError('Không tìm thấy phiếu bảo hành hoặc có lỗi xảy ra')
      setTrackingResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await customerAPI.createBooking(bookingForm)
      setSuccess('Đặt lịch hẹn thành công! Chúng tôi sẽ liên hệ lại sớm.')
      setBookingForm({ ...bookingForm, date: '', time: '', note: '' })
    } catch (err) {
      setError(err.message || 'Đặt lịch thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Payment Handler
  const handlePayment = async (ticketId) => {
    if (!window.confirm('Bạn có chắc chắn muốn thanh toán chi phí này không?')) return

    try {
      setLoading(true)
      setError('')

      await customerAPI.processPayment(ticketId)
      setSuccess('Thanh toán thành công!')

      // Refresh ticket data
      if (ticketCode) {
        const data = await customerAPI.trackTicket(ticketCode)
        setTrackingResult(data)
      }
      fetchData() // Refresh my tickets list
    } catch (err) {
      setError(err.message || 'Thanh toán thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Filter Logic
  const filteredTickets = myTickets.filter(t => {
    const matchSearch =
      t.maPhieu.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.sanPhamId?.tenSP.toLowerCase().includes(ticketSearch.toLowerCase())
    const matchStatus = statusFilter ? t.trangThai === statusFilter : true
    const matchDate = (!dateFrom || new Date(t.ngayTiepNhan) >= new Date(dateFrom)) &&
      (!dateTo || new Date(t.ngayTiepNhan) <= new Date(dateTo))
    return matchSearch && matchStatus && matchDate
  })

  const filteredProducts = myProducts.filter(p =>
    p.tenSP.toLowerCase().includes(pwSearch.toLowerCase()) ||
    p.soSerial.toLowerCase().includes(pwSearch.toLowerCase())
  )

  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'createRequest', label: 'Gửi yêu cầu', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'myTickets', label: 'Phiếu của tôi', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'productWarranty', label: 'Tra cứu SP', icon: <Tag className="w-5 h-5" /> },
    { id: 'track', label: 'Tra cứu phiếu', icon: <Search className="w-5 h-5" /> },
    { id: 'rate', label: 'Đánh giá', icon: <Star className="w-5 h-5" /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="customer-page min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="customer-header bg-white shadow-sm sticky top-0 z-30">
        <div className="header-content max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="logo flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-xl text-gray-800">WarrantyPro</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="user-info flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <div className="font-semibold text-sm text-gray-800">{user?.hoTen}</div>
                <div className="text-xs text-gray-500">Khách hàng</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <div className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center justify-between border border-red-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                  <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-between border border-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{success}</span>
                  </div>
                  <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Tổng quan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{myTickets.length}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Tổng phiếu</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {myTickets.filter(t => ['dang_cho', 'tiep_nhan', 'dang_kiem_tra', 'dang_sua'].includes(t.trangThai)).length}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">Đang xử lý</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          {myTickets.filter(t => t.trangThai === 'hoan_tat').length}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">Hoàn tất</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Tag className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{myProducts.length}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Sản phẩm</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Phiếu bảo hành gần đây</h3>
                    {myTickets.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-gray-100">
                              <th className="pb-3 font-medium">Mã phiếu</th>
                              <th className="pb-3 font-medium">Sản phẩm</th>
                              <th className="pb-3 font-medium">Ngày gửi</th>
                              <th className="pb-3 font-medium">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {myTickets.slice(0, 5).map(ticket => (
                              <tr key={ticket._id} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 font-medium text-blue-600">{ticket.maPhieu}</td>
                                <td className="py-3 text-gray-800">{ticket.sanPhamId?.tenSP || 'N/A'}</td>
                                <td className="py-3 text-gray-500">{new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.trangThai).color}`}>
                                    {getStatusBadge(ticket.trangThai).icon}
                                    {getStatusBadge(ticket.trangThai).text}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Chưa có phiếu bảo hành nào</p>
                    )}
                  </div>
                </div>
              )}

              {/* BOOKING TAB */}
              {activeTab === 'booking' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Đặt lịch hẹn bảo hành
                  </h2>
                  <form onSubmit={handleBookingSubmit} className="max-w-2xl">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm</label>
                        <select
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={bookingForm.productId}
                          onChange={e => setBookingForm({ ...bookingForm, productId: e.target.value })}
                          required
                        >
                          <option value="">-- Chọn sản phẩm cần bảo hành --</option>
                          {myProducts.map(p => (
                            <option key={p._id} value={p._id}>{p.tenSP} - {p.soSerial}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chi nhánh</label>
                        <select
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={bookingForm.branch}
                          onChange={e => setBookingForm({ ...bookingForm, branch: e.target.value })}
                        >
                          <option value="chinhanh1">Chi nhánh 1 - Quận 1, TP.HCM</option>
                          <option value="chinhanh2">Chi nhánh 2 - Cầu Giấy, Hà Nội</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hẹn</label>
                        <input
                          type="date"
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={bookingForm.date}
                          onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hẹn</label>
                        <input
                          type="time"
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={bookingForm.time}
                          onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
                      <textarea
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                        placeholder="Mô tả sơ qua về vấn đề hoặc yêu cầu đặc biệt..."
                        value={bookingForm.note}
                        onChange={e => setBookingForm({ ...bookingForm, note: e.target.value })}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Xác nhận đặt lịch
                    </button>
                  </form>
                </div>
              )}

              {/* PRODUCT WARRANTY TAB (With Digital Card) */}
              {activeTab === 'productWarranty' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[calc(100vh-200px)] overflow-y-auto">
                      <div className="mb-4">
                        <input
                          type="search"
                          placeholder="Tìm sản phẩm..."
                          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                          value={pwSearch}
                          onChange={e => setPwSearch(e.target.value)}
                        />
                      </div>
                      <div className="space-y-3">
                        {filteredProducts.map(product => (
                          <div
                            key={product._id}
                            onClick={() => {
                              const purchaseDate = new Date(product.ngayMua)
                              const warrantyEndDate = new Date(purchaseDate.getTime() + product.thoiHanBaoHanhThang * 30 * 24 * 60 * 60 * 1000)
                              const daysLeft = Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))
                              const totalDays = product.thoiHanBaoHanhThang * 30
                              const percentUsed = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100))

                              setProductWarrantyInfo({
                                product,
                                purchaseDate,
                                warrantyEndDate,
                                daysLeft,
                                percentUsed,
                                status: daysLeft > 0 ? 'valid' : 'expired',
                                tickets: myTickets.filter(t => t.sanPhamId?._id === product._id)
                              })
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${productWarrantyInfo?.product._id === product._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-100 hover:bg-gray-50'
                              }`}
                          >
                            <div className="font-semibold text-gray-800">{product.tenSP}</div>
                            <div className="text-xs text-gray-500">{product.soSerial}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detail */}
                    <div className="lg:col-span-2">
                      {productWarrantyInfo ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{productWarrantyInfo.product.tenSP}</h3>
                              <p className="text-gray-500">{productWarrantyInfo.product.loaiSanPham} • {productWarrantyInfo.product.thuongHieu}</p>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="mb-8">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <History className="w-4 h-4" /> Timeline bảo hành
                            </h4>
                            <div className="relative pt-6 pb-2">
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${productWarrantyInfo.status === 'valid' ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${productWarrantyInfo.percentUsed}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between mt-2 text-sm text-gray-500">
                                <div>
                                  <div className="font-medium text-gray-800">Ngày mua</div>
                                  <div>{productWarrantyInfo.purchaseDate.toLocaleDateString('vi-VN')}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-800">Hết hạn</div>
                                  <div>{productWarrantyInfo.warrantyEndDate.toLocaleDateString('vi-VN')}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* History */}
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Lịch sử sửa chữa</h4>
                            {productWarrantyInfo.tickets.length > 0 ? (
                              <div className="space-y-4">
                                {productWarrantyInfo.tickets.map(ticket => (
                                  <div key={ticket._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className={`p-2 rounded-full ${getStatusBadge(ticket.trangThai).color}`}>
                                      {getStatusBadge(ticket.trangThai).icon}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">Phiếu {ticket.maPhieu}</div>
                                      <div className="text-sm text-gray-600 mb-1">{ticket.moTaLoi}</div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">Chưa có lịch sử bảo hành</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                          <Tag className="w-16 h-16 mb-4 opacity-20" />
                          <p>Chọn sản phẩm để xem chi tiết</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CREATE REQUEST TAB */}
              {activeTab === 'createRequest' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo yêu cầu bảo hành</h2>
                  <form onSubmit={handleCreateTicket} className="max-w-3xl">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm (nếu có trong danh sách)</label>
                        <select
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={warrantyForm.sanPhamId}
                          onChange={e => {
                            const prod = myProducts.find(p => p._id === e.target.value)
                            setWarrantyForm({
                              ...warrantyForm,
                              sanPhamId: e.target.value,
                              soSerial: prod ? prod.soSerial : ''
                            })
                          }}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {myProducts.map(p => (
                            <option key={p._id} value={p._id}>{p.tenSP}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số Serial *</label>
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={warrantyForm.soSerial}
                          onChange={e => setWarrantyForm({ ...warrantyForm, soSerial: e.target.value })}
                          required
                          placeholder="Nhập số serial..."
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả lỗi *</label>
                      <textarea
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="4"
                        value={warrantyForm.moTaLoi}
                        onChange={e => setWarrantyForm({ ...warrantyForm, moTaLoi: e.target.value })}
                        required
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                      ></textarea>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh/Video đính kèm</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={e => {
                            if (e.target.files.length + warrantyForm.attachments.length > MAX_ATTACHMENT_COUNT) {
                              setError(`Tối đa ${MAX_ATTACHMENT_COUNT} tệp`)
                              return
                            }
                            setWarrantyForm({
                              ...warrantyForm,
                              attachments: [...warrantyForm.attachments, ...Array.from(e.target.files)]
                            })
                          }}
                        />
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Kéo thả hoặc click để tải lên (Tối đa {MAX_ATTACHMENT_COUNT} tệp)</p>
                      </div>
                      {warrantyForm.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {warrantyForm.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newAtt = [...warrantyForm.attachments]
                                  newAtt.splice(idx, 1)
                                  setWarrantyForm({ ...warrantyForm, attachments: newAtt })
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Gửi yêu cầu bảo hành'}
                    </button>
                  </form>
                </div>
              )}

              {/* MY TICKETS TAB */}
              {activeTab === 'myTickets' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Phiếu bảo hành của tôi</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm mã phiếu, sản phẩm..."
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={ticketSearch}
                          onChange={e => setTicketSearch(e.target.value)}
                        />
                      </div>
                      <select
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="dang_cho">Đang chờ</option>
                        <option value="tiep_nhan">Đã tiếp nhận</option>
                        <option value="dang_sua">Đang sửa</option>
                        <option value="hoan_tat">Hoàn tất</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredTickets.map(ticket => (
                      <div key={ticket._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-lg text-gray-800">{ticket.sanPhamId?.tenSP || 'Sản phẩm'}</h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">#{ticket.maPhieu}</span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-1">{ticket.moTaLoi}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(ticket.trangThai).color}`}>
                              {getStatusBadge(ticket.trangThai).icon}
                              {getStatusBadge(ticket.trangThai).text}
                            </span>

                            {/* Show CTA when completed but not yet rated */}
                            {ticket.trangThai === 'hoan_tat' && !(ticket.qualityRating || ticket.qualityComments || ticket.danhGia || ticket.rating || ticket.isRated || ticket.userRated) && (
                              <button
                                onClick={() => {
                                  setRatingForm({ ticketId: ticket._id, rating: 5, comment: '' })
                                  setActiveTab('rate')
                                }}
                                className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                              >
                                Đánh giá ngay
                              </button>
                            )}
                            {/* if already rated, show nothing (no CTA) */}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="text-sm text-gray-500">
                            Ngày gửi: {new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}
                          </div>
                          <button
                            onClick={() => {
                              setTicketCode(ticket.maPhieu)
                              setActiveTab('track')
                            }}
                            className="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1"
                          >
                            Xem chi tiết <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredTickets.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Không tìm thấy phiếu bảo hành nào</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TRACK TAB */}
              {activeTab === 'track' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Tra cứu phiếu bảo hành</h2>
                  <form onSubmit={handleTrackTicket} className="flex gap-2 mb-8 max-w-xl">
                    <input
                      type="text"
                      placeholder="Nhập mã phiếu (VD: BH001234)"
                      className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={ticketCode}
                      onChange={e => setTicketCode(e.target.value)}
                    />
                    <button type="submit" className="btn-primary px-6 rounded-lg">Tra cứu</button>
                  </form>

                  {trackingResult && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Status Steps */}
                      <div className="relative py-8">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div className="relative z-10 flex justify-between">
                          {['tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat'].map((step, idx) => {
                            const isCompleted = getProgressPercentage(trackingResult.trangThai) >= getProgressPercentage(step)
                            const isCurrent = trackingResult.trangThai === step
                            return (
                              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'
                                  }`}>
                                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-gray-200"></div>}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                  {getStatusBadge(step).text}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 rounded-xl">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600" />
                            Thông tin sản phẩm
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Sản phẩm:</span>
                              <span className="font-medium">{trackingResult.sanPham?.tenSP}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Số Serial:</span>
                              <span className="font-medium">{trackingResult.sanPham?.soSerial}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Mã phiếu:</span>
                              <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                {trackingResult.maPhieu}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-purple-600" />
                            Chi tiết sửa chữa
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-gray-500 block mb-1">Mô tả lỗi:</span>
                              <p className="font-medium text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                                {trackingResult.moTaLoi}
                              </p>
                            </div>
                            {trackingResult.ketQuaKiemTra && (
                              <div>
                                <span className="text-gray-500 block mb-1">Kết quả kiểm tra:</span>
                                <p className="font-medium text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                                  {trackingResult.ketQuaKiemTra}
                                </p>
                              </div>
                            )}

                            {/* Rating display (if exists) */}
                            {(() => {
                              const r = trackingResult.qualityRating || trackingResult.danhGia || trackingResult.rating || trackingResult.ratingInfo || trackingResult.ratingData
                              if (!r) return null
                              // normalize
                              let score = null
                              let comment = null
                              let createdAt = null
                              if (typeof r === 'number') score = r
                              if (typeof r === 'string') {
                                // maybe comment only
                                comment = r
                              }
                              if (typeof r === 'object') {
                                score = r.rating || r.score || r.stars || r.point || null
                                comment = r.comment || r.noiDung || r.memo || r.note || r.text || null
                                createdAt = r.createdAt || r.thoiGian || null
                              }

                              return (
                                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="font-semibold text-gray-800">Đánh giá của bạn</div>
                                              {score ? (
                                                <div className="flex items-center gap-1">
                                                  {[1,2,3,4,5].map(i => (
                                                    <Star key={i} className={`w-4 h-4 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                                  ))}
                                                </div>
                                              ) : null}
                                    </div>
                                            {createdAt ? <div className="text-xs text-gray-400">{new Date(createdAt).toLocaleString('vi-VN')}</div> : null}
                                  </div>
                                          {comment ? <div className="text-gray-700 text-sm">{comment}</div> : <div className="text-sm text-gray-500">{trackingResult.qualityComments ? trackingResult.qualityComments : 'Không có nhận xét.'}</div>}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* History & Parts Section */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white rounded-xl border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            Tiến độ chi tiết
                          </h3>
                          <div className="space-y-3 text-sm">
                            {Array.isArray(trackingResult.moTaTienDo) && trackingResult.moTaTienDo.length > 0 ? (
                              <div className="space-y-2">
                                {trackingResult.moTaTienDo.slice().reverse().map((m, i) => (
                                  <div key={i} className="text-sm p-2 bg-gray-50 rounded border border-gray-100">
                                    <div className="text-gray-800">{m.noiDung}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(m.thoiGian).toLocaleString('vi-VN')}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Chưa có cập nhật tiến độ</p>
                            )}
                          </div>
                        </div>

                        <div className="p-6 bg-white rounded-xl border border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600" />
                            Linh kiện đã sử dụng / Thay thế
                          </h3>

                          <div className="space-y-4 text-sm">
                            <div>
                              <div className="text-gray-500 mb-2">Linh kiện đã sử dụng</div>
                              {Array.isArray(trackingResult.linhKienSuDung) && trackingResult.linhKienSuDung.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-gray-500 text-xs border-b border-gray-100">
                                        <th className="p-2">Tên linh kiện</th>
                                        <th className="p-2">Số lượng</th>
                                        <th className="p-2 text-right">Đơn giá</th>
                                        <th className="p-2 text-right">Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {trackingResult.linhKienSuDung.map((lk, i) => (
                                        <tr key={i}>
                                          <td className="p-2">{lk.tenLinhKien || lk.linhKienId?.tenLinhKien || '—'}</td>
                                          <td className="p-2">{lk.soLuong || 1}</td>
                                          <td className="p-2 text-right">{(lk.donGia || 0).toLocaleString('vi-VN')} đ</td>
                                          <td className="p-2 text-right">{(lk.thanhTien || ((lk.donGia || 0) * (lk.soLuong || 1))).toLocaleString('vi-VN')} đ</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-gray-500">Chưa có linh kiện sử dụng</p>
                              )}
                            </div>

                            <div>
                              <div className="text-gray-500 mb-2">Linh kiện thay thế (tổng quan)</div>
                              {Array.isArray(trackingResult.linhKienThayThe) && trackingResult.linhKienThayThe.length > 0 ? (
                                <ul className="space-y-2">
                                  {trackingResult.linhKienThayThe.map((lt, j) => (
                                    <li key={j} className="p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                      <div className="font-medium">{lt.tenLinhKien || lt.maLinhKien || 'Linh kiện'}</div>
                                      <div className="text-xs text-gray-500">Chi phí: {(lt.chiPhi || 0).toLocaleString('vi-VN')} đ</div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">Không có linh kiện thay thế</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Totals Summary */}
                      {(() => {
                        const usedParts = Array.isArray(trackingResult.linhKienSuDung) ? trackingResult.linhKienSuDung : []
                        const usedTotal = usedParts.reduce((s, it) => s + ((it.thanhTien != null) ? it.thanhTien : ((it.donGia || 0) * (it.soLuong || 1))), 0)
                        const replaced = Array.isArray(trackingResult.linhKienThayThe) ? trackingResult.linhKienThayThe : []
                        const replacedTotal = replaced.reduce((s, it) => s + (it.chiPhi || 0), 0)
                        const extraCost = trackingResult.chiPhiPhatSinh || 0
                        const estimatedTotal = usedTotal + replacedTotal + extraCost

                        return (
                          <div className="p-6 bg-white rounded-xl border border-gray-100 mb-4">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">Tổng chi phí</h3>
                            <div className="text-sm text-gray-700">
                              <div className="flex justify-between"><span className="text-gray-500">Linh kiện (đã sử dụng):</span><span className="font-mono">{usedTotal.toLocaleString('vi-VN')} đ</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Linh kiện thay thế (tổng quan):</span><span className="font-mono">{replacedTotal.toLocaleString('vi-VN')} đ</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Chi phí phát sinh:</span><span className="font-mono">{extraCost.toLocaleString('vi-VN')} đ</span></div>
                              <hr className="my-2" />
                              <div className="flex justify-between font-bold text-lg"><span>Tổng ước tính:</span><span className="font-mono">{estimatedTotal.toLocaleString('vi-VN')} đ</span></div>
                              {trackingResult.tongTien ? (
                                <div className="mt-2 text-sm text-green-600">Tổng sau khi hoàn tất: <span className="font-mono">{Number(trackingResult.tongTien).toLocaleString('vi-VN')} đ</span></div>
                              ) : null}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Payment Section */}
                      {(
                        (trackingResult.chiPhiPhatSinh && trackingResult.chiPhiPhatSinh > 0) ||
                        (Array.isArray(trackingResult.linhKienThayThe) && trackingResult.linhKienThayThe.length > 0)
                      ) && (
                        (() => {
                          const costs = []
                          if (trackingResult.chiPhiPhatSinh) costs.push({ moTaChiPhi: 'Chi phí phát sinh', soTien: trackingResult.chiPhiPhatSinh })
                          if (Array.isArray(trackingResult.linhKienThayThe)) trackingResult.linhKienThayThe.forEach(item => costs.push({ moTaChiPhi: item.tenLinhKien || 'Linh kiện', soTien: item.chiPhi || 0 }))
                          const totalFromItems = costs.reduce((s, c) => s + (c.soTien || 0), 0)
                          return (
                            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 payment-info">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                Chi phí sửa chữa
                              </h3>
                              <div className="bg-white rounded-lg border border-yellow-200 overflow-hidden mb-4">
                                <table className="w-full text-sm">
                                  <thead className="bg-yellow-50/50">
                                    <tr>
                                      <th className="p-3 text-left">Hạng mục</th>
                                      <th className="p-3 text-right">Chi phí</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {costs.map((cost, idx) => (
                                      <tr key={idx}>
                                        <td className="p-3">{cost.moTaChiPhi}</td>
                                        <td className="p-3 text-right font-mono">{(cost.soTien || 0).toLocaleString('vi-VN')} đ</td>
                                      </tr>
                                    ))}
                                    <tr className="font-bold bg-gray-50">
                                      <td className="p-3">Tổng cộng</td>
                                      <td className="p-3 text-right text-red-600">{totalFromItems.toLocaleString('vi-VN')} đ</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center md:justify-end items-start gap-4">
                                <div className="text-sm md:text-right">
                                  <div>
                                    <span className="text-gray-500">Tổng (tính từ mục): </span>
                                    <span className="font-bold">{totalFromItems.toLocaleString('vi-VN')} đ</span>
                                  </div>
                                  {trackingResult.tongTien ? (
                                    <div className="text-green-600 font-semibold">Tổng sau khi hoàn tất: {Number(trackingResult.tongTien).toLocaleString('vi-VN')} đ</div>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-sm">
                                    <span className="text-gray-500">Trạng thái: </span>
                                    <span className={`font-bold ${trackingResult.trangThaiThanhToan === 'da_thanh_toan' ? 'text-green-600' : 'text-red-500'}`}>
                                      {trackingResult.trangThaiThanhToan === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                  </div>
                                  {trackingResult.trangThaiThanhToan !== 'da_thanh_toan' && (
                                    <button onClick={() => handlePayment(trackingResult._id || trackingResult.maPhieu)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors">Thanh toán ngay</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* RATE TAB */}
              {activeTab === 'rate' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá dịch vụ</h2>

                  {myTickets.filter(t => t.trangThai === 'hoan_tat' && !t.qualityRating).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Không có phiếu cần đánh giá</h3>
                      <p className="text-gray-600">
                        {myTickets.filter(t => t.trangThai === 'hoan_tat').length === 0
                          ? "Bạn chưa có phiếu bảo hành nào đã hoàn tất."
                          : "Bạn đã đánh giá tất cả các phiếu hoàn tất. Cảm ơn bạn!"}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-blue-800">
                          <strong>Lưu ý:</strong> Mỗi phiếu bảo hành chỉ được đánh giá một lần duy nhất. Ý kiến của bạn giúp chúng tôi cải thiện chất lượng dịch vụ.
                        </p>
                      </div>

                      <form onSubmit={handleSubmitRating} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phiếu đã hoàn tất</label>
                          <select
                            value={ratingForm.ticketId}
                            onChange={(e) => setRatingForm({ ...ratingForm, ticketId: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            required
                          >
                            <option value="">-- Chọn phiếu --</option>
                            {myTickets.filter(t => t.trangThai === 'hoan_tat' && !t.qualityRating).map(ticket => (
                              <option key={ticket._id} value={ticket._id}>
                                {ticket.maPhieu} - {ticket.sanPhamId?.tenSP}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ hài lòng</label>
                          <div className="flex gap-4 justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-10 h-10 ${star <= ratingForm.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-200'
                                    }`}
                                />
                              </button>
                            ))}
                          </div>
                          {ratingForm.rating > 0 && (
                            <p className="text-center mt-2 text-sm font-medium text-yellow-600">
                              {ratingForm.rating === 5 && 'Tuyệt vời! 😍'}
                              {ratingForm.rating === 4 && 'Hài lòng 🙂'}
                              {ratingForm.rating === 3 && 'Bình thường 😐'}
                              {ratingForm.rating === 2 && 'Không hài lòng 😞'}
                              {ratingForm.rating === 1 && 'Rất tệ 😡'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn</label>
                          <textarea
                            value={ratingForm.comment}
                            onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ sửa chữa..."
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !ratingForm.ticketId || ratingForm.rating === 0}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <Star className="w-5 h-5" />
                              Gửi đánh giá
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <SettingsPage user={user} />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>


    </div>
  )
}
