// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercise: {
    type: String,
    enum: ['squat', 'dumbbell curl', 'lunges', 'push ups', 'deadlift', 'sit ups'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  accuracyScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  feedbackNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
