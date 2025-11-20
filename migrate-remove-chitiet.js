// Script để xóa collection ChiTietBaoHanh cũ (không còn sử dụng)
// Chạy: node migrate-remove-chitiet.js

require('dotenv').config();
const mongoose = require('mongoose');

const migrateData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qlbaohanh');
        console.log('✅ Đã kết nối MongoDB');

        // Drop collection ChiTietBaoHanh nếu tồn tại
        const collections = await mongoose.connection.db.listCollections().toArray();
        const chiTietExists = collections.some(col => col.name === 'chitietbaohanghs');
        
        if (chiTietExists) {
            await mongoose.connection.db.dropCollection('chitietbaohanghs');
            console.log('✅ Đã xóa collection chitietbaohanghs');
        } else {
            console.log('ℹ️  Collection chitietbaohanghs không tồn tại');
        }

        console.log('\n🎉 Migration hoàn tất!');
        console.log('📝 Lưu ý: Tất cả thông tin giờ được lưu trực tiếp trong PhieuBaoHanh');
        
    } catch (err) {
        console.error('❌ Lỗi migration:', err);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Đã ngắt kết nối MongoDB');
    }
};

migrateData();
