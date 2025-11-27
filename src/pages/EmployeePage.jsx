import { useState, useEffect } from 'react'
import { employeeAPI, storage } from '../services/api'
import '../styles/EmployeePage.css'
import SettingsPage from './SettingsPage'

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

  const handleCompleteRepair = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      await employeeAPI.completeRepair(selectedTicket._id, repairForm)

      setSuccess('✅ Đã hoàn tất sửa chữa')
      setShowRepairModal(false)
      setRepairForm({ ghiChu: '', chiPhiPhatSinh: 0 })
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

  const getStatusBadge = (status) => {
    const badges = {
      tiep_nhan: { text: 'Tiếp nhận', color: 'info', icon: '📥' },
      dang_kiem_tra: { text: 'Đang kiểm tra', color: 'warning', icon: '🔍' },
      dang_sua: { text: 'Đang sửa', color: 'primary', icon: '🔧' },
      hoan_tat: { text: 'Hoàn tất', color: 'success', icon: '✅' },
      tu_choi: { text: 'Từ chối', color: 'danger', icon: '❌' },
      khong_sua_duoc: { text: 'Không sửa được', color: 'secondary', icon: '⚠️' }
    }
    return badges[status] || { text: status, color: 'secondary', icon: '❓' }
  }

  const getPriorityColor = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'urgent'
    if (days < 3) return 'high'
    if (days < 7) return 'medium'
    return 'low'
  }

  // Helper: format file size like CustomerPage
  const formatAttachmentSize = (size) => {
    if (size === undefined || size === null) return ''
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="employee-page">
      {/* Header */}
      <header className="employee-header">
        <div className="header-content">
          <div className="header-info">
            <h1>🛠️ Trang Nhân Viên</h1>
            <p className="header-subtitle">Xin chào, <strong>{user?.hoTen || 'Nhân viên'}</strong></p>
          </div>
          <button onClick={onLogout} className="btn-logout">
            🚪 Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="employee-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span>
          <span>Tổng quan</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'myTasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('myTasks')}
        >
          <span className="tab-icon">📋</span>
          <span>Công việc của tôi</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="tab-icon">⚙️</span>
          <span>Cài đặt</span>
        </button>
      </nav>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">✕</button>
        </div>
      )}

      {/* Content */}
      <main className="employee-content">
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2 className="section-title">⚙️ Cài đặt tài khoản</h2>
            <SettingsPage onSaved={(u) => { }} />
          </div>
        )}
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2 className="section-title">📊 Tổng quan công việc</h2>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <div className="stat-label">Tổng công việc</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-icon">📥</div>
                <div className="stat-info">
                  <div className="stat-label">Chờ xử lý</div>
                  <div className="stat-value">{stats.pending}</div>
                </div>
              </div>

              <div className="stat-card progress">
                <div className="stat-icon">🔧</div>
                <div className="stat-info">
                  <div className="stat-label">Đang xử lý</div>
                  <div className="stat-value">{stats.inProgress}</div>
                </div>
              </div>

              <div className="stat-card completed">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-label">Hoàn tất</div>
                  <div className="stat-value">{stats.completed}</div>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="recent-tasks">
              <h3>📌 Công việc gần đây</h3>
              {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

              {!loading && myTasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>Không có công việc nào được gán</p>
                </div>
              )}

              <div className="tasks-grid">
                {myTasks.slice(0, 6).map(task => {
                  const badge = getStatusBadge(task.trangThai)
                  const priority = getPriorityColor(task.ngayTiepNhan)

                  return (
                    <div key={task._id} className={`task-card priority-${priority}`}>
                      <div className="task-header">
                        <span className="task-code">{task.maPhieu}</span>
                        <span className={`task-badge ${badge.color}`}>
                          {badge.icon} {badge.text}
                        </span>
                      </div>

                      <div className="task-body">
                        <h4>{task.sanPhamId?.tenSP || 'Sản phẩm'}</h4>
                        <p className="task-customer">
                          👤 {task.khachHangId?.hoTen || 'Khách hàng'}
                        </p>
                        <p className="task-description">{task.moTaLoi}</p>
                        <p className="task-date">
                          📅 {new Date(task.ngayTiepNhan).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <div className="task-footer">
                        <button
                          className="btn-view"
                          onClick={() => {
                            setSelectedTicket(task)
                            setShowDetailModal(true)
                          }}
                        >
                          🔍 Chi tiết
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* My Tasks Tab */}
        {activeTab === 'myTasks' && (
          <div className="tasks-section">
            <div className="section-header">
              <h2 className="section-title">📋 Công việc của tôi</h2>
              <button className="btn-refresh" onClick={loadMyTasks} disabled={loading}>
                🔄 Làm mới
              </button>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
              <div className="filter-group">
                <label htmlFor="status-filter">🏷️ Trạng thái:</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả ({myTasks.length})</option>
                  <option value="tiep_nhan">Chờ kiểm tra ({myTasks.filter(t => t.trangThai === 'tiep_nhan').length})</option>
                  <option value="dang_kiem_tra">Đang kiểm tra ({myTasks.filter(t => t.trangThai === 'dang_kiem_tra').length})</option>
                  <option value="dang_sua">Đang sửa ({myTasks.filter(t => t.trangThai === 'dang_sua').length})</option>
                  <option value="hoan_tat">Hoàn tất ({myTasks.filter(t => t.trangThai === 'hoan_tat').length})</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="search-filter">🔍 Tìm kiếm:</label>
                <input
                  id="search-filter"
                  type="text"
                  placeholder="Mã phiếu, sản phẩm, khách hàng..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="filter-input"
                />
                {searchText && (
                  <button
                    className="btn-clear-search"
                    onClick={() => setSearchText('')}
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-group">
                <label>📅 Khoảng ngày:</label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="filter-input"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

            {!loading && getFilteredTasks().length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>{searchText || filterStatus !== 'all' ? 'Không tìm thấy kết quả phù hợp' : 'Không có công việc nào'}</p>
                {(searchText || filterStatus !== 'all') && (
                  <button
                    className="btn-reset-filter"
                    onClick={() => {
                      setSearchText('')
                      setFilterStatus('all')
                    }}
                  >
                    🔄 Xóa bộ lọc
                  </button>
                )}
              </div>
            )}

            <div className="tasks-table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Mã phiếu</th>
                    <th>Sản phẩm</th>
                    <th>Khách hàng</th>
                    <th>Mô tả lỗi</th>
                    <th>Ngày tiếp nhận</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTasks().map(task => {
                    const badge = getStatusBadge(task.trangThai)
                    return (
                      <tr key={task._id}>
                        <td><span className="ticket-code">{task.maPhieu}</span></td>
                        <td>
                          <div className="product-info">
                            <strong>{task.sanPhamId?.tenSP || 'N/A'}</strong>
                            <small>{task.sanPhamId?.loaiSanPham}</small>
                          </div>
                        </td>
                        <td>{task.khachHangId?.hoTen || 'N/A'}</td>
                        <td className="description-cell">{task.moTaLoi}</td>
                        <td>{new Date(task.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className={`badge badge-${badge.color}`}>
                            {badge.icon} {badge.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* Trạng thái tiếp nhận */}
                            {task.trangThai === 'tiep_nhan' && (
                              <button
                                className="btn-action btn-inspect"
                                onClick={() => {
                                  setSelectedTicket(task)
                                  setShowInspectModal(true)
                                }}
                              >
                                🔍
                              </button>
                            )}

                            {/* Trạng thái đang xử lý - 1 nút Quản lý gộp tất cả */}
                            {(task.trangThai === 'dang_kiem_tra' || task.trangThai === 'dang_sua') && (
                              <button
                                className="btn-action btn-manage"
                                onClick={() => {
                                  setSelectedTicket(task)
                                  setProgressUpdate({
                                    ticketId: task._id,
                                    moTaTienDo: ''
                                  })
                                  setShowDetailModal(true)
                                }}
                              >
                                🔧
                              </button>
                            )}

                            {/* Nút chi tiết cho các trạng thái khác */}
                            {task.trangThai !== 'dang_kiem_tra' && task.trangThai !== 'dang_sua' && (
                              <button
                                className="btn-action btn-detail"
                                onClick={() => {
                                  setSelectedTicket(task)
                                  setShowDetailModal(true)
                                }}
                              >
                                📄
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Inspect Modal */}
      {showInspectModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowInspectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔍 Kiểm tra sản phẩm</h3>
              <button className="modal-close" onClick={() => setShowInspectModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ticket-info">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP}</p>
                <p><strong>Serial:</strong> {selectedTicket.sanPhamId?.soSerial}</p>
                <p><strong>Mô tả lỗi:</strong> {selectedTicket.moTaLoi}</p>
              </div>

              <form onSubmit={handleInspect}>
                <div className="form-group">
                  <label>Loại lỗi dự đoán *</label>
                  <select
                    value={inspectionForm.loaiLoiDuDoan}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, loaiLoiDuDoan: e.target.value })}
                    required
                  >
                    <option value="loi_nsx">Lỗi nhà sản xuất</option>
                    <option value="loi_su_dung">Lỗi do sử dụng</option>
                    <option value="hong_tu_nhien">Hỏng tự nhiên</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mô tả kết quả kiểm tra *</label>
                  <textarea
                    value={inspectionForm.moTaKiemTra}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, moTaKiemTra: e.target.value })}
                    placeholder="Nhập kết quả kiểm tra chi tiết..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={inspectionForm.canThayThe}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, canThayThe: e.target.checked })}
                    />
                    <span>Cần thay thế linh kiện</span>
                  </label>
                </div>

                {inspectionForm.canThayThe && (
                  <div className="form-group">
                    <label>Linh kiện cần thay</label>
                    <input
                      type="text"
                      value={inspectionForm.linhKienCanThay}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, linhKienCanThay: e.target.value })}
                      placeholder="VD: Dây đan, grip..."
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Đang xử lý...' : '🔍 Bắt đầu kiểm tra'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowInspectModal(false)}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Repair Modal */}
      {showRepairModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowRepairModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✅ Hoàn tất sửa chữa</h3>
              <button className="modal-close" onClick={() => setShowRepairModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ticket-info">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP}</p>
              </div>

              <form onSubmit={handleCompleteRepair}>
                <div className="form-group">
                  <label>Ghi chú hoàn tất *</label>
                  <textarea
                    value={repairForm.ghiChu}
                    onChange={(e) => setRepairForm({ ...repairForm, ghiChu: e.target.value })}
                    placeholder="Mô tả công việc đã thực hiện..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Chi phí phát sinh (VNĐ)</label>
                  <input
                    type="number"
                    value={repairForm.chiPhiPhatSinh}
                    onChange={(e) => setRepairForm({ ...repairForm, chiPhiPhatSinh: Number(e.target.value) })}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Đang xử lý...' : '✅ Hoàn tất'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowRepairModal(false)}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Unable to Repair Modal */}
      {showUnableModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowUnableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Không thể sửa chữa</h3>
              <button className="modal-close" onClick={() => setShowUnableModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ticket-info">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP}</p>
              </div>

              <div className="form-group">
                <label>Lý do không thể sửa *</label>
                <textarea
                  value={unableReason}
                  onChange={(e) => setUnableReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-danger"
                  onClick={handleMarkUnableToRepair}
                  disabled={loading || !unableReason.trim()}
                >
                  {loading ? '⏳ Đang xử lý...' : '⚠️ Xác nhận'}
                </button>
                <button className="btn-secondary" onClick={() => setShowUnableModal(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-title-section">
                <span className="modal-icon">📋</span>
                <div>
                  <h3>Chi tiết phiếu bảo hành</h3>
                  <p className="modal-subtitle">Mã phiếu: <strong>{selectedTicket.maPhieu}</strong></p>
                </div>
              </div>
              <button className="modal-close-modern" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body-modern">
              {/* Status Card */}
              <div className="status-highlight-card">
                <div className="status-info">
                  <span className="status-label">Trạng thái hiện tại</span>
                  <span className={`status-badge badge-${getStatusBadge(selectedTicket.trangThai).color}`}>
                    {getStatusBadge(selectedTicket.trangThai).icon} {getStatusBadge(selectedTicket.trangThai).text}
                  </span>
                </div>
                <div className="timeline-info">
                  <div className="timeline-item">
                    <span className="timeline-icon">📥</span>
                    <div>
                      <span className="timeline-label">Tiếp nhận</span>
                      <span className="timeline-date">{new Date(selectedTicket.ngayTiepNhan).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  {selectedTicket.ngayHoanTat && (
                    <div className="timeline-item">
                      <span className="timeline-icon">✅</span>
                      <div>
                        <span className="timeline-label">Hoàn tất</span>
                        <span className="timeline-date">{new Date(selectedTicket.ngayHoanTat).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-cards-grid">
                {/* Product Card */}
                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-icon">📦</span>
                    <h4>Thông tin sản phẩm</h4>
                  </div>
                  <div className="info-card-body">
                    <div className="info-item">
                      <span className="info-label">Tên sản phẩm</span>
                      <span className="info-value">{selectedTicket.sanPhamId?.tenSP || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Loại sản phẩm</span>
                      <span className="info-value">{selectedTicket.sanPhamId?.loaiSanPham || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Thương hiệu</span>
                      <span className="info-value">{selectedTicket.sanPhamId?.thuongHieu || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số Serial</span>
                      <span className="info-value highlight">{selectedTicket.sanPhamId?.soSerial || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Card */}
                <div className="info-card">
                  <div className="info-card-header">
                    <span className="info-icon">👤</span>
                    <h4>Thông tin khách hàng</h4>
                  </div>
                  <div className="info-card-body">
                    <div className="info-item">
                      <span className="info-label">Họ và tên</span>
                      <span className="info-value">{selectedTicket.khachHangId?.hoTen || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedTicket.khachHangId?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số điện thoại</span>
                      <span className="info-value highlight">{selectedTicket.khachHangId?.soDienThoai || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Description Card */}
              <div className="issue-card">
                <div className="issue-card-header">
                  <span className="issue-icon">⚠️</span>
                  <h4>Mô tả sự cố</h4>
                </div>
                <div className="issue-card-body">
                  <p>{selectedTicket.moTaLoi}</p>
                </div>
              </div>

              {/* Attachments / Images (hiển thị ảnh đã upload khi tạo phiếu) */}
              <div className="issue-card">
                <div className="issue-card-header">
                  <span className="issue-icon">📎</span>
                  <h4>Tệp đính kèm</h4>
                </div>
                <div className="issue-card-body">
                  {/* Hình ảnh lỗi (mảng đường dẫn ngắn) */}
                  {selectedTicket.hinhAnhLoi && selectedTicket.hinhAnhLoi.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {selectedTicket.hinhAnhLoi.map((p, idx) => {
                        const src = p && p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p}`
                        return (
                          <a key={idx} href={src} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                            <img src={src} alt={`Lỗi ${idx + 1}`} style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #e6eefc' }} />
                          </a>
                        )
                      })}
                    </div>
                  )}

                  {/* Các tệp đính kèm chi tiết */}
                  {selectedTicket.tepDinhKem && selectedTicket.tepDinhKem.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(() => {
                        const normalize = (p) => p && (p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p}`)
                        const imageSet = new Set((selectedTicket.hinhAnhLoi || []).map(normalize))
                        const isValidPath = (p) => !!p && (p.startsWith('http') || p.startsWith('/'))
                        const uniqueFiles = (selectedTicket.tepDinhKem || []).filter(f => {
                          if (!isValidPath(f.duLieu)) return false
                          const url = normalize(f.duLieu)
                          return !imageSet.has(url)
                        })

                        return uniqueFiles.map((f, i) => {
                          const src = f.duLieu && (f.duLieu.startsWith('http') ? f.duLieu : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${f.duLieu}`)
                          const isImage = typeof f.kieuNoiDung === 'string' && f.kieuNoiDung.startsWith('image/')
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {isImage ? (
                                <a href={src} target="_blank" rel="noreferrer">
                                  <img src={src} alt={f.tenTep || `Tệp ${i + 1}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eef4ff' }} />
                                </a>
                              ) : (
                                <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#fff', border: '1px solid #f0f3f7' }}>📎</div>
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <a href={src} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#0b4ed8' }}>{f.tenTep || `Tệp ${i + 1}`}</a>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{f.kieuNoiDung || ''} · {f.kichThuoc ? formatAttachmentSize(f.kichThuoc) : ''}</div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b' }}>Không có tệp đính kèm.</div>
                  )}
                </div>
              </div>

              {/* Quản lý sửa chữa - chỉ hiện khi đang xử lý */}
              {(selectedTicket.trangThai === 'dang_kiem_tra' || selectedTicket.trangThai === 'dang_sua') && (
                <div className="detail-section detail-full management-section">
                  <h4>🔧 Quản lý sửa chữa</h4>

                  {/* Cập nhật tiến độ */}
                  <div className="management-card">
                    <h5>📝 Cập nhật tiến độ</h5>
                    <form onSubmit={handleUpdateProgress}>
                      <div className="form-group">
                        <textarea
                          value={progressUpdate.moTaTienDo}
                          onChange={(e) => setProgressUpdate({ ...progressUpdate, moTaTienDo: e.target.value })}
                          placeholder="Mô tả công việc đã làm và kế hoạch tiếp theo..."
                          rows="3"
                        />
                      </div>
                      <button type="submit" className="btn-small btn-primary" disabled={loading || !progressUpdate.moTaTienDo.trim()}>
                        {loading ? '⏳ Đang cập nhật...' : '📝 Cập nhật tiến độ'}
                      </button>
                    </form>
                  </div>

                  {/* Upload hình ảnh */}
                  <div className="management-card">
                    <h5>📷 Upload hình ảnh</h5>
                    <form onSubmit={handleUploadImages}>
                      <div className="form-group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          id={`image-upload-${selectedTicket._id}`}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor={`image-upload-${selectedTicket._id}`} className="upload-label-compact">
                          📁 Chọn hình ảnh ({uploadImages.length} đã chọn)
                        </label>

                        {imagePreview.length > 0 && (
                          <div className="image-preview-compact">
                            {imagePreview.map((url, idx) => (
                              <div key={idx} className="preview-thumb">
                                <img src={url} alt={`Preview ${idx + 1}`} />
                                <button
                                  type="button"
                                  className="remove-thumb"
                                  onClick={() => {
                                    const newImages = uploadImages.filter((_, i) => i !== idx)
                                    const newPreviews = imagePreview.filter((_, i) => i !== idx)
                                    setUploadImages(newImages)
                                    URL.revokeObjectURL(url)
                                    setImagePreview(newPreviews)
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="submit" className="btn-small btn-primary" disabled={loading || uploadImages.length === 0}>
                        {loading ? '⏳ Đang tải...' : `📷 Tải lên ${uploadImages.length} ảnh`}
                      </button>
                    </form>
                  </div>

                  {/* Các hành động */}
                  <div className="management-actions">
                    <button
                      className="btn-complete-large"
                      onClick={() => {
                        setShowDetailModal(false)
                        setShowRepairModal(true)
                      }}
                    >
                      ✅ Hoàn tất sửa chữa
                    </button>
                    <button
                      className="btn-unable-large"
                      onClick={() => {
                        setShowDetailModal(false)
                        setShowUnableModal(true)
                      }}
                    >
                      ⚠️ Không thể sửa
                    </button>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowDetailModal(false)
                  // Clean up images if any
                  imagePreview.forEach(url => URL.revokeObjectURL(url))
                  setImagePreview([])
                  setUploadImages([])
                  setProgressUpdate({ ticketId: '', moTaTienDo: '' })
                }}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
