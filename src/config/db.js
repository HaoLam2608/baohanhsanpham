const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Initialize collections
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Create collections if they don't exist
        const requiredCollections = [
            'nhanviens',
            'sanphams',
            'khachhangs',
            'phieubaohanhs',
            'linhkiens',
            'phieubaohanhtimelines',
            'phieubaohanhcosts',
            'phieubaohanhattachments'
        ];

        for (const colName of requiredCollections) {
            if (!collectionNames.includes(colName)) {
                await db.createCollection(colName);
                console.log(`Created collection: ${colName}`);
            }
        }
    } catch (err) {
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
};

module.exports = connectDB;
