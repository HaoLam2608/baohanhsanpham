# MongoDB Queries - Hệ thống Bảo hành Cầu Long

Tài liệu này chứa các câu truy vấn MongoDB CLI tương ứng với các chức năng trong hệ thống.

---

## 1. SẢN PHẨM (SanPham)

### Tạo sản phẩm
```javascript
db.sanphams.insertOne({
    loaiSanPham: "Vot",
    thuongHieu: "Victor",
    tenSP: "Vợt cầu lông Victor 3700",
    soSerial: "VCL3700001",
    ngayMua: new Date("2024-01-15"),
    thoiHanBaoHanhThang: 12,
    thongTinKyThuat: { weight: "85g", material: "Carbon" },
    khachHangId: ObjectId("..."),
    hinhAnhHoaDon: "url_to_image.jpg"
});
```

### Lấy tất cả sản phẩm
```javascript
db.sanphams.find().pretty();
```

### Lấy sản phẩm theo ID
```javascript
db.sanphams.findOne({ _id: ObjectId("...") });
```

### Lấy sản phẩm theo serial number
```javascript
db.sanphams.findOne({ soSerial: "VCL3700001" });
```

### Cập nhật sản phẩm
```javascript
db.sanphams.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            thuongHieu: "Yonex",
            ngayMua: new Date("2024-02-01")
        }
    }
);
```

### Xóa sản phẩm
```javascript
db.sanphams.deleteOne({ _id: ObjectId("...") });
```

### Lấy sản phẩm theo khách hàng
```javascript
db.sanphams.find({ khachHangId: ObjectId("...") }).pretty();
```

---

## 2. KHÁCH HÀNG (KhachHang)

### Tạo khách hàng
```javascript
db.khachhangs.insertOne({
    hoTen: "Nguyễn Văn A",
    soDienThoai: "0912345678",
    email: "nguyenvana@email.com",
    diaChi: "123 Đường ABC, Quận 1, TP.HCM",
    ngayTao: new Date()
});
```

### Lấy tất cả khách hàng
```javascript
db.khachhangs.find().sort({ ngayTao: -1 }).pretty();
```

### Lấy khách hàng theo ID
```javascript
db.khachhangs.findOne({ _id: ObjectId("...") });
```

### Tìm khách hàng theo số điện thoại
```javascript
db.khachhangs.findOne({ soDienThoai: "0912345678" });
```

### Cập nhật khách hàng
```javascript
db.khachhangs.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            hoTen: "Nguyễn Văn B",
            email: "nguyenvanb@email.com"
        }
    }
);
```

### Xóa khách hàng
```javascript
db.khachhangs.deleteOne({ _id: ObjectId("...") });
```

---

## 3. PHIẾU BẢO HÀNH (PhieuBaoHanh)

### Tạo phiếu bảo hành
```javascript
db.phieubaohanhs.insertOne({
    maPhieu: "BH-1700000001",
    sanPhamId: ObjectId("..."),
    khachHangId: ObjectId("..."),
    nhanVienTiepNhanId: ObjectId("..."),
    moTaLoi: "Sợi dây bị đứt",
    loaiLoiDuDoan: "Lỗi NSX",
    trangThai: "tiep_nhan",
    ngayTiepNhan: new Date(),
    ngayHoanTat: null,
    hinhAnhLoi: ["url_image1.jpg", "url_image2.jpg"],
    lichSuTrangThai: [
        {
            trangThai: "tiep_nhan",
            thoiGian: new Date(),
            nhanVienId: ObjectId("...")
        }
    ],
    qualityRating: null,
    qualityComments: null
});
```

### Lấy tất cả phiếu bảo hành
```javascript
db.phieubaohanhs.find().sort({ ngayTiepNhan: -1 }).pretty();
```

### Lấy phiếu bảo hành theo ID
```javascript
db.phieubaohanhs.findOne({ _id: ObjectId("...") });
```

### Lấy phiếu theo trạng thái
```javascript
db.phieubaohanhs.find({ trangThai: "tiep_nhan" }).pretty();

db.phieubaohanhs.find({ trangThai: "dang_kiem_tra" }).pretty();

db.phieubaohanhs.find({ trangThai: "dang_sua" }).pretty();

db.phieubaohanhs.find({ trangThai: "hoan_tat" }).pretty();

db.phieubaohanhs.find({ trangThai: "tu_choi" }).pretty();
```

