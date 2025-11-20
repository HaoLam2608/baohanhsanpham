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
        if (!collectionNames.includes('nhanviens')) {
            await db.createCollection('nhanviens');
            console.log('Created collection: nhanviens');
        }
        if (!collectionNames.includes('sanphams')) {
            await db.createCollection('sanphams');
            console.log('Created collection: sanphams');
        }
        if (!collectionNames.includes('khachhangs')) {
            await db.createCollection('khachhangs');
            console.log('Created collection: khachhangs');
        }
        if (!collectionNames.includes('phieubaohanhes')) {
            await db.createCollection('phieubaohanhes');
            console.log('Created collection: phieubaohanhes');
        }
        if (!collectionNames.includes('chitietbaohanhes')) {
            await db.createCollection('chitietbaohanhes');
            console.log('Created collection: chitietbaohanhes');
        }
    } catch (err) {
        console.error('MongoDB connection error', err);
        process.exit(1);
    }
};

module.exports = connectDB;
