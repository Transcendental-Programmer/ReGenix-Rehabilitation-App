// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createSession, 
  saveSessionLogs,
  completeSession,
  getUserSessions,
  getSessionDetails,
  getSessionSummary
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// Create a new session
router.post('/', protect, createSession);

// Save logs for a session
router.post('/:sessionId/logs', protect, saveSessionLogs);

// Complete a session
router.put('/:sessionId/complete', protect, completeSession);

// Get all sessions for a user
router.get('/user/:userId', protect, getUserSessions);

// Get detailed session data with logs
router.get('/:sessionId', protect, getSessionDetails);

// Get session summary with statistics
router.get('/:sessionId/summary', protect, getSessionSummary);

module.exports = router;