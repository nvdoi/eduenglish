import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

const coursesData = [
  {
    name: "English for Absolute Beginners",
    description: "Khóa học dành cho người mới bắt đầu học tiếng Anh từ con số 0. Học bảng chữ cái, phát âm cơ bản và các từ vựng đơn giản nhất.",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    duration: 20,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Basic English Conversation",
    description: "Học cách giao tiếp tiếng Anh cơ bản trong các tình huống hàng ngày như chào hỏi, giới thiệu bản thân, mua sắm.",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    duration: 25,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "English Grammar Fundamentals",
    description: "Nắm vững nền tảng ngữ pháp tiếng Anh với các thì cơ bản, cấu trúc câu và các quy tắc quan trọng.",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    duration: 30,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Intermediate English Skills",
    description: "Phát triển kỹ năng tiếng Anh trung cấp với từ vựng phong phú hơn, ngữ pháp nâng cao và luyện tập giao tiếp.",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    duration: 40,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Business English Communication",
    description: "Tiếng Anh thương mại cho môi trường công sở, email, họp hành và đàm phán kinh doanh.",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    duration: 35,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "English for Travel",
    description: "Học tiếng Anh du lịch với các tình huống thực tế tại sân bay, khách sạn, nhà hàng và các điểm tham quan.",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    duration: 28,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Advanced English Mastery",
    description: "Khóa học nâng cao cho người muốn thành thạo tiếng Anh với từ vựng học thuật, idioms và expressions phức tạp.",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800",
    duration: 50,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Academic English Writing",
    description: "Viết luận văn, bài báo khoa học và các văn bản học thuật bằng tiếng Anh chuyên nghiệp.",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
    duration: 45,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "English Literature & Culture",
    description: "Khám phá văn học và văn hóa Anh - Mỹ qua các tác phẩm kinh điển và hiện đại.",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    duration: 42,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  },
  {
    name: "Professional English Presentation",
    description: "Kỹ năng thuyết trình tiếng Anh chuyên nghiệp cho hội nghị, seminar và các buổi báo cáo quan trọng.",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    duration: 38,
    isPublished: true,
    vocabularies: [],
    grammars: [],
    exercises: []
  }
];

const seedCourses = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "EnglishAI"
    });
    console.log('Connected to MongoDB');

    // Get existing course names to avoid duplicates
    const existingCourses = await Course.find({}, 'name');
    const existingNames = new Set(existingCourses.map(c => c.name));
    
    console.log(`Found ${existingCourses.length} existing courses`);
    console.log('Existing courses:', Array.from(existingNames));

    // Filter out courses that already exist
    const newCourses = coursesData.filter(course => !existingNames.has(course.name));
    
    if (newCourses.length === 0) {
      console.log(' All courses already exist. No new courses to add.');
      process.exit(0);
    }

    console.log(`\nAdding ${newCourses.length} new courses...`);
    
    // Insert new courses
    const insertedCourses = await Course.insertMany(newCourses);
    
    console.log(`\nSuccessfully added ${insertedCourses.length} new courses!`);
    console.log('\nNew courses added:');
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} (${course.level}) - ${course.duration}h`);
    });

    // Show summary
    const totalCourses = await Course.countDocuments();
    const beginnerCount = await Course.countDocuments({ level: 'Beginner' });
    const intermediateCount = await Course.countDocuments({ level: 'Intermediate' });
    const advancedCount = await Course.countDocuments({ level: 'Advanced' });

    console.log('\nSummary:');
    console.log(`Total courses: ${totalCourses}`);
    console.log(`- Beginner: ${beginnerCount}`);
    console.log(`- Intermediate: ${intermediateCount}`);
    console.log(`- Advanced: ${advancedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCourses();
