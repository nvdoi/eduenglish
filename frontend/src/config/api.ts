// Cache API URL để không phải detect lại mỗi lần
let cachedApiUrl: string | null = null;

// Function to reset cache and force re-detection
export function resetApiCache(): void {
  cachedApiUrl = null;
  console.log('🔄 API cache reset, will re-detect backend port');
}

// Helper function to find working API port
export async function getWorkingApiUrl(): Promise<string> {
  // Nếu đã cache, return luôn
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  const API_FALLBACK_PORTS = [5001, 5000];
  for (const port of API_FALLBACK_PORTS) {
    try {
      const url = `http://localhost:${port}`;
      // Thử gọi API để kiểm tra xem backend có hoạt động không
      const response = await fetch(`${url}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(1000) // Timeout 1s
      });
      if (response.ok) {
        console.log(`✅ Backend found on port ${port}`);
        cachedApiUrl = url; // Cache lại
        return url;
      }
    } catch (err) {
      // Nếu lỗi, thử port tiếp theo
      continue;
    }
  }
  
  // Default to 5001 if all fail
  console.warn(' Could not detect backend port, using default 5001');
  cachedApiUrl = 'http://localhost:5001';
  return cachedApiUrl;
}

// API Configuration
// Ưu tiên dùng biến môi trường:
// - NEXT_PUBLIC_API_URL (shared / project env)
// - NEXT_PUBLIC_API_BASE_URL (tên bạn đang dùng trên Vercel)
// Nếu không có, fallback về localhost cho development.
export const API_BASE_URL = getWorkingApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  COURSES: {
    LIST: '/api/courses',
    CREATE: '/api/courses',
    GET: (id: string) => `/api/courses/${id}`,
    UPDATE: (id: string) => `/api/courses/${id}`,
    DELETE: (id: string) => `/api/courses/${id}`,
  },
  GRAMMAR: {
    CHECK: '/api/grammar/check',
  },
  RESULTS: {
    PROGRESS: (userId: string, courseId: string) => `/api/results/progress/${userId}/${courseId}`,
    UPDATE_VOCABULARY: (userId: string, courseId: string) => `/api/results/progress/${userId}/${courseId}/vocabulary`,
    UPDATE_EXERCISES: (userId: string, courseId: string) => `/api/results/progress/${userId}/${courseId}/exercises`,
    SUBMIT_EXAM: (userId: string, courseId: string) => `/api/results/exam/${userId}/${courseId}`,
    EXAM_QUESTIONS: (courseId: string) => `/api/results/exam/${courseId}/questions`,
    CHECK_EXAM: (courseId: string) => `/api/results/exam/${courseId}/check`,
  },
  STATS: {
    OVERVIEW: '/api/stats/overview',
    USERS: '/api/stats/users',
    USER_DETAIL: (userId: string) => `/api/stats/users/${userId}`,
    COURSES: '/api/stats/courses',
    ACTIVITIES: '/api/stats/activities',
    TIMESERIES: '/api/stats/timeseries',
  },
};
