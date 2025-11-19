import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
    trim: true,
    unique: true
  },
  title: {
    type: String,
    trim: true,
    default: function() { return this.name; }
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  level: {
    type: String,
    required: [true, 'Please provide a course level'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    validate: {
      validator: function(v) {
        // Accept both URL and base64 image data
        return !v || v.startsWith('http') || v.startsWith('data:image/');
      },
      message: 'Image must be a valid URL or base64 image data'
    }
  },
  vocabularies: [{
    type: mongoose.Schema.Types.Mixed
  }],
  grammars: [{
    type: mongoose.Schema.Types.Mixed
  }],
  exercises: [{
    type: mongoose.Schema.Types.Mixed
  }],
  duration: {
    type: Number, // in hours
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for total items count
courseSchema.virtual('totalItems').get(function() {
  return this.vocabularies.length + this.grammars.length + this.exercises.length;
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export default mongoose.model('Course', courseSchema);
