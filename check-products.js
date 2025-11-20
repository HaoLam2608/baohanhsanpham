require('dotenv').config();
const mongoose = require('mongoose');
const SanPham = require('./src/models/sanpham');
const KhachHang = require('./src/models/khachhang');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📦 ALL PRODUCTS:');
        const products = await SanPham.find().populate('khachHangId');
        console.log(`Total products: ${products.length}\n`);
        
        products.forEach((p, idx) => {
            console.log(`${idx + 1}. ${p.tenSP} (${p.soSerial})`);
            console.log(`   Loại: ${p.loaiSanPham}`);
            console.log(`   Thương hiệu: ${p.thuongHieu}`);
            console.log(`   Khách hàng ID: ${p.khachHangId?._id || p.khachHangId || 'KHÔNG CÓ'}`);
            if (p.khachHangId?.hoTen) {
                console.log(`   Tên khách hàng: ${p.khachHangId.hoTen} (${p.khachHangId.email})`);
            }
            console.log('');
        });

        console.log('\n👥 ALL CUSTOMERS:');
        const customers = await KhachHang.find();
        console.log(`Total customers: ${customers.length}\n`);
        
        customers.forEach((c, idx) => {
            console.log(`${idx + 1}. ${c.hoTen} (${c.email})`);
            console.log(`   ID: ${c._id}`);
            console.log(`   SĐT: ${c.soDienThoai || 'N/A'}`);
            console.log('');
        });

        // Check products for each customer
        console.log('\n🔍 PRODUCTS BY CUSTOMER:');
        for (const customer of customers) {
            const customerProducts = products.filter(p => {
                const pid = p.khachHangId?._id || p.khachHangId;
                return String(pid) === String(customer._id);
            });
            console.log(`${customer.hoTen} (${customer.email}) - ID: ${customer._id}`);
            console.log(`  Has ${customerProducts.length} products`);
            customerProducts.forEach(p => {
                console.log(`    - ${p.tenSP} (${p.soSerial})`);
            });
            console.log('');
        }

        mongoose.connection.close();
        console.log('✅ Done!');
        
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkProducts();
