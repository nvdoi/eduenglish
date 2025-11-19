import Course from '../models/Course.js';
import Vocabulary from '../models/Vocabulary.js';
import Grammar from '../models/Grammar.js';
import Exercise from '../models/Exercise.js';
// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin only
export const createCourse = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      level, 
      image, 
      vocabularies, 
      grammars, 
      exercises, 
      duration, 
      totalLessons, 
      isPublished 
    } = req.body;

    // Validate required fields
    if (!name || !level) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên khóa học và cấp độ'
      });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Khóa học với tên này đã tồn tại'
      });
    }

    // Create vocabularies if provided
    let vocabularyIds = [];
    if (vocabularies && Array.isArray(vocabularies) && vocabularies.length > 0) {
      try {
        // Filter valid vocabularies
        const validVocabs = vocabularies.filter(v => v.word && v.meaning);
        if (validVocabs.length > 0) {
          const createdVocabularies = await Vocabulary.insertMany(validVocabs);
          vocabularyIds = createdVocabularies.map(v => v._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi tạo từ vựng: ' + error.message);
      }
    }

    // Create grammars if provided
    let grammarIds = [];
    if (grammars && Array.isArray(grammars) && grammars.length > 0) {
      try {
        // Filter valid grammars
        const validGrammars = grammars.filter(g => g.topic && g.explanation);
        if (validGrammars.length > 0) {
          const createdGrammars = await Grammar.insertMany(validGrammars);
          grammarIds = createdGrammars.map(g => g._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi tạo ngữ pháp: ' + error.message);
      }
    }

    // Create exercises if provided
    let exerciseIds = [];
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      try {
        // Filter valid exercises
        const validExercises = exercises.filter(e => e.question && e.correctAnswer);
        if (validExercises.length > 0) {
          const createdExercises = await Exercise.insertMany(validExercises);
          exerciseIds = createdExercises.map(e => e._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi tạo bài tập: ' + error.message);
      }
    }

    // Create course with references - exclude arrays from req.body
    const { vocabularies: _, grammars: __, exercises: ___, ...otherFields } = req.body;
    
    const courseData = {
      name,
      description: description || '',
      level,
      image: image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
      vocabularies: vocabularyIds,
      grammars: grammarIds,
      exercises: exerciseIds,
      duration: duration || 0,
      totalLessons: totalLessons || (vocabularyIds.length + grammarIds.length + exerciseIds.length),
      isPublished: isPublished || false,
      createdBy: req.user?._id
    };

    const course = await Course.create(courseData);

    // Populate the course with related data
    const populatedCourse = await Course.findById(course._id)
      .populate('vocabularies')
      .populate('grammars')
      .populate('exercises')
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Thêm khóa học thành công',
      course: populatedCourse
    });

  } catch (error) {
    console.error('Error creating course:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khóa học: ' + error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getAllCourses = async (req, res) => {
  try {
    const { level, isPublished } = req.query;
    
    // Use direct MongoDB query for consistency
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('EnglishAI');
    
    // Build filter
    const filter = {};
    if (level) filter.level = level;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const courses = await db.collection('courses').find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Add basic info for each course
    const coursesWithInfo = courses.map(course => ({
      ...course,
      title: course.title || course.name || 'English Course',
      vocabularyCount: course.vocabularies?.length || 0,
      grammarCount: course.grammars?.length || 0,
      exerciseCount: course.exercises?.length || 0
    }));

    await client.close();

    res.status(200).json({
      success: true,
      count: coursesWithInfo.length,
      courses: coursesWithInfo
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách khóa học'
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    
    // Use direct MongoDB query with manual population (same as fresh endpoint)
    const { MongoClient, ObjectId } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('EnglishAI');
    
    // Get course
    const course = await db.collection('courses').findOne({_id: new ObjectId(req.params.id)});
    if (!course) {
      await client.close();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Check if vocabularies are embedded or references
    if (course.vocabularies && course.vocabularies.length > 0) {
      
      // If vocabularies are ObjectIds (references), populate them
      if (typeof course.vocabularies[0] === 'object' && course.vocabularies[0]._id) {
        const vocabularies = await db.collection('vocabularies').find({
          _id: { $in: course.vocabularies }
        }).toArray();
        course.vocabularies = vocabularies;
      } else {
        // Vocabularies are already embedded, no need to populate
      }
    }

    // Manually populate grammars
    if (course.grammars && course.grammars.length > 0) {
      const grammars = await db.collection('grammars').find({
        _id: { $in: course.grammars }
      }).toArray();
      course.grammars = grammars;
    }

    // Check if exercises are embedded or references
    if (course.exercises && course.exercises.length > 0) {
      
      // If exercises are ObjectIds (references), populate them
      if (typeof course.exercises[0] === 'object' && course.exercises[0]._id) {
        const exercises = await db.collection('exercises').find({
          _id: { $in: course.exercises }
        }).toArray();
        course.exercises = exercises;
      } else {
        // Exercises are already embedded, no need to populate
      }
    }

    await client.close();

    // Debug log
    if (course.exercises?.length > 0) {
    }

    // Ensure title field exists
    if (!course.title) {
      course.title = course.name || 'English Course';
    }

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin khóa học'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin only
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Delete old related documents
    try {
      await Vocabulary.deleteMany({ _id: { $in: course.vocabularies } });
      await Grammar.deleteMany({ _id: { $in: course.grammars } });
      await Exercise.deleteMany({ _id: { $in: course.exercises } });
    } catch (error) {
      // Continue even if deletion fails
    }

    // Create new vocabularies
    let vocabularyIds = [];
    if (req.body.vocabularies && Array.isArray(req.body.vocabularies) && req.body.vocabularies.length > 0) {
      try {
        const validVocabs = req.body.vocabularies.filter(v => v.word && v.meaning);
        if (validVocabs.length > 0) {
          const createdVocabularies = await Vocabulary.insertMany(validVocabs);
          vocabularyIds = createdVocabularies.map(v => v._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi cập nhật từ vựng: ' + error.message);
      }
    }

    // Create new grammars
    let grammarIds = [];
    if (req.body.grammars && Array.isArray(req.body.grammars) && req.body.grammars.length > 0) {
      try {
        const validGrammars = req.body.grammars.filter(g => g.topic && g.explanation);
        if (validGrammars.length > 0) {
          const createdGrammars = await Grammar.insertMany(validGrammars);
          grammarIds = createdGrammars.map(g => g._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi cập nhật ngữ pháp: ' + error.message);
      }
    }

    // Create new exercises
    let exerciseIds = [];
    if (req.body.exercises && Array.isArray(req.body.exercises) && req.body.exercises.length > 0) {
      try {
        const validExercises = req.body.exercises.filter(e => e.question && e.correctAnswer);
        if (validExercises.length > 0) {
          const createdExercises = await Exercise.insertMany(validExercises);
          exerciseIds = createdExercises.map(e => e._id);
        }
      } catch (error) {
        throw new Error('Lỗi khi cập nhật bài tập: ' + error.message);
      }
    }

    // Update course with new references - exclude the arrays from req.body
    const { vocabularies: _, grammars: __, exercises: ___, ...otherFields } = req.body;
    
    const updateData = {
      ...otherFields,
      vocabularies: vocabularyIds,
      grammars: grammarIds,
      exercises: exerciseIds
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('vocabularies')
      .populate('grammars')
      .populate('exercises')
      .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Cập nhật khóa học thành công! Tất cả nội dung đã được lưu.',
      course: updatedCourse
    });

  } catch (error) {
    console.error('💥 Error updating course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật khóa học'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin only
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Since vocabularies, grammars, and exercises are now embedded (Mixed type),
    // we don't need to delete them separately - they'll be deleted with the course
    
    // Delete course (this will also delete embedded vocabularies, grammars, exercises)
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa khóa học thành công'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa khóa học'
    });
  }
};

// Raw endpoint to get course data without any processing
export const getCourseByIdRaw = async (req, res) => {
  try {
    
    const { MongoClient, ObjectId } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('EnglishAI');
    
    const course = await db.collection('courses').findOne({_id: new ObjectId(req.params.id)});
    await client.close();
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }


    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error fetching raw course:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Debug endpoint to get fresh course data with manual population
export const getCourseByIdFresh = async (req, res) => {
  try {
    
    // Direct MongoDB query with manual population
    const { MongoClient, ObjectId } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('EnglishAI');
    
    // Get course
    const course = await db.collection('courses').findOne({_id: new ObjectId(req.params.id)});
    if (!course) {
      await client.close();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Manually populate vocabularies
    if (course.vocabularies && course.vocabularies.length > 0) {
      const vocabularies = await db.collection('vocabularies').find({
        _id: { $in: course.vocabularies }
      }).toArray();
      course.vocabularies = vocabularies;
    }

    // Manually populate grammars
    if (course.grammars && course.grammars.length > 0) {
      const grammars = await db.collection('grammars').find({
        _id: { $in: course.grammars }
      }).toArray();
      course.grammars = grammars;
    }

    // Manually populate exercises
    if (course.exercises && course.exercises.length > 0) {
      const exercises = await db.collection('exercises').find({
        _id: { $in: course.exercises }
      }).toArray();
      course.exercises = exercises;
    }

    await client.close();

    if (course.exercises?.length > 0) {
    }

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error fetching fresh course:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin khóa học'
    });
  }
};
