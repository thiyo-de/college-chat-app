const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);  // ✅ Handler must be a function
router.post('/login', loginUser);

module.exports = router;
