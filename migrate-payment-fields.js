require('dotenv').config();
const mongoose = require('mongoose');
const PhieuBaoHanh = require('./src/models/phieubaohanh');

async function migratePaymentFields() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all tickets
        const tickets = await PhieuBaoHanh.find({});
        console.log(`📋 Found ${tickets.length} tickets to migrate`);

        let updated = 0;
        let skipped = 0;

        for (const ticket of tickets) {
            // Calculate tongTienLinhKien from linhKienSuDung
            const tongTienLinhKien = (ticket.linhKienSuDung || []).reduce(
                (sum, item) => sum + (item.thanhTien || 0),
                0
            );

            // Set fields (force update even if exists)
            ticket.tongTienLinhKien = tongTienLinhKien;
            ticket.chiPhiPhatSinh = ticket.chiPhiPhatSinh || 0;
            ticket.tongTien = tongTienLinhKien + (ticket.chiPhiPhatSinh || 0);

            await ticket.save();
            updated++;

            console.log(`✅ Updated ticket ${ticket.maPhieu}:`);
            console.log(`   - tongTienLinhKien: ${tongTienLinhKien.toLocaleString('vi-VN')}đ`);
            console.log(`   - chiPhiPhatSinh: ${ticket.chiPhiPhatSinh.toLocaleString('vi-VN')}đ`);
            console.log(`   - tongTien: ${ticket.tongTien.toLocaleString('vi-VN')}đ`);
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   - Updated: ${updated} tickets`);
        console.log(`   - Skipped: ${skipped} tickets (already migrated)`);
        console.log(`   - Total: ${tickets.length} tickets`);

        await mongoose.connection.close();
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migratePaymentFields();
