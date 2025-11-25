const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const NhanVien = require('./src/models/nhanvien');
const KhachHang = require('./src/models/khachhang');
const SanPham = require('./src/models/sanpham');
const PhieuBaoHanh = require('./src/models/phieubaohanh');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bh_cau_long';

// Kết nối MongoDB
mongoose.connect(MONGO_URI);

async function seedDatabase() {
  try {
    console.log('🔄 Đang kết nối MongoDB...');
    
    // Xóa dữ liệu cũ (optional - comment out nếu muốn giữ data cũ)
    console.log('🗑️  Xóa dữ liệu cũ...');
    await NhanVien.deleteMany({});
    await KhachHang.deleteMany({});
    await SanPham.deleteMany({});
    await PhieuBaoHanh.deleteMany({});
    
    console.log('✅ Đã xóa dữ liệu cũ');

    // ========== TẠO NHÂN VIÊN VÀ QUẢN LÝ ==========
    console.log('\n👥 Tạo tài khoản nhân viên và quản lý...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const nhanViens = await NhanVien.insertMany([
      {
        hoTen: 'Nguyễn Văn Admin',
        email: 'admin@example.com',
        matKhau: hashedPassword,
        chucVu: 'quanly',
      },
      {
        hoTen: 'Trần Thị Hoa',
        email: 'hoa.nv@example.com',
        matKhau: hashedPassword,
        chucVu: 'nhanvien',
      },
      {
        hoTen: 'Lê Văn Nam',
        email: 'nam.nv@example.com',
        matKhau: hashedPassword,
        chucVu: 'nhanvien',
      },
      {
        hoTen: 'Phạm Thị Lan',
        email: 'lan.nv@example.com',
        matKhau: hashedPassword,
        chucVu: 'nhanvien',
      },
    ]);
    
    console.log(`✅ Đã tạo ${nhanViens.length} nhân viên`);

    // ========== TẠO KHÁCH HÀNG ==========
    console.log('\n🙋 Tạo tài khoản khách hàng...');
    
    const khachHangs = await KhachHang.insertMany([
      {
        hoTen: 'Nguyễn Minh Tuấn',
        email: 'tuan@example.com',
        matKhau: hashedPassword,
        soDienThoai: '0901234567',
        diaChi: '123 Nguyễn Huệ, Q1, TP.HCM',
      },
      {
        hoTen: 'Trần Thị Mai',
        email: 'mai@example.com',
        matKhau: hashedPassword,
        soDienThoai: '0912345678',
        diaChi: '456 Lê Lợi, Q1, TP.HCM',
      },
      {
        hoTen: 'Lê Hoàng Anh',
        email: 'anh@example.com',
        matKhau: hashedPassword,
        soDienThoai: '0923456789',
        diaChi: '789 Trần Hưng Đạo, Q5, TP.HCM',
      },
      {
        hoTen: 'Phạm Văn Đức',
        email: 'duc@example.com',
        matKhau: hashedPassword,
        soDienThoai: '0934567890',
        diaChi: '321 Võ Văn Tần, Q3, TP.HCM',
      },
      {
        hoTen: 'Hoàng Thị Linh',
        email: 'linh@example.com',
        matKhau: hashedPassword,
        soDienThoai: '0945678901',
        diaChi: '654 Điện Biên Phủ, Q10, TP.HCM',
      },
    ]);
    
    console.log(`✅ Đã tạo ${khachHangs.length} khách hàng`);

    // ========== TẠO SẢN PHẨM ==========
    console.log('\n🏸 Tạo sản phẩm...');
    
    const brands = ['Yonex', 'Victor', 'Lining', 'Mizuno', 'Apacs'];
    const productTypes = [
      { type: 'Vot', name: 'Vợt cầu lông' },
      { type: 'Giay', name: 'Giày cầu lông' },
      { type: 'Balo', name: 'Balo cầu lông' },
      { type: 'PhuKien', name: 'Phụ kiện cầu lông' },
    ];
    
    const sanPhams = [];
    
    for (let i = 0; i < khachHangs.length; i++) {
      const customer = khachHangs[i];
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm mỗi khách
      
      for (let j = 0; j < numProducts; j++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        const serial = `SN${Date.now()}${i}${j}`;
        const ngayMua = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        sanPhams.push({
          loaiSanPham: productType.type,
          thuongHieu: brand,
          tenSP: `${brand} ${productType.name} ${serial.slice(-4)}`,
          soSerial: serial,
          ngayMua: ngayMua,
          thoiHanBaoHanhThang: 12,
          thongTinKyThuat: { 
            moTa: `Sản phẩm chính hãng ${brand}. Bảo hành 12 tháng.`,
            xuatXu: 'Trung Quốc',
            trongLuong: productType.type === 'Vot' ? '85g' : productType.type === 'Giay' ? '350g' : '500g'
          },
          khachHangId: customer._id,
          hinhAnhHoaDon: '',
        });
      }
    }
    
    const createdSanPhams = await SanPham.insertMany(sanPhams);
    console.log(`✅ Đã tạo ${createdSanPhams.length} sản phẩm`);

    // ========== TẠO PHIẾU BẢO HÀNH ==========
    console.log('\n📋 Tạo phiếu bảo hành...');
    
    const statuses = ['tiep_nhan', 'dang_kiem_tra', 'dang_sua', 'hoan_tat'];
    const issues = [
      'Dây đứt',
      'Cán vợt bị lỏng',
      'Giày bị hở đế',
      'Balo bị rách',
      'Phụ kiện bị hỏng',
      'Khóa balo bị hỏng',
      'Vợt bị cong',
      'Giày bị bong tróc'
    ];
    
    const phieuBaoHanhs = [];
    
    // Tạo 15-20 phiếu bảo hành
    for (let i = 0; i < Math.min(15, createdSanPhams.length); i++) {
      const sanPham = createdSanPhams[i];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const issue = issues[Math.floor(Math.random() * issues.length)];
      const nhanVien = nhanViens[Math.floor(Math.random() * (nhanViens.length - 1)) + 1]; // Không lấy admin
      
      const ngayTiepNhan = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const maPhieu = `BH${String(i + 1).padStart(6, '0')}`; // BH000001, BH000002, ...
      
      const phieu = {
        maPhieu: maPhieu,
        sanPhamId: sanPham._id,
        khachHangId: sanPham.khachHangId,
        nhanVienTiepNhanId: nhanVien._id,
        moTaLoi: issue,
        loaiLoiDuDoan: Math.random() > 0.5 ? 'loi_nsx' : 'loi_su_dung',
        trangThai: status,
        ngayTiepNhan: ngayTiepNhan,
        hinhAnhLoi: [],
        lichSuTrangThai: [
          { trangThai: 'tiep_nhan', thoiGian: ngayTiepNhan, nhanVienId: nhanVien._id }
        ]
      };
      
      // Thêm lịch sử tùy theo trạng thái
      if (status === 'dang_kiem_tra' || status === 'dang_sua' || status === 'hoan_tat') {
        const ngayKiemTra = new Date(ngayTiepNhan.getTime() + 24 * 60 * 60 * 1000);
        phieu.lichSuTrangThai.push({
          trangThai: 'dang_kiem_tra',
          thoiGian: ngayKiemTra,
          nhanVienId: nhanVien._id
        });
      }
      
      if (status === 'dang_sua' || status === 'hoan_tat') {
        const ngayBatDauSua = new Date(ngayTiepNhan.getTime() + 2 * 24 * 60 * 60 * 1000);
        phieu.lichSuTrangThai.push({
          trangThai: 'dang_sua',
          thoiGian: ngayBatDauSua,
          nhanVienId: nhanVien._id
        });
      }
      
      if (status === 'hoan_tat') {
        const ngayHoanThanh = new Date(ngayTiepNhan.getTime() + 5 * 24 * 60 * 60 * 1000);
        phieu.ngayHoanTat = ngayHoanThanh;
        phieu.qualityRating = Math.floor(Math.random() * 2) + 4; // 4-5 sao
        phieu.qualityComments = 'Dịch vụ tốt, sửa chữa nhanh chóng.';
        phieu.lichSuTrangThai.push({
          trangThai: 'hoan_tat',
          thoiGian: ngayHoanThanh,
          nhanVienId: nhanVien._id
        });
      }
      
      phieuBaoHanhs.push(phieu);
    }
    
    const createdPhieus = await PhieuBaoHanh.insertMany(phieuBaoHanhs);
    console.log(`✅ Đã tạo ${createdPhieus.length} phiếu bảo hành`);

    // ========== THỐNG KÊ ==========
    console.log('\n📊 THỐNG KÊ DỮ LIỆU:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log(`│ 👤 Quản lý: 1                              │`);
    console.log(`│ 👥 Nhân viên: ${nhanViens.length - 1}                            │`);
    console.log(`│ 🙋 Khách hàng: ${khachHangs.length}                           │`);
    console.log(`│ 🏸 Sản phẩm: ${createdSanPhams.length}                            │`);
    console.log(`│ 📋 Phiếu bảo hành: ${createdPhieus.length}                     │`);
    console.log('└─────────────────────────────────────────────┘');

    console.log('\n🔑 TÀI KHOẢN ĐĂNG NHẬP (Tất cả mật khẩu: 123456):');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ QUẢN LÝ:                                               │');
    console.log('│   📧 admin@example.com (Vai trò: quanly)              │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ NHÂN VIÊN:                                             │');
    console.log('│   📧 hoa.nv@example.com (Vai trò: nhanvien)           │');
    console.log('│   📧 nam.nv@example.com (Vai trò: nhanvien)           │');
    console.log('│   📧 lan.nv@example.com (Vai trò: nhanvien)           │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ KHÁCH HÀNG:                                            │');
    console.log('│   📧 tuan@example.com (Vai trò: khachhang)            │');
    console.log('│   📧 mai@example.com (Vai trò: khachhang)             │');
    console.log('│   📧 anh@example.com (Vai trò: khachhang)             │');
    console.log('│   📧 duc@example.com (Vai trò: khachhang)             │');
    console.log('│   📧 linh@example.com (Vai trò: khachhang)            │');
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n✨ Hoàn tất! Database đã được seed thành công.');
    
  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy seeder
seedDatabase();
