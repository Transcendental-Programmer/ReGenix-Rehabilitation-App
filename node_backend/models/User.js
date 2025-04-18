// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer not to say'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 120
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

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

// models/Planner.js
const mongoose = require('mongoose');

const planItemSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  exercise: {
    type: String,
    enum: ['squat', 'dumbbell curl', 'lunges', 'push ups', 'deadlift', 'sit ups'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  accuracyTarget: {
    type: Number,
    required: true,
    min: 50,
    max: 100
  }
});

const plannerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  plan: [planItemSchema]
}, {
  timestamps: true
});

const Planner = mongoose.model('Planner', plannerSchema);
module.exports = Planner;