### Lấy phiếu theo khách hàng
```javascript
db.phieubaohanhs.find({ khachHangId: ObjectId("...") }).sort({ ngayTiepNhan: -1 }).pretty();
```

### Lấy phiếu theo nhân viên
```javascript
db.phieubaohanhs.find({ nhanVienTiepNhanId: ObjectId("...") }).pretty();
```

### Cập nhật trạng thái phiếu
```javascript
db.phieubaohanhs.updateOne(
    { _id: ObjectId("...") },
    {
        $set: { trangThai: "dang_kiem_tra" },
        $push: {
            lichSuTrangThai: {
                trangThai: "dang_kiem_tra",
                thoiGian: new Date(),
                nhanVienId: ObjectId("...")
            }
        }
    }
);
```

### Đánh giá chất lượng phiếu
```javascript
db.phieubaohanhs.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            qualityRating: 5,
            qualityComments: "Sửa rất tốt"
        }
    }
);
```

### Xóa phiếu bảo hành
```javascript
db.phieubaohanhs.deleteOne({ _id: ObjectId("...") });
```

---

## 4. CHI TIẾT BẢO HÀNH (ChiTietBaoHanh)

### Tạo chi tiết bảo hành
```javascript
db.chitietbaohanhs.insertOne({
    phieuBaoHanhId: ObjectId("..."),
    nhanVienId: ObjectId("..."),
    moTaXuLy: "Thay sợi dây mới, kiểm tra khớp nối",
    linhKienThayThe: [
        { tenLinhKien: "Sợi dây", maLinhKien: "SD001", chiPhi: 150000 },
        { tenLinhKien: "Keo dán", maLinhKien: "KD001", chiPhi: 20000 }
    ],
    ngayBatDau: new Date("2024-01-16"),
    ngayHoanTat: new Date("2024-01-17"),
    ketQuaKiemTra: "Phù hợp chuẩn kỹ thuật",
    trangThai: "hoan_tat"
});
```

### Lấy tất cả chi tiết bảo hành
```javascript
db.chitietbaohanhs.find().sort({ ngayBatDau: -1 }).pretty();
```

### Lấy chi tiết theo ID
```javascript
db.chitietbaohanhs.findOne({ _id: ObjectId("...") });
```

### Lấy chi tiết theo phiếu bảo hành
```javascript
db.chitietbaohanhs.find({ phieuBaoHanhId: ObjectId("...") }).pretty();
```

### Lấy chi tiết theo nhân viên
```javascript
db.chitietbaohanhs.find({ nhanVienId: ObjectId("...") }).sort({ ngayBatDau: -1 }).pretty();
```

### Lấy chi tiết đã hoàn tất
```javascript
db.chitietbaohanhs.find({ trangThai: "hoan_tat" }).sort({ ngayHoanTat: -1 }).pretty();
```

### Cập nhật chi tiết bảo hành
```javascript
db.chitietbaohanhs.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            moTaXuLy: "Thay sợi dây, kiểm tra lại khớp nối",
            trangThai: "dang_sua"
        }
    }
);
```

### Hoàn tất sửa chữa
```javascript
db.chitietbaohanhs.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            ngayHoanTat: new Date(),
            ketQuaKiemTra: "Sửa thành công, đạt chuẩn",
            trangThai: "hoan_tat"
        }
    }
);
```

### Xóa chi tiết bảo hành
```javascript
db.chitietbaohanhs.deleteOne({ _id: ObjectId("...") });
```

---

## 5. NHÂN VIÊN (NhanVien)

### Tạo nhân viên
```javascript
db.nhanviens.insertOne({
    hoTen: "Trần Minh Tú",
    email: "tu.tran@company.com",
    matKhau: "$2a$10$...", // Hashed password
    chucVu: "nhanvien",
    createdAt: new Date()
});
```

### Lấy tất cả nhân viên
```javascript
db.nhanviens.find().select({ matKhau: 0 }).sort({ createdAt: -1 }).pretty();
```

### Lấy nhân viên theo ID
```javascript
db.nhanviens.findOne({ _id: ObjectId("...") }, { matKhau: 0 });
```

