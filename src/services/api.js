const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('🔗 API Base URL:', API_BASE_URL)

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json()
  console.log('📥 API Response:', response.url, response.status, data)
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Set auth headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// ============ AUTH API ============
export const authAPI = {
  login: async (email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, matKhau: password, chucVu: role }),
    })
    return handleResponse(response)
  },

  register: async (hoTen, email, password, chucVu = 'khachhang') => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoTen, email, matKhau: password, chucVu }),
    })
    return handleResponse(response)
  },
}

// ============ CUSTOMER API ============
export const customerAPI = {
  // Gửi yêu cầu bảo hành (supports FormData + JSON fallback)
  submitWarrantyRequest: async (requestData) => {
    const url = `${API_BASE_URL}/customer/request`
    const headers = getAuthHeaders()
    const options = { method: 'POST', headers: headers }

    if (requestData instanceof FormData) {
      // When sending FormData, do not set Content-Type header (browser will add)
      delete options.headers['Content-Type']
      options.body = requestData
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(requestData)
    }

    const response = await fetch(url, options)
    // handleResponse expects JSON; try to parse, otherwise return text wrapper
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }
      return data
    } catch (e) {
      if (!response.ok) {
        throw new Error(text || 'API request failed')
      }
      return { message: text }
    }
  },

  // Theo dõi phiếu bảo hành
  trackTicket: async (ticketId) => {
    const response = await fetch(`${API_BASE_URL}/customer/track/${ticketId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Lấy thông tin bảo hành
  getWarrantyInfo: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/customer/warranty-info/${customerId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Lấy khuyến nghị gia hạn
  getRecommendations: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/customer/recommendations/${customerId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ============ EMPLOYEE API ============
export const employeeAPI = {
  // Lấy danh sách công việc
  getMyTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/employee/tasks`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Kiểm tra sản phẩm
  inspectProduct: async (ticketId, inspectionData) => {
    const response = await fetch(`${API_BASE_URL}/employee/${ticketId}/inspect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inspectionData),
    })
    return handleResponse(response)
  },

  // Cập nhật tiến độ sửa chữa (đã đổi từ detailId sang ticketId)
  updateRepairProgress: async (ticketId, progressData) => {
    const response = await fetch(`${API_BASE_URL}/employee/${ticketId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    })
    return handleResponse(response)
  },

  // Upload hình ảnh sửa chữa
  uploadRepairImages: async (ticketId, images) => {
    const response = await fetch(`${API_BASE_URL}/employee/${ticketId}/upload-images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ hinhAnhSua: images }),
    })
    return handleResponse(response)
  },

  // Hoàn tất sửa chữa
  completeRepair: async (ticketId, completionData) => {
    const response = await fetch(`${API_BASE_URL}/employee/${ticketId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(completionData),
    })
    return handleResponse(response)
  },

  // Lấy công việc đã hoàn tất
  getCompletedWork: async () => {
    const response = await fetch(`${API_BASE_URL}/employee/completed`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Đánh dấu không thể sửa
  markUnableToRepair: async (ticketId, lyDoKhongSua) => {
    const response = await fetch(`${API_BASE_URL}/employee/${ticketId}/unable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lyDoKhongSua }),
    })
    return handleResponse(response)
  },
}

// ============ MANAGER API ============
export const managerAPI = {
  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/manager/dashboard`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Lấy tất cả phiếu bảo hành
  getAllTickets: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${API_BASE_URL}/manager/tickets?${params}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Lấy báo cáo chi tiết
  getDetailedReport: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate })
    const response = await fetch(`${API_BASE_URL}/manager/report?${params}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Phê duyệt phiếu
  approveTicket: async (ticketId, approved, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/manager/${ticketId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved, reason }),
    })
    return handleResponse(response)
  },

  // Gán nhân viên
  assignEmployee: async (ticketId, nhanVienId) => {
    const response = await fetch(`${API_BASE_URL}/manager/${ticketId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nhanVienId }),
    })
    return handleResponse(response)
  },

  // Đánh giá chất lượng
  qualityAssessment: async (ticketId, rating, comments) => {
    const response = await fetch(`${API_BASE_URL}/manager/${ticketId}/quality`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comments }),
    })
    return handleResponse(response)
  },

  // Hiệu suất nhân viên
  getEmployeePerformance: async () => {
    const response = await fetch(`${API_BASE_URL}/manager/performance`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ============ GENERAL API (Products, etc) ============
export const generalAPI = {
  // Lấy danh sách sản phẩm
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/sanpham`, {
      headers: getAuthHeaders(),
    })
    const result = await handleResponse(response)
    return result.data || result // Backend trả về { data: [...] }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/sanpham`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    })
    return handleResponse(response)
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/sanpham/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    })
    return handleResponse(response)
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sanpham/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // Lấy danh sách nhân viên
  getEmployees: async () => {
    const response = await fetch(`${API_BASE_URL}/nhanvien`, {
      headers: getAuthHeaders(),
    })
    const result = await handleResponse(response)
    return result.data || result // Backend trả về { data: [...] }
  },

  // Lấy danh sách khách hàng
  getCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/khachhang`, {
      headers: getAuthHeaders(),
    })
    const result = await handleResponse(response)
    return result.data || result // Backend trả về { data: [...] }
  },

  // Lấy danh sách phiếu bảo hành
  getWarrantyTickets: async () => {
    const response = await fetch(`${API_BASE_URL}/phieubaohanh`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// Export storage helpers
export const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  removeUser: () => localStorage.removeItem('user'),
  clear: () => localStorage.clear(),
}
