import { useState, useEffect } from 'react'
import { employeeAPI, storage, inventoryAPI } from '../services/api'
import SettingsPage from './SettingsPage'
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  Package,
  Clock,
  Wrench,
  CheckCircle2,
  Search,
  X,
  Upload,
  Plus,
  AlertCircle,
  FileText,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EmployeePage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data states
  const [myTasks, setMyTasks] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  })

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all') // all, tiep_nhan, dang_kiem_tra, dang_sua, hoan_tat
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Form states
  const [inspectionForm, setInspectionForm] = useState({
    loaiLoiDuDoan: 'loi_nsx',
    moTaKiemTra: '',
    canThayThe: false,
    linhKienCanThay: ''
  })

  const [repairForm, setRepairForm] = useState({
    ghiChu: '',
    chiPhiPhatSinh: 0
  })

  const [unableReason, setUnableReason] = useState('')
  const [showInspectModal, setShowInspectModal] = useState(false)
  const [showRepairModal, setShowRepairModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showUnableModal, setShowUnableModal] = useState(false)

  // Progress & Upload states
  const [progressUpdate, setProgressUpdate] = useState({
    ticketId: '',
    moTaTienDo: ''
  })
  const [uploadImages, setUploadImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])

  // Inventory State
  const [inventory, setInventory] = useState([])
  const [partSelection, setPartSelection] = useState({
    linhKienId: '',
    soLuong: 1
  })

  // Complete Repair State
  const [completeForm, setCompleteForm] = useState({
    moTaXuLy: '',
    chiPhiPhatSinh: 0
  })

  const user = storage.getUser()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (activeTab === 'dashboard' || activeTab === 'myTasks') {
      await loadMyTasks()
    }
  }

  const loadMyTasks = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await employeeAPI.getMyTasks()
      console.log('📋 My tasks:', data)

      const tasks = data.tickets || data.tasks || []
      setMyTasks(tasks)

      // Calculate stats
      setStats({
        total: tasks.length,
        pending: tasks.filter(t => t.trangThai === 'tiep_nhan').length,
        inProgress: tasks.filter(t => ['dang_kiem_tra', 'dang_sua'].includes(t.trangThai)).length,
        completed: tasks.filter(t => t.trangThai === 'hoan_tat').length
      })
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter tasks based on status and search text
  const getFilteredTasks = () => {
    let filtered = myTasks

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.trangThai === filterStatus)
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(task =>
        task.maPhieu?.toLowerCase().includes(search) ||
        task.sanPhamId?.tenSP?.toLowerCase().includes(search) ||
        task.khachHangId?.hoTen?.toLowerCase().includes(search) ||
        task.moTaLoi?.toLowerCase().includes(search)
      )
    }

    // Filter by date range (based on ngayTiepNhan)
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      filtered = filtered.filter(task => {
        if (!task.ngayTiepNhan) return false
        const t = new Date(task.ngayTiepNhan)
        return t >= from
      })
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter(task => {
        if (!task.ngayTiepNhan) return false
        const t = new Date(task.ngayTiepNhan)
        return t <= to
      })
    }

    return filtered
  }

  const handleInspect = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      await employeeAPI.inspectProduct(selectedTicket._id, inspectionForm)

      setSuccess('✅ Đã bắt đầu kiểm tra sản phẩm')
      setShowInspectModal(false)
      setInspectionForm({
        loaiLoiDuDoan: 'loi_nsx',
        moTaKiemTra: '',
        canThayThe: false,
        linhKienCanThay: ''
      })
      loadMyTasks()
      setSelectedTicket(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkUnableToRepair = async () => {
    try {
      setLoading(true)
      setError('')

      await employeeAPI.markUnableToRepair(selectedTicket._id, unableReason)

      setSuccess('✅ Đã đánh dấu không thể sửa')
      setShowUnableModal(false)
      setUnableReason('')
      loadMyTasks()
      setSelectedTicket(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      if (!progressUpdate.ticketId) {
        setError('Không tìm thấy phiếu bảo hành')
        return
      }

      await employeeAPI.updateRepairProgress(progressUpdate.ticketId, {
        moTaTienDo: progressUpdate.moTaTienDo
      })

      setSuccess('✅ Cập nhật tiến độ thành công')
      setProgressUpdate({ ticketId: '', moTaTienDo: '' })
      loadMyTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadImages(files)

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleUploadImages = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      if (uploadImages.length === 0) {
        setError('Vui lòng chọn ít nhất 1 hình ảnh')
        return
      }

      if (!progressUpdate.ticketId) {
        setError('Không tìm thấy phiếu bảo hành')
        return
      }

      // Convert images to base64 or URLs (simplified version)
      const imageUrls = uploadImages.map(img => img.name) // TODO: Implement proper file upload

      await employeeAPI.uploadRepairImages(progressUpdate.ticketId, imageUrls)

      setSuccess(`✅ Đã tải lên ${uploadImages.length} hình ảnh`)
      setUploadImages([])

      // Clean up preview URLs
      imagePreview.forEach(url => URL.revokeObjectURL(url))
      setImagePreview([])

      loadMyTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPart = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      if (!partSelection.linhKienId) {
        setError('Vui lòng chọn linh kiện')
        return
      }

      await employeeAPI.addPartToTicket(selectedTicket._id, partSelection)

      setSuccess('✅ Đã thêm linh kiện vào phiếu')
      setPartSelection({ linhKienId: '', soLuong: 1 })

      // Refresh ticket data
      loadMyTasks()
      // Also refresh inventory to show updated stock
      const invData = await inventoryAPI.getAll()
      setInventory(invData || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showDetailModal) {
      const loadInv = async () => {
        try {
          const data = await inventoryAPI.getAll()
          setInventory(data || [])
        } catch (err) {
          console.error('Error loading inventory:', err)
        }
      }
      loadInv()
    }
  }, [showDetailModal])

  const handleCompleteRepair = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      // Prepare data in correct format for backend
      const requestData = {
        moTaXuLy: completeForm.moTaXuLy,
        ghiChu: completeForm.moTaXuLy, // Use same text for history
        chiPhiPhatSinh: completeForm.chiPhiPhatSinh,
        linhKienThayThe: [] // Empty array as we use linhKienSuDung instead
      }

      await employeeAPI.completeRepair(selectedTicket._id, requestData)

      setSuccess('✅ Hoàn tất sửa chữa thành công')
      setShowRepairModal(false)
      setCompleteForm({ moTaXuLy: '', chiPhiPhatSinh: 0 })
      loadMyTasks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      tiep_nhan: { text: 'Tiếp nhận', color: 'bg-blue-100 text-blue-800', icon: <Upload className="w-4 h-4" /> },
      dang_kiem_tra: { text: 'Đang kiểm tra', color: 'bg-yellow-100 text-yellow-800', icon: <Search className="w-4 h-4" /> },
      dang_sua: { text: 'Đang sửa', color: 'bg-purple-100 text-purple-800', icon: <Wrench className="w-4 h-4" /> },
      hoan_tat: { text: 'Hoàn tất', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
      tu_choi: { text: 'Từ chối', color: 'bg-red-100 text-red-800', icon: <X className="w-4 h-4" /> },
      khong_sua_duoc: { text: 'Không sửa được', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> }
    }
    return badges[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> }
  }

  const getPriorityColor = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'border-l-4 border-red-500'
    if (days < 3) return 'border-l-4 border-orange-500'
    if (days < 7) return 'border-l-4 border-yellow-500'
    return 'border-l-4 border-blue-500'
  }

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'myTasks', label: 'Công việc của tôi', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Trang Nhân Viên</h1>
              <p className="text-xs text-gray-500">Xin chào, <strong>{user?.hoTen || 'Nhân viên'}</strong></p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Navigation */}
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

        {/* Content */}
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

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-600" />
                    Cài đặt tài khoản
                  </h2>
                  <SettingsPage onSaved={(u) => { }} />
                </div>
              )}

              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Tổng quan công việc</h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Package className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Tổng công việc</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Chờ xử lý</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.inProgress}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Đang xử lý</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Hoàn tất</div>
                    </div>
                  </div>

                  {/* Recent Tasks */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📌 Công việc gần đây</h3>
                    {loading && <div className="text-center py-4 text-gray-500">⏳ Đang tải...</div>}

                    {!loading && myTasks.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-gray-500">Không có công việc nào được gán</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myTasks.slice(0, 6).map(task => {
                        const badge = getStatusBadge(task.trangThai)
                        const priorityClass = getPriorityColor(task.ngayTiepNhan)

                        return (
                          <div key={task._id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${priorityClass}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">{task.maPhieu}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                {badge.icon}
                                {badge.text}
                              </span>
                            </div>

                            <h4 className="font-bold text-gray-800 mb-1">{task.sanPhamId?.tenSP || 'Sản phẩm'}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <User className="w-4 h-4" />
                              {task.khachHangId?.hoTen || 'Khách hàng'}
                            </div>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.moTaLoi}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <span className="text-xs text-gray-400">
                                {new Date(task.ngayTiepNhan).toLocaleDateString('vi-VN')}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedTicket(task)
                                  setShowDetailModal(true)
                                }}
                                className="text-blue-600 text-sm font-medium hover:underline"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MY TASKS TAB */}
              {activeTab === 'myTasks' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">📋 Công việc của tôi</h2>
                    <button
                      onClick={loadMyTasks}
                      disabled={loading}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      🔄 Làm mới
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Tất cả ({myTasks.length})</option>
                        <option value="tiep_nhan">Chờ kiểm tra ({myTasks.filter(t => t.trangThai === 'tiep_nhan').length})</option>
                        <option value="dang_kiem_tra">Đang kiểm tra ({myTasks.filter(t => t.trangThai === 'dang_kiem_tra').length})</option>
                        <option value="dang_sua">Đang sửa ({myTasks.filter(t => t.trangThai === 'dang_sua').length})</option>
                        <option value="hoan_tat">Hoàn tất ({myTasks.filter(t => t.trangThai === 'hoan_tat').length})</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Mã phiếu, sản phẩm..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        {searchText && (
                          <button
                            onClick={() => setSearchText('')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng ngày</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasks Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả lỗi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày nhận</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getFilteredTasks().map(task => {
                            const badge = getStatusBadge(task.trangThai)
                            return (
                              <tr key={task._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-blue-600">{task.maPhieu}</td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{task.sanPhamId?.tenSP || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{task.sanPhamId?.loaiSanPham}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{task.khachHangId?.hoTen || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{task.moTaLoi}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(task.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                    {badge.icon}
                                    {badge.text}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  {task.trangThai === 'tiep_nhan' && (
                                    <button
                                      onClick={() => {
                                        setSelectedTicket(task)
                                        setShowInspectModal(true)
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                      title="Kiểm tra"
                                    >
                                      <Search className="w-5 h-5" />
                                    </button>
                                  )}

                                  {(task.trangThai === 'dang_kiem_tra' || task.trangThai === 'dang_sua') && (
                                    <button
                                      onClick={() => {
                                        setSelectedTicket(task)
                                        setProgressUpdate({
                                          ticketId: task._id,
                                          moTaTienDo: ''
                                        })
                                        setShowDetailModal(true)
                                      }}
                                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                      title="Xử lý"
                                    >
                                      <Wrench className="w-5 h-5" />
                                    </button>
                                  )}

                                  {task.trangThai !== 'dang_kiem_tra' && task.trangThai !== 'dang_sua' && task.trangThai !== 'tiep_nhan' && (
                                    <button
                                      onClick={() => {
                                        setSelectedTicket(task)
                                        setShowDetailModal(true)
                                      }}
                                      className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                                      title="Chi tiết"
                                    >
                                      <FileText className="w-5 h-5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {getFilteredTasks().length === 0 && (
                      <div className="text-center py-8 text-gray-500">Không tìm thấy kết quả phù hợp</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* INSPECT MODAL */}
      {showInspectModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" /> Kiểm tra sản phẩm
              </h3>
              <button onClick={() => setShowInspectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP}</p>
                <p><strong>Mô tả lỗi:</strong> {selectedTicket.moTaLoi}</p>
              </div>

              <form onSubmit={handleInspect} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại lỗi dự đoán *</label>
                  <select
                    value={inspectionForm.loaiLoiDuDoan}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, loaiLoiDuDoan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="loi_nsx">Lỗi nhà sản xuất</option>
                    <option value="loi_su_dung">Lỗi do sử dụng</option>
                    <option value="hong_tu_nhien">Hỏng tự nhiên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả kết quả kiểm tra *</label>
                  <textarea
                    value={inspectionForm.moTaKiemTra}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, moTaKiemTra: e.target.value })}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                    placeholder="Nhập kết quả kiểm tra chi tiết..."
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canThayThe"
                    checked={inspectionForm.canThayThe}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, canThayThe: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canThayThe" className="text-sm text-gray-700">Cần thay thế linh kiện</label>
                </div>

                {inspectionForm.canThayThe && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linh kiện cần thay</label>
                    <input
                      type="text"
                      value={inspectionForm.linhKienCanThay}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, linhKienCanThay: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: Dây đan, grip..."
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Bắt đầu kiểm tra'}
                  </button>
                  <button type="button" onClick={() => setShowInspectModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REPAIR MODAL */}
      {showRepairModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Hoàn tất sửa chữa
              </h3>
              <button onClick={() => setShowRepairModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-xl mb-6 text-sm">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP}</p>
              </div>

              <form onSubmit={handleCompleteRepair} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú hoàn tất *</label>
                  <textarea
                    value={repairForm.ghiChu}
                    onChange={(e) => setRepairForm({ ...repairForm, ghiChu: e.target.value })}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                    placeholder="Mô tả công việc đã thực hiện..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí phát sinh (nếu có)</label>
                  <input
                    type="number"
                    value={repairForm.chiPhiPhatSinh}
                    onChange={(e) => setRepairForm({ ...repairForm, chiPhiPhatSinh: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Hoàn tất phiếu'}
                  </button>
                  <button type="button" onClick={() => setShowRepairModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Simplified for brevity, but should include similar styling) */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Chi tiết phiếu {selectedTicket.maPhieu}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-3">Thông tin chung</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Sản phẩm:</span> <span className="font-medium">{selectedTicket.sanPhamId?.tenSP}</span></p>
                      <p><span className="text-gray-500">Khách hàng:</span> <span className="font-medium">{selectedTicket.khachHangId?.hoTen}</span></p>
                      <p><span className="text-gray-500">Ngày nhận:</span> <span className="font-medium">{new Date(selectedTicket.ngayTiepNhan).toLocaleDateString('vi-VN')}</span></p>
                      <p><span className="text-gray-500">Mô tả lỗi:</span> <span className="font-medium">{selectedTicket.moTaLoi}</span></p>
                    </div>
                  </div>

                  {/* Progress Update Form */}
                  {(selectedTicket.trangThai === 'dang_kiem_tra' || selectedTicket.trangThai === 'dang_sua') && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-3">Cập nhật tiến độ</h4>
                      <div className="space-y-3">
                        <textarea
                          value={progressUpdate.moTaTienDo}
                          onChange={(e) => setProgressUpdate({ ...progressUpdate, ticketId: selectedTicket._id, moTaTienDo: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-200 text-sm"
                          placeholder="Nhập nội dung cập nhật..."
                          rows="2"
                        />
                        <button
                          onClick={handleUpdateProgress}
                          disabled={!progressUpdate.moTaTienDo.trim()}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          Gửi cập nhật
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: History & Actions */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Lịch sử xử lý</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {selectedTicket.moTaTienDo?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
                          <div>
                            <p className="text-gray-800">{item.noiDung}</p>
                            <span className="text-xs text-gray-400">{new Date(item.thoiGian).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      ))}
                      {(!selectedTicket.moTaTienDo || selectedTicket.moTaTienDo.length === 0) && (
                        <p className="text-gray-500 text-sm italic">Chưa có cập nhật nào</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(selectedTicket.trangThai === 'dang_kiem_tra' || selectedTicket.trangThai === 'dang_sua') && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <button
                        onClick={() => {
                          setShowDetailModal(false)
                          setShowRepairModal(true)
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                      >
                        ✅ Hoàn tất sửa chữa
                      </button>

                      <button
                        onClick={() => {
                          setShowDetailModal(false)
                          setShowUnableModal(true)
                        }}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-5 h-5" />
                        Không thể sửa chữa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* UNABLE TO REPAIR MODAL */}
      {showUnableModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /> Không thể sửa chữa
              </h3>
              <button onClick={() => setShowUnableModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Bạn đang đánh dấu phiếu <strong>{selectedTicket.maPhieu}</strong> là không thể sửa chữa.
                Vui lòng nhập lý do chi tiết bên dưới.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do không thể sửa *</label>
                  <textarea
                    value={unableReason}
                    onChange={(e) => setUnableReason(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                    rows="4"
                    placeholder="VD: Thiếu linh kiện, hỏng quá nặng..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleMarkUnableToRepair}
                    disabled={!unableReason.trim() || loading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                  <button
                    onClick={() => setShowUnableModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