### Tìm nhân viên theo email
```javascript
db.nhanviens.findOne({ email: "tu.tran@company.com" });
```

### Lấy nhân viên theo chức vụ
```javascript
// Lấy tất cả admin
db.nhanviens.find({ chucVu: "admin" }, { matKhau: 0 }).pretty();

// Lấy tất cả nhân viên
db.nhanviens.find({ chucVu: "nhanvien" }, { matKhau: 0 }).pretty();

// Lấy tất cả quản lý
db.nhanviens.find({ chucVu: "manager" }, { matKhau: 0 }).pretty();
```

### Cập nhật nhân viên
```javascript
db.nhanviens.updateOne(
    { _id: ObjectId("...") },
    {
        $set: {
            hoTen: "Trần Minh Tú Updated",
            chucVu: "manager"
        }
    }
);
```

### Xóa nhân viên
```javascript
db.nhanviens.deleteOne({ _id: ObjectId("...") });
```

---

## 6. TRUY VẤN THỐNG KÊ (ANALYTICS)

### Thống kê tổng số phiếu
```javascript
db.phieubaohanhs.countDocuments();
```

### Thống kê phiếu theo trạng thái
```javascript
db.phieubaohanhs.aggregate([
    {
        $group: {
            _id: "$trangThai",
            count: { $sum: 1 }
        }
    }
]).pretty();
```

### Tính thời gian hoàn tất trung bình
```javascript
db.phieubaohanhs.aggregate([
    { $match: { trangThai: "hoan_tat" } },
    {
        $project: {
            durationDays: {
                $divide: [
                    { $subtract: ["$ngayHoanTat", "$ngayTiepNhan"] },
                    1000 * 60 * 60 * 24
                ]
            }
        }
    },
    {
        $group: {
            _id: null,
            avgDays: { $avg: "$durationDays" }
        }
    }
]).pretty();
```

### Thống kê sản phẩm theo loại
```javascript
db.sanphams.aggregate([
    {
        $group: {
            _id: "$loaiSanPham",
            count: { $sum: 1 }
        }
    }
]).pretty();
```

### Thống kê phiếu theo sản phẩm
```javascript
db.phieubaohanhs.aggregate([
    {
        $lookup: {
            from: "sanphams",
            localField: "sanPhamId",
            foreignField: "_id",
            as: "sanPham"
        }
    },
    {
        $unwind: "$sanPham"
    },
    {
        $group: {
            _id: "$sanPham.tenSP",
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: -1 }
    }
]).pretty();
```

### Thống kê hiệu suất nhân viên
```javascript
db.phieubaohanhs.aggregate([
    {
        $match: { trangThai: "hoan_tat" }
    },
    {
        $group: {
            _id: "$nhanVienTiepNhanId",
            totalCompleted: { $sum: 1 },
            avgRating: { $avg: "$qualityRating" }
        }
    },
    {
        $lookup: {
            from: "nhanviens",
            localField: "_id",
            foreignField: "_id",
            as: "nhanVien"
        }
    },
    {
        $unwind: "$nhanVien"
    },
    {
        $project: {
            hoTen: "$nhanVien.hoTen",
            totalCompleted: 1,
            avgRating: { $round: ["$avgRating", 2] }
        }
    },
    {
        $sort: { avgRating: -1 }
    }
]).pretty();
```

### Tổng chi phí sửa chữa theo khách hàng
```javascript
db.chitietbaohanhs.aggregate([
    {
        $unwind: "$linhKienThayThe"
    },
    {
        $group: {
            _id: "$phieuBaoHanhId",
            totalCost: { $sum: "$linhKienThayThe.chiPhi" }
        }
    },
    {
        $lookup: {
            from: "phieubaohanhs",
            localField: "_id",
            foreignField: "_id",
            as: "phieu"
        }
    },
    {
        $unwind: "$phieu"
    },
    {
        $lookup: {
            from: "khachhangs",
            localField: "phieu.khachHangId",
            foreignField: "_id",
            as: "khachHang"
        }
    },
    {
        $unwind: "$khachHang"
    },
    {
        $group: {
            _id: "$khachHang.hoTen",
            totalSpent: { $sum: "$totalCost" }
        }
    },
    {
        $sort: { totalSpent: -1 }
    }
]).pretty();
```

