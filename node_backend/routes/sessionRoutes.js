// routes/sessionRoutes.js
const express = require('express');
const { createSession, getSessions } = require('../controllers/sessionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createSession);
router.get('/', auth, getSessions);

module.exports = router;