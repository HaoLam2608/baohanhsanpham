import { useState, useEffect } from 'react'
import { managerAPI, generalAPI } from '../services/api'
import '../styles/ManagerPage.css'

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
  
  // State cho modal
  const [showProductModal, setShowProductModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  
  // Form data
  const [productForm, setProductForm] = useState({
    loaiSanPham: 'Vot',
    thuongHieu: '',
    tenSP: '',
    soSerial: '',
    ngayMua: '',
    thoiHanBaoHanhThang: 12,
    thongTinKyThuat: '',
    khachHangId: ''
  })
  
  const [employeeForm, setEmployeeForm] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    chucVu: 'nhanvien'
  })

  // Load data khi tab thay đổi
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    switch(activeTab) {
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
      case 'tickets':
        await loadTickets()
        break
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
        thongTinKyThuat: JSON.stringify(product.thongTinKyThuat || {}),
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
      thongTinKyThuat: '',
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
      tiep_nhan: { text: 'Tiếp nhận', class: 'badge-info' },
      dang_kiem_tra: { text: 'Đang kiểm tra', class: 'badge-warning' },
      dang_sua: { text: 'Đang sửa', class: 'badge-primary' },
      hoan_tat: { text: 'Hoàn tất', class: 'badge-success' },
      tu_choi: { text: 'Từ chối', class: 'badge-danger' }
    }
    return badges[status] || { text: status, class: 'badge-secondary' }
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
      </nav>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <span>❌</span> {error}
          <button onClick={() => setError('')}>×</button>
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

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <div className="section-header">
              <h2 className="section-title">📋 Quản lý phiếu bảo hành</h2>
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
                  {tickets.length === 0 ? (
                    <tr><td colSpan="8" className="text-center">Chưa có phiếu nào</td></tr>
                  ) : (
                    tickets.map(ticket => (
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
                  {products.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">Chưa có sản phẩm nào</td></tr>
                  ) : (
                    products.map(product => (
                      <tr key={product._id}>
                        <td><code>{product._id.slice(-6)}</code></td>
                        <td><strong>{product.tenSP}</strong></td>
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
                  {employees.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">Chưa có nhân viên nào</td></tr>
                  ) : (
                    employees.map(emp => (
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
                    onChange={(e) => setProductForm({...productForm, loaiSanPham: e.target.value})}
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
                    onChange={(e) => setProductForm({...productForm, thuongHieu: e.target.value})}
                    placeholder="VD: Yonex, Victor..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.tenSP}
                  onChange={(e) => setProductForm({...productForm, tenSP: e.target.value})}
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
                    onChange={(e) => setProductForm({...productForm, soSerial: e.target.value})}
                    placeholder="VD: SN123456"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Ngày mua</label>
                  <input
                    type="date"
                    value={productForm.ngayMua}
                    onChange={(e) => setProductForm({...productForm, ngayMua: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bảo hành (tháng) *</label>
                  <input
                    type="number"
                    value={productForm.thoiHanBaoHanhThang}
                    onChange={(e) => setProductForm({...productForm, thoiHanBaoHanhThang: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Khách hàng</label>
                  <select
                    value={productForm.khachHangId}
                    onChange={(e) => setProductForm({...productForm, khachHangId: e.target.value})}
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
                <textarea
                  value={productForm.thongTinKyThuat}
                  onChange={(e) => setProductForm({...productForm, thongTinKyThuat: e.target.value})}
                  rows="3"
                  placeholder="VD: Trọng lượng: 85g, Điểm cân bằng: 295mm..."
                />
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

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Thêm nhân viên mới</h3>
              <button className="modal-close" onClick={() => setShowEmployeeModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateEmployee} className="modal-form">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  value={employeeForm.hoTen}
                  onChange={(e) => setEmployeeForm({...employeeForm, hoTen: e.target.value})}
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  value={employeeForm.matKhau}
                  onChange={(e) => setEmployeeForm({...employeeForm, matKhau: e.target.value})}
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Chức vụ *</label>
                <select
                  value={employeeForm.chucVu}
                  onChange={(e) => setEmployeeForm({...employeeForm, chucVu: e.target.value})}
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
                  {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👤 Gán nhân viên xử lý</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="ticket-info-box">
                <p><strong>Mã phiếu:</strong> {selectedTicket.maPhieu}</p>
                <p><strong>Sản phẩm:</strong> {selectedTicket.sanPhamId?.tenSP || 'N/A'}</p>
                <p><strong>Khách hàng:</strong> {selectedTicket.khachHangId?.hoTen || 'N/A'}</p>
                <p><strong>Trạng thái:</strong> <span className={`badge ${getStatusBadge(selectedTicket.trangThai).class}`}>
                  {getStatusBadge(selectedTicket.trangThai).text}
                </span></p>
                {selectedTicket.nhanVienTiepNhanId && (
                  <p><strong>Nhân viên hiện tại:</strong> {selectedTicket.nhanVienTiepNhanId.hoTen}</p>
                )}
              </div>

              <div className="employee-list">
                <h4>Chọn nhân viên:</h4>
                {employees.filter(emp => emp.chucVu === 'nhanvien').length === 0 ? (
                  <p className="text-muted">Không có nhân viên nào</p>
                ) : (
                  <div className="employee-grid">
                    {employees.filter(emp => emp.chucVu === 'nhanvien').map(emp => (
                      <button
                        key={emp._id}
                        className={`employee-card ${selectedTicket.nhanVienTiepNhanId?._id === emp._id ? 'selected' : ''}`}
                        onClick={() => handleAssignEmployee(emp._id)}
                        disabled={loading}
                      >
                        <div className="employee-avatar">👤</div>
                        <div className="employee-info">
                          <div className="employee-name">{emp.hoTen}</div>
                          <div className="employee-email">{emp.email}</div>
                        </div>
                        {selectedTicket.nhanVienTiepNhanId?._id === emp._id && (
                          <div className="current-badge">✓ Hiện tại</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