### Báo cáo phiếu theo khoảng thời gian
```javascript
db.phieubaohanhs.aggregate([
    {
        $match: {
            ngayTiepNhan: {
                $gte: new Date("2024-01-01"),
                $lte: new Date("2024-12-31")
            }
        }
    },
    {
        $group: {
            _id: {
                $dateToString: { format: "%Y-%m", date: "$ngayTiepNhan" }
            },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { _id: 1 }
    }
]).pretty();
```

### Liên kết dữ liệu (JOIN) - Phiếu với khách hàng và sản phẩm
```javascript
db.phieubaohanhs.aggregate([
    {
        $lookup: {
            from: "khachhangs",
            localField: "khachHangId",
            foreignField: "_id",
            as: "khachHang"
        }
    },
    {
        $lookup: {
            from: "sanphams",
            localField: "sanPhamId",
            foreignField: "_id",
            as: "sanPham"
        }
    },
    {
        $unwind: "$khachHang"
    },
    {
        $unwind: "$sanPham"
    },
    {
        $project: {
            maPhieu: 1,
            khachHangTen: "$khachHang.hoTen",
            sanPhamTen: "$sanPham.tenSP",
            trangThai: 1,
            ngayTiepNhan: 1
        }
    }
]).pretty();
```

---

## 7. CẬP NHẬT HÀNG LOẠT

### Cập nhật tất cả phiếu cũ thành đã hết hạn
```javascript
db.phieubaohanhs.updateMany(
    {
        trangThai: "tiep_nhan",
        ngayTiepNhan: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
    },
    {
        $set: { trangThai: "tu_choi" }
    }
);
```

### Cập nhật tất cả sản phẩm có hạn bảo hành < 30 ngày
```javascript
db.sanphams.find({
    $expr: {
        $lt: [
            {
                $add: [
                    "$ngayMua",
                    { $multiply: ["$thoiHanBaoHanhThang", 30*24*60*60*1000] }
                ]
            },
            new Date()
        ]
    }
}).pretty();
```

---

## 8. XÓA DỮ LIỆU

### Xóa tất cả phiếu bảo hành
```javascript
db.phieubaohanhs.deleteMany({});
```

### Xóa tất cả chi tiết bảo hành
```javascript
db.chitietbaohanhs.deleteMany({});
```

### Xóa phiếu cũ hơn 1 năm
```javascript
db.phieubaohanhs.deleteMany({
    ngayTiepNhan: { $lt: new Date(Date.now() - 365*24*60*60*1000) }
});
```

---

## 9. TẠO INDEXES để cải thiện hiệu suất

```javascript
// Index cho tìm kiếm theo số điện thoại
db.khachhangs.createIndex({ soDienThoai: 1 }, { unique: true });

// Index cho tìm kiếm theo email
db.nhanviens.createIndex({ email: 1 }, { unique: true });

// Index cho tìm kiếm theo serial number
db.sanphams.createIndex({ soSerial: 1 }, { unique: true });

// Index cho tìm kiếm theo mã phiếu
db.phieubaohanhs.createIndex({ maPhieu: 1 }, { unique: true });

// Index cho tìm kiếm phiếu theo khách hàng
db.phieubaohanhs.createIndex({ khachHangId: 1 });

// Index cho tìm kiếm phiếu theo trạng thái
db.phieubaohanhs.createIndex({ trangThai: 1 });

// Index cho tìm kiếm phiếu theo ngày
db.phieubaohanhs.createIndex({ ngayTiepNhan: -1 });

// Index composite cho tìm kiếm phiếu theo khách hàng và trạng thái
db.phieubaohanhs.createIndex({ khachHangId: 1, trangThai: 1 });

// Xem tất cả indexes
db.collection.getIndexes();
```

---

## 10. BACKUP & RESTORE

### Backup database
```bash
mongodump --db bh_cau_long --out ./backup/
```

### Restore database
```bash
mongorestore --db bh_cau_long ./backup/bh_cau_long/
```

---

**Chú ý:** 
- Thay `ObjectId("...")` bằng ID thực tế từ cơ sở dữ liệu
- Đảm bảo bạn đang kết nối đúng database: `use bh_cau_long`
- Tất cả query đều phù hợp với MongoDB CLI (`mongosh`)
