const express = require('express');
const router = express.Router();

const { registerUser, loginUser, deleteOwnAccount } = require('../controllers/authController');
const protect = require('../middlewares/protect');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/me', protect, deleteOwnAccount); // 🔐 Only logged-in users can delete themselves

module.exports = router;
