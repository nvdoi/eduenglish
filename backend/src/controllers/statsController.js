import User from '../models/User.js';
import Course from '../models/Course.js';
import Result from '../models/Result.js';
import mongoose from 'mongoose';

// Lấy thống kê tổng quan cho admin dashboard
export const getOverviewStats = async (req, res) => {
  try {
    // Tổng số người dùng
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Tổng số người dùng tháng trước
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const usersLastMonth = await User.countDocuments({ 
      role: 'user',
      createdAt: { $lt: lastMonth }
    });
    
    // Tính phần trăm tăng trưởng người dùng
    const userGrowth = usersLastMonth > 0 
      ? Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100) 
      : 100;
    
    // Tổng số khóa học
    const totalCourses = await Course.countDocuments();
    
    // Số khóa học mới trong tháng
    const newCoursesThisMonth = await Course.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    // Tổng số bài tập (exercises) từ tất cả courses
    const coursesWithExercises = await Course.find({}, 'exercises');
    const totalExercises = coursesWithExercises.reduce((sum, course) => 
      sum + (course.exercises?.length || 0), 0
    );
    
    // Tổng số lượt làm bài (từ examResults trong Result)
    const allResults = await Result.find({}, 'examResults');
    const totalExamAttempts = allResults.reduce((sum, result) => 
      sum + (result.examResults?.length || 0), 0
    );
    
    // Tổng số thành tích (users đã hoàn thành ít nhất 1 khóa học)
    const completedCourses = await Result.countDocuments({ 
      status: 'completed' 
    });
    
    // Tổng số lượt đạt thành tích
    const totalAchievements = await Result.countDocuments({
      'progress.overall.percentage': { $gte: 80 }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          growth: userGrowth,
          lastMonth: usersLastMonth
        },
        courses: {
          total: totalCourses,
          newThisMonth: newCoursesThisMonth
        },
        exercises: {
          total: totalExercises,
          attempts: totalExamAttempts
        },
        achievements: {
          total: completedCourses,
          totalUnlocked: totalAchievements
        }
      }
    });
  } catch (error) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê tổng quan',
      error: error.message 
    });
  }
};

// Lấy thống kê chi tiết người học
export const getUserLearningStats = async (req, res) => {
  try {
    const { limit = 10, page = 1, sortBy = 'progress', order = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Lấy tất cả kết quả học tập, giữ nguyên courseId (không populate để tránh mất id khi bản ghi course thiếu)
    const results = await Result.find()
      .populate('userId', 'username email createdAt')
      .sort({ 'progress.overall.percentage': order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Tạo map khóa học từ danh sách courseId có trong results
    const courseIds = [...new Set(results.map(r => r.courseId).filter(Boolean))];
    const courseDocs = await Course.find({ _id: { $in: courseIds } }).select('name title level');
    const courseMap = courseDocs.reduce((acc, c) => {
      acc[c._id.toString()] = c;
      return acc;
    }, {});
    
    const totalResults = await Result.countDocuments();
    
    // Format dữ liệu
    const formattedData = results.map(result => ({
      userId: result.userId?._id,
      username: result.userId?.username || 'Unknown',
      email: result.userId?.email || 'N/A',
      courseId: result.courseId || null,
      courseName: (() => {
        const c = result.courseId ? courseMap[result.courseId.toString()] : null;
        return (c?.name || c?.title || 'Unknown Course');
      })(),
      courseLevel: (() => {
        const c = result.courseId ? courseMap[result.courseId.toString()] : null;
        return c?.level || 'Beginner';
      })(),
      progress: {
        overall: result.progress.overall.percentage,
        vocabulary: result.progress.vocabulary.percentage,
        exercises: result.progress.exercises.percentage
      },
      stats: {
        totalStudyTime: result.stats.totalStudyTime || 0,
        streakDays: result.stats.streakDays || 0,
        totalSessions: result.stats.totalSessions || 0,
        lastStudied: result.stats.lastStudied
      },
      examResults: result.examResults.length,
      status: result.status,
      startedAt: result.startedAt,
      completedAt: result.completedAt
    }));
    
    res.json({
      success: true,
      data: formattedData,
      pagination: {
        total: totalResults,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalResults / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting user learning stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê người học',
      error: error.message 
    });
  }
};

// Lấy thống kê chi tiết của một người dùng cụ thể
export const getUserDetailStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID không hợp lệ' 
      });
    }
    
    // Lấy thông tin user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }
    
    // Lấy tất cả kết quả học tập của user
    const results = await Result.find({ userId })
      .populate('courseId', 'name level image');
    
    // Tính toán thống kê tổng hợp
    const totalCourses = results.length;
    const completedCourses = results.filter(r => r.status === 'completed').length;
    const inProgressCourses = results.filter(r => r.status === 'in_progress').length;
    
    const totalStudyTime = results.reduce((sum, r) => 
      sum + (r.stats.totalStudyTime || 0), 0
    );
    
    const totalExamAttempts = results.reduce((sum, r) => 
      sum + (r.examResults?.length || 0), 0
    );
    
    const averageProgress = totalCourses > 0
      ? Math.round(results.reduce((sum, r) => 
          sum + (r.progress.overall.percentage || 0), 0) / totalCourses)
      : 0;
    
    // Lấy streak days cao nhất
    const maxStreak = Math.max(...results.map(r => r.stats.streakDays || 0), 0);
    
    // Format dữ liệu courses
    const coursesData = results.map(result => ({
      courseId: result.courseId?._id,
      courseName: result.courseId?.name,
      courseLevel: result.courseId?.level,
      courseImage: result.courseId?.image,
      progress: result.progress.overall.percentage,
      status: result.status,
      studyTime: result.stats.totalStudyTime || 0,
      examAttempts: result.examResults?.length || 0,
      lastStudied: result.stats.lastStudied,
      startedAt: result.startedAt,
      completedAt: result.completedAt
    }));
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        summary: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalStudyTime,
          totalExamAttempts,
          averageProgress,
          maxStreak
        },
        courses: coursesData
      }
    });
  } catch (error) {
    console.error('Error getting user detail stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê chi tiết người dùng',
      error: error.message 
    });
  }
};

