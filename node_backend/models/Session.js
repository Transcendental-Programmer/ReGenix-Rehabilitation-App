// models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseType: {
    type: String,
    required: true,
    enum: ['squats', 'pushups', 'deadlifts', 'lunges', 'situps', 'bicep_curls']
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  totalSets: {
    type: Number,
    default: 3
  },
  completedSets: {
    type: Number,
    default: 0
  },
  targetReps: {
    type: Number,
    default: 10
  },
  overallScore: {
    type: Number
  },
  scoreLabel: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Needs Improvement']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);