# Hệ thống Quản lý Bảo hành

> Ứng dụng React quản lý bảo hành đầy đủ theo sơ đồ use case: **Khách hàng**, **Nhân viên**, **Người quản lý**

## 🎯 Tính năng theo Use Case Diagram

### 👤 **Khách hàng (KhachHang)**
- ✅ **Gửi yêu cầu bảo hành** - Form đơn giản với thông tin sản phẩm, serial, mô tả sự cố
- ✅ **Kiểm tra thông tin bảo hành** - Tra cứu mã phiếu để xem chi tiết
- ✅ **Theo dõi trạng thái phiếu bảo hành** - Xem danh sách phiếu và tiến độ xử lý
- ✅ **Đánh giá chất lượng bảo hành** - Cho điểm sao và nhận xét sau khi hoàn tất

### 👨‍💼 **Nhân viên (NhanVien)**
- ✅ **Xem yêu cầu bảo hành** - Danh sách phiếu mới và đang xử lý
- ✅ **Quản lý phiếu bảo hành** - Cập nhật tiến độ, đính kèm ảnh, ghi chú kỹ thuật, đóng phiếu

### 🏢 **Người quản lý (NguoiQuanLy)**
- ✅ **Quản lý sản phẩm** - CRUD danh mục sản phẩm và thời hạn bảo hành
- ✅ **Quản lý chính sách bảo hành** - Thiết lập chính sách theo từng dòng sản phẩm
- ✅ **Xem thống kê** - Dashboard với các chỉ số: tổng phiếu, đang xử lý, hoàn tất, đánh giá TB
- ✅ **Quản lý người dùng** - Thêm/sửa/xóa tài khoản và phân quyền

### 🔄 **Quy trình bảo hành (DangNhap)**
- Đăng nhập thống nhất với lựa chọn vai trò
- Mỗi vai trò được điều hướng đến trang riêng với chức năng phù hợp

## � Cấu trúc project

```
src/
├── pages/
│   ├── LoginPage.jsx       # Trang đăng nhập chung
│   ├── CustomerPage.jsx    # Trang dành cho khách hàng
│   ├── EmployeePage.jsx    # Trang dành cho nhân viên
│   └── ManagerPage.jsx     # Trang dành cho người quản lý
├── styles/
│   ├── LoginPage.css
│   ├── CustomerPage.css
│   ├── EmployeePage.css
│   └── ManagerPage.css
├── App.jsx                 # Routing chính
├── App.css
└── main.jsx
```

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js ≥ 18
- npm hoặc yarn
- MongoDB (cho backend)

### Backend API

```powershell
# 1. Vào thư mục backend
cd ../mongobe

# 2. Cài dependencies
npm install

# 3. Tạo file .env (nếu chưa có)
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/bh_cau_long
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=7d

# 4. Chạy MongoDB (nếu chưa chạy)
# mongod

# 5. Chạy backend server
npm start
```

Backend sẽ chạy tại `http://localhost:5000`

### Frontend React

```powershell
# 1. Vào thư mục frontend
cd ../QLBaoHanh

# 2. Cài dependencies
npm install

# 3. Kiểm tra file .env
# VITE_API_URL=http://localhost:5000/api

# 4. Chạy development server
npm run dev

# 5. Build production
npm run build

# 6. Preview bản build
npm run preview
```

Frontend sẽ chạy tại `http://localhost:5173`

## 🎨 Demo workflow

1. **Đăng nhập** → Chọn vai trò (Khách hàng / Nhân viên / Người quản lý)
2. **Khách hàng**: Gửi yêu cầu → Theo dõi trạng thái → Đánh giá
3. **Nhân viên**: Xem danh sách yêu cầu → Cập nhật tiến độ → Đóng phiếu
4. **Quản lý**: Quản lý sản phẩm/chính sách → Xem thống kê → Quản lý user

## 🛠️ Công nghệ

**Frontend:**
- **React 19** - UI framework
- **Vite** - Build tool (rolldown)
- **CSS thuần** - Responsive, không cần framework

**Backend:**
- **Node.js + Express** - REST API
- **MongoDB** - Database
- **JWT** - Authentication
- **Mongoose** - ODM

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Customer
- `POST /api/customer/request` - Gửi yêu cầu bảo hành
- `GET /api/customer/track/:ticketId` - Tra cứu phiếu
- `GET /api/customer/warranty-info/:customerId` - Thông tin bảo hành

### Employee
- `GET /api/employee/tasks` - Danh sách công việc
- `POST /api/employee/:ticketId/inspect` - Kiểm tra sản phẩm
- `POST /api/employee/:ticketId/complete-repair` - Hoàn tất sửa chữa

### Manager
- `GET /api/manager/dashboard` - Thống kê tổng quan
- `GET /api/manager/report` - Báo cáo chi tiết
- `POST /api/manager/:ticketId/assign-employee` - Gán nhân viên

## 📝 Ghi chú

- **Đã kết nối backend API thực** từ folder `mongobe`
- Sử dụng JWT authentication với localStorage
- Mock data đã được thay thế bằng API calls thực
- Cần chạy cả backend và frontend để test đầy đủ
- Mỗi trang có tab riêng phản ánh đầy đủ use case trong sơ đồ

## 🐛 Troubleshooting

**Lỗi kết nối API:**
- Kiểm tra backend đang chạy tại port 5000
- Kiểm tra file `.env` có đúng `VITE_API_URL=http://localhost:5000/api`
- Kiểm tra MongoDB đang chạy

**Lỗi đăng nhập:**
- Đảm bảo đã tạo user trong database
- Kiểm tra `chucVu` field phải là: `khachhang`, `nhanvien`, hoặc `quanly`

---

✨ **Được thiết kế theo use case diagram đã cung cấp**
