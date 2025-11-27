const mongoose = require('mongoose');

async function checkCollections() {
    try {
        await mongoose.connect('mongodb://localhost:27017/bh_cau_long');
        const db = mongoose.connection.db;

        const collections = ['phieubaohanhtimelines', 'phieubaohanhcosts', 'phieubaohanhattachments', 'phieubaohanhs'];

        for (const col of collections) {
            try {
                const count = await db.collection(col).countDocuments();
                console.log(`${col}: ${count} documents`);
            } catch (err) {
                console.log(`${col}: collection không tồn tại hoặc lỗi`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Lỗi:', err);
    }
}

checkCollections();