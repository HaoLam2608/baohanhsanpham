# Quick Start Guide

## 🚀 Chạy ứng dụng nhanh

### Bước 1: Chạy Backend

```powershell
# Terminal 1 - Backend
cd c:\Users\GIGABYTE\Desktop\mongobe
npm start
```

Đảm bảo thấy message: `Server running on 5000` và `MongoDB connected`

### Bước 2: Chạy Frontend

```powershell
# Terminal 2 - Frontend  
cd c:\Users\GIGABYTE\Desktop\QLBaoHanh
npm run dev
```

Mở browser tại: `http://localhost:5173`

---

## 👤 Test Accounts

### Tạo tài khoản test (nếu chưa có)

Sử dụng API hoặc MongoDB Compass để tạo user test:

**Khách hàng:**
```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "customer@test.com",
  "matKhau": "$2a$10$hashedpassword", 
  "chucVu": "khachhang"
}
```

**Nhân viên:**
```json
{
  "hoTen": "Trần Thị B",
  "email": "employee@test.com",
  "matKhau": "$2a$10$hashedpassword",
  "chucVu": "nhanvien"
}
```

**Quản lý:**
```json
{
  "hoTen": "Lê Văn C",
  "email": "manager@test.com",
  "matKhau": "$2a$10$hashedpassword",
  "chucVu": "quanly"
}
```

---

## 🧪 Test Workflow

### 1. Khách hàng (Customer)
1. Đăng nhập với role "Khách hàng"
2. Tab "Gửi yêu cầu bảo hành" → Nhập ID sản phẩm và mô tả sự cố
3. Tab "Theo dõi trạng thái" → Xem danh sách phiếu
4. Tab "Kiểm tra thông tin" → Tra cứu mã phiếu

### 2. Nhân viên (Employee)
1. Đăng nhập với role "Nhân viên"
2. Tab "Xem yêu cầu" → Xem danh sách công việc được gán
3. Click "Xem chi tiết" → Cập nhật tiến độ
4. Bắt đầu kiểm tra → Hoàn tất sửa chữa

### 3. Quản lý (Manager)
1. Đăng nhập với role "Người quản lý"
2. Tab "Xem thống kê" → Dashboard với các chỉ số
3. Tab "Quản lý sản phẩm" → CRUD sản phẩm
4. Tab "Quản lý người dùng" → Xem danh sách nhân viên

---

## 🔧 API Testing với Thunder Client / Postman

### Register User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "hoTen": "Test User",
  "email": "test@example.com",
  "matKhau": "password123",
  "chucVu": "khachhang"
}
```

### Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "matKhau": "password123",
  "chucVu": "khachhang"
}
```

Response sẽ trả về `token` → Dùng để authenticate các request khác.

---

## ⚠️ Common Issues

**Backend không kết nối MongoDB:**
- Chạy `mongod` hoặc MongoDB service
- Kiểm tra `MONGO_URI` trong `.env`

**Frontend không gọi được API:**
- Kiểm tra CORS đã enable trong backend
- Kiểm tra `.env` frontend có `VITE_API_URL=http://localhost:5000/api`

**Lỗi 401 Unauthorized:**
- Token hết hạn → Đăng nhập lại
- Token không đúng format → Kiểm tra `Authorization: Bearer <token>`

---

✅ **Hoàn tất!** Bây giờ bạn có hệ thống quản lý bảo hành full-stack với React + Node.js + MongoDB!
