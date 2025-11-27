const LinhKien = require('../models/linhkien');

// Get all parts
exports.getAllLinhKien = async (req, res) => {
    try {
        const linhKien = await LinhKien.find().sort({ tenLinhKien: 1 });
        res.json(linhKien);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new part
exports.createLinhKien = async (req, res) => {
    try {
        const { maLinhKien, tenLinhKien, soLuongTon, giaNhap, giaXuat, moTa } = req.body;

        // Check if code exists
        const existing = await LinhKien.findOne({ maLinhKien });
        if (existing) {
            return res.status(400).json({ message: 'Mã linh kiện đã tồn tại' });
        }

        const newLinhKien = new LinhKien({
            maLinhKien,
            tenLinhKien,
            soLuongTon,
            giaNhap,
            giaXuat,
            moTa
        });

        await newLinhKien.save();
        res.status(201).json(newLinhKien);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update part
exports.updateLinhKien = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const linhKien = await LinhKien.findByIdAndUpdate(id, updateData, { new: true });
        if (!linhKien) {
            return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
        }

        res.json(linhKien);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete part
exports.deleteLinhKien = async (req, res) => {
    try {
        const { id } = req.params;
        const linhKien = await LinhKien.findByIdAndDelete(id);
        if (!linhKien) {
            return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
        }
        res.json({ message: 'Đã xóa linh kiện' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
