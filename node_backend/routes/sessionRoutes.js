// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/auth'); // Assuming you have authentication middleware

// Existing routes (you likely already have these)
router.post('/', protect, sessionController.createSession);
router.post('/:sessionId/logs', protect, sessionController.saveSessionLogs);
router.put('/:sessionId/complete', protect, sessionController.completeSession);
router.get('/user/:userId', protect, sessionController.getUserSessions);
router.get('/:sessionId', protect, sessionController.getSessionDetails);
router.get('/:sessionId/summary', protect, sessionController.getSessionSummary);

// New routes for session history
router.get('/user/:userId/history', protect, sessionController.getUserSessionHistory);

module.exports = router;