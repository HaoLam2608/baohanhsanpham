import { useState, useEffect } from 'react'
import { managerAPI, generalAPI, inventoryAPI } from '../services/api'
import SettingsPage from './SettingsPage'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  User,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Box
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Helper: normalize used/replaced parts arrays and compute totals defensively
  const getPartsAndTotals = (ticket) => {
    if (!ticket) return { usedParts: [], replacedParts: [], totals: { used: 0, replaced: 0, chiPhiPhatSinh: 0, estimated: 0, tongTien: 0 } }

    // Possible places parts might be stored on the ticket
    const used = ticket.linhKienSuDung || ticket.linhKienDaSuDung || (ticket.cost && ticket.cost.linhKienSuDung) || []
    const replaced = ticket.linhKienThayThe || ticket.linhKienThayThe || (ticket.cost && ticket.cost.linhKienThayThe) || []

    const usedArr = Array.isArray(used) ? used : []
    const replacedArr = Array.isArray(replaced) ? replaced : []

    const sumLine = (it) => {
      const qty = Number(it?.soLuong ?? it?.quantity ?? it?.qty ?? 1) || 0
      const unit = Number(it?.donGia ?? it?.gia ?? it?.price ?? it?.chiPhi ?? 0) || 0
      const lineTotal = Number(it?.thanhTien ?? it?.thanh_tien ?? (qty * unit)) || (qty * unit)
      return { qty, unit, lineTotal }
    }

    const totalUsed = usedArr.reduce((s, it) => s + (sumLine(it).lineTotal || 0), 0)
    const totalReplaced = replacedArr.reduce((s, it) => s + (sumLine(it).lineTotal || 0), 0)

    const chiPhiPhatSinh = Number(ticket.chiPhiPhatSinh ?? ticket.phiPhatSinh ?? ticket.extraCost ?? ticket.extra ?? 0) || 0

    const estimated = totalUsed + totalReplaced + chiPhiPhatSinh
    const tongTien = Number(ticket.tongTien ?? ticket.total ?? 0) || 0

    return {
      usedParts: usedArr,
      replacedParts: replacedArr,
      totals: {
        used: totalUsed,
        replaced: totalReplaced,
        chiPhiPhatSinh,
        estimated,
        tongTien,
      }
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
      const res = await managerAPI.assignEmployee(selectedTicket._id, nhanVienId)
      setSuccess('✅ Đã gán nhân viên thành công!')
      // Nếu modal chi tiết đang mở cho cùng phiếu, cập nhật thông tin hiển thị
      if (selectedTicketDetail && res && (res.data || res.ticket)) {
        const updated = res.data || res.ticket
        if (updated._id === selectedTicketDetail._id) {
          setSelectedTicketDetail(updated)
        }
      }
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
      dang_cho: { text: 'Đang chờ', class: 'bg-gray-100 text-gray-800' },
      tiep_nhan: { text: 'Tiếp nhận', class: 'bg-blue-100 text-blue-800' },
      dang_kiem_tra: { text: 'Đang kiểm tra', class: 'bg-yellow-100 text-yellow-800' },
      dang_sua: { text: 'Đang sửa', class: 'bg-purple-100 text-purple-800' },
      hoan_tat: { text: 'Hoàn tất', class: 'bg-green-100 text-green-800' },
      tu_choi: { text: 'Từ chối', class: 'bg-red-100 text-red-800' }
    }
    return badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' }
  }

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tickets', label: 'Phiếu bảo hành', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'products', label: 'Sản phẩm', icon: <Package className="w-5 h-5" /> },
    { id: 'employees', label: 'Nhân viên', icon: <Users className="w-5 h-5" /> },
    { id: 'customers', label: 'Khách hàng', icon: <User className="w-5 h-5" /> },
    { id: 'inventory', label: 'Kho linh kiện', icon: <Box className="w-5 h-5" /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
  ]

  // Prepare partsData when a ticket detail is selected (avoid inline IIFE in JSX)
  const partsData = selectedTicketDetail ? getPartsAndTotals(selectedTicketDetail) : { usedParts: [], replacedParts: [], totals: { used:0,replaced:0,chiPhiPhatSinh:0,estimated:0,tongTien:0 } }
  const { usedParts, replacedParts, totals } = partsData

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Bảng điều khiển quản lý</h1>
              <p className="text-xs text-gray-500">Quản lý toàn bộ hệ thống bảo hành</p>
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

              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">📊 Thống kê tổng quan</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.summary.totalTickets || 0}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Tổng phiếu</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                          <User className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.summary.totalCustomers || 0}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Khách hàng</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Package className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.summary.totalProducts || 0}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Sản phẩm</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.summary.totalEmployees || 0}</span>
                      </div>
                      <div className="text-gray-500 font-medium">Nhân viên</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <div className="text-yellow-700 font-medium mb-1">⏳ Chờ xử lý</div>
                      <div className="text-2xl font-bold text-yellow-800">{stats.statusCounts.tiep_nhan || 0}</div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <div className="text-orange-700 font-medium mb-1">🔍 Đang xử lý</div>
                      <div className="text-2xl font-bold text-orange-800">
                        {(stats.statusCounts.dang_kiem_tra || 0) + (stats.statusCounts.dang_sua || 0)}
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="text-green-700 font-medium mb-1">✅ Hoàn tất</div>
                      <div className="text-2xl font-bold text-green-800">{stats.statusCounts.hoan_tat || 0}</div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-gray-700 font-medium mb-1">⏱️ Thời gian TB</div>
                      <div className="text-2xl font-bold text-gray-800">{stats.summary.avgCompletionDays || 0} ngày</div>
                    </div>
                  </div>

                  {stats.recentTickets && stats.recentTickets.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">🕒 Phiếu bảo hành gần đây</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày nhận</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {stats.recentTickets.slice(0, 5).map(ticket => (
                              <tr key={ticket._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-gray-700">{ticket.maPhieu}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{ticket.sanPhamId?.tenSP || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{ticket.khachHangId?.hoTen || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.trangThai).class}`}>
                                    {getStatusBadge(ticket.trangThai).text}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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

              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">📋 Quản lý phiếu bảo hành</h2>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Mã phiếu, sản phẩm, khách hàng..."
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={ticketStatusFilter}
                        onChange={(e) => setTicketStatusFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
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

                    <div className="flex items-end">
                      {(ticketSearch || ticketStatusFilter !== 'all') && (
                        <button
                          onClick={() => { setTicketSearch(''); setTicketStatusFilter('all'); }}
                          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày nhận</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getFilteredTickets().length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">{tickets.length === 0 ? 'Chưa có phiếu nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                          ) : (
                            getFilteredTickets().map(ticket => (
                              <tr key={ticket._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-blue-600">{ticket.maPhieu}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{ticket.sanPhamId?.tenSP || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{ticket.khachHangId?.hoTen || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  {ticket.nhanVienTiepNhanId ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                      <User className="w-3 h-3" /> {ticket.nhanVienTiepNhanId?.hoTen}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                                      ⚠️ Chưa gán
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.trangThai).class}`}>
                                    {getStatusBadge(ticket.trangThai).text}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.ngayTiepNhan).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    onClick={() => openAssignModal(ticket)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title={ticket.nhanVienTiepNhanId ? 'Đổi nhân viên' : 'Gán nhân viên'}
                                  >
                                    <Users className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedTicketDetail(ticket); setShowTicketDetail(true); }}
                                    className="text-gray-600 hover:text-gray-800"
                                    title="Xem chi tiết"
                                  >
                                    <Search className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">🏸 Quản lý sản phẩm</h2>
                    <button
                      onClick={() => {
                        resetProductForm()
                        setEditingProduct(null)
                        setShowProductModal(true)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
                    >
                      <Plus className="w-5 h-5" /> Thêm sản phẩm
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tên, serial, thương hiệu..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                      <select
                        value={productTypeFilter}
                        onChange={(e) => setProductTypeFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Tất cả</option>
                        <option value="Vot">Vợt</option>
                        <option value="Giay">Giày</option>
                        <option value="Balo">Balo</option>
                        <option value="PhuKien">Phụ kiện</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      {(productSearch || productTypeFilter !== 'all') && (
                        <button
                          onClick={() => { setProductSearch(''); setProductTypeFilter('all'); }}
                          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Serial</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bảo hành</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getFilteredProducts().length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">{products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                          ) : (
                            getFilteredProducts().map(product => (
                              <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400">{product._id.slice(-6)}</td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      setSelectedProductDetail(product);
                                      setShowProductDetailModal(true);
                                    }}
                                    className="text-blue-600 font-medium hover:underline text-left"
                                  >
                                    {product.tenSP}
                                  </button>
                                </td>
                                <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{product.loaiSanPham}</span></td>
                                <td className="px-6 py-4 text-sm text-gray-600">{product.thuongHieu || 'N/A'}</td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">{product.soSerial}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{product.thoiHanBaoHanhThang} tháng</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button onClick={() => openProductModal(product)} className="text-blue-600 hover:text-blue-800" title="Sửa">
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-800" title="Xóa">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* EMPLOYEES TAB */}
              {activeTab === 'employees' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">👥 Quản lý nhân viên</h2>
                    <button
                      onClick={() => {
                        resetEmployeeForm()
                        setShowEmployeeModal(true)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
                    >
                      <Plus className="w-5 h-5" /> Thêm nhân viên
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tên, email..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                      <select
                        value={employeeRoleFilter}
                        onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Tất cả</option>
                        <option value="nhanvien">Nhân viên</option>
                        <option value="quanly">Quản lý</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      {(employeeSearch || employeeRoleFilter !== 'all') && (
                        <button
                          onClick={() => { setEmployeeSearch(''); setEmployeeRoleFilter('all'); }}
                          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getFilteredEmployees().length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">{employees.length === 0 ? 'Chưa có nhân viên nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                          ) : (
                            getFilteredEmployees().map(emp => (
                              <tr key={emp._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400">{emp._id.slice(-6)}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{emp.hoTen}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emp.chucVu === 'quanly'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {emp.chucVu === 'quanly' ? '👑 Quản lý' : '👤 Nhân viên'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button onClick={() => handleEditEmployee(emp)} className="text-blue-600 hover:text-blue-800" title="Sửa">
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => handleDeleteEmployee(emp._id)} className="text-red-600 hover:text-red-800" title="Xóa">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CUSTOMERS TAB */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">👤 Quản lý khách hàng</h2>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tên, email, số điện thoại..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div className="flex items-end">
                      {customerSearch && (
                        <button
                          onClick={() => setCustomerSearch('')}
                          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getFilteredCustomers().length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">{customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                          ) : (
                            getFilteredCustomers().map(customer => (
                              <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400">{customer._id.slice(-6)}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{customer.hoTen}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                                <td className="px-6 py-4">
                                  {(() => {
                                    const custTickets = tickets.filter(t => t.khachHangId?._id === customer._id || t.khachHangId === customer._id)
                                    const reviews = custTickets.filter(t => t.qualityRating && t.qualityRating > 0)
                                    if (reviews.length === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">No reviews</span>
                                    const avg = (reviews.reduce((s, r) => s + (r.qualityRating || 0), 0) / reviews.length).toFixed(1)
                                    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {avg} ({reviews.length})</span>
                                  })()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{customer.soDienThoai || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{(customer.ngayTao || customer.createdAt) ? new Date(customer.ngayTao || customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button onClick={() => openCustomerModal(customer)} className="text-blue-600 hover:text-blue-800" title="Xem chi tiết">
                                    <Search className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* INVENTORY TAB */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">📦 Kho linh kiện</h2>
                    <button
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
                    >
                      <Plus className="w-5 h-5" /> Thêm linh kiện
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Mã, tên linh kiện..."
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                          className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã linh kiện</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên linh kiện</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá nhập</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá xuất</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {inventory.filter(item =>
                            item.tenLinhKien.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            item.maLinhKien.toLowerCase().includes(inventorySearch.toLowerCase())
                          ).length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">{inventory.length === 0 ? 'Chưa có linh kiện nào' : 'Không tìm thấy kết quả phù hợp'}</td></tr>
                          ) : (
                            inventory.filter(item =>
                              item.tenLinhKien.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                              item.maLinhKien.toLowerCase().includes(inventorySearch.toLowerCase())
                            ).map(item => (
                              <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-gray-700">{item.maLinhKien}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.tenLinhKien}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.soLuongTon <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {item.soLuongTon}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.giaNhap?.toLocaleString('vi-VN')} đ</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{item.giaXuat?.toLocaleString('vi-VN')} đ</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.moTa}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingPart(item)
                                      setInventoryForm(item)
                                      setShowInventoryModal(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Sửa"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInventory(item._id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      {/* Customer Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Chi tiết khách hàng
              </h3>
              <button onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Info */}
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                      👤
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedCustomer.hoTen}</h2>
                    <p className="text-gray-500">{selectedCustomer.email}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">Khách hàng</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedCustomer.soDienThoai || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedCustomer.diaChi || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  </div>

                  {/* Ratings */}
                  {customerAvgRating && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-yellow-800">Đánh giá trung bình</span>
                        <span className="text-2xl font-bold text-yellow-600">{customerAvgRating}</span>
                      </div>
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3">{star}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{ width: `${(customerRatingCounts[star - 1] / customerReviews.length) * 100}%` }}
                              ></div>
                            </div>
                            <span className="w-6 text-right text-gray-500">{customerRatingCounts[star - 1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Products & Tickets */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Sản phẩm sở hữu ({customerProducts.length})
                    </h4>
                    {customerProducts.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                        Chưa có sản phẩm
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {customerProducts.map(p => (
                          <div key={p._id} className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="font-medium text-gray-800">{p.tenSP}</div>
                            <div className="text-xs text-gray-500 flex justify-between mt-1">
                              <span>{p.loaiSanPham}</span>
                              <span className="font-mono">{p.soSerial}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> Lịch sử bảo hành ({customerTickets.length})
                    </h4>
                    {customerTickets.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                        Chưa có phiếu bảo hành
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customerTickets.map(t => (
                          <div key={t._id} className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800 flex items-center gap-2">
                                <span className="font-mono text-blue-600">{t.maPhieu}</span>
                                <span className="text-gray-400">|</span>
                                <span>{t.sanPhamId?.tenSP || 'N/A'}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(t.ngayTiepNhan).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(t.trangThai).class}`}>
                              {getStatusBadge(t.trangThai).text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm *</label>
                    <select
                      value={productForm.loaiSanPham}
                      onChange={(e) => setProductForm({ ...productForm, loaiSanPham: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="Vot">Vợt</option>
                      <option value="Giay">Giày</option>
                      <option value="Balo">Balo</option>
                      <option value="PhuKien">Phụ kiện</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={productForm.thuongHieu}
                      onChange={(e) => setProductForm({ ...productForm, thuongHieu: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: Yonex, Victor..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={productForm.tenSP}
                    onChange={(e) => setProductForm({ ...productForm, tenSP: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Yonex Astrox 99"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Serial *</label>
                    <input
                      type="text"
                      value={productForm.soSerial}
                      onChange={(e) => setProductForm({ ...productForm, soSerial: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: SN123456"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua</label>
                    <input
                      type="date"
                      value={productForm.ngayMua}
                      onChange={(e) => setProductForm({ ...productForm, ngayMua: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành (tháng) *</label>
                    <input
                      type="number"
                      value={productForm.thoiHanBaoHanhThang}
                      onChange={(e) => setProductForm({ ...productForm, thoiHanBaoHanhThang: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                    <select
                      value={productForm.khachHangId}
                      onChange={(e) => setProductForm({ ...productForm, khachHangId: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Chưa chọn --</option>
                      {customers.map(cust => (
                        <option key={cust._id} value={cust._id}>{cust.hoTen}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin kỹ thuật</label>
                  <div className="space-y-2">
                    <textarea
                      value={productForm.thongTinKyThuat?.moTa || ''}
                      onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), moTa: e.target.value } })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="3"
                      placeholder="Mô tả - VD: Sản phẩm chính hãng..."
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productForm.thongTinKyThuat?.xuatXu || ''}
                        onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), xuatXu: e.target.value } })}
                        className="flex-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Xuất xứ"
                      />
                      <input
                        type="text"
                        value={productForm.thongTinKyThuat?.trongLuong || ''}
                        onChange={(e) => setProductForm({ ...productForm, thongTinKyThuat: { ...(productForm.thongTinKyThuat || {}), trongLuong: e.target.value } })}
                        className="w-32 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Trọng lượng"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium" disabled={loading}>
                    {loading ? 'Đang xử lý...' : (editingProduct ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                  <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingEmployee ? '✏️ Sửa nhân viên' : '➕ Thêm nhân viên mới'}
              </h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                  <input
                    type="text"
                    value={employeeForm.hoTen}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hoTen: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingEmployee ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                  </label>
                  <input
                    type="password"
                    value={employeeForm.matKhau}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, matKhau: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required={!editingEmployee}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <select
                    value={employeeForm.chucVu}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, chucVu: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="nhanvien">Nhân viên</option>
                    <option value="quanly">Quản lý</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium" disabled={loading}>
                    {loading ? 'Đang xử lý...' : (editingEmployee ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                  <button type="button" onClick={() => setShowEmployeeModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingPart ? '✏️ Sửa linh kiện' : '➕ Thêm linh kiện mới'}
              </h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSaveInventory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã linh kiện *</label>
                    <input
                      type="text"
                      value={inventoryForm.maLinhKien}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, maLinhKien: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên linh kiện *</label>
                    <input
                      type="text"
                      value={inventoryForm.tenLinhKien}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, tenLinhKien: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn *</label>
                  <input
                    type="number"
                    value={inventoryForm.soLuongTon}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, soLuongTon: parseInt(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập *</label>
                    <input
                      type="number"
                      value={inventoryForm.giaNhap}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, giaNhap: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá xuất *</label>
                    <input
                      type="number"
                      value={inventoryForm.giaXuat}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, giaXuat: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={inventoryForm.moTa}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, moTa: e.target.value })}
                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium" disabled={loading}>
                    {loading ? 'Đang xử lý...' : (editingPart ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                  <button type="button" onClick={() => setShowInventoryModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Phân công nhân viên</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Chọn nhân viên phụ trách cho phiếu <strong>{selectedTicket.maPhieu}</strong>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {employees.filter(e => e.chucVu === 'nhanvien').map(emp => (
                  <button
                    key={emp._id}
                    onClick={() => handleAssignEmployee(emp._id)}
                    className="w-full p-3 flex items-center justify-between rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-700">
                        👤
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-800 group-hover:text-blue-800">{emp.hoTen}</div>
                        <div className="text-xs text-gray-500">{emp.email}</div>
                      </div>
                    </div>
                    {selectedTicket.nhanVienTiepNhanId?._id === emp._id && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketDetail && selectedTicketDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Chi tiết phiếu {selectedTicketDetail.maPhieu}</h3>
              <button onClick={() => setShowTicketDetail(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-3">Thông tin chung</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Sản phẩm:</span> <span className="font-medium">{selectedTicketDetail.sanPhamId?.tenSP}</span></p>
                      <p><span className="text-gray-500">Khách hàng:</span> <span className="font-medium">{selectedTicketDetail.khachHangId?.hoTen}</span></p>
                      <p><span className="text-gray-500">Ngày nhận:</span> <span className="font-medium">{new Date(selectedTicketDetail.ngayTiepNhan).toLocaleDateString('vi-VN')}</span></p>
                      <p><span className="text-gray-500">Trạng thái:</span> <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(selectedTicketDetail.trangThai).class}`}>{getStatusBadge(selectedTicketDetail.trangThai).text}</span></p>
                    </div>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-3">Thông tin khách hàng</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicketDetail.khachHangId?.soDienThoai || 'Chưa có'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicketDetail.khachHangId?.email || 'Chưa có'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicketDetail.khachHangId?.diaChi || 'Chưa có'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">Mô tả lỗi</h4>
                    <p className="text-sm text-blue-900">{selectedTicketDetail.moTaLoi}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Người nhận sửa chữa / Nhân viên được gán */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-3">Người nhận sửa chữa</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      {selectedTicketDetail.nhanVienTiepNhanId ? (
                        <>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{selectedTicketDetail.nhanVienTiepNhanId.hoTen}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{selectedTicketDetail.nhanVienTiepNhanId.email || 'Chưa có'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{selectedTicketDetail.thongTinLienHe?.hoTen || 'Chưa có'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{selectedTicketDetail.thongTinLienHe?.soDienThoai || 'Chưa có'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{selectedTicketDetail.thongTinLienHe?.email || 'Chưa có'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-xs">Mã đơn:</span>
                            <span className="font-mono text-sm">{selectedTicketDetail.thongTinLienHe?.maDonHang || '-'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-xs">Số Serial:</span>
                            <span className="font-mono text-sm">{selectedTicketDetail.thongTinLienHe?.soSerial || '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Tiến độ xử lý</h4>
                    <div className="space-y-4">
                      {selectedTicketDetail.moTaTienDo?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-400"></div>
                          <div>
                            <p className="text-gray-800">{item.noiDung}</p>
                            <span className="text-xs text-gray-400">{new Date(item.thoiGian).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      ))}
                      {(!selectedTicketDetail.moTaTienDo || selectedTicketDetail.moTaTienDo.length === 0) && (
                        <p className="text-gray-500 text-sm italic">Chưa có cập nhật nào</p>
                      )}
                    </div>
                  </div>

                  {/* Replaced parts & Totals */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Linh kiện thay thế & Tổng chi phí</h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      
                            <div className="text-sm text-gray-700 mb-3">
                              {/* Used parts table */}
                              <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-1">Linh kiện đã sử dụng</div>
                                {usedParts.length > 0 ? (
                                  <div className="overflow-x-auto mb-2">
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
                                        {usedParts.map((lt, idx) => {
                                          const qty = Number(lt?.soLuong ?? lt?.quantity ?? lt?.qty ?? 1) || 0
                                          const unit = Number(lt?.donGia ?? lt?.gia ?? lt?.price ?? lt?.chiPhi ?? 0) || 0
                                          const line = Number(lt?.thanhTien ?? lt?.thanh_tien ?? (qty * unit)) || (qty * unit)
                                          return (
                                            <tr key={idx}>
                                              <td className="p-2">{lt.tenLinhKien || lt.maLinhKien || 'Linh kiện'}</td>
                                              <td className="p-2">{qty}</td>
                                              <td className="p-2 text-right">{unit.toLocaleString('vi-VN')} đ</td>
                                              <td className="p-2 text-right">{line.toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-gray-500">Không có linh kiện đã sử dụng</div>
                                )}
                              </div>

                              {/* Replaced parts table (overview) */}
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Linh kiện thay thế (tổng quan)</div>
                                {replacedParts.length > 0 ? (
                                  <div className="overflow-x-auto mb-2">
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
                                        {replacedParts.map((lt, idx) => {
                                          const qty = Number(lt?.soLuong ?? lt?.quantity ?? lt?.qty ?? 1) || 0
                                          const unit = Number(lt?.donGia ?? lt?.gia ?? lt?.price ?? lt?.chiPhi ?? 0) || 0
                                          const line = Number(lt?.thanhTien ?? lt?.thanh_tien ?? (qty * unit)) || (qty * unit)
                                          return (
                                            <tr key={idx}>
                                              <td className="p-2">{lt.tenLinhKien || lt.maLinhKien || 'Linh kiện'}</td>
                                              <td className="p-2">{qty}</td>
                                              <td className="p-2 text-right">{unit.toLocaleString('vi-VN')} đ</td>
                                              <td className="p-2 text-right">{line.toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-gray-500">Không có linh kiện thay thế</div>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Tổng linh kiện đã sử dụng:</span>
                                <span className="font-mono">{Number(totals.used).toLocaleString('vi-VN')} đ</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Tổng linh kiện thay thế (tổng quan):</span>
                                <span className="font-mono">{Number(totals.replaced).toLocaleString('vi-VN')} đ</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-500">Chi phí phát sinh:</span>
                                <span className="font-mono">{Number(totals.chiPhiPhatSinh).toLocaleString('vi-VN')} đ</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg mt-2">
                                <span>Tổng (ước tính):</span>
                                <span className="font-mono text-red-600">{Number(totals.estimated).toLocaleString('vi-VN')} đ</span>
                              </div>
                              {totals.tongTien ? (
                                <div className="mt-2 text-sm text-green-600">Tổng sau khi hoàn tất: <span className="font-mono">{Number(totals.tongTien).toLocaleString('vi-VN')} đ</span></div>
                              ) : null}
                                </div>
                              </div>
                  </div>

                  {/* Review Section */}
                  {(selectedTicketDetail.qualityRating || selectedTicketDetail.qualityComments) && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Đánh giá từ khách hàng</h4>
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < (selectedTicketDetail.qualityRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-gray-700">{selectedTicketDetail.qualityRating}/5</span>
                        </div>
                        <div className="text-sm text-gray-600 italic">
                          "{selectedTicketDetail.qualityComments || 'Không có nhận xét'}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProductDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Chi tiết sản phẩm</h3>
              <button onClick={() => setShowProductDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                  🏸
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedProductDetail.tenSP}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{selectedProductDetail.loaiSanPham}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium font-mono">{selectedProductDetail.soSerial}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 mb-1">Thương hiệu</span>
                  <span className="font-medium text-gray-900">{selectedProductDetail.thuongHieu || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 mb-1">Bảo hành</span>
                  <span className="font-medium text-gray-900">{selectedProductDetail.thoiHanBaoHanhThang} tháng</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 mb-1">Ngày mua</span>
                  <span className="font-medium text-gray-900">{selectedProductDetail.ngayMua ? new Date(selectedProductDetail.ngayMua).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 mb-1">Khách hàng</span>
                  <span className="font-medium text-gray-900">{selectedProductDetail.khachHangId?.hoTen || 'Chưa gán'}</span>
                </div>
              </div>

              {selectedProductDetail.thongTinKyThuat && (
                <div className="mt-4 p-4 border border-gray-100 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2">Thông tin kỹ thuật</h4>
                  <div className="space-y-2 text-sm">
                    {selectedProductDetail.thongTinKyThuat.moTa && (
                      <p><span className="text-gray-500">Mô tả:</span> {selectedProductDetail.thongTinKyThuat.moTa}</p>
                    )}
                    {selectedProductDetail.thongTinKyThuat.xuatXu && (
                      <p><span className="text-gray-500">Xuất xứ:</span> {selectedProductDetail.thongTinKyThuat.xuatXu}</p>
                    )}
                    {selectedProductDetail.thongTinKyThuat.trongLuong && (
                      <p><span className="text-gray-500">Trọng lượng:</span> {selectedProductDetail.thongTinKyThuat.trongLuong}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
