# Lệnh `mongosh` sẵn sàng chạy cho dự án

Hướng dẫn: mở `mongosh`, chọn database của bạn (ví dụ `use baohanhsanpham`) rồi dán các lệnh bên dưới. Thay `ObjectId("...")` bằng giá trị ObjectId thực tế khi cần.

Ví dụ chọn database:
```javascript
use baohanhsanpham
```

---

## Bộ sưu tập: `sanphams`

Tạo sản phẩm mẫu:
```javascript
db.sanphams.insertOne({
  loaiSanPham: "Vot",
  thuongHieu: "Yonex",
  tenSP: "Vợt cầu lông Yonex 3500",
  soSerial: "VY3500001",
  ngayMua: new Date("2024-01-15"),
  thoiHanBaoHanhThang: 12,
  thongTinKyThuat: { weight: "85g", material: "Carbon" },
  khachHangId: ObjectId("REPLACE_KHACHHANG_ID"),
  hinhAnhHoaDon: "/uploads/invoice1.jpg"
});
```

Lấy tất cả sản phẩm:
```javascript
db.sanphams.find().pretty();
```

Tìm sản phẩm theo `_id`:
```javascript
db.sanphams.findOne({ _id: ObjectId("REPLACE_ID") });
```

Tìm sản phẩm theo `soSerial`:
```javascript
db.sanphams.findOne({ soSerial: "VY3500001" });
```

Cập nhật sản phẩm (ví dụ thay đổi thương hiệu):
```javascript
db.sanphams.updateOne(
  { _id: ObjectId("REPLACE_ID") },
  { $set: { thuongHieu: "Victor", ngayMua: new Date("2024-02-01") } }
);
```

Xóa sản phẩm:
```javascript
db.sanphams.deleteOne({ _id: ObjectId("REPLACE_ID") });
```

Lấy sản phẩm theo `khachHangId`:
```javascript
db.sanphams.find({ khachHangId: ObjectId("REPLACE_KHACHHANG_ID") }).pretty();
```

---

## Bộ sưu tập: `khachhangs`

Tạo khách hàng mới:
```javascript
db.khachhangs.insertOne({
  hoTen: "Nguyen Van A",
  soDienThoai: "0912345678",
  email: "a@example.com",
  diaChi: "123 Đường ABC, TP.HCM",
  ngayTao: new Date()
});
```

Lấy danh sách khách hàng:
```javascript
db.khachhangs.find().sort({ ngayTao: -1 }).pretty();
```

Tìm theo `_id` hoặc theo số điện thoại:
```javascript
db.khachhangs.findOne({ _id: ObjectId("REPLACE_ID") });
db.khachhangs.findOne({ soDienThoai: "0912345678" });
```

Cập nhật khách hàng (tránh trùng số điện thoại với _id khác):
```javascript
// Kiểm tra trùng
db.khachhangs.findOne({ soDienThoai: "0912345678", _id: { $ne: ObjectId("REPLACE_ID") } });

// Cập nhật
db.khachhangs.updateOne(
  { _id: ObjectId("REPLACE_ID") },
  { $set: { hoTen: "Nguyen Van B", email: "b@example.com" } }
);
```

Xóa khách hàng:
```javascript
db.khachhangs.deleteOne({ _id: ObjectId("REPLACE_ID") });
```

---

## Bộ sưu tập: `phieubaohanhs`

Tạo phiếu bảo hành mẫu (thay ObjectId tương ứng):
```javascript
db.phieubaohanhs.insertOne({
  maPhieu: "BH-1700000001",
  sanPhamId: ObjectId("REPLACE_SANPHAM_ID"),
  khachHangId: ObjectId("REPLACE_KHACHHANG_ID"),
  nhanVienTiepNhanId: ObjectId("REPLACE_NHANVIEN_ID"),
  moTaLoi: "Sợi dây bị đứt",
  loaiLoiDuDoan: "Lỗi NSX",
  trangThai: "tiep_nhan",
  ngayTiepNhan: new Date(),
  ngayHoanTat: null,
  hinhAnhLoi: ["/uploads/image1.jpg", "/uploads/image2.jpg"],
  lichSuTrangThai: [ { trangThai: "tiep_nhan", thoiGian: new Date(), nhanVienId: ObjectId("REPLACE_NHANVIEN_ID") } ],
  qualityRating: null,
  qualityComments: null
});
```

Lấy tất cả phiếu:
```javascript
db.phieubaohanhs.find().sort({ ngayTiepNhan: -1 }).pretty();
```

Tìm phiếu theo `_id` hoặc theo `maPhieu`:
```javascript
db.phieubaohanhs.findOne({ _id: ObjectId("REPLACE_ID") });
db.phieubaohanhs.findOne({ maPhieu: "BH-1700000001" });
```

Tìm theo trạng thái:
```javascript
db.phieubaohanhs.find({ trangThai: "tiep_nhan" }).pretty();
```

Tìm theo `khachHangId`:
```javascript
db.phieubaohanhs.find({ khachHangId: ObjectId("REPLACE_KHACHHANG_ID") }).sort({ ngayTiepNhan: -1 }).pretty();
```

