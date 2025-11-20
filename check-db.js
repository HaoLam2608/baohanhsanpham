const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bh_cau_long';

async function checkDB() {
    try {
        console.log('🔄 Đang kết nối MongoDB:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công!');

        // Kiểm tra collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📂 Collections trong database:');
        collections.forEach(col => console.log('  -', col.name));

        // Kiểm tra NhanVien schema
        const NhanVien = mongoose.connection.db.collection('nhanviens');
        const count = await NhanVien.countDocuments();
        console.log('\n👤 Số lượng NhanVien:', count);

        // Kiểm tra indexes
        const indexes = await NhanVien.indexes();
        console.log('\n🔍 Indexes của NhanVien:');
        indexes.forEach(idx => console.log('  -', JSON.stringify(idx.key), 'unique:', idx.unique || false));

        // Thử tạo user test
        console.log('\n🧪 Thử tạo user test...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        const testUser = {
            hoTen: 'Test User',
            email: 'test_' + Date.now() + '@example.com',
            matKhau: hashedPassword,
            chucVu: 'khachhang',
            createdAt: new Date()
        };

        const result = await NhanVien.insertOne(testUser);
        console.log('✅ Tạo user test thành công!');
        console.log('   ID:', result.insertedId);
        console.log('   Email:', testUser.email);

    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        console.error('Chi tiết:', err);
    } finally {
        await mongoose.connection.close();
    }
}

checkDB();
