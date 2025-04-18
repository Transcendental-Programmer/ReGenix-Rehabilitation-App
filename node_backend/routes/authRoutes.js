// routes/authRoutes.js
const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;

// routes/exerciseRoutes.js
const express = require('express');
const { getExercises } = require('../controllers/exerciseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getExercises);

module.exports = router;

// routes/sessionRoutes.js
const express = require('express');
const { createSession, getSessions } = require('../controllers/sessionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createSession);
router.get('/', auth, getSessions);

module.exports = router;

// routes/reportRoutes.js
const express = require('express');
const { getSpiderData } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/spider', auth, getSpiderData);

module.exports = router;


