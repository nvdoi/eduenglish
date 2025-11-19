"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

// Helper function to create default progress data
const createDefaultProgress = (course: Course): ProgressData => {
  return {
    vocabulary: {
      studied: 0,
      known: 0,
      total: course.vocabularies?.length || 0,
      percentage: 0
    },
    grammar: {
      studied: 0,
      total: course.grammars?.length || 0,
      percentage: 0
    },
    exercises: {
      completed: 0,
      total: course.exercises?.length || 0,
      percentage: 0
    },
    overall: {
      percentage: 0
    }
  };
};

// Helper function to get userId from various storage locations
const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('userId') || 
         localStorage.getItem('user_id') || 
         localStorage.getItem('currentUserId') ||
         sessionStorage.getItem('userId') ||
         sessionStorage.getItem('user_id') ||
         sessionStorage.getItem('currentUserId') ||
         null;
};

export default function CoursesPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, [isLoggedIn, user]); // Refetch when auth state changes


  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/courses?isPublished=true');
      const data = await response.json();
      
      if (data.success) {
        const coursesWithProgress = await Promise.all(
          (data.courses || []).map(async (course: Course) => {
            try {
              // Only fetch progress if user is logged in
              if (isLoggedIn && user) {
                const userId = user.id;
                const progressResponse = await fetch(`http://localhost:5001/api/results/progress/${userId}/${course._id}`);
                const progressData = await progressResponse.json();
                
                if (progressData.success && progressData.result) {
                  const result = progressData.result;
                  const latestExam = result.examResults && result.examResults.length > 0 
                    ? result.examResults[result.examResults.length - 1] 
                    : null;
                  
                  // Check completion based on correctAnswers (số câu đúng) >= 8
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
                  // Tạo default progress data cho người dùng mới
                  return {
                    ...course,
                    isCompleted: false,
                    progress: createDefaultProgress(course),
                    status: 'not_started'
                  };
                }
              }
              
              // Tạo default progress cho người dùng chưa đăng nhập
              return {
                ...course,
                isCompleted: false,
                progress: createDefaultProgress(course),
                status: 'not_started'
              };
            } catch (error) {
              console.error(`Error fetching progress for course ${course._id}:`, error);
              
              // Tạo default progress cho trường hợp lỗi
              return {
                ...course,
                isCompleted: false,
                progress: createDefaultProgress(course),
                status: 'not_started'
              };
            }
          })
        );
        
        setCourses(coursesWithProgress);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = filterLevel === "all" 
    ? courses 
    : courses.filter(c => c.level.toLowerCase() === filterLevel.toLowerCase());


  const faqs = [
    {
      question: "Tất cả các khóa học đều miễn phí?",
      answer: "Có, tất cả các khóa học trên English AI đều hoàn toàn miễn phí. Bạn chỉ cần đăng ký tài khoản để bắt đầu học."
    },
    {
      question: "Tôi có cần kinh nghiệm trước khi học không?",
      answer: "Không cần! Chúng tôi có khóa học từ cơ bản (A1) đến nâng cao (C2), phù hợp với mọi trình độ."
    },
    {
      question: "Làm sao để biết khóa học nào phù hợp với tôi?",
      answer: "Bạn có thể làm bài test trình độ miễn phí trên trang này để xác định khóa học phù hợp nhất."
    },
    {
      question: "Có hỗ trợ tiếng Việt không?",
      answer: "Có, toàn bộ giao diện và nội dung đều được hỗ trợ tiếng Việt, cùng với AI assistant tiếng Việt."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Học tiếng Anh <span className="text-yellow-300">miễn phí</span> với AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Từ cơ bản đến nâng cao, tất cả đều hoàn toàn miễn phí với sự hỗ trợ của AI
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block mb-8">
            <p className="text-lg font-semibold">🎯 100% miễn phí - Không phí ẩn - Học mọi lúc mọi nơi!</p>
          </div>
          
          {/* Level Test Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">📝 Test trình độ tiếng Anh</h3>
            <p className="text-gray-200 text-center mb-6">
              Làm bài test nhanh 5 phút để xác định trình độ hiện tại và chọn khóa học phù hợp
            </p>
            <div className="text-center">
              <button 
                onClick={() => window.location.href = '/test'}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl"
              >
                🚀 Bắt đầu test ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Database Courses Section */}
      {courses.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Khóa học <span className="text-violet-600">đang có</span>
              </h2>
              <p className="text-xl text-gray-600">
                Các khóa học được thiết kế bởi giáo viên chuyên nghiệp
              </p>
              
              
              {/* Filter */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setFilterLevel("all")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    filterLevel === "all"
                      ? "bg-violet-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterLevel("beginner")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    filterLevel === "beginner"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cơ bản
                </button>
                <button
                  onClick={() => setFilterLevel("intermediate")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    filterLevel === "intermediate"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Trung cấp
                </button>
                <button
                  onClick={() => setFilterLevel("advanced")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    filterLevel === "advanced"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Nâng cao
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải khóa học...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 ${
                      course.isCompleted ? 'border-green-400' : 'border-gray-100'
                    } relative`}
                  >
                    
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {course.level === 'Beginner' ? 'Cơ bản' :
                           course.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                        </span>
                        <span className="text-sm text-gray-500">⏱️ {course.duration}h</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                        {course.isCompleted && (
                          <div className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <span>📚 {course.vocabularies?.length || 0} từ vựng</span>
                        <span>📖 {course.grammars?.length || 0} ngữ pháp</span>
                        <span>📝 {course.exercises?.length || 0} bài tập</span>
                      </div>
                      
                      {/* Progress Display for All Incomplete Courses */}
                      {!course.isCompleted && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg min-h-[100px]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">📊 Tiến độ học tập</span>
                            <span className="text-lg font-bold text-blue-600">
                              {course.progress?.overall?.percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${course.progress?.overall?.percentage || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-blue-600">
                            <span>Từ vựng: {course.progress?.vocabulary?.percentage || 0}%</span>
                            <span>Bài tập: {course.progress?.exercises?.percentage || 0}%</span>
                          </div>
                          <div className="flex justify-center mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              course.status === 'exam_ready' ? 'bg-orange-100 text-orange-800' :
                              course.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {course.status === 'exam_ready' ? '🎯 Sẵn sàng thi' :
                               course.status === 'in_progress' ? '📚 Đang học' :
                               '🚀 Bắt đầu học'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Exam Score Display for Completed Courses */}
                      {course.isCompleted && course.examScore && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg min-h-[100px] flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">🎯 Điểm kiểm tra</span>
                            <span className="text-lg font-bold text-green-600">{course.examScore}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(course.examScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-center">
                            {course.completedAt && (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Hoàn thành: {new Date(course.completedAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className={`w-full py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 ${
                          course.isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                            : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                        }`}
                      >
                        {course.isCompleted ? 'Đã hoàn thành' : 'Xem chi tiết'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}


      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Câu hỏi thường gặp
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Bắt đầu hành trình học tiếng Anh ngay hôm nay!
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Tham gia cùng hàng nghìn học viên đã thành công với English AI
          </p>
          <button 
            onClick={() => window.location.href = '/register'}
            className="bg-white text-violet-600 px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl"
          >
            🚀 Dùng thử miễn phí 7 ngày
          </button>
        </div>
      </section>


    </div>
  );
}
