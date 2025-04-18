// services/reportService.js
exports.calculateSpiderData = (sessions) => {
  // Dummy algorithm for generating spider chart data
  // In a real implementation, this would be more sophisticated
  
  // Initialize metrics
  const metrics = {
    strength: 0,
    flexibility: 0,
    endurance: 0,
    balance: 0,
    coordination: 0
  };
  
  if (sessions.length === 0) {
    return metrics;
  }
  
  // Map exercises to primary attributes they develop
  const exerciseAttributes = {
    'squat': ['strength', 'balance'],
    'dumbbell curl': ['strength'],
    'lunges': ['balance', 'coordination'],
    'push ups': ['strength', 'endurance'],
    'deadlift': ['strength', 'coordination'],
    'sit ups': ['endurance', 'flexibility']
  };
  
  // Calculate scores based on sessions
  sessions.forEach(session => {
    const attributes = exerciseAttributes[session.exercise] || [];
    const score = (session.accuracyScore / 100) * (session.duration / 10);
    
    attributes.forEach(attribute => {
      if (metrics.hasOwnProperty(attribute)) {
        metrics[attribute] += score;
      }
    });
  });
  
  // Normalize scores (0-100)
  const maxPossibleScore = 10; // Arbitrary scale
  Object.keys(metrics).forEach(key => {
    metrics[key] = Math.min(Math.round((metrics[key] / maxPossibleScore) * 100), 100);
  });
  
  return metrics;
};

// services/plannerService.js
exports.generateWeeklyPlan = (user) => {
  // Dummy algorithm for generating a weekly exercise plan
  // In a real implementation, this would be more sophisticated and personalized
  
  const exercises = ['squat', 'dumbbell curl', 'lunges', 'push ups', 'deadlift', 'sit ups'];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const plan = [];
  
  // Generate 3-5 exercises per week
  const numberOfExercises = Math.floor(Math.random() * 3) + 3; // 3-5 exercises
  
  // Shuffle days to pick random days
  const shuffledDays = [...days].sort(() => 0.5 - Math.random());
  const selectedDays = shuffledDays.slice(0, numberOfExercises);
  
  // Assign random exercises to selected days
  selectedDays.forEach(day => {
    const randomExerciseIndex = Math.floor(Math.random() * exercises.length);
    const exercise = exercises[randomExerciseIndex];
    
    // Random duration between 10-30 minutes
    const duration = Math.floor(Math.random() * 21) + 10;
    
    // Random accuracy target between 70-90%
    const accuracyTarget = Math.floor(Math.random() * 21) + 70;
    
    plan.push({
      day,
      exercise,
      duration,
      accuracyTarget
    });
  });
  
  return plan;
};

// services/dashboardService.js
exports.calculateRecoveryPercentage = (sessions) => {
  // Dummy algorithm for calculating recovery percentage
  // In a real implementation, this would use actual recovery metrics
  
  if (sessions.length === 0) return 0;
  
  // For demo purposes, return a random value between 60-95%
  return Math.floor(Math.random() * 36) + 60;
};

exports.calculateAdherenceRate = (sessions, planner, startOfWeek) => {
  // Calculate how many planned exercises were actually completed
  
  if (!planner || !planner.plan || planner.plan.length === 0) {
    return 0;
  }
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  // Filter sessions to only include those from current week
  const currentWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startOfWeek && sessionDate < endOfWeek;
  });
  
  // Count completed exercises
  let completedExercises = 0;
  
  planner.plan.forEach(planItem => {
    const matchingSession = currentWeekSessions.find(session => 
      session.exercise === planItem.exercise
    );
    
    if (matchingSession) {
      completedExercises++;
    }
  });
  
  // Calculate adherence as percentage
  const adherenceRate = (completedExercises / planner.plan.length) * 100;
  
  return Math.round(adherenceRate);
};
