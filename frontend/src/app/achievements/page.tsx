'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProgressData {
  vocabulary: {
    studied: number;
    known: number;
    total: number;
    percentage: number;
  };
  grammar: {
    studied: number;
    total: number;
    percentage: number;
  };
  exercises: {
    completed: number;
    total: number;
    percentage: number;
  };
  overall: {
    percentage: number;
  };
}

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  duration: number;
  isPublished: boolean;
  vocabularies: any[];
  grammars: any[];
  exercises: any[];
  totalLessons: number;
  isCompleted?: boolean;
  examScore?: number;
  completedAt?: string;
  progress?: ProgressData;
  status?: 'not_started' | 'in_progress' | 'completed' | 'exam_ready';
}

const AchievementsPage = () => {
  const { isLoggedIn, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    progressPercentage: 0,
    testsCompleted: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCoursesAndProgress();
    }
  }, [isLoggedIn, user]);

  const fetchCoursesAndProgress = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/courses?isPublished=true');
      const data = await response.json();
      
      if (data.success && user) {
        const coursesWithProgress = await Promise.all(
          (data.courses || []).map(async (course: Course) => {
            try {
              const userId = user.id;
              const progressResponse = await fetch(`http://localhost:5001/api/results/progress/${userId}/${course._id}`);
              const progressData = await progressResponse.json();
              
              if (progressData.success && progressData.result) {
                const result = progressData.result;
                const latestExam = result.examResults && result.examResults.length > 0 
                  ? result.examResults[result.examResults.length - 1] 
                  : null;
                
                const correctAnswers = latestExam ? (latestExam.correctAnswers || latestExam.score) : 0;
                const isCompleted = result.status === 'completed' || 
                                  (latestExam && correctAnswers >= 8);
                
                return {
                  ...course,
                  isCompleted: isCompleted,
                  examScore: latestExam ? latestExam.correctAnswers || latestExam.score : undefined,
                  completedAt: result.completedAt,
                  progress: result.progress,
                  status: result.status
                };
              } else {
                return {
                  ...course,
                  isCompleted: false,
                  progress: {
                    vocabulary: { studied: 0, known: 0, total: course.vocabularies?.length || 0, percentage: 0 },
                    grammar: { studied: 0, total: course.grammars?.length || 0, percentage: 0 },
                    exercises: { completed: 0, total: course.exercises?.length || 0, percentage: 0 },
                    overall: { percentage: 0 }
                  },
                  status: 'not_started'
                };
              }
            } catch (error) {
              console.error(`Error fetching progress for course ${course._id}:`, error);
              return {
                ...course,
                isCompleted: false,
                progress: {
                  vocabulary: { studied: 0, known: 0, total: course.vocabularies?.length || 0, percentage: 0 },
                  grammar: { studied: 0, total: course.grammars?.length || 0, percentage: 0 },
                  exercises: { completed: 0, total: course.exercises?.length || 0, percentage: 0 },
                  overall: { percentage: 0 }
                },
                status: 'not_started'
              };
            }
          })
        );
        
        setCourses(coursesWithProgress);
        calculateOverallStats(coursesWithProgress);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallStats = (coursesData: Course[]) => {
    const totalCourses = coursesData.length;
    const completedCourses = coursesData.filter(c => c.isCompleted).length;
    const inProgressCourses = coursesData.filter(c => c.status === 'in_progress').length;
    
    // Tính tổng tiến độ
    const totalProgress = coursesData.reduce((sum, course) => {
      return sum + (course.progress?.overall?.percentage || 0);
    }, 0);
    const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    
    // Đếm số bài kiểm tra đã hoàn thành
    const testsCompleted = coursesData.filter(c => c.examScore && c.examScore > 0).length;
    
    // Tính điểm trung bình
    const scoresSum = coursesData.reduce((sum, course) => {
      return sum + (course.examScore || 0);
    }, 0);
    const avgScore = testsCompleted > 0 ? Math.round(scoresSum / testsCompleted) : 0;
    
    setOverallStats({
      totalCourses,
      progressPercentage: avgProgress,
      testsCompleted,
      totalPoints: avgScore
    });
  };

  const getStatusBadge = (status: string) => {
    const statusText = {
      completed: 'Hoàn thành',
      in_progress: 'Đang học',
      not_started: 'Chưa bắt đầu',
      exam_ready: 'Sẵn sàng thi'
    };

    const colorClasses = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      not_started: 'bg-red-100 text-red-800',
      exam_ready: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[status as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thành tích của bạn...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi user chưa đăng nhập
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thành tích học tập của mình.</p>
          <a
            href="/login"
            className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5zM8 16v-4h4v4H8z" clipRule="evenodd" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-bold">Thành tích cá nhân</h1>
          </div>
          <p className="text-xl text-gray-200 mb-8">
            Theo dõi tiến độ học tập và kết quả của bạn
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-lg font-semibold">🎯 Hành trình học tập của bạn đang tiến triển tốt!</p>
          </div>
        </div>
      </section>

      {/* Overall Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tổng quan <span className="text-violet-600">thành tích</span>
            </h2>
            <p className="text-xl text-gray-600">
              Thống kê chi tiết về quá trình học tập của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center border border-blue-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{overallStats.totalCourses}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">Tổng khóa học</div>
              <div className="text-sm text-gray-500">
                {courses.filter(c => c.isCompleted).length} hoàn thành • {courses.filter(c => c.status === 'in_progress').length} đang học
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center border border-green-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{overallStats.progressPercentage}%</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">Tiến độ tổng</div>
              <div className="text-sm text-gray-500">Tất khóa học hoàn thành</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center border border-purple-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{overallStats.testsCompleted}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">Bài kiểm tra</div>
              <div className="text-sm text-gray-500">Đã hoàn thành tốt</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center border border-yellow-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{overallStats.totalPoints}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">Điểm TB</div>
              <div className="text-sm text-gray-500">Tất cả bài kiểm tra</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Chi tiết <span className="text-violet-600">khóa học</span> ({courses.length})
            </h2>
            <p className="text-xl text-gray-600">
              Theo dõi tiến độ từng khóa học một cách chi tiết
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">📚 Danh sách khóa học</h3>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm tổng kết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hoàn thành
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course: Course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {course.name}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(course.status || 'not_started')}
                            <span className="text-xs text-gray-500">
                              {course.level === 'Beginner' ? 'Cơ bản' :
                               course.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(course.progress?.overall?.percentage || 0)}`}
                              style={{ width: `${course.progress?.overall?.percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.progress?.overall?.percentage || 0}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(course.progress?.overall?.percentage || 0) === 100 ? 'Hoàn thành' : 
                         (course.progress?.overall?.percentage || 0) > 0 ? `${course.progress?.overall?.percentage || 0}/100 bài học` : 
                         'Chưa bắt đầu'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          (course.examScore || 0) >= 9 ? 'text-green-600' :
                          (course.examScore || 0) >= 7 ? 'text-yellow-600' :
                          (course.examScore || 0) > 0 ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {course.examScore && course.examScore > 0 ? course.examScore : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.examScore && course.examScore > 0 ? '/10' : 'Chưa có điểm'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {course.status === 'completed' ? (
                          <>
                            <div className="flex items-center text-green-600">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {course.completedAt ? new Date(course.completedAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Hoàn thành</div>
                          </>
                        ) : course.status === 'in_progress' ? (
                          <>
                            <div className="flex items-center text-blue-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Đang học
                            </div>
                            <div className="text-xs text-gray-500">Chưa hoàn thành</div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Chưa bắt đầu
                            </div>
                            <div className="text-xs text-gray-500">Chưa có dữ liệu</div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AchievementsPage;
