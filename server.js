require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
// Allow larger JSON payloads because frontend may send base64-encoded attachments.
// In production it's better to use multipart/form-data + multer for file uploads
// instead of embedding base64 in JSON. Increase the limit temporarily to handle
// larger test uploads.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('src/uploads'));
// Also serve uploaded files under /api/uploads for compatibility
app.use('/api/uploads', express.static('src/uploads'));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/sanpham', require('./src/routes/sanpham.routes'));
app.use('/api/khachhang', require('./src/routes/khachhang.routes'));
app.use('/api/phieubaohanh', require('./src/routes/phieubaohanh.routes'));
app.use('/api/nhanvien', require('./src/routes/nhanvien.routes'));
app.use('/api/linhkien', require('./src/routes/linhkien.routes'));

// Role-based routes
app.use('/api/customer', require('./src/routes/customer.routes'));
app.use('/api/manager', require('./src/routes/manager.routes'));
app.use('/api/employee', require('./src/routes/employee.routes'));
// User profile routes (GET/PUT /api/user/profile)
app.use('/api/user', require('./src/routes/user.routes'));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
