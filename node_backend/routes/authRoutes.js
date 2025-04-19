// routes/authRoutes.js
const express = require('express');
const { register, login, getProfile,editProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/edit', auth, editProfile);

module.exports = router;