"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { getWorkingApiUrl, API_ENDPOINTS } from "../../../config/api";

interface UserLearningData {
  userId: string;
  username: string;
  email: string;
  courseId: string;
  courseName: string;
  courseLevel: string;
  progress: {
    overall: number;
    vocabulary: number;
    exercises: number;
  };
  stats: {
    totalStudyTime: number;
    streakDays: number;
    totalSessions: number;
    lastStudied: string;
  };
  examResults: number;
  status: string;
  startedAt: string;
  completedAt: string;
}

interface CourseStats {
  courseId: string;
  courseName: string;
  courseLevel: string;
  totalLearners: number;
  completedLearners: number;
  inProgressLearners: number;
  averageProgress: number;
  totalExamAttempts: number;
  completionRate: number;
}

export default function StatisticsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  
  // User stats
  const [userLearningData, setUserLearningData] = useState<UserLearningData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Course stats
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  // Courses map for fallback name lookup
  const [courseMap, setCourseMap] = useState<Record<string, { name: string; title?: string; level?: string }>>({});

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Load all courses once for fallback display mapping
    const loadCoursesMap = async () => {
      try {
        const apiUrl = await getWorkingApiUrl();
        const res = await axios.get(`${apiUrl}${API_ENDPOINTS.COURSES.LIST}`);
        if (Array.isArray(res.data)) {
          const map: Record<string, { name: string; title?: string; level?: string }> = {};
          res.data.forEach((c: any) => {
            if (c && c._id) {
              map[c._id] = { name: c.name, title: c.title, level: c.level };
            }
          });
          setCourseMap(map);
        }
      } catch (e) {
        // ignore silently
      }
    };

    // only fetch map on first mount
    if (Object.keys(courseMap).length === 0) {
      loadCoursesMap();
    }

    if (activeTab === 'users') {
      fetchUserLearningStats();
    } else {
      fetchCourseStats();
    }
  }, [isLoggedIn, user, router, activeTab, currentPage]);

  const fetchUserLearningStats = async () => {
    try {
      setLoading(true);
      const apiUrl = await getWorkingApiUrl();
      const response = await axios.get(
        `${apiUrl}${API_ENDPOINTS.STATS.USERS}?page=${currentPage}&limit=10`
      );
      if (response.data.success) {
        setUserLearningData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching user learning stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      const apiUrl = await getWorkingApiUrl();
      const response = await axios.get(`${apiUrl}${API_ENDPOINTS.STATS.COURSES}`);
      if (response.data.success) {
        setCourseStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching course stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang học' },
      exam_ready: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Sẵn sàng thi' },
      not_started: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Chưa bắt đầu' }
    };
    
    const config = statusConfig[status] || statusConfig.not_started;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig: Record<string, { bg: string; text: string }> = {
      Beginner: { bg: 'bg-green-100', text: 'text-green-700' },
      Intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      Advanced: { bg: 'bg-red-100', text: 'text-red-700' }
    };
    
    const config = levelConfig[level] || levelConfig.Beginner;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {level}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống kê chi tiết</h1>
          <p className="text-gray-600">Xem chi tiết thống kê học tập của người dùng và khóa học</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('users');
                setCurrentPage(1);
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Thống kê người học</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('courses');
                setCurrentPage(1);
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Thống kê khóa học</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người học
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khóa học
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian học
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Streak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userLearningData.length > 0 ? (
                        userLearningData.map((data, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{data.username}</div>
                                <div className="text-sm text-gray-500">{data.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{data.courseName || courseMap[data.courseId]?.name || courseMap[data.courseId]?.title || 'Unknown Course'}</div>
                                <div className="mt-1">{getLevelBadge(data.courseLevel)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 mr-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${data.progress.overall}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {data.progress.overall}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatStudyTime(data.stats.totalStudyTime)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {data.stats.totalSessions} phiên học
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-900">
                                  {data.stats.streakDays} ngày
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(data.status)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Chưa có dữ liệu học tập
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang trước
                    </button>
                    <span className="text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseStats.length > 0 ? (
                  courseStats.map((course, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {course.courseName}
                          </h3>
                          {getLevelBadge(course.courseLevel)}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tổng người học</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {course.totalLearners}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Đang học</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {course.inProgressLearners}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hoàn thành</span>
                          <span className="text-sm font-semibold text-green-600">
                            {course.completedLearners}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Tiến độ trung bình</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {course.averageProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.averageProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                            <span className="text-sm font-semibold text-violet-600">
                              {course.completionRate}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lượt làm bài thi</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {course.totalExamAttempts}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    Chưa có dữ liệu khóa học
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
