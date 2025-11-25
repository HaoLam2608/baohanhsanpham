const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user.controller')
const { protect } = require('../middleware/auth.middleware')

// GET profile
router.get('/profile', protect, userCtrl.getProfile)

// PUT update profile
router.put('/profile', protect, userCtrl.updateProfile)

module.exports = router
