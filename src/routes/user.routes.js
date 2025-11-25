const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user.controller')
const { protect } = require('../middleware/auth.middleware')
const multer = require('multer')
const path = require('path')

// configure multer disk storage
// Store uploads in backend/src/uploads (same folder served by express)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname)
		const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`
		cb(null, name)
	}
})
const upload = multer({ storage })

// GET profile
router.get('/profile', protect, userCtrl.getProfile)

// PUT update profile
router.put('/profile', protect, userCtrl.updateProfile)

// POST avatar upload (multipart/form-data field 'avatar')
router.post('/avatar', protect, upload.single('avatar'), userCtrl.uploadAvatar)

module.exports = router
