import { useState, useEffect } from 'react'
import { customerAPI, storage, generalAPI } from '../services/api'
import '../styles/CustomerPage.css'

export default function CustomerPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State data
  const [myTickets, setMyTickets] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [trackingResult, setTrackingResult] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [productWarrantyInfo, setProductWarrantyInfo] = useState(null)
  
  // Form states
  const [ticketCode, setTicketCode] = useState('')
  const [productSerial, setProductSerial] = useState('')
  const [warrantyForm, setWarrantyForm] = useState({
    sanPhamId: '',
    moTaLoi: '',
  })
  
  const [ratingForm, setRatingForm] = useState({
    ticketId: '',
    rating: 0,
    comment: ''
  })

  const user = storage.getUser()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (activeTab === 'overview' || activeTab === 'myTickets') {
      await loadMyTickets()
    }
    if (activeTab === 'createRequest' || activeTab === 'productWarranty') {
      await loadMyProducts()
    }
  }

  const loadMyTickets = async () => {
    try {
      setLoading(true)
      const data = await customerAPI.getWarrantyInfo(user.id)
      setMyTickets(data.tickets || [])
    } catch (err) {
      console.error('Error loading tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMyProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await generalAPI.getProducts()
      console.log('📦 All products from API:', data)
      console.log('👤 Current user ID:', user.id)
      
      // Filter products belonging to this customer
      // API populates khachHangId, so it might be an object with _id or just the ID string
      const customerProducts = data.filter(p => {
        if (!p.khachHangId) {
          console.log('⚠️ Product has no khachHangId:', p)
          return false
        }
        
        // Check if khachHangId is populated (object) or just ID (string)
        const productCustomerId = p.khachHangId._id || p.khachHangId
        const match = String(productCustomerId) === String(user.id)
        
        if (match) {
          console.log('✅ Match found:', p.tenSP, productCustomerId)
        }
        
        return match
      })
      
      console.log('🎯 Filtered customer products:', customerProducts)
      setMyProducts(customerProducts)
    } catch (err) {
      console.error('❌ Error loading products:', err)
      setError('Không thể tải danh sách sản phẩm: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitWarrantyRequest = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const result = await customerAPI.submitWarrantyRequest({
        sanPhamId: warrantyForm.sanPhamId,
        moTaLoi: warrantyForm.moTaLoi,
        khachHangId: user.id,
      })
      
      setSuccess(`✅ Gửi yêu cầu thành công! Mã phiếu: ${result.maPhieu}`)
      setWarrantyForm({ sanPhamId: '', moTaLoi: '' })
      loadMyTickets()
      setTimeout(() => setActiveTab('myTickets'), 2000)
    } catch (err) {
      setError(err.message || 'Gửi yêu cầu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackTicket = async (e) => {
    e.preventDefault()
    if (!ticketCode.trim()) {
      setError('Vui lòng nhập mã phiếu bảo hành')
      return
    }

    try {
      setLoading(true)
      setError('')
      setTrackingResult(null)
      
      const data = await customerAPI.trackTicket(ticketCode.trim())
      setTrackingResult(data)
      setSuccess('Tìm thấy phiếu bảo hành!')
    } catch (err) {
      setError(err.message || 'Không tìm thấy phiếu bảo hành')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (ratingForm.rating === 0) {
      setError('Vui lòng chọn số sao đánh giá')
      return
    }

    try {
      setLoading(true)
      setError('')
      // API call to submit rating (to be implemented in backend)
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/customer/rate/${ratingForm.ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storage.getToken()}`
        },
        body: JSON.stringify({
          rating: ratingForm.rating,
          comment: ratingForm.comment
        })
      })
      
      setSuccess('Cảm ơn bạn đã đánh giá!')
      setRatingForm({ ticketId: '', rating: 0, comment: '' })
      loadMyTickets()
    } catch (err) {
      setError('Gửi đánh giá thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckProductWarranty = async (e) => {
    e.preventDefault()
    if (!productSerial.trim()) {
      setError('Vui lòng nhập số serial sản phẩm')
      return
    }

    try {
      setLoading(true)
      setError('')
      setProductWarrantyInfo(null)
      
      // Tìm sản phẩm theo serial
      const product = myProducts.find(p => p.soSerial.toLowerCase() === productSerial.trim().toLowerCase())
      
      if (!product) {
        setError('Không tìm thấy sản phẩm với số serial này')
        return
      }

      // Tính toán thông tin bảo hành
      const purchaseDate = new Date(product.ngayMua)
      const warrantyEndDate = new Date(purchaseDate.getTime() + product.thoiHanBaoHanhThang * 30 * 24 * 60 * 60 * 1000)
      const today = new Date()
      const daysLeft = Math.ceil((warrantyEndDate - today) / (1000 * 60 * 60 * 24))
      const totalDays = product.thoiHanBaoHanhThang * 30
      const daysUsed = totalDays - daysLeft
      const percentUsed = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100))

      // Lấy lịch sử bảo hành
      const productTickets = myTickets.filter(t => t.sanPhamId?._id === product._id)

      setProductWarrantyInfo({
        product,
        purchaseDate,
        warrantyEndDate,
        daysLeft,
        totalDays,
        percentUsed,
        status: daysLeft > 30 ? 'valid' : daysLeft > 0 ? 'expiring' : 'expired',
        tickets: productTickets
      })

      setSuccess('Tìm thấy thông tin sản phẩm!')
    } catch (err) {
      setError('Có lỗi xảy ra khi tra cứu')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      tiep_nhan: { text: 'Tiếp nhận', class: 'badge-info', icon: '📥' },
      dang_kiem_tra: { text: 'Đang kiểm tra', class: 'badge-warning', icon: '🔍' },
      dang_sua: { text: 'Đang sửa', class: 'badge-primary', icon: '🔧' },
      hoan_tat: { text: 'Hoàn tất', class: 'badge-success', icon: '✅' },
      tu_choi: { text: 'Từ chối', class: 'badge-danger', icon: '❌' }
    }
    return badges[status] || { text: status, class: 'badge-secondary', icon: '❓' }
  }

  const getProgressPercentage = (status) => {
    const progress = {
      tiep_nhan: 25,
      dang_kiem_tra: 50,
      dang_sua: 75,
      hoan_tat: 100,
      tu_choi: 0
    }
    return progress[status] || 0
  }

  const completedTickets = myTickets.filter(t => t.trangThai === 'hoan_tat')
  const pendingTickets = myTickets.filter(t => t.trangThai !== 'hoan_tat' && t.trangThai !== 'tu_choi')

  return (
    <div className="customer-page">
      {/* Header */}
      <header className="customer-header">
        <div className="header-content">
          <div className="header-info">
            <h1>👋 Chào mừng, {user?.hoTen || 'Khách hàng'}</h1>
            <p>Quản lý yêu cầu bảo hành của bạn</p>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="customer-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span>Tổng quan</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'createRequest' ? 'active' : ''}`}
          onClick={() => setActiveTab('createRequest')}
        >
          <span className="tab-icon">➕</span>
          <span>Gửi yêu cầu</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'myTickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('myTickets')}
        >
          <span className="tab-icon">📋</span>
          <span>Phiếu của tôi</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'productWarranty' ? 'active' : ''}`}
          onClick={() => setActiveTab('productWarranty')}
        >
          <span className="tab-icon">🏷️</span>
          <span>Tra cứu SP</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
        >
          <span className="tab-icon">🔍</span>
          <span>Tra cứu phiếu</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'rate' ? 'active' : ''}`}
          onClick={() => setActiveTab('rate')}
        >
          <span className="tab-icon">⭐</span>
          <span>Đánh giá</span>
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
      <main className="customer-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2 className="section-title">📊 Tổng quan</h2>
            
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-label">Tổng phiếu</div>
                  <div className="stat-value">{myTickets.length}</div>
                </div>
              </div>
              
              <div className="stat-card orange">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-label">Đang xử lý</div>
                  <div className="stat-value">{pendingTickets.length}</div>
                </div>
              </div>
              
              <div className="stat-card green">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-label">Hoàn tất</div>
                  <div className="stat-value">{completedTickets.length}</div>
                </div>
              </div>
              
              <div className="stat-card purple">
                <div className="stat-icon">🏸</div>
                <div className="stat-content">
                  <div className="stat-label">Sản phẩm</div>
                  <div className="stat-value">{myProducts.length}</div>
                </div>
              </div>
            </div>

            <div className="recent-tickets">
              <h3>📌 Phiếu gần đây</h3>
              {myTickets.length === 0 ? (
                <div className="empty-state">
                  <p>🎉 Bạn chưa có phiếu bảo hành nào</p>
                  <button className="btn-primary" onClick={() => setActiveTab('createRequest')}>
                    Tạo yêu cầu mới
                  </button>
                </div>
              ) : (
                <div className="ticket-grid">
                  {myTickets.slice(0, 4).map(ticket => (
                    <div key={ticket._id} className="ticket-card-mini">
                      <div className="ticket-header-mini">
                        <span className="ticket-code">{ticket.maPhieu}</span>
                        <span className={`badge ${getStatusBadge(ticket.trangThai).class}`}>
                          {getStatusBadge(ticket.trangThai).icon} {getStatusBadge(ticket.trangThai).text}
                        </span>
                      </div>
                      <h4>{ticket.sanPhamId?.tenSP || 'Sản phẩm'}</h4>
                      <p className="ticket-date">
                        📅 {new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}
                      </p>
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini"
                          style={{ width: `${getProgressPercentage(ticket.trangThai)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'createRequest' && (
          <div className="create-section">
            <h2 className="section-title">➕ Gửi yêu cầu bảo hành</h2>
            
            <div className="form-container">
              <form onSubmit={handleSubmitWarrantyRequest} className="warranty-form">
                <div className="form-group">
                  <label>Chọn sản phẩm *</label>
                  <select
                    value={warrantyForm.sanPhamId}
                    onChange={(e) => setWarrantyForm({...warrantyForm, sanPhamId: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn sản phẩm cần bảo hành --</option>
                    {myProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.tenSP} - {product.loaiSanPham} ({product.soSerial})
                      </option>
                    ))}
                  </select>
                  {myProducts.length === 0 && (
                    <p className="form-hint">⚠️ Bạn chưa có sản phẩm nào được đăng ký</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Mô tả sự cố *</label>
                  <textarea
                    value={warrantyForm.moTaLoi}
                    onChange={(e) => setWarrantyForm({...warrantyForm, moTaLoi: e.target.value})}
                    rows="6"
                    placeholder="Mô tả chi tiết vấn đề của sản phẩm: triệu chứng, khi nào xảy ra, tần suất..."
                    required
                  />
                  <p className="form-hint">💡 Mô tả càng chi tiết, quá trình xử lý càng nhanh</p>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading || myProducts.length === 0}>
                    {loading ? '⏳ Đang gửi...' : '📤 Gửi yêu cầu'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setWarrantyForm({ sanPhamId: '', moTaLoi: '' })}
                  >
                    🔄 Làm mới
                  </button>
                </div>
              </form>

              <div className="info-box">
                <h4>📝 Lưu ý khi gửi yêu cầu</h4>
                <ul>
                  <li>✓ Kiểm tra sản phẩm còn trong thời hạn bảo hành</li>
                  <li>✓ Mô tả rõ ràng, chi tiết vấn đề gặp phải</li>
                  <li>✓ Bạn sẽ nhận được mã phiếu để tra cứu</li>
                  <li>✓ Thời gian xử lý: 3-7 ngày làm việc</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'myTickets' && (
          <div className="tickets-section">
            <div className="section-header">
              <h2 className="section-title">📋 Danh sách phiếu bảo hành</h2>
              <button className="btn-primary" onClick={() => setActiveTab('createRequest')}>
                <span>➕</span> Tạo mới
              </button>
            </div>

            {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

            {!loading && myTickets.length === 0 && (
              <div className="empty-state">
                <p>📭 Bạn chưa có phiếu bảo hành nào</p>
              </div>
            )}

            <div className="ticket-list">
              {myTickets.map(ticket => (
                <div key={ticket._id} className="ticket-card">
                  <div className="ticket-card-header">
                    <div>
                      <h3>{ticket.sanPhamId?.tenSP || 'Sản phẩm'}</h3>
                      <p className="ticket-code">Mã: {ticket.maPhieu}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(ticket.trangThai).class}`}>
                      {getStatusBadge(ticket.trangThai).icon} {getStatusBadge(ticket.trangThai).text}
                    </span>
                  </div>

                  <div className="ticket-card-body">
                    <div className="ticket-info">
                      <div className="info-item">
                        <span className="info-label">🏷️ Loại:</span>
                        <span className="info-value">{ticket.sanPhamId?.loaiSanPham || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">📅 Tiếp nhận:</span>
                        <span className="info-value">
                          {new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {ticket.ngayHoanTat && (
                        <div className="info-item">
                          <span className="info-label">✅ Hoàn tất:</span>
                          <span className="info-value">
                            {new Date(ticket.ngayHoanTat).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ticket-description">
                      <strong>Mô tả:</strong>
                      <p>{ticket.moTaLoi}</p>
                    </div>

                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgressPercentage(ticket.trangThai)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{getProgressPercentage(ticket.trangThai)}% hoàn thành</span>
                    </div>
                  </div>

                  <div className="ticket-card-footer">
                    <button 
                      className="btn-detail"
                      onClick={() => {
                        setTicketCode(ticket.maPhieu)
                        setActiveTab('track')
                      }}
                    >
                      🔍 Xem chi tiết
                    </button>
                    {ticket.trangThai === 'hoan_tat' && (
                      <button 
                        className="btn-rate"
                        onClick={() => {
                          setRatingForm({ ...ratingForm, ticketId: ticket._id })
                          setActiveTab('rate')
                        }}
                      >
                        ⭐ Đánh giá
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Warranty Tab */}
        {activeTab === 'productWarranty' && (
          <div className="product-warranty-section">
            <h2 className="section-title">🏷️ Quản lý bảo hành sản phẩm</h2>
            
            <div className="products-warranty-grid">
              {/* Products List */}
              <div className="products-list-panel">
                <div className="panel-header">
                  <h3>📦 Sản phẩm của bạn ({myProducts.length})</h3>
                </div>

                {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

                {!loading && myProducts.length === 0 && (
                  <div className="empty-state">
                    <p>📭 Bạn chưa có sản phẩm nào được đăng ký</p>
                    <p className="empty-hint">Liên hệ cửa hàng để đăng ký sản phẩm của bạn</p>
                  </div>
                )}

                {!loading && myProducts.length > 0 && (
                  <div className="products-list">
                    {myProducts.map(product => {
                      const purchaseDate = new Date(product.ngayMua)
                      const warrantyEndDate = new Date(purchaseDate.getTime() + product.thoiHanBaoHanhThang * 30 * 24 * 60 * 60 * 1000)
                      const daysLeft = Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))
                      const totalDays = product.thoiHanBaoHanhThang * 30
                      const status = daysLeft > 30 ? 'valid' : daysLeft > 0 ? 'expiring' : 'expired'
                      
                      return (
                        <div 
                          key={product._id} 
                          className={`product-item ${productWarrantyInfo?.product._id === product._id ? 'active' : ''}`}
                          onClick={() => {
                            // Calculate warranty info
                            const totalDays = product.thoiHanBaoHanhThang * 30
                            const daysUsed = totalDays - daysLeft
                            const percentUsed = Math.max(0, Math.min(100, (daysUsed / totalDays) * 100))
                            const productTickets = myTickets.filter(t => t.sanPhamId?._id === product._id)

                            setProductWarrantyInfo({
                              product,
                              purchaseDate,
                              warrantyEndDate,
                              daysLeft,
                              totalDays,
                              percentUsed,
                              status,
                              tickets: productTickets
                            })
                            setSuccess('') // Clear success message
                          }}
                        >
                          <div className="product-item-header">
                            <div className="product-icon">
                              {product.loaiSanPham === 'Vot' && '🏸'}
                              {product.loaiSanPham === 'Giay' && '👟'}
                              {product.loaiSanPham === 'Balo' && '🎒'}
                              {product.loaiSanPham === 'PhuKien' && '🔧'}
                            </div>
                            <div className="product-item-info">
                              <h4>{product.tenSP}</h4>
                              <p className="product-brand">{product.thuongHieu || 'N/A'} • {product.loaiSanPham}</p>
                              <p className="product-serial">SN: {product.soSerial}</p>
                            </div>
                          </div>
                          
                          <div className="product-item-warranty">
                            <span className={`warranty-status-badge ${status}`}>
                              {status === 'valid' && '✅ Còn hạn'}
                              {status === 'expiring' && '⚠️ Sắp hết'}
                              {status === 'expired' && '❌ Hết hạn'}
                            </span>
                            <span className="warranty-days">
                              {daysLeft > 0 ? `${daysLeft} ngày` : `Quá ${Math.abs(daysLeft)} ngày`}
                            </span>
                          </div>

                          <div className="product-item-footer">
                            <div className="mini-progress-bar">
                              <div 
                                className="mini-progress-fill"
                                style={{ 
                                  width: `${Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100))}%`,
                                  background: status === 'valid' ? 'var(--success-color)' : status === 'expiring' ? 'var(--warning-color)' : 'var(--danger-color)'
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Warranty Details */}
              <div className="warranty-details-panel">
                {!productWarrantyInfo ? (
                  <div className="no-selection">
                    <div className="no-selection-icon">🏷️</div>
                    <h3>Chọn sản phẩm để xem chi tiết</h3>
                    <p>Click vào sản phẩm bên trái để xem thông tin bảo hành đầy đủ</p>
                  </div>
                ) : (
                  <div className="warranty-detail-card">
                    <div className="warranty-detail-header">
                      <div className="header-info">
                        <h3>📋 Chi tiết bảo hành</h3>
                        <span className={`warranty-status-large ${productWarrantyInfo.status}`}>
                          {productWarrantyInfo.status === 'valid' && '✅ Còn hạn bảo hành'}
                          {productWarrantyInfo.status === 'expiring' && '⚠️ Sắp hết hạn'}
                          {productWarrantyInfo.status === 'expired' && '❌ Hết hạn bảo hành'}
                        </span>
                      </div>
                    </div>

                    <div className="warranty-detail-body">
                      {/* Product Info */}
                      <div className="detail-section">
                        <h4>🏸 Thông tin sản phẩm</h4>
                        <div className="detail-grid">
                          <div className="detail-row">
                            <span className="detail-label">Tên sản phẩm:</span>
                            <span className="detail-value">{productWarrantyInfo.product.tenSP}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Loại:</span>
                            <span className="detail-value">{productWarrantyInfo.product.loaiSanPham}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Thương hiệu:</span>
                            <span className="detail-value">{productWarrantyInfo.product.thuongHieu || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Số serial:</span>
                            <span className="detail-value"><code>{productWarrantyInfo.product.soSerial}</code></span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Thời hạn BH:</span>
                            <span className="detail-value">{productWarrantyInfo.product.thoiHanBaoHanhThang} tháng</span>
                          </div>
                        </div>
                      </div>

                      {/* Warranty Timeline */}
                      <div className="detail-section">
                        <h4>📅 Thời gian bảo hành</h4>
                        <div className="warranty-timeline">
                          <div className="timeline-point">
                            <div className="point-icon">🛒</div>
                            <div className="point-info">
                              <span className="point-label">Ngày mua</span>
                              <span className="point-value">{productWarrantyInfo.purchaseDate.toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          
                          <div className="timeline-line">
                            <div 
                              className="timeline-progress"
                              style={{ width: `${productWarrantyInfo.percentUsed}%` }}
                            ></div>
                          </div>
                          
                          <div className="timeline-point">
                            <div className={`point-icon ${productWarrantyInfo.status === 'expired' ? 'expired' : 'valid'}`}>
                              {productWarrantyInfo.status === 'expired' ? '🔴' : '🟢'}
                            </div>
                            <div className="point-info">
                              <span className="point-label">Hết hạn</span>
                              <span className="point-value">{productWarrantyInfo.warrantyEndDate.toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="warranty-summary">
                          <div className="summary-item">
                            <span className="summary-label">Đã qua</span>
                            <span className="summary-value">{Math.round(productWarrantyInfo.percentUsed)}%</span>
                            <div className="summary-bar">
                              <div style={{ width: `${productWarrantyInfo.percentUsed}%` }}></div>
                            </div>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">{productWarrantyInfo.daysLeft > 0 ? 'Còn lại' : 'Quá hạn'}</span>
                            <span className="summary-value">{Math.abs(productWarrantyInfo.daysLeft)} ngày</span>
                          </div>
                        </div>
                      </div>

                      {/* Warranty History */}
                      {productWarrantyInfo.tickets.length > 0 && (
                        <div className="detail-section">
                          <h4>📜 Lịch sử bảo hành ({productWarrantyInfo.tickets.length} lần)</h4>
                          <div className="warranty-history-list">
                            {productWarrantyInfo.tickets.map(ticket => (
                              <div key={ticket._id} className="history-card">
                                <div className="history-card-header">
                                  <span className="history-code">{ticket.maPhieu}</span>
                                  <span className={`badge ${getStatusBadge(ticket.trangThai).class}`}>
                                    {getStatusBadge(ticket.trangThai).icon} {getStatusBadge(ticket.trangThai).text}
                                  </span>
                                </div>
                                <p className="history-description">{ticket.moTaLoi}</p>
                                <div className="history-footer">
                                  <span className="history-date">
                                    📅 {new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}
                                  </span>
                                  {ticket.ngayHoanTat && (
                                    <span className="history-completed">
                                      ✅ {new Date(ticket.ngayHoanTat).toLocaleDateString('vi-VN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alert Messages */}
                      {productWarrantyInfo.status === 'expiring' && (
                        <div className="warranty-alert warning">
                          <strong>⚠️ Cảnh báo:</strong> Bảo hành sắp hết hạn trong {productWarrantyInfo.daysLeft} ngày. 
                          Hãy kiểm tra sản phẩm và liên hệ nếu cần hỗ trợ.
                        </div>
                      )}

                      {productWarrantyInfo.status === 'expired' && (
                        <div className="warranty-alert danger">
                          <strong>❌ Thông báo:</strong> Sản phẩm đã hết thời hạn bảo hành {Math.abs(productWarrantyInfo.daysLeft)} ngày. 
                          Vui lòng liên hệ để biết thêm thông tin về dịch vụ sửa chữa trả phí.
                        </div>
                      )}

                      {productWarrantyInfo.status === 'valid' && (
                        <div className="warranty-alert success">
                          <strong>✅ Trạng thái:</strong> Sản phẩm vẫn còn {productWarrantyInfo.daysLeft} ngày bảo hành. 
                          Bạn có thể yên tâm sử dụng.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="warranty-detail-footer">
                      {productWarrantyInfo.status !== 'expired' && (
                        <button 
                          className="btn-primary btn-large"
                          onClick={() => {
                            setWarrantyForm({ 
                              ...warrantyForm, 
                              sanPhamId: productWarrantyInfo.product._id 
                            })
                            setActiveTab('createRequest')
                          }}
                        >
                          <span>📝</span> Tạo yêu cầu bảo hành
                        </button>
                      )}
                      <button 
                        className="btn-secondary btn-large"
                        onClick={() => {
                          if (productWarrantyInfo.tickets.length > 0) {
                            setTicketCode(productWarrantyInfo.tickets[0].maPhieu)
                            setActiveTab('track')
                          }
                        }}
                      >
                        <span>�</span> Xem lịch sử chi tiết
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Track Tab */}
        {activeTab === 'track' && (
          <div className="track-section">
            <h2 className="section-title">🔍 Tra cứu phiếu bảo hành</h2>
            
            <form onSubmit={handleTrackTicket} className="track-form">
              <div className="form-group">
                <label>Nhập mã phiếu bảo hành</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="VD: BH000001"
                  />
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳' : '🔍'} Tra cứu
                  </button>
                </div>
              </div>
            </form>

            {trackingResult && (
              <div className="tracking-result">
                <div className="result-header">
                  <h3>📄 Thông tin phiếu: {trackingResult.maPhieu}</h3>
                  <span className={`badge-large ${getStatusBadge(trackingResult.trangThai).class}`}>
                    {getStatusBadge(trackingResult.trangThai).icon} {getStatusBadge(trackingResult.trangThai).text}
                  </span>
                </div>

                <div className="result-grid">
                  {trackingResult.sanPhamId && (
                    <div className="result-card">
                      <h4>🏸 Thông tin sản phẩm</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Tên sản phẩm:</span>
                          <span className="value">{trackingResult.sanPhamId.tenSP}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Loại:</span>
                          <span className="value">{trackingResult.sanPhamId.loaiSanPham}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Thương hiệu:</span>
                          <span className="value">{trackingResult.sanPhamId.thuongHieu || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Số serial:</span>
                          <span className="value">{trackingResult.sanPhamId.soSerial}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="result-card">
                    <h4>📅 Thời gian</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Ngày tiếp nhận:</span>
                        <span className="value">
                          {new Date(trackingResult.ngayTiepNhan).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {trackingResult.ngayHoanTat && (
                        <div className="detail-item">
                          <span className="label">Ngày hoàn tất:</span>
                          <span className="value">
                            {new Date(trackingResult.ngayHoanTat).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {trackingResult.nhanVienTiepNhanId && (
                    <div className="result-card">
                      <h4>👤 Nhân viên xử lý</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="label">Họ tên:</span>
                          <span className="value">{trackingResult.nhanVienTiepNhanId.hoTen}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Email:</span>
                          <span className="value">{trackingResult.nhanVienTiepNhanId.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="result-card full-width">
                    <h4>📝 Mô tả sự cố</h4>
                    <p className="issue-description">{trackingResult.moTaLoi}</p>
                  </div>

                  {trackingResult.lichSuTrangThai && trackingResult.lichSuTrangThai.length > 0 && (
                    <div className="result-card full-width">
                      <h4>⏱️ Lịch sử trạng thái</h4>
                      <div className="timeline">
                        {trackingResult.lichSuTrangThai
                          .sort((a, b) => new Date(a.thoiGian) - new Date(b.thoiGian))
                          .map((item, index) => (
                            <div key={index} className="timeline-item">
                              <div className="timeline-marker">
                                <div className={`marker-dot ${item.trangThai}`}></div>
                                {index < trackingResult.lichSuTrangThai.length - 1 && (
                                  <div className="marker-line"></div>
                                )}
                              </div>
                              <div className="timeline-content">
                                <div className="timeline-status">
                                  {getStatusBadge(item.trangThai).icon} {getStatusBadge(item.trangThai).text}
                                </div>
                                <div className="timeline-time">
                                  {new Date(item.thoiGian).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Tab */}
        {activeTab === 'rate' && (
          <div className="rate-section">
            <h2 className="section-title">⭐ Đánh giá chất lượng</h2>
            
            {completedTickets.length === 0 ? (
              <div className="empty-state">
                <p>🎯 Bạn chưa có phiếu nào hoàn tất để đánh giá</p>
              </div>
            ) : (
              <div className="rating-container">
                <form onSubmit={handleSubmitRating} className="rating-form">
                  <div className="form-group">
                    <label>Chọn phiếu đã hoàn tất</label>
                    <select
                      value={ratingForm.ticketId}
                      onChange={(e) => setRatingForm({...ratingForm, ticketId: e.target.value})}
                      required
                    >
                      <option value="">-- Chọn phiếu --</option>
                      {completedTickets.map(ticket => (
                        <option key={ticket._id} value={ticket._id}>
                          {ticket.maPhieu} - {ticket.sanPhamId?.tenSP}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Đánh giá chất lượng dịch vụ</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= ratingForm.rating ? 'active' : ''}`}
                          onClick={() => setRatingForm({...ratingForm, rating: star})}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <p className="rating-label">
                      {ratingForm.rating === 0 && 'Chọn số sao'}
                      {ratingForm.rating === 1 && '⭐ Rất không hài lòng'}
                      {ratingForm.rating === 2 && '⭐⭐ Không hài lòng'}
                      {ratingForm.rating === 3 && '⭐⭐⭐ Bình thường'}
                      {ratingForm.rating === 4 && '⭐⭐⭐⭐ Hài lòng'}
                      {ratingForm.rating === 5 && '⭐⭐⭐⭐⭐ Rất hài lòng'}
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Nhận xét chi tiết (không bắt buộc)</label>
                    <textarea
                      value={ratingForm.comment}
                      onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})}
                      rows="4"
                      placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ bảo hành..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading || !ratingForm.ticketId}>
                      {loading ? '⏳ Đang gửi...' : '📤 Gửi đánh giá'}
                    </button>
                  </div>
                </form>

                <div className="info-box">
                  <h4>💡 Tại sao nên đánh giá?</h4>
                  <ul>
                    <li>✓ Giúp chúng tôi cải thiện chất lượng dịch vụ</li>
                    <li>✓ Chia sẻ trải nghiệm với cộng đồng</li>
                    <li>✓ Nhận ưu đãi cho lần bảo hành tiếp theo</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
