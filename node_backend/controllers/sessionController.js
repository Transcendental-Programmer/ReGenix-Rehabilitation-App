// controllers/sessionController.js
const Session = require('../models/Session');
const SessionLog = require('../models/SessionLog');

// Create a new exercise session
exports.createSession = async (req, res) => {
  try {
    const { userId, exerciseType, totalSets, targetReps } = req.body;
    
    if (!userId || !exerciseType) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and exercise type are required' 
      });
    }
    
    const newSession = new Session({
      userId,
      exerciseType,
      totalSets: totalSets || 3,
      targetReps: targetReps || 10
    });
    
    await newSession.save();
    
    return res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Save session logs received from frontend
exports.saveSessionLogs = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { setNumber, repCount, logs } = req.body;
    
    if (!sessionId || !logs || !Array.isArray(logs)) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and logs array are required'
      });
    }
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Find existing log for this set or create new one
    let sessionLog = await SessionLog.findOne({ 
      sessionId, 
      setNumber: setNumber || 1 
    });
    
    if (!sessionLog) {
      sessionLog = new SessionLog({
        sessionId,
        setNumber: setNumber || 1,
        repCount: repCount || 0,
        logs: []
      });
    }
    
    // Update rep count if provided
    if (repCount !== undefined) {
      sessionLog.repCount = repCount;
    }
    
    // Add new logs
    sessionLog.logs.push(...logs);
    
    await sessionLog.save();
    
    // Check if set is complete based on rep count
    if (sessionLog.repCount >= session.targetReps) {
      session.completedSets += 1;
      
      // Check if all sets are complete
      if (session.completedSets >= session.totalSets) {
        session.completed = true;
        session.endTime = new Date();
        
        // Calculate overall score
        await calculateSessionScore(sessionId);
      }
      
      await session.save();
    }
    
    return res.status(200).json({
      success: true,
      data: {
        session,
        sessionLog
      }
    });
  } catch (error) {
    console.error('Error saving session logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Complete a session
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    session.completed = true;
    session.endTime = new Date();
    
    await session.save();
    
    // Calculate overall score
    await calculateSessionScore(sessionId);
    
    // Get updated session with score
    const updatedSession = await Session.findById(sessionId);
    
    return res.status(200).json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error completing session:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate session score
async function calculateSessionScore(sessionId) {
  try {
    const session = await Session.findById(sessionId);
    if (!session) return;
    
    const sessionLogs = await SessionLog.find({ sessionId });
    if (!sessionLogs.length) return;
    
    let totalScore = 0;
    let scoreCount = 0;
    
    // Calculate average score across all logs
    sessionLogs.forEach(setLog => {
      setLog.logs.forEach(log => {
        if (log.repScore !== undefined) {
          totalScore += log.repScore;
          scoreCount++;
        }
      });
    });
    
    if (scoreCount > 0) {
      session.overallScore = Math.round(totalScore / scoreCount);
      
      // Set score label
      if (session.overallScore >= 90) {
        session.scoreLabel = 'Excellent';
      } else if (session.overallScore >= 75) {
        session.scoreLabel = 'Good';
      } else if (session.overallScore >= 60) {
        session.scoreLabel = 'Average';
      } else {
        session.scoreLabel = 'Needs Improvement';
      }
      
      await session.save();
    }
  } catch (error) {
    console.error('Error calculating session score:', error);
  }
}

// Get all sessions for a user
exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get session details with logs
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const sessionLogs = await SessionLog.find({ sessionId })
      .sort({ setNumber: 1 });
    
    return res.status(200).json({
      success: true,
      data: {
        session,
        logs: sessionLogs
      }
    });
  } catch (error) {
    console.error('Error getting session details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get session summary with statistics
exports.getSessionSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const sessionLogs = await SessionLog.find({ sessionId });
    
    // Calculate stats for each set
    const setStats = [];
    for (const log of sessionLogs) {
      const setNumber = log.setNumber;
      
      // Get unique feedback items
      const feedbackItems = {};
      log.logs.forEach(entry => {
        if (entry.feedback) {
          feedbackItems[entry.feedback] = (feedbackItems[entry.feedback] || 0) + 1;
        }
      });
      
      // Sort feedback by frequency
      const commonFeedback = Object.entries(feedbackItems)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(item => item[0]);
      
      // Calculate average score for this set
      let totalScore = 0;
      let scoreCount = 0;
      log.logs.forEach(entry => {
        if (entry.repScore !== undefined) {
          totalScore += entry.repScore;
          scoreCount++;
        }
      });
      
      const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      
      setStats.push({
        setNumber,
        repCount: log.repCount,
        averageScore,
        commonFeedback
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        session,
        setStats,
        totalSets: session.totalSets,
        completedSets: session.completedSets,
        overallScore: session.overallScore,
        scoreLabel: session.scoreLabel
      }
    });
  } catch (error) {
    console.error('Error getting session summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Add these methods to your existing sessionController.js

// Get user's previous sessions with summary info
exports.getUserSessionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find all sessions for this user
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .select('exerciseType startTime endTime completed overallScore scoreLabel totalSets completedSets');
    
    // Calculate duration and format session data
    const formattedSessions = sessions.map(session => {
      const startTime = new Date(session.startTime);
      let duration = null;
      
      if (session.endTime) {
        const endTime = new Date(session.endTime);
        duration = Math.round((endTime - startTime) / 1000); // Duration in seconds
      }
      
      return {
        id: session._id,
        exerciseType: session.exerciseType,
        startTime: startTime,
        completed: session.completed,
        duration: duration, // in seconds
        score: session.overallScore || 0,
        scoreLabel: session.scoreLabel || 'Not Rated',
        progress: `${session.completedSets}/${session.totalSets} sets`
      };
    });
    
    return res.status(200).json({
      success: true,
      count: formattedSessions.length,
      data: formattedSessions
    });
  } catch (error) {
    console.error('Error getting user session history:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
