import { useState, useEffect } from 'react'
import { customerAPI, storage, generalAPI } from '../services/api'
import '../styles/CustomerPage.css'

export default function CustomerPage({ onLogout }) {
  const user = storage.getUser()

  const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024
  const MAX_ATTACHMENT_SIZE_MB = Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024))
  const MAX_ATTACHMENT_COUNT = 5

  const createInitialWarrantyForm = () => ({
    sanPhamId: '',
    hoTen: user?.hoTen || '',
    soDienThoai: user?.soDienThoai || '',
    email: user?.email || '',
    maDonHang: '',
    soSerial: '',
    moTaLoi: '',
    attachments: []
  })

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
  const [warrantyForm, setWarrantyForm] = useState(createInitialWarrantyForm)
  
  const [ratingForm, setRatingForm] = useState({
    ticketId: '',
    rating: 0,
    comment: ''
  })

  const updateWarrantyField = (field, value) => {
    setWarrantyForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  // Auto-hide success and error messages after 4 seconds
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(t)
  }, [success])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 4000)
    return () => clearTimeout(t)
  }, [error])

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
    } catch (e) {
      console.error('Error loading tickets:', e)
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

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const handleAttachmentChange = async (event) => {
    const input = event.target
    const selectedFiles = Array.from(input.files || [])
    if (selectedFiles.length === 0) return

    const messages = []
    const availableSlots = Math.max(0, MAX_ATTACHMENT_COUNT - warrantyForm.attachments.length)
    const filesToProcess = availableSlots > 0 ? selectedFiles.slice(0, availableSlots) : []

    if (selectedFiles.length > filesToProcess.length) {
      messages.push(`Chỉ được đính kèm tối đa ${MAX_ATTACHMENT_COUNT} tệp minh họa.`)
    }

    const processedFiles = []

    for (const file of filesToProcess) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        messages.push(`Tệp "${file.name}" vượt quá dung lượng ${MAX_ATTACHMENT_SIZE_MB}MB.`)
        continue
      }

      // Store the File object directly so we can send FormData to backend
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        preview: URL.createObjectURL(file)
      })
    }

    if (processedFiles.length > 0) {
      setWarrantyForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...processedFiles]
      }))
    }

    if (messages.length > 0) {
      setError(messages.join(' '))
      setSuccess('')
    }

    input.value = ''
  }

  const handleRemoveAttachment = (index) => {
    setWarrantyForm(prev => {
      const removed = prev.attachments[index]
      if (removed && removed.preview) {
        try { URL.revokeObjectURL(removed.preview) } catch (e) {}
      }
      return {
        ...prev,
        attachments: prev.attachments.filter((_, idx) => idx !== index)
      }
    })
  }

  const formatAttachmentSize = (size) => {
    if (size === undefined || size === null) return ''
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleSubmitWarrantyRequest = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!warrantyForm.hoTen.trim() || !warrantyForm.soDienThoai.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại liên hệ.')
      return
    }

    if (!warrantyForm.maDonHang.trim() && !warrantyForm.soSerial.trim()) {
      setError('Vui lòng nhập mã đơn hàng hoặc số serial sản phẩm.')
      return
    }

    try {
      setLoading(true)

      const contactInfo = {
        hoTen: warrantyForm.hoTen.trim(),
        soDienThoai: warrantyForm.soDienThoai.trim(),
        email: warrantyForm.email.trim(),
        maDonHang: warrantyForm.maDonHang.trim(),
        soSerial: warrantyForm.soSerial.trim()
      }

      let result

      // If there are actual File objects, build FormData and send multipart
      const hasFiles = warrantyForm.attachments.some(a => a.file)
      if (hasFiles) {
        const formData = new FormData()
        formData.append('sanPhamId', warrantyForm.sanPhamId)
        formData.append('moTaLoi', warrantyForm.moTaLoi.trim())
        formData.append('khachHangId', user.id)
        formData.append('thongTinLienHe', JSON.stringify(contactInfo))

        // Append any files under the field name 'attachments'
        warrantyForm.attachments.forEach(a => {
          if (a.file) {
            formData.append('attachments', a.file, a.name)
          }
        })

        // For compatibility, also include any non-file attachments (base64) as JSON
        const nonFileAttachments = warrantyForm.attachments
          .filter(a => !a.file && a.data)
          .map(a => ({ tenTep: a.name, kieuNoiDung: a.type, duLieu: a.data, kichThuoc: a.size }))
        if (nonFileAttachments.length > 0) {
          formData.append('tepDinhKem', JSON.stringify(nonFileAttachments))
        }

        result = await customerAPI.submitWarrantyRequest(formData)
      } else {
        const attachmentsPayload = warrantyForm.attachments.map(file => ({
          tenTep: file.name,
          kieuNoiDung: file.type,
          duLieu: file.data,
          kichThuoc: file.size
        }))

        result = await customerAPI.submitWarrantyRequest({
          sanPhamId: warrantyForm.sanPhamId,
          moTaLoi: warrantyForm.moTaLoi.trim(),
          khachHangId: user.id,
          thongTinLienHe: contactInfo,
          tepDinhKem: attachmentsPayload
        })
      }

      const ticketCode = result?.data?.maPhieu || result?.maPhieu || ''
      const confirmationMessage = result?.confirmation || 'Hệ thống sẽ gửi thông báo xác nhận qua email hoặc số điện thoại bạn cung cấp.'
      setSuccess(`✅ Gửi yêu cầu thành công! Mã phiếu: ${ticketCode || 'Đang cập nhật'}. ${confirmationMessage}`)
      setWarrantyForm(createInitialWarrantyForm())
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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/customer/rate/${ratingForm.ticketId}`, {
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
      
      let data
      try {
        data = await response.json()
      } catch (parseErr) {
        // response was not JSON (often an HTML error page) - capture text for debugging
        const text = await response.text().catch(() => '')
        console.error('Non-JSON response from rating endpoint:', text)
        setError(`Lỗi server: không nhận được JSON (status ${response.status}). Xem console để biết thêm chi tiết.`)
        return
      }

      if (!response.ok) {
        // Hiện lỗi từ backend
        setError(data.message || 'Gửi đánh giá thất bại')
        return
      }
      
      setSuccess('Cảm ơn bạn đã gửi đánh giá!')
      setRatingForm({ ticketId: '', rating: 0, comment: '' })
      // Reload tickets để cập nhật trạng thái đã đánh giá
      await loadMyTickets()
      // Chuyển về tab danh sách phiếu
      setActiveTab('myTickets')
    } catch (err) {
      console.error('Rating error:', err)
      setError('Gửi đánh giá thất bại: ' + err.message)
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
  // Date & status filters for staff page (single date or range + status)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // '' = tất cả
  const [ticketSearch, setTicketSearch] = useState('') // Search for tickets

  const clearDateFilters = () => {
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setTicketSearch('')
  }

  // Apply date & status filtering to the tickets shown in staff view
  const displayedTickets = myTickets.filter(t => {
    // Search filter
    if (ticketSearch) {
      const q = ticketSearch.trim().toLowerCase()
      const productName = (t.sanPhamId?.tenSP || '').toLowerCase()
      const ticketCode = (t.maPhieu || '').toLowerCase()
      const description = (t.moTaLoi || '').toLowerCase()
      const productType = (t.sanPhamId?.loaiSanPham || '').toLowerCase()
      if (!productName.includes(q) && !ticketCode.includes(q) && !description.includes(q) && !productType.includes(q)) {
        return false
      }
    }
    
    // Status filter
    if (statusFilter && t.trangThai !== statusFilter) return false
    
    // Date filter
    if (!t.ngayTiepNhan) return true
    const ticketDate = new Date(t.ngayTiepNhan)
    if (dateFrom) {
      const from = new Date(dateFrom)
      // include day start
      from.setHours(0,0,0,0)
      if (ticketDate < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      // include end of day
      to.setHours(23,59,59,999)
      if (ticketDate > to) return false
    }
    return true
  })

  // Product search for Product Warranty tab
  const [pwSearch, setPwSearch] = useState('')

  const displayedProducts = myProducts.filter(p => {
    if (!p) return false
    if (!pwSearch) return true
    const q = pwSearch.trim().toLowerCase()
    const name = (p.tenSP || '').toLowerCase()
    const serial = (p.soSerial || '').toLowerCase()
    const brand = (p.thuongHieu || '').toLowerCase()
    return name.includes(q) || serial.includes(q) || brand.includes(q)
  })

  const getProductWarrantyStatus = (product) => {
    try {
      const purchaseDate = new Date(product.ngayMua)
      const warrantyEndDate = new Date(purchaseDate.getTime() + (product.thoiHanBaoHanhThang || 0) * 30 * 24 * 60 * 60 * 1000)
      const daysLeft = Math.ceil((warrantyEndDate - new Date()) / (1000 * 60 * 60 * 24))
      return daysLeft > 30 ? 'valid' : daysLeft > 0 ? 'expiring' : 'expired'
    } catch (e) {
      return 'valid'
    }
  }

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
              <div className="info-box">
                <h4>📝 Hướng dẫn gửi yêu cầu</h4>
                <ol>
                  <li><strong>Bước 1:</strong> Điền thông tin liên hệ và chọn sản phẩm cần bảo hành.</li>
                  <li><strong>Bước 2:</strong> Mô tả chi tiết lỗi, đính kèm hình ảnh/video minh họa (nếu có).</li>
                  <li><strong>Bước 3:</strong> Nhấn "Gửi yêu cầu bảo hành" để hệ thống ghi nhận và tạo mã phiếu.</li>
                </ol>
                <p className="info-note">Sau khi gửi, bạn sẽ nhận được thông báo xác nhận qua email hoặc số điện thoại đã cung cấp.</p>
              </div>

              <form onSubmit={handleSubmitWarrantyRequest} className="warranty-form">
                <div className="form-section">
                  <h3 className="form-section-title">Điền thông tin yêu cầu</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Họ tên khách hàng *</label>
                      <input
                        type="text"
                        value={warrantyForm.hoTen}
                        onChange={(e) => updateWarrantyField('hoTen', e.target.value)}
                        placeholder="Nhập họ tên đầy đủ"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại liên hệ *</label>
                      <input
                        type="tel"
                        value={warrantyForm.soDienThoai}
                        onChange={(e) => updateWarrantyField('soDienThoai', e.target.value)}
                        placeholder="VD: 0901 234 567"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email (nếu có)</label>
                      <input
                        type="email"
                        value={warrantyForm.email}
                        onChange={(e) => updateWarrantyField('email', e.target.value)}
                        placeholder="VD: email@domain.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Thông tin sản phẩm</h3>
                  <div className="form-group">
                    <label>Chọn sản phẩm *</label>
                    <select
                      value={warrantyForm.sanPhamId}
                      onChange={(e) => {
                        const value = e.target.value
                        const selectedProduct = myProducts.find(product => product._id === value)
                        setWarrantyForm(prev => ({
                          ...prev,
                          sanPhamId: value,
                          soSerial: selectedProduct?.soSerial || ''
                        }))
                      }}
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
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mã đơn hàng</label>
                      <input
                        type="text"
                        value={warrantyForm.maDonHang}
                        onChange={(e) => updateWarrantyField('maDonHang', e.target.value)}
                        placeholder="VD: DH123456 (nếu có)"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số serial sản phẩm *</label>
                      <input
                        type="text"
                        value={warrantyForm.soSerial}
                        onChange={(e) => updateWarrantyField('soSerial', e.target.value)}
                        placeholder="VD: SN123456789"
                        required={!warrantyForm.maDonHang}
                      />
                      <p className="form-hint">Nhập mã đơn hàng hoặc số serial in trên phiếu hoặc thân sản phẩm.</p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Mô tả & minh họa</h3>
                  <div className="form-group">
                    <label>Mô tả sự cố *</label>
                    <textarea
                      value={warrantyForm.moTaLoi}
                      onChange={(e) => updateWarrantyField('moTaLoi', e.target.value)}
                      rows="6"
                      placeholder="Mô tả chi tiết vấn đề của sản phẩm: triệu chứng, khi nào xảy ra, tần suất..."
                      required
                    />
                    <p className="form-hint">Mô tả càng cụ thể, kỹ thuật viên càng dễ hỗ trợ bạn nhanh chóng.</p>
                  </div>
                  <div className="form-group">
                    <label>Gửi kèm hình ảnh/video (nếu có)</label>
                    <div className="attachment-upload">
                      <input
                        id="warranty-attachments"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleAttachmentChange}
                      />
                      <label htmlFor="warranty-attachments" className="upload-label">
                        <span className="upload-icon">📎</span>
                        <div className="upload-text">
                          <strong>Thêm tệp minh họa</strong>
                          <span>Hình ảnh hoặc video giúp kỹ thuật viên đánh giá nhanh hơn</span>
                        </div>
                      </label>
                    </div>
                    {warrantyForm.attachments.length > 0 && (
                      <ul className="attachment-list">
                        {warrantyForm.attachments.map((file, index) => (
                          <li key={`${file.name}-${index}`}>
                            <div className="attachment-info">
                              <span className="attachment-name">{file.name}</span>
                              <span className="attachment-meta">{file.type || 'Tệp đính kèm'} · {formatAttachmentSize(file.size)}</span>
                            </div>
                            <button
                              type="button"
                              className="attachment-remove"
                              onClick={() => handleRemoveAttachment(index)}
                              aria-label={`Xóa ${file.name}`}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="form-hint">Tối đa {MAX_ATTACHMENT_COUNT} tệp, mỗi tệp ≤ {MAX_ATTACHMENT_SIZE_MB}MB.</p>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading || myProducts.length === 0}>
                    {loading ? '⏳ Đang gửi...' : '📤 Gửi yêu cầu bảo hành'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setWarrantyForm(createInitialWarrantyForm())}
                  >
                    🔄 Làm mới
                  </button>
                </div>
              </form>
            
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

            <div className="search-box-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="search" 
                  placeholder="Tìm kiếm theo tên sản phẩm, mã phiếu, mô tả lỗi..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                />
                {ticketSearch && (
                  <button className="clear-search" onClick={() => setTicketSearch('')}>✕</button>
                )}
              </div>
            </div>

            <div className="tickets-filters">
              <div className="filter-item">
                <label>📅 Từ ngày</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="filter-item">
                <label>📅 Đến ngày</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="filter-item">
                <label>🏷️ Trạng thái</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">-- Tất cả --</option>
                  <option value="tiep_nhan">📥 Tiếp nhận</option>
                  <option value="dang_kiem_tra">🔍 Đang kiểm tra</option>
                  <option value="dang_sua">🔧 Đang sửa</option>
                  <option value="hoan_tat">✅ Hoàn tất</option>
                  <option value="tu_choi">❌ Từ chối</option>
                </select>
              </div>
              <div className="filter-actions">
                {(dateFrom || dateTo || statusFilter || ticketSearch) && (
                  <button className="btn-clear-filters" onClick={(e) => { e.preventDefault(); clearDateFilters() }}>✕ Xóa bộ lọc</button>
                )}
              </div>
            </div>

            {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

            {!loading && myTickets.length === 0 && (
              <div className="empty-state">
                <p>📭 Bạn chưa có phiếu bảo hành nào</p>
              </div>
            )}

            {!loading && myTickets.length > 0 && displayedTickets.length === 0 && (
              <div className="empty-state">
                <p>🔍 Không tìm thấy phiếu bảo hành nào phù hợp với bộ lọc</p>
                <button className="btn-secondary" onClick={clearDateFilters}>Xóa bộ lọc</button>
              </div>
            )}

            <div className="ticket-list compact">
              {displayedTickets.map(ticket => (
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
                    {ticket.trangThai === 'hoan_tat' && !ticket.qualityRating && (
                      <button 
                        className="btn-rate"
                        onClick={() => {
                          setRatingForm({ ticketId: ticket._id, rating: 0, comment: '' })
                          setActiveTab('rate')
                        }}
                      >
                        ⭐ Đánh giá
                      </button>
                    )}
                    {ticket.trangThai === 'hoan_tat' && ticket.qualityRating && (
                      <span className="rating-badge">
                        ⭐ Đã đánh giá: {ticket.qualityRating}/5
                      </span>
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

                  <div className="products-search">
                    <div className="search-item">
                      <label>Tìm kiếm sản phẩm / serial / thương hiệu</label>
                      <input
                        type="search"
                        placeholder="Nhập tên sản phẩm, số serial hoặc thương hiệu..."
                        value={pwSearch}
                        onChange={(e) => setPwSearch(e.target.value)}
                      />
                    </div>
                  </div>

                {loading && <div className="loading-spinner">⏳ Đang tải...</div>}

                {!loading && myProducts.length === 0 && (
                  <div className="empty-state">
                    <p>👤 Bạn chưa có sản phẩm nào được đăng ký</p>
                    <p className="empty-hint">Liên hệ cửa hàng để đăng ký sản phẩm của bạn</p>
                  </div>
                )}

                {!loading && myProducts.length > 0 && (
                  <div className="products-list">
                    {displayedProducts.map(product => {
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
                              {product.loaiSanPham === 'PhuKien' && '🛍️'}
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
                        <h4>🕒 Thời gian bảo hành</h4>
                        <div className="warranty-timeline">
                          <div className="timeline-point">
                            <div className="point-icon">🔵</div>
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
                            const freshForm = createInitialWarrantyForm()
                            setWarrantyForm({
                              ...freshForm,
                              sanPhamId: productWarrantyInfo.product._id,
                              soSerial: productWarrantyInfo.product.soSerial || freshForm.soSerial
                            })
                            setActiveTab('createRequest')
                          }}
                        >
                          <span>➕</span> Tạo yêu cầu bảo hành
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
                        <span>🔍</span> Xem lịch sử chi tiết
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
                      {/* Left: summary */}
                      <aside className="result-summary">
                        <div className="summary-card">
                          <div className="summary-top">
                            <div className="product-title">
                              <h4>{trackingResult.sanPhamId?.tenSP || 'Sản phẩm'}</h4>
                              <p className="product-serial">SN: {trackingResult.sanPhamId?.soSerial || '—'}</p>
                            </div>
                            <div className={`status-block ${getStatusBadge(trackingResult.trangThai).class}`}>
                              {getStatusBadge(trackingResult.trangThai).icon} {getStatusBadge(trackingResult.trangThai).text}
                            </div>
                          </div>

                          <div className="summary-body">
                            <div className="summary-row">
                              <span>Loại</span>
                              <strong>{trackingResult.sanPhamId?.loaiSanPham || 'N/A'}</strong>
                            </div>
                            <div className="summary-row">
                              <span>Tiếp nhận</span>
                              <strong>{new Date(trackingResult.ngayTiepNhan).toLocaleDateString('vi-VN')}</strong>
                            </div>
                            <div className="summary-row">
                              <span>Hoàn tất</span>
                              <strong>{trackingResult.ngayHoanTat ? new Date(trackingResult.ngayHoanTat).toLocaleDateString('vi-VN') : 'Đang xử lý'}</strong>
                            </div>

                            <div className="summary-progress">
                              <div className="progress-label">Tiến độ</div>
                              <div className="progress-bar small">
                                <div className="progress-fill" style={{ width: `${getProgressPercentage(trackingResult.trangThai)}%` }}></div>
                              </div>
                              <div className="progress-percent">{getProgressPercentage(trackingResult.trangThai)}%</div>
                            </div>

                            <div className="summary-actions">
                              <button className="btn-primary" onClick={() => {
                                setWarrantyForm(prev => ({ ...prev, sanPhamId: trackingResult.sanPhamId?._id || '' }))
                                setActiveTab('createRequest')
                              }}>➕ Tạo yêu cầu</button>
                              <button className="btn-secondary" onClick={() => setActiveTab('rate')}>✉️ Liên hệ</button>
                            </div>
                          </div>
                        </div>
                      </aside>

                      {/* Right: details */}
                      <section className="result-details">
                        <div className="result-card">
                          <h4>📝 Mô tả sự cố</h4>
                          <p className="issue-description">{trackingResult.moTaLoi || 'Không có mô tả'}</p>
                        </div>

                        <div className="result-card">
                          <h4>⏱️ Lịch sử trạng thái</h4>
                          {trackingResult.lichSuTrangThai && trackingResult.lichSuTrangThai.length > 0 ? (
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
                          ) : (
                            <p className="empty-hint">Chưa có lịch sử trạng thái.</p>
                          )}
                        </div>

                        <div className="result-card">
                          <h4>📎 Tệp đính kèm</h4>
                          {(() => {
                            const normalize = (p) => p && (p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p}`)

                            const parts = []

                            // 1) Render any hinhAnhLoi images first (these are primary thumbnails)
                            if (trackingResult.hinhAnhLoi && trackingResult.hinhAnhLoi.length > 0) {
                              parts.push(
                                <div key="hinhAnhLoi" className="attachments-grid">
                                  {trackingResult.hinhAnhLoi.map((p, idx) => {
                                    const src = normalize(p)
                                    return (
                                      <a key={`img-${idx}`} href={src || '#'} className="attachment-thumb" target="_blank" rel="noreferrer">
                                        <img src={src} alt={`Hình ${idx+1}`} className="attachment-thumb-img" />
                                        <div className="attachment-info">
                                          <div className="attachment-name">{`Hình ${idx+1}`}</div>
                                        </div>
                                      </a>
                                    )
                                  })}
                                </div>
                              )
                            }

                            // 2) Then render tepDinhKem but filter out any entries that are identical to hinhAnhLoi
                            const imageSet = new Set((trackingResult.hinhAnhLoi || []).map(normalize))
                            const isValidPath = (p) => !!p && (p.startsWith('http') || p.startsWith('/'))
                            const uniqueFiles = (trackingResult.tepDinhKem || []).filter(f => {
                              if (!isValidPath(f.duLieu)) return false
                              const url = normalize(f.duLieu)
                              return !imageSet.has(url)
                            })

                            if (uniqueFiles.length > 0) {
                              parts.push(
                                <div key="tepDinhKem" className="attachments-grid">
                                  {uniqueFiles.map((f, i) => {
                                    const src = f.duLieu && (f.duLieu.startsWith('http') ? f.duLieu : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${f.duLieu}`)
                                    const isImage = typeof f.kieuNoiDung === 'string' && f.kieuNoiDung.startsWith('image/')
                                    return (
                                      <a key={i} href={src || '#'} className="attachment-thumb" target="_blank" rel="noreferrer">
                                        {isImage ? (
                                          <img src={src} alt={f.tenTep || `Hình ${i+1}`} className="attachment-thumb-img" />
                                        ) : (
                                          <div className="attachment-file-icon">📎</div>
                                        )}
                                        <div className="attachment-info">
                                          <div className="attachment-name">{f.tenTep || `Tệp ${i+1}`}</div>
                                          <div className="attachment-meta">{f.kieuNoiDung || ''} · {formatAttachmentSize(f.kichThuoc)}</div>
                                        </div>
                                      </a>
                                    )
                                  })}
                                </div>
                              )
                            }

                            if (parts.length === 0) return <p className="empty-hint">Không có tệp đính kèm.</p>
                            return parts
                          })()}
                        </div>

                        {trackingResult.nhanVienTiepNhanId && (
                          <div className="result-card">
                            <h4>👷 Nhân viên xử lý</h4>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="label">Họ tên:</span>
                                <span className="value">{trackingResult.nhanVienTiepNhanId.hoTen}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Email:</span>
                                <span className="value">{trackingResult.nhanVienTiepNhanId.email}</span>
                              </div>
                              {trackingResult.nhanVienTiepNhanId.soDienThoai && (
                                <div className="detail-item">
                                  <span className="label">SĐT:</span>
                                  <span className="value">{trackingResult.nhanVienTiepNhanId.soDienThoai}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {trackingResult.qualityRating && (
                          <div className="result-card rating-card">
                            <h4>⭐ Đánh giá của khách hàng</h4>
                            <div className="rating-display">
                              <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} className={star <= trackingResult.qualityRating ? 'star-filled' : 'star-empty'}>
                                    ⭐
                                  </span>
                                ))}
                                <span className="rating-score">{trackingResult.qualityRating}/5</span>
                              </div>
                              {trackingResult.qualityComments && (
                                <div className="rating-comment">
                                  <strong>💬 Nhận xét:</strong>
                                  <p>{trackingResult.qualityComments}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Tab */}
        {activeTab === 'rate' && (
          <div className="rate-section">
            <h2 className="section-title">⭐ Đánh giá chất lượng</h2>
            
            {completedTickets.filter(t => !t.qualityRating).length === 0 ? (
              <div className="empty-state">
                {completedTickets.length === 0 ? (
                  <p>🎯 Bạn chưa có phiếu nào hoàn tất để đánh giá</p>
                ) : (
                  <p>✅ Bạn đã đánh giá tất cả các phiếu hoàn tất rồi</p>
                )}
              </div>
            ) : (
              <div className="rating-container">
                <div className="info-box">
                  <p>💡 <strong>Lưu ý:</strong> Mỗi phiếu bảo hành chỉ được đánh giá một lần duy nhất. Hãy suy nghĩ kỹ trước khi gửi đánh giá.</p>
                </div>
                <form onSubmit={handleSubmitRating} className="rating-form">
                  <div className="form-group">
                    <label>Chọn phiếu đã hoàn tất</label>
                    <select
                      value={ratingForm.ticketId}
                      onChange={(e) => setRatingForm({...ratingForm, ticketId: e.target.value})}
                      required
                    >
                      <option value="">-- Chọn phiếu --</option>
                      {completedTickets.filter(t => !t.qualityRating).map(ticket => (
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
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
