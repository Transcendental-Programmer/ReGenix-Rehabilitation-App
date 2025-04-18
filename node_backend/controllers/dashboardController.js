// controllers/dashboardController.js
const Session = require('../models/Session');
const Planner = require('../models/Planner');
const { calculateAdherenceRate, calculateRecoveryPercentage } = require('../services/dashboardService');

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    // Get all sessions for user
    const sessions = await Session.find({ userId: req.user._id });
    
    // Get current week's planner
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
    
    const planner = await Planner.findOne({
      userId: req.user._id,
      weekStartDate: { $gte: startOfWeek }
    });
    
    // Calculate metrics
    const totalSessions = sessions.length;
    
    const averageAccuracy = totalSessions > 0 
      ? sessions.reduce((sum, session) => sum + session.accuracyScore, 0) / totalSessions
      : 0;
    
    const recoveryPercentage = calculateRecoveryPercentage(sessions);
    
    const adherenceRate = planner
      ? calculateAdherenceRate(sessions, planner, startOfWeek)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        averageAccuracy,
        recoveryPercentage,
        adherenceRate
      }
    });
  } catch (error) {
    console.error('Dashboard calculation error:', error);
    res.status(500).json({ error: 'Server error while generating dashboard' });
  }
};