Cập nhật trạng thái và push vào `lichSuTrangThai`:
```javascript
db.phieubaohanhs.updateOne(
  { _id: ObjectId("REPLACE_ID") },
  {
    $set: { trangThai: "dang_kiem_tra" },
    $push: { lichSuTrangThai: { trangThai: "dang_kiem_tra", thoiGian: new Date(), nhanVienId: ObjectId("REPLACE_NHANVIEN_ID") } }
  }
);
```

Đánh giá chất lượng (set rating):
```javascript
db.phieubaohanhs.updateOne(
  { _id: ObjectId("REPLACE_ID") },
  { $set: { qualityRating: 5, qualityComments: "Sửa rất tốt" } }
);
```

Xóa phiếu:
```javascript
db.phieubaohanhs.deleteOne({ _id: ObjectId("REPLACE_ID") });
```

---

## Bộ sưu tập: `chitietbaohanhs`

Tạo chi tiết bảo hành:
```javascript
db.chitietbaohanhs.insertOne({
  phieuBaoHanhId: ObjectId("REPLACE_PHIEU_ID"),
  nhanVienId: ObjectId("REPLACE_NHANVIEN_ID"),
  moTaXuLy: "Thay sợi dây mới, kiểm tra khớp nối",
  linhKienThayThe: [ { tenLinhKien: "Sợi dây", maLinhKien: "SD001", chiPhi: 150000 } ],
  ngayBatDau: new Date("2024-01-16"),
  ngayHoanTat: new Date("2024-01-17"),
  ketQuaKiemTra: "Phù hợp chuẩn kỹ thuật",
  trangThai: "hoan_tat"
});
```

Lấy chi tiết theo phiếu:
```javascript
db.chitietbaohanhs.find({ phieuBaoHanhId: ObjectId("REPLACE_PHIEU_ID") }).pretty();
```

Cập nhật chi tiết:
```javascript
db.chitietbaohanhs.updateOne(
  { _id: ObjectId("REPLACE_ID") },
  { $set: { moTaXuLy: "Cập nhật mô tả xử lý", trangThai: "dang_sua" } }
);
```

Xóa chi tiết:
```javascript
db.chitietbaohanhs.deleteOne({ _id: ObjectId("REPLACE_ID") });
```

---

## Bộ sưu tập: `nhanviens`

Tạo nhân viên (lưu ý: mật khẩu nên được hash; ở đây chèn giá trị đã hash hoặc dùng ứng dụng để tạo):
```javascript
db.nhanviens.insertOne({
  hoTen: "Tran Minh Tu",
  email: "tu.tran@example.com",
  matKhau: "REPLACE_HASHED_PASSWORD",
  chucVu: "nhanvien",
  createdAt: new Date()
});
```

Lấy tất cả nhân viên (không hiển thị mật khẩu):
```javascript
db.nhanviens.find({}, { matKhau: 0 }).sort({ createdAt: -1 }).pretty();
```

Tìm nhân viên theo chức vụ:
```javascript
db.nhanviens.find({ chucVu: "admin" }, { matKhau: 0 }).pretty();
```

Xóa nhân viên:
```javascript
db.nhanviens.deleteOne({ _id: ObjectId("REPLACE_ID") });
```

---

## Truy vấn tổng hợp (aggregation) và thống kê

Đếm tổng số phiếu:
```javascript
db.phieubaohanhs.countDocuments();
```

Nhóm theo trạng thái và đếm:
```javascript
db.phieubaohanhs.aggregate([
  { $group: { _id: "$trangThai", count: { $sum: 1 } } }
]);
```

Tính thời gian hoàn tất trung bình (ngày) cho phiếu đã hoàn tất:
```javascript
db.phieubaohanhs.aggregate([
  { $match: { trangThai: "hoan_tat", ngayHoanTat: { $exists: true }, ngayTiepNhan: { $exists: true } } },
  { $project: { durationDays: { $divide: [ { $subtract: ["$ngayHoanTat", "$ngayTiepNhan"] }, 1000 * 60 * 60 * 24 ] } } },
  { $group: { _id: null, avgDays: { $avg: "$durationDays" } } }
]);
```

Thống kê sản phẩm theo loại:
```javascript
db.sanphams.aggregate([
  { $group: { _id: "$loaiSanPham", count: { $sum: 1 } } }
]);
```

---

## Gợi ý index (chạy 1 lần nếu cần)

Tạo index cho `maPhieu`, `soSerial`, `khachHangId`, `trangThai` để tối ưu tìm kiếm/lọc:
```javascript
db.phieubaohanhs.createIndex({ maPhieu: 1 });
db.sanphams.createIndex({ soSerial: 1 });
db.sanphams.createIndex({ khachHangId: 1 });
db.phieubaohanhs.createIndex({ trangThai: 1 });
```

---

Nếu bạn muốn, tôi sẽ:
- Thêm phiên bản lệnh kèm giá trị _thực tế_ (ví dụ liệt kê các ObjectId hiện có),
- Hoặc commit file này và push lên branch bạn chọn.
