import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Vocabulary from '../src/models/Vocabulary.js';
import Grammar from '../src/models/Grammar.js';
import Exercise from '../src/models/Exercise.js';

async function createSampleCourse() {
  try {
    await mongoose.connect('mongodb://localhost:27017/EnglishAI');
    console.log('✅ Connected to MongoDB');

    // Create sample vocabularies
    const vocabularies = await Vocabulary.insertMany([
      {
        word: "hello",
        meaning: "xin chào",
        example: "Hello, how are you?",
        pronunciation: "/həˈloʊ/",
        partOfSpeech: "interjection"
      },
      {
        word: "book",
        meaning: "cuốn sách",
        example: "I am reading a book",
        pronunciation: "/bʊk/",
        partOfSpeech: "noun"
      },
      {
        word: "study",
        meaning: "học tập",
        example: "I study English every day",
        pronunciation: "/ˈstʌdi/",
        partOfSpeech: "verb"
      }
    ]);
    console.log('✅ Created vocabularies:', vocabularies.length);

    // Create sample grammars
    const grammars = await Grammar.insertMany([
      {
        topic: "Present Simple",
        explanation: "Thì hiện tại đơn dùng để diễn tả hành động thường xuyên, sự thật hiển nhiên",
        example: "I go to school every day",
        rules: ["Subject + V(s/es)", "Subject + do/does + not + V"],
        commonMistakes: ["Quên thêm s/es cho ngôi thứ 3 số ít"]
      },
      {
        topic: "Articles (a, an, the)",
        explanation: "Mạo từ được sử dụng trước danh từ",
        example: "I have a book. The book is interesting.",
        rules: ["a/an + danh từ đếm được số ít", "the + danh từ xác định"],
        commonMistakes: ["Dùng a trước nguyên âm"]
      }
    ]);
    console.log('✅ Created grammars:', grammars.length);

    // Create sample exercises
    const exercises = await Exercise.insertMany([
      {
        question: "Choose the correct form: I ___ to school every day.",
        type: "multiple-choice",
        options: ["go", "goes", "going", "went"],
        correctAnswer: "go",
        explanation: "Với chủ ngữ 'I', động từ ở dạng nguyên mẫu",
        difficulty: "easy",
        points: 10
      },
      {
        question: "Fill in the blank: She ___ English very well.",
        type: "fill-in",
        options: ["speak", "speaks", "speaking", "spoke"],
        correctAnswer: "speaks",
        explanation: "Với chủ ngữ 'She' (ngôi thứ 3 số ít), động từ phải thêm s",
        difficulty: "medium",
        points: 15
      }
    ]);
    console.log('✅ Created exercises:', exercises.length);

    // Create sample course
    const course = await Course.create({
      name: "English for Beginners",
      description: "Khóa học tiếng Anh cơ bản cho người mới bắt đầu",
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
      vocabularies: vocabularies.map(v => v._id),
      grammars: grammars.map(g => g._id),
      exercises: exercises.map(e => e._id),
      duration: 20,
      totalLessons: vocabularies.length + grammars.length + exercises.length,
      isPublished: true
    });

    console.log('✅ Created course:', {
      id: course._id,
      name: course.name,
      vocabulariesCount: course.vocabularies.length,
      grammarsCount: course.grammars.length,
      exercisesCount: course.exercises.length
    });

    // Test populate
    const populatedCourse = await Course.findById(course._id)
      .populate('vocabularies')
      .populate('grammars')
      .populate('exercises');

    console.log('✅ Populated course test:', {
      vocabulariesPopulated: populatedCourse.vocabularies?.length || 0,
      grammarsPopulated: populatedCourse.grammars?.length || 0,
      exercisesPopulated: populatedCourse.exercises?.length || 0,
      firstVocab: populatedCourse.vocabularies?.[0]?.word,
      firstGrammar: populatedCourse.grammars?.[0]?.topic
    });

    console.log('🎉 Sample course created successfully!');
    console.log('Course ID:', course._id);

  } catch (error) {
    console.error('❌ Error creating sample course:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createSampleCourse();
