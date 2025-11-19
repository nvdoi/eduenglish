import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Tiến độ học tập
  progress: {
    vocabulary: {
      studied: { type: Number, default: 0 },
      known: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    grammar: {
      studied: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    exercises: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    overall: {
      percentage: { type: Number, default: 0 }
    }
  },
  
  // Kết quả kiểm tra
  examResults: [{
    examId: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    percentage: Number,
    completedAt: { type: Date, default: Date.now },
    questions: [{
      questionId: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }]
  }],
  
  // Thống kê
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // minutes
    lastStudied: Date,
    streakDays: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 }
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'exam_ready'],
    default: 'not_started'
  },
  
  // Thời gian
  startedAt: Date,
  completedAt: Date,
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
resultSchema.index({ userId: 1, courseId: 1 }, { unique: true });
resultSchema.index({ userId: 1 });
resultSchema.index({ courseId: 1 });

// Methods
resultSchema.methods.calculateOverallProgress = function() {
  const vocabWeight = 0.6;  // 60% cho từ vựng
  const exerciseWeight = 0.4;  // 40% cho bài tập
  
  // Đảm bảo có giá trị mặc định và tính toán chính xác
  const vocabPercentage = Number(this.progress.vocabulary?.percentage) || 0;
  const exercisePercentage = Number(this.progress.exercises?.percentage) || 0;
  
  // Tính toán chính xác với 2 chữ số thập phân trước khi làm tròn
  const overall = (vocabPercentage * vocabWeight) + (exercisePercentage * exerciseWeight);
  const roundedOverall = Math.round(overall);
  
  this.progress.overall.percentage = roundedOverall;
  
  // Update status based on progress
  if (this.progress.overall.percentage >= 100) {
    this.status = 'completed';
  } else if (this.progress.overall.percentage >= 80) {
    this.status = 'exam_ready';
  } else if (this.progress.overall.percentage > 0) {
    this.status = 'in_progress';
  }
  
  return this.progress.overall.percentage;
};

resultSchema.methods.updateVocabularyProgress = function(studied, known, total) {
  this.progress.vocabulary.studied = Math.max(0, studied);
  this.progress.vocabulary.known = Math.max(0, known);
  this.progress.vocabulary.total = total;
  this.progress.vocabulary.percentage = total > 0 ? Math.round((known / total) * 100) : 0;
  
  this.calculateOverallProgress();
  this.lastUpdated = new Date();
};

resultSchema.methods.updateExerciseProgress = function(completed, total) {
  this.progress.exercises.completed = Math.max(0, completed);
  this.progress.exercises.total = total;
  this.progress.exercises.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  this.calculateOverallProgress();
  this.lastUpdated = new Date();
};

resultSchema.methods.addExamResult = function(examData) {
  this.examResults.push(examData);
  this.lastUpdated = new Date();
  
  // Update completion status if exam score >= 8 (out of 10)
  if (examData.score >= 8) {
    this.completedAt = new Date();
    this.status = 'completed';
    this.progress.overall.percentage = 100;
  }
};

export default mongoose.model('Result', resultSchema);
