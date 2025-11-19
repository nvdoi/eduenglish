import mongoose from 'mongoose';

const grammarSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Please provide a grammar topic'],
    trim: true
  },
  explanation: {
    type: String,
    required: [true, 'Please provide an explanation'],
    trim: true
  },
  example: {
    type: String,
    trim: true,
    default: ''
  },
  rules: [{
    type: String,
    trim: true
  }],
  commonMistakes: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model('Grammar', grammarSchema);
