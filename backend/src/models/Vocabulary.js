import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Please provide a word'],
    trim: true
  },
  meaning: {
    type: String,
    required: [true, 'Please provide the meaning'],
    trim: true
  },
  example: {
    type: String,
    trim: true,
    default: ''
  },
  pronunciation: {
    type: String,
    trim: true
  },
  partOfSpeech: {
    type: String,
    enum: {
      values: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', ''],
      message: '{VALUE} is not a valid part of speech'
    },
    default: '',
    trim: true
  },
  favourite: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Vocabulary', vocabularySchema);
