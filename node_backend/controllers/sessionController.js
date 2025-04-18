// controllers/sessionController.js
const Session = require('../models/Session');

// Create new session log
exports.createSession = async (req, res) => {
  try {
    const { exercise, duration, accuracyScore, feedbackNotes } = req.body;
    
    // Create session
    const session = await Session.create({
      userId: req.user._id,
      exercise,
      duration,
      accuracyScore,
      feedbackNotes
    });
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Server error while creating session' });
  }
};

// Get all sessions for a user
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching sessions' });
  }
};
