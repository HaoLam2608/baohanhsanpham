# Tổng hợp các câu truy vấn (Mongoose) dùng trong dự án

Tập tin này liệt kê các câu truy vấn MongoDB (thông qua Mongoose) đang được sử dụng trong backend của dự án, kèm mô tả, vị trí (file + function) và ví dụ trích từ mã nguồn.

Lưu ý: nhiều truy vấn sử dụng các phương thức Mongoose như `find`, `findOne`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`, `countDocuments`, `aggregate`, `save()` và `populate()`.

---

## Cấu trúc hướng dẫn
- **Vị trí:** đường dẫn file và tên function.
- **Loại truy vấn:** (find/findOne/findById/...)
- **Mục đích:** mô tả ngắn chức năng.
- **Ví dụ (trích mã):** đoạn mã dùng trong project.

---

## `controllers/sanpham.controller.js`

- Vị trí: `createSanPham`
  - Loại: `new SanPham(...)` + `save()`
  - Mục đích: Tạo một tài liệu sản phẩm mới.
  - Ví dụ:
    ```js
    const newSanPham = new SanPham({...});
    await newSanPham.save();
    ```

- Vị trí: `getAllSanPham`
  - Loại: `find()` + `populate()`
  - Mục đích: Lấy tất cả sản phẩm, kèm thông tin khách hàng.
  - Ví dụ:
    ```js
    const sanPhams = await SanPham.find().populate('khachHangId');
    ```

- Vị trí: `getSanPhamById`
  - Loại: `findById()` + `populate()`
  - Mục đích: Lấy sản phẩm theo `_id`.
  - Ví dụ:
    ```js
    const sanPham = await SanPham.findById(req.params.id).populate('khachHangId');
    ```

- Vị trí: `updateSanPham`
  - Loại: `findByIdAndUpdate()`
  - Mục đích: Cập nhật sản phẩm theo `_id` và trả về document mới.
  - Ví dụ:
    ```js
    const sanPham = await SanPham.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ```

- Vị trí: `deleteSanPham`
  - Loại: `findByIdAndDelete()`
  - Mục đích: Xóa sản phẩm theo `_id`.

- Vị trí: `getSanPhamBySerial`
  - Loại: `findOne()` + `populate()`
  - Mục đích: Tìm sản phẩm theo `soSerial`.

---

## `controllers/khachhang.controller.js`

- Vị trí: `createKhachHang`
  - Loại: `findOne()` (kiểm tra trùng số điện thoại) + `new KhachHang(...)` + `save()`
  - Mục đích: Tạo khách hàng mới nếu số điện thoại chưa tồn tại.

- Vị trí: `getAllKhachHang`
  - Loại: `find()` + `sort()`
  - Mục đích: Lấy danh sách khách hàng, sắp xếp theo `ngayTao`.

- Vị trí: `getKhachHangById`
  - Loại: `findById()`
  - Mục đích: Lấy khách hàng theo `_id`.

- Vị trí: `updateKhachHang`
  - Loại: `findOne()` (kiểm tra số điện thoại) + `findByIdAndUpdate()`
  - Mục đích: Cập nhật thông tin khách hàng, tránh trùng số điện thoại với _id khác.

- Vị trí: `deleteKhachHang`
  - Loại: `findByIdAndDelete()`

- Vị trí: `searchKhachHangByPhone`
  - Loại: `findOne({ soDienThoai })`
  - Mục đích: Tìm khách hàng theo số điện thoại.

---

## `controllers/phieubaohanh.controller.js`

- Vị trí: `createPhieuBaoHanh`
  - Loại: `findOne({ maPhieu })` (kiểm tra trùng) + `new PhieuBaoHanh(...)` + `save()`
  - Mục đích: Tạo phiếu bảo hành, khởi tạo `lichSuTrangThai`.

- Vị trí: `getAllPhieuBaoHanh`
  - Loại: `find()` + `populate()` + `sort()`
  - Mục đích: Lấy tất cả phiếu (dùng cho màn quản lý).

- Vị trí: `getPhieuBaoHanhById`
  - Loại: `findById()` + `populate()`

- Vị trí: `updatePhieuBaoHanhStatus`
  - Loại: `findById()` rồi sửa fields trên document và `save()`
  - Mục đích: Thay đổi `trangThai`, đẩy `lichSuTrangThai` và cập nhật `ngayHoanTat` nếu cần.

- Vị trí: `updatePhieuBaoHanh`
  - Loại: `findByIdAndUpdate(..., { new: true })` + `populate()`

- Vị trí: `deletePhieuBaoHanh`
  - Loại: `findByIdAndDelete()`

- Vị trí: `getPhieuBaoHanhByStatus`
  - Loại: `find({ trangThai: status })` + `populate()` + `sort()`

- Vị trí: `getPhieuBaoHanhByCustomer`
  - Loại: `find({ khachHangId })` + `populate()` + `sort()`

---

## `controllers/employee.controller.js`

- Vị trí: `getMyTasks`
  - Loại: `find({ nhanVienTiepNhanId })` + `populate()` + `sort()`
  - Mục đích: Lấy các phiếu được gán cho nhân viên hiện tại.

- Vị trí: `inspectProduct`, `updateRepairProgress`, `completeRepair`, `markUnableToRepair`, `uploadRepairImages`
  - Loại: `findById()` rồi cập nhật document và `save()`
  - Mục đích: Cập nhật trạng thái, lịch sử, tiến độ và hình ảnh sửa chữa trên phiếu.

- Vị trí: `getCompletedWork`
  - Loại: `find({ nhanVienTiepNhanId, trangThai: 'hoan_tat' })` + `populate()` + `sort()`
  - Mục đích: Lấy công việc hoàn tất của nhân viên.

---

## `controllers/manager.controller.js`

- Vị trí: `getDashboardStats`
  - Loại: `countDocuments()`, `aggregate()`, `find()` + `populate()` + `limit()` + `sort()`
  - Mục đích: Thống kê tổng số phiếu, phân theo trạng thái, và lấy phiếu gần nhất.
  - Ví dụ:
    ```js
    const totalTickets = await PhieuBaoHanh.countDocuments();
    const ticketsByStatus = await PhieuBaoHanh.aggregate([{ $group: { _id: '$trangThai', count: { $sum: 1 } } }]);
    ```

- Vị trí: `getAllTickets`
  - Loại: `find(query)` với điều kiện được build từ query params + `populate()` + `sort()`
  - Mục đích: Lọc phiếu theo trạng thái/nhân viên/khoảng thời gian.

- Vị trí: `getDetailedReport`
  - Loại: `find(query)` + `populate()` + tính toán báo cáo trên kết quả trả về (tổng, theo trạng thái, theo sản phẩm, theo nhân viên).

- Vị trí: `approveTicket`, `assignEmployee`, `qualityAssessment`, `getEmployeePerformance`
  - Loại: kết hợp `findById()`, `find()`, `save()` và `populate()` để thực hiện phê duyệt, gán nhân viên, đánh giá và phân tích hiệu suất.

---

## `controllers/nhanvien.controller.js`

- Vị trí: `createNhanVien`
  - Loại: `findOne({ email })` (kiểm tra trùng) + `new NhanVien(...)` + `save()`

- Vị trí: `getAllNhanVien`
  - Loại: `find().select('-matKhau').sort(...)`

- Vị trí: `getNhanVienById`
  - Loại: `findById().select('-matKhau')`

- Vị trí: `updateNhanVien`
  - Loại: `findOne()` (kiểm tra email trùng) + `findByIdAndUpdate()`

- Vị trí: `changePassword`
  - Loại: `findById()` + `save()` (sau khi hash mật khẩu)

- Vị trí: `deleteNhanVien`, `getNhanVienByRole`
  - Loại: `findByIdAndDelete()`, `find({ chucVu })`

---

## `controllers/auth.controller.js`

- Vị trí: `login`
  - Loại: `findOne({ email })` trên `NhanVien` hoặc `KhachHang` tùy role
  - Mục đích: Tìm user theo email, so sánh mật khẩu và trả JWT.

- Vị trí: `register`
  - Loại: `findOne({ email })` kiểm tra tồn tại + `new ...` + `save()` tạo `KhachHang` hoặc `NhanVien`.

---

## `controllers/user.controller.js`

- Vị trí: `getProfile`
  - Loại: `findById().select('-matKhau')` trên `KhachHang` hoặc `NhanVien`.

- Vị trí: `updateProfile`
  - Loại: `findById()` + cập nhật field trên document + `save()`

- Vị trí: `uploadAvatar`
  - Loại: `findById()` + gán `user.avatar = '/uploads/<file>'` + `save()`

---

## `controllers/khachhang-portal.controller.js`

- Vị trí: `getWarrantyInfo`
  - Loại: `findById()` (KhachHang) + `find({ khachHangId })` (SanPham, PhieuBaoHanh) + `populate()`

- Vị trí: `trackWarrantyTicket`
  - Loại: `findOne({ maPhieu })` hoặc `findById()` (tùy input) + `populate()`

- Vị trí: `submitWarrantyRequest`
  - Loại: `new PhieuBaoHanh(...)` + `save()` để tạo phiếu; trong flow này có xử lý `req.files` và lưu `tepDinhKem`/`hinhAnhLoi`.

- Vị trí: `getWarrantyRecommendations`
  - Loại: `find({ khachHangId })` (SanPham) để tính khuyến nghị gia hạn.

- Vị trí: `submitRating`
  - Loại: `findById()` (PhieuBaoHanh) + kiểm tra `ticket.qualityRating` + gán `qualityRating`/`qualityComments` + `save()`

---

## Các pattern truy vấn/ thao tác thường gặp khác

- `populate('fieldName')`: dùng phổ biến để điền thông tin liên quan (SanPham.khachHangId, PhieuBaoHanh.sanPhamId, v.v.).
- `sort({ field: -1 })`: sắp xếp theo ngày/timesamp giảm dần.
- `countDocuments()`: đếm tổng tài liệu.
- `aggregate([...])`: tổng hợp, nhóm theo `trangThai` để thống kê.
- Ghi chú về cập nhật document: nhiều nơi dùng `findById()` để load document, thay đổi các field (push vào mảng) rồi `save()` để đảm bảo middleware/validation model được chạy.

---

## Gợi ý cải thiện (tùy chọn)

- Thêm các truy vấn index trên các field thường filter (ví dụ: `maPhieu`, `soSerial`, `khachHangId`, `trangThai`) để cải thiện hiệu năng.
- Chuẩn hoá pattern cập nhật: với các cập nhật đơn giản có thể dùng `findByIdAndUpdate(..., { new: true })` thay vì load + sửa + save, tuy nhiên load + sửa + save phù hợp khi cần logic nhiều bước hoặc gọi middleware.

---

Nếu bạn muốn tôi (1) commit file này vào Git và push lên branch hiện tại, hoặc (2) mở rộng để liệt kê mọi truy vấn kèm số dòng và link file, nói tôi biết lựa chọn của bạn.