// Lấy thống kê theo khóa học
export const getCourseStats = async (req, res) => {
  try {
    const courses = await Course.find().select('name level');
    
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const results = await Result.find({ courseId: course._id });
        
        const totalLearners = results.length;
        const completedLearners = results.filter(r => r.status === 'completed').length;
        const inProgressLearners = results.filter(r => r.status === 'in_progress').length;
        
        const averageProgress = totalLearners > 0
          ? Math.round(results.reduce((sum, r) => 
              sum + (r.progress.overall.percentage || 0), 0) / totalLearners)
          : 0;
        
        const totalExamAttempts = results.reduce((sum, r) => 
          sum + (r.examResults?.length || 0), 0
        );
        
        return {
          courseId: course._id,
          courseName: course.name,
          courseLevel: course.level,
          totalLearners,
          completedLearners,
          inProgressLearners,
          averageProgress,
          totalExamAttempts,
          completionRate: totalLearners > 0 
            ? Math.round((completedLearners / totalLearners) * 100) 
            : 0
        };
      })
    );
    
    // Sắp xếp theo số người học
    courseStats.sort((a, b) => b.totalLearners - a.totalLearners);
    
    res.json({
      success: true,
      data: courseStats
    });
  } catch (error) {
    console.error('Error getting course stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê khóa học',
      error: error.message 
    });
  }
};

// Lấy hoạt động gần đây
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Người dùng mới đăng ký
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');
    
    // Khóa học mới tạo
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name level createdAt');
    
    // Kết quả hoàn thành gần đây
    const recentCompletions = await Result.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('userId', 'username')
      .populate('courseId', 'name');
    
    const activities = [];
    
    // Format activities
    recentUsers.forEach(user => {
      activities.push({
        type: 'new_user',
        title: 'Người dùng mới đăng ký',
        description: `${user.username} đã tạo tài khoản`,
        timestamp: user.createdAt,
        icon: 'user'
      });
    });
    
    recentCourses.forEach(course => {
      activities.push({
        type: 'new_course',
        title: 'Khóa học mới được tạo',
        description: `"${course.name}" - ${course.level}`,
        timestamp: course.createdAt,
        icon: 'book'
      });
    });
    
    recentCompletions.forEach(result => {
      activities.push({
        type: 'completion',
        title: 'Hoàn thành khóa học',
        description: `${result.userId?.username || 'Unknown'} đã hoàn thành "${result.courseId?.name || 'Unknown'}"`,
        timestamp: result.completedAt,
        icon: 'achievement'
      });
    });
    
    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: activities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy hoạt động gần đây',
      error: error.message 
    });
  }
};

// Lấy thống kê theo thời gian (cho biểu đồ)
export const getTimeSeriesStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);
    
    // Thống kê người dùng mới theo ngày
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: 'user'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Thống kê hoàn thành khóa học theo ngày
    const completionStats = await Result.aggregate([
      {
        $match: {
          completedAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tạo mảng đầy đủ các ngày
    const dateArray = [];
    for (let i = 0; i < daysInt; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysInt - 1 - i));
      dateArray.push(date.toISOString().split('T')[0]);
    }
    
    // Map dữ liệu vào các ngày
    const timeSeriesData = dateArray.map(date => {
      const userStat = userStats.find(s => s._id === date);
      const completionStat = completionStats.find(s => s._id === date);
      
      return {
        date,
        newUsers: userStat ? userStat.count : 0,
        completions: completionStat ? completionStat.count : 0
      };
    });
    
    res.json({
      success: true,
      data: timeSeriesData
    });
  } catch (error) {
    console.error('Error getting time series stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê theo thời gian',
      error: error.message 
    });
  }
};
