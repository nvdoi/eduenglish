import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide exercise type'],
    enum: ['quiz', 'fill-in', 'multiple-choice', 'true-false', 'matching'],
    default: 'quiz'
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Please provide the correct answer'],
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

export default mongoose.model('Exercise', exerciseSchema);
