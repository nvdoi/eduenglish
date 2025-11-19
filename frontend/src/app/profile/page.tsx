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

const ProfilePage = () => {
  const { isLoggedIn, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    progressPercentage: 0,
    testsCompleted: 0,
    averageScore: 0,
    totalStudyTime: 0,
    streak: 0
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchUserData();
    }
  }, [isLoggedIn, user]);

  const fetchUserData = async () => {
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
        calculateStats(coursesWithProgress);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (coursesData: Course[]) => {
    const totalCourses = coursesData.length;
    const completedCourses = coursesData.filter(c => c.isCompleted).length;
    const inProgressCourses = coursesData.filter(c => c.status === 'in_progress').length;
    
    const totalProgress = coursesData.reduce((sum, course) => {
      return sum + (course.progress?.overall?.percentage || 0);
    }, 0);
    const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    
    const testsCompleted = coursesData.filter(c => c.examScore && c.examScore > 0).length;
    
    const scoresSum = coursesData.reduce((sum, course) => {
      return sum + (course.examScore || 0);
    }, 0);
    const avgScore = testsCompleted > 0 ? Math.round(scoresSum / testsCompleted) : 0;
    
    setOverallStats({
      totalCourses,
      completedCourses,
      inProgressCourses,
      progressPercentage: avgProgress,
      testsCompleted,
      averageScore: avgScore,
      totalStudyTime: completedCourses * 30, // Giả định mỗi khóa học 30 giờ
      streak: completedCourses > 0 ? Math.min(completedCourses * 7, 30) : 0 // Giả định streak
    });
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin cá nhân...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem trang cá nhân.</p>
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
      {/* Header Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{user.username}</h1>
              <p className="text-xl text-gray-200 mb-4">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">Vai trò: </span>
                  <span className="text-sm">
                    {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">Tham gia: </span>
                  <span className="text-sm">{formatJoinDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thống kê <span className="text-violet-600">học tập</span>
            </h2>
            <p className="text-lg text-gray-600">
              Tổng quan về quá trình học tập của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Courses */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 text-center border border-blue-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{overallStats.totalCourses}</div>
              <div className="text-lg font-semibold text-gray-700">Tổng khóa học</div>
            </div>

            {/* Completed Courses */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 text-center border border-green-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{overallStats.completedCourses}</div>
              <div className="text-lg font-semibold text-gray-700">Đã hoàn thành</div>
            </div>

            {/* Average Score */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 text-center border border-yellow-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{overallStats.averageScore}</div>
              <div className="text-lg font-semibold text-gray-700">Điểm TB</div>
            </div>

            {/* Study Streak */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg p-6 text-center border border-purple-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{overallStats.streak}</div>
              <div className="text-lg font-semibold text-gray-700">Chuỗi ngày</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khóa học <span className="text-violet-600">của tôi</span>
            </h2>
            <p className="text-lg text-gray-600">
              Danh sách các khóa học bạn đã tham gia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                        <span className="text-sm font-bold text-gray-900">
                          {course.progress?.overall?.percentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (course.progress?.overall?.percentage || 0) === 100 ? 'bg-green-500' :
                            (course.progress?.overall?.percentage || 0) >= 50 ? 'bg-yellow-500' :
                            (course.progress?.overall?.percentage || 0) > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${course.progress?.overall?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Status and Score */}
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'completed' ? 'bg-green-100 text-green-800' :
                        course.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status === 'completed' ? 'Hoàn thành' :
                         course.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
                      </span>
                      
                      {course.examScore && course.examScore > 0 && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            course.examScore >= 9 ? 'text-green-600' :
                            course.examScore >= 7 ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {course.examScore}/10
                          </div>
                          <div className="text-xs text-gray-500">Điểm thi</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {courses.length > 6 && (
            <div className="text-center mt-8">
              <a
                href="/achievements"
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Xem tất cả khóa học
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
