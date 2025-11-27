import { useState, useEffect } from 'react'
import { managerAPI, generalAPI, inventoryAPI } from '../services/api'
import '../styles/ManagerPage.css'
import SettingsPage from './SettingsPage'

export default function ManagerPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // State cho từng tab
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [employees, setEmployees] = useState([])
  const [customers, setCustomers] = useState([])
  const [tickets, setTickets] = useState([])
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerProducts, setCustomerProducts] = useState([])
  const [customerTickets, setCustomerTickets] = useState([])
  const [customerReviews, setCustomerReviews] = useState([])
  const [customerAvgRating, setCustomerAvgRating] = useState(null)
  const [customerRatingCounts, setCustomerRatingCounts] = useState([0, 0, 0, 0, 0])

  // State cho modal
  const [showProductModal, setShowProductModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null)

  // State cho modal chi tiết sản phẩm
  const [showProductDetailModal, setShowProductDetailModal] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)

  // Form data
  const [productForm, setProductForm] = useState({
    loaiSanPham: 'Vot',
    thuongHieu: '',
    tenSP: '',
    soSerial: '',
    ngayMua: '',
    thoiHanBaoHanhThang: 12,
    thongTinKyThuat: {},
    khachHangId: ''
  })

  const [employeeForm, setEmployeeForm] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    chucVu: 'nhanvien'
  })

  // Filter and search states
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('all')
  const [customerSearch, setCustomerSearch] = useState('')

  // Inventory State
  const [inventory, setInventory] = useState([])
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryForm, setInventoryForm] = useState({
    maLinhKien: '',
    tenLinhKien: '',
    soLuongTon: 0,
    giaNhap: 0,
    giaXuat: 0,
    moTa: ''
  })
  const [editingPart, setEditingPart] = useState(null)
  const [inventorySearch, setInventorySearch] = useState('')

  // Load data khi tab thay đổi
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    switch (activeTab) {
      case 'dashboard':
        await loadStats()
        break
      case 'products':
        await loadProducts()
        await loadCustomers()
        break
      case 'employees':
        await loadEmployees()
        break
      case 'customers':
        await loadCustomers()
        await loadTickets()
        break
      case 'tickets':
        await loadTickets()
        break
      case 'inventory':
        await loadInventory()
        break
    }
  }

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await inventoryAPI.getAll()
      setInventory(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await managerAPI.getDashboardStats()

      const summary = data.summary || {}
      const statusCounts = {}

      if (data.ticketsByStatus && Array.isArray(data.ticketsByStatus)) {
        data.ticketsByStatus.forEach(item => {
          statusCounts[item._id] = item.count
        })
      }

      setStats({
        summary,
        statusCounts,
        recentTickets: data.recentTickets || []
      })
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await generalAPI.getProducts()
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await generalAPI.getEmployees()
      setEmployees(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const data = await generalAPI.getCustomers()
      setCustomers(data || [])
    } catch (err) {
      console.error('Error loading customers:', err)
    }
  }

  const openCustomerModal = async (customer) => {
    try {
      setSelectedCustomer(customer)
      setShowCustomerModal(true)
      // Load products for this customer
      const allProducts = await generalAPI.getProducts()
      const owned = (allProducts || []).filter(p => p.khachHangId === customer._id || (p.khachHangId && p.khachHangId._id === customer._id))
      setCustomerProducts(owned)
      // Load tickets for this customer
      const allTickets = await generalAPI.getWarrantyTickets()
      const custTickets = (allTickets?.data || allTickets || []).filter(t => t.khachHangId?._id === customer._id || t.khachHangId === customer._id)
      setCustomerTickets(custTickets)
      // compute reviews
      const reviews = custTickets.filter(t => t.qualityRating && t.qualityRating > 0)
      setCustomerReviews(reviews)
      if (reviews.length > 0) {
        const avg = (reviews.reduce((sum, r) => sum + (r.qualityRating || 0), 0) / reviews.length).toFixed(1)
        setCustomerAvgRating(avg)
        const counts = [0, 0, 0, 0, 0]
        reviews.forEach(r => { if (r.qualityRating) counts[r.qualityRating - 1]++ })
        setCustomerRatingCounts(counts)
      } else {
        setCustomerAvgRating(null)
        setCustomerRatingCounts([0, 0, 0, 0, 0])
      }
    } catch (err) {
      console.error('Error opening customer modal:', err)
      setCustomerProducts([])
      setCustomerTickets([])
    }
  }

  const loadTickets = async () => {
    try {
      setLoading(true)
      const result = await managerAPI.getAllTickets()
      const ticketsData = result.tickets || result.data || result || []
      setTickets(ticketsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInventory = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingPart) {
        await inventoryAPI.update(editingPart._id, inventoryForm)
        setSuccess('✅ Cập nhật linh kiện thành công')
      } else {
        await inventoryAPI.create(inventoryForm)
        setSuccess('✅ Thêm linh kiện thành công')
      }
      setShowInventoryModal(false)
      setInventoryForm({
        maLinhKien: '',
        tenLinhKien: '',
        soLuongTon: 0,
        giaNhap: 0,
        giaXuat: 0,
        moTa: ''
      })
      setEditingPart(null)
      loadInventory()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa linh kiện này?')) return
    try {
      setLoading(true)
      await inventoryAPI.delete(id)
      setSuccess('✅ Đã xóa linh kiện')
      loadInventory()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      const matchesSearch = !ticketSearch ||
        ticket.maPhieu?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        ticket.sanPhamId?.tenSP?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        ticket.khachHangId?.hoTen?.toLowerCase().includes(ticketSearch.toLowerCase())

      const matchesStatus = ticketStatusFilter === 'all' || ticket.trangThai === ticketStatusFilter

      return matchesSearch && matchesStatus
    })
  }

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = !productSearch ||
        product.tenSP?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.soSerial?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.thuongHieu?.toLowerCase().includes(productSearch.toLowerCase())

      const matchesType = productTypeFilter === 'all' || product.loaiSanPham === productTypeFilter

      return matchesSearch && matchesType
    })
  }

  const getFilteredEmployees = () => {
    return employees.filter(employee => {
      const matchesSearch = !employeeSearch ||
        employee.hoTen?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        employee.email?.toLowerCase().includes(employeeSearch.toLowerCase())

      const matchesRole = employeeRoleFilter === 'all' || employee.chucVu === employeeRoleFilter

      return matchesSearch && matchesRole
    })
  }

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      return !customerSearch ||
        customer.hoTen?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.soDienThoai?.toLowerCase().includes(customerSearch.toLowerCase())
    })
  }

  // Gán nhân viên
  const handleAssignEmployee = async (nhanVienId) => {
    try {
      setLoading(true)
      setError('')
      await managerAPI.assignEmployee(selectedTicket._id, nhanVienId)
      setSuccess('✅ Đã gán nhân viên thành công!')
      setShowAssignModal(false)
      setSelectedTicket(null)
      loadTickets()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowAssignModal(true)
    // Load employees nếu chưa có
    if (employees.length === 0) {
      loadEmployees()
    }
  }

  // Product handlers
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await generalAPI.createProduct(productForm)
      setSuccess('Tạo sản phẩm thành công!')
      setShowProductModal(false)
      resetProductForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await generalAPI.updateProduct(editingProduct._id, productForm)
      setSuccess('Cập nhật sản phẩm thành công!')
      setShowProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    try {
      setLoading(true)
      await generalAPI.deleteProduct(id)
      setSuccess('Xóa sản phẩm thành công!')
      loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        loaiSanPham: product.loaiSanPham,
        thuongHieu: product.thuongHieu || '',
        tenSP: product.tenSP,
        soSerial: product.soSerial,
        ngayMua: product.ngayMua ? new Date(product.ngayMua).toISOString().split('T')[0] : '',
        thoiHanBaoHanhThang: product.thoiHanBaoHanhThang,
        thongTinKyThuat: product.thongTinKyThuat || {},
        khachHangId: product.khachHangId || ''
      })
    }
    setShowProductModal(true)
  }

  const resetProductForm = () => {
    setProductForm({
      loaiSanPham: 'Vot',
      thuongHieu: '',
      tenSP: '',
      soSerial: '',
      ngayMua: '',
      thoiHanBaoHanhThang: 12,
      thongTinKyThuat: {},
      khachHangId: ''
    })
  }

  // Employee handlers  
  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/nhanvien`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(employeeForm)
      })

      if (!response.ok) throw new Error('Tạo nhân viên thất bại')

      setSuccess('Tạo nhân viên thành công!')
      setShowEmployeeModal(false)
      resetEmployeeForm()
      loadEmployees()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return

    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/nhanvien/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Xóa nhân viên thất bại')

      setSuccess('Xóa nhân viên thành công!')
      loadEmployees()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp)
    setEmployeeForm({
      hoTen: emp.hoTen || '',
      email: emp.email || '',
      matKhau: '',
      chucVu: emp.chucVu || 'nhanvien'
    })
    setShowEmployeeModal(true)
  }

  const handleUpdateEmployee = async (e) => {
    e.preventDefault()
    if (!editingEmployee) return
    try {
      setLoading(true)
      const payload = { ...employeeForm }
      if (!payload.matKhau) delete payload.matKhau
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/nhanvien/${editingEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Cập nhật nhân viên thất bại')

      setSuccess('Cập nhật nhân viên thành công!')
      setShowEmployeeModal(false)
      setEditingEmployee(null)
      resetEmployeeForm()
      loadEmployees()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetEmployeeForm = () => {
    setEmployeeForm({
      hoTen: '',
      email: '',
      matKhau: '',
      chucVu: 'nhanvien'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      dang_cho: { text: 'Đang chờ', class: 'badge-secondary' },
      tiep_nhan: { text: 'Tiếp nhận', class: 'badge-info' },
      dang_kiem_tra: { text: 'Đang kiểm tra', class: 'badge-warning' },
      dang_sua: { text: 'Đang sửa', class: 'badge-primary' },
      hoan_tat: { text: 'Hoàn tất', class: 'badge-success' },
      tu_choi: { text: 'Từ chối', class: 'badge-danger' }
    }
    return badges[status] || { text: status, class: 'badge-secondary' }
  }

  const getPredictionText = (code) => {
    const map = {
      'loi_su_dung': 'Lỗi do người sử dụng',
      'loi_ky_thuat': 'Lỗi kỹ thuật / Nhà sản xuất',
      'khong_xac_dinh': 'Chưa xác định',
      'hao_mon_tu_nhien': 'Hao mòn tự nhiên'
    }
    return map[code] || code || 'Chưa có dự đoán'
  }

  return (
    <div className="manager-page">
      {/* Header */}
      <header className="manager-header">
        <div className="header-content">
          <div>
            <h1>🎯 Bảng điều khiển quản lý</h1>
            <p>Quản lý toàn bộ hệ thống bảo hành</p>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <span>👋</span> Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="manager-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="tab-icon">📊</span>
          <span>Tổng quan</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <span className="tab-icon">📋</span>
          <span>Phiếu bảo hành</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <span className="tab-icon">🏸</span>
          <span>Sản phẩm</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <span className="tab-icon">👥</span>
          <span>Nhân viên</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="tab-icon">👤</span>
          <span>Khách hàng</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <span className="tab-icon">📦</span>
          <span>Kho linh kiện</span>
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
          <span>❌</span> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-customer-modern">
              <div className="customer-header-top">
                <div className="customer-avatar-large">{selectedCustomer.hoTen ? selectedCustomer.hoTen.split(' ').map(n => n[0]).slice(0, 2).join('') : 'KH'}</div>
                <div className="customer-header-info">
                  <div className="customer-name">{selectedCustomer.hoTen}</div>
                  <div className="customer-email">📧 {selectedCustomer.email}</div>
                  {selectedCustomer.soDienThoai && (
                    <div className="customer-phone">📞 {selectedCustomer.soDienThoai}</div>
                  )}
                </div>
                <button className="modal-close-modern" onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}>✕</button>
              </div>
              <div className="customer-header-bottom">
                <div className="header-rating-badge">
                  {customerAvgRating ? (
                    <>
                      <span className="rating-number">{customerAvgRating}</span>
                      <div className="rating-stars-inline">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < Math.round(customerAvgRating) ? 'star active' : 'star'}>★</span>
                        ))}
                      </div>
                      <span className="rating-count">({customerReviews.length} đánh giá)</span>
                    </>
                  ) : (
                    <span className="no-rating-text">Chưa có đánh giá</span>
                  )}
                </div>
                <div className="header-actions-modern">
                  <button className="action-btn" onClick={() => { if (selectedCustomer.soDienThoai) { window.open(`tel:${selectedCustomer.soDienThoai}`); } else { alert('Không có số điện thoại'); } }}>
                    <span className="btn-icon">📞</span>
                    <span>Gọi</span>
                  </button>
                  <button className="action-btn" onClick={() => { if (selectedCustomer.email) { window.open(`mailto:${selectedCustomer.email}`); } else { alert('Không có email'); } }}>
                    <span className="btn-icon">✉️</span>
                    <span>Email</span>
                  </button>
                  <button className="action-btn" onClick={() => alert('Chức năng sửa khách hàng chưa được cài đặt')}>
                    <span className="btn-icon">✏️</span>
                    <span>Sửa</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-body-customer">
              <div className="customer-detail-grid-modern">
                <div className="left-column">
                  <div className="section-card info-card-compact">
                    <div className="card-header">
                      <span className="card-icon">👤</span>
                      <h4>Thông tin cơ bản</h4>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item-compact">
                          <span className="info-label">Họ tên</span>
                          <span className="info-value">{selectedCustomer.hoTen}</span>
                        </div>
                        <div className="info-item-compact">
                          <span className="info-label">Email</span>
                          <span className="info-value">{selectedCustomer.email}</span>
                        </div>
                        <div className="info-item-compact">
                          <span className="info-label">Số điện thoại</span>
                          <span className="info-value">{selectedCustomer.soDienThoai || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-item-compact">
                          <span className="info-label">Địa chỉ</span>
                          <span className="info-value">{selectedCustomer.diaChi || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="section-card reviews-card-main">
                    <div className="card-header">
                      <span className="card-icon">⭐</span>
                      <h4>Đánh giá ({customerReviews.length})</h4>
                    </div>
                    <div className="card-body">
                      <div className="rating-summary-modern">
                        {customerAvgRating ? (
                          <div className="rating-overview">
                            <div className="rating-score">
                              <div className="score-number">{customerAvgRating}</div>
                              <div className="score-stars">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < Math.round(customerAvgRating) ? 'star active' : 'star'}>★</span>
                                ))}
                              </div>
                              <div className="score-text">{customerReviews.length} đánh giá</div>
                            </div>
                            <div className="rating-bars">
                              {customerRatingCounts.slice().reverse().map((count, idx) => (
                                <div key={idx} className="rating-bar-row">
                                  <span className="bar-label">{5 - idx}★</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(count / Math.max(1, customerReviews.length)) * 100}%` }}></div>
                                  </div>
                                  <span className="bar-count">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-rating-state">Chưa có đánh giá</div>
                        )}
                      </div>

                      {customerReviews.length === 0 ? (
                        <div className="empty-state">
                          <span className="empty-icon">⭐</span>
                          <p>Chưa có đánh giá</p>
                        </div>
                      ) : (
                        <div className="reviews-list-modern">
                          {customerReviews.map(r => (
                            <div key={r._id} className="review-card-modern">
                              <div className="review-top">
                                <div className="review-stars-rating">
                                  {Array.from({ length: r.qualityRating || 0 }).map((_, i) => <span key={i} className="star active">★</span>)}
                                </div>
                                <div className="review-date-text">{r.ngayHoanTat ? new Date(r.ngayHoanTat).toLocaleDateString('vi-VN') : (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('vi-VN') : 'N/A')}</div>
                              </div>
                              <div className="review-content">
                                <p className="review-text">{r.qualityComments || 'Không có nhận xét'}</p>
                              </div>
                              <div className="review-footer">
                                <span className="review-product">{r.sanPhamId?.tenSP || 'Sản phẩm không xác định'}</span>
                                <span className="review-separator">•</span>
                                <span className="review-ticket">{r.maPhieu}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="right-column">
                  <div className="section-card">
                    <div className="card-header">
                      <span className="card-icon">📦</span>
                      <h4>Sản phẩm ({customerProducts.length})</h4>
                    </div>
                    <div className="card-body">
                      {customerProducts.length === 0 ? (
                        <div className="empty-state">
                          <span className="empty-icon">📦</span>
                          <p>Chưa có sản phẩm</p>
                        </div>
                      ) : (
                        <div className="table-container-modern">
                          {customerProducts.map(p => (
                            <div key={p._id} className="product-item">
                              <div className="product-info">
                                <div className="product-name">{p.tenSP}</div>
                                <div className="product-meta">
                                  <span className="product-type">{p.loaiSanPham}</span>
                                  <span className="product-serial">SN: {p.soSerial}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="section-card">
                    <div className="card-header">
                      <span className="card-icon">📋</span>
                      <h4>Phiếu bảo hành ({customerTickets.length})</h4>
                    </div>
                    <div className="card-body">
                      {customerTickets.length === 0 ? (
                        <div className="empty-state">
                          <span className="empty-icon">📋</span>
                          <p>Chưa có phiếu</p>
                        </div>
                      ) : (
                        <div className="tickets-list">
                          {customerTickets.map(t => (
                            <div key={t._id} className="ticket-item">
                              <div className="ticket-header">
                                <span className="ticket-code">{t.maPhieu}</span>
                                <span className={`status-badge ${getStatusBadge(t.trangThai).class}`}>
                                  {getStatusBadge(t.trangThai).text}
                                </span>
                              </div>
                              <div className="ticket-body">
                                <div className="ticket-product">{t.sanPhamId?.tenSP || 'N/A'}</div>
                                <div className="ticket-date">{t.ngayTiepNhan ? new Date(t.ngayTiepNhan).toLocaleDateString('vi-VN') : 'N/A'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>✅</span> {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Content */}
      <main className="manager-content">
        {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-section">
            <h2 className="section-title">📊 Thống kê tổng quan</h2>

            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-label">Tổng phiếu</div>
                  <div className="stat-value">{stats.summary.totalTickets || 0}</div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">🙋</div>
                <div className="stat-content">
                  <div className="stat-label">Khách hàng</div>
                  <div className="stat-value">{stats.summary.totalCustomers || 0}</div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">🏸</div>
                <div className="stat-content">
                  <div className="stat-label">Sản phẩm</div>
                  <div className="stat-value">{stats.summary.totalProducts || 0}</div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Nhân viên</div>
                  <div className="stat-value">{stats.summary.totalEmployees || 0}</div>
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card-small yellow">
                <div className="stat-label">⏳ Chờ xử lý</div>
                <div className="stat-value">{stats.statusCounts.tiep_nhan || 0}</div>
              </div>

              <div className="stat-card-small orange">
                <div className="stat-label">🔍 Đang xử lý</div>
                <div className="stat-value">
                  {(stats.statusCounts.dang_kiem_tra || 0) + (stats.statusCounts.dang_sua || 0)}
                </div>
              </div>

              <div className="stat-card-small green">
                <div className="stat-label">✅ Hoàn tất</div>
                <div className="stat-value">{stats.statusCounts.hoan_tat || 0}</div>
              </div>

              <div className="stat-card-small gray">
                <div className="stat-label">⏱️ Thời gian TB</div>
                <div className="stat-value">{stats.summary.avgCompletionDays || 0} ngày</div>
              </div>
            </div>

            {stats.recentTickets && stats.recentTickets.length > 0 && (
              <div className="recent-section">
                <h3>🕒 Phiếu bảo hành gần đây</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã phiếu</th>
                        <th>Sản phẩm</th>
                        <th>Khách hàng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tiếp nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTickets.slice(0, 5).map(ticket => (
                        <tr key={ticket._id}>
                          <td><strong>{ticket.maPhieu}</strong></td>
                          <td>{ticket.sanPhamId?.tenSP || 'N/A'}</td>
                          <td>{ticket.khachHangId?.hoTen || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(ticket.trangThai).class}`}>
                              {getStatusBadge(ticket.trangThai).text}
                            </span>
                          </td>
                          <td>{new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2 className="section-title">⚙️ Cài đặt tài khoản</h2>
            <SettingsPage onSaved={(u) => { /* refresh or notify if needed */ }} />
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <div className="section-header">
              <h2 className="section-title">📋 Quản lý phiếu bảo hành</h2>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>🔍 Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Mã phiếu, sản phẩm, khách hàng..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>🏷️ Trạng thái:</label>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="dang_cho">Đang chờ</option>
                  <option value="tiep_nhan">Tiếp nhận</option>
                  <option value="dang_kiem_tra">Đang kiểm tra</option>
                  <option value="dang_sua">Đang sửa</option>
                  <option value="hoan_tat">Hoàn tất</option>
                  <option value="tu_choi">Từ chối</option>
                </select>
              </div>
              {(ticketSearch || ticketStatusFilter !== 'all') && (
                <button className="btn-clear-filter" onClick={() => { setTicketSearch(''); setTicketStatusFilter('all'); }}>
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã phiếu</th>
                    <th>Sản phẩm</th>
                    <th>Khách hàng</th>
                    <th>Nhân viên</th>
                    <th>Trạng thái</th>
                    <th>Ngày tiếp nhận</th>
                    <th>Ngày hoàn tất</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTickets().length === 0 ? (
                    <tr><td colSpan="8" className="text-center">{tickets.length === 0 ? 'Chưa có phiếu nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                  ) : (
                    getFilteredTickets().map(ticket => (
                      <tr key={ticket._id}>
                        <td><strong>{ticket.maPhieu}</strong></td>
                        <td>{ticket.sanPhamId?.tenSP || 'N/A'}</td>
                        <td>{ticket.khachHangId?.hoTen || 'N/A'}</td>
                        <td>
                          {ticket.nhanVienTiepNhanId ? (
                            <span className="badge badge-success">
                              ✓ {ticket.nhanVienTiepNhanId?.hoTen}
                            </span>
                          ) : (
                            <span className="badge badge-warning">⚠ Chưa gán</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(ticket.trangThai).class}`}>
                            {getStatusBadge(ticket.trangThai).text}
                          </span>
                        </td>
                        <td>{new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                        <td>{ticket.ngayHoanTat ? new Date(ticket.ngayHoanTat).toLocaleDateString('vi-VN') : '-'}</td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-assign"
                            onClick={() => openAssignModal(ticket)}
                            title={ticket.nhanVienTiepNhanId ? 'Đổi nhân viên' : 'Gán nhân viên'}
                          >
                            👤
                          </button>
                          <button
                            className="btn-icon btn-view"
                            onClick={() => { setSelectedTicketDetail(ticket); setShowTicketDetail(true); }}
                            title="Xem chi tiết"
                          >
                            🔍
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2 className="section-title">🏸 Quản lý sản phẩm</h2>
              <button className="btn-primary" onClick={() => {
                resetProductForm()
                setEditingProduct(null)
                setShowProductModal(true)
              }}>
                <span>➕</span> Thêm sản phẩm
              </button>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>🔍 Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Tên, serial, thương hiệu..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>📦 Loại:</label>
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="Vot">Vợt</option>
                  <option value="Giay">Giày</option>
                  <option value="Balo">Balo</option>
                  <option value="PhuKien">Phụ kiện</option>
                </select>
              </div>
              {(productSearch || productTypeFilter !== 'all') && (
                <button className="btn-clear-filter" onClick={() => { setProductSearch(''); setProductTypeFilter('all'); }}>
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại</th>
                    <th>Thương hiệu</th>
                    <th>Số Serial</th>
                    <th>Bảo hành</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredProducts().length === 0 ? (
                    <tr><td colSpan="7" className="text-center">{products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                  ) : (
                    getFilteredProducts().map(product => (
                      <tr key={product._id}>
                        <td><code>{product._id.slice(-6)}</code></td>
                        <td>
                          <button
                            className="btn-link product-detail-link"
                            style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', padding: 0 }}
                            onClick={() => {
                              setSelectedProductDetail(product);
                              setShowProductDetailModal(true);
                            }}
                            title="Xem chi tiết sản phẩm"
                          >
                            {product.tenSP}
                          </button>
                        </td>
                        <td><span className="badge badge-info">{product.loaiSanPham}</span></td>
                        <td>{product.thuongHieu || 'N/A'}</td>
                        <td><code>{product.soSerial}</code></td>
                        <td>{product.thoiHanBaoHanhThang} tháng</td>
                        <td className="action-buttons">
                          <button className="btn-icon btn-edit" onClick={() => openProductModal(product)} title="Sửa">
                            ✏️
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDeleteProduct(product._id)} title="Xóa">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="employees-section">
            <div className="section-header">
              <h2 className="section-title">👥 Quản lý nhân viên</h2>
              <button className="btn-primary" onClick={() => {
                resetEmployeeForm()
                setShowEmployeeModal(true)
              }}>
                <span>➕</span> Thêm nhân viên
              </button>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>🔍 Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Tên, email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>💼 Chức vụ:</label>
                <select
                  value={employeeRoleFilter}
                  onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="nhanvien">Nhân viên</option>
                  <option value="quanly">Quản lý</option>
                </select>
              </div>
              {(employeeSearch || employeeRoleFilter !== 'all') && (
                <button className="btn-clear-filter" onClick={() => { setEmployeeSearch(''); setEmployeeRoleFilter('all'); }}>
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Chức vụ</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredEmployees().length === 0 ? (
                    <tr><td colSpan="6" className="text-center">{employees.length === 0 ? 'Chưa có nhân viên nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                  ) : (
                    getFilteredEmployees().map(emp => (
                      <tr key={emp._id}>
                        <td><code>{emp._id.slice(-6)}</code></td>
                        <td><strong>{emp.hoTen}</strong></td>
                        <td>{emp.email}</td>
                        <td>
                          <span className={`badge ${emp.chucVu === 'quanly' ? 'badge-danger' : 'badge-primary'}`}>
                            {emp.chucVu === 'quanly' ? '👑 Quản lý' : '👤 Nhân viên'}
                          </span>
                        </td>
                        <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td className="action-buttons">
                          <button className="btn-icon btn-edit" onClick={() => handleEditEmployee(emp)} title="Sửa">
                            ✏️
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDeleteEmployee(emp._id)} title="Xóa">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="section-header">
              <h2 className="section-title">👤 Quản lý khách hàng</h2>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label>🔍 Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Tên, email, số điện thoại..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              {customerSearch && (
                <button className="btn-clear-filter" onClick={() => setCustomerSearch('')}>
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Đánh giá</th>
                    <th>Số điện thoại</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCustomers().length === 0 ? (
                    <tr><td colSpan="7" className="text-center">{customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                  ) : (
                    getFilteredCustomers().map(customer => (
                      <tr key={customer._id}>
                        <td><code>{customer._id.slice(-6)}</code></td>
                        <td><strong>{customer.hoTen}</strong></td>
                        <td>{customer.email}</td>
                        <td>
                          {(() => {
                            const custTickets = tickets.filter(t => t.khachHangId?._id === customer._id || t.khachHangId === customer._id)
                            const reviews = custTickets.filter(t => t.qualityRating && t.qualityRating > 0)
                            if (reviews.length === 0) return <span className="badge badge-secondary">No reviews</span>
                            const avg = (reviews.reduce((s, r) => s + (r.qualityRating || 0), 0) / reviews.length).toFixed(1)
                            return <span className="badge badge-success">⭐ {avg} ({reviews.length})</span>
                          })()}
                        </td>
                        <td>{customer.soDienThoai || 'N/A'}</td>
                        <td>{(customer.ngayTao || customer.createdAt) ? new Date(customer.ngayTao || customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        <td className="action-buttons">
                          <button className="btn-icon btn-view" onClick={() => openCustomerModal(customer)} title="Xem chi tiết">
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="section-header">
              <h2 className="section-title">📦 Kho linh kiện</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingPart(null)
                  setInventoryForm({
                    maLinhKien: '',
                    tenLinhKien: '',
                    soLuongTon: 0,
                    giaNhap: 0,
                    giaXuat: 0,
                    moTa: ''
                  })
                  setShowInventoryModal(true)
                }}
              >
                ➕ Thêm linh kiện
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-group" style={{ flex: 1 }}>
                <label>🔍 Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Mã, tên linh kiện..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã linh kiện</th>
                    <th>Tên linh kiện</th>
                    <th>Tồn kho</th>
                    <th>Giá nhập</th>
                    <th>Giá xuất</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.filter(item =>
                    item.tenLinhKien.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                    item.maLinhKien.toLowerCase().includes(inventorySearch.toLowerCase())
                  ).map(item => (
                    <tr key={item._id}>
                      <td><span className="ticket-code">{item.maLinhKien}</span></td>
                      <td><strong>{item.tenLinhKien}</strong></td>
                      <td>
                        <span className={`badge ${item.soLuongTon <= 5 ? 'badge-danger' : 'badge-success'}`}>
                          {item.soLuongTon}
                        </span>
                      </td>
                      <td>{item.giaNhap?.toLocaleString('vi-VN')} đ</td>
                      <td>{item.giaXuat?.toLocaleString('vi-VN')} đ</td>
                      <td>{item.moTa}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setEditingPart(item)
                            setInventoryForm(item)
                            setShowInventoryModal(true)
                          }}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteInventory(item._id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">Chưa có linh kiện nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Loại sản phẩm *</label>
                  <select
                    value={productForm.loaiSanPham}
                    onChange={(e) => setProductForm({ ...productForm, loaiSanPham: e.target.value })}
                    required
                  >
                    <option value="Vot">Vợt</option>
                    <option value="Giay">Giày</option>
                    <option value="Balo">Balo</option>
                    <option value="PhuKien">Phụ kiện</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input
                    type="text"
                    value={productForm.thuongHieu}
                    onChange={(e) => setProductForm({ ...productForm, thuongHieu: e.target.value })}
                    placeholder="VD: Yonex, Victor..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.tenSP}
                  onChange={(e) => setProductForm({ ...productForm, tenSP: e.target.value })}
                  placeholder="VD: Yonex Astrox 99"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số Serial *</label>
                  <input
                    type="text"
                    value={productForm.soSerial}
                    onChange={(e) => setProductForm({ ...productForm, soSerial: e.target.value })}
                    placeholder="VD: SN123456"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày mua</label>
                  <input
                    type="date"
                    value={productForm.ngayMua}
                    onChange={(e) => setProductForm({ ...productForm, ngayMua: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bảo hành (tháng) *</label>
                  <input
                    type="number"
                    value={productForm.thoiHanBaoHanhThang}
                    onChange={(e) => setProductForm({ ...productForm, thoiHanBaoHanhThang: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Khách hàng</label>
                  <select
                    value={productForm.khachHangId}
                    onChange={(e) => setProductForm({ ...productForm, khachHangId: e.target.value })}
                  >
                    <option value="">-- Chưa chọn --</option>
                    {customers.map(cust => (
                      <option key={cust._id} value={cust._id}>{cust.hoTen}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Thông tin kỹ thuật</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                  <textarea
                    value={productForm.thongTinKyThuat?.moTa || ''}
                    onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), moTa: e.target.value } })}
                    rows="3"
                    placeholder="Mô tả - VD: Sản phẩm chính hãng..."
                  />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={productForm.thongTinKyThuat?.xuatXu || ''}
                      onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), xuatXu: e.target.value } })}
                      placeholder="Xuất xứ"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={productForm.thongTinKyThuat?.trongLuong || ''}
                      onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), trongLuong: e.target.value } })}
                      placeholder="Trọng lượng (VD: 85g)"
                      style={{ width: 140 }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Đang xử lý...' : (editingProduct ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Page / Modal */}
      {showTicketDetail && selectedTicketDetail && (
        <div className="modal-overlay" onClick={() => setShowTicketDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
            <div className="product-detail-header-modern">
              <div className="product-header-icon">🧾</div>
              <div className="product-header-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="product-title">Phiếu bảo hành: {selectedTicketDetail.maPhieu}</div>
                    <div className="product-meta-row">
                      <div className="product-type-badge">{getStatusBadge(selectedTicketDetail.trangThai).text}</div>
                      <div className="product-brand">{selectedTicketDetail.sanPhamId?.thuongHieu || ''}</div>
                      <div className="product-serial">{selectedTicketDetail.sanPhamId?.soSerial || ''}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', color: '#e6f2ff' }}>Ngày tiếp nhận</div>
                    <div style={{ fontWeight: 700 }}>{new Date(selectedTicketDetail.ngayTiepNhan).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="product-detail-body-modern">
              <div className="product-detail-modern-grid">
                <div className="product-detail-modern-left">
                  <div className="product-info-table-modern">
                    <div className="info-row-modern">
                      <div className="info-icon-modern">👤</div>
                      <div className="info-label-modern">Khách hàng</div>
                      <div className="info-value-modern">{selectedTicketDetail.khachHangId?.hoTen || 'N/A'}<div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#64748b' }}>{selectedTicketDetail.thongTinLienHe?.soDienThoai || selectedTicketDetail.khachHangId?.soDienThoai || ''}</div></div>
                    </div>

                    <div className="info-row-modern">
                      <div className="info-icon-modern">🏸</div>
                      <div className="info-label-modern">Sản phẩm</div>
                      <div className="info-value-modern">{selectedTicketDetail.sanPhamId?.tenSP || 'N/A'}<div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#64748b' }}>{selectedTicketDetail.thongTinLienHe?.soSerial || selectedTicketDetail.sanPhamId?.soSerial || ''}</div></div>
                    </div>

                    <div className="info-row-modern">
                      <div className="info-icon-modern">⚠️</div>
                      <div className="info-label-modern">Mô tả lỗi</div>
                      <div className="info-value-modern" style={{ whiteSpace: 'pre-line' }}>{selectedTicketDetail.moTaLoi || 'N/A'}</div>
                    </div>

                    <div className="info-row-modern">
                      <div className="info-icon-modern">🔎</div>
                      <div className="info-label-modern">Dự đoán</div>
                      <div className="info-value-modern">{getPredictionText(selectedTicketDetail.loaiLoiDuDoan)}</div>
                    </div>

                    <div className="info-row-modern">
                      <div className="info-icon-modern">👷</div>
                      <div className="info-label-modern">Nhân viên</div>
                      <div className="info-value-modern">{selectedTicketDetail.nhanVienTiepNhanId?.hoTen || 'Chưa gán'}</div>
                    </div>

                    <div className="info-row-modern">
                      <div className="info-icon-modern">💬</div>
                      <div className="info-label-modern">Ghi chú xử lý</div>
                      <div className="info-value-modern" style={{ whiteSpace: 'pre-line' }}>{selectedTicketDetail.moTaXuLy || 'N/A'}</div>
                    </div>

                  </div>

                  <div className="tech-block">
                    <div className="tech-content-modern">Lịch sử tiến độ</div>
                    {selectedTicketDetail.moTaTienDo && selectedTicketDetail.moTaTienDo.length > 0 ? (
                      selectedTicketDetail.moTaTienDo.map((item, idx) => (
                        <div key={idx} style={{ padding: '0.6rem 0', borderBottom: '1px solid #eef2f7' }}>
                          <div style={{ fontSize: '0.95rem', color: '#64748b' }}>{new Date(item.thoiGian).toLocaleString('vi-VN')}</div>
                          <div style={{ fontWeight: 600 }}>{item.noiDung}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.6rem 0', color: '#64748b' }}>Chưa có tiến độ</div>
                    )}
                  </div>
                </div>

                <div className="product-detail-modern-right">
                  <div className="product-invoice-image-block">
                    <div className="invoice-label">Hình ảnh lỗi</div>
                    {selectedTicketDetail.hinhAnhLoi && selectedTicketDetail.hinhAnhLoi.length > 0 ? (
                      selectedTicketDetail.hinhAnhLoi.map((src, i) => {
                        const imageSrc = src && src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${src}`
                        return (
                          <img key={i} src={imageSrc} alt={`Lỗi ${i + 1}`} style={{ maxWidth: 280, display: 'block', margin: '8px auto', borderRadius: 8 }} />
                        )
                      })
                    ) : (
                      <div style={{ color: '#64748b' }}>Không có ảnh</div>
                    )}
                  </div>

                  <div className="product-invoice-image-block">
                    <div className="invoice-label">Chi phí phát sinh</div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{(selectedTicketDetail.chiPhiPhatSinh || 0).toLocaleString('vi-VN')} đ</div>
                  </div>

                  <div className="product-invoice-image-block">
                    <div className="invoice-label">Trạng thái</div>
                    <div style={{ fontWeight: 700 }}>{getStatusBadge(selectedTicketDetail.trangThai).text}</div>
                    <div style={{ marginTop: 6, fontSize: '0.95rem', color: '#64748b' }}>Ngày hoàn tất: {selectedTicketDetail.ngayHoanTat ? new Date(selectedTicketDetail.ngayHoanTat).toLocaleString('vi-VN') : '-'}</div>
                  </div>

                  {/* Review Section */}
                  {(selectedTicketDetail.qualityRating || selectedTicketDetail.qualityComments) && (
                    <div className="product-invoice-image-block" style={{ marginTop: '1rem', borderTop: '1px solid #eef2f7', paddingTop: '1rem' }}>
                      <div className="invoice-label">Đánh giá từ khách hàng</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ color: '#fbbf24', fontSize: '1.2rem' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < (selectedTicketDetail.qualityRating || 0) ? 'star active' : 'star'} style={{ opacity: i < (selectedTicketDetail.qualityRating || 0) ? 1 : 0.3 }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontWeight: 600 }}>{selectedTicketDetail.qualityRating}/5</span>
                      </div>
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: '#334155',
                        fontStyle: 'italic'
                      }}>
                        "{selectedTicketDetail.qualityComments || 'Không có nhận xét'}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowTicketDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? '✏️ Sửa thông tin nhân viên' : '➕ Thêm nhân viên mới'}</h3>
              <button className="modal-close" onClick={() => { setShowEmployeeModal(false); setEditingEmployee(null); }}>×</button>
            </div>

            <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="modal-form">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  value={employeeForm.hoTen}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, hoTen: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu {editingEmployee ? '(để trống nếu không đổi)' : '*'}</label>
                <input
                  type="password"
                  value={employeeForm.matKhau}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, matKhau: e.target.value })}
                  placeholder={editingEmployee ? 'Để trống nếu không muốn đổi mật khẩu' : '••••••••'}
                  {...(editingEmployee ? {} : { required: true, minLength: 6 })}
                />
              </div>

              <div className="form-group">
                <label>Chức vụ *</label>
                <select
                  value={employeeForm.chucVu}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, chucVu: e.target.value })}
                  required
                >
                  <option value="nhanvien">Nhân viên</option>
                  <option value="quanly">Quản lý</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEmployeeModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (editingEmployee ? 'Đang cập nhật...' : 'Đang tạo...') : (editingEmployee ? 'Cập nhật' : 'Tạo nhân viên')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content modal-assign" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-title-section">
                <span className="modal-icon">👤</span>
                <div>
                  <h3>Gán nhân viên xử lý</h3>
                  <p className="modal-subtitle">Chọn nhân viên phù hợp để xử lý phiếu bảo hành</p>
                </div>
              </div>
              <button className="modal-close-modern" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>

            <div className="modal-body-modern">
              {/* Ticket Info Card */}
              <div className="assign-ticket-card">
                <div className="ticket-card-header">
                  <span className="ticket-icon">📋</span>
                  <h4>Thông tin phiếu</h4>
                </div>
                <div className="ticket-card-body">
                  <div className="ticket-info-row">
                    <span className="info-icon">🏷️</span>
                    <div className="info-content">
                      <span className="info-label">Mã phiếu</span>
                      <span className="info-value highlight">{selectedTicket.maPhieu}</span>
                    </div>
                  </div>
                  <div className="ticket-info-row">
                    <span className="info-icon">📦</span>
                    <div className="info-content">
                      <span className="info-label">Sản phẩm</span>
                      <span className="info-value">{selectedTicket.sanPhamId?.tenSP || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="ticket-info-row">
                    <span className="info-icon">👤</span>
                    <div className="info-content">
                      <span className="info-label">Khách hàng</span>
                      <span className="info-value">{selectedTicket.khachHangId?.hoTen || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="ticket-info-row">
                    <span className="info-icon">📈</span>
                    <div className="info-content">
                      <span className="info-label">Trạng thái</span>
                      <span className={`badge ${getStatusBadge(selectedTicket.trangThai).class}`}>
                        {getStatusBadge(selectedTicket.trangThai).text}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.nhanVienTiepNhanId && (
                    <div className="ticket-info-row highlight-row">
                      <span className="info-icon">👨‍🔧</span>
                      <div className="info-content">
                        <span className="info-label">Nhân viên hiện tại</span>
                        <span className="info-value">{selectedTicket.nhanVienTiepNhanId.hoTen}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Selection */}
              <div className="assign-employee-section">
                <div className="section-title-bar">
                  <span className="section-icon">👥</span>
                  <h4>Chọn nhân viên:</h4>
                </div>
                {employees.filter(emp => emp.chucVu === 'nhanvien').length === 0 ? (
                  <div className="empty-employees">
                    <span className="empty-icon">🚧</span>
                    <p>Không có nhân viên nào</p>
                  </div>
                ) : (
                  <div className="employee-selection-grid">
                    {employees.filter(emp => emp.chucVu === 'nhanvien').map(emp => (
                      <button
                        key={emp._id}
                        className={`employee-select-card ${selectedTicket.nhanVienTiepNhanId?._id === emp._id ? 'current' : ''
                          }`}
                        onClick={() => handleAssignEmployee(emp._id)}
                        disabled={loading}
                      >
                        <div className="employee-card-header">
                          <div className="employee-avatar-modern">
                            <span>👨‍🔧</span>
                          </div>
                          {selectedTicket.nhanVienTiepNhanId?._id === emp._id && (
                            <span className="current-badge-modern">✓ Hiện tại</span>
                          )}
                        </div>
                        <div className="employee-card-body">
                          <div className="employee-name-modern">{emp.hoTen}</div>
                          <div className="employee-email-modern">{emp.email}</div>
                        </div>
                        <div className="employee-card-footer">
                          <span className="select-text">
                            {selectedTicket.nhanVienTiepNhanId?._id === emp._id ? '🔄 Đổi gán' : '✅ Chọn'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions-modern">
              <button type="button" className="btn-cancel-modern" onClick={() => setShowAssignModal(false)}>
                ✖ Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProductDetail && (
        <div className="modal-overlay" onClick={() => setShowProductDetailModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header product-detail-header-modern">
              <div className="product-header-icon">🏸</div>
              <div className="product-header-info">
                <div className="product-title">{selectedProductDetail?.tenSP || 'Tên sản phẩm'}</div>
                <div className="product-meta-row">
                  <span className="product-type-badge">{selectedProductDetail?.loaiSanPham || 'Loại'}</span>
                  <span className="product-brand">{selectedProductDetail?.thuongHieu || 'Thương hiệu'}</span>
                  <span className="product-serial">SN: {selectedProductDetail?.soSerial || 'N/A'}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowProductDetailModal(false)}>×</button>
            </div>
            <div className="modal-body product-detail-body-modern">
              <div className="product-detail-modern-grid">
                <div className="product-detail-modern-left">
                  <div className="product-info-fullwidth">
                    <div className="info-row-fw">
                      <span className="info-icon-fw">📅</span>
                      <span className="info-label-fw">Ngày mua</span>
                      <span className="info-value-fw">{selectedProductDetail?.ngayMua ? (new Date(selectedProductDetail.ngayMua)).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                    <div className="info-row-fw">
                      <span className="info-icon-fw">⏳</span>
                      <span className="info-label-fw">Bảo hành</span>
                      <span className="info-value-fw">{selectedProductDetail?.thoiHanBaoHanhThang ? selectedProductDetail.thoiHanBaoHanhThang + ' tháng' : 'N/A'}</span>
                    </div>
                    <div className="info-row-fw">
                      <span className="info-icon-fw">👤</span>
                      <span className="info-label-fw">Khách hàng</span>
                      <span className="info-value-fw">{(() => {
                        if (!selectedProductDetail?.khachHangId) return 'N/A';
                        let kh = null;
                        if (typeof selectedProductDetail.khachHangId === 'object') {
                          kh = customers.find(c => c._id === selectedProductDetail.khachHangId._id);
                        } else {
                          kh = customers.find(c => c._id === selectedProductDetail.khachHangId);
                        }
                        return kh ? <><b>{kh.hoTen}</b><br /><span style={{ fontWeight: 400 }}>{kh.email}</span></> : 'N/A';
                      })()}</span>
                    </div>
                    <div className="info-row-fw tech-fw">
                      <span className="info-icon-fw">🛠️</span>
                      <span className="info-label-fw">Thông tin kỹ thuật</span>
                      <div className="info-value-fw tech-content-fw" style={{ padding: 0, margin: 0 }}>
                        {selectedProductDetail?.thongTinKyThuat
                          ? (typeof selectedProductDetail.thongTinKyThuat === 'object'
                            ? (
                              <div className="tech-table-fw">
                                {Object.entries(selectedProductDetail.thongTinKyThuat).map(([key, value]) =>
                                  key === 'moTa' ? (
                                    <div className="tech-row-fw tech-row-desc-fw" key={key}>
                                      <span className="tech-label-fw">Mô tả</span>
                                      <div className="tech-value-fw tech-desc-fw">{value}</div>
                                    </div>
                                  ) : (
                                    <div className="tech-row-fw" key={key}>
                                      <span className="tech-label-fw">{key === 'xuatXu' ? 'Xuất xứ' : key === 'trongLuong' ? 'Trọng lượng' : key}</span>
                                      <div className="tech-value-fw plain-value-fw">{value}</div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                            : <span>{selectedProductDetail.thongTinKyThuat}</span>)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-detail-modern-right">
                  {selectedProductDetail?.hinhAnhHoaDon && typeof selectedProductDetail.hinhAnhHoaDon === 'string' && (
                    <div className="product-invoice-image-block">
                      <div className="invoice-label">Ảnh hóa đơn</div>
                      <img src={selectedProductDetail.hinhAnhHoaDon} alt="Hóa đơn" className="product-invoice-image" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowProductDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPart ? '✏️ Sửa linh kiện' : '➕ Thêm linh kiện mới'}</h3>
              <button className="modal-close" onClick={() => setShowInventoryModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveInventory} className="modal-form">
              <div className="form-group">
                <label>Mã linh kiện *</label>
                <input
                  type="text"
                  value={inventoryForm.maLinhKien}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, maLinhKien: e.target.value })}
                  placeholder="VD: LK001"
                  required
                  disabled={!!editingPart}
                />
              </div>

              <div className="form-group">
                <label>Tên linh kiện *</label>
                <input
                  type="text"
                  value={inventoryForm.tenLinhKien}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, tenLinhKien: e.target.value })}
                  placeholder="VD: Dây cước Yonex BG65"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số lượng tồn *</label>
                  <input
                    type="number"
                    value={inventoryForm.soLuongTon}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, soLuongTon: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá nhập (VNĐ) *</label>
                  <input
                    type="number"
                    value={inventoryForm.giaNhap}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, giaNhap: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá xuất (VNĐ) *</label>
                  <input
                    type="number"
                    value={inventoryForm.giaXuat}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, giaXuat: parseInt(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={inventoryForm.moTa}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, moTa: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Đang lưu...' : (editingPart ? '💾 Cập nhật' : '➕ Thêm mới')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowInventoryModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
