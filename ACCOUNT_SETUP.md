# Hướng dẫn tạo tài khoản đăng nhập

## Cách 1: Đăng ký qua giao diện web (Khuyến nghị)

1. **Chạy backend:**
   ```bash
   cd c:\Users\GIGABYTE\Desktop\mongobe
   npm start
   ```

2. **Chạy frontend:**
   ```bash
   cd c:\Users\GIGABYTE\Desktop\QLBaoHanh
   npm run dev
   ```

3. **Truy cập trang đăng nhập:**
   - Mở trình duyệt: http://localhost:5173
   - Click nút "Chưa có tài khoản? Đăng ký ngay"
   - Điền thông tin:
     - Họ tên: Nguyễn Văn A
     - Email: admin@example.com
     - Mật khẩu: 123456
     - Vai trò: Chọn vai trò bạn muốn (Khách hàng/Nhân viên/Người quản lý)
   - Click "Đăng ký"
   - Sau khi đăng ký thành công, đăng nhập bằng email và mật khẩu vừa tạo

---

## Cách 2: Tạo tài khoản bằng MongoDB Compass

1. **Mở MongoDB Compass** và kết nối tới `mongodb://localhost:27017`

2. **Chọn database** `bh_cau_long`

3. **Chọn collection** `nhanviens`

4. **Click "ADD DATA" → "Insert Document"**

5. **Dán đoạn JSON sau** (thay đổi thông tin nếu cần):

```json
{
  "hoTen": "Nguyễn Văn Admin",
  "email": "admin@example.com",
  "matKhau": "$2a$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGH",
  "chucVu": "quanly",
  "sdt": "0123456789",
  "diaChi": "123 Đường ABC, TP.HCM"
}
```

**⚠️ LỖI:** Mật khẩu phải được mã hóa bằng bcrypt. Sử dụng script bên dưới để tạo mật khẩu hợp lệ.

---

## Cách 3: Tạo tài khoản bằng Script Node.js

1. **Tạo file** `create-account.js` trong thư mục `mongobe`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bh_cau_long');

const nhanVienSchema = new mongoose.Schema({
  hoTen: String,
  email: String,
  matKhau: String,
  chucVu: String,
  sdt: String,
  diaChi: String,
});

const NhanVien = mongoose.model('NhanVien', nhanVienSchema);

async function createAccount() {
  try {
    // Thông tin tài khoản
    const accounts = [
      {
        hoTen: 'Nguyễn Văn Admin',
        email: 'admin@example.com',
        matKhau: '123456',
        chucVu: 'quanly',
        sdt: '0901234567',
        diaChi: '123 Đường ABC, TP.HCM'
      },
      {
        hoTen: 'Trần Thị Nhân Viên',
        email: 'nhanvien@example.com',
        matKhau: '123456',
        chucVu: 'nhanvien',
        sdt: '0912345678',
        diaChi: '456 Đường DEF, TP.HCM'
      },
      {
        hoTen: 'Lê Văn Khách',
        email: 'khach@example.com',
        matKhau: '123456',
        chucVu: 'khachhang',
        sdt: '0923456789',
        diaChi: '789 Đường GHI, TP.HCM'
      }
    ];

    for (const acc of accounts) {
      // Kiểm tra email đã tồn tại chưa
      const existing = await NhanVien.findOne({ email: acc.email });
      if (existing) {
        console.log(`❌ Email ${acc.email} đã tồn tại!`);
        continue;
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(acc.matKhau, 10);

      // Tạo tài khoản mới
      const newAccount = new NhanVien({
        hoTen: acc.hoTen,
        email: acc.email,
        matKhau: hashedPassword,
        chucVu: acc.chucVu,
        sdt: acc.sdt,
        diaChi: acc.diaChi
      });

      await newAccount.save();
      console.log(`✅ Tạo tài khoản thành công: ${acc.email} (${acc.chucVu})`);
    }

    console.log('\n🎉 Hoàn tất! Bạn có thể đăng nhập bằng các tài khoản sau:');
    console.log('📧 admin@example.com - Mật khẩu: 123456 (Người quản lý)');
    console.log('📧 nhanvien@example.com - Mật khẩu: 123456 (Nhân viên)');
    console.log('📧 khach@example.com - Mật khẩu: 123456 (Khách hàng)');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

createAccount();
```

2. **Chạy script:**
   ```bash
   cd c:\Users\GIGABYTE\Desktop\mongobe
   node create-account.js
   ```

3. **Đăng nhập** với một trong các tài khoản đã tạo:
   - **Người quản lý:** admin@example.com / 123456
   - **Nhân viên:** nhanvien@example.com / 123456
   - **Khách hàng:** khach@example.com / 123456

---

## Danh sách vai trò (chucVu)

- `khachhang` - Khách hàng (gửi yêu cầu bảo hành, theo dõi phiếu)
- `nhanvien` - Nhân viên (tiếp nhận, kiểm tra, sửa chữa)
- `quanly` - Người quản lý (quản lý sản phẩm, nhân viên, thống kê)

---

## Troubleshooting

### Lỗi "Email đã tồn tại"
- Bạn đã tạo tài khoản với email này rồi
- Sử dụng email khác hoặc xóa tài khoản cũ trong MongoDB

### Lỗi "Cannot connect to MongoDB"
- Đảm bảo MongoDB đang chạy
- Kiểm tra file `.env` trong thư mục `mongobe`
- Connection string mặc định: `mongodb://localhost:27017/bh_cau_long`

### Lỗi "Sai thông tin" khi đăng nhập
- Kiểm tra email và mật khẩu
- Đảm bảo vai trò (chucVu) chọn đúng với vai trò trong database
- Mật khẩu phải được mã hóa bcrypt trong database
