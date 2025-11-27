require('dotenv').config();
const mongoose = require('mongoose');
const LinhKien = require('./src/models/linhkien');

const sampleParts = [
    {
        maLinhKien: 'LK001',
        tenLinhKien: 'Dây cước Yonex BG65',
        soLuongTon: 50,
        giaNhap: 80000,
        giaXuat: 120000,
        moTa: 'Dây cước chuyên dụng cho vợt cầu lông Yonex, độ bền cao'
    },
    {
        maLinhKien: 'LK002',
        tenLinhKien: 'Quấn cán Yonex AC102',
        soLuongTon: 100,
        giaNhap: 15000,
        giaXuat: 25000,
        moTa: 'Quấn cán chống trơn, thấm hút mồ hôi tốt'
    },
    {
        maLinhKien: 'LK003',
        tenLinhKien: 'Đế giày Victor',
        soLuongTon: 20,
        giaNhap: 150000,
        giaXuat: 250000,
        moTa: 'Đế giày thay thế cho giày cầu lông Victor'
    },
    {
        maLinhKien: 'LK004',
        tenLinhKien: 'Dây kéo balo Yonex',
        soLuongTon: 30,
        giaNhap: 20000,
        giaXuat: 35000,
        moTa: 'Dây kéo thay thế cho balo cầu lông'
    },
    {
        maLinhKien: 'LK005',
        tenLinhKien: 'Khung vợt Yonex (phụ tùng)',
        soLuongTon: 5,
        giaNhap: 800000,
        giaXuat: 1200000,
        moTa: 'Khung vợt thay thế cho các dòng Yonex Astrox'
    },
    {
        maLinhKien: 'LK006',
        tenLinhKien: 'Miếng đệm giày',
        soLuongTon: 60,
        giaNhap: 30000,
        giaXuat: 50000,
        moTa: 'Miếng đệm êm ái cho giày cầu lông'
    },
    {
        maLinhKien: 'LK007',
        tenLinhKien: 'Dây cước Victor VS850',
        soLuongTon: 40,
        giaNhap: 90000,
        giaXuat: 140000,
        moTa: 'Dây cước cao cấp Victor, độ đàn hồi tốt'
    },
    {
        maLinhKien: 'LK008',
        tenLinhKien: 'Khóa kéo balo',
        soLuongTon: 25,
        giaNhap: 10000,
        giaXuat: 20000,
        moTa: 'Khóa kéo kim loại bền chắc'
    },
    {
        maLinhKien: 'LK009',
        tenLinhKien: 'Lưới vợt (phụ tùng)',
        soLuongTon: 15,
        giaNhap: 50000,
        giaXuat: 80000,
        moTa: 'Lưới vợt thay thế, chất liệu nylon cao cấp'
    },
    {
        maLinhKien: 'LK010',
        tenLinhKien: 'Đệm cán vợt',
        soLuongTon: 80,
        giaNhap: 5000,
        giaXuat: 10000,
        moTa: 'Đệm cán vợt chống sốc, giảm rung'
    }
];

async function seedLinhKien() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Xóa dữ liệu cũ (nếu có)
        await LinhKien.deleteMany({});
        console.log('🗑️  Cleared existing parts');

        // Thêm dữ liệu mẫu
        await LinhKien.insertMany(sampleParts);
        console.log(`✅ Added ${sampleParts.length} sample parts`);

        console.log('\n📦 Sample parts:');
        sampleParts.forEach(part => {
            console.log(`  - ${part.maLinhKien}: ${part.tenLinhKien} (Tồn: ${part.soLuongTon})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedLinhKien();
