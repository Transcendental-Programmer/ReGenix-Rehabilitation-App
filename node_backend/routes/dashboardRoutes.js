// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getUserDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Get user's rehabilitation dashboard summary
router.get('/user/:userId/summary', protect, getUserDashboardSummary);

module.exports = router;